<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import { getStyleProp, SHAPE_LABELS, type NodeShape } from '$/util/visualEditor/flowchartModel';
  import { visualEditor } from '$/util/visualEditor/visualEditorState.svelte';
  import { debounce } from 'lodash-es';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import DeleteIcon from '~icons/material-symbols/delete-outline-rounded';

  const node = $derived(visualEditor.selectedNode);
  const subgraphs = $derived(visualEditor.model?.subgraphs ?? []);

  const selectClass =
    'h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none';

  // Local label state so typing stays snappy and is not clobbered mid-edit.
  let label = $state('');
  let editingId = $state<string | undefined>(undefined);
  $effect(() => {
    const current = visualEditor.selectedNode;
    if (current && current.id !== editingId) {
      editingId = current.id;
      label = current.label;
    } else if (!current) {
      editingId = undefined;
    }
  });

  const commitLabel = debounce((id: string, value: string) => {
    visualEditor.setLabel(id, value);
  }, 300);

  const onLabelInput = (value: string) => {
    label = value;
    if (editingId) {
      commitLabel(editingId, value);
    }
  };

  const onLabelBlur = () => {
    if (editingId) {
      commitLabel.cancel();
      visualEditor.setLabel(editingId, label);
    }
  };

  // Expand #abc to #aabbcc for the native colour input; fall back when unparseable.
  const toHex = (value: string | undefined, fallback: string): string => {
    if (!value) {
      return fallback;
    }
    const v = value.trim();
    if (/^#[0-9a-f]{3}$/i.test(v)) {
      return '#' + [...v.slice(1)].map((c) => c + c).join('');
    }
    return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
  };

  interface ColorField {
    prop: string;
    title: string;
    fallback: string;
  }
  const colorFields: ColorField[] = [
    { prop: 'fill', title: 'Fill', fallback: '#ffffff' },
    { prop: 'stroke', title: 'Border', fallback: '#333333' },
    { prop: 'color', title: 'Text', fallback: '#000000' }
  ];

  const borderWidth = $derived.by(() => {
    const raw = node ? getStyleProp(node.styles, 'stroke-width') : undefined;
    return raw ? raw.replace('px', '') : '';
  });
</script>

{#if node}
  <div
    class="flex w-72 flex-col gap-3 rounded-2xl border-2 border-muted bg-background p-4 shadow-lg">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold">Node</span>
        <span class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
          >{node.id}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        class="size-7"
        title="Close"
        onclick={() => visualEditor.select(undefined)}>
        <CloseIcon />
      </Button>
    </div>

    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      Label
      <Input
        value={label}
        oninput={(e) => onLabelInput(e.currentTarget.value)}
        onblur={onLabelBlur}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }} />
    </label>

    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      Shape
      <select
        class={selectClass}
        value={node.shape}
        onchange={(e) => visualEditor.setShape(node.id, e.currentTarget.value as NodeShape)}>
        {#each SHAPE_LABELS as option (option.value)}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </label>

    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      Subgraph
      <select
        class={selectClass}
        value={node.subgraph ?? ''}
        onchange={(e) => visualEditor.moveToSubgraph(node.id, e.currentTarget.value || undefined)}>
        <option value="">— Top level —</option>
        {#each subgraphs as sg (sg.id)}
          <option value={sg.id}>{sg.title || sg.id}</option>
        {/each}
      </select>
    </label>

    <div class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      Colors
      <div class="flex gap-2">
        {#each colorFields as field (field.prop)}
          {@const value = getStyleProp(node.styles, field.prop)}
          <div class="flex flex-1 flex-col items-center gap-1">
            <input
              type="color"
              title={field.title}
              class="h-8 w-full cursor-pointer rounded-md border border-input bg-transparent"
              value={toHex(value, field.fallback)}
              onchange={(e) => visualEditor.setStyle(node.id, field.prop, e.currentTarget.value)} />
            <div class="flex items-center gap-1">
              <span>{field.title}</span>
              {#if value}
                <button
                  class="text-muted-foreground hover:text-foreground"
                  title="Clear {field.title.toLowerCase()}"
                  aria-label="Clear {field.title.toLowerCase()}"
                  onclick={() => visualEditor.setStyle(node.id, field.prop, undefined)}>
                  <CloseIcon class="size-3" />
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <label class="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      Border width
      <Input
        type="number"
        min="0"
        max="20"
        step="1"
        value={borderWidth}
        oninput={(e) => {
          const v = e.currentTarget.value;
          visualEditor.setStyle(node.id, 'stroke-width', v ? `${v}px` : undefined);
        }} />
    </label>

    <Button
      variant="destructive"
      size="sm"
      class="mt-1"
      onclick={() => visualEditor.deleteNode(node.id)}>
      <DeleteIcon />
      Delete node
    </Button>
  </div>
{/if}
