import React, { useState } from 'react';
import { ModuleMetric } from '../../types/performanceEvaluation';
import {
  Layers,
  AlertOctagon,
  CheckCircle2,
  TrendingDown,
  Activity,
  Zap,
  Info,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';

interface ModuleWorkloadTabProps {
  moduleMetrics: ModuleMetric[];
  onFocusModule?: (moduleId: string) => void;
}

export const ModuleWorkloadTab: React.FC<ModuleWorkloadTabProps> = ({
  moduleMetrics,
  onFocusModule
}) => {
  const [selectedModule, setSelectedModule] = useState<ModuleMetric | null>(
    moduleMetrics.find(m => m.status === 'CRITICAL') || moduleMetrics[0]
  );
  const [filterCluster, setFilterCluster] = useState<string>('ALL');

  const clusters = ['ALL', ...Array.from(new Set(moduleMetrics.map(m => m.cluster)))];

  const filteredMetrics = moduleMetrics.filter(m =>
    filterCluster === 'ALL' ? true : m.cluster === filterCluster
  );

  // Stats
  const avgVoltageDelta = (
    moduleMetrics.reduce((sum, m) => sum + m.voltageDeltaMv, 0) / moduleMetrics.length
  ).toFixed(1);
  const criticalModulesCount = moduleMetrics.filter(m => m.status === 'CRITICAL').length;
  const avgCapacityRetention = (
    moduleMetrics.reduce((sum, m) => sum + m.capacityRetentionPct, 0) / moduleMetrics.length
  ).toFixed(1);

  // Chart data for Voltage Delta comparison
  const chartData = filteredMetrics.map(m => ({
    name: m.moduleCode,
    deltaMv: m.voltageDeltaMv,
    retention: m.capacityRetentionPct,
    status: m.status
  }));

  return (
    <div className="space-y-6">
      {/* Header Info & Rule Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">日常运行工况评估 (模组级细粒度)</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                短板木桶诊断
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              基于模组充放电电压、电流倍率、容量保持率及静置工况应力，精准识别由于“木桶短板效应”受限的最弱单元，输出工况评估结论与异常模组定位。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-center min-w-[100px]">
              <div className="text-[11px] text-slate-500">平均压差极差</div>
              <div className="text-base font-black text-slate-800 font-mono mt-0.5">
                {avgVoltageDelta} <span className="text-xs font-normal">mV</span>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-center min-w-[100px]">
              <div className="text-[11px] text-rose-600">异常短板模组</div>
              <div className="text-base font-black text-rose-600 font-mono mt-0.5">
                {criticalModulesCount} <span className="text-xs font-normal">个</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-center min-w-[100px]">
              <div className="text-[11px] text-blue-600">平均容量保持率</div>
              <div className="text-base font-black text-blue-600 font-mono mt-0.5">
                {avgCapacityRetention}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-level Diagnosis Callout */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3.5">
        <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-800 space-y-1">
          <div className="font-bold text-amber-900 text-sm">模组工况评估诊断结论：</div>
          <p className="leading-relaxed">
            全站模组当前综合充放电倍率均值 <strong>0.52C</strong>、日均循环 <strong>1.9 次</strong>；但<strong>【2号储能簇 M02-04 模组】</strong>在放电末期电压跌落过快（最大压差达到 <strong>68 mV</strong>，行业警戒线为 45 mV），提早触发整簇放电下限保护，导致该簇约 <strong>3.2%</strong> 的有效电量无法释放，属于典型短板瓶颈；同时午间待机静置 SOC 均值高达 <strong>82%</strong>，处于加剧电芯日历老化的敏感区间。
          </p>
        </div>
      </div>

      {/* Chart Section: Voltage Delta Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800">模组充放电电压极差 (mV) 与容量保持率横向对齐</h3>
            <span className="text-[11px] text-slate-400">虚线标注行业基准预警线 (45 mV)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">储能簇过滤:</span>
            <select
              value={filterCluster}
              onChange={e => setFilterCluster(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700"
            >
              {clusters.map(c => (
                <option key={c} value={c}>
                  {c === 'ALL' ? '全部储能簇' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl space-y-1">
                        <div className="font-bold text-blue-300">{data.name}</div>
                        <div>电压极差: <strong className="text-amber-300 font-mono">{data.deltaMv} mV</strong></div>
                        <div>容量保持率: <strong className="text-emerald-300 font-mono">{data.retention}%</strong></div>
                        <div>运行状态: {data.status === 'CRITICAL' ? '🔴 短板异常' : data.status === 'WARNING' ? '🟡 亚健康' : '🟢 优良'}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '预警线 45mV', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '异常线 70mV', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="deltaMv" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status === 'CRITICAL'
                        ? '#ef4444'
                        : entry.status === 'WARNING'
                        ? '#f59e0b'
                        : '#3b82f6'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Modules Table + Inspection Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">模组性能参数对比表 (点击查看诊断详情)</h3>
            <span className="text-xs text-slate-400">共 {filteredMetrics.length} 个模组</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">模组编号</th>
                  <th className="py-2.5 px-2">所属簇</th>
                  <th className="py-2.5 px-2 font-mono">最高/最低电压</th>
                  <th className="py-2.5 px-2 font-mono">压差极差</th>
                  <th className="py-2.5 px-2">容量保持率</th>
                  <th className="py-2.5 px-2">静置SOC</th>
                  <th className="py-2.5 px-2">AUC工况分</th>
                  <th className="py-2.5 px-3">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMetrics.map(m => {
                  const isSelected = selectedModule?.id === m.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedModule(m)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 font-medium'
                          : m.status === 'CRITICAL'
                          ? 'bg-red-50/30 hover:bg-red-50/50'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 font-mono">{m.moduleCode}</div>
                      </td>
                      <td className="py-3 px-2 text-slate-500 text-[11px]">{m.cluster}</td>
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-600">
                        {m.voltageMaxV}V / {m.voltageMinV}V
                      </td>
                      <td className="py-3 px-2 font-mono">
                        <span
                          className={`font-bold ${
                            m.voltageDeltaMv >= 50
                              ? 'text-red-600'
                              : m.voltageDeltaMv >= 40
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {m.voltageDeltaMv} mV
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono font-semibold text-slate-800">
                        {m.capacityRetentionPct}%
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-600">{m.restSocPct}%</td>
                      <td className="py-3 px-2 font-mono font-bold text-blue-600">{m.aucScore}</td>
                      <td className="py-3 px-3">
                        {m.status === 'CRITICAL' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                            短板严重
                          </span>
                        ) : m.status === 'WARNING' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
                            关注预警
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            正常
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Module Detail Card */}
        {selectedModule && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 font-mono uppercase">{selectedModule.cluster}</span>
                  <div className="text-base font-black text-slate-900 font-mono">{selectedModule.moduleCode} 诊断卡</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    selectedModule.status === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : selectedModule.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedModule.status === 'CRITICAL' ? '严重短板' : selectedModule.status === 'WARNING' ? '轻度不均衡' : '运行正常'}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[11px]">实测放电容量</span>
                  <div className="font-bold font-mono text-slate-800 text-sm mt-0.5">
                    {selectedModule.actualCapacityAh} <span className="text-[10px] text-slate-400">/ {selectedModule.ratedCapacityAh} Ah</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[11px]">放电截止压差极差</span>
                  <div className={`font-bold font-mono text-sm mt-0.5 ${selectedModule.voltageDeltaMv > 50 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {selectedModule.voltageDeltaMv} mV
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[11px]">日均循环工况</span>
                  <div className="font-bold font-mono text-slate-800 text-sm mt-0.5">
                    {selectedModule.dailyCycles} 次/日 (倍率 {selectedModule.currentRateC}C)
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-[11px]">待机静置 SOC</span>
                  <div className="font-bold font-mono text-slate-800 text-sm mt-0.5">
                    {selectedModule.restSocPct}%
                  </div>
                </div>
              </div>

              {/* Diagnostic Finding */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>智能诊断判定意见：</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {selectedModule.abnormalReason ||
                    '该模组内电芯压差、容量保持率及内阻分布平稳，处于典型低磨损黄金工况期，未见短板及跳水隐患。'}
                </p>
              </div>
            </div>

            {selectedModule.status === 'CRITICAL' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center justify-between">
                <span>已派发至 <strong>【SOC 均衡与故障消缺】</strong> 闭环列表</span>
                <span className="font-bold text-rose-600">待现场干预</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
