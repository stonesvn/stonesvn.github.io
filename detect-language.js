'use strict';
// Only the neutral entry page redirects. Language-specific URLs remain stable.
(() => {
  if (location.pathname !== '/' && location.pathname !== '/index.html') return;
  const supported = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];
  const match = value => {
    if (/^zh/i.test(value)) return /(?:^|-)(?:TW|HK|MO|Hant)(?:-|$)/i.test(value) ? 'zh-TW' : 'zh-CN';
    return supported.find(lang => lang === value.toLowerCase().split('-')[0]);
  };
  const url = new URL(location.href);
  const requested = url.searchParams.get('lang');
  const language = supported.includes(requested) ? requested :
    (navigator.languages || [navigator.language]).map(match).find(Boolean) || 'en';
  url.pathname = `/${language}/`;
  url.searchParams.delete('lang');
  location.replace(url.href);
})();
