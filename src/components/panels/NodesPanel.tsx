/**
 * NodesPanel.tsx
 *
 * Sidebar panel showing all registered node types as draggable tiles.
 *
 * Architecture:
 *  - Dynamically reads node metadata from the NodeRegistry.
 *  - Adding a new node type to the registry AUTOMATICALLY adds it here —
 *    no code changes needed in this file.
 *  - Sets the `DND_NODE_TYPE_KEY` data attribute on drag start so the
 *    FlowCanvas drop handler knows which type to create.
 */

import type { DragEvent } from 'react';
import { getAllNodeMeta } from '../../app/nodeRegistry';
import { DND_NODE_TYPE_KEY } from '../flow/FlowCanvas';
import type { NodeRegistryEntry } from '../../types/flow.types';

// ---------------------------------------------------------------------------
// Sub-component: individual draggable tile
// ---------------------------------------------------------------------------

interface NodeTileProps {
  entry: NodeRegistryEntry;
}

function NodeTile({ entry }: NodeTileProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    // Encode node type into the drag payload
    e.dataTransfer.setData(DND_NODE_TYPE_KEY, entry.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={[
        'flex flex-col items-center justify-center gap-1.5',
        'p-3 rounded-xl border-2 border-indigo-200 bg-white',
        'cursor-grab active:cursor-grabbing',
        'hover:border-indigo-400 hover:shadow-md',
        'transition-all duration-150 select-none',
        'w-full',
      ].join(' ')}
      title={`Drag to add: ${entry.label}`}
    >
      <span className="text-2xl" role="img" aria-label={entry.label}>
        {entry.icon}
      </span>
      <span className="text-xs font-semibold text-gray-700">{entry.label}</span>
      <span className="text-[10px] text-gray-400 text-center leading-tight">
        {entry.description}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function NodesPanel() {
  // Pull all registered node metadata from the registry (reactive to new registrations).
  const nodeMetas = getAllNodeMeta();

  return (
    <aside className="w-56 h-full bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Nodes
        </h2>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Drag a node onto the canvas
        </p>
      </div>

      {/* Node tiles */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {nodeMetas.map((entry) => (
          <NodeTile key={entry.type} entry={entry} />
        ))}
      </div>
    </aside>
  );
}

export default NodesPanel;
