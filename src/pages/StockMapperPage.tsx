// src/pages/StockMapperPage.tsx
import React from 'react';
import Header from '../components/Header';
import StockMapper from '../components/StockMapper';
import Footer from '../components/Footer';

const StockMapperPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <StockMapper />
      </div>
      <Footer />
    </>
  );
};

export default StockMapperPage;
