// src/pages/SectorMasterPage.tsx
import React from 'react';
import Header from '../components/Header';
import SectorMaster from '../components/SectorMaster';

const SectorMasterPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="container mx-auto py-8">
        <SectorMaster />
      </div>
    </>
  );
};

export default SectorMasterPage;
