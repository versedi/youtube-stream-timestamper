// YouTube Stream Timestamper — content script
// Injects a timestamp-copy button into the YouTube player controls.

const BTN_ID = 'yt-timestamper-btn';
const TOAST_ID = 'yt-timestamper-toast';

// ── URL helpers ────────────────────────────────────────────────────────────

function getVideoId() {
  const path = window.location.pathname;
  if (path.startsWith('/live/')) {
    return path.split('/live/')[1].split('/')[0] || null;
  }
  return new URLSearchParams(window.location.search).get('v');
}

function getCurrentSeconds() {
  const video = document.querySelector('video');
  return video ? Math.floor(video.currentTime) : null;
}

function buildTimestampUrl(videoId, seconds) {
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}`;
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h${m}m${s}s`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

// ── Clipboard ──────────────────────────────────────────────────────────────

function copyToClipboard(text) {
  // navigator.clipboard requires focus — use execCommand as reliable fallback
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    el.remove();
    return true;
  } catch (e) {
    return false;
  }
}

// ── Toast notification ─────────────────────────────────────────────────────

function showToast(message, isError = false) {
  const existing = document.getElementById(TOAST_ID);
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = TOAST_ID;
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: isError ? '#b00020' : '#212121',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '4px',
    fontFamily: 'Roboto, Arial, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: '99999',
    pointerEvents: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    transition: 'opacity 0.3s',
    opacity: '1',
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}

// ── Copy action ────────────────────────────────────────────────────────────

function handleTimestampCopy() {
  const videoId = getVideoId();
  const seconds = getCurrentSeconds();

  if (!videoId) {
    showToast('No video detected', true);
    return;
  }
  if (seconds === null) {
    showToast('Could not read playback position', true);
    return;
  }

  const url = buildTimestampUrl(videoId, seconds);
  const ok = copyToClipboard(url);

  if (ok) {
    showToast(`Timestamp copied — ${formatTime(seconds)}`);
  } else {
    // Last resort: show the URL in the toast so user can copy manually
    showToast(url, false);
  }
}

// ── Button ─────────────────────────────────────────────────────────────────

function createButton() {
  const btn = document.createElement('button');
  btn.id = BTN_ID;
  btn.title = 'Copy timestamp link';
  btn.className = 'ytp-button';

  // Clock icon (same style as YouTube's SVG icons)
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" style="padding:7px;box-sizing:border-box">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L11 13V7h1.5v5.25l4.28 2.53-.55.97z"/>
    </svg>
  `;

  Object.assign(btn.style, {
    cursor: 'pointer',
    color: '#fff',
    width: '48px',
    height: '100%',
    padding: '0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    outline: 'none',
    opacity: '0.9',
  });

  btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
  btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.9'; });
  btn.addEventListener('click', handleTimestampCopy);

  return btn;
}

// ── Injection ──────────────────────────────────────────────────────────────

function injectButton() {
  if (document.getElementById(BTN_ID)) return;

  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) return;

  const btn = createButton();
  // Insert as the first control on the right side (leftmost of the right group)
  rightControls.insertBefore(btn, rightControls.firstChild);
}

function removeButton() {
  const btn = document.getElementById(BTN_ID);
  if (btn) btn.remove();
}

// ── SPA navigation handling ────────────────────────────────────────────────
// YouTube is a single-page app; the content script persists across navigations,
// so we observe DOM mutations and react to URL changes.

let lastUrl = location.href;

function isWatchPage() {
  return location.pathname === '/watch' || location.pathname.startsWith('/live/');
}

function onMutation() {
  const currentUrl = location.href;

  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    removeButton(); // clean up from previous page
  }

  if (isWatchPage()) {
    injectButton();
  }
}

const observer = new MutationObserver(onMutation);
observer.observe(document.documentElement, { childList: true, subtree: true });

// Try immediately in case player is already in the DOM
if (isWatchPage()) {
  injectButton();
}
