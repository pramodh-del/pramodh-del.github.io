# Kadam Pramodh · Portfolio

A React app, not a static page: routes, components, typed content and a real build.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ locally
npm run lint && npm run typecheck
```

## Edit content

Every word on the site lives in `src/data/profile.ts`. Cases, stack, side builds, links and email are all there.

## What moves, and where

| Effect | File | Behaviour |
| --- | --- | --- |
| Multiplayer cursor | `src/components/Cursor.tsx` | 16px inverting dot with a "You" tag. Springs into a 350px selection frame over the name (`data-cursor="expand"`), an 80px "See" bubble over diagrams (`see`), and a "Drag" tag over draggables (`drag`). Spring: 0.4s, no bounce. |
| 3D draggable stickers | `src/components/Sticker.tsx` | Drag with no momentum. While moving, the card tilts in rotateX / rotateY from pointer velocity, in perspective, then springs flat. |
| Cursor repel | `src/components/HoverForce.tsx` | Elements within 200px slide away from the cursor vertically (spring 1000 / 150). |
| On-call bot | `src/components/OnCallBot.tsx` | Eyes follow the cursor (×0.04, spring 300 / 40) and blink every 2–4s. |
| Line reveal | `src/components/LineReveal.tsx` | Lines rise from 120% in a mask, 0.7s power3.out, 0.06s stagger. Inline icons rock ±15°. |
| Loops | `src/components/loops.tsx` | GSAP rotate, scale and wind-up spin loops that pause off screen (ScrollTrigger). |
| Folder stack | `src/sections/Work.tsx` | Sticky case folders. The one underneath sinks back in 3D and fades as the next slides over. |
| Tilt cards | `src/components/Reveal.tsx` | Hover tilt toward the cursor in 3D. |
| Playground | `src/pages/Playground.tsx` | Pan / zoom canvas. Throw cards; they carry their release velocity. |
| Smooth scroll | `src/components/SmoothScroll.tsx` | Lenis. |

Everything respects `prefers-reduced-motion`, and the custom cursor and dragging only switch on for mouse users.

## Deploy

`base: './'` plus hash routing (`/#/playground`) means `dist/` works on any static host.

Live at **https://pramodh-del.github.io**. `.github/workflows/deploy.yml` lints and builds every PR, and deploys `main` to GitHub Pages (Settings → Pages → Source: **GitHub Actions**).
