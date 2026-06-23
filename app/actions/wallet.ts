"use server";

import * as StellarSdk from "@stellar/stellar-sdk";
import { createClient } from "@supabase/supabase-js";

// For simplicity, we are using the public testnet horizon server
const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Testnet USDC Issuer
const USDC_ISSUER = process.env.NEXT_PUBLIC_ORBIT_USDC_ISSUER || "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

// Encryption secret for wallet private keys (In production, use a robust key management service)
const WALLET_ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || "orbit-dev-super-secret-key-12345";

// Basic XOR encryption for the prototype (DO NOT USE IN PRODUCTION)
// We use a simple obfuscation to store the secret key in the database for this demo.
function simpleEncrypt(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ WALLET_ENCRYPTION_KEY.charCodeAt(i % WALLET_ENCRYPTION_KEY.length));
  }
  return Buffer.from(result).toString('base64');
}

export async function setupUserWallet(userId: string) {
  try {
    console.log(`[Stellar] Generating new wallet for user: ${userId}`);
    
    // 1. Generate new Keypair
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    console.log(`[Stellar] New pubkey: ${publicKey}. Requesting Friendbot funding...`);

    // 2. Fund the account using Friendbot to activate it
    const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
    const response = await fetch(friendbotUrl);
    if (!response.ok) {
      throw new Error(`Friendbot funding failed: ${await response.text()}`);
    }

    console.log(`[Stellar] Account funded. Establishing USDC trustline...`);

    // 3. Establish Trustline to USDC
    const account = await server.loadAccount(publicKey);
    const asset = new StellarSdk.Asset("USDC", USDC_ISSUER);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset,
          limit: "1000000", // Allow holding up to 1M USDC
        })
      )
      .setTimeout(180)
      .build();

    transaction.sign(keypair);
    await server.submitTransaction(transaction);

    console.log(`[Stellar] USDC trustline established successfully.`);

    // 4. Encrypt secret and store in Supabase
    // We need a service role client to bypass RLS and update the user's secret columns securely.
    const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    const supabase = createClient(supabaseAdminUrl, supabaseServiceKey);

    const encryptedSecret = simpleEncrypt(secretKey);

    const { data, error } = await supabase
      .from("users")
      .update({
        stellar_wallet_pubkey: publicKey,
        stellar_wallet_secret: encryptedSecret,
      })
      .eq("id", userId)
      .select();

    if (error) {
      throw new Error(`Failed to update user profile in Supabase: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("Update matched 0 rows. This means either the user doesn't exist, OR Row Level Security (RLS) blocked the update because SUPABASE_SERVICE_ROLE_KEY is missing or not picked up by the server.");
    }

    console.log(`[Stellar] Wallet setup complete and saved for user ${userId}.`);
    
    return { success: true, publicKey };
  } catch (error: any) {
    console.error("[Stellar] Wallet setup failed:", error);
    return { success: false, error: error.message };
  }
}

export async function addFundsToWallet(userId: string, amount: number) {
  try {
    const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseAdminUrl, supabaseServiceKey);

    // 1. Get current balance and public key
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("wallet_balance, stellar_wallet_pubkey")
      .eq("id", userId)
      .single();

    if (fetchError || !user) throw new Error("Failed to fetch user balance");
    if (!user.stellar_wallet_pubkey) throw new Error("User does not have a Stellar wallet");

    const currentBalance = Number(user.wallet_balance) || 0;
    const newBalance = currentBalance + amount;

    // 2. Perform On-Chain Payment
    const treasurySecret = process.env.ORBIT_TREASURY_SECRET;
    if (!treasurySecret) throw new Error("Treasury secret not configured in .env.local");

    const treasuryKeypair = StellarSdk.Keypair.fromSecret(treasurySecret);
    const treasuryAccount = await server.loadAccount(treasuryKeypair.publicKey());
    
    const asset = new StellarSdk.Asset("USDC", USDC_ISSUER);

    const tx = new StellarSdk.TransactionBuilder(treasuryAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: user.stellar_wallet_pubkey,
          asset: asset,
          amount: amount.toString(),
        })
      )
      .setTimeout(180)
      .build();

    tx.sign(treasuryKeypair);
    
    console.log(`[Stellar] Sending ${amount} USDC to ${user.stellar_wallet_pubkey}...`);
    const txResponse = await server.submitTransaction(tx);
    console.log(`[Stellar] Payment successful! Hash: ${txResponse.hash}`);

    // 3. Update DB balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    if (updateError) throw new Error("Failed to update user balance in DB");

    // 4. Log to Activity Feed
    await supabase.from("activity_feed").insert({
      user_id: userId,
      action_type: "DEPOSIT",
      message: `Topped up wallet with ${amount} USDC`,
      stellar_tx_hash: txResponse.hash,
    });

    // 5. Log to Transactions Ledger
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "WALLET_FUNDING",
      amount: amount,
      currency: "USDC",
      sender_address: treasuryKeypair.publicKey(),
      recipient_address: user.stellar_wallet_pubkey,
      status: "COMPLETED",
      stellar_tx_hash: txResponse.hash,
    });

    return { success: true, newBalance, hash: txResponse.hash };
  } catch (error: any) {
    console.error("[Stellar] Add funds failed:", error);
    return { success: false, error: error.message };
  }
}
