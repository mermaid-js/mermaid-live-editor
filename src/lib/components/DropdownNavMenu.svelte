<script lang="ts">
  import { Button } from '$/components/ui/button';
  import * as Popover from '$/components/ui/popover';
  import type { Component } from 'svelte';

  interface Props {
    links: { title: string; href: string }[];
    icon?: Component;
    class?: string;
  }

  let props: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger class="flex items-center gap-0">
    <Button variant="ghost" size="sm">
      <props.icon class={props.class} />
    </Button>
  </Popover.Trigger>
  <Popover.Content>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <ul tabindex="0" class="flex flex-col">
      {#each props.links as { href, title } (title)}
        <li class="rounded-md p-2 hover:bg-muted">
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
