import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ItineraryBuilder from './pages/ItineraryBuilder';
import { WhatsAppProvider } from './context/WhatsAppContext';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <WhatsAppProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/tours/:id" element={<TourDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/arma-tu-viaje" element={<ItineraryBuilder />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/terminos" element={<Terms />} />
              {/* Fallback for reviews or other pages to Home or a Coming Soon page */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </Router>
      </WhatsAppProvider>
    </AuthProvider>
  );
}

export default App;
