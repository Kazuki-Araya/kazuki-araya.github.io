let _sakuraAnimationId = null;
let _sakuraPaused = false;

function initSakuraEffect() {
  const sakuraCanvas = document.getElementById("sakura-canvas");
  if (!sakuraCanvas) return;

  // ── Quality-aware settings ──────────────────────────
  const petalCount = window.getQualityProp ? window.getQualityProp('sakuraPetals') : 22;
  const hasShadow = window.getQualityProp ? window.getQualityProp('sakuraShadow') : true;
  const targetFPS = window.getQualityProp ? window.getQualityProp('sakuraFPS') : 20;
  const canvasScale = window.getQualityProp ? window.getQualityProp('canvasScale') : 1;

  // If 0 petals, skip entirely
  if (petalCount <= 0) {
    sakuraCanvas.style.display = 'none';
    return;
  }

  // Cleanup previous animation if any
  if (_sakuraAnimationId) {
    cancelAnimationFrame(_sakuraAnimationId);
    _sakuraAnimationId = null;
  }

  const qualityIsLow = document.documentElement.classList.contains("araya-weak-device");
  const ctx = sakuraCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  let wind = 0;

  // Throttled resize
  let resizeTimer = null;
  function resizeCanvas() {
    const scaledWidth = Math.floor(window.innerWidth * canvasScale);
    const scaledHeight = Math.floor(window.innerHeight * canvasScale);
    sakuraCanvas.width = scaledWidth;
    sakuraCanvas.height = scaledHeight;
    sakuraCanvas.style.width = window.innerWidth + 'px';
    sakuraCanvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", function() {
    if (resizeTimer) return;
    resizeTimer = setTimeout(function() {
      resizeCanvas();
      resizeTimer = null;
    }, 100);
  }, { passive: true });

  // ── Object pool for petals ─────────────────────────
  const petalPool = [];
  const finalCount = qualityIsLow ? Math.ceil(petalCount * 0.7) : petalCount;

  function resetPetal(p) {
    p.depth = Math.random();
    p.x = Math.random() * sakuraCanvas.width;
    p.y = -20 - Math.random() * 100;
    p.size = 4 + p.depth * 10;
    p.speedY = 0.3 + p.depth * 1.2;
    p.speedX = (Math.random() * 1 - 0.5) * (p.depth + 0.3);
    p.angle = Math.random() * Math.PI * 2;
    p.spin = (Math.random() * 0.02 - 0.01) * (p.depth + 0.5);
    p.swing = Math.random() * 3 * (p.depth + 0.5);
  }

  function createPetal() {
    return {
      depth: 0, x: 0, y: 0, size: 0, speedY: 0, speedX: 0,
      angle: 0, spin: 0, swing: 0
    };
  }

  for (let i = 0; i < finalCount; i++) {
    const p = createPetal();
    resetPetal(p);
    petalPool.push(p);
  }

  const PETAL_OUT_OF_BOUNDS = sakuraCanvas.height + 20;

  function updatePetal(p) {
    p.y += p.speedY;
    p.x += Math.sin(p.angle + wind) * p.swing + p.speedX;
    p.angle += p.spin;
    if (p.y > PETAL_OUT_OF_BOUNDS) {
      p.y = -20;
      p.x = Math.random() * sakuraCanvas.width;
    }
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = 0.4 + p.depth * 0.6;
    ctx.fillStyle = "rgba(255,182,193,0.95)";
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Optimized FPS-limited animation loop ────────────
  const skipThrottle = targetFPS >= 55;
  const frameInterval = 1000 / targetFPS;
  let lastTime = 0;
  let lastDrawTime = 0;

  function animate(time) {
    _sakuraAnimationId = requestAnimationFrame(animate);

    // Pause when tab hidden
    if (_sakuraPaused) return;

    // FPS throttle
    if (!skipThrottle) {
      if (time - lastDrawTime < frameInterval) return;
      lastDrawTime = time;
    } else {
      if (time - lastTime < frameInterval) return;
      lastTime = time;
    }

    wind += 0.01;
    ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

    if (hasShadow) {
      ctx.shadowColor = "#ffb6c1";
      ctx.shadowBlur = 10;
    }

    for (let i = 0; i < petalPool.length; i++) {
      updatePetal(petalPool[i]);
      drawPetal(petalPool[i]);
    }
  }
  _sakuraAnimationId = requestAnimationFrame(animate);

  // Visibility pause/resume
  document.addEventListener("visibilitychange", function() {
    _sakuraPaused = document.hidden;
  });
}