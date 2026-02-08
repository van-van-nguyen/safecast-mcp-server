import { apiClient } from '../utils/api-client.js';

export interface ListTracksArgs {
    year?: number;
    month?: number;
    limit?: number;
}

/**
 * Filter imports by year/month
 */
function filterByDate(imports: any[], year?: number, month?: number): any[] {
    if (!year) {
        return imports;
    }

    return imports.filter((imp: any) => {
        if (!imp.created_at) return false;

        const date = new Date(imp.created_at);
        const impYear = date.getFullYear();
        const impMonth = date.getMonth() + 1; // 0-indexed

        if (impYear !== year) return false;
        if (month && impMonth !== month) return false;

        return true;
    });
}

export async function listTracks(args: ListTracksArgs) {
    const { year, month, limit = 50 } = args;

    // Validate inputs
    if (month && !year) {
        throw new Error('Month filter requires year parameter');
    }
    if (year && (year < 2000 || year > 2100)) {
        throw new Error('Year must be between 2000 and 2100');
    }
    if (month && (month < 1 || month > 12)) {
        throw new Error('Month must be between 1 and 12');
    }
    if (limit < 1 || limit > 200) {
        throw new Error('Limit must be between 1 and 200');
    }

    // Fetch all imports (API doesn't support date filtering)
    // We'll fetch a reasonable amount and filter client-side
    const allImports = await apiClient.getBGeigieImports({ limit: 1000 });

    // Filter by date if specified
    const filtered = filterByDate(allImports, year, month);

    // Limit results
    const limitedResults = filtered.slice(0, limit);

    // Normalize response
    return {
        count: limitedResults.length,
        total_filtered: filtered.length,
        total_available: allImports.length,
        filters: { year, month },
        tracks: limitedResults.map((imp: any) => ({
            id: imp.id,
            name: imp.name,
            description: imp.description,
            cities: imp.cities,
            credits: imp.credits,
            measurement_count: imp.measurements_count,
            status: imp.status,
            approved: imp.approved,
            rejected: imp.rejected,
            created_at: imp.created_at,
            updated_at: imp.updated_at,
            subtype: imp.subtype,
            would_auto_approve: imp.would_auto_approve,
            orientation: imp.orientation,
            height: imp.height,
        })),
    };
}

export const listTracksTool = {
    name: 'list_tracks',
    description:
        'Browse bGeigie Import tracks (bulk radiation measurement drives). Can filter by year and optionally month.',
    inputSchema: {
        type: 'object',
        properties: {
            year: {
                type: 'number',
                description: 'Filter by year (e.g., 2024)',
                minimum: 2000,
                maximum: 2100,
            },
            month: {
                type: 'number',
                description: 'Filter by month (1-12, requires year parameter)',
                minimum: 1,
                maximum: 12,
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 50, max: 200)',
                minimum: 1,
                maximum: 200,
                default: 50,
            },
        },
        required: [],
    },
};
