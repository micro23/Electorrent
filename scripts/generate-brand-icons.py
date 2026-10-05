from pathlib import Path
from PIL import Image, ImageDraw
import subprocess, tempfile
root=Path(__file__).resolve().parent.parent
S=1024
im=Image.new('RGBA',(S,S),(0,0,0,0)); mask=Image.new('L',(S,S)); d=ImageDraw.Draw(mask); d.rounded_rectangle((32,32,992,992),radius=218,fill=255)
for y in range(S):
    color=(int(12+10*y/S),int(33+14*y/S),int(59+22*y/S),255)
    ImageDraw.Draw(im).line((0,y,S,y),fill=color)
im.putalpha(mask)
d=ImageDraw.Draw(im)
# Three stacked deck cards with a distinct down-arrow on the top card.
for coords,color in [([(190,554),(512,716),(834,554),(834,665),(512,827),(190,665)],'#1ba4b8'), ([(190,423),(512,585),(834,423),(834,534),(512,696),(190,534)],'#36d2c3'), ([(190,292),(512,130),(834,292),(512,454)],'#e8f7ff')]: d.polygon(coords,fill=color)
d.polygon([(478,205),(546,205),(546,304),(604,274),(604,328),(512,376),(420,328),(420,274),(478,304)],fill='#123653')
im.save(root/'assets/torrent-deck.png')
(root/'assets/torrent-deck.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#0c213b"/><stop offset="1" stop-color="#162f51"/></linearGradient></defs><rect x="32" y="32" width="960" height="960" rx="218" fill="url(#bg)"/><path d="M190 554 512 716 834 554V665L512 827 190 665Z" fill="#1ba4b8"/><path d="M190 423 512 585 834 423V534L512 696 190 534Z" fill="#36d2c3"/><path d="M190 292 512 130 834 292 512 454Z" fill="#e8f7ff"/><path d="M478 205H546V304L604 274V328L512 376 420 328V274L478 304Z" fill="#123653"/></svg>''')
for size in [16,32,64,128,256,512]: im.resize((size,size),Image.Resampling.LANCZOS).save(root/f'build/png/{size}x{size}.png')
im.save(root/'build/icon.png')
im.save(root/'build/icon.ico',sizes=[(s,s) for s in [16,24,32,48,64,128,256]])
im.save(root/'build/torrent.ico',sizes=[(s,s) for s in [16,24,32,48,64,128,256]])
with tempfile.TemporaryDirectory() as tmp:
    icons=Path(tmp)/'TorrentDeck.iconset'; icons.mkdir()
    for size in [16,32,128,256,512]:
        for scale in [1,2]:
            suffix='@2x' if scale==2 else ''
            im.resize((size*scale,size*scale),Image.Resampling.LANCZOS).save(icons/f'icon_{size}x{size}{suffix}.png')
    subprocess.run(['iconutil','-c','icns',str(icons),'-o',str(root/'build/icon.icns')],check=True)
(root/'build/torrent.icns').write_bytes((root/'build/icon.icns').read_bytes())
tray=Image.new('RGBA',(512,512)); t=ImageDraw.Draw(tray)
for p in [[(40,215),(256,320),(472,215),(472,275),(256,380),(40,275)],[(40,310),(256,415),(472,310),(472,370),(256,475),(40,370)],[(40,140),(256,35),(472,140),(256,245)]]: t.polygon(p,fill='black')
for name,size in [('trayTemplate.png',16),('trayTemplate@2x.png',32),('trayTemplate512x512.png',512)]: tray.resize((size,size),Image.Resampling.LANCZOS).save(root/'build/png'/name)
print('Generated Torrent-Deck app, document, Linux and tray icons.')
