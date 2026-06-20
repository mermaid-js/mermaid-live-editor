/**
 * Controller backing the visual editor. It keeps a {@link FlowchartModel}
 * derived from the current diagram code and exposes mutation operations that
 * re-serialize the model and push it back through the normal `updateCode`
 * gateway, so the code editor, preview and visual editor never diverge.
 */
import { updateCode } from '$/util/state.svelte';
import {
  insertNodeIntoEdge,
  parseFlowchart,
  serializeFlowchart,
  setStyleProp,
  type FlowchartModel,
  type FlowNode,
  type NodeShape
} from './flowchartModel';

const ID_PATTERN = /^[A-Za-z][\w]*$/;

class VisualEditorController {
  /** Replaced wholesale on every change, so shallow reactivity is enough. */
  model = $state.raw<FlowchartModel | undefined>(undefined);
  selectedId = $state<string | undefined>(undefined);
  /** True when the current diagram cannot be visually edited (not a flowchart). */
  unsupported = $state(false);

  #lastCode = '';

  /** Re-parse the model from `code` (no-op when the code is unchanged). */
  async refresh(code: string): Promise<void> {
    if (code === this.#lastCode) {
      return;
    }
    this.#lastCode = code;
    const model = await parseFlowchart(code);
    // A newer refresh may have superseded this one while parsing.
    if (code !== this.#lastCode) {
      return;
    }
    this.model = model;
    this.unsupported = model === undefined;
    if (this.selectedId && !model?.nodes.some((n) => n.id === this.selectedId)) {
      this.selectedId = undefined;
    }
  }

  get selectedNode(): FlowNode | undefined {
    return this.model?.nodes.find((n) => n.id === this.selectedId);
  }

  get nodes(): FlowNode[] {
    return this.model?.nodes ?? [];
  }

  select(id: string | undefined): void {
    this.selectedId = id;
  }

  #commit(mutate: (model: FlowchartModel) => void): void {
    if (!this.model) {
      return;
    }
    const next = $state.snapshot(this.model) as FlowchartModel;
    mutate(next);
    const code = serializeFlowchart(next);
    // Apply locally first so the UI updates immediately and the resulting state
    // change does not trigger a redundant re-parse.
    this.#lastCode = code;
    this.model = next;
    updateCode(code, { updateDiagram: true });
  }

  #node(model: FlowchartModel, id: string): FlowNode | undefined {
    return model.nodes.find((n) => n.id === id);
  }

  setLabel(id: string, label: string): void {
    this.#commit((model) => {
      const node = this.#node(model, id);
      if (node) {
        node.label = label;
      }
    });
  }

  setShape(id: string, shape: NodeShape): void {
    this.#commit((model) => {
      const node = this.#node(model, id);
      if (node) {
        node.shape = shape;
      }
    });
  }

  setStyle(id: string, prop: string, value: string | undefined): void {
    this.#commit((model) => {
      const node = this.#node(model, id);
      if (node) {
        node.styles = setStyleProp(node.styles, prop, value);
      }
    });
  }

  /** Move a node into `subgraphId`, or to the top level when undefined. */
  moveToSubgraph(id: string, subgraphId: string | undefined): void {
    this.#commit((model) => {
      const node = this.#node(model, id);
      if (node) {
        node.subgraph = subgraphId;
      }
    });
  }

  /**
   * Reorder a node into the flow by splicing it into an existing connection,
   * rewiring the connectors so it sits between the edge's endpoints.
   */
  insertIntoEdge(id: string, edgeIndex: number): void {
    this.#commit((model) => {
      insertNodeIntoEdge(model, id, edgeIndex);
    });
  }

  setNodeClasses(id: string, classes: string[]): void {
    this.#commit((model) => {
      const node = this.#node(model, id);
      if (node) {
        node.classes = classes;
      }
    });
  }

  deleteNode(id: string): void {
    this.#commit((model) => {
      model.nodes = model.nodes.filter((n) => n.id !== id);
      model.edges = model.edges.filter((e) => e.start !== id && e.end !== id);
    });
    if (this.selectedId === id) {
      this.selectedId = undefined;
    }
  }

  #uniqueId(model: FlowchartModel, base: string): string {
    const taken = new Set([...model.nodes.map((n) => n.id), ...model.subgraphs.map((s) => s.id)]);
    let i = 1;
    while (taken.has(`${base}${i}`)) {
      i++;
    }
    return `${base}${i}`;
  }

  addNode(subgraphId?: string): void {
    let createdId = '';
    this.#commit((model) => {
      createdId = this.#uniqueId(model, 'node');
      model.nodes.push({
        classes: [],
        id: createdId,
        label: 'New node',
        labelType: 'text',
        shape: 'rect',
        styles: [],
        subgraph: subgraphId
      });
    });
    if (createdId) {
      this.selectedId = createdId;
    }
  }

  /** Connect two existing nodes with a default arrow. */
  connect(from: string, to: string): void {
    this.#commit((model) => {
      model.edges.push({
        end: to,
        label: '',
        labelType: 'text',
        length: 1,
        start: from,
        stroke: 'normal',
        type: 'arrow_point'
      });
    });
  }

  addSubgraph(): void {
    this.#commit((model) => {
      const id = this.#uniqueId(model, 'group');
      model.subgraphs.push({ id, title: 'New group' });
    });
  }

  setSubgraphTitle(id: string, title: string): void {
    this.#commit((model) => {
      const sg = model.subgraphs.find((s) => s.id === id);
      if (sg) {
        sg.title = title;
      }
    });
  }

  deleteSubgraph(id: string): void {
    this.#commit((model) => {
      model.subgraphs = model.subgraphs.filter((s) => s.id !== id);
      // Re-parent direct children and members to the removed group's parent.
      const removed = this.model?.subgraphs.find((s) => s.id === id);
      const parent = removed?.parent;
      for (const sg of model.subgraphs) {
        if (sg.parent === id) {
          sg.parent = parent;
        }
      }
      for (const node of model.nodes) {
        if (node.subgraph === id) {
          node.subgraph = parent;
        }
      }
    });
  }

  setDirection(direction: string): void {
    this.#commit((model) => {
      model.direction = direction;
    });
  }

  /** Validate a proposed node id (used by the inspector before committing). */
  isValidNewId(id: string): boolean {
    if (!ID_PATTERN.test(id)) {
      return false;
    }
    return !this.model?.nodes.some((n) => n.id === id);
  }
}

export const visualEditor = new VisualEditorController();
