﻿window.initApp = function(){
  if(typeof initPerformance === "function") initPerformance();
  if(typeof initBirthday === "function") initBirthday();
  if(typeof initTheme === "function") initTheme();
  if(typeof initIntro === "function") initIntro();
  if(typeof initMusic === "function") initMusic();
  if(typeof initLinks === "function") initLinks();
  if(typeof initTyping === "function") initTyping();
  if(typeof initAge === "function") initAge();
  if(typeof initPopup === "function") initPopup();
  if(typeof initSecret === "function") initSecret();
  if(typeof initProfileWidgets === "function") initProfileWidgets();
  if(typeof initSakuraEffect === "function") initSakuraEffect();
  if(typeof initFireworksEffect === "function") initFireworksEffect();
  if(typeof initElectricBorderEffect === "function") initElectricBorderEffect();
  if(typeof initVisitor === "function") initVisitor();
  if(typeof initSpotify === "function") initSpotify();
  if(typeof initMusicPlayer === "function") initMusicPlayer();
  if(typeof initCustomCursor === "function" && window.EFFECTS_QUALITY === 'high') initCustomCursor();
  
  if(typeof initScrollAnimations === "function") initScrollAnimations();
  if(typeof initMisc === "function") initMisc();
  if(typeof initCopyButtons === "function") initCopyButtons();
};

function initCopyButtons() {
  document.querySelectorAll('.copy-button[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      if (targetId) {
        copyGameID(targetId);
      }
    });
  });
}

function initMisc(){
  // Parallax using CSS transform on body instead of backgroundPosition (causes repaint)
  const parallaxEnabled = window.getQualityProp ? window.getQualityProp('parallax') : true;
  if (window.innerWidth > 1024 && parallaxEnabled){
    let rafId = null;
    window._parallaxHandler = function(e) {
      if (rafId) return;
      rafId = requestAnimationFrame(function() {
        // Use CSS custom properties instead of backgroundPosition for GPU-friendly parallax
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        document.documentElement.style.setProperty('--parallax-x', x.toFixed(2));
        document.documentElement.style.setProperty('--parallax-y', y.toFixed(2));
        rafId = null;
      });
    };
    document.addEventListener("mousemove", window._parallaxHandler, { passive: true });
  }
  // Removed unused scroll handler to reduce unnecessary work.
  document.addEventListener("copy", function() {
    console.log("U need handwritte");
  });
  
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("./sw.js").then(function(reg) {
        try { reg.update(); } catch (e) {}
        try {
          navigator.serviceWorker.getRegistrations().then(function(regs) {
            regs.forEach(function(r) { try { r.update(); } catch (_) {} });
          });
        } catch (e) {}
        reg.addEventListener('updatefound', function() {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        });
      }).catch(function(err) {
        console.error('SW registration failed:', err);
      });
    });
  }
  if (window.location.search.includes("fbclid=")) {
    const url = new URL(window.location);
    url.searchParams.delete("fbclid");
    const newUrl = url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "") + url.hash;
    window.history.replaceState({}, document.title, newUrl);
  }
}

/**
 * Copy game ID to clipboard
 * @param {string} elementId - The ID of the element containing the game ID
 */
window.copyGameID = function(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const text = element.textContent;
  const button = element.parentElement.querySelector(".copy-button");
  
  // Use modern Clipboard API if available
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback(button);
    }).catch(() => {
      fallbackCopyToClipboard(text, button);
    });
  } else {
    fallbackCopyToClipboard(text, button);
  }
};

/**
 * Fallback method for copying to clipboard
 * @param {string} text - The text to copy
 * @param {HTMLElement} button - The copy button element
 */
function fallbackCopyToClipboard(text, button) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showCopyFeedback(button);
  } catch (err) {
    console.error("Copy failed:", err);
  }
  document.body.removeChild(textarea);
}

/**
 * Show visual feedback when copying
 * @param {HTMLElement} button - The copy button element
 */
function showCopyFeedback(button) {
  if (button && button.classList.contains("copy-button")) {
    button.classList.add("copied");
    button.disabled = true;
    setTimeout(() => {
      button.classList.remove("copied");
      button.disabled = false;
    }, 2000);
  }
}