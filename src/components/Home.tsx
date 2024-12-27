import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa6';
import sampleZip from '../assets/sample.zip';

const Home = () => {
  const [buttonClass, setButtonClass] = useState('');

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = sampleZip; // Imported file path
      link.download = 'sample.zip';
      link.click();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Introduction Section */}
        <section className="bg-white p-6 rounded shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
          <p>
            This application helps you consolidate your stock investment
            portfolio effectively. Whether you're tracking stocks, managing
            sectors, or uploading data, this app has got you covered. Below is a
            quick guide on how to get started.
          </p>
        </section>

        <section className="bg-white p-6 rounded shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Use Case
          </h2>
          <p className="text-gray-700">
            Imagine managing stocks across different brokerage accounts like
            Zerodha and Groww. Keeping track of all holdings can be
            overwhelming. With our app, upload all portfolio CSVs, categorize
            stocks effortlessly, and get sector-wise and brokerage-wise stock
            distributions. Analyze and act with knowledge of the big picture!
          </p>
        </section>

        {/* Feature Guide Section */}
        <section className="bg-white p-6 rounded shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">How to Use the App</h2>
          <ul className="list-disc list-inside space-y-4">
            <li>
              <strong>Manage Stocks:</strong> Use the "Stock Master" section to
              view, add, update, or delete stock master codes.
            </li>
            <li>
              <strong>Organize Sectors:</strong> Head to the "Sectors" tab to
              manage and categorize your stocks based on sectors.
            </li>
            <li>
              <strong>Map Stocks:</strong> Head to the "Stock Mapper" tab to map
              same stocks from different brokerages to a common stock master
              code.
            </li>
            <li>
              <strong>Upload Data:</strong>
              <span>
                Navigate to the "Upload" section to import portfolio data using
                a CSV file. Download file format{' '}
              </span>

              <button
                onClick={handleDownload}
                onMouseOver={() =>
                  setButtonClass('text-blue-500 hover:underline')
                }
                onMouseLeave={() => setButtonClass('')}
                className={`hover:underline ${buttonClass}`}
              >
                <FaDownload className="mr-2 text-xl" />
              </button>
            </li>
            <li>
              <strong>View Portfolio:</strong> Use the "Portfolio" page to view
              your consolidated portfolio for any specific date.
            </li>
          </ul>
        </section>

        {/* Additional Information */}
        <section className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">Additional Features</h2>
          <p className="mb-4">The app provides advanced tools to help you:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Track historical portfolio data for specific dates.</li>
            <li>Upload files with stock information and bulk data updates.</li>
            <li>Manage your sectors and stock references efficiently.</li>
            <li>
              Data for latest uploaded file for a brokerage on a day will only
              be stored.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Home;
