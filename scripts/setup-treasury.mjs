import * as StellarSdk from "@stellar/stellar-sdk";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Generating Orbit Treasury Keypair...");
  const treasuryKeypair = StellarSdk.Keypair.random();
  const publicKey = treasuryKeypair.publicKey();
  const secretKey = treasuryKeypair.secret();

  console.log(`Public Key: ${publicKey}`);
  console.log("Funding Treasury via Friendbot (this may take a few seconds)...");

  try {
    const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
    const response = await fetch(friendbotUrl);
    
    if (!response.ok) {
      throw new Error(`Friendbot failed: ${await response.text()}`);
    }
    console.log("Treasury funded successfully!");

    // Append to .env.local
    const envPath = path.resolve(process.cwd(), ".env.local");
    const envVars = `\n# Orbit Treasury Credentials (Stellar Testnet)
ORBIT_TREASURY_SECRET="${secretKey}"
NEXT_PUBLIC_ORBIT_USDC_ISSUER="${publicKey}"\n`;

    fs.appendFileSync(envPath, envVars);
    console.log("Successfully appended Treasury credentials to .env.local!");
    console.log("Please restart your Next.js development server to load the new variables.");

  } catch (err) {
    console.error("Setup failed:", err);
  }
}

main();
