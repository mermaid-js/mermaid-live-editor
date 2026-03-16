<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import Privacy from '$/components/Privacy.svelte';
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import { TID } from '$/constants';
  import { env } from '$/util/env';
  import { version } from 'mermaid/package.json';
  import { mode, setMode } from 'mode-watcher';
  import ThemeIcon from './ThemeIcon.svelte';
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
    data-testid={TID.themeToggleButton}
    title="Switch to {$mode === 'dark' ? 'light' : 'dark'} theme"
    class="[&_svg]:size-5"
    onclick={() => setMode($mode === 'dark' ? 'light' : 'dark')}>
    <ThemeIcon />
  </Button>
</FloatingToolbar>
