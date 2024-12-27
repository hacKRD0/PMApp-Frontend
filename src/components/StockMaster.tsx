import React, { useEffect, useState } from 'react';
import {
  fetchStockReferences,
  fetchSectors,
  updateStockReference,
  deleteStockReference,
  addStockReference,
  addSector,
} from '../services/apiService';
import { FaPlus } from 'react-icons/fa';

type StockReference = {
  id: number;
  name: string;
  code: string;
  SectorId: number;
  Sector: {
    id: number;
    name: string;
  };
};

type Sector = {
  id: number;
  name: string;
};

const StockReferenceMaster: React.FC = () => {
  const [stockReferences, setStockReferences] = useState<StockReference[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editedStockReferences, setEditedStockReferences] = useState<{
    [key: number]: Partial<StockReference>;
  }>({});
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [newStockReference, setNewStockReference] = useState({
    name: '',
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const stockReferencesResponse = await fetchStockReferences();
        const sectorsResponse = await fetchSectors();

        if (
          stockReferencesResponse.success &&
          stockReferencesResponse.stockReferences
        ) {
          setStockReferences(stockReferencesResponse.stockReferences);
        }

        if (sectorsResponse.success && sectorsResponse.Sectors) {
          setSectors(sectorsResponse.Sectors);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (
    id: number,
    field: keyof StockReference,
    value: string | number
  ) => {
    setEditedStockReferences((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveStockReference = async (id: number) => {
    if (editedStockReferences[id]) {
      try {
        const updatedData = editedStockReferences[id];
        const response = await updateStockReference({
          stockReferenceId: id,
          sectorId: updatedData.SectorId as number,
        });

        if (response.success) {
          setStockReferences((prev) =>
            prev.map((ref) =>
              ref.id === id
                ? {
                    ...ref,
                    SectorId: updatedData.SectorId as number,
                    Sector: sectors.find(
                      (sector) => sector.id === updatedData.SectorId
                    )!,
                  }
                : ref
            )
          );
          setEditMode((prev) => ({ ...prev, [id]: false }));
          setNotification({
            message: 'Stock reference updated successfully.',
            type: 'success',
          });
        } else {
          setNotification({
            message: 'Failed to update stock reference.',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error updating stock reference:', error);
        setNotification({
          message: 'An error occurred while updating.',
          type: 'error',
        });
      } finally {
        setTimeout(() => setNotification({ message: '', type: null }), 2000);
      }
    }
  };

  const cancelEdit = (id: number) => {
    setEditMode((prev) => ({ ...prev, [id]: false }));
    setEditedStockReferences((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const deleteStockReferenceById = async (id: number) => {
    try {
      const response = await deleteStockReference(id);
      if (response.success) {
        setStockReferences((prev) => prev.filter((ref) => ref.id !== id));
        setNotification({
          message: 'Stock reference deleted successfully.',
          type: 'success',
        });
      } else {
        setNotification({
          message: 'Failed to delete stock reference.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting stock reference:', error);
      setNotification({
        message: 'An error occurred while deleting.',
        type: 'error',
      });
    } finally {
      setTimeout(() => setNotification({ message: '', type: null }), 2000);
    }
  };

  const addNewStockReference = async () => {
    if (
      newStockReference.name.trim() &&
      newStockReference.code.trim() &&
      newStockReference.SectorId
    ) {
      try {
        const response = await addStockReference(newStockReference);
        if (response.success && response.stockReference) {
          setStockReferences((prev) => [...prev, response.stockReference]);
          setNewStockReference({ name: '', code: '', SectorId: 0 });
          setNotification({
            message: 'New stock reference added successfully.',
            type: 'success',
          });
        } else {
          setNotification({
            message: 'Failed to add stock reference.',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Error adding stock reference:', error);
        setNotification({
          message: 'An error occurred while adding.',
          type: 'error',
        });
      } finally {
        setTimeout(() => setNotification({ message: '', type: null }), 2000);
      }
    }
  };

  const cancelAddingSector = (id, setIsAddingSector, setNewSectorName) => {
    setIsAddingSector((prev) => ({ ...prev, [id]: false }));
    setNewSectorName((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleAddSector = async (
    id,
    newSectorName,
    setSectors,
    setNotification,
    setIsAddingSector,
    setNewSectorName
  ) => {
    try {
      const newSector = newSectorName[id]?.trim();
      if (!newSector) return;

      const response = await addSector(newSector);

      if (response.success && response.sector) {
        setSectors((prev) => [...prev, response.sector]);
        setNotification({
          message: 'Sector added successfully.',
          type: 'success',
        });

        setEditedStockReferences((prev) => ({
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
        setNotification({
          message: 'Failed to add sector.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error adding sector:', error);
      setNotification({
        message: 'An error occurred while adding the sector.',
        type: 'error',
      });
    } finally {
      setTimeout(() => setNotification({ message: '', type: null }), 2000);
    }
  };

  const showAddSectorInput = (id, setIsAddingSector) => {
    setIsAddingSector((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <h2 className="text-xl font-semibold mb-4">Stock Master Table</h2>

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

      {/* Add New Stock Reference Form */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            value={newStockReference.name}
            onChange={(e) =>
              setNewStockReference((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            placeholder="Stock Name"
            className="px-2 py-1 border rounded"
          />
          <input
            type="text"
            value={newStockReference.code}
            onChange={(e) =>
              setNewStockReference((prev) => ({
                ...prev,
                code: e.target.value,
              }))
            }
            placeholder="Stock Code"
            className="px-2 py-1 border rounded"
          />
          <select
            value={newStockReference.SectorId}
            onChange={(e) =>
              setNewStockReference((prev) => ({
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
          onClick={addNewStockReference}
          className="mt-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 focus:outline-none"
        >
          Add
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Stock Name</th>
            <th className="py-2 px-4 border-b">Sector</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stockReferences.map((ref) => (
            <tr key={ref.id}>
              <td className="py-2 px-4 border-b">{ref.name}</td>
              <td className="py-2 px-4 border-b">
                {editMode[ref.id] ? (
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
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <select
                          value={
                            editedStockReferences[ref.id]?.SectorId ||
                            ref.SectorId
                          }
                          onChange={(e) =>
                            handleInputChange(
                              ref.id,
                              'SectorId',
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border rounded"
                        >
                          <option value="">Select Sector</option>
                          {sectors.map((sector) => (
                            <option key={sector.id} value={sector.id}>
                              {sector.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() =>
                            showAddSectorInput(ref.id, setIsAddingSector)
                          }
                          className="text-green-500 px-2"
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

              <td className="py-2 px-4 border-b text-center space-x-2">
                {editMode[ref.id] ? (
                  <>
                    <button
                      onClick={() => saveStockReference(ref.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => deleteStockReferenceById(ref.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => cancelEdit(ref.id)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 focus:outline-none"
                    >
                      X
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setEditMode((prev) => ({ ...prev, [ref.id]: true }))
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

export default StockReferenceMaster;
