// src/components/FileUpload.tsx

import React, { useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import LocalDatePicker from './LocalDatePicker'; // Our new component
import { format } from 'date-fns';

import {
  uploadFile,
  getBrokerages,
  getDefaultBrokerage,
  updateDefaultBrokerage,
  getPortfolioDates, // <-- We'll use this ourselves
} from '../services/apiService';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brokerages, setBrokerages] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedBrokerage, setSelectedBrokerage] = useState<number | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  // Moved highlight dates here:
  const [highlightDates, setHighlightDates] = useState<string[]>([]);
  const [defaultBrokerageModal, setDefaultBrokerageModal] = useState(false);
  const [defaultBrokerageId, setDefaultBrokerageId] = useState<number | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const brokerageResponse = await getBrokerages();
        const userResponse = await getDefaultBrokerage();
        const datesResponse = await getPortfolioDates();

        if (brokerageResponse.success && brokerageResponse.Brokerages) {
          setBrokerages(brokerageResponse.Brokerages);
        } else {
          setErrorMessage('Failed to load brokerages');
        }

        if (userResponse.success) {
          setDefaultBrokerageId(userResponse.defaultBrokerageId);
          if (userResponse.defaultBrokerage === null) {
            setDefaultBrokerageModal(true);
          }
        } else {
          setErrorMessage('Failed to fetch user information');
        }

        if (datesResponse.success) {
          // Suppose these are 'YYYY-MM-DD' strings
          setHighlightDates(datesResponse.dates);
        }
      } catch (error) {
        setErrorMessage('Error initializing data');
        console.error('Error initializing data:', error);
      }
    };

    initialize();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      // Define allowed MIME types
      const allowedMimeTypes = [
        'text/csv',
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      ];

      // Extract file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      // Define allowed file extensions
      const allowedExtensions = ['csv', 'xls', 'xlsx'];

      // Check if MIME type is allowed
      const isValidMimeType = allowedMimeTypes.includes(file.type);
      // Check if the file extension is allowed
      const isValidExtension = fileExtension
        ? allowedExtensions.includes(fileExtension)
        : false;

      if (isValidMimeType || isValidExtension) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setSelectedFile(null);
        setErrorMessage('Please upload a .csv, .xls, or .xlsx file.');
      }
    } else {
      setSelectedFile(null);
      setErrorMessage('Please upload a .csv, .xls, or .xlsx file.');
    }
    // Reset file input to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleDefaultBrokerageSubmit = async () => {
    if (selectedBrokerage) {
      try {
        const response = await updateDefaultBrokerage(selectedBrokerage);
        if (response.success) {
          setDefaultBrokerageId(selectedBrokerage);
          setDefaultBrokerageModal(false);
          alert('Default brokerage updated successfully!');
        } else {
          alert('Failed to set default brokerage. Please try again.');
        }
      } catch (error) {
        console.error('Error updating default brokerage:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };
  const refreshHighlightDates = async () => {
    try {
      const datesResponse = await getPortfolioDates();
      if (datesResponse.success) {
        setHighlightDates(datesResponse.dates);
      }
    } catch (error) {
      console.error('Error fetching highlight dates:', error);
    }
  };

  const handleSubmit = async () => {
    if (isUploading || !selectedFile || !selectedBrokerage || !selectedDate)
      return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      formData.append('brokerageId', selectedBrokerage.toString());

      // Convert local date to 'YYYY-MM-DD'
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      formData.append('date', formattedDate);

      const response = await uploadFile(formData);

      if (response.success) {
        alert('File upload successful!');
        setSelectedFile(null);
        setSelectedBrokerage(null);
        setSelectedDate(new Date());
        // re-fetch highlight dates
        await refreshHighlightDates();
      } else {
        alert('File upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred during file upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-fit flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Upload Your Holdings CSV
        </h2>

        {/* File upload button & input */}
        <div className="mb-4 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleButtonClick}
            className="flex items-center justify-center w-full p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none"
          >
            <FaCloudUploadAlt className="text-2xl mr-2" />
            <span className="text-sm">Click to upload CSV</span>
          </button>
          <input
            type="file"
            accept=".csv, .xls, .xlsx"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </div>

        {/* Brokerage select */}
        <div className="mb-4">
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none"
            value={selectedBrokerage || ''}
            onChange={(e) => setSelectedBrokerage(Number(e.target.value))}
          >
            <option value="" disabled>
              -- Select brokerage --
            </option>
            {brokerages.map((brokerage) => (
              <option key={brokerage.id} value={brokerage.id}>
                {brokerage.name}
              </option>
            ))}
          </select>
        </div>

        {/* LocalDatePicker with highlightDates */}
        <div className="mb-4">
          <label className="mr-2 font-semibold text-gray-700">
            Select Date:
          </label>
          <LocalDatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            maxDate={new Date()}
            highlightDates={highlightDates} // pass the array of YYYY-MM-DD
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Selected file display */}
        {selectedFile && (
          <p className="text-gray-700 mt-4">
            Selected file: {selectedFile.name}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            isUploading || !selectedFile || !selectedBrokerage || !selectedDate
          }
          className={`w-full p-4 rounded-lg text-white ${
            isUploading || !selectedFile || !selectedBrokerage || !selectedDate
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Submit'}
        </button>
      </div>

      {/* Modal for Default Brokerage */}
      {defaultBrokerageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Set Default Brokerage
            </h3>
            <p className="mb-4 text-gray-600">
              Please select a default brokerage. This action can only be done
              once. All stocks from the selected brokerage will be updated
              accordingly.
            </p>
            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
              value={selectedBrokerage || ''}
              onChange={(e) => setSelectedBrokerage(Number(e.target.value))}
            >
              <option value="" disabled>
                Select brokerage
              </option>
              {brokerages.map((brokerage) => (
                <option key={brokerage.id} value={brokerage.id}>
                  {brokerage.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleDefaultBrokerageSubmit}
              className="w-full bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 focus:outline-none"
            >
              Set Default Brokerage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
