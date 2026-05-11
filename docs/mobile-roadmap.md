# Mobile UI and Feature Optimization Plan

Elplayer's mobile version should not simply shrink the desktop interface. The mobile product should be designed around three high-frequency scenarios:

1. listening to local music with large synchronized lyrics
2. watching local video with subtitles
3. using the player as a lightweight PWA on the home screen

## Mobile UX target

The mobile interface should feel like a lyric-first media app:

- large current lyric
- minimal controls near the thumb area
- stable bottom player
- quick access to file import
- video mode that does not cover subtitles unnecessarily
- full-screen lyric mode for listening

## Modes

### 1. Mobile Lyrics Mode

For music listening.

Required behavior:

- current lyric is visually dominant
- previous/next lyric is secondary
- album/track information is compact
- playback controls stay at the bottom
- lyric offset remains accessible, but not always visible

### 2. Mobile Video Subtitle Mode

For local video and subtitle files.

Required behavior:

- video is not cropped by default
- subtitles stay near the bottom but above controls
- only essential controls are visible while watching
- tap screen to show/hide controls

### 3. Mobile Mini Player Mode

For casual listening.

Required behavior:

- show track title and artist/source
- show animated vinyl/disc state
- provide previous, play/pause, next
- hide lyrics completely

### 4. PWA Mode

For home-screen use.

Required behavior:

- safe-area support
- no browser-like layout assumptions
- clear offline/local-first messaging
- install icon and manifest metadata

## Completed in v5.3.0

- Added small-screen control safety CSS.
- Added PWA standalone safe-area spacing.
- Improved horizontal overflow handling for dense side controls.
- Reduced bottom control crowding on very small screens.

## Next implementation milestones

### v5.3.x

- Add explicit mobile mode toggle.
- Add mobile bottom-sheet import panel.
- Add tap-to-hide controls for video mode.
- Add simplified mobile lyric offset panel.

### v5.4

- Add service worker for installable PWA shell.
- Add offline app shell caching.
- Add mobile-first empty state.
- Add real mobile screenshots.

### v5.5

- Evaluate Capacitor or Tauri mobile wrapper.
- Add Android APK proof of concept.
- Evaluate iOS local file limitations.
- Add platform-specific release notes.

## Mobile app store caution

Before attempting mobile store release, verify:

- local file picker behavior on iOS and Android
- background audio policy
- media session support
- privacy policy text
- copyright-sensitive wording around lyrics
- whether bundled demo media is fully licensed
