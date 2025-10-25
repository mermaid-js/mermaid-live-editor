<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { render as renderMermaid } from '$lib/util/mermaid';
  import panzoom from 'svg-pan-zoom';
  import { onDestroy, onMount } from 'svelte';

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
  const PAN_ZOOM_MAX = 12;

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
    } catch (err) {
      console.warn('Unable to decode base64 mermaid code', err);
      return value;
    }
  };

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
      } catch (err) {
        console.warn('Unable to URI decode mermaid code', err);
      }
    }

    if (!raw) {
      return DEFAULT_DIAGRAM;
    }

    const normalized = raw.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    return normalized.trim() ? normalized : DEFAULT_DIAGRAM;
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
        startOnLoad: false,
        securityLevel: 'loose',
        theme,
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
    const code = decodeMermaidCode(params);

    try {
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
        panZoomInstance = panzoom(svgElement, {
          contain: true,
          controlIconsEnabled: false,
          fit: true,
          maxZoom: PAN_ZOOM_MAX,
          minZoom: 0.1,
          panEnabled: true,
          zoomEnabled: true,
          zoomScaleSensitivity: 0.3
        });

        const mediaQuery = window.matchMedia?.('(pointer: fine) and (min-width: 768px)');
        const isDesktop = mediaQuery?.matches ?? false;

        const calibrateInitialView = (attempt = 0) => {
          if (!panZoomInstance) {
            return;
          }

          panZoomInstance.resize();
          panZoomInstance.fit();
          panZoomInstance.center();

          const sizes = panZoomInstance.getSizes();
          const bbox = svgElement.getBBox();

          if (!sizes.width || !sizes.height || bbox.width === 0 || bbox.height === 0) {
            if (attempt < 3) {
              requestAnimationFrame(() => calibrateInitialView(attempt + 1));
            }
            return;
          }

          const maxDefaultZoom = isDesktop ? 3.2 : 2.1;
          const marginRatio = isDesktop ? 0.08 : 0.12;
          const zoomForWidth = sizes.width / bbox.width;
          const zoomForHeight = sizes.height / bbox.height;
          const boundingZoom = Math.min(zoomForWidth, zoomForHeight);
          const currentZoom = panZoomInstance.getZoom();
          const unclampedTarget = boundingZoom * (1 - marginRatio);
          const targetZoom = Math.min(
            Math.max(currentZoom, unclampedTarget),
            maxDefaultZoom,
            PAN_ZOOM_MAX
          );

          if (Number.isFinite(targetZoom) && targetZoom > 0 && targetZoom !== currentZoom) {
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            panZoomInstance.zoom(targetZoom);
            panZoomInstance.centerOn(centerX, centerY);
          } else if (Number.isFinite(targetZoom) && targetZoom > 0) {
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            panZoomInstance.centerOn(centerX, centerY);
          }
        };

        requestAnimationFrame(() => calibrateInitialView());
      }

      result.bindFunctions?.(surface);
    } catch (err) {
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
    inline-size: 100%;
    block-size: 100%;
    min-block-size: 100vh;
    min-block-size: 100dvh;
    overflow: hidden;
    color: inherit;
  }

  .diagram {
    flex: 1;
    min-inline-size: 0;
    min-block-size: 0;
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
