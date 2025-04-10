<script lang="ts">
  import Card from '$/components/Card/Card.svelte';
  import DiagramDocButton from '$/components/DiagramDocumentationButton.svelte';
  import Editor from '$/components/Editor.svelte';
  import History from '$/components/History/History.svelte';
  import McWrapper from '$/components/McWrapper.svelte';
  import MermaidChartIcon from '$/components/MermaidChartIcon.svelte';
  import Navbar from '$/components/Navbar.svelte';
  import PanZoomToolbar from '$/components/PanZoomToolbar.svelte';
  import Preset from '$/components/Preset.svelte';
  import Share from '$/components/Share.svelte';
  import SyncRoughToolbar from '$/components/SyncRoughToolbar.svelte';
  import ThemeIcon from '$/components/ThemeIcon.svelte';
  import { Button } from '$/components/ui/button';
  import * as Resizable from '$/components/ui/resizable';
  import { Toggle } from '$/components/ui/toggle';
  import VersionSecurityToolbar from '$/components/VersionSecurityToolbar.svelte';
  import View from '$/components/View.svelte';
  import { TID } from '$/constants';
  import type { EditorMode, Tab } from '$/types';
  import { PanZoomState } from '$/util/panZoom';
  import { stateStore, updateCodeStore, urlsStore } from '$/util/state';
  import { initHandler } from '$/util/util';
  import { mode, setMode } from 'mode-watcher';
  import { onMount } from 'svelte';
  import CodeIcon from '~icons/custom/code';
  import HistoryIcon from '~icons/material-symbols/history';
  import GearIcon from '~icons/material-symbols/settings-outline-rounded';

  const panZoomState = new PanZoomState();

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

  onMount(async () => {
    await initHandler();
  });

  let isHistoryOpen = $state(false);
  let project = { description: '' };

  function autoResize(event) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
</script>

<div class="flex h-full flex-col overflow-hidden">
  <Navbar>
    <Toggle bind:pressed={isHistoryOpen} size="sm">
      <HistoryIcon />
    </Toggle>
    <Share />
    <Button
      variant="ghost"
      size="icon"
      data-testid={TID.themeToggleButton}
      title="Switch to {$mode === 'dark' ? 'light' : 'dark'} theme"
      class="[&_svg]:size-5"
      onclick={() => setMode($mode === 'dark' ? 'light' : 'dark')}>
      <ThemeIcon />
    </Button>
    <McWrapper>
      <Button
        variant="accent"
        size="sm"
        href={$urlsStore.mermaidChart({ medium: 'save_diagram' }).save}
        target="_blank">
        <MermaidChartIcon />
        Save diagram
      </Button>
    </McWrapper>
  </Navbar>

  <div class="flex flex-1 overflow-hidden">
    <Resizable.PaneGroup direction="horizontal" autoSaveId="liveEditor" class="p-6 pt-0">
      <Resizable.Pane defaultSize={30} minSize={15} class="hidden md:block">
        <div class="flex h-full flex-col gap-6" id="editorPane">
          <Card
            onselect={tabSelectHandler}
            isOpen
            tabs={editorTabs}
            activeTabID={$stateStore.editorMode}
            isClosable={false}>
            {#snippet actions()}
              <DiagramDocButton />
            {/snippet}
            <Editor />
          </Card>

          <div class="group flex flex-wrap justify-between gap-6">
            <Preset />
            <div class="w-full rounded-2xl bg-gray-700 px-4 py-2">
              <!-- Zone de saisie -->
              <textarea
                id="projectDescription"
                bind:value={project.description}
                rows="1"
                class="w-full resize-none overflow-y-auto bg-transparent text-lg text-gray-300 placeholder-gray-500 outline-none"
                placeholder="Message Lexi"
                on:input={autoResize}></textarea>

              <!-- Boutons en bas -->
              <div class="mt-2 flex items-center justify-between">
                <!-- Boutons à gauche -->
                <div class="flex space-x-2">
                  <button
                    class="flex items-center rounded-full bg-gray-600 px-3 py-1 text-gray-300 hover:bg-gray-500">
                    <i class="pi pi-brain mr-2"></i> Reformuler
                  </button>
                  <button
                    class="flex items-center rounded-full bg-blue-600 px-3 py-1 text-white hover:bg-blue-500">
                    <i class="pi pi-globe mr-2"></i> Corriger
                  </button>
                </div>

                <!-- Icônes à droite -->
                <div class="flex items-center space-x-3">
                  <i class="pi pi-paperclip cursor-pointer text-xl text-gray-400"></i>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500 text-gray-300 hover:bg-gray-400">
                    <i class="pi pi-arrow-up"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Resizable.Pane>
      <Resizable.Handle class="mr-1 opacity-0" />
      <Resizable.Pane minSize={15} class="relative flex h-full flex-1 flex-col overflow-hidden">
        <View {panZoomState} shouldShowGrid={$stateStore.grid} />
        <div class="absolute right-0 top-0"><PanZoomToolbar {panZoomState} /></div>
        <div class="absolute bottom-0 right-0"><VersionSecurityToolbar /></div>
        <div class="absolute bottom-0 left-5"><SyncRoughToolbar /></div>
        <div class="rounded bg-primary p-2 text-center shadow md:hidden">
          Code editing not supported on mobile. Please use a desktop browser.
        </div>
      </Resizable.Pane>
      {#if isHistoryOpen}
        <Resizable.Handle class="ml-1 hidden opacity-0 md:block" />
        <Resizable.Pane
          minSize={15}
          defaultSize={30}
          class="hidden h-full flex-grow flex-col md:flex">
          <History />
        </Resizable.Pane>
      {/if}
    </Resizable.PaneGroup>
  </div>
</div>
