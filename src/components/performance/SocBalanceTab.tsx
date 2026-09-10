import React, { useState } from 'react';
import { SocBalanceRecord } from '../../types/performanceEvaluation';
import {
  Scale,
  Sparkles,
  Zap,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Plus,
  Play
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

interface SocBalanceTabProps {
  socRecords: SocBalanceRecord[];
}

export const SocBalanceTab: React.FC<SocBalanceTabProps> = ({ socRecords: initialRecords }) => {
  const [records, setRecords] = useState<SocBalanceRecord[]>(initialRecords);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOGS'>('OVERVIEW');
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Trigger balance simulation
  const handleTriggerBalance = (id: string) => {
    setTriggeringId(id);
    setTimeout(() => {
      setRecords(prev =>
        prev.map(r => {
          if (r.id === id) {
            return {
              ...r,
              executionStatus: 'BALANCED',
              currentSoc: r.targetSoc,
              deltaSoc: 1.2,
              lastExecutedTime: '刚刚 (策略触发执行成功)',
              afterDeltaSoc: 1.2
            };
          }
          return r;
        })
      );
      setTriggeringId(null);
      setActionSuccessMsg('已成功向现场 BMS 与调度系统下发主动均衡指令，不均衡度 ΔSOC 恢复收敛至 1.2%！');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }, 800);
  };

  const chartData = records.map(r => ({
    name: r.packCode,
    currentSoc: r.currentSoc,
    targetSoc: r.targetSoc,
    delta: r.deltaSoc,
    status: r.executionStatus
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">SOC 均衡支持与现场干预执行</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                双轨均衡：软件策略 + 现场人工
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              实时评估模组与 PACK 荷电状态 (SOC) 离散度，智能决策采用“BMS软件主动均衡”或“现场便携充电机人工补电”，输出均衡方式建议、实施执行与效果复盘。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'OVERVIEW'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              SOC 分布与策略决策
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'LOGS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              执行台账与效果对比
            </button>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'OVERVIEW' ? (
        <div className="space-y-6">
          {/* SOC Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">各 PACK 实测 SOC 与基准目标 SOC 对比 (不均衡度 ΔSOC)</h3>
                <span className="text-[11px] text-slate-400">行业正常标准：ΔSOC ≤ 2.0%</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                最大偏差：<strong className="text-rose-600 font-bold">ΔSOC 6.5%</strong>
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[60, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl space-y-1">
                            <div className="font-bold text-emerald-300 font-mono">{data.name}</div>
                            <div>实测当前 SOC: <strong className="text-white font-mono">{data.currentSoc}%</strong></div>
                            <div>均衡目标 SOC: <strong className="text-blue-300 font-mono">{data.targetSoc}%</strong></div>
                            <div>当前不均衡度: <strong className="text-rose-400 font-mono">{data.delta}%</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={85} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '目标基准 85.0%', fill: '#2563eb', fontSize: 10, position: 'insideTopRight' }} />
                  <Bar dataKey="currentSoc" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.delta > 5.0 ? '#ef4444' : entry.delta > 2.0 ? '#f59e0b' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cards for Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map(rec => (
              <div
                key={rec.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900 font-mono text-sm">{rec.packCode}</div>
                      <div className="text-[11px] text-slate-400">{rec.cluster}</div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        rec.executionStatus === 'BALANCED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rec.executionStatus === 'BALANCED' ? '已收敛均衡' : '待执行均衡'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400">当前 SOC</span>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                        {rec.currentSoc}%
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400">目标基准</span>
                      <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                        {rec.targetSoc}%
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400">不均衡度</span>
                      <div
                        className={`font-mono font-bold text-sm mt-0.5 ${
                          rec.deltaSoc > 3.0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {rec.deltaSoc}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-slate-700 space-y-1">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>推荐均衡实施方案:</span>
                      </div>
                      <div className="text-[11px]">{rec.balanceTypeLabel}</div>
                      <div className="text-[10px] text-slate-500">触发阈值条件: {rec.triggerCondition}</div>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-1">
                      <strong>预期收益:</strong> {rec.gainDescription}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    记录时刻: {rec.lastExecutedTime}
                  </span>

                  {rec.executionStatus !== 'BALANCED' ? (
                    <button
                      onClick={() => handleTriggerBalance(rec.id)}
                      disabled={triggeringId === rec.id}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      {triggeringId === rec.id ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>下发中...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>触发主动均衡</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      已达标
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Logs & Before-After Comparison Table */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">SOC 均衡执行台账与前后效果复盘</h3>
            <span className="text-xs text-slate-500">双轨模式追溯</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">目标 PACK / 储能簇</th>
                  <th className="py-3 px-3">实施方式</th>
                  <th className="py-3 px-3 font-mono">均衡前 ΔSOC</th>
                  <th className="py-3 px-3 font-mono">均衡后 ΔSOC</th>
                  <th className="py-3 px-3">改善效果</th>
                  <th className="py-3 px-3">状态</th>
                  <th className="py-3 px-3 font-mono">执行时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">
                      {r.packCode}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {r.balanceTypeLabel}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-rose-600">
                      {r.beforeDeltaSoc}%
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                      {r.afterDeltaSoc}%
                    </td>
                    <td className="py-3.5 px-3 text-[11px] text-slate-600 max-w-xs">
                      {r.gainDescription}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.executionStatus === 'BALANCED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r.executionStatus === 'BALANCED' ? '已完成收敛' : '处理中'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                      {r.lastExecutedTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
