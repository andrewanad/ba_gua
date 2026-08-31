import { useCallback, useEffect, useRef, useState } from "react";
import { KINGWEN, FUXI, TRIGRAM_MAP, HEXAGRAMS, DIR_LABELS, type LineKind } from "../data/bagua";
import { TrigramLinesG } from "./TrigramGlyph";

interface WheelProps {
  selected: string | null;
  onSelect: (id: string) => void;
  hexKey: string | null;
  onSelectHex: (key: string) => void;
  onDivineClick: () => void;
  divineSignal: number;
  onDivineSpinDone: () => void;
}

const rad = (d: number) => (d * Math.PI) / 180;
const polar = (angleDeg: number, r: number): [number, number] => [
  r * Math.sin(rad(angleDeg)),
  -r * Math.cos(rad(angleDeg)),
];

const R_INNER_RING = 92;
const R_TICK = 176;
const R_TRI = 232;
const R_HEX_IN = 293;
const R_HEX_OUT = 331;
const R_RIM1 = 342;
const R_RIM2 = 346;
const R_RIM3 = 354;
const R_TEXT = 353;
const R_DIR = 386;

const LINE_H = 5;
const LINE_GAP = 6;

const FUXI_ORDER = ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"];

interface Cell {
  key: string;
  upper: string;
  lower: string;
  angle: number;
}

function buildCells(layout: { id: string }[]): Cell[] {
  const cells: Cell[] = [];
  layout.forEach((node, k) => {
    const ang = k * 45;
    for (let j = 0; j < 8; j++) {
      const upper = FUXI_ORDER[j];
      const lower = node.id;
      cells.push({ key: `${upper}-${lower}`, upper, lower, angle: ang - 22.5 + (j + 0.5) * 5.625 });
    }
  });
  return cells;
}

function annularSector(a0: number, a1: number, r0: number, r1: number): string {
  const [x0, y0] = polar(a0, r1);
  const [x1, y1] = polar(a1, r1);
  const [x2, y2] = polar(a1, r0);
  const [x3, y3] = polar(a0, r0);
  return `M${x0},${y0} A${r1},${r1} 0 0 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 0 0 ${x3},${y3} Z`;
}

const TICKS = Array.from({ length: 64 }, (_, i) => i * 5.625);
const DIR_MARKS = [
  { char: "离", angle: 0 },
  { char: "震", angle: 270 },
  { char: "坎", angle: 180 },
  { char: "兑", angle: 90 },
];

