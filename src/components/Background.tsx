import { useMemo } from "react";

interface Dust {
  left: string;
  size: number;
  t: string;
  d: string;
  o: number;
  c: string;
}

export default function Background() {
  const dusts = useMemo<Dust[]>(() => {
    const colors = ["#c9a962", "#c9a962", "#e9dfc8", "#d1503a", "#7fae9b"];
    return Array.from({ length: 26 }, (_, i) => ({
      left: `${(i * 137.5) % 100}%`,
      size: 1.5 + ((i * 7) % 10) / 4,
      t: `${20 + ((i * 13) % 18)}s`,
      d: `${-((i * 5) % 24)}s`,
      o: 0.2 + ((i * 11) % 10) / 28,
      c: colors[i % colors.length],
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink-900">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 700px at 18% 12%, #13202f 0%, transparent 60%)," +
            "radial-gradient(900px 600px at 85% 70%, #101b26 0%, transparent 55%)," +
            "linear-gradient(180deg, #0b111a 0%, #0a0f17 100%)",
        }}
      />
      <div className="glow-orb" style={{ width: 620, height: 620, left: "-8%", top: "-12%", background: "rgba(209, 80, 58, 0.10)" }} />
      <div className="glow-orb" style={{ width: 540, height: 540, right: "-10%", top: "22%", background: "rgba(201, 169, 98, 0.09)", animationDelay: "-6s" }} />
      <div className="glow-orb" style={{ width: 560, height: 560, left: "26%", bottom: "-18%", background: "rgba(127, 174, 155, 0.07)", animationDelay: "-12s" }} />

      <svg className="absolute left-1/2 top-[8%] -translate-x-1/2 opacity-[0.05]" width="1100" height="1100" viewBox="0 0 1100 1100" aria-hidden>
        <g className="slow-ring">
          <circle cx="550" cy="550" r="520" fill="none" stroke="#c9a962" strokeWidth="1" strokeDasharray="4 14" />
          <circle cx="550" cy="550" r="430" fill="none" stroke="#c9a962" strokeWidth="1" strokeDasharray="1 10" />
        </g>
        <g className="slow-ring-rev">
          <circle cx="550" cy="550" r="340" fill="none" stroke="#e9dfc8" strokeWidth="1" strokeDasharray="2 22" />
        </g>
      </svg>

      <div className="vertical-text absolute left-[1.2%] top-[16%] hidden select-none font-display text-[11rem] leading-none xl:block" style={{ color: "rgba(201,169,98,0.045)" }} aria-hidden>
        一陰一陽之謂道
      </div>
      <div className="vertical-text absolute right-[1.2%] top-[30%] hidden select-none font-display text-[11rem] leading-none xl:block" style={{ color: "rgba(209,80,58,0.05)" }} aria-hidden>
        生生之謂易
      </div>

      {dusts.map((d, i) => (
        <span
          key={i}
          className="dust"
          style={
            {
              left: d.left,
              width: d.size,
              height: d.size,
              "--dust-t": d.t,
              "--dust-d": d.d,
              "--dust-o": d.o,
              "--dust-c": d.c,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="noise-overlay" />
    </div>
  );
}
