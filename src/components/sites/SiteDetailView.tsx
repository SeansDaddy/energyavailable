import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusLampBadge, RedundancyBadge } from '../common/StatusBadge';
import { RedundancyLevel, FactorScore } from '../../types';
import {
  ArrowLeft,
  Activity,
  Shield,
  Clock,
  Wrench,
  FileText,
  UploadCloud,
  Cpu,
  Layers,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Edit,
  Save,
  HelpCircle,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine
} from 'recharts';

export const SiteDetailView: React.FC = () => {
  const {
    selectedSiteId,
    sites,
    siteDetailTab,
    setSiteDetailTab,
    setActiveTab,
    updateSiteRedundancy,
    batches,
    workOrders,
    contracts
  } = useApp();

  const site = sites.find(s => s.id === selectedSiteId) || sites[0];

  // Editable redundancy state
  const [isEditingRedundancy, setIsEditingRedundancy] = useState(false);
  const [editRedundancy, setEditRedundancy] = useState<RedundancyLevel>(site.redundancy);
  const [editNotes, setEditNotes] = useState(site.redundancyNotes);

  // Expanded merged faults state
  const [expandedFaults, setExpandedFaults] = useState<Record<string, boolean>>({
    'fault-001': true
  });

  const toggleFaultExpand = (faultId: string) => {
    setExpandedFaults(prev => ({
      ...prev,
      [faultId]: !prev[faultId]
    }));
  };

  const handleSaveRedundancy = () => {
    updateSiteRedundancy(site.id, editRedundancy, editNotes);
    setIsEditingRedundancy(false);
  };

  // Associated entities
  const siteBatches = batches.filter(b => b.siteId === site.id);
  const siteOrders = workOrders.filter(w => w.siteId === site.id || w.siteName === site.siteName);
  const siteContract = contracts.find(c => c.contractNo === site.contractNo) || contracts[0];

  // Radar data for Reliability Score
  const radarData = [
    {
      factor: '历史中断频率',
      score: site.reliabilityScore.factors.historyInterruptionFreq.score,
      fullMark: 100
    },
    {
      factor: '恢复时长 MTTR',
      score: site.reliabilityScore.factors.mttr.score,
      fullMark: 100
    },
    {
      factor: '组网冗余度',
      score: site.reliabilityScore.factors.redundancy.score,
      fullMark: 100
    },
    {
      factor: '告警密度',
      score: site.reliabilityScore.factors.alarmDensity.score,
      fullMark: 100
    },
    {
      factor: '数据覆盖率',
      score: site.reliabilityScore.factors.dataCoverage.score,
      fullMark: 100
    }
  ];

  const gap = Number((site.currentAvailability - site.slaThreshold).toFixed(2));
  const isBreached = site.currentAvailability < site.slaThreshold;

  const tabs = [
    { id: 0, label: '1. 概览与双指标', icon: Activity },
    { id: 1, label: '2. 故障时间线 (R11)', icon: Clock, count: site.mergedFaults.length },
    { id: 2, label: '3. PCare 工单 (R4)', icon: Wrench, count: siteOrders.length },
    { id: 3, label: '4. 合同与 SLA 履约', icon: FileText },
    { id: 4, label: '5. 日志导入批次 (R3)', icon: UploadCloud, count: siteBatches.length },
    { id: 5, label: '6. 核心设备与冗余度', icon: Cpu, count: site.coreDeviceCount }
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Top Breadcrumb & Site Meta Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              id="btn-back-to-sites"
              onClick={() => setActiveTab('sites')}
              className="p-2.5 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors mt-0.5"
              title="返回站点列表"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">{site.siteName}</h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  {site.siteCode}
                </span>
                <StatusLampBadge status={site.statusLamp} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 mt-2">
                <span>
                  维度归属:{' '}
                  <strong className="text-slate-800 font-medium">
                    {site.region} / {site.representativeOffice}
                  </strong>
                </span>
                <span>
                  客户: <strong className="text-slate-800 font-medium">{site.customer}</strong>
                </span>
                <span>
                  装机容量: <strong className="text-slate-800 font-medium">{site.capacityMw} MW</strong>
                </span>
                <span>
                  合同号:{' '}
                  <strong className="text-blue-600 font-mono font-medium">{site.contractNo}</strong>
                </span>
                <span>
                  运维负责人: <strong className="text-slate-800 font-medium">{site.owner}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('log_import')}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>导入新日志批次</span>
            </button>
            <button
              onClick={() => setActiveTab('ai_assistant')}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 诊断分析</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-3.5 mt-4">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = siteDetailTab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-site-detail-${t.id}`}
                onClick={() => setSiteDetailTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 0: Overview & Double Indicator Model (可用度 vs 可靠性得分 R1) */}
      {siteDetailTab === 0 && (
        <div className="space-y-5 animate-in fade-in">
          {/* Double Indicator Header Cards (R1) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Availability (Contract SLA Dimension) */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-blue-50 text-blue-700 border-b border-l border-blue-200 text-[10px] font-bold rounded-bl uppercase font-mono">
                合同履约口径 (R1)
              </div>

              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">当期累计可用度指标卡</h3>
                  <p className="text-[11px] text-slate-500">
                    按既定判定规则以等效 PCS 中断时长计算，计划内维护不计入 (R2)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[11px] text-slate-500">当期实际可用度</div>
                  <div
                    className={`text-2xl font-black font-mono mt-1 ${
                      isBreached ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {site.currentAvailability}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isBreached ? '已低于SLA阈值' : '符合合同承诺'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[11px] text-slate-500">合同 SLA 约定阈值</div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                    {site.slaThreshold}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">合同唯一约定值</div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-[11px] text-slate-500">达标差值 (Gap)</div>
                  <div
                    className={`text-2xl font-black font-mono mt-1 ${
                      gap >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {gap >= 0 ? `+${gap}%` : `${gap}%`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {gap >= 0 ? '安全缓冲充足' : '存在违约罚款风险'}
                  </div>
                </div>
              </div>

              {/* Mini Availability Daily Snapshots Trend */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  <span>8 月份每日可用度打点趋势 (日界北京时间 0 点 R7)</span>
                  <span className="text-[11px] text-blue-600 font-medium">
                    数据覆盖率: {site.dataCoverage}%
                  </span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={site.dailySnapshots}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        tickFormatter={val => val.slice(-5)}
                      />
                      <YAxis domain={[97.0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '0.375rem',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(val: any) => [`${val}%`, '当日可用度']}
                      />
                      <ReferenceLine
                        y={site.slaThreshold}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{
                          value: `SLA ${site.slaThreshold}%`,
                          fill: '#ef4444',
                          fontSize: 9,
                          position: 'right'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="availability"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Card 2: Reliability Score (Internal Management 5-Factor Model) */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-50 text-indigo-700 border-b border-l border-indigo-200 text-[10px] font-bold rounded-bl uppercase font-mono">
                内部管理口径 (R1)
              </div>

              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">可靠性综合评分卡 (0~100)</h3>
                  <p className="text-[11px] text-slate-500">
                    五因子加权计算，用于站点风险评估与合同评估参考，不用于履约考核 (R1)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Score & Radar */}
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-center mb-1">
                    <span className="text-xs text-slate-500">综合可靠性得分</span>
                    <div className="text-3xl font-black text-indigo-600 font-mono mt-0.5">
                      {site.reliabilityScore.totalScore}
                      <span className="text-sm text-slate-400 font-normal"> / 100</span>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={55} data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="factor" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <PolarRadiusAxis domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 8 }} />
                        <Radar
                          name="得分"
                          dataKey="score"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5 Factor Breakdown */}
                <div className="space-y-2 text-xs">
                  {Object.entries(site.reliabilityScore.factors).map(([key, factorObj]) => {
                    const f = factorObj as FactorScore;
                    return (
                    <div
                      key={key}
                      className="p-2 rounded bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {f.name}{' '}
                          <span className="text-[10px] text-indigo-600 font-mono">
                            ({(f.weight * 100).toFixed(0)}% 权重)
                          </span>
                        </span>
                        <span className="font-mono font-bold text-indigo-600">{f.score}分</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {f.rawValue}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Fault Timeline & Causality Drilldown (R11) */}
      {siteDetailTab === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                归并故障时间线与因果追溯 (Rule R11)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                同站点内时间窗相互重叠的事件记录（告警、工单、日志）自动归并形成展示单元。展开可查看原始事件链。
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">
              共归并 {site.mergedFaults.length} 场故障
            </span>
          </div>

          {site.mergedFaults.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 shadow-sm">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
              <div className="font-bold text-slate-900">本考核周期无非计划停机归并故障</div>
              <div className="text-xs text-slate-400 mt-1">站点核心设备运行平稳</div>
            </div>
          ) : (
            <div className="space-y-3">
              {site.mergedFaults.map(fault => {
                const isExpanded = expandedFaults[fault.id];
                return (
                  <div
                    key={fault.id}
                    className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm transition-all"
                  >
                    <div
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                      onClick={() => toggleFaultExpand(fault.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-red-50 text-red-600 border border-red-200 mt-0.5">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                              {fault.faultCode}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{fault.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                              等效PCS中断 {fault.equivalentInterruptionMinutes} 分钟
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            根因诊断: {fault.rootCause}
                          </p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1.5 font-mono">
                            <span>
                              起止时间: {fault.startTime} ~ {fault.endTime}
                            </span>
                            <span>持续: {fault.durationMinutes} 分钟</span>
                            <span>归并原始事件数: {fault.mergedEventsCount} 项</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold self-end md:self-center">
                        <span>{isExpanded ? '收起事件链' : '展开原始因果事件'}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Raw Events Drilldown */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>原始事件记录清单 (告警 / 工单 / 日志)</span>
                        </div>

                        <div className="space-y-2">
                          {fault.rawEvents.map((evt, idx) => (
                            <div
                              key={evt.id}
                              className="p-3 rounded bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-slate-400 text-[11px]">
                                  #{idx + 1}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    evt.type === 'alarm'
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : evt.type === 'workorder'
                                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                                  }`}
                                >
                                  {evt.type === 'alarm'
                                    ? '告警事件'
                                    : evt.type === 'workorder'
                                    ? 'PCare工单'
                                    : '离线日志'}
                                </span>
                                <div>
                                  <div className="font-semibold text-slate-900">{evt.title}</div>
                                  <div className="text-[11px] text-slate-500">{evt.description}</div>
                                </div>
                              </div>

                              <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                                <div>{evt.timestamp}</div>
                                <div className="text-blue-600 font-mono font-medium">{evt.code}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: PCare Work Orders (R4) */}
      {siteDetailTab === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                PCare 工单系统准实时同步列表
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                闭环判定规则 (R4)：工单到达“已输出解决方案、待执行”状态即视为闭环，闭环时间为该状态出现时刻。
              </p>
            </div>
            <button
              onClick={() => setActiveTab('work_orders')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
            >
              <span>查看全局工单大盘 &rarr;</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">工单号 / 标题</th>
                  <th className="py-3 px-3">状态</th>
                  <th className="py-3 px-3">故障分类</th>
                  <th className="py-3 px-3">指派人</th>
                  <th className="py-3 px-3">创建时间</th>
                  <th className="py-3 px-3">闭环时间 (R4)</th>
                  <th className="py-3 px-4 text-right">解决方案</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteOrders.map(wo => (
                  <tr key={wo.id} className="hover:bg-blue-50/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{wo.title}</div>
                      <div className="text-[11px] text-blue-600 font-mono">{wo.orderNo}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          wo.status === 'SOLUTION_READY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : wo.status === 'CLOSED'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {wo.status === 'SOLUTION_READY'
                          ? '已输出方案 (已闭环)'
                          : wo.status === 'CLOSED'
                          ? '已完结归档'
                          : '现场处理中'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800">{wo.faultCategory}</td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{wo.assignee}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {wo.createTime}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 font-mono text-[11px] font-bold">
                      {wo.solutionTime || '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 max-w-xs truncate">
                      {wo.solutionSummary || '处理方案执行中...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Contracts & SLA Fulfillment */}
      {siteDetailTab === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  关联合同详情与 SLA 履约走势 (R9, R10)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  以合同号为枢纽，SLA 阈值按合同 + 站点粒度设定 (R10)
                </p>
              </div>
              <button
                onClick={() => setActiveTab('contracts')}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
              >
                <span>合同管理台账 &rarr;</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">合同编号</span>
                <div className="font-bold text-slate-900 font-mono mt-1">
                  {siteContract.contractNo}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">签约客户</span>
                <div className="font-bold text-slate-900 mt-1">{siteContract.customer}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">考核周期口径</span>
                <div className="font-bold text-slate-900 mt-1">
                  {siteContract.evaluationPeriod}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">合同基准 SLA 阈值</span>
                <div className="font-bold text-blue-600 font-mono mt-1">
                  {siteContract.slaThreshold}%
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs">
              <span className="font-semibold text-red-600">违约与赔付条款：</span>
              <p className="text-slate-700 mt-1 leading-relaxed">{siteContract.penaltyClause}</p>
            </div>

            {/* Contract SLA Historical Trend Chart */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-800 mb-2">
                近 6 个月合同月度 SLA 履约达标走势 (销售履约视图)
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={siteContract.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis domain={[98.5, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.375rem',
                        fontSize: '11px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(val: any) => [`${val}%`, '可用度']}
                    />
                    <ReferenceLine
                      y={siteContract.slaThreshold}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `目标 ${siteContract.slaThreshold}%`,
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'right'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualSla"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Log Batches & Latest-Wins (R3) */}
      {siteDetailTab === 4 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                离线日志导入历史批次 (Rule R3: Latest-Wins)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                同站点同时段以最新批次覆盖参与可用度计算，历史旧批次永久留档可追溯，无人工审核环节。
              </p>
            </div>
            <button
              onClick={() => setActiveTab('log_import')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>导入新日志</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">批次号 / 文件名</th>
                  <th className="py-3 px-3">导入时间</th>
                  <th className="py-3 px-3">覆盖时段</th>
                  <th className="py-3 px-3">计算生效状态 (R3)</th>
                  <th className="py-3 px-3">等效中断时长</th>
                  <th className="py-3 px-3">事件数</th>
                  <th className="py-3 px-4">操作人</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-blue-50/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 font-mono">{batch.batchNo}</div>
                      <div className="text-[11px] text-slate-500">{batch.fileName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {batch.importTime}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                      {batch.periodStart.slice(5)} ~ {batch.periodEnd.slice(5)}
                    </td>
                    <td className="py-3 px-3">
                      {batch.isLatestWinning ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🟢 最新生效 (参与计算)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          ⚪ 已被替代 (留档可查)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-red-600">
                      {batch.equivalentInterruptionMinutes} 分钟
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">{batch.eventsCount} 条</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{batch.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Core Devices & Redundancy Maintenance */}
      {siteDetailTab === 5 && (
        <div className="space-y-5 animate-in fade-in">
          {/* Redundancy Maintenance Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  组网冗余度人工维护 (运维人员随组网变更更新)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  组网冗余度直接输入至管理口径【可靠性得分】五因子计算模型
                </p>
              </div>

              {!isEditingRedundancy ? (
                <button
                  onClick={() => setIsEditingRedundancy(true)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>修改组网冗余度</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingRedundancy(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveRedundancy}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存并重算可靠性</span>
                  </button>
                </div>
              )}
            </div>

            {!isEditingRedundancy ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500">当前组网冗余等级</span>
                  <div className="mt-2">
                    <RedundancyBadge level={site.redundancy} />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500">运维人员维护备注</span>
                  <div className="text-slate-800 mt-1 font-mono">
                    {site.redundancyNotes || '暂无补充备注'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    选择组网拓扑冗余等级
                  </label>
                  <select
                    value={editRedundancy}
                    onChange={e => setEditRedundancy(e.target.value as RedundancyLevel)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="DUAL_HOT_BACKUP">双机热备 (Dual Hot-Backup)</option>
                    <option value="N_PLUS_1">N+1 单元模块热备 (N+1 Modular)</option>
                    <option value="RING_TOPOLOGY">光纤自愈环网 (Ring Topology)</option>
                    <option value="MULTI_ACTIVE">多活负荷分担 (Multi-Active)</option>
                    <option value="NONE">单机无冗余 (None)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    运维备注 (变更原因与现场拓扑描述)
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Core Devices Inventory */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  站点核心设备台账清单
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  只有核心设备中断方计入合同口径可用度计算 (R2)
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono font-medium">
                核心设备数: {site.coreDevices.length} 台
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">设备编码 / 设备名称</th>
                    <th className="py-3 px-3">设备类型</th>
                    <th className="py-3 px-3">规格型号</th>
                    <th className="py-3 px-3">额定功率</th>
                    <th className="py-3 px-3">核心设备标识</th>
                    <th className="py-3 px-3">投运日期</th>
                    <th className="py-3 px-4">运行状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {site.coreDevices.map(dev => (
                    <tr key={dev.id} className="hover:bg-blue-50/40">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{dev.deviceName}</div>
                        <div className="text-[11px] text-blue-600 font-mono">{dev.deviceCode}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800">{dev.deviceType}</td>
                      <td className="py-3 px-3 text-slate-500">{dev.model}</td>
                      <td className="py-3 px-3 font-mono text-slate-800">
                        {dev.ratedPowerKw ? `${dev.ratedPowerKw} kW` : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          ★ 核心计量设备
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {dev.installedDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dev.status === 'NORMAL'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {dev.status === 'NORMAL' ? '正常运行' : '告警预警中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
