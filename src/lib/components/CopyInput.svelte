<script lang="ts">
  import CopyButton from '#lib/components/CopyButton.svelte';
  import { Input } from '#lib/components/ui/input/index.js';
  import type { InputType } from '#lib/types.js';
  import { copyToClipboard } from '#lib/util/util.js';

  let {
    value,
    label = 'Copy',
    type = 'url',
    testID
  }: { value: string; label?: string; type?: InputType; testID?: string } = $props();
</script>

<div class="flex w-full items-center gap-2">
  <Input
    {type}
    {value}
    data-testid={testID}
    onclick={(event) => {
      event.currentTarget.setSelectionRange(0, event.currentTarget.value.length);
    }} />

  <CopyButton onclick={() => copyToClipboard(value)} {label} />
</div>
