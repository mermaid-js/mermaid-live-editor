<!--
  @component
  Exports a `waitForFontAwesomeToLoad` function that waits for FontAwesome to load.

  Usage:

  ```svelte
  <script lang="ts">
    import FontAwesome from '$lib/client/components/FontAwesome';
    let waitForFontAwesomeToLoad: FontAwesome["waitForFontAwesomeToLoad"];
  </script>
  <FontAwesome bind:waitForFontAwesomeToLoad />
  ```
-->
<script context="module" lang="ts">
  /**
   * Returns `true` if the code may contain FontAwesome icons, and we should
   * wait for the fonts to load before rendering.
   */
  export function mayContainFontAwesome(code: string) {
    // taken from https://github.com/mermaid-js/mermaid/blob/7043892e871d0c413ec63dc1570a8ef738d15568/packages/mermaid/src/diagrams/flowchart/flowRenderer-v2.js#L63
    // Not ideal, since we're looking at unparsed code.
    const regex = /fa[blrs]?:fa-[\w-]+/g;
    return regex.test(code);
  }
</script>

<script lang="ts">
  // Vite will automatically take care of adding this to our `<head>`
  let lazyLoadFontAwesomeCSS = import('./FontAwesomeCSS.svelte');

  let fontsLoaded = (async () => {
    await lazyLoadFontAwesomeCSS;

    // Once the stylesheet has been parsed, the fonts will be in document.fonts
    // TODO: Maybe we should scan the CSS style sheet only, and only load FontAwesome fonts
    await Promise.allSettled(Array.from(document.fonts, (font) => font.load()));
  })();

  /**
   * Wait for FontAwesome to load.
   *
   * @returns A promise that resolves when FontAwesome is
   * loaded, or there was an error that we ignore.
   */
  export async function waitForFontAwesomeToLoad() {
    return await fontsLoaded;
  }
</script>

{#await lazyLoadFontAwesomeCSS then FontAwesomeCSS}
  <FontAwesomeCSS.default />
{/await}
