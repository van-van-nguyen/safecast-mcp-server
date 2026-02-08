import { apiClient } from '../utils/api-client.js';

export interface QueryRadiationArgs {
    lat: number;
    lon: number;
    radius_m?: number;
    limit?: number;
}

export async function queryRadiation(args: QueryRadiationArgs) {
    const { lat, lon, radius_m = 1500, limit = 25 } = args;

    // Validate inputs
    if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
    }
    if (lon < -180 || lon > 180) {
        throw new Error('Longitude must be between -180 and 180');
    }
    if (radius_m < 25 || radius_m > 50000) {
        throw new Error('Radius must be between 25 and 50000 meters');
    }
    if (limit < 1 || limit > 200) {
        throw new Error('Limit must be between 1 and 200');
    }

    // Call Safecast API
    const measurements = await apiClient.getMeasurements({
        latitude: lat,
        longitude: lon,
        distance: radius_m,
        // Note: Safecast API doesn't support limit parameter directly
        // We'll limit client-side
    });

    // Limit results
    const limitedResults = measurements.slice(0, limit);

    // Normalize response
    return {
        count: limitedResults.length,
        total_available: measurements.length,
        query: { lat, lon, radius_m },
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

export const queryRadiationTool = {
    name: 'query_radiation',
    description:
        'Find radiation measurements near a geographic location. Returns measurements within a specified radius of the given coordinates.',
    inputSchema: {
        type: 'object',
        properties: {
            lat: {
                type: 'number',
                description: 'Latitude (-90 to 90)',
                minimum: -90,
                maximum: 90,
            },
            lon: {
                type: 'number',
                description: 'Longitude (-180 to 180)',
                minimum: -180,
                maximum: 180,
            },
            radius_m: {
                type: 'number',
                description: 'Search radius in meters (default: 1500, max: 50000)',
                minimum: 25,
                maximum: 50000,
                default: 1500,
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 25, max: 200)',
                minimum: 1,
                maximum: 200,
                default: 25,
            },
        },
        required: ['lat', 'lon'],
    },
};
