import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            background: '#1A1A16',
            color: '#FAFAF7',
          },
          success: { iconTheme: { primary: '#7A9E87', secondary: '#FAFAF7' } },
          error: { iconTheme: { primary: '#C4622D', secondary: '#FAFAF7' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
