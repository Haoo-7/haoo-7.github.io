# 第二轮三个首屏：页面一样，只有猫那一块各写各的
import json

v = json.load(open('vec.json'))
s1, s2 = v['s1'], v['s2']
e1, e2 = s1['eyes'], s2['eyes']
tx, ty = v['s2_tail_start_src'][0] - 352, v['s2_tail_start_src'][1] - 419

PAGE = open('page.html').read()

# 01 剪影：整块墨色，眼睛是挖空的洞，瞳孔画在剪影后面，只从洞里露出来
cat1 = f'''<div class="cat" aria-hidden="true">
  <svg viewBox="0 0 {s1['w']} {s1['sit']}">
    <ellipse class="pupil" cx="{e1[0]['x'] - 8}" cy="{e1[0]['y'] + 4}" rx="9" ry="30" />
    <ellipse class="pupil" cx="{e1[1]['x'] - 8}" cy="{e1[1]['y'] + 4}" rx="9" ry="30" />
    <path class="body" fill-rule="evenodd" d="{s1['d']}" />
  </svg>
</div>'''
css1 = f'''
  /* 剪影猫：坐在首屏分隔线上；画框只到坐线，过线的尾巴被裁掉，像从台沿垂到后面去了 */
  .hero .foot {{ position: relative; }}
  .cat {{ position: absolute; right: calc(var(--col-r) + 44px); bottom: calc(100% + 1px); width: {round(s1['w'] * 220 / s1['sit'])}px; }}
  .cat svg {{ display: block; width: 100%; height: auto; overflow: hidden; }}
  .cat .body, .cat .pupil {{ fill: var(--ink); }}
'''

# 02 线描：和分隔线同一种细线；尾巴从右胯落到分隔线上，沿着线一路走，慢慢变成分隔线本身
cat2 = f'''<div class="cat" aria-hidden="true">
  <svg viewBox="0 0 {s2['w'] + 12} {s2['h'] + 2}">
    <path class="body" d="{s2['d']}" />
    <path class="tail" d="M{tx} {ty} C{tx + 14} {ty} {tx + 20} {ty + 10} {tx + 24} {s2['h'] - 8} C{tx + 27} {s2['h']} {tx + 32} {s2['h'] + 0.5} {s2['w'] + 12} {s2['h'] + 0.5}" />
    <circle class="pupil" cx="{e2[0]['x'] - 3}" cy="{e2[0]['y'] + 1}" r="6.5" />
    <circle class="pupil" cx="{e2[1]['x'] - 3}" cy="{e2[1]['y'] + 1}" r="6.5" />
  </svg>
</div>
<i class="tail-rule" aria-hidden="true"></i>'''
k2 = 0.32
# 让图里尾巴那条水平线正好压在分隔线上（分隔线是 .foot 的上边框，1px）
top2 = -((s2['h'] + 0.5) * k2) - 0.5
css2 = f'''
  /* 线描猫：线和分隔线一样细；尾巴落到线上接着走，从墨色渐渐变成分隔线的灰 */
  .hero .foot {{ position: relative; --cat-r: calc(var(--col-r) + 34px); }}
  .cat {{ position: absolute; right: var(--cat-r); top: {top2:.1f}px; width: {(s2['w'] + 12) * k2:.1f}px; }}
  .cat svg {{ display: block; width: 100%; height: auto; overflow: visible; }}
  .cat .body, .cat .pupil {{ fill: var(--ink); }}
  .cat .tail {{ fill: none; stroke: var(--ink); stroke-width: 3; stroke-linecap: round; }}
  .tail-rule {{ position: absolute; top: -1px; right: 0; width: var(--cat-r); height: 1px; background: linear-gradient(90deg, var(--ink) 0, var(--ink) 18%, var(--rule) 72%); }}
'''

# 03 像素：一格一个方块，坐在亮着的那个词的基线上；瞳孔是一格宽两格高的方块，看向大字
cat3 = '''<div class="px" aria-hidden="true">
  <img src="../s3.png" width="20" height="51" alt="" />
  <i class="pupil" style="left:30px;top:37px"></i>
  <i class="pupil" style="left:65px;top:37px"></i>
</div>'''
css3 = '''
  /* 像素猫：20 格宽，每格 5px；画框只到脚底，尾巴过了基线就看不见 */
  .hero-l { position: relative; }
  .px { position: absolute; left: 462px; top: 100px; width: 100px; height: 190px; overflow: hidden; }
  .px img { display: block; width: 100px; height: 255px; image-rendering: pixelated; }
  .px .pupil { position: absolute; width: 5px; height: 10px; background: var(--ink); }
'''

for name, title, css, cat, where in [
    ('s1-silhouette', '01 · Silhouette cat', css1, cat1, 'foot'),
    ('s2-line', '02 · One-line cat', css2, cat2, 'foot'),
    ('s3-pixel', '03 · Pixel cat', css3, cat3, 'words'),
]:
    html = PAGE.replace('{{title}}', title).replace('{{css}}', css)
    html = html.replace('{{foot-cat}}', cat if where == 'foot' else '').replace('{{words-cat}}', cat if where == 'words' else '')
    open(f'explore/{name}.html', 'w').write(html)
    print(name, len(html))
