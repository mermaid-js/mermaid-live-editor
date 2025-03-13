<script lang="ts">
  import { version } from 'mermaid/package.json';
  import QuestionCircleIcon from '~icons/material-symbols/help-outline-rounded';
  import ShieldIcon from '~icons/material-symbols/shield-lock-outline-rounded';
  import FloatingToolbar from './FloatingToolbar.svelte';
  import { Button } from './ui/button';
  import { Separator } from './ui/separator';
</script>

<FloatingToolbar>
  <span class="text-sm font-semibold opacity-60">v{version}</span>
  <Button variant="ghost" size="icon" title="Privacy & Security">
    <ShieldIcon />
  </Button>

  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" title="Help">
    <QuestionCircleIcon />
  </Button>
</FloatingToolbar>
