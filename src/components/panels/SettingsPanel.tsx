/**
 * SettingsPanel.tsx
 *
 * Appears in the right sidebar when a node is selected.
 * Replaces the NodesPanel while a node is active.
 *
 * Currently handles: Text Message node settings.
 *
 * Extensibility note:
 *  To support custom settings UI per node type, replace the hardcoded
 *  `<TextMessageSettings>` with a registry lookup:
 *    const SettingsComponent = getSettingsComponent(selectedNode.type);
 *  This follows the same pattern as the NodeRegistry for components.
 */

import type { ChangeEvent } from 'react';
import { useFlowStore, useSelectedNode } from '../../store/flowStore';

// ---------------------------------------------------------------------------
// Text Message Settings sub-panel
// ---------------------------------------------------------------------------

function TextMessageSettings() {
  const selectedNode = useSelectedNode();
  const { updateNodeText, setSelectedNode } = useFlowStore();

  if (!selectedNode) return null;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeText(selectedNode.id, e.target.value);
  };

  const handleBack = () => {
    // Deselect node → panel reverts to NodesPanel
    setSelectedNode(undefined);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Back to nodes panel"
        >
          {/* Left arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Message
        </h2>
      </div>

      {/* Settings fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Text input field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="node-message"
            className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            Text
          </label>
          <textarea
            id="node-message"
            rows={4}
            value={(selectedNode.data as { message: string }).message}
            onChange={handleChange}
            placeholder="Type your message here…"
            className={[
              'w-full resize-none rounded-lg border border-gray-300',
              'px-3 py-2 text-sm text-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent',
              'placeholder:text-gray-400 transition',
            ].join(' ')}
          />
        </div>

        {/* Node ID (read-only, helpful for debugging) */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Node ID
          </span>
          <span className="text-[11px] text-gray-400 font-mono break-all">
            {selectedNode.id}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SettingsPanel — dispatches to the right settings sub-panel based on node type
// ---------------------------------------------------------------------------

export function SettingsPanel() {
  const selectedNode = useSelectedNode();

  // Guard: should not render if no node is selected (App handles this)
  if (!selectedNode) return null;

  /**
   * Future extensibility point:
   *   const SettingsComponent = settingsRegistry.get(selectedNode.type) ?? DefaultSettings;
   *   return <SettingsComponent node={selectedNode} />;
   */
  return (
    <aside className="w-56 h-full bg-gray-50 border-l border-gray-200">
      {selectedNode.type === 'textMessage' && <TextMessageSettings />}
    </aside>
  );
}

export default SettingsPanel;
