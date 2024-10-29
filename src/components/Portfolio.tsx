import React, { useState } from 'react';

const Portfolio: React.FC = () => {
  const portfolioData = {
    success: true,
    portfolio: [
      {
        id: 33,
        UserId: 1,
        StockMasterId: 1,
        Qty: 7,
        AvgCost: 3139.85,
        StockMaster: {
          StockReference: { id: 1, name: 'Reliance Industries', sector: 'Energy', code: 'RELIANCE' },
          Brokerage: { name: 'Zerodha' }
        }
      },
      {
        id: 32,
        UserId: 1,
        StockMasterId: 1,
        Qty: 10,
        AvgCost: 3100.85,
        StockMaster: {
          StockReference: { id: 1, name: 'Reliance Industries', sector: 'Energy', code: 'RELIANCE' },
          Brokerage: { name: 'Sharekhan' }
        }
      },
      {
        id: 21,
        UserId: 1,
        StockMasterId: 7,
        Qty: 5,
        AvgCost: 1635.55,
        StockMaster: {
          StockReference: { id: 3, name: 'HDFC Bank', sector: 'Banking', code: 'HDFCBANK' },
          Brokerage: { name: 'Zerodha' }
        }
      },
      {
        id: 22,
        UserId: 1,
        StockMasterId: 8,
        Qty: 3,
        AvgCost: 3200.00,
        StockMaster: {
          StockReference: { id: 1, name: 'Reliance Industries', sector: 'Energy', code: 'RELIANCE' },
          Brokerage: { name: 'Upstox' }
        }
      }
    ]
  };

  const [portfolio, setPortfolio] = useState(portfolioData.portfolio);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [viewMode, setViewMode] = useState<'Sector' | 'Brokerage'>('Sector');

  // Aggregate stocks by selected view (sector or brokerage)
  const aggregatePortfolio = () => {
    const aggregation: {
      [key: string]: {
        totalInvested: number;
        stocks: { [key: number]: { name: string; qty: number; totalCost: number; avgCost: number; totalValue: number } };
      };
    } = {};

    const currentPrices: { [key: string]: number } = {
      RELIANCE: 3500, // Example market price for RELIANCE
      HDFCBANK: 1700 // Example market price for HDFCBANK
    };

    portfolio.forEach((stock) => {
      // Choose group key based on view mode
      const groupKey = viewMode === 'Sector' ? stock.StockMaster.StockReference.sector : stock.StockMaster.Brokerage.name;
      const stockId = stock.StockMaster.StockReference.id;
      const stockName = stock.StockMaster.StockReference.name;

      const totalCostForStock = stock.Qty * stock.AvgCost;
      const marketPrice = currentPrices[stock.StockMaster.StockReference.code] || 0;
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
          totalValue: stockValue
        };
      }
    });

    // Calculate weighted average cost for each stock
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
      [groupKey]: !prev[groupKey]
    }));
  };

  const calculateTotalInvested = () => {
    return Object.values(aggregatedData).reduce((total, group) => total + group.totalInvested, 0);
  };

  const totalInvested = calculateTotalInvested();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Consolidated Portfolio</h1>

      {/* View Mode Dropdown */}
      <div className="mb-4">
        <label htmlFor="viewMode" className="mr-2 font-semibold text-gray-700">
          View by:
        </label>
        <select
          id="viewMode"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as 'Sector' | 'Brokerage')}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="Sector">Sector</option>
          <option value="Brokerage">Brokerage</option>
        </select>
      </div>

      {/* Aggregated Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">{viewMode}-Wise Distribution</h2>
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
                {/* Group Row (Sector or Brokerage) */}
                <tr
                  className="cursor-pointer bg-gray-200"
                  onClick={() => toggleGroup(groupKey)}
                >
                  <td className="py-2 px-4 border font-semibold">{groupKey}</td>
                  <td className="py-2 px-4 border">${aggregatedData[groupKey].totalInvested.toFixed(2)}</td>
                </tr>

                {/* Expanded Stocks for Group */}
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
                          {Object.values(aggregatedData[groupKey].stocks).map((stock, index) => (
                            <tr key={index} className="bg-gray-100">
                              <td className="py-2 px-4 border">{stock.name}</td>
                              <td className="py-2 px-4 border">{stock.qty}</td>
                              <td className="py-2 px-4 border">${stock.avgCost.toFixed(2)}</td>
                              <td className="py-2 px-4 border">${stock.totalValue.toFixed(2)}</td>
                            </tr>
                          ))}
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
