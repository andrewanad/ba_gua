import { useEffect } from "react";
import { TRIGRAMS, TRIGRAM_MAP, OPPOSITE } from "../data/bagua";
import TrigramGlyph from "./TrigramGlyph";

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
  onSetUp: (id: string) => void;
  onSetLower: (id: string) => void;
}

const YAO_NAME = ["初", "二", "三"];

export default function DetailPanel({ selected, onSelect, onSetUp, onSetLower }: Props) {
  const t = selected ? TRIGRAM_MAP[selected] : null;

  useEffect(() => {
    if (!selected) onSelect("qian");
  }, [selected, onSelect]);

  if (!t) return null;

  const attrs: [string, string][] = [
    ["自然", t.nature],
    ["五行", t.element],
    ["后天方位", t.direction],
    ["先天方位", t.fuxiDirection],
    ["家庭", t.family],
    ["身体", t.body],
    ["动物", t.animal],
    ["其色", t.color],
    ["时令", t.virtue === "动" ? "春分" : t.virtue === "丽" ? "夏至" : t.virtue === "陷" ? "冬至" : "四时"],
  ];

  return (
    <section key={t.id} className="rounded-md border border-line bg-ink-800/75 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
      <div className="flex items-start gap-5">
        <div className="flex-none rounded-sm border border-gold/35 bg-ink-900/80 px-4 py-3 text-gold shadow-[0_0_24px_rgba(201,169,98,0.08)]">
          <TrigramGlyph lines={t.lines} size={44} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-6xl leading-none text-paper">{t.char}</h2>
            <span className="font-song text-lg font-bold text-gold">{t.nature}</span>
            <span className="text-xs italic text-dim">{t.pinyin}</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-sub">{t.desc}</p>
        </div>
      </div>

      {/* 爻序 */}
      <div className="mt-4 rounded-sm border border-line-soft bg-ink-900/60 px-3 py-2.5">
        <div className="mb-1.5 text-[10px] tracking-widest text-dim">爻序(自下而上)</div>
        <div className="flex items-center gap-3">
          {t.lines.map((l, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-sub">
              <span className={`font-song font-bold ${l === "yang" ? "text-cinnbright" : "text-jade"}`}>
                {YAO_NAME[i]}{l === "yang" ? "九" : "六"}
              </span>
              <span className={l === "yang" ? "text-cinnbright" : "text-jade"}>—{l === "yang" ? " 阳" : "- 阴"}</span>
            </span>
          ))}
          <span className="ml-auto text-[10px] text-dim">{t.polarity} · 其德「{t.virtue}」</span>
        </div>
      </div>

      {/* 类象 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {attrs.map(([k, v]) => (
          <div key={k} className="rounded-sm border border-line-soft bg-ink-900/60 px-2.5 py-2">
            <div className="text-[10px] text-dim">{k}</div>
            <div className="mt-0.5 font-song text-sm font-bold text-paper">{v}</div>
          </div>
        ))}
      </div>

      {/* 八宫速选 */}
      <div className="mt-4">
        <div className="mb-1.5 text-[10px] tracking-widest text-dim">八卦速选</div>
        <div className="grid grid-cols-8 gap-1">
          {TRIGRAMS.map((x) => (
            <button
              key={x.id}
              onClick={() => onSelect(x.id)}
              className={`flex flex-col items-center gap-1 rounded-sm border py-1.5 transition-all active:scale-90 ${
                x.id === t.id
                  ? "border-cinn bg-cinn/15 text-cinnbright"
                  : "border-line-soft bg-ink-900/60 text-sub hover:border-gold/60 hover:text-gold"
              }`}
              aria-label={x.char}
            >
              <TrigramGlyph lines={x.lines} size={15} />
              <span className="font-song text-[10px] leading-none">{x.char}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(OPPOSITE[t.id])}
          className="rounded-sm border border-line px-3 py-1.5 text-xs text-sub transition-all hover:border-jade/60 hover:text-jade active:scale-95"
        >
          错卦 ⇄ {TRIGRAM_MAP[OPPOSITE[t.id]].char}
        </button>
        <button
          onClick={() => onSetUp(t.id)}
          className="rounded-sm border border-line px-3 py-1.5 text-xs text-sub transition-all hover:border-gold/60 hover:text-gold active:scale-95"
        >
          设为上卦
        </button>
        <button
          onClick={() => onSetLower(t.id)}
          className="rounded-sm border border-line px-3 py-1.5 text-xs text-sub transition-all hover:border-gold/60 hover:text-gold active:scale-95"
        >
          设为下卦
        </button>
      </div>
    </section>
  );
}
