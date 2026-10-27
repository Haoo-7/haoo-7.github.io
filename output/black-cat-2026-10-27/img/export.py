# 把三张猫图裁成页面用的版本，并算出眼睛和“坐线”在裁切后图里的百分比位置
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage

geom = json.load(open('geom.json'))

def paw_line(a, x0, x1, y_from):
    # 坐线：从下往上找身体宽度突然变宽的那一行（尾巴很窄，脚掌很宽）
    dark = a[:, x0:x1] < 200
    w = dark.sum(1)
    peak = w[y_from:].max()
    for y in range(a.shape[0] - 1, y_from, -1):
        if w[y] > peak * 0.55:
            return y
    return a.shape[0] - 1

def crop_info(name, im, box, sit):
    x0, y0, x1, y1 = box
    W, H = x1 - x0, y1 - y0
    eyes = [dict(x=(e['x'] - x0) / W * 100, y=(e['y'] - y0) / H * 100, w=e['rx'] * 2 / W * 100, h=e['ry'] * 2 / H * 100) for e in geom[name]['eyes']]
    return dict(w=W, h=H, sit=(sit - y0) / H * 100, eyes=eyes)

info = {}

def ink(name, src, out_w):
    im = Image.open(src).convert('L')
    a = np.asarray(im).astype(int)
    bx = geom[name]['bbox']
    pad = 6
    box = (max(0, bx[0] - pad), max(0, bx[1] - pad), min(im.width, bx[2] + pad), min(im.height, bx[3] + 1))
    sit = paw_line(a, box[0], box[2], int(im.height * 0.45))
    c = im.crop(box)
    c = c.resize((out_w, round(out_w * c.height / c.width)), Image.LANCZOS)
    c.save(f'{name}.png', optimize=True)
    info[name] = crop_info(name, im, box, sit)

def dither(name, src, dots_w):
    im = Image.open(src).convert('L')
    a = np.asarray(im).astype(int)
    bx = geom[name]['bbox']
    box = (bx[0] - 4, bx[1] - 4, bx[2] + 4, bx[3] + 1)
    sit = paw_line(a, box[0], box[2], int(im.height * 0.45))
    c = im.crop(box)
    h = round(dots_w * c.height / c.width)
    g = np.asarray(c.resize((dots_w, h), Image.LANCZOS)).astype(float) / 255
    g = g ** 0.8  # 提一点暗部，让毛的高光留下更多点
    # Atkinson 抖动：只扩散 3/4 的误差，黑白对比更硬，像墨水屏
    for y in range(h):
        for x in range(dots_w):
            o = g[y, x]; n = 1.0 if o > 0.5 else 0.0; g[y, x] = n; e = (o - n) / 8
            for dx, dy in ((1, 0), (2, 0), (-1, 1), (0, 1), (1, 1), (0, 2)):
                if 0 <= x + dx < dots_w and y + dy < h: g[y + dy, x + dx] += e
    rgba = np.zeros((h, dots_w, 4), np.uint8)
    on = g < 0.5
    rgba[on] = (18, 18, 18, 255)
    Image.fromarray(rgba, 'RGBA').save(f'{name}.png', optimize=True)
    info[name] = crop_info(name, im, box, sit)
    info[name]['dots'] = [dots_w, h]

if 'b' in sys.argv: ink('b', 'b-ink.png', 240)
if 'a' in sys.argv: ink('a', 'a-photo-v2.png', 320)
if 'c' in sys.argv: dither('c', 'c-dither-src.png', int(sys.argv[-1]) if sys.argv[-1].isdigit() else 90)

old = {}
try: old = json.load(open('place.json'))
except Exception: pass
old.update(info)
json.dump(old, open('place.json', 'w'), indent=1)
print(json.dumps(info, indent=1))
