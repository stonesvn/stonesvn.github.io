'use strict';
const screenshot = document.getElementById('workspace');
const themes = document.querySelectorAll('[data-theme]');
themes.forEach(button => button.addEventListener('click', () => {
  const theme = button.dataset.theme;
  screenshot.src = `assets/workspace-${theme}.png`;
  themes.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
