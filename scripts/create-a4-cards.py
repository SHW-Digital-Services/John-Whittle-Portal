from pathlib import Path
import pymupdf as fitz
import cv2
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
out = root / 'output/pdf'
source = fitz.open(out / 'john-whittle-memorial-card.pdf')
mm = 72 / 25.4
w, h, gap = 85.6*mm, 54*mm, 2*mm
pw, ph = 210*mm, 297*mm
left, top = (pw - 2*w - gap)/2, (ph - 5*h - 4*gap)/2
doc = fitz.open()
rects = []
for side in range(2):
    page = doc.new_page(width=pw, height=ph)
    for row in range(5):
        for col in range(2):
            x, y = left + col*(w+gap), top + row*(h+gap)
            rect = fitz.Rect(x,y,x+w,y+h)
            page.show_pdf_page(rect,source,side)
            if side == 0:
                rects.append(rect)
            # Short crop marks in the white gutters, outside the artwork.
            for xx in (rect.x0,rect.x1):
                for yy in (rect.y0,rect.y1):
                    direction = -1 if yy == rect.y0 else 1
                    page.draw_line((xx,yy+direction*.3*mm),(xx,yy+direction*.9*mm),color=(.4,.4,.4),width=.3)
            for yy in (rect.y0,rect.y1):
                page.draw_line((rect.x0-2*mm,yy),(rect.x0-.3*mm,yy),color=(.4,.4,.4),width=.3)
                page.draw_line((rect.x1+.3*mm,yy),(rect.x1+2*mm,yy),color=(.4,.4,.4),width=.3)
    page.insert_text((left,ph-4*mm),'FRONTS' if side==0 else 'BACKS',fontsize=5,color=(.4,.4,.4))
doc.set_metadata({'title':'John Whittle memorial cards - 10 per A4 sheet'})
dest = out / 'john-whittle-cards-a4-10.pdf'
doc.save(dest,garbage=4,deflate=True)
doc.close()
checked=fitz.open(dest)
for side,page in enumerate(checked):
    assert abs(page.rect.width-pw)<.01 and abs(page.rect.height-ph)<.01
    pix=page.get_pixmap(matrix=fitz.Matrix(1.5,1.5),alpha=False)
    pix.save(out / f'a4-cards-{side+1}-preview.png')
    assert page.get_text().count('Remember John' if side else 'IN LOVING MEMORY')==10
for rect in rects:
    pix=checked[1].get_pixmap(matrix=fitz.Matrix(4,4),clip=rect,alpha=False)
    arr=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,3)
    decoded,_,_=cv2.QRCodeDetector().detectAndDecode(arr)
    assert decoded=='https://johnwhittle.vercel.app/',decoded
print('Verified: two A4 pages; 10 cards per side at 85.6 x 54 mm; all 10 rendered QR codes decode correctly.')
