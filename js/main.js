﻿function detectDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Tablet|webOS|BlackBerry|Opera Mini/i.test(ua) || window.matchMedia('(pointer: coarse)').matches;
  document.body.classList.toggle('device-mobile', isMobile);
  document.body.classList.toggle('device-desktop', !isMobile);
  window.isMobileDevice = isMobile;
  return isMobile;
}

document.addEventListener("DOMContentLoaded", async () => {
  const isMobile = detectDeviceType();

  // Try to prompt service workers to check for updates before initializing heavy effects
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      const updates = regs.map(r => { try { return r.update(); } catch (e) { return Promise.resolve(); } });
      await Promise.race([Promise.all(updates), new Promise(res => setTimeout(res, 600))]);
    } catch (e) {}
  }

  if (!isMobile && !window.location.hash) {
    window.scrollTo(0, 0);
  }

  const menuTrigger = document.getElementById('menu-trigger');
  const fluidMenu = document.getElementById('fluid-menu');
  if (menuTrigger && fluidMenu) {
    menuTrigger.addEventListener('click', () => fluidMenu.classList.toggle('expanded'));
    const menuLinks = fluidMenu.querySelectorAll('.sub-item');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        fluidMenu.classList.remove('expanded');
      });
    });
  }

  if (window.initApp && typeof window.initApp === "function") {
    window.initApp();
  }

  if ("IntersectionObserver" in window) {
    initIntersectionObserver();
  }
  
  // Visibility-aware pausing for all intervals/animations
  initVisibilityManager();
});

function initIntersectionObserver() {
  const images = document.querySelectorAll("img[loading='lazy']");

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.src && img.src !== "") {
          img.style.opacity = "0";
          img.style.transition = "opacity 0.3s ease";
          if (img.complete && img.naturalWidth !== 0) {
            img.style.opacity = "1";
          } else {
            img.onload = () => {
              img.style.opacity = "1";
            };
          }
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: "50px 0px",
    threshold: 0.01
  });

  images.forEach(img => imageObserver.observe(img));
}

// Visibility manager: pauses/resumes intervals based on tab visibility
var _visibilityIntervals = [];
var _visibilityRafCallbacks = [];

window._registerVisibilityInterval = function(id, intervalFn, ms) {
  const interval = { id: id, fn: intervalFn, ms: ms, timerId: null, running: true };
  
  function start() {
    interval.timerId = setInterval(interval.fn, interval.ms);
    interval.running = true;
  }
  function stop() {
    if (interval.timerId) {
      clearInterval(interval.timerId);
      interval.timerId = null;
    }
    interval.running = false;
  }
  
  start();
  _visibilityIntervals.push({ stop: stop, start: start, interval: interval });
  return { stop: stop, resume: start };
};

window._registerVisibilityRaf = function(callback) {
  var rafId = null;
  var isRunning = true;
  
  function stop() {
    isRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }
  function resume() {
    if (isRunning) return;
    isRunning = true;
  }
  
  _visibilityRafCallbacks.push({ stop: stop, resume: resume });
  return { stop: stop, resume: resume };
};

function initVisibilityManager() {
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      // Pause all registered intervals
      _visibilityIntervals.forEach(function(item) {
        item.stop();
      });
    } else {
      // Resume all registered intervals
      _visibilityIntervals.forEach(function(item) {
        item.start();
      });
    }
  });
}

window.addEventListener("beforeunload", () => {
  console.log("🔚 Page unloading");
});

// Log visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("👁️ Tab is hidden");
  } else {
    console.log("👁️ Tab is visible");
  }
});