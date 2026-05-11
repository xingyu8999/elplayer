const { contextBridge, ipcRenderer } = require('electron');

const validControlActions = new Set([
  'toggle-play',
  'previous-track',
  'next-track',
  'seek-backward',
  'seek-forward',
  'toggle-lyrics-visible',
  'toggle-music-focus',
  'open-desktop-settings'
]);

const validWindowCommands = new Set([
  'show-main',
  'hide-main',
  'open-settings',
  'quit'
]);

function on(channel, callback) {
  const listener = (_event, payload) => callback(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('elplayerDesktop', {
  isDesktop: true,

  sendPlayerState(state) {
    ipcRenderer.send('desktop:player-state', state || {});
  },

  onPlayerState(callback) {
    return on('desktop:player-state', callback);
  },

  onDesktopState(callback) {
    return on('desktop:state', callback);
  },

  onControl(callback) {
    return on('desktop:control', callback);
  },

  sendControl(action) {
    if (!validControlActions.has(action)) return false;
    ipcRenderer.send('desktop:control', action);
    return true;
  },

  getDesktopState() {
    return ipcRenderer.invoke('desktop:get-state');
  },

  getDesktopSettings() {
    return ipcRenderer.invoke('desktop:get-settings');
  },

  setDesktopSettings(settings) {
    return ipcRenderer.invoke('desktop:set-settings', settings || {});
  },

  toggleLyricsOverlay() {
    return ipcRenderer.invoke('desktop:toggle-lyrics-overlay');
  },

  setLyricsVisible(visible) {
    return ipcRenderer.invoke('desktop:set-lyrics-visible', Boolean(visible));
  },

  toggleClickThrough() {
    return ipcRenderer.invoke('desktop:toggle-click-through');
  },

  setClickThrough(enabled) {
    return ipcRenderer.invoke('desktop:set-click-through', Boolean(enabled));
  },

  toggleAlwaysOnTop() {
    return ipcRenderer.invoke('desktop:toggle-always-on-top');
  },

  setAlwaysOnTop(enabled) {
    return ipcRenderer.invoke('desktop:set-always-on-top', Boolean(enabled));
  },

  toggleOverlayMode() {
    return ipcRenderer.invoke('desktop:toggle-overlay-mode');
  },

  setOverlayMode(mode) {
    return ipcRenderer.invoke('desktop:set-overlay-mode', mode);
  },

  resetOverlayBounds(mode) {
    return ipcRenderer.invoke('desktop:reset-overlay-bounds', mode);
  },

  windowCommand(command) {
    if (!validWindowCommands.has(command)) return Promise.resolve(false);
    return ipcRenderer.invoke('desktop:window-command', command);
  }
});
