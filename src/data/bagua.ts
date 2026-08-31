/* 八卦 · 六十四卦 基础数据 */

export type LineKind = "yang" | "yin";

export interface Trigram {
  id: string;
  char: string;
  nature: string;
  pinyin: string;
  element: string;
  family: string;
  body: string;
  animal: string;
  color: string;
  virtue: string;
  direction: string; // 后天方位
  fuxiDirection: string; // 先天方位
  polarity: string;
  desc: string;
  /** 爻自下而上 */
  lines: LineKind[];
}

export const TRIGRAMS: Trigram[] = [
  {
    id: "qian", char: "乾", nature: "天", pinyin: "qián", element: "金",
    family: "父", body: "首", animal: "马", color: "大赤", virtue: "健",
    direction: "西北", fuxiDirection: "南", polarity: "阳卦",
    desc: "乾为天,纯阳至健。天行健,君子以自强不息,刚健中正,万物资始。",
    lines: ["yang", "yang", "yang"],
  },
  {
    id: "dui", char: "兑", nature: "泽", pinyin: "duì", element: "金",
    family: "少女", body: "口", animal: "羊", color: "白", virtue: "悦",
    direction: "西", fuxiDirection: "东南", polarity: "阴卦",
    desc: "兑为泽,上缺下实,两阳承一阴。丽泽相滋,朋友讲习,和悦通达。",
    lines: ["yang", "yang", "yin"],
  },
  {
    id: "li", char: "离", nature: "火", pinyin: "lí", element: "火",
    family: "中女", body: "目", animal: "雉", color: "紫", virtue: "丽",
    direction: "南", fuxiDirection: "东", polarity: "阴卦",
    desc: "离为火,外刚内柔,中虚而明。日月丽天,重明以正,化成天下。",
    lines: ["yang", "yin", "yang"],
  },
  {
    id: "zhen", char: "震", nature: "雷", pinyin: "zhèn", element: "木",
    family: "长男", body: "足", animal: "龙", color: "青碧", virtue: "动",
    direction: "东", fuxiDirection: "东北", polarity: "阳卦",
    desc: "震为雷,一阳奋于二阴之下。震惊百里,万物出乎震,动而奋发。",
    lines: ["yang", "yin", "yin"],
  },
  {
    id: "xun", char: "巽", nature: "风", pinyin: "xùn", element: "木",
    family: "长女", body: "股", animal: "鸡", color: "青白", virtue: "入",
    direction: "东南", fuxiDirection: "西南", polarity: "阴卦",
    desc: "巽为风,一阴伏于二阳之下。风行无所不入,申命行事,柔顺渐化。",
    lines: ["yin", "yang", "yang"],
  },
  {
    id: "kan", char: "坎", nature: "水", pinyin: "kǎn", element: "水",
    family: "中男", body: "耳", animal: "豕", color: "黑", virtue: "陷",
    direction: "北", fuxiDirection: "西", polarity: "阳卦",
    desc: "坎为水,外柔内刚,中实而险。水流而不盈,行险而不失信。",
    lines: ["yin", "yang", "yin"],
  },
  {
    id: "gen", char: "艮", nature: "山", pinyin: "gèn", element: "土",
    family: "少男", body: "手", animal: "狗", color: "黄", virtue: "止",
    direction: "东北", fuxiDirection: "西北", polarity: "阳卦",
    desc: "艮为山,一阳止于上,笃实厚重。艮其背,不获其身,时止则止,时行则行。",
    lines: ["yin", "yin", "yang"],
  },
  {
    id: "kun", char: "坤", nature: "地", pinyin: "kūn", element: "土",
    family: "母", body: "腹", animal: "牛", color: "黄", virtue: "顺",
    direction: "西南", fuxiDirection: "北", polarity: "阴卦",
    desc: "坤为地,纯阴至顺。地势坤,君子以厚德载物,万物资生。",
    lines: ["yin", "yin", "yin"],
  },
];

export const TRIGRAM_MAP: Record<string, Trigram> = Object.fromEntries(
  TRIGRAMS.map((t) => [t.id, t])
);

export const OPPOSITE: Record<string, string> = {
  qian: "kun", kun: "qian",
  zhen: "xun", xun: "zhen",
  kan: "li", li: "kan",
  gen: "dui", dui: "gen",
};

/* 后天八卦(文王) */
export const KINGWEN: Trigram[] = [
  TRIGRAM_MAP.li, TRIGRAM_MAP.kun, TRIGRAM_MAP.dui, TRIGRAM_MAP.qian,
  TRIGRAM_MAP.kan, TRIGRAM_MAP.gen, TRIGRAM_MAP.zhen, TRIGRAM_MAP.xun,
];

/* 先天八卦(伏羲) */
export const FUXI: Trigram[] = [
  TRIGRAM_MAP.qian, TRIGRAM_MAP.dui, TRIGRAM_MAP.li, TRIGRAM_MAP.zhen,
  TRIGRAM_MAP.xun, TRIGRAM_MAP.kan, TRIGRAM_MAP.gen, TRIGRAM_MAP.kun,
];

export const DIR_LABELS: { char: string; angle: number; major: boolean }[] = [
  { char: "南", angle: 0, major: true },
  { char: "西南", angle: 45, major: false },
  { char: "西", angle: 90, major: true },
  { char: "西北", angle: 135, major: false },
  { char: "北", angle: 180, major: true },
  { char: "东北", angle: 225, major: false },
  { char: "东", angle: 270, major: true },
  { char: "东南", angle: 315, major: false },
];

