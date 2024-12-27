// src/pages/PortfolioPage.tsx
import React from 'react';
import Header from '../components/Header'; // Ensure Header is imported correctly
import Portfolio from '../components/Portfolio'; // Import the Portfolio component
import Footer from '../components/Footer'; // Import the Footer component

const PortfolioPage: React.FC = () => {
  return (
    <>
      <Header /> {/* Header component */}
      <div className="container mx-auto py-8">
        <Portfolio /> {/* Portfolio component */}
      </div>
      <Footer />
    </>
  );
};

export default PortfolioPage;
