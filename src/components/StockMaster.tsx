// src/components/StockMaster.tsx
import React, { useState } from 'react';

type Stock = {
  id: number;
  name: string;
  referenceId: string;
  sector: string;
};

const initialStockData: Stock[] = [
  { id: 1, name: 'Reliance Industries', referenceId: 'RELIANCE', sector: 'Energy' },
  { id: 2, name: 'HDFC Bank', referenceId: 'HDFCBANK', sector: 'Banking' },
  { id: 3, name: 'Infosys', referenceId: 'INFY', sector: 'Technology' },
  // Additional stocks can be added here
];

const StockMaster: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>(initialStockData);
  const [editedStocks, setEditedStocks] = useState<{ [key: number]: Stock }>({});

  // Handle input change for editable fields
  const handleInputChange = (id: number, field: keyof Stock, value: string) => {
    setEditedStocks((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Save updates for a stock
  const saveStock = (id: number) => {
    if (editedStocks[id]) {
      setStocks((prev) =>
        prev.map((stock) => (stock.id === id ? { ...stock, ...editedStocks[id] } : stock))
      );
      setEditedStocks((prev) => {
        const updated = { ...prev };
        delete updated[id]; // Clear edited data for this stock after saving
        return updated;
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">StockMaster</h2>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Stock Name</th>
            <th className="py-2 px-4 border-b">Reference ID</th>
            <th className="py-2 px-4 border-b">Sector</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td className="py-2 px-4 border-b">{stock.name}</td>
              <td className="py-2 px-4 border-b">
                <input
                  type="text"
                  value={editedStocks[stock.id]?.referenceId || stock.referenceId}
                  onChange={(e) => handleInputChange(stock.id, 'referenceId', e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </td>
              <td className="py-2 px-4 border-b">
                <input
                  type="text"
                  value={editedStocks[stock.id]?.sector || stock.sector}
                  onChange={(e) => handleInputChange(stock.id, 'sector', e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => saveStock(stock.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockMaster;
