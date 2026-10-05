# Releases and automatic updates

Installed builds check public GitHub Releases on `micro23/Torrent-Deck`. Windows uses electron-updater with NSIS and the `latest.yml`, installer, and blockmap assets. After you approve an update, it downloads and launches the installer. macOS downloads the matching architecture ZIP and opens it so you can move the extracted app into Applications to replace Torrent-Deck. The previously published unsigned macOS builds can be blocked by Gatekeeper as damaged. Future macOS releases must be signed with Developer ID and notarized by Apple before upload. Linux packaging remains configured but is not included in these releases. Development builds skip production checks. The `--update-url` override retains the legacy JSON downloader for local tests.

Windows releases contain one NSIS installer and the `latest.yml` and blockmap metadata required for in-app updates. Signed macOS releases contain a Universal ZIP that supports both Intel and Apple Silicon; the macOS updater selects the compatible, signed and notarized ZIP directly from the release. If macOS signing credentials are unavailable, the workflow skips macOS artifacts and can still publish the Windows release. GitHub also adds source-code archives automatically. Existing installations using the old repository URL follow GitHub’s rename redirect; new release builds and update checks use `micro23/Torrent-Deck`.

Choose **Check for Updates** in Help or the Settings → General update card. The dialog displays the installed version and latest stable GitHub version, reports checking and error states, and offers **Download Update** when a newer version exists. On Windows, choose **Quit And Install** after download. On macOS, choose **Open Downloaded ZIP**, extract the app, and replace Torrent-Deck in Applications.

## Publish a release

1. Increase the version in `package.json`; synchronize `app/package.json` and `package-lock.json` too.
2. Commit the finished code and push a matching tag, for example `v2.19.1` for version `2.19.1`.
3. GitHub Actions runs Deluge tests and builds the Windows installer and update metadata. When the GitHub Actions secrets `MACOS_CSC_LINK` (base64 Developer ID Application `.p12`), `MACOS_CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` are configured, it also builds the Universal macOS ZIP and verifies its signature, Gatekeeper assessment, and stapled ticket. Without those credentials, macOS packaging is skipped and the Windows release can proceed.
4. Review and publish the release. Keep the Universal macOS ZIP when produced, plus the Windows NSIS installer, `latest.yml`, and blockmap; the updaters need them. An empty release or source-only tag cannot update installed apps.

macOS releases are signed with Developer ID and notarized by Apple; installing an update remains a manual ZIP extraction and app replacement. Windows SmartScreen may warn about the unsigned installer; NSIS update metadata and SHA-512 asset verification are still enabled. Pull requests and manual workflow runs build artifacts without publishing releases.

The release repository must be publicly readable. No GitHub access token is embedded in the app. Drafts and prereleases are excluded from stable updates. A new release version must be higher than the installed version; downgrades are disabled.

## Validation

Run `npm run lint`, `npm run build`, and focused Deluge tests: `npm test -- --client deluge:2 --spec test/specs/standard/torrent-uploads.spec.ts --headless`.

CI defaults to Deluge 2 only. Do not run other client tests until explicitly requested. Cross-platform source and packaging configurations remain maintained. macOS release jobs verify Gatekeeper acceptance and notarization; Windows SmartScreen prompts still require manual verification.

## Torrent-Deck identity

The repository and update feed are `micro23/Torrent-Deck`. The application, bundle ID, executable, installer names, and icons use Torrent-Deck from 2.19.0. Install Torrent-Deck once and launch it to migrate profiles and register .torrent files. See [file-opening instructions](file-associations.md).
