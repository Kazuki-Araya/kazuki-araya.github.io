const typingRoles = [
  "Anime Fan",
  "Gamer",
  "Student",
  "Streamer",
];

let roleIndex = 0;
let charIndex = 0;
let typingDirection = 1;
let typingTimeout = null;

function getTypingDelay() {
  // Natural typing: slight randomness for realistic feel
  if (typingDirection === 1) {
    // Typing: 60-120ms per character
    return 60 + Math.random() * 60;
  } else {
    // Deleting: faster, 30-50ms per character
    return 30 + Math.random() * 20;
  }
}

function updateTyping() {
  const el = document.getElementById("typing");
  if (!el) {
    charIndex = 0;
    return;
  }

  const currentRole = typingRoles[roleIndex];

  if (typingDirection === 1) {
    // Typing forward
    el.textContent = currentRole.slice(0, charIndex + 1);
    charIndex += 1;
    if (charIndex >= currentRole.length) {
      typingDirection = -1;
      // Pause at full word: 2-3 seconds
      typingTimeout = setTimeout(updateTyping, 2000 + Math.random() * 1000);
      return;
    }
  } else {
    // Deleting backward
    el.textContent = currentRole.slice(0, charIndex - 1);
    charIndex -= 1;
    if (charIndex <= 0) {
      typingDirection = 1;
      roleIndex = (roleIndex + 1) % typingRoles.length;
      // Brief pause before typing next word
      typingTimeout = setTimeout(updateTyping, 400);
      return;
    }
  }

  typingTimeout = setTimeout(updateTyping, getTypingDelay());
}

function initTyping() {
  const el = document.getElementById("typing");
  if (el) {
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
    // Reset state
    roleIndex = 0;
    charIndex = 0;
    typingDirection = 1;
    updateTyping();
  }
}
