import { TRIGRAM_MAP, HEXAGRAMS, TRIGRAMS, type LineKind } from "./bagua";

/* ---------- 五行 ---------- */
export const WUXING_SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
export const WUXING_KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_WX: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

/* ---------- 纳甲(各卦内外卦所配地支) ---------- */
const NAJIA: Record<string, { inner: string[]; outer: string[] }> = {
  qian: { inner: ["子", "寅", "辰"], outer: ["午", "申", "戌"] },
  zhen: { inner: ["子", "寅", "辰"], outer: ["午", "申", "戌"] },
  kan: { inner: ["寅", "辰", "午"], outer: ["申", "戌", "子"] },
  gen: { inner: ["辰", "午", "申"], outer: ["戌", "子", "寅"] },
  kun: { inner: ["未", "巳", "卯"], outer: ["丑", "亥", "酉"] },
  xun: { inner: ["丑", "亥", "酉"], outer: ["未", "巳", "卯"] },
  li: { inner: ["卯", "丑", "亥"], outer: ["酉", "未", "巳"] },
  dui: { inner: ["巳", "卯", "丑"], outer: ["亥", "酉", "未"] },
};

const FUXI_NUM = ["qian", "dui", "li", "zhen", "xun", "kan", "gen", "kun"]; // 先天数 1-8

const flip = (l: LineKind): LineKind => (l === "yang" ? "yin" : "yang");

const LINES_TO_ID: Record<string, string> = {};
TRIGRAMS.forEach((t) => (LINES_TO_ID[t.lines.join("")] = t.id));
const trigramOf = (lines: LineKind[]) => LINES_TO_ID[lines.join("")];

/* ---------- 京房八宫推演(算法生成,不必硬编 64 条) ---------- */
const GONG_IDS = ["qian", "kan", "gen", "zhen", "xun", "li", "kun", "dui"];
export const ORDER_NAMES = ["本宫", "一世", "二世", "三世", "四世", "五世", "游魂", "归魂"];
const SHI_POS = [5, 0, 1, 2, 3, 4, 3, 2]; // 各世卦的世爻位置(0=初爻)

const GONG_MAP: Record<string, { palaceId: string; order: number }> = {};
GONG_IDS.forEach((pid) => {
  const T = TRIGRAM_MAP[pid];
  const base: LineKind[] = [...T.lines, ...T.lines];
  const list: LineKind[][] = [base];
  for (let i = 1; i <= 5; i++) {
    const prev = [...list[i - 1]];
    prev[i - 1] = flip(prev[i - 1]);
    list.push(prev);
  }
  const you = [...list[5]];
  you[3] = flip(you[3]); // 游魂:五世卦第四爻变回
  list.push(you);
  const gui = [...you]; // 归魂:下卦复归本宫
  gui[0] = T.lines[0];
  gui[1] = T.lines[1];
  gui[2] = T.lines[2];
  list.push(gui);
  list.forEach((ls, order) => {
    const up = trigramOf(ls.slice(3));
    const lo = trigramOf(ls.slice(0, 3));
    GONG_MAP[`${up}-${lo}`] = { palaceId: pid, order };
  });
});

function liuqin(lineWx: string, gongWx: string): string {
  if (lineWx === gongWx) return "兄弟";
  if (WUXING_SHENG[gongWx] === lineWx) return "父母"; // 生我者
  if (WUXING_SHENG[lineWx] === gongWx) return "子孙"; // 我生者
  if (WUXING_KE[lineWx] === gongWx) return "官鬼"; // 克我者
  return "妻财"; // 我克者
}

/* ---------- 结构 ---------- */
export interface YaoSetup {
  yao: number; // 1-6
  name: string; // 初、二…上
  kind: LineKind;
  branch: string;
  wx: string;
  liuqin: string;
  shi: boolean;
  ying: boolean;
  dong: boolean;
}

export interface DivinationResult {
  sourceText: string;
  formulas: string[];
  upperId: string;
  lowerId: string;
  movingYao: number;
  benKey: string;
  bianKey: string;
  huKey: string;
  palaceId: string;
  gongName: string;
  orderName: string;
  yaoSetups: YaoSetup[];
  tiId: string;
  yongId: string;
  tiyongText: string;
  duan: { title: string; text: string }[];
}

const YAO_NAMES = ["初", "二", "三", "四", "五", "上"];

