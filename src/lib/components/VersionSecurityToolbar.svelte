<script lang="ts">
  import { version } from 'mermaid/package.json';
  import FloatingToolbar from './FloatingToolbar.svelte';
  import { Button } from './ui/button';
  import Separator from './ui/separator/separator.svelte';
</script>

<FloatingToolbar>
  <span class="text-sm opacity-50">v{version}</span>
  <Button variant="ghost" size="icon" title="Privacy & Security">
    <i class="fa-solid fa-shield-halved"></i>
  </Button>

  <Separator orientation="vertical" />
  <Button variant="ghost" size="icon" title="Help">
    <i class="fas fa-question-circle"></i>
  </Button>
</FloatingToolbar>
