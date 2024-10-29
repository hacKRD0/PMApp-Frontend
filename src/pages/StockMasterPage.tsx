// src/pages/StockMasterPage.tsx
import React from 'react';
import Header from '../components/Header';
import StockMaster from '../components/StockMaster';

const StockMasterPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <StockMaster />
      </div>
    </>
  );
};

export default StockMasterPage;
