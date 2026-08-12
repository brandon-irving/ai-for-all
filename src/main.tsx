import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Base layer first: App pulls in screens.css, and equal-specificity rules
// there (.vision-exit vs .btn) must win over the primitives in global.css.
import './styles/global.css'
import { StoreProvider } from './state/store'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
)
