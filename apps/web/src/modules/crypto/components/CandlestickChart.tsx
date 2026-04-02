import { useState } from "react";
import { Card } from "@orthoplus/core-ui/card";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { Button } from "@orthoplus/core-ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface CandlestickDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  coinType: string;
}

export function CandlestickChart({ data, coinType }: CandlestickChartProps) {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | undefined>();

  const handleZoomIn = () => {
    if (!zoomDomain) {
      const start = Math.floor(data.length * 0.25);
      const end = Math.floor(data.length * 0.75);
      setZoomDomain([start, end]);
    } else {
      const [start, end] = zoomDomain;
      const range = end - start;
      const newStart = start + Math.floor(range * 0.25);
      const newEnd = end - Math.floor(range * 0.25);
      setZoomDomain([newStart, newEnd]);
    }
  };

  const handleZoomOut = () => {
    if (!zoomDomain) return;
    const [start, end] = zoomDomain;
    const range = end - start;
    const newStart = Math.max(0, start - Math.floor(range * 0.5));
    const newEnd = Math.min(data.length - 1, end + Math.floor(range * 0.5));

    if (newStart === 0 && newEnd === data.length - 1) {
      setZoomDomain(undefined);
    } else {
      setZoomDomain([newStart, newEnd]);
    }
  };

  const handleResetZoom = () => {
    setZoomDomain(undefined);
  };

  // Transform data for candlestick representation
  const chartData = data.map((point) => {
    const isGreen = point.close >= point.open;
    return {
      ...point,
      // For candlestick body (open to close)
      bodyBottom: Math.min(point.open, point.close),
      bodyTop: Math.max(point.open, point.close),
      bodyHeight: Math.abs(point.close - point.open),
      // For wicks (high/low lines)
      wickLow: point.low,
      wickHigh: point.high,
      color: isGreen ? "hsl(var(--success))" : "hsl(var(--destructive))",
      isGreen,
    };
  });

  const displayData = zoomDomain
    ? chartData.slice(zoomDomain[0], zoomDomain[1])
    : chartData;

  return (
    <Card className="p-6" depth="normal">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            Gráfico Candlestick - {coinType}
          </h3>
          <p className="text-sm text-muted-foreground">
            Análise técnica avançada com padrões intraday
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={!zoomDomain}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetZoom}
            disabled={!zoomDomain}
            title="Reset Zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={displayData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
            }}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
          />
          <YAxis
            yAxisId="volume"
            orientation="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload;
                return (
                  <Card className="p-3 shadow-lg">
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold">
                        {new Date(data.time).toLocaleString("pt-BR")}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-muted-foreground">Abertura:</span>
                        <span className="font-mono">
                          R$ {data.open.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">Máxima:</span>
                        <span className="font-mono text-success">
                          R$ {data.high.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">Mínima:</span>
                        <span className="font-mono text-destructive">
                          R$ {data.low.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          Fechamento:
                        </span>
                        <span
                          className={`font-mono ${data.isGreen ? "text-success" : "text-destructive"}`}
                        >
                          R$ {data.close.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-mono">
                          {data.volume.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              }
              return null;
            }}
          />

          {/* Volume bars */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="url(#volumeGradient)"
            opacity={0.5}
            radius={[4, 4, 0, 0]}
          />

          {/* Candlestick wicks (high-low lines) */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="wickHigh"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            dot={false}
            connectNulls
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="wickLow"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            dot={false}
            connectNulls
          />

          {/* Candlestick bodies represented as bars */}
          <Bar
            yAxisId="price"
            dataKey="bodyHeight"
            stackId="candle"
            fill="hsl(var(--primary))"
            radius={[2, 2, 2, 2]}
            shape={(props: unknown) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height || 2}
                  fill={payload.color}
                  stroke={payload.color}
                  strokeWidth={1}
                  rx={2}
                />
              );
            }}
          />

          {/* Brush for pan/zoom */}
          {data.length > 20 && (
            <Brush
              dataKey="time"
              height={30}
              stroke="hsl(var(--primary))"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                });
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Pontos de dados:</span>
          <span className="ml-2 font-semibold">{data.length}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Período:</span>
          <span className="ml-2 font-semibold">Intraday</span>
        </div>
        <div>
          <span className="text-muted-foreground">Intervalo:</span>
          <span className="ml-2 font-semibold">15 minutos</span>
        </div>
        <div>
          <span className="text-muted-foreground">Zoom:</span>
          <span className="ml-2 font-semibold">
            {zoomDomain
              ? `${Math.round(((zoomDomain[1] - zoomDomain[0]) / data.length) * 100)}%`
              : "100%"}
          </span>
        </div>
      </div>
    </Card>
  );
}
