<script lang="ts">
  import { Button } from '$/components/ui/button';
  import * as Popover from '$/components/ui/popover';
  import type { Component } from 'svelte';

  interface Props {
    links: { title: string; href: string }[];
    icon?: Component;
    class?: string;
  }

  let { links, icon, class: className }: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger class="flex items-center gap-0">
    <Button variant="ghost" size="sm">
      <svelte:component this={icon} class={className} />
    </Button>
  </Popover.Trigger>
  <Popover.Content>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <ul tabindex="0" class="menu flex flex-col gap-2">
      {#each links as { href, title }}
        <li>
          <a
            role="menuitem"
            tabindex="0"
            class="whitespace-nowrap underline"
            target="_blank"
            {href}>
            {title}
          </a>
        </li>
      {/each}
    </ul>
  </Popover.Content>
</Popover.Root>
