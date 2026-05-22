import { useMemo, useState } from "react"
import { useMemoryHubGraph } from "../hooks/useMemoryHubGraph"

interface NodePosition {
  id: string
  x: number
  y: number
  label: string
  docType: string
}

const DOC_TYPE_COLORS: Record<string, string> = {
  spec: "#3b82f6",
  plan: "#10b981",
  architecture: "#8b5cf6",
  contract: "#f59e0b",
  memory: "#ef4444",
  doc: "#6b7280",
}

export function MemoryHubGraph() {
  const { graph, loading, error } = useMemoryHubGraph()
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const { nodes, edges, width, height } = useMemo(() => {
    const w = 800
    const h = 500
    const padding = 60

    if (graph.nodes.length === 0) {
      return { nodes: [], edges: [], width: w, height: h }
    }

    // Simple force-directed layout (static, deterministic)
    const positions = new Map<string, { x: number; y: number }>()
    const angleStep = (2 * Math.PI) / graph.nodes.length
    const radius = Math.min(w, h) / 2 - padding

    graph.nodes.forEach((node, i) => {
      const angle = i * angleStep
      positions.set(node.id, {
        x: w / 2 + radius * Math.cos(angle),
        y: h / 2 + radius * Math.sin(angle),
      })
    })

    // Apply 3 iterations of simple repulsion/attraction
    for (let iter = 0; iter < 3; iter++) {
      for (const edge of graph.edges) {
        const s = positions.get(edge.source)
        const t = positions.get(edge.target)
        if (!s || !t) continue
        // Pull connected nodes closer
        const dx = t.x - s.x
        const dy = t.y - s.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
        const force = 0.05
        s.x += dx * force
        s.y += dy * force
        t.x -= dx * force
        t.y -= dy * force
      }
    }

    const nodePositions: NodePosition[] = graph.nodes.map((n) => ({
      id: n.id,
      x: positions.get(n.id)?.x ?? w / 2,
      y: positions.get(n.id)?.y ?? h / 2,
      label: n.label,
      docType: n.docType,
    }))

    const edgePaths = graph.edges
      .map((e) => {
        const s = positions.get(e.source)
        const t = positions.get(e.target)
        if (!s || !t) return null
        return { source: e.source, target: e.target, x1: s.x, y1: s.y, x2: t.x, y2: t.y }
      })
      .filter(Boolean) as Array<{
        source: string
        target: string
        x1: number
        y1: number
        x2: number
        y2: number
      }>

    return { nodes: nodePositions, edges: edgePaths, width: w, height: h }
  }, [graph])

  const selectedEdges = useMemo(() => {
    if (!selectedNode) return []
    return edges.filter((e) => e.source === selectedNode || e.target === selectedNode)
  }, [selectedNode, edges])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">Carregando grafo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-destructive">Erro ao carregar grafo: {error}</div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">Nenhum documento indexado ainda.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grafo de Referencias Cruzadas</h3>
          <p className="text-sm text-muted-foreground">
            {graph.nodes.length} documentos · {graph.edges.length} referencias
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          {Object.entries(DOC_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded-lg border bg-card">
        <svg width={width} height={height} className="block">
          {/* Edges */}
          {edges.map((e, i) => {
            const isHighlighted = selectedEdges.some(
              (se) => se.source === e.source && se.target === e.target,
            )
            return (
              <line
                key={`edge-${i}`}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={isHighlighted ? "#3b82f6" : "#e5e7eb"}
                strokeWidth={isHighlighted ? 2 : 1}
                opacity={selectedNode && !isHighlighted ? 0.2 : 1}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const isSelected = selectedNode === n.id
            const isHovered = hoveredNode === n.id
            const color = DOC_TYPE_COLORS[n.docType] || DOC_TYPE_COLORS.doc

            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(isSelected ? null : n.id)}
                onMouseEnter={() => setHoveredNode(n.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  r={isSelected ? 10 : isHovered ? 8 : 6}
                  fill={color}
                  opacity={selectedNode && !isSelected ? 0.3 : 1}
                  stroke={isSelected ? "#1f2937" : "white"}
                  strokeWidth={2}
                />
                {(isSelected || isHovered) && (
                  <text
                    y={-12}
                    textAnchor="middle"
                    className="text-xs"
                    style={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                  >
                    {n.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {selectedNode && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="font-medium">Documento Selecionado</h4>
          {(() => {
            const node = graph.nodes.find((n) => n.id === selectedNode)
            if (!node) return null
            return (
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Nome:</span> {node.label}
                </p>
                <p>
                  <span className="text-muted-foreground">Tipo:</span>{" "}
                  <span className="capitalize">{node.docType}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Caminho:</span>{" "}
                  <code className="text-xs">{node.sourcePath}</code>
                </p>
                <p>
                  <span className="text-muted-foreground">Referencias:</span>{" "}
                  {selectedEdges.length}
                </p>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
