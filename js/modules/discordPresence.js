const DISCORD_USER_ID = '951463256457879582';
const DISCORD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
const DISCORD_REFRESH_INTERVAL = 30000;
const STATUS_MAP = {
  online: { text: 'Online', color: '#43b581' },
  idle: { text: 'Idle', color: '#faa61a' },
  dnd: { text: 'Do Not Disturb', color: '#f04747' },
  offline: { text: 'Offline', color: '#747f8d' }
};

function getActivityText(data) {
  if (!data || !Array.isArray(data.activities)) {
    return { title: 'Không có hoạt động', details: 'Đang không làm gì cả...' };
  }

  const spotifyActivity = data.activities.find((activity) => activity.type === 2 || activity.name === 'Spotify');
  const gameActivity = data.activities.find((activity) => activity.type === 0);
  const customStatus = data.activities.find((activity) => activity.type === 4 && activity.state);

  if (spotifyActivity) {
    return {
      title: `🎵 Spotify: ${spotifyActivity.details || spotifyActivity.state || 'Nghe nhạc'}`,
      details: spotifyActivity.state || spotifyActivity.details || 'Đang nghe Spotify'
    };
  }

  if (gameActivity) {
    return {
      title: `🎮 ${gameActivity.name || 'Đang chơi'}`,
      details: gameActivity.details || gameActivity.state || 'Đang hoạt động'
    };
  }

  if (customStatus) {
    return {
      title: `💬 ${customStatus.state}`,
      details: customStatus.details || 'Trạng thái tùy chỉnh'
    };
  }

  return {
    title: 'Không có hoạt động',
    details: 'Đang không làm gì cả...'
  };
}

function applyDiscordStatus(presence) {
  const statusText = document.getElementById('discord-status');
  const statusDot = document.getElementById('discord-status-dot');
  const widgetText = document.getElementById('widget-discord-status-text');
  const widgetDot = document.getElementById('widget-discord-dot');
  const activityName = document.getElementById('discord-activity-name');
  const activityDetails = document.getElementById('discord-activity-details');
  const activityImage = document.getElementById('discord-activity-image');
  const activityFallback = document.getElementById('discord-activity-fallback-icon');

  const currentStatus = STATUS_MAP[presence.discord_status] || STATUS_MAP.offline;

  if (statusText) statusText.textContent = currentStatus.text;
  if (statusDot) statusDot.style.color = currentStatus.color;
  if (widgetText) widgetText.textContent = currentStatus.text;
  if (widgetDot) widgetDot.style.color = currentStatus.color;

  if (activityImage) {
    activityImage.src = 'assets/images/discord.webp';
    activityImage.style.display = 'block';
  }
  if (activityFallback) {
    activityFallback.style.display = 'none';
  }

  const activity = getActivityText(presence);
  if (activityName) activityName.textContent = activity.title;
  if (activityDetails) activityDetails.textContent = activity.details;
}

async function fetchDiscordPresenceData() {
  const response = await fetch(DISCORD_API_URL);
  if (!response.ok) {
    throw new Error(`Discord Presence API error: ${response.status}`);
  }
  const data = await response.json();
  if (!data.success || !data.data) {
    throw new Error('Discord Presence response invalid');
  }
  return data.data;
}

async function refreshDiscordPresence() {
  try {
    const presence = await fetchDiscordPresenceData();
    applyDiscordStatus(presence);
  } catch (error) {
    console.error('Discord Presence error:', error);
    const statusText = document.getElementById('discord-status');
    const statusDot = document.getElementById('discord-status-dot');
    const widgetText = document.getElementById('widget-discord-status-text');
    const widgetDot = document.getElementById('widget-discord-dot');
    const activityName = document.getElementById('discord-activity-name');
    const activityDetails = document.getElementById('discord-activity-details');

    if (statusText) statusText.textContent = 'Offline';
    if (statusDot) statusDot.style.color = STATUS_MAP.offline.color;
    if (widgetText) widgetText.textContent = 'Offline';
    if (widgetDot) widgetDot.style.color = STATUS_MAP.offline.color;
    if (activityName) activityName.textContent = 'Discord Disconnected';
    if (activityDetails) activityDetails.textContent = 'Tạm thời không kết nối được.';
  }
}

window.initDiscordPresence = async function() {
  if (window._discordPresenceStarted) return;
  window._discordPresenceStarted = true;

  await refreshDiscordPresence();
  
  // Use visibility-aware interval if available
  if (window._registerVisibilityInterval) {
    window._registerVisibilityInterval('discord', refreshDiscordPresence, DISCORD_REFRESH_INTERVAL);
  } else {
    setInterval(refreshDiscordPresence, DISCORD_REFRESH_INTERVAL);
  }
};