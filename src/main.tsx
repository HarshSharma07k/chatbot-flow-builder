/**
 * main.tsx
 *
 * Application entry point.
 *
 * IMPORTANT — `registerNodes` must be imported BEFORE `App` so that
 * the NodeRegistry is fully populated when React first renders.
 * (Side-effect-only import — it calls `registerNode(...)` immediately.)
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Bootstrap: registers all node types into the global NodeRegistry
import './app/registerNodes'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
