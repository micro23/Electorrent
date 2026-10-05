"""Attach the current application identity to each release without extra dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
(root / 'dist').mkdir(exist_ok=True)
with ZipFile(root / 'dist' / 'Torrent-Deck-Icons.zip', 'w', ZIP_DEFLATED) as archive:
    for source, name in [('assets/torrent-deck.svg', 'Torrent-Deck.svg'),
                         ('assets/torrent-deck.png', 'Torrent-Deck.png'),
                         ('build/icon.icns', 'Torrent-Deck.icns'),
                         ('build/icon.ico', 'Torrent-Deck.ico'),
                         ('LICENSE', 'LICENSE.txt'),
                         ('CREDITS.md', 'CREDITS.md')]:
        archive.write(root / source, name)
    archive.writestr('README.txt', 'Torrent-Deck original identity assets. GPL-3.0. Source and credits: https://github.com/micro23/Electorrent\n')
