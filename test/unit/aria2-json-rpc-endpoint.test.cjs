/* eslint-disable @typescript-eslint/no-require-imports -- VM harness tests the JSON-RPC endpoint without a daemon. */
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const https = require('node:https')
const ts = require('typescript')

function loadTransport(requests) {
  const axios = {
    isAxiosError: () => false,
    create: () => ({
      post: async (url, request) => {
        requests.push(url)
        return { data: { id: request.id, result: 'ok' } }
      },
    }),
  }
  const modules = {
    axios: { __esModule: true, default: axios },
    'axios/lib/adapters/http.js': { __esModule: true, default: () => {} },
    'node:https': https,
    '@main/lib/bittorrent/helpers': {
      HTTP_REQUEST_TIMEOUT: 10000,
      serverUrl: (server, endpoint) => {
        const url = new URL(`http://${server.ip}:${server.port}`)
        url.pathname = [server.path, endpoint].filter(Boolean).join('/').replace(/\/{2,}/g, '/')
        return url.toString().replace(/\/$/, '')
      },
    },
  }
  const compiled = ts.transpileModule(fs.readFileSync('src/main/lib/bittorrent/clients/aria2/json-rpc.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, { exports, require: name => modules[name], Buffer, URL })
  return exports.Aria2JsonRpcTransport
}

test('aria2 JSON-RPC calls use the default endpoint and avoid duplicating an explicit endpoint', async () => {
  const requests = []
  const Transport = loadTransport(requests)

  await new Transport({ ip: '127.0.0.1', port: 16800, path: '' }).call('aria2.getVersion')
  await new Transport({ ip: '127.0.0.1', port: 16800, path: '/jsonrpc' }).call('aria2.getVersion')

  assert.deepEqual(requests, [
    'http://127.0.0.1:16800/jsonrpc',
    'http://127.0.0.1:16800/jsonrpc',
  ])
})
