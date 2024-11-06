import React, { useEffect, useState } from 'react';
import { fetchSectors, updateSector, addSector, deleteSector } from '../services/apiService';

type Sector = {
  id: number;
  name: string;
};

const SectorMaster: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editedSectors, setEditedSectors] = useState<{ [key: number]: Sector }>({});
  const [newSectorName, setNewSectorName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch sectors on load
  useEffect(() => {
    const loadSectors = async () => {
      try {
        const response = await fetchSectors();
        if (response.success && response.Sectors) {
          setSectors(response.Sectors);
        } else {
          setError('Error fetching sectors');
        }
      } catch (error) {
        setError('Error loading sectors');
        console.error('Error loading sectors:', error);
      }
    };

    loadSectors();
  }, []);

  // Handle input changes
  const handleInputChange = (id: number, value: string) => {
    setEditedSectors((prev) => ({
      ...prev,
      [id]: { ...prev[id], name: value },
    }));
  };

  // Save updates for a sector
  const saveSector = async (id: number) => {
    if (editedSectors[id]) {
      try {
        const response = await updateSector(id, editedSectors[id].name);
        if (response.success) {
          setSectors((prev) =>
            prev.map((sector) => (sector.id === id ? { ...sector, ...editedSectors[id] } : sector))
          );
          setEditedSectors((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
          });
        } else {
          setError('Failed to update sector');
        }
      } catch (error) {
        setError('Error updating sector');
        console.error('Error updating sector:', error);
      }
    }
  };

  // Add a new sector
  const addNewSector = async () => {
    if (newSectorName.trim()) {
      try {
        const response = await addSector(newSectorName);
        if (response.success && response.sector) {
          setSectors((prev) => [...prev, response.sector]); // Adjusted for "sector" in response
          setNewSectorName('');
        } else {
          setError('Failed to add new sector');
        }
      } catch (error) {
        setError('Error adding new sector');
        console.error('Error adding new sector:', error);
      }
    }
  };

  // Delete a sector
  const deleteSectorById = async (id: number) => {
    try {
      const response = await deleteSector(id);
      if (response.success) {
        setSectors((prev) => prev.filter((sector) => sector.id !== id));
      } else {
        setError('Failed to delete sector');
      }
    } catch (error) {
      setError('Error deleting sector');
      console.error('Error deleting sector:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">SectorMaster</h2>

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

      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">#</th>
            <th className="py-2 px-4 border-b">Sector Name</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sectors && sectors.length > 0 ? (
            sectors.map((sector, index) => (
              <tr key={sector.id}>
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">
                  <input
                    type="text"
                    value={editedSectors[sector.id]?.name || sector.name}
                    onChange={(e) => handleInputChange(sector.id, e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-2 px-4 border-b text-center space-x-2">
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
