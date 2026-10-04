<p align="center">
  <img src="assets/electron-icon.png" width="256">
</p>
<p align="center">
  <a href="https://github.com/micro23/Electorrent/actions/workflows/electorrent-workflow.yml"><img src="https://github.com/micro23/Electorrent/actions/workflows/electorrent-workflow.yml/badge.svg"></a>
  <a href="https://github.com/micro23/Electorrent/releases"><img src="https://img.shields.io/github/release/micro23/Electorrent.svg?maxAge=86400"></a>
  <a href="https://github.com/micro23/Electorrent/releases"><img src="https://img.shields.io/github/downloads/micro23/Electorrent/total.svg?maxAge=86400"></a>
</p>

# Electorrent

This fork adds the Deck interface and updates hosted by [micro23/Electorrent](https://github.com/micro23/Electorrent). Based on [tympanix/Electorrent](https://github.com/tympanix/Electorrent), under GPL-3.0.
No more! Stop copy/pasting magnet links and uploading torrent files through a tedious webinterface. Electorrent is your new desktop remote torrenting application. Remote control your NAS, VPS, seedbox - you name it.

## Support
Electorrent can connect to the following bittorrent clients:
* [µTorrent](http://www.utorrent.com/)
* [qBittorrent](http://www.qbittorrent.org/) (v3.2.x and above)
* [Transmission](https://transmissionbt.com)
* [rTorrent](https://rakshasa.github.io/rtorrent/)
* [Synology Download Station](https://www.synology.com/en-global/knowledgebase/DSM/help/DownloadStation/DownloadStation_desc)
* [Deluge](https://deluge-torrent.org/)

## Downloads
Download Windows, macOS, and Linux installers from [this fork’s GitHub Releases](https://github.com/micro23/Electorrent/releases).

The first release is a preview while the full client integration suite is being repaired. Install this fork manually once to switch update sources. Builds are unsigned; macOS updates download a DMG for manual installation. Stable Windows and supported Linux releases support in-app updates. See [release instructions](docs/github-releases.md).

## Features
- [x] Connects to your favorite torrent client
- [x] Handles the magnet link protocol when browsing websites
- [x] Upload local torrent files by browsing your filesystem (Ctrl/Cmd+O)
- [x] Drag-and-drop support for torrent files
- [x] Paste magnet links directly from your clipboard (Ctrl/Cmd+I)
- [x] Quickly change between multiple server configurations
- [x] Native desktop notifications
- [x] Fuzzy searching of torrents
- [x] Built in certificate trust system (for self-signed certificates)
- [x] Easy one click installer using Squirrel framework
- [x] Automatic updates straight from the GitHub repository!

## Screenshots
<p align="center">
  <a href="https://github.com/tympanix/Electorrent/blob/master/assets/screen0.png?raw=true">
    <img src="assets/screen0.png" width="75%">
  </a>
</p>
<p align="center">
  <a href="https://github.com/tympanix/Electorrent/blob/master/assets/screen1.png?raw=true">
    <img src="assets/screen1.png" width="75%">
  </a>
</p>
<p align="center">
  <a href="https://github.com/tympanix/Electorrent/blob/master/assets/screen2.png?raw=true">
    <img src="assets/screen2.png" width="75%">
  </a>
</p>

## FAQ
 * **Your program sucks. It doesn't support my bittorrent client**

 What an opportunity! Now open an issue telling me which bittorrent client you would like to see next :)

 * **What kind of technologies are used to build this?**

 The application is built around [Electron](https://www.electronjs.org/), [AngularJS](https://angularjs.org/) and [Fomantic UI](https://fomantic-ui.com/).

* **I can't connect to rTorrent what is wrong?**

 When using rTorrent you have to configure your http server correctly. Follow [this guide](https://github.com/rakshasa/rtorrent/wiki/RPC-Setup-XMLRPC) to make sure you have it set up correctly. Alternative you may be able to use `/plugins/httprpc/action.php` as the path if your have the HTTPRPC plugin installed.
