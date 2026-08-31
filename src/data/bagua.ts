export type LineKind = "yang" | "yin";

export interface Trigram {
  id: string;
  char: string;
  pinyin: string;
  nature: string; // 自然
  element: string; // 五行
  family: string; // 家庭
  direction: string; // 后天方位
  fuxiDirection: string; // 先天方位
  body: string; // 身体
  animal: string; // 动物
  color: string; // 颜色
  virtue: string; // 德性
  season: string; // 季节
  polarity: "阳卦" | "阴卦";
  number: string; // 先天数
  lines: [LineKind, LineKind, LineKind]; // 自下而上
  desc: string;
}

export const TRIGRAMS: Trigram[] = [
  {
    id: "qian", char: "乾", pinyin: "qián", nature: "天", element: "金",
    family: "父", direction: "西北", fuxiDirection: "正南", body: "首",
    animal: "马", color: "赤", virtue: "健", season: "秋冬之交",
    polarity: "阳卦", number: "一", lines: ["yang", "yang", "yang"],
    desc: "乾为天,六爻皆阳,纯阳之卦。天行健,君子以自强不息。乾主刚健进取、创造开拓,为君为父为首,居后天西北,于五行属金。",
  },
  {
    id: "dui", char: "兌", pinyin: "duì", nature: "泽", element: "金",
    family: "少女", direction: "正西", fuxiDirection: "东南", body: "口",
    animal: "羊", color: "白", virtue: "悦", season: "仲秋",
    polarity: "阴卦", number: "二", lines: ["yang", "yang", "yin"],
    desc: "兌为泽,一阴浮于二阳之上,悦于外。泽润万物而和悦相亲,主言说喜悦、感通交游,为少女为口,居后天正西,应秋分之象。",
  },
  {
    id: "li", char: "离", pinyin: "lí", nature: "火", element: "火",
    family: "中女", direction: "正南", fuxiDirection: "正东", body: "目",
    animal: "雉", color: "红", virtue: "丽", season: "仲夏",
    polarity: "阴卦", number: "三", lines: ["yang", "yin", "yang"],
    desc: "离为火,一阴居于二阳之中,外实中虚。火必附丽于物而后明,主文明光明、洞察照耀,为中女为目,居后天正南,当夏至之令。",
  },
  {
    id: "zhen", char: "震", pinyin: "zhèn", nature: "雷", element: "木",
    family: "长男", direction: "正东", fuxiDirection: "东北", body: "足",
    animal: "龙", color: "青", virtue: "动", season: "仲春",
    polarity: "阳卦", number: "四", lines: ["yang", "yin", "yin"],
    desc: "震为雷,一阳奋于二阴之下。雷动而万物萌发,主奋发震动、起而行之,为长男为足,居后天正东,应春分之机,为生机之始。",
  },
  {
    id: "xun", char: "巽", pinyin: "xùn", nature: "风", element: "木",
    family: "长女", direction: "东南", fuxiDirection: "西南", body: "股",
    animal: "鸡", color: "绿", virtue: "入", season: "春夏之交",
    polarity: "阴卦", number: "五", lines: ["yin", "yang", "yang"],
    desc: "巽为风,一阴伏于二阳之下。风无孔不入,柔顺而能渗透,主渐入潜移默化,为长女为股,居后天东南,风行地上,无所不至。",
  },
  {
    id: "kan", char: "坎", pinyin: "kǎn", nature: "水", element: "水",
    family: "中男", direction: "正北", fuxiDirection: "正西", body: "耳",
    animal: "豕", color: "黑", virtue: "陷", season: "仲冬",
    polarity: "阳卦", number: "六", lines: ["yin", "yang", "yin"],
    desc: "坎为水,一阳陷于二阴之中,外险内刚。水流而不盈,行险而不失其信,主智慧险难、坚韧不折,为中男为耳,居后天正北,当冬至之候。",
  },
  {
    id: "gen", char: "艮", pinyin: "gèn", nature: "山", element: "土",
    family: "少男", direction: "东北", fuxiDirection: "西北", body: "手",
    animal: "狗", color: "褐", virtue: "止", season: "冬春之交",
    polarity: "阳卦", number: "七", lines: ["yin", "yin", "yang"],
    desc: "艮为山,一阳止于上,二阴安于下。山岳巍然而止,主静止安重、知止而止,为少男为手,居后天东北,艮其背,不获其身。",
  },
  {
    id: "kun", char: "坤", pinyin: "kūn", nature: "地", element: "土",
    family: "母", direction: "西南", fuxiDirection: "正北", body: "腹",
    animal: "牛", color: "黄", virtue: "顺", season: "夏秋之交",
    polarity: "阴卦", number: "八", lines: ["yin", "yin", "yin"],
    desc: "坤为地,六爻皆阴,纯阴之卦。地势坤,君子以厚德载物。坤主柔顺承载、含弘光大,为母为臣为腹,居后天西南,与乾相对相成。",
  },
];

