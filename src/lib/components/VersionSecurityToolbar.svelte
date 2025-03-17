<script lang="ts">
  import FloatingToolbar from '$/components/FloatingToolbar.svelte';
  import Privacy from '$/components/Privacy.svelte';
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import { version } from 'mermaid/package.json';
  import QuestionCircleIcon from '~icons/material-symbols/help-outline-rounded';
</script>

<FloatingToolbar>
  <span class="text-sm font-semibold opacity-60">v{version}</span>
  <Button variant="ghost" size="icon" title="Privacy & Security">
    <Privacy />
  </Button>

  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" title="Help">
    <QuestionCircleIcon />
  </Button>
</FloatingToolbar>
