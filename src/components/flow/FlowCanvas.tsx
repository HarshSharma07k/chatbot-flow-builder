/**
 * FlowCanvas.tsx
 *
 * The main React Flow wrapper.
 *
 * Responsibilities:
 *  - Renders the flow canvas (nodes, edges, controls, minimap, background).
 *  - Handles drag-and-drop of new nodes from the NodesPanel.
 *  - Delegates all state mutations to the Zustand store.
 *  - Passes `nodeTypes` from the NodeRegistry so React Flow knows how to
 *    render each custom node type.
 *
 * This component intentionally has NO business logic — it is purely a
 * bridge between React Flow events and the store.
 */

import { useCallback, useMemo, useRef } from 'react';
import type { DragEvent } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type ReactFlowInstance,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

import { useFlowStore } from '../../store/flowStore';
import { getReactFlowNodeTypes } from '../../app/nodeRegistry';
import { getNodeMeta } from '../../app/nodeRegistry';
import type { FlowNode } from '../../types/flow.types';

// ---------------------------------------------------------------------------
// Drag-and-drop data key
// Used to pass the node type from the NodesPanel tile to the canvas drop handler.
// ---------------------------------------------------------------------------
export const DND_NODE_TYPE_KEY = 'application/reactflow-node-type';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Inner canvas — must be a child of ReactFlowProvider to access
 * the React Flow instance via `useReactFlow()`.
 */
function FlowCanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
  } = useFlowStore();

  /** Memoised nodeTypes from registry — only recomputed once on mount. */
  const nodeTypes = useMemo(() => getReactFlowNodeTypes(), []);
//   const nodeTypes = useRef(getReactFlowNodeTypes()).current;

  /**
   * rfInstance gives us `screenToFlowPosition` to convert drop coordinates
   * from the DOM viewport into React Flow graph coordinates.
   */
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  // ── Node selection ──────────────────────────────────────────────────────

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(undefined);
  }, [setSelectedNode]);

  // ── Drag-over: allow drop ───────────────────────────────────────────────

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // ── Drop: create a new node ─────────────────────────────────────────────

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (!rfInstanceRef.current) return;

      const nodeType = e.dataTransfer.getData(DND_NODE_TYPE_KEY);
      if (!nodeType) return;

      const meta = getNodeMeta(nodeType);
      if (!meta) {
        console.error(`[FlowCanvas] Unknown node type dropped: "${nodeType}"`);
        return;
      }

      // Convert screen coordinates → React Flow canvas coordinates
      const position = rfInstanceRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const newNode: FlowNode = {
        id: uuidv4(),
        type: nodeType,
        position,
        data: { ...meta.defaultData },
      };

      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div className="flex-1 h-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onInit={(instance) => { rfInstanceRef.current = instance; }}
        fitView
        deleteKeyCode="Delete"
        className="bg-gray-50"
      >
        {/* Grid background pattern */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#d1d5db"
        />

        {/* Zoom + fit controls (bottom-left) */}
        <Controls className="shadow-md" />

        {/* Overview minimap (bottom-right) */}
        <MiniMap
          nodeColor="#6366f1"
          maskColor="rgba(243,244,246,0.7)"
          className="shadow-md border! border-gray-200! rounded-lg overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public export — wrapped in ReactFlowProvider
// ---------------------------------------------------------------------------

/**
 * Always wrap the inner canvas in ReactFlowProvider.
 * This gives the canvas access to the internal React Flow context
 * (required for `useReactFlow`, `screenToFlowPosition`, etc.).
 */
export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}

export default FlowCanvas;
