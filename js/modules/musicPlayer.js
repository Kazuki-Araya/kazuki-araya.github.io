/**
 * Music Player Modal Module
 * Player nhạc đầy đủ với modal, playlist, volume, seek
 */

window.initMusicPlayer = function() {
  const playerAudio = document.getElementById("player-audio");
  const playerModal = document.getElementById("music-player-modal");

  if (!playerAudio || !playerModal) return;

  let playlist = window.getConfig("musicPlayer.playlist") || [
    {
      title: "Nuts",
      artist: "Lil Peep",
      url: "assets/audio/Lil Peep - nuts.mp3",
      cover: "assets/images/Nuts.jpg"
    },
    {
      title: "Linh đình",
      artist: "Xuanpac",
      url: "assets/audio/Linh đình - Xuanpac.mp3",
      cover: "assets/images/linhdinh.png"
    },
    {
      title: "Tâm sự",
      artist: "Solmee",
      url: "assets/audio/Tâm sự - Solmee.mp3",
      cover: "assets/images/tamsu.png"
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;

  function updatePlayerUI() {
    const track = playlist[currentTrackIndex];
    const coverImg = document.getElementById("player-cover-img");
    const titleEl = document.getElementById("player-song-title");
    const artistEl = document.getElementById("player-artist");
    const playBtn = document.getElementById("player-modal-play");

    if (coverImg) coverImg.src = track.cover;
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;

    if (playBtn) {
      playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    updatePlaylistUI();
  }

  function updatePlaylistUI() {
    const playlistItems = document.getElementById("player-playlist-items");
    if (!playlistItems) return;

    playlistItems.innerHTML = playlist
      .map(
        (track, index) =>
          `<div class="playlist-item ${index === currentTrackIndex ? "active" : ""}" onclick="playerSelectTrack(${index})">
        ${track.title}
      </div>`
      )
      .join("");
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function pauseOtherAudio() {
    const audios = document.querySelectorAll("audio");
    audios.forEach((audio) => {
      if (audio !== playerAudio && !audio.paused) {
        audio.pause();
      }
    });
  }

  function updateProgress() {
    const current = playerAudio.currentTime;
    const duration = playerAudio.duration;

    const currentEl = document.getElementById("player-time-current");
    const totalEl = document.getElementById("player-time-total");
    const fillEl = document.getElementById("player-progress-fill");
    const inputEl = document.getElementById("player-progress-input");

    if (currentEl) currentEl.textContent = formatTime(current);
    if (totalEl) totalEl.textContent = formatTime(duration);
    if (fillEl) fillEl.style.transform = 'scaleX(' + (current / duration) + ')';
    if (inputEl) {
      inputEl.max = duration;
      inputEl.value = current;
    }
  }

  function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;

    currentTrackIndex = index;
    const track = playlist[index];

    playerAudio.src = track.url;
    updatePlayerUI();
  }

  function playTrack() {
    pauseOtherAudio();
    playerAudio.play().catch(() => {});
    isPlaying = true;
    updatePlayerUI();
  }

  function pauseTrack() {
    playerAudio.pause();
    isPlaying = false;
    updatePlayerUI();
  }

  // Global functions
  window.openMusicPlayer = function() {
    if (!playerModal) return;
    playerModal.style.display = "flex";
    loadTrack(currentTrackIndex);
  };

  window.closeMusicPlayer = function() {
    if (!playerModal) return;
    playerModal.style.display = "none";
  };

  window.playerTogglePlay = function() {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  };

  window.playerNext = function() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }
    loadTrack(nextIndex);
    playTrack();
  };

  window.playerPrevious = function() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }
    loadTrack(prevIndex);
    playTrack();
  };

  window.playerSelectTrack = function(index) {
    loadTrack(index);
    playTrack();
  };

  const openPlayerButton = document.getElementById('open-music-player-btn');
  if (openPlayerButton) {
    openPlayerButton.addEventListener('click', window.openMusicPlayer);
  }

  const closeModalButton = playerModal ? playerModal.querySelector('.player-close') : null;
  if (closeModalButton) {
    closeModalButton.addEventListener('click', window.closeMusicPlayer);
  }

  const prevButton = document.getElementById('player-modal-prev');
  if (prevButton) {
    prevButton.addEventListener('click', window.playerPrevious);
  }

  const playButton = document.getElementById('player-modal-play');
  if (playButton) {
    playButton.addEventListener('click', window.playerTogglePlay);
  }

  const nextButton = document.getElementById('player-modal-next');
  if (nextButton) {
    nextButton.addEventListener('click', window.playerNext);
  }

  // Event Listeners
  if (playerAudio) {
    playerAudio.addEventListener("loadedmetadata", updateProgress);
    playerAudio.addEventListener("timeupdate", updateProgress);
    playerAudio.addEventListener("ended", () => {
      window.playerNext();
    });

    // Seek
    const progressInput = document.getElementById("player-progress-input");
    if (progressInput) {
      progressInput.addEventListener("input", (e) => {
        playerAudio.currentTime = e.target.value;
      });
    }

    // Volume
    const volumeSlider = document.getElementById("player-volume");
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        playerAudio.volume = e.target.value / 100;
      });
    }
  }

  // Close modal on outside click
  if (playerModal) {
    playerModal.addEventListener("click", (e) => {
      if (e.target === playerModal) {
        window.closeMusicPlayer();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && playerModal.style.display === "flex") {
        window.closeMusicPlayer();
      }
    });
  }

  // Initialize
  loadTrack(0);
};