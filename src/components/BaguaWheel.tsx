import { useEffect, useRef, useState } from "react";
import {
  TRIGRAMS,
  OPPOSITE,
  FUXI_ANGLES,
  KINGWEN_ANGLES,
  DIRECTIONS,
} from "../data/bagua";
import { TrigramLinesG } from "./TrigramGlyph";

type Sequence = "kingwen" | "fuxi";

const CX = 360;
const CY = 360;
const NODE_R = 228;
const FRICTION = 0.968;

const polar = (angle: number, r: number) => {
  const rad = (angle * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
};

const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

interface SeqAnim {
  from: Record<string, number>;
  to: Record<string, number>;
  start: number;
  dur: number;
}

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
  onDivine: (id: string) => void;
}

export default function BaguaWheel({ selected, onSelect, onDivine }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const rotRef = useRef(0);
  const velRef = useRef(0);
  const [anglesInit] = useState<Record<string, number>>(() => ({ ...KINGWEN_ANGLES }));
  const anglesRef = useRef<Record<string, number>>(anglesInit);
  const baseRef = useRef<Record<string, number>>({ ...KINGWEN_ANGLES });

  const draggingRef = useRef(false);
  const cumRef = useRef(0);
  const lastPointerAngleRef = useRef(0);
  const dragDistRef = useRef(0);
  const movesRef = useRef<{ t: number; c: number }[]>([]);
  const playingBeforeDragRef = useRef(false);

  const seqAnimRef = useRef<SeqAnim | null>(null);
  const divineRef = useRef(false);
  const firstSeqRef = useRef(true);

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(0.09);
  const [sequence, setSequence] = useState<Sequence>("kingwen");
  const [spinning, setSpinning] = useState(false);
  const [, setTick] = useState(0);

  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const onDivineRef = useRef(onDivine);
  onDivineRef.current = onDivine;

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  /* ---------- 主循环 ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const finalize = () => {
      let best: string | null = null;
      let bestD = Infinity;
      for (const t of TRIGRAMS) {
        const a = ((anglesRef.current[t.id] % 360) + 360) % 360;
        const d = Math.abs(((a - 90 + 540) % 360) - 180);
        if (d < bestD) {
          bestD = d;
          best = t.id;
        }
      }
      setSpinning(false);
      if (best) onDivineRef.current(best);
    };

    const loop = (now: number) => {
      const dt = Math.min(now - last, 50) / 16.667;
      last = now;
      let active = false;

      if (!draggingRef.current) {
        if (Math.abs(velRef.current) > 0.04) {
          rotRef.current += velRef.current * dt;
          velRef.current *= Math.pow(FRICTION, dt);
          if (Math.abs(velRef.current) <= 0.04) {
            velRef.current = 0;
            if (divineRef.current) {
              divineRef.current = false;
              finalize();
            } else {
              // 惯性结束后恢复拖拽前的自动旋转状态
              playingRef.current = playingBeforeDragRef.current;
              setPlaying(playingBeforeDragRef.current);
            }
          }
          active = true;
        } else if (playingRef.current) {
          rotRef.current += speedRef.current * dt;
          active = true;
        }
      }

      if (seqAnimRef.current) {
        const s = seqAnimRef.current;
        const p = Math.min(1, (now - s.start) / s.dur);
        const e = easeInOutCubic(p);
        for (const t of TRIGRAMS) {
          anglesRef.current[t.id] = s.from[t.id] + (s.to[t.id] - s.from[t.id]) * e + rotRef.current;
        }
        if (p >= 1) seqAnimRef.current = null;
        active = true;
      } else if (active) {
        for (const t of TRIGRAMS) {
          anglesRef.current[t.id] = baseRef.current[t.id] + rotRef.current;
        }
      }

      if (active) setTick((v) => (v + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---------- 先天 / 后天切换 ---------- */
  useEffect(() => {
    if (firstSeqRef.current) {
      firstSeqRef.current = false;
      return;
    }
    const target = sequence === "fuxi" ? FUXI_ANGLES : KINGWEN_ANGLES;
    const from: Record<string, number> = {};
    const to: Record<string, number> = {};
    for (const t of TRIGRAMS) {
      from[t.id] = anglesRef.current[t.id] - rotRef.current;
      to[t.id] = target[t.id];
    }
    baseRef.current = { ...target };
    seqAnimRef.current = { from, to, start: performance.now(), dur: 900 };
  }, [sequence]);

  /* ---------- 拖拽 ---------- */
  const pointerAngle = (e: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    return (Math.atan2(-y, x) * 180) / Math.PI;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    if (divineRef.current) {
      // 拖拽拦截了占蔔旋轉:取消本次占蔔
      divineRef.current = false;
      setSpinning(false);
    }
    draggingRef.current = true;
    dragDistRef.current = 0;
    playingBeforeDragRef.current = playingRef.current;
    velRef.current = 0;
    const a = pointerAngle(e);
    lastPointerAngleRef.current = a;
    cumRef.current = rotRef.current;
    movesRef.current = [{ t: performance.now(), c: cumRef.current }];
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const a = pointerAngle(e);
    let d = a - lastPointerAngleRef.current;
    d = ((d + 540) % 360) - 180;
    lastPointerAngleRef.current = a;
    dragDistRef.current += Math.abs(d);
    cumRef.current += d;
    rotRef.current += d;
    const now = performance.now();
    movesRef.current.push({ t: now, c: cumRef.current });
    if (movesRef.current.length > 10) movesRef.current.shift();
    for (const t of TRIGRAMS) anglesRef.current[t.id] = baseRef.current[t.id] + rotRef.current;
    setTick((v) => (v + 1) % 1_000_000);
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const now = performance.now();
    const recent = movesRef.current.filter((m) => now - m.t < 110);
    if (recent.length >= 2) {
      const dtFrames = (recent[recent.length - 1].t - recent[0].t) / 16.667;
      if (dtFrames > 0.5) {
        let v = (recent[recent.length - 1].c - recent[0].c) / dtFrames;
        v = Math.max(-30, Math.min(30, v));
        velRef.current = Math.abs(v) < 0.6 ? 0 : v;
      }
    }
  };

  const nodeClick = (id: string) => {
    if (dragDistRef.current > 8) return;
    setPlaying(false);
    onSelect(id);
  };

  const spin = () => {
    divineRef.current = true;
    setSpinning(true);
    velRef.current = 16 + Math.random() * 12;
    seqAnimRef.current = null;
  };

  const selOpposite = selected ? OPPOSITE[selected] : null;

  /* ---------- 渲染 ---------- */
  const ticks = Array.from({ length: 64 }, (_, i) => i * 5.625);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[620px] select-none" style={{ touchAction: "none" }}>
        {/* 指针 */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <svg width="34" height="30" viewBox="0 0 34 30">
            <path d="M17 29 L5 8 Q17 2 29 8 Z" fill="#d1503a" stroke="#c9a962" strokeWidth="1.4" />
            <circle cx="17" cy="11" r="2.6" fill="#f0e7d2" />
          </svg>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 720 720"
          className="h-auto w-full cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <radialGradient id="plateGrad" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#182230" />
              <stop offset="72%" stopColor="#101826" />
              <stop offset="100%" stopColor="#0c121c" />
            </radialGradient>
            <radialGradient id="taijiYin" cx="38%" cy="34%" r="80%">
              <stop offset="0%" stopColor="#233247" />
              <stop offset="100%" stopColor="#141d2a" />
            </radialGradient>
            <radialGradient id="taijiYang" cx="60%" cy="30%" r="85%">
              <stop offset="0%" stopColor="#f7efdb" />
              <stop offset="100%" stopColor="#ddd2b4" />
            </radialGradient>
          </defs>

          {/* 底盘 */}
          <circle cx={CX} cy={CY} r={346} fill="url(#plateGrad)" stroke="#7d6a42" strokeWidth="2" opacity="0.92" />
          <circle cx={CX} cy={CY} r={336} fill="none" stroke="#2a3442" strokeWidth="1" />

          {/* 六十四刻度 */}
          {ticks.map((a, i) => {
            const major = i % 8 === 0;
            const p1 = polar(a, major ? 318 : 322);
            const p2 = polar(a, major ? 334 : 330);
            return (
              <line
                key={i}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={major ? "#c9a962" : "#3d4a5c"}
                strokeWidth={major ? 2 : 1}
                opacity={major ? 0.9 : 0.7}
              />
            );
          })}
          <circle cx={CX} cy={CY} r={312} fill="none" stroke="#2a3442" strokeWidth="1" />

          {/* 错卦连线 + 节点(随角度实时计算) */}
          <g>
            {["qian", "dui", "li", "zhen"].map((id) => {
              const a1 = anglesRef.current[id];
              const a2 = anglesRef.current[OPPOSITE[id]];
              const p1 = polar(a1, NODE_R);
              const p2 = polar(a2, NODE_R);
              const hot = selected === id || selOpposite === id;
              return (
                <line
                  key={id}
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={hot ? "#c9a962" : "#33404f"}
                  strokeWidth={hot ? 1.6 : 1}
                  strokeDasharray="3 8"
                  opacity={hot ? 0.95 : 0.8}
                />
              );
            })}
          </g>

          <g>
            {TRIGRAMS.map((t) => {
              const { x, y } = polar(anglesRef.current[t.id], NODE_R);
              const sel = t.id === selected;
              return (
                <g
                  key={t.id}
                  transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}
                  className="bnode cursor-pointer"
                  onClick={() => nodeClick(t.id)}
                >
                  <g className="bnode-inner">
                    {sel && (
                      <circle
                        className="sel-halo"
                        r={59}
                        fill="none"
                        stroke="#d1503a"
                        strokeWidth="1.6"
                        strokeDasharray="4 7"
                        opacity="0.9"
                      />
                    )}
                    <circle
                      className="node-bg"
                      r={50}
                      fill={sel ? "rgba(209,80,58,0.10)" : "rgba(11,17,26,0.72)"}
                      stroke={sel ? "#d1503a" : "#5d5340"}
                      strokeWidth={sel ? 2.4 : 1.2}
                    />
                    <TrigramLinesG lines={t.lines} width={36} centerY={-16} color={sel ? "#e3694e" : "#e9dfc8"} />
                    <text
                      y={22}
                      textAnchor="middle"
                      fontFamily="var(--font-display)"
                      fontSize={27}
                      fill={sel ? "#e9dfc8" : "#d9cfb4"}
                    >
                      {t.char}
                    </text>
                    <text
                      y={39}
                      textAnchor="middle"
                      fontFamily="var(--font-song)"
                      fontSize={11}
                      letterSpacing="3"
                      fill={sel ? "#c9a962" : "#8d8266"}
                    >
                      {t.nature}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 内环 */}
          <circle cx={CX} cy={CY} r={168} fill="none" stroke="#2a3442" strokeWidth="1" strokeDasharray="2 6" />

          {/* 太极图 */}
          <g className="taiji-glow" transform={`translate(${CX},${CY}) rotate(${rotRef.current})`}>
            <circle r={114} fill="#0c121c" stroke="#7d6a42" strokeWidth="2" />
            <circle r={108} fill="url(#taijiYin)" />
            <path
              d="M0,-108 A108,108 0 0 1 0,108 A54,54 0 0 1 0,0 A54,54 0 0 0 0,-108 Z"
              fill="url(#taijiYang)"
            />
            <circle cx={0} cy={-54} r={15} fill="#f0e7d2" opacity="0.95" />
            <circle cx={0} cy={54} r={15} fill="#172130" opacity="0.95" />
            <circle cx={0} cy={-54} r={5.5} fill="#172130" />
            <circle cx={0} cy={54} r={5.5} fill="#f0e7d2" />
            <circle r={108} fill="none" stroke="#8a7448" strokeWidth="1" opacity="0.8" />
          </g>

          {/* 八方方位(固定不转,古图南下北上) */}
          {DIRECTIONS.map((d) => {
            const p = polar(d.angle, 297);
            const isSouth = d.name === "南";
            return (
              <text
                key={d.name}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-song)"
                fontWeight={d.major ? 700 : 400}
                fontSize={d.major ? 21 : 12.5}
                fill={isSouth ? "#d1503a" : d.major ? "#c9a962" : "#64707f"}
                letterSpacing="1"
              >
                {d.name}
              </text>
            );
          })}
        </svg>

        {/* 旋转状态角标 */}
        <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-2 text-[11px] tracking-widest text-dim">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              spinning ? "bg-cinnbright pulse-stamp" : playing ? "bg-gold" : "bg-line"
            }`}
          />
          {spinning ? "运转乾坤中" : playing ? "盘转中" : "已暂停"}
        </div>
      </div>

      {/* 控制条 */}
      <div className="mt-5 flex w-full max-w-[620px] flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex h-10 items-center gap-2 rounded-sm border border-line bg-ink-800 px-4 text-sm text-paper transition-all hover:border-gold hover:text-gold active:scale-95"
          aria-label={playing ? "暂停旋转" : "开始旋转"}
        >
          {playing ? (
            <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><rect x="1" y="1" width="3.4" height="10" rx="1" /><rect x="6.6" y="1" width="3.4" height="10" rx="1" /></svg>
          ) : (
            <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><path d="M1.5 1.2 L10 6 L1.5 10.8 Z" /></svg>
          )}
          {playing ? "暂停" : "旋转"}
        </button>

        <button
          onClick={spin}
          disabled={spinning}
          className="flex h-10 items-center gap-2 rounded-sm bg-gradient-to-b from-cinnbright to-[#a83a28] px-5 text-sm font-medium text-[#f7f1e2] shadow-[0_4px_18px_rgba(209,80,58,0.35)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="5.4" strokeDasharray="3.4 2.6" />
            <circle cx="7" cy="7" r="1.4" fill="currentColor" stroke="none" />
          </svg>
          {spinning ? "天机运转…" : "占卜一卦"}
        </button>

        <label className="flex items-center gap-2 rounded-sm border border-line bg-ink-800 px-3 py-2 text-xs text-sub">
          <span className="text-gold/80">缓</span>
          <input
            type="range"
            min={0.02}
            max={0.3}
            step={0.005}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="speed-range w-24"
            aria-label="旋转速度"
          />
          <span className="text-gold/80">急</span>
        </label>

        <div className="flex overflow-hidden rounded-sm border border-line">
          {(
            [
              { key: "kingwen", label: "后天八卦" },
              { key: "fuxi", label: "先天八卦" },
            ] as { key: Sequence; label: string }[]
          ).map((s) => (
            <button
              key={s.key}
              onClick={() => setSequence(s.key)}
              className={`h-10 px-4 text-sm transition-colors ${
                sequence === s.key
                  ? "bg-gold/15 font-medium text-gold"
                  : "bg-ink-800 text-dim hover:text-sub"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-dim">
        拖拽卦盘顺势而转,松手凭惯性滑行;点击任一卦暂停细读。
        <br className="sm:hidden" />
        「占卜一卦」后,朱砂指针所指即为天启 · 方位依古图<span className="text-gold/90">南下北上、东左西右</span>。
      </p>
    </div>
  );
}


