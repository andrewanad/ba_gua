import { useEffect, useRef, useState } from "react";
import { TRIGRAMS, TRIGRAM_MAP, HEXAGRAMS } from "../data/bagua";
import TrigramGlyph from "./TrigramGlyph";

interface Props {
  upper: string | null;
  lower: string | null;
  onUpper: (id: string) => void;
  onLower: (id: string) => void;
}

export default function Caster({ upper, lower, onUpper, onLower }: Props) {
  const [rolling, setRolling] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let n = 0;
    timerRef.current = window.setInterval(() => {
      const u = TRIGRAMS[Math.floor(Math.random() * 8)].id;
      const l = TRIGRAMS[Math.floor(Math.random() * 8)].id;
      onUpper(u);
      onLower(l);
      n++;
      if (n >= 14 && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
        setRolling(false);
      }
    }, 85);
  };

  const result = upper && lower ? HEXAGRAMS[`${upper}-${lower}`] : null;
  const sixLines = upper && lower
    ? [...TRIGRAM_MAP[lower].lines, ...TRIGRAM_MAP[upper].lines]
    : null;

  return (
    <section className="rounded-md border border-line bg-ink-800/75 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
      <header className="mb-4 flex items-center gap-3">
        <span className="seal-box text-lg">占</span>
        <div>
          <h2 className="font-song text-lg font-bold text-paper">重卦起占</h2>
          <p className="text-[11px] tracking-widest text-dim">八经卦两两相重,得六十四卦</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { label: "上卦 · 外", value: upper, set: onUpper },
            { label: "下卦 · 内", value: lower, set: onLower },
          ] as const
        ).map(({ label, value, set }) => (
          <div key={label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] tracking-widest text-dim">{label}</span>
              {value && <span className="font-song text-xs font-bold text-cinnbright">{TRIGRAM_MAP[value].char}</span>}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {TRIGRAMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => set(t.id)}
                  className={`flex flex-col items-center gap-1 rounded-sm border py-1.5 transition-all active:scale-90 ${
                    value === t.id
                      ? "border-cinn bg-cinn/15 text-cinnbright"
                      : "border-line-soft bg-ink-900/60 text-sub hover:border-gold/60 hover:text-gold"
                  }`}
                  aria-label={`${label}${t.char}`}
                >
                  <TrigramGlyph lines={t.lines} size={16} />
                  <span className="font-song text-[10px] leading-none">{t.char}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 结果 */}
      <div className="mt-4 rounded-sm border border-line bg-ink-900/70 p-4">
        {!result || !sixLines ? (
          <p className="py-3 text-center text-xs leading-relaxed text-dim">
            上下卦皆备,方成一卦
            <br />
            可点选上方卦钮,或于「卦象详解」中设定
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex-none rounded-sm border border-gold/40 bg-ink-800 px-3 py-2.5 shadow-[0_0_20px_rgba(201,169,98,0.12)]">
              <TrigramGlyph lines={sixLines} size={40} color="#e9dfc8" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl leading-none text-cinnbright">{result.short}</span>
                <span className="font-song text-sm font-bold text-paper">{result.name}</span>
              </div>
              <p className="mt-1.5 text-xs text-gold/90">
                上{TRIGRAM_MAP[upper!].char}({TRIGRAM_MAP[upper!].nature}) · 下{TRIGRAM_MAP[lower!].char}({TRIGRAM_MAP[lower!].nature})
              </p>
              <p className="mt-1 text-xs leading-relaxed text-sub">{result.brief}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={roll}
        disabled={rolling}
        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-cinn/60 bg-cinn/15 text-sm font-medium text-cinnbright transition-all hover:bg-cinn/25 active:scale-[0.98] disabled:cursor-wait"
      >
        {rolling ? (
          <svg width="14" height="14" viewBox="0 0 14 14" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="5.4" strokeDasharray="22 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1.5" y="1.5" width="11" height="11" rx="2" />
            <circle cx="4.8" cy="4.8" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="9.2" cy="9.2" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="9.2" cy="4.8" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="4.8" cy="9.2" r="1.1" fill="currentColor" stroke="none" />
          </svg>
        )}
        {rolling ? "揲蓍演卦…" : "随机起卦"}
      </button>
    </section>
  );
}
