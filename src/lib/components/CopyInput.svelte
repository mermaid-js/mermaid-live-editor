<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import type { InputType } from '$/types';
  import { notify } from '$/util/notify';
  import { copyToClipboard } from '$/util/util';
  import { scale } from 'svelte/transition';
  import CheckIcon from '~icons/material-symbols/check-rounded';
  import CopyIcon from '~icons/material-symbols/content-copy-outline-rounded';

  let {
    value,
    label = 'Copy',
    type = 'url'
  }: { value: string; label?: string; type?: InputType } = $props();

  let showCheckIcon = $state(false);
</script>

<div class="flex w-full items-center gap-2">
  <Input
    {type}
    {value}
    onclick={(e) => {
      e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
    }} />
  <Button
    onclick={async () => {
      if (await copyToClipboard(value)) {
        showCheckIcon = true;
        setTimeout(() => {
          showCheckIcon = false;
        }, 1000);
      } else {
        notify('Failed to copy');
      }
    }}>
    <div class="grid">
      {#key showCheckIcon}
        <span transition:scale class="col-start-1 row-start-1">
          {#if showCheckIcon}
            <CheckIcon />
          {:else}
            <CopyIcon />
          {/if}
        </span>
      {/key}
    </div>
    {label}
  </Button>
</div>
