import React, { useState } from 'react';
import { SohComprehensiveData } from '../../types/performanceEvaluation';
import {
  Activity,
  Scale,
  Zap,
  Clock,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Layers,
  TrendingDown,
  Filter,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';

interface SohPerformanceTabProps {
  sohData: SohComprehensiveData;
  siteName: string;
}

export const SohPerformanceTab: React.FC<SohPerformanceTabProps> = ({
  sohData,
  siteName
}) => {
  const {
    socConsistency,
    electricalEnergy,
    sohConsistency,
    operatingCondition
  } = sohData;

  const [activeSection, setActiveSection] = useState<
    'all' | 'soc' | 'energy' | 'soh' | 'condition'
  >('all');

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                SOH 综合性能指标评估 (SOC一致性 · 电能量 · SOH一致性 · 运行工况)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                四维协同评估
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              结合实时 SOC 离散极差、充放电能量吞吐台账、PACK/簇级 SOH 分布一致性及 FEC 等效循环工况，全方位研判电芯健康退化与寿命损耗。
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-center min-w-[105px]">
              <div className="text-[11px] text-indigo-600 font-medium">全站平均 SOH</div>
              <div className="text-2xl font-black text-indigo-700 font-mono mt-0.5">
                {sohConsistency.avgSohPct}%
              </div>
              <div className="text-[9px] text-indigo-500">达标线 ≥90%</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-center min-w-[105px]">
              <div className="text-[11px] text-emerald-600 font-medium">累计 FEC 循环</div>
              <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                {operatingCondition.cumulativeFecCycles}
              </div>
              <div className="text-[9px] text-emerald-600">消耗 {operatingCondition.cycleConsumptionPct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics across the 4 Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* SOC Consistency */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>SOC 一致性极差 ΔSOC</span>
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                socConsistency.maxDeltaSocPct > 4.5 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {socConsistency.maxDeltaSocPct}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            标准差 σ: {socConsistency.standardDeviationPct}%
          </div>
        </div>

        {/* Electrical Energy */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>累计充放电吞吐量</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {electricalEnergy.cumulativeThroughputMwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">MWh</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            放电: {electricalEnergy.cumulativeDischargedMwh.toLocaleString()} MWh
          </div>
        </div>

        {/* SOH Consistency */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>SOH 极差与短板</span>
            <Activity className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {sohConsistency.deltaSohPct}
            </span>
            <span className="text-xs text-slate-500">% ΔSOH</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            最低: <strong className="text-rose-600">{sohConsistency.minSohPct}%</strong> ({sohConsistency.substandardCount > 0 ? `${sohConsistency.substandardCount}组超标` : '全部达标'})
          </div>
        </div>

        {/* Operating Conditions */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>运行工况高应力停留</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {operatingCondition.highSocRestRatioPct}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            高 SOC (&gt;90%) 持续静置占比
          </div>
        </div>
      </div>

      {/* 3. Dimension 1: SOC 一致性 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>维度一：各储能簇 SOC 一致性分布与充放电截止离散度</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              监控全站 8 组储能簇在实时工况、满充末期 (SOC 100%) 及满放末期 (SOC 0%) 的离散度
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            全站平均 SOC: <strong className="text-indigo-600 font-mono font-bold">{socConsistency.avgSocPct}%</strong>
          </span>
        </div>

        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={socConsistency.clusterSocList}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="clusterCode" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 105]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar
                dataKey="currentSoc"
                name="当前实时 SOC (%)"
                fill="#4f46e5"
                barSize={18}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="chargeEndSoc"
                name="满充末期截止 SOC (%)"
                fill="#10b981"
                barSize={18}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="dischargeEndSoc"
                name="满放末期截止 SOC (%)"
                fill="#f59e0b"
                barSize={18}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{socConsistency.evaluationNote}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 shrink-0">
            <span>满充离散度: <strong className="text-slate-800">{socConsistency.chargeEndDispersionPct}%</strong></span>
            <span>满放离散度: <strong className="text-slate-800">{socConsistency.dischargeEndDispersionPct}%</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Dimension 2: 电能量数据 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>维度二：电能量台账与单日充放吞吐量历史趋势 (近 14 日)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              精准计量每日充电量、放电量及充放吞吐量，评估系统日充放利用率与 RTE 稳定性
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500">累计充: <strong className="text-slate-800">{electricalEnergy.cumulativeChargedMwh} MWh</strong></span>
            <span className="text-slate-500">累计放: <strong className="text-emerald-600">{electricalEnergy.cumulativeDischargedMwh} MWh</strong></span>
          </div>
        </div>

        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={electricalEnergy.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit=" MWh" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar
                dataKey="chargedMwh"
                name="单日充电量 (MWh)"
                fill="#93c5fd"
                barSize={14}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="dischargedMwh"
                name="单日放电量 (MWh)"
                fill="#3b82f6"
                barSize={14}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cluster Throughput Balance */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-800 mb-2">
            各储能簇累计电能量吞吐均衡性对比 (MWh)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {electricalEnergy.clusterThroughput.map(c => (
              <div
                key={c.clusterCode}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center"
              >
                <div className="text-[10px] text-slate-500 font-mono">{c.clusterCode}</div>
                <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">
                  {c.throughputMwh}
                </div>
                <div
                  className={`text-[9px] mt-0.5 font-mono ${
                    Math.abs(c.deviationPct) > 1 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  偏离: {c.deviationPct > 0 ? `+${c.deviationPct}%` : `${c.deviationPct}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Dimension 3 & 4: SOH 值一致性 与 运行工况 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dimension 3: SOH 值一致性 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>维度三：PACK 级 SOH 值一致性分布与短板偏离</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              标准差: <strong className="text-slate-800">{sohConsistency.standardDeviation}</strong>
            </span>
          </div>

          {/* Distribution Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {sohConsistency.distribution.map((d, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border ${
                  idx === 2 && d.count > 0
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-[10px] block opacity-80">{d.range}</span>
                <span className="text-lg font-black font-mono mt-0.5 block">
                  {d.count} <span className="text-xs font-normal">组</span>
                </span>
                <span className="text-[10px] opacity-75">{d.percentage}% 占比</span>
              </div>
            ))}
          </div>

          {/* Detailed Packs Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                <tr>
                  <th className="py-2 px-2.5">PACK 编码</th>
                  <th className="py-2 px-2.5">所属簇</th>
                  <th className="py-2 px-2.5">实测 SOH</th>
                  <th className="py-2 px-2.5">均值偏离</th>
                  <th className="py-2 px-2.5">内阻 DCIR</th>
                  <th className="py-2 px-2.5 text-right">达标状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sohConsistency.packs.map(p => (
                  <tr
                    key={p.packCode}
                    className={`hover:bg-slate-50/50 ${
                      p.isSubstandard ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    <td className="py-2 px-2.5 font-mono font-bold text-slate-900">
                      {p.packCode}
                    </td>
                    <td className="py-2 px-2.5 font-mono text-slate-500">{p.cluster}</td>
                    <td className="py-2 px-2.5 font-mono font-bold">
                      <span className={p.soh < 90 ? 'text-rose-600' : 'text-slate-800'}>
                        {p.soh}%
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-mono">
                      <span
                        className={
                          p.deviationFromMeanPct < -2
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-600'
                        }
                      >
                        {p.deviationFromMeanPct > 0
                          ? `+${p.deviationFromMeanPct}%`
                          : `${p.deviationFromMeanPct}%`}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-mono text-slate-600">
                      {p.dcirMOhms} mΩ
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      {p.isSubstandard ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          低于90%
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          达标
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dimension 4: 运行工况应力分析 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>维度四：系统运行工况、DOD 深浅充放与倍率应力</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              平均工况温度: <strong className="text-slate-800">{operatingCondition.avgOperatingTemp}℃</strong>
            </span>
          </div>

          {/* DOD Distribution */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>充放电深度 (DOD) 区间分布</span>
              <span className="text-[11px] text-slate-400 font-normal">基于历史吞吐等效</span>
            </div>
            <div className="space-y-1.5">
              {operatingCondition.dodDistribution.map((dod, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>{dod.range}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {dod.percentage}% ({dod.cycleEquivalent} FEC)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${dod.percentage}%` }}
                      className={`h-full rounded-full ${
                        idx === 2 ? 'bg-amber-500' : idx === 1 ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C-Rate Stress Range */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-xs font-bold text-slate-800">充放电倍率 (C-Rate) 运行区间应力分布</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {operatingCondition.cRateDistribution.map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-slate-800 block text-[11px]">{c.rateRange}</span>
                    <span className="text-[10px] text-slate-400">运行工时占比</span>
                  </div>
                  <span className="font-mono font-black text-indigo-700 text-sm">
                    {c.hoursPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-xs text-indigo-900">
            <strong>工况寿命研判: </strong>
            当前站点深充深放 (DOD &gt; 80%) 占比 50%，高 SOC (&gt;90%) 静置时间占比为 <strong>{operatingCondition.highSocRestRatioPct}%</strong>。根据阿伦尼乌斯老化模型，建议在光伏平价时段将静置 SOC 控制在 70% 附近以抑制日历衰减。
          </div>
        </div>
      </div>
    </div>
  );
};
