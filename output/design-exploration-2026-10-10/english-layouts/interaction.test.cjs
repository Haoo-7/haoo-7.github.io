const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const url = pathToFileURL(path.join(__dirname, "01-constellation.html")).href;

async function scroll(page, y) {
  await page.evaluate(value => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, value);
  }, y);
}

async function assertDock(page) {
  await page.waitForFunction(() => {
    const logo = document.querySelector(".wordmark").getBoundingClientRect();
    const dock = document.querySelector(".dock").getBoundingClientRect();
    return Math.abs(logo.width - dock.width) < 1 &&
      Math.abs(logo.left - dock.left) < 1 &&
      Math.abs(logo.top + logo.height / 2 - dock.top - dock.height / 2) < 1 &&
      Number(document.querySelector(".wordmark .solid").style.opacity) > .99;
  });
}

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  try {
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport, hasTouch: viewport.width <= 760 });
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(url);
      await page.waitForFunction(() => document.body.dataset.ready === "true" && window.Alpine);
      await page.waitForFunction(() => window.ScrollTrigger?.getAll().length > 0);
      const origin = await page.locator(".wordmark").boundingBox();
      await scroll(page, 2000);
      await assertDock(page);
      await page.setViewportSize({ width: viewport.width + 20, height: viewport.height });
      await assertDock(page);
      await scroll(page, 0);
      await page.waitForFunction(() => scrollY === 0 &&
        Math.abs(Number(gsap.getProperty(".wordmark", "y"))) < .1 &&
        Number(gsap.getProperty(".wordmark", "scaleX")) > .9999 &&
        Number(document.querySelector(".wordmark .solid").style.opacity) < .01);
      const returned = await page.locator(".wordmark").boundingBox();
      assert.ok(Math.abs(returned.y - origin.y) < 2, `Reverse scroll must return to the hero origin (${origin.y} -> ${returned.y})`);
      await scroll(page, 740);
      const work = page.locator(".work-row");
      await work.scrollIntoViewIfNeeded();
      if (viewport.width > 760) {
        await work.hover();
        await page.waitForFunction(() => document.querySelector(".work-row").dataset.material === "rest");
        assert.ok(await work.evaluate(el => el.classList.contains("is-engaged")));
        assert.equal(await work.locator(".label-text").evaluate(el => Number(el.style.opacity)), 1);
        await page.mouse.move(2, 85);
        await page.waitForFunction(() => !document.querySelector(".work-row").classList.contains("is-engaged"));
        await work.focus();
        await page.waitForFunction(() => document.querySelector(".work-row").dataset.material === "rest");
        await page.keyboard.press("Enter");
      } else {
        await work.tap();
      }
      await page.waitForFunction(() => !document.querySelector("#work-content").hidden);
      assert.equal(await work.getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => document.querySelector("#work-content").hidden);
      assert.equal(await work.getAttribute("aria-expanded"), "false");
      await scroll(page, 2000);
      await assertDock(page);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      console.log(`PASS ${viewport.width}x${viewport.height}: dock, reverse, resize, interaction, Escape`);
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => document.body.dataset.ready === "true");
    await page.locator(".work-row").hover();
    assert.equal(await page.locator(".work-row .label-text").evaluate(el => Number(el.style.opacity)), 1);
    await page.locator(".work-row").click();
    await page.waitForFunction(() => !document.querySelector("#work-content").hidden);
    console.log("PASS reduced motion: readable text, no character animation, working expansion");
    assert.deepEqual(errors, []);
    console.log("PASS no browser errors");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
