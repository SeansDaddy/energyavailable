import React, { useState } from 'react';
import {
  SohComprehensiveData,
  OverConditionSohFactor
} from '../../types/performanceEvaluation';
import {
  getSiteOverConditionSohFactors,
  getSiteSohDegradationTrend
} from '../../mock/sitePerformanceConditionData';
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
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  FileSpreadsheet
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
  ReferenceLine,
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
    siteId,
    socConsistency,
    electricalEnergy,
    sohConsistency,
    operatingCondition
  } = sohData;

  const [activeSubTab, setActiveSubTab] = useState<
    'degradation' | 'factors' | 'packs' | 'energy' | 'soc'
  >('degradation');

  // Load degradation curves and over-condition impact factors
  const degradationData = getSiteSohDegradationTrend(siteId);
  const overConditionFactors: OverConditionSohFactor[] = getSiteOverConditionSohFactors(siteId);

  // Current values
  const currentSoh = sohConsistency.avgSohPct;
  const contractBaselineNow = 94.8;
  const overConditionSohNow = 92.4;
  const totalOverConditionLoss = overConditionFactors
    .reduce((acc, f) => acc + f.sohExtraLossPct, 0)
    .toFixed(2);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                站点 SOH 综合健康度与全生命周期衰减曲线对比 (含黄色超工况折算曲线)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                三线协同研判
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              结合合同约定衰减基准线、现场实测拟合曲线与<strong>黄色超工况折算曲线</strong>（计入电芯超温、大倍率调频、深度放电等加速老化应力），并通过工况因素列表精准界定责任归属。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-indigo-600 font-medium">当前实测加权 SOH</div>
              <div className="text-2xl font-black text-indigo-700 font-mono mt-0.5">
                {currentSoh}%
              </div>
              <div className="text-[9px] text-indigo-500">
                合同基准: {contractBaselineNow}%
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-300 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-amber-800 font-medium flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>黄色超工况折算</span>
              </div>
              <div className="text-xl font-black text-amber-700 font-mono mt-0.5">
                {overConditionSohNow}%
              </div>
              <div className="text-[9px] text-amber-800 font-semibold">
                超工况额外衰减 -{totalOverConditionLoss}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>PACK 最低短板 SOH</span>
            <Activity className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                sohConsistency.minSohPct < 90 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {sohConsistency.minSohPct}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            SOH 极差: {sohConsistency.deltaSohPct}% · 标准差 {sohConsistency.standardDeviation}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>累计等效全循环 (FEC)</span>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {operatingCondition.cumulativeFecCycles}
            </span>
            <span className="text-xs text-slate-500">/ 6000 次</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            循环寿命消耗: {operatingCondition.cycleConsumptionPct}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>超工况命中影响因素</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {overConditionFactors.length}
            </span>
            <span className="text-xs text-slate-500">项影响源</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            电芯超温占比最高 (36.2%)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>SOH 履约判定与免责状态</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold text-emerald-700">在保达标</span>
            <span className="text-xs bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
              超工况免责已存证
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            实测优于黄色超工况折算线
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveSubTab('degradation')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'degradation'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>SOH 衰减曲线与合同/超工况黄色曲线对比</span>
        </button>
        <button
          onClick={() => setActiveSubTab('factors')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'factors'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>影响 SOH 的超工况因素数据列表 ({overConditionFactors.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('packs')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'packs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>PACK 级 SOH 一致性分布</span>
        </button>
        <button
          onClick={() => setActiveSubTab('energy')}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'energy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>充放电能量吞吐分析</span>
        </button>
      </div>

      {/* 4. Tab 1: SOH Degradation Curve with Contract & Yellow Over-Condition Curve */}
      {activeSubTab === 'degradation' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>全生命周期 SOH 衰减趋势对比分析 (合同约定线 · 实测拟合线 · 黄色超工况折算线)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  黄色曲线是根据现场超温时长、极限深放频次与高倍率冲击等真实超工况数据建立的多应力阿伦尼乌斯老化模型折算的衰减轨迹。
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-0.5 bg-blue-600"></span>
                  <span className="text-slate-700 font-medium">合同约定基准线</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-emerald-500 rounded-full"></span>
                  <span className="text-emerald-700 font-bold">实际测量 SOH</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                  <span className="w-3.5 h-1 bg-amber-500 rounded-full"></span>
                  <span className="text-amber-900 font-bold">黄色超工况折算曲线</span>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={degradationData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[70, 102]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px'
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === '合同约定衰减基准') return [`${value}%`, name];
                      if (name === '实测测量SOH') return [`${value}%`, name];
                      if (name === '黄色超工况折算曲线') return [`${value}%`, name];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine
                    y={90.0}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{ value: '首检保证底线 90%', fill: '#f43f5e', fontSize: 10, position: 'right' }}
                  />
                  <ReferenceLine
                    y={80.0}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: '10年终期保证底线 80%', fill: '#dc2626', fontSize: 10, position: 'right' }}
                  />
                  {/* Contract Baseline */}
                  <Line
                    type="monotone"
                    dataKey="contractCurve"
                    name="合同约定衰减基准"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  {/* Actual Curve */}
                  <Line
                    type="monotone"
                    dataKey="actualCurve"
                    name="实测测量SOH"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981' }}
                    connectNulls={false}
                  />
                  {/* Yellow Over-Condition Curve */}
                  <Line
                    type="monotone"
                    dataKey="overConditionCurve"
                    name="黄色超工况折算曲线"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="5 3"
                    dot={{ r: 4, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Insight Note */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>超工况曲线分析结论: </strong>
                当前实际测量 SOH 为 <strong>{currentSoh}%</strong>，略低于合同标称基准 94.8%（偏差 -0.9%）。但根据实际采集到的超工况运行日志，<strong>黄色超工况折算曲线已下探至 {overConditionSohNow}%</strong>。说明实测衰减中约有 <strong>{totalOverConditionLoss}%</strong> 是由于高温环境、大倍率调频脉冲与高 SOC 待机搁置等外部工况应力造成的加速老化，符合合同免责条件。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Operating Condition Factors Affecting SOH */}
      {activeSubTab === 'factors' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900">
                影响当前站点 SOH 衰减的超工况因素数据列表与责任归属
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              累计额外衰减贡献: <strong className="text-amber-700 font-mono">-{totalOverConditionLoss}% SOH</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {overConditionFactors.map(factor => (
              <div
                key={factor.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {factor.factorName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        factor.responsibleParty === 'GRID_DISPATCH'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : factor.responsibleParty === 'OWNER_OPERATION'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      责任归属: {factor.responsibleParty === 'GRID_DISPATCH' ? '电网调度工况' : factor.responsibleParty === 'OWNER_OPERATION' ? '业主使用习惯' : '设备运维与环境'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-500">影响权重: <strong className="text-slate-800">{factor.weightPct}%</strong></span>
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      额外衰减: -{factor.sohExtraLossPct}% SOH
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-[10px] text-slate-400 font-medium">工况阈值 vs 现场实测</div>
                    <div className="text-slate-600">正常基线: <strong className="text-slate-800">{factor.baselineLimit}</strong></div>
                    <div className="text-amber-700 font-bold">实际监测: {factor.actualExceedValue}</div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-[10px] text-slate-400 font-medium">累计超标统计与受影响设备</div>
                    <div className="text-slate-700 font-semibold">{factor.accumulatedHoursOrTimes}</div>
                    <div className="text-slate-500 text-[11px]">涉及: {factor.affectedUnits}</div>
                  </div>

                  <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-200 space-y-1">
                    <div className="text-[10px] text-indigo-700 font-medium">建议改善与规避措施</div>
                    <div className="text-indigo-900 text-[11px] leading-relaxed">
                      {factor.mitigationAdvice}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50/60 p-2 rounded leading-relaxed">
                  <strong>老化机理说明: </strong>
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tab 3: PACK Level SOH Consistency */}
      {activeSubTab === 'packs' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>PACK 级 SOH 值一致性分布与短板偏离</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              标准差: <strong className="text-slate-800">{sohConsistency.standardDeviation}</strong>
            </span>
          </div>

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
      )}

      {/* 7. Tab 4: Energy Throughput */}
      {activeSubTab === 'energy' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>全生命周期充放电电能量吞吐趋势 (MWh)</span>
            </h3>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-500">
                累计充: <strong className="text-slate-800">{electricalEnergy.cumulativeChargedMwh} MWh</strong>
              </span>
              <span className="text-slate-500">
                累计放: <strong className="text-emerald-600">{electricalEnergy.cumulativeDischargedMwh} MWh</strong>
              </span>
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
        </div>
      )}
    </div>
  );
};
