#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import { queryRadiation, queryRadiationTool } from './tools/query-radiation.js';
import { searchArea, searchAreaTool } from './tools/search-area.js';
import { listTracks, listTracksTool } from './tools/list-tracks.js';
import { radiationInfo, radiationInfoTool } from './tools/radiation-info.js';
import { getTrack, getTrackTool } from './tools/get-track.js';
import { getSpectrum, getSpectrumTool } from './tools/get-spectrum.js';
import { deviceHistory, deviceHistoryTool } from './tools/device-history.js';

// Create server instance
const server = new Server(
    {
        name: 'safecast-mcp-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            queryRadiationTool,
            getTrackTool,
            listTracksTool,
            getSpectrumTool,
            searchAreaTool,
            radiationInfoTool,
            deviceHistoryTool,
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        let result: any;

        switch (name) {
            case 'query_radiation':
                result = await queryRadiation(args as any);
                break;

            case 'get_track':
                result = await getTrack(args as any);
                break;

            case 'search_area':
                result = await searchArea(args as any);
                break;

            case 'list_tracks':
                result = await listTracks(args as any);
                break;

            case 'get_spectrum':
                result = await getSpectrum(args as any);
                break;

            case 'radiation_info':
                result = await radiationInfo(args as any);
                break;

            case 'device_history':
                result = await deviceHistory(args as any);
                break;

            default:
                throw new Error(`Unknown tool: ${name}`);
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: errorMessage }, null, 2),
                },
            ],
            isError: true,
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Safecast MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
