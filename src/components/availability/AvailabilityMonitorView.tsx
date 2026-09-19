import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusLampBadge } from '../common/StatusBadge';
import {
  Activity,
  Calendar,
  Filter,
  Search,
  SlidersHorizontal,
  Clock,
  Layers,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export const AvailabilityMonitorView: React.FC = () => {
  const { sites, navigateToSiteDetail, setActiveTab } = useApp();

  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected site for interactive curve inspection
  const [activeSiteForChart, setActiveSiteForChart] = useState<string>(sites[0].id);

  const inspectedSite = sites.find(s => s.id === activeSiteForChart) || sites[0];

  // Aggregated data for Daily Snapshots
  const chartData = inspectedSite.dailySnapshots.map(snap => ({
    date: snap.date,
    availability: snap.availability,
    slaThreshold: snap.slaThreshold,
    eventsCount: snap.events.length,
    events: snap.events
  }));

  const filteredSites = sites.filter(s => {
    if (regionFilter !== 'ALL' && s.region !== regionFilter) return false;
    if (statusFilter !== 'ALL' && s.statusLamp !== statusFilter) return false;
    if (searchTerm) {
      const match =
        s.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.siteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customer.toLowerCase().includes(searchTerm.toLowerCase());
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
              全网可用度持续监控与打点趋势
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              Rule R7: 北京时间 0 点日界
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            动态汇总各站点每日可用度打点与关键事件快照（告警、工单闭环、日志导入、预警触发）。
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

      {/* Main Interactive Chart: Daily Snapshot Trend with Event Markers */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                站点可用度趋势走势与关键事件打点快照
              </h2>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                当前选中: {inspectedSite.siteName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              点击下方表格任意行可切换折线图对比对象。打点包含当日可用度及重要工单/告警/批次事件。
            </p>
          </div>

          {/* Granularity Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setGranularity('day')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                granularity === 'day'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              日打点 (Day)
            </button>
            <button
              onClick={() => setGranularity('week')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                granularity === 'week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              周汇总 (Week)
            </button>
            <button
              onClick={() => setGranularity('month')}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                granularity === 'month'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              月走势 (Month)
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                tickFormatter={val => (val ? String(val).slice(-5) : '')}
              />
              <YAxis domain={[97.0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(val: any, name: string) => [
                  `${val}%`,
                  name === 'availability' ? '当日实际可用度' : 'SLA 阈值'
                ]}
              />
              <ReferenceLine
                y={inspectedSite.slaThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `SLA ${inspectedSite.slaThreshold}%`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'right'
                }}
              />
              <Line
                type="monotone"
                dataKey="availability"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={props => {
                  const { cx, cy, payload } = props;
                  const hasEvents = payload.eventsCount > 0;
                  if (hasEvents) {
                    return (
                      <circle
                        key={payload.date}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={payload.date}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="#2563eb"
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Legend & Status Description */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>正常打点</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-white" />
              <span>当日关键事件快照 (告警/工单闭环/预警)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-red-500 border-b border-dashed" />
              <span>合同 SLA 阈值红线</span>
            </div>
          </div>

          <div className="text-slate-500">
            数据更新机制: 日志导入即时重算 · PCare 离线报表批量导入 · 每日 00:00 自动打点
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">区域选择:</span>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">全部区域</option>
              <option value="华东区">华东区</option>
              <option value="华南区">华南区</option>
              <option value="华北区">华北区</option>
              <option value="西北区">西北区</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">四色状态灯:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">全部状态灯</option>
              <option value="green">🟢 绿灯 - SLA 达标</option>
              <option value="yellow">🟡 黄灯 - 预测将跌破</option>
              <option value="red">🔴 红灯 - 已跌破 SLA</option>
              <option value="grey">⚪ 灰灯 - 数据断供</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索站点名称 / 编码 / 客户..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-800 w-56 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <span className="text-slate-500">
          共筛选出 <strong className="text-blue-600 font-semibold">{filteredSites.length}</strong> 个监控站点
        </span>
      </div>

      {/* Sites Availability Detail Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">站点名称 / 编码</th>
              <th className="py-3 px-3">区域 / 代表处</th>
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
              const isSelectedForChart = s.id === activeSiteForChart;

              return (
                <tr
                  key={s.id}
                  onClick={() => setActiveSiteForChart(s.id)}
                  className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                    isSelectedForChart ? 'bg-blue-50/60 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{s.siteName}</div>
                    <div className="text-[11px] text-blue-600 font-mono">{s.siteCode}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-800">{s.region}</div>
                    <div className="text-[11px] text-slate-500">{s.representativeOffice}</div>
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
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigateToSiteDetail(s.id);
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 rounded font-semibold text-xs transition-colors"
                    >
                      下钻详情 &rarr;
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
