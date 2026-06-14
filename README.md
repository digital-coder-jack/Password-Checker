<h1 align="center">🔐 SecurePass Studio</h1>

<p align="center">
  A professional-grade, privacy-first <strong>Password Strength Checker &amp; Generator</strong>.<br/>
  Real-time analysis · entropy &amp; crack-time estimation · breach detection · PDF reports.<br/>
  <em>100% client-side — your password is never stored or transmitted.</em>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" />
</p>

---

## 📦 Project Overview

- **Name**: SecurePass Studio
- **Goal**: A premium-feeling SaaS-grade tool that helps users build genuinely strong passwords and understand *why* a password is weak or strong.
- **Stack**: React 18 + TypeScript + Vite (static SPA — deploys directly to Vercel, no backend required).
- **Privacy**: All analysis runs in the browser. The only optional network call is an anonymised, k-anonymity breach check that the user explicitly enables.

> This project was upgraded from a legacy Chrome-extension prototype (preserved in [`/legacy`](./legacy)) into a production-ready web app.

---

## ✨ Features

### Password Analysis
- ⚡ **Real-time** strength checking on every keystroke
- 🎯 **5 strength levels**: Very Weak → Weak → Medium → Strong → Very Strong
- 💯 **Score out of 100** with an animated 5-segment meter
- 🔬 Detects: length, uppercase, lowercase, numbers, symbols, repeated characters, low unique-character ratio, common passwords, sequential patterns (`12345`, `abcde`), keyboard walks (`qwerty`), and embedded years
- 📐 **Entropy calculation** (bits) using search-space entropy
- ⏱️ **Crack-time estimation** across 4 realistic attack scenarios (throttled online → offline GPU fast-hash)
- 💡 Actionable **improvement suggestions**

### Security
- 🔒 **No password storage** — the raw value lives only in React state
- 🖥️ **Fully client-side** analysis (pure functions, no I/O)
- 🛡️ Strict **Content-Security-Policy** + security headers (set in `vercel.json`)
- 🧼 React auto-escapes all output → **XSS-safe**; history stores only **masked** values

### Advanced
- 🎲 **Cryptographically-secure generator** (`crypto.getRandomValues`, rejection sampling, no modulo bias)
- 📋 **Copy** button · 👁️ **visibility toggle** · 🔁 one-click "test this password"
- 🧮 **Entropy** & **variety** metrics
- 🗂️ **Password history comparison** (masked, metadata only, in `localStorage`)
- 🌐 **Breach detection** via Have I Been Pwned (k-anonymity — only the first 5 SHA-1 hex chars are sent)
- 📄 **Download PDF report** (client-side via `jsPDF`)

### UX / Performance
- 🌗 **Dark / Light** mode with OS-preference detection + persistence
- 💎 **Glassmorphism** UI, animated gradient blobs, smooth transitions
- 📱 Fully **responsive** & mobile-friendly
- ♿ Accessible (semantic HTML, ARIA labels, `prefers-reduced-motion`)
- 🚀 SEO-optimised (meta, Open Graph, Twitter card, JSON-LD structured data, `robots.txt`)
- 📦 Code-split vendor chunks for fast initial load

---

## 🗺️ Functional Entry Points (URIs)

This is a single-page app; all routes resolve to `index.html`.

| Path | Description |
| --- | --- |
| `/` | Main application (analyzer + generator + history) |
| `/favicon.svg` | App icon |
| `/og-image.svg` | Social share image |
| `/robots.txt` | Crawler directives |

**External API used (optional, user-initiated):**

| Endpoint | Purpose | Data sent |
| --- | --- | --- |
| `GET https://api.pwnedpasswords.com/range/{prefix}` | Breach check | Only first **5** hex chars of the password's SHA-1 hash |

---

## 🧱 Data Architecture

- **Data models**: see [`src/lib/types.ts`](./src/lib/types.ts) — `AnalysisResult`, `CharacterComposition`, `Detection`, `CrackTimeEstimate`, `BreachResult`, `HistoryEntry`, `GeneratorOptions`.
- **Storage services**:
  - **In-memory (React state)** — the live password. Never persisted.
  - **`localStorage`** — theme preference and the masked password history (no raw passwords).
- **Data flow**: input → `analyzePassword()` (pure) → memoised `AnalysisResult` → UI components. Breach check is debounced and runs only when enabled.

---

## 🚀 Deployment (Vercel)

This app deploys to Vercel with **zero configuration changes**.

### Option A — Vercel Dashboard (recommended)
1. Push this repo to GitHub (see below).
2. Go to **vercel.com → Add New → Project** and import the repository.
3. Vercel auto-detects **Vite**. Defaults are already correct:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **Deploy**. Done. ✅

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel            # preview deployment
vercel --prod     # production deployment
```

`vercel.json` already configures the framework, SPA rewrites, caching, and security headers (CSP, HSTS-friendly headers, etc.).

---

## 🛠️ Local Development

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server (http://localhost:3000)
npm run build        # type-check + production build → dist/
npm run preview      # preview the production build
npm run lint         # ESLint
npm run typecheck    # TypeScript only
```

---

## 📁 Folder Structure

```
webapp/
├── index.html                 # HTML entry + full SEO meta
├── vercel.json                # Vercel config: framework, rewrites, headers
├── vite.config.ts             # Vite build (manual vendor chunks)
├── package.json
├── tsconfig*.json             # TS project references
├── .eslintrc.cjs
├── public/                    # Static assets (favicon, OG image, robots)
├── src/
│   ├── main.tsx               # App bootstrap + ErrorBoundary
│   ├── App.tsx                # Layout & composition
│   ├── vite-env.d.ts
│   ├── lib/                   # Framework-agnostic core engine
│   │   ├── types.ts           #   shared domain types
│   │   ├── data.ts            #   common passwords, sequences, levels, charsets
│   │   ├── analyzer.ts        #   strength scoring + detections
│   │   ├── crackTime.ts       #   crack-time estimation & formatting
│   │   ├── breach.ts          #   HIBP k-anonymity lookup
│   │   ├── generator.ts       #   secure password generator
│   │   ├── random.ts          #   crypto-secure RNG helpers
│   │   ├── format.ts          #   masking / id helpers
│   │   └── pdf.ts             #   PDF report builder
│   ├── hooks/                 # useTheme · useHistory · useDebouncedValue
│   ├── components/            # Presentational + container components
│   └── styles/index.css       # Design tokens, glassmorphism, responsive
└── legacy/                    # Original Chrome-extension prototype (archived)
```

---

## 🧭 Not Yet Implemented / Future Ideas

- Multi-language (i18n) support
- Passphrase (diceware) generator mode
- Configurable scoring profiles (NIST vs. corporate policy presets)
- Optional PWA / offline install
- Unit-test suite (Vitest) wired into CI

## 👉 Recommended Next Steps

1. Add a Vitest suite around `src/lib` (the engine is already pure and easy to test).
2. Wire GitHub Actions for lint + typecheck + build on every PR.
3. Add a custom domain in Vercel and update the canonical URL in `index.html`.

---

## 🔐 Privacy Statement

Your password is analysed entirely inside your browser. It is **never** logged, stored, or sent to any server — the only exception is the **optional** breach check you explicitly enable, which uses k-anonymity so the full password never leaves your device.

---

## 📊 Deployment Status

- **Platform**: Vercel
- **Status**: ✅ Ready to deploy (build verified, `npm run build` passes with no errors)
- **Tech Stack**: React 18 · TypeScript 5 · Vite 5 · jsPDF
- **Last Updated**: 2026-06-14

<div align="center"><sub>Crafted with ❤️ for people who care about security.</sub></div>
