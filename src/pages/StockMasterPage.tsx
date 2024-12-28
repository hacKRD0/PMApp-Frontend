// src/pages/StockMapperPage.tsx
import React from 'react';
import Header from '../components/Header';
import StockMaster from '../components/StockMaster';
import Footer from '../components/Footer';

const StockMasterPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <StockMaster />
      </div>
      <Footer />
    </>
  );
};

export default StockMasterPage;
