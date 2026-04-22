<script lang="ts">
  import McWrapper from '$/components/McWrapper.svelte';
  import PrivacyPolicyLink from '$/components/migration/PrivacyPolicyLink.svelte';
  import * as Dialog from '$/components/ui/dialog';
  import { asset } from '$app/paths';
  import type { Component } from 'svelte';
  import SparklesIcon from '~icons/hugeicons/sparkles';
  import ChevronIcon from '~icons/material-symbols/chevron-right-rounded';
  import CodeIcon from '~icons/material-symbols/code-rounded';
  import EditIcon from '~icons/material-symbols/rebase-edit-outline-rounded';
  import type { EditorChooserVariantProps } from './editorChooserActions';

  let { actions }: EditorChooserVariantProps = $props();

  interface Option {
    buttonClick: string;
    badge: string;
    description: string;
    icon: Component;
    onclick: () => void;
    title: string;
    external: boolean;
  }

  const options: Option[] = [
    {
      badge: 'Start free trial',
      buttonClick: 'createWithAi',
      description: 'Describe your diagram in plain text and AI generates it for you',
      external: true,
      icon: SparklesIcon,
      onclick: () => actions.startTrial('createWithAi'),
      title: 'Create with AI'
    },
    {
      badge: 'Start free trial',
      buttonClick: 'useVisualEditor',
      description: 'Drag, drop, and connect shapes on an interactive canvas',
      external: true,
      icon: EditIcon,
      onclick: () => actions.startTrial('useVisualEditor'),
      title: 'Use visual editor'
    },
    {
      badge: 'Mermaid live',
      buttonClick: 'writeCode',
      description: 'Use Mermaid syntax directly in the code editor',
      external: false,
      icon: CodeIcon,
      onclick: () => actions.dismiss('writeCode'),
      title: 'Write code'
    }
  ];
</script>

<Dialog.Content class="flex max-w-xl flex-col gap-3 bg-background p-8">
  <Dialog.Header class="items-center gap-2 space-y-0">
    <img class="size-10" src={asset('/favicon.svg')} alt="Mermaid" />
    <Dialog.Title class="pt-2 text-2xl font-bold">How do you want to create?</Dialog.Title>
    <Dialog.Description class="text-xs text-muted-foreground">
      Choose how to start your diagram
    </Dialog.Description>
  </Dialog.Header>

  <div class="mt-3 flex flex-col gap-3">
    {#snippet optionButton(option: Option)}
      <button
        type="button"
        class="group flex w-full items-center gap-3 rounded-lg border border-border px-3 py-3.5 text-left transition-colors hover:border-accent"
        onclick={option.onclick}>
        <option.icon class="size-5 shrink-0 text-muted-foreground group-hover:text-accent" />
        <div class="flex flex-1 flex-col gap-0.5">
          <span class="text-sm font-medium">{option.title}</span>
          <span class="text-xs font-light text-muted-foreground">{option.description}</span>
        </div>
        <span
          class="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-normal text-secondary-foreground">
          {option.badge}
        </span>
        <ChevronIcon class="size-5 shrink-0 text-muted-foreground group-hover:text-accent" />
      </button>
    {/snippet}
    {#each options as option (option.buttonClick)}
      {#if option.external}
        <McWrapper labelPrefix="Opens ">
          {@render optionButton(option)}
        </McWrapper>
      {:else}
        {@render optionButton(option)}
      {/if}
    {/each}
  </div>

  <p class="mt-2 text-center text-xs text-muted-foreground">
    AI and visual editor are part of Mermaid.ai — free forever, with Plus features free for 7 days.
  </p>

  <PrivacyPolicyLink />
</Dialog.Content>
