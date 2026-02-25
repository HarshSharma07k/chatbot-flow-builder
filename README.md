# 🤖 Chatbot Flow Builder

A visual chatbot conversation builder built with **React 18**, **TypeScript**, **React Flow**, **Zustand**, and **TailwindCSS**. Users drag message nodes onto a canvas, connect them to define conversation order, edit their content live, and save validated flows as JSON.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Setup](#project-setup)
3. [Full Architecture](#full-architecture)
4. [Folder Structure](#folder-structure)
5. [Core Components](#core-components)
6. [Zustand Store](#zustand-store)
7. [Validation Logic](#validation-logic)
8. [Node Registry & Extensibility](#node-registry--extensibility)
9. [Clean Reusable Hooks](#clean-reusable-hooks)
10. [Feature Reference](#feature-reference)

---

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 18 (Functional Components) |
| Language | TypeScript (strict mode) |
| Build Tool | Vite 7 |
| Canvas / Graph | React Flow (`reactflow`) |
| State Management | Zustand |
| Styling | TailwindCSS v4 (`@tailwindcss/vite`) |
| Unique IDs | `uuid` v4 |

---

## Project Setup

### Prerequisites

- Node.js 18+ and npm 9+

### 1 — Clone or scaffold

```bash
# If starting from scratch:
npm create vite@latest chatbot-flow-builder -- --template react-ts
cd chatbot-flow-builder
```

### 2 — Install dependencies

```bash
# Core runtime dependencies
npm install reactflow zustand uuid @types/uuid

# Tailwind (Vite plugin variant)
npm install -D tailwindcss @tailwindcss/vite
```

### 3 — Configure Vite for Tailwind

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 4 — Global CSS

```css
/* src/index.css */
@import "tailwindcss";
@import "reactflow/dist/style.css";

html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

### 5 — Bootstrap node registry in entry point

```ts
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Must be imported BEFORE App so the registry is populated before first render
import './app/registerNodes'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 6 — Run dev server

```bash
npm run dev
# → http://localhost:5173
```

### 7 — Type-check

```bash
npx tsc --noEmit
```

### 8 — Production build

```bash
npm run build
npm run preview
```

---

## Full Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        main.tsx                               │
│  1. import registerNodes  (populates NodeRegistry)            │
│  2. render <App />                                            │
└───────────────────────────────┬───────────────────────────────┘
                                │
                         ┌──────▼──────┐
                         │   App.tsx   │
                         │  Top header │
                         │  Save btn   │
                         │  Toast UI   │
                         └──┬───────┬──┘
                            │       │
               ┌────────────▼──┐  ┌─▼──────────────┐
               │  FlowCanvas   │  │  Sidebar Panel  │
               │  (ReactFlow)  │  │                 │
               │  drag & drop  │  │  selectedNode?  │
               │  edge connect │  │   → Settings    │
               │  node select  │  │   → NodesPanel  │
               └──────┬────────┘  └────────┬────────┘
                      │                    │
              ┌───────▼──────┐    ┌────────▼────────┐
              │  CustomNode  │    │  SettingsPanel   │
              │  (per node)  │    │  (text editor)   │
              └──────┬───────┘    └────────┬─────────┘
                     │                     │
              ┌──────▼─────────────────────▼──────────┐
              │           useFlowStore (Zustand)        │
              │  nodes · edges · selectedNodeId         │
              │  addNode · updateNodeText · onConnect   │
              │  onNodesChange · onEdgesChange          │
              └──────────────────┬────────────────────-┘
                                 │
              ┌──────────────────▼────────────────────-┐
              │              Utilities                   │
              │  validateFlow()  ·  canAddEdge()         │
              └──────────────────────────────────────────┘
```

### Data flow summary

| Event | Who handles it |
|---|---|
| Node dropped onto canvas | `FlowCanvas` → `addNode()` in store |
| Node clicked | `FlowCanvas` → `setSelectedNode()` in store |
| Text edited in Settings | `SettingsPanel` → `updateNodeText()` in store |
| Handles connected | `FlowCanvas.onConnect` → `canAddEdge()` guard → `addEdge()` |
| Save clicked | `App` → `validateFlow()` → toast or `console.log(JSON)` |

---

## Folder Structure

```
src/
├── app/
│   ├── nodeRegistry.ts       ← global Map of type → { meta, component }
│   └── registerNodes.ts      ← bootstrap: registers all node types at startup
│
├── components/
│   ├── flow/
│   │   ├── FlowCanvas.tsx    ← ReactFlow wrapper, drag-drop, edge logic
│   │   ├── CustomNode.tsx    ← Text Message node UI (memo'd)
│   │   └── handles.ts        ← SOURCE_HANDLE / TARGET_HANDLE constants
│   └── panels/
│       ├── NodesPanel.tsx    ← draggable tiles, auto-built from registry
│       └── SettingsPanel.tsx ← live text editor for selected node
│
├── store/
│   └── flowStore.ts          ← Zustand store — all business logic lives here
│
├── types/
│   └── flow.types.ts         ← all shared TypeScript interfaces & types
│
├── utils/
│   └── validation.ts         ← pure functions: validateFlow, canAddEdge
│
├── App.tsx                   ← shell, layout, Save button, toast
├── main.tsx                  ← entry point, bootstraps registry
└── index.css                 ← Tailwind + React Flow base styles
```

---

## Core Components

### `FlowCanvas.tsx`

Wraps `<ReactFlow>` inside a `ReactFlowProvider` (required for `useReactFlow` / `screenToFlowPosition`).

**Responsibilities**
- Renders nodes, edges, `<Controls>`, `<MiniMap>`, `<Background>`
- Converts drop coordinates from screen space → canvas space via `screenToFlowPosition`
- Reads `nodeTypes` from the registry via `getReactFlowNodeTypes()` — no hardcoding
- Delegates every action to the Zustand store

**Key drag-and-drop detail**: the DND payload key `application/reactflow-node-type` carries the node type string from `NodesPanel` tile → `handleDrop` in the canvas.

```tsx
// FlowCanvas.tsx (simplified)
export const DND_NODE_TYPE_KEY = 'application/reactflow-node-type';

const handleDrop = (e: DragEvent<HTMLDivElement>) => {
  const nodeType = e.dataTransfer.getData(DND_NODE_TYPE_KEY);
  const meta     = getNodeMeta(nodeType);                  // from registry
  const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });

  addNode({ id: uuidv4(), type: nodeType, position, data: { ...meta.defaultData } });
};
```

---

### `CustomNode.tsx`

The Text Message node rendered by React Flow for every `textMessage` type node.

**Responsibilities**
- Renders `TARGET_HANDLE` (top — accepts multiple incoming edges)
- Renders `SOURCE_HANDLE` (bottom — only one outgoing edge allowed)
- Displays node message text
- Visual selection highlight driven by React Flow's `selected` prop
- Wrapped in `React.memo` to prevent unnecessary re-renders

```tsx
// CustomNode.tsx (simplified)
const CustomNode = memo(({ data, selected }: NodeProps<TextNodeData>) => (
  <div className={`rounded-xl border-2 ${selected ? 'border-indigo-500' : 'border-gray-300'}`}>
    <Handle type="target" position={Position.Top}    id={TARGET_HANDLE} />
    <div>{data.message || 'Empty message'}</div>
    <Handle type="source" position={Position.Bottom} id={SOURCE_HANDLE} />
  </div>
));
```

---

### `NodesPanel.tsx`

Sidebar showing all registered node types as draggable tiles.

**Responsibilities**
- Calls `getAllNodeMeta()` to get the current registry entries
- Renders one `<NodeTile>` per registered type
- Sets `DND_NODE_TYPE_KEY` on `dragstart` so the canvas knows what to create
- **Adding a new node type to the registry automatically adds it here — zero changes needed in this file**

```tsx
const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
  e.dataTransfer.setData(DND_NODE_TYPE_KEY, entry.type);
  e.dataTransfer.effectAllowed = 'copy';
};
```

---

### `SettingsPanel.tsx`

Appears in the sidebar when a node is selected; replaces `NodesPanel`.

**Responsibilities**
- Reads the selected node via the `useSelectedNode` selector hook
- Calls `updateNodeText(id, value)` on every keystroke → Zustand updates store → `CustomNode` re-renders live
- Back arrow deselects the node (reverts sidebar to `NodesPanel`)

```tsx
const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
  updateNodeText(selectedNode.id, e.target.value);  // live global update
};
```

**Extensibility note**: to add per-type settings UI, replace the hardcoded check with a registry lookup:

```ts
const SettingsComponent = settingsRegistry.get(selectedNode.type) ?? DefaultSettings;
return <SettingsComponent node={selectedNode} />;
```

---

### `App.tsx`

Root shell. Contains the top navigation bar, `Save Changes` button, and toast notification.

**Panel switching rule**:
```tsx
{selectedNodeId !== undefined ? <SettingsPanel /> : <NodesPanel />}
```

---

## Zustand Store

All application state and every business-logic mutation live in one place: `src/store/flowStore.ts`.

```ts
export const useFlowStore = create<FlowState & ReactFlowHandlers>((set, get) => ({
  // ── State ──────────────────────────────────────
  nodes: [],
  edges: [],
  selectedNodeId: undefined,

  // ── React Flow low-level change handlers ───────
  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as FlowNode[] })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) as FlowEdge[] })),

  // ── Connection handler (validates before adding) ─
  onConnect: (connection) => {
    const { edges, addEdge } = get();
    if (!connection.source) return;

    if (!canAddEdge(edges, connection.source, connection.sourceHandle ?? null)) {
      console.warn('[FlowStore] Blocked: source handle already has an outgoing edge.');
      return;
    }

    addEdge({
      id: uuidv4(),
      source: connection.source,
      target: connection.target ?? '',
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });
  },

  // ── Domain actions ──────────────────────────────
  addNode:         (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNodeText:  (id, message) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, message } } : n
      ),
    })),
  setSelectedNode: (id)   => set({ selectedNodeId: id }),
  addEdge:         (edge) => set((s) => ({ edges: [...s.edges, edge] })),
  setNodes:        (nodes) => set({ nodes }),
  setEdges:        (edges) => set({ edges }),
}));
```

### Design principles

| Principle | Implementation |
|---|---|
| Single source of truth | All state in one Zustand store |
| No logic in components | Components only call store actions |
| Idiomatic React Flow | `applyNodeChanges` / `applyEdgeChanges` used for drag & selection |
| Validation at mutation boundary | `canAddEdge()` called inside `onConnect` before any state write |

---

## Validation Logic

Pure functions in `src/utils/validation.ts` — no React imports, no side-effects, fully unit-testable.

### `validateFlow` — Save validation

```ts
export function validateFlow(
  nodes: FlowNode[],
  edges: FlowEdge[]
): ValidationResult {
  if (nodes.length <= 1) return { valid: true };  // trivially valid

  const nodesWithIncomingEdge = new Set(edges.map((e) => e.target));
  const orphanCount = nodes.filter(
    (n) => !nodesWithIncomingEdge.has(n.id)
  ).length;

  // Allow exactly 1 orphan (the start/entry node).
  // 2+ orphans = unreachable nodes = invalid flow.
  if (orphanCount > 1) {
    return { valid: false, error: 'Cannot save Flow' };
  }

  return { valid: true };
}
```

**Rule in plain English**: when multiple nodes exist, at most **one** may have no incoming edge (the start node). Any additional disconnected nodes make the flow unsaveable.

### `canAddEdge` — Edge creation guard

```ts
export function canAddEdge(
  edges: FlowEdge[],
  source: string,
  sourceHandle: string | null
): boolean {
  // Block if the source handle already has ANY outgoing edge
  return !edges.some(
    (e) => e.source === source && e.sourceHandle === sourceHandle
  );
}
```

**Rule**: each source handle may have exactly **one** outgoing edge. Target handles are unrestricted.

---

## Node Registry & Extensibility

The registry (`src/app/nodeRegistry.ts`) is the single extensibility seam. It stores two parallel Maps:

| Map | Key | Value |
|---|---|---|
| `metaRegistry` | `type: string` | `NodeRegistryEntry` (label, icon, defaultData, …) |
| `componentRegistry` | `type: string` | `ComponentType<NodeProps>` |

### Public API

```ts
registerNode(entry, Component)    // register a new type
getAllNodeMeta()                   // → NodeRegistryEntry[]   (used by NodesPanel)
getReactFlowNodeTypes()           // → { [type]: Component } (passed to <ReactFlow>)
getNodeMeta(type)                 // → NodeRegistryEntry | undefined
```

### Registering the built-in Text Message node

```ts
// src/app/registerNodes.ts
import { registerNode } from './nodeRegistry';
import { CustomNode } from '../components/flow/CustomNode';

