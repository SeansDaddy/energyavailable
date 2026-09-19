import React, { useState } from 'react';
import { Site, DailySnapshot, WorkOrder } from '../../types';
import { FiveMinAvailabilityDotsView } from './FiveMinAvailabilityDotsView';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Wrench,
  UploadCloud,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';

interface DailySnapshotsTabProps {
  site: Site;
  workOrders?: WorkOrder[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onNavigateTab: (tabIdx: number) => void;
}

export const DailySnapshotsTab: React.FC<DailySnapshotsTabProps> = ({
  site,
  workOrders = [],
  selectedDate: initialSelectedDate,
  onSelectDate,
  onNavigateTab
}) => {
  const snapshots = site.dailySnapshots || [];
  
  // Default to the first day with an event or latest day
  const defaultDate = initialSelectedDate || (snapshots.length > 0 ? snapshots[snapshots.length - 1].date : '2026-08-15');
  const [activeDate, setActiveDate] = useState<string>(defaultDate);
  // View mode: '5min' for 5-minute interval plotting; '30days' for monthly daily overview
  const [viewMode, setViewMode] = useState<'5min' | '30days'>('5min');

  const handleDateClick = (date: string) => {
    setActiveDate(date);
    if (onSelectDate) onSelectDate(date);
  };

  const selectedSnapshot = snapshots.find(s => s.date === activeDate) || snapshots[0];

  // Interruption bars data
  const chartData = snapshots.map(s => ({
    date: s.date,
    availability: s.availability,
    interruptionMins: s.pcsInterruptionMins || 0,
    maintenanceMins: s.plannedMaintenanceMins || 0,
    eventsCount: s.events ? s.events.length : 0,
    isBreached: s.availability < s.slaThreshold
  }));

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Mode Navigation Switcher */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            id="btn-mode-5min"
            onClick={() => setViewMode('5min')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === '5min'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>5 分钟高频打点时序监控 (288 点/日)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              viewMode === '5min' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              高精度打点
            </span>
          </button>

          <button
            id="btn-mode-30days"
            onClick={() => setViewMode('30days')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === '30days'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>30 天逐日累计大盘与事件剖析 (Rule R7)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              viewMode === '30days' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              30天汇总
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 self-start sm:self-auto">
          <span>当前剖析日期:</span>
          <strong className="font-mono text-blue-600 font-bold">{activeDate}</strong>
        </div>
      </div>

      {/* Mode 1: 5-Minute Telemetry Dots View */}
      {viewMode === '5min' && (
        <FiveMinAvailabilityDotsView
          site={site}
          activeDate={activeDate}
          onChangeDate={handleDateClick}
          workOrders={workOrders}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Mode 2: 30-Day Aggregation View */}
      {viewMode === '30days' && (
        <div className="space-y-5">
          {/* Rule R7 Banner */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-900 font-semibold">
                日界与打点计算规则 (Rule R7 & R2)：
              </strong>
              每日打点按北京时间 <strong>00:00:00 至 23:59:59</strong> 进行标准日切。跨日事件按实际发生时段精确切分；计划内维护（已申报工单）不计入等效中断时长。点击下方日历列表或趋势图上的任意日期，可即时展开当日事件快照与因果追溯，或切换至上方 5 分钟打点视图查看微观 288 点。
            </div>
          </div>

          {/* 30-Day Availability Trend Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  当月 30 天每日可用度打点走势 (点击任意点位下钻当日)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  当前选中日期: <strong className="text-blue-600 font-mono">{activeDate || '未选择'}</strong>
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-slate-600">当日可用度</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-red-500" />
                  <span className="text-slate-600">SLA 阈值 ({site.slaThreshold}%)</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    tickFormatter={val => (val ? String(val).slice(5) : '')}
                  />
                  <YAxis domain={[96.0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs space-y-1">
                            <div className="font-bold text-slate-900 font-mono">{data.date}</div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-500">当日可用度:</span>
                              <span
                                className={`font-mono font-bold ${
                                  data.isBreached ? 'text-red-600' : 'text-emerald-600'
                                }`}
                              >
                                {data.availability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-500">等效中断:</span>
                              <span className="font-mono text-slate-700">
                                {data.interruptionMins} 分钟
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-500">发生事件:</span>
                              <span className="font-mono text-blue-600 font-semibold">
                                {data.eventsCount} 项
                              </span>
                            </div>
                            <div className="text-[10px] text-blue-500 pt-1 border-t border-slate-100">
                              点击锁定并可转入 5 分钟微观打点
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={site.slaThreshold}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: `SLA ${site.slaThreshold}%`,
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
                      const isSelected = payload.date === activeDate;
                      const isBreach = payload.availability < site.slaThreshold;
                      return (
                        <circle
                          key={payload.date}
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 6 : isBreach ? 4.5 : 3.5}
                          fill={isBreach ? '#ef4444' : isSelected ? '#1d4ed8' : '#2563eb'}
                          stroke={isSelected ? '#ffffff' : 'none'}
                          strokeWidth={isSelected ? 2 : 0}
                          className="cursor-pointer transition-all"
                          onClick={() => handleDateClick(payload.date)}
                        />
                      );
                    }}
                    activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Main Split View: Day List & Day Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: 30-Day List Selector */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  8 月每日打点清单 (共 {snapshots.length} 天)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  达标: {snapshots.filter(s => s.availability >= site.slaThreshold).length} 天
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {snapshots.map(s => {
                  const isSelected = s.date === activeDate;
                  const isBreached = s.availability < site.slaThreshold;
                  const hasEvents = s.events && s.events.length > 0;
                  return (
                    <div
                      key={s.date}
                      onClick={() => handleDateClick(s.date)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 shadow-sm'
                          : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isBreached ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                        />
                        <div>
                          <div className="font-bold text-slate-900 font-mono">{s.date}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>等效中断: {s.pcsInterruptionMins}分</span>
                            {hasEvents && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">
                                {s.events.length} 项事件
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-mono font-bold ${
                            isBreached ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {s.availability}%
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {isBreached ? '低于SLA' : '达标'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Day Deep-Dive Inspector */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col h-[520px] overflow-y-auto">
              {selectedSnapshot ? (
                <div className="space-y-4">
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{selectedSnapshot.date} 当日运行深度剖析</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              selectedSnapshot.availability < selectedSnapshot.slaThreshold
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {selectedSnapshot.availability < selectedSnapshot.slaThreshold
                              ? '未达标 (需重点治理)'
                              : 'SLA 履约达标'}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          日界标准: 00:00:00 ~ 23:59:59 (CST) · 严格按 Rule R7 统计
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs text-slate-500">当日可用度</div>
                      <div
                        className={`text-xl font-black ${
                          selectedSnapshot.availability < selectedSnapshot.slaThreshold
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {selectedSnapshot.availability}%
                      </div>
                    </div>
                  </div>

                  {/* Switch to 5-min button */}
                  <div className="p-2.5 rounded bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span>查看当日 288 个 5 分钟高频打点详细走势与 PCS 功率曲线</span>
                    </div>
                    <button
                      onClick={() => setViewMode('5min')}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                    >
                      切换至 5 分钟打点 &rarr;
                    </button>
                  </div>

                  {/* Day KPI Cards */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 font-medium">等效 PCS 中断</span>
                      <div className="font-mono font-bold text-red-600 text-base mt-1">
                        {selectedSnapshot.pcsInterruptionMins} 分钟
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">影响当期可用度</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 font-medium">计划内维护</span>
                      <div className="font-mono font-bold text-blue-600 text-base mt-1">
                        {selectedSnapshot.plannedMaintenanceMins} 分钟
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">免责豁免不扣除 (R2)</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 font-medium">合同 SLA 基线</span>
                      <div className="font-mono font-bold text-slate-900 text-base mt-1">
                        {selectedSnapshot.slaThreshold}%
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        差值:{' '}
                        {(selectedSnapshot.availability - selectedSnapshot.slaThreshold).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Day Events Sequence List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>当日时序事件与告警记录 (Events Log)</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        共 {selectedSnapshot.events ? selectedSnapshot.events.length : 0} 项事件记录
                      </span>
                    </div>

                    {selectedSnapshot.events && selectedSnapshot.events.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSnapshot.events.map((evt, idx) => (
                          <div
                            key={evt.id || idx}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5">
                                {evt.type.includes('alarm') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                    告警
                                  </span>
                                ) : evt.type.includes('workorder') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    工单
                                  </span>
                                ) : evt.type.includes('log') ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    日志
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    预警
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{evt.title}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                                  发生时刻: {selectedSnapshot.date} {evt.time}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {evt.type.includes('alarm') && (
                                <button
                                  onClick={() => onNavigateTab(2)}
                                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-blue-600 font-semibold"
                                >
                                  故障溯源 &rarr;
                                </button>
                              )}
                              {evt.type.includes('workorder') && (
                                <button
                                  onClick={() => onNavigateTab(4)}
                                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-blue-600 font-semibold"
                                >
                                  工单明细 &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-1.5" />
                        <div className="font-semibold text-slate-800">当日运行平稳无非计划事件</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">未触发告警或现场派单</p>
                      </div>
                    )}
                  </div>

                  {/* Action Jump Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">需查看全时段归并因果？</span>
                    <button
                      onClick={() => onNavigateTab(2)}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <span>下钻至归并故障因果时间线 (R11) &rarr;</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">请选择日期进行深度下钻</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

