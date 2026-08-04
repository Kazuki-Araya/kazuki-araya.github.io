/**
 * Spotify Real-time Integration Module
 * Hiển thị bài hát đang nghe trên Spotify thông qua Lanyard API (Discord Presence)
 */

const SPOTIFY_CONFIG = {
  clientId: '',
  clientSecret: '',
  redirectUri: window.location.origin,
  scopes: 'user-read-currently-playing user-read-recently-played'
};

const SPOTIFY_TOKEN_KEY = 'kazuki_spotify_token';
const SPOTIFY_REFRESH_KEY = 'kazuki_spotify_refresh';
const SPOTIFY_CACHE_KEY = 'kazuki_spotify_last_track';

async function getSpotifyAccessToken() {
  const stored = localStorage.getItem(SPOTIFY_TOKEN_KEY);
  if (stored) {
    try {
      const tokenData = JSON.parse(stored);
      if (tokenData.expires_at > Date.now()) {
        return tokenData.access_token;
      }
    } catch (e) {}
  }
  return null;
}

let spotifyPlayerReady = false;

function updateSpotifyUI(trackData, isPlaying) {
  const spotifyWidget = document.getElementById('spotify-realtime-widget');
  if (!spotifyWidget) return;

  const coverImg = document.getElementById('spotify-album-cover');
  const trackName = document.getElementById('spotify-track-name');
  const trackArtist = document.getElementById('spotify-track-artist');
  const progressBlock = document.getElementById('spotify-progress-block');
  const fallbackMsg = document.getElementById('spotify-fallback-msg');
  const statusText = document.getElementById('spotify-playing-status');
  const statusDot = document.getElementById('spotify-status-dot');

  if (trackData) {
    if (coverImg) coverImg.src = trackData.albumArt || trackData.cover || 'assets/images/discord.webp';
    if (trackName) trackName.textContent = trackData.name || 'Không rõ tên bài';
    if (trackArtist) trackArtist.textContent = trackData.artist || 'Không rõ nghệ sĩ';
    
    if (isPlaying && trackData.progressMs && trackData.durationMs) {
      if (progressBlock) progressBlock.style.display = 'flex';
      if (fallbackMsg) fallbackMsg.style.display = 'none';
      updateSpotifyProgress(trackData.progressMs, trackData.durationMs);
    } else {
      if (progressBlock) progressBlock.style.display = 'none';
      if (fallbackMsg) fallbackMsg.style.display = 'block';
    }
    
    if (statusText) statusText.textContent = isPlaying ? 'Đang nghe' : 'Gần đây';
    if (statusDot) statusDot.style.color = isPlaying ? '#1DB954' : '#747f8d';
  } else {
    if (trackName) trackName.textContent = 'Không có bài hát';
    if (trackArtist) trackArtist.textContent = 'Chưa nghe nhạc gần đây';
    if (progressBlock) progressBlock.style.display = 'none';
    if (fallbackMsg) fallbackMsg.style.display = 'block';
    if (fallbackMsg) fallbackMsg.innerHTML = '<i class="fas fa-info-circle"></i> Đăng nhập Spotify để hiển thị';
    if (statusText) statusText.textContent = 'Chưa kết nối';
    if (statusDot) statusDot.style.color = '#747f8d';
  }
}

let spotifyProgressInterval = null;

function updateSpotifyProgress(progressMs, durationMs) {
  const currentEl = document.getElementById('spotify-progress-current');
  const totalEl = document.getElementById('spotify-progress-total');
  const fillEl = document.getElementById('spotify-progress-fill');

  if (!currentEl || !totalEl || !fillEl) return;

  const totalSec = Math.floor(durationMs / 1000);
  totalEl.textContent = formatSpotifyTime(totalSec);

  if (spotifyProgressInterval) clearInterval(spotifyProgressInterval);
  
  let currentSec = Math.floor(progressMs / 1000);
  currentEl.textContent = formatSpotifyTime(currentSec);
  
  const updateProgress = () => {
    currentSec++;
    if (currentSec > totalSec) currentSec = totalSec;
    currentEl.textContent = formatSpotifyTime(currentSec);
    // Use transform scaleX for GPU-friendly progress bar
    fillEl.style.transform = 'scaleX(' + (currentSec / totalSec) + ')';
    if (currentSec >= totalSec) clearInterval(spotifyProgressInterval);
  };

  fillEl.style.transform = 'scaleX(' + (currentSec / totalSec) + ')';
  spotifyProgressInterval = setInterval(updateProgress, 1000);
}

function formatSpotifyTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

async function fetchSpotifyFromLanyard() {
  try {
    const response = await fetch('https://api.lanyard.rest/v1/users/951463256457879582', {
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.success || !data.data) return null;
    
    const activities = data.data.activities || [];
    const spotifyActivity = activities.find(a => a.name === 'Spotify');
    
    if (spotifyActivity) {
      return {
        name: spotifyActivity.details || spotifyActivity.state || 'Unknown',
        artist: spotifyActivity.state || spotifyActivity.details || 'Unknown',
        albumArt: spotifyActivity.assets?.large_image?.replace('spotify:', 'https://i.scdn.co/image/') || null,
        progressMs: spotifyActivity.timestamps?.start ? Date.now() - spotifyActivity.timestamps.start : 0,
        durationMs: spotifyActivity.timestamps?.end ? spotifyActivity.timestamps.end - spotifyActivity.timestamps.start : 0,
        isPlaying: true
      };
    }
    
    return null;
  } catch (e) {
    console.log('🎵 Lanyard Spotify fetch error:', e.message);
    return null;
  }
}

function cacheTrack(trackData) {
  try {
    const cached = JSON.parse(localStorage.getItem(SPOTIFY_CACHE_KEY)) || [];
    cached.unshift({
      ...trackData,
      timestamp: Date.now()
    });
    if (cached.length > 5) cached.length = 5;
    localStorage.setItem(SPOTIFY_CACHE_KEY, JSON.stringify(cached));
  } catch (e) {}
}

function getLastCachedTrack() {
  try {
    const cached = JSON.parse(localStorage.getItem(SPOTIFY_CACHE_KEY));
    if (cached && cached.length > 0) {
      return cached[0];
    }
  } catch (e) {}
  return null;
}

async function refreshSpotify() {
  const lanyardTrack = await fetchSpotifyFromLanyard();
  
  if (lanyardTrack && lanyardTrack.isPlaying) {
    cacheTrack(lanyardTrack);
    updateSpotifyUI(lanyardTrack, true);
    return;
  }

  const accessToken = await getSpotifyAccessToken();
  
  if (accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok && response.status !== 204) {
        const data = await response.json();
        if (data && data.item) {
          const trackData = {
            name: data.item.name,
            artist: data.item.artists.map(a => a.name).join(', '),
            albumArt: data.item.album?.images?.[0]?.url || null,
            progressMs: data.progress_ms || 0,
            durationMs: data.item.duration_ms || 0,
            isPlaying: data.is_playing || false
          };
          cacheTrack(trackData);
          updateSpotifyUI(trackData, data.is_playing);
          return;
        }
      }
      
      const recentResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(5000)
      });
      
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        if (recentData.items && recentData.items.length > 0) {
          const item = recentData.items[0].track;
          const trackData = {
            name: item.name,
            artist: item.artists.map(a => a.name).join(', '),
            albumArt: item.album?.images?.[0]?.url || null,
            progressMs: 0,
            durationMs: item.duration_ms || 0,
            isPlaying: false
          };
          updateSpotifyUI(trackData, false);
          return;
        }
      }
    } catch (e) {
      console.log('🎵 Spotify API error:', e.message);
    }
  }

  const cached = getLastCachedTrack();
  if (cached) {
    updateSpotifyUI(cached, false);
    
    const fallbackMsg = document.getElementById('spotify-fallback-msg');
    if (fallbackMsg) {
      const timeAgo = Math.floor((Date.now() - cached.timestamp) / 60000);
      fallbackMsg.innerHTML = `<i class="fas fa-history"></i> ${timeAgo > 0 ? `${timeAgo} phút trước` : 'Vừa xong'}`;
    }
    return;
  }
  
  updateSpotifyUI(null, false);
}

/**
 * Khởi tạo Spotify Module
 */
window.initSpotify = function() {
  if (window._spotifyInitialized) return;
  window._spotifyInitialized = true;
  
  refreshSpotify();
  
  // Use visibility-aware interval if available
  if (window._registerVisibilityInterval) {
    window._registerVisibilityInterval('spotify', refreshSpotify, 15000);
  } else {
    setInterval(refreshSpotify, 15000);
  }
};

console.log('🎵 Spotify module loaded');