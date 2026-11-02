import React, { useState, useMemo } from 'react';
import { Site } from '../../types';
import {
  getArchivedContractsForSite,
  ArchivedContractYearInfo
} from '../../utils/contractAvailabilityArchive';
import {
  X,
  Archive,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  FileText,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';

interface HistoricalContractArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  initialYear?: number;
}

export const HistoricalContractArchiveModal: React.FC<HistoricalContractArchiveModalProps> = ({
  isOpen,
  onClose,
  site,
  initialYear
}) => {
  const archivedContracts = useMemo(() => getArchivedContractsForSite(site), [site]);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (initialYear && archivedContracts.some(c => c.year === initialYear)) {
      return initialYear;
    }
    return archivedContracts[0]?.year || 2025;
  });

  const [activeSubTab, setActiveSubTab] = useState<'monthly' | 'devices' | 'events'>('monthly');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeContract = useMemo(() => {
    return archivedContracts.find(c => c.year === selectedYear) || archivedContracts[0];
  }, [archivedContracts, selectedYear]);

  if (!isOpen || !activeContract) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExportExcel = () => {
    showToast(`已成功生成并导出【${activeContract.contractTitle}】年度可用度履约归档报表 (Excel)。`);
  };

  const handleDownloadPdf = () => {
    showToast(`正在下载【${activeContract.contractNo}】终审归档审计与可用度合格凭证 (PDF)...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  历年合同可用度监控归档中心
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
                  {site.siteCode}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {site.siteName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                查询历史各合同年度的可用度履约承诺、起止有效周期、终审考核数据与完整归档档案。
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Year Tabs Bar */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-px">
            {archivedContracts.map(c => {
              const isSelected = c.year === selectedYear;
              return (
                <button
                  key={c.year}
                  onClick={() => setSelectedYear(c.year)}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-white text-indigo-700 border-slate-200 border-b-white -mb-px shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 border-transparent hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{c.year} 年度合同</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      c.isBreached
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {c.finalAvailability}%
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {c.statusLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs">
          {/* Active Contract Master Card */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 border border-indigo-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">
                    {activeContract.contractTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-600 text-white shadow-2xs">
                    {activeContract.contractNo}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      activeContract.isBreached
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {activeContract.statusLabel}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-3 flex-wrap">
                  <span>所属客户: <strong className="text-slate-700">{activeContract.customer}</strong></span>
                  <span>·</span>
                  <span>归档凭据编号: <strong className="font-mono text-slate-700">{activeContract.archiveCertificateNo}</strong></span>
                  <span>·</span>
                  <span>终审核定人: <strong className="text-slate-700">{activeContract.archiveAuditor}</strong></span>
                  <span>·</span>
                  <span>终审归档日期: <strong className="font-mono text-slate-700">{activeContract.archiveDate}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>导出履约年报 (Excel)</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载审计凭据 (PDF)</span>
                </button>
              </div>
            </div>

            {/* Contract Period Highlight Banner */}
            <div className="bg-white/80 p-3 rounded-lg border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1 rounded bg-indigo-100 text-indigo-700">
                  <Calendar className="w-4 h-4" />
                </span>
                <span className="font-semibold text-slate-700">当年合同有效周期:</span>
                <strong className="font-mono text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                  合同起始时间: {activeContract.validFrom} 00:00:00
                </strong>
                <span className="text-slate-400 font-bold">至</span>
                <strong className="font-mono text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                  合同结束时间: {activeContract.validTo} 23:59:59
                </strong>
                <span className="text-slate-500 font-mono">
                  (全年共 {activeContract.totalDays} 天)
                </span>
              </div>

              <div className="text-[11px] text-slate-600 flex items-center gap-1">
                <span>结算状态:</span>
                <strong className="text-indigo-800">{activeContract.settlementStatus}</strong>
              </div>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* KPI 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                <span>年度最终可用度</span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div
                className={`text-2xl font-black font-mono mt-1 ${
                  activeContract.isBreached ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {activeContract.finalAvailability}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <span>合同基准门槛:</span>
                <strong className="font-mono text-slate-700">{activeContract.slaThreshold}%</strong>
                <span className={activeContract.gap >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                  ({activeContract.gap >= 0 ? `+${activeContract.gap}%` : `${activeContract.gap}%`})
                </span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                <span>累计等效停运时长</span>
                <Clock className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black font-mono text-red-600 mt-1">
                {activeContract.totalInterruptionHours} <span className="text-xs font-sans font-normal text-slate-500">小时</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                折合 <strong className="font-mono text-slate-800">{activeContract.totalInterruptionMins}</strong> 分钟 · 累计 {activeContract.totalEventsCount} 起事件
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                <span>免责维保与ECO时长</span>
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-black font-mono text-cyan-800 mt-1">
                {activeContract.plannedMaintenanceHours} <span className="text-xs font-sans font-normal text-slate-500">小时</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                全额依据合同SLA条款免责核免
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                <span>合同年度清算奖惩</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div
                className={`text-2xl font-black font-mono mt-1 ${
                  activeContract.penaltyOrBonusAmount < 0
                    ? 'text-red-600'
                    : activeContract.penaltyOrBonusAmount > 0
                    ? 'text-emerald-600'
                    : 'text-slate-800'
                }`}
              >
                {activeContract.penaltyOrBonusAmount < 0
                  ? `-¥${Math.abs(activeContract.penaltyOrBonusAmount).toLocaleString()}`
                  : activeContract.penaltyOrBonusAmount > 0
                  ? `+¥${activeContract.penaltyOrBonusAmount.toLocaleString()}`
                  : '¥0 (履约结清)'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {activeContract.penaltyOrBonusAmount < 0
                  ? 'SLA未达标违约扣减'
                  : activeContract.penaltyOrBonusAmount > 0
                  ? '卓越可用度履约奖励'
                  : '全额结清无违约'}
              </div>
            </div>
          </div>

          {/* Sub-view Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pt-2">
            <button
              onClick={() => setActiveSubTab('monthly')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSubTab === 'monthly'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>12个月月度履约与走势</span>
            </button>
            <button
              onClick={() => setActiveSubTab('devices')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSubTab === 'devices'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>核心设备年度运行归档</span>
            </button>
            <button
              onClick={() => setActiveSubTab('events')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeSubTab === 'events'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>重大中断因果时序归档</span>
            </button>
          </div>

          {/* SubTab 1: Monthly Trend & Table */}
          {activeSubTab === 'monthly' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Trend Chart */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>{activeContract.year} 年度 12 个月可用度履约走势与中断时长</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    折线: 月度可用度 (%) · 虚线: SLA 考核门槛 ({activeContract.slaThreshold}%) · 柱状: 等效中断时长 (min)
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={activeContract.monthlyRecords} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                      <YAxis
                        yAxisId="avail"
                        domain={[98.5, 100]}
                        orientation="left"
                        stroke="#2563eb"
                        fontSize={11}
                        unit="%"
                      />
                      <YAxis
                        yAxisId="interruption"
                        domain={[0, 200]}
                        orientation="right"
                        stroke="#dc2626"
                        fontSize={11}
                        unit="m"
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as any;
                            return (
                              <div className="bg-slate-900/95 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                                <div className="font-bold border-b border-slate-700 pb-1">{data.month} ({label})</div>
                                <div className="text-blue-300">月可用度: {data.availability}%</div>
                                <div className="text-red-300">中断时长: {data.interruptionMins} 分钟</div>
                                <div className="text-slate-300">免责维保: {data.maintenanceHours} 小时</div>
                                <div className="text-slate-300">中断事件: {data.eventsCount} 起</div>
                                <div className={data.isBreached ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  履约结论: {data.status} ({data.settlementStatus})
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine
                        yAxisId="avail"
                        y={activeContract.slaThreshold}
                        stroke="#ea580c"
                        strokeDasharray="4 4"
                        label={{ value: `SLA门槛 ${activeContract.slaThreshold}%`, fill: '#ea580c', fontSize: 10, position: 'insideTopLeft' }}
                      />
                      <Bar yAxisId="interruption" dataKey="interruptionMins" name="中断分钟" fill="#f87171" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="avail" type="monotone" dataKey="availability" name="月可用度(%)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>{activeContract.year} 年度月度可用度归档台账清单</span>
                  <span className="text-[11px] text-slate-500 font-normal">共 12 个自然月度考核单元</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/70 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">考核月份</th>
                        <th className="py-2.5 px-3 font-mono">月可用度 (%)</th>
                        <th className="py-2.5 px-3 font-mono">SLA 门槛</th>
                        <th className="py-2.5 px-3">履约达成</th>
                        <th className="py-2.5 px-3 font-mono">等效中断时长</th>
                        <th className="py-2.5 px-3 font-mono">免责维护时长</th>
                        <th className="py-2.5 px-3">事件数</th>
                        <th className="py-2.5 px-3">终审结算状态</th>
                        <th className="py-2.5 px-3 text-right">报告操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeContract.monthlyRecords.map(m => (
                        <tr key={m.month} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.month}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            <span className={m.isBreached ? 'text-red-600' : 'text-emerald-600'}>
                              {m.availability}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{m.slaThreshold}%</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.isBreached
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-red-600 font-semibold">{m.interruptionMins} min</td>
                          <td className="py-2.5 px-3 font-mono text-cyan-700">{m.maintenanceHours} h</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{m.eventsCount} 起</td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">{m.settlementStatus}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => showToast(`已调取【${m.month}】归档月度SLA考核报告`)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                            >
                              调阅月报
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Core Devices Archive */}
          {activeSubTab === 'devices' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-2">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>{activeContract.year} 年度核心计量设备全生命周期运行归档</span>
                <span className="text-[11px] text-slate-500 font-normal">基于现场实际遥测与中断责任链加权核算</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/70 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">设备编码 / 名称</th>
                      <th className="py-2.5 px-3">设备类型与型号</th>
                      <th className="py-2.5 px-3 font-mono">年累计运行</th>
                      <th className="py-2.5 px-3 font-mono">年度可用率</th>
                      <th className="py-2.5 px-3 font-mono">累计停运时长</th>
                      <th className="py-2.5 px-3">故障次数</th>
                      <th className="py-2.5 px-3">年度健康评分</th>
                      <th className="py-2.5 px-3">工况评定</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeContract.coreDeviceRecords.map(dev => (
                      <tr key={dev.deviceCode} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{dev.deviceName}</div>
                          <div className="font-mono text-[11px] text-indigo-600">{dev.deviceCode}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{dev.deviceType}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{dev.model}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">{dev.annualOperatingHours} h</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{dev.availabilityRate}%</td>
                        <td className="py-2.5 px-3 font-mono text-red-600">{dev.annualInterruptionMins} min</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{dev.annualFaultCount} 次</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{dev.annualHealthScore} 分</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {dev.evaluationGrade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab 3: Major Events Archive */}
          {activeSubTab === 'events' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-2">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>{activeContract.year} 年度重大停运事件因果时序与闭环工单归档</span>
                <span className="text-[11px] text-slate-500 font-normal">归并记录均符合 Rule R11 溯源准则</span>
              </div>
              <div className="p-4 space-y-3">
                {activeContract.majorEvents.map(ev => (
                  <div key={ev.eventId} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200">
                          {ev.eventCode}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{ev.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {ev.triggerTime} ~ {ev.clearTime} (耗时 {ev.durationMins} 分钟)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <div><strong className="text-slate-800">根因分析:</strong> {ev.rootCause}</div>
                      <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                        <span>关联工单: <strong className="font-mono text-blue-600">{ev.workOrderNo}</strong></span>
                        <span>·</span>
                        <span>闭环状态: <strong className="text-emerald-600">{ev.closureStatus}</strong></span>
                        <span>·</span>
                        <span>SLA等效中断时长: <strong className="font-mono text-red-600">{ev.equivalentInterruptionMins} 分钟</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>所有归档合同年数据均由资产所有方与运维交付方联合封存，符合 ISO 55000 资产数字化审计规范。</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shadow-xs transition-colors self-end sm:self-auto"
          >
            关闭归档窗口
          </button>
        </div>
      </div>
    </div>
  );
};