export const TRIGRAM_MAP: Record<string, Trigram> = Object.fromEntries(
  TRIGRAMS.map((t) => [t.id, t])
);

/** 相错之卦(六爻阴阳全反) */
export const OPPOSITE: Record<string, string> = {
  qian: "kun", kun: "qian", dui: "gen", gen: "dui",
  li: "kan", kan: "li", zhen: "xun", xun: "zhen",
};

/** 盘面角度:数学角度制(90° 为上,即南方;图上南下北、左东右西) */
export const FUXI_ANGLES: Record<string, number> = {
  qian: 90, dui: 45, li: 0, zhen: 315, xun: 225, kan: 180, gen: 135, kun: 270,
};
export const KINGWEN_ANGLES: Record<string, number> = {
  li: 90, kun: 45, dui: 0, qian: 315, kan: 270, gen: 225, zhen: 180, xun: 135,
};

export const DIRECTIONS: { name: string; angle: number; major?: boolean }[] = [
  { name: "南", angle: 90, major: true },
  { name: "西南", angle: 45 },
  { name: "西", angle: 0, major: true },
  { name: "西北", angle: 315 },
  { name: "北", angle: 270, major: true },
  { name: "东北", angle: 225 },
  { name: "东", angle: 180, major: true },
  { name: "东南", angle: 135 },
];

export interface HexagramInfo {
  name: string; // 全称,如「地天泰」
  short: string; // 卦名,如「泰」
  brief: string; // 简解
}

