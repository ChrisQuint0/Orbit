# Orbit

### Save together. Build trust. Move forward.

Alternative taglines:

- Community savings, powered by trustless technology.
- The modern savings circle.
- Your community, your orbit.
- Financial trust, on autopilot.
- Build savings. Build reputation.

---

# Product Story

Orbit transforms traditional savings circles into secure, automated digital communities.

Members contribute to a shared pool on a recurring schedule. Once everyone contributes, Orbit automatically releases the funds to the next member in line.

Every contribution strengthens a member's Orbit Score, creating a portable record of financial reliability.

---

# The Orbit Universe

| Traditional Term | Orbit Term      |
| ---------------- | --------------- |
| Savings Circle   | Orbit           |
| Group Members    | Crew            |
| Contribution     | Deposit         |
| Payout           | Release         |
| Pot              | Pool            |
| Reputation Score | Orbit Score     |
| Savings History  | Orbit Record    |
| Completed Circle | Completed Orbit |

Example:

> Orbit #12 is active.  
> 5 of 5 Crew members have deposited.  
> Pool size: 50 USDC.  
> Next Release: Jenny.

---

# Core Concept

A web app where small groups can create a trustless savings circle (paluwagan) using Stellar + Soroban smart contracts. Users contribute USDC weekly, and the smart contract automatically distributes the pooled funds to the scheduled recipient. Every on-time contribution builds an on-chain savings reputation.

---

# Tech Stack

## Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Privy (embedded wallets + Google login)

## Blockchain

- Stellar Soroban SDK (Rust)
- Stellar RPC / Horizon
- USDC on Stellar Testnet

## Backend

- Supabase
- Edge Functions (optional)
- Next.js API Routes for simulated funding flows

## Deployment

- Vercel
- Supabase
- Stellar Testnet

---

# How the Website Works (Narrative UX)

## Landing Page

