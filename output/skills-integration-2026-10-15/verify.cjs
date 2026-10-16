const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = 'http://127.0.0.1:4321';
const destinations = [
  'https://github.com/Haoo-7/md2docx-historypaper-skill',
  'https://github.com/Haoo-7/agent-recap',
];

async function opened(page, name) {
  await page.waitForFunction((id) => {
    const panel = document.getElementById(`${id}-content`);
    return panel.classList.contains('is-open') && !panel.inert && panel.clientHeight > 100;
  }, name);
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
      const page = await browser.newPage({ viewport, hasTouch: viewport.width < 761 });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.waitForFunction(() => document.body.dataset.entryComplete === 'true');
      assert.match(await page.locator('.work-row .caption').innerText(), /2 个项目 · 2 个 Skills/);
      assert.equal(await page.locator('#work-content').evaluate(el => el.inert), true);
      await page.locator('.hero-action').click();
      await opened(page, 'work');
      assert.equal(await page.locator('.work-group').count(), 2);
      assert.equal(await page.locator('.project-entry').count(), 2);
      assert.equal(await page.locator('.skill-entry').count(), 2);
      assert.deepEqual(await page.locator('.skill-entry a').evaluateAll(links => links.map(link => link.href)), destinations);
      for (const link of await page.locator('.skill-entry a').all()) {
        await link.scrollIntoViewIfNeeded();
        assert.equal(await link.isVisible(), true);
        await link.focus();
        assert.equal(await link.evaluate(el => document.activeElement === el), true);
        assert.equal(await link.getAttribute('target'), '_blank');
        assert.match(await link.getAttribute('rel'), /noopener/);
        assert.ok(await link.evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Skill name and description must fit');
      }
      // The existing external-arrow hover moves 3px into the page gutter.
      assert.ok(await page.locator('.work-group-entries').evaluateAll(els => els.every(el => el.scrollWidth <= el.clientWidth + 4)));
      if (viewport.width < 761) {
        await page.locator('[aria-label="预览 Dayline Journal"]').tap();
        await page.waitForFunction(() => {
          const image = document.querySelector('#dayline-preview img');
          return image.getBoundingClientRect().height > 50 && image.naturalWidth > 0;
        });
        await page.locator('[aria-label="预览 Dayline Journal"]').tap();
        await page.waitForFunction(() => getComputedStyle(document.querySelector('#dayline-preview')).display === 'none');
      } else {
        await page.locator('.project-entry .entry-link').first().hover();
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.peek')).opacity) > .99);
        await page.mouse.move(8, 100);
      }
      await page.locator('.blog-link').click();
      await page.waitForFunction(() => document.querySelector('#blog-note').getBoundingClientRect().height > 0);
      await page.locator('.writing-row').click();
      await opened(page, 'writing');
      assert.equal(await page.locator('#work-content').evaluate(el => el.inert), true);
      assert.equal(await page.locator('#writing-content .article-link').count(), 2);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.querySelector('#writing-content').clientHeight === 0);
      await page.locator('.nav a[href="#work"]').click();
      await opened(page, 'work');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      console.log(`PASS ${viewport.width}x${viewport.height}: real entry, groups, repository links, keyboard, previews, switching, Escape, no overflow`);
      await page.close();
    }
    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    reduced.on('pageerror', error => errors.push(error.message));
    await reduced.goto(base);
    await reduced.locator('.work-row').click();
    await opened(reduced, 'work');
    assert.equal(await reduced.locator('.skill-entry a').count(), 2);
    await reduced.close();
    const staticPage = await browser.newPage({ javaScriptEnabled: false });
    await staticPage.goto(base);
    assert.equal(await staticPage.locator('.skill-entry a').first().isVisible(), true);
    assert.equal(await staticPage.locator('.skill-entry a').nth(1).isVisible(), true);
    await staticPage.close();
    assert.deepEqual(errors, []);
    console.log('PASS reduced motion, no JavaScript, no browser errors');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
