import React, { useEffect, useState } from 'react';
import {
  fetchSectors,
  updateSector,
  addSector,
  deleteSector,
} from '../services/apiService';

type Sector = {
  id: number;
  name: string;
};

const SectorMaster: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editedSectors, setEditedSectors] = useState<{ [key: number]: Sector }>(
    {}
  );
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [newSectorName, setNewSectorName] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({
    message: '',
    type: null,
  });

  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await fetchSectors();
        if (response.success && response.Sectors) {
          setSectors(response.Sectors);
        } else {
          showNotification('Error fetching sectors.', 'error');
        }
      } catch (error) {
        console.error('Error loading sectors:', error);
        showNotification('Error loading sectors.', 'error');
      }
    };

    loadSectors();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: null }), 2000);
  };

  const handleInputChange = (id: number, value: string) => {
    setEditedSectors((prev) => ({
      ...prev,
      [id]: { ...prev[id], name: value },
    }));
  };

  const saveSector = async (id: number) => {
    if (editedSectors[id]) {
      try {
        const response = await updateSector(id, editedSectors[id].name);
        if (response.success) {
          setSectors((prev) =>
            prev.map((sector) =>
              sector.id === id ? { ...sector, ...editedSectors[id] } : sector
            )
          );
          setEditedSectors((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
          setEditMode((prev) => ({ ...prev, [id]: false }));
          showNotification('Sector updated successfully.', 'success');
        } else {
          showNotification('Failed to update sector.', 'error');
        }
      } catch (error) {
        console.error('Error updating sector:', error);
        showNotification('Error updating sector.', 'error');
      }
    }
  };

  const cancelEdit = (id: number) => {
    setEditMode((prev) => ({ ...prev, [id]: false }));
    setEditedSectors((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const addNewSector = async () => {
    if (newSectorName.trim()) {
      try {
        const response = await addSector(newSectorName);
        if (response.success && response.sector) {
          setSectors((prev) => [...prev, response.sector]);
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

  const deleteSectorById = async (id: number) => {
    try {
      const response = await deleteSector(id);
      if (response.success) {
        setSectors((prev) => prev.filter((sector) => sector.id !== id));
        showNotification('Sector deleted successfully.', 'success');
      } else {
        showNotification('Failed to delete sector.', 'error');
      }
    } catch (error) {
      console.error('Error deleting sector:', error);
      showNotification('Error deleting sector.', 'error');
    }
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
          onChange={(e) => setNewSectorName(e.target.value)}
          placeholder="New sector name"
          className="w-full px-2 py-1 border rounded"
        />
        <button
          onClick={addNewSector}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none"
        >
          Add
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">#</th>
            <th className="py-2 px-4 border-b">Sector Name</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sectors.length > 0 ? (
            sectors.map((sector, index) => (
              <tr key={sector.id}>
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">
                  {editMode[sector.id] ? (
                    <input
                      type="text"
                      value={editedSectors[sector.id]?.name || sector.name}
                      onChange={(e) =>
                        handleInputChange(sector.id, e.target.value)
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    sector.name
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center space-x-2">
                  {editMode[sector.id] ? (
                    <>
                      <button
                        onClick={() => saveSector(sector.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => deleteSectorById(sector.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => cancelEdit(sector.id)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 focus:outline-none"
                      >
                        X
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        setEditMode((prev) => ({ ...prev, [sector.id]: true }))
                      }
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center py-4">
                No sectors available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SectorMaster;
