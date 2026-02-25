/**
 * flowStore.ts
 *
 * Global state for the Chatbot Flow Builder, implemented with Zustand.
 *
 * Design decisions:
 *  - All business logic (edge validation, node mutation) lives HERE, not in components.
 *  - Components call store actions; they never build state transitions themselves.
 *  - `applyNodeChanges` / `applyEdgeChanges` from React Flow are used for
 *    drag, resize, and selection mutations — they are the idiomatic way to
 *    handle those low-level changes without reimplementing React Flow internals.
 */

import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type {
  NodeChange,
  EdgeChange,
  Connection,
//   Edge as RFEdge,
} from 'reactflow';
import type { FlowState, FlowNode, FlowEdge } from '../types/flow.types';
import { canAddEdge } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useFlowStore = create<
  FlowState & {
    /** React Flow callback: handles drag, select, remove, etc. for nodes. */
    onNodesChange: (changes: NodeChange[]) => void;
    /** React Flow callback: handles select, remove, etc. for edges. */
    onEdgesChange: (changes: EdgeChange[]) => void;
    /**
     * React Flow `onConnect` handler.
     * Validates the one-outgoing-edge rule before adding the edge.
     */
    onConnect: (connection: Connection) => void;
  }
>((set, get) => ({
  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------
  nodes: [],
  edges: [],
  selectedNodeId: undefined,

  // -------------------------------------------------------------------------
  // Low-level setters (used by FlowCanvas for controlled React Flow state)
  // -------------------------------------------------------------------------
  setNodes: (nodes: FlowNode[]) => set({ nodes }),
  setEdges: (edges: FlowEdge[]) => set({ edges }),

  // -------------------------------------------------------------------------
  // React Flow change handlers
  // -------------------------------------------------------------------------

  onNodesChange: (changes: NodeChange[]) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as FlowNode[],
    })),

  onEdgesChange: (changes: EdgeChange[]) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges) as FlowEdge[],
    })),

  onConnect: (connection: Connection) => {
    const { edges, addEdge } = get();

    // Guard: ensure source exists (Connection may have nulls)
    if (!connection.source) return;

    // Validate the single-outgoing-edge rule
    if (!canAddEdge(edges, connection.source, connection.sourceHandle ?? null)) {
      console.warn(
        '[FlowStore] Blocked: source handle already has an outgoing edge.'
      );
      return;
    }

    const newEdge: FlowEdge = {
      id: uuidv4(),
      source: connection.source,
      target: connection.target ?? '',
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
      // Optional: style edges for better visibility
      style: { stroke: '#6366f1', strokeWidth: 2 },
      animated: false,
    };

    addEdge(newEdge);
  },

  // -------------------------------------------------------------------------
  // Domain actions
  // -------------------------------------------------------------------------

  addNode: (node: FlowNode) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  updateNodeText: (nodeId: string, message: string) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, message } }
          : n
      ),
    })),

  setSelectedNode: (nodeId: string | undefined) =>
    set({ selectedNodeId: nodeId }),

  addEdge: (edge: FlowEdge) =>
    set((state) => ({ edges: [...state.edges, edge] })),
}));

// ---------------------------------------------------------------------------
// Convenience selector hooks
// ---------------------------------------------------------------------------

/** Returns the currently selected node object (or undefined). */
export const useSelectedNode = (): FlowNode | undefined => {
  const nodes = useFlowStore((s) => s.nodes);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  return nodes.find((n) => n.id === selectedNodeId);
};

/** Returns edge actions only (avoids re-renders from unrelated state slices). */
export const useEdgeActions = () =>
  useFlowStore((s) => ({
    onConnect: s.onConnect,
    onEdgesChange: s.onEdgesChange,
  }));
