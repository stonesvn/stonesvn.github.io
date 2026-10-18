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
export const guideSection = `<section class="section container" id="guides"><h2>SVN guides</h2><p><a href="/en/guides/">Browse all installation and workflow guides</a></p><ul>${guideLinks}</ul></section>`;
export const guideSitemap = `<url><loc>${origin}/en/guides/</loc></url>\n` + guides.map(guide => `<url><loc>${origin}/en/guides/${guide.slug}/</loc></url>`).join('\n');

const breadcrumbData = items => ({'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({'@type': 'ListItem', position: index + 1, name: item.name, item: item.url}))});
const breadcrumbs = items => `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((item, index) => `<li>${index ? '<span aria-hidden="true"> / </span>' : ''}${index === items.length - 1 ? `<span aria-current="page">${escape(item.name)}</span>` : `<a href="${escape(item.url)}">${escape(item.name)}</a>`}</li>`).join('')}</ol></nav>`;
const breadcrumbStyles = '.breadcrumbs ol{display:flex;flex-wrap:wrap;gap:6px;list-style:none;padding:0}.guide .breadcrumbs li{font-size:14px;line-height:1.6;margin:0}';

export async function buildGuides(directory) {
  for (const guide of guides) {
    const url = `${origin}/en/guides/${guide.slug}/`;
    const trail = [{name: 'StoneSVN', url: `${origin}/en/`}, {name: 'SVN guides', url: `${origin}/en/guides/`}, {name: guide.title, url}];
    const articlePublished = guide.published || published;
    const articleReviewed = guide.reviewed || reviewed;
    const reviewLabel = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(articleReviewed));
    const schema = {'@context': 'https://schema.org', '@type': 'TechArticle', headline: guide.title, description: guide.description, inLanguage: 'en', url, mainEntityOfPage: url, datePublished: articlePublished, dateModified: articleReviewed, author: {'@type': 'Organization', name: 'StoneSVN project', url: 'https://github.com/firzen/StoneSVN'}, image: [image], about: {'@type': 'SoftwareApplication', name: 'StoneSVN', url: `${origin}/en/`}};
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(guide.title)} | StoneSVN</title><meta name="description" content="${escape(guide.description)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${escape(guide.title)}"><meta property="og:description" content="${escape(guide.description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="StoneSVN">
<meta property="og:image" content="${image}"><meta property="og:image:alt" content="StoneSVN workspace with fictional SVN changes"><meta property="article:published_time" content="${articlePublished}"><meta property="article:modified_time" content="${articleReviewed}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(guide.title)}"><meta name="twitter:description" content="${escape(guide.description)}"><meta name="twitter:image" content="${image}">
<link rel="icon" href="/assets/stone.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">
<style>.guide{max-width:800px;padding:48px 0 72px}.guide h1{font-size:clamp(32px,5vw,48px);letter-spacing:-1.2px;line-height:1.2}.guide h2{font-size:25px;letter-spacing:-.5px;margin:36px 0 12px}.guide p,.guide li{font-size:17px;line-height:1.8}.guide li{margin:8px 0}.guide a{text-decoration:underline;text-underline-offset:3px;color:var(--blue)}.guide pre{padding:20px;background:white;border:1px solid var(--line);border-radius:8px;overflow:auto}.guide code{font-size:.9em}.guide .related{border-top:1px solid var(--line);margin-top:40px;padding-top:12px}.comparison-scroll{overflow-x:auto;margin:24px 0}.comparison-scroll table{border-collapse:collapse;min-width:680px;width:100%;font-size:15px;line-height:1.6}.comparison-scroll caption{text-align:left;font-weight:600;margin-bottom:12px}.comparison-scroll th,.comparison-scroll td{border:1px solid var(--line);padding:12px;vertical-align:top;text-align:left}.comparison-scroll thead{background:white}.guide .context{font-size:14px;color:var(--muted)}${breadcrumbStyles}</style>
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script><script type="application/ld+json">${JSON.stringify(breadcrumbData(trail)).replaceAll('<','\\u003c')}</script></head><body>
<a class="skip" href="#main">Skip to content</a><header class="header"><div class="container nav"><a class="brand" href="/en/"><img src="/assets/stone.svg" alt="" width="36" height="36">StoneSVN</a><nav aria-label="Main navigation"><a href="/en/guides/">Guides</a><a href="/en/#download">Download</a></nav></div></header>
<main class="container guide" id="main">${breadcrumbs(trail)}<article><p class="eyebrow">STONESVN · PRACTICAL GUIDES</p><h1>${escape(guide.title)}</h1><p class="context">By the <a href="https://github.com/firzen/StoneSVN">StoneSVN project</a> · Checked against StoneSVN v1.1.2 · Reviewed <time datetime="${articleReviewed}">${reviewLabel}</time></p>${guide.body}
<p><a href="https://github.com/firzen/StoneSVN/releases/latest">Download official installers</a> · <a href="https://github.com/firzen/StoneSVN/tree/v1.1.2">Source at v1.1.2</a> · <a href="https://github.com/firzen/StoneSVN/issues">Report an issue</a></p></article>
<nav class="related" aria-label="Related guides"><h2>Related guides</h2><ul>${guideLinks}</ul></nav></main></body></html>\n`;
    const target = path.join(directory, 'en/guides', guide.slug);
    await mkdir(target, {recursive: true});
    await writeFile(path.join(target, 'index.html'), html);
  }
  const url = `${origin}/en/guides/`;
  const title = 'SVN guides: installation, ignore rules and local stashes';
  const description = 'Set up StoneSVN on macOS, Windows or Linux, review SVN working copies, configure local file filters and stash selected text changes.';
  const installation = guides.filter(guide => guide.slug.startsWith('svn-client-'));
  const comparisons = guides.filter(guide => guide.kind === 'comparison');
  const workflows = guides.filter(guide => !guide.slug.startsWith('svn-client-') && guide.kind !== 'comparison');
  const ordered = [...installation, ...comparisons, ...workflows];
  const trail = [{name: 'StoneSVN', url: `${origin}/en/`}, {name: 'SVN guides', url}];
  const schema = {'@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url, inLanguage: 'en', mainEntity: {'@type': 'ItemList', numberOfItems: ordered.length, itemListElement: ordered.map((guide, index) => ({'@type': 'ListItem', position: index + 1, name: guide.title, url: `${url}${guide.slug}/`}))}};
  const cards = items => items.map(guide => `<li><h3><a href="${guide.slug}/">${escape(guide.title)}</a></h3><p>${escape(guide.description)}</p></li>`).join('');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)} | StoneSVN</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta property="og:image:alt" content="StoneSVN workspace with fictional SVN changes">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${image}">
<link rel="icon" href="/assets/stone.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">
<style>.guide{max-width:800px;padding:40px 0 72px}.guide h1{font-size:clamp(32px,5vw,48px);letter-spacing:-1px;line-height:1.2}.guide h2{margin:36px 0 16px;font-size:28px}.guide h3{font-size:21px;line-height:1.4}.guide p{line-height:1.8}.guide a{color:var(--blue);text-decoration:underline;text-underline-offset:3px}.guide-list{padding:0;list-style:none}.guide-list>li{border-top:1px solid var(--line);padding:20px 0}.guide-list h3{margin:0 0 8px}.guide-list p{margin:0}${breadcrumbStyles}</style>
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script><script type="application/ld+json">${JSON.stringify(breadcrumbData(trail)).replaceAll('<','\\u003c')}</script></head><body>
<a class="skip" href="#main">Skip to content</a><header class="header"><div class="container nav"><a class="brand" href="/en/">StoneSVN</a><nav aria-label="Main navigation"><a href="/en/#download">Download</a><a href="https://github.com/firzen/StoneSVN">Source</a></nav></div></header>
<main class="container guide" id="main">${breadcrumbs(trail)}<h1>SVN guides</h1><p>Practical setup and workflow guides for StoneSVN, an MIT-licensed Subversion desktop client. Start with your operating system, then choose the task you want to complete.</p>
<h2>Install and open a working copy</h2><p>StoneSVN requires a separately installed SVN CLI. These guides explain the available packages, executable discovery and opening an existing working copy.</p><ul class="guide-list">${cards(installation)}</ul>
<h2>Compare Mac SVN workflows</h2><p>Choose between a separate workspace, Finder integration and the advanced SVN operations your team needs.</p><ul class="guide-list">${cards(comparisons)}</ul>
<h2>Review and organize local changes</h2><p>Understand which settings stay local to StoneSVN and which changes become part of SVN history.</p><ul class="guide-list">${cards(workflows)}</ul>
<h2>Version context and sources</h2><p>These are project-authored guides checked against StoneSVN v1.1.2. Each article links to source or supporting documentation and explains relevant limits. General Merge, Switch and line-by-line Blame interfaces are not currently available.</p><p><a href="https://github.com/firzen/StoneSVN/blob/main/docs/user-guide.md">Read the current user guide</a> · <a href="https://github.com/firzen/StoneSVN/issues">Report a documentation issue</a></p></main></body></html>\n`;
  await writeFile(path.join(directory, 'en/guides/index.html'), html);
}
