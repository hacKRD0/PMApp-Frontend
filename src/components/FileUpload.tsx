import React, { useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { uploadFile, getBrokerages } from '../services/apiService';

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brokerages, setBrokerages] = useState<string[]>([]);
  const [selectedBrokerage, setSelectedBrokerage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchBrokerages = async () => {
      try {
        const response = await getBrokerages();
        if (response.success && response.Brokerages) {
          setBrokerages(response.Brokerages.map((brokerage: any) => brokerage.name));
        } else {
          setErrorMessage("Failed to load brokerages");
        }
      } catch (error) {
        setErrorMessage("Error fetching brokerages");
        console.error("Error fetching brokerages:", error);
      }
    };

    fetchBrokerages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setErrorMessage(null);
    } else {
      setSelectedFile(null);
      setErrorMessage("Please upload a valid .csv file.");
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    if (selected > today) {
      setSelectedDate(null);
      setDateError("Date cannot be in the future.");
    } else {
      setSelectedDate(selected);
      setDateError(null);
    }
  };

  const isSubmitDisabled = !selectedFile || !selectedBrokerage || !selectedDate || !!dateError;

  const handleSubmit = async () => {
    if (!isSubmitDisabled) {
      try {
        const formData = new FormData();
        if (selectedFile) formData.append('file', selectedFile, selectedFile.name);
        formData.append('brokerageName', selectedBrokerage || '');
        formData.append('date', selectedDate || '');

        const response = await uploadFile(formData);

        if (response.success) {
          alert("File upload successful!");
          setSelectedFile(null);
          setSelectedBrokerage(null);
          setSelectedDate(null);
        } else {
          alert("File upload failed. Please try again.");
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert("An error occurred during file upload. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Upload Your Portfolio CSV</h2>

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
            accept=".csv"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
          />

          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
        </div>

        <div className="mb-4">
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            value={selectedBrokerage || ""}
            onChange={(e) => setSelectedBrokerage(e.target.value)}
          >
            <option value="" disabled>Select brokerage</option>
            {brokerages.map((brokerage) => (
              <option key={brokerage} value={brokerage}>
                {brokerage}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            value={selectedDate || ""}
            onChange={handleDateChange}
            max={today}
          />
          {dateError && <p className="text-red-500 text-sm mt-2">{dateError}</p>}
        </div>

        {selectedFile && (
          <p className="text-gray-700 mt-4">Selected file: {selectedFile.name}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full p-4 rounded-lg text-white ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'}`}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