/* ---------- 梅花易数 · 时间起卦 ---------- */
export function computeDivination(d: Date): DivinationResult {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours();

  const yearNum = ((y - 4) % 12) + 1; // 年支序数,子=1
  const hourNum = (((h + 1) >> 1) % 12) + 1; // 时辰序数
  const ganzhiYear = STEMS[(y - 4 + 100) % 10] + BRANCHES[(y - 4 + 120) % 12];

  const upperRaw = yearNum + m + day;
  const lowerRaw = upperRaw + hourNum;
  const upperN = upperRaw % 8 === 0 ? 8 : upperRaw % 8;
  const lowerN = lowerRaw % 8 === 0 ? 8 : lowerRaw % 8;
  const yaoN = lowerRaw % 6 === 0 ? 6 : lowerRaw % 6;

  const upperId = FUXI_NUM[upperN - 1];
  const lowerId = FUXI_NUM[lowerN - 1];
  const upper = TRIGRAM_MAP[upperId];
  const lower = TRIGRAM_MAP[lowerId];

  const hh = String(h).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const sourceText = `${ganzhiYear} · ${y}年${m}月${day}日 ${BRANCHES[hourNum - 1]}时(${hh}:${mm})`;
  const formulas = [
    `年${yearNum}数 + 月${m} + 日${day} = ${upperRaw},${upperRaw} ÷ 8 余 ${upperN},${upperN} 为${upper.char}(${upper.nature}),作上卦`,
    `${upperRaw} + 时${hourNum}数 = ${lowerRaw},${lowerRaw} ÷ 8 余 ${lowerN},${lowerN} 为${lower.char}(${lower.nature}),作下卦`,
    `${lowerRaw} ÷ 6 余 ${yaoN},第${YAO_NAMES[yaoN - 1]}爻动`,
  ];

  /* 本卦六爻、变卦、互卦 */
  const benLines: LineKind[] = [...lower.lines, ...upper.lines];
  const bianLines = benLines.map((l, i) => (i === yaoN - 1 ? flip(l) : l));
  const huLines: LineKind[] = [benLines[1], benLines[2], benLines[3], benLines[2], benLines[3], benLines[4]];

  const benKey = `${upperId}-${lowerId}`;
  const bianKey = `${trigramOf(bianLines.slice(3))}-${trigramOf(bianLines.slice(0, 3))}`;
  const huKey = `${trigramOf(huLines.slice(3))}-${trigramOf(huLines.slice(0, 3))}`;

  const ben = HEXAGRAMS[benKey];
  const bian = HEXAGRAMS[bianKey];
  const hu = HEXAGRAMS[huKey];

  /* 八宫 · 六爻装卦 */
  const gong = GONG_MAP[benKey];
  const palace = TRIGRAM_MAP[gong.palaceId];
  const gongWx = palace.element;
  const shiIdx = SHI_POS[gong.order];
  const yingIdx = (shiIdx + 3) % 6;

  const yaoSetups: YaoSetup[] = benLines.map((kind, i) => {
    const isLower = i < 3;
    const trigram = isLower ? lower : upper;
    const branch = isLower ? NAJIA[lowerId].inner[i] : NAJIA[upperId].outer[i - 3];
    return {
      yao: i + 1,
      name: YAO_NAMES[i],
      kind,
      branch,
      wx: BRANCH_WX[branch],
      liuqin: liuqin(trigram.element, gongWx),
      shi: i === shiIdx,
      ying: i === yingIdx,
      dong: i === yaoN - 1,
    };
  });

  /* 体用 */
  const dongInUpper = yaoN > 3;
  const tiId = dongInUpper ? lowerId : upperId;
  const yongId = dongInUpper ? upperId : lowerId;
  const ti = TRIGRAM_MAP[tiId];
  const yong = TRIGRAM_MAP[yongId];
  const tw = ti.element;
  const yw = yong.element;
  let rel: string;
  if (tw === yw) rel = "体用比和,主诸事顺遂,谋为可成。";
  else if (WUXING_SHENG[tw] === yw) rel = "体生用,主耗泄,付出多而回报少,凡事宜量力节制。";
  else if (WUXING_SHENG[yw] === tw) rel = "用生体,主吉庆,有进益之喜,贵人扶持,求谋得利。";
  else if (WUXING_KE[tw] === yw) rel = "体克用,主吉而有阻,事须费力方成,终可如愿。";
  else rel = "用克体,主不利,事多阻滞,宜静守待时,不可妄进。";
  const tiyongText = `动爻在${dongInUpper ? "上卦" : "下卦"},故${dongInUpper ? "上卦为用、下卦为体" : "下卦为用、上卦为体"}。体卦${ti.char}(${ti.nature})属${tw},用卦${yong.char}(${yong.nature})属${yw}。${rel}`;

  /* 断语 */
  const dongSetup = yaoSetups[yaoN - 1];
  const LIUQIN_TIPS: Record<string, string> = {
    父母: "父母爻动,主文书、契约、长辈、房屋车马之事,亦有辛劳操心之象。",
    兄弟: "兄弟爻动,主竞争、口舌、破财,劫财之象,不宜与人合谋求财。",
    子孙: "子孙爻动,主喜庆安宁、子女之事,为解忧之神,然不利求名问官。",
    妻财: "妻财爻动,主财利、饮食、婚缘,求财可得,利于经营谋生。",
    官鬼: "官鬼爻动,主功名职位,亦主忧疑、官非、疾病;问官则吉,问事则扰。",
  };
  const duan = [
    {
      title: "卦象总纲",
      text: `得「${ben.name}」,${ben.brief} 动爻既变,化出「${bian.name}」,${bian.brief} 占事之始见乎${ben.short},其终归乎${bian.short}。`,
    },
    { title: "体用生克", text: tiyongText },
    {
      title: "动爻之示",
      text: `第${YAO_NAMES[yaoN - 1]}爻动,纳${dongSetup.branch}(${dongSetup.wx}),为${dongSetup.liuqin}。${LIUQIN_TIPS[dongSetup.liuqin]}`,
    },
    {
      title: "互卦过程",
      text: `事情推演之中,互见「${hu.name}」之象:${hu.brief} 可察事态中途之曲折。`,
    },
    {
      title: "世应之要",
      text: `此卦属${palace.char}宫${ORDER_NAMES[gong.order]}卦,世在第${YAO_NAMES[shiIdx]}爻,应在第${YAO_NAMES[yingIdx]}爻。世为己身,应为所对之人事;观其生克,可知宾主之势。`,
    },
  ];

  return {
    sourceText,
    formulas,
    upperId,
    lowerId,
    movingYao: yaoN,
    benKey,
    bianKey,
    huKey,
    palaceId: gong.palaceId,
    gongName: `${palace.char}宫`,
    orderName: ORDER_NAMES[gong.order],
    yaoSetups,
    tiId,
    yongId,
    tiyongText,
    duan,
  };
}
