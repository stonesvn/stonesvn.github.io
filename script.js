'use strict';
const screenshot = document.getElementById('workspace');
const themes = document.querySelectorAll('[data-theme]');
themes.forEach(button => button.addEventListener('click', () => {
  const theme = button.dataset.theme;
  screenshot.src = `assets/workspace-${theme}.png`;
  themes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));

// Keep original text nodes so every language can be switched without losing markup.
const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  if (!node.parentElement.closest('script, style, select') && /[\u3400-\u9fff]/u.test(node.nodeValue)) {
    textNodes.push({node, original: node.nodeValue, key: node.nodeValue.trim()});
  }
}
const attributes = [];
document.querySelectorAll('[aria-label], img[alt], meta[name="description"], meta[property^="og:"]').forEach(element => {
  ['aria-label', 'alt', 'content'].forEach(attribute => {
    const original = element.getAttribute(attribute);
    if (original && /[\u3400-\u9fff]/u.test(original) && element.id !== 'language') attributes.push({element, attribute, original});
  });
});
const originalTitle = document.title;
const languageSelect = document.getElementById('language');
const supportedLanguages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];
function matchLanguage(value) {
  if (/^zh(?:-(?:TW|HK|MO|Hant)(?:-|$))/i.test(value)) return 'zh-TW';
  if (/^zh/i.test(value)) return 'zh-CN';
  return supportedLanguages.find(lang => value.toLowerCase().split('-')[0] === lang) || null;
}
function setLanguage(language, persist = false) {
  if (!supportedLanguages.includes(language)) return;
  const dictionary = translations[language] || {};
  textNodes.forEach(({node, original, key}) => { node.nodeValue = original.replace(key, dictionary[key] || key); });
  attributes.forEach(({element, attribute, original}) => element.setAttribute(attribute, dictionary[original] || original));
  document.title = dictionary[originalTitle] || originalTitle;
  document.documentElement.lang = language;
  languageSelect.value = language;
  const readme = {'zh-CN': 'README.md', 'zh-TW': 'README.zh-TW.md', en: 'README.en.md', ja: 'README.ja.md', ko: 'README.ko.md'}[language];
  // Full user guides are currently available in Chinese; translated READMEs introduce the app in each language.
  document.querySelector('nav a:last-child').href = `https://github.com/firzen/StoneSVN/blob/main/${readme}`;
  if (persist) {
    try { localStorage.setItem('stonesvn-language', language); } catch { /* Storage can be disabled. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
  }
}
let savedLanguage;
try { savedLanguage = localStorage.getItem('stonesvn-language'); } catch { /* Use browser preferences. */ }
const requestedLanguage = new URLSearchParams(location.search).get('lang');
const browserLanguage = (navigator.languages || [navigator.language]).map(matchLanguage).find(Boolean);
setLanguage(supportedLanguages.includes(requestedLanguage) ? requestedLanguage : supportedLanguages.includes(savedLanguage) ? savedLanguage : browserLanguage || 'zh-CN');
languageSelect.addEventListener('change', () => setLanguage(languageSelect.value, true));
