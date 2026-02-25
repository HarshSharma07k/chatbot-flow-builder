/**
 * nodeRegistry.ts
 *
 * Central registry that maps node type strings → metadata + React components.
 *
 * HOW TO ADD A NEW NODE TYPE:
 *   1. Create your component (e.g. src/components/flow/ImageNode.tsx).
 *   2. Create a NodeRegistryEntry for it.
 *   3. Call `registerNode(entry)` from that file or your app's entry point.
 *   4. That's it — the new type will appear in the NodesPanel automatically.
 *
 * No other files need to be touched. This is the extensibility contract.
 */

import type { ComponentType } from 'react';
import type { NodeProps } from 'reactflow';
import type { NodeData, NodeRegistryEntry } from '../types/flow.types';

// ---------------------------------------------------------------------------
// Internal registry maps
// ---------------------------------------------------------------------------

/**
 * Stores metadata (label, icon, defaultData, etc.) keyed by node type string.
 * Used by the NodesPanel to render draggable tiles.
 */
const metaRegistry = new Map<string, NodeRegistryEntry>();

/**
 * Stores the React component for each node type.
 * Passed directly to React Flow's `nodeTypes` prop.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentRegistry = new Map<string, ComponentType<NodeProps<any>>>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Registers a new node type.
 *
 * @param entry  Metadata describing the node (type, label, icon, defaultData).
 * @param component  The React component React Flow will render for this type.
 */
export function registerNode<D extends NodeData>(
  entry: NodeRegistryEntry<D>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<NodeProps<any>>
): void {
  if (metaRegistry.has(entry.type)) {
    console.warn(`[NodeRegistry] Node type "${entry.type}" is already registered. Overwriting.`);
  }
  metaRegistry.set(entry.type, entry as NodeRegistryEntry);
  componentRegistry.set(entry.type, component);
}

/**
 * Returns all registered node metadata entries.
 * The NodesPanel iterates this to build its list of draggable items.
 */
export function getAllNodeMeta(): NodeRegistryEntry[] {
  return Array.from(metaRegistry.values());
}

/**
 * Returns the nodeTypes object required by React Flow.
 * Format: { [type: string]: ComponentType<NodeProps> }
 */
export function getReactFlowNodeTypes(): Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ComponentType<NodeProps<any>>
> {
  return Object.fromEntries(componentRegistry.entries());
}

/**
 * Returns the NodeRegistryEntry for a given type, or undefined.
 */
export function getNodeMeta(type: string): NodeRegistryEntry | undefined {
  return metaRegistry.get(type);
}
