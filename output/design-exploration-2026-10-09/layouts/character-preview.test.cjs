const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function preview(moduleName, width, height, reducedMotion = false) {
  const source = fs.readFileSync(path.join(__dirname, "vendor", moduleName), "utf8");
  const observers = [];
  let maskReads = 0;
  let paints = 0;
  const context = {
    clearRect() {}, setTransform() {}, fillText() { paints++; }
  };
  const solid = { style: {} };
  const canvas = {
    getContext: () => context,
    addEventListener() {}
  };
  const logo = {
    offsetWidth: width, offsetHeight: height, offsetTop: 130,
    dataset: {}, classList: { toggle() {} },
    querySelector: selector => selector === ".solid" ? solid : canvas
  };
  const document = {
    body: { dataset: {} },
    documentElement: { classList: { remove() {} } },
    fonts: { ready: Promise.resolve() },
    addEventListener() {},
    querySelector: selector => selector === ".wordmark"
      ? logo
      : { clientHeight: 72, querySelector: () => ({}) },
    createElement() {
      const mask = {};
      mask.getContext = () => ({
        measureText: () => ({ fontBoundingBoxAscent: 100, fontBoundingBoxDescent: 20 }),
        fillText() {},
        getImageData(x, y, w, h) {
          assert.ok(w > 0 && h > 0, "A zero-sized mask cannot be read");
          maskReads++;
          return { data: new Uint8ClampedArray(w * h * 4).fill(255) };
        }
      });
      return mask;
    }
  };
  const timeline = { to() { return this; }, from() { return this; }, fromTo() { return this; } };
  const gsap = { registerPlugin() {}, set() {}, timeline: () => timeline, from() {}, to: () => ({ paused() {} }) };
  const window = { gsap, ScrollTrigger: {}, reducedMotion };
  vm.runInNewContext(source, {
    window, document, gsap, ScrollTrigger: { refresh() {} },
    devicePixelRatio: 1,
    getComputedStyle: () => ({
      fontSize: "128px", getPropertyValue: () => "#181818"
    }),
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    }
  });
  return {
    window, document, logo, canvas, observers,
    get maskReads() { return maskReads; },
    get paints() { return paints; }
  };
}

for (const moduleName of ["character-name.js", "homepage-motion.js"]) {
test(`${moduleName}: hidden preview waits for layout before drawing`, async () => {
  const p = preview(moduleName, 0, 0);
  p.window.initCharacterName();
  assert.equal(p.maskReads, 0);
  assert.equal(p.observers.length, 1);
  p.observers[0].callback();
  assert.equal(p.maskReads, 0);
  p.logo.offsetWidth = 342;
  p.logo.offsetHeight = 134;
  p.observers[0].callback();
  await Promise.resolve();
  assert.equal(p.observers[0].disconnected, true);
  assert.equal(p.maskReads, 1);
  assert.ok(p.paints > 0);
  assert.equal(p.logo.dataset.rendered, "true");
});

test(`${moduleName}: visible preview survives hide/show and viewport changes`, () => {
  const p = preview(moduleName, 342, 134);
  p.window.initCharacterName();
  const resize = p.observers[0];
  assert.equal(p.maskReads, 1);
  const initialWidth = p.canvas.width;
  p.logo.offsetWidth = 0;
  p.logo.offsetHeight = 0;
  resize.callback();
  assert.equal(p.maskReads, 1);
  assert.equal(p.canvas.width, initialWidth);
  p.logo.offsetWidth = 1184;
  p.logo.offsetHeight = 441;
  resize.callback();
  assert.equal(p.maskReads, 2);
  assert.equal(p.canvas.width, 1184);
});

test(`${moduleName}: reduced-motion preview also waits for hidden layout`, async () => {
  const p = preview(moduleName, 0, 0, true);
  p.window.initCharacterName();
  p.logo.offsetWidth = 272;
  p.logo.offsetHeight = 109;
  p.observers[0].callback();
  await Promise.resolve();
  assert.equal(p.maskReads, 1);
  assert.equal(p.document.body.dataset.ready, "true");
  assert.ok(p.paints > 0);
});
}
