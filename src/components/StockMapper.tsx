// StockMapper.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  fetchStockMapper,
  fetchStockMasters,
  fetchSectors,
  getBrokerages,
  updateStockMapper,
  addStockMaster, // Ensure this API exists
} from '../services/apiService';
import Filter from './Filter'; // Adjust the import path as necessary
import { FaArrowUpAZ, FaArrowDownZA } from 'react-icons/fa6';
import { FaEdit, FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import SearchableDropdown from './SearchableDropDown'; // Ensure correct casing

// Define your types
type Stock = {
  id: number;
  brokerageStockCode: string;
  referenceId: string;
  brokerage: string;
  sector: string; // Assuming each stock has a sector
};

type StockMaster = {
  id: number;
  // name: string;
  code: string;
};

type Sector = {
  id: number;
  name: string;
};

type Brokerage = {
  id: number;
  name: string;
};

const StockMapper: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockMasters, setStockMasters] = useState<StockMaster[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [brokerages, setBrokerages] = useState<Brokerage[]>([]);
  const [editedStocks, setEditedStocks] = useState<{ [key: number]: string }>(
    {}
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // State to track which rows are in "add mode"
  const [addingStockMaster, setAddingStockMaster] = useState<{
    [key: number]: boolean;
  }>({});

  // State to track input values for adding new StockMasters
  const [newStockMasterInput, setNewStockMasterInput] = useState<{
    [key: number]: string;
  }>({});

  // Filter states
  const [filters, setFilters] = useState<{
    sectorIds?: number[];
    brokerageIds?: number[];
    code?: string;
  }>({});

  // Sorting states
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stock;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Memoize availableFilters to prevent unnecessary re-renders
  const availableFilters = useMemo<Array<'sector' | 'brokerage' | 'code'>>(
    () => ['sector', 'brokerage', 'code'],
    []
  );

  // Fetch all necessary data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          stockMapperResponse,
          stockMastersResponse,
          sectorsResponse,
          brokeragesResponse,
        ] = await Promise.all([
          fetchStockMapper(),
          fetchStockMasters(),
          fetchSectors(),
          getBrokerages(),
        ]);

        // Process Stock Mapper Data
        if (stockMapperResponse.success && stockMapperResponse.stockMapper) {
          const formattedStocks: Stock[] = stockMapperResponse.stockMapper.map(
            (item: any) => ({
              id: item.id,
              brokerageStockCode: item.BrokerageCode,
              referenceId: item.StockMaster?.code || '-',
              brokerage: item.Brokerage?.name || 'Unknown Brokerage',
              sector: item.StockMaster?.Sector?.name || 'Unknown Sector', // Ensure Sector is derived via StockMaster
            })
          );
          formattedStocks.sort((a, b) =>
            a.referenceId.localeCompare(b.referenceId)
          );
          setStocks(formattedStocks);
        } else {
          console.error(
            'StockMapper data is missing or not successful:',
            stockMapperResponse
          );
          showNotification('error', 'Error fetching stock mappings.');
        }

        // Process Stock Masters Data
        if (stockMastersResponse.success && stockMastersResponse.stockMasters) {
          const formattedStockMasters: StockMaster[] =
            stockMastersResponse.stockMasters.map((ref: any) => ({
              id: ref.id,
              name: ref.name,
              code: ref.code,
            }));
          formattedStockMasters.sort((a, b) => a.code.localeCompare(b.code));
          setStockMasters(formattedStockMasters);
        } else {
          console.error(
            'StockMasters data is missing or not successful:',
            stockMastersResponse
          );
          showNotification('error', 'Error fetching stock masters.');
        }

        // Process Sectors Data
        if (sectorsResponse.success && sectorsResponse.Sectors) {
          const formattedSectors: Sector[] = sectorsResponse.Sectors.map(
            (sector: any) => ({
              id: sector.id,
              name: sector.name,
            })
          );
          setSectors(formattedSectors);
        } else {
          console.error(
            'Sectors data is missing or not successful:',
            sectorsResponse
          );
          showNotification('error', 'Error fetching sectors.');
        }

        // Process Brokerages Data
        if (brokeragesResponse.success && brokeragesResponse.Brokerages) {
          const formattedBrokerages: Brokerage[] =
            brokeragesResponse.Brokerages.map((brokerage: any) => ({
              id: brokerage.id,
              name: brokerage.name,
            }));
          setBrokerages(formattedBrokerages);
        } else {
          console.error(
            'Brokerages data is missing or not successful:',
            brokeragesResponse
          );
          showNotification('error', 'Error fetching brokerages.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('error', 'Error loading data.');
      }
    };

    loadData();
  }, []);

  // Show notification
  const showNotification = useCallback(
    (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  // Handle filter changes - memoize to prevent re-renders
  const handleFilterChange = useCallback(
    (newFilters: {
      sectorIds?: number[];
      brokerageIds?: number[];
      code?: string;
    }) => {
      setFilters(newFilters);
    },
    []
  );

  // Handle sorting
  const handleSort = (key: keyof Stock) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle input change for editing sector reference
  const handleDropdownChange = (id: number, value: string) => {
    setEditedStocks((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Save all edited stocks
  const saveAllStocks = async () => {
    const stocksToUpdate = Object.entries(editedStocks).map(
      ([id, referenceCode]) => {
        const stockId = parseInt(id, 10);
        const stockMaster = stockMasters.find(
          (ref) => ref.code === referenceCode
        );

        if (!stockMaster) {
          showNotification(
            'error',
            `Invalid Stock Master code for stock ID ${id}.`
          );
          return null;
        }

        return { stockId, stockMasterId: stockMaster.id };
      }
    );

    const validStocksToUpdate = stocksToUpdate.filter(
      (stock): stock is { stockId: number; stockMasterId: number } =>
        stock !== null
    );

    if (validStocksToUpdate.length === 0) {
      showNotification('error', 'No valid updates to save.');
      return;
    }

    try {
      const response = await updateStockMapper(validStocksToUpdate);

      if (response.success) {
        const updatedStockMap = new Map(
          response.updatedStocks.map((stock: any) => {
            const stockMaster = stockMasters.find(
              (ref) => ref.id === stock.StockMasterId
            );

            if (!stockMaster) {
              console.error(
                `StockMaster not found for StockMasterId: ${stock.StockMasterId}`
              );
              return [stock.id, null];
            }

            return [stock.id, stockMaster.code];
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
        showNotification(
          'success',
          `${validStocksToUpdate.length} stock(s) updated successfully!`
        );
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

  // Cancel edit mode
  const cancelEditMode = () => {
    setEditedStocks({});
    setIsEditMode(false);
    setAddingStockMaster({});
    setNewStockMasterInput({});
  };

  // Apply filters
  const filteredStocks = useMemo(() => {
    let filtered = [...stocks];

    if (filters.code) {
      filtered = filtered.filter((stock) =>
        stock.referenceId.toLowerCase().includes(filters.code!.toLowerCase())
      );
    }

    if (filters.sectorIds && filters.sectorIds.length > 0) {
      const selectedSectorNames = sectors
        .filter((sector) => filters.sectorIds!.includes(sector.id))
        .map((sector) => sector.name.toLowerCase());
      filtered = filtered.filter((stock) =>
        selectedSectorNames.includes(stock.sector.toLowerCase())
      );
    }

    if (filters.brokerageIds && filters.brokerageIds.length > 0) {
      const selectedBrokerageNames = brokerages
        .filter((brokerage) => filters.brokerageIds!.includes(brokerage.id))
        .map((brokerage) => brokerage.name.toLowerCase());
      filtered = filtered.filter((stock) =>
        selectedBrokerageNames.includes(stock.brokerage.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aKey = a[sortConfig.key];
        const bKey = b[sortConfig.key];

        if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [stocks, filters, sortConfig, sectors, brokerages]);

  // Handlers for "Add StockMaster" functionality
  const handleAddStockMasterClick = (id: number) => {
    setAddingStockMaster((prev) => ({ ...prev, [id]: true }));
    setNewStockMasterInput((prev) => ({ ...prev, [id]: '' }));
  };

  const handleAddStockMasterInputChange = (id: number, value: string) => {
    setNewStockMasterInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleConfirmAddStockMaster = async (id: number) => {
    const inputValue = newStockMasterInput[id].trim();
    if (inputValue === '') {
      // Only whitespace, exit add mode
      setAddingStockMaster((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setNewStockMasterInput((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      return;
    }

    // Find the stock's sectorId
    const stock = stocks.find((s) => s.id === id);
    const sector = sectors.find((s) => s.name === stock?.sector);
    const sectorId = sector ? sector.id : 0; // Handle 0 or default sectorId appropriately

    try {
      const response = await addStockMaster({
        code: inputValue,
        SectorId: sectorId,
      });

      if (response.success && response.stockMaster) {
        // Add to stockMasters
        setStockMasters((prev) => [...prev, response.stockMaster]);
        // Update editedStocks to select the new stockMaster
        setEditedStocks((prev) => ({
          ...prev,
          [id]: response.stockMaster.code,
        }));
        // Exit add mode
        setAddingStockMaster((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setNewStockMasterInput((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        // Show notification
        showNotification('success', 'Stock Master added successfully.');
      } else {
        showNotification('error', 'Failed to add Stock Master.');
      }
    } catch (error) {
      console.error('Error adding Stock Master:', error);
      showNotification('error', 'An error occurred while adding Stock Master.');
    }
  };

  const handleCancelAddStockMaster = (id: number) => {
    setAddingStockMaster((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setNewStockMasterInput((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative z-10">
      <h2 className="text-xl font-semibold mb-4">Stock Mapper</h2>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 z-40 px-4 py-2 rounded shadow-md text-white text-sm ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Controls: Edit Button and Total Entries */}
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold">Total Entries: {filteredStocks.length}</p>
        <div className="flex space-x-2">
          {isEditMode ? (
            <>
              <button
                onClick={saveAllStocks}
                className="flex items-center bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none"
                aria-label="Save All Changes"
              >
                <FaSave className="mr-2" />
                Save All Changes
              </button>
              <button
                onClick={cancelEditMode}
                className="flex items-center bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 focus:outline-none"
                aria-label="Cancel Edit Mode"
              >
                <FaTrash className="mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none"
              aria-label="Enter Edit Mode"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
          )}
          {/* Filter Component */}
          <Filter
            availableFilters={availableFilters}
            sectors={sectors}
            brokerages={brokerages}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Stock Mapper Table */}
      <div className="relative overflow-x-auto">
        {/* Wrapping table in a div to manage overflow */}
        <table className="min-w-full bg-white border border-gray-200 rounded-lg mt-4">
          <thead>
            <tr>
              {/* Conditional Checkbox Header for Selection in Edit Mode */}
              {isEditMode && (
                <th className="py-2 px-4 border-b">
                  {/* You can add a "Select All" checkbox here if needed */}
                </th>
              )}
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('brokerageStockCode')}
                aria-label="Sort Brokerage Stock Code"
              >
                <div className="flex items-center justify-center">
                  Brokerage Stock Code
                  {sortConfig?.key === 'brokerageStockCode' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUpAZ className="ml-1" />
                    ) : (
                      <FaArrowDownZA className="ml-1" />
                    )
                  ) : (
                    <FaArrowUpAZ className="ml-1 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('referenceId')}
                aria-label="Sort Stock Master Code"
              >
                <div className="flex items-center justify-center">
                  Stock Master Code
                  {sortConfig?.key === 'referenceId' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUpAZ className="ml-1" />
                    ) : (
                      <FaArrowDownZA className="ml-1" />
                    )
                  ) : (
                    <FaArrowUpAZ className="ml-1 opacity-50" />
                  )}
                </div>
              </th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={() => handleSort('brokerage')}
                aria-label="Sort Brokerage"
              >
                <div className="flex items-center justify-center">
                  Brokerage
                  {sortConfig?.key === 'brokerage' ? (
                    sortConfig.direction === 'asc' ? (
                      <FaArrowUpAZ className="ml-1" />
                    ) : (
                      <FaArrowDownZA className="ml-1" />
                    )
                  ) : (
                    <FaArrowUpAZ className="ml-1 opacity-50" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr
                key={stock.id}
                className="hover:bg-gray-100 transition-colors"
              >
                {/* Optional: Checkbox for selecting rows in edit mode */}
                {isEditMode && (
                  <td className="py-2 px-4 border-b text-center">
                    <input
                      type="checkbox"
                      checked={editedStocks.hasOwnProperty(stock.id)}
                      onChange={() => {
                        if (editedStocks.hasOwnProperty(stock.id)) {
                          // Deselect
                          const updated = { ...editedStocks };
                          delete updated[stock.id];
                          setEditedStocks(updated);
                        } else {
                          // Select and initialize with current referenceId
                          setEditedStocks((prev) => ({
                            ...prev,
                            [stock.id]: stock.referenceId,
                          }));
                        }
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600"
                      aria-label={`Select stock ${stock.brokerageStockCode}`}
                    />
                  </td>
                )}
                <td className="py-2 px-4 border-b text-center">
                  {stock.brokerageStockCode}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {isEditMode ? (
                    addingStockMaster[stock.id] ? (
                      // Render input field with tick and 'x' buttons
                      <div className="flex items-center justify-center space-x-2">
                        <input
                          type="text"
                          value={newStockMasterInput[stock.id] || ''}
                          onChange={(e) =>
                            handleAddStockMasterInputChange(
                              stock.id,
                              e.target.value
                            )
                          }
                          placeholder="Enter StockMaster Code"
                          className="px-2 py-1 border rounded w-48"
                          aria-label={`Enter new Stock Master Code for ${stock.brokerageStockCode}`}
                        />
                        <button
                          onClick={() => handleConfirmAddStockMaster(stock.id)}
                          className="text-green-500 px-2"
                          aria-label="Confirm adding Stock Master"
                        >
                          ✔
                        </button>
                        <button
                          onClick={() => handleCancelAddStockMaster(stock.id)}
                          className="text-red-500 px-2"
                          aria-label="Cancel adding Stock Master"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      // Render SearchableDropdown with '+' button
                      <div className="flex items-center justify-center space-x-2">
                        <SearchableDropdown
                          options={stockMasters}
                          value={editedStocks[stock.id] || stock.referenceId}
                          onChange={(value) =>
                            handleDropdownChange(stock.id, value)
                          }
                          placeholder="Select StockMaster"
                          labelExtractor={(stockMaster) => stockMaster.code}
                          valueExtractor={(stockMaster) => stockMaster.code}
                          ariaLabel={`Edit Stock Master Code for ${stock.brokerageStockCode}`}
                          className="w-48"
                        />
                        <button
                          onClick={() => handleAddStockMasterClick(stock.id)}
                          className="text-blue-500 px-2"
                          aria-label={`Add new Stock Master for ${stock.brokerageStockCode}`}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    )
                  ) : (
                    <span>{stock.referenceId}</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  {stock.brokerage}
                </td>
              </tr>
            ))}
            {filteredStocks.length === 0 && (
              <tr>
                <td
                  colSpan={isEditMode ? 4 : 3}
                  className="text-center py-4 text-gray-500"
                >
                  No stocks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save and Cancel Buttons when in Edit Mode */}
      {isEditMode && (
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={saveAllStocks}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
            aria-label="Save All Changes"
          >
            <FaSave className="mr-2" />
            Save All Changes
          </button>
          <button
            onClick={cancelEditMode}
            className="flex items-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none"
            aria-label="Cancel Edit Mode"
          >
            <FaTrash className="mr-2" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default StockMapper;
