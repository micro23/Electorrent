/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS VM harness supplies mocked native Electron modules. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { EventEmitter } = require('node:events')
const ts = require('typescript')
const yaml = require('js-yaml')

function fixture(packaged = true, macRelease) {
  const updater = new EventEmitter()
  let checks = 0
  let installs = 0
  updater.checkForUpdates = async () => { checks++ }
  updater.quitAndInstall = () => { installs++ }
  const statuses = []
  const downloads = []
  const window = {
    webContents: {
      send: (_channel, status) => statuses.push(status),
      downloadURL: url => downloads.push(url),
      session: new EventEmitter(),
    },
    setProgressBar() {},
    isDestroyed: () => false,
  }
  const modules = {
    electron: { app: { isPackaged: packaged, getVersion: () => '2.17.1', getAppPath: () => '/mock-app' } },
    'electron-updater': { autoUpdater: updater },
    '@shared/ipc': { IPC_CHANNELS: { updates: { status: 'status' }, notifications: { push: 'notify' } } },
    './electorrent': { getWindow: () => null },
    './logger': { error() {}, verbose() {} },
    fs: { ...fs, readFileSync: filename => filename === '/mock-app/package.json' ? JSON.stringify({ manualMacUpdates: true }) : fs.readFileSync(filename) },
    request: (_url, callback) => callback(null, { statusCode: 200 }, JSON.stringify(macRelease || { name: '99.0.0', url: 'http://localhost/download' })),
  }
  const source = fs.readFileSync('src/main/lib/update.ts', 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
  const exports = {}
  vm.runInNewContext(compiled, { exports, require: name => modules[name] || require(name), process: { env: {}, platform: macRelease ? 'darwin' : 'win32', arch: 'arm64' } })
  return { api: exports, updater, window, statuses, downloads, checks: () => checks, installs: () => installs }
}

test('packaged updater downloads stable releases and sends installable metadata', () => {
  const f = fixture()
  f.api.initialise(f.window)
  assert.equal(f.updater.autoDownload, true)
  assert.equal(f.updater.autoInstallOnAppQuit, true)
  assert.equal(f.updater.allowPrerelease, false)
  assert.equal(f.updater.allowDowngrade, false)
  f.api.checkForUpdates(true)
  assert.equal(f.checks(), 1)
  const info = { version: '2.18.0', releaseDate: '2026-10-04', releaseNotes: 'New release' }
  f.updater.emit('update-available', info)
  f.updater.emit('update-downloaded', info)
  const status = f.statuses.at(-1)
  assert.equal(status.type, 'downloaded')
  assert.equal(status.data.manual, false)
  assert.equal(status.data.releaseName, '2.18.0')
  assert.equal(status.data.updateUrl, 'https://github.com/micro23/Electorrent/releases')
  f.api.quitAndInstall()
  assert.equal(f.installs(), 1)
})

test('development builds skip network update checks', () => {
  const f = fixture(false)
  f.api.initialise(f.window)
  f.api.checkForUpdates(true)
  assert.equal(f.checks(), 0)
  assert.equal(f.statuses.at(-1).type, 'error')
})

test('explicit legacy test feed still downloads without invoking native updater', () => {
  const f = fixture(false)
  f.api.initialise(f.window, 'http://localhost/update')
  f.api.checkForUpdates(true)
  assert.deepEqual(f.downloads, ['http://localhost/download'])
  assert.equal(f.checks(), 0)
})

test('release configuration points all platforms at the fork and provides updater targets', () => {
  const config = yaml.load(fs.readFileSync('electron-builder.yml', 'utf8'))
  assert.equal(config.publish[0].owner, 'micro23')
  assert.equal(config.publish[0].repo, 'Electorrent')
  assert.equal(config.win.target, 'nsis')
  assert.ok(config.mac.target.some(target => target.target === 'zip'))
  assert.ok(config.linux.target.includes('AppImage'))
})


test('unsigned macOS downloads a compatible DMG and requires manual installation', () => {
  const download = 'https://github.com/micro23/Electorrent/releases/download/v2.18.0/Electorrent-2.18.0-macOS-arm64.dmg'
  const f = fixture(true, {
    tag_name: 'v2.18.0', body: 'Release notes', published_at: '2026-10-04',
    html_url: 'https://github.com/micro23/Electorrent/releases/tag/v2.18.0',
    assets: [{ name: 'Electorrent-2.18.0-macOS-arm64.dmg', browser_download_url: download }],
  })
  f.api.initialise(f.window)
  f.api.checkForUpdates(true)
  assert.deepEqual(f.downloads, [download])
  assert.equal(f.checks(), 0)
  assert.equal(f.statuses.at(-1).data.manual, true)
})

test('unsigned macOS rejects releases without compatible installers', () => {
  const f = fixture(true, { tag_name: 'v2.18.0', assets: [] })
  f.api.initialise(f.window)
  f.api.checkForUpdates(true)
  assert.deepEqual(f.downloads, [])
  assert.equal(f.statuses.at(-1).type, 'error')
})
