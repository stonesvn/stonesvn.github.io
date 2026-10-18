# StoneSVN 项目主页

官网：https://stonesvn.github.io

无运行时依赖的静态网站。源码在 main 分支维护，由 `.github/workflows/sync-release.yml` 构建并通过 GitHub Actions 部署到 Pages（`build_type: workflow`）。

代码代理先阅读 [AGENTS.md](AGENTS.md)。应用仓库的[发布指南](https://github.com/firzen/StoneSVN/blob/main/docs/releasing.md)记录了正式发版入口与最终验收清单。

## 修改和构建

- 页面结构与简体中文文案：`source/template.html`
- 其他语言翻译：`source/translations.json`
- 样式：`style.css`
- 截图切换、语言导航：`script.js`
- 根入口的浏览器语言识别：`detect-language.js`

修改源文件后运行 `node --test source/releases.test.cjs` 和 `node build.mjs`。提交生成的根入口、五种语言目录、robots.txt 和 sitemap.xml。源模板带有 noindex，生成页面移除此标记。

本地预览：在此目录运行 `python3 -m http.server 8088 --bind 127.0.0.1`。

## 语言与 SEO

访问根地址时按浏览器语言顺序选择简体中文、繁体中文、英语、日语或韩语；其他语言回退到英语，不读取旧版本保存的语言偏好。旧的 `?lang=en` 链接仍可跳转。

每种语言都有稳定地址：`/zh-CN/`、`/zh-TW/`、`/en/`、`/ja/`、`/ko/`。直接打开指定语言地址不会再次按浏览器语言跳转，手动切换和页脚语言链接跳转到相应地址；未启用 JavaScript 时仍可阅读全部内容并通过页脚切换语言。

各页面包含静态翻译、独立标题与描述、canonical、双向 hreflang、Open Graph / Twitter 分享信息与 SoftwareApplication 结构化数据。根入口默认提供完整英文内容，canonical 与 x-default 都指向 `/en/`；启用 JavaScript 时继续按浏览器语言自动匹配。sitemap.xml 列出五种语言页面。

版本号与下载链接由 `releases.js` 自动读取 GitHub 最新正式版本。接口返回的 tag、发布页和实际安装包地址用于更新页面及结构化数据，无需手动修改主页版本号；正式版同步任务会自动重建静态更新说明和截图。未加载 JavaScript、API 不可用或对应安装包缺失时，按钮指向 GitHub 的 `/releases/latest` 页面，不保留旧版本链接。接口失败时保留静态版本元数据，旧缓存不能把新部署页面降回旧版本。每个浏览器会话缓存 5 分钟以减少 API 请求；缓存到期后再次访问或返回页面会刷新。截图由应用源码和 docs/images/workspace-demo.js 的虚构数据生成，各语言分别截取浅色工作台、深色工作台与属性页，位于 assets/screenshots/，与页面语言、分享预览和主题切换同步。

## 正式发布自动同步

应用仓库的 `Stable Release` 在四个平台检查和打包成功后才打标签并发布。本仓库 `Sync Release and Deploy` 每 5 分钟检查 Latest 正式版，有新版本才更新；GitHub 定时任务可能延迟。可在本仓库 Actions 手动运行立即同步，无需重发版本。任务无变更时跳过依赖安装、截图和部署。若前一次部署失败，下次定时检查会重新部署，即使更新摘要已经提交；截图不必重复生成。

`source/release.json` 由流水线生成，记录版本、公开时间、源码 SHA 和五种语言摘要。`build.mjs` 把更新说明与版本结构化数据写入静态 HTML，禁用 JavaScript 时也能阅读。截图地址附带源码 SHA，主题切换同样保留该缓存标识。

摘要源文件位于应用仓库 `docs/releases/vX.Y.Z.website.json`；截图脚本为 `scripts/capture-website.cjs`，使用 Playwright Chromium 和 `docs/images/workspace-demo.js` 的虚构数据，截图脚本和浏览器依赖也取自发布标签，从固定源码渲染 1440×900 截图（v1.1.2 使用固定提交的兼容脚本），不连接真实工作副本。每种语言包含浅色工作区、深色工作区和属性页，共 15 张。

官网使用本仓库自身的 GITHUB_TOKEN 提交生成内容，并通过 deploy-pages 显式部署，不需要 deploy key 或个人令牌。Pages 必须设置为 GitHub Actions 发布。部署包只包含公开静态资源，不包含源码检出目录或自动化工具。普通 main 推送也会触发部署；并发维护导致推送冲突时下一次运行重试，禁止强推。

[GitHub 会停用 60 天没有仓库活动的公开仓库定时任务](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。为保持长期自动同步，定时任务仅在官网连续 30 天无提交时创建一次空维护提交，不修改页面或触发部署。

## English guides

The English guides are maintained in source/guides.mjs and rendered by source/build-guides.mjs during node build.mjs. They are linked from the English homepage and the generated /en/guides/ directory, and included in sitemap.xml. Article breadcrumbs and matching BreadcrumbList data link back to this directory. Review the pinned v1.1.2 content and verification date when behavior changes. Generated pages are included by the existing Pages deployment.
