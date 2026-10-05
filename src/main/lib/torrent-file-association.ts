import { app, shell } from 'electron'
import { execFile } from 'child_process'
import path from 'path'
import fs from 'fs'
import semver from 'semver'
import { promisify } from 'util'

const executeFile = promisify(execFile)

// Use macOS's bundled JavaScript bridge so installed apps need no extra runtime.
// Resolve the extension too: existing installations may have a dynamic UTI.
const reclaimTorrentScript = `
ObjC.import('Foundation');
ObjC.import('CoreServices');
function run(argv) {
    var bundle = $.NSBundle.bundleWithPath(argv[0]);
    var bundleId = ObjC.unwrap(bundle.bundleIdentifier);
    if (!bundleId) throw new Error('Application bundle has no identifier');
    var registration = $.LSRegisterURL(bundle.bundleURL, true);
    if (registration !== 0) throw new Error('Launch Services registration failed: ' + registration);
    var preferred = $.UTTypeCreatePreferredIdentifierForTag($.kUTTagClassFilenameExtension, $('torrent'), null);
    var types = ['org.bittorrent.torrent'];
    if (preferred) types.push(ObjC.unwrap(ObjC.castRefToObject(preferred)));
    types.forEach(function(type) {
        var current = $.LSCopyDefaultRoleHandlerForContentType($(type), 0xffffffff);
        if (current && ObjC.unwrap(ObjC.castRefToObject(current)) === bundleId) return;
        var status = $.LSSetDefaultRoleHandlerForContentType($(type), 0xffffffff, $(bundleId));
        if (status !== 0) throw new Error('Could not claim ' + type + ': ' + status);
    });
}
`

const FILE_PROG_ID = 'TorrentDeck.torrent'
const DESKTOP_ID = 'com.github.micro23.torrentdeck.desktop'

function powershellLiteral(value: string) {
    return "'" + value.replace(/'/g, "''") + "'"
}

export function desktopExec(executable: string) {
    if (/[\r\n]/.test(executable)) throw new Error('Invalid application path')
    return '"' + executable.replace(/[\\"`$]/g, '\\$&').replace(/%/g, '%%') + '" %F'
}

export async function reclaimTorrentFileAssociation(force = false): Promise<string> {
    if (!app.isPackaged) {
        if (force) throw new Error('Install the packaged Torrent-Deck app to register torrent files.')
        return 'development'
    }
    const marker = path.join(app.getPath('userData'), 'torrent-file-handler.json')
    try {
        const previous = JSON.parse(await fs.promises.readFile(marker, 'utf8'))
        if (semver.valid(previous.version) && semver.gt(previous.version, app.getVersion())
            && typeof previous.executable === 'string' && fs.existsSync(previous.executable)) return 'newer-version'
    } catch { /* First registration, or the recorded installation was removed. */ }

    let result = 'registered'
    if (process.platform === 'darwin') {
        const bundlePath = path.resolve(path.dirname(process.execPath), '..', '..')
        await executeFile('/usr/bin/osascript', ['-l', 'JavaScript', '-e', reclaimTorrentScript, bundlePath], {
            timeout: 10000, maxBuffer: 64 * 1024,
        })
    } else if (process.platform === 'win32') {
        // Register capabilities and an executable-specific handler; never alter Windows UserChoice hashes.
        const script = String.raw`
$ErrorActionPreference = 'Stop'
$exe = ${powershellLiteral(process.execPath)}
$prog = ${powershellLiteral(FILE_PROG_ID)}
$classes = 'HKCU:\Software\Classes'
$capabilities = 'HKCU:\Software\Torrent-Deck\Capabilities'
New-Item -Path "$classes\$prog\shell\open\command" -Force | Out-Null
Set-Item -Path "$classes\$prog" -Value 'Torrent-Deck Torrent'
Set-Item -Path "$classes\$prog\shell\open\command" -Value ('"' + $exe + '" "%1"')
New-Item -Path "$classes\$prog\DefaultIcon" -Force | Out-Null
Set-Item -Path "$classes\$prog\DefaultIcon" -Value ('"' + $exe + '",0')
New-Item -Path "$classes\.torrent\OpenWithProgids" -Force | Out-Null
New-ItemProperty -Path "$classes\.torrent\OpenWithProgids" -Name $prog -Value '' -PropertyType String -Force | Out-Null
New-Item -Path "$capabilities\FileAssociations" -Force | Out-Null
New-ItemProperty -Path $capabilities -Name ApplicationName -Value 'Torrent-Deck' -PropertyType String -Force | Out-Null
New-ItemProperty -Path $capabilities -Name ApplicationDescription -Value 'Manage torrents with Torrent-Deck' -PropertyType String -Force | Out-Null
New-ItemProperty -Path "$capabilities\FileAssociations" -Name '.torrent' -Value $prog -PropertyType String -Force | Out-Null
New-Item -Path 'HKCU:\Software\RegisteredApplications' -Force | Out-Null
New-ItemProperty -Path 'HKCU:\Software\RegisteredApplications' -Name 'Torrent-Deck' -Value 'Software\Torrent-Deck\Capabilities' -PropertyType String -Force | Out-Null
$choice = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.torrent\UserChoice' -ErrorAction SilentlyContinue
if ($choice.ProgId -eq $prog) { 'registered' } else { 'choose-in-settings' }
`
        const encoded = Buffer.from(script, 'utf16le').toString('base64')
        const response = await executeFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], { timeout: 10000 })
        result = response.stdout.trim()
        const prompted = path.join(app.getPath('userData'), 'torrent-default-apps-prompted')
        if (result === 'choose-in-settings' && (force || !fs.existsSync(prompted))) {
            await shell.openExternal('ms-settings:defaultapps?registeredAppUser=Torrent-Deck')
            await fs.promises.writeFile(prompted, '')
        }
    } else if (process.platform === 'linux') {
        const dataHome = process.env.XDG_DATA_HOME || path.join(app.getPath('home'), '.local', 'share')
        const applications = path.join(dataHome, 'applications')
        const executable = process.env.APPIMAGE || (process.env.SNAP ? '/snap/bin/torrent-deck' : process.execPath)
        const desktop = `[Desktop Entry]\nType=Application\nName=Torrent-Deck\nExec=${desktopExec(executable)}\nIcon=${path.join(process.resourcesPath, 'torrent-deck.png')}\nTerminal=false\nCategories=Network;FileTransfer;P2P;\nMimeType=application/x-bittorrent;x-scheme-handler/magnet;\n`
        await fs.promises.mkdir(applications, { recursive: true })
        await fs.promises.writeFile(path.join(applications, DESKTOP_ID), desktop)
        await executeFile('xdg-mime', ['default', DESKTOP_ID, 'application/x-bittorrent'], { timeout: 10000 })
        const current = await executeFile('xdg-mime', ['query', 'default', 'application/x-bittorrent'], { timeout: 10000 })
        if (current.stdout.trim() !== DESKTOP_ID) throw new Error('Your desktop did not set Torrent-Deck as the torrent handler. Use Open With → Torrent-Deck.')
    }
    await fs.promises.writeFile(marker, JSON.stringify({ version: app.getVersion(), executable: process.execPath }))
    return result
}
