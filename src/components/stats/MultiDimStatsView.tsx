import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusLampBadge } from '../common/StatusBadge';
import {
  BarChart3,
  Download,
  Filter,
  Layers,
  ArrowUpDown,
  TrendingUp,
  PieChart,
  Calendar,
  Building2,
  Users,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';

export const MultiDimStatsView: React.FC = () => {
  const { sites, navigateToSiteDetail, setDrilldownFilter, setActiveTab } = useApp();

  const [dimension, setDimension] = useState<'region' | 'repOffice' | 'customer' | 'deviceModel'>(
    'region'
  );
  const [sortField, setSortField] = useState<string>('availability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute live station statistics for Full Network SLA & Tiers
  const totalSites = sites.length;
  const regionList = Array.from(new Set(sites.map(s => s.region)));
  const regionalSiteStats = regionList.map(reg => {
    const regSites = sites.filter(s => s.region === reg);
    const count = regSites.length;
    const capacity = regSites.reduce((sum, s) => sum + (s.capacityMw || 0), 0);
    const regAvgAvail = Number(
      (regSites.reduce((sum, s) => sum + s.currentAvailability, 0) / count).toFixed(2)
    );
    const regAvgSla = Number(
      (regSites.reduce((sum, s) => sum + s.slaThreshold, 0) / count).toFixed(2)
    );
    const compliant = regSites.filter(s => s.currentAvailability >= s.slaThreshold).length;
    const regComplianceRate = Number(((compliant / count) * 100).toFixed(1));
    const gap = Number((regAvgAvail - regAvgSla).toFixed(2));

    return {
      region: reg,
      count,
      capacity,
      avgAvailability: regAvgAvail,
      avgSla: regAvgSla,
      compliant,
      complianceRate: regComplianceRate,
      gap
    };
  });

  // Availability Tier Breakdown
  const tier1 = sites.filter(s => s.currentAvailability >= 99.8); // 标杆级 (>=99.8%)
  const tier2 = sites.filter(s => s.currentAvailability >= 99.5 && s.currentAvailability < 99.8); // 优良级 (99.5-99.8%)
  const tier3 = sites.filter(s => s.currentAvailability >= 99.0 && s.currentAvailability < 99.5); // 达标级 (99.0-99.5%)
  const tier4 = sites.filter(s => s.currentAvailability < 99.0); // 风险/未达标 (<99.0%)

  // Lowest Availability / High Risk Top Sites
  const sortedByGap = [...sites].sort((a, b) => {
    const gapA = a.currentAvailability - a.slaThreshold;
    const gapB = b.currentAvailability - b.slaThreshold;
    return gapA - gapB;
  });
  const topRiskSites = sortedByGap.slice(0, 3);

  // Multi-dimensional Mock Aggregated Data
  const regionStats = [
    {
      name: '华东区',
      siteCount: 14200,
      availability: 99.58,
      passedRate: 98.6,
      interruptionHours: 128.4,
      avgMttr: 3.2,
      alarmCount: 4820,
      workOrders: 620
    },
    {
      name: '华南区',
      siteCount: 11800,
      availability: 99.41,
      passedRate: 97.4,
      interruptionHours: 215.6,
      avgMttr: 3.8,
      alarmCount: 5120,
      workOrders: 710
    },
    {
      name: '华北区',
      siteCount: 7600,
      availability: 99.32,
      passedRate: 96.2,
      interruptionHours: 184.2,
      avgMttr: 4.1,
      alarmCount: 3940,
      workOrders: 490
    },
    {
      name: '西北区',
      siteCount: 4820,
      availability: 99.18,
      passedRate: 94.8,
      interruptionHours: 312.0,
      avgMttr: 5.6,
      alarmCount: 4280,
      workOrders: 580
    }
  ];

  const repOfficeStats = [
    {
      name: '上海代表处',
      siteCount: 5400,
      availability: 99.64,
      passedRate: 99.1,
      interruptionHours: 42.1,
      avgMttr: 2.8,
      alarmCount: 1420,
      workOrders: 190
    },
    {
      name: '深圳代表处',
      siteCount: 6200,
      availability: 99.52,
      passedRate: 98.4,
      interruptionHours: 86.4,
      avgMttr: 3.4,
      alarmCount: 2310,
      workOrders: 320
    },
    {
      name: '南京代表处',
      siteCount: 4800,
      availability: 99.46,
      passedRate: 97.8,
      interruptionHours: 68.2,
      avgMttr: 3.5,
      alarmCount: 1840,
      workOrders: 240
    },
    {
      name: '广州代表处',
      siteCount: 4100,
      availability: 99.36,
      passedRate: 96.8,
      interruptionHours: 112.5,
      avgMttr: 4.2,
      alarmCount: 1950,
      workOrders: 280
    },
    {
      name: '北京代表处',
      siteCount: 3900,
      availability: 99.35,
      passedRate: 96.5,
      interruptionHours: 94.2,
      avgMttr: 4.0,
      alarmCount: 1880,
      workOrders: 230
    },
    {
      name: '乌鲁木齐代表处',
      siteCount: 2820,
      availability: 99.12,
      passedRate: 93.9,
      interruptionHours: 198.4,
      avgMttr: 5.9,
      alarmCount: 2640,
      workOrders: 340
    }
  ];

  const customerStats = [
    {
      name: '国家电网有限公司',
      siteCount: 12400,
      availability: 99.62,
      passedRate: 98.9,
      interruptionHours: 142.0,
      avgMttr: 3.1,
      alarmCount: 4100,
      workOrders: 510
    },
    {
      name: '中国南方电网',
      siteCount: 8900,
      availability: 99.48,
      passedRate: 97.8,
      interruptionHours: 165.4,
      avgMttr: 3.6,
      alarmCount: 3400,
      workOrders: 420
    },
    {
      name: '中国宝武钢铁集团',
      siteCount: 3800,
      availability: 99.45,
      passedRate: 97.2,
      interruptionHours: 92.1,
      avgMttr: 3.9,
      alarmCount: 1620,
      workOrders: 210
    },
    {
      name: '中国石化集团',
      siteCount: 4200,
      availability: 99.31,
      passedRate: 95.8,
      interruptionHours: 148.6,
      avgMttr: 4.4,
      alarmCount: 2180,
      workOrders: 310
    },
    {
      name: '华能江苏清洁能源',
      siteCount: 2600,
      availability: 99.55,
      passedRate: 98.2,
      interruptionHours: 54.2,
      avgMttr: 3.3,
      alarmCount: 960,
      workOrders: 130
    }
  ];

  const deviceModelStats = [
    {
      name: 'PCS-500K-HV (集中式)',
      siteCount: 14800,
      availability: 99.55,
      passedRate: 98.2,
      interruptionHours: 242.0,
      avgMttr: 3.2,
      alarmCount: 5200,
      workOrders: 680
    },
    {
      name: 'PCS-1000K-HV (高压大型)',
      siteCount: 12200,
      availability: 99.46,
      passedRate: 97.5,
      interruptionHours: 290.4,
      avgMttr: 3.8,
      alarmCount: 5800,
      workOrders: 740
    },
    {
      name: 'PCS-250K-LV (分布式组串)',
      siteCount: 8600,
      availability: 99.38,
      passedRate: 96.8,
      interruptionHours: 210.6,
      avgMttr: 4.1,
      alarmCount: 4100,
      workOrders: 530
    },
    {
      name: 'BMS-MASTER-V3 (主控)',
      siteCount: 2820,
      availability: 99.68,
      passedRate: 99.3,
      interruptionHours: 98.2,
      avgMttr: 2.9,
      alarmCount: 1800,
      workOrders: 180
    }
  ];

  let currentData = regionStats;
  if (dimension === 'repOffice') currentData = repOfficeStats;
  else if (dimension === 'customer') currentData = customerStats;
  else if (dimension === 'deviceModel') currentData = deviceModelStats;

  // Sorting
  const sortedData = [...currentData].sort((a: any, b: any) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  const handleRowClick = (item: any) => {
    if (dimension === 'region') {
      setDrilldownFilter({ region: item.name });
      setActiveTab('sites');
    } else if (dimension === 'repOffice') {
      setDrilldownFilter({ repOffice: item.name });
      setActiveTab('sites');
    } else if (dimension === 'customer') {
      setDrilldownFilter({ customer: item.name });
      setActiveTab('sites');
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              全网可用度与运行质量统计
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持按区域、代表处、客户、设备型号多维自由聚合与交叉透视分析，支持全量数据导出。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.alert('已导出当前多维统计透视表 (Excel 格式)')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>导出统计 Excel 报表</span>
          </button>
        </div>
      </div>

      {/* 1. Full Network SLA & Regional Availability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Regional Availability vs SLA Comparison Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  各区域可用度与合同 SLA 阈值对比
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-600" />
                  <span className="text-slate-600">实际可用度</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-400" />
                  <span className="text-slate-600">SLA 目标线</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalSiteStats} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="region" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis domain={[97.5, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(val: any, name: string) => [
                      `${Number(val).toFixed(2)}%`,
                      name === 'avgAvailability' ? '区域平均可用度' : '区域平均 SLA 阈值'
                    ]}
                  />
                  <Bar
                    dataKey="avgAvailability"
                    name="avgAvailability"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="avgSla"
                    name="avgSla"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
            {regionalSiteStats.map(r => (
              <div
                key={r.region}
                onClick={() => {
                  setDrilldownFilter({ region: r.region });
                  setActiveTab('sites');
                }}
                className="bg-slate-50 hover:bg-blue-50/60 cursor-pointer border border-slate-100 hover:border-blue-200 rounded-lg p-2.5 text-xs transition-colors"
                title="点击下钻查看该区域电站"
              >
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>{r.region}</span>
                  <span className={r.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {r.gap >= 0 ? `+${r.gap}%` : `${r.gap}%`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>{r.count} 站 ({r.capacity}MW)</span>
                  <span className="font-mono text-slate-700">{r.avgAvailability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Availability Tiers & Lowest Availability Sites */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Availability Tiers Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  全网可用度梯级分布
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">
                共 {totalSites} 个站点
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Tier 1 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">≥ 99.8% (标杆卓越)</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {tier1.length} 站 ({totalSites > 0 ? ((tier1.length / totalSites) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${totalSites > 0 ? (tier1.length / totalSites) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Tier 2 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">99.5% ~ 99.8% (优良达标)</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {tier2.length} 站 ({totalSites > 0 ? ((tier2.length / totalSites) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${totalSites > 0 ? (tier2.length / totalSites) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Tier 3 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">99.0% ~ 99.5% (临界关注)</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {tier3.length} 站 ({totalSites > 0 ? ((tier3.length / totalSites) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${totalSites > 0 ? (tier3.length / totalSites) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Tier 4 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">&lt; 99.0% (高危/违约风险)</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {tier4.length} 站 ({totalSites > 0 ? ((tier4.length / totalSites) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all"
                    style={{ width: `${totalSites > 0 ? (tier4.length / totalSites) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Lowest Availability / High Risk Top Sites */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  履约风险重点电站速览 (达标差距最大)
                </h2>
              </div>
            </div>

            <div className="space-y-2">
              {topRiskSites.map(s => {
                const gap = Number((s.currentAvailability - s.slaThreshold).toFixed(2));
                return (
                  <div
                    key={s.id}
                    onClick={() => navigateToSiteDetail(s.id)}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-200 cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {s.siteName}
                        <span className="text-[10px] text-slate-400 font-mono">({s.region})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>当前: <strong className="font-mono text-slate-800">{s.currentAvailability}%</strong></span>
                        <span>SLA: <strong className="font-mono text-slate-600">{s.slaThreshold}%</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          gap >= 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {gap >= 0 ? `+${gap}%` : `${gap}%`}
                      </span>
                      <StatusLampBadge status={s.statusLamp} size="sm" />
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Switch Tabs */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
        <button
          onClick={() => setDimension('region')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'region'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>按区域统计 (Region)</span>
        </button>

        <button
          onClick={() => setDimension('repOffice')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'repOffice'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>按代表处统计 (Rep Office)</span>
        </button>

        <button
          onClick={() => setDimension('customer')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'customer'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>按客户统计 (Customer)</span>
        </button>

        <button
          onClick={() => setDimension('deviceModel')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'deviceModel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>按设备型号统计 (Device Model)</span>
        </button>
      </div>

      {/* Visual Chart Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Availability vs SLA Passed Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            各维度可用度均值 (%)
          </h3>
          <p className="text-xs text-slate-500 mb-4">柱高直观反映质量水平</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[98.5, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.375rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(val: any) => [`${val}%`, '可用度均值']}
                />
                <Bar dataKey="availability" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.availability < 99.3 ? '#ef4444' : '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Interruption Hours & MTTR */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-600" />
            累积等效中断时长 (小时)
          </h3>
          <p className="text-xs text-slate-500 mb-4">反映质量损耗总量</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.375rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(val: any) => [`${val} 小时`, '中断时长']}
                />
                <Bar dataKey="interruptionHours" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dimensional Details Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <span className="text-xs font-bold text-slate-800">
            维度透视明细表 (点击行可一键下钻筛选对应站点)
          </span>
          <span className="text-[11px] text-slate-500">点击表头字段切换升降序</span>
        </div>

        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">维度名称</th>
              <th
                onClick={() => {
                  setSortField('siteCount');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                站点数 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('availability');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                平均可用度 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('passedRate');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                SLA 达标率 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('interruptionHours');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                等效中断总时长 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('avgMttr');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                平均 MTTR <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th className="py-3 px-3">告警总数</th>
              <th className="py-3 px-3">工单总数</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((item: any, idx) => (
              <tr
                key={idx}
                onClick={() => handleRowClick(item)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                <td className="py-3.5 px-3 font-mono text-slate-700">{(item.siteCount ?? 0).toLocaleString()} 站</td>
                <td className="py-3.5 px-3 font-mono font-bold text-blue-600">
                  {item.availability}%
                </td>
                <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                  {item.passedRate}%
                </td>
                <td className="py-3.5 px-3 font-mono text-red-600 font-semibold">
                  {item.interruptionHours} 小时
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-700">{item.avgMttr} h</td>
                <td className="py-3.5 px-3 font-mono text-slate-600">{(item.alarmCount ?? 0).toLocaleString()}</td>
                <td className="py-3.5 px-3 font-mono text-slate-600">{(item.workOrders ?? 0).toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs">
                    下钻 &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
