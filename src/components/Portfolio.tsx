import React, { useEffect, useState } from 'react';
import { fetchPortfolio } from '../services/apiService';

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [viewMode, setViewMode] = useState<'Sector' | 'Brokerage'>('Sector');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const fetchData = async () => {
    try {
      const data = await fetchPortfolio(selectedDate);
      if (data.success) {
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const aggregatePortfolio = () => {
    const aggregation: {
      [key: string]: {
        totalInvested: number;
        stocks: {
          [key: number]: {
            name: string;
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
          ? stockReference?.Sector?.name ||
            (stockReference ? 'Uncategorized Sector' : 'Unknown Sector')
          : stockMaster?.Brokerage?.name || 'Unknown Brokerage';

      const stockId = stockReference?.id || stockMaster?.id || 0;
      const stockName =
        stockReference?.name || stockMaster?.BrokerageCode || 'Unknown Stock';

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
        <label htmlFor="date" className="mr-2 font-semibold text-gray-700">
          Select Date:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
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
            setViewMode(e.target.value as 'Sector' | 'Brokerage')
          }
          className="p-2 border border-gray-300 rounded"
        >
          <option value="Sector">Sector</option>
          <option value="Brokerage">Brokerage</option>
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
                    ${aggregatedData[groupKey].totalInvested.toFixed(2)}
                  </td>
                </tr>
                {expandedGroups[groupKey] && (
                  <tr>
                    <td colSpan={2}>
                      <table className="min-w-full bg-white mt-2">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border">Stock</th>
                            <th className="py-2 px-4 border">Quantity</th>
                            <th className="py-2 px-4 border">Avg Cost</th>
                            <th className="py-2 px-4 border">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(aggregatedData[groupKey].stocks).map(
                            (stock, index) => (
                              <tr key={index} className="bg-gray-100">
                                <td className="py-2 px-4 border">
                                  {stock.name}
                                </td>
                                <td className="py-2 px-4 border">
                                  {stock.qty}
                                </td>
                                <td className="py-2 px-4 border">
                                  ${stock.avgCost.toFixed(2)}
                                </td>
                                <td className="py-2 px-4 border">
                                  ${stock.totalValue.toFixed(2)}
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
              <td className="py-2 px-4 border">${totalInvested.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;
