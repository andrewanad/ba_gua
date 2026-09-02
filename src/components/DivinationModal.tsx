import { useEffect } from "react";
import { TRIGRAM_MAP, HEXAGRAMS, type LineKind } from "../data/bagua";
import type { DivinationResult, YaoSetup } from "../data/divination";

/* 六爻卦画(含动爻标记) */
function SixLines({ lines, movingYao, color = "#e9dfc8", mark = "#e3694e" }: {
  lines: LineKind[];
  movingYao?: number;
  color?: string;
  mark?: string;
}) {
  const LW = 6;
  const GAP = 7;
  const W = 64;
  const H = 6 * LW + 5 * GAP;
  return (
    <svg width={W + 18} height={H + 6} viewBox={`-4 -3 ${W + 22} ${H + 6}`} aria-hidden>
      {lines.map((kind, i) => {
        const j = 5 - i; // 上爻在上
        const y = j * (LW + GAP);
        const isDong = movingYao !== undefined && i === movingYao - 1;
        const c = isDong ? mark : color;
        return (
          <g key={i}>
            {kind === "yang" ? (
              <rect x={0} y={y} width={W} height={LW} rx={1} fill={c} />
            ) : (
              <g>
                <rect x={0} y={y} width={(W - 9) / 2} height={LW} rx={1} fill={c} />
                <rect x={(W - 9) / 2 + 9} y={y} width={(W - 9) / 2} height={LW} rx={1} fill={c} />
              </g>
            )}
            {isDong && (
              <text x={W + 10} y={y + LW - 0.5} fontSize="9" fill={mark} fontFamily="serif">
                {kind === "yang" ? "〇" : "✕"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function GuaCard({ hexKey, title, note, accent }: { hexKey: string; title: string; note?: string; accent?: boolean }) {
  const h = HEXAGRAMS[hexKey];
  const lines: LineKind[] = [...TRIGRAM_MAP[h.lower].lines, ...TRIGRAM_MAP[h.upper].lines];
  return (
    <div className={`flex flex-1 flex-col items-center rounded-sm border p-4 ${accent ? "border-cinn/60 bg-cinn/[0.07]" : "border-line bg-ink-900/70"}`}>
      <span className="font-song text-[11px] font-bold tracking-[0.3em] text-dim">{title}</span>
      <div className="mt-3">
        <SixLines lines={lines} color={accent ? "#e3694e" : "#d8cba8"} />
      </div>
      <span className={`mt-3 font-display text-2xl leading-none ${accent ? "text-cinnbright" : "text-paper"}`}>{h.short}</span>
      <span className="mt-1 font-song text-sm font-bold text-paper">{h.name}</span>
      <span className="mt-1.5 text-center text-[11px] leading-relaxed text-sub">
        上{TRIGRAM_MAP[h.upper].char}下{TRIGRAM_MAP[h.lower].char}{note ? ` · ${note}` : ""}
      </span>
    </div>
  );
}

function YaoRow({ s, movingYao }: { s: YaoSetup; movingYao: number }) {
  return (
    <div
      className={`flex items-center gap-2 border-b border-line-soft px-3 py-2 text-sm last:border-0 sm:gap-3 ${
        s.dong ? "bg-cinn/[0.10]" : s.shi ? "bg-gold/[0.05]" : ""
      }`}
    >
      <span className="w-14 flex-none font-song text-xs text-dim">{s.name}爻</span>
      <span className={`w-14 flex-none text-center font-song text-xs font-bold ${s.dong ? "text-cinnbright" : "text-gold"}`}>
        {s.liuqin}
      </span>
      <span className="w-16 flex-none text-xs text-sub">
        {s.branch}
        <span className="text-dim">·{s.wx}</span>
      </span>
      <span className="flex flex-1 items-center justify-center">
        {s.kind === "yang" ? (
          <span className={`h-[5px] w-16 rounded-[1px] ${s.dong ? "bg-cinnbright" : "bg-[#c9b98d]"}`} />
        ) : (
          <span className="flex w-16 gap-[6px]">
            <span className={`h-[5px] flex-1 rounded-[1px] ${s.dong ? "bg-cinnbright" : "bg-[#c9b98d]"}`} />
            <span className={`h-[5px] flex-1 rounded-[1px] ${s.dong ? "bg-cinnbright" : "bg-[#c9b98d]"}`} />
          </span>
        )}
      </span>
      <span className="flex w-24 flex-none items-center justify-end gap-1">
        {s.shi && <span className="rounded-sm border border-gold/50 px-1 py-0.5 text-[10px] text-gold">世</span>}
        {s.ying && <span className="rounded-sm border border-sub/40 px-1 py-0.5 text-[10px] text-sub">应</span>}
        {s.dong && <span className="rounded-sm border border-cinn/60 bg-cinn/20 px-1 py-0.5 text-[10px] text-cinnbright">动</span>}
      </span>
      {s.dong && (
        <span className="hidden w-14 flex-none text-right font-serif text-xs text-cinnbright sm:block">
          {s.kind === "yang" ? "〇" : "✕"}
        </span>
      )}
    </div>
  );
}

export default function DivinationModal({ result, onClose, onAgain }: {
  result: DivinationResult;
  onClose: () => void;
  onAgain: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const ben = HEXAGRAMS[result.benKey];

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-[rgba(5,8,13,0.82)] p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className="modal-in relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-md border border-gold/40 bg-ink-850 shadow-[0_30px_100px_rgba(0,0,0,0.7),0_0_40px_rgba(201,169,98,0.12)] sm:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头 */}
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-ink-850/95 px-5 py-4 backdrop-blur">
          <span className="seal-box h-10 w-10 text-2xl">占</span>
          <div>
            <h2 className="font-display text-2xl leading-tight text-paper">梅花易数 · 六爻占断</h2>
            <p className="text-[11px] tracking-widest text-dim">时间起卦 · {result.sourceText}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-sm border border-line text-dim transition-colors hover:border-cinn/60 hover:text-cinnbright"
            aria-label="关闭"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 2 L12 12 M12 2 L2 12" />
            </svg>
          </button>
        </header>

        <div className="space-y-6 px-5 py-6">
          {/* 起卦式 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 font-song text-sm font-bold tracking-widest text-gold">
              <span className="h-px w-4 bg-gold/60" /> 起卦式 <span className="text-[10px] font-normal text-dim">邵子先天数 · 以数起卦</span>
            </h3>
            <div className="rounded-sm border border-line bg-ink-900/70 p-4 font-song text-[13px] leading-7 text-sub">
              {result.formulas.map((f, i) => (
                <p key={i} className={i === result.formulas.length - 1 ? "text-cinnbright" : ""}>{f}</p>
              ))}
              <p className="mt-2 border-t border-line-soft pt-2 text-[11px] leading-5 text-dim">
                卦得「{ben.name}」,第{result.movingYao === 6 ? "上" : ["初", "二", "三", "四", "五", "上"][result.movingYao - 1]}爻动。月日以公历计数,梅花之要在「数」,心诚则灵。
              </p>
            </div>
          </section>

          {/* 本卦 变卦 互卦 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 font-song text-sm font-bold tracking-widest text-gold">
              <span className="h-px w-4 bg-gold/60" /> 三卦之象
            </h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <GuaCard hexKey={result.benKey} title="本卦 · 事之始" note={`第${["初", "二", "三", "四", "五", "上"][result.movingYao - 1]}爻动`} accent />
              <GuaCard hexKey={result.bianKey} title="变卦 · 事之终" note="动爻既变" />
              <GuaCard hexKey={result.huKey} title="互卦 · 事之中" note="二至四、三至五" />
            </div>
          </section>

          {/* 六爻装卦 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 font-song text-sm font-bold tracking-widest text-gold">
              <span className="h-px w-4 bg-gold/60" /> 六爻装卦
              <span className="rounded-sm border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[10px] font-normal text-gold">
                {result.gongName} · 属{TRIGRAM_MAP[result.palaceId].element} · {result.orderName}
              </span>
            </h3>
            <div className="overflow-hidden rounded-sm border border-line bg-ink-900/70">
              <div className="flex items-center gap-2 border-b border-line bg-ink-800/80 px-3 py-1.5 text-[10px] tracking-widest text-dim sm:gap-3">
                <span className="w-14 flex-none">爻位</span>
                <span className="w-14 flex-none text-center">六亲</span>
                <span className="w-16 flex-none">纳甲</span>
                <span className="flex-1 text-center">爻象</span>
                <span className="w-24 flex-none text-right">世应动</span>
                <span className="hidden w-14 flex-none sm:block" />
              </div>
              {[...result.yaoSetups].reverse().map((s) => (
                <YaoRow key={s.yao} s={s} movingYao={result.movingYao} />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-dim">
              六亲依「{result.gongName}」五行({TRIGRAM_MAP[result.palaceId].element})而定:生我父母,我生子孙,克我官鬼,我克妻财,比和兄弟。
            </p>
          </section>

          {/* 断语 */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 font-song text-sm font-bold tracking-widest text-gold">
              <span className="h-px w-4 bg-gold/60" /> 占断
            </h3>
            <div className="space-y-3">
              {result.duan.map((d) => (
                <div key={d.title} className="rounded-sm border border-line bg-ink-900/70 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-song text-[11px] font-bold tracking-[0.25em] text-cinnbright">【{d.title}】</span>
                  </div>
                  <p className="text-[13px] leading-6 text-sub">{d.text}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-center text-[10px] tracking-widest text-dim">
            易者,象也。占以观心,玩味可也,休咎在人不在卦 —— 仅供文化研习
          </p>
        </div>

        {/* 尾 */}
        <footer className="sticky bottom-0 flex gap-3 border-t border-line bg-ink-850/95 px-5 py-4 backdrop-blur">
          <button
            onClick={onAgain}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm border border-cinn/60 bg-cinn/15 text-sm font-medium text-cinnbright transition-all hover:bg-cinn/25 active:scale-[0.98]"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 7a5 5 0 1 1-1.5-3.6M12 1v3.5H8.5" />
            </svg>
            再占一卦(取当下时辰)
          </button>
          <button
            onClick={onClose}
            className="h-10 flex-1 rounded-sm border border-line text-sm text-sub transition-all hover:border-gold/60 hover:text-gold active:scale-[0.98]"
          >
            收起卦单
          </button>
        </footer>
      </div>
    </div>
  );
}
