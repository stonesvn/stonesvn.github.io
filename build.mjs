import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const directory=path.dirname(fileURLToPath(import.meta.url));
const template=await readFile(path.join(directory,'source/template.html'),'utf8');
const translations=JSON.parse(await readFile(path.join(directory,'source/translations.json'),'utf8'));
const origin='https://stonesvn.github.io';
const languages=['en','zh-CN','zh-TW','ja','ko'];
const locales={'zh-CN':'zh_CN','zh-TW':'zh_TW',en:'en_US',ja:'ja_JP',ko:'ko_KR'};
const names={'zh-CN':'简体中文','zh-TW':'繁體中文',en:'English',ja:'日本語',ko:'한국어'};
const readmes={'zh-CN':'README.md','zh-TW':'README.zh-TW.md',en:'README.en.md',ja:'README.ja.md',ko:'README.ko.md'};
const titles={"zh-CN": "StoneSVN · 更顺手的 macOS SVN 客户端，支持全局忽略", "zh-TW": "StoneSVN · 更順手的 macOS SVN 用戶端，支援全域忽略", "en": "StoneSVN · SVN for macOS with Global Ignore | Windows & Linux", "ja": "StoneSVN · 共通の除外ルールで使いやすい macOS SVN クライアント", "ko": "StoneSVN · 전역 파일 제외를 지원하는 macOS SVN 클라이언트"};
const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const alternates=languages.map(lang=>`<link rel="alternate" hreflang="${lang}" href="${origin}/${lang}/">`).join('\n')+`\n<link rel="alternate" hreflang="x-default" href="${origin}/en/">`;
function render(lang){
 const dictionary=translations[lang]||{};
 let html=template.replace(/<meta name="robots" content="noindex">\s*/,'');
 // Translate whole text nodes and quoted attributes, preserving all element structure.
 html=html.replace(/(<[^>]+>)|([^<]+)/g,(match,tag,text)=>{
  if(tag)return tag.replace(/="([^"]*)"/g,(attribute,value)=>dictionary[value]?`="${escape(dictionary[value])}"`:attribute);
  const key=text.trim();return dictionary[key]?text.replace(key,escape(dictionary[key])):text;
 });
 html=html.replace('<html lang="zh-CN">',`<html lang="${lang}">`)
  .replace(/<title>.*?<\/title>/,`<title>${escape(titles[lang])}</title>`)
  .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${escape(titles[lang])}">`)
  .replaceAll('href="assets/','href="/assets/').replaceAll('src="assets/','src="/assets/')
  .replaceAll('/assets/workspace-light.png',`/assets/screenshots/${lang}-workspace-light.png`).replaceAll('/assets/properties.png',`/assets/screenshots/${lang}-properties.png`)
  .replace('href="style.css"','href="/style.css"').replace('src="script.js"','src="/script.js"')
  .replace(`value="${lang}"`,`value="${lang}" selected`)
  .replace('https://github.com/firzen/StoneSVN/blob/main/docs/user-guide.md',`https://github.com/firzen/StoneSVN/blob/main/${readmes[lang]}`);
 const url=`${origin}/${lang}/`;
 const description=html.match(/<meta name="description" content="([^"]*)"/)[1];
 const schema={'@context':'https://schema.org','@type':'SoftwareApplication',name:'StoneSVN',applicationCategory:'DeveloperApplication',operatingSystem:'Windows, macOS, Linux',inLanguage:lang,url,description,license:'https://opensource.org/license/mit',downloadUrl:'https://github.com/firzen/StoneSVN/releases/latest',image:`${origin}/assets/screenshots/${lang}-workspace-light.png`,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}};
 const seo=`<link rel="canonical" href="${url}">\n${alternates}\n<meta property="og:url" content="${url}">\n<meta property="og:site_name" content="StoneSVN">\n<meta property="og:locale" content="${locales[lang]}">\n${languages.filter(other=>other!==lang).map(other=>`<meta property="og:locale:alternate" content="${locales[other]}">`).join('\n')}\n<meta property="og:image" content="${origin}/assets/screenshots/${lang}-workspace-light.png">\n<meta property="og:image:width" content="1440">\n<meta property="og:image:height" content="900">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${escape(titles[lang])}">\n<meta name="twitter:description" content="${description}">\n<meta name="twitter:image" content="${origin}/assets/screenshots/${lang}-workspace-light.png">\n<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>\n`;
 html=html.replace('</head>',`${seo}</head>`);
 const links=languages.map(other=>`<a href="/${other}/" lang="${other}" hreflang="${other}"${other===lang?' aria-current="page"':''}>${names[other]}</a>`).join('');
 html=html.replace('</footer>',`</footer><nav class="language-links container" aria-label="Languages">${links}</nav>`);
 return html;
}
for(const language of languages){await mkdir(path.join(directory,language),{recursive:true});await writeFile(path.join(directory,language,'index.html'),render(language));}
// Serve English content at the entry when JavaScript is unavailable. Its
// canonical and x-default point to /en/; browser detection is entry-only.
const entry=render('en').replace('<meta charset="utf-8">','<meta charset="utf-8"><script src="/detect-language.js"></script>');
await writeFile(path.join(directory,'index.html'),entry);
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${languages.map(lang=>`<url><loc>${origin}/${lang}/</loc>${languages.map(other=>`<xhtml:link rel="alternate" hreflang="${other}" href="${origin}/${other}/"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en/"/></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(directory,'sitemap.xml'),sitemap);
await writeFile(path.join(directory,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Generated five static language pages, browser language entry, and sitemap.');
