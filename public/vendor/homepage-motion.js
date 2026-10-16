(async function () {
  const { logo, model, paint, reduced } = await createCharacterBrand();
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  createDirectoryMaterial(reduced);
  if (!reduced) {
    gsap.from(".topic", { opacity: 0, y: 18, duration: .38, stagger: .06, ease: "power3.out", delay: .12 });
    gsap.from(".identity-copy, .hero-action", { opacity: 0, y: 12, duration: .3, stagger: .06, ease: "power3.out", delay: .24 });
    const dock = document.querySelector(".dock");
    const opening = document.querySelector(".opening");
    const nav = document.querySelector(".nav");
    // One fixed wordmark travels from its document-space origin to the measured dock.
    document.body.appendChild(logo);
    logo.style.position = "fixed";
    const homeTop = () => opening.offsetTop + opening.offsetHeight * (innerWidth <= 760 ? .3 : .2);
    const placeOrigin = () => { logo.style.top = `${homeTop()}px`; };
    placeOrigin();
    ScrollTrigger.addEventListener("refreshInit", placeOrigin);
    const resolveBrand = trigger => {
      model.resolve = Math.min(1, trigger.progress / .4);
      paint();
    };
    const story = gsap.timeline({ scrollTrigger: { trigger: opening,
      start: () => `top ${nav.clientHeight}px`,
      end: () => `bottom ${nav.clientHeight + innerHeight * .2}px`,
      scrub: true, invalidateOnRefresh: true, onUpdate: resolveBrand, onRefresh: resolveBrand } });
    story.fromTo(logo, { scale: 1, x: 0, y: 0 }, { scale: () => dock.clientWidth / logo.clientWidth,
        x: () => dock.getBoundingClientRect().left - logo.offsetLeft,
        y: () => dock.getBoundingClientRect().top + dock.clientHeight / 2 -
          logo.offsetHeight * dock.clientWidth / logo.clientWidth / 2 - homeTop(),
        duration: 1, ease: "none", immediateRender: false }, 0)
      .to(".nav .identity", { opacity: 0, duration: .2, ease: "none" }, 0)
      .to(".tech", { x: -70, y: -80, opacity: 0, duration: .75, ease: "none" }, 0)
      .to(".history", { x: 90, y: -55, opacity: 0, duration: .7, ease: "none" }, 0)
      .to(".life", { x: -100, y: 50, opacity: 0, duration: .7, ease: "none" }, 0);
    document.querySelectorAll(".directory-row").forEach((row, index) => {
      const button = row.querySelector(".directory-button");
      if (!button) return;
      const title = button.querySelector(".title");
      const reveals = [
        { x: -32, opacity: 0 },
        { clipPath: "inset(100% 0 0 0)" },
        { y: 28, opacity: 0, rotation: -2 }
      ];
      gsap.from(title, {
        ...reveals[index],
        immediateRender: false,
        duration: .5,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 91%", once: true }
      });
      gsap.from(button.querySelector(".number"), {
        opacity: 0,
        y: 12,
        immediateRender: false,
        duration: .3,
        ease: "power3.out",
        delay: .06,
        scrollTrigger: { trigger: row, start: "top 91%", once: true }
      });
      gsap.to(button, {
        y: -24,
        ease: "power1.in",
        scrollTrigger: {
          trigger: button,
          start: () => `top ${nav.clientHeight}px`,
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    });
    gsap.from(".contact", { clipPath: "inset(0 100% 0 0)", immediateRender: false, duration: .55, ease: "power3.out",
      scrollTrigger: { trigger: ".footer", start: "top 94%", once: true } });
    ScrollTrigger.refresh();
    // Start after layout work so the first visible frame still contains scattered glyphs.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      gsap.to(model, { entry: 1, duration: .55, ease: "power2.out", onUpdate: paint,
        onComplete: () => { document.body.dataset.entryComplete = "true"; } });
    }));
  } else {
    document.body.dataset.entryComplete = "true";
  }
  document.body.dataset.ready = "true";

  const assets = {
    dayline: ["/images/projects/dayline-journal.webp", "Dayline Journal"],
    blog: ["/images/projects/haoo-blog.webp", "Haoo Blog"],
    ai: ["/images/posts/ai-assisted-learning.webp", "用 AI 辅助学习"],
    kindle: ["/images/posts/kindle-paperwhite-3.webp", "高中生的 Kindle"]
  };
  const peek = document.querySelector(".peek"), sheet = peek.firstElementChild;
  const image = sheet.querySelector("img"), caption = sheet.querySelector("p");
  const fine = matchMedia("(min-width:761px) and (hover:hover) and (pointer:fine)");
  let active = null, suppressed = null, last = { x: 0, y: 0 }, position = { x: 0, y: 0 };
  function move(x, y, immediate = false) {
    const w = peek.offsetWidth || 340, h = peek.offsetHeight || 285;
    const nx = x + 28 + w < innerWidth - 24 ? x + 28 : x - w - 28;
    const tx = Math.max(24, Math.min(innerWidth - w - 24, nx));
    const rowTop = active?.getBoundingClientRect().top ?? 92;
    const ty = Math.max(92, Math.min(innerHeight - h - 24, Math.max(rowTop + 16, y - h * .45)));
    gsap.to(position, { x: tx, y: ty, duration: reduced || immediate ? 0 : .35, ease: "power3.out", overwrite: true,
      onUpdate: () => gsap.set(peek, { x: position.x, y: position.y }) });
  }
  function hide() {
    active = null;
    gsap.to(peek, { autoAlpha: 0, duration: reduced ? 0 : .18, overwrite: true });
    gsap.to(sheet, { scale: .9, rotation: -5, duration: reduced ? 0 : .2, overwrite: true });
  }
  function show(row, event, focus = false) {
    if (!fine.matches || suppressed === row) return;
    const first = !active, changed = active !== row;
    active = row;
    const [src, title] = row.dataset.peekSrc
      ? [row.dataset.peekSrc, row.dataset.peekTitle]
      : assets[row.dataset.peek];
    image.src = src;caption.textContent = title;
    if (focus) {
      const r = row.getBoundingClientRect();
      last = { x: r.right - 40, y: r.top + r.height / 2 };
    } else last = { x: event.clientX, y: event.clientY };
    move(last.x, last.y, first || reduced);
    gsap.to(peek, { autoAlpha: 1, duration: reduced ? 0 : .18, overwrite: true });
    if (changed) gsap.fromTo(sheet, { scale: .9, rotation: -5 }, { scale: 1, rotation: 3, duration: reduced ? 0 : .45, ease: "power3.out", overwrite: true });
  }
  document.querySelectorAll("[data-peek]").forEach(row => {
    row.addEventListener("pointerenter", e => show(row, e));
    row.addEventListener("pointermove", e => { if (active !== row) return;last = { x: e.clientX, y: e.clientY };move(last.x, last.y); });
    row.addEventListener("pointerleave", () => { suppressed = null;hide(); });
    row.addEventListener("focus", e => show(row, e, true));
    row.addEventListener("blur", () => { suppressed = null;hide(); });
    row.addEventListener("click", hide);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { suppressed = active;hide(); } });
  window.addEventListener("scroll", () => {
    if (active && !active.contains(document.elementFromPoint(last.x, last.y))) hide();
  }, { passive: true });
  window.addEventListener("blur", hide);
  document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
  fine.addEventListener("change", hide);
})();
