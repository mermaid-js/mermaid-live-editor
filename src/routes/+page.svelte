<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { render as renderMermaid } from '$lib/util/mermaid';
  import panzoom from 'svg-pan-zoom';
  import { onDestroy, onMount } from 'svelte';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  const DEFAULT_DIAGRAM = `flowchart TD
  %% Multi-layer overview of the renderer pipeline
  subgraph Loader[URL Driven Loader]
    Params[Decode URL params] --> Decode[Decode content + theme]
  end
  subgraph Renderer[Mermaid Engine]
    Decode --> Render[Render Mermaid SVG]
    Render --> Bind[Attach pan/zoom controls]
  end
  subgraph Viewer[Viewport Canvas]
    Bind --> Fit[Auto fit + center]
    Fit --> Interact[Touch & Wheel interactions]
    Interact -->|Theme updates| Style[Apply theme variables]
  end
  Params -.->|Fallback| Example[(Built-in example diagram)]
  Style --> Output[[Full-viewport SVG]]
  classDef highlight fill:#1f6feb,color:#ffffff,stroke-width:0;
  class Render,Bind,Fit,Interact,Style highlight;
`;

  const DEFAULT_FONT = '"Recursive Variable", "Recursive", sans-serif';

  let surface: HTMLDivElement | undefined;
  let error: string | null = null;
  let backgroundColor = '#ffffff';
  let fontFamily = DEFAULT_FONT;
  let panZoomInstance: ReturnType<typeof panzoom> | undefined;
  let renderToken = 0;

  const decoder = browser ? new TextDecoder() : undefined;

  const getParam = (params: URLSearchParams, keys: string[], fallback: string) => {
    for (const key of keys) {
      const value = params.get(key);
      if (value) {
        return value;
      }
    }
    return fallback;
  };

  const decodeBase64 = (value: string) => {
    if (!browser) return value;

    try {
      const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return decoder ? decoder.decode(bytes) : binary;
    } catch (err: unknown) {
      console.warn('Unable to decode base64 mermaid code', err);
      return value;
    }
  };

  // Decode \uXXXX to actual Unicode and common JSON-style escapes
  const decodeUnicodeEscapes = (value: string) =>
    value.replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));

  const decodeMermaidCode = (params: URLSearchParams) => {
    if (!browser) {
      return DEFAULT_DIAGRAM;
    }

    const explicitBase64 = params.get('codeBase64') ?? params.get('code_b64');
    const encoding = (params.get('encoding') ?? '').toLowerCase();

    let raw = params.get('code') ?? params.get('diagram') ?? params.get('data') ?? '';

    if (explicitBase64) {
      raw = decodeBase64(explicitBase64);
    } else if (raw && encoding === 'base64') {
      raw = decodeBase64(raw);
    } else if (raw) {
      try {
        raw = decodeURIComponent(raw);
      } catch (err: unknown) {
        console.warn('Unable to URI decode mermaid code', err);
      }
    }

    if (!raw) {
      return DEFAULT_DIAGRAM;
    }

    const normalized = decodeUnicodeEscapes(raw)
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\//g, '/')
      .replace(/\\\\/g, '\\');
    return normalized.trim() ? normalized : DEFAULT_DIAGRAM;
  };

  // Robustly strip ```mermaid fences, supporting same-line content
  const stripFence = (text: string): string => {
    const m = text.match(/```(?:mermaid)?[ \t]*(?:\r?\n|\s+)([\s\S]*?)```/i);
    if (m) return m[1].trim();
    return text;
  };

  // ==== Preprocessing parity with server /preprocess ====
  const INIT_PREAMBLE =
    "%%{init: { 'themeVariables': { 'textColor': '#1E1E1E', 'primaryTextColor': '#1E1E1E', 'fontFamily': 'Inter, Arial, sans-serif', 'fontSize': '14px' } }}%%";

  const detectType = (text: string): 'flowchart' | 'sequence' | 'state' | 'er' | 'mindmap' | '' => {
    const lines = (text || '').split(/\r?\n/);
    for (const raw of lines) {
      const s = raw.trim();
      if (!s || s.startsWith('%%')) continue;
      const low = s.toLowerCase();
      if (low.startsWith('flowchart') || low.startsWith('graph')) return 'flowchart';
      if (low.startsWith('sequencediagram')) return 'sequence';
      if (low.startsWith('statediagram')) return 'state';
      if (low.startsWith('erdiagram')) return 'er';
      if (low.startsWith('mindmap')) return 'mindmap';
      break;
    }
    return '';
  };

  const wrapLabel = (text: string, maxLen = 28, maxLines = 3): string => {
    if (!text) return '';
    const parts = text.split(/<br\s*\/?>/i);
    const out: string[] = [];
    for (const partRaw of parts) {
      const words = partRaw.trim().split(/\s+/).filter(Boolean);
      let cur = '';
      for (const w of words) {
        if (!cur) cur = w;
        else if (cur.length + 1 + w.length <= maxLen) cur += ' ' + w;
        else {
          out.push(cur);
          cur = w;
        }
        if (out.length >= maxLines) break;
      }
      if (out.length < maxLines && cur) out.push(cur);
      if (out.length >= maxLines) break;
    }
    if (out.length > maxLines) out.length = maxLines;
    if (parts.length > 1 && out.length === maxLines) {
      const last = out[out.length - 1];
      if (!last.endsWith('…'))
        out[out.length - 1] =
          (last.length > maxLen ? last.slice(0, Math.max(0, maxLen - 1)) : last) + '…';
    }
    return out.join('<br/>');
  };

  const roundFlowNodes = (text: string): string => {
    const pat =
      /(?:(?<id>\b[A-Za-z_][\w]*)\s*)?\[\s*(?<label>"[^"]*"|[^[\]]*?)\s*\](?<cls>\s*:::[A-Za-z0-9_-]+)?/g;
    const lines = (text || '').split(/\r?\n/);
    const out: string[] = [];
    for (const ln of lines) {
      const ls = ln.trimStart();
      if (
        ls.startsWith('classDef') ||
        ls.startsWith('linkStyle') ||
        ls.startsWith('subgraph') ||
        ls === 'end' ||
        ls.startsWith('style ') ||
        ls.startsWith('class ') ||
        ls.startsWith('%%')
      ) {
        out.push(ln);
        continue;
      }
      out.push(
        ln.replace(pat, (_m, ...args) => {
          const groups =
            (args.at(-1) as { cls?: string; id?: string; label?: string } | undefined) ?? {};
          const id = groups.id ?? '';
          let label = (groups.label ?? '').trim();
          const cls = groups.cls ?? '';
          if (!(label.startsWith('"') && label.endsWith('"'))) label = '"' + label + '"';
          return `${id}(${label})${cls}`;
        })
      );
    }
    return out.join('\n');
  };

  const ensureStyling = (text: string): string => {
    let t = (text || '').replace(/\r\n?/g, '\n');
    if (typeof String.prototype.normalize === 'function') {
      t = t.normalize('NFKC');
    }
    if (!t.includes('%%{init:')) t = INIT_PREAMBLE + '\n' + t;
    const ty = detectType(t);
    if (ty === 'flowchart') {
      t = roundFlowNodes(t);
      const needsSurf = !t.includes('classDef surf ');
      const needsSurf2 = !t.includes('classDef surf2 ');
      const lines: string[] = [];
      if (needsSurf)
        lines.push('classDef surf fill:#F0EFEA,stroke:#7CA5A7,stroke-width:1px,color:#1E1E1E;');
      if (needsSurf2)
        lines.push('classDef surf2 fill:#FFFFFF,stroke:#b5b4b1,stroke-width:1px,color:#1E1E1E;');
      if (t && lines.length) t += (t.endsWith('\n') ? '' : '\n') + lines.join('\n') + '\n';
      if (!/\blinkStyle\s+\d+/.test(t)) {
        const edgeCount = (t.match(/-->/g) || []).length;
        if (edgeCount > 0) {
          const palette = ['#7CA5A7', '#E4C890', '#BDD2D3', '#F8BDBD', '#EC9E9E', '#b5b4b1'];
          const ls = Array.from(
            { length: edgeCount },
            (_v, i) => `linkStyle ${i} stroke:${palette[i % palette.length]},stroke-width:1.5px;`
          ).join('\n');
          t += ls + '\n';
        }
      }
      t = t
        .replace(/;[ \t]*linkStyle\b/g, ';\nlinkStyle ')
        .replace(/;[ \t]*classDef\b/g, ';\nclassDef ')
        .replace(/([^\n])\s+(classDef\b)/g, '$1\n$2')
        .replace(/([^\n])\s+(linkStyle\b)/g, '$1\n$2');
    }
    return t;
  };

  const convertMindmapToFlowchart = (code: string): string => {
    const lines = (code || '').replace(/\t/g, '  ').split(/\r?\n/);
    interface Node {
      class: string | null;
      id: string;
      indent: number;
      label: string;
    }
    const nodes: Node[] = [];
    const edges: [string, string][] = [];
    const classdefLines: string[] = [];
    const linkstyleLines: string[] = [];
    const directives: string[] = [];
    const usedIds = new SvelteSet<string>();
    const ensureId = (base: string) => {
      base = (base || 'node').replace(/[^A-Za-z0-9_]+/g, '_');
      if (!/^[A-Za-z_]/.test(base)) base = 'n_' + base;
      let cand = base;
      let i = 2;
      while (usedIds.has(cand)) {
        cand = base + '_' + i++;
      }
      usedIds.add(cand);
      return cand;
    };
    const tokenRegex =
      /(?:(?<id>[A-Za-z_][\w]*)\s*)?(?<br>(\(\(\s*".*?"\s*\)\)|\(\s*".*?"\s*\)|\(\(\s*[^"]*?\s*\)\)|\(\s*[^"]*?\s*\)|\[\s*".*?"\s*\]|\[\s*[^"]*?\s*\]))(?<cls>\s*:::[A-Za-z0-9_-]+)?/g;
    const tokenizeLine = (text: string) => {
      const out: { class: string | null; id: string | null; label: string }[] = [];
      text.replace(tokenRegex, (_m, ...args) => {
        const g = (args.at(-1) as { br?: string; cls?: string; id?: string } | undefined) ?? {};
        let inner = g.br ?? '';
        if (inner.startsWith('((')) inner = inner.slice(2, -2).trim();
        else if (inner.startsWith('(')) inner = inner.slice(1, -1).trim();
        else inner = inner.slice(1, -1).trim();
        const label = inner.startsWith('"') && inner.endsWith('"') ? inner.slice(1, -1) : inner;
        const cls = (g.cls ?? '').trim().replace(/^:::/, '') || null;
        out.push({ class: cls, id: g.id ?? null, label });
        return _m;
      });
      return out;
    };
    const stack: { id: string; indent: number }[] = [];
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim()) continue;
      const sline = line.trim();
      if (sline.startsWith('%%')) {
        directives.push(sline);
        continue;
      }
      if (/^mindmap\b/i.test(sline)) continue;
      if (/^\s*classDef\b/.test(line)) {
        classdefLines.push(sline);
        continue;
      }
      if (/^\s*linkStyle\b/.test(line)) {
        linkstyleLines.push(sline);
        continue;
      }
      const indent = line.length - line.replace(/^\s+/, '').length;
      const toks = tokenizeLine(sline);
      if (toks.length === 0) continue;
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      const parentId = stack.length ? stack[stack.length - 1].id : null;
      let lastId: string | null = null;
      for (const tk of toks) {
        const nodeId = ensureId(tk.id || tk.label);
        nodes.push({ id: nodeId, label: tk.label, class: tk.class, indent });
        if (parentId) edges.push([parentId, nodeId]);
        lastId = nodeId;
      }
      if (lastId) stack.push({ indent, id: lastId });
    }
    const parents = new SvelteMap<string, string>();
    for (const [a, b] of edges) parents.set(b, a);
    let root: string | null = null;
    let minIndent = Infinity;
    for (const n of nodes) {
      if (!parents.has(n.id) && n.indent < minIndent) {
        root = n.id;
        minIndent = n.indent;
      }
    }
    const idNode = new SvelteMap<string, Node>(nodes.map((n) => [n.id, n] as const));
    const children = new SvelteMap<string, string[]>();
    for (const [a, b] of edges) {
      if (!children.has(a)) {
        children.set(a, []);
      }
      const list = children.get(a);
      if (list) {
        list.push(b);
      }
    }
    const out: string[] = [];
    out.push(...directives);
    out.push('flowchart TD');
    const esc = (s: string) => (s || '').replace(/"/g, '\\"');
    const ensureLabel = (s: string) => {
      const v = (s || '').trim();
      return v ? v : '\u00A0';
    };
    if (!root && nodes.length) root = nodes[0].id;
    const resolvedRoot = root ?? null;
    if (resolvedRoot) {
      const rootNode = idNode.get(resolvedRoot);
      if (rootNode) {
        const rlbl = ensureLabel(wrapLabel(rootNode.label));
        let rseg = `${resolvedRoot}("${esc(rlbl)}")`;
        rseg += rootNode.class ? `:::${rootNode.class}` : ':::surf';
        out.push(`  ${rseg}`);
      }
      const mids = children.get(resolvedRoot) ?? [];
      for (const mid of mids) {
        const midNode = idNode.get(mid);
        if (!midNode) {
          continue;
        }
        const mlbl = ensureLabel(wrapLabel(midNode.label));
        let mseg = `${mid}("${esc(mlbl)}")`;
        mseg += midNode.class ? `:::${midNode.class}` : ':::surf';
        out.push(`  ${mseg}`);
        out.push(`  ${resolvedRoot} --> ${mid}`);
        const leaves = children.get(mid) ?? [];
        for (const lf of leaves) {
          const leafNode = idNode.get(lf);
          if (!leafNode) {
            continue;
          }
          const llbl = ensureLabel(wrapLabel(leafNode.label));
          let lseg = `${lf}("${esc(llbl)}")`;
          lseg += leafNode.class ? `:::${leafNode.class}` : ':::surf';
          out.push(`  ${lseg}`);
          out.push(`  ${mid} --> ${lf}`);
        }
      }
    }
    out.push(...classdefLines.map((l) => '  ' + l));
    out.push(...linkstyleLines.map((l) => '  ' + l));
    return out.join('\n');
  };

  const preprocessMermaid = (
    code: string,
    mindmapMode: 'convert' | 'sanitize' | 'keep' = 'convert'
  ): string => {
    const inner = stripFence(code);
    const dtype = detectType(inner);
    let text = inner;
    if (dtype === 'mindmap') {
      if (mindmapMode === 'convert') text = convertMindmapToFlowchart(inner);
      else if (mindmapMode === 'sanitize') {
        const lines = (inner || '')
          .split(/\r?\n/)
          .filter((ln) => !/^\s*(classDef|linkStyle)\b/.test(ln));
        text = lines.join('\n').replace(/\[(.*?)]/g, '($1)');
      }
    }
    return ensureStyling(text);
  };

  const buildMermaidConfig = (params: URLSearchParams) => {
    const theme = params.get('theme') ?? 'default';
    const background = getParam(params, ['background', 'bg'], '#ffffff');
    const primary = getParam(params, ['primaryColor', 'primary'], '#1f6feb');
    const secondary = getParam(params, ['secondaryColor', 'secondary'], '#d0d7de');
    const text = getParam(params, ['textColor', 'text'], '#0b0d0e');
    const line = getParam(params, ['lineColor', 'line'], primary);
    const accent = getParam(params, ['accentColor', 'accent'], secondary);
    const font = params.get('fontFamily') ?? params.get('font') ?? DEFAULT_FONT;

    return {
      config: {
        flowchart: {
          htmlLabels: true,
          useMaxWidth: false
        },
        securityLevel: 'loose',
        startOnLoad: false,
        theme,
        // Ensure label measurement uses HTML so boxes size to content
        themeCSS: `
          /* HTML label container inside foreignObject */
          foreignObject > .label, foreignObject > div.label {
            display: flex;
            align-items: center;      /* vertical centering */
            justify-content: center;  /* horizontal centering */
            height: 100%;
            width: 100%;
            text-align: center;
            padding: 18px 14px;       /* top/bottom padding included in measurement */
            box-sizing: border-box;
            overflow: visible;
            white-space: normal;
            word-break: break-word;
            overflow-wrap: anywhere;
            line-height: 1.25;
          }
          /* Actual label element */
          foreignObject .nodeLabel, foreignObject .label .nodeLabel {
            display: inline-block;
            max-width: 100%;
            box-sizing: border-box;
            padding-bottom: 10px;    /* breathing room below text */
          }
          /* SVG text edge labels readability */
          .edgeLabel text { paint-order: stroke; stroke: #ffffff; stroke-width: 2px; }
        `,
        themeVariables: {
          background,
          fontFamily: font,
          lineColor: line,
          noteBkgColor: background,
          noteTextColor: text,
          primaryBorderColor: line,
          primaryColor: primary,
          primaryTextColor: text,
          secondaryColor: secondary,
          secondaryTextColor: text,
          tertiaryColor: accent,
          tertiaryTextColor: text
        }
      },
      background,
      font
    };
  };

  const renderDiagram = async (params: URLSearchParams) => {
    if (!browser || !surface) {
      return;
    }

    const token = ++renderToken;
    const { config, background, font } = buildMermaidConfig(params);
    const codeRaw = decodeMermaidCode(params);
    const mindmapMode = (params.get('mindmap') ?? 'convert') as 'convert' | 'sanitize' | 'keep';
    const code = preprocessMermaid(codeRaw, mindmapMode);

    try {
      // Ensure web fonts are loaded so Mermaid measures text accurately
      if (document?.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (fontError: unknown) {
          console.warn('Font readiness wait failed', fontError);
        }
      }
      const result = await renderMermaid(config, code, `mermaid-${token}`);
      if (token !== renderToken) {
        return;
      }

      backgroundColor = background;
      fontFamily = font;
      error = null;

      // eslint-disable-next-line svelte/no-dom-manipulating
      surface.innerHTML = result.svg;

      const svgElement = surface.querySelector('svg');
      panZoomInstance?.destroy();

      if (svgElement) {
        // Expand viewBox to add virtual margins so zooming reveals that space
        try {
          const VIEW_MARGIN = 30;
          const g = svgElement.querySelector('g');
          const bbox = g ? (g as SVGGElement).getBBox() : svgElement.getBBox();
          const nx = Math.floor(bbox.x - VIEW_MARGIN);
          const ny = Math.floor(bbox.y - VIEW_MARGIN);
          const nw = Math.ceil(bbox.width + 2 * VIEW_MARGIN);
          const nh = Math.ceil(bbox.height + 2 * VIEW_MARGIN);
          svgElement.setAttribute('viewBox', `${nx} ${ny} ${nw} ${nh}`);
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
          style.textContent = `
            foreignObject{overflow:visible}
            /* Ensure HTML labels never clip and are vertically centered in their node */
            .nodeLabel,.label{
              display:flex;
              align-items:center;          /* vertical centering */
              justify-content:center;      /* horizontal centering */
              height:100%;
              width:100%;
              text-align:center;
              overflow:visible;
              white-space:normal;
              word-break:break-word;
              overflow-wrap:anywhere;
              line-height:1.25;
              max-width:100%;
              box-sizing:border-box;
              padding-bottom:18px;         /* generous bottom breathing room */
              margin:0;
            }
            .nodeLabel *,.label *{max-width:100%;box-sizing:border-box}
            /* Improve edge label readability on busy backgrounds */
            .edgeLabel text{paint-order:stroke;stroke:#fff;stroke-width:2px}
          `;
          svgElement.appendChild(style);
        } catch (viewBoxError: unknown) {
          console.warn('Unable to expand SVG viewBox', viewBoxError);
        }

        panZoomInstance = panzoom(svgElement, {
          contain: true,
          controlIconsEnabled: false,
          fit: true,
          maxZoom: 12,
          minZoom: 0.05,
          panEnabled: true,
          zoomEnabled: true,
          zoomScaleSensitivity: 0.3
        });

        const fitAndCenterWithMargin = () => {
          if (!panZoomInstance || !surface) return;
          panZoomInstance.resize();
          panZoomInstance.fit();
          panZoomInstance.center();
        };

        fitAndCenterWithMargin();

        // After initial layout, reduce label scale if any HTML label still overflows its box
        const adjustOverflowLabels = () => {
          const nodes = svgElement.querySelectorAll(
            'foreignObject .nodeLabel, foreignObject .label'
          );
          nodes.forEach((n) => {
            const el = n as HTMLElement;
            // Flex centering is provided via injected CSS; avoid overriding with inline display
            el.style.transformOrigin = el.style.transformOrigin || 'left top';
            const cw = el.clientWidth;
            const sw = el.scrollWidth;
            if (sw > cw + 2 && cw > 0) {
              const ratio = Math.max(0.85, Math.min(1, (cw / sw) * 0.98));
              el.style.transform = `scale(${ratio})`;
            }
          });
        };

        // Allow the browser to paint once, then measure/adjust
        requestAnimationFrame(() => requestAnimationFrame(adjustOverflowLabels));

        // Refit on container or viewport size changes
        if (window.ResizeObserver) {
          const ro = new ResizeObserver(() => {
            fitAndCenterWithMargin();
            requestAnimationFrame(() => requestAnimationFrame(adjustOverflowLabels));
          });
          ro.observe(surface);
        } else {
          const handler = () => {
            fitAndCenterWithMargin();
            requestAnimationFrame(() => requestAnimationFrame(adjustOverflowLabels));
          };
          window.addEventListener('resize', handler);
        }
      }

      result.bindFunctions?.(surface);
    } catch (err: unknown) {
      if (token !== renderToken) {
        return;
      }

      console.error(err);
      panZoomInstance?.destroy();
      panZoomInstance = undefined;
      // eslint-disable-next-line svelte/no-dom-manipulating
      surface.innerHTML = '';
      backgroundColor = background;
      fontFamily = font;
      error = err instanceof Error ? err.message : 'Unable to render the diagram.';
    }
  };

  onMount(() => {
    if (!browser) {
      return;
    }

    const unsubscribe = page.subscribe(($page) => {
      if (!surface) {
        return;
      }
      void renderDiagram($page.url.searchParams);
    });

    return () => {
      unsubscribe();
    };
  });

  onDestroy(() => {
    panZoomInstance?.destroy();
  });
</script>

<svelte:head>
  <title>Mermaid Renderer</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div
  class="renderer"
  style:background={backgroundColor}
  style:font-family={fontFamily}
  data-has-error={Boolean(error)}>
  <div class="diagram" bind:this={surface} aria-live="polite" role="img"></div>
  {#if error}
    <div class="error" role="alert">
      <h1>Unable to render the diagram.</h1>
      <p>{error}</p>
    </div>
  {/if}
</div>

<style>
  .renderer {
    position: relative;
    display: flex;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;
    color: inherit;
  }

  .diagram {
    flex: 1;
    display: grid;
    place-items: center;
    touch-action: none;
    overflow: hidden;
  }

  .diagram :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    gap: 0.5rem;
    background: color-mix(in srgb, currentColor 8%, transparent);
    text-align: center;
  }

  .error h1 {
    font-size: clamp(1.1rem, 1.6vw + 0.5rem, 2rem);
    margin: 0;
  }

  .error p {
    margin: 0;
    max-width: min(40ch, 90vw);
    opacity: 0.8;
  }
</style>
