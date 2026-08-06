/**
 * <mermaid-embed> — a tiny, dependency-free loader for the Mermaid embed widget.
 *
 * Usage:
 *   <script src="https://mermaid.live/embed.js" async></script>
 *   <mermaid-embed src="https://mermaid.live/embed#pako:...">
 *     graph TD
 *       A --> B
 *   </mermaid-embed>
 *
 * The element renders an <iframe> pointing at the host's /embed page. Settings come from the
 * `src` URL and/or attributes (theme, look, mode, grid, pan, zoom, controls). If the element has
 * inline body text, that text is used as the diagram code and OVERRIDES any code in the `src` URL.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  // Derive origin + base path from the script URL so base-path deploys work.
  var scriptUrl = script ? new URL(script.src) : null;
  var PREFIX = scriptUrl
    ? scriptUrl.origin + scriptUrl.pathname.replace(/\/embed\.js$/, '')
    : window.location.origin;
  var DEFAULT_BASE = PREFIX + '/embed';

  var PASSTHROUGH = ['theme', 'look', 'mode', 'grid', 'pan', 'zoom', 'controls'];

  function px(value, fallback) {
    if (value == null) return fallback;
    return /^\d+$/.test(value) ? value + 'px' : value;
  }

  // Strip the common leading indentation from inline HTML so the diagram code is clean.
  function dedent(text) {
    var lines = text.replace(/\t/g, '  ').split('\n');
    while (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    var indent = Infinity;
    lines.forEach(function (line) {
      if (line.trim() === '') return;
      indent = Math.min(indent, line.match(/^ */)[0].length);
    });
    if (!isFinite(indent)) indent = 0;
    return lines
      .map(function (line) {
        return line.slice(indent);
      })
      .join('\n');
  }

  function buildUrl(el) {
    var src = el.getAttribute('src') || DEFAULT_BASE;
    var url = new URL(src, window.location.href);

    PASSTHROUGH.forEach(function (name) {
      var value = el.getAttribute(name);
      if (value !== null) url.searchParams.set(name, value);
    });

    // Inline body code wins over whatever code the src URL carried.
    var code = dedent(el.textContent || '');
    if (code.trim() !== '') url.searchParams.set('code', code);

    return url.toString();
  }

  function render(el) {
    if (el.__mermaidEmbedRendered) return;
    el.__mermaidEmbedRendered = true;

    var iframe = document.createElement('iframe');
    iframe.src = buildUrl(el);
    iframe.title = el.getAttribute('title') || 'Mermaid diagram';
    iframe.loading = 'lazy';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
    );
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.width = px(el.getAttribute('width'), '100%');
    iframe.style.height = px(el.getAttribute('height'), '420px');

    el.style.display = 'block';
    el.textContent = '';
    el.appendChild(iframe);
  }

  if ('customElements' in window) {
    customElements.define(
      'mermaid-embed',
      class MermaidEmbed extends HTMLElement {
        connectedCallback() {
          // Defer a macrotask so any inline text children are fully parsed before we read
          // them (the start tag connects before its text content when scripted upgrade
          // happens mid-parse). setTimeout is more reliable than rAF in headless contexts.
          // render() ignores repeat calls, so re-connects are harmless.
          setTimeout(() => render(this), 0);
        }
      }
    );
  }
})();
