import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Landing from './pages/Landing';
import GetQuote from './pages/GetQuote';
import Quotes from './pages/Quotes';
import Checkout from './pages/Checkout';
import Success from './pages/Success';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/get-quote" element={<GetQuote />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
