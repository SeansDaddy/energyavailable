import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusLampBadge } from '../common/StatusBadge';
import {
  Activity,
  Calendar,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Database,
  Eye,
  FolderKanban
} from 'lucide-react';

export const AvailabilityMonitorView: React.FC = () => {
  const { sites, navigateToAvailabilityDrilldown } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Core Summary Metrics
  const totalSites = sites.length;
  const totalCapacityMw = sites.reduce((sum, s) => sum + (s.capacityMw || 0), 0);

  const avgAvailability =
    totalSites > 0
      ? Number((sites.reduce((sum, s) => sum + s.currentAvailability, 0) / totalSites).toFixed(2))
      : 0;

  const weightedAvgAvailability =
    totalCapacityMw > 0
      ? Number(
          (
            sites.reduce((sum, s) => sum + s.currentAvailability * (s.capacityMw || 0), 0) /
            totalCapacityMw
          ).toFixed(2)
        )
      : avgAvailability;

  const avgSla =
    totalSites > 0
      ? Number((sites.reduce((sum, s) => sum + s.slaThreshold, 0) / totalSites).toFixed(2))
      : 0;

  const overallGap = Number((avgAvailability - avgSla).toFixed(2));

  const compliantSites = sites.filter(s => s.currentAvailability >= s.slaThreshold);
  const complianceRate =
    totalSites > 0 ? Number(((compliantSites.length / totalSites) * 100).toFixed(1)) : 0;

  // SLA breach & status counts
  const breachedSlaSites = sites.filter(s => s.currentAvailability < s.slaThreshold);
  const breachedSlaCount = breachedSlaSites.length;
  const maxSlaGap =
    breachedSlaSites.length > 0
      ? Math.max(...breachedSlaSites.map(s => Number((s.slaThreshold - s.currentAvailability).toFixed(2))))
      : 0;

  const greenCount = sites.filter(s => s.statusLamp === 'green').length;
  const yellowCount = sites.filter(s => s.statusLamp === 'yellow').length;
  const redCount = sites.filter(s => s.statusLamp === 'red').length;
  const greyCount = sites.filter(s => s.statusLamp === 'grey').length;

  // Data health
  const avgCoverage =
    totalSites > 0
      ? Number((sites.reduce((sum, s) => sum + s.dataCoverage, 0) / totalSites).toFixed(1))
      : 0;
  const fullCoverageSites = sites.filter(s => s.dataCoverage >= 98).length;

  const regionList = Array.from(new Set(sites.map(s => s.region)));

  // Filtered Sites for Table
  const filteredSites = sites.filter(s => {
    if (regionFilter !== 'ALL' && s.region !== regionFilter) return false;
    if (statusFilter === 'breached') {
      if (s.currentAvailability >= s.slaThreshold) return false;
    } else if (statusFilter === 'compliant') {
      if (s.currentAvailability < s.slaThreshold) return false;
    } else if (statusFilter !== 'ALL' && s.statusLamp !== statusFilter) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        s.siteName.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.representativeOffice.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  全网可用度持续监控
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                  Rule R7: 北京时间 0 点日界
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                动态汇总全网各站点可用度达标情况、跌破 SLA 阈值站点数、大区质量对比及履约预警指标。
              </p>
            </div>

            {/* Evaluation Period Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 shadow-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-slate-500">考核期 (自然月):</span>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 font-bold text-blue-700 rounded px-2 py-0.5 border border-slate-200 focus:outline-none"
                >
                  <option value="2026-08">2026-08 (当期)</option>
                  <option value="2026-07">2026-07 (已归档)</option>
                  <option value="2026-06">2026-06 (已归档)</option>
                </select>
              </div>
            </div>
          </div>

      {/* 1. Core Network Availability Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Network Average Availability */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">全网综合可用度</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {avgAvailability}%
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                overallGap >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {overallGap >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {overallGap >= 0 ? `+${overallGap}%` : `${overallGap}%`}
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>全网平均 SLA: <strong className="text-slate-700 font-mono">{avgSla}%</strong></span>
            <span>容量加权: <strong className="text-blue-600 font-mono">{weightedAvgAvailability}%</strong></span>
          </div>
        </div>

        {/* Metric Card 2: SLA Compliance Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">SLA 履约达标率</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {complianceRate}%
            </span>
            <span className="text-xs text-slate-500">
              ({compliantSites.length}/{totalSites} 站达标)
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">总监控规模:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {totalSites} 站 / {totalCapacityMw} MW
            </span>
          </div>
        </div>

        {/* Metric Card 3: Breached SLA Threshold Site Count */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'breached' ? 'ALL' : 'breached')}
          className={`bg-white border rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer transition-all ${
            statusFilter === 'breached'
              ? 'border-red-400 ring-2 ring-red-100'
              : 'border-slate-200 hover:border-red-300'
          }`}
          title="点击筛选跌破可用度 SLA 阈值的站点"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">跌破可用度 SLA 阈值站点数</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600 font-mono tabular-nums tracking-tight">
              {breachedSlaCount}
            </span>
            <span className="text-xs text-slate-500">
              站 · 占全网{' '}
              <strong className="font-mono text-slate-700">
                {totalSites > 0 ? ((breachedSlaCount / totalSites) * 100).toFixed(1) : '0.0'}%
              </strong>
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              最大负向差值:{' '}
              <strong className="text-red-600 font-mono tabular-nums">
                {maxSlaGap > 0 ? `-${maxSlaGap}%` : '0.00%'}
              </strong>
            </span>
            <span className="text-slate-500">
              预警 <strong className="text-amber-600 font-mono">{yellowCount}</strong> · 断供{' '}
              <strong className="text-slate-700 font-mono">{greyCount}</strong>
            </span>
          </div>
        </div>

        {/* Metric Card 4: Data Coverage & Health */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">数据采集覆盖率</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {avgCoverage}%
            </span>
            <span className="text-xs text-slate-500">
              ({fullCoverageSites}/{totalSites} 站完整)
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>数据更新机制:</span>
            <span className="text-indigo-600 font-medium">5min 打点 / 日界重算</span>
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
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">全部区域 ({totalSites} 站)</option>
              {regionList.map(r => (
                <option key={r} value={r}>
                  {r} ({sites.filter(s => s.region === r).length} 站)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">达标状态:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">全部站点 ({totalSites})</option>
              <option value="breached">已跌破 SLA 阈值 ({breachedSlaCount})</option>
              <option value="compliant">满足 SLA 阈值 ({compliantSites.length})</option>
              <option value="yellow">预测将跌破 ({yellowCount})</option>
              <option value="grey">数据断供 ({greyCount})</option>
              <option value="green">绿灯正常 ({greenCount})</option>
              <option value="red">红灯告警 ({redCount})</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索站点名称 / 客户 / 区域..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 w-56 focus:outline-none focus:border-blue-500"
            />
          </div>

          {(regionFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setRegionFilter('ALL');
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
            >
              重置筛选
            </button>
          )}
        </div>

        <span className="text-slate-500">
          共筛选出 <strong className="text-blue-600 font-semibold">{filteredSites.length}</strong> / {totalSites} 个监控站点
        </span>
      </div>

      {/* Sites Availability Detail Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">站点名称</th>
              <th className="py-3 px-3">区域</th>
              <th className="py-3 px-3">代表处</th>
              <th className="py-3 px-3 font-mono">当期累计可用度</th>
              <th className="py-3 px-3 font-mono">SLA 阈值</th>
              <th className="py-3 px-3 font-mono">达标差值</th>
              <th className="py-3 px-3">状态灯 (R6)</th>
              <th className="py-3 px-3">数据覆盖率</th>
              <th className="py-3 px-3">最后导入时间</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSites.map(s => {
              const gapVal = Number((s.currentAvailability - s.slaThreshold).toFixed(2));

              return (
                <tr
                  key={s.id}
                  onClick={() => navigateToAvailabilityDrilldown(s.id, 0)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{s.siteName}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium whitespace-nowrap">
                    {s.region}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {s.representativeOffice}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-sm">
                    <span
                      className={
                        s.currentAvailability < s.slaThreshold
                          ? 'text-red-600'
                          : s.statusLamp === 'yellow'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }
                    >
                      {s.currentAvailability}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{s.slaThreshold}%</td>
                  <td className="py-3 px-3 font-mono font-semibold">
                    <span className={gapVal >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {gapVal >= 0 ? `+${gapVal}%` : `${gapVal}%`}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusLampBadge status={s.statusLamp} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{s.dataCoverage}%</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {s.lastImportTime}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigateToAvailabilityDrilldown(s.id, 0);
                      }}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all inline-flex items-center gap-1 text-xs shadow-2xs group"
                      title="查看详情"
                      aria-label="查看详情"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline font-medium text-slate-700 group-hover:text-blue-700">详情</span>
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigateToAvailabilityDrilldown(s.id, 3);
                      }}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all inline-flex items-center gap-1 text-xs shadow-2xs group cursor-pointer"
                      title="下钻查看该站专属报告中心"
                      aria-label="报告中心"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline font-medium text-blue-700">报告中心</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
