// Print the GitHub release notes for one version from docs/release-review.md.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function releaseNotes(markdown, version) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) throw new Error(`No "## ${version}" section in the release notes`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^##\s/.test(line));
  const body = (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
  if (!body) throw new Error(`The ${version} release notes are empty`);
  return `${body}\n\nDownload the zip for a complete copy to host yourself, or install from npm with \`npm install lilgotchi@${version}\`.\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = process.argv[2];
  if (!version) throw new Error('Usage: node scripts/release-notes.mjs <version>');
  const notes = readFileSync(new URL('../docs/release-review.md', import.meta.url), 'utf8');
  process.stdout.write(releaseNotes(notes, version));
}
