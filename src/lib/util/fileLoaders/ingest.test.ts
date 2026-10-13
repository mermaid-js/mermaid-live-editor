import { defaultState } from '$/constants';
import type { State } from '$/types';
import { describe, expect, it, vi } from 'vitest';
import { serializeState } from '../serde';
import { ingestHash, ingestHistoryFile, ingestLocation, type IngestAdapters } from './ingest';

const unsafeConfig = { securityLevel: 'loose', someOtherSetting: 'kept' };
const flowchart = 'flowchart TD\n A --> B';

const hashOf = (state: Partial<State>) => serializeState({ ...defaultState, ...state });

const adapters = (
  files: Record<string, string> = {},
  confirm: (message: string) => boolean = () => true
) => {
  const fake = {
    confirm: vi.fn(confirm),
    fetchText: vi.fn((url: string) => {
      if (!(url in files)) {
        return Promise.reject(new Error(`404 ${url}`));
      }
      return Promise.resolve(files[url]);
    })
  } satisfies IngestAdapters;
  return fake;
};

const gistApi = (id: string, revision?: string) =>
  `https://api.github.com/gists/${id}${revision ? `/${revision}` : ''}`;

const gistResponse = (versions: { version: string; code: string; config?: string }[]) => {
  const history = versions.map(({ version }, index) => ({
    committed_at: new Date(Date.UTC(2026, 0, versions.length - index)).toISOString(),
    url: gistApi('abc', version),
    user: { login: 'someone' },
    version
  }));
  const files: Record<string, string> = {};
  versions.forEach(({ code, config, version }, index) => {
    files[gistApi('abc', version)] = JSON.stringify({
      files: {
        'code.mmd': { content: code, raw_url: '', truncated: false },
        ...(config && {
          'config.json': { content: config, raw_url: '', truncated: false }
        })
      },
      history: history.slice(index),
      html_url: 'https://gist.github.com/abc'
    });
  });
  files[gistApi('abc')] = files[gistApi('abc', versions[0].version)];
  return files;
};

describe('ingestHash', () => {
  it('returns nothing for an empty hash, so the stored state is kept', () => {
    const fake = adapters();
    expect(ingestHash('', fake)).toBeUndefined();
    expect(fake.confirm).not.toHaveBeenCalled();
  });

  it('decodes a serialized state', () => {
    expect(ingestHash(hashOf({ code: flowchart }), adapters())?.code).toBe(flowchart);
  });

  it('strips unsafe config when the user confirms', () => {
    const fake = adapters();
    const state = ingestHash(hashOf({ mermaid: JSON.stringify(unsafeConfig) }), fake);
    expect(fake.confirm).toHaveBeenCalledOnce();
    expect(JSON.parse(state?.mermaid ?? '')).toEqual({ someOtherSetting: 'kept' });
  });

  it('keeps unsafe config when the user trusts the source', () => {
    const state = ingestHash(
      hashOf({ mermaid: JSON.stringify(unsafeConfig) }),
      adapters({}, () => false)
    );
    expect(JSON.parse(state?.mermaid ?? '')).toEqual(unsafeConfig);
  });

  it('shows the troubleshooting diagram when the hash cannot be decoded', () => {
    const state = ingestHash('pako:not-valid', adapters());
    expect(state?.code).toContain('Loading URL failed');
    expect(state?.mermaid).toBe(defaultState.mermaid);
  });
});

