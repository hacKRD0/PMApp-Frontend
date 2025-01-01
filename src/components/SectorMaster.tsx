// SectorMaster.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { FaArrowUpAZ, FaArrowDownZA, FaPlus } from 'react-icons/fa6';
import { FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import {
  fetchSectors,
  addSector,
  deleteSectors,
  updateSectors,
} from '../services/apiService';

type Sector = {
  id: number;
  name: string;
  sno: number;
};

const SectorMaster: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editedSectors, setEditedSectors] = useState<{ [key: number]: Sector }>(
    {}
  );
  const [newSectorName, setNewSectorName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({
    message: '',
    type: null,
  });
  const [sorting, setSorting] = useState<'asc' | 'desc'>('asc');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Function to show notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: null }), 3000);
  };

  // Function to sort sectors and assign sno
  const sortAndAssignSno = (
    sectorsList: Sector[],
    sortOrder: 'asc' | 'desc'
  ) => {
    const sorted = [...sectorsList].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    // Assign sno based on sorted order
    const withSno = sorted.map((sector, index) => ({
      ...sector,
      sno: index + 1,
    }));

    return withSno;
  };

  // Fetch sectors on component mount and when sorting changes
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await fetchSectors();
        if (response.success && response.Sectors) {
          const sortedSectors = sortAndAssignSno(response.Sectors, sorting);
          setSectors(sortedSectors);
        } else {
          showNotification('Error fetching sectors.', 'error');
        }
      } catch (error) {
        console.error('Error loading sectors:', error);
        showNotification('Error loading sectors.', 'error');
      }
    };

    loadSectors();
  }, [sorting]);

  // Handle input change for editing sector name in edit mode
  const handleEditChange = (id: number, value: string) => {
    setEditedSectors((prev) => ({
      ...prev,
      [id]: { ...prev[id], name: value },
    }));
  };

  // Add new sector
  const addNewSector = async () => {
    if (newSectorName.trim()) {
      try {
        const response = await addSector(newSectorName.trim());
        if (response.success && response.sector) {
          const updatedSectors = [...sectors, response.sector];
          const sortedSectors = sortAndAssignSno(updatedSectors, sorting);
          setSectors(sortedSectors);
          setNewSectorName('');
          showNotification('Sector added successfully.', 'success');
        } else {
          showNotification('Failed to add sector.', 'error');
        }
      } catch (error) {
        console.error('Error adding sector:', error);
        showNotification('Error adding sector.', 'error');
      }
    }
  };

  // Handle save all edits
  const handleSaveAllEdits = async () => {
    const updates = Object.entries(editedSectors).map(([id, changes]) => ({
      sectorId: Number(id),
      sectorName: changes.name,
    }));

    if (updates.length === 0) {
      // No edits to save; exit  edit mode
      setIsEditMode(false);
      showNotification('No changes to save.', 'success');
      return;
    }

    try {
      const response = await updateSectors(updates);

      if (response.success) {
        // Update the sectors state with updated names
        setSectors((prev) =>
          prev.map((sector) => {
            const updated = updates.find((u) => u.sectorId === sector.id);
            if (updated) {
              return { ...sector, name: updated.sectorName };
            }
            return sector;
          })
        );
        setEditedSectors({});
        setIsEditMode(false);
        showNotification(
          `${updates.length} sector(s) updated successfully.`,
          'success'
        );
      } else {
        showNotification('Failed to update sectors.', 'error');
      }
    } catch (error) {
      console.error('Error saving all edits:', error);
      showNotification('Error saving all edits.', 'error');
    }
  };

  // Handle delete selected sectors
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      showNotification('No sectors selected for deletion.', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete selected sectors?')) {
      try {
        const response = await deleteSectors(Array.from(selectedIds));
        if (response.success) {
          const updatedSectors = sectors.filter(
            (sector) => !selectedIds.has(sector.id)
          );
          const sortedSectors = sortAndAssignSno(updatedSectors, sorting);
          setSectors(sortedSectors);
          setSelectedIds(new Set());
          showNotification('Selected sectors deleted successfully.', 'success');
        } else {
          showNotification('Failed to delete sectors.', 'error');
        }
      } catch (error) {
        console.error('Error deleting sectors:', error);
        showNotification('Error deleting sectors.', 'error');
      }
    }
  };

  // Handle sorting toggle
  const toggleSorting = () => {
    setSorting((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filtered sectors based on search query
  const filteredSectors = useMemo(() => {
    if (searchQuery.trim() === '') {
      return sectors;
    }
    return sectors.filter((sector) =>
      sector.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sectors]);

  // Handle Selection of All Rows
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredSectors.map((sector) => sector.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Handle Selection of Individual Rows
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4">SectorMaster</h2>

      {/* Notification */}
      {notification.type && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md ${
            notification.type === 'success'
              ? 'bg-green-200 text-green-800'
              : 'bg-red-200 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Add New Sector Field */}
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          value={newSectorName}
          onChange={(e) => {
            setNewSectorName(e.target.value);
            setSearchQuery(e.target.value);
          }}
          placeholder="Search or Add New Sector..."
          className="w-full px-2 py-1 border rounded"
          aria-label="New Sector Name"
        />
        <button
          onClick={addNewSector}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none"
          aria-label="Add Sector"
        >
          <FaPlus className="inline ml-1" />
        </button>
      </div>

      {/*  Edit Controls */}
      <div className="flex justify-between mb-4">
        <p className="self-end font-semibold">
          Total Entries: {filteredSectors.length}
        </p>
        <div className="flex items-center space-x-2">
          {/* Delete Selected Button (Visible Only in  Edit Mode) */}
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
              Delete
            </button>
          )}

          {/* Save All Edits Button (Visible Only in  Edit Mode and when there are edits) */}
          {isEditMode && Object.keys(editedSectors).length > 0 && (
            <button
              onClick={handleSaveAllEdits}
              className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
              aria-label="Save all edits"
            >
              <FaSave className="mr-1" />
              Save
            </button>
          )}

          {/*  Edit Toggle Button */}
          <button
            onClick={() => setIsEditMode((prev) => !prev)}
            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            aria-label={isEditMode ? 'Exit  edit mode' : 'Enter  edit mode'}
          >
            <FaEdit className="mr-1" />
            {isEditMode ? 'Cancel  Edit' : ' Edit'}
          </button>
        </div>
      </div>

      {/* Sectors Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            {/* Checkbox Column Header (Visible Only in  Edit Mode) */}
            {isEditMode && (
              <th className="py-2 px-4 border-b">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    filteredSectors.length > 0 &&
                    selectedIds.size === filteredSectors.length
                  }
                  className="form-checkbox h-4 w-4 text-blue-600"
                  aria-label="Select all entries"
                />
              </th>
            )}
            <th className="py-2 px-4 border-b">S.No</th>
            <th className="py-2 px-4 border-b">
              <div className="flex items-center justify-center">
                Sector Name
                {/* Sort Button */}
                <button onClick={toggleSorting}>
                  {sorting === 'asc' ? (
                    <FaArrowUpAZ className="ml-1" />
                  ) : (
                    <FaArrowDownZA className="ml-1" />
                  )}
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredSectors.length > 0 ? (
            filteredSectors.map((sector) => {
              const isSelected = selectedIds.has(sector.id);
              const isEdited = editedSectors.hasOwnProperty(sector.id);
              return (
                <tr
                  key={sector.id}
                  className="hover:bg-gray-100 transition-colors"
                >
                  {/* Checkbox Column (Visible Only in  Edit Mode) */}
                  {isEditMode && (
                    <td className="py-2 px-4 border-b text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(sector.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                        aria-label={`Select sector ${sector.name}`}
                      />
                    </td>
                  )}
                  <td className="py-2 px-4 border-b text-center">
                    {sector.sno}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedSectors[sector.id]?.name || sector.name}
                        onChange={(e) =>
                          handleEditChange(sector.id, e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded"
                        aria-label={`Edit Sector Name for ${sector.name}`}
                      />
                    ) : (
                      sector.name
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isEditMode ? 3 : 2} className="text-center py-4">
                No sectors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SectorMaster;
