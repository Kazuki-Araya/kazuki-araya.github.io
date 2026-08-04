

// Detect device type
function detectDeviceType() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Tablet|webOS|BlackBerry|Opera Mini/i.test(ua) || 
                   window.matchMedia('(pointer: coarse)').matches ||
                   window.innerWidth < 768;
  return isMobile ? 'mobile' : 'desktop';
}

// Desktop configuration
const DESKTOP_CONFIG = {
  musicPlayer: {
    enabled: true,
    defaultVolume: 50,
    playlist: [
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
    ]
  },

  visitor: {
    enabled: true,
    counterName: "kazuki-araya",
    api: "https://api.countapi.xyz/hit",
    useLocalStorage: true
  },

  ui: {
    animationsEnabled: true,
    reduceMotion: false,
    defaultTheme: "dark",
    autoTheme: true,
    widgets: {
      musicPlayer: true,
      visitorCounter: true
    },
    colors: {
      primary: "#ff69b4",
      secondary: "#ff1493",
      accent: "#ffb6c1",
      background: "#000000",
      text: "#ffffff"
    }
  },

  performance: {
    lazyLoadImages: true,
    enableCSSContainment: true,
    enableGPUAcceleration: true,
    preloadCriticalResources: true,
    adaptToSlowNetwork: false,
    minImageQuality: 0.85,
    clearCacheOnUnload: true,
    memoryWarningThreshold: 0.9
  },

  responsive: {
    breakpoints: {
      mobile: 360,
      tablet: 480,
      tabletLarge: 768,
      desktop: 1024,
      desktopLarge: 1440
    },
    touchOptimization: false,
    minTouchSize: 44
  },

  debug: {
    enabled: false,
    logLevel: "info",
    logPerformance: false,
    logApiCalls: false
  }
};

// Mobile configuration
const MOBILE_CONFIG = {
  musicPlayer: {
    enabled: true,
    defaultVolume: 50,
    playlist: [
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
    ]
  },

  visitor: {
    enabled: true,
    counterName: "kazuki-araya",
    api: "https://api.countapi.xyz/hit",
    useLocalStorage: true
  },

  ui: {
    animationsEnabled: true,
    reduceMotion: true,
    defaultTheme: "dark",
    autoTheme: true,
    widgets: {
      musicPlayer: true,
      visitorCounter: true
    },
    colors: {
      primary: "#ff69b4",
      secondary: "#ff1493",
      accent: "#ffb6c1",
      background: "#000000",
      text: "#ffffff"
    }
  },

  performance: {
    lazyLoadImages: true,
    enableCSSContainment: true,
    enableGPUAcceleration: false,
    preloadCriticalResources: false,
    adaptToSlowNetwork: true,
    minImageQuality: 0.65,
    clearCacheOnUnload: true,
    memoryWarningThreshold: 0.8
  },

  responsive: {
    breakpoints: {
      mobile: 360,
      tablet: 480,
      tabletLarge: 768,
      desktop: 1024,
      desktopLarge: 1440
    },
    touchOptimization: true,
    minTouchSize: 48
  },

  debug: {
    enabled: false,
    logLevel: "info",
    logPerformance: false,
    logApiCalls: false
  }
};

// Get config based on device type
window.KAZUKI_CONFIG = detectDeviceType() === 'mobile' ? MOBILE_CONFIG : DESKTOP_CONFIG;

// Expose device type
window.DEVICE_TYPE = detectDeviceType();

window.getConfig = function(key) {
  const keys = key.split(".");
  let config = window.KAZUKI_CONFIG;

  for (let k of keys) {
    if (config && typeof config === "object") {
      config = config[k];
    } else {
      return undefined;
    }
  }

  return config;
};

window.setConfig = function(key, value) {
  const keys = key.split(".");
  const lastKey = keys.pop();
  let config = window.KAZUKI_CONFIG;

  for (let k of keys) {
    if (!config[k]) config[k] = {};
    config = config[k];
  }

  config[lastKey] = value;
  console.log(`✅ Config updated: ${key} = ${value}`);
};

window.kazukiLog = function(message, type = "info") {
  if (!window.KAZUKI_CONFIG.debug.enabled) return;

  const level = window.KAZUKI_CONFIG.debug.logLevel;
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };

  if (levels[type] >= levels[level]) {
    const prefix = `[Kazuki] [${type.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }
};

console.log("✅ Kazuki Config Loaded");
