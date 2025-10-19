import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Global guard so runtime errors never blank the page silently
window.addEventListener('error', (e)=>console.error('Global error:', e?.error||e.message))
window.addEventListener('unhandledrejection', (e)=>console.error('Unhandled promise:', e?.reason))

createRoot(document.getElementById('root')).render(<App />)
