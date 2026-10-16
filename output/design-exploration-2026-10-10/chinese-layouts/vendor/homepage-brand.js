/* Shared brand material. Each layout owns its scroll composition. */
window.createCharacterBrand = async function () {
  await document.fonts.ready;
  const logo = document.querySelector(".wordmark");
  await new Promise(resolve => {
    if (logo.clientWidth) return resolve();
    const observer = new ResizeObserver(() => {
      if (!logo.clientWidth) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(logo);
  });
  const canvas = logo.querySelector("canvas");
  const solid = logo.querySelector(".solid");
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches ||
    new URLSearchParams(location.search).get("motion") === "reduce";
  document.documentElement.dataset.motion = reduced ? "reduce" : "full";
  const model = { entry: reduced ? 1 : 0, resolve: 0 };
  const pointer = { x: -1000, y: -1000, strength: 0 };
  const ink = "#181818", blue = "#2456D6", alphabet = "0101{}<>/;=";
  let width, height, points = [], pointerTween;
  function paint() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const remaining = 1 - model.resolve;
    solid.style.opacity = model.resolve;
    if (!remaining) return;
    for (const p of points) {
      const arrived = Math.min(1, Math.max(0, (model.entry - p.delay) / (1 - p.delay)));
      const scatter = (1 - arrived) ** 3;
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const reach = Math.max(0, 1 - distance / 88) ** 2 * pointer.strength * remaining;
      const push = reach * 18 / Math.max(1, distance);
      ctx.fillStyle = p.blue || reach > .18 ? blue : ink;
      ctx.globalAlpha = remaining * (.65 + .35 * arrived);
      ctx.fillText(p.char, p.x + p.sx * scatter + dx * push, p.y + p.sy * scatter + dy * push);
    }
    ctx.globalAlpha = 1;
  }
  function rebuild() {
    if (!logo.clientWidth || !ctx) return;
    width = logo.clientWidth;
    const mask = document.createElement("canvas"), m = mask.getContext("2d", { willReadFrequently: true });
    m.font = "700 100px Satoshi";
    const size = width / (m.measureText("Haoo.").width / 100);
    logo.style.fontSize = `${size}px`;
    height = logo.offsetHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(width * dpr);canvas.height = Math.ceil(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mask.width = Math.ceil(width);mask.height = Math.ceil(height);
    m.font = `700 ${size}px Satoshi`;
    const metrics = m.measureText("Haoo.");
    const ascent = metrics.fontBoundingBoxAscent ?? size * .9;
    const descent = metrics.fontBoundingBoxDescent ?? size * .2;
    m.fillText("Haoo.", 0, (height - ascent - descent) / 2 + ascent);
    const data = m.getImageData(0, 0, mask.width, mask.height).data;
    const cell = size < 160 ? 4 : size < 260 ? 4 : 5;
    const row = cell * 1.4;
    points = [];
    for (let y = row / 2; y < height; y += row) {
      for (let x = cell / 2; x < width; x += cell) {
        if (data[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] < 100) continue;
        const seed = Math.floor(x / cell) * 17 + Math.floor(y / row) * 31;
        points.push({ x, y, char: alphabet[seed % alphabet.length], blue: x > width * .89 || seed % 47 === 0,
          delay: x / width * .18, sx: Math.sin(seed * 1.7) * 44, sy: Math.cos(seed * 2.3) * 34 });
      }
    }
    ctx.font = `700 ${cell * 1.55}px Menlo,monospace`;ctx.textAlign = "center";ctx.textBaseline = "middle";
    logo.dataset.rendered = "true";
    paint();
  }
  rebuild();
  let lastWidth = logo.clientWidth;
  const observer = new ResizeObserver(() => {
    if (!logo.clientWidth || Math.abs(logo.clientWidth - lastWidth) < 1) return;
    lastWidth = logo.clientWidth;
    rebuild();
  });
  observer.observe(logo);
  if (!ctx || !window.gsap) return { logo, model, paint, reduced: true };
  if (!reduced) {
    canvas.addEventListener("pointermove", event => {
      if (event.pointerType === "touch" || model.resolve > .4) return;
      const rect = canvas.getBoundingClientRect();
      pointerTween?.kill();
      pointerTween = gsap.to(pointer, { x: (event.clientX - rect.left) * width / rect.width,
        y: (event.clientY - rect.top) * height / rect.height, strength: 1, duration: .2, ease: "power2.out", onUpdate: paint });
    });
    canvas.addEventListener("pointerleave", () => {
      pointerTween?.kill();
      pointerTween = gsap.to(pointer, { strength: 0, duration: .3, ease: "power2.out", onUpdate: paint });
    });
  }
  return { logo, model, paint, reduced };
};
