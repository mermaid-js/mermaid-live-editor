<script lang="ts">
  import { version } from 'mermaid/package.json';
  import QuestionCircleIcon from '~icons/fa6-solid/circle-question';
  import ShieldHalvedIcon from '~icons/fa6-solid/shield-halved';
  import FloatingToolbar from './FloatingToolbar.svelte';
  import { Button } from './ui/button';
  import { Separator } from './ui/separator';
</script>

<FloatingToolbar>
  <span class="text-sm opacity-50">v{version}</span>
  <Button variant="ghost" size="icon" title="Privacy & Security">
    <ShieldHalvedIcon />
  </Button>

  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" title="Help">
    <QuestionCircleIcon />
  </Button>
</FloatingToolbar>
