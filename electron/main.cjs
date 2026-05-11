const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, globalShortcut, shell, screen } = require('electron');

const ROOT_DIR = path.resolve(__dirname, '..');
const ICON_PNG_PATH = path.join(ROOT_DIR, 'public', 'icons', 'tray.png');
const ICON_SVG_PATH = path.join(ROOT_DIR, 'public', 'favicon.svg');
const PRELOAD_PATH = path.join(__dirname, 'preload.cjs');

if (process.platform === 'win32') {
  app.setAppUserModelId('cn.maxingyu.elplayer');
}

let mainWindow = null;
let lyricsWindow = null;
let tray = null;
let isQuitting = false;
let layerRefreshTimer = null;
let configPath = null;

const defaultDesktopSettings = {
  lyricsVisible: true,
  alwaysOnTop: true,
  clickThrough: false,
  overlayMode: 'lyrics',
  locked: false,
  opacity: 88,
  fontSize: 42,
  miniSize: 'medium',
  launchAtLogin: false,
  bounds: {
    lyrics: { width: 980, height: 190 },
    mini: { width: 430, height: 104 }
  }
};

const desktopState = {
  ...defaultDesktopSettings,
  playerState: {
    title: 'Elplayer',
    artist: '等待播放',
    meta: '本地媒体播放器',
    lyric: '等待播放媒体',
    nextLyric: '导入音乐或视频后，这里会显示桌面歌词。',
    isPlaying: false,
    accent: '214 100% 86%'
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function normalizeOverlayMode(mode) {
  return mode === 'mini' ? 'mini' : 'lyrics';
}

function normalizeMiniSize(size) {
  return ['small', 'medium', 'large'].includes(size) ? size : 'medium';
}

function miniBoundsForSize(size) {
  if (size === 'small') return { width: 380, height: 94 };
  if (size === 'large') return { width: 540, height: 124 };
  return { width: 430, height: 104 };
}

function sanitizeBounds(bounds, fallback) {
  const source = bounds && typeof bounds === 'object' ? bounds : {};
  return {
    x: Number.isFinite(source.x) ? Math.round(source.x) : undefined,
    y: Number.isFinite(source.y) ? Math.round(source.y) : undefined,
    width: clampNumber(source.width, 260, 1800, fallback.width),
    height: clampNumber(source.height, 72, 600, fallback.height)
  };
}

function sanitizeDesktopSettings(settings = {}) {
  const miniSize = normalizeMiniSize(settings.miniSize);
  const miniFallback = miniBoundsForSize(miniSize);
  const lyricsFallback = defaultDesktopSettings.bounds.lyrics;

  return {
    lyricsVisible: typeof settings.lyricsVisible === 'boolean' ? settings.lyricsVisible : defaultDesktopSettings.lyricsVisible,
    alwaysOnTop: typeof settings.alwaysOnTop === 'boolean' ? settings.alwaysOnTop : defaultDesktopSettings.alwaysOnTop,
    clickThrough: typeof settings.clickThrough === 'boolean' ? settings.clickThrough : defaultDesktopSettings.clickThrough,
    overlayMode: normalizeOverlayMode(settings.overlayMode),
    locked: typeof settings.locked === 'boolean' ? settings.locked : defaultDesktopSettings.locked,
    opacity: clampNumber(settings.opacity, 30, 100, defaultDesktopSettings.opacity),
    fontSize: clampNumber(settings.fontSize, 24, 72, defaultDesktopSettings.fontSize),
    miniSize,
    launchAtLogin: typeof settings.launchAtLogin === 'boolean' ? settings.launchAtLogin : defaultDesktopSettings.launchAtLogin,
    bounds: {
      lyrics: sanitizeBounds(settings.bounds && settings.bounds.lyrics, lyricsFallback),
      mini: sanitizeBounds(settings.bounds && settings.bounds.mini, miniFallback)
    }
  };
}

function applySettingsObject(settings) {
  const safe = sanitizeDesktopSettings(settings);
  Object.assign(desktopState, safe);
  desktopState.bounds = safe.bounds;
}

function ensureConfigPath() {
  if (!configPath) configPath = path.join(app.getPath('userData'), 'desktop-settings.json');
  return configPath;
}

function loadDesktopSettings() {
  try {
    const raw = fs.readFileSync(ensureConfigPath(), 'utf8');
    applySettingsObject({ ...defaultDesktopSettings, ...JSON.parse(raw) });
  } catch {
    applySettingsObject(defaultDesktopSettings);
  }
}

function saveDesktopSettings() {
  try {
    const payload = clone(getDesktopSettingsOnly());
    fs.writeFileSync(ensureConfigPath(), JSON.stringify(payload, null, 2), 'utf8');
  } catch {
    // Settings persistence failure should not block playback.
  }
}

function getIconImage(size = 32) {
  const sourcePath = fs.existsSync(ICON_PNG_PATH) ? ICON_PNG_PATH : ICON_SVG_PATH;
  const image = nativeImage.createFromPath(sourcePath);
  if (image.isEmpty()) return nativeImage.createEmpty();
  return size ? image.resize({ width: size, height: size }) : image;
}

function getAppIcon() {
  return getIconImage(process.platform === 'win32' ? 32 : 24);
}

function getDesktopSettingsOnly() {
  return {
    lyricsVisible: desktopState.lyricsVisible,
    alwaysOnTop: desktopState.alwaysOnTop,
    clickThrough: desktopState.clickThrough,
    overlayMode: desktopState.overlayMode,
    locked: desktopState.locked,
    opacity: desktopState.opacity,
    fontSize: desktopState.fontSize,
    miniSize: desktopState.miniSize,
    launchAtLogin: desktopState.launchAtLogin,
    bounds: desktopState.bounds
  };
}

function getSafeDesktopState() {
  return {
    ...getDesktopSettingsOnly(),
    playerState: desktopState.playerState
  };
}

function broadcastDesktopState() {
  const state = getSafeDesktopState();
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('desktop:state', state);
  if (lyricsWindow && !lyricsWindow.isDestroyed()) lyricsWindow.webContents.send('desktop:state', state);
}

function pushPlayerStateToLyricsWindow() {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return;
  lyricsWindow.webContents.send('desktop:player-state', desktopState.playerState);
}

function sendControl(action) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('desktop:control', action);
}

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 980,
    minHeight: 620,
    title: 'Elplayer',
    backgroundColor: '#050816',
    icon: getAppIcon(),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(ROOT_DIR, 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', event => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      updateTrayMenu();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function currentOverlayBounds() {
  const mode = normalizeOverlayMode(desktopState.overlayMode);
  const fallback = mode === 'mini' ? miniBoundsForSize(desktopState.miniSize) : defaultDesktopSettings.bounds.lyrics;
  return sanitizeBounds(desktopState.bounds && desktopState.bounds[mode], fallback);
}

function centeredBoundsForMode(mode = desktopState.overlayMode) {
  const display = screen.getPrimaryDisplay().workArea;
  const fallback = mode === 'mini' ? miniBoundsForSize(desktopState.miniSize) : defaultDesktopSettings.bounds.lyrics;
  const width = fallback.width;
  const height = fallback.height;
  return {
    x: Math.round(display.x + (display.width - width) / 2),
    y: Math.round(display.y + Math.min(88, Math.max(24, display.height * 0.12))),
    width,
    height
  };
}

function rememberCurrentOverlayBounds() {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return;
  const mode = normalizeOverlayMode(desktopState.overlayMode);
  const bounds = lyricsWindow.getBounds();
  desktopState.bounds[mode] = sanitizeBounds(bounds, mode === 'mini' ? miniBoundsForSize(desktopState.miniSize) : defaultDesktopSettings.bounds.lyrics);
  saveDesktopSettings();
}

function applyClickThrough() {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return;
  lyricsWindow.setIgnoreMouseEvents(Boolean(desktopState.clickThrough), { forward: true });
}

function reassertLyricsWindowLayer() {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return;

  if (desktopState.alwaysOnTop) {
    lyricsWindow.setAlwaysOnTop(true, 'screen-saver', process.platform === 'darwin' ? 1 : 0);
  } else {
    lyricsWindow.setAlwaysOnTop(false);
  }

  if (process.platform === 'darwin') {
    lyricsWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
  } else {
    lyricsWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  lyricsWindow.setMovable(!desktopState.locked);
  lyricsWindow.setResizable(!desktopState.locked);
  lyricsWindow.setOpacity(clampNumber(desktopState.opacity, 30, 100, 88) / 100);
  applyClickThrough();
}

function applyWindowSettings() {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return;
  reassertLyricsWindowLayer();
  lyricsWindow.webContents.send('desktop:state', getSafeDesktopState());
  updateTrayMenu();
}

function startLayerRefreshTimer() {
  clearInterval(layerRefreshTimer);
  layerRefreshTimer = setInterval(() => {
    if (lyricsWindow && !lyricsWindow.isDestroyed() && desktopState.lyricsVisible) reassertLyricsWindowLayer();
  }, process.platform === 'darwin' ? 2400 : 5200);
}

function createLyricsWindow() {
  if (lyricsWindow && !lyricsWindow.isDestroyed()) return lyricsWindow;

  const bounds = currentOverlayBounds();
  const shouldCenter = !Number.isFinite(bounds.x) || !Number.isFinite(bounds.y);
  const initialBounds = shouldCenter ? centeredBoundsForMode(desktopState.overlayMode) : bounds;

  lyricsWindow = new BrowserWindow({
    ...initialBounds,
    minWidth: 300,
    minHeight: 76,
    frame: false,
    transparent: true,
    resizable: !desktopState.locked,
    movable: !desktopState.locked,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    skipTaskbar: true,
    focusable: true,
    acceptFirstMouse: true,
    alwaysOnTop: desktopState.alwaysOnTop,
    hiddenInMissionControl: true,
    roundedCorners: false,
    backgroundColor: '#00000000',
    icon: getAppIcon(),
    show: false,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  lyricsWindow.loadFile(path.join(__dirname, 'lyrics-overlay.html'));
  reassertLyricsWindowLayer();

  lyricsWindow.once('ready-to-show', () => {
    applyWindowSettings();
    if (desktopState.lyricsVisible) lyricsWindow.showInactive();
    pushPlayerStateToLyricsWindow();
    broadcastDesktopState();
  });

  lyricsWindow.on('move', () => rememberCurrentOverlayBounds());
  lyricsWindow.on('resize', () => rememberCurrentOverlayBounds());
  lyricsWindow.on('show', () => reassertLyricsWindowLayer());
  lyricsWindow.on('blur', () => reassertLyricsWindowLayer());

  lyricsWindow.on('closed', () => {
    lyricsWindow = null;
    desktopState.lyricsVisible = false;
    saveDesktopSettings();
    updateTrayMenu();
  });

  return lyricsWindow;
}

function setOverlayVisible(visible) {
  const win = createLyricsWindow();
  desktopState.lyricsVisible = Boolean(visible);
  if (desktopState.lyricsVisible) {
    win.showInactive();
    reassertLyricsWindowLayer();
  } else {
    win.hide();
  }
  saveDesktopSettings();
  updateTrayMenu();
  broadcastDesktopState();
  return getSafeDesktopState();
}

function toggleLyricsOverlay() {
  return setOverlayVisible(!desktopState.lyricsVisible);
}

function setClickThrough(enabled) {
  desktopState.clickThrough = Boolean(enabled);
  applyClickThrough();
  saveDesktopSettings();
  updateTrayMenu();
  broadcastDesktopState();
  return getSafeDesktopState();
}

function setAlwaysOnTop(enabled) {
  desktopState.alwaysOnTop = Boolean(enabled);
  reassertLyricsWindowLayer();
  saveDesktopSettings();
  updateTrayMenu();
  broadcastDesktopState();
  return getSafeDesktopState();
}

function toggleAlwaysOnTop() {
  return setAlwaysOnTop(!desktopState.alwaysOnTop);
}

function setOverlayMode(mode) {
  const normalized = normalizeOverlayMode(mode);
  createLyricsWindow();
  rememberCurrentOverlayBounds();
  desktopState.overlayMode = normalized;

  const targetBounds = desktopState.bounds[normalized];
  const fallback = normalized === 'mini' ? miniBoundsForSize(desktopState.miniSize) : defaultDesktopSettings.bounds.lyrics;
  const safeBounds = sanitizeBounds(targetBounds, fallback);
  const centered = (!Number.isFinite(safeBounds.x) || !Number.isFinite(safeBounds.y)) ? centeredBoundsForMode(normalized) : safeBounds;

  if (lyricsWindow && !lyricsWindow.isDestroyed()) {
    lyricsWindow.setBounds(centered, false);
    if (desktopState.lyricsVisible) lyricsWindow.showInactive();
    reassertLyricsWindowLayer();
  }

  saveDesktopSettings();
  updateTrayMenu();
  broadcastDesktopState();
  return getSafeDesktopState();
}

function toggleOverlayMode() {
  return setOverlayMode(desktopState.overlayMode === 'mini' ? 'lyrics' : 'mini');
}

function applyLaunchAtLogin(enabled) {
  try {
    app.setLoginItemSettings({ openAtLogin: Boolean(enabled), name: 'Elplayer' });
  } catch {
    // Some portable builds or unsigned macOS builds may not support this consistently.
  }
}

function setDesktopSettings(patch = {}) {
  const next = sanitizeDesktopSettings({ ...getDesktopSettingsOnly(), ...patch, bounds: patch.bounds || desktopState.bounds });

  const miniSizeChanged = next.miniSize !== desktopState.miniSize;
  Object.assign(desktopState, next);
  desktopState.bounds = next.bounds;
  if (miniSizeChanged) {
    desktopState.bounds.mini = { ...desktopState.bounds.mini, ...miniBoundsForSize(desktopState.miniSize) };
  }

  applyLaunchAtLogin(desktopState.launchAtLogin);
  if (lyricsWindow && !lyricsWindow.isDestroyed()) {
    if (desktopState.overlayMode === 'mini' && miniSizeChanged) {
      const bounds = lyricsWindow.getBounds();
      lyricsWindow.setSize(miniBoundsForSize(desktopState.miniSize).width, miniBoundsForSize(desktopState.miniSize).height, false);
      lyricsWindow.setPosition(bounds.x, bounds.y, false);
    }
    applyWindowSettings();
    if (desktopState.lyricsVisible) lyricsWindow.showInactive();
    else lyricsWindow.hide();
  }
  saveDesktopSettings();
  broadcastDesktopState();
  return getSafeDesktopState();
}

function resetOverlayBounds(mode = desktopState.overlayMode) {
  const normalized = normalizeOverlayMode(mode);
  const bounds = centeredBoundsForMode(normalized);
  desktopState.bounds[normalized] = bounds;
  if (lyricsWindow && !lyricsWindow.isDestroyed() && desktopState.overlayMode === normalized) {
    lyricsWindow.setBounds(bounds, false);
    reassertLyricsWindowLayer();
  }
  saveDesktopSettings();
  broadcastDesktopState();
  return getSafeDesktopState();
}

function openDesktopSettingsPanel() {
  if (!mainWindow || mainWindow.isDestroyed()) createMainWindow();
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send('desktop:control', 'open-desktop-settings');
}

function updateTrayMenu() {
  if (!tray) return;

  const mainVisible = Boolean(mainWindow && mainWindow.isVisible());
  const template = [
    {
      label: mainVisible ? '隐藏主窗口' : '显示主窗口',
      click: () => {
        if (!mainWindow) createMainWindow();
        if (mainWindow.isVisible()) mainWindow.hide();
        else mainWindow.show();
        updateTrayMenu();
      }
    },
    { label: '打开桌面设置', click: openDesktopSettingsPanel },
    { type: 'separator' },
    { label: desktopState.lyricsVisible ? '隐藏桌面浮窗' : '显示桌面浮窗', click: () => toggleLyricsOverlay() },
    { label: desktopState.overlayMode === 'mini' ? '切换为桌面歌词模式' : '切换为极简黑胶机模式', click: () => toggleOverlayMode() },
    { label: desktopState.clickThrough ? '关闭鼠标穿透' : '开启鼠标穿透', click: () => setClickThrough(!desktopState.clickThrough) },
    { label: desktopState.alwaysOnTop ? '取消歌词置顶' : '开启歌词置顶', click: () => setAlwaysOnTop(!desktopState.alwaysOnTop) },
    { label: desktopState.locked ? '解除窗口锁定' : '锁定浮窗位置', click: () => setDesktopSettings({ locked: !desktopState.locked }) },
    { type: 'separator' },
    { label: '播放 / 暂停', click: () => sendControl('toggle-play') },
    { label: '上一首', click: () => sendControl('previous-track') },
    { label: '下一首', click: () => sendControl('next-track') },
    { type: 'separator' },
    {
      label: '退出 Elplayer',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ];

  tray.setContextMenu(Menu.buildFromTemplate(template));
  tray.setToolTip('Elplayer');
}

function createTray() {
  const image = getIconImage(process.platform === 'darwin' ? 18 : 20);
  if (process.platform === 'darwin' && !image.isEmpty()) image.setTemplateImage(false);
  tray = new Tray(image);
  tray.on('double-click', () => {
    if (!mainWindow) createMainWindow();
    mainWindow.show();
  });
  updateTrayMenu();
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+L', () => toggleLyricsOverlay());
  globalShortcut.register('CommandOrControl+Shift+P', () => setClickThrough(!desktopState.clickThrough));
  globalShortcut.register('CommandOrControl+Shift+M', () => toggleOverlayMode());
  globalShortcut.register('CommandOrControl+Shift+S', () => openDesktopSettingsPanel());
  globalShortcut.register('CommandOrControl+Shift+Space', () => sendControl('toggle-play'));
}

function bindIpc() {
  ipcMain.handle('desktop:get-state', () => getSafeDesktopState());
  ipcMain.handle('desktop:get-settings', () => getSafeDesktopState());
  ipcMain.handle('desktop:set-settings', (_event, patch) => setDesktopSettings(patch || {}));
  ipcMain.handle('desktop:toggle-lyrics-overlay', () => toggleLyricsOverlay());
  ipcMain.handle('desktop:set-lyrics-visible', (_event, visible) => setOverlayVisible(Boolean(visible)));
  ipcMain.handle('desktop:toggle-click-through', () => setClickThrough(!desktopState.clickThrough));
  ipcMain.handle('desktop:set-click-through', (_event, enabled) => setClickThrough(enabled));
  ipcMain.handle('desktop:toggle-always-on-top', () => toggleAlwaysOnTop());
  ipcMain.handle('desktop:set-always-on-top', (_event, enabled) => setAlwaysOnTop(enabled));
  ipcMain.handle('desktop:toggle-overlay-mode', () => toggleOverlayMode());
  ipcMain.handle('desktop:set-overlay-mode', (_event, mode) => setOverlayMode(mode));
  ipcMain.handle('desktop:reset-overlay-bounds', (_event, mode) => resetOverlayBounds(mode));
  ipcMain.handle('desktop:window-command', (_event, command) => {
    if (command === 'show-main' && mainWindow) mainWindow.show();
    if (command === 'hide-main' && mainWindow) mainWindow.hide();
    if (command === 'open-settings') openDesktopSettingsPanel();
    if (command === 'quit') {
      isQuitting = true;
      app.quit();
    }
    updateTrayMenu();
    return getSafeDesktopState();
  });

  ipcMain.on('desktop:player-state', (_event, payload) => {
    desktopState.playerState = {
      ...desktopState.playerState,
      ...(payload || {})
    };
    pushPlayerStateToLyricsWindow();
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('desktop:state', getSafeDesktopState());
  });

  ipcMain.on('desktop:control', (_event, action) => sendControl(action));
}

app.whenReady().then(() => {
  app.setName('Elplayer');
  loadDesktopSettings();
  applyLaunchAtLogin(desktopState.launchAtLogin);
  bindIpc();
  createMainWindow();
  createLyricsWindow();
  createTray();
  registerShortcuts();
  startLayerRefreshTimer();
});

app.on('activate', () => {
  if (!mainWindow) createMainWindow();
  mainWindow.show();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  clearInterval(layerRefreshTimer);
});

app.on('window-all-closed', () => {
  // Keep the app alive in the tray until the user explicitly chooses Quit.
});
