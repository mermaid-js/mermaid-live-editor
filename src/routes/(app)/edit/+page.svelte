<script lang="ts">
  import Actions from '#lib/components/Actions.svelte';
  import Card from '#lib/components/Card/Card.svelte';
  import DiagramDocButton from '#lib/components/DiagramDocumentationButton.svelte';
  import Editor from '#lib/components/Editor.svelte';
  import EnhancedEditsButton from '#lib/components/EnhancedEditsButton.svelte';
  import History from '#lib/components/History/History.svelte';
  import { startAutoSave } from '#lib/components/History/historyState.svelte.js';
  import McWrapper from '#lib/components/McWrapper.svelte';
  import MermaidChartIcon from '#lib/components/MermaidChartIcon.svelte';
  import EditorChooserModal from '#lib/components/migration/EditorChooserModal.svelte';
  import Navbar from '#lib/components/Navbar.svelte';
  import PanZoomToolbar from '#lib/components/PanZoomToolbar.svelte';
  import Preset from '#lib/components/Preset.svelte';
  import Share from '#lib/components/Share.svelte';
  import SyncRoughToolbar from '#lib/components/SyncRoughToolbar.svelte';
  import V13Callout from '#lib/components/V13Callout.svelte';
  import V13Peek from '#lib/components/V13Peek.svelte';
  import { Button } from '#lib/components/ui/button/index.js';
  import { Separator } from '#lib/components/ui/separator/index.js';
  import * as Resizable from '#lib/components/ui/resizable/index.js';
  import { Switch } from '#lib/components/ui/switch/index.js';
  import { Toggle } from '#lib/components/ui/toggle/index.js';
  import VersionSecurityToolbar from '#lib/components/VersionSecurityToolbar.svelte';
  import View from '#lib/components/View.svelte';
  import type { EditorMode, Tab } from '#lib/types.js';
  import {
    addLivePreviewSession,
    createLivePreviewPublisher,
    type LivePreviewPublisher
  } from '#lib/util/livePreview.js';
  import { shouldShowEditorChooser } from '#lib/util/migration/domainMigration.js';
  import { PanZoomState } from '#lib/util/panZoom.js';
  import { env } from '#lib/util/env.js';
  import { validatedState, updateCodeStore, urls } from '#lib/util/state.svelte.js';
  import { v13 } from '#lib/util/v13.svelte.js';
  import { logEvent, logMermaidChartClick } from '#lib/util/stats.js';
  import { getContactSalesUrl, initHandler } from '#lib/util/util.js';
  import { onMount } from 'svelte';
  import CodeIcon from '~icons/custom/code';
  import HistoryIcon from '~icons/material-symbols/history';
  import GearIcon from '~icons/material-symbols/settings-outline-rounded';

  const panZoomState = new PanZoomState();
  let livePreviewPublisher = $state.raw<LivePreviewPublisher>();
  const livePreviewHref = $derived(
    livePreviewPublisher
      ? addLivePreviewSession(urls.current.view, livePreviewPublisher.sessionId)
      : urls.current.view
  );

  onMount(() => {
    const publisher = createLivePreviewPublisher();
    livePreviewPublisher = publisher;
    return () => publisher?.close();
  });

  $effect(() => {
    livePreviewPublisher?.publish(
      validatedState.current.serialized,
      panZoomState.getNormalizedViewport()
    );
  });

  const tabSelectHandler = (tab: Tab) => {
    const editorMode: EditorMode = tab.id === 'code' ? 'code' : 'config';
    updateCodeStore({ editorMode });
  };

  const editorTabs: Tab[] = [
    {
      icon: CodeIcon,
      id: 'code',
      title: 'Code'
    },
    {
      icon: GearIcon,
      id: 'config',
      title: 'Config'
    }
  ];

  let width = $state(0);
  let isMobile = $derived(width < 640);
  let isViewMode = $state(true);
  let showEditorChooser = $state(false);

  onMount(async () => {
    showEditorChooser = shouldShowEditorChooser();
    await initHandler();
    window.addEventListener('appinstalled', () => {
      logEvent('pwaInstalled', { isMobile });
    });
  });

  // Record the Timeline for the whole session, not just while the panel is open.
  onMount(() => startAutoSave());

  let isHistoryOpen = $state(false);

  let editorPane: Resizable.Pane | undefined;
  $effect(() => {
    if (isMobile) {
      editorPane?.resize(50);
    }
  });
