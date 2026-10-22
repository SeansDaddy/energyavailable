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
  ArrowRight
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
  ReferenceLine
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

  const isSurplus = status === 'SURPLUS';
  const bottleneckClusters = clusters.filter(c => c.isBottleneck);

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                站点可用容量标定评估与履约健康度分析
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                实测放电电能量积分
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              依据 GB/T 36276-2023 国家标准进行全站额定容量充放电实测，评估全生命周期可用容量保持率、保证履约冗余裕度及簇级木桶短板瓶颈。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-indigo-600 font-medium">实测可用容量</div>
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
                {isSurplus ? `+${capacityMarginMwh}` : `${capacityMarginMwh}`} <span className="text-xs font-normal">MWh</span>
              </div>
              <div className="text-[9px]">
                {isSurplus ? `裕度 +${capacityMarginPct}%` : '需立即均衡消缺'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Indicator KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">可用容量保持率</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-600 font-mono">
              {capacityRetentionPct}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            实测可用 / 初始出厂额定容量
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">合同保证可用容量下限</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800 font-mono">
              {guaranteedCapacityMwh}
            </span>
            <span className="text-xs text-slate-500">MWh</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-medium">
            履约红线考核基线
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">簇间容量最大极差</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {(
                Math.max(...clusters.map(c => c.usableCapacityMwh)) -
                Math.min(...clusters.map(c => c.usableCapacityMwh))
              ).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">MWh</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            短板簇影响整站放电截止
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">木桶短板受限簇数量</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono ${
                bottleneckClusters.length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {bottleneckClusters.length}
            </span>
            <span className="text-xs text-slate-500">组 / 全站 8 簇</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {bottleneckClusters.length > 0 ? '需下发主动均衡策略' : '各簇平衡健康'}
          </div>
        </div>
      </div>

      {/* 3. Capacity Degradation History Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-indigo-600" />
              <span>全生命周期实测可用容量衰减轨迹与质保保证线下限对比</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              实测点位于绿色虚线上方表明容量处于安全履约裕度区间
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              实测可用容量 (MWh)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-400"></span>
              设计预测衰减 (MWh)
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <span className="w-3 h-0.5 bg-rose-500 border-dashed"></span>
              合同保证底线 (MWh)
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={degradationHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="evaluatedDate" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[
                  Math.floor(guaranteedCapacityMwh * 0.9),
                  Math.ceil(ratedCapacityMwh * 1.05)
                ]}
                tick={{ fontSize: 11 }}
                unit=" MWh"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="designPredictedMwh"
                name="设计预测容量(MWh)"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="guaranteedBaselineMwh"
                name="质保保证底线(MWh)"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actualUsableMwh"
                name="实测可用容量(MWh)"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 5, fill: '#4f46e5' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Capacity Test Conditions and Clusters Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Test Condition Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>现场容量实测标定工况标准</span>
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
              {testCondition.testDate}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 block font-medium">依据标准规程</span>
              <strong className="text-slate-800 text-[11px] block">{testCondition.testStandard}</strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">测试环境温度</span>
                <span className="font-bold font-mono text-slate-800">{testCondition.ambientTemp} ± 2 ℃</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">测试充放倍率</span>
                <span className="font-bold font-mono text-indigo-600">{testCondition.cRate} C 恒流</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">充电截止电压</span>
                <span className="font-bold font-mono text-slate-800">{testCondition.cutoffChargeVoltageV} V</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">放电截止电压</span>
                <span className="font-bold font-mono text-slate-800">{testCondition.cutoffDischargeVoltageV} V</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1">
              <span className="text-[10px] text-emerald-700 block font-bold">检测验收结论</span>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                {testCondition.conclusion}
              </p>
              <span className="text-[10px] text-emerald-600 block pt-1 border-t border-emerald-200/60">
                测试单位: {testCondition.executor}
              </span>
            </div>
          </div>
        </div>

        {/* Cluster Usable Capacity Distribution & Bottlenecks */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>全站各储能簇可用容量横向对比与短板识别</span>
            </h4>
            <span className="text-xs text-slate-500">
              共 8 组电池簇 | 额定单簇容量: {clusters[0]?.ratedCapacityMwh} MWh
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">电池簇编码</th>
                  <th className="py-2.5 px-3">额定容量</th>
                  <th className="py-2.5 px-3">实测可用容量</th>
                  <th className="py-2.5 px-3">容量保持率</th>
                  <th className="py-2.5 px-3">均值偏离度</th>
                  <th className="py-2.5 px-3 text-right">木桶效应状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clusters.map(c => (
                  <tr
                    key={c.clusterId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      c.isBottleneck ? 'bg-rose-50/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {c.clusterCode}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {c.ratedCapacityMwh.toFixed(2)} MWh
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {c.usableCapacityMwh.toFixed(2)} MWh
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            c.retentionPct < 93 ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {c.retentionPct}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${c.retentionPct}%` }}
                            className={`h-full rounded-full ${
                              c.retentionPct < 93 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={
                          c.deviationFromMeanPct < -2
                            ? 'text-rose-600 font-bold'
                            : c.deviationFromMeanPct > 0
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                        }
                      >
                        {c.deviationFromMeanPct > 0
                          ? `+${c.deviationFromMeanPct}%`
                          : `${c.deviationFromMeanPct}%`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {c.isBottleneck ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                          ⚠️ 最短木桶短板簇
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ 正常均衡
                        </span>
                      )}
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
