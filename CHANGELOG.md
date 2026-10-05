# Changes since the Electorrent fork

## 2.19.0 — Torrent-Deck identity and file opening

- New Torrent-Deck name, layered-deck icon, macOS bundle ID, Windows executable and handler registration, Linux desktop entry, and separate settings folder.
- Migrate existing fork profiles and certificates without modifying their original copies.
- macOS uses the current NSWorkspace default-app API and verifies the selected installed path; the deprecated API could report success while leaving the old app selected.
- Reclaim torrent file associations on installed macOS/Linux launches; Windows registers capabilities and offers the required Default Apps selection. Help provides a repeatable default-app setup command.
- Version-aware handler registration avoids replacing a recorded newer installation with an older Torrent-Deck copy. When a newer version starts while an older Torrent-Deck instance is running, the older instance relaunches the newer executable.
- Opening a torrent retains the actual file bytes even when optional preview metadata cannot be parsed. Deluge decides whether the file is supported.
- Updated README, explicit upstream author/contributor credits, and a downloadable icon archive attached to releases.

## 2.18.4 — interface, updates, and Deluge upload repairs

- Deluge torrent files use authenticated core JSON-RPC and preserve server defaults. Failed adds display errors and retain files for retry.
- GitHub update dialog shows installed/latest versions, progress, failures, and download actions. Unsigned macOS builds use manual DMG installation.
- Darkhand toolbar, centered search, themed start/pause controls, details docking, sidebar collapse/padding, theme picker, and panel layout repairs.
- Terminal collapsed-sidebar repairs and a bottom selection action menu across all 38 themes.
- Torrent-only versus torrent-and-data removal options; row details separate from checkbox selection; close/Escape restore details layout.
- Double-click column dividers to fit contents and explicit checking, verifying, queued, paused, stopped, seeding, and error states.
- Deck artwork/reference synchronization through 1.0.95 (`39b5882`), including Forest artwork and progress effects, seasonal and sports themes, optimized previews, and bundled local assets.
- Client connection port validation and aria2 JSON-RPC endpoint fixes already incorporated before testing was restricted to Deluge.
- Client integration tests now target Deluge only. Shared Windows/macOS/Linux source remains maintained; only macOS installers are compiled during refinement.

## 2.18.0–2.18.3 — initial fork development

- Modernized Electron/TypeScript code, isolated preload/IPC APIs, client integrations, and platform startup behavior.
- Multi-client Deck-inspired themed interface, customizable columns, bulk actions, notifications, torrent details, file priorities/selection where supported, saved upload locations, and transfer history.
- Theme gallery, five redesigned core styles, seasonal/sports themes, and locally bundled artwork.
- Fork-owned GitHub release/update pipeline, unsigned macOS packaging, asset names identifying their OS and architecture, and separate remote-client test profiles.

The original Electorrent supplied the app's foundational remote-client functionality. See [CREDITS.md](CREDITS.md) and Git history for attribution and detailed implementation history.
