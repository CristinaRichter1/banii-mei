// Include public prereleases: GitHub's /latest endpoint excludes them.
(async () => {
  const links = [...document.querySelectorAll('a[href="https://github.com/CristinaRichter1/banii-mei/releases"]')];
  if (!links.length) return;
  try {
    const response = await fetch('https://api.github.com/repos/CristinaRichter1/banii-mei/releases?per_page=100', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return;
    const releases = await response.json();
    if (!Array.isArray(releases)) return;
    const release = releases.filter(r => !r.draft && r.published_at && r.assets?.some(a => /^Banii-mei-v.+-Windows\.zip$/.test(a.name)))
      .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0];
    if (!release) return;
    const url = new URL(release.html_url);
    if (url.origin !== 'https://github.com' || !url.pathname.startsWith('/CristinaRichter1/banii-mei/releases/tag/')) return;
    for (const link of links) link.href = url.href;
  } catch {
    // Offline, disabled JavaScript or rate limits: the Releases page remains usable.
  }
})();
