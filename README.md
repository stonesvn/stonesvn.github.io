# StoneSVN 项目主页

官网：https://stonesvn.github.io

无运行时依赖的静态网站，使用 GitHub Pages 从 main 分支根目录发布。

## 修改和构建

- 页面结构与简体中文文案：`source/template.html`
- 其他语言翻译：`source/translations.json`
- 样式：`style.css`
- 截图切换、语言导航：`script.js`
- 根入口的浏览器语言识别：`detect-language.js`

修改源文件后运行 `node build.mjs`。提交生成的根入口、五种语言目录、robots.txt 和 sitemap.xml。源模板带有 noindex，生成页面移除此标记。

本地预览：在此目录运行 `python3 -m http.server 8088 --bind 127.0.0.1`。

## 语言与 SEO

访问根地址时按浏览器语言顺序选择简体中文、繁体中文、英语、日语或韩语；其他语言回退到英语，不读取旧版本保存的语言偏好。旧的 `?lang=en` 链接仍可跳转。

每种语言都有稳定地址：`/zh-CN/`、`/zh-TW/`、`/en/`、`/ja/`、`/ko/`。直接打开指定语言地址不会再次按浏览器语言跳转，手动切换和页脚语言链接跳转到相应地址；未启用 JavaScript 时仍可阅读全部内容并通过页脚切换语言。

各页面包含静态翻译、独立标题与描述、canonical、双向 hreflang、Open Graph / Twitter 分享信息与 SoftwareApplication 结构化数据。根入口默认提供完整英文内容，canonical 与 x-default 都指向 `/en/`；启用 JavaScript 时继续按浏览器语言自动匹配。sitemap.xml 列出五种语言页面。

版本号与下载链接由 `releases.js` 自动读取 GitHub 最新正式版本。接口返回的 tag、发布页和实际安装包地址用于更新页面及结构化数据，无需为发版重新构建主页。未加载 JavaScript、API 不可用或对应安装包缺失时，按钮指向 GitHub 的 `/releases/latest` 页面，不保留旧版本链接。每个浏览器会话缓存 5 分钟以减少 API 请求；缓存到期后再次访问或返回页面会刷新。截图由应用源码和 docs/images/workspace-demo.js 的虚构数据生成，各语言分别截取浅色工作台、深色工作台与属性页，位于 assets/screenshots/，与页面语言、分享预览和主题切换同步。

## 正式发布自动同步

应用仓库的 `Stable Release` 在四个平台检查和打包成功后才打标签并发布。本仓库 `Sync Release and Deploy` 每 5 分钟检查 Latest 正式版，有新版本才更新；GitHub 定时任务可能延迟。可在本仓库 Actions 手动运行立即同步，无需重发版本。任务无变更时跳过依赖安装、截图和部署。

`source/release.json` 由流水线生成，记录版本、公开时间、源码 SHA 和五种语言摘要。`build.mjs` 把更新说明与版本结构化数据写入静态 HTML，禁用 JavaScript 时也能阅读。截图地址附带源码 SHA，主题切换同样保留该缓存标识。

摘要源文件位于应用仓库 `docs/releases/vX.Y.Z.website.json`；截图脚本为 `scripts/capture-website.cjs`，使用 Playwright Chromium 和 `docs/images/workspace-demo.js` 的虚构数据，从发布标签渲染 1440×900 截图，不连接真实工作副本。每种语言包含浅色工作区、深色工作区和属性页，共 15 张。

官网使用本仓库自身的 GITHUB_TOKEN 提交生成内容，并通过 deploy-pages 显式部署，不需要 deploy key 或个人令牌。Pages 必须设置为 GitHub Actions 发布。部署包只包含公开静态资源，不包含源码检出目录或自动化工具。普通 main 推送也会触发部署；并发维护导致推送冲突时下一次运行重试，禁止强推。
