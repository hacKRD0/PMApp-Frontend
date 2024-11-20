import React, { useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import {
  uploadFile,
  getBrokerages,
  getDefaultBrokerage,
  updateDefaultBrokerage,
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [defaultBrokerageModal, setDefaultBrokerageModal] = useState(false);
  const [defaultBrokerageId, setDefaultBrokerageId] = useState<number | null>(
    null
  );

  const today = new Date().toISOString().split('T')[0];

  // Fetch brokerages and user's default brokerage
  useEffect(() => {
    const initialize = async () => {
      try {
        const brokerageResponse = await getBrokerages();
        const userResponse = await getDefaultBrokerage();

        if (brokerageResponse.success && brokerageResponse.Brokerages) {
          setBrokerages(brokerageResponse.Brokerages);
        } else {
          setErrorMessage('Failed to load brokerages');
        }

        if (userResponse.success) {
          setDefaultBrokerageId(userResponse.defaultBrokerageId);
          if (userResponse.defaultBrokerage === null) {
            setDefaultBrokerageModal(true); // Show modal if defaultBrokerageId is null
          }
        } else {
          setErrorMessage('Failed to fetch user information');
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
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setErrorMessage(null);
    } else {
      setSelectedFile(null);
      setErrorMessage('Please upload a valid .csv file.');
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
      setDateError('Date cannot be in the future.');
    } else {
      setSelectedDate(selected);
      setDateError(null);
    }
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

  const handleSubmit = async () => {
    if (!isSubmitDisabled) {
      try {
        const formData = new FormData();
        if (selectedFile)
          formData.append('file', selectedFile, selectedFile.name);
        formData.append(
          'brokerageName',
          brokerages.find((b) => b.id === selectedBrokerage)?.name || ''
        );
        formData.append('date', selectedDate || '');

        const response = await uploadFile(formData);

        if (response.success) {
          alert('File upload successful!');
          setSelectedFile(null);
          setSelectedBrokerage(null);
          setSelectedDate(null);
        } else {
          alert('File upload failed. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('An error occurred during file upload. Please try again.');
      }
    }
  };

  const isSubmitDisabled =
    !selectedFile || !selectedBrokerage || !selectedDate || !!dateError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Upload Your Portfolio CSV
        </h2>

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

          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </div>

        <div className="mb-4">
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
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
        </div>

        <div className="mb-4">
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            value={selectedDate || ''}
            onChange={handleDateChange}
            max={today}
          />
          {dateError && (
            <p className="text-red-500 text-sm mt-2">{dateError}</p>
          )}
        </div>

        {selectedFile && (
          <p className="text-gray-700 mt-4">
            Selected file: {selectedFile.name}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full p-4 rounded-lg text-white ${
            isSubmitDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          Submit
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
