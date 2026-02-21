import React, { useState, useEffect } from 'react';
import { FleetProfitability as FleetProfitabilityType } from './types';

interface Props {
    startDate: string;
    endDate: string;
}

export const FleetProfitability: React.FC<Props> = ({ startDate, endDate }) => {
    const [profitability, setProfitability] = useState<FleetProfitabilityType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFleetProfitability();
    }, [startDate, endDate]);

    const fetchFleetProfitability = async () => {
        try {
            const response = await fetch(
                `/api/finance/profitability/fleet?start=${startDate}&end=${endDate}`,
                { credentials: 'include' }
            );
            const data = await response.json();
            setProfitability(data);
        } catch (error) {
            console.error('Failed to fetch fleet profitability:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Loading fleet profitability...</div>;
    }

    if (!profitability) {
        return <div className="p-4">No fleet data available</div>;
    }

    const isProfitable = profitability.netMargin > 0;
    const sortedVehicles = [...profitability.vehicles].sort((a, b) => b.netMargin - a.netMargin);
    const topPerformers = sortedVehicles.slice(0, 5);
    const bottomPerformers = sortedVehicles.slice(-5).reverse();

    return (
        <div className="space-y-6">
            {/* Fleet Summary */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Fleet-Wide Profitability</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Total Revenue</div>
                        <div className="text-2xl font-bold text-blue-600">
                            ${profitability.totalRevenue.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Total Costs</div>
                        <div className="text-2xl font-bold text-red-600">
                            ${profitability.totalCosts.toLocaleString()}
                        </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="text-sm text-gray-600">Net Margin</div>
                        <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                            ${profitability.netMargin.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Margin %</div>
                        <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                            {profitability.marginPercentage.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center text-gray-600">
                    Fleet Size: {profitability.vehicleCount} vehicles
                </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4 text-green-700">Top 5 Performers</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Vehicle ID</th>
                                <th className="px-4 py-2 text-right">Revenue</th>
                                <th className="px-4 py-2 text-right">Costs</th>
                                <th className="px-4 py-2 text-right">Net Margin</th>
                                <th className="px-4 py-2 text-right">Margin %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPerformers.map((vehicle, idx) => (
                                <tr key={vehicle.vehicleId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-2 font-mono text-sm">{vehicle.vehicleId.substring(0, 8)}</td>
                                    <td className="px-4 py-2 text-right">${vehicle.revenue.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-right">${vehicle.totalCosts.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-right font-bold text-green-600">
                                        ${vehicle.netMargin.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right">{vehicle.marginPercentage.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Performers */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4 text-red-700">Bottom 5 Performers</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Vehicle ID</th>
                                <th className="px-4 py-2 text-right">Revenue</th>
                                <th className="px-4 py-2 text-right">Costs</th>
                                <th className="px-4 py-2 text-right">Net Margin</th>
                                <th className="px-4 py-2 text-right">Margin %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bottomPerformers.map((vehicle, idx) => (
                                <tr key={vehicle.vehicleId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-2 font-mono text-sm">{vehicle.vehicleId.substring(0, 8)}</td>
                                    <td className="px-4 py-2 text-right">${vehicle.revenue.toLocaleString()}</td>
                                    <td className="px-4 py-2 text-right">${vehicle.totalCosts.toLocaleString()}</td>
                                    <td className={`px-4 py-2 text-right font-bold ${vehicle.netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${vehicle.netMargin.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right">{vehicle.marginPercentage.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