</script>

<div class="flex h-full flex-col overflow-hidden">
  {#snippet mobileToggle()}
    <div class="flex items-center gap-2">
      Edit <Switch
        id="editorMode"
        class="data-[state=checked]:bg-accent"
        bind:checked={isViewMode}
        onclick={() => {
          logEvent('mobileViewToggle');
        }} /> View
    </div>
  {/snippet}

  <Navbar mobileToggle={isMobile ? mobileToggle : undefined}>
    <Toggle bind:pressed={isHistoryOpen} size="sm" title="History" aria-label="History">
      <HistoryIcon />
    </Toggle>
    <Share />
    {#if env.isEnabledMermaidChartLinks}
      <Separator orientation="vertical" />
      <McWrapper labelPrefix="Opens ">
        <Button
          size="sm"
          href={getContactSalesUrl()}
          target="_blank"
          onclick={() => logMermaidChartClick('contactSales')}>
          <MermaidChartIcon />
          Contact sales
        </Button>
      </McWrapper>
      <McWrapper>
        <Button
          variant="accent"
          size="sm"
          href={urls.current.mermaidChart({ medium: 'save_diagram' }).save}
          target="_blank"
          onclick={() => logMermaidChartClick('saveDiagram')}>
          <MermaidChartIcon />
          Save diagram
        </Button>
      </McWrapper>
    {/if}
  </Navbar>

  <div class="flex flex-1 flex-col overflow-hidden" bind:clientWidth={width}>
    <div
      class={[
        'size-full',
        isMobile && ['w-[200%] duration-300', isViewMode && '-translate-x-1/2']
      ]}>
      <Resizable.PaneGroup
        direction="horizontal"
        autoSaveId="liveEditor"
        class="gap-4 p-2 pt-0 sm:gap-0 sm:p-6 sm:pt-0">
        <Resizable.Pane bind:this={editorPane} defaultSize={30} minSize={15}>
          <div class="flex h-full flex-col gap-4 sm:gap-6">
            <Card
              onselect={tabSelectHandler}
              isOpen
              tabs={editorTabs}
              activeTabID={validatedState.current.editorMode}
              isClosable={false}>
              {#snippet actions()}
                <DiagramDocButton />
              {/snippet}
              <Editor {isMobile} />
            </Card>

            <div class="group flex flex-wrap justify-between gap-4 sm:gap-6">
              <Preset />
              <Actions />
            </div>
          </div>
        </Resizable.Pane>
        <Resizable.Handle class="mr-1 hidden opacity-0 sm:block" />
        <Resizable.Pane minSize={15} class="relative flex h-full flex-1 flex-col overflow-hidden">
          <View {panZoomState} shouldShowGrid={validatedState.current.grid} />
          <div class="absolute top-0 left-5 hidden md:block"><EnhancedEditsButton /></div>
          <div class="absolute top-0 right-0">
            <PanZoomToolbar {panZoomState} {livePreviewHref} />
          </div>
          <div class="absolute right-0 bottom-0">
            {#if v13.variant === 'peek'}
              <!-- Perches on top of the toolbar, stem just touching its edge. -->
              <div class="pointer-events-none absolute right-3 bottom-[calc(100%-13px)]">
                <V13Peek />
              </div>
            {/if}
            <div class="relative"><VersionSecurityToolbar showV13={v13.variant === 'chip'} /></div>
          </div>
          <div class="absolute bottom-0 left-0 sm:left-5"><SyncRoughToolbar /></div>
          {#if v13.variant === 'pill'}
            <!-- Only where the pill fits between the bottom toolbars. -->
            <div class="@container pointer-events-none absolute inset-x-0 bottom-0 h-12">
              <div class="hidden h-full items-center justify-center @[56rem]:flex">
                <V13Callout />
              </div>
            </div>
          {/if}
        </Resizable.Pane>
        {#if isHistoryOpen}
          <Resizable.Handle class="ml-1 hidden opacity-0 sm:block" />
          <Resizable.Pane minSize={15} defaultSize={30} class="hidden h-full grow flex-col sm:flex">
            <History />
          </Resizable.Pane>
        {/if}
      </Resizable.PaneGroup>
    </div>
  </div>
</div>

<EditorChooserModal bind:open={showEditorChooser} />
