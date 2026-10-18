# StoneSVN website instructions

- This is `stonesvn/stonesvn.github.io`, deployed at https://stonesvn.github.io/. The app and release source live in `firzen/StoneSVN`.
- Verify the Git root/remote before committing. An app checkout may contain a separate ignored `website/` preview copy; that copy is not this repository.
- Read [README.md](README.md) for source files, language routing, static generation, and deployment. Edit `source/template.html`, `source/translations.json`, and relevant source modules, then regenerate with `node build.mjs`; preserve the generated English guides and sitemap entries.

## Release updates

- Release summaries are authored in the app repository at `docs/releases/vX.Y.Z.website.json`; all five languages are required. Do not maintain a second hand-written release summary or version constant here.
- `.github/workflows/sync-release.yml` checks the app's Latest stable release every five minutes. Schedules can be delayed. It captures the exact published app tag, commits generated notes/screenshots, and explicitly deploys Pages. Bot commits do not need to trigger a second workflow.
- Keep capture scripts and Playwright dependencies pinned to the published tag, and preserve the immutable legacy compatibility fallback. Never capture an unreleased app checkout or real personal working copies for a published version.
- Preserve 15 localized 1440×900 screenshots: Workspace light, Workspace dark, and Properties for `en`, `zh-CN`, `zh-TW`, `ja`, and `ko`. Keep source-SHA cache identifiers for images and theme switching.
- Preserve the deployment-retry branch even when `source/release.json` already records the new tag. A committed manifest does not prove Pages deployment succeeded. Keep the documented idle-maintenance behavior for scheduled synchronization.
- Use the website's own `GITHUB_TOKEN`; deploy keys are disabled. Do not add personal tokens, cross-repository write credentials, or force pushes.

## Verification and retry

```sh
node --test source/releases.test.cjs
node build.mjs
gh workflow run sync-release.yml --repo stonesvn/stonesvn.github.io --ref main
```

- A manual sync rebuilds captures for the current Latest stable release; it does not republish the app. Use it after an app release when immediate synchronization is needed, or to retry a website failure.
- Inspect both build and deploy jobs, not just the generated commit. Before reporting release synchronization complete, verify `source/release.json` tag/source SHA against the app's published tag, five localized static release-note sections, screenshot language/theme, and actual installer links.
- Keep English root fallback, browser language detection, locale URLs, canonical/hreflang, static SoftwareApplication version data, and sitemap behavior. Preserve stale-cache and API-failure regressions in `source/releases.test.cjs`.
- Stage only public files for Pages. Never include `.git`, app/tool checkouts, `node_modules`, credentials, or capture logs in deployment artifacts.
- When concurrent changes block a push, fetch and integrate them, rerun affected checks, and push normally. Preserve other contributors' source changes and generated guides.
