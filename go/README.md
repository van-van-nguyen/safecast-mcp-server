# Safecast MCP Server (Go)

> ⚠️ **Early Development:** This is a proof-of-concept. For a production-ready implementation, see the [Node.js version](../nodejs/).

Minimal Go-based MCP server using `mcp-go` with SSE transport.

## Status

- ✅ MCP server skeleton
- ✅ SSE transport working (port 3333)
- ✅ Ping tool (health check)
- 🚧 Safecast API integration (planned)

## Current Features

**1 tool:** `ping` - Returns "pong" for health checking

## Run the Server

```bash
cd go
go run cmd/mcp-server/main.go
```

Server starts on `http://localhost:3333`

### Testing

1. Open SSE stream:
```bash
curl -N http://localhost:3333/sse
```

2. Call ping tool (replace SESSION_ID):
```bash
curl -X POST "http://localhost:3333/message?sessionId=<SESSION_ID>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"ping"}}'
```

## Planned Features

Roadmap to match Node.js implementation:

- [ ] Safecast API client wrapper
- [ ] `query_radiation` tool
- [ ] `get_track` tool
- [ ] `list_tracks` tool
- [ ] `search_area` tool
- [ ] `radiation_info` tool (static content)
- [ ] `device_history` tool

## Architecture

```
Custom GPT → MCP Server (Go) → api.safecast.org
```

## Contributing

This implementation is in early stages. For a complete reference implementation, see the [Node.js version](../nodejs/).

## Dependencies

- Go 1.21+
- `github.com/mark3labs/mcp-go`

## License

MIT
