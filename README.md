<div align="center">

# Awais Ahmad — 3D Portfolio

**An interactive, terminal-inspired 3D portfolio website for a Mobile App & Full-Stack Developer.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r168-000000?logo=three.js&logoColor=white)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?logo=greensock&logoColor=white)](https://gsap.com)

</div>

---

## Overview

A single-page, scroll-driven portfolio built around a real-time **3D character** rendered in the
browser. The character reacts to the pointer and plays a scroll-linked animation, while the rest of
the site uses a developer/terminal aesthetic — a boot sequence, glitch transitions, a CRT overlay,
matrix rain, and an interactive terminal.

The goal is a portfolio that feels like a product: fast to load, smooth to scroll, and pleasant on
both desktop and mobile.

## Features

- **Real-time 3D character** — a rigged GLB model rendered with Three.js / React Three Fiber,
  animated with GSAP timelines that are driven by scroll position.
- **Custom cursor** — a 1:1 tracking cursor with an icon-hover state, so it feels as immediate as
  the OS pointer on desktop.
- **Boot / loading sequence** — an animated welcome screen that runs once and is then skipped on
  refresh (tracked via `sessionStorage`), so repeat visits open straight to the page.
- **Terminal aesthetics** — matrix rain, a fake terminal, a typewriter terminal, decrypted text
  effects, glitch transitions, and a CRT overlay.
- **Live project showcase** — pulls repository metadata from the GitHub API, with a bundled
  snapshot used as an offline/fallback seed.
- **Dark & light theme** — persisted in `localStorage`.
- **Ambient sound toggle** — optional background audio, off by default.
- **Smooth scrolling** — powered by Lenis, wired into GSAP ScrollTrigger.
- **Fully responsive** — the 3D scene only mounts on desktop; smaller screens get a lighter
  experience.
- **Vercel-ready** — SPA rewrites and security headers are configured in `vercel.json`.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| 3D | Three.js, React Three Fiber, Drei, three-stdlib |
| Animation | GSAP + ScrollTrigger, Lenis (smooth scroll) |
| Routing | React Router |
| Icons | react-icons |
| Analytics | Vercel Analytics & Speed Insights |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- **Node.js 18+** (Vite 5 requirement)
- **npm**

### Installation

```bash
git clone https://github.com/awaisahmad6059/3D-Portfolio.git
cd 3D-Portfolio
npm install
```

### Development

```bash
npm run dev
```

The dev server runs with `--host`, so it is also reachable from other devices on the same network.

### Production build

```bash
npm run build     # type-check + bundle into dist/
npm run preview   # serve the production build locally
```

### Lint

```bash
npm run lint
```

## Environment Variables

The project runs without any environment variables. One optional variable is supported:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_GITHUB_TOKEN` | No | A GitHub personal access token. When set, the project section fetches the GitHub API with a higher rate limit. Without it, the bundled snapshot is used. |

Create a `.env` file in the project root:

```env
VITE_GITHUB_TOKEN=your_token_here
```

## Project Structure

```
3D-Portfolio/
├─ public/
│  ├─ draco/                 # Draco decoder (WASM + JS) for the 3D model
│  ├─ images/                # favicon and static images
│  └─ models/
│     ├─ character.glb           # Draco-compressed character (~0.73 MB)
│     ├─ character-fallback.glb  # uncompressed fallback (~1.4 MB)
│     └─ char_enviorment.hdr     # HDR environment for lighting
├─ scripts/                  # GitHub snapshot sync helpers
├─ src/
│  ├─ components/
│  │  ├─ Character/          # Three.js scene, lighting, model loading
│  │  ├─ utils/              # GSAP scroll timelines, text splitting
│  │  └─ *.tsx               # Sections: Landing, About, WhatIDo, Work, ...
│  ├─ context/               # Loading, theme, and sound providers
│  ├─ data/                  # Repository snapshot + bone data
│  ├─ pages/                 # Secondary routes (e.g. MyWorks)
│  ├─ config.ts              # All site content (profile, skills, contact)
│  └─ main.tsx
├─ index.html
├─ vercel.json
└─ vite.config.ts
```

Most of the site's text and links live in **`src/config.ts`**, so content changes rarely require
touching components.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with `--host`. |
| `npm run build` | Type-check with `tsc` and build to `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run sync:repos` | Refresh the bundled GitHub repository snapshot. |

## 3D Model Pipeline

The character is the heaviest asset, so it is served compressed:

- `character.glb` ships **Draco-compressed** (geometry only, visually lossless), which roughly
  halves the download size and reduces decode memory.
- `character-fallback.glb` is the uncompressed copy. It is only requested if the Draco decoder
  cannot run, so the character is always visible even on an unusual browser.
- The Draco decoder is served locally from `public/draco/`.

## Performance Notes

The site is tuned to stay smooth on laptops:

- The 3D render loop is capped at ~30 FPS with a modest pixel ratio — it is a background element,
  so the visual difference is negligible while GPU load drops sharply.
- The render loop, listeners, and IntersectionObservers are all torn down on unmount.
- Scroll timelines are tracked and killed before being rebuilt, so repeated rebuilds can't stack
  duplicate animations.
- Heavy animations (matrix rain) pause automatically when scrolled out of view or when the tab is
  hidden.
- Perpetual animation loops in the cursor and social icons were removed in favour of
  event-driven, self-stopping work.

## Contact

- **GitHub** — [@awaisahmad6059](https://github.com/awaisahmad6059)
- **LinkedIn** — [awaisahmad6059](https://www.linkedin.com/in/awaisahmad6059/)
- **Email** — awaisahmad6059@gmail.com

---

© Awais Ahmad. All rights reserved.
