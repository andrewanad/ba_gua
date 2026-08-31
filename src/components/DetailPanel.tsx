import { TRIGRAMS, TRIGRAM_MAP, OPPOSITE } from "../data/bagua";
import TrigramGlyph from "./TrigramGlyph";

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
  onSetUp: (id: string) => void;
  onSetLower: (id: string) => void;
}

export default function DetailPanel({ selected, onSelect, onSetUp, onSetLower }: Props) {
  const t = selected ? TRIGRAM_MAP[selected] : null;
  const opp = t ? TRIGRAM_MAP[OPPOSITE[t.id]] : null;

  return (
    <section className="rounded-md border border-line bg-ink-800/75 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
      <header className="mb-4 flex items-center gap-3">
        <span className="seal-box text-lg">象</span>
        <div>
          <h2 className="font-song text-lg font-bold text-paper">卦象详解</h2>
          <p className="text-[11px] tracking-widest text-dim">点选卦盘或下表任一卦</p>
        </div>
      </header>

      {/* 快速选择 */}
      <div className="mb-4 grid grid-cols-8 gap-1">
        {TRIGRAMS.map((tri) => (
          <button
            key={tri.id}
            onClick={() => onSelect(tri.id)}
            className={`flex flex-col items-center gap-1 rounded-sm border py-1.5 transition-all active:scale-90 ${
              selected === tri.id
                ? "border-cinn bg-cinn/15 text-cinnbright"
                : "border-line-soft bg-ink-900/60 text-sub hover:border-gold/60 hover:text-gold"
            }`}
            aria-label={tri.char}
          >
            <TrigramGlyph lines={tri.lines} size={18} />
            <span className="font-song text-[11px] leading-none">{tri.char}</span>
          </button>
        ))}
      </div>

      {!t ? (
        <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-line py-10 text-center">
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="#5d5340" strokeWidth="1.4">
            <circle cx="23" cy="23" r="20" strokeDasharray="4 6" />
            <path d="M23 9 A14 14 0 0 1 23 37 A7 7 0 0 1 23 23 A7 7 0 0 0 23 9 Z" fill="#2a3442" stroke="none" />
          </svg>
          <p className="mt-3 text-sm text-sub">尚未选卦</p>
          <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-dim">
            点击左侧卦盘上的卦象,或按「占卜一卦」听凭天启
          </p>
        </div>
      ) : (
        <div className="animate-[none]">
          {/* 主体 */}
          <div className="flex items-start gap-4">
            <div className="relative flex h-24 w-24 flex-none items-center justify-center">
              <span
                className="absolute inset-0 rounded-sm border border-cinn/40"
                style={{ background: "linear-gradient(150deg, rgba(209,80,58,0.16), rgba(209,80,58,0.04))" }}
              />
              <span className="font-display text-6xl leading-none text-cinnbright drop-shadow-[0_0_18px_rgba(209,80,58,0.35)]">
                {t.char}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-song text-xl font-bold text-paper">{t.char}卦</span>
                <span className="text-sm italic text-gold">{t.pinyin}</span>
                <span className="ml-auto text-xs text-dim">先天数{t.number}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-sm border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold">{t.nature}</span>
                <span className="rounded-sm border border-line bg-ink-900/60 px-2 py-0.5 text-xs text-sub">五行 · {t.element}</span>
                <span className={`rounded-sm border px-2 py-0.5 text-xs ${t.polarity === "阳卦" ? "border-cinn/40 text-cinnbright" : "border-jade/40 text-jade"}`}>
                  {t.polarity}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-dim">
                <TrigramGlyph lines={t.lines} size={26} color="#c9a962" />
                <span>自下而上:{t.lines.map((l) => (l === "yang" ? "阳" : "阴")).join(" · ")}</span>
              </div>
            </div>
          </div>

          {/* 属性 */}
          <dl className="mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-sm border border-line-soft bg-line-soft">
            {[
              ["后天方位", t.direction],
              ["先天方位", t.fuxiDirection],
              ["家庭", t.family],
              ["身体", t.body],
              ["动物", t.animal],
              ["其色", t.color],
              ["德性", t.virtue],
              ["时令", t.season],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink-900/80 px-2 py-2 text-center">
                <dt className="text-[10px] text-dim">{k}</dt>
                <dd className="mt-0.5 font-song text-sm font-bold text-paper">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-[13px] leading-relaxed text-sub">{t.desc}</p>

          {/* 错卦 */}
          {opp && (
            <button
              onClick={() => onSelect(opp.id)}
              className="group mt-4 flex w-full items-center gap-3 rounded-sm border border-line bg-ink-900/60 px-3 py-2.5 text-left transition-all hover:border-gold/70 hover:bg-gold/5 active:scale-[0.99]"
            >
              <TrigramGlyph lines={opp.lines} size={22} color="#7fae9b" />
              <span className="text-xs text-dim">
                错卦 · 六爻皆反
              </span>
              <span className="ml-auto font-song text-sm font-bold text-jade transition-colors group-hover:text-gold">
                {opp.char} · {opp.nature}
                <span className="ml-1 text-dim">→</span>
              </span>
            </button>
          )}

          {/* 设为上下卦 */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetUp(t.id)}
              className="h-9 rounded-sm border border-gold/50 bg-gold/10 text-sm text-gold transition-all hover:bg-gold/20 active:scale-95"
            >
              设为上卦
            </button>
            <button
              onClick={() => onSetLower(t.id)}
              className="h-9 rounded-sm border border-gold/50 bg-gold/10 text-sm text-gold transition-all hover:bg-gold/20 active:scale-95"
            >
              设为下卦
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
