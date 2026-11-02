import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FluidRoot } from '@/components/fluid-root'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluidRoot>
      <App />
    </FluidRoot>
  </StrictMode>,
)
