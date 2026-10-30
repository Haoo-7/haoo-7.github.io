# Webfont attribution

The site self-hosts three font families in `public/fonts/refresh/`:

| Family | Files | Source |
| --- | --- | --- |
| Literata | `literata.woff2`, `literata-italic.woff2` | TypeTogether, distributed through Google Fonts: https://fonts.google.com/specimen/Literata |
| Instrument Sans | `instrument-sans.woff2` | Instrument, distributed through Google Fonts: https://fonts.google.com/specimen/Instrument+Sans |
| IBM Plex Mono | `plex-mono-400.woff2`, `plex-mono-500.woff2` | IBM, distributed through Google Fonts: https://fonts.google.com/specimen/IBM+Plex+Mono |

All three families are licensed under the SIL Open Font License 1.1 (SIL OFL 1.1).
License text: https://openfontlicense.org/open-font-license-official-text/

The license permits use, embedding, modification and redistribution, including on
commercial websites. Font files must not be sold on their own. When redistributing
the fonts, retain the original copyright notices and license text, and respect any
Reserved Font Names when modifying them.

## Chinese serif subsets

`public/fonts/zh/` self-hosts Noto Serif SC Regular (400) and Medium (500),
from the `Serif2.003` release of `notofonts/noto-cjk`:
https://github.com/notofonts/noto-cjk/releases/tag/Serif2.003

The fonts are licensed under SIL OFL 1.1. `zh/OFL.txt` contains the supplied
license; the subsets also retain the original font copyright and license metadata.
`Noto Serif SC Web` is the CSS family name. `ZhPunct` is a separate punctuation
subset shared by weights 400 and 500.

The build uses every GB2312 Han character, characters found in `.md`, `.astro`
and `.ts` files under `src/`, and Chinese/fullwidth punctuation. Characters used
on the site come first in frequency order; the remaining GB2312 characters follow
in code point order. Each shard contains at most 400 supported code points.
`zh.css` declares `unicode-range` and `font-display: swap`, so browsers fetch only
the required shards. Article text prefers Songti SC on macOS.

To regenerate, download the source release yourself and extract
`SubsetOTF/SC/NotoSerifSC-Regular.otf`, `SubsetOTF/SC/NotoSerifSC-Medium.otf`
and `LICENSE` into a local directory. Source OTF files are not committed.
Use Python with fontTools and brotli already installed:

```sh
/opt/homebrew/bin/python3 scripts/build-zh-font.py --source /path/to/noto
```

Without `--source`, the script reads the original local source directory at
`output/zh-site-2026-10-30/fonts/noto`. It never downloads fonts.
