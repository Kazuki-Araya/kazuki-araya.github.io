﻿﻿window.initMusic = function() {
  const music = document.getElementById("bg-music");
  let playBtn = document.getElementById("gh-play-btn");
  let prevBtn = document.getElementById("gh-prev-btn");
  let nextBtn = document.getElementById("gh-next-btn");
  const progressWrap = document.getElementById("gh-progress-wrap");
  const progressFill = document.getElementById("gh-progress-fill");
  const timeCurrent = document.getElementById("gh-time-current");
  const timeTotal = document.getElementById("gh-time-total");
  const songTitle = document.getElementById("gh-song-title");

  if (!music || !playBtn) return;

  const playlist = [
    { title: "Elegie", url: "assets/audio/MCK1.mp3" },
    { title: "IDK", url: "assets/audio/MCK2.mp3" },
    { title: "Wtf Bby I'm Lit", url: "assets/audio/MCK3.mp3" },
    { title: "Anh Không Muốn Nó Dễ Dàng", url: "assets/audio/MCK4.mp3" },
    { title: "Baby (feat. marzuz)", url: "assets/audio/MCK5.mp3" },
    { title: "Yêu Anh Giet Anh", url: "assets/audio/MCK6.mp3" },
    { title: "Mắt Môi Tay Chân (feat. Tage)", url: "assets/audio/MCK7.mp3" },
    { title: "Đao Của Anh Vừa", url: "assets/audio/MCK8.mp3" },
    { title: "Là Gì Của Nhau", url: "assets/audio/MCK9.mp3" },
    { title: "Night In Prague", url: "assets/audio/MCK10.mp3" },
    { title: "Một Cái Ôm", url: "assets/audio/MCK11.mp3" },
    { title: "Liệm", url: "assets/audio/MCK12.mp3" },
    { title: "Nếu Như Ta Chẳng Còn (feat. A$AP Ướt Mi)", url: "assets/audio/MCK13.mp3" },
    { title: "Ai Mới Là Kẻ Xấu Xa", url: "assets/audio/MCK14.mp3" },
    { title: "Slippery (feat. Tùng Dương)", url: "assets/audio/MCK15.mp3" },
    { title: "Intenpol", url: "assets/audio/MCK16.mp3" },
    { title: "Tây Thi", url: "assets/audio/MCK17.mp3" },
    { title: "Hút Và Hút", url: "assets/audio/MCK18.mp3" },
    { title: "Dưa Chua", url: "assets/audio/MCK19.mp3" },
    { title: "Xa Xôi (feat. Obito)", url: "assets/audio/MCK20.mp3" },
    { title: "Che Phủ", url: "assets/audio/MCK21.mp3" },
    { title: "Oanh M = Thuoc", url: "assets/audio/MCK22.mp3" },
    { title: "Ghet Xog Lai Thik", url: "assets/audio/MCK23.mp3" },
    { title: "Nhìn Kẻ Thù Của Tao", url: "assets/audio/MCK24.mp3" },
    { title: "Envy (feat. THANHDRAW)", url: "assets/audio/MCK25.mp3" },
    { title: "Cảm Ơn", url: "assets/audio/MCK26.mp3" },
    { title: "Không Cần Lo Cho Tao", url: "assets/audio/MCK27.mp3" },
    { title: "Huh (feat. RPT Orijinn & THANHDRAW)", url: "assets/audio/MCK28.mp3" },
    { title: "Nguyễn Văn Mười", url: "assets/audio/MCK29.mp3" },
    { title: "Thịt Lợn", url: "assets/audio/MCK30.mp3" }
  ];

  let currentTrackIndex = 0;

  function formatTime(secs) {
    if (isNaN(secs) || !isFinite(secs)) return "0:00";
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function updatePlayIcon() {
    if (music.paused) {
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
  }

  function updateTimeDisplay() {
    if (timeCurrent) timeCurrent.textContent = formatTime(music.currentTime);
    if (timeTotal && music.duration) timeTotal.textContent = formatTime(music.duration);
    if (music.duration && progressFill) {
      const ratio = music.currentTime / music.duration;
      progressFill.style.transform = `scaleX(${ratio})`;
    }
  }

  function loadTrack(index, shouldPlay = false) {
    if (index < 0 || index >= playlist.length) return;
    currentTrackIndex = index;
    
    music.pause();
    music.src = playlist[currentTrackIndex].url;
    music.load();

    if (songTitle) songTitle.textContent = playlist[currentTrackIndex].title;
    updatePlayIcon();

    if (shouldPlay) {
      music.play().then(() => {
        updatePlayIcon();
      }).catch((err) => {
        console.warn("Chờ người dùng tương tác để phát:", err);
        updatePlayIcon();
      });
    }
  }

  function togglePlay() {
    if (music.paused) {
      music.play().then(() => {
        updatePlayIcon();
      }).catch(err => console.error("Lỗi phát:", err));
    } else {
      music.pause();
      updatePlayIcon();
    }
  }

  function forwardTrack() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    loadTrack(nextIndex, true);
  }

  function rewindTrack() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    loadTrack(prevIndex, true);
  }

  // Làm sạch sự kiện bằng replaceWith
  const newPlayBtn = playBtn.cloneNode(true);
  playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
  playBtn = newPlayBtn;
  playBtn.addEventListener("click", togglePlay);

  if (prevBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    prevBtn = newPrevBtn;
    prevBtn.addEventListener("click", rewindTrack);
  }

  if (nextBtn) {
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    nextBtn = newNextBtn;
    nextBtn.addEventListener("click", forwardTrack);
  }

  // Lắng nghe sự kiện audio
  music.ondataavailable = null;
  music.ontimeupdate = updateTimeDisplay;
  music.onloadedmetadata = updateTimeDisplay;
  music.onended = function() {
    forwardTrack(); // Tự động chuyển bài khi hết
  };

  if (progressWrap) {
    progressWrap.onclick = function(e) {
      const rect = progressWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (music.duration) {
        music.currentTime = (clickX / rect.width) * music.duration;
      }
    };
  }

  // Nạp bài đầu tiên
  loadTrack(0, false);
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.initMusic) window.initMusic();
});
