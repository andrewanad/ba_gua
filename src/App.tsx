import { useRef, useState } from "react";
import Background from "./components/Background";
import BaguaWheel from "./components/BaguaWheel";
import DetailPanel from "./components/DetailPanel";
import Caster from "./components/Caster";
import HexagramGrid from "./components/HexagramGrid";
import TrigramTable from "./components/TrigramTable";
import DivinationModal from "./components/DivinationModal";
import TrigramGlyph from "./components/TrigramGlyph";
import Reveal from "./components/Reveal";
import { TRIGRAM_MAP } from "./data/bagua";
import { computeDivination, type DivinationResult } from "./data/divination";

function SectionHead({ no, title, sub }: { no: string; title: string; sub: string }) {
  return (
    <Reveal className="mb-7">
      <div className="flex items-center gap-3">
        <span className="font-song text-xs font-bold tracking-[0.35em] text-gold">{no}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-gold/50 via-line to-transparent" />
      </div>
      <h2 className="mt-2 font-display text-4xl text-paper sm:text-5xl">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">{sub}</p>
    </Reveal>
  );
}

export default function App() {
  const [selected, setSelected] = useState<string | null>("qian");
  const [upper, setUpper] = useState<string | null>("kun");
  const [lower, setLower] = useState<string | null>("qian");
  const [hexKey, setHexKey] = useState<string | null>(null);
  const [divResult, setDivResult] = useState<DivinationResult | null>(null);
  const [divSignal, setDivSignal] = useState(0);
  const pendingRef = useRef<DivinationResult | null>(null);

  const startDivination = () => {
    pendingRef.current = computeDivination(new Date());
    setDivResult(null);
    setDivSignal((s) => s + 1);
  };

  const onSpinDone = () => {
    const r = pendingRef.current;
    if (r) {
      setDivResult(r);
      setHexKey(r.benKey); // 本卦同步到外环与卦图
    }
  };

  const navItems = [
    { href: "#pan", label: "八卦盘" },
    { href: "#su", label: "卦象速查" },
    { href: "#liu", label: "六十四卦" },
    { href: "#li", label: "易理小注" },
  ];

  return (
    <div className="relative min-h-screen font-body text-paper">
      <Background />

      {/* ===== 顶栏 ===== */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-ink-900/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <a href="#pan" className="flex items-center gap-3">
            <span className="seal-box h-9 w-9 text-xl">易</span>
            <span className="leading-tight">
              <span className="block font-display text-2xl text-paper">太极八卦</span>
              <span className="block text-[10px] tracking-[0.3em] text-dim">六十四卦 · 梅花六爻互动演示</span>
            </span>
          </a>
          <nav className="ml-auto hidden items-center gap-1 sm:flex">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} className="rounded-sm px-3 py-2 text-sm text-sub transition-colors hover:bg-gold/10 hover:text-gold">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        {/* ===== 01 八卦盘 ===== */}
        <section id="pan" className="scroll-mt-24 pt-10 sm:pt-14">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="font-song text-xs font-bold tracking-[0.35em] text-gold">其一 · 太极生两仪</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 via-line to-transparent" />
            </div>
            <h1 className="mt-2 font-display text-5xl leading-tight text-paper sm:text-6xl">
              八卦盘<span className="ml-3 align-middle font-song text-base font-normal tracking-widest text-dim">
                四象生八卦 · 八卦定吉凶 · 吉凶生大业
              </span>
            </h1>
          </Reveal>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <BaguaWheel
                selected={selected}
                onSelect={setSelected}
                hexKey={hexKey}
                onSelectHex={setHexKey}
                onDivineClick={startDivination}
                divineSignal={divSignal}
                onDivineSpinDone={onSpinDone}
              />
            </Reveal>
            <div className="flex flex-col gap-6 lg:col-span-5">
              <Reveal delay={120}>
                <DetailPanel selected={selected} onSelect={setSelected} onSetUp={setUpper} onSetLower={setLower} />
              </Reveal>
              <Reveal delay={220}>
                <Caster upper={upper} lower={lower} onUpper={setUpper} onLower={setLower} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===== 02 速查 ===== */}
        <section id="su" className="scroll-mt-24 pt-20">
          <SectionHead
            no="其二 · 八卦类象"
            title="卦象速查"
            sub="八经卦各领一类物象:自然、五行、方位、人伦、身体、禽兽、色、德,触类旁通,皆可为占。点击行可回卦盘细看。"
          />
          <Reveal delay={100}>
            <TrigramTable selected={selected} onSelect={(id) => setSelected(id)} />
          </Reveal>
        </section>

        {/* ===== 03 六十四卦 ===== */}
        <section id="liu" className="scroll-mt-24 pt-20">
          <SectionHead
            no="其三 · 重卦成易"
            title="六十四卦"
            sub="上下两经卦相叠,三爻变六爻,八八六十四卦尽天下之变。卦盘外环即为六十四卦圆图,与此方图同源联动。"
          />
          <Reveal delay={100}>
            <HexagramGrid hexKey={hexKey} onHexKey={setHexKey} selected={selected} />
          </Reveal>
        </section>

        {/* ===== 04 易理小注 ===== */}
        <section id="li" className="scroll-mt-24 pt-20">
          <SectionHead
            no="其四 · 读易门径"
            title="易理小注"
            sub="先体后用,错综其义。略识此三者,再观六十四卦,便如得钥。"
          />
          <div className="grid gap-5 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <div className="h-full rounded-md border border-line bg-ink-800/75 p-6">
                <div className="flex items-center gap-3">
                  <span className="seal-box">体</span>
                  <h3 className="font-song text-lg font-bold text-paper">先天与后天:一体一用</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-sub">
                  相传<span className="text-gold">伏羲画先天八卦</span>,乾南坤北、离东坎西,两两相对,阴阳均衡,
                  描摹的是天地未形之「体」;<span className="text-gold">文王演后天八卦</span>,坎离代乾坤而居南北,
                  配四时、应八方,说的是万物既生之「用」。故曰:先天为体,后天为用。
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-sm border border-line-soft bg-ink-900/70 p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-song text-sm font-bold text-gold">先天次序</span>
                      <span className="text-[10px] text-dim">伏羲 · 乾一至坤八</span>
                    </div>
                    <div className="mt-3 grid grid-cols-8 gap-1">
                      {["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"].map((id, i) => (
                        <div key={id} className="flex flex-col items-center gap-1 text-sub">
                          <TrigramGlyph lines={TRIGRAM_MAP[id].lines} size={16} color="#c9a962" />
                          <span className="font-song text-[10px] leading-none">{TRIGRAM_MAP[id].char}</span>
                          <span className="text-[9px] leading-none text-dim">{["一", "二", "三", "四", "五", "六", "七", "八"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-sm border border-line-soft bg-ink-900/70 p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="font-song text-sm font-bold text-gold">后天配洛书</span>
                      <span className="text-[10px] text-dim">文王 · 坎一至离九</span>
                    </div>
                    <div className="mt-3 grid grid-cols-8 gap-1">
                      {["kan", "kun", "zhen", "xun", "qian", "dui", "gen", "li"].map((id, i) => (
                        <div key={id} className="flex flex-col items-center gap-1 text-sub">
                          <TrigramGlyph lines={TRIGRAM_MAP[id].lines} size={16} color="#d1503a" />
                          <span className="font-song text-[10px] leading-none">{TRIGRAM_MAP[id].char}</span>
                          <span className="text-[9px] leading-none text-dim">{["一", "二", "三", "四", "六", "七", "八", "九"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 border-l-2 border-gold/50 pl-3 text-xs leading-relaxed text-dim">
                  在卦盘中切换「先天 / 后天」,可见八卦与六十四卦外环同时易位重排——乾坤退隐,坎离当权,恰是体用之别的直观一课。
                </p>
              </div>
            </Reveal>

            <Reveal delay={140} className="lg:col-span-2">
              <div className="flex h-full flex-col gap-4">
                {[
                  {
                    seal: "错",
                    title: "错卦 · 六爻皆反",
                    body: "阴阳爻逐一相反,立场对换而理相通。乾与坤错、坎与离错,如昼夜之相代。",
                    example: { a: "qian", b: "kun", label: "乾 ⇄ 坤" },
                  },
                  {
                    seal: "综",
                    title: "综卦 · 上下颠倒",
                    body: "将一卦倒转来看,一体两面,换位观之。泰倒转为否,屯倒转为蒙。",
                    example: { a: "kun", b: "qian", label: "泰 ⇄ 否" },
                  },
                  {
                    seal: "占",
                    title: "梅花 + 六爻",
                    body: "梅花易数以数起卦、以体用生克为断;六爻纳甲装卦、以六亲世应为凭。本站占筮合二者而用之。",
                    example: { a: "li", b: "kan", label: "数起卦 · 爻断事" },
                  },
                ].map((c) => {
                  const exA = TRIGRAM_MAP[c.example.a];
                  const exB = TRIGRAM_MAP[c.example.b];
                  return (
                    <div key={c.seal} className="rounded-md border border-line bg-ink-800/75 p-5 transition-colors hover:border-gold/50">
                      <div className="flex items-center gap-3">
                        <span className="seal-box">{c.seal}</span>
                        <h3 className="font-song text-base font-bold text-paper">{c.title}</h3>
                      </div>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-sub">{c.body}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-dim">
                        <TrigramGlyph lines={exA.lines} size={18} color="#7fae9b" />
                        <TrigramGlyph lines={exB.lines} size={18} color="#7fae9b" />
                        <span className="font-song text-gold/90">{c.example.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ===== 页脚 ===== */}
      <footer className="mt-24 border-t border-line/70">
        <Reveal className="mx-auto max-w-3xl px-5 py-14 text-center">
          <svg className="taiji-glow mx-auto mb-5" width="54" height="54" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="47" fill="#101826" stroke="#7d6a42" strokeWidth="2" />
            <path d="M50,4 A46,46 0 0 1 50,96 A23,23 0 0 1 50,50 A23,23 0 0 0 50,4 Z" fill="#efe6d0" />
            <circle cx="50" cy="27" r="6" fill="#101826" />
            <circle cx="50" cy="73" r="6" fill="#efe6d0" />
          </svg>
          <p className="font-display text-2xl leading-relaxed text-paper sm:text-3xl">
            「是故君子居则观其象而玩其辞,
            <br />
            动则观其变而玩其占。」
          </p>
          <p className="mt-3 font-song text-sm text-gold">——《周易 · 系辞上》</p>
          <p className="mt-6 text-[11px] tracking-widest text-dim">
            太极八卦互动演示 · 方位依古图南下北上 · 占断仅供文化研习
          </p>
        </Reveal>
      </footer>

      {divResult && <DivinationModal result={divResult} onClose={() => setDivResult(null)} onAgain={startDivination} />}
    </div>
  );
}
