/**
 * Everything the app knows about individual diagram types, keyed by the id
 * mermaid's detector returns from `mermaid.parse(code).diagramType`.
 *
 * Kept free of mermaid runtime imports so it stays cheap to import and test.
 */

export interface DiagramDocs {
  code: string;
  config?: string;
}

export interface DiagramInfo {
  /** Canonical id: the detector id, with variants (e.g. `flowchart-v2`) folded together. */
  id: string;
  /** Paths relative to the docs base URL. Absent when there is no docs page. */
  docs?: DiagramDocs;
  /** Whether Mermaid Chart can edit this diagram type visually. */
  visualEdit: boolean;
  /** Whether external renderers and editors (mermaid.ink, Kroki, Mermaid Chart) support it. */
  externalServices: boolean;
}

type DiagramTraits = Partial<Omit<DiagramInfo, 'id'>>;

const aliases: Record<string, string> = {
  classDiagram: 'class',
  'flowchart-elk': 'flowchart',
  'flowchart-v2': 'flowchart',
  graph: 'flowchart'
};

const catalog: Record<string, DiagramTraits> = {
  agentflow: {
    docs: { code: '/syntax/agentflow.html', config: '/syntax/agentflow.html#configuration' }
  },
  architecture: {
    docs: { code: '/syntax/architecture.html' }
  },
  block: {
    docs: { code: '/syntax/block.html' }
  },
  c4: {
    docs: { code: '/syntax/c4.html' }
  },
  class: {
    docs: { code: '/syntax/classDiagram.html', config: '/syntax/classDiagram.html#configuration' },
    visualEdit: true
  },
  cynefin: {
    docs: { code: '/syntax/cynefin.html', config: '/syntax/cynefin.html#configuration' }
  },
  er: {
    docs: {
      code: '/syntax/entityRelationshipDiagram.html',
      config: '/syntax/entityRelationshipDiagram.html#styling'
    },
    visualEdit: true
  },
  eventmodeling: {
    docs: { code: '/syntax/eventmodeling.html' }
  },
  flowchart: {
    docs: { code: '/syntax/flowchart.html', config: '/syntax/flowchart.html#configuration' },
    visualEdit: true
  },
  gantt: {
    docs: { code: '/syntax/gantt.html', config: '/syntax/gantt.html#configuration' }
  },
  gitGraph: {
    docs: {
      code: '/syntax/gitgraph.html',
      config: '/syntax/gitgraph.html#gitgraph-specific-configuration-options'
    }
  },
  ishikawa: {
    docs: { code: '/syntax/ishikawa.html' }
  },
  journey: {
    docs: { code: '/syntax/userJourney.html' }
  },
  kanban: {
    docs: { code: '/syntax/kanban.html', config: '/syntax/kanban.html#configuration-options' }
  },
  mindmap: {
    docs: { code: '/syntax/mindmap.html' },
    visualEdit: true
  },
  packet: {
    docs: {
      code: '/syntax/packet.html',
      config: '/config/schema-docs/config-defs-packet-diagram-config.html'
    }
  },
  pie: {
    docs: { code: '/syntax/pie.html', config: '/syntax/pie.html#configuration' }
  },
  quadrantChart: {
    docs: {
      code: '/syntax/quadrantChart.html',
      config: '/syntax/quadrantChart.html#chart-configurations'
    }
  },
  radar: {
    docs: { code: '/syntax/radar.html', config: '/syntax/radar.html#configuration' }
  },
  railroad: {
    docs: { code: '/syntax/railroad.html#ir-primitives-railroad-beta' }
  },
  railroadAbnf: {
    docs: { code: '/syntax/railroad.html#abnf-railroad-abnf-beta' }
  },
  railroadEbnf: {
    docs: { code: '/syntax/railroad.html#ebnf-railroad-ebnf-beta' }
  },
  railroadPeg: {
    docs: { code: '/syntax/railroad.html#peg-railroad-peg-beta' }
  },
  requirement: {
    docs: { code: '/syntax/requirementDiagram.html' },
    visualEdit: true
  },
  sankey: {
    docs: { code: '/syntax/sankey.html', config: '/syntax/sankey.html#configuration' }
  },
  sequence: {
    docs: {
      code: '/syntax/sequenceDiagram.html',
      config: '/syntax/sequenceDiagram.html#configuration'
    },
    visualEdit: true
  },
  stateDiagram: {
    docs: { code: '/syntax/stateDiagram.html' },
    visualEdit: true
  },
  swimlane: {
    docs: { code: '/syntax/swimlanes.html' }
  },
  timeline: {
    docs: { code: '/syntax/timeline.html', config: '/syntax/timeline.html#themes' }
  },
  treeView: {
    docs: { code: '/syntax/treeView.html', config: '/syntax/treeView.html#config-variables' }
  },
  treemap: {
    docs: { code: '/syntax/treemap.html', config: '/syntax/treemap.html#configuration-options' }
  },
  usecase: {
    docs: { code: '/syntax/usecase.html', config: '/syntax/usecase.html#configuration' }
  },
  venn: {
    docs: { code: '/syntax/venn.html' }
  },
  wardley: {
    docs: { code: '/syntax/wardley.html', config: '/syntax/wardley.html#configuration' }
  },
  xychart: {
    docs: { code: '/syntax/xyChart.html', config: '/syntax/xyChart.html#chart-configurations' }
  },
  zenuml: {
    docs: { code: '/syntax/zenuml.html' },
    externalServices: false
  }
};

export const describeDiagram = (detectedType: string | undefined): DiagramInfo | undefined => {
  if (!detectedType) {
    return undefined;
  }
  const id = aliases[detectedType] ?? detectedType;
  const { docs, externalServices = true, visualEdit = false } = catalog[id] ?? {};
  return { id, ...(docs && { docs }), externalServices, visualEdit };
};
