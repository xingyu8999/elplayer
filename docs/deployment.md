# 部署说明

## Web 部署

Elplayer Web 版是静态页面，可以直接部署到 GitHub Pages、个人服务器或 CDN。

推荐入口：

```text
index.html
website.html
download.html
```

## 本地预览

```bash
python -m http.server 5173
```

访问：

```text
http://localhost:5173
```

## GitHub Pages

仓库已包含：

```text
.github/workflows/deploy.yml
.nojekyll
```

推送到主分支后，可以在 GitHub Pages 中选择 Actions 部署。

## 官网二级页面

建议部署为：

```text
maxingyu.cn/elplayer/
maxingyu.cn/elplayer/download.html
```

## 嵌入模式

```text
index.html?embed=1
```

该模式会隐藏侧栏，适合嵌入个人网站。

## English Summary

Elplayer Web is a static site and can be deployed to GitHub Pages, a personal website, or any static hosting service.
