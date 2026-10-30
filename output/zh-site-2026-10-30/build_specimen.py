"""中文字体样张：三种字体组合，同一份内容，只换大字和强调用的字体。

用 /opt/homebrew/bin/python3 运行（fontTools 装在它的 user site 里）。
"""
from pathlib import Path
from fontTools import subset

HERE = Path(__file__).parent
FONTS = HERE / "fonts"
OUT = HERE / "explore"
ASSETS = OUT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)
PUB = "../../../public"

BODY = """
<section class="hero">
  <div class="hero-l">
    <h1 class="words">
      <ol>
        <li><span class="w">生活，</span></li>
        <li class="on"><span class="w">科技<em>与</em></span><span class="n">02</span></li>
        <li><span class="w">历史。</span></li>
      </ol>
    </h1>
    <p class="intro">我是 Haoo，读历史，做起事来却像个工科生。<span>想用科技把日子过得好一点。</span></p>
  </div>
  <div class="panel">
    <img src="{pub}/images/refresh/tech.jpg" alt="" />
    <div class="cap mono"><span>图 <b>02</b> 工作台</span><span>· · ·</span></div>
  </div>
  <div class="foot mono">
    <div class="makes">在做 <a>↳ 小工具</a><a>↳ 随笔</a><a>↳ 评测</a><a>↳ 研究</a></div>
    <span>往下滚，或者接着看</span>
  </div>
</section>

<section class="sec">
  <p class="kick mono"><b>图 06</b> 关于</p>
  <h2 class="h2">一个人，<br /><em>三个画面。</em></h2>
  <div class="two">
    <div>
      <p class="lede">为自己真遇到的麻烦做的小工具，一格放一个。空着的格子是故意留的。</p>
      <ol class="lately">
        <li>在玩 <em>AI</em>，主要是为了学得快一点。</li>
        <li>读人是怎么<em>长进</em>的。</li>
        <li>来打个<em>招呼。</em></li>
      </ol>
    </div>
    <div class="post">
      <p class="kick mono"><b>评测</b> 2026-01-26 · 约 12 分钟</p>
      <h3 class="post-title">数码杂谈 | Kindle PaperWhite 3：为什么我推荐<span class="keep">高中生</span>使用电子书？</h3>
      <p class="tldr"><span class="mono">提要</span>一台二手 Kindle PaperWhite 3 不只是阅读器：它陪我完成了高中阶段的阅读、背词和课件学习。</p>
      <p class="prose">2020年，我闲着网上冲浪，在B站上看到了墨水屏的工作原理，惊叹于其墨水屏模拟纸质书的阅读质感，希望有一天能够拥有这样的一台设备。到了2024年，我在闲鱼以270元的价格淘到一台成色不错的Kindle PaperWhite 3，并一直使用至高考结束。</p>
    </div>
  </div>
</section>
"""

# 每个组合：大字字体、强调字体（文件、字重）
COMBOS = {
    "a-noto-zhuque": ("A · 思源宋体 + 朱雀仿宋", ("noto/SubsetOTF/SC/NotoSerifSC-Regular.otf", "noto/SubsetOTF/SC/NotoSerifSC-Light.otf"), "zhuque/ZhuqueFangsong-Regular.ttf"),
    "b-neozhisong-wenkai": ("B · 霞鹜新致宋 + 霞鹜文楷", ("NeoZhiSong.ttf", None), "WenKai-Light.ttf"),
    "c-zhuque-wenkai": ("C · 朱雀仿宋 + 霞鹜文楷", ("zhuque/ZhuqueFangsong-Regular.ttf", None), "WenKai-Light.ttf"),
}

text = BODY + "".join(v[0] for v in COMBOS.values()) + "“”‘’，。：；？！、·（）《》—…0123456789"
chars = "".join(sorted(set(text)))


def make(src: str, name: str) -> str:
    out = ASSETS / f"{name}.woff2"
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    f = subset.load_font(str(FONTS / src), opts)
    s = subset.Subsetter(opts)
    s.populate(text=chars)
    s.subset(f)
    subset.save_font(f, str(out), opts)
    print(f"{out.name}: {out.stat().st_size // 1024} KB")
    return f"assets/{out.name}"


