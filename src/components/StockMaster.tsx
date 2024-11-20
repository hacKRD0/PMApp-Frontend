import React, { useEffect, useState } from 'react';
import {
  fetchStockMaster,
  fetchStockReferences,
  updateStockMaster,
} from '../services/apiService';

type Stock = {
  id: number;
  brokerageStockName: string;
  referenceId: string;
  brokerage: string;
};

type StockReference = {
  id: number;
  name: string;
  code: string;
};

const StockMaster: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockReferences, setStockReferences] = useState<StockReference[]>([]);
  const [editedStocks, setEditedStocks] = useState<{ [key: number]: Stock }>(
    {}
  );
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        const stockMasterResponse = await fetchStockMaster();
        const stockReferencesResponse = await fetchStockReferences();

        if (stockMasterResponse.success && stockMasterResponse.StockMaster) {
          const formattedStocks = stockMasterResponse.StockMaster.map(
            (item: any) => ({
              id: item.id,
              brokerageStockName: item.BrokerageCode,
              referenceId: item.StockReference?.code || '-',
              brokerage: item.Brokerage?.name || 'Unknown Brokerage',
            })
          );
          setStocks(formattedStocks);
        } else {
          console.error(
            'StockMaster data is missing or not successful:',
            stockMasterResponse
          );
        }

        if (
          stockReferencesResponse.success &&
          stockReferencesResponse.stockReferences
        ) {
          const formattedReferences =
            stockReferencesResponse.stockReferences.map((ref: any) => ({
              id: ref.id,
              name: ref.name,
              code: ref.code,
            }));
          setStockReferences(formattedReferences);
        } else {
          console.error(
            'StockReferences data is missing or not successful:',
            stockReferencesResponse
          );
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 2000); // Clear notification after 2 seconds
  };

  // Save stock changes
  const saveStock = async (id: number) => {
    if (editedStocks[id]) {
      try {
        const updatedStock = editedStocks[id];
        const stockReferenceId = stockReferences.find(
          (ref) => ref.code === updatedStock.referenceId
        )?.id;

        if (!stockReferenceId) {
          showNotification('error', 'Invalid stock reference selected.');
          return;
        }

        const requestBody = {
          stockId: id,
          stockReferenceId,
        };

        const response = await updateStockMaster(requestBody);

        if (response.success) {
          setStocks((prev) =>
            prev.map((stock) =>
              stock.id === id
                ? { ...stock, referenceId: updatedStock.referenceId }
                : stock
            )
          );
          setEditedStocks((prev) => {
            const updated = { ...prev };
            delete updated[id]; // Clear edited data for this stock after saving
            return updated;
          });
          setEditMode((prev) => ({ ...prev, [id]: false }));
          showNotification('success', 'Stock updated successfully!');
        } else {
          showNotification(
            'error',
            `Failed to update stock: ${response.message}`
          );
        }
      } catch (error) {
        console.error('Error updating stock:', error);
        showNotification('error', 'Error updating stock. Please try again.');
      }
    }
  };

  const cancelEdit = (id: number) => {
    setEditMode((prev) => ({ ...prev, [id]: false }));
    setEditedStocks((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleDropdownChange = (id: number, value: string) => {
    setEditedStocks((prev) => ({
      ...prev,
      [id]: { ...prev[id], referenceId: value },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4">StockMaster</h2>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md text-white text-sm ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } transition-transform transform translate-y-0 opacity-100`}
          style={{ transition: 'transform 0.3s ease, opacity 0.3s ease' }}
        >
          {notification.message}
        </div>
      )}

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Brokerage Stock Name</th>
            <th className="py-2 px-4 border-b">Stock Reference</th>
            <th className="py-2 px-4 border-b">Brokerage</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td className="py-2 px-4 border-b">{stock.brokerageStockName}</td>
              <td className="py-2 px-4 border-b">
                {editMode[stock.id] ? (
                  <select
                    value={
                      editedStocks[stock.id]?.referenceId || stock.referenceId
                    }
                    onChange={(e) =>
                      handleDropdownChange(stock.id, e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="">Select Reference</option>
                    {stockReferences.map((ref) => (
                      <option key={ref.id} value={ref.code}>
                        {ref.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  stock.referenceId
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <span className="text-gray-700">{stock.brokerage}</span>
              </td>
              <td className="py-2 px-4 border-b text-center space-x-2">
                {editMode[stock.id] ? (
                  <>
                    <button
                      onClick={() => saveStock(stock.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => cancelEdit(stock.id)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 focus:outline-none"
                    >
                      X
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, [stock.id]: true }))
                    }
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockMaster;
