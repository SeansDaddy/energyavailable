import React, { useState, useMemo } from 'react';
import { Site, WorkOrder, FiveMinAvailabilityPoint } from '../../types';
import { generateFiveMinutePointsForDate, timeToMinutes } from '../../utils/availabilityTimelineGenerator';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Wrench,
  Search,
  Activity,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  Zap,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Area,
  Dot
} from 'recharts';

interface FiveMinAvailabilityDotsViewProps {
  site: Site;
  activeDate: string;
  onChangeDate: (date: string) => void;
  workOrders?: WorkOrder[];
  onNavigateTab: (tabIdx: number) => void;
}

export const FiveMinAvailabilityDotsView: React.FC<FiveMinAvailabilityDotsViewProps> = ({
  site,
  activeDate,
  onChangeDate,
  workOrders = [],
  onNavigateTab
}) => {
  // Time window filter for 288 points
  const [timeWindow, setTimeWindow] = useState<'all' | 'fault_focus' | '00_06' | '06_12' | '12_18' | '18_24'>('fault_focus');
  // Dot status filter for the data table
  const [statusFilter, setStatusFilter] = useState<'all' | 'interrupted' | 'workorder' | 'normal'>('all');
  const [searchTime, setSearchTime] = useState<string>('');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  // Generate 288 5-minute points for activeDate
  const allPoints: FiveMinAvailabilityPoint[] = useMemo(() => {
    return generateFiveMinutePointsForDate(site, activeDate, workOrders);
  }, [site, activeDate, workOrders]);

  // Filter points for chart based on time window
  const chartPoints = useMemo(() => {
    if (timeWindow === '00_06') {
      return allPoints.filter(p => p.index >= 0 && p.index < 72); // 00:00 to 05:55
    }
    if (timeWindow === '06_12') {
      return allPoints.filter(p => p.index >= 72 && p.index < 144); // 06:00 to 11:55
    }
    if (timeWindow === '12_18') {
      return allPoints.filter(p => p.index >= 144 && p.index < 216); // 12:00 to 17:55
    }
    if (timeWindow === '18_24') {
      return allPoints.filter(p => p.index >= 216 && p.index < 288); // 18:00 to 23:55
    }
    if (timeWindow === 'fault_focus') {
      // Find where faults or work orders occur, default to 07:00 to 18:00 (index 84 to 216)
      const faultIndices = allPoints
        .filter(p => p.status !== 'NORMAL')
        .map(p => p.index);
      if (faultIndices.length > 0) {
        const minIdx = Math.max(0, Math.min(...faultIndices) - 12); // -1 hr
        const maxIdx = Math.min(287, Math.max(...faultIndices) + 12); // +1 hr
        return allPoints.filter(p => p.index >= minIdx && p.index <= maxIdx);
      }
      return allPoints.filter(p => p.index >= 84 && p.index <= 216);
    }
    return allPoints; // 'all' (288 points)
  }, [allPoints, timeWindow]);

  // Summary statistics for 288 points
  const stats = useMemo(() => {
    const total = allPoints.length; // 288
    const normalCount = allPoints.filter(p => p.status === 'NORMAL').length;
    const interruptedCount = allPoints.filter(p => p.status === 'FAULT_TRIP').length;
    const workOrderCount = allPoints.filter(p => p.status === 'WORKORDER_ACTIVE').length;
    const maintenanceCount = allPoints.filter(p => p.status === 'MAINTENANCE').length;
    const totalInterruptionMinutes = allPoints.reduce((acc, p) => acc + p.interruptionMins, 0);
    
    // Exact daily availability from 288 5-min dots
    const finalDailyAvailability = Number(
      Math.max(0, Math.min(100, ((1440 - totalInterruptionMinutes) / 1440) * 100)).toFixed(2)
    );

    return {
      total,
      normalCount,
      interruptedCount,
      workOrderCount,
      maintenanceCount,
      totalInterruptionMinutes,
      finalDailyAvailability,
      isBreached: finalDailyAvailability < site.slaThreshold
    };
  }, [allPoints, site.slaThreshold]);

  // Active work order associated with this day for unified single-chart overlay
  const activeOrder = useMemo(() => {
    return (
      workOrders.find(
        w =>
          (w.siteId === site.id || w.siteName === site.siteName || w.contractNo === site.contractNo) &&
          (w.createTime?.startsWith(activeDate) ||
            w.solutionTime?.startsWith(activeDate) ||
            (w.createTime <= `${activeDate} 23:59:59` && w.solutionTime >= `${activeDate} 00:00:00`))
      ) ||
      (activeDate === '2026-08-15' && workOrders.length > 0 ? workOrders[0] : null)
    );
  }, [workOrders, site, activeDate]);

  const orderTimeBounds = useMemo(() => {
    if (!activeOrder || chartPoints.length === 0) return null;
    const startStr = activeOrder.createTime?.slice(11, 16);
    const endStr = activeOrder.solutionTime?.slice(11, 16);
    if (!startStr || !endStr) return null;

    const findClosest = (target: string) => {
      const targetMins = timeToMinutes(target);
      let best = chartPoints[0].time;
      let minDiff = Math.abs(timeToMinutes(best) - targetMins);
      for (const pt of chartPoints) {
        const diff = Math.abs(timeToMinutes(pt.time) - targetMins);
        if (diff < minDiff) {
          minDiff = diff;
          best = pt.time;
        }
      }
      return best;
    };

    return {
      startTime: findClosest(startStr),
      solutionTime: findClosest(endStr),
      exactStartTime: startStr,
      exactSolutionTime: endStr,
      order: activeOrder
    };
  }, [activeOrder, chartPoints]);

  // Filtered points for table display
  const tablePoints = useMemo(() => {
    return allPoints.filter(pt => {
      if (statusFilter === 'interrupted' && pt.status !== 'FAULT_TRIP') return false;
      if (statusFilter === 'workorder' && pt.status !== 'WORKORDER_ACTIVE') return false;
      if (statusFilter === 'normal' && pt.status !== 'NORMAL') return false;
      if (searchTime.trim() && !pt.time.includes(searchTime.trim())) return false;
      return true;
    });
  }, [allPoints, statusFilter, searchTime]);

  const selectedPoint = selectedPointIndex !== null ? allPoints[selectedPointIndex] : null;

  return (
    <div className="space-y-4">
      {/* 5-Min Telemetry Standard Rule Banner */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-full bg-blue-600 text-white shrink-0 mt-0.5 shadow-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>站点可用度 5 分钟高频打点标准规范 (Rule R7 & 5-Min Telemetry Standard)</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                288 点/日
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
              系统以 5 分钟为一个完整采集打点周期，单日 24 小时严格切分为 <strong>288 个可用度离散打点</strong>。
              每个点位实时计算 PCS 额定容量与实际可用容量比率；遇硬件故障或 PCare 工单处置时记录中断分钟数，最终换算当日整体可用度。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <span className="text-slate-500 font-medium">当前打点日期:</span>
          <select
            value={activeDate}
            onChange={e => onChangeDate(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-bold font-mono text-xs shadow-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {(site.dailySnapshots || []).map(s => (
              <option key={s.date} value={s.date}>
                {s.date} (可用度: {s.availability}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 288 Dots High-Level KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">全天 5 分钟打点总数</span>
          <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
            288 <span className="text-xs font-normal text-slate-400">点</span>
          </div>
          <div className="text-[10px] text-slate-400">1440分钟满格采样</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">正常满载打点 (100%)</span>
          <div className="text-xl font-black font-mono text-emerald-600 mt-0.5">
            {stats.normalCount} <span className="text-xs font-normal text-slate-400">点</span>
          </div>
          <div className="text-[10px] text-slate-400">
            占比 {((stats.normalCount / 288) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">故障停机打点 (0%)</span>
          <div className="text-xl font-black font-mono text-red-600 mt-0.5">
            {stats.interruptedCount} <span className="text-xs font-normal text-slate-400">点</span>
          </div>
          <div className="text-[10px] text-slate-400">硬件报警联锁停机</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">PCare 工单排查打点</span>
          <div className="text-xl font-black font-mono text-amber-600 mt-0.5">
            {stats.workOrderCount} <span className="text-xs font-normal text-slate-400">点</span>
          </div>
          <div className="text-[10px] text-slate-400">运维工程师排查中</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">累积扣减等效中断</span>
          <div className="text-xl font-black font-mono text-red-600 mt-0.5">
            {stats.totalInterruptionMinutes} <span className="text-xs font-normal text-slate-400">分</span>
          </div>
          <div className="text-[10px] text-slate-400">等效影响时长</div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">当日 5 分钟换算可用度</span>
          <div
            className={`text-xl font-black font-mono mt-0.5 ${
              stats.isBreached ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {stats.finalDailyAvailability}%
          </div>
          <div className="text-[10px] text-slate-400">
            SLA 阈值: {site.slaThreshold}%
          </div>
        </div>
      </div>

      {/* 5-Min Availability Timeline Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{activeDate} 逐点时序：5 分钟可用度打点与状态走势</span>
              <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                {chartPoints.length} / 288 点已渲染
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              点击图表上的任意打点，即可在下方快速定位并审查该 5 分钟的功率容量与扣减原因。
            </p>
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
            <button
              onClick={() => setTimeWindow('fault_focus')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === 'fault_focus'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              异常重点时段
            </button>
            <button
              onClick={() => setTimeWindow('all')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全天288点
            </button>
            <button
              onClick={() => setTimeWindow('00_06')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === '00_06'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              00-06时 (72点)
            </button>
            <button
              onClick={() => setTimeWindow('06_12')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === '06_12'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              06-12时 (72点)
            </button>
            <button
              onClick={() => setTimeWindow('12_18')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === '12_18'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12-18时 (72点)
            </button>
            <button
              onClick={() => setTimeWindow('18_24')}
              className={`px-2 py-1 rounded transition-colors ${
                timeWindow === '18_24'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              18-24时 (72点)
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>正常运行 (100%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>故障中断 (0%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>PCare工单处置中</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-emerald-600" />
              <span>PCare 方案闭环时刻 (R4)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-red-500" />
              <span>SLA 合同基线 ({site.slaThreshold}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-indigo-500" />
              <span>当日累计可用度走势</span>
            </span>
          </div>

          <span className="font-mono text-slate-400">
            间隔: 5分钟/点 · 采样精度 99.9%
          </span>
        </div>

        {/* Recharts 5-Min Canvas */}
        <div className="h-64 w-full bg-slate-50/40 rounded-lg p-2 border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartPoints}
              margin={{ top: 10, right: 30, left: -10, bottom: 5 }}
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
                interval={Math.max(1, Math.floor(chartPoints.length / 16))}
              />
              <YAxis
                domain={[0, 105]}
                ticks={[0, 25, 50, 75, 90, 100]}
                stroke="#94a3b8"
                tick={{ fontSize: 10 }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt: FiveMinAvailabilityPoint = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs border border-slate-300 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[220px]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-mono">
                          <span className="font-bold text-slate-900">
                            点 #{pt.index + 1} · {pt.time}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              pt.status === 'NORMAL'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : pt.status === 'FAULT_TRIP'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {pt.statusLabel}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">点位可用度:</span>
                            <span
                              className={`font-mono font-bold ${
                                pt.availability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
                              }`}
                            >
                              {pt.availability}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">当日累计可用度:</span>
                            <span className="font-mono text-indigo-600 font-semibold">
                              {pt.cumulativeDayAvailability}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">PCS 可用容量:</span>
                            <span className="font-mono text-slate-700">
                              {pt.pcsAvailableKw} / {pt.pcsTotalKw} kW
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">等效扣减:</span>
                            <span className="font-mono text-slate-700">
                              {pt.interruptionMins} 分钟
                            </span>
                          </div>

                          {pt.hasFaultEvent && (
                            <div className="text-[11px] text-red-600 pt-1 border-t border-red-100 font-medium">
                              ⚠️ 触发故障: {pt.faultEventTitle}
                            </div>
                          )}
                          {pt.isWorkOrderActive && (
                            <div className="text-[11px] text-amber-700 pt-1 border-t border-amber-100 font-medium">
                              🛠️ PCare 处置: {pt.workOrderNo}
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

              {/* PCare Work Order Duration Background Span */}
              {orderTimeBounds && (
                <ReferenceArea
                  {...({
                    x1: orderTimeBounds.startTime,
                    x2: orderTimeBounds.solutionTime,
                    y1: 0,
                    y2: 100,
                    fill: '#fef3c7',
                    fillOpacity: 0.45,
                    stroke: '#f59e0b',
                    strokeDasharray: '3 3'
                  } as any)}
                />
              )}

              {/* PCare Work Order Dispatch Vertical Line */}
              {orderTimeBounds && (
                <ReferenceLine
                  x={orderTimeBounds.startTime}
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    value: `工单派发 ${orderTimeBounds.exactStartTime}`,
                    fill: '#b45309',
                    fontSize: 10,
                    position: 'insideTopLeft'
                  }}
                />
              )}

              {/* PCare Work Order Closed-Loop (Rule R4 方案输出即闭环) Vertical Line */}
              {orderTimeBounds && (
                <ReferenceLine
                  x={orderTimeBounds.solutionTime}
                  stroke="#059669"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: `★ PCare闭环 ${orderTimeBounds.exactSolutionTime} (R4)`,
                    fill: '#047857',
                    fontSize: 10,
                    fontWeight: 'bold',
                    position: 'insideTopRight'
                  }}
                />
              )}

              {/* Instant 5-Min Point Step Line */}
              <Line
                type="stepAfter"
                dataKey="availability"
                stroke="#2563eb"
                strokeWidth={2}
                dot={props => {
                  const { cx, cy, payload } = props;
                  const isSelected = selectedPointIndex === payload.index;
                  let color = '#10b981';
                  if (payload.status === 'FAULT_TRIP') color = '#ef4444';
                  else if (payload.status === 'WORKORDER_ACTIVE') color = '#f59e0b';
                  else if (payload.status === 'MAINTENANCE') color = '#3b82f6';

                  return (
                    <circle
                      key={payload.time}
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 6 : payload.hasFaultEvent ? 5 : 2.5}
                      fill={color}
                      stroke={isSelected ? '#ffffff' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                      className="cursor-pointer transition-all"
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
              />

              {/* Cumulative Day Availability Line */}
              <Line
                type="monotone"
                dataKey="cumulativeDayAvailability"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Point Detail Callout (When selected) */}
      {selectedPoint && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-900">
                已锁定 5 分钟打点: 点位 #{selectedPoint.index + 1} ({selectedPoint.timestamp})
              </span>
              <span className={`px-2 py-0.2 rounded font-bold text-[10px] ${
                selectedPoint.status === 'NORMAL'
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedPoint.status === 'FAULT_TRIP'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedPoint.statusLabel}
              </span>
            </div>
            <button
              onClick={() => setSelectedPointIndex(null)}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline"
            >
              取消锁定
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div>
              <span className="text-slate-500">点位可用度:</span>
              <div className="font-mono font-bold text-slate-900">{selectedPoint.availability}%</div>
            </div>
            <div>
              <span className="text-slate-500">PCS 可用容量:</span>
              <div className="font-mono font-bold text-slate-900">
                {selectedPoint.pcsAvailableKw} kW / {selectedPoint.pcsTotalKw} kW
              </div>
            </div>
            <div>
              <span className="text-slate-500">等效扣减时长:</span>
              <div className="font-mono font-bold text-red-600">
                {selectedPoint.interruptionMins} 分钟 / 5分钟周期
              </div>
            </div>
            <div>
              <span className="text-slate-500">当日累计达标率:</span>
              <div className="font-mono font-bold text-indigo-600">
                {selectedPoint.cumulativeDayAvailability}%
              </div>
            </div>
          </div>

          {selectedPoint.faultEventTitle && (
            <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200 flex items-center justify-between">
              <span>关联故障: {selectedPoint.faultEventTitle}</span>
              <button
                onClick={() => onNavigateTab(2)}
                className="text-red-700 hover:underline font-semibold"
              >
                下钻故障时间线 &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* 288 Dots Grid / Table Inspection Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">
              5 分钟高精度打点全量台账清单 (共 288 点)
            </span>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-0.5 rounded text-xs font-medium">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部 ({allPoints.length})
              </button>
              <button
                onClick={() => setStatusFilter('interrupted')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  statusFilter === 'interrupted' ? 'bg-white text-red-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                故障中断 ({stats.interruptedCount})
              </button>
              <button
                onClick={() => setStatusFilter('workorder')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  statusFilter === 'workorder' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                工单处置 ({stats.workOrderCount})
              </button>
              <button
                onClick={() => setStatusFilter('normal')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  statusFilter === 'normal' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                正常 ({stats.normalCount})
              </button>
            </div>

            {/* Quick Time Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="搜索时间如 09:15..."
                value={searchTime}
                onChange={e => setSearchTime(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs border border-slate-300 rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 w-36"
              />
            </div>
          </div>
        </div>

        {/* Dots Table Container */}
        <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-md">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
              <tr>
                <th className="py-2 px-3">打点序号</th>
                <th className="py-2 px-3">时刻 (5分钟槽)</th>
                <th className="py-2 px-3">点位可用度</th>
                <th className="py-2 px-3">运行状态</th>
                <th className="py-2 px-3">PCS 可用容量</th>
                <th className="py-2 px-3">等效扣减</th>
                <th className="py-2 px-3">当日累计可用度</th>
                <th className="py-2 px-3">关联事件 / 工单</th>
                <th className="py-2 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {tablePoints.map(pt => {
                const isSelected = selectedPointIndex === pt.index;
                return (
                  <tr
                    key={pt.index}
                    onClick={() => setSelectedPointIndex(pt.index)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 font-bold'
                        : pt.status === 'FAULT_TRIP'
                        ? 'bg-red-50/40 hover:bg-red-50/70'
                        : pt.status === 'WORKORDER_ACTIVE'
                        ? 'bg-amber-50/40 hover:bg-amber-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-1.5 px-3 text-slate-500">#{pt.index + 1}</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-800">{pt.time}</td>
                    <td className="py-1.5 px-3">
                      <span
                        className={`font-bold ${
                          pt.availability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {pt.availability}%
                      </span>
                    </td>
                    <td className="py-1.5 px-3">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-bold ${
                          pt.status === 'NORMAL'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : pt.status === 'FAULT_TRIP'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {pt.statusLabel}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-700">
                      {pt.pcsAvailableKw} / {pt.pcsTotalKw} kW
                    </td>
                    <td className="py-1.5 px-3 text-slate-700">
                      {pt.interruptionMins > 0 ? (
                        <span className="text-red-600 font-bold">-{pt.interruptionMins} 分钟</span>
                      ) : (
                        <span className="text-slate-400">0 分钟</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-indigo-600 font-semibold">
                      {pt.cumulativeDayAvailability}%
                    </td>
                    <td className="py-1.5 px-3 font-sans text-slate-600 text-[11px] truncate max-w-[240px]">
                      {pt.hasFaultEvent ? (
                        <span className="text-red-600 font-medium">⚠️ {pt.faultEventTitle}</span>
                      ) : pt.isWorkOrderActive ? (
                        <span className="text-amber-700 font-medium">🛠️ {pt.workOrderNo} (排查)</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedPointIndex(pt.index);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-sans font-medium"
                      >
                        查看打点
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
