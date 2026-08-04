/**
 * fireworks.js - Fireworks Effect using fireworks-js library
 * Source: https://fireworks.js.org
 * Library: fireworks-js v2.10.8 (CDN: https://cdn.jsdelivr.net/npm/fireworks-js@2.10.8/dist/index.umd.js)
 * Integrated as background layer for kazuki-araya bio page.
 * Birthday auto-fire: 22/8
 * 
 * Behavior:
 * - Normal days: Canvas is initialized with intensity=0 (no auto-fire).
 *   Clicking on screen still launches fireworks manually.
 * - Birthday (triggerBirthdayFireworks): High intensity + continuous bursts.
 */
;(function() {
'use strict';

let fireworks = null;
let _birthdayLaunched = false;
let _birthdayInterval = null;
let _currentIntensity = 0;

/**
 * Initialize the fireworks effect
 * Creates a Fireworks instance attached to a fixed overlay canvas
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.autoStart=false] - Whether to auto-launch rockets
 * @param {number} [options.intensity=0] - Auto-launch intensity (0 = none)
 */
window.initFireworksEffect = function(options) {
  options = options || {};
  const autoStart = options.autoStart === true;
  const intensity = typeof options.intensity === 'number' ? options.intensity : 0;
  const quality = window.EFFECTS_QUALITY || 'high';
  const particleCount = window.getQualityProp ? window.getQualityProp('fireworksParticles') : 30;
  const trailEnabled = window.getQualityProp ? window.getQualityProp('fireworksTrail') : true;
  const isLowQuality = quality === 'low';
  _currentIntensity = intensity;

  // Clean up any previous instance
  if (fireworks) {
    fireworks.stop(true);
    // Remove old container
    const oldContainer = document.getElementById('fireworks-container');
    if (oldContainer) oldContainer.remove();
    fireworks = null;
  }

  // Skip on low quality / weak devices
  if (document.documentElement.classList.contains('araya-weak-device')) return;

  // Wait for Fireworks library to be available (loaded from CDN or local)
  const FireworksClass = window.Fireworks?.default || window.Fireworks;
  if (!FireworksClass) {
    console.warn('⚠️ Fireworks library not loaded yet, retrying...');
    setTimeout(function() {
      window.initFireworksEffect(options);
    }, 500);
    return;
  }

  // Create the container for fireworks - fullscreen, behind all content
  const container = document.createElement('div');
  container.id = 'fireworks-container';
  container.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:auto;z-index:0';
  document.body.insertBefore(container, document.body.firstChild);

  try {
    fireworks = new FireworksClass(container, {
      // Visual settings
      opacity: isLowQuality ? 0.2 : 0.3,
      acceleration: 1.02,
      friction: 0.97,
      gravity: 1.5,
      particles: particleCount,
      traceLength: isLowQuality ? 2 : 3,
      traceSpeed: isLowQuality ? 8 : 10,
      explosion: isLowQuality ? 3 : 5,
      // intensity = 0 on normal days → no auto-launch, only manual clicks
      intensity: intensity,
      flickering: isLowQuality ? 30 : 50,
      trail: trailEnabled,

      // Colors
      hue: { min: 0, max: 360 },
      brightness: { min: 50, max: 80 },
      decay: { min: 0.015, max: 0.03 },

      // Launch settings
      rocketsPoint: { min: 40, max: 60 },
      lineStyle: 'round',
      lineWidth: {
        explosion: { min: 1, max: 3 },
        trace: { min: 1, max: 2 }
      },
      delay: { min: 30, max: 60 },

      // ✅ Enable mouse click: click anywhere to shoot fireworks
      mouse: {
        click: true,
        move: false,
        max: isLowQuality ? 1 : 3
      },

      // Boundaries
      boundaries: {
        x: 50,
        y: 50,
        width: window.innerWidth,
        height: window.innerHeight
      },

      // Sound disabled to avoid audio issues
      sound: { enabled: false },

      // Auto-resize with window
      autoresize: true
    });

    // Always start the render loop so mouse clicks work,
    // but with intensity=0 → no rockets auto-launch on normal days.
    fireworks.start();

    var statusMsg = intensity > 0
      ? '🎆 Fireworks effect initialized (BIRTHDAY MODE — intensity=' + intensity + ')'
      : '🎆 Fireworks effect initialized (idle mode — click to launch)';
    console.log(statusMsg);
    console.log('💡 Click anywhere on screen to launch fireworks!');
  } catch (err) {
    console.error('⚠️ Failed to initialize fireworks:', err);
  }
};

/**
 * Trigger fireworks at specific coordinates
 * @param {number} x - X coordinate (unused, fireworks-js launches from bottom)
 * @param {number} y - Y coordinate (unused)
 * @param {object} options - Optional parameters { count }
 */
window.triggerFireworks = function(x, y, options) {
  if (!fireworks) {
    window.initFireworksEffect();
    setTimeout(function() {
      window.triggerFireworks(x, y, options);
    }, 300);
    return;
  }

  var count = (options && options.count) || 1;
  fireworks.launch(count);
};

/**
 * Trigger birthday fireworks - continuous celebration effect
 * Re-initializes fireworks with high intensity for spectacular effect.
 */
window.triggerBirthdayFireworks = function() {
  if (_birthdayLaunched) return;
  _birthdayLaunched = true;

  // Re-initialize with high intensity for birthday mode
  window.initFireworksEffect({
    autoStart: true,
    intensity: 120
  });

  // Launch an initial big volley
  if (fireworks) {
    fireworks.launch(10);
  }

  // Continuous bursts every 400ms for 30 bursts
  var burstCount = 0;
  var maxBursts = 30;

  function launchBurst() {
    if (burstCount >= maxBursts) return;
    burstCount++;

    if (fireworks) {
      // Launch 5-8 rockets per burst for a spectacular effect
      fireworks.launch(5 + Math.floor(Math.random() * 4));
    }

    _birthdayInterval = setTimeout(launchBurst, 400);
  }

  setTimeout(launchBurst, 600);
};

/**
 * Stop all fireworks activity
 */
window.stopFireworksLoop = function() {
  if (_birthdayInterval) {
    clearTimeout(_birthdayInterval);
    _birthdayInterval = null;
  }
  _birthdayLaunched = false;
};

/**
 * Stop fireworks completely and clean up
 */
window.stopFireworks = function() {
  window.stopFireworksLoop();
  if (fireworks) {
    fireworks.stop(false);
  }
};

/**
 * Toggle fireworks running state
 */
window.toggleFireworks = function() {
  if (!fireworks) return;
  if (fireworks.isRunning) {
    fireworks.pause();
  } else {
    fireworks.start();
  }
};
})();