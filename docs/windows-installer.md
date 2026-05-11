# Windows 安装包说明

## 安装包类型

Elplayer 使用 electron-builder 的 NSIS 安装器。

当前配置为：

```json
{
  "oneClick": false,
  "perMachine": false,
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true,
  "shortcutName": "Elplayer"
}
```

这意味着用户会看到明确的安装流程，并且可以选择安装目录。

## 应用身份

```text
cn.maxingyu.elplayer
```

公开发布后不要随意修改 `appId`。Windows 安装、卸载、快捷方式、通知和后续更新都依赖稳定的应用身份。

## 图标

Windows 安装包图标：

```text
build/icon.ico
```

托盘图标：

```text
public/icons/tray.png
```

如果任务栏或托盘只显示名称、不显示图标，先重新生成图标：

```bash
npm run icons:build
```

## 构建命令

```bash
npm install
npm run release:check
npm run dist:win
```

默认输出：

```text
release/Elplayer-5.3.4-Setup-x64.exe
```

## 为什么默认只构建 x64

默认 Windows 发布目标是 x64。这样可以覆盖主流 Windows 10/11 用户，并避免构建时额外下载 32 位 Electron 包导致失败。

如确实需要 32 位版本，再单独执行：

```bash
npm run dist:win:ia32
```

## 发布前检查

- [ ] Windows 10 / 11 可以安装
- [ ] 桌面快捷方式正常
- [ ] 开始菜单快捷方式正常
- [ ] 任务栏显示图标
- [ ] 托盘显示图标
- [ ] 卸载项显示为 Elplayer
- [ ] 本地媒体导入正常
- [ ] 桌面浮窗、鼠标穿透、置顶、极简黑胶机正常
- [ ] 窗口化小窗口下播放器不重叠、不截断主要文字

## English Summary

Elplayer uses an assisted NSIS installer for Windows x64 by default. Build ia32 only when explicitly needed.
