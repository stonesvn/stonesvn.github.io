'use strict';
const screenshot = document.getElementById('workspace');
const themes = document.querySelectorAll('[data-theme]');
themes.forEach(button => button.addEventListener('click', () => {
  const language = document.documentElement.lang || 'en';
  screenshot.src = `/assets/screenshots/${language}-workspace-${button.dataset.theme}.png${screenshot.dataset.release ? `?v=${screenshot.dataset.release}` : ''}`;
  themes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
const languageSelect = document.getElementById('language');
languageSelect.addEventListener('change', () => {
  const supported = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko'];
  if (!supported.includes(languageSelect.value)) return;
  const url = new URL(location.href);
  url.pathname = `/${languageSelect.value}/`;
  url.searchParams.delete('lang');
  location.assign(url.href);
});
