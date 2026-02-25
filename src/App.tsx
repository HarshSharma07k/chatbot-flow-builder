/**
 * App.tsx
 *
 * Root application shell for the Chatbot Flow Builder.
 *
 * Layout:
 *   ┌───────────────────────────────────────────┐
 *   │            Top Header / Nav bar           │
 *   ├──────────────────────────┬────────────────┤
 *   │                          │  NodesPanel    │
 *   │      Flow Canvas         │   — or —       │
 *   │                          │ SettingsPanel  │
 *   └──────────────────────────┴────────────────┘
 *
 * Panel switching rule:
 *   selectedNodeId === undefined  →  NodesPanel
 *   selectedNodeId !== undefined  →  SettingsPanel
 */

import { useState, useCallback } from 'react';
import { FlowCanvas } from './components/flow/FlowCanvas';
import { NodesPanel } from './components/panels/NodesPanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { useFlowStore } from './store/flowStore';
import { validateFlow } from './utils/validation';

// ---------------------------------------------------------------------------
// Save button & toast notification
// ---------------------------------------------------------------------------

type ToastState = { type: 'success' | 'error'; message: string } | null;

function App() {
  const { nodes, edges, selectedNodeId } = useFlowStore();
  const [toast, setToast] = useState<ToastState>(null);

  /** Show a non-blocking toast for 3 seconds then auto-dismiss. */
  const showToast = useCallback((toast: NonNullable<ToastState>) => {
    setToast(toast);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSave = useCallback(() => {
    const result = validateFlow(nodes, edges);

    if (!result.valid) {
      showToast({ type: 'error', message: result.error ?? 'Cannot save Flow' });
      return;
    }

    // Serialise and log the flow JSON
    const flow = { nodes, edges };
    console.log('[FlowBuilder] Saved flow JSON:', JSON.stringify(flow, null, 2));
    showToast({ type: 'success', message: 'Flow saved successfully!' });
  }, [nodes, edges, showToast]);

  // Panel to show: SettingsPanel when a node is selected, else NodesPanel
  const showSettings = selectedNodeId !== undefined;

  return (
    <div className="flex flex-col w-full h-full">
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-gray-200 shadow-sm z-10">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <span className="font-bold text-gray-800 text-base tracking-tight">
            Chatbot Flow Builder
          </span>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className={[
            'px-4 py-1.5 rounded-lg text-sm font-semibold',
            'border-2 border-indigo-500 text-indigo-600',
            'hover:bg-indigo-50 active:bg-indigo-100',
            'transition-colors duration-150',
          ].join(' ')}
        >
          Save Changes
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <FlowCanvas />

        {/* Right Sidebar — switches between Nodes and Settings panels */}
        {showSettings ? <SettingsPanel /> : <NodesPanel />}
      </div>

      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div
          role="alert"
          className={[
            'fixed top-14 right-4 z-50',
            'px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium',
            'transition-all duration-200',
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white',
          ].join(' ')}
        >
          {toast.type === 'error' ? '❌ ' : '✅ '}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
