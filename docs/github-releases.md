# Releases and automatic updates

Installed builds check public GitHub Releases on `micro23/Electorrent` using electron-updater. The current release pipeline publishes macOS packages only. These unsigned macOS builds can check GitHub and download a compatible DMG for manual installation. Windows and Linux packaging and automatic installation are deferred while macOS support is stabilized. Development builds skip production checks. The `--update-url` override retains the legacy JSON downloader for local tests.

The electron-builder configuration retains Windows NSIS and Linux AppImage, DEB, RPM, and Snap targets for future releases; only macOS DMG and ZIP installers are built currently. Snap installations are managed by snapd. Users of upstream builds must install our fork once to switch update sources.

Choose **Check for Updates** in Help or the Settings → General update card. The dialog displays the installed version and latest stable GitHub version, reports checking and error states, and offers **Download Update** when a newer version exists. After an unsigned macOS download finishes, choose **Open Downloaded Installer** and drag Electorrent into Applications. Other installer-supported platforms offer **Quit And Install** after download when their release builds resume.

## Publish a release

1. Increase the version in both `package.json` and `app/package.json` (the existing `npm version` script synchronizes the app version).
2. Commit the finished code and push a matching tag, for example `v2.18.4` for version `2.18.4`.
3. GitHub Actions runs the client tests from source and builds macOS installers only during the current refinement period. Windows and Linux configurations remain available for later releases. All jobs must succeed before it creates or updates a **draft** GitHub release.
4. Review the draft, test the installers, then publish it. Keep the generated `latest*.yml`, ZIPs, installers, and blockmaps attached; the updater needs them. An empty release or source-only tag cannot update installed apps.

The current workflow publishes unsigned macOS builds with `manualMacUpdates: true` in packaged metadata. macOS may require the user to allow the unsigned app in System Settings. To enable native macOS automatic installation later, configure Developer ID signing and notarization in CI, remove `--config.mac.identity=null`, and omit the manual-update metadata flag for signed builds. Windows signing can be configured separately. Pull requests and manual workflow runs build artifacts without publishing releases.

The release repository must be publicly readable. No GitHub access token is embedded in the app. Drafts and prereleases are excluded from stable updates. A new release version must be higher than the installed version; downgrades are disabled.

## Validation

Run `npm run lint`, `npm run build`, and focused Deluge tests: `npm test -- --client deluge:2 --spec test/specs/standard/torrent-uploads.spec.ts --headless`.

CI defaults to Deluge 2 only, and the macOS build job produces unsigned installers. Do not run other client tests until explicitly requested. Cross-platform source and packaging configurations remain maintained. Integration tests cannot verify macOS Gatekeeper behavior or an older-to-newer manual DMG installation. Windows and Linux installer upgrades should be tested when release builds for those systems resume.
