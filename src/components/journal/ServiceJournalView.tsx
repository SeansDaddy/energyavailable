import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Share2,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  FileText,
  ShieldCheck,
  Zap,
  ExternalLink,
  Printer,
  X,
  Send,
  Eye,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

interface JournalIssue {
  id: string;
  issueNo: string; // e.g. "2026年第08期"
  date: string; // e.g. "2026-08-25"
  category: 'PUE_BENCHMARK' | 'GREEN_ENERGY' | 'LIQUID_COOLING' | 'POLICY_COMPLIANCE';
  categoryLabel: string;
  title: string;
  subtitle: string;
  coverBadge: string;
  coverBadgeColor: string;
  author: string;
  readTimeMinutes: number;
  featuredSite: string;
  pueBefore: number;
  pueAfter: number;
  energySavedKwh: string;
  costSavedYuan: string;
  abstract: string;
  keyArticles: { title: string; author: string; page: string }[];
  isFeatured?: boolean;
}

const INITIAL_JOURNALS: JournalIssue[] = [
  {
    id: 'issue-2026-08',
    issueNo: '2026年第08期 · 8月刊',
    date: '2026-08-25',
    category: 'PUE_BENCHMARK',
    categoryLabel: '能效与PUE对标',
    title: '绿色算力数据中心 PUE 治理专刊：从 1.48 到 1.23 的 AI 智冷改造实践',
    subtitle: '聚焦广东工业园区智算中心能耗双控红线化解方案与冷冻水AI自适应联调',
    coverBadge: '本期头条 · 案例精析',
    coverBadgeColor: 'bg-emerald-600 text-white',
    author: '数据中心能效服务专家组 · 联合编写',
    readTimeMinutes: 12,
    featuredSite: '华南数据互联科技 · 广州南沙智算产业园数据中心',
    pueBefore: 1.48,
    pueAfter: 1.23,
    energySavedKwh: '320 万 kWh/年',
    costSavedYuan: '256 万元/年',
    abstract: '本期针对广东省工信厅数据中心 1.25 准入红线，深度解析某大型智算中心如何利用“间接蒸发冷自然冷却 + AI 动态精准控温”改造方案，彻底规避阶梯加价电费与停机整改风险，年节约用电 320 万度。',
    keyArticles: [
      { title: '一文读懂数据中心 PUE 1.25 政策红线与超标电费阶梯累进加价机制', author: '政策研究室·张玮', page: 'P04-P09' },
      { title: '冷水机组与末端风机 AI 群控联调：如何做到秒级响应算力机柜热负荷脉冲', author: '暖通专家·刘浩', page: 'P10-P17' },
      { title: '数据中心合同能源管理(EMC)节能效益分享商务谈判要点与合同模板', author: '商务解决方案·赵雪', page: 'P18-P24' }
    ],
    isFeatured: true
  },
  {
    id: 'issue-2026-07',
    issueNo: '2026年第07期 · 7月刊',
    date: '2026-07-28',
    category: 'GREEN_ENERGY',
    categoryLabel: '绿电与碳资产',
    title: '东数西算节点绿电直供与绿证(GEC)全生命周期碳资产抵消实操白皮书',
    subtitle: '上海与长三角金融数据中心 Scope 2 碳中和路径与跨省绿电交易策略',
    coverBadge: '碳中和专题',
    coverBadgeColor: 'bg-teal-600 text-white',
    author: '绿电交易与碳资产管理委员会',
    readTimeMinutes: 15,
    featuredSite: '润泽科技集团 · 上海松江金融数据中心',
    pueBefore: 1.35,
    pueAfter: 1.21,
    energySavedKwh: '480 万 kWh/年',
    costSavedYuan: '312 万元/年',
    abstract: '全面梳理金融及跨国云厂商对零碳数据中心的准入要求，详解绿电交易、分布式屋顶光伏与储能削峰填谷协同，如何帮助数据中心达成 100% 绿电覆盖率并获批国家级绿色示范。',
    keyArticles: [
      { title: '2026 年华东区域绿证(GEC)与CCER碳抵消最新申报与核销流程详解', author: '碳资深专家·陈明', page: 'P03-P08' },
      { title: '储能后备电源参与电网高价值需求响应与调频辅助服务的经济性测算', author: '电力现货部·韩旭', page: 'P09-P16' }
    ]
  },
  {
    id: 'issue-2026-06',
    issueNo: '2026年第06期 · 6月刊',
    date: '2026-06-30',
    category: 'LIQUID_COOLING',
    categoryLabel: '高密液冷架构',
    title: '40kW/U 超高密算力服务器全浸没式与冷板式液冷温控安全运营指引',
    subtitle: '面向 AI 大模型训练集群极端热通量场景的二次侧供回水温差与不停机维护规约',
    coverBadge: '技术前沿',
    coverBadgeColor: 'bg-indigo-600 text-white',
    author: '先进数据中心机电工程组',
    readTimeMinutes: 14,
    featuredSite: '杭州钱塘新区数据中心储能与算力联合机房',
    pueBefore: 1.42,
    pueAfter: 1.15,
    energySavedKwh: '560 万 kWh/年',
    costSavedYuan: '420 万元/年',
    abstract: '探讨在 800V 高压直流与单机柜 40kW 极端发热条件下，冷板液冷防泄漏、冷却工质绝缘阻抗监测与一次侧板换温差精准调控的现场保障规范。',
    keyArticles: [
      { title: '冷板式液冷 CDU 循环泵变频策略与机柜级微泄漏检测防护体系', author: '机电总工程师·周宇', page: 'P04-P11' },
      { title: '高密算力负荷波动下蓄冷罐与应急冷源的放冷切换时延优化', author: '暖通专家·刘浩', page: 'P12-P19' }
    ]
  },
  {
    id: 'issue-2026-05',
    issueNo: '2026年第05期 · 5月刊',
    date: '2026-05-25',
    category: 'POLICY_COMPLIANCE',
    categoryLabel: '政策合规与审计',
    title: '国家发改委《数据中心绿色低碳发展专项行动计划》要点解读与自查清单',
    subtitle: '全国数据中心平均 PUE 降至 1.30 以下的时间表倒逼与重点用能单位能耗审计指南',
    coverBadge: '政策合规',
    coverBadgeColor: 'bg-blue-600 text-white',
    author: '政策法规与标准研究室',
    readTimeMinutes: 10,
    featuredSite: '京津冀张家口怀来大数据产业基地',
    pueBefore: 1.38,
    pueAfter: 1.22,
    energySavedKwh: '620 万 kWh/年',
    costSavedYuan: '465 万元/年',
    abstract: '逐条解读能耗双控转向碳排放双控考核背景下，各地对数据中心 PUE 准入、可再生能源消纳比例和水资源利用率(WUE)的最新核查机制。',
    keyArticles: [
      { title: '重点用能单位能源审计“必查十项”：数据中心自查与风险隐患排查表', author: '高级审核员·王建国', page: 'P03-P07' },
      { title: '能耗在线监测端设备规范接入与防数据造假合规指引', author: '数字化专工·孙琳', page: 'P08-P14' }
    ]
  }
];

