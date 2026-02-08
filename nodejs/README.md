# Safecast MCP Server

A Model Context Protocol (MCP) server that provides conversational access to Safecast's open radiation data via ai.safecast.org.

## Features

**All 7 tools from the original plan:**

1. **query_radiation**: Find radiation measurements near a geographic location
2. **get_track**: Get measurements from a specific track/journey
3. **list_tracks**: Browse bGeigie Import tracks (bulk measurement drives)
4. **get_spectrum**: Get gamma spectroscopy data (informative response about API limitation)
5. **search_area**: Search for measurements within a bounding box
6. **radiation_info**: Get educational reference information about radiation
7. **device_history**: Get historical measurements from a specific monitoring device

## Installation

```bash
npm install
npm run build
```

## Usage

### Local Testing (stdio)

```bash
npm start
```

### With MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

### With Claude Desktop

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "safecast": {
      "command": "node",
      "args": ["C:/Azamat/Safecast/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop and ask questions like:
- "What are the radiation levels near Fukushima?"
- "Show me tracks recorded in Japan in 2024"
- "What does 0.5 µSv/h mean? Is that dangerous?"

## Example Tool Calls

### query_radiation
```json
{
  "lat": 37.3861,
  "lon": 141.0342,
  "radius_m": 5000,
  "limit": 25
}
```

### search_area
```json
{
  "min_lat": 35.5,
  "max_lat": 35.8,
  "min_lon": 139.5,
  "max_lon": 139.9,
  "limit": 100
}
```

### get_track
```json
{
  "track_id": 10757,
  "limit": 100
}
```

### list_tracks
```json
{
  "year": 2024,
  "limit": 50
}
```

### radiation_info
```json
{
  "topic": "safety_levels"
}
```

Available topics: `units`, `dose_rates`, `safety_levels`, `detectors`, `background_levels`, `isotopes`

### get_spectrum
```json
{
  "marker_id": 12345
}
```

Note: Returns informative message about API limitation and alternatives.

### device_history
```json
{
  "device_id": 29,
  "days": 7,
  "limit": 100
}
```

## Architecture

```
Custom GPT → MCP Server → api.safecast.org
```

- No database connection required
- No authentication needed (public data)
- Read-only queries
- Results limited to ≤200 items per tool
- 7 tools total (100% match with original plan)

## Development

```bash
# Build
npm run build

# Watch mode
npm run watch

# Start server
npm start
```

## License

MIT
