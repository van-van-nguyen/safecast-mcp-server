import { apiClient } from '../utils/api-client.js';

export interface GetTrackArgs {
    track_id: string | number;
    from?: number;
    to?: number;
    limit?: number;
}

export async function getTrack(args: GetTrackArgs) {
    const { track_id, from, to, limit = 200 } = args;

    // Validate inputs
    if (!track_id) {
        throw new Error('track_id is required');
    }
    if (limit < 1 || limit > 200) {
        throw new Error('Limit must be between 1 and 200');
    }

    // Get track info first
    const trackInfo = await apiClient.getBGeigieImport(Number(track_id));

    // Get measurements for this track
    const measurements = await apiClient.getMeasurements({
        bgeigie_import_id: Number(track_id),
    } as any);

    // Filter by marker ID range if specified
    let filteredMeasurements = measurements;
    if (from !== undefined) {
        filteredMeasurements = filteredMeasurements.filter((m: any) => m.id >= from);
    }
    if (to !== undefined) {
        filteredMeasurements = filteredMeasurements.filter((m: any) => m.id <= to);
    }

    // Limit results
    const limitedResults = filteredMeasurements.slice(0, limit);

    // Normalize response
    return {
        track: {
            id: trackInfo.id,
            name: trackInfo.name,
            description: trackInfo.description,
            cities: trackInfo.cities,
            credits: trackInfo.credits,
            measurement_count: trackInfo.measurements_count,
            status: trackInfo.status,
            approved: trackInfo.approved,
        },
        count: limitedResults.length,
        total_available: filteredMeasurements.length,
        from_marker: from,
        to_marker: to,
        measurements: limitedResults.map((m: any) => ({
            id: m.id,
            value: m.value,
            unit: m.unit,
            captured_at: m.captured_at,
            location: {
                latitude: m.latitude,
                longitude: m.longitude,
            },
            height: m.height,
            device_id: m.device_id,
            sensor_id: m.sensor_id,
            user_id: m.user_id,
        })),
    };
}

export const getTrackTool = {
    name: 'get_track',
    description:
        'Retrieve all radiation measurements recorded during a specific track/journey. Use list_tracks to find available track IDs first.',
    inputSchema: {
        type: 'object',
        properties: {
            track_id: {
                type: ['string', 'number'],
                description: 'Track identifier (bGeigie import ID)',
            },
            from: {
                type: 'number',
                description: 'Optional: Start marker ID for filtering',
            },
            to: {
                type: 'number',
                description: 'Optional: End marker ID for filtering',
            },
            limit: {
                type: 'number',
                description: 'Maximum number of measurements to return (default: 200, max: 200)',
                minimum: 1,
                maximum: 200,
                default: 200,
            },
        },
        required: ['track_id'],
    },
};
