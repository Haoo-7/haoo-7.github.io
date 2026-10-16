import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const facts = JSON.parse(await readFile(new URL('facts.json', root), 'utf8'));
const escapeHtml = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
for (const name of ['a-wordmark', 'b-letter', 'c-index']) {
  const template = await readFile(new URL(`templates/${name}.html`, root), 'utf8');
  const html = template.replace(/\[\[([a-z]+)\]\]/g, (_, key) => {
    if (!(key in facts)) throw new Error(`Unknown fact: ${key}`);
    return escapeHtml(facts[key]);
  });
  await writeFile(new URL(`${name}.html`, root), html);
}
