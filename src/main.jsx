import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Pagamento from './pagamentos/pagamento.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/pagamento" element={<Pagamento />} />
    </Routes>
  </BrowserRouter>
)

import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
