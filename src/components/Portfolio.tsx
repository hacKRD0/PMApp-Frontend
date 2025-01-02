import React, { useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchPortfolio, getPortfolioDates } from '../services/apiService';
import { format } from 'date-fns';
import NestedTable from './NestedTable'; // Import the NestedTable component
import LocalDatePicker from './LocalDatePicker';

type StockDetails = {
  name: string;
  brokerageCode: string;
  brokerage: string;
  qty: number;
  totalCost: number;
  avgCost: number;
  totalValue: number;
};

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [viewMode, setViewMode] = useState<'Sector' | 'Brokerage' | 'Stock'>(
    'Sector'
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [highlightDates, setHighlightDates] = useState<string[]>([]); // Dates to highlight

  // Fetch portfolio data for the selected date
  const fetchData = async () => {
    if (selectedDate) {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const data = await fetchPortfolio(formattedDate);
        if (data.success) {
          setPortfolio(data.portfolio);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    }
  };

  useEffect(() => {
    // Fetch uploaded dates for highlighting
    const fetchUploadedDates = async () => {
      try {
        const response = await getPortfolioDates();
        if (response.success) {
          setHighlightDates(response.dates); // Dates in YYYY-MM-DD format
        }
      } catch (error) {
        console.error('Error fetching uploaded dates:', error);
      }
    };
    fetchUploadedDates();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Updated aggregatePortfolio function to structure data appropriately
  const aggregatePortfolio = () => {
    const aggregation: {
      [key: string]: {
        totalInvested: number;
        stocks: StockDetails[];
      };
    } = {};

    const currentPrices: { [key: string]: number } = {
      // Add more stock codes and their current prices as needed
    };

    portfolio.forEach((stock) => {
      const stockMapper = stock.StockMapper;
      const stockMaster = stockMapper?.StockMaster;
      const groupKey =
        viewMode === 'Sector'
          ? stockMaster?.Sector?.name || 'Unknown'
          : viewMode === 'Brokerage'
          ? stockMapper?.Brokerage?.name || 'Unknown Brokerage'
          : stockMaster?.name || 'Unknown';

      const stockId =
        viewMode === 'Stock'
          ? `${stockMaster?.id || stockMapper?.id}_${
              stockMapper?.Brokerage?.id
            }`
          : stockMaster?.id || stockMapper?.id || 0;
      const stockName =
        stockMaster?.name || stockMapper?.BrokerageCode || 'Unknown Stock';
      const brokerageCode = stockMapper?.BrokerageCode || 'Unknown Code';

      const totalCostForStock = stock.Qty * stock.AvgCost;
      const marketPrice =
        currentPrices[stockMaster?.code || stockMapper?.BrokerageCode || ''] ||
        0;
      const stockValue = stock.Qty * marketPrice;

      if (!aggregation[groupKey]) {
        aggregation[groupKey] = { totalInvested: 0, stocks: [] };
      }

      aggregation[groupKey].totalInvested += totalCostForStock;

      const existingStockIndex = aggregation[groupKey].stocks.findIndex(
        (s) => s[Object.keys(s)[0]].brokerageCode === brokerageCode
      );

      if (existingStockIndex !== -1) {
        // Update existing stock entry
        const existingStock = aggregation[groupKey].stocks[existingStockIndex];
        aggregation[groupKey].stocks[existingStockIndex] = {
          ...existingStock,
          qty: existingStock.qty + stock.Qty,
          totalCost: existingStock.totalCost + totalCostForStock,
          totalValue: existingStock.totalValue + stockValue,
        };
      } else {
        // Add new stock entry
        aggregation[groupKey].stocks.push({
          name: stockName,
          brokerageCode: brokerageCode,
          brokerage: stockMapper?.Brokerage?.name || 'Unknown Brokerage',
          qty: stock.Qty,
          totalCost: totalCostForStock,
          avgCost: 0,
          totalValue: stockValue,
        });
      }
    });

    // Calculate average cost for each stock
    Object.values(aggregation).forEach((groupData) => {
      groupData.stocks.forEach((stock) => {
        stock.avgCost = stock.totalCost / stock.qty;
      });
    });

    return aggregation;
  };

  const aggregatedData = aggregatePortfolio();

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const calculateTotalInvested = () => {
    return Object.values(aggregatedData).reduce(
      (total, group) => total + group.totalInvested,
      0
    );
  };

  const totalInvested = calculateTotalInvested();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Consolidated Portfolio</h1>

      {/* Date Picker */}
      <div className="mb-4">
        <label
          htmlFor="date-picker"
          className="mr-2 font-semibold text-gray-700"
        >
          Select Date:
        </label>
        <LocalDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          maxDate={new Date()}
          highlightDates={highlightDates}
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      {/* View Mode Dropdown */}
      <div className="mb-4">
        <label htmlFor="viewMode" className="mr-2 font-semibold text-gray-700">
          View by:
        </label>
        <select
          id="viewMode"
          value={viewMode}
          onChange={(e) =>
            setViewMode(e.target.value as 'Sector' | 'Brokerage' | 'Stock')
          }
          className="p-2 border border-gray-300 rounded"
        >
          <option value="Sector">Sector</option>
          <option value="Brokerage">Brokerage</option>
          <option value="Stock">Stock</option>
        </select>
      </div>

      {/* Aggregated Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {viewMode}-Wise Distribution
        </h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border">{viewMode}</th>
              <th className="py-2 px-4 border">Total Invested</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(aggregatedData).map((groupKey) => (
              <React.Fragment key={groupKey}>
                <tr
                  className="cursor-pointer bg-gray-200"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <td className="py-2 px-4 border font-semibold">{groupKey}</td>
                  <td className="py-2 px-4 border">
                    ₹{aggregatedData[groupKey].totalInvested.toFixed(2)}
                  </td>
                </tr>
                {expandedGroups[groupKey] && (
                  <tr>
                    <td colSpan={2}>
                      {/* Use the NestedTable component here */}
                      <NestedTable
                        viewMode={viewMode}
                        stocks={aggregatedData[groupKey].stocks}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>

          {/* Total Invested Row */}
          <tfoot>
            <tr className="font-bold">
              <td className="py-2 px-4 border">Total Invested in Portfolio</td>
              <td className="py-2 px-4 border">₹{totalInvested.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;
