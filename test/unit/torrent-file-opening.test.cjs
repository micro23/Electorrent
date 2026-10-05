/* eslint-disable @typescript-eslint/no-require-imports -- File launch serialization is tested independently from client daemons. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

test('a .torrent file still reaches the upload queue when its optional preview cannot be parsed', async () => {
  const bytes = Buffer.from('torrent data supported by the remote client')
  const modules = {
    electron: {}, '@shared/ipc': {}, './electorrent': {}, './notify': {},
    fs: { promises: { stat: async () => ({ isFile: () => true, size: bytes.length }), readFile: async () => bytes } },
    'parse-torrent': () => { throw Error('Unsupported metadata version') },
  }
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync('src/main/lib/torrents.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  vm.runInNewContext(source, { exports, Buffer, Uint8Array, setTimeout: callback => callback(), require: name => modules[name] || require(name) })
  const torrent = await exports.serializeTorrentFile('/downloads/example.torrent', true)
  assert.equal(torrent.filename, 'example.torrent')
  assert.deepEqual(Buffer.from(torrent.data), bytes)
  assert.equal(torrent.sourcePath, '/downloads/example.torrent')
  assert.equal(torrent.metadata, undefined)
})
