# Orbit

Community saving, reimagined.

## Problem

Traditional community savings circles (historically known as _paluwagan_ in the Philippines or _tandas_ globally) are vital tools for informal financial security and collaborative savings. However, they rely entirely on manual record-keeping and absolute trust. This makes them highly vulnerable to default, lack of transparency, administrative errors, and theft, with no security or automated recourse for participants. This matters because a large portion of the Philippine population remains unbanked or underbanked, relying heavily on these informal systems for financial liquidity.

![Orbit Preview](./public/preview.png)

## How It Works

1. **Create an Orbit**: A user starts a saving circle (an "Orbit"), sets the recurring deposit amount, cycle frequency, and invites their saving group ("Crew").
2. **Deposit & Pool**: Every cycle, each crew member deposits a fixed contribution into the smart contract pool.
3. **Automated Rotation**: At the end of each cycle, the pooled funds are automatically disbursed to one member of the crew based on a pre-determined or randomized rotation sequence, secured by the contract.

## How It Uses Stellar

- **Soroban Smart Contracts**: Custom Soroban smart contracts manage the pool deposits, schedule automated payout distributions, and enforce contribution transparency.
- **Low Fees & Speed**: Stellar's sub-cent transaction costs make micro-deposits viable for everyday Filipinos, and fast finality ensures immediate payout execution.
- **Classic Assets / Stablecoins**: Seamless integration with local stablecoins (such as PHP-backed tokens) to eliminate volatility and preserve buying power.

## Track

Track 2 — Financial Inclusion & Everyday Payments

## Tech Stack

- Framework: Next.js / React
- Stellar SDK: @stellar/stellar-sdk v16.0.1
- Network: testnet
- TailwindCSS, Framer Motion, Supabase

## Setup & Run

Check it out on: [orbit-cq.vercel.app](https://orbit-cq.vercel.app)

Ensure you have Node.js installed.

```bash
git clone https://github.com/ChrisQuint0/Orbit.git
cd orbit
npm install
# environment variables needed:
# NEXT_PUBLIC_SUPABASE_URL=https://xpznumqslfhqzloobmen.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwem51bXFzbGZocXpsb29ibWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxOTU5MDgsImV4cCI6MjA5Nzc3MTkwOH0.VegkNzRO_ICzC3nl3zxqxj3a5LRMc0ilBZVl8o31oTg

#SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhwem51bXFzbGZocXpsb29ibWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE5NTkwOCwiZXhwIjoyMDk3NzcxOTA4fQ.ijzMyFlOzIoSSv_G04QAD1ehSzVlGvZZKNkfjzvzTC0

#WALLET_ENCRYPTION_KEY="f8a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2"

#ORBIT_TREASURY_SECRET="SBI2ZGXDAK6H23KDW6IWUHAHNDSYKJBRLMV4LC6DHX6NDR432W2J65GR"

#NEXT_PUBLIC_ORBIT_USDC_ISSUER="GDXB4K5NEQYEV2BAKKWUJRJYT7VENPJTKUJVF22LK5B4NGXZE42NCR5L"

npm run dev
```

## Network Details

- Network: testnet
- RPC URL: https://soroban-testnet.stellar.org
- Contract IDs: TBD
- Asset issuers: GDXB4K5NEQYEV2BAKKWUJRJYT7VENPJTKUJVF22LK5B4NGXZE42NCR5L

## Team

- Christopher A. Quinto — @ChrisQuint0

## License

MIT
