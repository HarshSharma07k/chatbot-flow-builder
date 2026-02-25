/**
 * CustomNode.tsx
 *
 * The visual representation of a Text Message node on the flow canvas.
 *
 * Architecture notes:
 *  - Receives data through React Flow's NodeProps — never reads from store directly.
 *    This keeps the component pure and reusable.
 *  - Selection styling is driven by React Flow's `selected` prop, not Zustand state,
 *    so we don't manufacture an extra re-render loop.
 *  - Source handle: only ONE outgoing edge allowed (enforced in the store).
 *  - Target handle: multiple incoming edges allowed.
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { TextNodeData } from '../../types/flow.types';
import { SOURCE_HANDLE, TARGET_HANDLE } from './handles';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CustomNodeBase({ data, selected }: NodeProps<TextNodeData>) {
  return (
    <div
      className={[
        'w-52 rounded-xl overflow-hidden shadow-lg',
        'border-2 transition-colors duration-150',
        selected
          ? 'border-indigo-500 shadow-indigo-200'
          : 'border-gray-200 shadow-gray-100',
      ].join(' ')}
    >
      {/* ── Node Header ─────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-400">
        {/* WhatsApp-style send icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <span className="text-white text-xs font-semibold tracking-wide">
          Send Message
        </span>
      </div>

      {/* ── Message Body ────────────────────────────────── */}
      <div className="bg-white px-3 py-2.5">
        <p className="text-gray-700 text-sm leading-snug wrap-break-word min-h-6">
          {data.message || (
            <span className="text-gray-400 italic text-xs">No message yet…</span>
          )}
        </p>
      </div>

      {/* ── Target Handle (top — multiple incoming allowed) ── */}
      <Handle
        type="target"
        position={Position.Left}
        id={TARGET_HANDLE}
        className="w-3! h-3! bg-gray-400! border-2! border-white!"
      />

      {/* ── Source Handle (bottom — only ONE outgoing edge allowed) ── */}
      <Handle
        type="source"
        position={Position.Right}
        id={SOURCE_HANDLE}
        className="w-3! h-3! bg-indigo-500! border-2! border-white!"
      />
    </div>
  );
}

/**
 * Wrap with memo to prevent re-renders when unrelated nodes change.
 * React Flow re-renders ALL nodes on any state change without memo.
 */
export const CustomNode = memo(CustomNodeBase);
export default CustomNode;
