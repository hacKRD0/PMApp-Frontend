// src/pages/StockMasterPage.tsx
import React from 'react';
import Header from '../components/Header';
import StockReference from '../components/StockReference';

const StockReferencePage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <StockReference />
      </div>
    </>
  );
};

export default StockReferencePage;
