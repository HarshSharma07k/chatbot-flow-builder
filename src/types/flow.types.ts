/**
 * flow.types.ts
 *
 * Central type definitions for the entire Chatbot Flow Builder.
 * Extending React Flow's built-in types keeps us compatible with
 * the library while adding our own domain-specific fields.
 */

import type { Node, Edge } from 'reactflow';

// ---------------------------------------------------------------------------
// Node Data Models
// ---------------------------------------------------------------------------

/** Data payload carried by every Text Message node. */
export interface TextNodeData {
  /** The chatbot message displayed inside the node. */
  message: string;
}

/**
 * Discriminated union for node data.
 * Add new variants here as the product grows (e.g. ImageNodeData, ApiCallNodeData).
 */
export type NodeData = TextNodeData;

/**
 * Our custom node type — a React Flow Node parameterised with our NodeData.
 * The `type` field must match a key in the nodeTypes map passed to ReactFlow.
 */
export type FlowNode = Node<NodeData>;

// ---------------------------------------------------------------------------
// Edge type (plain React Flow edge — extend if custom data is needed)
// ---------------------------------------------------------------------------
export type FlowEdge = Edge;

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Metadata entry stored in the NodeRegistry.
 * `label`   — human-readable name shown in the Nodes Panel.
 * `type`    — key used in React Flow's nodeTypes map & when creating nodes.
 * `defaultData` — initial data applied when the node is dropped onto the canvas.
 */
export interface NodeRegistryEntry<D extends NodeData = NodeData> {
  type: string;
  label: string;
  description: string;
  icon: string;            // emoji / icon character for the panel tile
  defaultData: D;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/** Shape of the global Zustand flow store. */
export interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** ID of the currently selected node (undefined = nothing selected). */
  selectedNodeId?: string;

  // --- Mutators ---
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  addNode: (node: FlowNode) => void;
  updateNodeText: (nodeId: string, message: string) => void;
  setSelectedNode: (nodeId: string | undefined) => void;
  addEdge: (edge: FlowEdge) => void;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  /** Human-readable error message when valid === false. */
  error?: string;
}
