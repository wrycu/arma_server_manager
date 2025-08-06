import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/query-provider'
import { DBProvider } from './providers/db-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <DBProvider>
        <App />
      </DBProvider>
    </QueryProvider>
  </StrictMode>
)
