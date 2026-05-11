# Electron Desktop Version

This document describes the first desktop branch structure for Elplayer.

The Electron version keeps the existing Web player as the main window and adds a separate transparent desktop lyrics overlay window.

## Current desktop capabilities

- Main desktop application window
- Independent transparent lyrics overlay window
- Always-on-top lyrics window
- Mouse click-through mode for the lyrics window
- System tray menu
- In-app desktop settings panel
- Global shortcuts
- Renderer-to-overlay lyric state bridge
- Overlay playback controls
- Cross-platform packaging configuration through electron-builder

## Architecture

```text
index.html
  Existing Web player.
  Sends current track, current lyric, playback state, theme color, and timing to Electron.

/electron/main.cjs
  Electron main process.
  Creates the main window, lyrics overlay window, system tray, global shortcuts, and IPC handlers.

/electron/preload.cjs
  Safe bridge between renderer pages and the Electron main process.

/electron/lyrics-overlay.html
/electron/lyrics-overlay.css
/electron/lyrics-overlay.js
  Transparent desktop lyrics window UI.
```

## Local development

Install dependencies:

```bash
npm install
```

Run the desktop app:

```bash
npm run desktop
```

Run the Web version only:

```bash
npm run web:dev
```

## Packaging

Create an unpacked test build:

```bash
npm run dist:dir
```

Create distributable packages:

```bash
npm run dist
```

Build output is written to:

```text
release/
```

## Desktop shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl/Cmd + Shift + L | Show / hide desktop lyrics overlay |
| Ctrl/Cmd + Shift + P | Toggle mouse click-through |
| Ctrl/Cmd + Shift + Space | Play / pause |
| Ctrl/Cmd + Shift + M | Switch lyrics / mini vinyl overlay |
| Ctrl/Cmd + Shift + S | Open desktop settings |

## Tray menu

The tray menu currently includes:

- Show / hide main window
- Open desktop settings
- Show / hide desktop overlay
- Switch lyrics / mini vinyl overlay
- Enable / disable mouse click-through
- Enable / disable always-on-top
- Play / pause
- Previous track
- Next track
- Quit

## Mouse click-through behavior

Click-through mode is implemented on the lyrics overlay window only. When enabled, mouse events pass through the transparent lyrics window to the application underneath it.

Use this mode when you want lyrics to stay on screen while continuing to operate other applications.

## Current limitations

- The overlay receives lyrics from the Web player state; it does not parse files independently.
- True OS-level desktop lyric docking is not implemented yet.
- Production builds still need dedicated `.ico` and `.icns` files for installer-grade icon quality.
- Auto-update is not configured.
- Code signing is not configured.

## Next desktop milestones

- Add native file-open menu and recent files list
- Add native file-open menu and recent files list
- Add multi-monitor overlay preset positions
- Add tray mini-player status text
- Add production `.ico` / `.icns` icons
- Add Windows portable build target
- Add macOS notarization notes
- Add signed auto-update channel
