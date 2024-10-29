import './App.css'
// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
// import Dashboard from './components/Dashboard';  // An example of a protected page
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import UploadPage from './pages/UploadPage.tsx';
import PortfolioPage from './pages/PortfolioPage.tsx';
import StockMasterPage from './pages/StockMasterPage.tsx';
import SectorMasterPage from './pages/SectorMasterPage.tsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected route example */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route path="/portfolio" element={<PortfolioPage />} /> {/* Add PortfolioPage route */}
          <Route path="/stockmaster" element={<StockMasterPage />} /> {/* Add StockMasterPage route */}
          <Route path="/sectormaster" element={<SectorMasterPage />} /> {/* Add StockMasterPage route */}
      
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
