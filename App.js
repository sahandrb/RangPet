import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ChemicalPage from './pages/ChemicalPage';
import LongevityPage from './pages/LongevityPage';
import EffectivenessPage from './pages/EffectivenessPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/chemical" element={<ChemicalPage />} />
          <Route path="/longevity" element={<LongevityPage />} />
          <Route path="/effectiveness" element={<EffectivenessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
