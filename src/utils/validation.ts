/**
 * validation.ts
 *
 * Pure validation functions — no React, no side-effects.
 * Business rules live here; UI components just call these and react to results.
 */

import type { FlowNode, FlowEdge, ValidationResult } from '../types/flow.types';

// ---------------------------------------------------------------------------
// Save-flow validation
// ---------------------------------------------------------------------------

/**
 * Rule: If more than one node exists, every node (except at most one)
 * must have at least one incoming edge (i.e. a connected target handle).
 *
 * In other words: at most ONE "orphan" (no incoming edges) is allowed when
 * there are multiple nodes — that orphan is the entry/start node.
 *
 * @returns ValidationResult with a user-facing error string on failure.
 */
export function validateFlow(
  nodes: FlowNode[],
  edges: FlowEdge[]
): ValidationResult {
  // Single node — always valid (it's the only node, trivially connected).
  if (nodes.length <= 1) {
    return { valid: true };
  }

  // Build a Set of node IDs that have at least one INCOMING edge.
  const nodesWithIncomingEdge = new Set(edges.map((e) => e.target));

  // Count nodes with NO incoming edges (potential dangling / orphan nodes).
  const orphanCount = nodes.filter(
    (n) => !nodesWithIncomingEdge.has(n.id)
  ).length;

  /**
   * We allow exactly 1 orphan (the start node).
   * If more than 1 node has no incoming edge, the flow is considered invalid
   * because there's no clear single entry point and some nodes are unreachable.
   */
  if (orphanCount > 1) {
    return {
      valid: false,
      error: 'Cannot save Flow',
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Edge creation validation
// ---------------------------------------------------------------------------

/**
 * Checks whether adding a new edge would violate the
 * "one outgoing edge per source handle" rule.
 *
 * @param edges   Existing edges in the canvas.
 * @param source  Source node ID of the proposed edge.
 * @param sourceHandle  Handle ID on the source node.
 * @returns true if the edge is allowed to be created.
 */
export function canAddEdge(
  edges: FlowEdge[],
  source: string,
  sourceHandle: string | null
): boolean {
  // If any existing edge already uses the same source + sourceHandle, block it.
  return !edges.some(
    (e) => e.source === source && e.sourceHandle === sourceHandle
  );
}
