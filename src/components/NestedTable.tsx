// NestedTable.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa6';

type StockDetails = {
  name: string;
  brokerageCode: string;
  brokerage: string;
  qty: number;
  totalCost: number;
  avgCost: number;
  totalValue: number;
};

type NestedTableProps = {
  viewMode: 'Sector' | 'Brokerage' | 'Stock';
  stocks: StockDetails[];
};

const NestedTable: React.FC<NestedTableProps> = ({ viewMode, stocks }) => {
  // Define possible sortable fields based on viewMode
  const sortableFields = useMemo(() => {
    if (viewMode === 'Stock') {
      return ['brokerageCode', 'brokerage', 'qty', 'avgCost', 'totalCost'];
    } else {
      return ['name', 'qty', 'avgCost', 'totalCost'];
    }
  }, [viewMode]);

  // State to track current sort field and order
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Initialize sorting on component mount
  useEffect(() => {
    // Set initial sortField to the first column
    if (sortableFields.length > 0) {
      setSortField(sortableFields[0]);
      setSortOrder('asc');
    }
  }, [sortableFields]);

  // Function to handle sorting when a header is clicked
  const handleSort = (field: string) => {
    if (sortField === field) {
      // If clicking the same field, toggle the sort order
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      // If clicking a new field, set it as the sort field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Number formatter for Indian numbering system with currency symbol
  const indianNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  // Memoized sorted stocks based on sortField and sortOrder
  const sortedStocks = useMemo(() => {
    const sorted = [...stocks];
    if (sortField) {
      sorted.sort((a, b) => {
        let aValue: string | number = a[sortField as keyof StockDetails];
        let bValue: string | number = b[sortField as keyof StockDetails];

        // Determine if the field is string or number for proper comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          // If values are equal, perform secondary sort by quantity
          return a.qty - b.qty;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue !== bValue) {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
          }
          // If values are equal, perform secondary sort by quantity
          return a.qty - b.qty;
        }

        return 0;
      });
    }
    return sorted;
  }, [stocks, sortField, sortOrder]);

  // Function to render sort icons based on current sort state
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      // Show default sort icon when not sorted by this field
      return <FaSort className="inline ml-1 text-gray-500" />;
    }
    // Show active sort icon based on sort order
    return sortOrder === 'asc' ? (
      <FaSortUp className="inline ml-1 text-blue-500" />
    ) : (
      <FaSortDown className="inline ml-1 text-blue-500" />
    );
  };

  return (
    <table className="min-w-full bg-white mt-2 border-collapse">
      <thead>
        <tr>
          {viewMode === 'Stock' ? (
            <>
              {/* Brokerage Code Header */}
              <th
                className="py-2 px-4 border cursor-pointer text-left"
                onClick={() => handleSort('brokerageCode')}
                aria-sort={
                  sortField === 'brokerageCode'
                    ? sortOrder === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                Brokerage Code {renderSortIcon('brokerageCode')}
              </th>

              {/* Brokerage Header */}
              <th
                className="py-2 px-4 border cursor-pointer text-left"
                onClick={() => handleSort('brokerage')}
                aria-sort={
                  sortField === 'brokerage'
                    ? sortOrder === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                Brokerage {renderSortIcon('brokerage')}
              </th>
            </>
          ) : (
            <>
              {/* Stock Header */}
              <th
                className="py-2 px-4 border cursor-pointer text-left"
                onClick={() => handleSort('name')}
                aria-sort={
                  sortField === 'name'
                    ? sortOrder === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                Stock {renderSortIcon('name')}
              </th>
            </>
          )}

          {/* Quantity Header */}
          <th
            className="py-2 px-4 border cursor-pointer text-right"
            onClick={() => handleSort('qty')}
            aria-sort={
              sortField === 'qty'
                ? sortOrder === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
          >
            Quantity {renderSortIcon('qty')}
          </th>

          {/* Avg Cost Header */}
          <th
            className="py-2 px-4 border cursor-pointer text-right"
            onClick={() => handleSort('avgCost')}
            aria-sort={
              sortField === 'avgCost'
                ? sortOrder === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
          >
            Avg Cost {renderSortIcon('avgCost')}
          </th>

          {/* Total Value Header */}
          <th
            className="py-2 px-4 border cursor-pointer text-right"
            onClick={() => handleSort('totalCost')}
            aria-sort={
              sortField === 'totalCost'
                ? sortOrder === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
          >
            Total Value {renderSortIcon('totalCost')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedStocks.length > 0 ? (
          sortedStocks.map((stock, index) => (
            <tr
              key={index}
              className="bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'Stock' ? (
                <>
                  {/* Brokerage Code Cell */}
                  <td className="py-2 px-4 border">{stock.brokerageCode}</td>

                  {/* Brokerage Cell */}
                  <td className="py-2 px-4 border">{stock.brokerage}</td>
                </>
              ) : (
                <>
                  {/* Stock Name Cell */}
                  <td className="py-2 px-4 border">{stock.name}</td>
                </>
              )}

              {/* Quantity Cell */}
              <td className="py-2 px-4 border text-right">{stock.qty}</td>

              {/* Avg Cost Cell */}
              <td className="py-2 px-4 border text-right">
                {indianNumberFormatter.format(stock.avgCost)}
              </td>

              {/* Total Value Cell */}
              <td className="py-2 px-4 border text-right">
                {indianNumberFormatter.format(stock.totalCost)}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            {viewMode === 'Stock' ? (
              <td colSpan={5} className="text-center py-4">
                No stock details available.
              </td>
            ) : (
              <td colSpan={4} className="text-center py-4">
                No stock details available.
              </td>
            )}
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default NestedTable;
