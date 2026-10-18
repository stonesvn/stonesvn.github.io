'use strict';
(() => {
  const repository = 'https://github.com/firzen/StoneSVN';
  const latest = `${repository}/releases/latest`;
  const labels = [...document.querySelectorAll('[data-release-label]')].map(element => ({element, fallback: element.textContent}));
  const endpoint = 'https://api.github.com/repos/firzen/StoneSVN/releases/latest';
  const cacheKey = 'stonesvn-latest-stable-v1';
  const cacheLifetime = 5 * 60 * 1000;
  let pending;
  function releaseURL(value, prefix) {
    try {
      const url = new URL(value);
      return url.origin === 'https://github.com' && url.pathname.startsWith(`/firzen/StoneSVN/releases/${prefix}/`) ? url.href : null;
    } catch { return null; }
  }
  function normalize(value) {
    if (!value || value.draft !== false || value.prerelease !== false || typeof value.tag_name !== 'string' || !value.tag_name.trim()) return null;
    const url = releaseURL(value.html_url, 'tag');
    if (!url || !Array.isArray(value.assets)) return null;
    return {
      tag: value.tag_name,
      url,
      assets: value.assets.filter(asset => asset && asset.state === 'uploaded' && typeof asset.name === 'string')
        .map(asset => ({name: asset.name, url: releaseURL(asset.browser_download_url, 'download')}))
        .filter(asset => asset.url),
    };
  }
  const arm = /(?:^|[_.-])(?:aarch64|arm64)(?:[_.-]|$)/i;
  const x64 = /(?:^|[_.-])(?:x64|x86_64|amd64)(?:[_.-]|$)/i;
  const patterns = {
    'mac-arm': name => /\.dmg$/i.test(name) && arm.test(name),
    'mac-intel': name => /\.dmg$/i.test(name) && x64.test(name),
    'windows-exe': name => /\.exe$/i.test(name) && x64.test(name),
    'windows-msi': name => /\.msi$/i.test(name) && x64.test(name),
    'linux-appimage': name => /\.AppImage$/i.test(name) && x64.test(name),
    'linux-deb': name => /\.deb$/i.test(name) && x64.test(name),
    'linux-rpm': name => /\.rpm$/i.test(name) && x64.test(name),
  };
  function apply(release) {
    document.querySelectorAll('[data-release-label]').forEach(element => {
      element.textContent = element.dataset.releaseTemplate.replace('{version}', release.tag);
    });
    document.querySelectorAll('[data-release-link]').forEach(element => { element.href = release.url; });
    document.querySelectorAll('[data-release-asset]').forEach(element => {
      const match = patterns[element.dataset.releaseAsset];
      const asset = match && release.assets.find(item => match(item.name));
      element.href = asset ? asset.url : release.url;
    });
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (schema) {
      try {
        const data = JSON.parse(schema.textContent);
        data.softwareVersion = release.tag.replace(/^v(?=\d)/i, '');
        data.downloadUrl = release.url;
        schema.textContent = JSON.stringify(data);
      } catch { /* Static structured data remains available. */ }
    }
  }
  function fallback() {
    labels.forEach(({element, fallback}) => { element.textContent = fallback; });
    document.querySelectorAll('[data-release-link], [data-release-asset]').forEach(element => { element.href = latest; });
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (schema) {
      try {
        const data = JSON.parse(schema.textContent);
        delete data.softwareVersion;
        data.downloadUrl = latest;
        schema.textContent = JSON.stringify(data);
      } catch { /* Preserve the remaining structured data. */ }
    }
  }
  async function refresh() {
    if (pending) return pending;
    pending = (async () => {
      try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
        if (cached && Date.now() >= cached.at && Date.now() - cached.at < cacheLifetime) {
          const release = normalize(cached.data);
          if (release) { apply(release); return; }
        }
      } catch { /* Storage can be unavailable. Fetch directly in that case. */ }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(endpoint, {headers: {Accept: 'application/vnd.github+json'}, cache: 'no-cache', credentials: 'omit', signal: controller.signal});
        if (!response.ok) { fallback(); return; }
        const data = await response.json();
        const release = normalize(data);
        if (!release) { fallback(); return; }
        apply(release);
        try { sessionStorage.setItem(cacheKey, JSON.stringify({at: Date.now(), data})); } catch { /* No cache required. */ }
      } catch { fallback(); }
      finally { clearTimeout(timeout); }
    })();
    try { await pending; } finally { pending = null; }
  }
  void refresh();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void refresh();
  });
})();
