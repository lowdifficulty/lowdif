export const CONTRACT_ADDRESS =
  "0x54700deC9eCAb37D26cdffFFe7995E92a49855cc";

export const HERO_STATS = [
  { value: "0", label: "Pre-mine" },
  { value: "1", label: "Token per listen" },
  { value: "50/50", label: "Listener / Artist" },
] as const;

export const FEATURES = [
  {
    num: "01",
    title: "Zero Pre-Mine",
    body: "No tokens were created before the platform launched. No team allocation. No investor round. Every LOWDIF in existence was earned by a real person completing a real listen.",
  },
  {
    num: "02",
    title: "Proof-of-Listen",
    body: "The world's first listen-based consensus mechanism. Complete a full track play and the smart contract mints one token automatically. Skip-proof. Farm-resistant. Human-first.",
  },
  {
    num: "03",
    title: "Artists Paid Instantly",
    body: "0.5 LOWDIF goes directly to the artist wallet on every verified listen. No royalty pipeline. No minimum threshold. No label cut. Value at the moment of creation.",
  },
  {
    num: "04",
    title: "Self-Regulating Supply",
    body: "Advertising spend burns tokens permanently. As the platform grows, burn rate scales with demand — creating a natural equilibrium between new supply and token value.",
  },
  {
    num: "05",
    title: "No Hardware Required",
    body: "Traditional crypto mining requires expensive rigs and massive energy. LOWDIF mining requires headphones. If you can press play, you can mine. Accessibility is the protocol.",
  },
  {
    num: "06",
    title: "On-Chain Transparency",
    body: "Every mint, every burn, every distribution is recorded on the Grape blockchain. The contract is public. The rules cannot be changed after deployment. Trust the code.",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Press Play",
    body: "Open the LOWDIF platform and start listening to any track in the catalog. No setup. No wallet configuration required to start.",
  },
  {
    num: "02",
    title: "Complete the Listen",
    body: "The Proof-of-Listen system monitors the session. A full, uninterrupted playback of the track triggers the mining event. Skipping or looping does not qualify.",
  },
  {
    num: "03",
    title: "Token Minted On-Chain",
    body: "The smart contract mints exactly 1 LOWDIF per verified listen. The transaction is recorded permanently on the Grape blockchain within seconds.",
  },
  {
    num: "04",
    title: "Split 50/50",
    body: "0.5 LOWDIF is sent to your wallet. 0.5 LOWDIF is sent directly to the artist. Automatic. Immediate. No intermediary. No delay.",
  },
] as const;

export const TOKENOMICS_ROWS = [
  { label: "Token Name", value: "LOWDIF" },
  { label: "Symbol", value: "LOWDIF" },
  { label: "Initial Supply", value: "0 (Zero Pre-Mine)" },
  { label: "Mint Rate", value: "1 per verified listen" },
  { label: "Listener Reward", value: "0.5 per listen" },
  { label: "Artist Reward", value: "0.5 per listen" },
  { label: "Burn Mechanism", value: "Ad purchases (permanent)" },
  { label: "Blockchain", value: "Grape" },
  { label: "Decimals", value: "18" },
  { label: "Contract", value: CONTRACT_ADDRESS },
] as const;

