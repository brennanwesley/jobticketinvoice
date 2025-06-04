import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Import auth test utilities in development mode
if (process.env.NODE_ENV === 'development') {
  import('./utils/test-auth')
    .then(() => console.log('Auth test utilities loaded. Use testLogin(), testRegister(), etc. in console.'))
    .catch(err => console.error('Failed to load auth test utilities:', err))
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
