import { useState } from "react";
import { TRIGRAMS, TRIGRAM_MAP, HEXAGRAMS } from "../data/bagua";
import TrigramGlyph from "./TrigramGlyph";

interface Props {
  hexKey: string | null;
  onHexKey: (key: string) => void;
  selected: string | null;
}

export default function HexagramGrid({ hexKey, onHexKey, selected }: Props) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const previewKey = hoverKey ?? hexKey;
  const preview = previewKey ? HEXAGRAMS[previewKey] : null;
  const [pu, pl] = previewKey ? previewKey.split("-") : [null, null];

  return (
    <section className="rounded-md border border-line bg-ink-800/75 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] sm:p-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="seal-box text-lg">卦</span>
          <div>
            <h2 className="font-song text-xl font-bold text-paper sm:text-2xl">六十四卦方图</h2>
            <p className="mt-0.5 text-xs text-dim">横列为下卦,纵行为上卦 · 悬停预览,点击定格</p>
          </div>
        </div>
        {selected && (
          <span className="rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-gold">
            当前选中「{TRIGRAM_MAP[selected].char}」相关行列
          </span>
        )}
      </header>

      {/* 预览 / 定格信息 */}
      <div className="mb-4 flex min-h-[72px] items-center gap-4 rounded-sm border border-line bg-ink-900/70 px-4 py-3">
        {preview ? (
          <>
            <TrigramGlyph
              lines={[...TRIGRAM_MAP[pl!].lines, ...TRIGRAM_MAP[pu!].lines]}
              size={30}
              color="#c9a962"
            />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl leading-none text-cinnbright">{preview.short}</span>
                <span className="font-song text-sm font-bold text-paper">{preview.name}</span>
                {hexKey === previewKey && (
                  <span className="rounded-sm bg-cinn/20 px-1.5 py-0.5 text-[10px] text-cinnbright">已定格</span>
                )}
              </div>
              <p className="mt-1 text-xs text-sub">
                上{TRIGRAM_MAP[pu!].char}{TRIGRAM_MAP[pu!].nature} · 下{TRIGRAM_MAP[pl!].char}{TRIGRAM_MAP[pl!].nature}
                <span className="mx-2 text-line">|</span>
                <span className="text-gold/90">{preview.brief}</span>
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs leading-relaxed text-dim">
            在方图中移动光标可预览各卦;点击任意一格,即可在此定格细看。
            {selected && ` 已高亮「${TRIGRAM_MAP[selected].char}」所在的行与列。`}
          </p>
        )}
      </div>

      {/* 方图 */}
      <div className="overflow-x-auto pb-2">
        <table className="mx-auto border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th className="px-2 pb-1 text-left align-bottom text-[10px] font-normal tracking-widest text-dim">
                上卦<span className="block text-line">↓外·下内→</span>
              </th>
              {TRIGRAMS.map((t) => (
                <th key={t.id} className={`pb-1 ${selected === t.id ? "text-gold" : "text-sub"}`}>
                  <div className={`flex flex-col items-center gap-1 rounded-sm px-2 py-1 ${selected === t.id ? "bg-gold/10" : ""}`}>
                    <TrigramGlyph lines={t.lines} size={20} />
                    <span className="font-song text-xs leading-none">{t.char}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRIGRAMS.map((row) => (
              <tr key={row.id}>
                <td className={`pr-2 ${selected === row.id ? "text-gold" : "text-sub"}`}>
                  <div className={`flex items-center justify-end gap-1.5 rounded-sm px-2 py-1 ${selected === row.id ? "bg-gold/10" : ""}`}>
                    <span className="font-song text-xs">{row.char}</span>
                    <TrigramGlyph lines={row.lines} size={20} />
                  </div>
                </td>
                {TRIGRAMS.map((col) => {
                  const key = `${row.id}-${col.id}`;
                  const info = HEXAGRAMS[key];
                  const isSel = hexKey === key;
                  const related = selected === row.id || selected === col.id;
                  return (
                    <td key={key}>
                      <button
                        onClick={() => onHexKey(key)}
                        onMouseEnter={() => setHoverKey(key)}
                        onMouseLeave={() => setHoverKey(null)}
                        className={`hexcell h-9 min-w-[54px] rounded-sm border px-1 font-song text-[13px] ${
                          isSel
                            ? "border-cinn bg-cinn font-bold text-[#f7f1e2] shadow-[0_0_16px_rgba(209,80,58,0.4)]"
                            : hoverKey === key
                              ? "border-gold bg-gold/10 text-gold"
                              : related
                                ? "border-line-soft bg-ink-900/70 text-paper/85"
                                : "border-line-soft bg-ink-900/70 text-sub"
                        }`}
                        aria-label={info.name}
                      >
                        {info.short}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-center text-[11px] text-dim">
        六十四卦皆由八经卦相重而生 · 纯卦八(乾兌离震巽坎艮坤自叠),杂卦五十六
      </p>
    </section>
  );
}
