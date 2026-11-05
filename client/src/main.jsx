import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FlashMessageProvider from './context/FlashMessageContext.jsx'
import AuthProvider from './context/AuthContext.jsx'
import { PrintProvider } from './context/PrinterContext.jsx'

import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <FlashMessageProvider>
    <AuthProvider>
      <ThemeProvider>
        <PrintProvider>
          <App />
        </PrintProvider>
      </ThemeProvider>
    </AuthProvider>
  </FlashMessageProvider>,
)
