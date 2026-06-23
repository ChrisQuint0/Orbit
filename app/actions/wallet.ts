"use server";

import * as StellarSdk from "@stellar/stellar-sdk";
import { createClient } from "@supabase/supabase-js";

// For simplicity, we are using the public testnet horizon server
const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Testnet USDC Issuer
const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

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
