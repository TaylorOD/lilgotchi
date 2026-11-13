import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { releaseNotes } from '../scripts/release-notes.mjs';

const sample = `# Release notes

## 3.0.7

Seven notes.

## 3.0.6

Six notes.

More six.
`;

test('release notes take only the matching section', () => {
  const notes = releaseNotes(sample, '3.0.6');
  assert.match(notes, /^Six notes\.\n\nMore six\.\n\n/);
  assert.doesNotMatch(notes, /Seven/);
  assert.match(notes, /npm install lilgotchi@3\.0\.6/);
});

test('release notes do not match a longer version', () => {
  assert.throws(() => releaseNotes(sample, '3.0'), /No "## 3\.0" section/);
});

test('the current package version has release notes', () => {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const markdown = readFileSync(new URL('../docs/release-review.md', import.meta.url), 'utf8');
  assert.ok(releaseNotes(markdown, version).length > 0);
});
