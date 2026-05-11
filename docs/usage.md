# 使用说明

## 快速开始

1. 打开 `index.html`，或运行本地服务。
2. 拖入音频或视频文件。
3. 拖入同名 LRC / SRT / VTT / TXT 歌词或字幕文件。
4. 根据场景选择歌词模式、视频模式或桌面浮窗模式。

## 本地服务

```bash
python -m http.server 5173
```

访问：

```text
http://localhost:5173
```

## 桌面版启动

```bash
npm install
npm run desktop
```

## 媒体导入

支持音频、视频和字幕/歌词文件。推荐同名匹配：

```text
song.mp3
song.lrc

movie.mp4
movie.srt
```

## 桌面浮窗

桌面版右上角点击“桌面设置”，可以管理：

- 显示 / 隐藏桌面浮窗
- 桌面歌词 / 极简黑胶机模式
- 鼠标穿透
- 窗口置顶
- 窗口锁定
- 透明度
- 字号
- 极简尺寸
- 重置位置

## 窗口化适配

v5.3.4 开始，小窗口下播放器会自动进入紧凑布局：

- 隐藏部分次要按钮
- 保留上一曲、播放/暂停、下一曲
- 减少播放器高度
- 避免文字截断和 UI 重叠

## 嵌入模式

```text
index.html?embed=1
```

该模式适合放入个人网站页面。

## English Summary

Open the player, import local media and matching lyrics/subtitles, then choose a web, desktop overlay, mini vinyl, or video subtitle mode.
