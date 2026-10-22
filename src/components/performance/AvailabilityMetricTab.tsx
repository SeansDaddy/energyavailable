import React, { useState } from 'react';
import {
  AvailabilityMetricData,
  EquipmentFailureRecord,
  FailureAlarmItem
} from '../../types/performanceEvaluation';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Zap,
  TrendingUp,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Filter,
  Layers,
  Wrench,
  Search,
  ExternalLink,
  Cpu,
  Flame,
  Radio,
  Timer
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
  Legend
} from 'recharts';

interface AvailabilityMetricTabProps {
  availabilityData: AvailabilityMetricData;
  siteName: string;
}

export const AvailabilityMetricTab: React.FC<AvailabilityMetricTabProps> = ({
  availabilityData,
  siteName
}) => {
  const [selectedFailureId, setSelectedFailureId] = useState<string>(
    availabilityData.failures[0]?.id || ''
  );
  const [alarmSeverityFilter, setAlarmSeverityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedFailure =
    availabilityData.failures.find(f => f.id === selectedFailureId) ||
    availabilityData.failures[0];

  const filteredAlarms = (selectedFailure?.relatedAlarms || []).filter(alarm => {
    if (alarmSeverityFilter !== 'ALL' && alarm.severity !== alarmSeverityFilter) {
      return false;
    }
    if (searchTerm) {
      const match =
        alarm.alarmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.alarmCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const getSeverityBadge = (severity: FailureAlarmItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
            CRITICAL 紧急
          </span>
        );
      case 'MAJOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
            MAJOR 重要
          </span>
        );
      case 'MINOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-300">
            MINOR 次要
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            WARNING 预警
          </span>
        );
      default:
        return null;
    }
  };

  const getCorrelationBadge = (corr: FailureAlarmItem['correlationType']) => {
    switch (corr) {
      case 'ROOT_CAUSE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
            ★ 首发根因告警
          </span>
        );
      case 'PRECURSOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            ⚡ 前兆异常告警
          </span>
        );
      case 'CASCADE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            ⛓ 连锁保护联动
          </span>
        );
      case 'SECONDARY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
            ↪ 次生衍生告警
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                站点可用度指标分析与失效设备告警全时域溯源
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                可用度与失效时刻关联
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              实时评估站点综合系统可用率与等效可用系数 (EAF)，精确记录核心电气与电池设备失效事件；在失效时刻深度关联首发根因告警、异常前兆及连锁保护动作序列。
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-emerald-700 font-medium">综合可用率</div>
              <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                {availabilityData.availabilityRate}%
              </div>
              <div className="text-[9px] text-emerald-600">保证线 ≥{availabilityData.contractGuaranteeAvailability}%</div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-indigo-700 font-medium">等效可用系数 EAF</div>
              <div className="text-xl font-black text-indigo-700 font-mono mt-0.5">
                {availabilityData.eaf}%
              </div>
              <div className="text-[9px] text-indigo-600">计权容量可用度</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">合同承诺保证可用度</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {availabilityData.contractGuaranteeAvailability}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-medium">
            超额达成 +{(availabilityData.availabilityRate - availabilityData.contractGuaranteeAvailability).toFixed(2)}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">非计划停运时长 UOH</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                availabilityData.unplannedOutageHours > 10 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {availabilityData.unplannedOutageHours}
            </span>
            <span className="text-xs text-slate-500">小时</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            计划停运: {availabilityData.plannedOutageHours}h
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">失效设备事件总数</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-600 font-mono">
              {availabilityData.failureCount}
            </span>
            <span className="text-xs text-slate-500">次 / 当月</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            均已完成现场消缺闭环
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">平均无故障时间 MTBF</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {availabilityData.mtbfHours}
            </span>
            <span className="text-xs text-slate-500">h</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">系统连续安全运行</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">平均修复时间 MTTR</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {availabilityData.mttrHours}
            </span>
            <span className="text-xs text-slate-500">h</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600">优于 SLA ≤ 4.0h 要求</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">考核达标与扣罚预警</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">0.00</span>
            <span className="text-xs text-slate-500">元</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600">全指标达标免考核</div>
        </div>
      </div>

      {/* 3. Availability Monthly Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>近 6 个月综合可用率与非计划停运时长趋势对比</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              柱状图反映非计划停机时长 (UOH, 小时)，折线图反映等效可用系数 (EAF) 与考核保证红线
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              等效可用系数 EAF (%)
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              非计划停运 (h)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-400 border-dashed"></span>
              考核基线 (98.5%)
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={availabilityData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                domain={[95, 100]}
                tick={{ fontSize: 11 }}
                unit="%"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 25]}
                tick={{ fontSize: 11 }}
                unit="h"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Bar
                yAxisId="right"
                dataKey="unplannedHours"
                name="非计划停运时长(h)"
                fill="#fda4af"
                barSize={24}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="eaf"
                name="等效可用系数 EAF(%)"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#4f46e5' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="target"
                name="合同保证底线(%)"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Core Feature: Equipment Failures and Correlated Alarms at Failure Moment */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-xl shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold">失效设备失效时刻系统相关告警关联分析</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/30 text-rose-300 border border-rose-500/40">
                秒级时域对齐
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              点击下方失效事件，实时查看失效瞬间系统触发的根因告警、前兆告警与保护连锁动作链。
            </p>
          </div>

          <div className="text-xs text-indigo-200">
            共抓取 <strong className="text-white font-mono">{availabilityData.failures.length}</strong> 起设备失效停机记录
          </div>
        </div>

        {/* Failure records selector pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availabilityData.failures.map(record => {
            const isSelected = selectedFailure?.id === record.id;
            return (
              <div
                key={record.id}
                onClick={() => setSelectedFailureId(record.id)}
                className={`cursor-pointer rounded-xl p-4 border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600" />
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        {record.failureId}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {record.deviceName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      位置: {record.cabinLocation}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    已闭环恢复
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-slate-400">失效时刻: </span>
                    <strong className="text-rose-600 font-mono font-bold">{record.failedAt}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">历时: </span>
                    <strong className="text-slate-700 font-mono">{record.outageDurationHours}h</strong>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>影响容量: <strong className="text-slate-800">{record.capacityLossMw} MW</strong></span>
                  <span>关联告警: <strong className="text-indigo-600 font-mono">{record.relatedAlarms.length} 项</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Failure Detail & Correlated Alarms Table */}
        {selectedFailure && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 animate-in fade-in duration-200">
            {/* Event Header Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white font-mono">
                    {selectedFailure.deviceCode}
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    {selectedFailure.deviceName}
                  </h4>
                  <span className="text-xs text-slate-500">
                    ({selectedFailure.cabinLocation})
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong>失效根因分析: </strong>
                  {selectedFailure.failureReason}
                </div>
                <div className="text-[11px] text-indigo-700 bg-indigo-50/80 p-2 rounded-lg border border-indigo-100 font-mono">
                  <strong>RCA 故障链路: </strong>
                  {selectedFailure.rcaChain}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0 lg:border-l lg:border-slate-200 lg:pl-5">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">失效发生时刻</span>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {selectedFailure.failedAt}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">恢复投运时刻</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {selectedFailure.recoveredAt}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">停机影响容量</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {selectedFailure.capacityLossMw} MW
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-medium">可用度损耗</span>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    -{selectedFailure.availabilityLossPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar for Alarms */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600" />
                <h5 className="text-xs font-bold text-slate-800">
                  失效时刻前后系统相关告警序列 ({filteredAlarms.length} 项)
                </h5>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">告警级别:</span>
                  <select
                    value={alarmSeverityFilter}
                    onChange={e => setAlarmSeverityFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                  >
                    <option value="ALL">全部级别</option>
                    <option value="CRITICAL">CRITICAL 紧急</option>
                    <option value="MAJOR">MAJOR 重要</option>
                    <option value="WARNING">WARNING 预警</option>
                    <option value="MINOR">MINOR 次要</option>
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="搜索告警名称/代码..."
                    className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-44 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Correlated Alarms List Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">告警发生时刻</th>
                    <th className="py-2.5 px-3">关联属性 / 时序</th>
                    <th className="py-2.5 px-3">告警级别</th>
                    <th className="py-2.5 px-3">告警代码 / 名称</th>
                    <th className="py-2.5 px-3">所属子系统 / 部件</th>
                    <th className="py-2.5 px-3">持续时长</th>
                    <th className="py-2.5 px-3">故障机理描述与现场表现</th>
                    <th className="py-2.5 px-3 text-right">消缺工单</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAlarms.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        未匹配到相关告警记录
                      </td>
                    </tr>
                  ) : (
                    filteredAlarms.map(alarm => {
                      const isRootCause = alarm.correlationType === 'ROOT_CAUSE';
                      return (
                        <tr
                          key={alarm.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isRootCause ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{alarm.triggeredAt}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {getCorrelationBadge(alarm.correlationType)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {getSeverityBadge(alarm.severity)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{alarm.alarmName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {alarm.alarmCode}
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-medium text-slate-700">{alarm.deviceName}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {alarm.subsystem}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {alarm.durationMinutes} 分钟
                          </td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs leading-relaxed">
                            {alarm.description}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            {alarm.workOrderId ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {alarm.workOrderId} (已闭环)
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">自动恢复</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Explanatory footer note */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">时域关联研判说明:</div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  系统采用毫秒级统一对时服务。在设备失效发生时，自动将失效时刻前 120 秒的前兆告警、失效时刻的首发根因告警、以及随后触发的断路器联跳与二次保护告警按因果时序精准聚类，有效剔除误报并辅助运维团队快速溯源。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
