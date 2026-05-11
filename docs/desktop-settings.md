# Desktop Settings Panel

Elplayer v5.3.1 adds a visual settings panel for the Electron desktop overlay.

## Entry points

You can open the panel from:

- the main player right-top `Desktop Settings` button
- the desktop overlay right-top gear button
- the tray menu
- `Ctrl/Cmd + Shift + S`

## Settings

| Setting | Description |
| --- | --- |
| Show desktop overlay | Shows or hides the transparent desktop overlay. |
| Overlay mode | Switches between desktop lyrics and mini vinyl mode. |
| Opacity | Controls overlay window opacity. |
| Lyric font size | Controls desktop lyric text size. |
| Mini size | Controls mini vinyl overlay size. |
| Always on top | Keeps the overlay above normal windows. |
| Mouse click-through | Sends pointer events through the overlay to apps underneath. |
| Window lock | Disables moving/resizing the overlay. |
| Launch at login | Requests OS-level launch at login through Electron. |
| Reset current position | Restores the current overlay mode to a safe centered position. |

## Click-through recovery

When mouse click-through is enabled, the overlay intentionally cannot receive pointer input. To disable it again, use one of these routes:

- main player `Desktop Settings` button
- tray menu
- `Ctrl/Cmd + Shift + P`

## macOS notes

Transparent always-on-top overlays can behave differently across macOS workspace and fullscreen modes. v5.3.1 reasserts the overlay layer while visible, but release testing should still include Mission Control, fullscreen apps, external monitors, and sleep/wake transitions.
