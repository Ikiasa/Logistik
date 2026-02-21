import React, { useState, useEffect } from 'react';
import { CostAnomaly } from './types';

interface Props {
    startDate: string;
    endDate: string;
}

export const CostAnomalyAlerts: React.FC<Props> = ({ startDate, endDate }) => {
    const [anomalies, setAnomalies] = useState<{
        cost: CostAnomaly[];
        fuel: CostAnomaly[];
        maintenance: CostAnomaly[];
        idle: CostAnomaly[];
        total: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnomalies();
    }, [startDate, endDate]);

    const fetchAnomalies = async () => {
        try {
            const response = await fetch(
                `/api/ops/anomalies/all?start=${startDate}&end=${endDate}`,
                { credentials: 'include' }
            );
            const data = await response.json();
            setAnomalies(data);
        } catch (error) {
            console.error('Failed to fetch anomalies:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'COST_EXCEEDS_REVENUE': return '💰';
            case 'FUEL_EFFICIENCY': return '⛽';
            case 'MAINTENANCE_SPIKE': return '🔧';
            case 'IDLE_TIME': return '⏸️';
            default: return '⚠️';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'COST_EXCEEDS_REVENUE': return 'Cost > Revenue';
            case 'FUEL_EFFICIENCY': return 'Fuel Efficiency';
            case 'MAINTENANCE_SPIKE': return 'Maintenance Spike';
            case 'IDLE_TIME': return 'Excessive Idle Time';
            default: return type;
        }
    };

    if (loading) {
        return <div className="p-4">Loading anomalies...</div>;
    }

    if (!anomalies || anomalies.total === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-lg font-semibold text-green-800">No Anomalies Detected</div>
                <div className="text-sm text-green-600 mt-1">All vehicles are operating within normal parameters</div>
            </div>
        );
    }

    const allAnomalies = [
        ...anomalies.cost,
        ...anomalies.fuel,
        ...anomalies.maintenance,
        ...anomalies.idle
    ].sort((a, b) => {
        const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Cost Anomaly Alerts</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">{anomalies.cost.length}</div>
                        <div className="text-sm text-gray-600">Cost {'>'} Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{anomalies.fuel.length}</div>
                        <div className="text-sm text-gray-600">Fuel Issues</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">{anomalies.maintenance.length}</div>
                        <div className="text-sm text-gray-600">Maintenance Spikes</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{anomalies.idle.length}</div>
                        <div className="text-sm text-gray-600">Idle Time Excess</div>
                    </div>
                </div>
            </div>

            {/* Anomaly List */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Active Anomalies ({allAnomalies.length})</h3>
                <div className="space-y-3">
                    {allAnomalies.map((anomaly, idx) => (
                        <div
                            key={idx}
                            className={`border-l-4 p-4 rounded ${getSeverityColor(anomaly.severity)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">{getTypeIcon(anomaly.type)}</span>
                                        <span className="font-semibold">{getTypeLabel(anomaly.type)}</span>
                                        <span className="text-xs px-2 py-1 rounded bg-white border">
                                            {anomaly.severity}
                                        </span>
                                    </div>
                                    <div className="text-sm font-mono text-gray-600 mb-2">
                                        Vehicle: {anomaly.vehicleId.substring(0, 8)}
                                    </div>
                                    <div className="text-sm">{anomaly.message}</div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <div className="text-sm text-gray-600">Current</div>
                                    <div className="font-bold">{anomaly.value.toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">vs {anomaly.threshold.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
