<script>
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import { crossfade, scale } from 'svelte/transition';

  // Setup crossfade transition
  const [send, receive] = crossfade({
    duration: 400,
    easing: quintOut,
    fallback(node, params) {
      return scale(node, {
        start: 0.8,
        duration: 300,
        easing: quintOut
      });
    }
  });

  // Sample data - replace with your actual data
  export let items = [
    { id: 1, title: 'Box 1', content: 'Content 1' },
    { id: 2, title: 'Box 2', content: 'Content 2' }
  ];

  // Track which items are expanded (using Set)
  let expandedIds = new Set();

  function toggleExpand(id) {
    // If already expanded, remove it, otherwise add it
    if (expandedIds.has(id)) {
      expandedIds.delete(id);
    } else {
      expandedIds.add(id);
    }
    expandedIds = new Set(expandedIds); // Replace the entire Set to trigger reactivity
  }

  $: expandedItems = items.filter((item) => expandedIds.has(item.id));
  $: collapsedItems = items.filter((item) => !expandedIds.has(item.id));
</script>

<div class="flex flex-col gap-4">
  <!-- Combined list approach -->
  <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
    {#each items as item (item.id)}
      {@const isExpanded = expandedIds.has(item.id)}
      <div
        class="duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] w-full min-w-0 transition-all {isExpanded
          ? 'order-first col-span-full'
          : ''}"
        animate:flip={{ duration: 400 }}>
        <button
          class="flex h-full w-full min-w-0 flex-col rounded-lg bg-neutral-100 p-4 text-left shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-200 {isExpanded
            ? 'bg-blue-50 p-6 shadow-lg'
            : ''}"
          in:receive={{ key: item.id }}
          out:send={{ key: item.id }}
          on:click={() => toggleExpand(item.id)}>
          <h3 class="m-0 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</h3>
          {#if isExpanded}
            <p class="m-0">{item.content}</p>
          {/if}
        </button>
      </div>
    {/each}
  </div>
</div>
