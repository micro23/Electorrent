import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Use Node's fetch so WDIO's older Undici does not mix dispatchers with Node 26.
const child = spawn(process.execPath, [
    fileURLToPath(new URL('../node_modules/@wdio/cli/bin/wdio.js', import.meta.url)),
    'run', './wdio.conf.ts', ...process.argv.slice(2),
], {
    stdio: 'inherit',
    env: { ...process.env, WDIO_USE_NATIVE_FETCH: '1' },
})
child.on('error', (error) => {
    console.error(error.message)
    process.exitCode = 1
})
child.on('exit', (code) => { process.exitCode = code ?? 1 })
