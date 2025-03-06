<script lang="ts">
  import * as Popover from '$/components/ui/popover';

  interface Props {
    links: { title: string; href: string }[];
    label?: string;
    icon?: string;
  }

  let { links, label, icon }: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger class="flex items-center gap-0">
    {#if icon}
      <i class={icon}></i>
    {/if}
    {#if label}
      <span>{label}</span>
    {/if}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1792 1792"
      class="ml-1 inline-block h-4 w-4 fill-current"
      ><path
        d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z" /></svg>
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
