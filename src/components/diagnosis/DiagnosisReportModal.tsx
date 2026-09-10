import React, { useState } from 'react';
import { DiagnosisTask, DiagnosisResult } from '../../types/faultDiagnosis';
import {
  X,
  FileCheck2,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Building2,
  Cpu,
  Clock,
  Wrench,
  Layers,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';

interface DiagnosisReportModalProps {
  task: DiagnosisTask;
  result: DiagnosisResult;
  onClose: () => void;
  onSaveToReportCenter?: () => void;
}

export const DiagnosisReportModal: React.FC<DiagnosisReportModalProps> = ({
  task,
  result,
  onClose,
  onSaveToReportCenter
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloading, setDownloading] = useState<'PDF' | 'EXCEL' | null>(null);

  const handleDownload = (format: 'PDF' | 'EXCEL') => {
    setDownloading(format);
    setTimeout(() => {
      setDownloading(null);
      // Create a dummy download simulation
      const element = document.createElement('a');
      const file = new Blob([
        `【AI 故障诊断报告】\n任务单号: ${task.taskNo}\n站点: ${task.siteName}\n诊断根因: ${result.rootCause}\n置信度: ${result.confidence} (${result.confidencePercent}%)\n生成时间: ${task.completedAt || new Date().toISOString()}`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `DIAG_REPORT_${task.taskNo}_${format.toLowerCase()}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 800);
  };

  const handleSaveToCenter = () => {
    if (onSaveToReportCenter) {
      onSaveToReportCenter();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>AI 故障深度诊断与消缺决策报告</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/40 font-mono">
                  {task.taskNo}
                </span>
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                站点: {task.siteName} ({task.siteCode}) · 诊断时间: {task.completedAt || task.createdAt}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('PDF')}
              disabled={downloading === 'PDF'}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading === 'PDF' ? '导出中...' : '导出 PDF'}</span>
            </button>

            <button
              onClick={() => handleDownload('EXCEL')}
              disabled={downloading === 'EXCEL'}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{downloading === 'EXCEL' ? '导出中...' : '导出 Excel'}</span>
            </button>

            <button
              onClick={handleSaveToCenter}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                savedSuccess
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>已并入报告中心</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>存入报告中心</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-slate-50/50 print:bg-white">
          {/* Report Title & Metadata Header Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                AI FAULT DIAGNOSIS OFFICIAL REPORT
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                {task.siteName} · 故障根因诊断与 SOP 方案建议书
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                依据站点离线/实时日志、BMS/PCS 关键遥测特征及专家因果树模型生成，为现场抢修与可用度恢复提供决策支持。
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 shrink-0 space-y-1 font-mono text-[11px] text-slate-500">
              <div>
                评估状态: <strong className="text-emerald-600">已闭环完成</strong>
              </div>
              <div>
                置信等级: <strong className="text-blue-600 font-bold">{result.confidence} ({result.confidencePercent}%)</strong>
              </div>
              <div>
                归并事件: <span className="text-slate-800">{task.eventContext?.eventTitle || '综合工况异常'}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Root Cause & Confidence */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>一、故障根因定性与判定路径</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                置信度: {result.confidencePercent}%
              </span>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl">
              <div className="text-xs font-bold text-rose-900 mb-1">【核心结论】</div>
              <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                {result.rootCause}
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              {result.rootCauseDetail}
            </p>

            <div className="p-3 bg-slate-50 rounded-lg text-[11px] font-mono text-slate-600 border border-slate-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>命中模型树路径: {result.ruleOrModelPath}</span>
            </div>
          </div>

          {/* Section 2: Impact Assessment */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>二、受累设备范围与可用度影响评估</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-500">受影响硬件部件/拓扑位置:</span>
                <div className="space-y-1.5">
                  {result.affectedScope.map((scope, i) => (
                    <div key={i} className="flex items-center gap-2 font-medium text-slate-800">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>{scope.deviceName}</span>
                      {scope.moduleName && <span className="text-slate-400">· {scope.moduleName}</span>}
                      {scope.packName && <span className="text-indigo-600">[{scope.packName}]</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900">对站点可用度 (SLA) 预计影响:</span>
                <div className="text-xs text-slate-800 leading-relaxed">
                  {result.availabilityImpact.slaImpactDescription}
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono font-bold text-rose-700 mt-1">
                  <span>折算等效 PCS 停运: {result.availabilityImpact.estimatedInterruptionMins} 分钟</span>
                  <span>可用度损失: -{result.availabilityImpact.availabilityLossPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Evidence Chain (Logs + Features) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>三、诊断依据与关键日志特征</span>
            </h3>

            {/* Features table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-[11px] text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">关键监测参数</th>
                    <th className="p-2.5">故障时测得值</th>
                    <th className="p-2.5">基准安全范围</th>
                    <th className="p-2.5">状态判定</th>
                    <th className="p-2.5">机理解释</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.evidenceFeatures.map((feat, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">{feat.name}</td>
                      <td className="p-2.5 font-mono font-bold text-rose-600">{feat.value}</td>
                      <td className="p-2.5 font-mono text-slate-500">{feat.baseline}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            feat.status === 'ANOMALOUS'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : feat.status === 'WARNING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {feat.status === 'ANOMALOUS' ? '严重异常' : '告警偏离'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">{feat.significance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Critical Logs */}
            <div className="space-y-1.5 mt-3">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>引用关键日志证据片段:</span>
              </span>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
                {result.evidenceLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      log.highlight ? 'text-amber-300 font-bold bg-white/5 px-1 py-0.5 rounded' : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={`px-1 py-0.2 rounded text-[9px] shrink-0 ${
                        log.level === 'FATAL'
                          ? 'bg-rose-500 text-white'
                          : log.level === 'ERROR'
                          ? 'bg-rose-400 text-slate-900'
                          : 'bg-amber-500 text-slate-900'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-blue-400 shrink-0">{log.component}:</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Recommended SOP */}
          {result.recommendedSops && result.recommendedSops.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>四、推荐标准消缺方案 (SOP)</span>
              </h3>

              {result.recommendedSops.map(sop => (
                <div key={sop.id} className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{sop.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                          {sop.sopCode} ({sop.version})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        推荐理由: {sop.recommendReason}
                      </p>
                    </div>
                    <div className="text-right text-[11px] font-mono text-emerald-700 font-bold shrink-0">
                      预计耗时: {sop.estimatedDuration}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <strong className="text-slate-700 block mb-1">所需工器具:</strong>
                      <span className="text-slate-600">{sop.requiredTools.join('、')}</span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <strong className="text-slate-700 block mb-1">备件支持:</strong>
                      <span className="text-slate-600">{sop.requiredParts.join('、')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <strong className="text-slate-700 block">标准消缺实施步骤:</strong>
                    <div className="space-y-1.5">
                      {sop.steps.map(step => (
                        <div key={step.stepNumber} className="flex items-start gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {step.stepNumber}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900">{step.title}：</span>
                            <span className="text-slate-600">{step.description}</span>
                            {step.keyParams && (
                              <span className="text-emerald-700 font-mono text-[11px] ml-1">
                                [{step.keyParams}]
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 5: Similar Cases */}
          {result.similarCases && result.similarCases.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>五、历史相似案例参考 (经验复用)</span>
              </h3>

              <div className="space-y-2">
                {result.similarCases.map(c => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({c.siteName})</span>
                      </div>
                      <span className="font-mono text-indigo-600 font-bold text-[11px]">
                        相似度 {c.similarityScore}% · 耗时 {c.mttrMinutes} 分钟
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>处置方案：</strong>{c.resolutionSteps}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      <strong>跟踪结果：</strong>{c.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-400 text-[11px]">
            报告由 AI 故障诊断引擎自动生成 · 遵循储能专业服务标准规程
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
};
