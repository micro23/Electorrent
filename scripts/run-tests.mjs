import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

// macOS may block a ChromeDriver child from reading a project in Documents.
// Run the already-built app from a disposable copy outside protected folders.
const stagedApp = process.platform === 'darwin'
    && !process.argv.includes('--dist') && !process.env.ELECTORRENT_TEST_APP
    ? mkdtempSync(path.join(tmpdir(), 'electorrent-staged-')) : undefined
if (stagedApp) cpSync(fileURLToPath(new URL('../app', import.meta.url)), stagedApp, { recursive: true })

// Use Node's fetch so WDIO's older Undici does not mix dispatchers with Node 26.
const child = spawn(process.execPath, [
    fileURLToPath(new URL('../node_modules/@wdio/cli/bin/wdio.js', import.meta.url)),
    'run', './wdio.conf.ts', ...process.argv.slice(2),
], {
    stdio: 'inherit',
    env: { ...process.env, WDIO_USE_NATIVE_FETCH: '1',
        ...(stagedApp ? { ELECTORRENT_TEST_APP: stagedApp } : {}),
    },
})
child.on('error', (error) => {
    console.error(error.message)
    process.exitCode = 1
})
child.on('exit', (code) => {
    if (stagedApp) rmSync(stagedApp, { recursive: true, force: true })
    process.exitCode = code ?? 1
})
