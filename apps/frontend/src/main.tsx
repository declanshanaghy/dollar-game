import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeGA } from './services/analyticsService'

// Initialize Google Analytics
initializeGA()

// 🌌 M0unt th3 c0sm1c 4pp 1nt0 th3 d1g1t4l r34lm 🌌
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
