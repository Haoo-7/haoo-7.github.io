# 第二轮：剪影和线描描成 SVG 路径；像素猫找出格子大小，缩成一格一像素
import json
import numpy as np
from PIL import Image
from scipy import ndimage
import potrace

out = {}

def load(src):
    return np.asarray(Image.open(src).convert('L')).astype(int)

def bbox(mask):
    ys, xs = np.nonzero(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

def trace(mask, box):
    x0, y0, x1, y1 = box
    # potracer 把亮的当背景：传进去前取反，墨色那一块才是被描的形
    bm = potrace.Bitmap(~mask[y0:y1, x0:x1])
    path = bm.trace(turdsize=8, alphamax=1.1, opticurve=True, opttolerance=0.3)
    d = []
    for curve in path:
        s = curve.start_point
        d.append(f'M{s.x:.1f} {s.y:.1f}')
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f'L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}')
            else:
                d.append(f'C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}')
        d.append('Z')
    return ''.join(d)

def holes(mask, box, min_px, max_px):
    # 身体里被黑色围住的白块：眼睛
    x0, y0, x1, y1 = box
    sub = ~mask[y0:y1, x0:x1]
    lab, n = ndimage.label(sub)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    r = []
    for i in range(1, n + 1):
        if i in edge: continue
        ys, xs = np.nonzero(lab == i)
        if min_px < len(ys) < max_px:
            r.append(dict(x=round(xs.mean(), 1), y=round(ys.mean(), 1), w=int(xs.max() - xs.min() + 1), h=int(ys.max() - ys.min() + 1), n=len(ys)))
    return sorted(r, key=lambda e: e['x'])

# 1 剪影：整块黑，眼睛是洞
a = load('s1-silhouette.png')
m = a < 128
box = bbox(m)
out['s1'] = dict(w=box[2] - box[0], h=box[3] - box[1], d=trace(m, box), eyes=[e for e in holes(m, box, 800, 40000)][:2])

# 剪影的坐线：从下往上，身体宽度第一次超过最宽处一半的那一行（下面只剩尾巴）
w1 = (load('s1-silhouette.png') < 128).sum(1)
out['s1']['sit'] = int(next(y for y in range(len(w1) - 1, 0, -1) if w1[y] > w1.max() * 0.5) - box[1])

# 2 线描：线本身是黑，眼睛是线圈里的白。图里那段水平尾巴切掉，改由代码接着画，好让它落到分隔线上
a = load('s2-line.png')
m = a < 140
ty = int(np.nonzero(m[:, 1000])[0].mean())
band = m[ty - 4:ty + 5].any(0)
# 水平线从右边往左一直连着的那一段，起点就是尾巴离开身体的地方
tx = band.shape[0] - 1
while tx > 0 and band[tx - 1]: tx -= 1
m[ty - 4:ty + 5, tx + 10:] = False
box = bbox(m)
out['s2_tail_start_src'] = [tx + 10, ty]
lab, n = ndimage.label(m)
eyes = []
for i in range(1, n + 1):
    ys, xs = np.nonzero(lab == i)
    w, h = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
    if 20 < w < 60 and 20 < h < 60:
        eyes.append(dict(x=round(xs.mean() - box[0], 1), y=round(ys.mean() - box[1], 1), w=int(w), h=int(h)))
out['s2'] = dict(w=box[2] - box[0], h=box[3] - box[1], d=trace(m, box), eyes=sorted(eyes, key=lambda e: e['x']))
# 尾巴那条水平线的高度（相对裁切框）
row = m[:, box[2] - 5]
out['s2']['tail_y'] = float(np.nonzero(row)[0].mean() - box[1])
out['s2']['line_w'] = float(row.sum())

# 3 像素：试各种格子大小和起点，取重建误差最小的
a = load('s3-pixel.png')
m = a < 128
x0, y0, x1, y1 = bbox(m)
crop = m[y0:y1, x0:x1]
H, W = crop.shape
best = None
per_u = []
# 向量化：在格子中心取样得到每格的值，再按格子铺回去，和原图比差了多少像素
for u in np.arange(14, 34, 0.5):
    for ox in np.arange(0, u, 3):
        for oy in np.arange(0, u, 3):
            ix = ((np.arange(W) + ox) // u).astype(int)
            iy = ((np.arange(H) + oy) // u).astype(int)
            cx = np.clip(((np.arange(ix.max() + 1) + 0.5) * u - ox).astype(int), 0, W - 1)
            cy = np.clip(((np.arange(iy.max() + 1) + 0.5) * u - oy).astype(int), 0, H - 1)
            cells = crop[cy][:, cx]
            err = int((cells[iy][:, ix] != crop).sum())
            if best is None or err < best[0]:
                best = (err, u, ox, oy, cells)
    per_u.append(best)
    best = None
# 格子越细误差越小，所以不取最小：取误差不超过最小值 1.25 倍里最粗的那个
lo = min(b[0] for b in per_u)
err, u, ox, oy, cells = max((b for b in per_u if b[0] <= lo * 1.25), key=lambda b: b[1])
print('per_u', [(float(b[1]), b[0]) for b in per_u])
rgba = np.zeros(cells.shape + (4,), np.uint8)
rgba[cells] = (18, 18, 18, 255)
Image.fromarray(rgba, 'RGBA').save('s3.png')
out['s3'] = dict(unit=float(u), grid=[int(cells.shape[1]), int(cells.shape[0])], err=int(err), rows=[''.join('#' if c else '.' for c in r) for r in cells])

json.dump(out, open('vec.json', 'w'), indent=1)
for k in ('s1', 's2'):
    print(k, out[k]['w'], out[k]['h'], len(out[k]['d']), out[k]['eyes'], out[k].get('tail_y'), out[k].get('line_w'))
print('s3', out['s3']['unit'], out['s3']['grid'], out['s3']['err'])
print('\n'.join(out['s3']['rows']))
