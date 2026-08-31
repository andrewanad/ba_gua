import type { LineKind } from "../data/bagua";

interface GlyphProps {
  /** 自下而上的爻 */
  lines: LineKind[];
  size?: number; // 宽度 px
  color?: string;
  className?: string;
}

const LINE_H = 5;
const GAP = 6;

/** 以独立 SVG 绘制卦象(用于表格、起卦器等 HTML 场景) */
export default function TrigramGlyph({ lines, size = 36, color = "currentColor", className }: GlyphProps) {
  const n = lines.length;
  const h = n * LINE_H + (n - 1) * GAP;
  const segW = (size - 7) / 2;
  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`} className={className} aria-hidden>
      {lines.map((kind, idx) => {
        // lines[0] 为最下爻,绘制时最下爻 y 最大
        const y = h - (idx + 1) * LINE_H - idx * GAP;
        return kind === "yang" ? (
          <rect key={idx} x={0} y={y} width={size} height={LINE_H} rx={1} fill={color} />
        ) : (
          <g key={idx}>
            <rect x={0} y={y} width={segW} height={LINE_H} rx={1} fill={color} />
            <rect x={segW + 7} y={y} width={segW} height={LINE_H} rx={1} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

/** 在 SVG 坐标系内以 <g> 形式绘制爻线(用于八卦盘节点),中心为 (0, 0) */
export function TrigramLinesG({
  lines,
  width = 34,
  color = "#e9dfc8",
  centerY = 0,
}: {
  lines: LineKind[];
  width?: number;
  color?: string;
  centerY?: number;
}) {
  const n = lines.length;
  const h = n * LINE_H + (n - 1) * GAP;
  const top = centerY - h / 2;
  const segW = (width - 7) / 2;
  return (
    <g>
      {lines.map((kind, idx) => {
        const y = top + h - (idx + 1) * LINE_H - idx * GAP;
        return kind === "yang" ? (
          <rect key={idx} x={-width / 2} y={y} width={width} height={LINE_H} rx={1.5} fill={color} />
        ) : (
          <g key={idx}>
            <rect x={-width / 2} y={y} width={segW} height={LINE_H} rx={1.5} fill={color} />
            <rect x={segW + 7 - width / 2} y={y} width={segW} height={LINE_H} rx={1.5} fill={color} />
          </g>
        );
      })}
    </g>
  );
}
