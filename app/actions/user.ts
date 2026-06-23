"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function updateUserAvatarAction(userId: string, avatarUrl: string) {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user avatar:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to update user avatar:", err);
    return { success: false, error: err.message };
  }
}

export async function uploadUserAvatarAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    
    if (!file || !userId) {
      return { success: false, error: "Missing file or user ID" };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    // Upload using admin client (bypasses RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('Orbit DPs')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('Orbit DPs')
      .getPublicUrl(fileName);

    const avatarUrl = publicUrlData.publicUrl;

    // Update user profile
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateError) throw updateError;

    return { success: true, avatarUrl };
  } catch (err: any) {
    console.error("Failed to upload and update avatar:", err);
    return { success: false, error: err.message };
  }
}
