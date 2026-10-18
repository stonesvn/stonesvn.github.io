import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {guides} from './guides.mjs';

const origin = 'https://stonesvn.github.io';
const image = `${origin}/assets/screenshots/en-workspace-light.png`;
// Keep these dates tied to editorial review, rather than the build time.
const published = '2026-10-18';
const reviewed = '2026-10-18';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export const guideLinks = guides.map(guide => `<li><a href="/en/guides/${guide.slug}/">${escape(guide.title)}</a></li>`).join('');
export const guideSection = `<section class="section container" id="guides"><h2>SVN guides</h2><ul>${guideLinks}</ul></section>`;
export const guideSitemap = guides.map(guide => `<url><loc>${origin}/en/guides/${guide.slug}/</loc></url>`).join('\n');

export async function buildGuides(directory) {
  for (const guide of guides) {
    const url = `${origin}/en/guides/${guide.slug}/`;
    const schema = {'@context': 'https://schema.org', '@type': 'TechArticle', headline: guide.title, description: guide.description, inLanguage: 'en', url, mainEntityOfPage: url, datePublished: published, dateModified: reviewed, author: {'@type': 'Organization', name: 'StoneSVN project', url: 'https://github.com/firzen/StoneSVN'}, image: [image], about: {'@type': 'SoftwareApplication', name: 'StoneSVN', url: `${origin}/en/`}};
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(guide.title)} | StoneSVN</title><meta name="description" content="${escape(guide.description)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${escape(guide.title)}"><meta property="og:description" content="${escape(guide.description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="StoneSVN">
<meta property="og:image" content="${image}"><meta property="og:image:alt" content="StoneSVN workspace with fictional SVN changes"><meta property="article:published_time" content="${published}"><meta property="article:modified_time" content="${reviewed}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(guide.title)}"><meta name="twitter:description" content="${escape(guide.description)}"><meta name="twitter:image" content="${image}">
<link rel="icon" href="/assets/stone.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">
<style>.guide{max-width:800px;padding:48px 0 72px}.guide h1{font-size:clamp(32px,5vw,48px);letter-spacing:-1.2px;line-height:1.2}.guide h2{font-size:25px;letter-spacing:-.5px;margin:36px 0 12px}.guide p,.guide li{font-size:17px;line-height:1.8}.guide li{margin:8px 0}.guide a{text-decoration:underline;text-underline-offset:3px;color:var(--blue)}.guide pre{padding:20px;background:white;border:1px solid var(--line);border-radius:8px;overflow:auto}.guide code{font-size:.9em}.guide .related{border-top:1px solid var(--line);margin-top:40px;padding-top:12px}.guide .context{font-size:14px;color:var(--muted)}</style>
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head><body>
<a class="skip" href="#main">Skip to content</a><header class="header"><div class="container nav"><a class="brand" href="/en/"><img src="/assets/stone.svg" alt="" width="36" height="36">StoneSVN</a><nav aria-label="Main navigation"><a href="/en/#guides">Guides</a><a href="/en/#download">Download</a></nav></div></header>
<main class="container guide" id="main"><article><p class="eyebrow">STONESVN · PRACTICAL GUIDES</p><h1>${escape(guide.title)}</h1><p class="context">By the <a href="https://github.com/firzen/StoneSVN">StoneSVN project</a> · Checked against StoneSVN v1.1.2 · Reviewed <time datetime="${reviewed}">18 October 2026</time></p>${guide.body}
<p><a href="https://github.com/firzen/StoneSVN/releases/latest">Download official installers</a> · <a href="https://github.com/firzen/StoneSVN/tree/v1.1.2">Source at v1.1.2</a> · <a href="https://github.com/firzen/StoneSVN/issues">Report an issue</a></p></article>
<nav class="related" aria-label="Related guides"><h2>Related guides</h2><ul>${guideLinks}</ul></nav></main></body></html>\n`;
    const target = path.join(directory, 'en/guides', guide.slug);
    await mkdir(target, {recursive: true});
    await writeFile(path.join(target, 'index.html'), html);
  }
}
