
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatPoint {
    lat: number;
    lng: number;
    weight: number;
}

interface FleetHeatmapProps {
    data: HeatPoint[];
}

export const FleetHeatmap: React.FC<FleetHeatmapProps> = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !data || data.length === 0) return;

        const points = data.map(p => [p.lat, p.lng, p.weight] as [number, number, number]);

        const heatLayer = (L as any).heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.4: 'lime',
                0.6: 'yellow',
                0.8: 'orange',
                1.0: 'red'
            }
        });

        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, data]);

    return null;
};