export default function BaguaWheel({ selected, onSelect, hexKey, onSelectHex, onDivineClick, divineSignal, onDivineSpinDone }: WheelProps) {
  const [arrangement, setArrangement] = useState<"kingwen" | "fuxi">("kingwen");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [rot, setRot] = useState(0);
  const [hoverHex, setHoverHex] = useState<string | null>(null);
  const [spinActive, setSpinActive] = useState(false);

  const rotRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const dragRef = useRef<{ pointerId: number; active: boolean; lastAngle: number; lastTime: number; vel: number }>({
    pointerId: -1, active: false, lastAngle: 0, lastTime: 0, vel: 0,
  });
  const velRef = useRef(0);
  const spinRef = useRef<{ active: boolean; from: number; to: number; t0: number; dur: number }>({
    active: false, from: 0, to: 0, t0: 0, dur: 0,
  });
  const onSpinDoneRef = useRef(onDivineSpinDone);
  onSpinDoneRef.current = onDivineSpinDone;

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const getPointerAngle = useCallback((e: PointerEvent | React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    return (Math.atan2(x, -y) * 180) / Math.PI;
  }, []);

  /* 动画主循环 */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const drag = dragRef.current;
      const spin = spinRef.current;
      if (spin.active) {
        const p = Math.min(1, (now - spin.t0) / spin.dur);
        const e = 1 - Math.pow(1 - p, 3);
        rotRef.current = spin.from + (spin.to - spin.from) * e;
        if (p >= 1) {
          spin.active = false;
          setSpinActive(false);
          setPlaying(false);
          onSpinDoneRef.current();
        }
      } else if (!drag.active) {
        if (Math.abs(velRef.current) > 0.02) {
          rotRef.current += velRef.current * (dt / 16.7);
          velRef.current *= Math.pow(0.94, dt / 16.7);
        } else {
          velRef.current = 0;
          if (playingRef.current) rotRef.current += speedRef.current * 0.18 * (dt / 16.7);
        }
      }
      setRot(rotRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* 梅花占筮:收到信号后旋盘数周 */
  useEffect(() => {
    if (divineSignal <= 0) return;
    spinRef.current = {
      active: true,
      from: rotRef.current,
      to: rotRef.current + 1080 + Math.random() * 540,
      t0: performance.now(),
      dur: 2500,
    };
    setSpinActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divineSignal]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (spinRef.current.active) return;
    dragRef.current = {
      pointerId: e.pointerId,
      active: true,
      lastAngle: getPointerAngle(e),
      lastTime: performance.now(),
      vel: 0,
    };
    velRef.current = 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.active || e.pointerId !== drag.pointerId) return;
    const a = getPointerAngle(e);
    let d = a - drag.lastAngle;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastTime);
    rotRef.current += d;
    drag.vel = (d / dt) * 16.7;
    drag.lastAngle = a;
    drag.lastTime = now;
  };
  const endDrag = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.active || e.pointerId !== drag.pointerId) return;
    drag.active = false;
    drag.pointerId = -1;
    velRef.current = Math.max(-42, Math.min(42, drag.vel));
  };

  const layout = arrangement === "kingwen" ? KINGWEN : FUXI;
  const cells = buildCells(layout);

  /* 卦名标签:反向旋转保持竖直可读 */
  const labelRot = (nodeAngle: number) => {
    let a = (nodeAngle + rot) % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return -a;
  };

  const infoKey = hoverHex || hexKey;
  const info = infoKey ? HEXAGRAMS[infoKey] : null;

  const btnBase = "flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs transition-all active:scale-95";

  return (
    <div className="select-none">
      {/* 控制行 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-sm border border-gold/40">
            {(
              [
                { k: "kingwen", label: "后天 · 文王" },
                { k: "fuxi", label: "先天 · 伏羲" },
              ] as const
            ).map((o) => (
              <button
                key={o.k}
                onClick={() => setArrangement(o.k)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  arrangement === o.k ? "bg-gold/90 font-bold text-ink-900" : "text-gold/80 hover:bg-gold/10"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className={`${btnBase} border-line text-sub hover:border-gold/50 hover:text-gold`}
            aria-label={playing ? "暂停旋转" : "开始旋转"}
          >
            {playing ? (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M2 1h3v10H2zM7 1h3v10H7z" /></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 1l8 5-8 5z" /></svg>
            )}
            {playing ? "暂停" : "旋转"}
          </button>
        </div>
        <button
          onClick={() => !spinActive && onDivineClick()}
          disabled={spinActive}
          className="pulse-stamp group relative overflow-hidden rounded-sm border border-cinn/70 bg-gradient-to-br from-[#c14a34] to-[#93321f] px-5 py-2.5 font-song text-sm font-bold tracking-[0.2em] text-[#f7f1e2] transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-wait disabled:opacity-80"
        >
          <span className="relative z-10">{spinActive ? "掐指推算中…" : "占筮一卦 · 梅花易数"}</span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      </div>

      {/* 盘面 */}
      <div className={`relative ${spinActive ? "cursor-wait" : "cursor-grab active:cursor-grabbing"}`}>
        {/* 朱砂指针 */}
        <div className="pointer-events-none absolute left-1/2 top-[3%] z-10 -translate-x-1/2">
          <svg width="26" height="34" viewBox="0 0 26 34">
            <path d="M13 32 L4 12 A10 10 0 1 1 22 12 Z" fill="#d1503a" />
            <circle cx="13" cy="12" r="4" fill="#f0e7d2" />
          </svg>
        </div>

        <svg
          ref={svgRef}
          viewBox="-430 -430 860 860"
          className="h-auto w-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          role="application"
          aria-label="八卦盘"
        >
          <defs>
            <radialGradient id="dishGrad" cx="50%" cy="46%" r="62%">
              <stop offset="0%" stopColor="#18232f" />
              <stop offset="62%" stopColor="#111a25" />
              <stop offset="100%" stopColor="#0b111a" />
            </radialGradient>
            <radialGradient id="wellGrad" cx="50%" cy="46%" r="60%">
              <stop offset="0%" stopColor="#121b27" />
              <stop offset="100%" stopColor="#0c131d" />
            </radialGradient>
            <linearGradient id="goldRim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a98f55" />
              <stop offset="50%" stopColor="#d8c08a" />
              <stop offset="100%" stopColor="#7d6a42" />
            </linearGradient>
            <linearGradient id="taijiYang" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2e9d3" />
              <stop offset="100%" stopColor="#d9cba6" />
            </linearGradient>
            <linearGradient id="taijiYin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a384c" />
              <stop offset="100%" stopColor="#151e2b" />
            </linearGradient>
          </defs>

          {/* ===== 旋转组 ===== */}
          <g style={{ transform: `rotate(${rot}deg)` }}>
            <circle r={R_RIM1} fill="url(#dishGrad)" stroke="#2c3644" strokeWidth="1" />

            {/* 六十四卦外环 */}
            <circle r={(R_HEX_IN + R_HEX_OUT) / 2} fill="none" stroke="rgba(201,169,98,0.10)" strokeWidth={R_HEX_OUT - R_HEX_IN} />
            <circle r={R_HEX_IN - 3} fill="none" stroke="#7d6a42" strokeWidth="1" opacity="0.55" />
            <circle r={R_HEX_OUT + 3.5} fill="none" stroke="#7d6a42" strokeWidth="1" opacity="0.55" />

            {/* 选中卦扇形高亮 */}
            {infoKey &&
              (() => {
                const c = cells.find((x) => x.key === infoKey);
                if (!c) return null;
                return (
                  <path
                    d={annularSector(c.angle - 2.7, c.angle + 2.7, R_HEX_IN - 4, R_HEX_OUT + 4)}
                    fill={hoverHex === c.key ? "rgba(233,223,200,0.10)" : "rgba(209,80,58,0.20)"}
                    stroke={hoverHex === c.key ? "#e9dfc8" : "#d1503a"}
                    strokeWidth="1"
                  />
                );
              })()}

            {/* 64 卦单元 */}
            {cells.map((c) => {
              const h = HEXAGRAMS[c.key];
              const lines: LineKind[] = [...TRIGRAM_MAP[c.lower].lines, ...TRIGRAM_MAP[c.upper].lines];
              const isSel = c.key === infoKey;
              const barColor = isSel ? "#e3694e" : "#b39a63";
              const step = LINE_H + 1.8;
              return (
                <g
                  key={`${arrangement}-${c.key}`}
                  className="hexnode"
                  transform={`rotate(${c.angle})`}
                  onPointerEnter={() => setHoverHex(c.key)}
                  onPointerLeave={() => setHoverHex(null)}
                  onClick={() => onSelectHex(c.key)}
                >
                  <title>{h.name} · 上{TRIGRAM_MAP[c.upper].char}下{TRIGRAM_MAP[c.lower].char}</title>
                  <rect x={-12} y={-(R_HEX_OUT + 3)} width={24} height={R_HEX_OUT - R_HEX_IN + 6} fill="transparent" />
                  {lines.map((kind, j) => {
                    const y = -(R_HEX_IN + j * step + LINE_H);
                    return kind === "yang" ? (
                      <rect key={j} x={-8} y={y} width={16} height={LINE_H} fill={barColor} className="hexbar" />
                    ) : (
                      <g key={j} className="hexbar" fill={barColor}>
                        <rect x={-8} y={y} width={6.4} height={LINE_H} />
                        <rect x={1.6} y={y} width={6.4} height={LINE_H} />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* 分隔辐条(穿透两环) */}
            {Array.from({ length: 8 }, (_, i) => {
              const a = i * 45 - 22.5;
              const [x1, y1] = polar(a, R_INNER_RING);
              const [x2, y2] = polar(a, R_HEX_OUT + 3.5);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7d6a42" strokeWidth="1" opacity="0.5" />;
            })}

            {/* 内环:天干地支刻度 */}
            <circle r={R_INNER_RING} fill="none" stroke="#7d6a42" strokeWidth="1" opacity="0.6" />
            {TICKS.map((a, i) => {
              const major = i % 8 === 0;
              const [x1, y1] = polar(a, R_INNER_RING + 3);
              const [x2, y2] = polar(a, R_INNER_RING + (major ? 13 : 8));
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a7448" strokeWidth={major ? 1.6 : 0.8} opacity={major ? 0.85 : 0.45} />;
            })}

            {/* 八节点 */}
            {layout.map((t, k) => {
              const ang = k * 45;
              const isSel = selected === t.id;
              return (
                <g
                  key={`${arrangement}-${t.id}`}
                  className="bnode"
                  transform={`rotate(${ang}) translate(0 ${-R_TRI}) rotate(${-ang})`}
                  onClick={(e) => { e.stopPropagation(); onSelect(t.id); }}
                >
                  <circle r={46} fill="transparent" />
                  <g className="bnode-inner">
                    <circle
                      className="node-bg"
                      r={42}
                      fill={isSel ? "rgba(209,80,58,0.10)" : "rgba(13,19,27,0.72)"}
                      stroke={isSel ? "#d1503a" : "#6f5b3a"}
                      strokeWidth={isSel ? 2 : 1.2}
                    />
                    {isSel && (
                      <circle r={48} fill="none" stroke="#d1503a" strokeWidth="1" strokeDasharray="3 6" className="sel-halo" opacity="0.8" />
                    )}
                    <text
                      y={-13}
                      textAnchor="middle"
                      fontSize="27"
                      fill={isSel ? "#e3694e" : "#e9dfc8"}
                      style={{ fontFamily: "'Ma Shan Zheng','Noto Serif SC',serif" }}
                    >
                      {t.char}
                    </text>
                    <TrigramLinesG lines={t.lines} width={30} color={isSel ? "#e3694e" : "#c9a962"} centerY={15} />
                  </g>
                  <text
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="12"
                    fill="#6d7887"
                    style={{
                      fontFamily: "'Noto Serif SC',serif",
                      letterSpacing: "0.2em",
                      transform: `rotate(${labelRot(ang)}deg)`,
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  >
                    {t.nature}
                  </text>
                </g>
              );
            })}

            {/* 罗盘字符圈 */}
            <circle r={R_TICK} fill="none" stroke="#7d6a42" strokeWidth="0.6" opacity="0.35" />
            {"甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥".split("").map((ch, i) => {
              const a = i * (360 / 24) + 7.5;
              const [x, y] = polar(a, R_TICK);
              return (
                <text key={ch + i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#8a7448" opacity="0.85" style={{ fontFamily: "'Noto Serif SC',serif" }}>
                  {ch}
                </text>
              );
            })}

            {/* 中井 */}
            <circle r={90} fill="url(#wellGrad)" stroke="#7d6a42" strokeWidth="1.2" />
            <circle r={84} fill="none" stroke="#7d6a42" strokeWidth="0.7" opacity="0.45" strokeDasharray="2 5" />

            {/* 太极 */}
            <g className="taiji-glow">
              <g>
                <circle r={70} fill="url(#taijiYin)" stroke="#c9a962" strokeWidth="2.5" />
                <path d="M0,-70 A70,70 0 0 1 0,70 A35,35 0 0 1 0,0 A35,35 0 0 0 0,-70 Z" fill="url(#taijiYang)" />
                <circle cy={-35} r={9} fill="url(#taijiYin)" />
                <circle cy={35} r={9} fill="url(#taijiYang)" />
              </g>
            </g>
          </g>

          {/* ===== 静止外框 ===== */}
          <circle r={R_RIM1} fill="none" stroke="url(#goldRim)" strokeWidth="3" />
          <circle r={R_RIM2} fill="none" stroke="#7d6a42" strokeWidth="1" opacity="0.7" />
          <circle r={R_RIM3} fill="none" stroke="#7d6a42" strokeWidth="1" opacity="0.45" />

          {/* 六十四道刻度(静止,对齐指针) */}
          {TICKS.map((a, i) => {
            const major = i % 8 === 0;
            const [x1, y1] = polar(a, R_RIM3 + 4);
            const [x2, y2] = polar(a, R_RIM3 + (major ? 13 : 7));
            return <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a98f55" strokeWidth={major ? 1.8 : 0.9} opacity={major ? 0.9 : 0.4} />;
          })}

          {/* 方位文字 */}
          {DIR_LABELS.map((d) => {
            const [x, y] = polar(d.angle, R_DIR);
            return (
              <text key={d.char} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={d.major ? 17 : 11} fill={d.major ? "#e9dfc8" : "#8f9aa6"} style={{ fontFamily: "'Noto Serif SC',serif", letterSpacing: d.major ? "0" : "0.1em" }}>
                {d.char}
              </text>
            );
          })}

          {/* 四正卦标记(古图:离南坎北震东兑西) */}
          {DIR_MARKS.map((m) => {
            const [x, y] = polar(m.angle, R_DIR + 24);
            return (
              <g key={m.char} transform={`translate(${x} ${y})`}>
                <rect x={-9} y={-9} width={18} height={18} fill="none" stroke="#7d6a42" strokeWidth="1" transform="rotate(45)" opacity="0.8" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#c9a962" style={{ fontFamily: "'Noto Serif SC',serif" }}>
                  {m.char}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 底部信息条:速度 + 图例 + 卦象速览 */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sub">
          <label className="flex items-center gap-2">
            <span className="font-song text-gold/90">转速</span>
            <input
              type="range" min={0.2} max={3} step={0.1}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="speed-range w-24"
              aria-label="旋转速度"
            />
          </label>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="inline-block h-3 w-3 rounded-full border border-cinn/70 bg-cinn/20" />
            选中
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="inline-block h-3 w-3 rounded-full border border-gold/70 bg-gold/20" />
            悬停
          </span>
          <div className="ml-auto flex h-8 items-center gap-2 overflow-hidden">
            {info ? (
              <>
                <span className="font-display text-xl leading-none text-cinnbright">{info.short}</span>
                <span className="font-song text-sm font-bold text-paper">{info.name}</span>
                <span className="hidden text-[11px] text-dim md:inline">
                  上{TRIGRAM_MAP[info.upper].char}下{TRIGRAM_MAP[info.lower].char} · {info.brief}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-dim">外环为六十四卦圆图 — 悬停看卦名 · 点击联动下方卦图</span>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-dim">拖拽转盘 · 松手顺势滑行 · 点击卦象或外环卦符查看详情</p>
      </div>
    </div>
  );
}


