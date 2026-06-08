<script lang="ts">
  import McWrapper from '$/components/McWrapper.svelte';
  import MermaidChartIcon from '$/components/MermaidChartIcon.svelte';
  import { Button } from '$/components/ui/button';
  import { standardizeDiagramType } from '$/util/mermaid';
  import { stateStore, urlsStore } from '$/util/state';
  import { logMermaidChartClick } from '$/util/stats';
  import { quintInOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';

  const visualEditDiagramTypes = new Set([
    'flowchart',
    'stateDiagram',
    'classDiagram',
    'sequenceDiagram',
    'er',
    'requirement',
    'mindmap'
  ]);

  const diagramType = $derived.by(() => {
    const dt = $stateStore.diagramType;
    return dt ? standardizeDiagramType(dt) : undefined;
  });

  const showVisualEdit = $derived.by(() => {
    return diagramType ? visualEditDiagramTypes.has(diagramType) : false;
  });

  interface EnhancedEditAction {
    campaign: string;
    label: string;
    medium: 'ai_edit' | 'visual_edit' | 'voice_edit';
    source: string;
  }

  const cycleIntervalMs = 30_000;

  let currentActionIndex = $state(0);

  const availableActions = $derived.by<EnhancedEditAction[]>(() => {
    if (!$stateStore.diagramType) {
      return [];
    }

    const actions: EnhancedEditAction[] = [
      { campaign: 'voice_1', label: 'with voice', medium: 'voice_edit', source: 'voiceEdit' },
      { campaign: 'ai_1', label: 'with AI', medium: 'ai_edit', source: 'aiEdit' }
    ];

    if (showVisualEdit) {
      actions.unshift({
        campaign: 'visual_1',
        label: 'visually',
        medium: 'visual_edit',
        source: 'visualEdit'
      });
    }

    return actions;
  });

  const currentAction = $derived.by(() => {
    const actions = availableActions;
    if (actions.length === 0) {
      return undefined;
    }

    return actions[currentActionIndex % actions.length];
  });

  $effect(() => {
    const actionCount = availableActions.length;

    if (actionCount === 0) {
      currentActionIndex = 0;
      return;
    }

    if (currentActionIndex >= actionCount) {
      currentActionIndex = 0;
    }

    if (actionCount <= 1) {
      return;
    }

    const intervalID = setInterval(() => {
      currentActionIndex = (currentActionIndex + 1) % actionCount;
    }, cycleIntervalMs);

    return () => clearInterval(intervalID);
  });
</script>

{#if currentAction}
  <McWrapper>
    <Button
      variant="secondary"
      size="sm"
      href={$urlsStore.mermaidChart({
        medium: currentAction.medium,
        campaign: currentAction.campaign
      }).save}
      target="_blank"
      onclick={() => logMermaidChartClick(currentAction.source)}>
      <MermaidChartIcon />
      Edit
      {#key currentAction.label}
        <span
          class="-ml-1"
          in:slide={{ axis: 'x', easing: quintInOut, delay: 400 }}
          out:slide={{ axis: 'x', easing: quintInOut }}>
          {currentAction.label}
        </span>
      {/key}
    </Button>
  </McWrapper>
{/if}
