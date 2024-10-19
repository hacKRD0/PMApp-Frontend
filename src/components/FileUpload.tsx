// FileUpload.tsx
import React, { useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa'; // Cloud upload icon

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedBrokerage, setSelectedBrokerage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

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
    if (fileInput) fileInput.click(); // Trigger hidden file input click
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

  const brokerages = ["Brokerage 1", "Brokerage 2", "Brokerage 3"]; // Options for the dropdown

  // Determine if submit button should be enabled
  const isSubmitDisabled = !selectedFile || !selectedBrokerage || !selectedDate || !!dateError;

  const handleSubmit = () => {
    if (!isSubmitDisabled) {
      console.log('Submitting data:', {
        selectedFile,
        selectedBrokerage,
        selectedDate
      });
      // Handle the form submission logic here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Upload Your Portfolio CSV</h2>

        {/* File Upload Button */}
        <div className="mb-4 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleButtonClick}
            className="flex items-center justify-center w-full p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none"
          >
            <FaCloudUploadAlt className="text-2xl mr-2" /> {/* Cloud icon */}
            <span className="text-sm">Click to upload CSV</span>
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            accept=".csv"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
          />

          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
        </div>

        {/* Dropdown for Brokerage Selection */}
        <div className="mb-4">
          {/* <label className="block text-gray-600 mb-2">Select Brokerage</label> */}
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

        {/* Date Picker for Download Date */}
        <div className="mb-4">
          {/* <label className="block text-gray-600 mb-2">Select Download Date</label> */}
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            value={selectedDate || ""}
            onChange={handleDateChange}
            max={today} // Ensure the date cannot be in the future
          />
          {dateError && <p className="text-red-500 text-sm mt-2">{dateError}</p>}
        </div>

        {/* Display selected file */}
        {selectedFile && (
          <p className="text-gray-700 mt-4">Selected file: {selectedFile.name}</p>
        )}

        {/* Submit Button */}
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
