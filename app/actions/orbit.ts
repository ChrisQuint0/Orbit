"use server";

import { createClient } from "@supabase/supabase-js";

function calculateCycleDueDate(startDateStr: string, cycleNumber: number, frequency: string) {
  const dueDate = new Date(startDateStr);
  if (frequency === "Weekly") {
    dueDate.setDate(dueDate.getDate() + 7 * cycleNumber);
  } else if (frequency === "Bi-Weekly") {
    dueDate.setDate(dueDate.getDate() + 14 * cycleNumber);
  } else if (frequency === "Monthly") {
    dueDate.setMonth(dueDate.getMonth() + cycleNumber);
  }
  return dueDate;
}

// Initialize Supabase admin client for server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function createOrbitAction(data: {
  userId: string;
  name: string;
  depositAmount: number;
  numMembers: number;
  frequency: string; // 'Weekly' | 'Bi-Weekly' | 'Monthly'
  startDate: string;
}) {
  try {
    const { userId, name, depositAmount, numMembers, frequency, startDate } = data;

    if (!userId || !name || !depositAmount || !numMembers || !frequency || !startDate) {
      return { success: false, error: "Missing required fields" };
    }

    // Generate a random 6-character invite code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let inviteCode = '';
    for (let i = 0; i < 6; i++) {
      inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 1. Insert the new orbit
    const { data: newOrbit, error: orbitError } = await supabaseAdmin
      .from("orbits")
      .insert({
        creator_id: userId,
        name: name,
        deposit_amount: depositAmount,
        num_members: numMembers,
        frequency: frequency,
        start_date: startDate,
        status: "FORMING",
        current_cycle: 1,
        invite_code: inviteCode,
      })
      .select("id")
      .single();

    if (orbitError) throw orbitError;

    // 2. Insert creator into orbit_members
    const { error: memberError } = await supabaseAdmin
      .from("orbit_members")
      .insert({
        orbit_id: newOrbit.id,
        user_id: userId,
        role: "CREATOR",
        payout_order: 1, // Creator usually gets the first payout, or we can leave it flexible
      });

    if (memberError) throw memberError;

    // 3. Log to activity_feed
    const { data: profile } = await supabaseAdmin.from("users").select("full_name").eq("id", userId).single();
    const userName = profile?.full_name || 'A member';

    const { error: activityError } = await supabaseAdmin
      .from("activity_feed")
      .insert({
        user_id: userId,
        orbit_id: newOrbit.id,
        action_type: "CREATED",
        message: `${userName} created orbit "${name}"`,
      });

    if (activityError) console.error("Failed to log activity:", activityError);

    return { success: true, orbitId: newOrbit.id };
  } catch (error: any) {
    console.error("Failed to create orbit:", error);
    return { success: false, error: error.message };
  }
}

export async function joinOrbitAction(data: {
  userId: string;
  inviteCode: string;
}) {
  try {
    const { userId, inviteCode } = data;

    if (!userId || !inviteCode) {
      return { success: false, error: "Missing required fields" };
    }

    // 1. Find the Orbit by invite code
    const { data: orbit, error: orbitError } = await supabaseAdmin
      .from("orbits")
      .select("*")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();

    if (orbitError || !orbit) {
      return { success: false, error: "Invalid invite code" };
    }

    if (orbit.status !== "FORMING") {
      return { success: false, error: "This orbit is no longer accepting members." };
    }

    // 2. Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from("orbit_members")
      .select("id")
      .eq("orbit_id", orbit.id)
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      return { success: false, error: "You are already a member of this orbit." };
    }

    // 3. Count current members
    const { count: memberCount, error: countError } = await supabaseAdmin
      .from("orbit_members")
      .select("id", { count: "exact" })
      .eq("orbit_id", orbit.id);

    if (countError) throw countError;
    const currentMembers = memberCount || 0;

    if (currentMembers >= orbit.num_members) {
      return { success: false, error: "This orbit is full." };
    }

    const newPayoutOrder = currentMembers + 1;

    // 4. Insert the new member
    const { error: memberError } = await supabaseAdmin
      .from("orbit_members")
      .insert({
        orbit_id: orbit.id,
        user_id: userId,
        role: "MEMBER",
        payout_order: newPayoutOrder,
      });

    if (memberError) throw memberError;

    // 5. If this member fills the orbit, update status to READY
    if (newPayoutOrder === orbit.num_members) {
      await supabaseAdmin
        .from("orbits")
        .update({ status: "READY" })
        .eq("id", orbit.id);
    }

    // 6. Log to activity feed
    const { data: profile } = await supabaseAdmin.from("users").select("full_name").eq("id", userId).single();
    const userName = profile?.full_name || 'A member';
    
    await supabaseAdmin
      .from("activity_feed")
      .insert({
        user_id: userId,
        orbit_id: orbit.id,
        action_type: "JOINED",
        message: `${userName} joined orbit "${orbit.name}"`,
      });

    return { success: true, orbitId: orbit.id };
  } catch (error: any) {
    console.error("Failed to join orbit:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteOrbitAction(data: {
  userId: string;
  orbitId: string;
}) {
  try {
    const { userId, orbitId } = data;

    if (!userId || !orbitId) {
      return { success: false, error: "Missing required fields" };
    }

    // 1. Verify user is the CREATOR
    const { data: member, error: memberError } = await supabaseAdmin
      .from("orbit_members")
      .select("role")
      .eq("orbit_id", orbitId)
      .eq("user_id", userId)
      .single();

    if (memberError || !member || member.role !== "CREATOR") {
      return { success: false, error: "Only the creator can delete this orbit." };
    }

    // 2. Verify orbit is still FORMING
    const { data: orbit, error: orbitError } = await supabaseAdmin
      .from("orbits")
      .select("status")
      .eq("id", orbitId)
      .single();

    if (orbitError || !orbit) {
      return { success: false, error: "Orbit not found." };
    }

    if (orbit.status !== "FORMING") {
      return { success: false, error: "Cannot delete an orbit that is already active or completed." };
    }

    // 3. Delete the orbit (Cascade will handle orbit_members and activity_feed)
    const { error: deleteError } = await supabaseAdmin
      .from("orbits")
      .delete()
      .eq("id", orbitId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete orbit:", error);
    return { success: false, error: error.message };
  }
}

export async function startOrbitAction(data: {
  userId: string;
  orbitId: string;
}) {
  try {
    const { userId, orbitId } = data;

    // 1. Verify user is the CREATOR
    const { data: member, error: memberError } = await supabaseAdmin
      .from("orbit_members")
      .select("role")
      .eq("orbit_id", orbitId)
      .eq("user_id", userId)
      .single();

    if (memberError || !member || member.role !== "CREATOR") {
      return { success: false, error: "Only the creator can start this orbit." };
    }

    // 2. Fetch orbit and members
    const { data: orbit, error: orbitError } = await supabaseAdmin
      .from("orbits")
      .select("*")
      .eq("id", orbitId)
      .single();

    if (orbitError || !orbit) return { success: false, error: "Orbit not found." };
    if (orbit.status !== "READY") return { success: false, error: "Orbit is not ready to start." };

    const { data: allMembers, error: allMembersError } = await supabaseAdmin
      .from("orbit_members")
      .select("user_id, payout_order")
      .eq("orbit_id", orbitId);

    if (allMembersError || !allMembers) return { success: false, error: "Failed to fetch members." };

    const startDateStr = new Date().toISOString();

    // 3. Update Orbit status
    await supabaseAdmin
      .from("orbits")
      .update({ status: "ACTIVE", current_cycle: 1, start_date: startDateStr })
      .eq("id", orbitId);

    // 4. Create cycle 1 deposits (excluding the recipient)
    const dueDate = calculateCycleDueDate(startDateStr, 1, orbit.frequency);

    const depositsToInsert = allMembers
      .filter(m => m.payout_order !== 1)
      .map(m => ({
        orbit_id: orbitId,
        user_id: m.user_id,
        cycle_number: 1,
        amount: orbit.deposit_amount,
        status: "PENDING",
        due_date: dueDate.toISOString(),
      }));

    if (depositsToInsert.length > 0) {
      await supabaseAdmin.from("deposits").insert(depositsToInsert);
    }

    // 5. Log activity
    const { data: profile } = await supabaseAdmin.from("users").select("full_name").eq("id", userId).single();
    const userName = profile?.full_name || 'A member';
    
    await supabaseAdmin
      .from("activity_feed")
      .insert({
        orbit_id: orbitId,
        user_id: userId,
        action_type: "STARTED",
        message: `${userName} started orbit "${orbit.name}"`,
      });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to start orbit:", error);
    return { success: false, error: error.message };
  }
}

export async function makeDepositAction(data: {
  userId: string;
  orbitId: string;
}) {
  try {
    const { userId, orbitId } = data;

    // 1. Fetch Orbit
    const { data: orbit, error: orbitError } = await supabaseAdmin
      .from("orbits")
      .select("*")
      .eq("id", orbitId)
      .single();

    if (orbitError || !orbit) return { success: false, error: "Orbit not found." };
    if (orbit.status !== "ACTIVE") return { success: false, error: "Orbit is not active." };

    // 2. Find pending deposit for current cycle
    const { data: deposit, error: depositError } = await supabaseAdmin
      .from("deposits")
      .select("*")
      .eq("orbit_id", orbitId)
      .eq("user_id", userId)
      .eq("cycle_number", orbit.current_cycle)
      .eq("status", "PENDING")
      .single();

    if (depositError || !deposit) {
      return { success: false, error: "No pending deposit found for this cycle." };
    }

    // 3. Check user wallet balance
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    if (userError || !user) return { success: false, error: "User not found." };
    
    if (Number(user.wallet_balance) < Number(deposit.amount)) {
      return { success: false, error: "Insufficient wallet balance." };
    }

    // 4. Deduct from wallet
    const newBalance = Number(user.wallet_balance) - Number(deposit.amount);
    await supabaseAdmin
      .from("users")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    // 5. Record Transaction
    await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        orbit_id: orbitId,
        type: "DEPOSIT",
        amount: deposit.amount,
        status: "COMPLETED",
      });

    // 6. Update Deposit record
    await supabaseAdmin
      .from("deposits")
      .update({ status: "PAID", paid_at: new Date().toISOString() })
      .eq("id", deposit.id);

    // 7. Log Activity
    const { data: profile } = await supabaseAdmin.from("users").select("full_name, orbit_score").eq("id", userId).single();
    await supabaseAdmin
      .from("activity_feed")
      .insert({
        orbit_id: orbitId,
        user_id: userId,
        action_type: "DEPOSIT",
        message: `${profile?.full_name || 'A member'} deposited ${deposit.amount} USDC`,
      });

    // 7.5 Update Orbit Score (+10 for on-time deposit)
    if (profile) {
      const oldScore = profile.orbit_score || 0;
      const newScore = oldScore + 10;
      
      await supabaseAdmin.from("users").update({ orbit_score: newScore }).eq("id", userId);
      
      await supabaseAdmin.from("score_history").insert({
        user_id: userId,
        previous_score: oldScore,
        new_score: newScore,
        score_change: 10,
        event_type: "On-Time Contribution",
        related_id: deposit.id
      });
    }

    // 8. Check if pool is ready to release
    const { data: recipientMember } = await supabaseAdmin
      .from("orbit_members")
      .select("user_id")
      .eq("orbit_id", orbit.id)
      .eq("payout_order", orbit.current_cycle)
      .single();

    const recipientId = recipientMember?.user_id;

    const { data: allDeposits } = await supabaseAdmin
      .from("deposits")
      .select("status, user_id")
      .eq("orbit_id", orbitId)
      .eq("cycle_number", orbit.current_cycle);

    const relevantDeposits = (allDeposits || []).filter(d => d.user_id !== recipientId);

    const allPaid = relevantDeposits.length > 0 && relevantDeposits.every(d => d.status === "PAID");
    const correctCount = relevantDeposits.length === orbit.num_members - 1;

    if (allPaid && correctCount) {
      await releaseCyclePool(orbit);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to make deposit:", error);
    return { success: false, error: error.message };
  }
}

async function releaseCyclePool(orbit: any) {
  try {
    // 1. Calculate pool amount (num_members - 1 because recipient doesn't contribute)
    const poolAmount = Number(orbit.deposit_amount) * (Number(orbit.num_members) - 1);

    // 2. Find recipient
    const { data: recipientMember } = await supabaseAdmin
      .from("orbit_members")
      .select("user_id")
      .eq("orbit_id", orbit.id)
      .eq("payout_order", orbit.current_cycle)
      .single();

    if (!recipientMember) return;

    const recipientUserId = recipientMember.user_id;
    
    const { data: recipientUser } = await supabaseAdmin
      .from("users")
      .select("wallet_balance, full_name")
      .eq("id", recipientUserId)
      .single();
      
    if (!recipientUser) return;

    const currentBalance = Number(recipientUser.wallet_balance) || 0;
    const recipientName = recipientUser.full_name;

    // 3. Add funds to recipient
    await supabaseAdmin
      .from("users")
      .update({ wallet_balance: currentBalance + poolAmount })
      .eq("id", recipientUserId);

    // 4. Record Transaction
    await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: recipientUserId,
        orbit_id: orbit.id,
        type: "TRANSFER_RECEIVED",
        amount: poolAmount,
        status: "COMPLETED",
      });

    // 5. Log Activity
    await supabaseAdmin
      .from("activity_feed")
      .insert({
        orbit_id: orbit.id,
        action_type: "RELEASED",
        message: `Cycle ${orbit.current_cycle} Pool (${poolAmount} USDC) released to ${recipientName}`,
      });

    // 6. Next Cycle or Completion
    if (orbit.current_cycle < orbit.num_members) {
      const nextCycle = orbit.current_cycle + 1;
      await supabaseAdmin
        .from("orbits")
        .update({ current_cycle: nextCycle })
        .eq("id", orbit.id);

      // Create deposits for next cycle
      const { data: allMembers } = await supabaseAdmin
        .from("orbit_members")
        .select("user_id, payout_order")
        .eq("orbit_id", orbit.id);

      const dueDate = calculateCycleDueDate(orbit.start_date, nextCycle, orbit.frequency);

      if (allMembers) {
        const depositsToInsert = allMembers
          .filter(m => m.payout_order !== nextCycle)
          .map(m => ({
            orbit_id: orbit.id,
            user_id: m.user_id,
            cycle_number: nextCycle,
            amount: orbit.deposit_amount,
            status: "PENDING",
            due_date: dueDate.toISOString(),
          }));
        
        if (depositsToInsert.length > 0) {
          await supabaseAdmin.from("deposits").insert(depositsToInsert);
        }
      }
    } else {
      // Complete orbit
      await supabaseAdmin
        .from("orbits")
        .update({ status: "COMPLETED" })
        .eq("id", orbit.id);
    }
  } catch (err) {
    console.error("Failed to release cycle pool:", err);
  }
}

export async function celebrateCycleAction(orbitId: string, userId: string, cycleNumber: number) {
  try {
    await supabaseAdmin
      .from("orbit_members")
      .update({ last_celebrated_cycle: cycleNumber })
      .eq("orbit_id", orbitId)
      .eq("user_id", userId);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to celebrate cycle:", error);
    return { success: false, error: error.message };
  }
}

export async function updateReleaseOrderAction(orbitId: string, memberOrders: { userId: string; order: number }[]) {
  try {
    for (const mo of memberOrders) {
      const { error } = await supabaseAdmin
        .from("orbit_members")
        .update({ payout_order: mo.order })
        .eq("orbit_id", orbitId)
        .eq("user_id", mo.userId);
        
      if (error) {
        console.error("Failed to update order for user:", mo.userId, error);
        throw error;
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update release order:", error);
    return { success: false, error: error.message };
  }
}
