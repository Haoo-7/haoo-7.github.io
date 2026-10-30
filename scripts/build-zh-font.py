#!/usr/bin/env python3
"""从本地思源宋体生成按站内字频排序的 WOFF2 分片，不访问网络。"""

from collections import Counter
from pathlib import Path
import argparse
import shutil

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / 'output/zh-site-2026-10-30/fonts/noto'
DEST = ROOT / 'public/fonts/zh'
CHUNK_SIZE = 400
# 单引号 U+2018-201A 不收：英文标题里的 I’d 会被排成全角撇号
PUNCT = {0x2014, 0x2026} | set(range(0x201C, 0x201E)) | set(range(0x3000, 0x3040)) | set(range(0xFF00, 0xFFF0))


def gb2312_han():
  # GB2312 的一级、二级汉字；符号区由下面的中文标点范围单独负责
  chars = set()
  for lead in range(0xB0, 0xF8):
    for trail in range(0xA1, 0xFF):
      try:
        chars.update(map(ord, bytes([lead, trail]).decode('gb2312')))
      except UnicodeDecodeError:
        pass
  return chars


def unicode_range(chars):
  # 连续码位合并成区间，避免每片的 CSS 比字体声明本身还长
  ranges = []
  ordered = sorted(chars)
  first = last = ordered[0]
  for point in ordered[1:]:
    if point == last + 1:
      last = point
    else:
      ranges.append(f'U+{first:X}' if first == last else f'U+{first:X}-{last:X}')
      first = last = point
  ranges.append(f'U+{first:X}' if first == last else f'U+{first:X}-{last:X}')
  return ','.join(ranges)


def write_subset(source, target, chars):
  options = subset.Options()
  options.flavor = 'woff2'
  options.hinting = False
  # 保留原字体的版权和授权元数据，OFL 正文也会单独随产物分发
  options.name_IDs = ['*']
  with TTFont(source, recalcTimestamp=False) as font:
    builder = subset.Subsetter(options=options)
    builder.populate(unicodes=chars)
    builder.subset(font)
    font.flavor = 'woff2'
    font.save(target)


def face(family, filename, weight, chars):
  return f'@font-face {{ font-family: "{family}"; src: url("./{filename}") format("woff2"); font-weight: {weight}; font-display: swap; unicode-range: {unicode_range(chars)}; }}'


def main():
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument('--source', type=Path, default=DEFAULT_SOURCE, help='含 SubsetOTF/SC 和 LICENSE 的 noto-cjk 目录')
  args = parser.parse_args()
  sources = {weight: args.source / f'SubsetOTF/SC/NotoSerifSC-{name}.otf' for weight, name in [(400, 'Regular'), (500, 'Medium')]}
  # 先检查全部输入，避免缺文件时清掉已有产物
  for source in [*sources.values(), args.source / 'LICENSE']:
    if not source.is_file():
      parser.error(f'找不到源文件：{source}')

  frequency = Counter()
  for path in sorted((ROOT / 'src').rglob('*')):
    if path.suffix in {'.md', '.astro', '.ts'} and path.is_file():
      frequency.update(map(ord, path.read_text(encoding='utf-8')))
  wanted = gb2312_han() | set(frequency) | PUNCT
  with TTFont(sources[400]) as font:
    supported = set(font.getBestCmap())
  with TTFont(sources[500]) as font:
    supported &= set(font.getBestCmap())
  # 字体不存在的控制字符等交由浏览器回退，不给它们声明虚假的覆盖范围
  chars = wanted & supported
  ordered = sorted(chars - PUNCT, key=lambda point: (-frequency[point], point))
  chunks = [ordered[i:i + CHUNK_SIZE] for i in range(0, len(ordered), CHUNK_SIZE)]
  punctuation = PUNCT & supported

  DEST.mkdir(parents=True, exist_ok=True)
  for old in DEST.glob('*.woff2'):
    old.unlink()
  css = []
  for weight, source in sources.items():
    for i, chunk in enumerate(chunks):
      filename = f'noto-serif-sc-{weight}-{i:02d}.woff2'
      write_subset(source, DEST / filename, chunk)
      css.append(face('Noto Serif SC Web', filename, weight, chunk))
    print(f'{weight}: {len(chunks)} shards', flush=True)
  # 标点只有一份；400、500 两个字重共用，避免为几十个标点重复下载
  write_subset(sources[400], DEST / 'punct.woff2', punctuation)
  css.append(face('ZhPunct', 'punct.woff2', '400 500', punctuation))
  (DEST / 'zh.css').write_text('\n'.join(css) + '\n', encoding='utf-8')
  shutil.copyfile(args.source / 'LICENSE', DEST / 'OFL.txt')
  size = sum(path.stat().st_size for path in DEST.iterdir() if path.is_file())
  print(f'{len(chars)} code points; {len(chunks) * 2 + 1} WOFF2 files; {size:,} bytes total; zh.css {(DEST / "zh.css").stat().st_size:,} bytes')


if __name__ == '__main__':
  main()