/** 键为「上卦-下卦」 */
export const HEXAGRAMS: Record<string, HexagramInfo> = {
  "qian-qian": { name: "乾为天", short: "乾", brief: "刚健自强,进取不息" },
  "qian-dui": { name: "天泽履", short: "履", brief: "循礼而行,小心处事" },
  "qian-li": { name: "天火同人", short: "同人", brief: "同心协力,和衷共济" },
  "qian-zhen": { name: "天雷无妄", short: "无妄", brief: "顺天而行,不妄作为" },
  "qian-xun": { name: "天风姤", short: "姤", brief: "不期而遇,防微杜渐" },
  "qian-kan": { name: "天水讼", short: "讼", brief: "争讼之象,适可而止" },
  "qian-gen": { name: "天山遯", short: "遯", brief: "退避隐遁,以守为进" },
  "qian-kun": { name: "天地否", short: "否", brief: "闭塞不通,待时而动" },

  "dui-qian": { name: "泽天夬", short: "夬", brief: "果决除弊,刚柔相济" },
  "dui-dui": { name: "兌为泽", short: "兌", brief: "和悦相处,以诚待人" },
  "dui-li": { name: "泽火革", short: "革", brief: "变革求新,顺天应人" },
  "dui-zhen": { name: "泽雷随", short: "随", brief: "顺势而随,随机应变" },
  "dui-xun": { name: "泽风大过", short: "大过", brief: "非常之时,行非常之事" },
  "dui-kan": { name: "泽水困", short: "困", brief: "身处困境,守正待时" },
  "dui-gen": { name: "泽山咸", short: "咸", brief: "相互感应,以虚受人" },
  "dui-kun": { name: "泽地萃", short: "萃", brief: "聚集会合,众志成城" },

  "li-qian": { name: "火天大有", short: "大有", brief: "大有所获,盛而不骄" },
  "li-dui": { name: "火泽睽", short: "睽", brief: "乖违背离,求同存异" },
  "li-li": { name: "离为火", short: "离", brief: "附丽光明,文明以止" },
  "li-zhen": { name: "火雷噬嗑", short: "噬嗑", brief: "明断是非,除恶务尽" },
  "li-xun": { name: "火风鼎", short: "鼎", brief: "革故鼎新,养贤用能" },
  "li-kan": { name: "火水未济", short: "未济", brief: "事未完成,慎终如始" },
  "li-gen": { name: "火山旅", short: "旅", brief: "羁旅在外,谨慎行事" },
  "li-kun": { name: "火地晋", short: "晋", brief: "旭日东升,进取有成" },

  "zhen-qian": { name: "雷天大壮", short: "大壮", brief: "刚健壮盛,非礼弗履" },
  "zhen-dui": { name: "雷泽归妹", short: "归妹", brief: "归于其所,守分知止" },
  "zhen-li": { name: "雷火丰", short: "丰", brief: "丰盛盈满,盛极思变" },
  "zhen-zhen": { name: "震为雷", short: "震", brief: "临事而惧,修省自身" },
  "zhen-xun": { name: "雷风恒", short: "恒", brief: "持之以恒,守常不变" },
  "zhen-kan": { name: "雷水解", short: "解", brief: "解除危难,宽以待人" },
  "zhen-gen": { name: "雷山小过", short: "小过", brief: "小有过越,宜下不宜上" },
  "zhen-kun": { name: "雷地豫", short: "豫", brief: "和乐愉悦,顺势而为" },

  "xun-qian": { name: "风天小畜", short: "小畜", brief: "小有积蓄,以小蓄大" },
  "xun-dui": { name: "风泽中孚", short: "中孚", brief: "诚信感物,中心有信" },
  "xun-li": { name: "风火家人", short: "家人", brief: "家道和睦,各安其位" },
  "xun-zhen": { name: "风雷益", short: "益", brief: "损上益下,见善则迁" },
  "xun-xun": { name: "巽为风", short: "巽", brief: "顺入渐进,柔顺行事" },
  "xun-kan": { name: "风水涣", short: "涣", brief: "涣散离析,聚合人心" },
  "xun-gen": { name: "风山渐", short: "渐", brief: "循序渐进,稳步前行" },
  "xun-kun": { name: "风地观", short: "观", brief: "观察瞻仰,以德化民" },

  "kan-qian": { name: "水天需", short: "需", brief: "等待时机,养精蓄锐" },
  "kan-dui": { name: "水泽节", short: "节", brief: "节制有度,过犹不及" },
  "kan-li": { name: "水火既济", short: "既济", brief: "功成事遂,守成慎微" },
  "kan-zhen": { name: "水雷屯", short: "屯", brief: "万物始生,艰难起步" },
  "kan-xun": { name: "水风井", short: "井", brief: "井养不穷,修德养民" },
  "kan-kan": { name: "坎为水", short: "坎", brief: "险陷重重,行险有信" },
  "kan-gen": { name: "水山蹇", short: "蹇", brief: "行路艰难,反身修德" },
  "kan-kun": { name: "水地比", short: "比", brief: "亲比辅佐,择善而从" },

  "gen-qian": { name: "山天大畜", short: "大畜", brief: "大有积蓄,厚积薄发" },
  "gen-dui": { name: "山泽损", short: "损", brief: "减损私欲,损己益人" },
  "gen-li": { name: "山火贲", short: "贲", brief: "文饰修美,质朴为本" },
  "gen-zhen": { name: "山雷颐", short: "颐", brief: "颐养正道,慎言节食" },
  "gen-xun": { name: "山风蛊", short: "蛊", brief: "整饬积弊,拨乱反正" },
  "gen-kan": { name: "山水蒙", short: "蒙", brief: "启蒙教化,养正于蒙" },
  "gen-gen": { name: "艮为山", short: "艮", brief: "知止而止,止于至善" },
  "gen-kun": { name: "山地剥", short: "剥", brief: "剥落侵蚀,顺时而止" },

  "kun-qian": { name: "地天泰", short: "泰", brief: "通泰交融,小往大来" },
  "kun-dui": { name: "地泽临", short: "临", brief: "临近滋长,以诚待人" },
  "kun-li": { name: "地火明夷", short: "明夷", brief: "晦暗之时,韬光养晦" },
  "kun-zhen": { name: "地雷复", short: "复", brief: "一阳来复,生机重现" },
  "kun-xun": { name: "地风升", short: "升", brief: "积小成高,柔顺上升" },
  "kun-kan": { name: "地水师", short: "师", brief: "兴师动众,以正治兵" },
  "kun-gen": { name: "地山谦", short: "谦", brief: "谦虚受益,卑以自牧" },
  "kun-kun": { name: "坤为地", short: "坤", brief: "厚德载物,含弘光大" },
};
