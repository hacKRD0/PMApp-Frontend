import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
// import Dashboard from './components/Dashboard';  // An example of a protected page
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import UploadPage from './pages/UploadPage.tsx';
import PortfolioPage from './pages/PortfolioPage.tsx';
import StockMapperPage from './pages/StockMapperPage.tsx';
import SectorMasterPage from './pages/SectorMasterPage.tsx';
import StockMasterPage from './pages/StockMasterPage.tsx';
import NotFound from './pages/404.tsx';
import HomePage from './pages/HomePage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="*" element={<NotFound />}></Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected route example */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                {' '}
                <PortfolioPage />
              </ProtectedRoute>
            }
          />{' '}
          {/* Add PortfolioPage route */}
          <Route
            path="/stockmapper"
            element={
              <ProtectedRoute>
                {' '}
                <StockMapperPage />
              </ProtectedRoute>
            }
          />{' '}
          {/* Add StockMapperPage route */}
          <Route
            path="/sectormaster"
            element={
              <ProtectedRoute>
                {' '}
                <SectorMasterPage />
              </ProtectedRoute>
            }
          />{' '}
          {/* Add StockMapperPage route */}
          <Route
            path="/stockmaster"
            element={
              <ProtectedRoute>
                {' '}
                <StockMasterPage />
              </ProtectedRoute>
            }
          />{' '}
          {/* Add StockMasterPage route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                {' '}
                <ProfilePage />
              </ProtectedRoute>
            }
          />{' '}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
