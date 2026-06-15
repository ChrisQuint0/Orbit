# Orbit

Community saving, reimagined.

## Problem

Traditional community savings circles (historically known as _paluwagan_ in the Philippines or _tandas_ globally) are vital tools for informal financial security and collaborative savings. However, they rely entirely on manual record-keeping and absolute trust. This makes them highly vulnerable to default, lack of transparency, administrative errors, and theft, with no security or automated recourse for participants.

## How It Works

1. **Create an Orbit**: A user starts a saving circle (an "Orbit"), sets the recurring deposit amount, cycle frequency, and invites their saving group ("Crew").
2. **Deposit & Pool**: Every cycle, each crew member deposits a fixed contribution into the smart contract pool.
3. **Automated Rotation**: At the end of each cycle, the pooled funds are automatically disbursed to one member of the crew based on a pre-determined or randomized rotation sequence, secured by the contract.

## How It Uses Stellar

- **Soroban Smart Contracts**: Custom Soroban smart contracts manage the pool deposits, schedule automated payout distributions, and enforce contribution transparency.
- **Low Fees & Speed**: Stellar's sub-cent transaction costs make micro-deposits viable for everyday Filipinos, and fast finality ensures immediate payout execution.
- **Classic Assets / Stablecoins**: Seamless integration with local stablecoins (such as PHP-backed tokens) to eliminate volatility and preserve buying power.

## Track

**Track 2 — Financial Inclusion & Everyday Payments**

## Tech Stack

- Framework: Next.js (React)
- TailwindCSS (Styling)
- Framer Motion (Micro-animations)
- Network: Stellar Testnet

## Project Structure

```text
├── app/                  # Next.js App Router root
│   ├── globals.css       # Global styles and Tailwind CSS configurations
│   ├── icon.png          # App favicon / icon
│   ├── layout.tsx        # Root layout configuration
│   └── page.tsx          # Main landing page
├── components/           # Reusable React components
│   ├── ui/               # Shadcn UI primitives (button, card, input, label)
│   ├── final-cta.tsx     # Final call-to-action section
│   ├── footer.tsx        # Page footer component
│   ├── hero-background.tsx # Interactive SVG background graphics
│   ├── hero.tsx          # Landing page hero section
│   ├── how-it-works.tsx  # Interactive step-by-step guide
│   ├── navbar.tsx        # Header navigation bar
│   ├── orbit-logo.tsx    # Branded SVG logo component
│   ├── orbit-ring.tsx    # Interactive orbit rings illustration
│   ├── orbit-score.tsx   # Trust score visual display
│   ├── section-heading.tsx # Reusable section title component
│   └── trust-section.tsx # Transparency and security features section
├── lib/                  # Application utility helpers
│   └── utils.ts          # Tailwind CSS classes merger helper
├── public/               # Static assets (logos, svgs)
└── tsconfig.json         # TypeScript configuration
```

## Setup & Run

Ensure you have [Node.js](https://nodejs.org) installed.

```bash
# Clone the repository
git clone https://github.com/ChrisQuint0/orbit.git

# Navigate to the project directory
cd orbit

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Network Details

- Network: Stellar Testnet
- RPC URL: [endpoint]
- Contract IDs: [if any]
- Asset issuers: [if any]

## Team (Solo Project)

- Christopher A. Quinto - @ChrisQuint0

## License

This project is licensed under the MIT License.
