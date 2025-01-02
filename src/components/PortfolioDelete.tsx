// src/components/PortfolioDelete.tsx

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { format } from 'date-fns';
import LocalDatePicker from './LocalDatePicker'; // <-- Our custom date picker
import {
  deletePortfolio,
  getBrokerages,
  getPortfolioDates,
} from '../services/apiService';

interface Brokerage {
  id: number;
  name: string;
}

interface DeletePortfolioResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

const PortfolioDelete: React.FC = () => {
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [selectedBrokerage, setSelectedBrokerage] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightDates, setHighlightDates] = useState<string[]>([]);

  // Fetch brokerages on component mount
  useEffect(() => {
    const fetchBrokerages = async () => {
      try {
        const data = await getBrokerages();
        const datesResponse = await getPortfolioDates();
        // Example response: { success: true, Brokerages: [ {id: 1, name: 'XYZ'}, ... ] }
        if (data?.Brokerages) {
          setBrokerages(data.Brokerages);
        } else {
          setErrorMessage('Failed to load brokerages. Please try again later.');
        }

        if (datesResponse.success) {
          // Suppose these are 'YYYY-MM-DD' strings
          setHighlightDates(datesResponse.dates);
        }
      } catch (error) {
        console.error('Error fetching brokerages:', error);
        setErrorMessage('Failed to load brokerages. Please try again later.');
      }
    };

    fetchBrokerages();
  }, []);

  // Handle brokerage selection
  const handleBrokerageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrokerage(Number(e.target.value));
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic Input Validation
    if (selectedBrokerage === '') {
      setErrorMessage('Please select a brokerage.');
      return;
    }
    if (!fromDate || !toDate) {
      setErrorMessage('Please select both From and To dates.');
      return;
    }
    if (fromDate > toDate) {
      setErrorMessage('From date cannot be later than To date.');
      return;
    }

    // Optional Confirmation Dialog
    const brokerageName =
      brokerages.find((b) => b.id === selectedBrokerage)?.name || 'Unknown';
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the portfolio for brokerage "${brokerageName}" 
      from ${format(fromDate, 'yyyy-MM-dd')} to ${format(
        toDate,
        'yyyy-MM-dd'
      )}?`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Convert the Date objects to 'YYYY-MM-DD' strings
      const fromDateString = format(fromDate, 'yyyy-MM-dd');
      const toDateString = format(toDate, 'yyyy-MM-dd');

      const response: DeletePortfolioResponse = await deletePortfolio({
        brokerageId: selectedBrokerage,
        fromDate: fromDateString,
        toDate: toDateString,
      });

      setSuccessMessage(response.message || 'Portfolio deleted successfully.');
      // Reset form fields
      setSelectedBrokerage('');
      setFromDate(null);
      setToDate(null);
      await refreshHighlightDates();
    } catch (error: any) {
      console.error('Error deleting portfolio:', error);
      if (error.response && error.response.data && error.response.data.error) {
        const err = error.response.data as ErrorResponse;
        setErrorMessage(err.error || 'Failed to delete portfolio.');
      } else if (error.message) {
        setErrorMessage(error.message || 'Failed to delete portfolio.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsDeleting(false);
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

  return (
    <div className="h-fit flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Delete Portfolio
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brokerage Selection */}
          <div>
            <label
              htmlFor="brokerage"
              className="block text-gray-600 font-medium mb-1"
            >
              Brokerage:
            </label>
            <select
              id="brokerage"
              value={selectedBrokerage}
              onChange={handleBrokerageChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">-- Select Brokerage --</option>
              {brokerages.map((brokerage) => (
                <option key={brokerage.id} value={brokerage.id}>
                  {brokerage.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date - Using LocalDatePicker */}
          <div>
            <label
              htmlFor="fromDate"
              className="block text-gray-600 font-medium mb-1"
            >
              From Date:
            </label>
            <LocalDatePicker
              selectedDate={fromDate}
              onDateChange={setFromDate}
              maxDate={new Date()}
              highlightDates={highlightDates}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* To Date - Using LocalDatePicker */}
          <div>
            <label
              htmlFor="toDate"
              className="block text-gray-600 font-medium mb-1"
            >
              To Date:
            </label>
            <LocalDatePicker
              selectedDate={toDate}
              onDateChange={setToDate}
              maxDate={new Date()}
              highlightDates={highlightDates}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Delete Button */}
          <div>
            <button
              type="submit"
              disabled={
                isDeleting ||
                selectedBrokerage === '' ||
                !fromDate ||
                !toDate ||
                fromDate > toDate
              }
              className={`w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-200 ${
                (isDeleting ||
                  selectedBrokerage === '' ||
                  !fromDate ||
                  !toDate ||
                  fromDate > toDate) &&
                'opacity-50 cursor-not-allowed'
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete Portfolio'}
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PortfolioDelete;
