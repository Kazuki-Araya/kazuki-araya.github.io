﻿﻿﻿﻿window.initMusic = function() {
  const music = document.getElementById("bg-music");
  const playBtn = document.getElementById("gh-play-btn");
  const prevBtn = document.getElementById("gh-prev-btn");
  const nextBtn = document.getElementById("gh-next-btn");
  const progressWrap = document.getElementById("gh-progress-wrap");
  const progressFill = document.getElementById("gh-progress-fill");
  const timeCurrent = document.getElementById("gh-time-current");
  const timeTotal = document.getElementById("gh-time-total");
  const songTitle = document.getElementById("gh-song-title");

  if (!music || !playBtn) return;

  const playlist = [
    {
      title: "Bengier kurwy v3",
      url: "assets/audio/kazuki.mp3"
    }
  ];

  let currentTrackIndex = 0;

  function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  function updatePlayState() {
    if (music.paused) {
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
  }

  function updateTimeDisplay() {
    if (timeCurrent) timeCurrent.textContent = formatTime(music.currentTime);
    if (music.duration && timeTotal) timeTotal.textContent = formatTime(music.duration);
    if (music.duration && progressFill) {
      progressFill.style.transform = `scaleX(${music.currentTime / music.duration})`;
    }
  }

  function refreshTitle() {
    if (songTitle) {
      songTitle.textContent = playlist[currentTrackIndex]?.title || songTitle.textContent;
    }
  }

  function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    currentTrackIndex = index;
    const track = playlist[index];
    music.src = track.url;
    music.load();
    refreshTitle();
  }

  window.toggleMusic = function() {
    if (music.paused) {
      pauseOtherAudio();
      music.play().catch((err) => console.log("Yêu cầu tương tác trước khi phát nhạc:", err));
    } else {
      music.pause();
    }
    updatePlayState();
  };

  function pauseOtherAudio() {
    const audios = document.querySelectorAll("audio");
    audios.forEach((audio) => {
      if (audio !== music && !audio.paused) {
        audio.pause();
      }
    });
  }

  function rewindMusic() {
    if (music.currentTime > 5) {
      music.currentTime = 0;
    } else {
      music.currentTime = 0;
    }
  }

  function forwardMusic() {
    if (music.duration) {
      music.currentTime = Math.min(music.currentTime + 10, music.duration);
    }
  }

  playBtn.addEventListener('click', window.toggleMusic);
  if (prevBtn) prevBtn.addEventListener('click', rewindMusic);
  if (nextBtn) nextBtn.addEventListener('click', forwardMusic);

  music.addEventListener("loadedmetadata", () => {
    updateTimeDisplay();
    refreshTitle();
  });

  music.addEventListener("timeupdate", updateTimeDisplay);

  if (progressWrap) {
    progressWrap.addEventListener("click", (e) => {
      const rect = progressWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      if (music.duration) {
        music.currentTime = (clickX / width) * music.duration;
      }
    });
  }

  loadTrack(0);


  // Cố gắng phát nhạc ngay khi tải trang (nếu trình duyệt cho phép)
  pauseOtherAudio();
  music.play().then(updatePlayState).catch(() => {});
};
