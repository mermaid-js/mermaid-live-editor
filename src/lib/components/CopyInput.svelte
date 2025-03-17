<script lang="ts">
  import CopyButton from '$/components/CopyButton.svelte';
  import { Input } from '$/components/ui/input';
  import type { InputType } from '$/types';
  import { copyToClipboard } from '$/util/util';

  let {
    value,
    label = 'Copy',
    type = 'url'
  }: { value: string; label?: string; type?: InputType } = $props();
</script>

<div class="flex w-full items-center gap-2">
  <Input
    {type}
    {value}
    onclick={(event) => {
      event.currentTarget.setSelectionRange(0, event.currentTarget.value.length);
    }} />

  <CopyButton onclick={() => copyToClipboard(value)} {label} />
</div>
