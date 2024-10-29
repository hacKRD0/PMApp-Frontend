// src/components/SectorMaster.tsx
import React, { useState } from 'react';

type Sector = {
  id: number;
  name: string;
};

const initialSectorData: Sector[] = [
  { id: 1, name: 'Energy' },
  { id: 2, name: 'Banking' },
  { id: 3, name: 'Technology' },
  // Additional sectors can be added here
];

const SectorMaster: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>(initialSectorData);
  const [editedSectors, setEditedSectors] = useState<{ [key: number]: Sector }>({});

  // Handle input changes
  const handleInputChange = (id: number, field: keyof Sector, value: string) => {
    setEditedSectors((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Save updates for a sector
  const saveSector = (id: number) => {
    if (editedSectors[id]) {
      setSectors((prev) =>
        prev.map((sector) => (sector.id === id ? { ...sector, ...editedSectors[id] } : sector))
      );
      setEditedSectors((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">SectorMaster</h2>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Sector ID</th>
            <th className="py-2 px-4 border-b">Sector Name</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sectors.map((sector) => (
            <tr key={sector.id}>
              <td className="py-2 px-4 border-b">
                <input
                  type="text"
                  value={editedSectors[sector.id]?.id || sector.id}
                  onChange={(e) => handleInputChange(sector.id, 'id', e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </td>
              <td className="py-2 px-4 border-b">
                <input
                  type="text"
                  value={editedSectors[sector.id]?.name || sector.name}
                  onChange={(e) => handleInputChange(sector.id, 'name', e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                />
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => saveSector(sector.id)}
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

export default SectorMaster;
