(async function () {
  const { logo, model, paint, reduced } = await createCharacterBrand();
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (!reduced) {
    gsap.from(".type-band > span", { y: 24, rotation: 0, opacity: 0, duration: .4, stagger: .06, ease: "power3.out", delay: .12 });
    gsap.from(".hero-bottom", { opacity: 0, y: 14, duration: .3, ease: "power3.out", delay: .24 });
    const dock = document.querySelector(".dock");
    const story = gsap.timeline({ scrollTrigger: { trigger: ".opening", start: "top 84px", end: "bottom 180px", scrub: true, invalidateOnRefresh: true } });
    story.to(model, { resolve: 1, duration: .4, ease: "none", onUpdate: paint }, 0)
      .to(logo, { scale: () => 84 / logo.clientWidth,
        y: () => dock.getBoundingClientRect().top - logo.offsetTop - 84, duration: 1, ease: "none" }, 0)
      .to(".nav .identity", { opacity: 0, duration: .2, ease: "none" }, 0)
      .to(".type-band .tech", { x: -140, opacity: 0, duration: .8, ease: "none" }, 0)
      .to(".type-band .history", { x: 140, opacity: 0, duration: .8, ease: "none" }, 0)
      .to(".type-band .life", { y: 90, rotation: 8, opacity: 0, duration: .8, ease: "none" }, 0);
    gsap.from(".project-item", { clipPath: "inset(0 100% 0 0)", immediateRender: false, duration: .6, stagger: .08, ease: "power3.out",
      scrollTrigger: { trigger: ".projects", start: "top 85%", once: true } });
    gsap.from(".article-title", { y: 36, opacity: 0, immediateRender: false, duration: .5, stagger: .07, ease: "power3.out",
      scrollTrigger: { trigger: ".writing", start: "top 75%", once: true } });
    gsap.from(".contact p", { rotation: -3, y: 18, opacity: 0, immediateRender: false, duration: .45, ease: "power3.out",
      scrollTrigger: { trigger: ".contact", start: "top 85%", once: true } });
    ScrollTrigger.refresh();
  }

  const assets = {
    dayline: ["assets/dayline.webp", "Dayline Journal"],
    blog: ["assets/blog-writing.webp", "Haoo Blog"],
    ai: ["assets/ai-learning.webp", "Learning with AI"],
    kindle: ["assets/kindle.webp", "A Kindle through high school"]
  };
  const peek = document.querySelector(".peek"), card = peek.firstElementChild;
  const image = card.querySelector("img"), caption = card.querySelector("p");
  const fine = matchMedia("(min-width:761px) and (hover:hover) and (pointer:fine)");
  let active, blocked, last = { x: 0, y: 0 };
  function position(x, y, now) {
    const w = peek.offsetWidth || 350, h = peek.offsetHeight || 275;
    const side = x + 30 + w < innerWidth - 24 ? x + 30 : x - 30 - w;
    gsap.to(peek, { x: Math.max(24, Math.min(innerWidth - w - 24, side)),
      y: Math.max(92, Math.min(innerHeight - h - 24, y - h * .45)),
      duration: reduced || now ? 0 : .4, ease: "power2.out", overwrite: "auto" });
  }
  function hide() {
    active = null;
    gsap.to(peek, { autoAlpha: 0, duration: reduced ? 0 : .16, overwrite: "auto" });
    gsap.to(card, { scale: .85, rotation: -8, duration: reduced ? 0 : .2, overwrite: true });
  }
  function show(row, event, keyboard = false) {
    if (!fine.matches || row === blocked) return;
    const first = !active, changed = active !== row;
    active = row;
    const [src, text] = assets[row.dataset.image];
    image.src = src;caption.textContent = text;
    const r = row.getBoundingClientRect();
    last = keyboard ? { x: r.right - 40, y: r.top + r.height / 2 } : { x: event.clientX, y: event.clientY };
    position(last.x, last.y, first);
    gsap.to(peek, { autoAlpha: 1, duration: reduced ? 0 : .18, overwrite: "auto" });
    if (changed) gsap.fromTo(card, { scale: 1.12, rotation: 10 }, { scale: 1, rotation: -4, duration: reduced ? 0 : .42, ease: "power4.out", overwrite: true });
  }
  document.querySelectorAll("[data-image]").forEach(row => {
    row.addEventListener("pointerenter", e => show(row, e));
    row.addEventListener("pointermove", e => { if (active !== row) return;last = { x: e.clientX, y: e.clientY };position(last.x, last.y); });
    row.addEventListener("pointerleave", () => { blocked = null;hide(); });
    row.addEventListener("focus", e => show(row, e, true));
    row.addEventListener("blur", () => { blocked = null;hide(); });
    row.addEventListener("click", hide);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { blocked = active;hide(); } });
  window.addEventListener("scroll", () => {
    if (active && !active.contains(document.elementFromPoint(last.x, last.y))) hide();
  }, { passive: true });
  window.addEventListener("blur", hide);
  document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
  fine.addEventListener("change", hide);
  document.querySelectorAll(".index-button, .article-button").forEach(button => {
    button.addEventListener("click", () => {
      const panel = button.closest(".project-item, .article-item")?.querySelector(".item-detail");
      if (!panel) return;
      const willOpen = panel.hidden;
      document.querySelectorAll(".item-detail").forEach(other => { if (other !== panel) other.hidden = true; });
      panel.hidden = !willOpen;
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".item-detail").forEach(panel => { panel.hidden = true; });
    document.querySelectorAll(".index-button, .article-button").forEach(button => { button.setAttribute("aria-expanded", "false"); });
  });
})();
