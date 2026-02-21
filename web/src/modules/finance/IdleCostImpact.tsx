import React, { useState, useEffect } from 'react';
import { IdleCostImpact as IdleCostImpactType } from './types';

interface Props {
    vehicleId: string;
    startDate: string;
    endDate: string;
}

export const IdleCostImpact: React.FC<Props> = ({ vehicleId, startDate, endDate }) => {
    const [idleCost, setIdleCost] = useState<IdleCostImpactType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIdleCost();
    }, [vehicleId, startDate, endDate]);

    const fetchIdleCost = async () => {
        try {
            // First get idle hours from tracking
            const trackingResponse = await fetch(
                `/api/tracking/idle-time?vehicle_id=${vehicleId}&start=${startDate}&end=${endDate}`,
                { credentials: 'include' }
            );
            const trackingData = await trackingResponse.json();
            const idleHours = trackingData.idleHours || 0;

            // Then get idle cost impact
            const response = await fetch(
                `/api/finance/costs/idle-impact?vehicle_id=${vehicleId}&start=${startDate}&end=${endDate}&idle_hours=${idleHours}`,
                { credentials: 'include' }
            );
            const data = await response.json();
            setIdleCost(data);
        } catch (error) {
            console.error('Failed to fetch idle cost:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4">Loading idle cost data...</div>;
    }

    if (!idleCost) {
        return <div className="p-4">No idle cost data available</div>;
    }

    const isHighIdle = idleCost.idleCostPercentage > 15;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Idle Cost Impact Analysis</h2>

            {/* Alert Banner */}
            {isHighIdle && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">⚠️</div>
                        <div>
                            <div className="font-semibold text-yellow-800">High Idle Time Detected</div>
                            <div className="text-sm text-yellow-700">
                                This vehicle has excessive idle time, significantly impacting profitability
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Idle Time Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${isHighIdle ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'}`}>
                    <div className="text-sm text-gray-600">Total Idle Time</div>
                    <div className={`text-3xl font-bold ${isHighIdle ? 'text-yellow-700' : 'text-gray-800'}`}>
                        {idleCost.idleTimeHours.toFixed(1)} hours
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        @ ${idleCost.idleCostPerHour}/hour
                    </div>
                </div>
                <div className={`p-4 rounded-lg ${isHighIdle ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50'}`}>
                    <div className="text-sm text-gray-600">Total Idle Cost</div>
                    <div className={`text-3xl font-bold ${isHighIdle ? 'text-red-700' : 'text-gray-800'}`}>
                        ${idleCost.totalIdleCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {idleCost.idleCostPercentage.toFixed(1)}% of total costs
                    </div>
                </div>
            </div>

            {/* Cost Comparison */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">Cost Impact</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">Operational Costs (excluding idle)</span>
                        <span className="font-semibold">
                            ${(idleCost.totalCostsWithIdle - idleCost.totalIdleCost).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-red-600">
                        <span>+ Idle Cost</span>
                        <span className="font-semibold">
                            ${idleCost.totalIdleCost.toLocaleString()}
                        </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                        <span>Total Costs</span>
                        <span>${idleCost.totalCostsWithIdle.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    {isHighIdle ? (
                        <>
                            <li>• Review route planning to minimize idle time</li>
                            <li>• Implement driver training on fuel-efficient practices</li>
                            <li>• Consider automatic engine shut-off systems</li>
                            <li>• Analyze traffic patterns and adjust schedules</li>
                        </>
                    ) : (
                        <>
                            <li>• Idle time is within acceptable range</li>
                            <li>• Continue current operational practices</li>
                            <li>• Monitor for any increases in idle time</li>
                        </>
                    )}
                </ul>
            </div>

            {/* Potential Savings */}
            {isHighIdle && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="font-semibold text-green-900 mb-1">Potential Monthly Savings</div>
                    <div className="text-2xl font-bold text-green-700">
                        ${(idleCost.totalIdleCost * 0.5).toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                        By reducing idle time by 50%
                    </div>
                </div>
            )}
        </div>
    );
};
