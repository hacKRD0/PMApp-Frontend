// StockMaster.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchStockMasters,
  fetchSectors,
  updateStockMasters, // For batch updates
  deleteStockMasters, // For batch deletions
  addStockMaster,
  addSector,
} from '../services/apiService';
import { FaPlus, FaArrowUpAZ, FaArrowDownZA } from 'react-icons/fa6';
import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import Filter from './Filter'; // Adjust the import path as necessary
import { Sector } from './types'; // Import Sector type
import SearchableDropdown from './SearchableDropDown';

type StockMaster = {
  id: number;
  // name: string;
  code: string;
  SectorId: number;
  Sector: {
    id: number;
    name: string;
  };
};

const StockMaster: React.FC = () => {
  const [stockMasters, setStockMasters] = useState<StockMaster[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editedStockMasters, setEditedStockMasters] = useState<{
    [key: number]: Partial<StockMaster>;
  }>({});
  const [newStockMaster, setNewStockMaster] = useState({
    code: '',
    SectorId: 0,
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });
  const [isAddingSector, setIsAddingSector] = useState<{
    [key: number]: boolean;
  }>({});
  const [newSectorName, setNewSectorName] = useState<{ [key: number]: string }>(
    {}
  );
  const [codeFilter, setCodeFilter] = useState<string>('');

  // **New States for Global Edit Mode and Selection**
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter and Sort States
  const [filterSectorIds, setFilterSectorIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<'code' | 'sector'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const loadData = async () => {
      try {
        const stockMastersResponse = await fetchStockMasters();
        const sectorsResponse = await fetchSectors();

        if (stockMastersResponse.success && stockMastersResponse.stockMasters) {
          setStockMasters(stockMastersResponse.stockMasters);
        }

        if (sectorsResponse.success && sectorsResponse.Sectors) {
          setSectors(sectorsResponse.Sectors);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setNotification({
          message: 'Error loading data.',
          type: 'error',
        });
        setTimeout(() => setNotification({ message: '', type: null }), 2000);
      }
    };

    loadData();
  }, []);

  // Sorting and Filtering Logic
  const filteredStockMasters = useMemo(() => {
    let filtered = stockMasters;

    if (filterSectorIds.length > 0) {
      filtered = filtered.filter((stock) =>
        filterSectorIds.includes(stock.SectorId)
      );
    }

    if (codeFilter.trim() !== '') {
      filtered = filtered.filter((stock) =>
        stock.code.toLowerCase().includes(codeFilter.trim().toLowerCase())
      );
    }

    return filtered;
  }, [stockMasters, filterSectorIds, codeFilter]);

  const sortedStockMasters = useMemo(() => {
    const sorted = [...filteredStockMasters].sort((a, b) => {
      let compareA: string;
      let compareB: string;

      if (sortField === 'code') {
        compareA = a.code.toLowerCase();
        compareB = b.code.toLowerCase();
      } else {
        compareA = a.Sector.name.toLowerCase();
        compareB = b.Sector.name.toLowerCase();
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredStockMasters, sortField, sortOrder]);

  // **Handle Edge Cases: Deselect entries not in the filtered list when filter changes**
  useEffect(() => {
    setSelectedIds((prevSelected) => {
      const filteredIds = new Set(sortedStockMasters.map((stock) => stock.id));
      const updatedSelected = new Set<number>();
      prevSelected.forEach((id) => {
        if (filteredIds.has(id)) {
          updatedSelected.add(id);
        }
      });
      return updatedSelected;
    });
  }, [sortedStockMasters]);

  // Notification handler
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: null }), 2000);
  };

  // Handle input change for editing stock masters
  const handleInputChange = (
    id: number,
    field: keyof StockMaster,
    value: string | number
  ) => {
    setEditedStockMasters((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Add new stock master
  const addNewStockMaster = async () => {
    const { code, SectorId } = newStockMaster;
    if (code.trim()) {
      try {
        const response = await addStockMaster(newStockMaster);
        if (response.success && response.stockMaster) {
          setStockMasters((prev) => [...prev, response.stockMaster]);
          setNewStockMaster({ code: '', SectorId: 0 });
          showNotification(
            'New stock reference added successfully.',
            'success'
          );
        } else {
          showNotification('Failed to add stock reference.', 'error');
        }
      } catch (error) {
        console.error('Error adding stock reference:', error);
        showNotification('An error occurred while adding.', 'error');
      }
    } else {
      showNotification('Please fill in all fields.', 'error');
    }
  };

  // Cancel adding sector
  const cancelAddingSector = (
    id: number,
    setIsAddingSector: React.Dispatch<
      React.SetStateAction<{ [key: number]: boolean }>
    >,
    setNewSectorName: React.Dispatch<
      React.SetStateAction<{ [key: number]: string }>
    >
  ) => {
    setIsAddingSector((prev) => ({ ...prev, [id]: false }));
    setNewSectorName((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // Handle adding a new sector
  const handleAddSector = async (
    id: number,
    newSectorName: { [key: number]: string },
    setSectors: React.Dispatch<React.SetStateAction<Sector[]>>,
    setNotification: React.Dispatch<
      React.SetStateAction<{
        message: string;
        type: 'success' | 'error' | null;
      }>
    >,
    setIsAddingSector: React.Dispatch<
      React.SetStateAction<{ [key: number]: boolean }>
    >,
    setNewSectorName: React.Dispatch<
      React.SetStateAction<{ [key: number]: string }>
    >
  ) => {
    try {
      const sectorName = newSectorName[id]?.trim();
      if (!sectorName) {
        showNotification('Sector name cannot be empty.', 'error');
        return;
      }

      const response = await addSector(sectorName);

      if (response.success && response.sector) {
        setSectors((prev) => [...prev, response.sector]);
        showNotification('Sector added successfully.', 'success');

        setEditedStockMasters((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            SectorId: response.sector.id,
          },
        }));

        // Reset the adding state
        setIsAddingSector((prev) => ({ ...prev, [id]: false }));
        setNewSectorName((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      } else {
        showNotification('Failed to add sector.', 'error');
      }
    } catch (error) {
      console.error('Error adding sector:', error);
      showNotification('An error occurred while adding the sector.', 'error');
    }
  };

  // Show add sector input
  const showAddSectorInput = (
    id: number,
    setIsAddingSector: React.Dispatch<
      React.SetStateAction<{ [key: number]: boolean }>
    >
  ) => {
    setIsAddingSector((prev) => ({ ...prev, [id]: true }));
  };

  // Handle filter change from Filter component
  const handleFilterChange = (filters: {
    sectorIds?: number[];
    brokerageIds?: number[];
    code?: string;
  }) => {
    setFilterSectorIds(filters.sectorIds || []);
    // If other filters were active, handle them accordingly
    // For current use case, only sector filter is active
  };

  // **Handle Global Edit Mode Toggle**
  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    if (isEditMode) {
      // Exiting edit mode, clear all selections and edits
      setSelectedIds(new Set());
      setEditedStockMasters({});
    }
  };

  // **Handle Selection of All Rows**
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = sortedStockMasters.map((stock) => stock.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  // **Handle Selection of Individual Rows**
  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // **Handle Deletion of Selected Rows (Batch Deletion)**
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      showNotification('No entries selected for deletion.', 'error');
      return;
    }

    // Confirm deletion
    if (
      !window.confirm('Are you sure you want to delete the selected entries?')
    ) {
      return;
    }

    try {
      const idsToDelete = Array.from(selectedIds);
      const response = await deleteStockMasters(idsToDelete);

      if (response.success) {
        // All deletions successful
        setStockMasters((prev) =>
          prev.filter((ref) => !selectedIds.has(ref.id))
        );
        showNotification('Selected entries deleted successfully.', 'success');
        setSelectedIds(new Set());
      } else {
        // Deletion failed
        showNotification(
          response.message || 'Failed to delete selected entries.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error deleting selected entries:', error);
      showNotification('An error occurred while deleting.', 'error');
    }
  };

  // **Handle Saving All Edited Entries in Batch**
  const handleSaveAllEdits = async () => {
    const updates = Object.entries(editedStockMasters).map(([id, changes]) => ({
      stockMasterId: Number(id),
      sectorId: changes.SectorId as number,
    }));

    if (updates.length === 0) {
      // No edits to save; exit edit mode
      setIsEditMode(false);
      showNotification('No changes to save.', 'success');
      return;
    }

    try {
      const response = await updateStockMasters(updates);

      if (response.success) {
        // Update the local state with the new sectors
        setStockMasters((prev) =>
          prev.map((ref) => {
            const updated = updates.find((u) => u.stockMasterId === ref.id);
            if (updated) {
              const newSector = sectors.find((s) => s.id === updated.sectorId);
              return {
                ...ref,
                SectorId: updated.sectorId,
                Sector: newSector ? { ...newSector } : ref.Sector,
              };
            }
            return ref;
          })
        );
        showNotification('All changes saved successfully.', 'success');
        // Exit edit mode and clear selections and edits
        setIsEditMode(false);
        setSelectedIds(new Set());
        setEditedStockMasters({});
      } else {
        showNotification('Failed to save changes.', 'error');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      showNotification('An error occurred while saving changes.', 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4">Stock Master Table</h2>

      {/* Notification */}
      {notification.type && (
        <div
          className={`fixed bottom-4 z-40 right-4 px-4 py-2 rounded shadow-md ${
            notification.type === 'success'
              ? 'bg-green-200 text-green-800'
              : 'bg-red-200 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Add New Stock Master Form */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={newStockMaster.code}
            onChange={(e) => {
              setNewStockMaster((prev) => ({
                ...prev,
                code: e.target.value,
              }));
              setCodeFilter(e.target.value); // Update codeFilter for filtering
            }}
            placeholder="Stock Code (Search)"
            className="px-2 py-1 border rounded"
          />
          <select
            value={newStockMaster.SectorId}
            onChange={(e) =>
              setNewStockMaster((prev) => ({
                ...prev,
                SectorId: Number(e.target.value),
              }))
            }
            className="px-2 py-1 border rounded"
          >
            <option value="">Select Sector</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={addNewStockMaster}
          className="mt-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none"
        >
          Add
        </button>
      </div>

      {/* Filter and Edit Controls */}
      <div className="flex justify-between mb-4">
        <p className="self-end font-semibold">
          Total Entries: {sortedStockMasters.length}
        </p>
        <div className="flex items-center space-x-2">
          {/* Delete Selected Button (Visible Only in Edit Mode) */}
          {isEditMode && (
            <button
              onClick={handleDeleteSelected}
              className={`flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none ${
                selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={selectedIds.size === 0}
              aria-label="Delete selected entries"
            >
              <FaTrash className="mr-1" />
              Delete Selected
            </button>
          )}

          {/* Save All Edits Button (Visible Only in Edit Mode and when there are edits) */}
          {isEditMode && Object.keys(editedStockMasters).length > 0 && (
            <button
              onClick={handleSaveAllEdits}
              className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
              aria-label="Save all edits"
            >
              <FaSave className="mr-1" />
              Save All
            </button>
          )}

          {/* Edit Button */}
          <button
            onClick={toggleEditMode}
            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
          >
            <FaEdit className="mr-1" />
            {isEditMode ? 'Cancel Edit' : 'Edit'}
          </button>

          {/* Filter Component */}
          <Filter
            availableFilters={['sector']}
            sectors={sectors}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Stock Masters Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            {/* Checkbox Column Header (Visible Only in Edit Mode) */}
            {isEditMode && (
              <th className="py-2 px-4 border-b">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    sortedStockMasters.length > 0 &&
                    selectedIds.size === sortedStockMasters.length
                  }
                  className="form-checkbox h-4 w-4 text-blue-600"
                  aria-label="Select all entries"
                />
              </th>
            )}
            <th className="py-2 px-4 border-b">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    if (sortField === 'code') {
                      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                    } else {
                      setSortField('code');
                      setSortOrder('asc');
                    }
                  }}
                  className="flex justify-center items-center space-x-1 focus:outline-none"
                  aria-label={`Sort by Stock Code ${
                    sortField === 'code' && sortOrder === 'asc'
                      ? 'descending'
                      : 'ascending'
                  }`}
                >
                  <span>Stock Code</span>
                  {sortField === 'code' ? (
                    sortOrder === 'asc' ? (
                      <FaArrowUpAZ />
                    ) : (
                      <FaArrowDownZA />
                    )
                  ) : (
                    <FaArrowUpAZ />
                  )}
                </button>
              </div>
            </th>
            <th className="py-2 px-4 border-b">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    if (sortField === 'sector') {
                      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                    } else {
                      setSortField('sector');
                      setSortOrder('asc');
                    }
                  }}
                  className="flex justify-center items-center space-x-1 focus:outline-none"
                  aria-label={`Sort by Sector ${
                    sortField === 'sector' && sortOrder === 'asc'
                      ? 'descending'
                      : 'ascending'
                  }`}
                >
                  <span>Sector</span>
                  {sortField === 'sector' ? (
                    sortOrder === 'asc' ? (
                      <FaArrowUpAZ />
                    ) : (
                      <FaArrowDownZA />
                    )
                  ) : (
                    <FaArrowUpAZ />
                  )}
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStockMasters.length > 0 ? (
            sortedStockMasters.map((ref) => {
              const isSelected = selectedIds.has(ref.id);
              const editedSectorId =
                editedStockMasters[ref.id]?.SectorId || ref.SectorId;
              return (
                <tr
                  key={ref.id}
                  className={`${
                    isSelected ? 'bg-blue-50' : ''
                  } hover:bg-gray-100 transition-colors`}
                >
                  {/* Checkbox Column (Visible Only in Edit Mode) */}
                  {isEditMode && (
                    <td className="py-2 px-4 border-b">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(ref.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                        aria-label={`Select entry ${ref.code}`}
                      />
                    </td>
                  )}
                  <td className="py-2 px-4 border-b text-center">{ref.code}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {isEditMode ? (
                      <div className="flex items-center justify-center">
                        {isAddingSector[ref.id] ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newSectorName[ref.id] || ''}
                              onChange={(e) =>
                                setNewSectorName((prev) => ({
                                  ...prev,
                                  [ref.id]: e.target.value,
                                }))
                              }
                              placeholder="Enter sector name"
                              className="w-full px-2 py-1 border rounded"
                            />
                            <button
                              onClick={() =>
                                handleAddSector(
                                  ref.id,
                                  newSectorName,
                                  setSectors,
                                  setNotification,
                                  setIsAddingSector,
                                  setNewSectorName
                                )
                              }
                              className="text-green-500 px-2"
                              aria-label="Confirm adding sector"
                            >
                              ✔
                            </button>
                            <button
                              onClick={() =>
                                cancelAddingSector(
                                  ref.id,
                                  setIsAddingSector,
                                  setNewSectorName
                                )
                              }
                              className="text-red-500 px-2"
                              aria-label="Cancel adding sector"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <SearchableDropdown
                              options={sectors}
                              value={editedSectorId}
                              onChange={(selectedSectorId) =>
                                handleInputChange(
                                  ref.id,
                                  'SectorId',
                                  Number(selectedSectorId)
                                )
                              }
                              placeholder="Select Sector"
                              labelExtractor={(sector) => sector.name}
                              valueExtractor={(sector) => sector.id}
                              ariaLabel={`Edit Sector for ${ref.code}`}
                              className="w-full min-w-48"
                            />
                            <button
                              onClick={() =>
                                showAddSectorInput(ref.id, setIsAddingSector)
                              }
                              className="text-green-500 px-2"
                              aria-label="Add new sector"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      ref.Sector?.name || 'Unknown Sector'
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              {isEditMode && (
                <td className="py-2 px-4 border-b" colSpan={3}>
                  {/* Empty cell for checkbox column */}
                </td>
              )}
              <td className="text-center py-4" colSpan={isEditMode ? 3 : 2}>
                No stock references available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockMaster;
