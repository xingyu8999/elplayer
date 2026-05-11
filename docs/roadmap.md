# Roadmap

## Completed in v5.2

- Local audio import
- Local video import
- Playlist management
- LRC lyrics parsing
- SRT / VTT subtitle parsing
- TXT lyric timeline generation
- Lyrics offset adjustment
- Floating lyrics display
- Transparent lyrics mode
- Video subtitle mode
- Responsive desktop/mobile layout
- Embed mode
- Keyboard shortcuts
- Glassmorphism UI
- Smart lyric line breaking

## Web Version Improvements

- Add demo media samples
- Improve empty-state preview
- Add drag-and-drop status feedback
- Add more robust filename matching
- Improve malformed LRC/SRT/VTT tolerance
- Add PWA manifest and offline caching
- Add explicit mobile-first lyric-only mode
- Add export/import settings

## Desktop Version

Electron desktop branch structure has been added and improved in v5.3.0.

Implemented foundation:

- Main Electron application window
- Transparent frameless lyrics overlay
- Always-on-top lyric window
- Mouse click-through mode
- System tray controls
- Global shortcut support
- Overlay playback controls
- Renderer-to-overlay lyric sync bridge
- Mini vinyl overlay mode
- Drag-anywhere overlay interaction
- Separate saved overlay bounds for lyrics and mini mode
- electron-builder packaging configuration

Next desktop-only capabilities:

- Native local file menu
- Recent files list
- Desktop lyric lock/unlock
- Auto-start option
- Multi-monitor placement
- Production `.ico` / `.icns` icons
- Code signing and notarization notes

## Long-term Refactor

Potential future directions:

- React component version
- Next.js project website
- Web Audio visualizer module
- Plugin-style parser architecture
- Multi-language UI
- Lyrics search/import integration

## Product Design References

- See [Competitor Analysis](competitor-analysis.md) for desktop/mobile lyrics product positioning.
- See [Mobile Roadmap](mobile-roadmap.md) for phone-side UI and feature planning.
- See [Desktop Optimization Notes](desktop-optimization.md) for overlay interaction decisions.


## Release packaging readiness

Completed in v5.3.4:

- Official `.ico`, `.icns`, and `.png` app icons.
- Windows NSIS installer metadata.
- macOS signing and notarization scaffold.
- GitHub Release template.
- Desktop release GitHub Actions workflow.
- Release validation script.

Next release tasks:

- Replace generated placeholder release icon with final designer-approved brand icon, if needed.
- Test Windows installer on Windows 10 and Windows 11.
- Test macOS signed/notarized build on Apple Silicon and Intel.
- Prepare GitHub Release screenshots and short demo video.
- Decide whether v5.3.4 should be marked as pre-release or stable.


## Release materials

- v5.3.4 adds GitHub Release screenshots, installer usage docs, a download page, first-run onboarding, and in-app release notes.
