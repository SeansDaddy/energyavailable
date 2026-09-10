import React from 'react';
import { Site, RedundancyLevel } from '../../types';
import { StatusLampBadge, RedundancyBadge } from '../common/StatusBadge';
import {
  Activity,
  Shield,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Clock,
  Wrench,
  FileText,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Zap,
  Server
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

interface SitePanoramaTabProps {
  site: Site;
  onNavigateTab: (tabIdx: number) => void;
  onSelectDay?: (date: string) => void;
}

export const SitePanoramaTab: React.FC<SitePanoramaTabProps> = ({
  site,
  onNavigateTab,
  onSelectDay
}) => {
  const gap = Number((site.currentAvailability - site.slaThreshold).toFixed(2));
  const isBreached = site.currentAvailability < site.slaThreshold;

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

  // Subsystems Health Status
  const subsystems = [
    {
      id: 'sub-pcs',
      name: 'PCS 变流系统',
      type: '核心计量',
      status: site.statusLamp === 'red' ? 'FAULT' : 'NORMAL',
      deviceCount: site.coreDevices.filter(d => d.deviceType === 'PCS_INVERTER').length,
      detail: '主变流器并联运行，支持双向充放电调度',
      tabTarget: 3 // Device Tab
    },
    {
      id: 'sub-bms',
      name: 'BMS 电池储能系统',
      type: '核心计量',
      status: 'NORMAL',
      deviceCount: site.coreDevices.filter(d => d.deviceType === 'BMS_CLUSTER').length,
      detail: '高压电池簇集控管理，单体电芯温度与SOC实时监控',
      tabTarget: 3
    },
    {
      id: 'sub-ems',
      name: 'EMS 能量管理主控',
      type: '核心计量',
      status: 'NORMAL',
      deviceCount: site.coreDevices.filter(d => d.deviceType === 'EMS_HOST').length,
      detail: '双冗余工业主控机，通信协议自适应对齐',
      tabTarget: 3
    },
    {
      id: 'sub-network',
      name: '通信组网拓扑',
      type: '冗余链路',
      status: 'NORMAL',
      deviceCount: 2,
      detail: site.redundancyNotes || '组网冗余链路正常',
      tabTarget: 3
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Quick Drilldown Guide Bar */}
      <div className="bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200/80 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>站点级逐层下钻分析链路已就绪</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono">
                Site-Centric Drilldown
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              从全局指标 &rarr; 逐日打点快照 &rarr; 归并故障因果链 &rarr; 核心设备台账 &rarr; 工单闭环与合同 SLA 追溯。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab(1)}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>逐日打点下钻</span>
          </button>
          <button
            onClick={() => onNavigateTab(2)}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>故障时间线下钻 ({site.mergedFaults.length})</span>
          </button>
          <button
            onClick={() => onNavigateTab(3)}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>核心设备台账 ({site.coreDevices.length})</span>
          </button>
        </div>
      </div>

      {/* Double Indicator Header Cards (Rule R1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Availability (Contract SLA Dimension) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 px-3 py-1 bg-blue-50 text-blue-700 border-b border-l border-blue-200 text-[10px] font-bold rounded-bl uppercase font-mono">
            合同履约口径 (R1)
          </div>

          <div>
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
                <div className="text-[11px] text-slate-500 font-medium">当期实际可用度</div>
                <div
                  className={`text-2xl font-black font-mono mt-1 ${
                    isBreached ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {site.currentAvailability}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isBreached ? '已低于SLA阈值' : '符合合同承诺'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">合同 SLA 约定阈值</div>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {site.slaThreshold}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">合同唯一约定值 (R10)</div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">达标差值 (Gap)</div>
                <div
                  className={`text-2xl font-black font-mono mt-1 ${
                    gap >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {gap >= 0 ? `+${gap}%` : `${gap}%`}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {gap >= 0 ? '安全缓冲充足' : '存在违约罚款风险'}
                </div>
              </div>
            </div>

            {/* Mini Availability Daily Snapshots Trend */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>8 月份每日可用度打点走势</span>
                  <span className="text-[10px] text-slate-400 font-normal">(点击点位可快速下钻)</span>
                </span>
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
                      tickFormatter={val => (val ? String(val).slice(-5) : '')}
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
                      activeDot={{ r: 5, fill: '#1d4ed8' }}
                      onClick={(e: any) => {
                        if (e && e.activePayload && e.activePayload[0] && onSelectDay) {
                          onSelectDay(e.activePayload[0].payload.date);
                          onNavigateTab(1);
                        }
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              最后日志更新: <strong className="font-mono text-slate-700">{site.lastImportTime}</strong>
            </span>
            <button
              onClick={() => onNavigateTab(1)}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>查看 30 天打点完整日历与日切分析 &rarr;</span>
            </button>
          </div>
        </div>

        {/* Card 2: Reliability Score (Internal Management 5-Factor Model) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-50 text-indigo-700 border-b border-l border-indigo-200 text-[10px] font-bold rounded-bl uppercase font-mono">
            内部管理口径 (R1)
          </div>

          <div>
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
                  <span className="text-xs text-slate-500 font-medium">综合可靠性得分</span>
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
                {Object.entries(site.reliabilityScore.factors).map(([key, factorObj]: any) => (
                  <div
                    key={key}
                    className="p-2 rounded bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {factorObj.name}{' '}
                        <span className="text-[10px] text-indigo-600 font-mono">
                          ({(factorObj.weight * 100).toFixed(0)}% 权重)
                        </span>
                      </span>
                      <span className="font-mono font-bold text-indigo-600">
                        {factorObj.score} 分
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {factorObj.rawValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              当前冗余等级: <strong className="text-slate-800">{site.redundancy}</strong>
            </span>
            <button
              onClick={() => onNavigateTab(3)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>查看拓扑与在线维护冗余度 &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subsystem Health Grid (Site Topology Core Layer) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              站点核心子系统运行状态与拓扑健康
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              点击任意子系统可直接下钻查看该子系统的核心设备台账与实时运行参数。
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">
            共 {site.coreDevices.length} 台核心计量设备
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {subsystems.map(sub => (
            <div
              key={sub.id}
              onClick={() => onNavigateTab(sub.tabTarget)}
              className="p-4 rounded-lg bg-slate-50 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                    {sub.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sub.status === 'NORMAL'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {sub.status === 'NORMAL' ? '正常' : '告警'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  {sub.detail}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  设备数: <strong className="text-slate-800 font-mono">{sub.deviceCount}</strong>
                </span>
                <span className="text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>下钻设备</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
