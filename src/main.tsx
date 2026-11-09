import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './store/StoreContext'
import Toast from './components/ui/Toast'
import './styles/fonts.css'
import './styles/tokens.css'
import './index.css'
import './styles/redesign.css'
import './styles/ios.css'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL}><StoreProvider><App /><Toast /></StoreProvider></BrowserRouter></React.StrictMode>
)