export const ROADMAP = [
  {
    phase: "Phase 1",
    status: "Complete",
    title: "Foundation",
    items: [
      "LOWDIF token deployed on Grape",
      "Smart contract verified on-chain",
      "Website and whitepaper published",
      "Zero pre-mine confirmed",
      "Domain and infrastructure live",
    ],
  },
  {
    phase: "Phase 2",
    status: "In Progress",
    title: "Platform Beta",
    items: [
      "Proof-of-Listen backend development",
      "Artist onboarding portal",
      "Listener wallets and earning dashboard",
      "First community mints",
      "Anti-fraud and verification hardening",
    ],
  },
  {
    phase: "Phase 3",
    status: "Upcoming",
    title: "Advertiser Network",
    items: [
      "Ad placement dashboard",
      "First token burns from ad spend",
      "Exchange listings",
      "Supply equilibrium monitoring",
      "Artist analytics tools",
    ],
  },
  {
    phase: "Phase 4",
    status: "Upcoming",
    title: "Scale and Ecosystem",
    items: [
      "Open API for third-party integrations",
      "Cross-platform expansion",
      "DAO governance model",
      "Artist grant programs",
      "Global listener community",
    ],
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "What is LOWDIF?",
    a: 'LOWDIF is a cryptocurrency mined by listening to music. The name comes from "low difficulty" — the idea that mining should be accessible to everyone, not just those who can afford expensive hardware. Complete a full listen, earn LOWDIF.',
  },
  {
    q: "How do I mine LOWDIF?",
    a: "You mine by listening. Open the LOWDIF platform, play any track in full, and the smart contract automatically mints one token. 0.5 goes to you, 0.5 goes to the artist. No hardware. No setup. No technical knowledge required.",
  },
  {
    q: "Is there a pre-mine or founder allocation?",
    a: "No. The initial supply is zero. No tokens were created before the platform launched. No team, investor, or early-adopter allocation exists. Every LOWDIF in circulation was earned through a verified listen.",
  },
  {
    q: "How does the token supply stay balanced?",
    a: "Supply grows when people listen (minting) and shrinks when advertisers spend (burning). As the platform scales, more advertisers compete for placement, increasing the burn rate proportionally to new minting. The system self-regulates without external intervention.",
  },
  {
    q: "What stops people from farming listens?",
    a: "The Proof-of-Listen system uses timing validation, behavioral analysis, rate limiting, and pattern recognition. Looped micro-plays, skips, and bot-like behavior are flagged and rejected. Only genuine full-track listens trigger minting.",
  },
  {
    q: "How do artists get paid?",
    a: "Artists receive 0.5 LOWDIF per verified listen automatically to their registered wallet. There is no minimum threshold, no payout delay, and no label or platform taking a cut. Value flows directly from listener to artist at the moment of the listen.",
  },
  {
    q: "What blockchain is LOWDIF on?",
    a: `LOWDIF is deployed on the Grape blockchain. The contract address is ${CONTRACT_ADDRESS}. All transactions are public and verifiable on-chain.`,
  },
  {
    q: "When can I start listening and earning?",
    a: "The platform is currently in Phase 2 development — the Proof-of-Listen backend and artist onboarding are being built now. Join the movement to be notified when the platform opens for the first listeners and artists.",
  },
] as const;

export const MARKETING_NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Tokenomics", href: "/#tokenomics" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "FAQ", href: "/#faq" },
  { label: "Whitepaper", href: "/whitepaper" },
] as const;

