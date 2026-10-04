import { app } from 'electron'
import { execFile } from 'child_process'
import path from 'path'
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

export async function reclaimTorrentFileAssociation() {
    // Development Electron must never take ownership of the user's files.
    if (!app.isPackaged || process.platform !== 'darwin') return

    const bundlePath = path.resolve(path.dirname(process.execPath), '..', '..')
    await executeFile('/usr/bin/osascript', ['-l', 'JavaScript', '-e', reclaimTorrentScript, bundlePath], {
        timeout: 10000,
        maxBuffer: 64 * 1024,
    })
}
