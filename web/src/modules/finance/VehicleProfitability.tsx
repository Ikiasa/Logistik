import React, { useState, useEffect } from 'react';
import { VehicleProfitability as VehicleProfitabilityType } from './types';

interface Props {
    vehicleId: string;
    startDate: string;
    endDate: string;
}

export const VehicleProfitability: React.FC<Props> = ({ vehicleId, startDate, endDate }) => {
    const [profitability, setProfitability] = useState<VehicleProfitabilityType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfitability();
    }, [vehicleId, startDate, endDate]);

    const fetchProfitability = async () => {
        try {
            const response = await fetch(
                `/api/finance/profitability/vehicle/${vehicleId}?start=${startDate}&end=${endDate}`,
                { credentials: 'include' }
            );
            const data = await response.json();
            setProfitability(data);
        } catch (error) {
            console.error('Failed to fetch profitability:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Loading profitability data...</div>;
    }

    if (!profitability) {
        return <div className="p-4">No profitability data available</div>;
    }

    const isProfit able = profitability.netMargin > 0;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Vehicle Profitability</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-2xl font-bold text-blue-600">
                        ${profitability.revenue.toLocaleString()}
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
                        <span className="text-sm ml-2">
                            ({profitability.marginPercentage.toFixed(1)}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">Fuel Costs</span>
                        <span className="font-semibold">${profitability.fuelCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">Maintenance Costs</span>
                        <span className="font-semibold">${profitability.maintenanceCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-700">Operational Expenses</span>
                        <span className="font-semibold">${profitability.opExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                        <span className="text-gray-700">Idle Cost</span>
                        <span className="font-semibold text-yellow-700">
                            ${profitability.idleCost.toLocaleString()}
                            <span className="text-xs ml-2">
                                ({profitability.idleTimePercentage.toFixed(1)}% idle time)
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Per-KM Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Distance Traveled</div>
                    <div className="text-xl font-bold">{profitability.distanceTraveled.toFixed(1)} km</div>
                </div>
                <div className="border p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Cost per KM</div>
                    <div className="text-xl font-bold text-red-600">
                        ${profitability.costPerKm.toFixed(2)}/km
                    </div>
                </div>
                <div className="border p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Revenue per KM</div>
                    <div className="text-xl font-bold text-green-600">
                        ${profitability.revenuePerKm.toFixed(2)}/km
                    </div>
                </div>
            </div>
        </div>
    );
};
