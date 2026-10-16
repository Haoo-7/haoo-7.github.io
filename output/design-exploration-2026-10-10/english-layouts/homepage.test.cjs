const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const url = pathToFileURL(path.join(__dirname, "homepage.html")).href;

async function panelOpen(page, name) {
  await page.waitForFunction(id => {
    const panel = document.getElementById(`${id}-content`);
    return panel.classList.contains("is-open") && panel.clientHeight > 100 &&
      !panel.inert && panel.getAttribute("aria-hidden") === "false";
  }, name);
}

async function panelClosed(page, name) {
  await page.waitForFunction(id => {
    const panel = document.getElementById(`${id}-content`);
    return !panel.classList.contains("is-open") && panel.clientHeight === 0 &&
      panel.inert && panel.getAttribute("aria-hidden") === "true";
  }, name);
}

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
    for (const viewport of [{ width: 1280, height: 900 }, { width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
      const page = await browser.newPage({ viewport, hasTouch: viewport.width <= 760 });
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(url);
      await page.waitForFunction(() => document.body.dataset.ready === "true" && window.Alpine);
      await page.waitForFunction(() => window.ScrollTrigger?.getAll().length > 0);
      await page.waitForFunction(() => !gsap.isTweening(document.querySelector(".topic")));
      await page.waitForFunction(() => document.body.dataset.entryComplete === "true");
      const glyph = await page.locator(".wordmark canvas").evaluate(canvas => {
        const rect = canvas.getBoundingClientRect();
        const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
        let last = 0, count = 0;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] > 100) { last = Math.floor(i / 4 / canvas.width); count++; }
        }
        return { bottom: rect.top + last / canvas.height * rect.height, count };
      });
      assert.ok(glyph.count > 1000, "The character brand must contain visible pixels");
      assert.ok(await page.locator(".identity-copy").evaluate((el, bottom) => el.getBoundingClientRect().top > bottom, glyph.bottom),
        `The character brand must not overlap the identity copy at ${viewport.width}x${viewport.height}`);
      assert.ok(await page.locator(".life").evaluate((el, bottom) => el.getBoundingClientRect().top > bottom, glyph.bottom),
        "Life should not collide with the character brand");
      assert.ok(await page.locator(".work-row").evaluate(el => el.getBoundingClientRect().top < innerHeight - 25),
        "The first viewport should reveal the Work directory");
      for (const name of ["work", "writing", "about"]) await panelClosed(page, name);
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
      await panelOpen(page, "work");
      assert.equal(await work.getAttribute("aria-expanded"), "true");
      const dayline = page.locator('#work-content .entry-link').first();
      assert.equal(await dayline.getAttribute("href"), "https://github.com/Haoo-7/Obsidian-Dayline");
      if (viewport.width > 760) {
        await dayline.hover();
        await page.waitForFunction(() => document.querySelector(".peek").style.opacity === "1" &&
          document.querySelector(".peek p").textContent === "Dayline Journal");
        await page.locator(".blog-link").hover();
        await page.waitForFunction(() => document.querySelector(".peek p").textContent === "Haoo Blog");
        await page.locator(".blog-link").click();
        await page.waitForFunction(() => document.querySelector("#blog-note").offsetHeight > 0);
      } else {
        await page.locator('[aria-label="Preview Dayline Journal"]').tap();
        await page.waitForFunction(() => document.querySelector("#dayline-preview").offsetHeight > 0 &&
          document.querySelector("#dayline-preview img").naturalWidth > 0);
        assert.equal(await page.locator('[aria-label="Preview Dayline Journal"]').getAttribute("aria-expanded"), "true");
        assert.equal(await page.locator(".peek").evaluate(el => getComputedStyle(el).display), "none");
      }
      await page.locator(".writing-row").click();
      await panelOpen(page, "writing");
      await panelClosed(page, "work");
      assert.equal(await page.locator('#writing-content .entry-link').first().getAttribute("href"), "https://sspai.com/post/106878");
      assert.equal(await page.locator('#writing-content .entry-link').nth(1).getAttribute("href"), "https://sspai.com/post/105685");
      if (viewport.width > 760) {
        await page.locator('#writing-content .entry-link').nth(1).focus();
        await page.waitForFunction(() => document.querySelector(".peek p").textContent === "A Kindle through high school");
      } else {
        await page.locator('[aria-label="Preview A Kindle through high school"]').tap();
        await page.waitForFunction(() => document.querySelector("#kindle-preview").offsetHeight > 0);
      }
      await page.keyboard.press("Escape");
      await panelClosed(page, "writing");
      await scroll(page, 2000);
      await assertDock(page);
      await page.locator('.nav a[href="#about"]').click();
      await panelOpen(page, "about");
      const about = page.locator(".about-row");
      await page.waitForFunction(() => {
        const top = document.querySelector(".about-row").getBoundingClientRect().top;
        return top >= document.querySelector(".nav").clientHeight - 1 && top < innerHeight;
      });
      assert.equal(await about.getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator('.contact .email').getAttribute("href"), "mailto:re11.zhou@gmail.com");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const externalLinks = await page.locator('a[target="_blank"]').evaluateAll(links => links.map(link => ({
        href: link.href, rel: link.rel
      })));
      assert.equal(externalLinks.length, 6);
      assert.ok(externalLinks.every(link => link.rel.includes("noopener") && link.rel.includes("noreferrer")));
      console.log(`PASS ${viewport.width}x${viewport.height}: first fold, dock, reverse, resize, hover/touch, previews, destinations, switching, Escape, About`);
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => document.body.dataset.ready === "true");
    await page.locator(".work-row").hover();
    assert.equal(await page.locator(".work-row .label-text").evaluate(el => Number(el.style.opacity)), 1);
    await page.locator(".work-row").click();
    await panelOpen(page, "work");
    assert.equal(await page.locator(".wordmark").evaluate(el => getComputedStyle(el).position), "absolute");
    console.log("PASS reduced motion: readable text, no character animation, working expansion");
    await page.close();
    const staticPage = await browser.newPage({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    await staticPage.goto(url);
    assert.ok(await staticPage.locator('#work-content').evaluate(el => el.clientHeight > 100));
    assert.ok(await staticPage.locator('#writing-content').evaluate(el => el.clientHeight > 100));
    assert.ok(await staticPage.locator('.wordmark .solid').isVisible());
    console.log("PASS no JavaScript: readable brand, projects, articles, contact");
    assert.deepEqual(errors, []);
    console.log("PASS no browser errors");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
