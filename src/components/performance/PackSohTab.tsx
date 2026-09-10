import React, { useState } from 'react';
import { PackSohMetric } from '../../types/performanceEvaluation';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
  HelpCircle
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
  ReferenceLine
} from 'recharts';

interface PackSohTabProps {
  packMetrics: PackSohMetric[];
}

export const PackSohTab: React.FC<PackSohTabProps> = ({ packMetrics }) => {
  const [selectedPack, setSelectedPack] = useState<PackSohMetric>(
    packMetrics.find(p => !p.isStandard) || packMetrics[0]
  );

  const substandardPacks = packMetrics.filter(p => !p.isStandard);
  const avgSoh = (
    packMetrics.reduce((sum, p) => sum + p.soh, 0) / packMetrics.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">PACK 级 SOH 评估与多维衰减预测</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                健康度评估与短板清单
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              从容量衰减率、直流内阻 (DCIR) 增长及库伦效率多维度精准刻画 PACK 真实健康度，输出历史实测衰减曲线、未来退化预测及不达标预警清单。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-center min-w-[100px]">
              <div className="text-[11px] text-indigo-600">全站平均 SOH</div>
              <div className="text-base font-black text-indigo-700 font-mono mt-0.5">
                {avgSoh}%
              </div>
              <div className="text-[9px] text-indigo-400 mt-0.5">合同保修标准 ≥90%</div>
            </div>

            <div className="bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-center min-w-[100px]">
              <div className="text-[11px] text-rose-600">不达标短板 PACK</div>
              <div className="text-base font-black text-rose-700 font-mono mt-0.5">
                {substandardPacks.length} <span className="text-xs font-normal">组</span>
              </div>
              <div className="text-[9px] text-rose-400 mt-0.5">急需均衡或消缺</div>
            </div>
          </div>
        </div>
      </div>

      {/* Substandard PACK Alert Banner */}
      {substandardPacks.length > 0 && (
        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 space-y-1">
            <div className="font-bold text-sm">重点警示：检测到 1 组 PACK SOH 跌破合同承诺基准 (90%)</div>
            <p className="leading-relaxed">
              <strong>{substandardPacks[0].packCode}</strong> 当前实测 SOH 仅为 <strong>{substandardPacks[0].soh}%</strong>，较初始出厂状态直流内阻增长了 <strong>{substandardPacks[0].dcirGrowthPct}%</strong>。根据串联短板木桶效应，该 PACK 将使所属储能簇提前达到保护下限，导致有效放电容量缩水约 <strong>3.2%</strong>。
            </p>
          </div>
        </div>
      )}

      {/* SOH Decay Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              PACK 历史实测 SOH 衰减与未来 6 个月趋势外推
            </h3>
            <span className="text-[11px] text-slate-400">
              当前观测目标：<strong>{selectedPack.packCode}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">选择 PACK:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {packMetrics.map(p => (
                <button
                  key={p.packId}
                  onClick={() => setSelectedPack(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    selectedPack.packId === p.packId
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.packCode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={selectedPack.historyTrend}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis domain={[80, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl space-y-1">
                        <div className="font-bold text-indigo-300 font-mono">{label} 评估点</div>
                        <div>实测 SOH: <strong className="text-emerald-300 font-mono">{payload[0]?.value}%</strong></div>
                        <div>模型预测衰减: <strong className="text-blue-300 font-mono">{payload[1]?.value}%</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '保修考核基准线 90.0%', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
              <Line
                type="monotone"
                dataKey="actualSoh"
                name="实测 SOH 健康度 (%)"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="predictedSoh"
                name="算法预测衰减轨迹 (%)"
                stroke="#0ea5e9"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PACK List & Health Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {packMetrics.map(pack => {
          const isSelected = selectedPack.packId === pack.packId;
          return (
            <div
              key={pack.packId}
              onClick={() => setSelectedPack(pack)}
              className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900 font-mono text-sm">{pack.packCode}</div>
                    <div className="text-[11px] text-slate-400">{pack.cluster}</div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      pack.isStandard
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {pack.isStandard ? 'SOH 达标 (优良)' : 'SOH 不达标 (短板)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">当前 SOH</span>
                    <div
                      className={`font-mono font-bold text-sm mt-0.5 ${
                        pack.soh < 90 ? 'text-rose-600' : 'text-indigo-600'
                      }`}
                    >
                      {pack.soh}%
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">内阻增长率</span>
                    <div
                      className={`font-mono font-bold text-sm mt-0.5 ${
                        pack.dcirGrowthPct > 20 ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      +{pack.dcirGrowthPct}%
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">库伦效率</span>
                    <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                      {pack.coulombicEfficiency}%
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-slate-700 text-[11px]">短板与制约影响分析：</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{pack.bottleneckImpact}</p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-indigo-600 font-medium">
                <span>直流内阻 DCIR: {pack.dcirMOhms} mΩ</span>
                <span>查看衰减预测 →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
