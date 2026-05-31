import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ActiveProjectProvider } from './contexts/ActiveProjectContext.tsx'

import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ActiveProjectProvider>
          <App />
        </ActiveProjectProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
