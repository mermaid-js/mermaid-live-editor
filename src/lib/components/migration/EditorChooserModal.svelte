<script lang="ts">
  import PrivacyPolicyLink from '#lib/components/migration/PrivacyPolicyLink.svelte';
  import { Button } from '#lib/components/ui/button/index.js';
  import * as Dialog from '#lib/components/ui/dialog/index.js';
  import { dismissEditorChooser } from '#lib/util/migration/domainMigration.js';
  import { asset } from '$app/paths';
  import ArrowRight from 'lucide-svelte/icons/arrow-right';
  import X from 'lucide-svelte/icons/x';
  import { createEditorChooserActions } from './editorChooserActions';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();
  // Tracks whether the current close was triggered by an explicit action
  // (button click logs its own event) vs. implicit dismissal (ESC/click-outside/close icon).
  let handled = false;
  const actions = createEditorChooserActions(() => {
    handled = true;
    open = false;
    // onOpenChange only fires for closes the dialog triggers itself, so persist here too.
    dismissEditorChooser();
  });

  const products = [
    {
      buttonClass: 'bg-[#7c5cff] hover:bg-[#6a4be6]',
      cardClass: 'border-[#7c5cff] bg-[#f4f1ff] dark:bg-[#16112e]',
      cta: 'Try Flow',
      description: 'Turn a flowchart into an AI workflow that runs.',
      id: 'flow',
      image: asset('editor-chooser/mermaid-flow.png'),
      isNew: true,
      name: 'Mermaid Flow',
      onclick: () => actions.tryFlow()
    },
    {
      buttonClass: 'bg-[#d9265a] hover:bg-[#c01f4e]',
      cardClass: 'border-[#e4e2ec] bg-[#f8f8fb] dark:border-[#34304c] dark:bg-[#221f33]',
      cta: 'Start free',
      description: 'Drag, drop and edit diagrams without writing code.',
      id: 'visual-editor',
      image: asset('editor-chooser/visual-editor.png'),
      isNew: false,
      name: 'Mermaid Visual Editor',
      onclick: () => actions.startTrial()
    }
  ];
</script>

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
    class="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[654px] flex-col gap-3 overflow-y-auto rounded-2xl border-0 bg-white p-4 shadow-[0_24px_32px_rgba(15,13,30,0.18)] sm:gap-0 sm:rounded-2xl sm:px-8 sm:pt-6 sm:pb-8 dark:bg-[#1c1a28] dark:shadow-[0_24px_32px_rgba(0,0,0,0.5)] [&>button:last-child]:hidden">
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

    <Dialog.Title
      class="text-[22px] leading-7 font-bold tracking-normal text-[#17151f] sm:mt-3 sm:text-center sm:text-2xl sm:leading-[29px] dark:text-white">
      Do more with this diagram
    </Dialog.Title>

    <div class="grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4">
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
              <span
                class="rounded bg-[#7c5cff] px-1.5 py-0.5 text-[10px] leading-3 font-bold tracking-[0.5px] text-white">
                NEW
              </span>
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
          <button
            type="button"
            class={[
              'flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:mt-4 sm:h-[41px]',
              product.buttonClass
            ]}
            onclick={product.onclick}>
            {product.cta}
            <ArrowRight class="size-4" aria-hidden="true" />
          </button>
        </section>
      {/each}
    </div>

    <div class="flex flex-col items-center gap-3 sm:mt-6">
      <Button variant="outline" onclick={() => actions.dismiss('stayOnLive')}>
        Stay on mermaid.live
      </Button>
      <PrivacyPolicyLink />
    </div>
  </Dialog.Content>
</Dialog.Root>
