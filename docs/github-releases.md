# Releases and automatic updates

Installed builds check public GitHub Releases on `micro23/Torrent-Deck`. Windows uses electron-updater with NSIS and the `latest.yml`, installer, and blockmap assets. After you approve an update, it downloads and launches the installer. macOS builds are unsigned, so they check GitHub, download the matching DMG, and open it for you to replace Torrent-Deck in Applications. Native silent installation on macOS requires Apple signing credentials. Linux packaging remains configured but is not included in these releases. Development builds skip production checks. The `--update-url` override retains the legacy JSON downloader for local tests.

Windows releases contain an NSIS installer and `latest.yml`; macOS releases contain DMGs, ZIPs, blockmaps, and `latest-mac.yml`. The shared configuration also retains Linux AppImage, DEB, RPM, and Snap targets. Snap installations are managed by snapd. Existing installations using the old repository URL follow GitHub’s rename redirect; new release builds and update checks use `micro23/Torrent-Deck`.

Choose **Check for Updates** in Help or the Settings → General update card. The dialog displays the installed version and latest stable GitHub version, reports checking and error states, and offers **Download Update** when a newer version exists. On Windows, choose **Quit And Install** after download. On macOS, choose **Open Downloaded Installer** and replace Torrent-Deck in Applications.

## Publish a release

1. Increase the version in `package.json`; the existing `npm version` script synchronizes `app/package.json`.
2. Commit the finished code and push a matching tag, for example `v2.19.1` for version `2.19.1`.
3. GitHub Actions runs Deluge tests and builds macOS and Windows installers. The macOS job creates unsigned DMGs and ZIPs; the Windows job creates the NSIS installer and update manifest. All jobs must succeed before it creates or updates a **draft** GitHub release.
4. Review and publish the draft. Keep `latest*.yml`, ZIPs, installers, and blockmaps attached; the updaters need them. An empty release or source-only tag cannot update installed apps.

The current workflow publishes unsigned macOS and Windows builds. macOS may require you to allow the unsigned app in System Settings; installing its update remains a manual DMG replacement. Native macOS automatic installation requires Developer ID signing and notarization. Windows SmartScreen may warn about the unsigned installer; NSIS update metadata and SHA-512 asset verification are still enabled. Pull requests and manual workflow runs build artifacts without publishing releases.

The release repository must be publicly readable. No GitHub access token is embedded in the app. Drafts and prereleases are excluded from stable updates. A new release version must be higher than the installed version; downgrades are disabled.

## Validation

Run `npm run lint`, `npm run build`, and focused Deluge tests: `npm test -- --client deluge:2 --spec test/specs/standard/torrent-uploads.spec.ts --headless`.

CI defaults to Deluge 2 only, and macOS and Windows build jobs produce unsigned installers. Do not run other client tests until explicitly requested. Cross-platform source and packaging configurations remain maintained. Integration tests cannot verify macOS Gatekeeper behavior or Windows SmartScreen prompts.

## Torrent-Deck identity

The repository and update feed are `micro23/Torrent-Deck`. The application, bundle ID, executable, installer names, and icons use Torrent-Deck from 2.19.0. Install Torrent-Deck once and launch it to migrate profiles and register .torrent files. Releases include `Torrent-Deck-Icons.zip`. See [file-opening instructions](file-associations.md).
