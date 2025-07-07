import React, { useState } from "react";

export interface StackedDataItem {
  label: string;
  value: number;
  color: string;
}

export interface BPChartProps {
  data: {
    month: string;
    values: StackedDataItem[];
  }[];
  height?: number;
  width?: number;
  maxValue?: number;
  onBarClick?: (bar: { label: string; value: number; month: string }) => void;
}

export const BPChart: React.FC<BPChartProps> = ({
  data,
  height = 400,
  width = 800,
  maxValue,
  onBarClick,
}) => {
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    month: string;
  } | null>(null);

  // Calculate max value dynamically
  const actualMax =
    maxValue ||
    Math.max(...data.map((item) => item.values.reduce((sum, v) => sum + v.value, 0)));

  const margin = 50;
  const columnWidth = 40;
  const gap = 30;
  const leftPadding = 70;
  const bottomPadding = 50;
  const topPadding = 40;
  const numTicks = 5;

  // Generate y-axis ticks
  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => {
    const value = Math.round((actualMax * (numTicks - i)) / numTicks);
    const y = (height - 100) * i / numTicks + topPadding;
    return { value, y };
  });

  const chartHeight = height - 100;
  const totalWidth = Math.max(width, data.length * (columnWidth + gap) + margin * 2);

  const allLabels: string[] = Array.from(
    new Set(data.flatMap((d) => d.values.map((v) => v.label)))
  );

  const labelColors: Record<string, string> = {};
  data.forEach((d) =>
    d.values.forEach((v) => {
      if (!labelColors[v.label]) labelColors[v.label] = v.color;
    })
  );

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        userSelect: "none",
        textAlign: "center",
        width: "100%",
        overflowX: "auto",
      }}
    >
      <svg
        width={width}
        height={height}
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px #e0e7ef",
        }}
      >
        {/* Y-axis grid lines and labels */}
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={leftPadding}
              x2={width - 20}
              y1={tick.y}
              y2={tick.y}
              stroke="#e5e7eb"
              strokeDasharray="4 2"
            />
            <text
              x={leftPadding - 10}
              y={tick.y + 4}
              fontSize={12}
              textAnchor="end"
              fill="#888"
            >
              {tick.value}
            </text>
          </g>
        ))}
        {/* Y-axis */}
        <line
          x1={leftPadding}
          x2={leftPadding}
          y1={topPadding}
          y2={chartHeight + topPadding}
          stroke="#333"
          strokeWidth={1.5}
        />
        {/* X-axis */}
        <line
          x1={leftPadding}
          x2={width - 20}
          y1={chartHeight + topPadding}
          y2={chartHeight + topPadding}
          stroke="#333"
          strokeWidth={1.5}
        />
        {/* Columns */}
        {data.map((item, index) => {
          let yOffset = 0;
          const x = leftPadding + index * (columnWidth + gap);
          const total = item.values.reduce((sum, d) => sum + d.value, 0);
          return (
            <g key={item.month}>
              {item.values.map((d, i) => {
                const h = (d.value / actualMax) * chartHeight;
                const y = chartHeight - yOffset - h + topPadding;
                yOffset += h;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={columnWidth}
                    height={h}
                    fill={d.color}
                    rx={4}
                    style={{ filter: "drop-shadow(0 1px 2px #e0e7ef)" }}
                    onClick={() =>
                      onBarClick?.({
                        label: d.label,
                        value: d.value,
                        month: item.month,
                      })
                    }
                    onMouseEnter={() =>
                      setHovered({
                        x: x + columnWidth / 2,
                        y,
                        label: d.label,
                        value: d.value,
                        month: item.month,
                      })
                    }
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
              {/* Value label on top of each column */}
              <text
                x={x + columnWidth / 2}
                y={topPadding - 8}
                fontSize={12}
                textAnchor="middle"
                fontWeight="bold"
                fill="#222"
              >
                {total}
              </text>
              {/* Month label */}
              <text
                x={x + columnWidth / 2}
                y={chartHeight + topPadding + 24}
                fontSize={13}
                textAnchor="middle"
                fill="#333"
                fontWeight="500"
              >
                {item.month}
              </text>
            </g>
          );
        })}
        {/* Legend */}
        {data[0]?.values.map((d, i) => (
          <g key={i}>
            <rect
              x={leftPadding + i * 120}
              y={height - 30}
              width={16}
              height={16}
              fill={d.color}
              rx={3}
            />
            <text
              x={leftPadding + i * 120 + 24}
              y={height - 17}
              fontSize={13}
              fill="#333"
            >
              {d.label}
            </text>
          </g>
        ))}

        {hovered && (
          <g>
            <foreignObject
              x={hovered.x - 60}
              y={hovered.y - 50}
              width={120}
              height={40}
            >
              <div
                style={{
                  background: "#333",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 12,
                  textAlign: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{hovered.label}</div>
                <div>
                  {hovered.value} in <strong>{hovered.month}</strong>
                </div>
              </div>
            </foreignObject>
          </g>
        )}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 16,
          padding: "16px 0 0",
        }}
      >
        {allLabels.map((label) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              color: "#333",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                marginRight: 6,
                display: "inline-block",
                backgroundColor: labelColors[label],
              }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BPChart;
