import React, { useState, useMemo, useEffect } from 'react';
import { Site, WorkOrder } from '../../types';
import {
  PeriodDeviceStatus,
  AvailabilityAlarmItem,
  DeviceFiveMinStatusPoint,
  generateDeviceFiveMinutePointsForDate
} from '../../utils/equipmentAndAlarmsGenerator';
import { timeToMinutes } from '../../utils/availabilityTimelineGenerator';
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Layers,
  ZapOff,
  ArrowRight,
  Calendar,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

interface DeviceFiveMinDotsPanelProps {
  site: Site;
  device: PeriodDeviceStatus;
  alarms: AvailabilityAlarmItem[];
  workOrders?: WorkOrder[];
  targetDate: string;
  availableDates?: string[];
  onDrilldownToCausalChain?: (deviceCode?: string) => void;
  compact?: boolean;
}

export const DeviceFiveMinDotsPanel: React.FC<DeviceFiveMinDotsPanelProps> = ({
  site,
  device,
  alarms,
  workOrders = [],
  targetDate,
  availableDates = [],
  onDrilldownToCausalChain,
  compact = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(targetDate);
  const [displayMode, setDisplayMode] = useState<'all' | 'chart' | 'table'>('all');
  const [timeWindow, setTimeWindow] = useState<
    'fault_focus' | 'all' | '00_06' | '06_12' | '12_18' | '18_24' | 'custom'
  >('fault_focus');
  const [customStartTime, setCustomStartTime] = useState<string>('08:00');
  const [customEndTime, setCustomEndTime] = useState<string>('18:00');
  const [showPowerOverlay, setShowPowerOverlay] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'fault' | 'warning' | 'eco' | 'normal'
  >('all');
  const [searchTime, setSearchTime] = useState<string>('');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedDate(targetDate);
    setSelectedPointIndex(null);
  }, [targetDate, device.deviceCode]);

  // Generate 288 5-min points for this device on selectedDate
  const allPoints: DeviceFiveMinStatusPoint[] = useMemo(() => {
    return generateDeviceFiveMinutePointsForDate(
      site,
      device,
      selectedDate,
      alarms,
      workOrders
    );
  }, [site, device, selectedDate, alarms, workOrders]);

  // Summary metrics across all 288 points
  const stats = useMemo(() => {
    const totalCount = allPoints.length;
    const faultCount = allPoints.filter(
      p => p.status === 'FAULT_TRIP' || p.status === 'WORKORDER_ACTIVE'
    ).length;
    const warningCount = allPoints.filter(p => p.status === 'WARNING').length;
    const ecoCount = allPoints.filter(p => p.status === 'ECO_OUTAGE').length;
    const maintCount = allPoints.filter(p => p.status === 'MAINTENANCE').length;
    const normalCount = allPoints.filter(p => p.status === 'NORMAL').length;
    const totalInterruptionMins = Number(
      allPoints.reduce((acc, cur) => acc + cur.interruptionMins, 0).toFixed(1)
    );
    const finalAvailability =
      allPoints.length > 0
        ? allPoints[allPoints.length - 1].cumulativeDeviceAvailability
        : 100;

    return {
      totalCount,
      faultCount,
      warningCount,
      ecoCount,
      maintCount,
      normalCount,
      totalInterruptionMins,
      finalAvailability,
      isBreached: finalAvailability < site.slaThreshold
    };
  }, [allPoints, site.slaThreshold]);

  // Filter points for chart
  const chartPoints = useMemo(() => {
    if (timeWindow === '00_06') return allPoints.filter(p => p.index < 72);
    if (timeWindow === '06_12') return allPoints.filter(p => p.index >= 72 && p.index < 144);
    if (timeWindow === '12_18') return allPoints.filter(p => p.index >= 144 && p.index < 216);
    if (timeWindow === '18_24') return allPoints.filter(p => p.index >= 216);
    if (timeWindow === 'custom') {
      const sMin = timeToMinutes(customStartTime);
      const eMin = timeToMinutes(customEndTime);
      return allPoints.filter(p => {
        const ptMin = timeToMinutes(p.time);
        return ptMin >= sMin && ptMin <= eMin;
      });
    }
    if (timeWindow === 'fault_focus') {
      const abnormalIndices = allPoints
        .filter(p => p.status !== 'NORMAL')
        .map(p => p.index);
      if (abnormalIndices.length > 0) {
        const minIdx = Math.max(0, Math.min(...abnormalIndices) - 10);
        const maxIdx = Math.min(287, Math.max(...abnormalIndices) + 10);
        return allPoints.filter(p => p.index >= minIdx && p.index <= maxIdx);
      }
      return allPoints.filter(p => p.index >= 84 && p.index <= 216);
    }
    return allPoints;
  }, [allPoints, timeWindow, customStartTime, customEndTime]);

  // ECO ReferenceArea bounds inside current chartPoints
  const ecoBounds = useMemo(() => {
    const ecoPts = chartPoints.filter(p => p.status === 'ECO_OUTAGE');
    if (ecoPts.length === 0) return null;
    return {
      startTime: ecoPts[0].time,
      endTime: ecoPts[ecoPts.length - 1].time
    };
  }, [chartPoints]);

  // Filtered points for table
  const tablePoints = useMemo(() => {
    return allPoints.filter(p => {
      if (statusFilter === 'fault' && p.status !== 'FAULT_TRIP' && p.status !== 'WORKORDER_ACTIVE') {
        return false;
      }
      if (statusFilter === 'warning' && p.status !== 'WARNING') return false;
      if (statusFilter === 'eco' && p.status !== 'ECO_OUTAGE') return false;
      if (statusFilter === 'normal' && p.status !== 'NORMAL') return false;
      if (searchTime.trim()) {
        return p.time.includes(searchTime.trim()) || `#${p.index + 1}`.includes(searchTime.trim());
      }
      return true;
    });
  }, [allPoints, statusFilter, searchTime]);

  const selectedPoint = selectedPointIndex !== null ? allPoints[selectedPointIndex] || null : null;
  const maxPowerKw = Math.max(100, ...allPoints.map(p => p.ratedPowerKw));

  const getDotColor = (status: DeviceFiveMinStatusPoint['status']) => {
    if (status === 'FAULT_TRIP' || status === 'WORKORDER_ACTIVE') return '#dc2626';
    if (status === 'WARNING') return '#d97706';
    if (status === 'ECO_OUTAGE') return '#0891b2';
    if (status === 'MAINTENANCE') return '#2563eb';
    return '#16a34a';
  };

  return (
    <div className="space-y-4">
      {/* Header & Device + Date Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900">
              {device.deviceName} · 5分钟状态打点与走势
            </h4>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {device.deviceCode} · {device.model} · {selectedDate} (288点)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            参考站级可用度打点口径，按 5 分钟时间槽还原单设备运行工况、出力走势、等效停运扣减与 SLA 免责时段。
          </p>
        </div>

        {/* Date Selector & Display Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {availableDates.length > 1 ? (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setSelectedPointIndex(null);
                }}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {availableDates.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setSelectedPointIndex(null);
                  }
                }}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setDisplayMode('all')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                displayMode === 'all'
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              曲线 + 表格
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('chart')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                displayMode === 'chart'
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              状态打点曲线
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                displayMode === 'table'
                  ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              打点明细表 (288)
            </button>
          </div>
        </div>
      </div>

      {/* 5-Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-slate-500">设备当日 5 分钟可用度</div>
          <div
            className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
              stats.isBreached ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {stats.finalAvailability}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            SLA 门槛: {site.slaThreshold}%
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-slate-500">正常运行打点</div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-0.5">
            {stats.normalCount} <span className="text-xs font-normal text-slate-500">/ {stats.totalCount}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            占比 {((stats.normalCount / Math.max(1, stats.totalCount)) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-slate-500">故障停运 / 预警打点</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
            <span className={stats.faultCount > 0 ? 'text-red-600' : 'text-slate-800'}>
              {stats.faultCount}
            </span>
            <span className="text-slate-400 mx-1">/</span>
            <span className={stats.warningCount > 0 ? 'text-amber-600' : 'text-slate-800'}>
              {stats.warningCount}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            故障打点 · 告警预警打点
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-slate-500">ECO 外因 / 定检免责点</div>
          <div className="text-lg font-bold font-mono tabular-nums text-cyan-700 mt-0.5">
            {stats.ecoCount + stats.maintCount} <span className="text-xs font-normal text-slate-500">点</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            ECO {stats.ecoCount} 点 · 检修 {stats.maintCount} 点
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-slate-500">当日考核扣减时长</div>
          <div className="text-lg font-bold font-mono tabular-nums text-red-600 mt-0.5">
            {stats.totalInterruptionMins} <span className="text-xs font-normal text-slate-500">分钟</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {stats.totalInterruptionMins > 0 ? '已计入设备可用度扣减' : '无责任停机扣减'}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. 5分钟状态打点曲线图                                         */}
      {/* ============================================================ */}
      {(displayMode === 'chart' || displayMode === 'all') && (
        <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <Activity className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                5分钟状态打点曲线图（{selectedDate}）
              </span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                渲染 {chartPoints.length} / 288 点 · 5分钟/点
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle power overlay */}
              <button
                type="button"
                onClick={() => setShowPowerOverlay(prev => !prev)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors whitespace-nowrap ${
                  showPowerOverlay
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {showPowerOverlay ? '已叠加出力曲线 (kW)' : '叠加出力曲线 (kW)'}
              </button>

              {/* Time Window Presets */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs flex-wrap">
                {[
                  { id: 'fault_focus', label: '异常重点时段' },
                  { id: 'all', label: '全天288点' },
                  { id: '00_06', label: '00-06时' },
                  { id: '06_12', label: '06-12时' },
                  { id: '12_18', label: '12-18时' },
                  { id: '18_24', label: '18-24时' },
                  { id: 'custom', label: '自定义' }
                ].map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setTimeWindow(w.id as any);
                      setSelectedPointIndex(null);
                    }}
                    className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
                      timeWindow === w.id
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {timeWindow === 'custom' && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs flex-wrap">
              <span className="text-slate-700 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>时段区间:</span>
              </span>
              <input
                type="time"
                value={customStartTime}
                onChange={e => setCustomStartTime(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs text-slate-800"
              />
              <span className="text-slate-500">至</span>
              <input
                type="time"
                value={customEndTime}
                onChange={e => setCustomEndTime(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-xs text-slate-800"
              />
              <span className="text-slate-500 font-mono tabular-nums">
                共 {chartPoints.length} 个打点 ({chartPoints.length * 5} 分钟)
              </span>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>正常运行 (100%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span>告警预警/降额</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>故障停运 (0%)</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-800">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                <span>ECO外因停机 (免责)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500" />
                <span>SLA 基线 ({site.slaThreshold}%)</span>
              </span>
              {showPowerOverlay && (
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500" />
                  <span>设备实时出力 (kW)</span>
                </span>
              )}
            </div>
            <span className="text-slate-400">点击曲线打点可锁定查看对应表格行</span>
          </div>

          {/* Chart */}
          <div className={`${compact ? 'h-56' : 'h-64'} w-full bg-slate-50/40 rounded-lg p-2 border border-slate-100`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartPoints}
                margin={{ top: 10, right: showPowerOverlay ? 15 : 30, left: -10, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedPointIndex(e.activePayload[0].payload.index);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                  interval={Math.max(1, Math.floor(chartPoints.length / 14))}
                />
                <YAxis
                  yAxisId="avail"
                  domain={[0, 105]}
                  ticks={[0, 25, 50, 75, 90, 100]}
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  unit="%"
                />
                {showPowerOverlay && (
                  <YAxis
                    yAxisId="power"
                    orientation="right"
                    domain={[0, Math.ceil(maxPowerKw * 1.15)]}
                    stroke="#6366f1"
                    tick={{ fontSize: 10 }}
                    unit="kW"
                    width={52}
                  />
                )}
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt: DeviceFiveMinStatusPoint = payload[0].payload;
                      return (
                        <div className="bg-white/95 border border-slate-300 p-3 rounded-lg shadow-lg text-xs space-y-1.5 min-w-[230px]">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-mono tabular-nums">
                            <span className="font-bold text-slate-900">
                              点 #{pt.index + 1} · {pt.time}
                            </span>
                            <span className="font-semibold text-slate-700">{pt.statusLabel}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">点位可用度:</span>
                              <span
                                className={`font-mono tabular-nums font-bold ${
                                  pt.availability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
                                }`}
                              >
                                {pt.availability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">设备实时出力:</span>
                              <span className="font-mono tabular-nums text-indigo-700 font-semibold">
                                {pt.powerKw} / {pt.ratedPowerKw} kW
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">当日累计可用度:</span>
                              <span className="font-mono tabular-nums text-slate-800 font-semibold">
                                {pt.cumulativeDeviceAvailability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">等效停运扣减:</span>
                              <span className="font-mono tabular-nums text-slate-700">
                                {pt.interruptionMins} 分钟
                              </span>
                            </div>
                            {pt.alarmTitle && (
                              <div className="text-[11px] text-slate-700 pt-1 border-t border-slate-100">
                                {pt.alarmCode ? `[${pt.alarmCode}] ` : ''}{pt.alarmTitle}
                              </div>
                            )}
                            {pt.ecoReason && (
                              <div className="text-[11px] text-cyan-800 pt-1 border-t border-cyan-100">
                                {pt.ecoReason}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <ReferenceLine
                  yAxisId="avail"
                  y={site.slaThreshold}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `SLA ${site.slaThreshold}%`,
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideTopRight'
                  }}
                />

                {ecoBounds && (
                  <ReferenceArea
                    {...({
                      yAxisId: 'avail',
                      x1: ecoBounds.startTime,
                      x2: ecoBounds.endTime,
                      y1: 0,
                      y2: 100,
                      fill: '#cffafe',
                      fillOpacity: 0.35,
                      stroke: '#06b6d4',
                      strokeDasharray: '3 3'
                    } as any)}
                  />
                )}

                {showPowerOverlay && (
                  <Area
                    yAxisId="power"
                    type="monotone"
                    dataKey="powerKw"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    fill="#6366f1"
                    fillOpacity={0.07}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}

                <Line
                  yAxisId="avail"
                  type="stepAfter"
                  dataKey="availability"
                  stroke="#2563eb"
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={props => {
                    const { cx, cy, payload } = props;
                    if (cx === undefined || cy === undefined) return <g key={payload.index} />;
                    const isSelected = selectedPointIndex === payload.index;
                    const color = getDotColor(payload.status);
                    const isAbnormal = payload.status !== 'NORMAL';

                    return (
                      <circle
                        key={payload.index}
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : isAbnormal ? 4.5 : 2.5}
                        fill={color}
                        stroke={isSelected ? '#0f172a' : '#ffffff'}
                        strokeWidth={isSelected ? 2 : 0.75}
                        className="cursor-pointer"
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Selected Point Lock Callout */}
      {selectedPoint && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-bold text-slate-900 font-mono tabular-nums">
              已锁定打点 #{selectedPoint.index + 1} · {selectedPoint.timestamp}
            </span>
            <span className="font-semibold text-slate-800">{selectedPoint.statusLabel}</span>
            <span className="font-mono tabular-nums text-slate-700">
              可用度: <strong>{selectedPoint.availability}%</strong>
            </span>
            <span className="font-mono tabular-nums text-slate-700">
              出力: <strong>{selectedPoint.powerKw} kW</strong>
            </span>
            <span className="font-mono tabular-nums text-slate-700">
              扣减: <strong>{selectedPoint.interruptionMins} 分钟</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {selectedPoint.alarmTitle && onDrilldownToCausalChain && (
              <button
                type="button"
                onClick={() => onDrilldownToCausalChain(device.deviceCode)}
                className="text-blue-700 hover:underline font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                <span>下钻告警溯源</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedPointIndex(null)}
              className="text-slate-500 hover:text-slate-900 underline whitespace-nowrap"
            >
              取消锁定
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. 5分钟状态打点明细表                                         */}
      {/* ============================================================ */}
      {(displayMode === 'table' || displayMode === 'all') && (
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                5分钟状态打点明细表（{selectedDate} · 共 {tablePoints.length} / {allPoints.length} 条）
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-md text-xs">
                {[
                  { id: 'all', label: `全部 (${allPoints.length})` },
                  { id: 'fault', label: `故障 (${stats.faultCount})` },
                  { id: 'warning', label: `预警 (${stats.warningCount})` },
                  { id: 'eco', label: `ECO外因 (${stats.ecoCount})` },
                  { id: 'normal', label: `正常 (${stats.normalCount})` }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                      statusFilter === f.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="搜索时间如 09:15..."
                  value={searchTime}
                  onChange={e => setSearchTime(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:border-blue-500 w-36"
                />
              </div>
            </div>
          </div>

          <div className={`${compact ? 'max-h-72' : 'max-h-80'} overflow-y-auto`}>
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
                <tr>
                  <th className="py-2 px-3">打点序号</th>
                  <th className="py-2 px-3">时刻 (5分钟槽)</th>
                  <th className="py-2 px-3">设备状态</th>
                  <th className="py-2 px-3 text-right">点位可用度</th>
                  <th className="py-2 px-3 text-right">实时出力</th>
                  <th className="py-2 px-3 text-right">等效扣减</th>
                  <th className="py-2 px-3 text-right">累计可用度</th>
                  <th className="py-2 px-3">关联告警 / 工单说明</th>
                  <th className="py-2 px-3 text-right">定位</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {tablePoints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center font-sans text-slate-400">
                      当前筛选条件下无匹配的 5 分钟打点记录
                    </td>
                  </tr>
                ) : (
                  tablePoints.map(pt => {
                    const isSelected = selectedPointIndex === pt.index;
                    const isFault = pt.status === 'FAULT_TRIP' || pt.status === 'WORKORDER_ACTIVE';
                    const isWarn = pt.status === 'WARNING';
                    const isEco = pt.status === 'ECO_OUTAGE';
                    const isMaint = pt.status === 'MAINTENANCE';

                    return (
                      <tr
                        key={pt.index}
                        onClick={() => setSelectedPointIndex(pt.index)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 font-semibold'
                            : isFault
                            ? 'bg-red-50/40 hover:bg-red-50/70'
                            : isWarn
                            ? 'bg-amber-50/40 hover:bg-amber-50/70'
                            : isEco
                            ? 'bg-cyan-50/40 hover:bg-cyan-50/70'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-500">#{pt.index + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{pt.time}</td>
                        <td className="py-2 px-3 font-sans">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              isFault
                                ? 'text-red-700'
                                : isWarn
                                ? 'text-amber-700'
                                : isEco
                                ? 'text-cyan-800'
                                : isMaint
                                ? 'text-blue-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {isEco && <ZapOff className="w-3 h-3 shrink-0" />}
                            {isFault && <AlertTriangle className="w-3 h-3 shrink-0" />}
                            {!isEco && !isFault && (
                              <CheckCircle2 className="w-3 h-3 shrink-0 opacity-80" />
                            )}
                            <span>{pt.statusLabel}</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`font-bold ${
                              pt.availability < site.slaThreshold ? 'text-red-600' : 'text-emerald-700'
                            }`}
                          >
                            {pt.availability}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700">
                          {pt.powerKw} / {pt.ratedPowerKw} kW
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isEco || isMaint ? (
                            <span className="text-cyan-700">免责 0 分</span>
                          ) : pt.interruptionMins > 0 ? (
                            <span className="text-red-600 font-bold">-{pt.interruptionMins} 分</span>
                          ) : (
                            <span className="text-slate-400">0 分</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-indigo-700 font-semibold">
                          {pt.cumulativeDeviceAvailability}%
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-600 text-[11px] max-w-[260px] truncate">
                          {pt.alarmTitle ? (
                            <span>
                              {pt.alarmCode ? `[${pt.alarmCode}] ` : ''}
                              {pt.alarmTitle}
                              {pt.workOrderNo ? ` · ${pt.workOrderNo}` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedPointIndex(pt.index);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                          >
                            锁定打点
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
