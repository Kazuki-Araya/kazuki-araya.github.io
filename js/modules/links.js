function initLinks(){
  document.querySelectorAll("a.link").forEach(link => {
    link.addEventListener("click", () => {
      const sound = document.getElementById("click-sound");
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    });
  });

  const menuSocialTrigger = document.getElementById("menu-social-trigger");

  if (menuSocialTrigger) {
    menuSocialTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggleLinks();
    });
  }

  const closeButton = document.querySelector(".link-popup-close");
  if (closeButton) {
    closeButton.addEventListener("click", toggleLinks);
  }

  const popup = document.getElementById("link-popup");
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        toggleLinks();
      }
    });
  }
}
window.toggleLinks = function(){
  const popup = document.getElementById("link-popup");

  if (!popup) return;

  const isOpen = !popup.classList.contains("open");
  popup.classList.toggle("open", isOpen);
  popup.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
};
