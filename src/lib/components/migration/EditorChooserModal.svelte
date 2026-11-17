<script lang="ts">
  import PrivacyPolicyLink from '#lib/components/migration/PrivacyPolicyLink.svelte';
  import * as Dialog from '#lib/components/ui/dialog/index.js';
  import { dismissEditorChooser } from '#lib/util/migration/domainMigration.js';
  import { asset } from '$app/paths';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import Check from 'lucide-svelte/icons/check';
  import X from 'lucide-svelte/icons/x';
  import { createEditorChooserActions, getEditorChooserVariant } from './editorChooserActions';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();
  // Tracks whether the current close was triggered by an explicit action
  // (button click logs its own event) vs. implicit dismissal (ESC/click-outside/close icon).
  let handled = false;
  const variant = getEditorChooserVariant();
  const actions = createEditorChooserActions(() => {
    handled = true;
    open = false;
    // onOpenChange only fires for closes the dialog triggers itself, so persist here too.
    dismissEditorChooser();
  }, variant);

  $effect(() => {
    // Per-variant impressions, to compare click rates against.
    if (open) actions.log('shown');
  });

  const flow = {
    // Product name and check marks in the single-product layout.
    accentClass: 'text-[#6a4cf0] dark:text-[#a897ff]',
    benefits: [
      'Connect GitHub, Linear, Notion and Slack',
      'Start from a ready-made template',
      'Watch each step run on the canvas'
    ],
    buttonClass: 'bg-[#7c5cff] hover:bg-[#6a4be6]',
    cardClass: 'border-[#7c5cff] bg-[#f4f1ff] dark:bg-[#16112e]',
    cta: 'Try Flow',
    description: 'Turn a flowchart into an AI workflow that runs.',
    headline: 'Turn your flowchart into a workflow that runs',
    id: 'flow',
    image: asset('editor-chooser/mermaid-flow.png'),
    imageBorderClass: 'border-[rgba(124,92,255,0.5)]',
    isNew: true,
    name: 'Mermaid Flow',
    onclick: () => actions.tryFlow(),
    subline: 'Connect your tools and run it, no code needed.'
  };
  const visualEditor = {
    accentClass: 'text-[#e9175b]',
    benefits: [
      'Drag and drop to edit, no code needed',
      'AI builds diagrams from a description',
      'Save and share with your team'
    ],
    buttonClass: 'bg-[#d9265a] hover:bg-[#c01f4e]',
    cardClass: 'border-[#e4e2ec] bg-[#f8f8fb] dark:border-[#34304c] dark:bg-[#221f33]',
    cta: 'Start free',
    description: 'Drag, drop and edit diagrams without writing code.',
    headline: 'Edit this diagram visually',
    id: 'visual-editor',
    image: asset('editor-chooser/visual-editor.png'),
    imageBorderClass: 'border-[rgba(23,21,31,0.08)] dark:border-white/[0.08]',
    isNew: false,
    name: 'Mermaid Visual Editor',
    onclick: () => actions.openVisualEditor(),
    subline: ''
  };
  type Product = typeof flow;

  const products = { A: [visualEditor], B: [flow], C: [flow, visualEditor] }[variant];
  // Variants A and B show one product on its own, in a narrower pop-up.
  const single = products.length === 1 ? products[0] : undefined;
</script>

