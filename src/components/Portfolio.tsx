import React, { useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchPortfolio, getPortfolioDates } from '../services/apiService';
import { format } from 'date-fns';

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [viewMode, setViewMode] = useState<'Sector' | 'Brokerage' | 'Stock'>(
    'Sector'
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [uploadedDates, setUploadedDates] = useState<string[]>([]); // Dates to highlight

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

  // Fetch uploaded dates for highlighting
  const fetchUploadedDates = async () => {
    try {
      const response = await getPortfolioDates();
      if (response.success) {
        setUploadedDates(response.dates); // Dates in YYYY-MM-DD format
      }
    } catch (error) {
      console.error('Error fetching uploaded dates:', error);
    }
  };

  useEffect(() => {
    fetchUploadedDates();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const normalizeToUTC = (date: Date): Date => {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  };

  const isUploadedDate = (date: Date): boolean => {
    const utcDateString = normalizeToUTC(date).toISOString().split('T')[0];
    return uploadedDates.includes(utcDateString);
  };

  const aggregatePortfolio = () => {
    const aggregation: {
      [key: string]: {
        totalInvested: number;
        stocks: {
          [key: number]: {
            name: string;
            brokerageCode: string;
            brokerage: string;
            qty: number;
            totalCost: number;
            avgCost: number;
            totalValue: number;
          };
        };
      };
    } = {};

    const currentPrices: { [key: string]: number } = {
      RELIANCE: 3500,
      HDFCBANK: 1700,
    };

    portfolio.forEach((stock) => {
      const stockMaster = stock.StockMaster;
      const stockReference = stockMaster?.StockReference;
      const groupKey =
        viewMode === 'Sector'
          ? stockReference?.Sector?.name || 'Unknown'
          : viewMode === 'Brokerage'
          ? stockMaster?.Brokerage?.name || 'Unknown Brokerage'
          : stockReference?.name || 'Unknown';

      const stockId =
        viewMode == 'Stock'
          ? `${stockReference?.id || stockMaster?.id}_${
              stockMaster?.Brokerage?.id
            }`
          : stockReference?.id || stockMaster?.id || 0;
      const stockName =
        stockReference?.name || stockMaster?.BrokerageCode || 'Unknown Stock';
      const brokerageCode = stockMaster?.BrokerageCode || 'Unknown Code';

      const totalCostForStock = stock.Qty * stock.AvgCost;
      const marketPrice =
        currentPrices[
          stockReference?.code || stockMaster?.BrokerageCode || ''
        ] || 0;
      const stockValue = stock.Qty * marketPrice;

      if (!aggregation[groupKey]) {
        aggregation[groupKey] = { totalInvested: 0, stocks: {} };
      }

      aggregation[groupKey].totalInvested += totalCostForStock;

      if (aggregation[groupKey].stocks[stockId]) {
        aggregation[groupKey].stocks[stockId].qty += stock.Qty;
        aggregation[groupKey].stocks[stockId].totalCost += totalCostForStock;
        aggregation[groupKey].stocks[stockId].totalValue += stockValue;
      } else {
        aggregation[groupKey].stocks[stockId] = {
          name: stockName,
          brokerageCode: brokerageCode,
          brokerage: stockMaster?.Brokerage?.name || 'Unknown Brokerage',
          qty: stock.Qty,
          totalCost: totalCostForStock,
          avgCost: 0,
          totalValue: stockValue,
        };
      }
    });

    Object.values(aggregation).forEach((groupData) => {
      Object.values(groupData.stocks).forEach((stock) => {
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
        <ReactDatePicker
          selected={selectedDate}
          onChange={(date) =>
            setSelectedDate(date ? normalizeToUTC(date) : null)
          }
          maxDate={new Date()}
          dayClassName={(date) =>
            isUploadedDate(date)
              ? 'react-datepicker__day--highlighted bg-red-300 text-white'
              : ''
          }
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
                      <table className="min-w-full bg-white mt-2">
                        <thead>
                          <tr>
                            {viewMode === 'Stock' ? (
                              <>
                                <th className="py-2 px-4 border">
                                  Brokerage Code
                                </th>
                                <th className="py-2 px-4 border">Brokerage</th>
                              </>
                            ) : (
                              <th className="py-2 px-4 border">Stock</th>
                            )}
                            <th className="py-2 px-4 border">Quantity</th>
                            <th className="py-2 px-4 border">Avg Cost</th>
                            <th className="py-2 px-4 border">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(aggregatedData[groupKey].stocks).map(
                            (stock, index) => (
                              <tr key={index} className="bg-gray-100">
                                {viewMode === 'Stock' ? (
                                  <>
                                    <td className="py-2 px-4 border">
                                      {stock.brokerageCode}
                                    </td>
                                    <td className="py-2 px-4 border">
                                      {stock.brokerage}
                                    </td>
                                  </>
                                ) : (
                                  <td className="py-2 px-4 border">
                                    {stock.name}
                                  </td>
                                )}
                                <td className="py-2 px-4 border">
                                  {stock.qty}
                                </td>
                                <td className="py-2 px-4 border">
                                  ₹{stock.avgCost.toFixed(2)}
                                </td>
                                <td className="py-2 px-4 border">
                                  ₹{stock.totalCost.toFixed(2)}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
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
