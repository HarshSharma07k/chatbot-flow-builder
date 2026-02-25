/**
 * registerNodes.ts
 *
 * Bootstrap file: imports all node types and registers them in the NodeRegistry.
 *
 * HOW TO ADD A NEW NODE TYPE IN THE FUTURE:
 *   1. Create your component (e.g. `src/components/flow/ImageNode.tsx`).
 *   2. Import it here.
 *   3. Call `registerNode(metadata, Component)`.
 *   That's the ONLY change required. No other files need to be touched.
 *
 * This file is imported once at app startup (in main.tsx), before React renders.
 */

import { registerNode } from './nodeRegistry';
import { CustomNode } from '../components/flow/CustomNode';

// ---------------------------------------------------------------------------
// Text Message Node
// ---------------------------------------------------------------------------
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

/*
 * ── EXAMPLE: How to add an Image Node in the future ──────────────────────
 *
 * import { ImageNode } from '../components/flow/ImageNode';
 *
 * registerNode(
 *   {
 *     type: 'imageMessage',
 *     label: 'Image',
 *     description: 'Send an image',
 *     icon: '🖼️',
 *     defaultData: { imageUrl: '', caption: '' },
 *   },
 *   ImageNode
 * );
 */
