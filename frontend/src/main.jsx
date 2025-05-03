//src/Main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, } from 'react-router-dom'
import './index.css'
import 'react-confirm-alert/src/react-confirm-alert.css';

const future = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={future}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
