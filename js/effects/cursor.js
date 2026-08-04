window.initCustomCursor = function() {
};

// New particle cursor (sakura) implemented as initCustomCursor
(function(){
  function createParticleCursor(options) {
    const hasWrapperEl = options && options.element;
    const element = hasWrapperEl ? options.element : document.body;

    const possibleEmoji = ["🌸"];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cursor = { x: width / 2, y: height / 2 };
    let particles = [];
    let canvas, context, animationFrame;
    let isPaused = false;

    let canvImages = [];

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    prefersReducedMotion.onchange = () => {
      if (prefersReducedMotion.matches) destroy(); else init();
    };

    function init() {
      if (prefersReducedMotion.matches) return false;

      canvas = document.createElement("canvas");
      context = canvas.getContext("2d");

      canvas.style.top = "0px";
      canvas.style.left = "0px";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = options && options.zIndex ? options.zIndex : "9999999999";

      if (hasWrapperEl) {
        canvas.style.position = "absolute";
        element.appendChild(canvas);
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
      } else {
        canvas.style.position = "fixed";
        document.body.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
      }

      const fontSize = 22;
      context.font = `${fontSize}px serif`;
      context.textBaseline = "middle";
      context.textAlign = "center";

      possibleEmoji.forEach((emoji) => {
        let measurements = context.measureText(emoji);
        let bgCanvas = document.createElement("canvas");
        let bgContext = bgCanvas.getContext("2d");

        bgCanvas.width = Math.ceil(measurements.width) + 8 || fontSize;
        bgCanvas.height = Math.ceil(fontSize * 1.2) || fontSize;

        bgContext.textAlign = "center";
        bgContext.font = `${fontSize}px serif`;
        bgContext.textBaseline = "middle";
        bgContext.fillText(emoji, bgCanvas.width / 2, bgCanvas.height / 2);

        canvImages.push(bgCanvas);
      });

      bindEvents();
      loop();
    }

    function bindEvents() {
      element.addEventListener("mousemove", onMouseMove, { passive: true });
      element.addEventListener("touchmove", onTouchMove, { passive: true });
      element.addEventListener("touchstart", onTouchMove, { passive: true });
      window.addEventListener("resize", onWindowResize, { passive: true });
    }

    // Throttled resize
    let resizeTimeout = null;
    function onWindowResize() {
      if (resizeTimeout) return;
      resizeTimeout = setTimeout(function() {
        width = window.innerWidth;
        height = window.innerHeight;
        if (hasWrapperEl) {
          canvas.width = element.clientWidth;
          canvas.height = element.clientHeight;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        resizeTimeout = null;
      }, 100);
    }

    function onTouchMove(e) {
      if (isPaused) return;
      if (e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          addParticle(e.touches[i].clientX, e.touches[i].clientY, canvImages[Math.floor(Math.random() * canvImages.length)]);
        }
      }
    }

    function onMouseMove(e) {
      if (isPaused) return;
      if (hasWrapperEl) {
        const boundingRect = element.getBoundingClientRect();
        cursor.x = e.clientX - boundingRect.left;
        cursor.y = e.clientY - boundingRect.top;
      } else {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
      }
      addParticle(cursor.x, cursor.y, canvImages[Math.floor(Math.random() * canvImages.length)]);
    }

    function addParticle(x, y, img) {
      particles.push(new Particle(x, y, img));
    }

    function updateParticles() {
      if (!context || isPaused) return;
      if (particles.length == 0) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) particles[i].update(context);
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].lifeSpan < 0) particles.splice(i, 1);
      if (particles.length == 0) context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function loop() { 
      updateParticles(); 
      animationFrame = requestAnimationFrame(loop); 
    }

    function destroy() {
      try { if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas); } catch (e) {}
      if (animationFrame) cancelAnimationFrame(animationFrame);
      element.removeEventListener("mousemove", onMouseMove);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchstart", onTouchMove);
      window.removeEventListener("resize", onWindowResize);
      particles = [];
    }

    function Particle(x, y, canvasItem) {
      const lifeSpan = Math.floor(Math.random() * 60 + 80);
      this.initialLifeSpan = lifeSpan;
      this.lifeSpan = lifeSpan;
      this.velocity = { x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2), y: 1 + Math.random() };
      this.position = { x: x, y: y };
      this.canv = canvasItem;

      this.update = function (context) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.lifeSpan--;
        this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
        this.velocity.y -= Math.random() / 300;
        const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);
        const degrees = 2 * this.lifeSpan;
        const radians = degrees * 0.0174533;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(radians);
        context.drawImage(this.canv, (-this.canv.width / 2) * scale, -this.canv.height / 2, this.canv.width * scale, this.canv.height * scale);
        context.restore();
      };
    }

    init();

    // Register visibility pause/resume
    document.addEventListener("visibilitychange", function() {
      isPaused = document.hidden;
    });

    return { destroy };
  }

  // Expose init function expected by app
  window.initCustomCursor = function(options) {
    try {
      if (window._customCursorInstance && typeof window._customCursorInstance.destroy === 'function') {
        window._customCursorInstance.destroy();
      }
    } catch (e) {}
    window._customCursorInstance = createParticleCursor(options || {});
  };

  window.destroyCustomCursor = function() {
    if (window._customCursorInstance && typeof window._customCursorInstance.destroy === 'function') {
      window._customCursorInstance.destroy();
      window._customCursorInstance = null;
    }
  };
})();