![Fintech website design by Junaki 🌸 on Dribbble](https://images.openai.com/static-rsc-4/CgyG7rFBPwy5xdufjrvu2w9mOCow9MCmE7c8ooZ1cxanopwnve7u5u55Yk6hHTzKYHYizQxGmFwmMEJ19CxRvb3HiwudPyyxbHIVTb5JPTtuCnpqgXh-m5eknLPLzOI7pt0n27BnV46eIUJ3RQTJ_Ig2AaANkOA30f5Mu4QkQ2zfUK7Pq1ZKf4-tl787GloV?purpose=fullsize)

### Community saving, reimagined.

Create secure savings circles that run automatically on Stellar.

Buttons:

- Start an Orbit
- Watch Demo

Sections:

- Hero section
- How it works
- Trust section
- Reputation section

---

# User Flow

## 1. Login

Users continue with Google.

Privy automatically creates an embedded Stellar wallet.

No crypto jargon is exposed to the user.

---

## 2. Dashboard

![Savings, Cards & Cash Flow Analytics Fintech Dashboard Screens by Aftabul Islam Samudro on Dribbble](https://images.openai.com/static-rsc-4/Nk8eVH_mP_lRKMU8R9ePl02tnTeYdGLJg7p0O4YivVr5MJnhb0_Quyjo781NfS3_wRMPkE9c5suowumHlF2kMt6ERTp-droEu9GcsG6T6lGqeAb8AaKWoe6k_7HoQH5xILfMwfjUFZj1pxfuPgspCwaviuCSFcV0evYBa6Gj7Byk4W-jvW-qWErlDhI45d9C?purpose=fullsize)

Example:

```text
Good Evening, Chris

Active Orbits: 2
Orbit Score: 96

Factory Crew Orbit
Cycle 3 of 5

Pool: 50 USDC
Status: Waiting for 1 deposit

[Open Orbit]
```

---

## 3. Create Orbit

![Browse thousands of Group Savings images for design inspiration | Dribbble](https://images.openai.com/static-rsc-4/krz0xNN3ha-e7zAqFHBebOjrB6QQ78qaPDWDzdCIAiOdz32NiCrfLaZjjvR3ADcgagkz_pWvjcyPPEHlgyaNok5wqdpPjf3BOQfQpLBaoSV48hRnKiQajXhNNzDtLgfKTuHr_FTzszVrPnDOnPXAliVNrlDrGa_BOxvS-OBcDerS2q1oXqjnRUIpeW4MyMSJ?purpose=fullsize)

Form Fields:

- Orbit Name
- Number of Crew Members
- Deposit Amount
- Frequency (Weekly)
- Release Order

Actions:

1. Initialize Soroban contract.
2. Store metadata in Supabase.
3. Generate invite link.

---

## 4. Invite Crew Members

![Invite Friends Mobile App Ui by UI Ants on Dribbble](https://images.openai.com/static-rsc-4/JfOIb5kLJ1RxY8P8Z7O0lzhvoz6q-ikG3VvRyRgBFbBkN8uP_4H5duJuwMlnopjQt5F9U3V9cAlaJc3klIp84rEkIDdY41bQUGa0i5JBU5gq4FYiOV_DSDeuBUMIzBOofk4p4EgdEwz6w2H_jg7S3HuOWmXY9evzCnoArTc8drGH4ueSw8GbZNREqlomklDc?purpose=fullsize)

Share invite link and track joined members.

Once everyone joins, the Orbit becomes active.

---

## 4.5 Top-Up Wallet (Simulated On-Ramp)

Before making a deposit, users can click **Add Funds**.

A mock checkout flow simulates funding their wallet.

Behind the scenes:

- User submits a fake payment.
- Next.js API Route triggers.
- Treasury wallet sends testnet USDC.
- User receives demo funds instantly.

This creates a smooth hackathon demo without requiring real fiat rails.

---

## 5. Weekly Deposit

![Fintech - Mobile App Ui Design by Capi Product on Dribbble](https://images.openai.com/static-rsc-4/WkivXcxjiP4KLWwHkswW9c87yrWCEtxod_87f7XwKgu-5JMzNGNl94oqOlr2L86owHdmDBWjGni1GtHNtShbTVmb2mHap8wZ9Hzaej2Nh-vm3HbDRXSPuoLAsMjfETI_6lA6aKa8RROJoPAfudk85mhjhu37JvWAXR2e0gd0BUI-b2nhhKUz7KGrPTa4Wg5B?purpose=fullsize)

Users click:

### Deposit 10 USDC

Funds move into the Orbit smart contract vault.

The UI updates instantly.

---

## 6. Automatic Release

![Browse thousands of Confetti UI images for design inspiration | Dribbble](https://images.openai.com/static-rsc-4/Tu_99CmQ8jL4xnryypmyhy5dA4EOo8Iqc0uWWicIcFMsH-vokIuU3xpPcZohwy5I8a9XfvvRkCYuBDj6ljN2GiUOkjJnPBiAWY4fzdSh2RWp8eXak5fth9oBhgYukI1YgARabF7dVQN2a9_gPjrNnZ7Pbd0rWDwAlrHH6r7RtDbM7u2qi7f4k_FoFBJ0Eko3?purpose=fullsize)

Once all deposits are completed:

- Smart contract releases the pool.
- Recipient receives USDC automatically.
- Orbit status advances to the next cycle.

---

## 7. Orbit Reputation Profile

![online banking smart wallet payment application set fintech business investment concept horizontal](https://images.openai.com/static-rsc-4/c1Ys6_TEUh2S4Nh8kykCVyBbS4fCSlL1IcQogd0Y38akQAE4HBzvrFmVg6XHkCTXsGk14DfeVRBEWZ5movSE0Jf5Dpi25Bx7coMzjdcSlSs1V--byp1kAKLJNg1aEaTg-mNpin2yqEdNddUezyNdpMEUENguKzgXLybeKHUt-Dj3gelK8jNe-St5cMgrzS0X?purpose=fullsize)

Metrics:

- Orbit Score
- Reliability Rate
- Total Deposits
- Completed Orbits
- Missed Payments
- Achievement Badges

Example badges:

🏅 Reliable Saver  
🏅 Orbit Finisher  
🏅 Community Builder

---

# What Makes Orbit Interesting

Most fintech apps ask:

> What's your credit score?

Orbit asks:

> How consistently do you honor commitments to your community?

The reputation layer turns community trust into a portable financial record.

---

# 15-Second Elevator Pitch

Orbit is a trustless savings circle platform built on Stellar. Groups deposit funds into Soroban smart contracts that automatically release pooled savings to members on a rotating schedule. Every successful deposit builds an Orbit Score, creating a verifiable financial reputation for users who may not have access to traditional credit systems.

---

# 7-Day Solo Development Plan

## Day 1

- Project setup
- Landing page
- Tailwind + shadcn/ui
- Vercel deployment

## Day 2

- Privy integration
- Google login
- Embedded wallet creation
- Dashboard shell

## Day 3

- Soroban smart contract
- initialize_circle()
- join_circle()
- contribute()
- distribute_payout()
- get_circle_status()

## Day 4

- Create Orbit flow
- Invitations
- Supabase integration
- Join pages

## Day 5

- Orbit details page
- Deposits
- Pool tracking
- Simulated on-ramp
- Treasury wallet funding flow

## Day 6

- Orbit Score
- Reputation profile
- Badges
- UI polish
- Mobile responsiveness

## Day 7

- End-to-end testing
- Demo video
- Pitch deck
- Bug fixes

---

# Final MVP Scope

Build:

1. Create Orbit
2. Join Orbit
3. Deposit Funds
4. Automatic Release
5. Orbit Score Tracking
6. Simulated Wallet Funding

Do Not Build:

- Push notifications
- Mobile app
- Yield farming
- Complex lending
- Penalty systems
- Production fiat rails
- Multi-language support

---

# Future Features

## Orbit Vaults

Goal-based group savings.

## Orbit Score Lending

Alternative underwriting powered by Orbit participation.

## Orbit Marketplace

Discover public Orbits.

## Family Orbits

Family savings circles.

## Business Orbits

Working capital pools for SMEs.

---

# Pitch Narrative

Millions of Filipinos already use paluwagan to save money. However, these systems rely on trust in a single organizer.

Orbit uses Stellar smart contracts to make savings circles transparent, automatic, and secure while helping users build a portable financial reputation.

The ideal demo:

Five users join an Orbit → everyone deposits USDC → the smart contract automatically releases the pool → Orbit Scores update.
