<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import Privacy from '$/components/Privacy.svelte';
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import { env } from '$/util/env';
  import { colorMode, toggleColorMode } from '$lib/themes/theme-store';
  import { version } from 'mermaid/package.json';
  import MoonIcon from '~icons/material-symbols/dark-mode-outline-rounded';
  import SunIcon from '~icons/material-symbols/light-mode-outline-rounded';
</script>

<FloatingToolbar>
  <span class="text-sm font-semibold opacity-60">v{version}</span>
  {#if !env.hidePrivacyPolicy}
    <Button variant="ghost" size="icon" title="Privacy & Security">
      <Privacy />
    </Button>

    <Separator orientation="vertical" />
  {/if}
  <Button
    variant="ghost"
    size="icon"
    title={$colorMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    onclick={toggleColorMode}
    class="[&_svg]:size-5">
    {#if $colorMode === 'dark'}
      <SunIcon />
    {:else}
      <MoonIcon />
    {/if}
  </Button>
</FloatingToolbar>
