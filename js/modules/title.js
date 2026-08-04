const titleText = "Kazuki Araya";
let titleIndex = 0;
let titleDirection = 1; // 1 = typing, -1 = deleting
let titleTimeout = null;

function animateTitle() {
    const el = document.querySelector("title");
    if (!el) return;

    if (titleDirection === 1) {
        // Typing forward
        el.textContent = titleText.substring(0, titleIndex + 1);
        titleIndex++;
        if (titleIndex >= titleText.length) {
            titleDirection = -1;
            // Pause 3s at full title before deleting
            titleTimeout = setTimeout(animateTitle, 3000);
            return;
        }
    } else {
        // Deleting backward
        el.textContent = titleText.substring(0, titleIndex - 1);
        titleIndex--;
        if (titleIndex <= 1) {
            titleDirection = 1;
            // Brief pause before retyping
            titleTimeout = setTimeout(animateTitle, 500);
            return;
        }
    }

    // Natural typing speed: 100-150ms typing, 50-80ms deleting
    const delay = titleDirection === 1 ? 100 + Math.random() * 50 : 50 + Math.random() * 30;
    titleTimeout = setTimeout(animateTitle, delay);
}

// Cleanup on page unload
window.addEventListener("beforeunload", function() {
    if (titleTimeout) clearTimeout(titleTimeout);
});

// Start immediately
animateTitle();