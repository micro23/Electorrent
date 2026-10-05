# Credits and provenance

Torrent-Deck is an independent continuation of [Electorrent](https://github.com/tympanix/Electorrent), created by **tympanix**. The original app, client integrations, architecture, and substantial inherited code belong to their original authors. Renaming the application does not transfer or erase that authorship. Original copyright notices and Git history are preserved, and the project remains licensed under [GPL-3.0](LICENSE).

## Original Electorrent contributors

The following accounts appear in the original repository's GitHub contributor history at the time of this release. This list supplements, rather than replaces, authorship in the full [original commit history](https://github.com/tympanix/Electorrent/commits/master/) and [contributors page](https://github.com/tympanix/Electorrent/graphs/contributors), including contributors not attributed to a GitHub account.

- [tympanix](https://github.com/tympanix)
- [dependabot[bot]](https://github.com/apps/dependabot)
- [paaff](https://github.com/paaff)
- [Copilot](https://github.com/apps/copilot-swe-agent)
- [UnKnoWn-Consortium](https://github.com/UnKnoWn-Consortium)
- [reedy](https://github.com/reedy)
- [Charley-Peng](https://github.com/Charley-Peng)
- [lewisl9029](https://github.com/lewisl9029)
- [enchained](https://github.com/enchained)
- [brandom](https://github.com/brandom)
- [chid](https://github.com/chid)
- [firefly2442](https://github.com/firefly2442)
- [userwiths](https://github.com/userwiths)
- [OrcaXS](https://github.com/OrcaXS)
- [dvuvud](https://github.com/dvuvud)
- [top1105](https://github.com/top1105)

## Design and new work

- [micro23/Deluge Deck](https://github.com/micro23/deluge-deck): the separate theme and artwork reference. Torrent-Deck imports adaptations into this repository; the reference project is not modified.
- Torrent-Deck's layered-deck application icon and packaging variants are new assets maintained in this fork, with the editable source at `assets/torrent-deck.svg` and regeneration script at `scripts/generate-brand-icons.py` (requires Pillow).
- Theme artwork provenance and source links are retained in [sports artwork credits](docs/art/sports-heritage-sources.md) and [Deck synchronization notes](docs/deluge-deck-sync.md).

## Dependencies and torrent clients

Credit also belongs to Electron, AngularJS, Fomantic UI, WebdriverIO, electron-builder, electron-updater, and all dependency authors. Their individual licenses and notices remain in the distributed dependencies. The maintained client integrations depend on Deluge, qBittorrent, Transmission, rTorrent, µTorrent, Synology Download Station, and aria2 and their contributors. Client and sports names belong to their respective owners.

Torrent-Deck is not an official Electorrent release and does not imply endorsement by its original authors or any client or artwork owner.
