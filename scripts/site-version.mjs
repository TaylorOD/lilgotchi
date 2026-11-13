// Keep the displayed version and installation links tied to the package being built.
export function withSiteVersion(source, version) {
  if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error('Invalid package version');
  return source
    .replace(/releases\/tag\/v\d+\.\d+\.\d+(?:-[\w.-]+)?/g, `releases/tag/v${version}`)
    .replace(/releases\/\d+\.\d+\.\d+(?:-[\w.-]+)?\//g, `releases/${version}/`)
    .replace(/install-snippet\.js\?v=[\w.-]+/g, `install-snippet.js?v=${version}`)
    .replace(/aria-label="Release v[^"]+">v[^<]+/g, `aria-label="Release v${version}">v${version}`);
}
