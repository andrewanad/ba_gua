import { TRIGRAMS } from "../data/bagua";
import TrigramGlyph from "./TrigramGlyph";

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

const HEAD = ["卦象", "卦名", "读音", "自然", "五行", "后天方位", "先天方位", "家庭", "身体", "动物", "其色", "德性", "阴阳"];

export default function TrigramTable({ selected, onSelect }: Props) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-ink-800/75 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-ink-900/80">
            {HEAD.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-3 font-song text-xs font-bold tracking-widest text-gold/90">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TRIGRAMS.map((t) => {
            const active = selected === t.id;
            return (
              <tr
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`tr-row cursor-pointer border-b border-line-soft last:border-0 ${active ? "active" : ""}`}
              >
                <td className="px-3 py-2.5">
                  <span className={active ? "text-cinnbright" : "text-gold"}>
                    <TrigramGlyph lines={t.lines} size={26} />
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={`font-display text-2xl leading-none ${active ? "text-cinnbright" : "text-paper"}`}>{t.char}</span>
                  <span className="ml-2 text-xs text-dim">{t.nature}</span>
                </td>
                <td className="px-3 py-2.5 italic text-gold/90">{t.pinyin}</td>
                <td className="px-3 py-2.5 text-paper">{t.nature}</td>
                <td className="px-3 py-2.5 text-sub">{t.element}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-sub">{t.direction}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-sub">{t.fuxiDirection}</td>
                <td className="px-3 py-2.5 text-sub">{t.family}</td>
                <td className="px-3 py-2.5 text-sub">{t.body}</td>
                <td className="px-3 py-2.5 text-sub">{t.animal}</td>
                <td className="px-3 py-2.5 text-sub">{t.color}</td>
                <td className="px-3 py-2.5 font-song font-bold text-paper">{t.virtue}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={`rounded-sm border px-1.5 py-0.5 text-xs ${t.polarity === "阳卦" ? "border-cinn/40 text-cinnbright" : "border-jade/40 text-jade"}`}>
                    {t.polarity}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
