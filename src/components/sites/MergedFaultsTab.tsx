import React, { useState } from 'react';
import { Site, MergedFault, RawEvent } from '../../types';
import { useApp } from '../../context/AppContext';
import { NewDiagnosisWizardModal } from '../diagnosis/NewDiagnosisWizardModal';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Info,
  Wrench,
  FileText,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface MergedFaultsTabProps {
  site: Site;
  onNavigateTab: (tabIdx: number) => void;
}

export const MergedFaultsTab: React.FC<MergedFaultsTabProps> = ({ site, onNavigateTab }) => {
  const { createDiagnosisTask, setActiveDiagnosisTaskId, setActiveTab } = useApp();
  const [expandedFaults, setExpandedFaults] = useState<Record<string, boolean>>({
    'fault-001': true
  });
  const [modalFault, setModalFault] = useState<MergedFault | null>(null);
  const [diagnosisFault, setDiagnosisFault] = useState<MergedFault | null>(null);

  const toggleFaultExpand = (faultId: string) => {
    setExpandedFaults(prev => ({
      ...prev,
      [faultId]: !prev[faultId]
    }));
  };

  const totalInterruptionMinutes = site.mergedFaults.reduce(
    (acc, f) => acc + f.equivalentInterruptionMinutes,
    0
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Rule R11 Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-900 font-semibold">
            故障归并与因果链追溯口径 (Rule R11)：
          </strong>
          同站点内时间窗相互重叠的事件记录（告警、PCare工单、离线日志）自动归并形成展示单元。归并后以等效 PCS 中断时长为计算依据，支持点开下钻展开原始事件因果时序链，实现从表象告警到根因诊断的穿透。
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">本考核周期归并故障数</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {site.mergedFaults.length} <span className="text-xs text-slate-400 font-normal">场</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">重叠时间窗自动合并</div>
        </div>

        <div className="bg-white border border-red-200 p-4 rounded-lg shadow-sm">
          <span className="text-red-700 font-semibold">累计等效 PCS 中断时长</span>
          <div className="text-2xl font-black font-mono text-red-600 mt-1">
            {totalInterruptionMinutes} <span className="text-xs text-slate-400 font-normal">分钟</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">扣减当期合同可用度 (R2)</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">单次故障平均等效停机</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {site.mergedFaults.length > 0
              ? (totalInterruptionMinutes / site.mergedFaults.length).toFixed(1)
              : 0}{' '}
            <span className="text-xs text-slate-400 font-normal">分钟/场</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">包含排查与方案输出耗时</div>
        </div>
      </div>

      {/* Merged Faults List */}
      {site.mergedFaults.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 shadow-sm">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
          <div className="font-bold text-slate-900">本考核周期无非计划停机归并故障</div>
          <div className="text-xs text-slate-400 mt-1">站点核心设备运行平稳</div>
        </div>
      ) : (
        <div className="space-y-4">
          {site.mergedFaults.map(fault => {
            const isExpanded = expandedFaults[fault.id];
            return (
              <div
                key={fault.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm transition-all hover:border-slate-300"
              >
                {/* Fault Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-red-50 text-red-600 border border-red-200 mt-0.5 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {fault.faultCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{fault.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                          等效PCS中断 {fault.equivalentInterruptionMinutes} 分钟
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        <strong className="text-slate-800 font-medium">根因诊断:</strong> {fault.rootCause}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-500 mt-2 font-mono">
                        <span>
                          起止时间: <strong className="text-slate-700">{fault.startTime} ~ {fault.endTime}</strong>
                        </span>
                        <span>持续时间: {fault.durationMinutes} 分钟</span>
                        <span>归并原始事件: {fault.mergedEventsCount} 项</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setDiagnosisFault(fault)}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1 transition-colors"
                      title="调用 AI 诊断引擎分析本次停机故障根因与匹配 SOP"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI 故障诊断</span>
                    </button>
                    <button
                      onClick={() => setModalFault(fault)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>查看深度归因报告</span>
                    </button>
                    <button
                      onClick={() => toggleFaultExpand(fault.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? '收起事件链' : '展开原始事件链'}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Raw Events Waterfall */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>原始因果事件时序瀑布流 (告警 / 工单 / 日志)</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        按发生时刻升序排列
                      </span>
                    </div>

                    <div className="space-y-2">
                      {fault.rawEvents.map((evt, idx) => (
                        <div
                          key={evt.id || idx}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-blue-50/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-400 text-[11px] w-6 shrink-0">
                              #{idx + 1}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                evt.type === 'alarm'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : evt.type === 'workorder'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {evt.type === 'alarm'
                                ? '告警事件'
                                : evt.type === 'workorder'
                                ? 'PCare工单'
                                : '离线日志'}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">{evt.title}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{evt.description}</div>
                            </div>
                          </div>

                          <div className="text-right text-[11px] text-slate-500 font-mono shrink-0 flex md:flex-col items-center md:items-end justify-between gap-1">
                            <div>{evt.timestamp}</div>
                            <div className="text-blue-600 font-mono font-medium">{evt.code}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Deep Root-Cause Causality Report */}
      {modalFault && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-red-50 text-red-600 border border-red-200">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    故障归因与事件链深度报告 ({modalFault.faultCode})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    所属站点: {site.siteName} · 合同号: {site.contractNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalFault(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 text-xs space-y-4 pr-1">
              {/* Fault Title & Metrics */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{modalFault.title}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">起止时间</span>
                    <div className="font-mono font-medium text-slate-800 mt-0.5">
                      {modalFault.startTime} ~ {modalFault.endTime ? modalFault.endTime.slice(-5) : '处理中'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">持续时长</span>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {modalFault.durationMinutes} 分钟
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">等效PCS扣减</span>
                    <div className="font-mono font-bold text-red-600 mt-0.5">
                      {modalFault.equivalentInterruptionMinutes} 分钟
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">归并事件数</span>
                    <div className="font-mono font-bold text-blue-600 mt-0.5">
                      {modalFault.mergedEventsCount} 项
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Root Cause Analysis & Recommendation */}
              <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI 智能诊断与根因分析结论</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{modalFault.rootCause}</p>
                <div className="pt-2 border-t border-blue-200/60 text-[11px] text-blue-800 space-y-1">
                  <div>
                    <strong>● 预防治理建议:</strong> 针对变流器 IGBT 驱动模块增加定期风道巡检频次，建议加装进风口智能压差变送器，提前 48 小时预警风道积尘阻塞。
                  </div>
                  <div>
                    <strong>● 组网升级建议:</strong> 建议评估将该站升级为【双机热备】拓扑，单 PCS 检修时不产生等效停运中断。
                  </div>
                </div>
              </div>

              {/* Full Raw Events Waterfall in Modal */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>全时序原始事件流追踪</span>
                </div>
                <div className="space-y-2">
                  {modalFault.rawEvents.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-slate-400 text-[11px] mt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{evt.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                evt.severity === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800'
                                  : evt.severity === 'MAJOR'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {evt.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{evt.description}</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                        <div>{evt.timestamp}</div>
                        <div className="text-blue-600">{evt.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setModalFault(null);
                    onNavigateTab(2); // Work orders tab in availability drilldown
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>查看关联合同工单</span>
                </button>
              </div>

              <button
                onClick={() => setModalFault(null)}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Fault Diagnosis Modal */}
      {diagnosisFault && (
        <NewDiagnosisWizardModal
          initialSiteId={site.id}
          initialEvent={{
            eventId: diagnosisFault.id,
            eventTitle: `${diagnosisFault.title} (${diagnosisFault.faultCode})`,
            eventType: 'fault',
            eventTime: diagnosisFault.startTime,
            severity: 'CRITICAL',
            description: `等效 PCS 中断 ${diagnosisFault.equivalentInterruptionMinutes} 分钟，起止: ${diagnosisFault.startTime} ~ ${diagnosisFault.endTime}。根因初步定性: ${diagnosisFault.rootCause}`
          }}
          onClose={() => setDiagnosisFault(null)}
          onLaunchTask={newTask => {
            createDiagnosisTask(newTask);
            setActiveDiagnosisTaskId(newTask.id);
            setActiveTab('fault_diagnosis');
          }}
        />
      )}
    </div>
  );
};
