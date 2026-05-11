# Elplayer v5.3.4 发布说明

> 本说明以中文为主；英文摘要放在后面，便于后续面向海外用户发布。

![Elplayer v5.3.4 Release Cover](public/release/github-release-cover.png)

## 本次版本重点

v5.3.4 是真实发布前的修正版，重点解决三个问题：

1. **中文优先**：README、更新公告、安装说明、下载页、官网展示页均改为先中文后英文摘要。
2. **窗口化适配**：主播放器在小窗口下自动进入紧凑布局，减少非必要按钮，避免右下角播放器遮挡和文字截断。
3. **极简小尺寸修复**：极简黑胶机小尺寸模式优先保证歌名、歌手和黑胶动效可读，上一曲/下一曲按钮改为悬停显示。

## 桌面端截图

| 桌面歌词浮窗 | 极简黑胶机 |
| --- | --- |
| ![桌面歌词浮窗](public/release/release-desktop-overlay.png) | ![极简黑胶机](public/release/release-mini-vinyl.png) |

| 桌面设置面板 | 移动端 / PWA |
| --- | --- |
| ![桌面设置面板](public/release/release-settings-panel.png) | ![移动端 PWA](public/release/release-mobile-pwa.png) |

## 下载

- Windows x64: `Elplayer-5.3.4-Setup-x64.exe`
- macOS Apple Silicon / Intel: 请在完成签名与公证后上传 DMG / ZIP
- Web / PWA: 可直接部署本仓库的 `index.html`

下载页：`download.html`  
官网展示页：`website.html`

## 安装前说明

- Windows 默认只发布 x64 安装包。
- macOS 对外分发前应完成 Developer ID 签名与 Apple 公证。
- 鼠标穿透开启后，可通过主窗口“桌面设置”、托盘菜单或快捷键恢复。
- MKV / AVI 播放取决于系统和 Chromium 编码支持，推荐 MP4 / H.264 / AAC。

## 发布前检查

- [ ] `npm run release:check` 通过
- [ ] `npm run dist:win` 生成 Windows x64 安装包
- [ ] 安装后桌面快捷方式、开始菜单、托盘图标正常
- [ ] 窗口化小窗口下播放器不遮挡、不截断主要文字
- [ ] 极简黑胶机小尺寸下歌名、歌手可读
- [ ] `download.html` 链接已替换为已上传的 GitHub Release 附件
- [ ] macOS 完成签名/公证后再公开下载

---

## English Summary

Elplayer v5.3.4 is a release-candidate packaging update. It improves Chinese-first release materials, compact windowed layout, mini vinyl small-size readability, website/download pages, and macOS signing/notarization preparation.
