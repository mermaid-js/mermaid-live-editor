<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { TID } from '$/constants';
  import type { DocumentationConfig } from '$/types';
  import { standardizeDiagramType } from '$/util/mermaid';
  import { stateStore } from '$/util/state';
  import BookIcon from '~icons/material-symbols/book-2-outline-rounded';

  const docURLBase = 'https://mermaid.js.org';
  const docMap = {
    architecture: {
      code: '/syntax/architecture.html'
    },
    block: {
      code: '/syntax/block.html'
    },
    c4: {
      code: '/syntax/c4.html'
    },
    class: {
      code: '/syntax/classDiagram.html',
      config: '/syntax/classDiagram.html#configuration'
    },
    er: {
      code: '/syntax/entityRelationshipDiagram.html',
      config: '/syntax/entityRelationshipDiagram.html#styling'
    },
    flowchart: {
      code: '/syntax/flowchart.html',
      config: '/syntax/flowchart.html#configuration'
    },
    gantt: {
      code: '/syntax/gantt.html',
      config: '/syntax/gantt.html#configuration'
    },
    gitGraph: {
      code: '/syntax/gitgraph.html',
      config: '/syntax/gitgraph.html#gitgraph-specific-configuration-options'
    },
    journey: {
      code: '/syntax/userJourney.html'
    },
    kanban: {
      code: '/syntax/kanban.html',
      config: '/syntax/kanban.html#configuration-options'
    },
    mindmap: {
      code: '/syntax/mindmap.html'
    },
    packet: {
      code: '/syntax/packet.html',
      config: '/config/schema-docs/config-defs-packet-diagram-config.html'
    },
    pie: {
      code: '/syntax/pie.html',
      config: '/syntax/pie.html#configuration'
    },
    quadrantChart: {
      code: '/syntax/quadrantChart.html',
      config: '/syntax/quadrantChart.html#chart-configurations'
    },
    requirement: {
      code: '/syntax/requirementDiagram.html'
    },
    sankey: {
      code: '/syntax/sankey.html',
      config: '/syntax/sankey.html#configuration'
    },
    sequence: {
      code: '/syntax/sequenceDiagram.html',
      config: '/syntax/sequenceDiagram.html#configuration'
    },
    stateDiagram: {
      code: '/syntax/stateDiagram.html'
    },
    timeline: {
      code: '/syntax/timeline.html',
      config: '/syntax/timeline.html#themes'
    },
    treemap: {
      code: '/syntax/treemap.html',
      config: '/syntax/treemap.html#configuration-options'
    },
    xychart: {
      code: '/syntax/xyChart.html',
      config: '/syntax/xyChart.html#chart-configurations'
    },
    zenuml: {
      code: '/syntax/zenuml.html'
    }
  } as const satisfies DocumentationConfig;

  const doc = $derived.by(() => {
    const { editorMode, diagramType } = $stateStore;
    if (!diagramType) {
      return { key: '', url: docURLBase };
    }
    const key = standardizeDiagramType(diagramType);
    const docConfig = docMap[key] ?? { code: '' };
    const url = docURLBase + (docConfig[editorMode] ?? docConfig.code ?? '');
    return { key, url };
  });
</script>

<Button
  variant="ghost"
  data-testid={TID.diagramDocumentationButton}
  href={doc.url}
  target="_blank"
  title="View documentation for {doc.key.replace('Diagram', '')} diagram">
  <BookIcon />
  Docs
</Button>
