import { copyFile, mkdir, writeFile } from 'node:fs/promises';

// GitHub Pages is a file server, not an SPA server. Give every public route
// its own entry document so direct visits/reloads work without a 404 redirect.
const output = new URL('../artifacts/tymflo-client-assistant/dist/public/', import.meta.url);
for (const route of ['flow-score', 'privacy', 'terms', 'giveaway-rules']) {
  const directory = new URL(`${route}/`, output);
  await mkdir(directory, { recursive: true });
  await copyFile(new URL('index.html', output), new URL('index.html', directory));
}
await copyFile(new URL('index.html', output), new URL('404.html', output));
await writeFile(new URL('.nojekyll', output), '');
