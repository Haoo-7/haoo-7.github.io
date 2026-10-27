# 三张猫图：找白眼位置、按身体裁切、导出页面用的版本
import json
import numpy as np
from PIL import Image
from scipy import ndimage

out = {}

def eyes(a, top, bottom):
    # 白眼是猫身上被黑色包围的亮斑：只在头部区域里找
    g = a[top:bottom]
    lab, n = ndimage.label(g > 200)
    blobs = []
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        if 300 < len(ys) < 20000 and not (xs.min() == 0 or xs.max() == g.shape[1] - 1):
            # 和背景连着的不算
            blobs.append((len(ys), xs.mean(), ys.mean() + top, (xs.max() - xs.min()) / 2, (ys.max() - ys.min()) / 2))
    blobs.sort(reverse=True)
    pair = sorted(blobs[:2], key=lambda b: b[1])
    return [dict(x=round(b[1], 1), y=round(b[2], 1), rx=round(b[3], 1), ry=round(b[4], 1)) for b in pair]

def bbox(a, thr=200):
    ys, xs = np.nonzero(a < thr)
    return xs.min(), ys.min(), xs.max(), ys.max()

for name, src in [('a', 'a-photo-v2.png'), ('b', 'b-ink.png'), ('c', 'c-dither-src.png')]:
    im = Image.open(src).convert('L')
    a = np.asarray(im).astype(np.int16)
    # 背景是连着四边的亮区；眼睛是不连边的亮区
    bg_lab, _ = ndimage.label(a > 235)
    edge = set(np.unique(np.concatenate([bg_lab[0], bg_lab[-1], bg_lab[:, 0], bg_lab[:, -1]]))) - {0}
    bg = np.isin(bg_lab, list(edge))
    body = ~bg
    ys, xs = np.nonzero(body)
    head_top, head_bot = ys.min(), ys.min() + int((ys.max() - ys.min()) * 0.4)
    inner = a.copy()
    inner[bg] = 0
    e = eyes(np.where(bg, 0, a), head_top, head_bot)
    out[name] = dict(size=im.size, bbox=[int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], eyes=e)

# c 的眼睛和耳朵高光连在一起，自动找不准，用低阈值单独量过的值
out['c']['eyes'] = [dict(x=431.0, y=330.0, rx=28.0, ry=25.0), dict(x=606.0, y=334.0, rx=28.0, ry=25.0)]
print(json.dumps(out, indent=1))
json.dump(out, open('geom.json', 'w'), indent=1)
