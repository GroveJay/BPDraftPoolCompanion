import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/bootstrap.min.css';
import BluePrince from './App/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BluePrince />
  </StrictMode>,
)
