# v5.3.4 发布流程说明

> 本文件先写中文。英文摘要如有需要可在正式对外发布时追加。

## 1. 本地检查

```bash
npm install
npm run release:check
```

## 2. 构建 Windows x64 安装包

```bash
npm run dist:win
```

默认生成文件：

```text
release/Elplayer-5.3.4-Setup-x64.exe
```

## 3. 构建 macOS 包

```bash
npm run dist:mac
```

macOS 包对外公开前，应完成 Developer ID 签名与 Apple 公证。Electron 官方文档将 macOS 发布分为两个关键步骤：先代码签名，再上传 Apple 进行公证。Apple 官方文档说明，`notarytool` 与 `stapler` 用于上传软件并附加公证票据。

## 4. 创建 GitHub Release

推荐命令：

```bash
git tag v5.3.4
git push origin v5.3.4
```

然后在 GitHub Release 页面粘贴 `.github/release-template.md` 的内容。

需要上传的附件：

```text
Elplayer-5.3.4-Setup-x64.exe
Elplayer-5.3.4-arm64.dmg
Elplayer-5.3.4-x64.dmg
Elplayer-5.3.4-arm64.zip
Elplayer-5.3.4-x64.zip
```

实际有哪些 macOS 文件，以你的本机构建结果为准。

## 5. 替换下载页链接

`download.html` 已经预置 GitHub Release v5.3.4 的目标路径。上传附件后检查：

```text
https://github.com/xingyu8999/elplayer/releases/download/v5.3.4/Elplayer-5.3.4-Setup-x64.exe
```

如果实际文件名不同，必须同步修改 `download.html`。

## 6. 官网展示页

`website.html` 可以直接放到：

```text
maxingyu.cn/elplayer/
```

`download.html` 可以放到：

```text
maxingyu.cn/elplayer/download.html
```

## 7. 发布前验收

- [ ] Windows 安装包可下载
- [ ] Windows 安装后桌面快捷方式、开始菜单、托盘图标正常
- [ ] 应用内显示版本为 v5.3.4
- [ ] 首次启动引导只出现一次
- [ ] 窗口化布局不遮挡主 UI
- [ ] 极简小尺寸不截断主要文字
- [ ] macOS 构建已签名和公证
- [ ] 下载页链接可访问
- [ ] GitHub Release 截图正常显示
