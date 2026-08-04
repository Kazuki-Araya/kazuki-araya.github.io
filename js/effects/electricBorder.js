let _electricAnimationId = null;
let _electricPaused = false;

function initElectricBorderEffect() {
  const canvas = document.getElementById("electricCanvas");
  const wrapper = document.querySelector(".electric-border");
  if (!canvas || !wrapper) return;

  // ── Quality-aware settings ──────────────────────────
  const pointCount = window.getQualityProp ? window.getQualityProp('electricPoints') : 350;
  const hasShadow = window.getQualityProp ? window.getQualityProp('electricShadow') : true;
  const targetFPS = window.getQualityProp ? window.getQualityProp('electricFPS') : 60;
  const canvasScale = window.getQualityProp ? window.getQualityProp('canvasScale') : 1;

  // On LOW quality, skip the canvas electric border entirely
  if (pointCount <= 30) {
    canvas.style.display = 'none';
    return;
  }

  // Cleanup previous animation if any
  if (_electricAnimationId) {
    cancelAnimationFrame(_electricAnimationId);
    _electricAnimationId = null;
  }

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const padding = 61;

  // Throttled resize
  let resizeTimer = null;
  function resizeCanvas() {
    if (_electricAnimationId) {
      cancelAnimationFrame(_electricAnimationId);
      _electricAnimationId = null;
    }
    const rect = wrapper.getBoundingClientRect();
    const scaledWidth = Math.floor((rect.width + padding * 2) * canvasScale);
    const scaledHeight = Math.floor((rect.height + padding * 2) * canvasScale);
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    canvas.style.width = (rect.width + padding * 2) + "px";
    canvas.style.height = (rect.height + padding * 2) + "px";
    canvas.style.position = "absolute";
    canvas.style.left = "-" + padding + "px";
    canvas.style.top = "-" + padding + "px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "20";
    ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
    if (!_electricAnimationId) {
      _electricAnimationId = requestAnimationFrame(draw);
    }
  }

  resizeCanvas();
  window.addEventListener("resize", function() {
    if (resizeTimer) return;
    resizeTimer = setTimeout(function() {
      resizeCanvas();
      resizeTimer = null;
    }, 100);
  }, { passive: true });

  let t = 0;

  function noise(x) {
    return Math.sin(x * 2.3) * 0.5 + Math.sin(x * 5.7) * 0.25;
  }

  const noiseAmp = pointCount < 100 ? 5 : 10;
  const skipThrottle = targetFPS >= 55;
  const frameInterval = 1000 / targetFPS;
  let lastDrawTime = 0;

  function draw(time) {
    _electricAnimationId = requestAnimationFrame(draw);

    // Pause when tab hidden
    if (_electricPaused) return;

    // FPS throttle
    if (!skipThrottle && (time - lastDrawTime < frameInterval)) return;
    lastDrawTime = time;

    t += 0.015;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ff8bc4";
    ctx.lineWidth = 2;
    const margin = padding;
    const w = canvas.width - margin * 2;
    const h = (canvas.height - margin * 2) + 4;
    const r = 30;
    ctx.beginPath();
    for (let i = 0; i <= pointCount; i++) {
      let p = i / pointCount;
      let x, y;
      if (p < 0.25) {
        x = margin + r + (w - r * 2) * (p / 0.25);
        y = margin;
      } else if (p < 0.5) {
        x = margin + w;
        y = margin + r + (h - r * 2) * ((p - 0.25) / 0.25);
      } else if (p < 0.75) {
        x = margin + w - r - (w - r * 2) * ((p - 0.5) / 0.25);
        y = margin + h;
      } else {
        x = margin;
        y = margin + h - r - (h - r * 2) * ((p - 0.75) / 0.25);
      }
      const n = noise(p * 30 + t) * noiseAmp;
      x += Math.cos(p * 50 + t) * n;
      y += Math.sin(p * 50 + t) * n;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    if (hasShadow) {
      ctx.shadowColor = "#ff69b4";
      ctx.shadowBlur = 20;
    }
    ctx.stroke();
  }

  _electricAnimationId = requestAnimationFrame(draw);

  // Visibility pause/resume
  document.addEventListener("visibilitychange", function() {
    _electricPaused = document.hidden;
  });
}