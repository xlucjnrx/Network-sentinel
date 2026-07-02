(() => {
  const _getImageData   = CanvasRenderingContext2D.prototype.getImageData;
  const _toDataURL      = HTMLCanvasElement.prototype.toDataURL;
  const _toBlob         = HTMLCanvasElement.prototype.toBlob;

  function noisePixels(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = Math.max(0, Math.min(255, data[i]     + (Math.random() < 0.02 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + (Math.random() < 0.02 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + (Math.random() < 0.02 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
    }
    return imageData;
  }

  CanvasRenderingContext2D.prototype.getImageData = function (...args) {
    return noisePixels(_getImageData.apply(this, args));
  };

  HTMLCanvasElement.prototype.toDataURL = function (...args) {
    const ctx = this.getContext('2d');
    if (ctx) noisePixels(_getImageData.call(ctx, 0, 0, this.width, this.height));
    return _toDataURL.apply(this, args);
  };

  HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
    const ctx = this.getContext('2d');
    if (ctx) noisePixels(_getImageData.call(ctx, 0, 0, this.width, this.height));
    return _toBlob.call(this, callback, ...args);
  };

  const _getParameter = WebGLRenderingContext.prototype.getParameter;

  WebGLRenderingContext.prototype.getParameter = function (param) {
    if (param === 37445) return 'Intel Inc.';          
    if (param === 37446) return 'Intel Iris OpenGL'; 
    return _getParameter.call(this, param);
  };

  if (typeof WebGL2RenderingContext !== 'undefined') {
    const _getParameter2 = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function (param) {
      if (param === 37445) return 'Intel Inc.';
      if (param === 37446) return 'Intel Iris OpenGL';
      return _getParameter2.call(this, param);
    };
  }

  const _createAnalyser         = AudioContext.prototype.createAnalyser;
  const _createOscillator       = AudioContext.prototype.createOscillator;
  const _createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;

  function noisyGain(ctx) {
    const gain = ctx.createGain();
    gain.gain.value = 1 + (Math.random() - 0.5) * 0.0001; 
    return gain;
  }

  AudioContext.prototype.createAnalyser = function (...args) {
    const analyser = _createAnalyser.apply(this, args);
    const _orig = analyser.getFloatFrequencyData.bind(analyser);
    analyser.getFloatFrequencyData = function (array) {
      _orig(array);
      for (let i = 0; i < array.length; i++) {
        array[i] += (Math.random() - 0.5) * 0.001;
      }
    };
    return analyser;
  };

  const TRACKER_DOMAINS = [
    'doubleclick.net', 'google-analytics.com', 'googletagmanager.com',
    'facebook.com', 'connect.facebook.net', 'analytics.twitter.com',
    'bat.bing.com', 'scorecardresearch.com', 'quantserve.com',
    'pixel.advertising.com', 'pixel.taboola.com', 'tr.outbrain.com',
    'sp.analytics.yahoo.com', 'analytics.tiktok.com', 'ct.pinterest.com',
    'snap.licdn.com', 'px.ads.linkedin.com', 'clarity.ms',
    'hotjar.com', 'mouseflow.com', 'fullstory.com', 'loggly.com',
  ];

  function isTrackerURL(url) {
    try {
      const hostname = new URL(url).hostname;
      return TRACKER_DOMAINS.some(domain =>
        hostname === domain || hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  const _imageSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');

  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    set(value) {
      if (isTrackerURL(value)) {
        console.debug('[Sentinel] Blocked tracking pixel:', value);
        return; 
      }
      _imageSrcDescriptor.set.call(this, value);
    },
    get() {
      return _imageSrcDescriptor.get.call(this);
    },
    configurable: true,
  });

  try {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 4,
      configurable: true,
    });
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 8,
      configurable: true,
    });
  } catch { /
  if (navigator.getBattery) {
    navigator.getBattery = () => Promise.reject(new Error('Blocked by Network Sentinel'));
  }

  try {
    if (navigator.connection) {
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
          saveData: false,
        }),
        configurable: true,
      });
    }

  const _sendBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function (url, data) {
    if (isTrackerURL(url)) {
      console.debug('[Sentinel] Blocked beacon:', url);
      return true; 
    }
    return _sendBeacon(url, data);
  };

  const _fetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && isTrackerURL(url)) {
      console.debug('[Sentinel] Blocked fetch:', url);
      return Promise.reject(new Error('Blocked by Network Sentinel'));
    }
    return _fetch.apply(this, arguments);
  };

  const TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'msclkid', 'twclid', 'igshid', 'mc_eid',
    '_ga', '_gl', 'yclid', 'zanpid', 'dclid', 'wickedid',
  ];

  function stripTrackingParams(url) {
    try {
      const u = new URL(url);
      let changed = false;
      TRACKING_PARAMS.forEach(p => {
        if (u.searchParams.has(p)) {
          u.searchParams.delete(p);
          changed = true;
        }
      });
      return changed ? u.toString() : null;
    } catch {
      return null;
    }
  }

  const cleaned = stripTrackingParams(location.href);
  if (cleaned) {
    history.replaceState(null, '', cleaned);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const cleanedHref = stripTrackingParams(a.href);
    if (cleanedHref) {
      a.href = cleanedHref;
    }
  }, true);

})();
