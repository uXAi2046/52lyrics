import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rename, rmdir, unlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { resolve } from 'node:path';

const run = promisify(execFile);
export const cacheDir = resolve('.cache/catalog');
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const allowedHosts = new Set(['tomlehrersongs.com', 'tomlehrersongs.org', 'musicbrainz.org', 'en.wikipedia.org', 'en.wikisource.org', 'commons.wikimedia.org', 'upload.wikimedia.org', 'thumb.wikimedia.org', 'www.wikidata.org', 'query.wikidata.org']);
const lastRequest = new Map();
const hostChains = new Map();
const requestInterval = () => Number(process.env.CATALOG_REQUEST_INTERVAL_MS ?? 1200);

/** Serialize per-host with the configured interval so concurrent callers cannot burst. */
const schedule = (hostname, task) => {
  const previous = hostChains.get(hostname) ?? Promise.resolve();
  const run = previous.then(async () => {
    const remaining = requestInterval() - (Date.now() - (lastRequest.get(hostname) || 0));
    if (remaining > 0) await new Promise((done) => setTimeout(done, remaining));
    lastRequest.set(hostname, Date.now());
    return task();
  });
  hostChains.set(hostname, run.catch(() => {}));
  return run;
};

export async function atomicJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** Best-effort cleanup; sandbox delete policies may refuse temporary-file removal. */
const discard = async (path) => {
  await unlink(path).catch(() => {});
};

/** Sequential, identified requests; successful source bytes are cached for resumable imports. */
export async function download(url, validate = () => {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || !allowedHosts.has(parsed.hostname)) throw new Error(`Unapproved source host: ${parsed.hostname}`);
  await mkdir(cacheDir, { recursive: true });
  const path = resolve(cacheDir, sha256(url));
  let cached;
  try { cached = await readFile(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (cached) {
    try { validate(cached); return cached; }
    catch {
      // Preserve malformed evidence, but never repeatedly reuse it as a valid response.
      const quarantine = resolve(cacheDir, 'invalid-responses');
      await mkdir(quarantine, { recursive: true });
      await writeFile(resolve(quarantine, `${sha256(url)}.${Date.now()}`), cached);
      await discard(path);
    }
  }
  const temporary = await mkdtemp(resolve(cacheDir, 'download-'));
  const output = resolve(temporary, 'response');
  try {
    // A regular output file is truncated on curl retries; stdout can concatenate partial bodies.
    await schedule(parsed.hostname, () => run('curl', ['--fail', '--silent', '--show-error', '--location', '--compressed', '--proto', '=https', '--proto-redir', '=https', '--max-time', '45', '--max-filesize', '20000000', '--retry', '3', '--retry-all-errors', '--retry-delay', '3', '--output', output, '--user-agent', '52lyricsCatalog/1.0 (https://github.com/uXAi2046/52lyrics)', url], { encoding: 'buffer', maxBuffer: 20_000_000, timeout: 210_000 }));
    const bytes = await readFile(output);
    validate(bytes);
    await writeFile(path, bytes);
    await atomicJson(`${path}.json`, { url, retrievedAt: new Date().toISOString(), sha256: sha256(bytes), bytes: bytes.length });
    return bytes;
  } finally {
    await discard(output);
    await rmdir(temporary).catch(() => {});
  }
}

export async function sourceJson(url) {
  return JSON.parse((await download(url, (bytes) => JSON.parse(bytes.toString('utf8')))).toString('utf8'));
}
