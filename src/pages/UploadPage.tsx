// src/pages/UploadPage.tsx
import React from 'react';
import Header from '../components/Header'; // Ensure the Header component path is correct
import FileUpload from '../components/FileUpload'; // Ensure the FileUpload component path is correct
import Footer from '../components/Footer'; // Ensure the Footer component path is correct
import PortfolioDelete from '../components/PortfolioDelete';

const UploadPage: React.FC = () => {
  return (
    <>
      <Header /> {/* Header will appear on this page */}
      <div className="flex flex-col items-center justify-center">
        <div className="container mx-auto mt-8">
          <FileUpload /> {/* File upload form */}
        </div>
        <div className="container mx-auto mt-8">
          <PortfolioDelete />
        </div>
      </div>
      <Footer /> {/* Footer will appear on this page */}
    </>
  );
};

export default UploadPage;