export const ServiceJournalView: React.FC = () => {
  const [journals] = useState<JournalIssue[]>(INITIAL_JOURNALS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [readingIssue, setReadingIssue] = useState<JournalIssue | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredJournals = journals.filter(j => {
    if (selectedCategory !== 'ALL' && j.category !== selectedCategory) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      return (
        j.title.toLowerCase().includes(kw) ||
        j.subtitle.toLowerCase().includes(kw) ||
        j.abstract.toLowerCase().includes(kw) ||
        j.featuredSite.toLowerCase().includes(kw) ||
        j.issueNo.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 p-5 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              数据中心能源服务期刊
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold font-mono">
              IDC GREEN ENERGY JOURNAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            面向绿色算力中心、智算产业园与超大规模 IDC 的专业能效运营期刊。聚焦 PUE 能耗合规双控、冷水机组与末端 AI 智冷改造实践、东数西算绿电交易与双碳资产落地方案。
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowSubscribeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:border-slate-400 text-slate-700 transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>订阅与推送到客户</span>
          </button>

          <button
            type="button"
            onClick={() => showToast('已成功打包生成《数据中心能效服务期刊年度合订本 (PDF)》')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出合订本 (PDF)</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>连续刊发期数</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            24 <span className="text-xs font-normal text-slate-500">期</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">月度连续刊发 · 2024~2026</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>覆盖纳管数据中心</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            32 <span className="text-xs font-normal text-slate-500">处机房</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">华东/华南/京津冀及东数西算节点</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>服务机房平均 PUE</span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            1.238 <span className="text-xs font-normal text-slate-500">(-0.21)</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">优于国家 1.25 准入红线</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>累计协助节能降费</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            3,880 <span className="text-xs font-normal text-slate-500">万元</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">累计节电 4,860 万 kWh</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部期刊 ({journals.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('PUE_BENCHMARK')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              selectedCategory === 'PUE_BENCHMARK'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            能效与PUE对标
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('GREEN_ENERGY')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              selectedCategory === 'GREEN_ENERGY'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            绿电与碳资产
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('LIQUID_COOLING')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              selectedCategory === 'LIQUID_COOLING'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            高密液冷架构
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('POLICY_COMPLIANCE')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              selectedCategory === 'POLICY_COMPLIANCE'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            政策合规与审计
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜索期刊标题、关键词、机房案例..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Featured Journal Card (If present) */}
      {filteredJournals.filter(j => j.isFeatured).map(featured => (
        <div
          key={`featured-${featured.id}`}
          className="bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white border border-blue-200 rounded-xl p-5 shadow-xs relative overflow-hidden space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-2xs">
                {featured.coverBadge}
              </span>
              <span className="font-mono text-xs font-bold text-blue-900">
                {featured.issueNo}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">{featured.date}</span>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <span>阅读约 {featured.readTimeMinutes} 分钟</span>
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setReadingIssue(featured)}>
              {featured.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {featured.subtitle}
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed">
            {featured.abstract}
          </div>

          {/* Key Article Links */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              本期重点推荐篇目:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {featured.keyArticles.map((art, idx) => (
                <div
                  key={idx}
                  onClick={() => setReadingIssue(featured)}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer transition-all flex items-start justify-between gap-2 text-xs group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-1">
                      {art.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {art.author} · {art.page}
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-100/80">
            <div className="text-[11px] text-slate-500 font-mono">
              实测标杆机房: <strong className="text-slate-800">{featured.featuredSite}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReadingIssue(featured)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>在线阅读全刊</span>
              </button>

              <button
                type="button"
                onClick={() => showToast(`已启动《${featured.issueNo}》PDF下载`)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载 PDF</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Journal Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJournals.map(journal => (
          <div
            key={journal.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {journal.issueNo}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{journal.date}</span>
              </div>

              <h4
                onClick={() => setReadingIssue(journal)}
                className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug"
              >
                {journal.title}
              </h4>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {journal.subtitle}
              </p>

              {/* Energy Impact Box */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">PUE 改善幅度</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {journal.pueBefore} &rarr; {journal.pueAfter}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">年化节约电量</span>
                  <span className="font-mono font-bold text-slate-800">
                    {journal.energySavedKwh}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                {journal.readTimeMinutes} 分钟深度阅读
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReadingIssue(journal)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  阅读
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`已下载 ${journal.issueNo} 单期报告`)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  title="下载单期 PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Online Journal Reader Modal */}
      {readingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-md bg-blue-100 text-blue-700">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs text-slate-500 font-mono">{readingIssue.issueNo}</div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {readingIssue.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('打印指令已发送')}
                  className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  title="打印文章"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => showToast('已成功下载整本期刊 PDF 电子版')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载本期 PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReadingIssue(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Article Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2 font-mono">
                  <span>发布日期: {readingIssue.date}</span>
                  <span>·</span>
                  <span>作者: {readingIssue.author}</span>
                  <span>·</span>
                  <span>案例机房: {readingIssue.featuredSite}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {readingIssue.title}
                </h2>
                <p className="text-slate-600 mt-1 font-medium">{readingIssue.subtitle}</p>
              </div>

              {/* Highlight Metrics */}
              <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">治理前实测 PUE</span>
                  <span className="text-base font-bold text-red-600">{readingIssue.pueBefore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">改造后达标 PUE</span>
                  <span className="text-base font-bold text-emerald-600">{readingIssue.pueAfter}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">年化节约电量</span>
                  <span className="text-base font-bold text-slate-900">{readingIssue.energySavedKwh}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">年规避罚款/电费</span>
                  <span className="text-base font-bold text-blue-700">{readingIssue.costSavedYuan}</span>
                </div>
              </div>

              {/* Article Content Paragraphs */}
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
                <h4 className="text-sm font-bold text-slate-900">一、背景与政策约束</h4>
                <p>
                  根据国家发展改革委及广东省工业和信息化厅能耗双控准入细则，全省既有大型及以上数据中心 PUE 须于 2026 年底前降至 1.30 以下，新建/扩建机房严格执行 1.25。对运行 PUE 超过限定标准的机房，严格实施差别化累进电价加价（每度电加价 0.10~0.25 元），并纳入限期淘汰整治清单。
                </p>

                <h4 className="text-sm font-bold text-slate-900">二、能效痛点与技术诊断</h4>
                <p>
                  针对广州南沙智算中心案例机房的现场实测，传统集中式冷冻水系统存在“大流量小温差”运行短板，末端机房气流组织紊乱，局部热点频发。运维人员为防止服务器死机，人为过度压低冷冻水供水温度至 7℃，导致冷机能耗居高不下，实测年均 PUE 达到 1.48，每年超额浪费电量达 320 万度。
                </p>

                <h4 className="text-sm font-bold text-slate-900">三、AI 智冷改造与协同调度技术路径</h4>
                <p>
                  通过在一次侧引入“间接蒸发冷自然冷却系统”，在室外湿球温度适宜时段实现 100% 免费自然冷却；同时部署 AI 机房群控系统，采集各机架进出风温度及芯片结温，自动调节末端变频风机风量与冷冻水阀开度，实现热负荷动态精准匹配。改造实施后，机房 PUE 降至 1.23，彻底达标合规。
                </p>
              </div>

              {/* Journal Table of Contents */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                <h4 className="text-xs font-bold text-blue-900">本期目录与分页索引</h4>
                <div className="space-y-1">
                  {readingIssue.keyArticles.map((art, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-blue-100/50 last:border-none">
                      <span className="text-slate-700">{art.title}</span>
                      <span className="font-mono text-slate-500">{art.author} · {art.page}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                版权所有 · 数据中心能效服务运营中心 内部专属交付刊物
              </span>
              <button
                type="button"
                onClick={() => setReadingIssue(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors"
              >
                关闭阅读
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription / Push Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>期刊订阅与推送到客户</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSubscribeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              选择目标数据中心客户的机电总监、能源采购专员或外部专家，在期刊每月出刊时通过邮件与工作台自动推送数字化专刊。
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">推送对象机构</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500">
                  <option>华南数据互联科技 · 广州南沙智算中心 (机电总监)</option>
                  <option>润泽科技集团 · 上海松江金融数据中心 (能源采购主管)</option>
                  <option>杭州钱塘新区数据中心 (运维专工)</option>
                  <option>万国数据 · 华东区机房运营团队</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">包含附件与白皮书</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                    <span>附带《数据中心 PUE 对标测算与节能改造商机卡片》</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                    <span>附带《国家绿色数据中心申报标准自查核对清单》</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubscribeModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubscribeModal(false);
                  showToast('已向所选数据中心客户成功推送《数据中心能效服务期刊》最新一期！');
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
              >
                确认推送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