{#snippet newBadge()}
  <span
    class="rounded bg-[#7c5cff] px-1.5 py-0.5 text-[10px] leading-3 font-bold tracking-[0.5px] text-white">
    NEW
  </span>
{/snippet}

{#snippet cta(product: Product, className: string)}
  <button
    type="button"
    class={[
      'flex h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:h-[41px]',
      product.buttonClass,
      className
    ]}
    onclick={product.onclick}>
    {product.cta}
    <ArrowRight class="size-4" aria-hidden="true" />
  </button>
{/snippet}

<Dialog.Root
  bind:open
  onOpenChange={(v) => {
    if (v) return;
    if (!handled) actions.log('dismissed');
    handled = false;
    dismissEditorChooser();
  }}>
  <!-- The last direct child button is Dialog.Content's built-in close; the design has its own. -->
  <Dialog.Content
    data-testid="editor-chooser"
    data-variant={variant}
    class={[
      'flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col overflow-y-auto rounded-2xl border-0 bg-white shadow-[0_24px_32px_rgba(15,13,30,0.18)] sm:gap-0 sm:rounded-2xl sm:px-8 sm:pt-6 sm:pb-8 dark:bg-[#1c1a28] dark:shadow-[0_24px_32px_rgba(0,0,0,0.5)] [&>button:last-child]:hidden',
      single ? 'max-w-[510px] gap-4 p-5' : 'max-w-[654px] gap-2.5 p-4'
    ]}>
    <div class="flex items-center justify-between">
      <img
        class="h-8 w-[113px]"
        src={asset('editor-chooser/mermaid-wordmark.svg')}
        alt="Mermaid"
        width="113"
        height="32" />
      <Dialog.Close
        class="flex size-11 items-center justify-center rounded-md text-[#6b6880] hover:text-[#17151f] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:-my-1.5 sm:-mr-4 dark:text-[#9a98a8] dark:hover:text-white">
        <X class="size-6 sm:size-5" strokeWidth={2} aria-hidden="true" />
        <span class="sr-only">Close</span>
      </Dialog.Close>
    </div>

    {#if single}
      <div
        class={[
          'aspect-[446/253] shrink-0 overflow-hidden rounded-xl border sm:mt-4',
          single.imageBorderClass
        ]}>
        <img
          class="size-full object-cover"
          src={single.image}
          alt=""
          loading="lazy"
          decoding="async" />
      </div>
      <div class="flex flex-col gap-2 sm:mt-5 sm:gap-1.5" data-testid="editor-chooser-{single.id}">
        <p
          class={[
            'flex items-center gap-2 text-[13px] leading-4 font-semibold',
            single.accentClass
          ]}>
          {#if single.isNew}
            {@render newBadge()}
          {/if}
          {single.name}
        </p>
        <Dialog.Title
          class="text-[22px] leading-7 font-bold tracking-normal text-balance text-[#17151f] dark:text-white">
          {single.headline}
        </Dialog.Title>
        {#if single.subline}
          <p class="text-[13px] leading-[19px] text-[#6b6880] sm:mt-0.5 dark:text-[#9a98a8]">
            {single.subline}
          </p>
        {/if}
      </div>
      <ul
        class="flex flex-col gap-2.5 text-[13px] leading-[19px] text-[#2b2542] sm:mt-4 sm:gap-2 sm:leading-4 dark:text-white">
        {#each single.benefits as benefit (benefit)}
          <li class="flex items-center gap-2.5">
            <Check
              class={`size-3.5 shrink-0 ${single.accentClass}`}
              strokeWidth={1.75}
              absoluteStrokeWidth
              aria-hidden="true" />
            {benefit}
          </li>
        {/each}
      </ul>
      {@render cta(single, 'sm:mt-6')}
    {:else}
      <Dialog.Title
        class="text-[22px] leading-7 font-bold tracking-normal text-[#17151f] sm:mt-3 sm:text-center sm:text-2xl sm:leading-[29px] dark:text-white">
        Do more with this diagram
      </Dialog.Title>

      <div class="grid gap-2.5 sm:mt-7 sm:grid-cols-2 sm:gap-4">
        {#each products as product (product.id)}
          <section
            class={[
              'flex flex-col gap-2.5 rounded-2xl border p-3 sm:gap-0 sm:px-[15px] sm:pt-[18px] sm:pb-[15px]',
              product.cardClass
            ]}
            data-testid="editor-chooser-{product.id}">
            <h3
              class="flex items-center gap-2 text-[15px] leading-[18px] font-semibold text-[#17151f] dark:text-white">
              {#if product.isNew}
                {@render newBadge()}
              {/if}
              {product.name}
            </h3>
            <div
              class="aspect-[302/171] overflow-hidden rounded-lg border border-[rgba(23,21,31,0.08)] sm:mt-[15px] sm:aspect-[255/150] dark:border-white/[0.08]">
              <img
                class="size-full object-cover"
                src={product.image}
                alt=""
                loading="lazy"
                decoding="async" />
            </div>
            <p
              class="text-[13px] leading-[18px] text-[#6b6880] sm:mt-3 sm:min-h-[34px] sm:text-[12.5px] sm:leading-[17px] dark:text-[#9a98a8]">
              {product.description}
            </p>
            {@render cta(product, 'sm:mt-4')}
          </section>
        {/each}
      </div>
    {/if}

    <button
      type="button"
      class="flex h-11 w-full shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#c9c4d6] text-sm leading-5 font-medium text-[#59546b] transition-colors hover:bg-[#f8f8fb] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:mt-3 dark:border-[#5c576e] dark:text-[#e0dbed] dark:hover:bg-[#221f33]"
      onclick={() => actions.dismiss('stayOnLive')}>
      Stay in mermaid.live
    </button>
    <div class="sm:mt-3">
      <PrivacyPolicyLink />
    </div>
  </Dialog.Content>
</Dialog.Root>