/* ---------- 六十四卦(key = 上卦-下卦) ---------- */
export interface Hexagram {
  key: string;
  upper: string;
  lower: string;
  name: string;
  short: string;
  brief: string;
}

const RAW: [string, string, string, string][] = [
  ["qian", "qian", "乾为天", "刚健自强,天行不息"],
  ["dui", "qian", "天泽履", "履虎尾,谨慎而行"],
  ["li", "qian", "天火同人", "与人同心,其利断金"],
  ["zhen", "qian", "天雷无妄", "不妄为,顺天应时"],
  ["xun", "qian", "天风姤", "不期而遇,防微杜渐"],
  ["kan", "qian", "天水讼", "争执宜止,和则两利"],
  ["gen", "qian", "天山遁", "退避自守,以待天时"],
  ["kun", "qian", "天地否", "闭塞不通,守正待变"],
  ["qian", "dui", "泽天夬", "果决除弊,扬善去恶"],
  ["dui", "dui", "兑为泽", "朋友讲习,和悦相滋"],
  ["li", "dui", "泽火革", "顺天应人,革故鼎新"],
  ["zhen", "dui", "泽雷随", "随时而动,随善而从"],
  ["xun", "dui", "泽风大过", "非常之时,行非常之事"],
  ["kan", "dui", "泽水困", "身处困境,守志则通"],
  ["gen", "dui", "泽山咸", "两心相感,交相感应"],
  ["kun", "dui", "泽地萃", "人心汇聚,众志成城"],
  ["qian", "li", "火天大有", "如日中天,大有所获"],
  ["dui", "li", "火泽睽", "异中求同,睽而能合"],
  ["li", "li", "离为火", "光明相继,重明丽正"],
  ["zhen", "li", "火雷噬嗑", "明罚敕法,去梗则合"],
  ["xun", "li", "火风鼎", "鼎新革故,养贤育德"],
  ["kan", "li", "火水未济", "事未成,慎终如始"],
  ["gen", "li", "火山旅", "行旅在外,谨守柔顺"],
  ["kun", "li", "火地晋", "如日方升,进而有为"],
  ["qian", "zhen", "雷天大壮", "刚强壮盛,止于礼义"],
  ["dui", "zhen", "雷泽归妹", "名分未正,守常为宜"],
  ["li", "zhen", "雷火丰", "丰盛盈满,宜日中则明"],
  ["zhen", "zhen", "震为雷", "临事而惧,动而有为"],
  ["xun", "zhen", "雷风恒", "恒久之道,守常不变"],
  ["kan", "zhen", "雷水解", "患难解散,宽缓得宜"],
  ["gen", "zhen", "雷山小过", "小有过越,宜下不宜上"],
  ["kun", "zhen", "雷地豫", "顺以动,和乐豫悦"],
  ["qian", "xun", "风天小畜", "小有积蓄,以柔蓄刚"],
  ["dui", "xun", "风泽中孚", "诚信在中,感化万物"],
  ["li", "xun", "风火家人", "家道正,齐家为先"],
  ["zhen", "xun", "风雷益", "损上益下,见善则迁"],
  ["xun", "xun", "巽为风", "柔顺而入,申命行事"],
  ["kan", "xun", "风水涣", "涣散离散,聚合人心"],
  ["gen", "xun", "风山渐", "循序渐进,进以有序"],
  ["kun", "xun", "风地观", "静观其变,以德化民"],
  ["qian", "kan", "水天需", "云上于天,待时而动"],
  ["dui", "kan", "水泽节", "节制有度,过犹不及"],
  ["li", "kan", "水火既济", "功成事遂,慎防衰乱"],
  ["zhen", "kan", "水雷屯", "万物始生,艰难创业"],
  ["xun", "kan", "水风井", "井养不穷,修德养人"],
  ["kan", "kan", "坎为水", "习坎行险,心亨则通"],
  ["gen", "kan", "水山蹇", "行路艰难,反身修德"],
  ["kun", "kan", "水地比", "亲比和睦,择善而从"],
  ["qian", "gen", "山天大畜", "大有积蓄,厚积薄发"],
  ["dui", "gen", "山泽损", "损下益上,惩忿窒欲"],
  ["li", "gen", "山火贲", "文饰之美,质朴为本"],
  ["zhen", "gen", "山雷颐", "养正之道,慎言节食"],
  ["xun", "gen", "山风蛊", "革除积弊,拨乱反正"],
  ["kan", "gen", "山水蒙", "启蒙发智,学以渐成"],
  ["gen", "gen", "艮为山", "知止而后定,动静不失其时"],
  ["kun", "gen", "山地剥", "剥落将尽,顺时静守"],
  ["qian", "kun", "地天泰", "天地交泰,上下和通"],
  ["dui", "kun", "地泽临", "居上临下,教思无穷"],
  ["li", "kun", "地火明夷", "晦暗之中,内明外顺"],
  ["zhen", "kun", "地雷复", "一阳来复,剥极而复"],
  ["xun", "kun", "地风升", "柔以时升,积小成高"],
  ["kan", "kun", "地水师", "行师用众,以正为本"],
  ["gen", "kun", "地山谦", "谦谦君子,卑以自牧"],
  ["kun", "kun", "坤为地", "厚德载物,柔顺承天"],
];

export const HEXAGRAMS: Record<string, Hexagram> = {};
RAW.forEach(([upper, lower, name, brief]) => {
  const key = `${upper}-${lower}`;
  HEXAGRAMS[key] = { key, upper, lower, name, short: name.includes("为") ? name.charAt(0) : name.charAt(2), brief };
});
