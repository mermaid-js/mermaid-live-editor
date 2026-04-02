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

  let currentActionMedium = $state<EnhancedEditAction['medium'] | undefined>(undefined);
  let previousDiagramType = $state<string | undefined>(undefined);

  const availableActions = $derived.by<EnhancedEditAction[]>(() => {
    if (!$stateStore.diagramType) {
      return [];
    }

    const actions: EnhancedEditAction[] = [
      { campaign: 'ai_1', label: 'with AI', medium: 'ai_edit', source: 'aiEdit' },
      { campaign: 'voice_1', label: 'with Voice', medium: 'voice_edit', source: 'voiceEdit' }
    ];

    if (showVisualEdit) {
      actions.unshift({
        campaign: 'visual_1',
        label: 'Visually',
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

    return actions.find(({ medium }) => medium === currentActionMedium) ?? actions[0];
  });

  $effect(() => {
    const actions = availableActions;

    if (!diagramType || actions.length === 0) {
      return;
    }

    const hasCurrentAction = actions.some(({ medium }) => medium === currentActionMedium);

    if (diagramType !== previousDiagramType || !hasCurrentAction) {
      currentActionMedium = actions[Math.floor(Math.random() * actions.length)].medium;
      previousDiagramType = diagramType;
    }
  });

  $effect(() => {
    if (diagramType) {
      return;
    }

    previousDiagramType = undefined;
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
