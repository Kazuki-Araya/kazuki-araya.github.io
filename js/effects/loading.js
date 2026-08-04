/**
 * Loading Screen Effect
 * Full-page loading screen with progress bar
 */

window.initLoadingScreen = function() {
  console.log('⏳ Loading screen init');
  // Remove existing loading screen if any
  const existingLoader = document.getElementById('loading-screen');
  if (!existingLoader) {
    console.log('⏳ Creating loading screen');
    createLoadingScreen();
  } else {
    console.log('⏳ Loading screen already exists');
  }

  function createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-avatar">
        <img src="assets/images/avatar.jpg" alt="Loading..." fetchpriority="high">
      </div>
      <div class="loading-progress-container">
        <div class="loading-progress-bar" id="loading-progress-bar"></div>
      </div>
      <div class="loading-text">LOADING...</div>
    `;
    document.body.prepend(loadingScreen);
    console.log('⏳ Loading screen added to DOM');
  }

  const progressBar = document.getElementById('loading-progress-bar');
  let progress = 0;

  // Simulate loading progress
  function updateProgress() {
    if (progress < 30) {
      progress += Math.random() * 10;
    } else if (progress < 70) {
      progress += Math.random() * 5;
    } else if (progress < 90) {
      progress += Math.random() * 2;
    } else {
      progress = Math.min(progress + 0.5, 99);
    }
    
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }

    if (progress < 99) {
      setTimeout(updateProgress, 100);
    }
  }

  // Start progress simulation
  setTimeout(updateProgress, 100);

  // Complete loading when window is fully loaded
  window.addEventListener('load', () => {
    if (progressBar) {
      progressBar.style.width = '100%';
    }

    // Hide loading screen after a short delay
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
          loadingScreen.remove();
        }, 600);
      }
    }, 300);
  });

  // Fallback: hide loading screen after 10 seconds max
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      if (progressBar) {
        progressBar.style.width = '100%';
      }
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          loadingScreen.remove();
        }, 600);
      }, 200);
    }
  }, 10000);
};