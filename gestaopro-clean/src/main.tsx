import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    \u003cReact.StrictMode\u003e
    \u003cQueryClientProvider client = { queryClient }\u003e
    \u003cBrowserRouter\u003e
    \u003cApp /\u003e
    \u003c / BrowserRouter\u003e
    \u003c / QueryClientProvider\u003e
    \u003c / React.StrictMode\u003e,
)
