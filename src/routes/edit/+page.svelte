<script lang="ts">
  import History from '$/components/History/History.svelte';
  import PanZoomToolbar from '$/components/PanZoomToolbar.svelte';
  import SyncRoughToolbar from '$/components/SyncRoughToolbar.svelte';
  import { Button } from '$/components/ui/button';
  import * as Resizable from '$/components/ui/resizable';
  import { Toggle } from '$/components/ui/toggle';
  import VersionSecurityToolbar from '$/components/VersionSecurityToolbar.svelte';
  import { env } from '$/util/env';
  import { PanZoomState } from '$/util/panZoom';
  import Actions from '$lib/components/Actions.svelte';
  import Card from '$lib/components/Card/Card.svelte';
  import Editor from '$lib/components/Editor.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Preset from '$lib/components/Preset.svelte';
  import View from '$lib/components/View.svelte';
  import type { DocumentationConfig, EditorMode, Tab, ValidatedState } from '$lib/types';
  import { stateStore, updateCodeStore } from '$lib/util/state';
  import { initHandler, MCBaseURL } from '$lib/util/util';
  import { onMount } from 'svelte';
  import BookIcon from '~icons/material-symbols/book-2-outline-rounded';
  import CodeIcon from '~icons/material-symbols/code-blocks-outline';
  import HistoryIcon from '~icons/material-symbols/history';
  import GearIcon from '~icons/material-symbols/settings-outline-rounded';

  const panZoomState = new PanZoomState();
  const docURLBase = 'https://mermaid.js.org';
  const docMap: DocumentationConfig = {
    graph: {
      code: '/syntax/.html',
      config: '/syntax/.html#configuration'
    },
    flowchart: {
      code: '/syntax/flowchart.html',
      config: '/syntax/flowchart.html#configuration'
    },
    sequenceDiagram: {
      code: '/syntax/sequenceDiagram.html',
      config: '/syntax/sequenceDiagram.html#configuration'
    },
    classDiagram: {
      code: '/syntax/classDiagram.html',
      config: '/syntax/classDiagram.html#configuration'
    },
    'stateDiagram-v2': {
      code: '/syntax/stateDiagram.html'
    },
    gantt: {
      code: '/syntax/gantt.html',
      config: '/syntax/gantt.html#configuration'
    },
    pie: {
      code: '/syntax/pie.html',
      config: '/syntax/pie.html#configuration'
    },
    erDiagram: {
      code: '/syntax/entityRelationshipDiagram.html',
      config: '/syntax/entityRelationshipDiagram.html#styling'
    },
    journey: {
      code: '/syntax/userJourney.html'
    },
    gitGraph: {
      code: '/syntax/gitgraph.html',
      config: '/syntax/gitgraph.html#gitgraph-specific-configuration-options'
    },
    quadrantChart: {
      code: '/syntax/quadrantChart.html',
      config: '/syntax/quadrantChart.html#chart-configurations'
    },
    requirementDiagram: {
      code: '/syntax/requirementDiagram.html'
    },
    C4Context: {
      code: '/syntax/c4.html'
    },
    mindmap: {
      code: '/syntax/mindmap.html'
    },
    timeline: {
      code: '/syntax/timeline.html',
      config: '/syntax/timeline.html#themes'
    },
    zenuml: {
      code: '/syntax/zenuml.html'
    },
    'sankey-beta': {
      code: '/syntax/sankey.html',
      config: '/syntax/sankey.html#configuration'
    },
    'xychart-beta': {
      code: '/syntax/xyChart.html',
      config: '/syntax/xyChart.html#chart-configurations'
    }
  };
  let docURL = $state(docURLBase);
  let activeTabID = $state('code');
  let docKey = $state('');
  stateStore.subscribe(({ code, editorMode }: ValidatedState) => {
    activeTabID = editorMode;
    const codeTypeMatch = /(\S+)\s/.exec(code);
    if (codeTypeMatch && codeTypeMatch.length > 1) {
      docKey = codeTypeMatch[1];
      const docConfig = docMap[docKey] ?? { code: '' };
      docURL = docURLBase + (docConfig[editorMode] ?? docConfig.code ?? '');
    }
  });

  const tabSelectHandler = (tab: Tab) => {
    const editorMode: EditorMode = tab.id === 'code' ? 'code' : 'config';
    updateCodeStore({ editorMode });
  };

  const editorTabs: Tab[] = [
    {
      id: 'code',
      title: 'Code',
      icon: CodeIcon
    },
    {
      id: 'config',
      title: 'Config',
      icon: GearIcon
    }
  ];

  onMount(async () => {
    await initHandler();
  });

  let isHistoryOpen = $state(false);
</script>

<div class="flex h-full flex-col overflow-hidden">
  <Navbar>
    <Toggle bind:pressed={isHistoryOpen} size="sm">
      <HistoryIcon />
    </Toggle>
    <Button size="sm" class="cursor-not-allowed">Share</Button>
    {#if env.isEnabledMermaidChartLinks}
      <Button
        variant="accent"
        size="sm"
        href={`${MCBaseURL}/app/plugin/save?state=${$stateStore.serialized}`}
        target="_blank">
        <img class="size-4" src="./mermaidchart-logo.svg" alt="Mermaid Chart" />
        Save diagram
      </Button>
    {/if}
  </Navbar>
  <div class="flex flex-1 overflow-hidden">
    <Resizable.PaneGroup direction="horizontal" autoSaveId="liveEditor" class="p-6 pt-0">
      <Resizable.Pane defaultSize={40} minSize={15} class="hidden md:block">
        <div class="flex h-full flex-col gap-6" id="editorPane">
          <Card
            onselect={tabSelectHandler}
            isOpen
            tabs={editorTabs}
            {activeTabID}
            isClosable={false}>
            {#snippet actions()}
              <div class="flex flex-row items-center">
                <Button
                  variant="ghost"
                  href={docURL}
                  title="View documentation for {docKey.replace('Diagram', '')} diagram">
                  <BookIcon class="mr-1" />
                  Docs
                </Button>
              </div>
            {/snippet}

            <Editor />
          </Card>

          <div class="group flex flex-wrap justify-between gap-6">
            <Preset />
            <!-- <History /> -->
            <Actions />
          </div>
        </div>
      </Resizable.Pane>
      <Resizable.Handle class="mr-1 opacity-0" />
      <Resizable.Pane>
        <div class="relative flex h-full flex-1 flex-col overflow-hidden">
          <Resizable.PaneGroup direction="horizontal" autoSaveId="viewAndHistory" class="">
            <Resizable.Pane minSize={15} class="relative">
              <View {panZoomState} />
              <div class="absolute right-0 top-0"><PanZoomToolbar {panZoomState} /></div>
              <div class="absolute bottom-0 right-0"><VersionSecurityToolbar /></div>
              <div class="absolute bottom-0 left-5"><SyncRoughToolbar /></div>
            </Resizable.Pane>
            {#if isHistoryOpen}
              <Resizable.Handle class="ml-2 hidden opacity-0 md:block" />
              <Resizable.Pane minSize={25} defaultSize={40} class="hidden md:block">
                <div class="flex h-full flex-grow flex-col">
                  <History />
                </div>
              </Resizable.Pane>
            {/if}
          </Resizable.PaneGroup>

          <div class="rounded bg-primary p-2 text-center shadow md:hidden">
            Code editing not supported on mobile. Please use a desktop browser.
          </div>
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </div>
</div>
