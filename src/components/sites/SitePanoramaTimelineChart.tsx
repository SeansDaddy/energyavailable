import React, { useState, useMemo } from 'react';
import { Site, WorkOrder } from '../../types';
import {
  buildPanoramaTimelineData,
  minutesToTime,
  timeToMinutes
} from '../../utils/availabilityTimelineGenerator';
import {
  Activity,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
  Calendar,
  ShieldAlert,
  HelpCircle,
  FileCheck
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

interface SitePanoramaTimelineChartProps {
  site: Site;
  workOrders?: WorkOrder[];
  onNavigateTab: (tabIdx: number) => void;
  onSelectDay?: (date: string) => void;
}

export const SitePanoramaTimelineChart: React.FC<SitePanoramaTimelineChartProps> = ({
  site,
  workOrders = [],
  onNavigateTab,
  onSelectDay
}) => {
  // Available dates from site's daily snapshots
  const availableDates = useMemo(() => {
    if (site.dailySnapshots && site.dailySnapshots.length > 0) {
      return site.dailySnapshots.map(s => s.date);
    }
    return ['2026-08-15', '2026-08-16', '2026-08-17'];
  }, [site]);

  // Default to 2026-08-15 (day with primary merged fault and PCare work order) or first day with breach
  const defaultDate = useMemo(() => {
    const faultDay = availableDates.find(d => d === '2026-08-15');
    if (faultDay) return faultDay;
    const breachDay = site.dailySnapshots?.find(s => s.availability < s.slaThreshold);
    if (breachDay) return breachDay.date;
    return availableDates[availableDates.length - 1] || '2026-08-15';
  }, [availableDates, site]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [timeZoom, setTimeZoom] = useState<'all' | 'focus' | 'morning' | 'afternoon'>('focus');
  const [simulationOffsetMins, setSimulationOffsetMins] = useState<number>(0); // -60m to +60m sandbox

  // Generate full panoramic dataset for this date
  const panoramaData = useMemo(() => {
    return buildPanoramaTimelineData(site, selectedDate, workOrders);
  }, [site, selectedDate, workOrders]);

  // Filter time series based on zoom
  const filteredTimeSeries = useMemo(() => {
    const raw = panoramaData.timeSeries;
    if (timeZoom === 'morning') {
      return raw.filter(pt => {
        const m = timeToMinutes(pt.time);
        return m >= 360 && m <= 720; // 06:00 to 12:00
      });
    }
    if (timeZoom === 'afternoon') {
      return raw.filter(pt => {
        const m = timeToMinutes(pt.time);
        return m >= 720 && m <= 1080; // 12:00 to 18:00
      });
    }
    if (timeZoom === 'focus') {
      // Focus on fault & work order period (07:00 to 18:00)
      return raw.filter(pt => {
        const m = timeToMinutes(pt.time);
        return m >= 420 && m <= 1080;
      });
    }
    return raw; // 'all' (00:00 to 23:55)
  }, [panoramaData.timeSeries, timeZoom]);

  // Work order and fault info for visualization
  const currentFault = panoramaData.faultEvents[0];
  const currentOrder = panoramaData.workOrders[0];

  // Closest times for precise Recharts chart snapping
  const orderTimeBounds = useMemo(() => {
    if (!currentOrder || filteredTimeSeries.length === 0) return null;
    const startStr = currentOrder.createTime?.slice(11, 16);
    const endStr = currentOrder.solutionTime?.slice(11, 16);
    if (!startStr || !endStr) return null;

    const findClosest = (target: string) => {
      const targetMins = timeToMinutes(target);
      let best = filteredTimeSeries[0].time;
      let minDiff = Math.abs(timeToMinutes(best) - targetMins);
      for (const pt of filteredTimeSeries) {
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
      order: currentOrder
    };
  }, [currentOrder, filteredTimeSeries]);

  // Simulated metrics calculation
  const simDowntime = Math.max(0, panoramaData.conversionMetrics.faultDowntimeMinutes + simulationOffsetMins);
  const simAvailability = Number(
    Math.max(0, Math.min(100, ((1440 - simDowntime) / 1440) * 100)).toFixed(2)
  );
  const simMonthAvailability = Number(
    (site.currentAvailability + (simAvailability - panoramaData.conversionMetrics.effectiveAvailability) / 30).toFixed(2)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
      {/* Header & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-600 text-white shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              全景时空态势：设备故障打点 · PCare 工单持续时间 · 可用度换算推演图
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
              Rule R4 & R11 因果联动
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            将<strong>设备硬件故障打点时间</strong>与<strong>PCare 离线工单排查处置持续时间 (Rule R4 方案输出即闭环)</strong>
            深度结合，全景呈现 5 分钟可用度打点跌落、恢复与最终换算推演过程。
          </p>
        </div>

        {/* Date Selector and Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">全景日期:</span>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none font-mono cursor-pointer"
            >
              {availableDates.map(d => {
                const snap = site.dailySnapshots?.find(s => s.date === d);
                const hasBreach = snap && snap.availability < snap.slaThreshold;
                return (
                  <option key={d} value={d}>
                    {d} {hasBreach ? '⚠️ (可用度跌破)' : '✅ (达标)'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Time Zoom Controls */}
          <div className="flex items-center bg-slate-100 rounded p-0.5 text-xs font-medium">
            <button
              onClick={() => setTimeZoom('focus')}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeZoom === 'focus' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              焦点时段 (07-18h)
            </button>
            <button
              onClick={() => setTimeZoom('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeZoom === 'all' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全天24h (288点)
            </button>
            <button
              onClick={() => setTimeZoom('morning')}
              className={`px-2 py-1 rounded transition-colors ${
                timeZoom === 'morning' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              上午 (06-12h)
            </button>
            <button
              onClick={() => setTimeZoom('afternoon')}
              className={`px-2 py-1 rounded transition-colors ${
                timeZoom === 'afternoon' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              下午 (12-18h)
            </button>
          </div>
        </div>
      </div>

      {/* Panorama Legend & Milestone Indicators Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric 1: Equipment Fault Point */}
        <div className="p-3 rounded-lg border border-red-200 bg-red-50/60 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>设备故障打点时刻</span>
            </div>
            <div className="text-xs font-mono font-bold text-red-700">
              {currentFault ? `${currentFault.triggerTime} ~ ${currentFault.recoverTime?.slice(11)}` : '无非计划停运'}
            </div>
            <div className="text-[11px] text-red-800 line-clamp-1">
              {currentFault ? currentFault.title : '设备满载正常运行'}
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white text-red-700 border border-red-200 shrink-0">
            {currentFault ? `影响 ${currentFault.equivalentInterruptionMinutes} 分钟` : '0 分钟'}
          </span>
        </div>

        {/* Metric 2: PCare Work Order Duration Span */}
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              <span>PCare 工单持续时间跨度 (R4)</span>
            </div>
            <div className="text-xs font-mono font-bold text-amber-800">
              {currentOrder ? `${currentOrder.createTime.slice(11)} 派发 → ${currentOrder.solutionTime.slice(11)} 方案闭环` : '无关联工单'}
            </div>
            <div className="text-[11px] text-amber-800">
              {currentOrder ? `负责人: ${currentOrder.assignee} · 方案输出即闭环` : '运行平稳无需现场派单'}
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white text-amber-700 border border-amber-200 shrink-0">
            {currentOrder ? `耗时 ${currentOrder.durationMinutes} 分钟` : '0 分钟'}
          </span>
        </div>

        {/* Metric 3: Final Availability Conversion */}
        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>当日最终换算可用度</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-black font-mono ${
                panoramaData.conversionMetrics.effectiveAvailability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {panoramaData.conversionMetrics.effectiveAvailability}%
              </span>
              <span className="text-[11px] text-slate-500">
                (SLA 基线: {site.slaThreshold}%)
              </span>
            </div>
            <div className="text-[11px] text-blue-800 font-mono">
              Gap: {panoramaData.conversionMetrics.slaGap >= 0 ? `+${panoramaData.conversionMetrics.slaGap}%` : `${panoramaData.conversionMetrics.slaGap}%`}
            </div>
          </div>
          <button
            onClick={() => {
              if (onSelectDay) onSelectDay(selectedDate);
              onNavigateTab(1); // Jump to 5-min dots tab
            }}
            className="text-[11px] px-2 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold flex items-center gap-0.5 transition-colors self-end"
          >
            <span>5分钟打点明细</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Combined Chart */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 px-1 gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-1 bg-blue-600 rounded" />
              <span>站点可用度时间打点走势 (%)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-1 bg-red-500 rounded" />
              <span>SLA 合同阈值 ({site.slaThreshold}%)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white" />
              <span>故障触发打点</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-2 bg-amber-200/80 border border-amber-400 rounded-xs" />
              <span>PCare工单处置历程时段</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-600" />
              <span className="font-bold">PCare 方案闭环时刻标线 (R4)</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredTimeSeries.length} 个连续时序点 (5分钟粒度)
          </span>
        </div>

        <div className="h-72 w-full bg-slate-50/50 rounded-lg p-2 border border-slate-100 relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredTimeSeries} margin={{ top: 20, right: 35, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval={Math.max(1, Math.floor(filteredTimeSeries.length / 14))}
              />
              <YAxis
                domain={[0, 105]}
                ticks={[0, 25, 50, 75, 90, 100]}
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#64748b' }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isClosedLoopPoint = orderTimeBounds && data.time === orderTimeBounds.solutionTime;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs border border-slate-300 p-3 rounded-lg shadow-xl text-xs space-y-2 min-w-[250px]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-slate-900 font-mono">{data.timestamp}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              data.availability < site.slaThreshold
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {data.availability < site.slaThreshold ? '跌破SLA' : '正常达标'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">点位可用度:</span>
                            <span className="font-mono font-bold text-blue-600 text-sm">
                              {data.availability}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">合同SLA线:</span>
                            <span className="font-mono text-slate-700">{site.slaThreshold}%</span>
                          </div>

                          {data.hasFaultMarker && (
                            <div className="pt-1 mt-1 border-t border-red-100 text-red-600 flex items-start gap-1 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>触发硬件故障: {data.faultTitle || 'PCS 跳闸停机'}</span>
                            </div>
                          )}

                          {data.workOrderActive && (
                            <div className="pt-1 mt-1 border-t border-amber-100 text-amber-700 flex items-start gap-1 font-medium">
                              <Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>PCare处置中: {data.workOrderNo}</span>
                            </div>
                          )}

                          {isClosedLoopPoint && (
                            <div className="pt-1 mt-1 border-t border-emerald-100 text-emerald-700 flex items-start gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>★ PCare 方案闭环时刻: 恢复满额受控运行</span>
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          同图坐标：5分钟离散时序点与工单事件同轴对齐
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* SLA Threshold Reference Line */}
              <ReferenceLine
                y={site.slaThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `SLA ${site.slaThreshold}%`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'right'
                }}
              />

              {/* PCare Work Order Duration Background Span (If on this date) */}
              {orderTimeBounds && (
                <ReferenceArea
                  {...({
                    x1: orderTimeBounds.startTime,
                    x2: orderTimeBounds.solutionTime,
                    y1: 0,
                    y2: 100,
                    fill: '#fef3c7',
                    fillOpacity: 0.5,
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

              {/* Availability Area fill */}
              <Area
                type="stepAfter"
                dataKey="availability"
                fill="#dbeafe"
                fillOpacity={0.3}
                stroke="none"
              />

              {/* Main Availability Curve with dots */}
              <Line
                type="stepAfter"
                dataKey="availability"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={props => {
                  const { cx, cy, payload } = props;
                  if (payload.hasFaultMarker) {
                    return (
                      <circle
                        key={payload.time}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="animate-bounce"
                      />
                    );
                  }
                  if (orderTimeBounds && payload.time === orderTimeBounds.solutionTime) {
                    return (
                      <g key={payload.time}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={9}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                        />
                      </g>
                    );
                  }
                  if (payload.workOrderActive) {
                    return (
                      <circle
                        key={payload.time}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    );
                  }
                  return (
                    <circle
                      key={payload.time}
                      cx={cx}
                      cy={cy}
                      r={2}
                      fill="#3b82f6"
                      fillOpacity={0.7}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Gantt Time Spans: Hardware Fault vs PCare Work Order Duration */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>全景时段甘特对齐轴：设备故障打点 vs PCare 工单闭环时空重叠</span>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            全景基线: 00:00 ~ 24:00 (1440分钟)
          </span>
        </div>

        {/* Timeline Visual Track */}
        <div className="space-y-2.5">
          {/* Track 1: Equipment Fault Timeline Track */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span className="flex items-center gap-1 text-red-700">
                <AlertTriangle className="w-3 h-3" />
                <span>设备硬件故障打点时间轴 (PCS变流器)</span>
              </span>
              <span className="font-mono text-slate-500">
                {currentFault ? `${currentFault.triggerTime.slice(11)} ~ ${currentFault.recoverTime?.slice(11)} (共${currentFault.equivalentInterruptionMinutes}分钟)` : '未发生停运'}
              </span>
            </div>
            
            <div className="h-6 w-full bg-slate-200 rounded-md relative overflow-hidden flex items-center">
              {currentFault ? (
                <div
                  style={{
                    left: `${(timeToMinutes(currentFault.triggerTime.slice(11)) / 1440) * 100}%`,
                    width: `${(currentFault.equivalentInterruptionMinutes / 1440) * 100}%`
                  }}
                  className="absolute top-0 bottom-0 bg-red-500/90 text-white text-[10px] font-bold flex items-center justify-center px-2 shadow-xs transition-all"
                >
                  <span className="truncate">
                    故障停机: {currentFault.code} ({currentFault.equivalentInterruptionMinutes}分)
                  </span>
                </div>
              ) : (
                <div className="w-full text-center text-[10px] text-slate-400 font-medium">
                  全时段满额并网运行 (无停机打点)
                </div>
              )}
            </div>
          </div>

          {/* Track 2: PCare Work Order Timeline Track */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span className="flex items-center gap-1 text-amber-700">
                <Wrench className="w-3 h-3" />
                <span>PCare 运维工单持续时间轴 (Rule R4 方案输出即闭环)</span>
              </span>
              <span className="font-mono text-slate-500">
                {currentOrder ? `${currentOrder.createTime.slice(11)} 派发 ~ ${currentOrder.solutionTime.slice(11)} 方案闭环 (共${currentOrder.durationMinutes}分钟)` : '无工单'}
              </span>
            </div>

            <div className="h-6 w-full bg-slate-200 rounded-md relative overflow-hidden flex items-center">
              {currentOrder ? (
                <div
                  style={{
                    left: `${(timeToMinutes(currentOrder.createTime.slice(11)) / 1440) * 100}%`,
                    width: `${(currentOrder.durationMinutes / 1440) * 100}%`
                  }}
                  className="absolute top-0 bottom-0 bg-amber-500/90 text-white text-[10px] font-bold flex items-center justify-between px-2 shadow-xs transition-all"
                >
                  <span className="truncate">
                    {currentOrder.orderNo} ({currentOrder.assignee})
                  </span>
                  <span className="text-[9px] bg-amber-700/80 px-1 py-0.2 rounded font-mono shrink-0 ml-1">
                    方案输出闭环
                  </span>
                </div>
              ) : (
                <div className="w-full text-center text-[10px] text-slate-400 font-medium">
                  无需要处置的运维工单
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-500" />
            <span>因果关联呈现：设备在 09:12 触发告警停机打点后，PCare 在 09:18 派发工单，现场排查持续至 14:48 输出解决方案并标记闭环 (Rule R4)。</span>
          </div>
          <button
            onClick={() => onNavigateTab(4)}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 shrink-0"
          >
            <span>转至 PCare 工单台账</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Availability Conversion Matrix & Sandbox Section */}
      <div className="border border-slate-200 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>全景可用度最终换算矩阵与推演引擎 (Conversion Matrix)</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              依据合同 SLA 履约口径：以考核周期基线总时长扣除设备非计划等效中断打点（剔除免责），最终换算得到可用度指标。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              SLA 算法公式: A = (T_total - T_deduct) / T_total × 100%
            </span>
          </div>
        </div>

        {/* 4 Steps Conversion Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1">
            <span className="text-slate-500 font-medium">1. 周期考核总时长 (T_total)</span>
            <div className="text-base font-bold font-mono text-slate-900">
              1,440 分钟
            </div>
            <div className="text-[10px] text-slate-500">
              对应 288 个 5 分钟打点周期
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1">
            <span className="text-slate-500 font-medium">2. 设备故障中断打点 (T_fault)</span>
            <div className="text-base font-bold font-mono text-red-600">
              {panoramaData.conversionMetrics.faultDowntimeMinutes} 分钟
            </div>
            <div className="text-[10px] text-slate-500">
              涉及约 {Math.round(panoramaData.conversionMetrics.faultDowntimeMinutes / 5)} 个 5 分钟跌落打点
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1">
            <span className="text-slate-500 font-medium">3. 计划内维护免责 (T_exempt)</span>
            <div className="text-base font-bold font-mono text-blue-600">
              {panoramaData.conversionMetrics.exemptMaintenanceMinutes} 分钟
            </div>
            <div className="text-[10px] text-slate-500">
              Rule R2: 申报工单免责不计入中断
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1">
            <span className="text-slate-500 font-medium">4. 最终换算可用度 (Availability)</span>
            <div className={`text-base font-black font-mono ${
              panoramaData.conversionMetrics.effectiveAvailability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {panoramaData.conversionMetrics.effectiveAvailability}%
            </div>
            <div className="text-[10px] text-slate-500">
              {panoramaData.conversionMetrics.effectiveAvailability < site.slaThreshold ? '⚠️ 低于 SLA 约定' : '✅ 履约达标'}
            </div>
          </div>
        </div>

        {/* Interactive Simulation Slider: Test PCare MTTR response impact on Availability */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>PCare 运维响应时效与方案闭环敏捷度推演沙盘 (Sandbox)</span>
            </div>
            <div className="text-[11px] text-slate-500">
              拖动滑块模拟若 PCare 方案提前/延后输出，对最终可用度的灵敏度影响
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 whitespace-nowrap font-mono">
              -60分钟 (更敏捷)
            </span>
            <input
              type="range"
              min="-60"
              max="60"
              step="10"
              value={simulationOffsetMins}
              onChange={e => setSimulationOffsetMins(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs text-slate-500 whitespace-nowrap font-mono">
              +60分钟 (延后)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded border border-slate-200 flex-wrap gap-2">
            <div>
              <span className="text-slate-500">当前模拟闭环偏移: </span>
              <strong className="font-mono text-blue-600">
                {simulationOffsetMins === 0 ? '基准实际工单耗时 (330分钟)' : `${simulationOffsetMins > 0 ? `+${simulationOffsetMins}` : simulationOffsetMins} 分钟`}
              </strong>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500">当日换算可用度: </span>
                <strong className={`font-mono font-bold ${simAvailability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'}`}>
                  {simAvailability}%
                </strong>
                {simulationOffsetMins !== 0 && (
                  <span className={`text-[10px] ml-1 font-mono ${simAvailability > panoramaData.conversionMetrics.effectiveAvailability ? 'text-emerald-600' : 'text-red-600'}`}>
                    ({simAvailability > panoramaData.conversionMetrics.effectiveAvailability ? `+${(simAvailability - panoramaData.conversionMetrics.effectiveAvailability).toFixed(2)}%` : `${(simAvailability - panoramaData.conversionMetrics.effectiveAvailability).toFixed(2)}%`})
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-500">全月累计可用度预计: </span>
                <strong className={`font-mono font-bold ${simMonthAvailability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'}`}>
                  {simMonthAvailability}%
                </strong>
              </div>

              {simulationOffsetMins !== 0 && (
                <button
                  onClick={() => setSimulationOffsetMins(0)}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:text-slate-900"
                >
                  重置基准
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