registerNode(
  {
    type: 'textMessage',
    label: 'Message',
    description: 'Send a text message',
    icon: '💬',
    defaultData: { message: '' },
  },
  CustomNode
);
```

### Adding a new node type — Image Node example

**Step 1** — Create the component

```tsx
// src/components/flow/ImageNode.tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { SOURCE_HANDLE, TARGET_HANDLE } from './handles';

interface ImageNodeData {
  imageUrl: string;
  caption: string;
}

export const ImageNode = memo(({ data, selected }: NodeProps<ImageNodeData>) => (
  <div className={`rounded-xl border-2 bg-white shadow-sm w-48 ${selected ? 'border-indigo-500' : 'border-gray-300'}`}>
    <Handle type="target" position={Position.Top}    id={TARGET_HANDLE} />
    <div className="p-3">
      {data.imageUrl
        ? <img src={data.imageUrl} alt={data.caption} className="rounded-lg w-full" />
        : <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">🖼️</div>
      }
      {data.caption && <p className="text-xs text-gray-500 mt-1">{data.caption}</p>}
    </div>
    <Handle type="source" position={Position.Bottom} id={SOURCE_HANDLE} />
  </div>
));
```

**Step 2** — Register it (one addition to `registerNodes.ts`)

```ts
import { ImageNode } from '../components/flow/ImageNode';

