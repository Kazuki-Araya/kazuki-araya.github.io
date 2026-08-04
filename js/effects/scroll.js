/**
 * Scroll Animations
 * Fade in + slide up animation using Intersection Observer
 */

window.initScrollAnimations = function() {
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all elements immediately
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('active');
    });
    return;
  }

  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all reveal elements
  const revealElements = document.querySelectorAll('.section.reveal');
  revealElements.forEach(el => {
    observer.observe(el);
  });

  // Also observe other reveal elements if any
  const otherReveal = document.querySelectorAll('.reveal:not(.section)');
  otherReveal.forEach(el => {
    observer.observe(el);
  });
};