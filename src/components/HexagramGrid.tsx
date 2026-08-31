import { TRIGRAMS, TRIGRAM_MAP, HEXAGRAMS } from "../data/bagua";
import TrigramGlyph from "./TrigramGlyph";
import type { LineKind } from "../data/bagua";

interface Props {
  hexKey: string | null;
  onHexKey: (key: string | null) => void;
  selected: string | null;
}

export default function HexagramGrid({ hexKey, onHexKey, selected }: Props) {
  const current = hexKey ? HEXAGRAMS[hexKey] : null;

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* 方阵 */}
      <div className="overflow-x-auto rounded-md border border-line bg-ink-800/75 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)] lg:col-span-3">
        <div className="grid" style={{ gridTemplateColumns: "34px repeat(8, minmax(54px, 1fr))" }}>
          <div />
          {TRIGRAMS.map((t) => (
            <div key={`h-${t.id}`} className="flex flex-col items-center gap-0.5 pb-2">
              <span className="font-display text-lg leading-none text-gold">{t.char}</span>
              <TrigramGlyph lines={t.lines} size={14} color="#7d6a42" />
            </div>
          ))}
          {TRIGRAMS.map((lo) => (
            <div key={`row-${lo.id}`} className="contents">
              <div className="flex flex-row items-center justify-center gap-0.5 py-1">
                <span className="font-display text-lg text-gold">{lo.char}</span>
              </div>
              {TRIGRAMS.map((up) => {
                const key = `${up.id}-${lo.id}`;
                const h = HEXAGRAMS[key];
                const active = key === hexKey;
                const rel = selected && (up.id === selected || lo.id === selected);
                return (
                  <button
                    key={key}
                    onClick={() => onHexKey(active ? null : key)}
                    className={`hexcell group flex flex-col items-center gap-1 rounded-sm border px-1 py-1.5 ${
                      active
                        ? "border-cinn bg-cinn/15"
                        : rel
                        ? "border-gold/45 bg-gold/[0.06]"
                        : "border-line-soft bg-ink-900/50"
                    }`}
                    aria-label={h.name}
                  >
                    <TrigramGlyph
                      lines={h ? ([...TRIGRAM_MAP[lo.id].lines, ...TRIGRAM_MAP[up.id].lines] as LineKind[]) : []}
                      size={20}
                      color={active ? "#e3694e" : "#c9a962"}
                    />
                    <span className={`font-song text-[10px] leading-tight ${active ? "text-cinnbright" : "text-sub group-hover:text-paper"}`}>
                      {h.short}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-dim">
          横轴为上卦,纵轴为下卦 · <span className="text-gold">金边</span>与左侧选中卦相关 · <span className="text-cinnbright">朱色</span>为当前卦
        </p>
      </div>

      {/* 释义卡 */}
      <div className="rounded-md border border-line bg-ink-800/75 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] lg:col-span-2">
        {!current ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-4 text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden className="opacity-50">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#7d6a42" strokeWidth="1.5" />
              <path d="M32,4 A28,28 0 0 1 32,60 A14,14 0 0 1 32,32 A14,14 0 0 0 32,4 Z" fill="#c9a962" opacity="0.5" />
            </svg>
            <p className="max-w-[240px] text-sm leading-relaxed text-sub">
              点击左侧方阵中的任一卦,
              <br />
              或于八卦盘外环点选,
              <br />
              此处即见卦名与卦义。
            </p>
          </div>
        ) : (
          <div key={current.key}>
            <div className="flex items-center gap-4">
              <div className="flex-none rounded-sm border border-gold/40 bg-ink-900/80 px-4 py-3 text-gold shadow-[0_0_24px_rgba(201,169,98,0.08)]">
                <TrigramGlyph lines={[...TRIGRAM_MAP[current.lower].lines, ...TRIGRAM_MAP[current.upper].lines]} size={40} color="#e9dfc8" />
              </div>
              <div>
                <div className="font-display text-5xl leading-none text-cinnbright">{current.short}</div>
                <div className="mt-1 font-song text-sm font-bold text-paper">{current.name}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-sm border border-line-soft bg-ink-900/60 px-3 py-2">
                <div className="text-[10px] text-dim">上卦 · 外</div>
                <div className="font-song text-sm font-bold text-paper">
                  {TRIGRAM_MAP[current.upper].char}({TRIGRAM_MAP[current.upper].nature})
                </div>
              </div>
              <div className="rounded-sm border border-line-soft bg-ink-900/60 px-3 py-2">
                <div className="text-[10px] text-dim">下卦 · 内</div>
                <div className="font-song text-sm font-bold text-paper">
                  {TRIGRAM_MAP[current.lower].char}({TRIGRAM_MAP[current.lower].nature})
                </div>
              </div>
            </div>
            <p className="mt-4 border-l-2 border-cinn/60 pl-3 text-sm leading-relaxed text-sub">{current.brief}</p>
          </div>
        )}
      </div>
    </div>
  );
}
