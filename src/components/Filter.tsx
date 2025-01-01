// Filter.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaFilter } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import { Sector, Brokerage } from './types'; // Adjust the import path as necessary

type FilterProps = {
  availableFilters: Array<'sector' | 'brokerage' | 'code'>;
  sectors?: Sector[];
  brokerages?: Brokerage[];
  onFilterChange: (filters: {
    sectorIds?: number[];
    brokerageIds?: number[];
    code?: string;
  }) => void;
};

const Filter: React.FC<FilterProps> = ({
  availableFilters,
  sectors = [],
  brokerages = [],
  onFilterChange,
}) => {
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Refs for handling clicks outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  // States for each filter type
  const [selectedSectorIds, setSelectedSectorIds] = useState<number[]>([]);
  const [selectedBrokerageIds, setSelectedBrokerageIds] = useState<number[]>(
    []
  );
  const [codeFilter, setCodeFilter] = useState('');

  // Search terms
  const [sectorSearch, setSectorSearch] = useState('');
  const [brokerageSearch, setBrokerageSearch] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<
    'sector' | 'brokerage' | 'code' | null
  >(null);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      // Set the first available filter as active tab when opening
      if (availableFilters.length > 0) {
        setActiveTab(availableFilters[0]);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setActiveTab(null);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle filter changes
  useEffect(() => {
    const filters: {
      sectorIds?: number[];
      brokerageIds?: number[];
      code?: string;
    } = {};

    if (availableFilters.includes('sector')) {
      filters.sectorIds = selectedSectorIds;
    }

    if (availableFilters.includes('brokerage')) {
      filters.brokerageIds = selectedBrokerageIds;
    }

    if (availableFilters.includes('code')) {
      filters.code = codeFilter.trim();
    }

    onFilterChange(filters);
  }, [
    selectedSectorIds,
    selectedBrokerageIds,
    codeFilter,
    availableFilters,
    onFilterChange,
  ]);

  // Filtered sectors and brokerages based on search terms
  const filteredSectors = useMemo(() => {
    return sectors.filter((sector) =>
      sector.name.toLowerCase().includes(sectorSearch.toLowerCase())
    );
  }, [sectors, sectorSearch]);

  const filteredBrokerages = useMemo(() => {
    return brokerages.filter((brokerage) =>
      brokerage.name.toLowerCase().includes(brokerageSearch.toLowerCase())
    );
  }, [brokerages, brokerageSearch]);

  // Handle sector selection
  const handleSectorChange = (id: number) => {
    setSelectedSectorIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sectorId) => sectorId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all sectors
  const handleSelectAllSectors = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allSectorIds = filteredSectors.map((sector) => sector.id);
      setSelectedSectorIds(allSectorIds);
    } else {
      setSelectedSectorIds([]);
    }
  };

  // Handle brokerage selection
  const handleBrokerageChange = (id: number) => {
    setSelectedBrokerageIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((brokerageId) => brokerageId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle select all brokerages
  const handleSelectAllBrokerages = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.checked) {
      const allBrokerageIds = filteredBrokerages.map(
        (brokerage) => brokerage.id
      );
      setSelectedBrokerageIds(allBrokerageIds);
    } else {
      setSelectedBrokerageIds([]);
    }
  };

  // Handle code filter change
  const handleCodeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeFilter(e.target.value);
  };

  // Render filter content based on active tab
  const renderFilterContent = () => {
    switch (activeTab) {
      case 'sector':
        return (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Filter by Sector</h3>
            {/* Search Bar */}
            <div className="flex items-center mb-2">
              <FaSearch className="mr-2 text-gray-500" />
              <input
                type="text"
                value={sectorSearch}
                onChange={(e) => setSectorSearch(e.target.value)}
                placeholder="Search sectors..."
                className="w-full px-2 py-1 border rounded focus:outline-none"
              />
            </div>
            {/* Select All */}
            <div className="mb-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    filteredSectors.length > 0 &&
                    selectedSectorIds.length === filteredSectors.length
                  }
                  onChange={handleSelectAllSectors}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Select All</span>
              </label>
            </div>
            {/* Sector Checkboxes */}
            <div className="max-h-40 overflow-y-auto">
              {filteredSectors.length > 0 ? (
                filteredSectors.map((sector) => (
                  <label
                    key={sector.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      value={sector.id}
                      checked={selectedSectorIds.includes(sector.id)}
                      onChange={() => handleSectorChange(sector.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>{sector.name}</span>
                  </label>
                ))
              ) : (
                <div className="text-gray-500">No sectors found.</div>
              )}
            </div>
          </div>
        );
      case 'brokerage':
        return (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Filter by Brokerage</h3>
            {/* Search Bar */}
            <div className="flex items-center mb-2">
              <FaSearch className="mr-2 text-gray-500" />
              <input
                type="text"
                value={brokerageSearch}
                onChange={(e) => setBrokerageSearch(e.target.value)}
                placeholder="Search brokerages..."
                className="w-full px-2 py-1 border rounded focus:outline-none"
              />
            </div>
            {/* Select All */}
            <div className="mb-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    filteredBrokerages.length > 0 &&
                    selectedBrokerageIds.length === filteredBrokerages.length
                  }
                  onChange={handleSelectAllBrokerages}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Select All</span>
              </label>
            </div>
            {/* Brokerage Checkboxes */}
            <div className="max-h-40 overflow-y-auto">
              {filteredBrokerages.length > 0 ? (
                filteredBrokerages.map((brokerage) => (
                  <label
                    key={brokerage.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      value={brokerage.id}
                      checked={selectedBrokerageIds.includes(brokerage.id)}
                      onChange={() => handleBrokerageChange(brokerage.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span>{brokerage.name}</span>
                  </label>
                ))
              ) : (
                <div className="text-gray-500">No brokerages found.</div>
              )}
            </div>
          </div>
        );
      case 'code':
        return (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Filter by Stock Master Code</h3>
            <input
              type="text"
              value={codeFilter}
              onChange={handleCodeFilterChange}
              placeholder="Enter stock master code..."
              className="w-full px-2 py-1 border rounded focus:outline-none"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative inline-block">
      {/* Filter Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
        aria-label="Filter options"
      >
        <FaFilter className="mr-2" />
        Filter
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 mt-2 w-80 bg-white border border-gray-300 rounded shadow-lg z-20"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4" aria-label="Filter Tabs">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveTab(filter)}
                  className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm focus:outline-none ${
                    activeTab === filter
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={activeTab === filter ? 'page' : undefined}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Filter Content */}
          <div className="p-4 overflow-auto" style={{ maxHeight: '400px' }}>
            {renderFilterContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
