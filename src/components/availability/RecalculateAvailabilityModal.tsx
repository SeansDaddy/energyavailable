import React, { useState, useMemo, useEffect } from 'react';
import { Site, WorkOrder, AvailabilityRecalcRecord } from '../../types';
import { computeSiteAvailabilityRecalculation } from '../../utils/availabilityRecalc';
import {
  X,
  Calculator,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ArrowRight,
  Clock,
  History,
  Eye,
  TrendingUp,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

interface RecalculateAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  workOrders: WorkOrder[];
  history: AvailabilityRecalcRecord[];
  onExecuteRecalc: (params: {
    siteId: string;
    startDate: string;
    endDate: string;
    applyEcoExempt: boolean;
    applyR4OrderClosure: boolean;
    applyLatestWinsLog: boolean;
    syncSiteKpi: boolean;
  }) => AvailabilityRecalcRecord | null;
  onInspectDate5Min?: (date: string) => void;
}

export const RecalculateAvailabilityModal: React.FC<RecalculateAvailabilityModalProps> = ({
  isOpen,
  onClose,
  site,
  workOrders,
  history,
  onExecuteRecalc,
  onInspectDate5Min
}) => {
  const snapshots = site.dailySnapshots || [];
  const minSnapshotDate = snapshots.length > 0 ? snapshots[0].date : '2026-08-01';
  const maxSnapshotDate =
    snapshots.length > 0 ? snapshots[snapshots.length - 1].date : '2026-08-20';

  const [startDate, setStartDate] = useState<string>(minSnapshotDate);
  const [endDate, setEndDate] = useState<string>(maxSnapshotDate);
  const [applyEcoExempt, setApplyEcoExempt] = useState<boolean>(true);
  const [applyR4OrderClosure, setApplyR4OrderClosure] = useState<boolean>(true);
  const [applyLatestWinsLog, setApplyLatestWinsLog] = useState<boolean>(true);
  const [syncSiteKpi, setSyncSiteKpi] = useState<boolean>(true);

  const [activeResult, setActiveResult] = useState<AvailabilityRecalcRecord | null>(null);
  const [showChangedOnly, setShowChangedOnly] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStartDate(minSnapshotDate);
      setEndDate(maxSnapshotDate);
      setActiveResult(null);
    }
  }, [isOpen, site.id, minSnapshotDate, maxSnapshotDate]);

  const isDateRangeValid = Boolean(startDate && endDate && startDate <= endDate);

  const preview = useMemo(() => {
    if (!isDateRangeValid) return null;
    return computeSiteAvailabilityRecalculation({
      site,
      workOrders,
      startDate,
      endDate,
      applyEcoExempt,
      applyR4OrderClosure,
      applyLatestWinsLog,
      syncSiteKpi
    });
  }, [
    site,
    workOrders,
    startDate,
    endDate,
    applyEcoExempt,
    applyR4OrderClosure,
    applyLatestWinsLog,
    syncSiteKpi,
    isDateRangeValid
  ]);

  if (!isOpen) return null;

  const siteHistory = history.filter(h => h.siteId === site.id);

  const applyPreset = (s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
    setActiveResult(null);
  };

  const handleRunRecalc = () => {
    if (!isDateRangeValid) return;
    const res = onExecuteRecalc({
      siteId: site.id,
      startDate,
      endDate,
      applyEcoExempt,
      applyR4OrderClosure,
      applyLatestWinsLog,
      syncSiteKpi
    });
    if (res) {
      setActiveResult(res);
    }
  };

  const displayRecord = activeResult || preview?.record || null;
  const rowsToShow = displayRecord
    ? showChangedOnly
      ? displayRecord.dayBreakdown.filter(
          d => Math.abs(d.afterAvail - d.beforeAvail) >= 0.01 || d.recoveredMins !== 0
        )
      : displayRecord.dayBreakdown
    : [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  单站可用度指定时段重新统计
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {site.siteCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {site.siteName} · 当前站点可用度{' '}
                <strong className="font-mono tabular-nums text-slate-800">
                  {site.currentAvailability}%
                </strong>{' '}
                · SLA 考核门槛{' '}
                <strong className="font-mono tabular-nums text-blue-600">
                  {site.slaThreshold}%
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-xs">
          {/* Step 1: Time Range & Presets */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>1. 指定重新统计时段</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset(minSnapshotDate, maxSnapshotDate)}
                  className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                    startDate === minSnapshotDate && endDate === maxSnapshotDate
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  已采集全时段 ({minSnapshotDate.slice(5)} ~ {maxSnapshotDate.slice(5)})
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('2026-08-14', maxSnapshotDate)}
                  className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                    startDate === '2026-08-14' && endDate === maxSnapshotDate
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  近7日窗口
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('2026-08-04', '2026-08-15')}
                  className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                    startDate === '2026-08-04' && endDate === '2026-08-15'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  故障集中时段 (08-04 ~ 08-15)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('2026-08-01', '2026-08-30')}
                  className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                    startDate === '2026-08-01' && endDate === '2026-08-30'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  当期整月 (08-01 ~ 08-30)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    setActiveResult(null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => {
                    setEndDate(e.target.value);
                    setActiveResult(null);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {!isDateRangeValid && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>开始日期不能晚于结束日期，请重新选择统计时段。</span>
              </div>
            )}
          </div>

          {/* Step 2: Calculation Rule Switches */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>2. 选择重算核免口径与联动范围</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyEcoExempt}
                  onChange={e => {
                    setApplyEcoExempt(e.target.checked);
                    setActiveResult(null);
                  }}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-900">
                    应用 Rule R2：计划维护与 ECO 外因免责核减
                  </div>
                  <div className="text-[11px] text-slate-500">
                    剔除已审批的电网调度限电、上游定检等外因停机扣减时长
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyR4OrderClosure}
                  onChange={e => {
                    setApplyR4OrderClosure(e.target.checked);
                    setActiveResult(null);
                  }}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-900">
                    应用 Rule R4：按 PCare 方案输出时刻闭环计时
                  </div>
                  <div className="text-[11px] text-slate-500">
                    以工单「已输出解决方案」时刻提前终止等效停运扣减
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyLatestWinsLog}
                  onChange={e => {
                    setApplyLatestWinsLog(e.target.checked);
                    setActiveResult(null);
                  }}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-900">
                    应用 Rule R3：Latest-Wins 离线日志覆盖去重
                  </div>
                  <div className="text-[11px] text-slate-500">
                    自动以最新导入批次覆盖历史重叠时间窗口内的重复扣减
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncSiteKpi}
                  onChange={e => {
                    setSyncSiteKpi(e.target.checked);
                    setActiveResult(null);
                  }}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-900">
                    同步刷新站点当期可用度与 SLA 合同状态
                  </div>
                  <div className="text-[11px] text-slate-500">
                    重算后同步更新单站头部可用度指标、日维度曲线及关联合同达标状态
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Live Preview or Executed Result Banner */}
          {displayRecord && (
            <div className="space-y-3">
              {activeResult ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">
                        重算已完成并生效！
                      </span>
                      <span className="ml-1.5 text-emerald-800">
                        时段 {activeResult.startDate} ~ {activeResult.endDate}（共 {activeResult.affectedDaysCount} 天）已按新口径更新。
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 shrink-0">
                    完成时间: {activeResult.recalculatedAt}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>重算测算预览：</strong>
                      选中时段共 <strong className="font-mono">{displayRecord.affectedDaysCount}</strong> 天
                      {preview ? ` · 匹配 ${preview.matchedFaultCount} 起故障 · ${preview.matchedWorkOrderCount} 笔工单` : ''}
                      。确认口径后点击下方「执行重新统计」生效。
                    </span>
                  </div>
                </div>
              )}

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-500">重算前时段平均可用度</div>
                  <div className="text-lg font-black font-mono tabular-nums text-slate-800 mt-1">
                    {displayRecord.beforePeriodAvgAvail}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    原扣减: {displayRecord.beforeInterruptionMins} min
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/50">
                  <div className="text-blue-700 font-medium">
                    {activeResult ? '重算后时段平均可用度' : '预计重算后时段可用度'}
                  </div>
                  <div className="text-lg font-black font-mono tabular-nums text-blue-700 mt-1 flex items-center gap-1.5">
                    <span>{displayRecord.afterPeriodAvgAvail}%</span>
                    <span
                      className={`text-xs font-bold inline-flex items-center gap-0.5 ${
                        displayRecord.deltaAvail >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {displayRecord.deltaAvail >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {displayRecord.deltaAvail >= 0 ? '+' : ''}
                      {displayRecord.deltaAvail}%
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-600 mt-0.5 font-mono">
                    新扣减: {displayRecord.afterInterruptionMins} min
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-500">核免/修正挽回停机时长</div>
                  <div
                    className={`text-lg font-black font-mono tabular-nums mt-1 ${
                      displayRecord.recoveredMins >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {displayRecord.recoveredMins >= 0 ? `+${displayRecord.recoveredMins}` : displayRecord.recoveredMins}{' '}
                    <span className="text-xs font-normal text-slate-500">min</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {displayRecord.appliedRules.length > 0
                      ? `已启用 ${displayRecord.appliedRules.length} 项口径规则`
                      : '原始无核免口径'}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
                  <div className="text-slate-500">站点当期可用度对比 (SLA {site.slaThreshold}%)</div>
                  <div className="text-sm font-black font-mono tabular-nums text-slate-900 mt-1.5 flex items-center gap-1.5">
                    <span>{displayRecord.beforeSiteCurrentAvail}%</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className={
                        displayRecord.afterSiteCurrentAvail >= site.slaThreshold
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }
                    >
                      {displayRecord.afterSiteCurrentAvail}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {displayRecord.afterSiteCurrentAvail >= site.slaThreshold
                      ? '重算后满足 SLA 达标门槛'
                      : `仍低于门槛 ${(site.slaThreshold - displayRecord.afterSiteCurrentAvail).toFixed(2)}%`}
                  </div>
                </div>
              </div>

              {/* Day-by-Day Breakdown Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>指定时段逐日重算明细 ({rowsToShow.length} 天)</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showChangedOnly}
                      onChange={e => setShowChangedOnly(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>仅看发生变动日期</span>
                  </label>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-slate-700">
                    <thead className="bg-white text-slate-500 text-[11px] font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">日期</th>
                        <th className="py-2 px-3 font-mono">重算前</th>
                        <th className="py-2 px-3 font-mono">重算后</th>
                        <th className="py-2 px-3 font-mono">变化</th>
                        <th className="py-2 px-3 font-mono">原扣减 / 新扣减</th>
                        <th className="py-2 px-3">规则修正依据</th>
                        {onInspectDate5Min && <th className="py-2 px-3 text-right">定位</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rowsToShow.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400">
                            当前筛选条件下无变动的日期记录
                          </td>
                        </tr>
                      ) : (
                        rowsToShow.map(row => {
                          const delta = Number((row.afterAvail - row.beforeAvail).toFixed(2));
                          return (
                            <tr key={row.date} className="hover:bg-blue-50/40">
                              <td className="py-2 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                                {row.date}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-500">
                                {row.beforeAvail}%
                              </td>
                              <td
                                className={`py-2 px-3 font-mono tabular-nums font-bold ${
                                  row.afterAvail >= site.slaThreshold
                                    ? 'text-emerald-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {row.afterAvail}%
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums">
                                {delta === 0 ? (
                                  <span className="text-slate-400">0.00%</span>
                                ) : (
                                  <span className={delta > 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                                    {delta > 0 ? `+${delta}%` : `${delta}%`}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                                {row.beforeInterruptMins} min → <strong>{row.afterInterruptMins} min</strong>
                              </td>
                              <td className="py-2 px-3 text-slate-600">{row.note}</td>
                              {onInspectDate5Min && (
                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onInspectDate5Min(row.date);
                                      onClose();
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>5分钟打点</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Site Recalculation Audit History */}
          {siteHistory.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/60 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-600" />
                <span>本站近期重算审计记录 ({siteHistory.length})</span>
              </div>
              <div className="space-y-1.5">
                {siteHistory.slice(0, 4).map(h => (
                  <div
                    key={h.id}
                    className="bg-white border border-slate-200 rounded px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-slate-500">{h.recalculatedAt}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {h.startDate} ~ {h.endDate} ({h.affectedDaysCount}天)
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">执行人: {h.operator}</span>
                    </div>
                    <div className="font-mono font-semibold">
                      {h.beforePeriodAvgAvail}% →{' '}
                      <span className="text-blue-600">{h.afterPeriodAvgAvail}%</span>{' '}
                      <span className={h.deltaAvail >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        ({h.deltaAvail >= 0 ? `+${h.deltaAvail}` : h.deltaAvail}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500">
            提示：重算结果将即时反映在日/周/月维度可用度曲线、统计表格与合同履约大盘中。
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              {activeResult ? '完成并关闭' : '取消'}
            </button>
            <button
              type="button"
              disabled={!isDateRangeValid}
              onClick={handleRunRecalc}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{activeResult ? '按当前参数再次重算' : '执行重新统计'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
