# 首次启动与版本更新弹窗说明

## 首次启动引导

首次启动引导会按版本 key 显示一次：

```text
elplayer.onboarding.seen.5.3.4
```

引导内容包括：

- 如何导入本地媒体
- 如何匹配歌词或字幕
- 如何进入桌面浮窗设置
- 如何使用桌面歌词和极简黑胶机

## 版本更新弹窗

当应用检测到本地记录版本与当前版本不一致时，会显示版本更新弹窗。也可以通过以下方式强制测试：

```text
index.html?release=1
```

相关本地存储 key：

```text
elplayer.releaseNotes.seen.5.3.4
elplayer.lastVersion
```

## v5.3.4 弹窗内容

本版本弹窗应优先展示中文：

- 中文优先的发布文档和公告
- 窗口化紧凑布局修复
- 极简黑胶机小尺寸修复
- 官网展示页和下载页准备
- macOS 签名/公证准备

## 验收清单

- [ ] 全新用户资料下首次启动引导出现一次
- [ ] 点击“开始使用”后不再反复出现
- [ ] `?release=1` 能打开版本更新弹窗
- [ ] Esc 可以关闭弹窗
- [ ] 文案先中文，英文只作为补充

## English Summary

The first-run onboarding and release notes modal should present Chinese first. English summaries may be added only after the Chinese content.
