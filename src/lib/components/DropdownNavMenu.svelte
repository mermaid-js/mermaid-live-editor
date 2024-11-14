<script lang="ts">
  interface Props {
    links: { title: string; href: string }[];
    label?: string;
    icon?: string;
  }

  let { links, label, icon }: Props = $props();
</script>

<div class="dropdown dropdown-end">
  <button class="btn btn-ghost">
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
  </button>
  <div
    class="dropdown-content menu top-14 size-fit overflow-y-auto bg-base-200 text-base-content shadow-2xl">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <ul tabindex="0" class="menu compact p-4">
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
  </div>
</div>
