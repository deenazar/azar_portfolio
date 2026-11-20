"""Builds src/portrait.json (halftone dots) and src/assets/style-*.webp (the same portrait in 6 styles).
Usage: python3 tools/make_halftone.py photo.jpg   (needs opencv-python-headless, numpy, pillow)"""
import sys, json, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
src = sys.argv[1] if len(sys.argv) > 1 else 'public/images/azarudeen.jpg'
img = cv2.resize(cv2.imread(src), (900, 900), interpolation=cv2.INTER_AREA); h, w = img.shape[:2]
np.random.seed(3)

# ---- cut-out mask (grabCut seeded around head + shoulders)
mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
cv2.ellipse(mask, (w//2, int(h*0.34)), (int(w*0.22), int(h*0.29)), 0, 0, 360, cv2.GC_PR_FGD, -1)
cv2.rectangle(mask, (int(w*0.02), int(h*0.60)), (int(w*0.98), h), cv2.GC_PR_FGD, -1)
cv2.ellipse(mask, (w//2, int(h*0.28)), (int(w*0.12), int(h*0.18)), 0, 0, 360, cv2.GC_FGD, -1)
cv2.rectangle(mask, (int(w*0.30), int(h*0.72)), (int(w*0.72), h), cv2.GC_FGD, -1)
for (x0,y0,x1,y1) in [(0,0,int(w*.18),int(h*.5)),(int(w*.82),0,w,int(h*.5))]: cv2.rectangle(mask,(x0,y0),(x1,y1),cv2.GC_BGD,-1)
cv2.grabCut(img, mask, None, np.zeros((1,65)), np.zeros((1,65)), 8, cv2.GC_INIT_WITH_MASK)
m = np.where((mask==1)|(mask==3),255,0).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5,5),np.uint8)); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15,15),np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m); m = np.where(lab==1+np.argmax(st[1:, cv2.CC_STAT_AREA]),255,0).astype(np.uint8)
mf = cv2.GaussianBlur(m, (0,0), 2.0).astype(np.float32)/255
fade = np.clip(1.0 - (np.arange(h)[:,None]-h*0.80)/(h*0.20), 0, 1)

# ---- tone map: local contrast + unsharp + S-curve so the face reads clearly
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
g = cv2.createCLAHE(clipLimit=3.2, tileGridSize=(8,8)).apply(gray).astype(np.float32)/255
bl = cv2.GaussianBlur(g, (0,0), 3.0); g = np.clip(g + 1.1*(g-bl), 0, 1)
g = cv2.GaussianBlur(g, (0,0), 0.9)
ins = m > 0
lo, hi = np.percentile(g[ins], [4, 96]); L = np.clip((g-lo)/(hi-lo), 0, 1)
L = 1/(1+np.exp(-6.5*(L-0.5))); L = (L-L.min())/(L.max()-L.min())

# ---- 1) halftone dots
S = 3.7; pts = []; y = 0.0; r = 0
while y < h:
    x = S/2 if r%2 else 0.0
    while x < w:
        xi, yi = int(x), int(y)
        if xi < w and yi < h and mf[yi,xi] > 0.5 and np.random.rand() < fade[yi,0]:
            pts.append((x, y, max(0.10, float(L[yi,xi])), float(L[yi,xi])))
        x += S
    y += S*0.866; r += 1
pts = np.array(pts, np.float32); print('dots', len(pts))
xs = (pts[:,0]-w*0.5)/h; ys = -(pts[:,1]-h*0.5)/h
json.dump({'n': int(len(pts)), 'aspect': 1.0, 'data': [round(float(v),4) for row in zip(xs,ys,pts[:,2],pts[:,3]) for v in row]}, open('src/portrait.json','w'))

# ---- 2) the same portrait in other styles (white on transparent; tinted in 3D)
def save(name, a):
    a = np.clip(a, 0, 1) * mf * fade
    rgba = np.zeros((h, w, 4), np.uint8); rgba[...,:3] = 255; rgba[...,3] = (a*255).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(f'src/assets/style-{name}.webp', quality=82, method=6)
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

# engraving: horizontal lines whose thickness follows the light
step = 7; out = np.zeros((h, w), np.float32)
for y0 in range(4, h, step):
    wave = 1.4*np.sin(np.arange(w)/38.0 + y0/20.0)
    th = 0.6 + (step-1.2)*L[y0] ; d = np.abs(yy[y0-step//2:y0+step//2+1] - (y0 + wave)[None,:])
    out[y0-step//2:y0+step//2+1] = np.maximum(out[y0-step//2:y0+step//2+1], np.clip(th[None,:]/2 - d + 0.5, 0, 1))
save('engrave', out)

# ascii
cw, ch = 9, 15; ramp = ' .,:;-=+*#%@'
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 14)
except Exception: font = ImageFont.load_default()
im = Image.new('L', (w, h), 0); dr = ImageDraw.Draw(im)
for cy in range(0, h-ch, ch):
    for cx in range(0, w-cw, cw):
        v = float(L[cy:cy+ch, cx:cx+cw].mean()); c = ramp[int(v*(len(ramp)-1))]
        if c != ' ': dr.text((cx, cy), c, fill=255, font=font)
save('ascii', np.asarray(im, np.float32)/255)

# mosaic: square halftone
cs = 11; out = np.zeros((h, w), np.float32)
for cy in range(0, h-cs, cs):
    for cx in range(0, w-cs, cs):
        v = float(L[cy:cy+cs, cx:cx+cs].mean()); s = int(round(cs*np.sqrt(v)*0.96))
        if s > 0: o = (cs-s)//2; out[cy+o:cy+o+s, cx+o:cx+o+s] = 1
save('mosaic', out)

# crosshatch: lines get denser where the light is
sp = 5
d1 = ((xx+yy) % sp) < 1.3; d2 = ((xx-yy) % sp) < 1.3; d3 = (yy % sp) < 1.3
out = np.where(L > 0.22, d1, 0).astype(np.float32); out = np.maximum(out, np.where(L > 0.5, d2, 0)); out = np.maximum(out, np.where(L > 0.75, d3, 0))
save('hatch', out)

# 1-bit ordered dither
bay = np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]], np.float32)/16.0
cell = 3; bs = np.tile(bay, (h//(4*cell)+1, w//(4*cell)+1)); bs = np.kron(bay, np.ones((cell,cell), np.float32)); bs = np.tile(bs, (h//bs.shape[0]+1, w//bs.shape[1]+1))[:h,:w]
Ld = cv2.resize(cv2.resize(L, (w//cell, h//cell), interpolation=cv2.INTER_AREA), (w, h), interpolation=cv2.INTER_NEAREST)
save('dither', (Ld > bs).astype(np.float32))

# contour: topographic bands + edges
q = np.floor(cv2.GaussianBlur(L, (0,0), 2.2)*9).astype(np.float32); gx = cv2.Sobel(q, cv2.CV_32F, 1, 0); gy = cv2.Sobel(q, cv2.CV_32F, 0, 1)
bands = ((np.hypot(gx, gy) > 0.5) & (cv2.GaussianBlur(L,(0,0),3) > 0.2)).astype(np.uint8)
edges = cv2.Canny((gray).astype(np.uint8), 60, 140)
c = cv2.dilate(np.maximum(bands, (edges > 0).astype(np.uint8)), np.ones((2,2), np.uint8)).astype(np.float32)
save('contour', c)
Image.fromarray((mf*fade*255).astype(np.uint8), 'L').save('src/assets/mask.webp', quality=85)
print('ok')
