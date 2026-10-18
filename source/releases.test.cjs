const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const code = fs.readFileSync(path.join(__dirname, '../releases.js'), 'utf8')
const repository = 'https://github.com/firzen/StoneSVN'
function release(version) {
  const name = `StoneSVN_${version}_aarch64.dmg`
  return { tag_name: `v${version}`, draft: false, prerelease: false, html_url: `${repository}/releases/tag/v${version}`, assets: [{ name, state: 'uploaded', browser_download_url: `${repository}/releases/download/v${version}/${name}` }] }
}
async function load({ cached, response = release('1.1.2'), ok = true } = {}) {
  const label = { textContent: 'v1.1.2 is here', dataset: { releaseTemplate: '{version} is here' } }
  const link = { href: `${repository}/releases/tag/v1.1.2` }
  const asset = { href: `${repository}/releases/latest`, dataset: { releaseAsset: 'mac-arm' } }
  const schema = { textContent: JSON.stringify({ '@type': 'SoftwareApplication', softwareVersion: '1.1.2' }) }
  let requests = 0
  let cache = cached ? JSON.stringify({ at: Date.now(), data: cached }) : null
  vm.runInNewContext(code, {
    URL, Date, BigInt, AbortController, setTimeout, clearTimeout,
    document: {
      querySelector: () => schema,
      querySelectorAll: selector => ({ '[data-release-label]': [label], '[data-release-link]': [link], '[data-release-asset]': [asset], '[data-release-link], [data-release-asset]': [link, asset] })[selector],
      addEventListener() {},
    },
    sessionStorage: { getItem: () => cache, setItem: (_, value) => { cache = value } },
    fetch: async () => { requests++; return { ok, json: async () => response } },
  })
  await new Promise(resolve => setImmediate(resolve))
  return { label, link, asset, schema: JSON.parse(schema.textContent), requests }
}
test('an older session cache cannot downgrade a freshly deployed page', async () => {
  const page = await load({ cached: release('1.1.1') })
  assert.equal(page.requests, 1)
  assert.equal(page.label.textContent, 'v1.1.2 is here')
  assert.ok(page.asset.href.includes('/download/v1.1.2/'))
})
test('API failure retains the statically published version for search engines', async () => {
  const page = await load({ ok: false })
  assert.equal(page.schema.softwareVersion, '1.1.2')
  assert.equal(page.label.textContent, 'v1.1.2 is here')
  assert.equal(page.asset.href, `${repository}/releases/latest`)
})
test('a current session cache avoids another API request', async () => {
  const page = await load({ cached: release('1.1.2') })
  assert.equal(page.requests, 0)
  assert.ok(page.asset.href.includes('/download/v1.1.2/'))
})
test('a stale API response or prerelease cannot replace the static stable version', async () => {
  for (const response of [release('1.1.1'), { ...release('1.2.0'), prerelease: true }]) {
    const page = await load({ response })
    assert.equal(page.schema.softwareVersion, '1.1.2')
    assert.equal(page.label.textContent, 'v1.1.2 is here')
  }
})
