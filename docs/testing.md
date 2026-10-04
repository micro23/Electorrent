# Running checks

From the Electorrent directory:

```sh
npm run lint
npm run build
npm run smoketest
```

The local smoke test launches real, hidden Electron windows with the mock torrent
client. It checks headless startup and stopping/resuming selected torrents.
It needs no Docker and does not connect to your saved servers.

Tests use disposable settings/profile directories. On macOS the runner copies
`app/` to a temporary directory to avoid Documents-folder access restrictions
in ChromeDriver children. It removes that copy when the run ends. Rebuild before
running tests so the copy contains your latest code. ChromeDriver is downloaded
and cached by WebdriverIO; the runner uses Node's native fetch for compatibility
with Node 26. The repository's `.nvmrc` and CI still specify Node 22.

## Real client integration

```sh
npm run smoketest:integration
```

This is the original qBittorrent Docker smoke test. It requires a running Docker
engine and Docker Compose. Check them with `docker info` and
`docker compose version` before running it. Passing the local smoke test does
not establish that a real qBittorrent backend passed integration testing.

The runner selects the native Electron binary explicitly. On macOS its small
launcher starts in the temporary directory so the Node inspector can resolve
its working directory without stalling on a protected folder.
