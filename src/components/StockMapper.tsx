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
  const [editedStocks, setEditedStocks] = useState<{ [key: number]: string }>(
    {}
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 2000);
  };

  const saveAllStocks = async () => {
    const stocksToUpdate = Object.entries(editedStocks).map(
      ([id, referenceId]) => {
        const stockId = parseInt(id, 10);
        const stockReference = stockReferences.find(
          (ref) => ref.code === referenceId
        );

        if (!stockReference) {
          showNotification(
            'error',
            `Invalid stock reference for stock ID ${id}.`
          );
          return null;
        }

        return { stockId, stockReferenceId: stockReference.id };
      }
    );

    const validStocksToUpdate = stocksToUpdate.filter(
      (stock): stock is { stockId: number; stockReferenceId: number } =>
        stock !== null
    );

    if (validStocksToUpdate.length === 0) {
      showNotification('error', 'No valid updates to save.');
      return;
    }

    try {
      const response = await updateStockMaster(validStocksToUpdate);

      if (response.success) {
        const updatedStockMap = new Map(
          response.updatedStocks.map((stock: any) => {
            const stockReference = stockReferences.find(
              (ref) => ref.id === stock.StockReferenceId
            );

            if (!stockReference) {
              console.error(
                `StockReference not found for StockReferenceId: ${stock.StockReferenceId}`
              );
              return [stock.id, null];
            }

            return [stock.id, stockReference.code];
          })
        );

        setStocks((prev) =>
          prev.map((stock) =>
            updatedStockMap.has(stock.id)
              ? {
                  ...stock,
                  referenceId: updatedStockMap.get(stock.id) as string,
                }
              : stock
          )
        );
        setEditedStocks({});
        showNotification('success', 'Stocks updated successfully!');
        setIsEditMode(false);
      } else {
        showNotification(
          'error',
          `Failed to update stocks: ${response.message}`
        );
      }
    } catch (error) {
      console.error('Error updating stocks:', error);
      showNotification('error', 'Error updating stocks. Please try again.');
    }
  };

  const handleDropdownChange = (id: number, value: string) => {
    setEditedStocks((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const cancelEditMode = () => {
    setEditedStocks({});
    setIsEditMode(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4">Stock Mapper</h2>

      {notification && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md text-white text-sm ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Brokerage Stock Name</th>
            <th className="py-2 px-4 border-b">Stock Master Code</th>
            <th className="py-2 px-4 border-b">Brokerage</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td className="py-2 px-4 border-b">{stock.brokerageStockName}</td>
              <td className="py-2 px-4 border-b">
                {isEditMode ? (
                  <select
                    value={editedStocks[stock.id] || stock.referenceId}
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
                  <span>{stock.referenceId}</span>
                )}
              </td>
              <td className="py-2 px-4 border-b">
                <span className="text-gray-700">{stock.brokerage}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-4">
        {isEditMode ? (
          <>
            <button
              onClick={saveAllStocks}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none mr-2"
            >
              Save All Changes
            </button>
            <button
              onClick={cancelEditMode}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditMode(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default StockMaster;
