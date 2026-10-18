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

各页面包含静态翻译、独立标题与描述、canonical、双向 hreflang、Open Graph / Twitter 分享信息与 SoftwareApplication 结构化数据。根入口 canonical 指向 `/zh-CN/` 默认静态内容，作为 x-default 语言选择入口。sitemap.xml 列出五种语言页面。

当前下载链接和结构化数据对应 v1.0.3；新版本发布时同步更新模板中的版本与下载链接、build.mjs 的 softwareVersion，然后重新生成。截图来自应用仓库 docs/images，使用虚构数据，保持中文应用界面。
