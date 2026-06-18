<script lang="ts">
  import { Button } from '$/components/ui/button';
  import EditIcon from '~icons/material-symbols/edit-outline-rounded';
  import EyeIcon from '~icons/material-symbols/visibility-outline-rounded';

  let { value = $bindable() }: { value: 'preview' | 'visual' } = $props();
</script>

<div class="flex items-center gap-1 rounded-2xl bg-muted p-1 shadow-sm">
  <Button
    size="sm"
    variant={value === 'preview' ? 'default' : 'ghost'}
    title="Preview the diagram"
    onclick={() => (value = 'preview')}>
    <EyeIcon />
    <span class="hidden sm:inline">Preview</span>
  </Button>
  <Button
    size="sm"
    variant={value === 'visual' ? 'default' : 'ghost'}
    title="Edit the diagram visually"
    onclick={() => (value = 'visual')}>
    <EditIcon />
    <span class="hidden sm:inline">Visual</span>
  </Button>
</div>
