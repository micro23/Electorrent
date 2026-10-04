/* eslint-disable @typescript-eslint/no-require-imports -- Load renderer TypeScript models in Node's VM for focused state tests. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '../..')
const modulePaths = {
  '@renderer/app/bittorrent/abstracttorrent': 'src/renderer/app/bittorrent/abstracttorrent.ts',
}

class Column {
  static ALPHABETICAL = 'alphabetical'
  static NATURAL_NUMBER_ASC = 'natural-number-asc'
  constructor(options) { Object.assign(this, options) }
}

function loadTypeScript(relativePath) {
  const filename = path.resolve(root, relativePath)
  const source = fs.readFileSync(filename, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
  const module = { exports: {} }
  const localRequire = (name) => {
    if (name === '@renderer/app/services/column') return { Column }
    const mapped = modulePaths[name]
    if (mapped) return loadTypeScript(mapped)
    throw new Error(`Unexpected dependency in torrent state test: ${name}`)
  }
  vm.runInNewContext(compiled, { exports: module.exports, module, require: localRequire }, { filename })
  return module.exports
}

const { DelugeTorrent } = loadTypeScript('src/renderer/app/bittorrent/deluge/torrentd.ts')
const { Aria2Torrent } = loadTypeScript('src/renderer/app/bittorrent/aria2/torrentaria2.ts')
const { QBittorrentTorrent } = loadTypeScript('src/renderer/app/bittorrent/qbittorrent/torrentq.ts')
const { RtorrentTorrent } = loadTypeScript('src/renderer/app/bittorrent/rtorrent/torrentr.ts')
const { SynologyTorrent } = loadTypeScript('src/renderer/app/bittorrent/synology/synologytorrent.ts')
const { TransmissionTorrent } = loadTypeScript('src/renderer/app/bittorrent/transmission/torrentt.ts')
const { UtorrentTorrent } = loadTypeScript('src/renderer/app/bittorrent/utorrent/torrentu.ts')

test('checking and verifying states stay explicit across supported clients', () => {
  const deluge = new DelugeTorrent('hash', { state: 'Checking', name: 'test', total_wanted: 100, progress: 40 })
  assert.equal(deluge.manualStatusText(), 'Checking')
  assert.equal(deluge.isStatusChecking(), true)
  deluge.state = 'CheckingResumeData'
  assert.equal(deluge.manualStatusText(), 'Checking')

  const aria2 = new Aria2Torrent({ id: '1', status: 'active', totalLength: '100', completedLength: '40', verifyIntegrityPending: true })
  assert.equal(aria2.manualStatusText(), 'Checking')

  const qbittorrent = new QBittorrentTorrent('hash', { state: 'checkingDL', progress: 0.4, name: 'test' })
  assert.equal(qbittorrent.manualStatusText(), 'Checking')
  qbittorrent.state = 'checkingResumeData'
  assert.equal(qbittorrent.manualStatusText(), 'Checking Resume Data')

  const rtorrent = new RtorrentTorrent({ hash: 'hash', name: 'test', size: 100, down_total: 40, hashing: true })
  assert.equal(rtorrent.manualStatusText(), 'Checking')

  const synology = new SynologyTorrent({
    id: 'hash', title: 'test', size: 100, status: 'hash_checking',
    additional: { detail: {}, transfer: { size_downloaded: 40, size_uploaded: 0, speed_download: 1, speed_upload: 0 }, tracker: [] },
  })
  assert.equal(synology.manualStatusText(), 'Checking')

  const transmission = new TransmissionTorrent({ status: 2, error: 0, totalSize: 100, haveValid: 40 })
  assert.equal(transmission.manualStatusText(), 'Verifying')
  transmission.status = 1
  assert.equal(transmission.manualStatusText(), 'Queued to Verify')
  transmission.status = 0
  assert.equal(transmission.manualStatusText(), 'Stopped')
  assert.equal(transmission.isStatusPaused(), true)
  transmission.status = 3
  assert.equal(transmission.manualStatusText(), 'Queued to Download')
  transmission.status = 5
  assert.equal(transmission.manualStatusText(), 'Queued to Seed')
  transmission.status = 6
  assert.equal(transmission.manualStatusText(), 'Seeding')

  const utorrent = new UtorrentTorrent({ hash: 'hash', name: 'test', size: 100, status: 2, percent: 400 })
  assert.equal(utorrent.manualStatusText(), 'Checking')
})

test('queue, pause, and client-specific states are not mislabeled as unknown', () => {
  const deluge = new DelugeTorrent('hash', { state: 'Allocating', name: 'test', total_wanted: 100 })
  assert.equal(deluge.manualStatusText(), 'Allocating')

  const qbittorrent = new QBittorrentTorrent('hash', { state: 'moving', progress: 1, name: 'test' })
  assert.equal(qbittorrent.isStatusCompleted(), true)
  qbittorrent.percent = 400
  assert.equal(qbittorrent.isStatusCompleted(), false)
  assert.equal(qbittorrent.manualStatusText(), 'Moving')
  const qBittorrentStates = {
    allocating: 'Allocating',
    checkingDL: 'Checking',
    checkingResumeData: 'Checking Resume Data',
    checkingUP: 'Checking',
    downloading: 'Downloading',
    error: 'Error',
    forcedDL: 'Downloading (Forced)',
    forcedUP: 'Seeding (Forced)',
    metaDL: 'Fetching Metadata',
    missingFiles: 'Missing Files',
    moving: 'Moving',
    paused: 'Paused',
    pausedDL: 'Paused',
    pausedUP: 'Paused',
    queuedDL: 'Queued',
    queuedUP: 'Queued',
    stalledDL: 'Stalled',
    stalledUP: 'Seeding (Stalled)',
    stopped: 'Stopped',
    stoppedDL: 'Stopped',
    stoppedUP: 'Stopped',
    unknown: 'Unknown',
    uploading: 'Seeding',
  }
  for (const [state, label] of Object.entries(qBittorrentStates)) {
    qbittorrent.state = state
    assert.equal(qbittorrent.manualStatusText(), label, `qBittorrent state ${state}`)
  }

  const utorrentQueued = new UtorrentTorrent({ hash: 'hash', name: 'test', size: 100, status: 64, percent: 400 })
  assert.equal(utorrentQueued.manualStatusText(), 'Queued')
  assert.equal(utorrentQueued.isStatusDownloading(), false)
})
