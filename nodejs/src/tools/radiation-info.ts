import { getRadiationInfo } from '../utils/reference-data.js';

export interface RadiationInfoArgs {
    topic: string;
}

const VALID_TOPICS = [
    'units',
    'dose_rates',
    'safety_levels',
    'detectors',
    'background_levels',
    'isotopes',
];

export async function radiationInfo(args: RadiationInfoArgs) {
    const { topic } = args;

    // Validate topic
    const normalizedTopic = topic.toLowerCase().replace(/[_-]/g, '_');
    if (!VALID_TOPICS.includes(normalizedTopic)) {
        throw new Error(
            `Invalid topic: "${topic}". Valid topics: ${VALID_TOPICS.join(', ')}`
        );
    }

    // Get reference data
    const content = getRadiationInfo(normalizedTopic);

    return {
        topic: normalizedTopic,
        content,
    };
}

export const radiationInfoTool = {
    name: 'radiation_info',
    description:
        'Get educational reference information about radiation units, safety levels, detectors, and related topics. Returns static reference content.',
    inputSchema: {
        type: 'object',
        properties: {
            topic: {
                type: 'string',
                description:
                    'Topic to retrieve information about',
                enum: VALID_TOPICS,
            },
        },
        required: ['topic'],
    },
};
