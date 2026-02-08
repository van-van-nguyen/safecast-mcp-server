# Safecast MCP Server

MCP server implementations for querying Safecast radiation data.


### 🔧 Go (Experimental)

Basic MCP server skeleton with SSE transport.

- **Status:** 🚧 Early development
- **Tools:** 1/7 (ping only)
- **Transport:** SSE/streaming HTTP
- **Location:** `go/`
- **[View Documentation →](conversation-notes.md)**

**Quick Start:**
```bash
cd go
# Safecast MCP Server — Go-first

This repository hosts an MCP (Model Context Protocol) server implementation that exposes Safecast radiation data for conversational clients. The primary implementation here is the Go server located in `go/`. A Node.js implementation exists under `nodejs/` and may be used as a reference.

## What this repo provides

- A Go-based MCP server skeleton with SSE and streamable HTTP transports (`go/cmd/mcp-server/`).
- A Safecast HTTP client (`go/cmd/mcp-server/api_client.go`) and a set of reference radiation data (`reference_data.go`).
- Tool outlines for common Safecast queries: query_radiation, get_track, list_tracks, get_spectrum, search_area, radiation_info, device_history.

## Status

- Go implementation: primary, actively developed (proof-of-concept with working SSE transport and Safecast client; additional tools to complete).
- Node implementation: available under `nodejs/` as a reference and example (optional).

## Prerequisites

- Go 1.21+
- Network access to https://api.safecast.org

## Quick start — Go server

Run locally:

```bash
cd go
go run cmd/mcp-server/main.go
```

By default the server listens on port 3333.

Environment variables

- `MCP_BASE_URL` — (optional) base URL used in metadata (default `http://localhost:3333`)
- `DATABASE_URL` — (optional) if set the server attempts a PostgreSQL connection; otherwise it uses the Safecast REST API as a fallback

Endpoints

- SSE transport (static base path `/mcp`):
	- `/mcp/sse` — Server-Sent Events endpoint
	- `/mcp/message` — JSON-RPC message endpoint used by SSE clients (POST)
- Streamable HTTP transport:
	- `/mcp-http`

Curl testing

Open SSE stream:

```bash
curl -N http://localhost:3333/sse
```

Call the `ping` tool (replace `SESSION_ID`):

```bash
curl -X POST "http://localhost:3333/message?sessionId=SESSION_ID" \
	-H "Content-Type: application/json" \
	-d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"ping"}}'
```

## Tools (overview)

- `ping` — health check (returns `pong`)
- `query_radiation` — query measurements near lat/lon (params: `latitude`, `longitude`, `distance`/`radius_m`, `limit`)
- `get_track` — measurements for a bGeigie import (params: `track_id`, `limit`)
- `list_tracks` — list bGeigie imports (params: `year`, `limit`)
- `get_spectrum` — gamma spectroscopy info or API-based data (params: `marker_id`)
- `search_area` — bounding-box search (params: `min_lat`, `max_lat`, `min_lon`, `max_lon`, `limit`)
- `radiation_info` — static educational topics (topics: `units`, `dose_rates`, `safety_levels`, `detectors`, `background_levels`, `isotopes`)
- `device_history` — device measurement history (params: `device_id`, `days`, `limit`)

See tool definitions and handlers in `go/cmd/mcp-server/` for exact parameter names and behavior.

## Implementation notes

- The Go server uses `github.com/mark3labs/mcp-go` for MCP server and transport support.
- `api_client.go` implements a lightweight Safecast REST client with JSON parsing and helper functions (`GetMeasurements`, `GetBGeigieImports`, etc.).
- `reference_data.go` contains user-facing educational content for the `radiation_info` tool.

Known caveats

- The Go implementation is under active development: some tools may be stubs or partially implemented — check the handlers in `go/cmd/mcp-server`.
- Rate limiting and pagination follow Safecast API behavior; server side caps responses to keep conversational responses manageable.

## Development & testing

Run (dev):

```bash
cd go
go run cmd/mcp-server/main.go
```

Suggested tooling

- `golangci-lint` / `go vet` for linting
- Add unit/integration tests that mock the Safecast API for CI

## Node.js reference implementation

If you need a ready-made, more feature-complete MCP server for quick testing, see `nodejs/`. That implementation uses the `@modelcontextprotocol` SDK and `axios` to query Safecast.

## Contributing

Contributions are welcome. If you add or change a tool's interface, please open an issue first so downstream clients can be coordinated with. Standard workflow: fork → branch → PR with tests and a short description.

## License

MIT
