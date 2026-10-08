import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const transport = vi.hoisted(() => ({ body: '{"valid":true}', calls: 0 }));
vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  const execFile = (_command: string, args: string[], _options: unknown, callback: (error: Error | null, stdout?: string) => void) => {
    transport.calls++;
    const destination = args[args.indexOf('--output') + 1];
    writeFile(destination, transport.body).then(() => callback(null, 'partial response from stdout must not enter the cache')).catch(callback);
  };
  return { ...actual, execFile, default: { ...actual, execFile } };
});
import { cacheDir, sha256, sourceJson } from '../../scripts/catalog/http.mjs';

const fixtures: string[] = [];
const url = () => {
  const value = `https://www.wikidata.org/cache-test-${randomUUID()}?fmt=json`;
  fixtures.push(sha256(value));
  return value;
};
beforeEach(async () => { await mkdir(cacheDir, { recursive: true }); });
afterEach(async () => {
  for (const hash of fixtures.splice(0)) {
    for (const suffix of ['', '.json']) await unlink(resolve(cacheDir, `${hash}${suffix}`)).catch(() => {});
    const quarantine = resolve(cacheDir, 'invalid-responses');
    for (const name of await readdir(quarantine).catch(() => [])) {
      if (name.startsWith(`${hash}.`)) await unlink(resolve(quarantine, name));
    }
  }
  transport.body = '{"valid":true}'; transport.calls = 0;
});

describe('resumable catalog downloads', () => {
  it('uses the final output file, never concatenated retry stdout, and reuses verified JSON', async () => {
    const source = url();
    expect(await sourceJson(source)).toEqual({ valid: true });
    expect(await sourceJson(source)).toEqual({ valid: true });
    expect(transport.calls).toBe(1);
    const receipt = JSON.parse(await readFile(resolve(cacheDir, `${sha256(source)}.json`), 'utf8'));
    expect(receipt.sha256).toBe(sha256('{"valid":true}'));
  });
  it('quarantines malformed cached evidence and downloads a fresh validated response', async () => {
    const source = url();
    const path = resolve(cacheDir, sha256(source));
    await writeFile(path, '{"partial":{"restart":true}');
    expect(await sourceJson(source)).toEqual({ valid: true });
    const quarantine = resolve(cacheDir, 'invalid-responses');
    const entry = (await readdir(quarantine)).find((name) => name.startsWith(`${sha256(source)}.`))!;
    expect(await readFile(resolve(quarantine, entry), 'utf8')).toBe('{"partial":{"restart":true}');
    expect(transport.calls).toBe(1);
  });
  it('does not cache a malformed fresh JSON response', async () => {
    const source = url(); transport.body = '{"partial":';
    await expect(sourceJson(source)).rejects.toThrow(SyntaxError);
    await expect(readFile(resolve(cacheDir, sha256(source)))).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
