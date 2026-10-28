import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Filter,
  Layers,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Building2,
  Users,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  BatteryCharging,
  Activity,
  Flame,
  Scale,
  Thermometer,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Sliders,
  FileSpreadsheet,
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

export const GlobalPerformanceStatsView: React.FC = () => {
  const {
    sites,
    navigateToPerformanceDetail,
    navigateToPerformanceMonitor,
    setActiveTab,
    addReportItem
  } = useApp();

  const [dimension, setDimension] = useState<'region' | 'repOffice' | 'customer' | 'model'>('region');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-08');
  const [sortField, setSortField] = useState<string>('overallScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 1. 大区维度数据 (数万级站点统计)
  const regionPerformanceStats = [
    {
      name: '华东区',
      siteCount: 14200,
      capacityMw: 18450,
      overallScore: 91.2,
      gradeLabel: '优良 (标杆区)',
      avgRtePct: 87.85,
      avgSohPct: 95.40,
      avgAucRetentionPct: 98.80,
      avgMaxDeltaT: 3.2,
      avgMaxDeltaVm: 28,
      overConditionCount: 280,
      complianceRatePct: 98.6,
      gridLossPct: 1.22
    },
    {
      name: '华南区',
      siteCount: 11800,
      capacityMw: 15200,
      overallScore: 88.4,
      gradeLabel: '良好 (局部高温)',
      avgRtePct: 87.42,
      avgSohPct: 94.65,
      avgAucRetentionPct: 98.15,
      avgMaxDeltaT: 4.5,
      avgMaxDeltaVm: 42,
      overConditionCount: 460,
      complianceRatePct: 96.8,
      gridLossPct: 1.28
    },
    {
      name: '华北区',
      siteCount: 7600,
      capacityMw: 9800,
      overallScore: 89.6,
      gradeLabel: '良好 (平稳运行)',
      avgRtePct: 87.60,
      avgSohPct: 94.90,
      avgAucRetentionPct: 98.40,
      avgMaxDeltaT: 3.6,
      avgMaxDeltaVm: 34,
      overConditionCount: 290,
      complianceRatePct: 97.4,
      gridLossPct: 1.34
    },
    {
      name: '西北区',
      siteCount: 4820,
      capacityMw: 7150,
      overallScore: 82.5,
      gradeLabel: '关注 (风沙大温差)',
      avgRtePct: 86.80,
      avgSohPct: 93.40,
      avgAucRetentionPct: 97.20,
      avgMaxDeltaT: 5.6,
      avgMaxDeltaVm: 64,
      overConditionCount: 390,
      complianceRatePct: 92.8,
      gridLossPct: 1.45
    }
  ];

  // 2. 代表处维度数据
  const repOfficePerformanceStats = [
    {
      name: '上海代表处',
      siteCount: 5400,
      capacityMw: 7020,
      overallScore: 92.4,
      gradeLabel: '优良',
      avgRtePct: 88.10,
      avgSohPct: 95.80,
      avgAucRetentionPct: 99.10,
      avgMaxDeltaT: 2.8,
      avgMaxDeltaVm: 24,
      overConditionCount: 90,
      complianceRatePct: 99.2,
      gridLossPct: 1.18
    },
    {
      name: '深圳代表处',
      siteCount: 6200,
      capacityMw: 8060,
      overallScore: 89.2,
      gradeLabel: '良好',
      avgRtePct: 87.55,
      avgSohPct: 94.80,
      avgAucRetentionPct: 98.30,
      avgMaxDeltaT: 4.2,
      avgMaxDeltaVm: 38,
      overConditionCount: 240,
      complianceRatePct: 97.5,
      gridLossPct: 1.26
    },
    {
      name: '南京代表处',
      siteCount: 4800,
      capacityMw: 6240,
      overallScore: 90.6,
      gradeLabel: '优良',
      avgRtePct: 87.75,
      avgSohPct: 95.20,
      avgAucRetentionPct: 98.70,
      avgMaxDeltaT: 3.3,
      avgMaxDeltaVm: 30,
      overConditionCount: 110,
      complianceRatePct: 98.4,
      gridLossPct: 1.24
    },
    {
      name: '北京代表处',
      siteCount: 3900,
      capacityMw: 5070,
      overallScore: 90.1,
      gradeLabel: '优良',
      avgRtePct: 87.70,
      avgSohPct: 95.10,
      avgAucRetentionPct: 98.50,
      avgMaxDeltaT: 3.4,
      avgMaxDeltaVm: 32,
      overConditionCount: 130,
      complianceRatePct: 97.9,
      gridLossPct: 1.30
    },
    {
      name: '广州代表处',
      siteCount: 4100,
      capacityMw: 5330,
      overallScore: 87.6,
      gradeLabel: '良好',
      avgRtePct: 87.30,
      avgSohPct: 94.45,
      avgAucRetentionPct: 98.00,
      avgMaxDeltaT: 4.8,
      avgMaxDeltaVm: 46,
      overConditionCount: 180,
      complianceRatePct: 96.2,
      gridLossPct: 1.31
    },
    {
      name: '乌鲁木齐代表处',
      siteCount: 2820,
      capacityMw: 4180,
      overallScore: 81.8,
      gradeLabel: '关注',
      avgRtePct: 86.65,
      avgSohPct: 93.10,
      avgAucRetentionPct: 96.90,
      avgMaxDeltaT: 5.8,
      avgMaxDeltaVm: 68,
      overConditionCount: 230,
      complianceRatePct: 92.1,
      gridLossPct: 1.48
    }
  ];

  // 3. 客户维度数据
  const customerPerformanceStats = [
    {
      name: '国家电网有限公司',
      siteCount: 14600,
      capacityMw: 18980,
      overallScore: 91.5,
      gradeLabel: '优良',
      avgRtePct: 87.90,
      avgSohPct: 95.50,
      avgAucRetentionPct: 98.90,
      avgMaxDeltaT: 3.1,
      avgMaxDeltaVm: 26,
      overConditionCount: 270,
      complianceRatePct: 98.8,
      gridLossPct: 1.20
    },
    {
      name: '中国南方电网有限责任公司',
      siteCount: 11200,
      capacityMw: 14560,
      overallScore: 88.2,
      gradeLabel: '良好',
      avgRtePct: 87.40,
      avgSohPct: 94.60,
      avgAucRetentionPct: 98.10,
      avgMaxDeltaT: 4.6,
      avgMaxDeltaVm: 44,
      overConditionCount: 420,
      complianceRatePct: 96.5,
      gridLossPct: 1.27
    },
    {
      name: '国家能源投资集团',
      siteCount: 6800,
      capacityMw: 8840,
      overallScore: 87.1,
      gradeLabel: '良好',
      avgRtePct: 87.25,
      avgSohPct: 94.30,
      avgAucRetentionPct: 97.90,
      avgMaxDeltaT: 4.7,
      avgMaxDeltaVm: 48,
      overConditionCount: 310,
      complianceRatePct: 95.8,
      gridLossPct: 1.35
    },
    {
      name: '中国三峡新能源集团',
      siteCount: 5820,
      capacityMw: 6220,
      overallScore: 89.8,
      gradeLabel: '优良',
      avgRtePct: 87.65,
      avgSohPct: 95.05,
      avgAucRetentionPct: 98.60,
      avgMaxDeltaT: 3.5,
      avgMaxDeltaVm: 32,
      overConditionCount: 180,
      complianceRatePct: 98.1,
      gridLossPct: 1.25
    }
  ];

  // 4. 设备系统架构与电池型号维度数据
  const modelPerformanceStats = [
    {
      name: '3.44MWh 液冷集装箱储能系统',
      siteCount: 16800,
      capacityMw: 21840,
      overallScore: 90.8,
      gradeLabel: '优良',
      avgRtePct: 87.95,
      avgSohPct: 95.30,
      avgAucRetentionPct: 98.85,
      avgMaxDeltaT: 3.2,
      avgMaxDeltaVm: 28,
      overConditionCount: 340,
      complianceRatePct: 98.5,
      gridLossPct: 1.23
    },
    {
      name: '5.0MWh 高密液冷电池舱 (新一代)',
      siteCount: 9400,
      capacityMw: 14100,
      overallScore: 92.6,
      gradeLabel: '标杆',
      avgRtePct: 88.40,
      avgSohPct: 96.10,
      avgAucRetentionPct: 99.20,
      avgMaxDeltaT: 2.6,
      avgMaxDeltaVm: 22,
      overConditionCount: 110,
      complianceRatePct: 99.4,
      gridLossPct: 1.16
    },
    {
      name: '2.5MW 集中式 PCS 储能架构',
      siteCount: 8200,
      capacityMw: 9840,
      overallScore: 87.4,
      gradeLabel: '良好',
      avgRtePct: 87.20,
      avgSohPct: 94.40,
      avgAucRetentionPct: 98.00,
      avgMaxDeltaT: 4.4,
      avgMaxDeltaVm: 42,
      overConditionCount: 380,
      complianceRatePct: 96.4,
      gridLossPct: 1.32
    },
    {
      name: '存量风冷集装箱储能系统 (老旧改造)',
      siteCount: 4020,
      capacityMw: 2820,
      overallScore: 78.5,
      gradeLabel: '关注',
      avgRtePct: 85.40,
      avgSohPct: 91.80,
      avgAucRetentionPct: 95.60,
      avgMaxDeltaT: 6.8,
      avgMaxDeltaVm: 78,
      overConditionCount: 590,
      complianceRatePct: 89.2,
      gridLossPct: 1.58
    }
  ];

  // Select active stats array
  const rawStatsList = useMemo(() => {
    switch (dimension) {
      case 'region':
        return regionPerformanceStats;
      case 'repOffice':
        return repOfficePerformanceStats;
      case 'customer':
        return customerPerformanceStats;
      case 'model':
        return modelPerformanceStats;
      default:
        return regionPerformanceStats;
    }
  }, [dimension]);

  // Filter and sort
  const displayStatsList = useMemo(() => {
    return rawStatsList
      .filter(item =>
        searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
      .sort((a: any, b: any) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [rawStatsList, searchQuery, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // High Risk Top 3 Sites
  const topRiskSites = [
    {
      siteId: 'site-001',
      siteName: '深圳光明储能电站二期-04号站',
      siteCode: 'SZ-ESS-0042',
      region: '华南区',
      overallScore: 78.0,
      rtePct: 86.8,
      minPackSoh: 88.4,
      maxDeltaVm: 68,
      maxDeltaT: 4.8,
      riskReason: 'M02-04 模组放电截止压降陡增 & 顶层电芯局部超温 38.6℃'
    },
    {
      siteId: 'site-003',
      siteName: '河西风光基地集中式储能1号站',
      siteCode: 'GS-ESS-0012',
      region: '西北区',
      overallScore: 81.2,
      rtePct: 86.5,
      minPackSoh: 89.2,
      maxDeltaVm: 62,
      maxDeltaT: 5.4,
      riskReason: '频繁承受大倍率 AGC 调频脉冲，DOD 深度放电超标'
    },
    {
      siteId: 'site-005',
      siteName: '江苏如东海上风电配套储能示范站',
      siteCode: 'JS-ESS-0088',
      region: '华东区',
      overallScore: 84.5,
      rtePct: 87.1,
      minPackSoh: 90.4,
      maxDeltaVm: 54,
      maxDeltaT: 4.2,
      riskReason: '高盐雾腐蚀引起直流配电盒端子发热，线损率达到 1.48%'
    }
  ];

  // Over-condition factors full-network hit frequency
  const overConditionFactorsRanking = [
    { factor: '电芯超温运行 (>35℃)', siteCount: 620, pct: 43.6, lossSohContribution: '-0.58%' },
    { factor: '高倍率调频脉冲 (>0.8C)', siteCount: 480, pct: 33.8, lossSohContribution: '-0.42%' },
    { factor: '极限深度放电 (DOD>90%)', siteCount: 320, pct: 22.5, lossSohContribution: '-0.35%' },
    { factor: '高SOC高温长期静置', siteCount: 260, pct: 18.3, lossSohContribution: '-0.26%' },
    { factor: '模组单体压差过大 (>50mV)', siteCount: 210, pct: 14.8, lossSohContribution: '-0.18%' },
    { factor: '低温环境强充极化析锂', siteCount: 95, pct: 6.7, lossSohContribution: '-0.15%' }
  ];

  const handleExportStats = (format: 'PDF' | 'EXCEL') => {
    if (addReportItem) {
      addReportItem({
        id: `rep-global-perf-${Date.now()}`,
        reportNo: `REP-NET-PERF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `全网储能电站性能工况与SLA履约综合统计分析报告 (${selectedPeriod})`,
        type: 'REGIONAL_REPORT',
        scopeName: '全网 38,420 站',
        period: selectedPeriod,
        formats: ['PDF', 'EXCEL'],
        generatedAt: '2026-08-31 18:00',
        generator: '专业服务运营统计引擎',
        fileSize: '4.8 MB',
        downloadCount: 0
      });
    }
    setExportNotice(`已成功生成《全网性能工况多维统计分析简报 (${format})》，并已自动归档至报告中心！`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-5 p-6 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Toast Notice */}
      {exportNotice && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  全网储能电站性能工况统计看板
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  数万级电站集群
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  全网加权 88.6 分 (良好)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                面向全国 38,420 座在运储能电站，提供跨大区、跨代表处、跨客户及设备型号的全维度性能工况健康得分、RTE 交流往返能效、SOH 衰减保持率、实测可用容量 AUC 与超工况风险统计分析。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>统计周期:</span>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              <option value="2026-08">2026年08月 (月度)</option>
              <option value="2026-Q3">2026年第三季度</option>
              <option value="2026-H1">2026年上半年</option>
              <option value="2025-YEAR">2025年整年度</option>
            </select>
          </div>

          <button
            onClick={() => handleExportStats('PDF')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>导出统计简报</span>
          </button>

          <button
            onClick={navigateToPerformanceMonitor}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <span>返回性能工况站点列表</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Overview Macro KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>全网监测电站总数</span>
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">38,420</span>
            <span className="text-xs text-slate-500">座</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            总储能规模: <strong className="text-slate-800 font-mono">48.6 GW</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>全网工况健康得分</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-700 font-mono">88.6</span>
            <span className="text-xs text-slate-500">分</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
            全网加权优良率 86.4%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>交流侧平均 RTE 能效</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">87.42</span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-600">
            基线 87.50% (微幅偏离 -0.08%)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>全网电池加权平均 SOH</span>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700 font-mono">94.65</span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            保证底线 90.00% (安全可控)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>可用容量 AUC 保持率</span>
            <BatteryCharging className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-700 font-mono">98.24</span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            GB/T 36276 实测标定均值
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>全网超工况预警站点</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-600 font-mono">1,420</span>
            <span className="text-xs text-slate-500">站</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-600">
            超温620 / 调频480 / 深放320
          </div>
        </div>
      </div>

      {/* 3. Dimension Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setDimension('region')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              dimension === 'region'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>按大区维度统计 (4 大区)</span>
          </button>
          <button
            onClick={() => setDimension('repOffice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              dimension === 'repOffice'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>按代表处维度统计 (6 重点代表处)</span>
          </button>
          <button
            onClick={() => setDimension('customer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              dimension === 'customer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>按客户主体维度统计</span>
          </button>
          <button
            onClick={() => setDimension('model')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              dimension === 'model'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>按储能设备型号架构统计</span>
          </button>
        </div>

        {/* Search inside table */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜索维度名称..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 4. Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart A: RTE & SOH Dual-Axis Bar-Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>各维度 RTE 能效 vs SOH 保持率对比分析</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                柱状图为交流综合 RTE 能效 (%)，折线为电池系统加权 SOH (%)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              RTE 保证基线: 87.50%
            </span>
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayStatsList} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="rte" domain={[84, 90]} tick={{ fontSize: 10 }} unit="%" />
                <YAxis yAxisId="soh" orientation="right" domain={[90, 98]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  yAxisId="rte"
                  dataKey="avgRtePct"
                  name="平均 RTE 能效 (%)"
                  fill="#3b82f6"
                  barSize={24}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="soh"
                  type="monotone"
                  dataKey="avgSohPct"
                  name="平均 SOH 保持率 (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Over-condition Impact Factors Ranking */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>全网超工况影响因子命中热度排行</span>
            </h3>
            <span className="text-[10px] text-slate-400">共 1,420 站异常</span>
          </div>

          <div className="space-y-3 pt-1">
            {overConditionFactorsRanking.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-4 text-center font-mono text-[10px] text-slate-400">
                      {idx + 1}
                    </span>
                    <span>{item.factor}</span>
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    {item.siteCount} 站 ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.pct * 2}%` }}
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-rose-500'
                        : idx === 1
                        ? 'bg-amber-500'
                        : idx === 2
                        ? 'bg-blue-500'
                        : 'bg-indigo-400'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-end">
                  额外折算衰减贡献: {item.lossSohContribution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. High Risk Top 3 Sites Priority Review Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900">
              全网重点关注与性能工况临界电站 TOP 3 (优先处置清单)
            </h3>
          </div>
          <span className="text-xs text-slate-500">点击任意卡片即可直接下钻进入该站工况详情</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {topRiskSites.map(site => (
            <div
              key={site.siteId}
              onClick={() => navigateToPerformanceDetail(site.siteId)}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {site.siteName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {site.siteCode} · {site.region}
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  {site.overallScore} 分
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-white/80 p-2 rounded-lg border border-rose-100">
                <div>
                  <span className="text-[9px] text-slate-400 font-sans block">RTE 能效</span>
                  <strong className="text-rose-600">{site.rtePct}%</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-sans block">PACK SOH</span>
                  <strong className="text-rose-600">{site.minPackSoh}%</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-sans block">模组压差</span>
                  <strong className="text-amber-700">{site.maxDeltaVm} mV</strong>
                </div>
              </div>

              <p className="text-[10px] text-rose-800 leading-tight">
                <strong>核心瓶颈: </strong>
                {site.riskReason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Multi-Dimensional Master Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              多维度性能工况汇总报表 ({displayStatsList.length} 项)
            </h3>
          </div>

          <div className="text-xs text-slate-500">
            支持点击表头字段动态排序，点击右侧「查看站点群」联动过滤
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3.5">维度名称</th>
                <th
                  onClick={() => handleSort('siteCount')}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>电站数量</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('capacityMw')}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>装机规模 (MW)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('overallScore')}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>工况健康得分</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgRtePct')}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>平均 RTE %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgSohPct')}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>平均 SOH %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgAucRetentionPct')}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>AUC保持率 %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-mono">电芯最大ΔT</th>
                <th className="py-3 px-3 font-mono">模组最大ΔV</th>
                <th className="py-3 px-3 font-mono">关口线损率</th>
                <th
                  onClick={() => handleSort('complianceRatePct')}
                  className="py-3 px-3 font-mono cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>履约达标率</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayStatsList.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-blue-600 rounded-full"></span>
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                    {row.siteCount.toLocaleString()} 站
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">
                    {row.capacityMw.toLocaleString()} MW
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    <span
                      className={
                        row.overallScore >= 90
                          ? 'text-emerald-700'
                          : row.overallScore >= 85
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }
                    >
                      {row.overallScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans ml-1">
                      ({row.gradeLabel})
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                    <span className={row.avgRtePct < 87.5 ? 'text-amber-600' : 'text-slate-900'}>
                      {row.avgRtePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                    {row.avgSohPct.toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-3 font-mono text-blue-700">
                    {row.avgAucRetentionPct.toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    <span className={row.avgMaxDeltaT > 4.0 ? 'text-amber-600 font-bold' : ''}>
                      {row.avgMaxDeltaT} ℃
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    <span className={row.avgMaxDeltaVm > 50 ? 'text-rose-600 font-bold' : ''}>
                      {row.avgMaxDeltaVm} mV
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {row.gridLossPct}%
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                    {row.complianceRatePct}%
                  </td>
                  <td className="py-3.5 px-3.5 text-right">
                    <button
                      onClick={navigateToPerformanceMonitor}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-indigo-600 hover:bg-indigo-50 font-semibold text-xs transition-colors"
                    >
                      <span>查看站点群</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
