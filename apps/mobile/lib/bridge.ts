// ================================================================
// MESSAGE BRIDGE
// Typed messages between WebView (injected JS) and native code.
// ================================================================

export type BridgeMessage =
  | { type: 'nav'; url: string }
  | { type: 'haptic'; action: 'like' | 'post_created' | 'comment' | 'share' | 'error' }
  | { type: 'share'; url: string; title: string; text?: string }
  | { type: 'file_input_click'; inputId: string; accept: string; multiple: boolean }
  | { type: 'feed_data'; posts: CachedPost[] }
  | { type: 'auth_token'; token: string; userId: string };

export interface CachedPost {
  id: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  created: string;
}

// ================================================================
// INJECTED JS — composed from feature-specific snippets
// ================================================================

const NAV_SYNC_JS = `
  function postUrl() {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'nav', url: window.location.pathname })
    );
  }
  var origPush = history.pushState;
  var origReplace = history.replaceState;
  history.pushState = function() {
    origPush.apply(this, arguments);
    setTimeout(postUrl, 50);
  };
  history.replaceState = function() {
    origReplace.apply(this, arguments);
    setTimeout(postUrl, 50);
  };
  window.addEventListener('popstate', postUrl);
  postUrl();
`;

const DISMISS_POPUPS_JS = `
  // Suppress PWA install prompt
  window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); });
  localStorage.setItem('pwa-install-dismissed', String(Date.now()));

  // Mark onboarding as done
  try {
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] === 'pocketbase_auth' || keys[i] === 'pb_auth') {
        var auth = JSON.parse(localStorage.getItem(keys[i]));
        if (auth && auth.model && auth.model.id) {
          var uid = auth.model.id;
          localStorage.setItem('paintpile-onboarded-' + uid, 'true');
          localStorage.setItem('paintpile-last-visit-' + uid, String(Date.now()));
        }
      }
    }
  } catch(e) {}

  // Hide overlays, banners, ads via CSS
  var style = document.createElement('style');
  style.textContent = [
    'body > div.fixed[class*="z-50"][class*="inset-0"] { display: none !important; }',
    'div.fixed[class*="bottom-4"][class*="z-40"] { display: none !important; }',
    'ins.adsbygoogle, .ad-card { display: none !important; }',
  ].join('\\n');
  document.head.appendChild(style);
`;

const HAPTIC_JS = `
  // Intercept likes, comments, post creation for haptic feedback
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if (!btn) return;

    // Like button — has heart SVG
    if (btn.querySelector('svg.lucide-heart') || btn.querySelector('[data-lucide="heart"]') || btn.getAttribute('aria-label') === 'Like') {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', action: 'like' }));
    }

    // Comment submit
    if (btn.type === 'submit' && btn.closest('form') && btn.closest('[class*="comment"]')) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', action: 'comment' }));
    }
  }, true);

  // Post creation success — watch for form submissions
  var origFetch = window.fetch;
  window.fetch = function(url, opts) {
    var result = origFetch.apply(this, arguments);
    if (opts && opts.method === 'POST' && typeof url === 'string' && url.includes('/api/collections/posts/records')) {
      result.then(function(res) {
        if (res.ok) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', action: 'post_created' }));
        }
      }).catch(function() {});
    }
    return result;
  };
`;

const SHARE_JS = `
  // Override navigator.share for native share sheet
  if (window.ReactNativeWebView) {
    navigator.share = function(data) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'share',
        url: data.url || window.location.href,
        title: data.title || document.title,
        text: data.text || ''
      }));
      return Promise.resolve();
    };

    // Also override clipboard for "copy link" buttons to trigger share
    var origWriteText = navigator.clipboard && navigator.clipboard.writeText;
    if (origWriteText) {
      navigator.clipboard.writeText = function(text) {
        // If it looks like a URL, offer native share instead
        if (text.startsWith('http')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'share',
            url: text,
            title: document.title,
            text: ''
          }));
        }
        return origWriteText.call(navigator.clipboard, text);
      };
    }
  }
`;

const FILE_INPUT_JS = `
  // Intercept file input clicks for native image picker
  document.addEventListener('click', function(e) {
    var el = e.target.closest('input[type="file"]');
    if (!el) {
      // Also check for labels/buttons that trigger file inputs
      var label = e.target.closest('label');
      if (label) {
        var forId = label.getAttribute('for');
        if (forId) el = document.getElementById(forId);
        if (!el || el.type !== 'file') el = label.querySelector('input[type="file"]');
      }
      // Check for drop zones that have hidden file inputs
      if (!el) {
        var zone = e.target.closest('[class*="upload"], [class*="dropzone"], [class*="picker"]');
        if (zone) el = zone.querySelector('input[type="file"]');
      }
    }
    if (el && el.type === 'file') {
      e.preventDefault();
      e.stopPropagation();
      // Tag this input so we can find it again
      el.setAttribute('data-native-pick', 'true');
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'file_input_click',
        inputId: el.id || 'file-input',
        accept: el.accept || '*',
        multiple: el.multiple || false
      }));
    }
  }, true);
`;

const FEED_CACHE_JS = `
  // Periodically extract feed data for offline caching
  setInterval(function() {
    try {
      var cards = document.querySelectorAll('article, [class*="post-card"], [class*="PostCard"]');
      if (cards.length === 0) return;
      var posts = [];
      cards.forEach(function(card, i) {
        if (i >= 20) return;
        var authorEl = card.querySelector('a[href*="/profile/"] span, [class*="author"], [class*="username"]');
        var avatarEl = card.querySelector('img[class*="avatar"], img[class*="rounded-full"]');
        var contentEl = card.querySelector('p, [class*="content"]');
        var images = [];
        card.querySelectorAll('img:not([class*="avatar"]):not([class*="rounded-full"])').forEach(function(img) {
          if (img.src && img.width > 50) images.push(img.src);
        });
        posts.push({
          id: card.getAttribute('data-post-id') || card.id || String(i),
          content: contentEl ? contentEl.textContent.substring(0, 500) : '',
          authorName: authorEl ? authorEl.textContent.trim() : 'Unknown',
          authorAvatar: avatarEl ? avatarEl.src : '',
          images: images.slice(0, 4),
          likeCount: 0,
          commentCount: 0,
          created: new Date().toISOString()
        });
      });
      if (posts.length > 0) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'feed_data', posts: posts }));
      }
    } catch(e) {}
  }, 30000);
`;

const AUTH_TOKEN_JS = `
  // Extract PB auth token for native push notification registration & biometrics
  function sendAuthToken() {
    try {
      var raw = localStorage.getItem('pocketbase_auth') || localStorage.getItem('pb_auth');
      if (raw) {
        var auth = JSON.parse(raw);
        if (auth && auth.token && auth.model && auth.model.id) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'auth_token',
            token: auth.token,
            userId: auth.model.id
          }));
        }
      }
    } catch(e) {}
  }
  // Send on load and periodically (token may change on refresh)
  sendAuthToken();
  setInterval(sendAuthToken, 60000);
`;

export function buildInjectedJS(): string {
  return `
(function() {
  ${DISMISS_POPUPS_JS}
  ${NAV_SYNC_JS}
  ${HAPTIC_JS}
  ${SHARE_JS}
  ${FILE_INPUT_JS}
  ${FEED_CACHE_JS}
  ${AUTH_TOKEN_JS}
})();
true;
`;
}
