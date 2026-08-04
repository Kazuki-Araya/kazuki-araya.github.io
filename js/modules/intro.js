let _introTypingTimeout = null;

function initIntro(){
  const intro = document.getElementById("intro");
  if (!intro) return;

  // ── Typing effect for "Kazuki Araya" ──────────────
  const introTitle = document.getElementById("intro-title-text");
  if (introTitle) {
    const text = "Kazuki Araya";
    let charIndex = 0;
    // Clear any previous timeout
    if (_introTypingTimeout) {
      clearTimeout(_introTypingTimeout);
      _introTypingTimeout = null;
    }

    function typeNextChar() {
      if (charIndex < text.length) {
        introTitle.textContent = text.slice(0, charIndex + 1) + "|";
        charIndex += 1;
        // Random delay for natural feel: 60-120ms
        _introTypingTimeout = setTimeout(typeNextChar, 60 + Math.random() * 60);
      } else {
        // Done typing - show full text without cursor
        introTitle.textContent = text;
        // Enable click handler after typing completes
        enableIntroClick(intro);
      }
    }

    // Start typing immediately
    typeNextChar();
  } else {
    // No title element, enable click immediately
    enableIntroClick(intro);
  }
}

function enableIntroClick(intro) {
  // Remove old listener to prevent duplicates
  const oldHandler = intro._clickHandler;
  if (oldHandler) {
    intro.removeEventListener("click", oldHandler);
  }

  const handleIntroClick = function() {
    intro.classList.add("hide-intro");
    intro.style.pointerEvents = "none";

    // Kích hoạt phát nhạc khi người dùng nhấn vào màn hình Intro
    if (typeof window.toggleMusic === "function") {
      const bgMusic = document.getElementById("bg-music");
      if (bgMusic && bgMusic.paused) window.toggleMusic();
    }
    
    intro.removeEventListener("click", handleIntroClick);
    intro._clickHandler = null;
  };

  intro._clickHandler = handleIntroClick;
  intro.addEventListener("click", handleIntroClick);
}