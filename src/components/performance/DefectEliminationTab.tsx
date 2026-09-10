import React, { useState } from 'react';
import { DefectActionRecord } from '../../types/performanceEvaluation';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  ShieldAlert,
  ClipboardList,
  Filter
} from 'lucide-react';

interface DefectEliminationTabProps {
  defectRecords: DefectActionRecord[];
}

export const DefectEliminationTab: React.FC<DefectEliminationTabProps> = ({ defectRecords }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredRecords = defectRecords.filter(d =>
    filterType === 'ALL' ? true : d.defectType === filterType
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">故障消缺闭环与效能提升复盘</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                三大消缺动作闭环
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              深度覆盖“低效率故障定位”、“告警消除”与“硬件替换”三类核心动作，详细记录消缺前后性能指标对比与遗留问题跟踪清单。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              全部消缺动作 ({defectRecords.length})
            </button>
            <button
              onClick={() => setFilterType('LOW_EFFICIENCY_DIAG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'LOW_EFFICIENCY_DIAG'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              低效率定位
            </button>
            <button
              onClick={() => setFilterType('HARDWARE_REPLACE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'HARDWARE_REPLACE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              硬件替换
            </button>
            <button
              onClick={() => setFilterType('ALARM_CLEAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'ALARM_CLEAR'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              告警消除
            </button>
          </div>
        </div>
      </div>

      {/* Cards of Defect Action Records */}
      <div className="space-y-4">
        {filteredRecords.map(record => {
          const isHardware = record.defectType === 'HARDWARE_REPLACE';
          const isLowEfficiency = record.defectType === 'LOW_EFFICIENCY_DIAG';
          const isAlarm = record.defectType === 'ALARM_CLEAR';

          return (
            <div
              key={record.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isHardware
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : isLowEfficiency
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                  >
                    {isHardware ? <Layers className="w-4 h-4" /> : isLowEfficiency ? <TrendingUp className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{record.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHardware
                            ? 'bg-rose-100 text-rose-700'
                            : isLowEfficiency
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {record.defectTypeLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      目标设备: {record.targetDevice} | 触发告警源: {record.triggerAlarmOrCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      record.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {record.status === 'COMPLETED' ? '已消缺闭环' : '消缺处置中'}
                  </span>
                </div>
              </div>

              {/* Before vs After Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                  <span className="text-[11px] text-red-600 font-medium">消缺前性能基线</span>
                  <div className="font-bold text-slate-900 mt-1 font-mono text-xs">
                    {record.beforeMetric}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <span className="text-[11px] text-emerald-700 font-medium">消缺后指标恢复</span>
                  <div className="font-bold text-emerald-900 mt-1 font-mono text-xs">
                    {record.afterMetric}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <span className="text-[11px] text-blue-700 font-medium">综合效能收益评估</span>
                  <div className="font-bold text-slate-900 mt-1 text-xs leading-tight">
                    {record.efficiencyGain}
                  </div>
                </div>
              </div>

              {/* Residual Issues Checklist */}
              {record.residualIssues.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                    <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                    <span>遗留问题跟踪与后续待办：</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px] pl-1">
                    {record.residualIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <span className="font-mono">完成/排期节点: {record.completedAt}</span>
                <span>主责工程师: {record.operator}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
