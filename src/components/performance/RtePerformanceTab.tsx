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
  Sun,
  ShieldAlert,
  GitBranch,
  Sliders,
  Scale
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
  const [activeSection, setActiveSection] = useState<
    'overview' | 'strategy' | 'ambient' | 'mode' | 'cellTemp' | 'components' | 'capacity' | 'cableLoss'
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

  // 7 核心维度扩展数据
  // 6. 容量一致性
  const capacityConsistencyData = {
    clusterCapacitySpreadAh: 18.5, // 簇间容量离散极差 Ah
    standardDeviationAh: 4.8, // 容量标准差 Ah
    bottleneckLossMwhPerYear: 32.4, // 木桶短板提前截断导致的年度充放电量损失 MWh
    clusterCapacityList: [
      { cluster: 'CLUSTER-#01', capacityAh: 284.2, deviation: '+1.2%', isBottleneck: false },
      { cluster: 'CLUSTER-#02', capacityAh: 282.6, deviation: '+0.6%', isBottleneck: false },
      { cluster: 'CLUSTER-#03', capacityAh: 265.7, deviation: '-5.4%', isBottleneck: true },
      { cluster: 'CLUSTER-#04', capacityAh: 283.8, deviation: '+1.0%', isBottleneck: false },
      { cluster: 'CLUSTER-#05', capacityAh: 281.5, deviation: '+0.2%', isBottleneck: false },
      { cluster: 'CLUSTER-#06', capacityAh: 282.9, deviation: '+0.7%', isBottleneck: false }
    ]
  };

  // 7. 高压配电盒线缆损耗
  const cableLossData = {
    totalDcLossPct: 1.50, // 综合直流侧电气损耗率 %
    copperBusbarLossPct: 0.42, // 直流汇流母排损耗 %
    dcPowerCableLossPct: 0.58, // DC 动力电缆线路阻抗损耗 (I²R) %
    contactResistanceLossPct: 0.28, // 开关与端子接触电阻发热 %
    hvBoxAuxLossPct: 0.22, // 高压配电盒内继电器/分流器功耗 %
    hottestTerminalTempC: 48.6, // 最热接线端子温度 ℃
    terminalDeltaT: 14.4, // 端子与环境温升 ℃
    annualLossMwh: 36.8 // 年度线损电量折算 MWh
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                系统综合充放电往返能效 (RTE) 全维度性能指标 (7 大关键要素)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                交流-交流净转换能效
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              深度解析影响综合 RTE 的 7 大关键要素：① 充放电策略、② 室外环温、③ 系统运行模式、④ 电芯温度、⑤ 各部件效率、⑥ 容量一致性、⑦ 高压配电盒线缆损耗。
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

      {/* 2. Top Metric Cards for 7 Core Elements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">① 充放电策略</div>
          <div className="text-xs font-bold font-mono text-slate-900 mt-1">两充两放</div>
          <div className="text-[10px] text-indigo-600 mt-0.5">0.5C / 0.5C</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">② 室外环温</div>
          <div className="text-xs font-bold font-mono text-amber-700 mt-1">
            {ambientTemperature.currentTemp} ℃
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">均温 {ambientTemperature.avgTemp}℃</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">③ 系统运行模式</div>
          <div className="text-xs font-bold font-mono text-blue-700 mt-1">削峰填谷+AGC</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">合规率 {operatingMode.gridDispatchCompliancePct}%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">④ 电芯温度</div>
          <div className="text-xs font-bold font-mono text-slate-900 mt-1">
            ΔT {cellTemperature.maxDeltaT} ℃
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">最高 {cellTemperature.maxCellTemp}℃</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">⑤ 各部件效率</div>
          <div className="text-xs font-bold font-mono text-emerald-700 mt-1">
            PCS {pcsEfficiency.actualEfficiency}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">箱变 {transformerEfficiency.actualEfficiency}%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">⑥ 容量一致性</div>
          <div className="text-xs font-bold font-mono text-purple-700 mt-1">
            Δ {capacityConsistencyData.clusterCapacitySpreadAh} Ah
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">截断损耗 32.4 MWh</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">⑦ 配电盒线损</div>
          <div className="text-xs font-bold font-mono text-rose-700 mt-1">
            {cableLossData.totalDcLossPct}% 线损
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">端子温升 {cableLossData.terminalDeltaT}℃</div>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          全能效瀑布图总览
        </button>
        <button
          onClick={() => setActiveSection('strategy')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'strategy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ① 充放电策略与倍率
        </button>
        <button
          onClick={() => setActiveSection('ambient')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'ambient'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ② 室外环温与能效敏感度
        </button>
        <button
          onClick={() => setActiveSection('mode')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'mode'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ③ 系统运行模式能效对比
        </button>
        <button
          onClick={() => setActiveSection('cellTemp')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'cellTemp'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ④ 电芯温度场与内阻损耗
        </button>
        <button
          onClick={() => setActiveSection('components')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'components'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ⑤ 各部件效率 (变压器+PCS)
        </button>
        <button
          onClick={() => setActiveSection('capacity')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'capacity'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ⑥ 容量一致性与短板截断
        </button>
        <button
          onClick={() => setActiveSection('cableLoss')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSection === 'cableLoss'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ⑦ 高压配电盒线缆损耗
        </button>
      </div>

      {/* 4. Section Renderings */}
      {/* Section 1: Overview & Waterfall */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>交流-交流 全链路能效损耗瀑布流拆解 (100% 入网电能 ➔ {overallRtePct}% 上网净能效)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {lossWaterfall.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">环节 {idx + 1}</div>
                  <div className="text-xs font-bold text-slate-900">{item.stage}</div>
                  <div className="text-lg font-black font-mono text-indigo-700">{item.energyMwh} MWh</div>
                  <div className="text-[10px] text-rose-600 font-semibold">损耗 -{item.efficiencyLossPct}%</div>
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/80 leading-tight">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: 充放电策略 */}
      {activeSection === 'strategy' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>① 充放电调度策略、峰谷分时时段与倍率控制</span>
            </h3>
            <span className="text-xs text-indigo-600 font-semibold">{chargeStrategy.strategyName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {chargeStrategy.peakValleySchedule.map((sched, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{sched.periodName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sched.action === 'CHARGE'
                        ? 'bg-blue-100 text-blue-700'
                        : sched.action === 'DISCHARGE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sched.action === 'CHARGE' ? '充电' : sched.action === 'DISCHARGE' ? '放电' : '待机'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-600">{sched.timeRange}</div>
                <div className="text-xs font-bold font-mono text-slate-800">
                  功率: {sched.powerKw} kW
                </div>
                <div className="text-[10px] text-slate-500">电价: ¥{sched.priceYuanPerKwh} /kWh</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: 室外环温 */}
      {activeSection === 'ambient' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>② 室外环境温度与温控辅电功耗敏感性相关曲线</span>
            </h3>
            <span className="text-xs text-amber-700 font-medium">当前气温 {ambientTemperature.currentTemp}℃</span>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ambientTemperature.hourlyCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="temp" tick={{ fontSize: 10 }} unit="℃" domain={[10, 45]} />
                <YAxis yAxisId="power" orientation="right" tick={{ fontSize: 10 }} unit="kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="temp" type="monotone" dataKey="ambientTemp" name="室外环境温度(℃)" stroke="#f59e0b" strokeWidth={2} />
                <Line yAxisId="temp" type="monotone" dataKey="cabinTemp" name="舱内温(℃)" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="power" type="monotone" dataKey="coolingPowerKw" name="液冷辅电功耗(kW)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Section 4: 系统运行模式 */}
      {activeSection === 'mode' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-indigo-600" />
            <span>③ 系统运行模式能效差异对比 (削峰填谷 vs 电网调频 AGC vs 需量控制)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {operatingMode.modeDistribution.map((m, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{m.mode}</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">{m.percentage}% 工时</span>
                </div>
                <div className="text-xs text-slate-600">{m.description}</div>
                <div className="text-[11px] text-slate-500 font-mono">累计工时: {m.hours} 小时</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: 电芯温度 */}
      {activeSection === 'cellTemp' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-indigo-600" />
            <span>④ 电芯核心温度分布与充放电发热特性</span>
          </h3>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400">最高电芯温度</div>
              <div className="text-xl font-black font-mono text-rose-600 mt-0.5">{cellTemperature.maxCellTemp} ℃</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400">最低电芯温度</div>
              <div className="text-xl font-black font-mono text-blue-600 mt-0.5">{cellTemperature.minCellTemp} ℃</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400">平均工作温度</div>
              <div className="text-xl font-black font-mono text-slate-800 mt-0.5">{cellTemperature.avgCellTemp} ℃</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400">全站最大温差 ΔT</div>
              <div className="text-xl font-black font-mono text-amber-600 mt-0.5">{cellTemperature.maxDeltaT} ℃</div>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: 各部件效率 */}
      {activeSection === 'components' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>⑤ 各部件效率明细 (箱式变压器效率 · PCS 变流效率)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-900">35kV / 0.69kV 升压箱式变压器</div>
              <div className="text-xl font-black font-mono text-emerald-700">{transformerEfficiency.actualEfficiency}% 实测效率</div>
              <div className="text-xs text-slate-500">额定设计效率: {transformerEfficiency.ratedEfficiency}% · 负荷率: {transformerEfficiency.currentLoadRatePct}%</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-xs text-slate-900">2.5MW 储能双向变流器 PCS</div>
              <div className="text-xl font-black font-mono text-indigo-700">{pcsEfficiency.actualEfficiency}% 综合效率</div>
              <div className="text-xs text-slate-500">整流充电: {pcsEfficiency.chargingEfficiency}% · 逆变放电: {pcsEfficiency.dischargingEfficiency}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Section 7: 容量一致性 */}
      {activeSection === 'capacity' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>⑥ 电池簇间容量一致性与木桶短板提前截断损失</span>
            </h3>
            <span className="text-xs text-rose-600 font-semibold font-mono">
              年度截断电量损失: {capacityConsistencyData.bottleneckLossMwhPerYear} MWh
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            {capacityConsistencyData.clusterCapacityList.map(c => (
              <div
                key={c.cluster}
                className={`p-3 rounded-xl border text-center ${
                  c.isBottleneck
                    ? 'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-300'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-500">{c.cluster}</div>
                <div className="text-sm font-bold font-mono mt-1">{c.capacityAh} Ah</div>
                <div className={`text-[10px] font-mono mt-0.5 ${c.isBottleneck ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  偏离: {c.deviation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 8: 高压配电盒线缆损耗 */}
      {activeSection === 'cableLoss' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              <span>⑦ 高压配电盒与直流动力线缆发热损耗评估 (I²R 阻抗与端子温升)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              综合直流线损率: {cableLossData.totalDcLossPct}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400">直流母排铜排发热</div>
              <div className="text-lg font-black font-mono text-slate-900">{cableLossData.copperBusbarLossPct}%</div>
              <div className="text-[10px] text-slate-500">铜排载流截面充足</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400">DC 动力电缆线路损耗</div>
              <div className="text-lg font-black font-mono text-amber-600">{cableLossData.dcPowerCableLossPct}%</div>
              <div className="text-[10px] text-slate-500">线缆长度及压降阻抗</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400">接线端子接触电阻损耗</div>
              <div className="text-lg font-black font-mono text-rose-600">{cableLossData.contactResistanceLossPct}%</div>
              <div className="text-[10px] text-rose-600 font-semibold">最热端子: {cableLossData.hottestTerminalTempC}℃</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400">年度线损电量折算</div>
              <div className="text-lg font-black font-mono text-slate-900">{cableLossData.annualLossMwh} MWh</div>
              <div className="text-[10px] text-slate-500">建议复紧接触螺栓力矩</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
