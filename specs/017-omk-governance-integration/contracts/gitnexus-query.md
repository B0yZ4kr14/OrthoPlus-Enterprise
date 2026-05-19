# Contract: GitNexus Query Interface

**Feature**: 017-omk-governance-integration

## Interface

GitNexus exposes a query interface via MCP (Model Context Protocol) tools.

### Query Operations

| Operation | Input | Output |
|-----------|-------|--------|
| `gitnexus_impact` | `target`: symbol name, `direction`: upstream/downstream | Blast radius report with affected symbols, risk level, execution flows |
| `gitnexus_context` | `name`: symbol name | Full context: callers, callees, execution flows, cluster membership |
| `gitnexus_query` | `query`: concept string | Execution flows ranked by relevance |
| `gitnexus_detect_changes` | — | Changed symbols and affected execution flows |

### Response Format

```json
{
  "symbol": "AuthController",
  "riskLevel": "MEDIUM",
  "directCallers": ["router.ts", "middleware.ts"],
  "affectedFlows": ["auth-flow", "admin-flow"],
  "affectedModules": ["auth", "admin_tools"]
}
```

### Error Handling

- `INDEX_STALE`: Re-run `npx gitnexus analyze`
- `SYMBOL_NOT_FOUND`: Verify symbol name or check if file is excluded from index
- `GRAPH_UNAVAILABLE`: Check GitNexus service status
