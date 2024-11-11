import React, { useEffect, useState } from 'react';
import { fetchStockMaster, fetchStockReferences, fetchSectors, updateStock } from '../services/apiService';

type Stock = {
  id: number;
  name: string;
  referenceId: string;
  sector: string;
  brokerage: string;
};

type StockReference = {
  id: number;
  name: string;
  code: string;
};

type Sector = {
  id: number;
  name: string;
};

const StockMaster: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockReferences, setStockReferences] = useState<StockReference[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editedStocks, setEditedStocks] = useState<{ [key: number]: Stock }>({});

  // Fetch data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        const stockMasterResponse = await fetchStockMaster();
        const stockReferencesResponse = await fetchStockReferences();
        const sectorsResponse = await fetchSectors();
        // console.log('stockMasterResponse:', stockMasterResponse);
        if (stockMasterResponse.success && stockMasterResponse.StockMaster) {
          const formattedStocks = stockMasterResponse.StockMaster.map((item: any) => ({
            id: item.id,
            name: item.StockReference?.name || item.BrokerageCode,
            referenceId: item.StockReference?.code || item.BrokerageCode,
            sector: item.StockReference?.sector || 'Unknown Sector',
            brokerage: item.Brokerage?.name || 'Unknown Brokerage',
          }));
          // console.log('formattedStocks:', formattedStocks);
          setStocks(formattedStocks);
        } else {
          console.error('StockMaster data is missing or not successful:', stockMasterResponse);
        }

        if (stockReferencesResponse.success && stockReferencesResponse.stockReferences) {
          const formattedReferences = stockReferencesResponse.stockReferences.map((ref: any) => ({
            id: ref.id,
            name: ref.name,
            code: ref.code,
          }));
          setStockReferences(formattedReferences);
        } else {
          console.error('StockReferences data is missing or not successful:', stockReferencesResponse);
        }

        if (sectorsResponse.success && sectorsResponse.Sectors) {
          const formattedSectors = sectorsResponse.Sectors.map((sector: any) => ({
            id: sector.id,
            name: sector.name,
          }));
          setSectors(formattedSectors);
        } else {
          console.error('Sectors data is missing or not successful:', sectorsResponse);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Handle dropdown change for editable fields
  const handleDropdownChange = (id: number, field: keyof Stock, value: string) => {
    setEditedStocks((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Save updates for a stock
  const saveStock = async (id: number) => {
    if (editedStocks[id]) {
      try {
        const updatedStock = editedStocks[id];
        const requestBody = {
          stockId: id,
          stockReferenceId: stockReferences.find((ref) => ref.code === updatedStock.referenceId)?.id,
          sectorId: sectors.find((sector) => sector.name === updatedStock.sector)?.id,
        }
        const response = await updateStock(requestBody);

        if (response.success) {
          setStocks((prev) =>
            prev.map((stock) => (stock.id === id ? { ...stock, ...updatedStock } : stock))
          );
          setEditedStocks((prev) => {
            const updated = { ...prev };
            delete updated[id]; // Clear edited data for this stock after saving
            return updated;
          });
          // console.log(`Stock with ID ${id} updated successfully`);
        } else {
          console.error(`Failed to update stock with ID ${id}:`, response.message);
        }
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">StockMaster</h2>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Stock Name</th>
            <th className="py-2 px-4 border-b">Stock Reference</th>
            <th className="py-2 px-4 border-b">Sector</th>
            <th className="py-2 px-4 border-b">Brokerage</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td className="py-2 px-4 border-b">{stock.name}</td>
              <td className="py-2 px-4 border-b">
                <select
                  value={editedStocks[stock.id]?.referenceId || stock.referenceId}
                  onChange={(e) => handleDropdownChange(stock.id, 'referenceId', e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                >
                  <option value="">Select Reference</option>
                  {stockReferences.map((ref) => (
                    <option key={ref.id} value={ref.code}>
                      {ref.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 px-4 border-b">
                <select
                  value={editedStocks[stock.id]?.sector || stock.sector}
                  onChange={(e) => handleDropdownChange(stock.id, 'sector', e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                >
                  {/* <option value="">Select Sector</option> */}
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.name}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 px-4 border-b">
                <span className="text-gray-700">{stock.brokerage}</span>
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