registerNode(
  {
    type: 'imageMessage',
    label: 'Image',
    description: 'Send an image',
    icon: '🖼️',
    defaultData: { imageUrl: '', caption: '' },
  },
  ImageNode
);
```

**Result with zero other changes**:
- ✅ Appears as a draggable tile in `NodesPanel` automatically
- ✅ Renders correctly on the canvas
- ✅ Works with all existing edge and validation logic

---

## Clean Reusable Hooks

Custom selector hooks exported from `src/store/flowStore.ts`. Each subscribes only to its specific slice — components re-render only when that slice changes.

### `useSelectedNode`

Returns the full node object for the currently selected node, or `undefined`.

```ts
export const useSelectedNode = (): FlowNode | undefined => {
  const nodes          = useFlowStore((s) => s.nodes);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  return nodes.find((n) => n.id === selectedNodeId);
};
```

**Usage**:
```tsx
// SettingsPanel.tsx
const selectedNode = useSelectedNode();
if (!selectedNode) return null;
```

### `useEdgeActions`

Returns only edge-related callbacks — prevents unrelated state changes from triggering re-renders in components that only care about edge interactions.

```ts
export const useEdgeActions = () =>
  useFlowStore((s) => ({
    onConnect:     s.onConnect,
    onEdgesChange: s.onEdgesChange,
  }));
```

**Usage**:
```tsx
const { onConnect, onEdgesChange } = useEdgeActions();
```

### Selector best practice

Prefer fine-grained selectors over pulling the whole store to minimise re-renders:

```ts
// ✅ Good — re-renders only when selectedNodeId changes
const selectedNodeId = useFlowStore((s) => s.selectedNodeId);

// ❌ Avoid — re-renders on ANY store change
const store = useFlowStore();
```

---

## Feature Reference

| Feature | Location |
|---|---|
| Drag node onto canvas | `FlowCanvas.tsx` → `handleDrop` |
| Prevent duplicate outgoing edges | `flowStore.ts` `onConnect` → `canAddEdge()` |
| Live text editing | `SettingsPanel.tsx` → `updateNodeText()` |
| Settings ↔ Nodes panel switch | `App.tsx` reads `selectedNodeId` |
| Save + validate | `App.tsx` `handleSave` → `validateFlow()` |
| Error / success toast | `App.tsx` local `toast` state, auto-dismissed after 3 s |
| New node type support | One `registerNode()` call in `registerNodes.ts` |

---

## Scripts

```bash
npm run dev      # Start development server  →  http://localhost:5173
npm run build    # Production build          →  dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
