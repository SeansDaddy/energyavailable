import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SitePerformanceConditionSummary,
  INITIAL_SITE_PERFORMANCE_SUMMARIES
} from '../../mock/sitePerformanceConditionData';
import {
  HeartPulse,
  Calendar,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  Thermometer,
  Zap,
  Activity,
  ArrowUpDown,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Filter
} from 'lucide-react';

interface PerformanceMonitorViewProps {
  onSelectSite: (siteId: string) => void;
}

export const PerformanceMonitorView: React.FC<PerformanceMonitorViewProps> = ({
  onSelectSite
}) => {
  const { sites } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [bottleneckFilter, setBottleneckFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'score' | 'deltaV' | 'deltaT' | 'soh'>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(true); // score ascending puts risk sites first

  // Merge with any dynamic sites from AppContext if available
  const allSummaries: SitePerformanceConditionSummary[] = useMemo(() => {
    return INITIAL_SITE_PERFORMANCE_SUMMARIES.map(summary => {
      const liveSite = sites.find(s => s.id === summary.siteId);
      if (liveSite) {
        return {
          ...summary,
          siteName: liveSite.siteName,
          siteCode: liveSite.siteCode,
          region: liveSite.region,
          representativeOffice: liveSite.representativeOffice,
          customer: liveSite.customer,
          capacityMw: liveSite.capacityMw
        };
      }
      return summary;
    });
  }, [sites]);

  // 1. Core Summary Metrics
  const totalSites = allSummaries.length;
  const totalCapacityMw = allSummaries.reduce((sum, s) => sum + (s.capacityMw || 0), 0);

  const avgHealthScore =
    totalSites > 0
      ? Number((allSummaries.reduce((sum, s) => sum + s.overallScore, 0) / totalSites).toFixed(1))
      : 0;

  const weightedAvgScore =
    totalCapacityMw > 0
      ? Number(
          (
            allSummaries.reduce((sum, s) => sum + s.overallScore * (s.capacityMw || 0), 0) /
            totalCapacityMw
          ).toFixed(1)
        )
      : avgHealthScore;

  // Grade distributions
  const excellentCount = allSummaries.filter(s => s.grade === 'EXCELLENT').length;
  const goodCount = allSummaries.filter(s => s.grade === 'GOOD').length;
  const mediumCount = allSummaries.filter(s => s.grade === 'MEDIUM').length;
  const riskyCount = allSummaries.filter(s => s.grade === 'RISKY').length;

  const highQualityRate =
    totalSites > 0
      ? Number((((excellentCount + goodCount) / totalSites) * 100).toFixed(1))
      : 0;

  const attentionSitesCount = mediumCount + riskyCount;

  // Key bottleneck counts across all sites
  const deltaVExceedCount = allSummaries.filter(s => s.maxVoltageDeltaMv > 45).length;
  const deltaTExceedCount = allSummaries.filter(s => s.maxCmuDeltaT > 3.5).length;
  const abnormalPackSitesCount = allSummaries.filter(s => s.abnormalPackCount > 0).length;
  const unbalanceSocCount = allSummaries.filter(s => s.deltaSocPct > 4.0).length;

  const totalPendingActions = allSummaries.reduce((sum, s) => sum + s.pendingActionsCount, 0);
  const totalCriticalActions = allSummaries.reduce((sum, s) => sum + s.criticalActionsCount, 0);

  // Averages for module & thermal
  const avgMaxDeltaV =
    totalSites > 0
      ? Number(
          (allSummaries.reduce((sum, s) => sum + s.maxVoltageDeltaMv, 0) / totalSites).toFixed(1)
        )
      : 0;

  const avgMaxDeltaT =
    totalSites > 0
      ? Number(
          (allSummaries.reduce((sum, s) => sum + s.maxCmuDeltaT, 0) / totalSites).toFixed(1)
        )
      : 0;

  const regionList = Array.from(new Set(allSummaries.map(s => s.region)));

  // Filtered & Sorted Sites for Table
  const filteredSites = useMemo(() => {
    return allSummaries
      .filter(s => {
        if (regionFilter !== 'ALL' && s.region !== regionFilter) return false;
        if (gradeFilter !== 'ALL' && s.grade !== gradeFilter) return false;
        if (bottleneckFilter === 'VOLTAGE' && s.maxVoltageDeltaMv <= 45) return false;
        if (bottleneckFilter === 'THERMAL' && s.maxCmuDeltaT <= 3.5) return false;
        if (bottleneckFilter === 'SOH' && s.abnormalPackCount === 0) return false;
        if (bottleneckFilter === 'SOC' && s.deltaSocPct <= 4.0) return false;

        if (searchTerm) {
          const match =
            s.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.siteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.bottleneckModuleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.topBottleneckFactor.toLowerCase().includes(searchTerm.toLowerCase());
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'score') {
          diff = a.overallScore - b.overallScore;
        } else if (sortField === 'deltaV') {
          diff = a.maxVoltageDeltaMv - b.maxVoltageDeltaMv;
        } else if (sortField === 'deltaT') {
          diff = a.maxCmuDeltaT - b.maxCmuDeltaT;
        } else if (sortField === 'soh') {
          diff = a.minPackSoh - b.minPackSoh;
        }
        return sortAsc ? diff : -diff;
      });
  }, [allSummaries, regionFilter, gradeFilter, bottleneckFilter, searchTerm, sortField, sortAsc]);

  const toggleSort = (field: 'score' | 'deltaV' | 'deltaT' | 'soh') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'score' ? true : false); // default score asc to see risk first, others desc
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              各站点核心性能工况监控
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
              13类性能影响因子 · 短板木桶效应
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            基于储能电站实时运行与离线日志，动态诊断各站综合健康度得分、模组压差、CMU温差及PACK衰减瓶颈，点击站点可深入查看详情。
          </p>
        </div>

        {/* Evaluation Period Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-500">评估考核期:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-50 font-bold text-indigo-700 rounded px-2 py-0.5 border border-slate-200 focus:outline-none"
            >
              <option value="2026-08">2026-08 (最新体检)</option>
              <option value="2026-07">2026-07 (上期历史)</option>
              <option value="2026-06">2026-06 (基线评估)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Core Network Performance Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Network Average Health Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">全网综合健康指数</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {avgHealthScore}
            </span>
            <span className="text-xs font-bold text-slate-500">分</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              +1.8分 (环比改善)
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              优良率 (≥80分): <strong className="text-slate-700 font-mono">{highQualityRate}%</strong>
            </span>
            <span>
              容量加权分: <strong className="text-indigo-600 font-mono">{weightedAvgScore}分</strong>
            </span>
          </div>
        </div>

        {/* Metric Card 2: Performance Grade Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">性能工况等级分布</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <button
              onClick={() => setGradeFilter(gradeFilter === 'EXCELLENT' ? 'ALL' : 'EXCELLENT')}
              className={`flex-1 py-1 px-1.5 rounded border text-center transition-all ${
                gradeFilter === 'EXCELLENT'
                  ? 'bg-emerald-100 border-emerald-400 font-bold'
                  : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/60'
              }`}
              title="点击按优良(≥90分)筛选"
            >
              <div className="text-[10px] text-emerald-700 font-medium">🟢 优良</div>
              <div className="text-sm font-bold text-emerald-800 font-mono">{excellentCount}</div>
            </button>
            <button
              onClick={() => setGradeFilter(gradeFilter === 'GOOD' ? 'ALL' : 'GOOD')}
              className={`flex-1 py-1 px-1.5 rounded border text-center transition-all ${
                gradeFilter === 'GOOD'
                  ? 'bg-blue-100 border-blue-400 font-bold'
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100/60'
              }`}
              title="点击按良好(80-89分)筛选"
            >
              <div className="text-[10px] text-blue-700 font-medium">🔵 良好</div>
              <div className="text-sm font-bold text-blue-800 font-mono">{goodCount}</div>
            </button>
            <button
              onClick={() => setGradeFilter(gradeFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
              className={`flex-1 py-1 px-1.5 rounded border text-center transition-all ${
                gradeFilter === 'MEDIUM'
                  ? 'bg-amber-100 border-amber-400 font-bold'
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100/60'
              }`}
              title="点击按关注(70-79分)筛选"
            >
              <div className="text-[10px] text-amber-700 font-medium">🟡 关注</div>
              <div className="text-sm font-bold text-amber-800 font-mono">{mediumCount}</div>
            </button>
            <button
              onClick={() => setGradeFilter(gradeFilter === 'RISKY' ? 'ALL' : 'RISKY')}
              className={`flex-1 py-1 px-1.5 rounded border text-center transition-all ${
                gradeFilter === 'RISKY'
                  ? 'bg-red-100 border-red-400 font-bold'
                  : 'bg-red-50 border-red-200 hover:bg-red-100/60'
              }`}
              title="点击按风险(<70分)筛选"
            >
              <div className="text-[10px] text-red-700 font-medium">🔴 风险</div>
              <div className="text-sm font-bold text-red-800 font-mono">{riskyCount}</div>
            </button>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>重点需治理短板站:</span>
            <strong className={attentionSitesCount > 0 ? 'text-amber-600' : 'text-slate-700'}>
              {attentionSitesCount} 站 ({totalSites > 0 ? ((attentionSitesCount / totalSites) * 100).toFixed(0) : 0}%)
            </strong>
          </div>
        </div>

        {/* Metric Card 3: Key Bottleneck Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">核心制约短板因子</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-1 text-[11px]">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-center">
              <div className="text-slate-500 text-[10px]">模组压差</div>
              <div className="font-bold text-slate-900 font-mono text-xs">{deltaVExceedCount} 站</div>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-center">
              <div className="text-slate-500 text-[10px]">CMU温差</div>
              <div className="font-bold text-slate-900 font-mono text-xs">{deltaTExceedCount} 站</div>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-center">
              <div className="text-slate-500 text-[10px]">SOH异常</div>
              <div className="font-bold text-slate-900 font-mono text-xs">{abnormalPackSitesCount} 站</div>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-1.5 text-center">
              <div className="text-slate-500 text-[10px]">SOC失衡</div>
              <div className="font-bold text-slate-900 font-mono text-xs">{unbalanceSocCount} 站</div>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>待处理消缺动作:</span>
            <span className="font-semibold text-red-600 font-mono">
              {totalCriticalActions} 项紧急 · {totalPendingActions - totalCriticalActions} 项一般
            </span>
          </div>
        </div>

        {/* Metric Card 4: Module & Thermal Condition Health */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">模组与热工况基线</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-500">平均最大压差</div>
              <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                {avgMaxDeltaV} <span className="text-xs font-normal text-slate-500">mV</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">平均最大温差</div>
              <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                {avgMaxDeltaT} <span className="text-xs font-normal text-slate-500">℃</span>
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>PACK SOH 达标率:</span>
            <span className="font-semibold text-emerald-600 font-mono">
              {(((totalSites - abnormalPackSitesCount) / totalSites) * 100).toFixed(0)}% (7/8 站正常)
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">区域选择:</span>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">全部区域 ({totalSites} 站)</option>
              {regionList.map(r => (
                <option key={r} value={r}>
                  {r} ({allSummaries.filter(s => s.region === r).length} 站)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">工况等级:</span>
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">全部等级 ({totalSites})</option>
              <option value="EXCELLENT">🟢 优良 (≥90分) - {excellentCount} 站</option>
              <option value="GOOD">🔵 良好 (80~89分) - {goodCount} 站</option>
              <option value="MEDIUM">🟡 关注 (70~79分) - {mediumCount} 站</option>
              <option value="RISKY">🔴 风险 (&lt;70分) - {riskyCount} 站</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">制约短板:</span>
            <select
              value={bottleneckFilter}
              onChange={e => setBottleneckFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">全部短板类型</option>
              <option value="VOLTAGE">⚡ 模组压差超标 (&gt;45mV)</option>
              <option value="THERMAL">🌡️ CMU温差偏大 (&gt;3.5℃)</option>
              <option value="SOH">🔋 PACK SOH异常 (&lt;90%)</option>
              <option value="SOC">⚖️ SOC明显不均衡 (&gt;4%)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索站点名称 / 编码 / 短板模组..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 w-60 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {(regionFilter !== 'ALL' ||
            gradeFilter !== 'ALL' ||
            bottleneckFilter !== 'ALL' ||
            searchTerm) && (
            <button
              onClick={() => {
                setRegionFilter('ALL');
                setGradeFilter('ALL');
                setBottleneckFilter('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 underline font-medium"
            >
              重置筛选
            </button>
          )}
        </div>

        <span className="text-slate-500">
          共筛选出 <strong className="text-indigo-600 font-semibold">{filteredSites.length}</strong> / {totalSites} 个性能工况监控站点
        </span>
      </div>

      {/* Sites Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-4">站点名称 / 编码</th>
                <th className="py-3 px-3">区域 / 代表处</th>
                <th
                  onClick={() => toggleSort('score')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>综合体检得分</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">工况评级</th>
                <th
                  onClick={() => toggleSort('deltaV')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>模组最大极差 ΔV</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('deltaT')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CMU最大温差 ΔT</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('soh')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>最低 PACK SOH</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">ΔSOC不均衡</th>
                <th className="py-3 px-3">因子命中</th>
                <th className="py-3 px-3">待消缺建议</th>
                <th className="py-3 px-3">最新评估版本</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSites.map(s => {
                const isGradeExcellent = s.grade === 'EXCELLENT';
                const isGradeGood = s.grade === 'GOOD';
                const isGradeMedium = s.grade === 'MEDIUM';
                const isGradeRisky = s.grade === 'RISKY';

                return (
                  <tr
                    key={s.siteId}
                    onClick={() => onSelectSite(s.siteId)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Site Name & Code */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {s.siteName}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-indigo-600 font-mono">{s.siteCode}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({s.capacityMw} MW)</span>
                      </div>
                    </td>

                    {/* Region */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{s.region}</div>
                      <div className="text-[11px] text-slate-500">{s.representativeOffice}</div>
                    </td>

                    {/* Overall Score */}
                    <td className="py-3 px-3 font-mono font-bold text-base">
                      <span
                        className={
                          isGradeRisky
                            ? 'text-red-600'
                            : isGradeMedium
                            ? 'text-amber-600'
                            : isGradeGood
                            ? 'text-blue-600'
                            : 'text-emerald-600'
                        }
                      >
                        {s.overallScore}
                        <span className="text-xs font-normal text-slate-400 ml-0.5">分</span>
                      </span>
                    </td>

                    {/* Grade Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          isGradeRisky
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isGradeMedium
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isGradeGood
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isGradeRisky && '🔴 风险'}
                        {isGradeMedium && '🟡 关注'}
                        {isGradeGood && '🔵 良好'}
                        {isGradeExcellent && '🟢 优良'}
                      </span>
                    </td>

                    {/* Module Max Voltage Delta */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
                            s.maxVoltageDeltaMv > 60
                              ? 'text-red-600 font-bold'
                              : s.maxVoltageDeltaMv > 30
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {s.maxVoltageDeltaMv} mV
                        </span>
                        <span className="text-[10px] px-1 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {s.bottleneckModuleCode}
                        </span>
                      </div>
                    </td>

                    {/* CMU Max Delta T */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
                            s.maxCmuDeltaT > 4.0
                              ? 'text-red-600 font-bold'
                              : s.maxCmuDeltaT > 2.5
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          ΔT {s.maxCmuDeltaT} ℃
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (最高 {s.maxCmuTemp}℃)
                        </span>
                      </div>
                    </td>

                    {/* Min Pack SOH */}
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-semibold ${
                            s.minPackSoh < 90 ? 'text-red-600 font-bold' : 'text-emerald-600'
                          }`}
                        >
                          {s.minPackSoh}%
                        </span>
                        {s.abnormalPackCount > 0 ? (
                          <span className="text-[10px] text-red-500 bg-red-50 px-1 rounded border border-red-100">
                            {s.abnormalPackCount}组超标
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600">达标</span>
                        )}
                      </div>
                    </td>

                    {/* Delta SOC */}
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={
                          s.deltaSocPct > 5.0
                            ? 'text-amber-600 font-semibold'
                            : 'text-slate-700'
                        }
                      >
                        {s.deltaSocPct}%
                      </span>
                    </td>

                    {/* Hit Factors Count */}
                    <td className="py-3 px-3 font-mono">
                      {s.hitFactorsCount > 0 ? (
                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                          {s.hitFactorsCount} / {s.totalFactorsCount}
                        </span>
                      ) : (
                        <span className="text-emerald-600">0 命中</span>
                      )}
                    </td>

                    {/* Pending Actions */}
                    <td className="py-3 px-3">
                      {s.pendingActionsCount > 0 ? (
                        <span className="text-xs">
                          {s.criticalActionsCount > 0 && (
                            <strong className="text-red-600 mr-1">
                              {s.criticalActionsCount}项紧急
                            </strong>
                          )}
                          <span className="text-slate-600">
                            {s.pendingActionsCount - s.criticalActionsCount}项一般
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">无需消缺</span>
                      )}
                    </td>

                    {/* Last Evaluation Time / Version */}
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      <div>{s.versionNo}</div>
                      <div className="text-[10px] text-slate-400">{s.lastEvaluatedTime}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectSite(s.siteId);
                        }}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-all inline-flex items-center gap-1 text-xs shadow-2xs group"
                        title="查看该站点性能工况详情"
                        aria-label="查看详情"
                      >
                        <Eye className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline font-medium text-slate-700 group-hover:text-indigo-700">
                          查看详情
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