for key, (label, (disp, disp_light), em) in COMBOS.items():
    d = make(disp, f"{key}-display")
    dl = make(disp_light, f"{key}-display-light") if disp_light else d
    e = make(em, f"{key}-em")
    faces = f"""
@font-face {{ font-family: "ZhDisplay"; src: url("{d}") format("woff2"); font-weight: 400 800; }}
@font-face {{ font-family: "ZhDisplay"; src: url("{dl}") format("woff2"); font-weight: 200 399; }}
@font-face {{ font-family: "ZhEm"; src: url("{e}") format("woff2"); font-style: italic; }}
@font-face {{ font-family: "LitItalic"; src: url("{PUB}/fonts/refresh/literata-italic.woff2") format("woff2"); font-style: italic; font-weight: 300 800; }}
/* 中文标点只用中文字体，不让 Literata 把弯引号排成西文宽度 */
@font-face {{ font-family: "ZhPunct"; src: url("{d}") format("woff2"); unicode-range: U+2018-201D, U+2014, U+2026, U+00B7, U+3000-303F, U+FF00-FFEF; }}
"""
    html = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" /><title>{label}</title>
<style>
@font-face {{ font-family: "Lit"; src: url("{PUB}/fonts/refresh/literata.woff2") format("woff2"); font-weight: 300 800; }}
@font-face {{ font-family: "Sans"; src: url("{PUB}/fonts/refresh/instrument-sans.woff2") format("woff2"); }}
@font-face {{ font-family: "Mono"; src: url("{PUB}/fonts/refresh/plex-mono-400.woff2") format("woff2"); }}
{faces}
</style>
<link rel="stylesheet" href="spec.css" />
</head><body>
<p class="tag mono">{label}</p>
{BODY.format(pub=PUB)}
</body></html>
"""
    (OUT / f"{key}.html").write_text(html, encoding="utf-8")
    print("wrote", key)

# 强调对比：大字固定思源宋体，只换 <em> 的字体，标题字号
EMS = {
    "zhuque": ("朱雀仿宋", "zhuque/ZhuqueFangsong-Regular.ttf"),
    "wenkai-l": ("霞鹜文楷 Light", "WenKai-Light.ttf"),
    "wenkai-r": ("霞鹜文楷 Regular", "LXGWWenKai-Regular.ttf"),
    "zhenkai": ("霞鹜臻楷", "LXGWZhenKaiSlabGB-Regular.ttf"),
}
d = make("noto/SubsetOTF/SC/NotoSerifSC-Regular.otf", "cmp-noto")
faces = [f'@font-face {{ font-family: "ZhDisplay"; src: url("{d}") format("woff2"); }}',
         f'@font-face {{ font-family: "LitItalic"; src: url("{PUB}/fonts/refresh/literata-italic.woff2") format("woff2"); font-style: italic; font-weight: 300 800; }}']
rows = []
for k, (label, src) in EMS.items():
    faces.append(f'@font-face {{ font-family: "Em-{k}"; src: url("{make(src, "cmp-" + k)}") format("woff2"); font-style: italic; }}')
    rows.append(f'<div class="row"><p class="mono">{label}</p><h2 class="h2" style="--em:\'Em-{k}\'">一个人，<em>三个画面。</em></h2>'
                f'<p class="ln" style="--em:\'Em-{k}\'">在玩 <em>AI</em>，读人是怎么<em>长进</em>的。来打个<em>招呼。</em></p></div>')
rows.append('<div class="row"><p class="mono">同一字体，灰墨</p><h2 class="h2 grey">一个人，<em>三个画面。</em></h2>'
            '<p class="ln grey">在玩 <em>AI</em>，读人是怎么<em>长进</em>的。来打个<em>招呼。</em></p></div>')
(OUT / "em-compare.html").write_text(f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" /><title>强调对比</title>
<style>
@font-face {{ font-family: "Lit"; src: url("{PUB}/fonts/refresh/literata.woff2") format("woff2"); font-weight: 300 800; }}
@font-face {{ font-family: "Mono"; src: url("{PUB}/fonts/refresh/plex-mono-400.woff2") format("woff2"); }}
{chr(10).join(faces)}
body {{ background: #EFEEEA; color: #121212; font-family: "Lit", "ZhDisplay", serif; margin: 0; padding: 40px 80px; }}
.mono {{ font: 13px Mono, monospace; color: #5E5E5A; margin: 0 0 8px; }}
.row {{ padding: 28px 0; border-top: 1px solid #C9C8C3; display: grid; grid-template-columns: 1fr; }}
.h2 {{ font-size: 96px; font-weight: 400; line-height: 1.15; margin: 0; }}
.ln {{ font-size: 34px; margin: 18px 0 0; }}
em {{ font-family: "Lit", var(--em), serif; font-style: italic; font-weight: 300; font-synthesis: none; }}
.grey em {{ font-style: normal; color: #858480; }}
</style></head><body>{''.join(rows)}</body></html>""", encoding="utf-8")
print("wrote em-compare")
