import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GLOBAL_WARRANTY_OVERVIEW,
  REGION_WARRANTY_STATS,
  CELL_MANUFACTURER_WARRANTY_STATS,
  SCENARIO_WARRANTY_STATS,
  CUSTOMER_WARRANTY_STATS,
  NETWORK_WARRANTY_12_MONTHS,
  SOH_DISTRIBUTION_RANGES,
  OVER_CONDITION_STRESS_BREAKDOWN,
  DimensionWarrantyItem
} from '../../data/mockGlobalFlexibleWarrantyStats';
import {
  ShieldCheck,
  BarChart3,
  Download,
  Filter,
  Layers,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Users,
  Cpu,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Activity,
  Thermometer,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Sliders,
  DollarSign,
  Coins,
  RefreshCw,
  FileSpreadsheet,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
  ComposedChart
} from 'recharts';

export const GlobalFlexibleWarrantyStatsView: React.FC = () => {
  const {
    navigateToFlexibleWarranty,
    navigateToBaselineConditionEval,
    setActiveTab
  } = useApp();

  const [dimension, setDimension] = useState<'region' | 'cell' | 'scenario' | 'customer'>('region');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');
  const [sortField, setSortField] = useState<string>('avgMeasuredSohPct');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Get current active dimension dataset
  const currentDimensionData: DimensionWarrantyItem[] = useMemo(() => {
    switch (dimension) {
      case 'region':
        return REGION_WARRANTY_STATS;
      case 'cell':
        return CELL_MANUFACTURER_WARRANTY_STATS;
      case 'scenario':
        return SCENARIO_WARRANTY_STATS;
      case 'customer':
        return CUSTOMER_WARRANTY_STATS;
      default:
        return REGION_WARRANTY_STATS;
    }
  }, [dimension]);

  // Filter & sort table data
  const filteredTableData = useMemo(() => {
    return currentDimensionData
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.gradeLabel.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        let valA = (a as any)[sortField];
        let valB = (b as any)[sortField];
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [currentDimensionData, searchQuery, sortField, sortOrder]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('全网 38,420 座电站灵活质保健康度指标已完成最新全量核算更新！');
    }, 700);
  };

  const handleExport = () => {
    showToast(`正在导出《全网灵活质保与SOH健康态势综合运营报告 (${selectedPeriod}).xlsx》...`);
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto animate-in fade-in duration-200 text-slate-800">
      {/* 提示条 Toast */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-emerald-600 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/80 hover:text-white font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* 顶部标题与全局筛选操作条 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">全网灵活质保统计看板</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded">
                  全网 38,420 站在册
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SOH 动态衰减与履约合规全景看板
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                全网跨大区、电芯技术路线、运行场景与重点客户的 SOH 保持率、超工况偏离预警及质保调节加收费统计
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">统计月度：</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="2026-08">2026年08月 (当期)</option>
                <option value="2026-07">2026年07月</option>
                <option value="2026-06">2026年06月</option>
                <option value="2026-Q2">2026年第二季度</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>全网重新核算</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出全网质保统计报告</span>
            </button>
          </div>
        </div>

        {/* 顶部宏观 KPI 卡片 (6 栏) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              全网质保覆盖规模
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              38,420 <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              总装机 {GLOBAL_WARRANTY_OVERVIEW.totalCapacityMw.toLocaleString()} MW
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              全网平均实测 SOH
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-lg font-bold text-indigo-700 mt-1">
              {GLOBAL_WARRANTY_OVERVIEW.avgMeasuredSohPct}%
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              优于保证底线 +{GLOBAL_WARRANTY_OVERVIEW.avgSafetyMarginPct}%
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              合同履约合规率
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-600 mt-1">
              {GLOBAL_WARRANTY_OVERVIEW.complianceRatePct}%
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              达标 37,498 站
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              超工况偏离站点数
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-lg font-bold text-rose-600 mt-1">
              {GLOBAL_WARRANTY_OVERVIEW.overConditionSitesCount} <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-rose-500 font-medium mt-0.5">
              占比 {GLOBAL_WARRANTY_OVERVIEW.overConditionRatioPct}% (高温/超频)
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              质保合同总额
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-amber-700 mt-1">
              ¥ {GLOBAL_WARRANTY_OVERVIEW.totalContractValueYuanMln} <span className="text-xs font-normal text-slate-500">百万</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              质保保证金 ¥{GLOBAL_WARRANTY_OVERVIEW.retentionDepositYuanMln}百万
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              超工况调节加收费
              <Coins className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-lg font-bold text-teal-700 mt-1">
              ¥ {GLOBAL_WARRANTY_OVERVIEW.exceedingAdjustFeeYuanMln} <span className="text-xs font-normal text-slate-500">百万</span>
            </div>
            <div className="text-[10px] text-teal-600 font-medium mt-0.5">
              超额吞吐与高温动态对冲
            </div>
          </div>
        </div>
      </div>

      {/* 维度切换控制栏 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            统计分析维度：
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDimension('region')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                dimension === 'region'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>按大区维度</span>
            </button>

            <button
              onClick={() => setDimension('cell')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                dimension === 'cell'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>按电芯与技术路线</span>
            </button>

            <button
              onClick={() => setDimension('scenario')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                dimension === 'scenario'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>按运行工况场景</span>
            </button>

            <button
              onClick={() => setDimension('customer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                dimension === 'customer'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>按重点客户集团</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateToBaselineConditionEval()}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>前往基准工况评估向导</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 图表展示区：左侧当前维度对比图 + 右侧12个月全网趋势图 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧：当前维度 SOH 保持率与合同保证底线对比 (7 栏) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {dimension === 'region'
                  ? '大区维度 SOH 保持率与安全裕度对比'
                  : dimension === 'cell'
                  ? '电芯制造商与技术路线 SOH 衰减保持对比'
                  : dimension === 'scenario'
                  ? '不同工况应用场景 SOH 保持与超工况对比'
                  : '重点电力央企客户质保履约情况对比'}
              </h3>
              <p className="text-[11px] text-slate-400">
                深蓝柱：实测平均 SOH · 红柱：合同保底 SOH · 绿折线：履约合规率 (%)
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">单位: %</span>
          </div>

          <div className="h-64 w-full bg-slate-50/40 rounded-lg p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={currentDimensionData}
                margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => (v.length > 8 ? `${v.substring(0, 8)}...` : v)}
                />
                <YAxis yAxisId="left" domain={[88, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" domain={[90, 100]} tick={{ fontSize: 10, fill: '#10b981' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'avgMeasuredSohPct'
                      ? '实测平均SOH'
                      : name === 'avgContractGuaranteeSohPct'
                      ? '合同保底SOH'
                      : '履约合规率'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="avgMeasuredSohPct"
                  name="实测平均SOH"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  yAxisId="left"
                  dataKey="avgContractGuaranteeSohPct"
                  name="合同保底SOH"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="complianceRatePct"
                  name="履约合规率 (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右侧：12 个月全网 SOH 演进与保证底线动态对比 (5 栏) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                全网近 12 个月 SOH 衰减趋势 vs 合同底线
              </h3>
              <p className="text-[11px] text-slate-400">
                深蓝线：全网实测 SOH · 红线：合同保证底线 · 黄虚线：超工况站点数
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">12 个月时序</span>
          </div>

          <div className="h-64 w-full bg-slate-50/40 rounded-lg p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={NETWORK_WARRANTY_12_MONTHS}
                margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v) => v.substring(5)}
                />
                <YAxis domain={[92, 99]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any, name: any) => [
                    name === 'overConditionSitesCount' ? `${value} 站` : `${value}%`,
                    name === 'measuredSohPct'
                      ? '全网实测SOH'
                      : name === 'contractGuaranteeSohPct'
                      ? '合同保底底线'
                      : '实验室标称'
                  ]}
                  labelFormatter={(v) => `月份: ${v}`}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                <Line
                  type="monotone"
                  dataKey="labNominalSohPct"
                  name="实验室标称"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="contractGuaranteeSohPct"
                  name="合同保证底线"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="measuredSohPct"
                  name="全网实测SOH"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SOH 分布健康梯队 与 超工况应力诱因卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SOH 分布健康阶梯 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              全网电站 SOH 分布健康阶梯
            </h3>
            <span className="text-[11px] text-slate-400">总计 38,420 座在运电站</span>
          </div>

          <div className="space-y-2">
            {SOH_DISTRIBUTION_RANGES.map((item) => {
              return (
                <div
                  key={item.range}
                  className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.status === 'EXCELLENT'
                          ? 'bg-emerald-500'
                          : item.status === 'NORMAL'
                          ? 'bg-blue-500'
                          : item.status === 'ATTENTION'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-800">{item.range}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">
                      {item.siteCount.toLocaleString()} 站
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      ({item.ratioPct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 超工况加速老化应力诱因剖析 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              超工况加速老化应力诱因剖析 (922 站)
            </h3>
            <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
              触发加收调节费 ¥4,280万
            </span>
          </div>

          <div className="space-y-2">
            {OVER_CONDITION_STRESS_BREAKDOWN.map((item) => (
              <div
                key={item.name}
                className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.description}</div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="font-mono font-bold text-slate-900">
                    {item.siteCount} 站 ({item.ratioPct}%)
                  </div>
                  <div className="font-mono text-[10px] text-rose-600 font-semibold">
                    平均压降 {item.avgSohImpactPct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 详细数据统计与排行表格 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              {dimension === 'region'
                ? '全网各大区灵活质保指标统计与履约台账'
                : dimension === 'cell'
                ? '各电芯技术路线真实工况衰减与质保排行'
                : dimension === 'scenario'
                ? '不同工况应用场景质保履约与超工况台账'
                : '重点客户集团灵活质保合同履约全景台账'}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">共 {filteredTableData.length} 项</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索名称或评级..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="avgMeasuredSohPct">按实测SOH排序</option>
              <option value="sohSafetyMarginPct">按安全裕度排序</option>
              <option value="overConditionRatioPct">按超工况比例排序</option>
              <option value="complianceRatePct">按履约合规率排序</option>
              <option value="contractValueYuanMln">按合同规模排序</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
              title="切换正倒序"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">统计维度名称</th>
                <th className="py-2.5 px-3">在册电站数</th>
                <th className="py-2.5 px-3">装机容量 (MW / MWh)</th>
                <th className="py-2.5 px-3">实测平均 SOH</th>
                <th className="py-2.5 px-3">合同保底 SOH</th>
                <th className="py-2.5 px-3">平均安全裕度</th>
                <th className="py-2.5 px-3">年化衰减率</th>
                <th className="py-2.5 px-3">超工况站点数 (比例)</th>
                <th className="py-2.5 px-3">履约合规率</th>
                <th className="py-2.5 px-3">质保合同规模</th>
                <th className="py-2.5 px-3">综合履约评级</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableData.map((row) => {
                const margin = row.sohSafetyMarginPct;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {row.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      {row.siteCount.toLocaleString()} 站
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {row.capacityMw.toLocaleString()} MW / {row.capacityMwh.toLocaleString()} MWh
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {row.avgMeasuredSohPct}%
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-600">
                      {row.avgContractGuaranteeSohPct}%
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">
                      <span className={margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {margin >= 0 ? `+${margin}%` : `${margin}%`}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {row.annualDecayRatePct}% /年
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={row.overConditionRatioPct > 3.0 ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
                        {row.overConditionCount} 站 ({row.overConditionRatioPct}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                      {row.complianceRatePct}%
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-700">
                      ¥ {row.contractValueYuanMln} 百万
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                        {row.gradeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigateToFlexibleWarranty()}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        <span>下钻监控</span>
                        <ArrowRight className="w-3 h-3" />
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
