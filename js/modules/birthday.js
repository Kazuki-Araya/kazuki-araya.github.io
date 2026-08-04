const BIRTH_MONTH = 7; // 0-indexed: 7 = August
const BIRTH_DAY = 22;

/**
 * Lấy ngày sinh nhật tiếp theo
 */
function getNextBirthday(now) {
  const year = now.getFullYear();
  const nextBirthday = new Date(year, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0);
  return now > nextBirthday ? new Date(year + 1, BIRTH_MONTH, BIRTH_DAY, 0, 0, 0) : nextBirthday;
}

/**
 * Format thời gian đếm ngược
 */
function formatCountdown(diffMs) {
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} ngày ${hours}h ${minutes}m ${seconds}s`;
  }
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Kiểm tra xem hôm nay có phải sinh nhật không
 */
function isBirthdayToday(now) {
  return now.getDate() === BIRTH_DAY && now.getMonth() === BIRTH_MONTH;
}

/**
 * Refresh countdown
 */
function refreshBirthdayCountdown() {
  const countdownElement = document.getElementById('birthday-countdown');
  if (!countdownElement) return;

  try {
    const now = new Date();

    if (isBirthdayToday(now)) {
      countdownElement.textContent = '🎉 Hôm nay là sinh nhật 🎉';
      if (typeof window.triggerBirthdayFireworks === 'function') {
        window.triggerBirthdayFireworks();
      }
      return;
    }

    const nextBirthday = getNextBirthday(now);
    const diffTime = nextBirthday.getTime() - now.getTime();

    if (diffTime <= 0) {
      countdownElement.textContent = '🎉 Hôm nay là sinh nhật 🎉';
      return;
    }

    countdownElement.textContent = formatCountdown(diffTime);
  } catch (error) {
    console.error('Birthday countdown error:', error);
    countdownElement.textContent = 'Lỗi tính toán';
  }
}

/**
 * Khởi tạo module birthday
 */
window.initBirthday = function() {
  console.log("🎂 initBirthday called");
  refreshBirthdayCountdown();
  console.log("🎂 First countdown set");
  
  // Use visibility-aware interval if available, otherwise fallback
  if (window._registerVisibilityInterval) {
    window._registerVisibilityInterval('birthday', refreshBirthdayCountdown, 1000);
  } else {
    setInterval(refreshBirthdayCountdown, 1000);
  }
  console.log("🎂 Countdown interval set");

  // Test mode: show fireworks button when ?test=1 is in URL
  try {
    if (new URLSearchParams(window.location.search).get('test') === '1') {
      const testBtn = document.getElementById('test-fireworks-btn');
      if (testBtn) {
        testBtn.style.display = 'inline';
        testBtn.addEventListener('click', function() {
          if (typeof window.triggerBirthdayFireworks === 'function') {
            window.triggerBirthdayFireworks();
          } else if (typeof window.triggerFireworks === 'function') {
            window.triggerFireworks(
              window.innerWidth * 0.5,
              window.innerHeight * 0.3,
              { count: 60, speed: 5, radius: 4, colors: ["#ff79c6", "#ffffff", "#ffb6c1", "#ffd700"] }
            );
          }
          setTimeout(function() {
            if (typeof window.stopFireworksLoop === 'function') {
              window.stopFireworksLoop();
            }
          }, 8000);
        });
      }
    }
  } catch (e) {}
};