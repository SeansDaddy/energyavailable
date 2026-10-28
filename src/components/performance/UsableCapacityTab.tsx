import React, { useState } from 'react';
import { UsableCapacityData } from '../../types/performanceEvaluation';
import {
  BatteryCharging,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  TrendingDown,
  Layers,
  CheckCircle2,
  Calendar,
  Thermometer,
  Zap,
  Info,
  Clock,
  ArrowRight,
  Scale,
  Activity,
  Sliders,
  BarChart2
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
  Legend,
  ReferenceLine,
  BarChart
} from 'recharts';

interface UsableCapacityTabProps {
  capacityData: UsableCapacityData;
  siteName: string;
}

export const UsableCapacityTab: React.FC<UsableCapacityTabProps> = ({
  capacityData,
  siteName
}) => {
  const {
    ratedCapacityMwh,
    actualUsableCapacityMwh,
    guaranteedCapacityMwh,
    capacityRetentionPct,
    capacityMarginMwh,
    capacityMarginPct,
    status,
    testCondition,
    clusters,
    degradationHistory
  } = capacityData;

  const [activeSubView, setActiveSubView] = useState<
    'all' | 'socRange' | 'efficiency' | 'socConsistency' | 'energyStats' | 'socValue' | 'conditions'
  >('all');

  const isSurplus = status === 'SURPLUS';
  const bottleneckClusters = clusters.filter(c => c.isBottleneck);

  // 6 核心要素数据
  // 1. SOC 充放电范围
  const socRangeData = {
    nominalRange: '0% ~ 100%',
    operationalRange: '5.0% ~ 95.0%',
    topBufferPct: 5.0, // 防过充预留安全缓冲
    bottomBufferPct: 5.0, // 防过放预留安全缓冲
    effectiveDodPct: 90.0, // 实际可用有效工作区间 (DOD)
    chargeCutoffV: 1250, // 充电截止电压
    dischargeCutoffV: 1020 // 放电截止电压
  };

  // 2. 充放电效率
  const efficiencyData = {
    coulombicEfficiencyPct: 99.4, // 库伦效率 %
    energyEfficiencyPct: 95.2, // 电池端能量效率 %
    cRateEfficiencies: [
      { rate: '0.2C (小倍率慢充放)', coulombic: 99.6, energy: 96.4 },
      { rate: '0.5C (额定工况)', coulombic: 99.4, energy: 95.2 },
      { rate: '0.8C (高峰保供)', coulombic: 98.8, energy: 93.5 },
      { rate: '1.0C (瞬态顶峰)', coulombic: 97.9, energy: 91.2 }
    ]
  };

  // 3. SOC 一致性
  const socConsistencyData = {
    maxDeltaSoc: 4.2, // 最大极差 ΔSOC %
    standardDeviation: 1.18, // 正态分布标准差 σ %
    chargeEndDispersion: 3.8, // 满充末端离散度 %
    dischargeEndDispersion: 4.5, // 满放末端离散度 %
    bottleneckClusterCode: 'CLUSTER-#03'
  };

  // 4. 电能量统计
  const energyStatsData = {
    cumulativeChargedMwh: 2420,
    cumulativeDischargedMwh: 2150,
    avgDailyDischargeMwh: 19.6,
    monthlyThroughputMwh: 588,
    netRetentionRatePct: 98.0
  };

  // 5. SOC 实时值与各簇分布
  const currentAvgSoc = 66.8;
  const realtimeClusterSocs = [
    { clusterCode: 'C01', currentSoc: 68.5, maxSoc: 96.2, minSoc: 4.8, isBottleneck: false },
    { clusterCode: 'C02', currentSoc: 67.8, maxSoc: 95.8, minSoc: 5.2, isBottleneck: false },
    { clusterCode: 'C03', currentSoc: 62.4, maxSoc: 92.5, minSoc: 7.4, isBottleneck: true },
    { clusterCode: 'C04', currentSoc: 66.9, maxSoc: 95.4, minSoc: 5.0, isBottleneck: false },
    { clusterCode: 'C05', currentSoc: 67.4, maxSoc: 95.9, minSoc: 4.9, isBottleneck: false },
    { clusterCode: 'C06', currentSoc: 68.0, maxSoc: 96.1, minSoc: 5.1, isBottleneck: false }
  ];

  // 6. 历史运行工况
  const historicalConditions = [
    { date: '2026-08 (第4次标定)', cRate: '0.5C', temp: '25.2℃', usableMwh: actualUsableCapacityMwh, retention: `${capacityRetentionPct}%`, fec: 1482, result: '合格达标' },
    { date: '2026-02 (第3次标定)', cRate: '0.5C', temp: '21.5℃', usableMwh: 19.72, retention: '98.6%', fec: 1024, result: '合格达标' },
    { date: '2025-08 (第2次标定)', cRate: '0.5C', temp: '26.0℃', usableMwh: 19.85, retention: '99.2%', fec: 640, result: '合格达标' },
    { date: '2024-06 (投运初检)', cRate: '0.5C', temp: '24.8℃', usableMwh: 20.00, retention: '100.0%', fec: 0, result: '出厂满标' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                站点可用容量 AUC 标定与健康度评估 (包含 6 大核心运行要素)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                实测放电电能量积分
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              深度覆盖可用容量 AUC 关键 6 项要素：① SOC充放电范围、② 充放电效率、③ SOC一致性、④ 电能量统计、⑤ 当前实时与各簇SOC值、⑥ 历史运行工况标定记录。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-indigo-600 font-medium">实测可用容量 AUC</div>
              <div className="text-2xl font-black text-indigo-700 font-mono mt-0.5">
                {actualUsableCapacityMwh} <span className="text-xs font-normal">MWh</span>
              </div>
              <div className="text-[9px] text-indigo-500">额定: {ratedCapacityMwh} MWh</div>
            </div>

            <div
              className={`px-3 py-2 rounded-lg text-center min-w-[110px] border ${
                isSurplus
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="text-[11px] font-medium">
                {isSurplus ? '履约安全余量' : '容量跌破保证线'}
              </div>
              <div className="text-xl font-black font-mono mt-0.5">
                {isSurplus ? `+${capacityMarginMwh}` : `${capacityMarginMwh}`}{' '}
                <span className="text-xs font-normal">MWh</span>
              </div>
              <div className="text-[9px]">
                {isSurplus ? `裕度 +${capacityMarginPct}%` : '需立即均衡消缺'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards for the 6 Core Elements */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Element 1: SOC 充放电范围 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">① SOC 充放电范围</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            {socRangeData.operationalRange}
          </div>
          <div className="text-[10px] text-indigo-600 mt-0.5">有效 DOD {socRangeData.effectiveDodPct}%</div>
        </div>

        {/* Element 2: 充放电效率 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">② 充放电效率</div>
          <div className="text-base font-bold font-mono text-emerald-700 mt-1">
            {efficiencyData.energyEfficiencyPct}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">库伦效率 {efficiencyData.coulombicEfficiencyPct}%</div>
        </div>

        {/* Element 3: SOC 一致性 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">③ SOC 一致性极差</div>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            Δ {socConsistencyData.maxDeltaSoc}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">标准差 σ: {socConsistencyData.standardDeviation}%</div>
        </div>

        {/* Element 4: 电能量统计 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">④ 累计放电量</div>
          <div className="text-base font-bold font-mono text-blue-700 mt-1">
            {energyStatsData.cumulativeDischargedMwh} MWh
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">日均放电 {energyStatsData.avgDailyDischargeMwh} MWh</div>
        </div>

        {/* Element 5: SOC 实时值 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">⑤ 实时加权 SOC</div>
          <div className="text-base font-bold font-mono text-indigo-700 mt-1">
            {currentAvgSoc}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">6个储能簇在线运行</div>
        </div>

        {/* Element 6: 历史运行工况 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-medium">⑥ 历史运行工况</div>
          <div className="text-base font-bold font-mono text-purple-700 mt-1">
            4 轮标定
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">累计 1,482 次全循环</div>
        </div>
      </div>

      {/* 3. Detailed Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: ① SOC 充放电范围 & ⑤ 实时与各簇 SOC 值 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>① SOC 充放电范围与 ⑤ 各簇实时 SOC 分布监控</span>
            </h3>
            <span className="text-[11px] text-slate-500">全站平均: <strong className="text-indigo-700">{currentAvgSoc}%</strong></span>
          </div>

          {/* Visual SOC Range Bar */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>0% (低电截止)</span>
              <span className="text-emerald-700 font-bold">实际可用放电区间: 5.0% ~ 95.0% (有效 DOD 90%)</span>
              <span>100% (满电截止)</span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
              <div style={{ width: '5%' }} className="bg-rose-400 h-full" title="防过放缓冲 5%" />
              <div style={{ width: '90%' }} className="bg-emerald-500 h-full relative flex items-center justify-center text-[10px] text-white font-bold">
                可用工作深度 90%
              </div>
              <div style={{ width: '5%' }} className="bg-amber-400 h-full" title="防过充缓冲 5%" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>底部防过放缓冲 5%</span>
              <span>额定充放截止电压: {socRangeData.dischargeCutoffV}V ~ {socRangeData.chargeCutoffV}V</span>
              <span>顶部防过充缓冲 5%</span>
            </div>
          </div>

          {/* Realtime Cluster SOC Bar Comparison */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>各电池簇实时 SOC 分布 (⑤ 当前各簇数值)</span>
              <span className="text-[11px] text-slate-400 font-mono">ΔSOC: 4.2%</span>
            </div>
            <div className="space-y-1.5">
              {realtimeClusterSocs.map(c => (
                <div key={c.clusterCode} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <span>{c.clusterCode} 簇</span>
                      {c.isBottleneck && (
                        <span className="text-[9px] px-1 bg-rose-100 text-rose-700 rounded font-sans">
                          短板簇
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-900">{c.currentSoc}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${c.currentSoc}%` }}
                      className={`h-full rounded-full ${
                        c.isBottleneck ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card B: ② 充放电效率 & ③ SOC 一致性 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>② 充放电倍率能效特性 与 ③ SOC 一致性极差</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">库伦效率: 99.4%</span>
          </div>

          {/* C-rate Efficiencies Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-2 px-2.5">充放倍率工况</th>
                  <th className="py-2 px-2.5 font-mono">库伦效率 (Ah)</th>
                  <th className="py-2 px-2.5 font-mono">能量效率 (Wh)</th>
                  <th className="py-2 px-2.5">综合表现</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {efficiencyData.cRateEfficiencies.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5 font-medium text-slate-900">{row.rate}</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-slate-800">{row.coulombic}%</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-emerald-700">{row.energy}%</td>
                    <td className="py-2 px-2.5">
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                        优良
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SOC Consistency Breakdown */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400 font-medium">满充末期离散度</div>
              <div className="text-lg font-black font-mono text-slate-900">
                {socConsistencyData.chargeEndDispersion}%
              </div>
              <div className="text-[10px] text-slate-500">截止电压保护点平缓</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400 font-medium">满放末期离散度 (木桶短板)</div>
              <div className="text-lg font-black font-mono text-amber-600">
                {socConsistencyData.dischargeEndDispersion}%
              </div>
              <div className="text-[10px] text-slate-500">CLUSTER-#03 提前放空截断</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card C: ④ 电能量统计 & ⑥ 历史运行工况标定记录 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Element 4: 电能量统计与各簇吞吐平衡 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>④ 充放电能量统计与月度吞吐台账</span>
            </h3>
            <span className="text-[11px] text-slate-500">累计吞吐: <strong className="text-slate-800">4,570 MWh</strong></span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400">累计充入电能</div>
              <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                {energyStatsData.cumulativeChargedMwh} <span className="text-xs font-normal">MWh</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400">累计放出电能</div>
              <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">
                {energyStatsData.cumulativeDischargedMwh} <span className="text-xs font-normal">MWh</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400">月度充放吞吐量</div>
              <div className="text-lg font-black font-mono text-blue-700 mt-0.5">
                {energyStatsData.monthlyThroughputMwh} <span className="text-xs font-normal">MWh</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>能量吞吐保持率分析</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              全站实测累计放电电能量与额定设计指标对比保持率达 <strong>{energyStatsData.netRetentionRatePct}%</strong>，日均充放电吞吐稳定在 19.6 MWh，能量计量符合 GB/T 36276 准则。
            </p>
          </div>
        </div>

        {/* Element 6: 历史运行工况标定试验台账 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>⑥ 历次实测容量标定试验与工况履约记录</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">共 4 轮标定</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-2 px-2.5">标定周期</th>
                  <th className="py-2 px-2.5 font-mono">倍率/环境温</th>
                  <th className="py-2 px-2.5 font-mono">实测容量 AUC</th>
                  <th className="py-2 px-2.5 font-mono">保持率</th>
                  <th className="py-2 px-2.5 font-mono">累计FEC</th>
                  <th className="py-2 px-2.5 text-right">结论</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicalConditions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5 font-medium text-slate-900">{item.date}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-600">{item.cRate} / {item.temp}</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-indigo-700">{item.usableMwh} MWh</td>
                    <td className="py-2 px-2.5 font-mono text-slate-800">{item.retention}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-600">{item.fec} 次</td>
                    <td className="py-2 px-2.5 text-right">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
