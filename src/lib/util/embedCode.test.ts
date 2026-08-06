import { describe, expect, it } from 'vitest';
import { buildEmbedCode } from './embedCode';
import { deserializeState } from './serde';

const code = 'graph TD\n  A-->B';
const host = 'https://mermaid.live';

describe('buildEmbedCode', () => {
  it('should build a canonical embed URL with the state in the hash', () => {
    const { url } = buildEmbedCode({ code, host, theme: 'forest' });
    expect(url).toMatch(/^https:\/\/mermaid\.live\/embed\?theme=forest#pako:/);
    const state = deserializeState(url.split('#')[1]);
    expect(state.code).toBe(code);
    expect(JSON.parse(state.mermaid)).toEqual({ theme: 'forest' });
  });

  it('should keep the caller-provided config in the hash state', () => {
    const { url } = buildEmbedCode({
      code,
      config: { themeVariables: { fontSize: '14px' } },
      host,
      theme: 'dark'
    });
    const state = deserializeState(url.split('#')[1]);
    expect(JSON.parse(state.mermaid)).toEqual({
      theme: 'dark',
      themeVariables: { fontSize: '14px' }
    });
  });

  it('should omit query params for default settings', () => {
    const { url } = buildEmbedCode({ code, host });
    expect(url).toMatch(/^https:\/\/mermaid\.live\/embed#pako:/);
  });

  it('should encode disabled controls and grid as =0 params', () => {
    const { url } = buildEmbedCode({ code, controls: false, grid: false, host });
    expect(url).toContain('controls=0');
    expect(url).toContain('grid=0');
    const state = deserializeState(url.split('#')[1]);
    expect(state.grid).toBe(false);
  });

  it('should include mode when set', () => {
    const { url } = buildEmbedCode({ code, host, mode: 'dark' });
    expect(url).toContain('mode=dark');
  });

  it('should build an iframe snippet with sensible defaults', () => {
    const { iframe, url } = buildEmbedCode({ code, host });
    expect(iframe).toBe(
      `<iframe src="${url}" width="100%" height="480" ` +
        `style="border:0" loading="lazy" title="Mermaid diagram"></iframe>`
    );
  });

  it('should respect custom width and height', () => {
    const { iframe, webComponent } = buildEmbedCode({ code, height: '300', host, width: '600' });
    expect(iframe).toContain('width="600" height="300"');
    expect(webComponent).toContain('width="600" height="300"');
  });

  it('should build a web component snippet with the code inline', () => {
    const { webComponent } = buildEmbedCode({ code, host });
    expect(webComponent).toContain(`<script src="${host}/embed.js" async>`);
    expect(webComponent).toContain(`<mermaid-embed src="${host}/embed" height="480">`);
    expect(webComponent).toContain(code);
  });

  it('should HTML-escape the inline web component body', () => {
    const { webComponent } = buildEmbedCode({ code: 'graph TD\n  A["a < b & c"]-->B', host });
    expect(webComponent).toContain('A["a &lt; b &amp; c"]');
    expect(webComponent).not.toContain('a < b');
  });

  it('should strip trailing slashes from the host', () => {
    const { url } = buildEmbedCode({ code, host: 'https://mermaid.live/' });
    expect(url).toMatch(/^https:\/\/mermaid\.live\/embed#/);
  });
});
