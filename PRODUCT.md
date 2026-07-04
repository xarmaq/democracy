# Product

## Register

brand

## Users

Young Europeans (16–30): students, activists, teachers, first-time voters. They land here
from social media or a school/NGO link, skim on the phone, and decide in under a minute
whether the Sofia Youth Forum (18–19 Sept 2026) is worth applying to. Secondary audience:
speakers, partner NGOs, ministries' press offices.

## Product Purpose

A single-page marketing site for Better Democracy's Sofia Youth Forum. Success = a visitor
understands the event (what/when/where/why), feels the civic-optimist energy, and submits
the (simulated) application form. Static HTML/CSS/JS, no build step, no backend — forms are
demo-only and say so.

## Brand Personality

Civic, optimistic, precise. "A ballot paper designed by a great print shop": EU-institutional
blue + yellow made playful through editorial/print details (stamps, halftone, section numbers,
sparse type). Minimal copy, maximal interactive/visual tiles — the hero is a working practice
ballot (vote → stamp → results).

## Anti-references

- "Typical AI look": purple-blue gradients, glow blobs, glassmorphism-as-decoration, gradient text.
- Beige/cream "neutral but trendy" defaults; ghost-cards; side-stripe borders; ≥32px radii.
- Identical icon+heading+text card grids; big-metric SaaS stat blocks; sketchy hand-drawn SVGs.
- Generic tech visuals (3D globes, particle networks) — this is a civic brand, not a SaaS.

## Design Principles

1. **Practice what you preach** — democracy widgets (ballot, declaration, schedule) should *work*, not illustrate.
2. **Print-shop precision** — editorial artifacts (stamps, numbers, rules, tabular figures) over decorative effects.
3. **Show, don't write** — a badge, tile or interaction beats a paragraph; copy stays terse.
4. **One palette, committed** — EU blue + yellow carry the page; no hedging with extra hues.
5. **Motion is physics, not garnish** — custom easings, <300ms, transform/opacity only, reduced-motion respected.

## Accessibility & Inclusion

Target WCAG 2.1 AA: full keyboard operability (tabs, accordions, forms), visible focus,
`prefers-reduced-motion` branch for every animation, hover effects gated behind
`(hover:hover) and (pointer:fine)`, light + dark themes, tabular numerals for times.
