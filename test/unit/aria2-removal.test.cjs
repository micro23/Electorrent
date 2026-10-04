/* eslint-disable @typescript-eslint/no-require-imports -- VM harness tests the RPC runtime without a daemon. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

test('removing a magnet also removes the payload created during metadata resolution', async () => {
  class RpcError extends Error { constructor() { super('Not found or not active'); this.code = 1 } }
  const downloads = new Map([
    ['metadata', { gid: 'metadata', status: 'complete', followedBy: ['payload'] }],
    ['payload', { gid: 'payload', status: 'active', following: 'metadata' }],
  ])
  class Transport {
    async call() { return { version: '1.37.0' } }
    async multicall(calls) {
      let fault = false
      const results = calls.map(({ method, params: [gid, keys] }) => {
        const value = downloads.get(gid)
        if (method === 'aria2.tellStatus') {
          return Object.fromEntries(keys.filter(key => key in value).map(key => [key, value[key]]))
        }
        if (method === 'aria2.remove' && value?.status === 'active') {
          value.status = 'removed'
        } else if (method === 'aria2.removeDownloadResult' && value && value.status !== 'active') {
          downloads.delete(gid)
        } else { fault = true }
        return 'OK'
      })
      if (fault) throw new RpcError()
      return results
    }
  }
  const modules = {
    '@main/lib/bittorrent/helpers': { HTTP_LOGIN_TIMEOUT: 10000 },
    './json-rpc': { Aria2JsonRpcTransport: Transport, Aria2RpcError: RpcError },
  }
  const compiled = ts.transpileModule(fs.readFileSync('src/main/lib/bittorrent/clients/aria2/index.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, { exports, require: name => modules[name], setTimeout })
  const runtime = new exports.Aria2Runtime()
  await runtime.connect({})
  await runtime.remove(['metadata'])
  assert.equal(downloads.size, 0, 'Neither the magnet nor its payload should reappear after removal')
})
