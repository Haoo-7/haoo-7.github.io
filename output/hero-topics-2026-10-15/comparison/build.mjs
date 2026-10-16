import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const facts = JSON.parse(await readFile(new URL('facts.json', root), 'utf8'));
for (const name of ['a-symbols', 'b-materials', 'c-continuous']) {
  const template = await readFile(new URL(`templates/${name}.html`, root), 'utf8');
  const html = template.replace(/\[\[([a-z]+)\]\]/g, (_, key) => {
    if (!(key in facts)) throw new Error(`Unknown fact: ${key}`);
    return facts[key];
  });
  await writeFile(new URL(`${name}.html`, root), html);
}
