# Releases and automatic updates

Installed builds check public GitHub Releases on `micro23/Electorrent` using electron-updater. Windows and supported Linux updates download automatically and install on normal quit or through the existing update dialog. Unsigned macOS builds check GitHub and download a compatible DMG for manual installation. Development builds skip production checks. The `--update-url` override retains the legacy JSON downloader for local tests.

Windows now uses NSIS, macOS includes DMG and ZIP builds, and Linux includes AppImage, DEB, RPM, and Snap. Snap installations are managed by snapd. Users of old Squirrel Windows builds must install the first NSIS release manually. Users of upstream builds must install our fork once to switch update sources.

## Publish a release

1. Increase the version in both `package.json` and `app/package.json` (the existing `npm version` script synchronizes the app version).
2. Commit the finished code and push a matching tag, for example `v2.18.1` for version `2.18.1`.
3. GitHub Actions runs the client tests and builds Windows, macOS, and Linux installers. All jobs must succeed before it creates or updates a **draft** GitHub release.
4. Review the draft, test the installers, then publish it. Keep the generated `latest*.yml`, ZIPs, installers, and blockmaps attached; the updater needs them. An empty release or source-only tag cannot update installed apps.

The current workflow publishes unsigned macOS builds with `manualMacUpdates: true` in packaged metadata. macOS may require the user to allow the unsigned app in System Settings. To enable native macOS automatic installation later, configure Developer ID signing and notarization in CI, remove `--config.mac.identity=null`, and omit the manual-update metadata flag for signed builds. Windows signing can be configured separately. Pull requests and manual workflow runs build artifacts without publishing releases.

The release repository must be publicly readable. No GitHub access token is embedded in the app. Drafts and prereleases are excluded from stable updates. A new release version must be higher than the installed version; downgrades are disabled.

## Validation

Run `npm run lint`, `npm run build`, `node --test test/unit/github-updater.test.cjs`, and `npm test -- --dist --client mock --spec test/specs/mock/software-update.spec.ts --headless`.

Before shipping, verify a real older-to-newer signed release update on Windows, macOS, and Linux. Local mocked tests cannot verify OS installer behavior or Apple signing.

Release 2.18.1 validation: lint/typechecking, production build, all six updater unit checks, and the packaged download/dialog test (seven checks) passed. Test browser profiles are isolated from the user’s running app. CI gives each spec a fresh profile and allows two isolated backend fixtures per client. Native older-to-newer installer upgrades still require verification on each operating system.

Release 2.18.1 is published as a preview because the complete integration matrix is not yet green. All twelve local interface test files and seven unit checks passed; cross-platform installer builds passed. Stable update feeds exclude this preview. Install it manually to test the fork, and publish a higher stable version after the remaining integration failures are resolved.
