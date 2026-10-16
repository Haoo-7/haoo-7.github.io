/* The glyph mask supplies the shape; GSAP owns entry and scroll progress. */
window.initCharacterName = function () {
  const logo = document.querySelector(".wordmark");
  const solid = logo.querySelector(".solid");
  const canvas = logo.querySelector("canvas");
  // Comparison previews are mounted while hidden; canvas masks need a real layout.
  if (!logo.offsetWidth || !logo.offsetHeight) {
    const pendingLayout = new ResizeObserver(() => {
      if (!logo.offsetWidth || !logo.offsetHeight) return;
      pendingLayout.disconnect();
      document.fonts.ready.then(() => window.initCharacterName());
    });
    pendingLayout.observe(logo);
    return;
  }
  const context = canvas.getContext("2d");
  if (!context || !window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.remove("motion-entry");
    document.body.dataset.ready = "true";
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const colors = getComputedStyle(document.documentElement);
  const ink = colors.getPropertyValue("--ink").trim();
  const blue = colors.getPropertyValue("--accent").trim();
  const model = { entry: window.reducedMotion ? 1 : 0, resolve: 0, scan: -.1 };
  const pointer = { x: -1000, y: -1000, strength: 0 };
  let width, height, points = [];
  let pointerTween;
  const alphabet = "0101{}<>/;=";

  function paint() {
    context.clearRect(0, 0, width, height);
    const remaining = 1 - model.resolve;
    if (remaining <= 0) return;
    context.globalAlpha = remaining;
    for (const p of points) {
      const arrival = Math.min(1, Math.max(0, (model.entry - p.delay) / (1 - p.delay)));
      const offset = (1 - arrival) ** 3;
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const reach = Math.max(0, 1 - distance / 88) ** 2 * pointer.strength * remaining;
      const push = reach * 16 / Math.max(distance, 1);
      const wave = Math.max(0, 1 - Math.abs(p.x / width - model.scan) / .055) * remaining;
      const x = p.x + p.scatterX * offset + dx * push;
      const y = p.y + p.scatterY * offset + dy * push - wave * 1.5;
      context.fillStyle = p.blue || reach > .2 || wave > .8 ? blue : ink;
      context.globalAlpha = remaining * (.6 + .4 * arrival);
      context.fillText(p.char, x, y);
    }
    context.globalAlpha = 1;
  }

  function rebuild() {
    if (!logo.offsetWidth || !logo.offsetHeight) return;
    width = logo.offsetWidth;
    height = logo.offsetHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const size = parseFloat(getComputedStyle(logo).fontSize);
    const mask = document.createElement("canvas");
    mask.width = Math.ceil(width);
    mask.height = Math.ceil(height);
    const m = mask.getContext("2d", { willReadFrequently: true });
    m.font = `700 ${size}px Satoshi`;
    // Match the actual font's baseline instead of hard-coding an ascent ratio.
    const metrics = m.measureText("Haoo.");
    const ascent = metrics.fontBoundingBoxAscent ?? size * .9;
    const descent = metrics.fontBoundingBoxDescent ?? size * .2;
    m.fillText("Haoo.", 0, (height - ascent - descent) / 2 + ascent);
    const pixels = m.getImageData(0, 0, mask.width, mask.height).data;
    const cell = size <= 140 ? 3.5 : size <= 240 ? 4 : 5.5;
    const row = cell * 1.4;
    points = [];
    for (let y = row / 2; y < height; y += row) {
      for (let x = cell / 2; x < width; x += cell) {
        if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] < 100) continue;
        const seed = Math.floor(x / cell) * 17 + Math.floor(y / row) * 31;
        points.push({
          x, y,
          char: alphabet[seed % alphabet.length],
          blue: x > width * .89 || seed % 47 === 0,
          delay: x / width * .22,
          scatterX: Math.sin(seed * 1.7) * 42,
          scatterY: Math.cos(seed * 2.3) * 36
        });
      }
    }
    context.font = `700 ${cell * 1.6}px Menlo, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    logo.dataset.rendered = "true";
    paint();
    solid.style.opacity = model.resolve;
  }

  rebuild();
  const resize = new ResizeObserver(() => rebuild());
  resize.observe(logo);
  if (window.reducedMotion) {
    document.body.dataset.ready = "true";
    return;
  }

  const nav = document.querySelector(".nav");
  const identity = nav.querySelector(".identity");
  const sweep = gsap.to(model, {
    scan: 1.1, duration: 6, repeat: -1, ease: "none",
    onUpdate: () => {
      if (!document.hidden && model.resolve < 1) paint();
    }
  });
  document.addEventListener("visibilitychange", () => {
    sweep.paused(document.hidden || model.resolve >= 1);
  });
  gsap.set(logo, { opacity: 1 });
  const story = gsap.timeline({
    scrollTrigger: {
      trigger: ".opening", start: "top top", end: "bottom 80px",
      scrub: true, invalidateOnRefresh: true,
      onUpdate: self => {
        logo.classList.toggle("is-docked", self.progress > .4);
        sweep.paused(document.hidden || self.progress >= .38);
      }
    }
  });
  story.to(model, { resolve: 1, duration: .38, ease: "none", onUpdate: () => {
    solid.style.opacity = model.resolve;
    paint();
  } }, 0)
    .to(logo, {
      scale: () => 82 / logo.offsetWidth,
      y: () => nav.clientHeight / 2 - logo.offsetTop - logo.offsetHeight * (82 / logo.offsetWidth) / 2,
      duration: 1, ease: "none"
    }, 0)
    .to(identity, { opacity: 0, duration: .25, ease: "none" }, 0)
    .to(".opening-copy", { opacity: 0, duration: .22, ease: "none" }, 0)
    .to(".ghost.tech", { x: 140, y: -45, opacity: 0, duration: .42, ease: "none" }, 0)
    .to(".ghost.life", { x: -65, y: -40, opacity: 0, duration: .38, ease: "none" }, 0)
    .to(".ghost.history", { x: 90, opacity: 0, duration: .35, ease: "none" }, 0);
  ScrollTrigger.refresh();
  const entry = gsap.timeline({
    onComplete: () => { document.body.dataset.ready = "true"; }
  });
  entry.to(model, { entry: 1, duration: .55, ease: "power2.out", onUpdate: paint }, 0)
    .from(".ghost", { opacity: 0, y: 18, duration: .4, stagger: .04, ease: "power3.out" }, 0)
    .fromTo(".opening-copy > *", { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: .26, stagger: .06, ease: "power3.out" }, .2);
  document.documentElement.classList.remove("motion-entry");

  canvas.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" || model.resolve > .4) return;
    const rect = canvas.getBoundingClientRect();
    pointerTween?.kill();
    pointerTween = gsap.to(pointer, {
      x: (event.clientX - rect.left) * width / rect.width,
      y: (event.clientY - rect.top) * height / rect.height,
      strength: 1, duration: .2, ease: "power2.out", onUpdate: paint
    });
  });
  canvas.addEventListener("pointerleave", () => {
    pointerTween?.kill();
    pointerTween = gsap.to(pointer, { strength: 0, duration: .35, ease: "power2.out", onUpdate: paint });
  });
  gsap.from(".dayline .project-media", {
    clipPath: "inset(0 0 100% 0)", duration: .75, ease: "power3.out",
    scrollTrigger: { trigger: ".dayline .project-media", start: "top 90%", once: true }
  });
  gsap.from(".blog .project-media", {
    clipPath: "inset(0 100% 0 0)", duration: .6, ease: "power3.out",
    scrollTrigger: { trigger: ".blog", start: "top 85%", once: true }
  });
  gsap.from(".writing .article-copy", {
    opacity: 0, x: -24, stagger: .08, duration: .45, ease: "power3.out",
    scrollTrigger: { trigger: ".writing", start: "top 75%", once: true }
  });
  gsap.from(".contact-top", {
    y: 24, opacity: 0, duration: .45, ease: "power3.out",
    scrollTrigger: { trigger: ".contact", start: "top 90%", once: true }
  });
};
