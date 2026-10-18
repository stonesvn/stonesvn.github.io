# StoneSVN 项目主页

不依赖构建工具的静态网站，可直接部署到 GitHub Pages。

## 本地预览

在此目录运行 `python3 -m http.server 8088 --bind 127.0.0.1`，访问 http://127.0.0.1:8088。

## 发布

将此目录内容推送至组织 `stonesvn` 下的公开仓库 `stonesvn.github.io`。在 Settings → Pages 中将 Source 设为 Deploy from a branch，选择 main 分支和 / (root)。

主页：https://stonesvn.github.io

当前下载链接对应 v1.0.3；发布新版本时同步修改 index.html 的版本标记与安装包链接。源码、文档和下载指向 firzen/StoneSVN，组织建立不需要迁移应用仓库。

截图来自应用仓库 docs/images，使用虚构项目数据。浅色/深色切换只切换截图预览。
