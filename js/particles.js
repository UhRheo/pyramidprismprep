(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, dpr;
  let nodes = [];
  let rafId = null;

  function themeColors() {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches &&
      document.documentElement.getAttribute("data-theme") !== "light" ||
      document.documentElement.getAttribute("data-theme") === "dark";
    return dark
      ? { dot: "rgba(79, 216, 255, 0.55)", line: "rgba(79, 216, 255, 0.14)" }
      : { dot: "rgba(91, 95, 240, 0.4)", line: "rgba(91, 95, 240, 0.10)" };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(70, Math.max(28, Math.floor((w * h) / 24000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.6
    }));
  }

  function step() {
    const { dot, line } = themeColors();
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    const linkDist = 130;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDist) {
          ctx.strokeStyle = line;
          ctx.globalAlpha = 1 - d / linkDist;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = dot;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    rafId = requestAnimationFrame(step);
  }

  function drawStaticFrame() {
    const { dot } = themeColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = dot;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) drawStaticFrame();
  });

  resize();
  if (reduceMotion) {
    drawStaticFrame();
  } else {
    rafId = requestAnimationFrame(step);
  }
})();