describe('ingestLocation', () => {
  it('uses the hash when there are no query sources', async () => {
    const result = await ingestLocation(
      { hash: `#${hashOf({ code: flowchart })}`, search: '' },
      adapters()
    );
    expect(result.state?.code).toBe(flowchart);
    expect(result.revisions).toEqual([]);
  });

  it('loads code and config files, preferring them over the hash', async () => {
    const fake = adapters({
      'https://x.test/code.mmd': 'pie\n "a": 1',
      'https://x.test/config.json': JSON.stringify(unsafeConfig)
    });
    const result = await ingestLocation(
      {
        hash: `#${hashOf({ code: flowchart })}`,
        search: '?code=https://x.test/code.mmd&config=https://x.test/config.json'
      },
      fake
    );
    expect(result.state?.code).toBe('pie\n "a": 1');
    expect(result.state?.loader).toEqual({
      config: { codeURL: 'https://x.test/code.mmd', configURL: 'https://x.test/config.json' },
      type: 'files'
    });
    expect(JSON.parse(result.state?.mermaid ?? '')).toEqual({ someOtherSetting: 'kept' });
    // Only the source that wins is sanitized, so the user is asked once.
    expect(fake.confirm).toHaveBeenCalledOnce();
  });

  it('falls back to the hash when the code file cannot be fetched', async () => {
    const result = await ingestLocation(
      { hash: `#${hashOf({ code: flowchart })}`, search: '?code=https://x.test/missing.mmd' },
      adapters()
    );
    expect(result.state?.code).toBe(flowchart);
  });

  it('does not mutate the shared default state', async () => {
    const before = structuredClone(defaultState);
    await ingestLocation(
      { hash: '', search: '?code=https://x.test/empty.mmd' },
      adapters({ 'https://x.test/empty.mmd': '' })
    );
    expect(defaultState).toEqual(before);
  });

  it('loads the latest gist revision and returns every revision', async () => {
    const result = await ingestLocation(
      { hash: '', search: '?gist=https://gist.github.com/someone/abc' },
      adapters(
        gistResponse([
          { code: 'graph TD\n new', config: '{"theme":"forest"}', version: 'bbbbbbbbbbbb' },
          { code: 'graph TD\n old', version: 'aaaaaaaaaaaa' }
        ])
      )
    );
    expect(result.state?.code).toBe('graph TD\n new');
    expect(result.state?.loader).toEqual({
      config: { url: 'https://gist.github.com/someone/abc' },
      type: 'gist'
    });
    expect(result.revisions.map((revision) => revision.name)).toEqual([
      'someone vbbbbbbb',
      'someone vaaaaaaa'
    ]);
  });

  it('silently strips unsafe config from gist revisions', async () => {
    const fake = adapters(
      gistResponse([
        { code: 'graph TD\n new', version: 'bbbbbbbbbbbb' },
        { code: 'graph TD\n old', config: JSON.stringify(unsafeConfig), version: 'aaaaaaaaaaaa' }
      ])
    );
    const result = await ingestLocation(
      { hash: '', search: '?gist=https://gist.github.com/someone/abc' },
      fake
    );
    expect(JSON.parse(result.revisions[1].state.mermaid)).toEqual({ someOtherSetting: 'kept' });
    expect(fake.confirm).not.toHaveBeenCalled();
  });

  it('falls back to the hash when the gist cannot be loaded', async () => {
    const result = await ingestLocation(
      {
        hash: `#${hashOf({ code: flowchart })}`,
        search: '?gist=https://gist.github.com/someone/missing'
      },
      adapters()
    );
    expect(result.state?.code).toBe(flowchart);
    expect(result.revisions).toEqual([]);
  });
});

describe('ingestHistoryFile', () => {
  const entry = (mermaid: string) => ({
    id: crypto.randomUUID(),
    state: { ...defaultState, mermaid },
    time: 1,
    type: 'manual'
  });

  it('parses entries without prompting when every config is safe', () => {
    const fake = adapters();
    const entries = ingestHistoryFile(JSON.stringify([entry('{}')]), fake);
    expect(entries).toHaveLength(1);
    expect(fake.confirm).not.toHaveBeenCalled();
  });

  it('asks once and strips unsafe config from every entry', () => {
    const fake = adapters();
    const unsafe = JSON.stringify(unsafeConfig);
    const entries = ingestHistoryFile(JSON.stringify([entry(unsafe), entry(unsafe)]), fake);
    expect(fake.confirm).toHaveBeenCalledOnce();
    for (const { state } of entries) {
      expect(JSON.parse(state.mermaid)).toEqual({ someOtherSetting: 'kept' });
    }
  });

  it('keeps unsafe config when the user trusts the file', () => {
    const unsafe = JSON.stringify(unsafeConfig);
    const [{ state }] = ingestHistoryFile(
      JSON.stringify([entry(unsafe)]),
      adapters({}, () => false)
    );
    expect(JSON.parse(state.mermaid)).toEqual(unsafeConfig);
  });

  it('rejects files that are not a list of entries', () => {
    expect(() => ingestHistoryFile('{"not":"a list"}', adapters())).toThrow();
    expect(() => ingestHistoryFile('not json', adapters())).toThrow();
  });
});
