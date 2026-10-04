# Deluge Deck source comparison and desktop port

Compared October 4, 2026. Electorrent fork created October 4 at 02:12:11 UTC.
Reference baseline: `619328af5f8549d6b7068fd228c61329f928b765` (1.0.73).
Latest source used: `0cb9c35fc53a4343a4a7140ca7f5118882d6bca4` (1.0.79).

The original `deluge-deck-reference` checkout is read-only and remains unchanged.
A separate, ignored checkout under `.dream-loop/deck-latest` supplied the current
source, artwork, typography and visual reference screenshots.

## Every commit since the fork

| Commit | Update | Electorrent implementation |
| --- | --- | --- |
| `f00dc0f` | 1.0.74: consistent column defaults | Shared order on every theme; migration of exact old defaults; custom orders and saved resize widths preserved. |
| `c928de8` | 1.0.75: compact Darkhand table/details | Compact rows, content-sized short table, blank details until selection, controls within the dashboard. |
| `4cd3c4a` | 1.0.76: Darkhand default and shortcuts | Darkhand on a new installation, direct D shortcut, Darkhand first in the canonical theme order, configured connection password focus. Existing theme preferences remain saved. |
| `ba26ca3` | Matrix and tighter spacing | Complete Matrix colors, typography, code rain SVG, identity, card finishes, table/sidebar materials and reduced-motion support; compact table spacing. |
| `25d40e3` | 1.0.78 cinematic Matrix rebuild | Actual atmosphere artwork, Matrix glyph identity, cinematic masthead, horizontal telemetry cards, clean data table and updated typefaces. |
| `267ff36` | 1.0.79 USA heritage theme | Replace Independence fireworks and flag progress art with a compact USA masthead, monument engraving, ivory paper, navy ink and muted red controls. |
| `f801582` | 1.0.77 release | Matrix appears in theme selection and T/Shift+T cycling; Regular, Holiday and Sports categories. |

Latest default columns: Torrent, State, Size, Progress, Download, Upload, ETA,
Ratio, Seeds, Peers, Seeding time. Optional columns remain in the existing
column chooser. Seeding time comes from clients that report it; unavailable
statistics are shown as unavailable rather than inferred from active time.

## Theme material port

All 38 theme choices share `src/shared/deck-themes.ts`. Current source materials
are imported from 14 reference CSS files into `deck-reference.less`, with the
native Angular/Electron geometry in `deck-reference-adapter.less`. Run:

```sh
node scripts/sync-deck-reference.mjs /absolute/path/to/reference-copy
npm run build
```

The importer only writes to Electorrent. Artwork, fonts, sport logos, stadiums,
card ornaments and gallery previews are local assets. Sports have their actual
club wordmarks, motifs and mastheads; Mets retains its bespoke skyline/cap mark.
Terminal retains its existing CRT implementation, with a transparent native
window drag region across its top edge. Search and buttons are excluded from
that region.

The desktop adaptation retains Electorrent's selected-torrent Start/Pause
controls alongside global Pause/Resume, Add torrent, preferences, its native
client support and torrent details/files/peers/trackers. The user's larger bold
text, centered data/header labels, and percentage labels beneath progress bars
are intentional differences from the web reference. Holiday SVG fills retain
the previous completion fixes.

Darkhand includes saved stats/detail placements, six live statistics, transfer
history range choices from 5 minutes to 90 days, custom range entry, and saved
resizable bottom/right details. The chart stores samples per server while
Electorrent is open, keeps fine samples for an hour, minute samples thereafter,
and draws at most 600 points. It does not claim to record while the application
is closed or install/change the Deluge Deck daemon plugin. Deluge's existing
snapshot supplies session network statistics; other clients show unavailable
session-only fields as a dash.

## Verification

- Production webpack build succeeds (existing bundle-size warnings).
- ESLint succeeds. The combined lint/typecheck command still reports existing
  Axios parameter inference errors in the unrelated Synology client.
- Standard headless smoketest attempted: its setup is blocked by missing Docker
  and an unavailable matching ChromeDriver executable.
- Live Electron sweep: all 38 choices render, torrent rows remain present,
  artwork loads, and table viewports fit vertically; no renderer exceptions.
- Direct D and forward cycling were checked in the running app. Additional
  placement, resize and shortcut edge cases still warrant manual use.
- Column grips are half as tall and thick with 20% transparency; their full
  resize hit targets remain available.

This is a desktop adaptation of the actual theme source, not a claim that every
pixel of the React web application is identical. Web-only authentication,
Deluge plugin packaging and mobile navigation are not substituted for
Electorrent's desktop connection/client architecture.
