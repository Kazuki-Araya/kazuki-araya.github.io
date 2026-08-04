/**
 * Performance manager — only reduces quality on mobile devices.
 * Desktop always runs at full quality.
 */

;(function() {
  const QUALITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };
  const QUALITY_LABELS = {
    high: '✨ Full quality',
    medium: '🔸 Balanced',
    low: '🔹 Lite mode'
  };

  window.EFFECTS_QUALITY = QUALITY.HIGH;

  function isMobile() {
    try {
      const ua = navigator.userAgent || '';
      const mobileUA = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const smallScreen = window.screen && Math.max(window.screen.width, window.screen.height) < 800;
      return mobileUA || coarsePointer || smallScreen;
    } catch {
      return false;
    }
  }

  function detectQuality() {
    // Desktop always gets HIGH quality — effects always at 100%
    if (!isMobile()) return QUALITY.HIGH;

    // User override in localStorage
    try {
      const saved = localStorage.getItem('araya-quality');
      if (saved && QUALITY_LABELS[saved]) return saved;
    } catch {}

    // Old system: user previously turned effects ON on mobile → MEDIUM
    try {
      if (localStorage.getItem('araya-effects-enabled') === 'on') return QUALITY.MEDIUM;
    } catch {}

    // Auto detect device capability for mobile devices only.
    const cpuCores = navigator.hardwareConcurrency || 4;
    let deviceMemory = 8;
    try { if (navigator.deviceMemory !== undefined) deviceMemory = navigator.deviceMemory; } catch {}

    let connectionSlow = false;
    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        const type = (conn.effectiveType || '').toLowerCase();
        if (['slow-2g', '2g', '3g'].includes(type)) connectionSlow = true;
        if (conn.downlink !== undefined && conn.downlink < 1.5) connectionSlow = true;
      }
    } catch {}

    let score = 0;
    if (cpuCores >= 8) score += 3;
    else if (cpuCores >= 6) score += 2;
    else if (cpuCores >= 4) score += 1;

    if (deviceMemory >= 8) score += 3;
    else if (deviceMemory >= 4) score += 2;
    else if (deviceMemory >= 2) score += 1;

    if (connectionSlow) score -= 2;

    if (score >= 6) return QUALITY.HIGH;
    if (score >= 4) return QUALITY.MEDIUM;
    return QUALITY.LOW;
  }

  const qualityProps = {
    high: {
      sakuraPetals: 18,
      sakuraShadow: true,
      sakuraFPS: 24,
      electricPoints: 240,
      electricShadow: true,
      electricFPS: 45,
      fireworksParticles: 20,
      fireworksTrail: true,
      fireworksFPS: 45,
      enableVideo: true,
      parallax: true,
      canvasScale: 1
    },
    medium: {
      sakuraPetals: 10,
      sakuraShadow: false,
      sakuraFPS: 18,
      electricPoints: 120,
      electricShadow: false,
      electricFPS: 30,
      fireworksParticles: 12,
      fireworksTrail: false,
      fireworksFPS: 30,
      enableVideo: false,
      parallax: false,
      canvasScale: 0.75
    },
    low: {
      sakuraPetals: 6,
      sakuraShadow: false,
      sakuraFPS: 12,
      electricPoints: 60,
      electricShadow: false,
      electricFPS: 20,
      fireworksParticles: 6,
      fireworksTrail: false,
      fireworksFPS: 20,
      enableVideo: false,
      parallax: false,
      canvasScale: 0.6
    }
  };

  window.getEffectProps = function(effectName) {
    const q = window.EFFECTS_QUALITY || QUALITY.HIGH;
    const props = qualityProps[q] || qualityProps.high;
    const map = {
      sakura: ['sakuraPetals', 'sakuraShadow', 'sakuraFPS'],
      electric: ['electricPoints', 'electricShadow', 'electricFPS'],
      fireworks: ['fireworksParticles', 'fireworksTrail', 'fireworksFPS']
    };
    const keys = map[effectName];
    if (!keys) return {};
    return { [keys[0]]: props[keys[0]], [keys[1]]: props[keys[1]], [keys[2]]: props[keys[2]] };
  };

  window.getQualityProp = function(key) {
    const q = window.EFFECTS_QUALITY || QUALITY.HIGH;
    const props = qualityProps[q] || qualityProps.high;
    return props[key];
  };

  window.createFPSLimiter = function(targetFPS) {
    if (targetFPS >= 55) return null;
    const interval = 1000 / targetFPS;
    let lastTime = 0;
    return function(callback, time) {
      if (time - lastTime >= interval) {
        lastTime = time;
        callback(time);
      }
    };
  };

  window.initPerformance = function() {
    // Cleanup previous state before reinit
    var existingToggle = document.getElementById('quality-toggle-btn');
    if (existingToggle) existingToggle.remove();

    const quality = detectQuality();
    window.EFFECTS_QUALITY = quality;

    // CSS classes
    document.documentElement.classList.remove('araya-weak-device', 'araya-medium-device', 'araya-high-device');
    document.body.classList.remove('araya-weak-device', 'araya-medium-device', 'araya-high-device');

    if (quality === QUALITY.LOW) {
      document.documentElement.classList.add('araya-weak-device');
      document.body.classList.add('araya-weak-device');
    } else if (quality === QUALITY.MEDIUM) {
      document.documentElement.classList.add('araya-medium-device');
      document.body.classList.add('araya-medium-device');
    } else {
      document.documentElement.classList.add('araya-high-device');
      document.body.classList.add('araya-high-device');
    }

    // Video - cleanup when disabled
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
      if (window.getQualityProp('enableVideo')) {
        bgVideo.style.display = '';
        bgVideo.play().catch(function() {});
      } else {
        bgVideo.pause();
        bgVideo.style.display = 'none';
        // Free up video memory by removing source
        if (bgVideo.firstChild) {
          bgVideo.removeChild(bgVideo.firstChild);
        }
        try { bgVideo.load(); } catch(e) {}
      }
    }

    // Parallax cleanup on medium/low
    if (!window.getQualityProp('parallax') || quality === QUALITY.LOW || quality === QUALITY.MEDIUM) {
      if (window._parallaxHandler) {
        document.removeEventListener('mousemove', window._parallaxHandler, { passive: true });
        window._parallaxHandler = null;
      }
    }

    // Show quality toggle button only on mobile
    if (isMobile()) {
      initQualityToggle(quality);
    }

    console.log('🎛️ Quality mode: ' + QUALITY_LABELS[quality] + ' (' + quality + ')');
  };

  function initQualityToggle(currentQuality) {
    var existing = document.getElementById('quality-toggle-btn');
    if (existing) existing.remove();

    var btn = document.createElement('button');
    btn.id = 'quality-toggle-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle quality mode');
    btn.innerHTML = QUALITY_LABELS[currentQuality];
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '70px',
      right: '15px',
      zIndex: '9999',
      padding: '6px 12px',
      fontSize: '12px',
      fontFamily: 'Poppins, sans-serif',
      background: 'rgba(0,0,0,0.65)',
      color: '#fff',
      border: '1px solid rgba(255,105,180,0.4)',
      borderRadius: '8px',
      cursor: 'pointer',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      transition: 'opacity 0.3s',
      opacity: '0.7'
    });
    btn.addEventListener('mouseenter', function() { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', function() { btn.style.opacity = '0.7'; });
    btn.addEventListener('click', function() {
      var order = [QUALITY.HIGH, QUALITY.MEDIUM, QUALITY.LOW];
      var idx = order.indexOf(window.EFFECTS_QUALITY);
      var next = order[(idx + 1) % order.length];
      try { localStorage.setItem('araya-quality', next); } catch {}
      window.location.reload();
    });
    document.body.appendChild(btn);

    // Keyboard shortcut Q to toggle
    document.addEventListener('keydown', function _keyHandler(e) {
      if (e.key === 'q' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
        btn.click();
      }
    });
  }
})();