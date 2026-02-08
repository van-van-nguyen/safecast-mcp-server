export interface GetSpectrumArgs {
    marker_id: number;
}

export async function getSpectrum(args: GetSpectrumArgs) {
    const { marker_id } = args;

    if (!marker_id || marker_id < 1) {
        throw new Error('marker_id must be a positive number');
    }

    // NOTE: Safecast public API does not expose gamma spectrum data
    // This would require direct database access or a separate spectrum API
    // For now, return an informative message

    return {
        marker_id,
        available: false,
        message:
            'Gamma spectrum data is not available through the Safecast public API. ' +
            'Spectrum analysis requires raw device data files or direct database access. ' +
            'For spectrum analysis, please download raw log files from individual bGeigie imports.',
        alternatives: [
            'Download raw bGeigie log files (.LOG files) for offline spectrum analysis',
            'Contact Safecast directly for spectrum data access',
            'Use devices with built-in spectrum capabilities (e.g., RadiaCode)',
        ],
    };
}

export const getSpectrumTool = {
    name: 'get_spectrum',
    description:
        'Get gamma spectroscopy data for a specific measurement point. Note: Spectrum data is not available via the public API.',
    inputSchema: {
        type: 'object',
        properties: {
            marker_id: {
                type: 'number',
                description: 'Marker/measurement identifier',
                minimum: 1,
            },
        },
        required: ['marker_id'],
    },
};
