import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  INITIAL_SITE_WARRANTY_SUMMARIES,
  SiteFlexibleWarrantySummary
} from '../../mock/flexibleWarrantyData';
import {
  downloadContractBaselineTemplate,
  downloadSohBaselineCurveTemplate,
  exportDailyConditionsToCsv,
  generateStationDailyAndMonthlyData,
  getDefaultContractBaseline
} from '../../utils/flexibleWarrantyAlgorithm';
import {
  ShieldCheck,
  Search,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Cpu,
  Layers,
  Thermometer,
  Zap,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface FlexibleWarrantyMonitorViewProps {
  onSelectSite: (siteId: string) => void;
}

export const FlexibleWarrantyMonitorView: React.FC<FlexibleWarrantyMonitorViewProps> = ({
  onSelectSite
}) => {
  const { sites, navigateToPerformanceDetail } = useApp();

  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'sohDelta' | 'excessEfc' | 'capacity' | 'score'>('sohDelta');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Merge live site names from AppContext
  const summaries: SiteFlexibleWarrantySummary[] = useMemo(() => {
    return INITIAL_SITE_WARRANTY_SUMMARIES.map(item => {
      const live = sites.find(s => s.id === item.siteId);
      if (live) {
        return {
          ...item,
          siteName: live.siteName,
          siteCode: live.siteCode,
          region: live.region,
          representativeOffice: live.representativeOffice,
          customer: live.customer,
          capacityMw: live.capacityMw
        };
      }
      return item;
    });
  }, [sites]);

  // Aggregate Metrics
  const totalSites = summaries.length;
  const totalCapacityMw = summaries.reduce((acc, s) => acc + s.capacityMw, 0);
  const totalEnergyMwh = summaries.reduce((acc, s) => acc + s.ratedEnergyMwh, 0);

  const healthyCount = summaries.filter(s => s.warrantyStatus === 'HEALTHY').length;
  const slightOverCount = summaries.filter(s => s.warrantyStatus === 'SLIGHT_OVER').length;
  const criticalOverCount = summaries.filter(s => s.warrantyStatus === 'CRITICAL_OVER').length;
  const complianceRate = totalSites > 0 ? ((healthyCount / totalSites) * 100).toFixed(1) : '100.0';

  const avgSohDelta = totalSites > 0
    ? +(summaries.reduce((acc, s) => acc + s.sohDelta, 0) / totalSites).toFixed(2)
    : 0;

  // Filtered & Sorted Data
  const filteredList = useMemo(() => {
    return summaries
      .filter(item => {
        if (regionFilter !== 'ALL' && item.region !== regionFilter) return false;
        if (statusFilter !== 'ALL' && item.warrantyStatus !== statusFilter) return false;
        if (searchTerm.trim()) {
          const key = searchTerm.toLowerCase();
          const matchName = item.siteName.toLowerCase().includes(key);
          const matchCode = item.siteCode.toLowerCase().includes(key);
          const matchCust = item.customer.toLowerCase().includes(key);
          const matchContract = item.contractNo.toLowerCase().includes(key);
          if (!matchName && !matchCode && !matchCust && !matchContract) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'sohDelta') diff = a.sohDelta - b.sohDelta;
        else if (sortField === 'excessEfc') diff = a.excessEfc - b.excessEfc;
        else if (sortField === 'capacity') diff = a.capacityMw - b.capacityMw;
        return sortAsc ? diff : -diff;
      });
  }, [summaries, regionFilter, statusFilter, searchTerm, sortField, sortAsc]);

  const handleExportSiteDaily = (summary: SiteFlexibleWarrantySummary, e: React.MouseEvent) => {
    e.stopPropagation();
    const { daily } = generateStationDailyAndMonthlyData(
      summary.siteId,
      getDefaultContractBaseline(summary.siteId, summary.ratedEnergyMwh)
    );
    exportDailyConditionsToCsv(daily, summary.siteName);
  };

  return (
    <div className="space-y-5 p-4 max-w-[1700px] mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. Header Banner & Action Center */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-900/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_right,_rgba(16,185,129,0.15),_transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono tracking-wider">
                FLEXIBLE WARRANTY PLATFORM
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700">
                算法模型: v3.4.2 在线
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              全网储能电站灵活质保工况管理大盘
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              基于站点合同基准工况、实际运行工况日志与超工况量化分析，统一换算站级指标并调用算法团队提供的灵活质保 SOH 估算算法接口，生成 SOH 基准衰减与灵活质保双衰减曲线，支持按月工况台账统计与按天全量数据导出。
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={downloadContractBaselineTemplate}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm backdrop-blur-xs"
              title="下载标准合同基准工况录入与导入CSV模板"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span>合同基准模板</span>
            </button>

            <button
              onClick={downloadSohBaselineCurveTemplate}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm backdrop-blur-xs"
              title="下载标准SOH基准衰减曲线打点录入与导入CSV模板"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>SOH曲线模板</span>
            </button>

            <div className="h-6 w-px bg-white/20 hidden sm:block mx-1" />

            <button
              onClick={() => {
                const { daily } = generateStationDailyAndMonthlyData(
                  'site-all',
                  getDefaultContractBaseline('site-all', 40.0)
                );
                exportDailyConditionsToCsv(daily, '全网站点灵活质保日工况台账');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-900/40 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>批量导出站级日工况 (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: 纳入质保站点 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>纳保站点 / 总容量</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalSites}</span>
            <span className="text-xs text-slate-500">座</span>
            <span className="text-xs font-semibold text-slate-700 font-mono ml-auto">
              {totalCapacityMw} MW / {totalEnergyMwh} MWh
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% 具备合同基准与SOH曲线</div>
        </div>

        {/* Card 2: 质保履约达标率 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>质保SOH达标率</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 font-mono">{complianceRate}%</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
              {healthyCount} 站安全
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">SOH估算值 ≥ 基准衰减线</div>
        </div>

        {/* Card 3: 超工况预警站点 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>超工况预警站点</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {slightOverCount + criticalOverCount}
            </span>
            <span className="text-xs text-slate-500">座</span>
            {criticalOverCount > 0 && (
              <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-1 rounded ml-auto">
                {criticalOverCount} 站严重
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">需发起工况核算或质保复议</div>
        </div>

        {/* Card 4: 全网平均SOH偏离度 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>平均SOH裕度 (ΔSOH)</span>
            {avgSohDelta >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black font-mono ${
                avgSohDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {avgSohDelta >= 0 ? `+${avgSohDelta}%` : `${avgSohDelta}%`}
            </span>
            <span className="text-[10px] text-slate-500 ml-auto">vs 合同基准线</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">灵活工况整体衰减健康度</div>
        </div>

        {/* Card 5: 算法团队估算引擎 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>算法接口状态</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Arrhenius 疲劳模型</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">支持多因子加速老化与打点外推</div>
        </div>

        {/* Card 6: 颗粒度支持 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
            <span>统计与导出</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-900">按月表格 / 按天导出</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">PACK级换算 ➔ 站级综合台账</div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索站点名称、编码、合同号、客户..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Region filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">区域:</span>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">全部区域</option>
              <option value="华南区">华南区</option>
              <option value="华东区">华东区</option>
              <option value="华北区">华北区</option>
              <option value="西北区">西北区</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">质保状态:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">全部状态</option>
              <option value="HEALTHY">达标受保 (正常)</option>
              <option value="SLIGHT_OVER">轻度超工况 (预警)</option>
              <option value="CRITICAL_OVER">严重超工况 (风险)</option>
            </select>
          </div>

          {/* Sort filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">排序:</span>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="sohDelta">SOH偏差幅度</option>
              <option value="excessEfc">超额EFC循环</option>
              <option value="capacity">装机容量</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"
              title="切换升降序"
            >
              {sortAsc ? '升序 ↑' : '降序 ↓'}
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          已筛选 <strong className="text-slate-800">{filteredList.length}</strong> / {totalSites} 座站点
        </div>
      </div>

      {/* 4. All Sites Flexible Warranty Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">储能电站灵活质保履约与衰减对比台账</h3>
            <span className="text-xs text-slate-400">
              (点击任意站点行直接进入该站点【灵活质保详情工作台】)
            </span>
          </div>
          <div className="text-xs text-slate-500">
            基准与灵活双衰减外推对比 · PACK换算 ➔ 站级
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">站点基本信息</th>
                <th className="py-3 px-3 min-w-[150px]">质保合同 & 周期</th>
                <th className="py-3 px-3 min-w-[150px]">合同基准工况约定</th>
                <th className="py-3 px-3 min-w-[150px]">实际运行工况统计</th>
                <th className="py-3 px-3 min-w-[160px]">超工况指标核算</th>
                <th className="py-3 px-3 min-w-[170px]">SOH双衰减打点对比</th>
                <th className="py-3 px-3 min-w-[130px]">质保履约状态</th>
                <th className="py-3 px-4 text-center min-w-[180px]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(item => {
                const isHealthy = item.warrantyStatus === 'HEALTHY';
                const isCritical = item.warrantyStatus === 'CRITICAL_OVER';

                return (
                  <tr
                    key={item.siteId}
                    onClick={() => onSelectSite(item.siteId)}
                    className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Site Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.siteName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 font-mono text-slate-600">
                          {item.siteCode}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.region} / {item.representativeOffice}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        客户: <span className="text-slate-600">{item.customer}</span> ·{' '}
                        <strong className="text-slate-700 font-mono">{item.capacityMw} MW</strong> /{' '}
                        <strong className="text-slate-700 font-mono">{item.ratedEnergyMwh} MWh</strong>
                      </div>
                    </td>

                    {/* Contract & Period */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-800 font-medium">{item.contractNo}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.warrantyStartDate} ~ {item.warrantyEndDate}
                      </div>
                      <span className="inline-block mt-1 px-1.5 py-0.2 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded">
                        质保年限: {item.warrantyYears}年
                      </span>
                    </td>

                    {/* Baseline */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-700">
                        年基准EFC:{' '}
                        <strong className="font-mono text-slate-900">{item.annualBaselineEfc}</strong> 次
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        限额倍率: <span className="font-mono">{item.maxCrate} C</span> · 温限:{' '}
                        <span className="font-mono">≤{item.baselineTempMax}℃</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        EOL保证: <span className="font-mono font-bold text-slate-700">{item.finalGuaranteedSoh}%</span>
                      </div>
                    </td>

                    {/* Actual */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-mono">
                        累计EFC: <strong className="font-bold text-slate-900">{item.actualCumulativeEfc}</strong> 次
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        吞吐: {item.actualThroughputMwh.toLocaleString()} MWh
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                        <Thermometer className="w-3 h-3 text-slate-400" />
                        <span>均温 {item.actualAvgTemp}℃</span> /{' '}
                        <span className={item.actualMaxTemp > item.baselineTempMax ? 'text-amber-600 font-bold' : ''}>
                          最高 {item.actualMaxTemp}℃
                        </span>
                      </div>
                    </td>

                    {/* Over Condition */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">超额EFC:</span>
                        <span
                          className={`font-mono font-bold ${
                            item.excessEfc > 0 ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          +{item.excessEfc} 次
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        超温时长:{' '}
                        <span className={item.overTempHours > 0 ? 'text-amber-600 font-mono font-semibold' : 'text-slate-400'}>
                          {item.overTempHours} h ({item.overTempDegreeHours}℃·h)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        超倍率吞吐: <span className="font-mono">{item.overCrateThroughputMwh} MWh</span>
                      </div>
                    </td>

                    {/* SOH Comparison */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block">基准保证</span>
                          <span className="font-mono font-bold text-blue-600">
                            {item.currentBaselineSoh}%
                          </span>
                        </div>
                        <span className="text-slate-300">➔</span>
                        <div>
                          <span className="text-[10px] text-slate-400 block">灵活估算</span>
                          <span
                            className={`font-mono font-bold ${
                              item.sohDelta >= 0
                                ? 'text-emerald-600'
                                : isCritical
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {item.currentFlexibleSoh}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            item.sohDelta >= 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isCritical
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          ΔSOH {item.sohDelta >= 0 ? `+${item.sohDelta}%` : `${item.sohDelta}%`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          EOL预估: {item.estimatedEndLifeSoh}%
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ${
                          isHealthy
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isCritical
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isHealthy ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`}
                          />
                        )}
                        <span>
                          {isHealthy ? '达标受保' : isCritical ? '严重超工况' : '轻度超工况'}
                        </span>
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1" title={item.warrantyStatusLabel}>
                        {item.warrantyStatusLabel}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectSite(item.siteId);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                          title="进入该站点的灵活质保工况评估详情工作台"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>质保详情</span>
                        </button>

                        <button
                          onClick={e => handleExportSiteDaily(item, e)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
                          title="按天导出该站点全量工况与超工况CSV"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        </button>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            navigateToPerformanceDetail(item.siteId);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
                          title="联动查看该站点的性能工况体检详情"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      </div>
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
