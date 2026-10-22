import React, { useState } from 'react';
import { RtePerformanceData } from '../../types/performanceEvaluation';
import {
  Zap,
  Thermometer,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  Settings,
  Flame,
  Gauge,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  BarChart3,
  Sun
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';

interface RtePerformanceTabProps {
  rteData: RtePerformanceData;
  siteName: string;
}

export const RtePerformanceTab: React.FC<RtePerformanceTabProps> = ({
  rteData,
  siteName
}) => {
  const [activeSubSection, setActiveSubSection] = useState<
    'overview' | 'strategy' | 'ambient' | 'mode' | 'cellTemp' | 'transformer' | 'pcs'
  >('overview');

  const {
    overallRtePct,
    guaranteedRtePct,
    designRtePct,
    dcSideRtePct,
    auxiliaryPowerLossPct,
    chargeStrategy,
    ambientTemperature,
    operatingMode,
    cellTemperature,
    transformerEfficiency,
    pcsEfficiency,
    lossWaterfall
  } = rteData;

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                系统综合充放电能效 (RTE) 全维度性能指标
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                交流-交流净转换能效
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              深度解析影响储能系统综合 RTE 的 6 大关键运行维度：充放电策略、室外环境温度、电网运行模式、电芯温度热特性、箱变部件升压效率与 PCS 双向变流效率。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-indigo-600 font-medium">交流侧综合 RTE</div>
              <div className="text-2xl font-black text-indigo-700 font-mono mt-0.5">
                {overallRtePct}%
              </div>
              <div className="text-[9px] text-indigo-500">保证基线 ≥{guaranteedRtePct}%</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-center min-w-[105px]">
              <div className="text-[11px] text-emerald-600 font-medium">直流侧电池效率</div>
              <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                {dcSideRtePct}%
              </div>
              <div className="text-[9px] text-emerald-600">电化学转化率</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Component KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* PCS Efficiency */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>PCS 部件综合效率</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {pcsEfficiency.actualEfficiency}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            逆变: {pcsEfficiency.dischargingEfficiency}% | 整流: {pcsEfficiency.chargingEfficiency}%
          </div>
        </div>

        {/* Transformer Efficiency */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>箱式变压器效率</span>
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {transformerEfficiency.actualEfficiency}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            负荷率: {transformerEfficiency.currentLoadRatePct}%
          </div>
        </div>

        {/* Cell Max Temp */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>电芯最高温度</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {cellTemperature.maxCellTemp}
            </span>
            <span className="text-xs text-slate-500">℃</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            最大温差: <strong className="text-indigo-600">{cellTemperature.maxDeltaT}℃</strong>
          </div>
        </div>

        {/* Outdoor Ambient Temp */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>室外环境温度</span>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {ambientTemperature.currentTemp}
            </span>
            <span className="text-xs text-slate-500">℃</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            日平均: {ambientTemperature.avgTemp}℃ (极值 {ambientTemperature.maxTemp}℃)
          </div>
        </div>

        {/* Auxiliary Power Loss */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>站用辅电/液冷损耗</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {auxiliaryPowerLossPct}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            主要来自冷水机组与循环泵
          </div>
        </div>

        {/* Operating Strategy */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>充放运行策略</span>
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-600 font-mono">
              {chargeStrategy.cyclesPerDay}
            </span>
            <span className="text-xs text-slate-500">充放/日</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 truncate">
            {chargeStrategy.chargeRateC}C 恒功率削峰填谷
          </div>
        </div>
      </div>

      {/* 3. RTE Loss Waterfall Decomposition */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>全链路 RTE 能效损耗瀑布分解 (交流关口到交流关口)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              以 20 MWh 充电能量为基准，拆解箱变升降压、PCS双向变流、电池极化发热与液冷辅电能耗损耗
            </p>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            综合转化率: {overallRtePct}%
          </span>
        </div>

        {/* Waterfall Visual Progress */}
        <div className="space-y-2 pt-2">
          {lossWaterfall.map((item, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === lossWaterfall.length - 1;
            const pct = (item.energyMwh / 20.0) * 100;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isEnd ? 'text-indigo-700 font-bold' : 'text-slate-800'}`}>
                    {item.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.efficiencyLossPct !== 0 && (
                      <span className="text-rose-600 font-mono font-semibold text-[11px]">
                        {item.efficiencyLossPct}%
                      </span>
                    )}
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {item.energyMwh.toFixed(2)} MWh ({pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isStart
                        ? 'bg-blue-500'
                        : isEnd
                        ? 'bg-indigo-600'
                        : item.efficiencyLossPct < -3
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 pl-1">{item.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Deep-Dive Panels for the 6 Required RTE Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dimension 1: 充放电运行策略 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>充放电运行策略与分时执行调度</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {chargeStrategy.cyclesPerDay} 充 {chargeStrategy.cyclesPerDay} 放 / 天
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            {chargeStrategy.modeDescription}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <span className="text-[10px] text-indigo-600 block font-medium">充放电倍率</span>
              <span className="font-bold font-mono text-indigo-900 mt-0.5 text-sm">
                {chargeStrategy.chargeRateC}C / {chargeStrategy.dischargeRateC}C
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] text-emerald-600 block font-medium">充电截止 SOC</span>
              <span className="font-bold font-mono text-emerald-900 mt-0.5 text-sm">
                {chargeStrategy.chargeCutoffSocPct}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
              <span className="text-[10px] text-amber-600 block font-medium">放电截止 SOC</span>
              <span className="font-bold font-mono text-amber-900 mt-0.5 text-sm">
                {chargeStrategy.dischargeCutoffSocPct}%
              </span>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-2 px-2.5">调度时段名称</th>
                  <th className="py-2 px-2.5">时段区间</th>
                  <th className="py-2 px-2.5">动作模式</th>
                  <th className="py-2 px-2.5">调度功率</th>
                  <th className="py-2 px-2.5 text-right">参考电价(元)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chargeStrategy.peakValleySchedule.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5 font-medium text-slate-800">{p.periodName}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-600">{p.timeRange}</td>
                    <td className="py-2 px-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          p.action === 'CHARGE'
                            ? 'bg-blue-100 text-blue-700'
                            : p.action === 'DISCHARGE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.action === 'CHARGE' ? '充电蓄能' : p.action === 'DISCHARGE' ? '放电顶峰' : '待机备用'}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-mono text-slate-700">{p.powerKw} kW</td>
                    <td className="py-2 px-2.5 font-mono text-right text-slate-800">
                      ￥{p.priceYuanPerKwh.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dimension 2: 室外环温与液冷功耗动态响应 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>室外环温特性与辅助温控 RTE 损耗灵敏度</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              极值: <strong className="text-rose-600">{ambientTemperature.maxTemp}℃</strong> | 昼夜温差: {ambientTemperature.dailyDeltaT}℃
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ambientTemperature.hourlyCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis
                  yAxisId="temp"
                  domain={[20, 40]}
                  tick={{ fontSize: 10 }}
                  unit="℃"
                />
                <YAxis
                  yAxisId="power"
                  orientation="right"
                  domain={[0, 60]}
                  tick={{ fontSize: 10 }}
                  unit="kW"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="ambientTemp"
                  name="室外环温 (℃)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="cabinTemp"
                  name="舱内温控环境 (℃)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="power"
                  type="monotone"
                  dataKey="coolingPowerKw"
                  name="液冷总功耗 (kW)"
                  stroke="#ec4899"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>环温能效灵敏度分析: </strong>
              实测显示室外环境温度每升高 <strong>5℃</strong>，液冷机组额外消耗电能引发系统综合 RTE 下降约 <strong>{ambientTemperature.tempSensitivityRteLossPctPer5C}%</strong>。建议在 13:00-15:00 极端高温时段适度降低充电倍率至 0.4C 以降低热应力损耗。
            </div>
          </div>
        </div>

        {/* Dimension 3: 系统运行模式 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>系统运行模式分布与调度考核执行</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              调度达标率 {operatingMode.gridDispatchCompliancePct}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {operatingMode.modeDistribution.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{m.mode}</span>
                    <span
                      style={{ color: m.color }}
                      className="font-mono font-black text-sm"
                    >
                      {m.percentage}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
                  统计周期时长: {m.hours.toFixed(1)} 小时
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span>当前主用系统运行模式: <strong className="text-slate-800">{operatingMode.currentMode}</strong></span>
            <span className="text-emerald-600 font-medium">电网考核合规免罚</span>
          </div>
        </div>

        {/* Dimension 4: 电芯温度特性值 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <span>电芯温度特性值与 SOC 充放电热响应曲线</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              温升速率: <strong className="text-slate-800">{cellTemperature.tempRiseRatePerHour}℃/h</strong>
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cellTemperature.tempSocCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="soc" tick={{ fontSize: 10 }} unit="%" label={{ value: 'SOC (%)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis domain={[18, 42]} tick={{ fontSize: 10 }} unit="℃" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Line
                  type="monotone"
                  dataKey="chargeTemp"
                  name="0.5C充电电芯温度 (℃)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="dischargeTemp"
                  name="0.5C放电电芯温度 (℃)"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="coolantInTemp"
                  name="液冷进水温度 (℃)"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block">最高/最低温</span>
              <span className="font-bold font-mono text-slate-800">{cellTemperature.maxCellTemp}℃ / {cellTemperature.minCellTemp}℃</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block">电芯最大温差</span>
              <span className="font-bold font-mono text-amber-600">ΔT {cellTemperature.maxDeltaT}℃</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block">液冷机组启动阈值</span>
              <span className="font-bold font-mono text-indigo-600">{cellTemperature.coolingTriggerThreshold}℃</span>
            </div>
          </div>
        </div>

        {/* Dimension 5: 箱变部件效率 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>箱式变压器部件效率特性 (负载率曲线)</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              实测效率 {transformerEfficiency.actualEfficiency}%
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transformerEfficiency.efficiencyCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="loadPct" tick={{ fontSize: 10 }} unit="%" label={{ value: '负荷率 (%)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis domain={[96, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="efficiency"
                  name="箱变综合效率 (%)"
                  stroke="#10b981"
                  fill="#d1fae5"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] block">空载损耗 (铁损 Po)</span>
              <strong className="text-slate-800 font-mono text-sm">{transformerEfficiency.noLoadLossKw} kW</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">全天持续恒定损耗</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">额定负载损耗 (铜损 Pk)</span>
              <strong className="text-slate-800 font-mono text-sm">{transformerEfficiency.loadLossKw} kW</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">随负荷平方律变动</span>
            </div>
          </div>
        </div>

        {/* Dimension 6: PCS 部件效率 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>PCS 双向变流部件效率曲线 (整流 / 逆变)</span>
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              综合效率 {pcsEfficiency.actualEfficiency}%
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pcsEfficiency.efficiencyCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="loadPct" tick={{ fontSize: 10 }} unit="%" label={{ value: '负荷率 (%)', position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                <YAxis domain={[96, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Line
                  type="monotone"
                  dataKey="dischargingEff"
                  name="放电逆变效率 (%)"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="chargingEff"
                  name="充电整流效率 (%)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] block">运行功率因数 cosφ</span>
              <strong className="text-slate-800 font-mono text-sm">{pcsEfficiency.powerFactor}</strong>
              <span className="text-[10px] text-emerald-600 block mt-0.5">无功损耗极小</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">变流器自身功耗损耗</span>
              <strong className="text-slate-800 font-mono text-sm">{pcsEfficiency.lossSummaryKw} kW</strong>
              <span className="text-[10px] text-slate-400 block mt-0.5">IGBT驱动及控制电源</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
