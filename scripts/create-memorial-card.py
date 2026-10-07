from pathlib import Path
import random
import qrcode
import fitz
import cv2
import numpy as np
from PIL import Image, ImageOps
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://johnwhittle.vercel.app/'
W, H = 85.6*mm, 54*mm
pdfmetrics.registerFont(TTFont('Georgia', 'C:/Windows/Fonts/georgia.ttf'))
pdfmetrics.registerFont(TTFont('GeorgiaItalic', 'C:/Windows/Fonts/georgiai.ttf'))
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, border=4, box_size=16)
qr.add_data(URL)
qr.make(fit=True)
qr_img = qr.make_image(fill_color='black', back_color='white').convert('RGB')
qr_img.save(OUT / 'memorial-qr.png')
portrait = Image.open(ROOT / 'public/images/john-alan-whittle.jpg')
portrait = ImageOps.fit(portrait, (1000, 1000), centering=(0.63, 0.32))

def text(c, x, y, value, font='Helvetica', size=8, colour='#E9E1F1', center=False):
    c.setFillColor(HexColor(colour)); c.setFont(font, size)
    (c.drawCentredString if center else c.drawString)(x, y, value)

def background(c):
    c.setFillColor(HexColor('#15101F')); c.rect(0,0,W,H,fill=1,stroke=0)
    rng = random.Random(18)
    for _ in range(65):
        c.setFillColor(HexColor(rng.choice(['#44354E','#685470','#95839C'])))
        c.circle(rng.uniform(0,W),rng.uniform(0,H),rng.uniform(.15,.45),fill=1,stroke=0)
    c.setStrokeColor(HexColor('#9D8060')); c.setLineWidth(.45)
    c.roundRect(3*mm,3*mm,W-6*mm,H-6*mm,3*mm,stroke=1,fill=0)

pdf_path = OUT / 'john-whittle-memorial-card.pdf'
c = canvas.Canvas(str(pdf_path), pagesize=(W,H))
c.setTitle('John Alan Whittle - memorial keepsake card')
background(c)
cx,cy,r=18.7*mm,30*mm,11.5*mm
c.saveState(); p=c.beginPath();p.circle(cx,cy,r);c.clipPath(p,stroke=0)
c.drawImage(ImageReader(portrait),cx-r,cy-r,2*r,2*r);c.restoreState()
c.setStrokeColor(HexColor('#B89A6C'));c.setLineWidth(.8);c.circle(cx,cy,r+.7*mm,stroke=1,fill=0)
tx=56*mm
text(c,tx,42*mm,'IN LOVING MEMORY',size=6.3,colour='#C8AC84',center=True)
text(c,tx,32.5*mm,'John Alan',font='Georgia',size=19,center=True)
text(c,tx,24*mm,'Whittle',font='Georgia',size=23,center=True)
c.setStrokeColor(HexColor('#6F927D'));c.line(39*mm,20*mm,73*mm,20*mm)
text(c,tx,15.5*mm,'Forever in our hearts',font='GeorgiaItalic',size=8.5,colour='#D0BDDB',center=True)
text(c,W/2,7*mm,'A quiet place to remember. A connection to keep.',size=6.5,colour='#BDB0C6',center=True)
c.showPage();background(c)
text(c,8*mm,42*mm,'Remember John',font='Georgia',size=15,colour='#E9E1F1')
text(c,8*mm,34*mm,'Visit his memorial sanctuary',size=8,colour='#C8AC84')
for y,line in [(27,'Share a memory, leave a tribute,'),(22,'or spend a quiet moment'),(17,'feeling close to John.')]:
    text(c,8*mm,y*mm,line,size=7.4)
qsize=27*mm
c.drawImage(ImageReader(qr_img),54*mm,17*mm,qsize,qsize)
text(c,67.5*mm,13*mm,'SCAN TO VISIT',size=6.2,colour='#C8AC84',center=True)
text(c,W/2,7*mm,'johnwhittle.vercel.app',size=8,colour='#D5C6DF',center=True)
c.linkURL(URL,(54*mm,17*mm,81*mm,44*mm),relative=0)
c.save()
doc=fitz.open(pdf_path)
previews=[]
for page in doc:
    pix=page.get_pixmap(matrix=fitz.Matrix(4,4),alpha=False)
    im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
    previews.append(im)
back=np.array(previews[1])
decoded,_,_=cv2.QRCodeDetector().detectAndDecode(back)
assert decoded == URL, f'QR verification failed: {decoded}'
preview=Image.new('RGB',(previews[0].width+100,previews[0].height*2+150),'#EEE9F0')
preview.paste(previews[0],(50,50));preview.paste(previews[1],(50,100+previews[0].height))
preview.save(OUT/'john-whittle-card-preview.png')
assert len(doc)==2
print(f'Created {pdf_path}; two pages, 85.6 x 54 mm. Rendered QR decoded correctly: {decoded}')
