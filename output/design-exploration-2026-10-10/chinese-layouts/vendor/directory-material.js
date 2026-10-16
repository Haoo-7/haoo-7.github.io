window.createDirectoryMaterial = function (reduced) {
  const fine = matchMedia("(hover:hover) and (pointer:fine)");
  document.querySelectorAll(".directory-button").forEach(button => {
    const label = button.querySelector(".label");
    const text = label.querySelector(".label-text");
    const canvas = label.querySelector("canvas");
    const context = canvas.getContext("2d");
    const state = { progress: 1 };
    let points = [], width = 0, height = 0, tween, hovered = false;

    function paint() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const resolve = Math.max(0, (state.progress - .55) / .45);
      text.style.opacity = String(resolve);
      context.globalAlpha = 1 - resolve;
      context.fillStyle = "#FCFCFC";
      for (const point of points) {
        const offset = Math.sin(point.seed) * 5 * (1 - state.progress);
        context.fillText(point.char, point.x + offset, point.y);
      }
      context.globalAlpha = 1;
    }

    function rebuild() {
      width = label.clientWidth;
      height = label.clientHeight;
      if (!context || !width || !height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mask = document.createElement("canvas");
      mask.width = width; mask.height = height;
      const m = mask.getContext("2d", { willReadFrequently: true });
      const style = getComputedStyle(text);
      m.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const metrics = m.measureText(text.textContent);
      m.fillText(text.textContent, 0, (height - metrics.fontBoundingBoxAscent -
        metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent);
      const pixels = m.getImageData(0, 0, width, height).data;
      points = [];
      for (let y = 3; y < height; y += 6) {
        for (let x = 2; x < width; x += 4) {
          if (pixels[(y * width + x) * 4 + 3] < 100) continue;
          const seed = x * 17 + y * 31;
          points.push({ x, y, seed, char: "01{}<>/"[seed % 7] });
        }
      }
      context.font = "700 6px Menlo,monospace";
      context.textAlign = "center"; context.textBaseline = "middle";
      paint();
    }

    function engage() {
      if (button.classList.contains("is-engaged")) return;
      button.classList.add("is-engaged");
      if (reduced || !context) return;
      state.progress = 0;
      paint();
      button.dataset.material = "digital";
      tween = gsap.to(state, { progress: 1, duration: .7, ease: "power2.inOut",
        onUpdate: paint, onComplete: () => { button.dataset.material = "rest"; } });
    }
    function release() {
      if (hovered || button.matches(":focus-visible")) return;
      button.classList.remove("is-engaged");
      tween?.kill();
      state.progress = 1;
      paint();
      button.dataset.material = "rest";
    }
    button.addEventListener("pointerenter", event => {
      if (!fine.matches || event.pointerType === "touch") return;
      hovered = true; engage();
    });
    button.addEventListener("pointerleave", () => { hovered = false; release(); });
    button.addEventListener("focus", engage);
    button.addEventListener("blur", release);
    window.addEventListener("blur", () => { hovered = false; release(); });
    new ResizeObserver(rebuild).observe(label);
    rebuild();
  });
};