export const WHITEPAPER_SECTIONS = [
  {
    id: "executive-summary",
    title: "1. Executive Summary",
    paragraphs: [
      'LOWDIF is the first cryptocurrency mined through the act of listening to music. The name derives from "low difficulty" — a deliberate inversion of traditional proof-of-work systems where mining difficulty is a barrier to participation.',
      "In the LOWDIF model, the work is listening. The mining event is a verified, completed play. One LOWDIF token is minted per listen and distributed equally between the listener and the artist — 0.5 each, automatically, on-chain.",
      "There is no pre-mine. No founder allocation. No investor round. The initial supply is zero. Every token in existence was earned by a real person completing a real listen.",
    ],
  },
  {
    id: "the-problem",
    title: "2. The Problem",
    intro:
      "The music industry has a structural compensation problem that streaming platforms have made worse, not better.",
    bullets: [
      "Artists earn fractions of a cent per stream on major platforms",
      "Listener attention generates billions in ad revenue that bypasses artists entirely",
      "Cryptocurrency mining excludes most people through hardware cost and technical complexity",
      "Web3 music projects typically rely on pre-mined tokens with team allocations, creating immediate misalignment",
    ],
    closing:
      "The result is a system where the two parties who create value — listeners and artists — capture almost none of it.",
  },
  {
    id: "the-solution",
    title: "3. The Solution",
    paragraphs: [
      "LOWDIF reframes both problems simultaneously. Listening to music becomes a productive economic act. Artists are paid at the moment of value creation — when someone listens — not weeks later through an opaque royalty pipeline.",
      "The system requires no technical knowledge, no hardware investment, and no upfront capital. If you can press play, you can mine LOWDIF.",
      "The zero pre-mine model ensures no party enters the system with an unfair advantage. Supply is a direct function of community participation.",
    ],
  },
  {
    id: "proof-of-listen",
    title: "4. Proof-of-Listen",
    intro:
      "Proof-of-Listen is the consensus mechanism that validates mining events. A mining event is a verified, completed play of a full-length track on the LOWDIF platform.",
    bullets: [
      "Completion requirement: Only full listens trigger a mint. Partial plays, skips, and looped micro-plays do not qualify.",
      "Rate limiting: Per-account and per-IP minting rates are capped to prevent high-volume farming.",
      "Behavioral analysis: Listen patterns are compared against statistical norms. Anomalous behavior is flagged rather than immediately blocked to protect legitimate users.",
      "Timing validation: Backend timestamps verify that elapsed time matches track duration within acceptable tolerance.",
    ],
  },
  {
    id: "token-economics",
    title: "5. Token Economics",
    table: [
      ["Token Name", "LOWDIF"],
      ["Symbol", "LOWDIF"],
      ["Decimals", "18"],
      ["Initial Supply", "0 (zero pre-mine)"],
      ["Mint Rate", "1 LOWDIF per verified listen"],
      ["Distribution", "0.5 to listener, 0.5 to artist"],
      ["Blockchain", "Grape"],
      ["Contract", CONTRACT_ADDRESS],
      ["Mintable", "Yes — Proof-of-Listen only"],
      ["Burnable", "Yes — ad purchases"],
      ["Pausable", "No"],
    ],
  },
  {
    id: "smart-contract",
    title: "6. Smart Contract",
    intro: `The LOWDIF token is deployed on the Grape blockchain at ${CONTRACT_ADDRESS}.`,
    bullets: [
      "Mintable: New tokens are created by the authorized minting role, held by the Proof-of-Listen backend only.",
      "Burnable: Tokens spent on ads are permanently destroyed and removed from circulation.",
      "Non-pausable: There is no pause function. The contract cannot be stopped by any party.",
      "18 decimals: Standard precision allowing fractional accounting at the protocol level.",
    ],
  },
  {
    id: "closed-loop",
    title: "7. Closed-Loop Economy",
    steps: [
      "Listeners mine. Every completed listen mints 1 LOWDIF. The listener receives 0.5 as compensation for attention and time.",
      "Artists earn. Artists receive 0.5 LOWDIF per listen automatically. No minimum threshold. No label intermediary. Direct to wallet.",
      "Advertisers spend. Advertisers purchase promotional placement using LOWDIF. Spent tokens are permanently burned, reducing circulating supply.",
      "Supply self-regulates. As ad demand grows with platform scale, burn rate increases proportionally. The system seeks equilibrium without external intervention.",
    ],
  },
  {
    id: "roadmap",
    title: "8. Roadmap",
    phases: ROADMAP,
  },
  {
    id: "vision",
    title: "9. Vision",
    paragraphs: [
      "The canvas is ready. Artists are the painters. Listeners are the collectors. LOWDIF is the currency they share.",
      "The long-term vision is a music economy where every act of listening is economically meaningful. Not through advertising subsidies or subscription fees, but through a token whose supply is a direct measure of cultural engagement.",
      "When a song is played, value is created. LOWDIF is the record of that value.",
    ],
  },
] as const;
