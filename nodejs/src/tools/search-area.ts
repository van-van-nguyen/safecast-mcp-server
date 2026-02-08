import { apiClient } from '../utils/api-client.js';

export interface SearchAreaArgs {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
    limit?: number;
}

/**
 * Calculate the center point and radius from a bounding box
 */
function calculateCenterAndRadius(
    min_lat: number,
    max_lat: number,
    min_lon: number,
    max_lon: number
): { center_lat: number; center_lon: number; radius_m: number } {
    const center_lat = (min_lat + max_lat) / 2;
    const center_lon = (min_lon + max_lon) / 2;

    // Calculate diagonal distance using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (min_lat * Math.PI) / 180;
    const φ2 = (max_lat * Math.PI) / 180;
    const Δφ = ((max_lat - min_lat) * Math.PI) / 180;
    const Δλ = ((max_lon - min_lon) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    // Use half the diagonal as radius (with some buffer)
    const radius_m = Math.min(distance * 0.6, 50000);

    return { center_lat, center_lon, radius_m };
}

/**
 * Filter measurements to only those within the bounding box
 */
function filterToBoundingBox(
    measurements: any[],
    min_lat: number,
    max_lat: number,
    min_lon: number,
    max_lon: number
): any[] {
    return measurements.filter((m: any) => {
        const lat = m.latitude;
        const lon = m.longitude;
        return lat >= min_lat && lat <= max_lat && lon >= min_lon && lon <= max_lon;
    });
}

export async function searchArea(args: SearchAreaArgs) {
    const { min_lat, max_lat, min_lon, max_lon, limit = 100 } = args;

    // Validate inputs
    if (min_lat < -90 || min_lat > 90 || max_lat < -90 || max_lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
    }
    if (min_lon < -180 || min_lon > 180 || max_lon < -180 || max_lon > 180) {
        throw new Error('Longitude must be between -180 and 180');
    }
    if (min_lat >= max_lat) {
        throw new Error('min_lat must be less than max_lat');
    }
    if (min_lon >= max_lon) {
        throw new Error('min_lon must be less than max_lon');
    }
    if (limit < 1 || limit > 200) {
        throw new Error('Limit must be between 1 and 200');
    }

    // Calculate center and radius
    const { center_lat, center_lon, radius_m } = calculateCenterAndRadius(
        min_lat,
        max_lat,
        min_lon,
        max_lon
    );

    // Call Safecast API with center point
    const measurements = await apiClient.getMeasurements({
        latitude: center_lat,
        longitude: center_lon,
        distance: radius_m,
    });

    // Filter to bounding box and limit
    const filtered = filterToBoundingBox(measurements, min_lat, max_lat, min_lon, max_lon);
    const limitedResults = filtered.slice(0, limit);

    // Normalize response
    return {
        count: limitedResults.length,
        total_in_bbox: filtered.length,
        total_fetched: measurements.length,
        bbox: { min_lat, max_lat, min_lon, max_lon },
        measurements: limitedResults.map((m: any) => ({
            id: m.id,
            value: m.value,
            unit: m.unit,
            captured_at: m.captured_at,
            location: {
                latitude: m.latitude,
                longitude: m.longitude,
            },
            device_id: m.device_id,
            user_id: m.user_id,
            height: m.height,
            sensor_id: m.sensor_id,
            station_id: m.station_id,
        })),
    };
}

export const searchAreaTool = {
    name: 'search_area',
    description:
        'Find radiation measurements within a geographic bounding box. Note: This uses a center+radius workaround since the Safecast API does not support native bounding box queries.',
    inputSchema: {
        type: 'object',
        properties: {
            min_lat: {
                type: 'number',
                description: 'Southern boundary latitude',
                minimum: -90,
                maximum: 90,
            },
            max_lat: {
                type: 'number',
                description: 'Northern boundary latitude',
                minimum: -90,
                maximum: 90,
            },
            min_lon: {
                type: 'number',
                description: 'Western boundary longitude',
                minimum: -180,
                maximum: 180,
            },
            max_lon: {
                type: 'number',
                description: 'Eastern boundary longitude',
                minimum: -180,
                maximum: 180,
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 100, max: 200)',
                minimum: 1,
                maximum: 200,
                default: 100,
            },
        },
        required: ['min_lat', 'max_lat', 'min_lon', 'max_lon'],
    },
};
