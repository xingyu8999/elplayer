# Elplayer Icon Replacement Pack

这是一套统一后的 Elplayer 图标替换包。

## 使用方式

把本压缩包内的文件夹直接复制到项目根目录，覆盖同名文件即可。

## 主视觉

所有图标均从 `assets/brand/elplayer-icon-master.png` 派生，避免官网、安装包、任务栏、托盘、PWA 图标不一致。

## 主要替换路径

- `public/logo.svg`
- `public/favicon.svg`
- `public/favicon.ico`
- `public/icons/app-icon.png`
- `public/icons/icon-192.svg`
- `public/icons/icon-512.svg`
- `public/icons/tray.png`
- `build/icon.png`
- `build/icon.ico`
- `build/icon.icns`
- `assets/icons/logo.svg`
- `assets/icons/favicon.svg`

## Windows 打包要求

`build/icon.ico` 已包含 256×256 图层，可通过 electron-builder 的 Windows 图标检查。
