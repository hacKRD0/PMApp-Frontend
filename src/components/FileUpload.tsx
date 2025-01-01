import React, { useEffect, useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  uploadFile,
  getBrokerages,
  getDefaultBrokerage,
  updateDefaultBrokerage,
  getPortfolioDates,
} from '../services/apiService';
import { format } from 'date-fns';

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
  const [uploadedDates, setUploadedDates] = useState<string[]>([]); // Highlighted dates
  const [defaultBrokerageModal, setDefaultBrokerageModal] = useState(false);
  const [defaultBrokerageId, setDefaultBrokerageId] = useState<number | null>(
    null
  );

  // Fetch brokerages, user's default brokerage, and uploaded dates
  useEffect(() => {
    const initialize = async () => {
      try {
        const brokerageResponse = await getBrokerages();
        const userResponse = await getDefaultBrokerage();
        const uploadedDatesResponse = await getPortfolioDates();

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

        if (uploadedDatesResponse.success) {
          setUploadedDates(uploadedDatesResponse.dates); // Dates are in ISO string format
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
    console.log('Selected file:', file);

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

      // Check if the file MIME type is allowed
      const isValidMimeType = allowedMimeTypes.includes(file.type);

      // Check if the file extension is allowed
      const isValidExtension = fileExtension
        ? allowedExtensions.includes(fileExtension)
        : false;

      // Validate the file by MIME type or extension
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
    if (e.target) {
      e.target.value = ''; // Reset file input to allow re-selection of the same file
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const normalizeToUTC = (date: Date): Date => {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(normalizeToUTC(date));
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
    if (!selectedFile || !selectedBrokerage || !selectedDate) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      formData.append(
        'brokerageId',
        selectedBrokerage ? selectedBrokerage.toString() : ''
      );

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      formData.append('date', formattedDate);

      const response = await uploadFile(formData);

      if (response.success) {
        alert('File upload successful!');
        setSelectedFile(null);
        setSelectedBrokerage(null);
        setSelectedDate(new Date());

        try {
          const uploadedDatesResponse = await getPortfolioDates();
          if (uploadedDatesResponse?.success) {
            setUploadedDates(uploadedDatesResponse.dates);
          }
        } catch (error) {
          console.error('Error fetching uploaded dates:', error);
          alert('An error occurred while updating uploaded dates.');
        }
      } else {
        alert('File upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred during file upload. Please try again.');
    }
  };

  const isUploadedDate = (date: Date): boolean => {
    const utcDateString = normalizeToUTC(date).toISOString().split('T')[0];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return uploadedDates.includes(formattedDate);
  };

  return (
    <div className="h-fit flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Upload Your Holdings CSV
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
            accept=".csv, .xls, .xlsx, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
          <label
            htmlFor="date-picker"
            className="mr-2 font-semibold text-gray-700"
          >
            Select Date:
          </label>
          <ReactDatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            maxDate={new Date()}
            dayClassName={(date) =>
              isUploadedDate(date)
                ? 'react-datepicker__day--highlighted bg-red-300 text-white'
                : ''
            }
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        {selectedFile && (
          <p className="text-gray-700 mt-4">
            Selected file: {selectedFile.name}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || !selectedBrokerage || !selectedDate}
          className={`w-full p-4 rounded-lg text-white ${
            !selectedFile || !selectedBrokerage || !selectedDate
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
