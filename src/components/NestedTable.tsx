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
  // Define sortable fields based on viewMode
  const sortableFields = useMemo(() => {
    if (viewMode === 'Stock') {
      return ['brokerageCode', 'brokerage', 'qty', 'avgCost', 'totalCost'];
    } else {
      return ['name', 'qty', 'avgCost', 'totalCost'];
    }
  }, [viewMode]);

  // State for sorting
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Initialize sorting
  useEffect(() => {
    if (sortableFields.length > 0) {
      setSortField(sortableFields[0]);
      setSortOrder('asc');
    }
  }, [sortableFields]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Number formatter for INR
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

  // Aggregate stocks by 'name' if viewMode is 'Sector'
  const aggregatedStocks = useMemo(() => {
    if (viewMode === 'Sector') {
      const aggregationMap: { [key: string]: StockDetails } = {};

      stocks.forEach((stock) => {
        const key = stock.name;
        if (!aggregationMap[key]) {
          // Clone the stock object to avoid mutating original data
          aggregationMap[key] = { ...stock };
        } else {
          // Aggregate quantities and costs
          aggregationMap[key].qty += stock.qty;
          aggregationMap[key].totalCost += stock.totalCost;
          aggregationMap[key].totalValue += stock.totalValue;
          aggregationMap[key].avgCost =
            aggregationMap[key].totalCost / aggregationMap[key].qty;
        }
      });

      return Object.values(aggregationMap);
    }

    // For 'Brokerage' and 'Stock' views, return stocks as-is
    return stocks;
  }, [stocks, viewMode]);

  // Sort the aggregated stocks
  const sortedStocks = useMemo(() => {
    const sorted = [...aggregatedStocks];
    if (sortField) {
      sorted.sort((a, b) => {
        let aValue: string | number = a[sortField as keyof StockDetails];
        let bValue: string | number = b[sortField as keyof StockDetails];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }
    return sorted;
  }, [aggregatedStocks, sortField, sortOrder]);

  // Render sort icons
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <FaSort className="inline ml-1 text-gray-500" />;
    }
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
              {/* Name Header */}
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
                {viewMode} {renderSortIcon('name')}
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
                  {/* Name Cell */}
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
