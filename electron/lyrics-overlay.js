const trackTitle = document.getElementById('trackTitle');
const currentLyric = document.getElementById('currentLyric');
const nextLyric = document.getElementById('nextLyric');
const playButton = document.getElementById('playButton');
const miniTitle = document.getElementById('miniTitle');
const miniArtist = document.getElementById('miniArtist');
const miniPlayButton = document.getElementById('miniPlayButton');
const clickThroughButton = document.getElementById('clickThroughButton');
const topButton = document.getElementById('topButton');

let lastPlayerState = null;
let lastDesktopState = null;

function applyDesktopState(state) {
  if (!state) return;
  lastDesktopState = state;
  const mode = state.overlayMode === 'mini' ? 'mini' : 'lyrics';
  const miniSize = state.miniSize || 'medium';

  document.body.classList.toggle('mode-mini', mode === 'mini');
  document.body.classList.toggle('mode-lyrics', mode !== 'mini');
  document.body.classList.toggle('click-through', Boolean(state.clickThrough));
  document.body.classList.toggle('locked', Boolean(state.locked));
  document.body.classList.toggle('mini-small', miniSize === 'small');
  document.body.classList.toggle('mini-large', miniSize === 'large');

  if (clickThroughButton) clickThroughButton.classList.toggle('active', Boolean(state.clickThrough));
  if (topButton) topButton.classList.toggle('active', Boolean(state.alwaysOnTop));

  if (Number.isFinite(Number(state.fontSize))) {
    document.documentElement.style.setProperty('--desktop-font-size', `${Number(state.fontSize)}px`);
  }

  if (state.playerState) renderPlayerState(state.playerState);
}

function renderPlayerState(state) {
  lastPlayerState = state || {};
  const lyric = lastPlayerState.lyric || '等待播放媒体';
  const next = lastPlayerState.nextLyric || '导入音乐或视频后，这里会显示桌面歌词。';
  const title = lastPlayerState.title || 'Elplayer';
  const artist = lastPlayerState.artist || lastPlayerState.meta || '等待播放';

  trackTitle.textContent = title;
  currentLyric.textContent = lyric;
  nextLyric.textContent = next;
  miniTitle.textContent = title;
  miniArtist.textContent = artist;
  playButton.textContent = lastPlayerState.isPlaying ? 'Ⅱ' : '▶';
  miniPlayButton.textContent = lastPlayerState.isPlaying ? 'Ⅱ' : '▶';

  document.body.classList.toggle('is-playing', Boolean(lastPlayerState.isPlaying));
  document.body.classList.toggle('compact', lyric.length > 34);

  if (lastPlayerState.accent) {
    document.documentElement.style.setProperty('--accent', lastPlayerState.accent);
  }
}

async function refreshDesktopState() {
  if (!window.elplayerDesktop) return;
  const state = await window.elplayerDesktop.getDesktopState();
  applyDesktopState(state);
}

function setupEvents() {
  if (!window.elplayerDesktop) return;

  window.elplayerDesktop.onPlayerState(renderPlayerState);
  window.elplayerDesktop.onDesktopState(applyDesktopState);

  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      window.elplayerDesktop.sendControl(button.dataset.action);
    });
  });

  document.querySelectorAll('[data-command]').forEach(button => {
    button.addEventListener('click', async () => {
      const command = button.dataset.command;
      if (command === 'toggle-click-through') {
        applyDesktopState(await window.elplayerDesktop.toggleClickThrough());
        return;
      }
      if (command === 'toggle-always-on-top') {
        applyDesktopState(await window.elplayerDesktop.toggleAlwaysOnTop());
        return;
      }
      if (command === 'toggle-mode') {
        applyDesktopState(await window.elplayerDesktop.toggleOverlayMode());
        return;
      }
      if (command === 'open-settings') {
        applyDesktopState(await window.elplayerDesktop.windowCommand('open-settings'));
        return;
      }
      if (command === 'hide-overlay') {
        applyDesktopState(await window.elplayerDesktop.setLyricsVisible(false));
      }
    });
  });

  window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault();
      window.elplayerDesktop.sendControl('toggle-play');
    }
    if (event.key === 'ArrowRight') window.elplayerDesktop.sendControl('seek-forward');
    if (event.key === 'ArrowLeft') window.elplayerDesktop.sendControl('seek-backward');
    if (event.key.toLowerCase() === 'm') window.elplayerDesktop.toggleOverlayMode().then(applyDesktopState);
    if (event.key === 'Escape') window.elplayerDesktop.setLyricsVisible(false).then(applyDesktopState);
  });
}

setupEvents();
refreshDesktopState();
setInterval(refreshDesktopState, 1500);
