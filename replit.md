# Xmem Landing Page

## Project Overview
A fully 3D, scroll-driven SaaS landing page for **Xmem** — Memory for the Machine Age.

## Design Philosophy
- **Black and white monochrome theme** — deep black backgrounds (#030303 to #080808), pure white text and accents
- **3D WebGL animations** — Three.js via @react-three/fiber with neural networks, orbital rings, agent networks
- **Scroll-driven animations** — Framer Motion with useInView, useScroll, and useTransform
- **Premium SaaS aesthetic** — Stripe/Vercel/Linear quality tier, glassmorphism, grid patterns

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **3D Engine**: Three.js 0.168 + @react-three/fiber 8.17 + @react-three/drei 9.122
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS with custom monochrome tokens
- **Font**: Inter (body), Space Grotesk (headings), JetBrains Mono (code)
- **Backend**: Express.js (static serving only)

## Page Sections
1. **Navbar** — Fixed, glassmorphic on scroll
2. **Hero** — Full-screen 3D neural network with animated nodes and connections
3. **Problem** — 4-card grid explaining AI memory gaps, broken pipeline diagram
4. **Solution** — 3D architecture canvas (Xmem layer), feature grid of 5 memory types
5. **How It Works** — 3-step accordion with live code snippets (Capture/Retrieve/Evolve)
6. **Agentic Systems** — 3D multi-agent network visualization + feature list
7. **Enterprise Ready** — 6-card glassmorphic grid (Encryption, Access Control, etc.)
8. **Developer Experience** — Tabbed code block (TypeScript SDK, CLI, REST API)
9. **Use Cases** — 5-card grid + custom use case card
10. **Vision** — Full 3D scene with distorted sphere and orbital rings
11. **Final CTA** — Large headline with glowing orb background
12. **Footer** — 3-column links + branding

## Key Files
- `client/src/pages/home.tsx` — All landing page sections (single file for cohesion)
- `client/src/index.css` — Custom CSS utilities (glassmorphism, grid-pattern, animations)
- `client/src/App.tsx` — Router setup
- `tailwind.config.ts` — Monochrome design tokens + Space Grotesk font

## 3D Scenes
- `HeroScene` — Neural network nodes with connection lines, mouse-responsive rotation
- `ArchitectureScene` — Layered box diagram representing Xmem architecture
- `AgentNetworkScene` — Icosahedron agent nodes with connecting lines
- `VisionScene` — Distorted sphere + 3 orbital torus rings + star field

## Running
The "Start application" workflow runs `npm run dev` which starts both Express and Vite.
