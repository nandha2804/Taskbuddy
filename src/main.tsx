import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import './config/firebase' // Initialize Firebase first
import { isFirebaseInitialized } from './config/firebase'
import App from './App.tsx'
import './index.css'

// Create root outside so we only do it once
const root = ReactDOM.createRoot(document.getElementById('root')!)

// Wait for Firebase initialization before mounting
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// Check Firebase initialization
if (isFirebaseInitialized()) {
  renderApp()
} else {
  // Wait for Firebase to initialize
  const checkInterval = setInterval(() => {
    if (isFirebaseInitialized()) {
      clearInterval(checkInterval)
      renderApp()
    }
  }, 100)
}
