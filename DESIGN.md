# Design

Visual system of the Better Democracy one-pager, as implemented in `css/styles.css`.

## Theme

Editorial / print: "EU ballot paper from a great print shop". Ivory paper (light) or deep
navy (dark), halftone textures, rubber-stamp motifs, small section numbers (`01 — Mission`),
yellow marker-highlight on heading accents. Two themes via `html[data-theme]`.

## Color

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f7f4ec` ivory | `#080d20` navy | page |
| `--bg-2` | `#fffdf7` | `#0f1731` | cards/rows |
| `--bg-3` | `#eee9db` | `#182248` | wells (segmented control) |
| `--text` / `--text-2` | `#101733` / `#565d78` | `#eef1fb` / `#9aa3c7` | ink / muted |
| `--blue` | `#16339e` | `#5b82ff` | brand primary, links, active |
| `--blue-soft` | 8% blue | 14% blue | chips, time tags |
| `--yellow` | `#ffcc00` | `#ffd23f` | marker highlight, keynote, CTAs |
| `--border` / `--border-strong` | 13% / 26% ink | 12% / 26% | hairlines |

Strategy: **Committed two-hue** (EU blue + yellow). Never add a third brand hue; avatar
gradients (`--grad-1..6`) are the only sanctioned exception.

## Typography

- `--font-display`: **Syne** — headings, times, badges. Never mixed mid-heading with serif.
- `--font-serif`: **Instrument Serif** — italic, whole lines only (hero line 2).
- `--font-body`: **Instrument Sans** — everything else.
- Heading accents: `em` = yellow marker underlay (no font switch). Times/numbers:
  `font-variant-numeric: tabular-nums`.

These three families are the brand's committed identity — do not swap without an explicit
user request (identity-preservation overrides reflex-reject lists).

## Layout

- Containers: 1180 / 900 (`--mid`) / 780 (`--narrow`) px.
- Radii: `--radius` 16px, `--radius-sm` 12px. Hard cap ~16px; pills only for tags/buttons.
- Sections numbered (`.sec-num`) only where sequence is real.

## Components

- **Badges** (`.badge`, `--yellow/--blue/--soft`): uppercase 11px Syne tags.
- **Segmented control** (`.seg`): sliding indicator, used for day tabs + form tabs.
- **Schedule** (`.sched`): per-day proportional "day map" strip (blocks sized by minutes,
  colored by session type, click = jump) + accordion rows (time range, title, speaker chip,
  type badge, expandable note).
- **Speaker roster** (`.roster`): printed programme rows — index, initials avatar on
  `--grad-*`, name/role, topic, time-chip slot (same visual language as the schedule).
- **Ledger** (`.ledger`): numbered hairline rows for Learn/Debate/Act — no card grids.
- **Tally strip** (`.stats__grid`): bare numbers on hairlines, yellow marker tick draws in.
- **Index rail** (`.rail`, ≥1440px): fixed section numbers with scrollspy, yellow marker
  on the active one; header auto-hides on downward scroll.
- **Event ticket** (`.event__card`): main body + tear-off stub, perforation with punched
  notches, barcode, countdown.
- **Practice ballot** hero widget: vote → stamp → results.

## Motion

Per `emil-design-eng` + `review-animations/STANDARDS.md`:
- Easings: `--ease-out cubic-bezier(0.23,1,0.32,1)`, `--ease-in-out`, `--ease-drawer`.
- UI transitions < 300ms; transform/opacity (GPU) only; no `scale(0)` entrances.
- Staggers ≤ 30ms/row; every animation has a `prefers-reduced-motion` branch;
  hover-only effects gated behind `(hover:hover) and (pointer:fine)`.
