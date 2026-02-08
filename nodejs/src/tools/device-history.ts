import { apiClient } from '../utils/api-client.js';

export interface DeviceHistoryArgs {
    device_id: string | number;
    days?: number;
    limit?: number;
}

export async function deviceHistory(args: DeviceHistoryArgs) {
    const { device_id, days = 30, limit = 200 } = args;

    // Validate inputs
    if (!device_id) {
        throw new Error('device_id is required');
    }
    if (days < 1 || days > 365) {
        throw new Error('days must be between 1 and 365');
    }
    if (limit < 1 || limit > 200) {
        throw new Error('Limit must be between 1 and 200');
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const captured_after = startDate.toISOString().split('T')[0] + ' 00:00';
    const captured_before = endDate.toISOString().split('T')[0] + ' 23:59';

    // Get measurements for this device
    const measurements = await apiClient.getMeasurements({
        device_id: Number(device_id),
        captured_after,
        captured_before,
    } as any);

    // Limit results
    const limitedResults = measurements.slice(0, limit);

    // Try to get device info
    let deviceInfo: any = null;
    try {
        const allDevices = await apiClient.getDevices();
        deviceInfo = allDevices.find((d: any) => d.id === Number(device_id));
    } catch (error) {
        // Device info not critical, continue without it
    }

    // Normalize response
    return {
        device: deviceInfo
            ? {
                id: deviceInfo.id,
                manufacturer: deviceInfo.manufacturer,
                model: deviceInfo.model,
                sensor: deviceInfo.sensor,
            }
            : {
                id: device_id,
                manufacturer: 'Unknown',
                model: 'Unknown',
                sensor: 'Unknown',
            },
        period: {
            days,
            start_date: captured_after,
            end_date: captured_before,
        },
        count: limitedResults.length,
        total_available: measurements.length,
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
            user_id: m.user_id,
            sensor_id: m.sensor_id,
        })),
    };
}

export const deviceHistoryTool = {
    name: 'device_history',
    description:
        'Get historical radiation measurements from a specific monitoring device over a time period.',
    inputSchema: {
        type: 'object',
        properties: {
            device_id: {
                type: ['string', 'number'],
                description: 'Device identifier',
            },
            days: {
                type: 'number',
                description: 'Number of days of history to retrieve (default: 30, max: 365)',
                minimum: 1,
                maximum: 365,
                default: 30,
            },
            limit: {
                type: 'number',
                description: 'Maximum number of measurements to return (default: 200, max: 200)',
                minimum: 1,
                maximum: 200,
                default: 200,
            },
        },
        required: ['device_id'],
    },
};
