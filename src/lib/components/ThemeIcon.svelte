<script lang="ts">
  import { mode } from 'mode-watcher';
  import { cubicInOut } from 'svelte/easing';
  import { type TransitionConfig } from 'svelte/transition';
  import MoonIcon from '~icons/material-symbols/dark-mode-outline-rounded';
  import SunIcon from '~icons/material-symbols/light-mode-outline-rounded';

  const spin = (
    node: Element,
    { duration = 400, easing = cubicInOut, clockWise = true } = {}
  ): TransitionConfig => {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    return {
      duration,
      easing,
      css: (t, u) => `
        transform: ${transform} rotate(${u * 90 * (clockWise ? 1 : -1)}deg);
        opacity: ${opacity * t}
      `
    };
  };
</script>

<div class="inline-grid">
  {#key $mode}
    <div
      in:spin={{ clockWise: true }}
      out:spin={{ clockWise: false }}
      class="col-start-1 row-start-1">
      {#if $mode === 'dark'}
        <MoonIcon />
      {:else}
        <SunIcon />
      {/if}
    </div>
  {/key}
</div>
