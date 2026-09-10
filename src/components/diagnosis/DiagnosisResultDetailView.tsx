import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DiagnosisTask,
  DiagnosisResult,
  SimilarCase,
  SopItem
} from '../../types/faultDiagnosis';
import {
  Sparkles,
  Cpu,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  FileCheck2,
  Wrench,
  Layers,
  Terminal,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Activity,
  FileText,
  ExternalLink,
  Info
} from 'lucide-react';
import { NegativeFeedbackModal } from './NegativeFeedbackModal';
import { DiagnosisReportModal } from './DiagnosisReportModal';
import { SimilarCaseDetailModal } from './SimilarCaseDetailModal';

interface DiagnosisResultDetailViewProps {
  task: DiagnosisTask;
  onBackToTaskList?: () => void;
  onNavigateToCaseLibrary?: () => void;
  onNavigateToSopLibrary?: () => void;
}

export const DiagnosisResultDetailView: React.FC<DiagnosisResultDetailViewProps> = ({
  task,
  onBackToTaskList,
  onNavigateToCaseLibrary,
  onNavigateToSopLibrary
}) => {
  const {
    currentUser,
    workOrders,
    caseLibrary,
    giveDiagnosisFeedback,
    transferDiagnosisToCase,
    transferDiagnosisToWorkOrder,
    generateReport,
    addReportItem,
    setActiveTab
  } = useApp();

  const result = task.result;

  // Local state for modals
  const [showNegativeFeedbackModal, setShowNegativeFeedbackModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedSimilarCase, setSelectedSimilarCase] = useState<SimilarCase | null>(null);

  // Success notifications
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Accordion state for SOP steps
  const [expandedSops, setExpandedSops] = useState<Record<string, boolean>>({
    [result?.recommendedSops[0]?.id || 'sop-001']: true
  });

  const toggleSopExpand = (sopId: string) => {
    setExpandedSops(prev => ({ ...prev, [sopId]: !prev[sopId] }));
  };

  if (!result) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-900">该任务正在诊断计算中</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          任务编号 {task.taskNo}，当前进度 {task.progress}%：{task.currentStepDescription || '正在解构时序特征向量...'}
        </p>
      </div>
    );
  }

  // 1. Action: Transfer to Case (转案例)
  const handleTransferToCase = () => {
    if (result.isTransferredToCase) {
      if (onNavigateToCaseLibrary) onNavigateToCaseLibrary();
      return;
    }
    const newCase = transferDiagnosisToCase(task.id);
    setActionSuccessMsg(`已成功沉淀为经验案例【${newCase.caseNo}】，已存入案例库供全网检索复用！`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 2. Action: Thumbs Up / Down (点赞/点踩)
  const handleThumbsUp = () => {
    giveDiagnosisFeedback(task.id, 'THUMBS_UP');
    setActionSuccessMsg('感谢反馈！已标记为【有效诊断】，成功提升该故障特征的因果匹配权重。');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleThumbsDownSubmit = (correctRootCause: string, notes: string) => {
    giveDiagnosisFeedback(task.id, 'THUMBS_DOWN', correctRootCause, notes);
    setActionSuccessMsg('已记录现场修正的真实根因！标注数据已回流大模型调优知识库 (ADR-0005)。');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 3. Action: Transfer to Work Order (转工单)
  const handleTransferToWorkOrder = () => {
    if (result.isTransferredToWorkOrder) {
      setActiveTab('work_orders');
      return;
    }
    const newWo = transferDiagnosisToWorkOrder(task.id);
    setActionSuccessMsg(`已成功创建 PCare 工单【${newWo.orderNo}】，并已自动预填站点、设备与诊断结论！`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 4. Action: Save to Report Center
  const handleSaveToReportCenter = () => {
    const newRep = generateReport(
      'SITE_REPORT',
      `${task.siteName} 故障诊断`,
      task.timeRange.start.slice(0, 7),
      'PDF'
    );
    newRep.name = `${task.siteName} AI故障根因诊断与消缺建议报告 (${task.taskNo})`;
    if (addReportItem) {
      addReportItem(newRep);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Task Meta Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {task.taskNo}
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {task.siteName} · 故障诊断决策全景
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              AI 推理已完成
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
            <span>站码: <strong className="text-slate-700">{task.siteCode}</strong></span>
            <span>·</span>
            <span>
              关联事件:{' '}
              <strong className="text-slate-800">
                {task.eventContext?.eventTitle || '综合工况异常诊断'}
              </strong>
            </span>
            <span>·</span>
            <span>日志分类: {task.logCategory}</span>
            <span>·</span>
            <span>诊断时间: {task.completedAt}</span>
          </div>
        </div>

        {/* 4 Core Result Action Buttons (4.12.3.2) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Action 1: 转案例 */}
          <button
            onClick={handleTransferToCase}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-xs ${
              result.isTransferredToCase
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="将本次诊断结果沉淀为经验案例纳入案例库"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{result.isTransferredToCase ? '已转案例 (查看)' : '转案例 (经验沉淀)'}</span>
          </button>

          {/* Action 2: 点赞 / 点踩 */}
          <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs">
            <button
              onClick={handleThumbsUp}
              className={`px-2.5 py-2 text-xs font-semibold flex items-center gap-1 transition ${
                result.feedback?.type === 'THUMBS_UP'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
              title="点赞: 标记为有效诊断"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>有效</span>
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button
              onClick={() => setShowNegativeFeedbackModal(true)}
              className={`px-2.5 py-2 text-xs font-semibold flex items-center gap-1 transition ${
                result.feedback?.type === 'THUMBS_DOWN'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
              title="点踩: 补充现场真实根因，参与模型微调"
            >
              <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
              <span>纠错</span>
            </button>
          </div>

          {/* Action 3: 导出报告 */}
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shadow-xs"
            title="在线查看与导出 PDF/Excel 诊断报告"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>诊断报告</span>
          </button>

          {/* Action 4: 转工单 */}
          <button
            onClick={handleTransferToWorkOrder}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              result.isTransferredToWorkOrder
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="一键转 PCare 运维消缺工单"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{result.isTransferredToWorkOrder ? '已转工单 (查看)' : '一键转 PCare 工单'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Badge banner if feedback exists */}
      {result.feedback && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            result.feedback.type === 'THUMBS_UP'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.feedback.type === 'THUMBS_UP' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            )}
            <div>
              <span className="font-bold">
                {result.feedback.type === 'THUMBS_UP' ? '已点赞标注为有效诊断' : '已点踩并回流现场真实根因'}
              </span>
              <span className="text-[11px] opacity-80 ml-2">
                由 {result.feedback.userName} 提交于 {result.feedback.timestamp}
              </span>
            </div>
          </div>
          {result.feedback.correctRootCause && (
            <div className="text-[11px] font-medium bg-white/70 px-2 py-0.5 rounded border">
              现场纠偏: {result.feedback.correctRootCause}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left Column (Root Cause + Evidence) & Right Column (SOP + Similar Cases) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: 7 Cols */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: 故障根因判断 (Root Cause Card) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">故障根因定性与置信度 (R13)</h3>
                  <div className="text-[11px] text-slate-400 font-mono">命中大模型决策树与规则推演</div>
                </div>
              </div>

              {/* Confidence Badge */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">模型置信度</div>
                  <div className="font-mono font-black text-sm text-blue-600">
                    {result.confidencePercent}%
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                    result.confidence === 'HIGH'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : result.confidence === 'MEDIUM'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {result.confidence === 'HIGH' ? '高置信度' : result.confidence === 'MEDIUM' ? '中置信度' : '低置信度'}
                </span>
              </div>
            </div>

            {/* Core Root Cause Box */}
            <div className="p-4 bg-gradient-to-r from-rose-50/70 to-amber-50/50 border border-rose-200 rounded-xl space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>AI 诊断引擎核心根因结论：</span>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {result.rootCause}
              </p>
            </div>

            {/* Technical Detail */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {result.rootCauseDetail}
            </p>

            {/* Model / Rule Path */}
            <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-600 border border-slate-200 flex items-start gap-2">
              <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">推理规则 / 模型拓扑路径：</span>
                <span className="text-blue-700 font-mono ml-1">{result.ruleOrModelPath}</span>
              </div>
            </div>
          </div>

          {/* Card 2: 影响评估 (Impact Assessment) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>影响范围与可用度 (SLA) 关联评估</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">直接涉及设备 / 模组 / PACK：</span>
                <div className="space-y-1">
                  {result.affectedScope.map((scope, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-semibold text-slate-800">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>{scope.deviceName}</span>
                      {scope.moduleName && <span className="text-slate-500 font-normal">· {scope.moduleName}</span>}
                      {scope.details && (
                        <span className="text-[10px] text-slate-400 font-mono">({scope.details})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-amber-900">对站点可用度的预计折算影响：</span>
                <div className="font-mono text-xs text-slate-800">
                  {result.availabilityImpact.slaImpactDescription}
                </div>
                <div className="flex items-center gap-3 pt-1 text-[11px] font-mono font-bold text-rose-700">
                  <span>折算等效 PCS 停运: {result.availabilityImpact.estimatedInterruptionMins} 分钟</span>
                  <span>SLA 扣减: -{result.availabilityImpact.availabilityLossPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 诊断依据与追溯 (Diagnostic Evidence - Logs & Features) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>诊断依据追溯 (关键特征 + 判定逻辑链)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {result.evidenceLogs.length} 条关键日志 · {result.evidenceFeatures.length} 个异常指标
              </span>
            </div>

            {/* Abnormal Feature Indicators Table */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">① 提取的关键参数与基准对比：</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">监测指标名称</th>
                      <th className="p-2.5">故障时刻值</th>
                      <th className="p-2.5">正常基准区间</th>
                      <th className="p-2.5">诊断机理解释</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {result.evidenceFeatures.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-sans font-semibold text-slate-900">{f.name}</td>
                        <td className="p-2.5 font-bold text-rose-600">{f.value}</td>
                        <td className="p-2.5 text-slate-500">{f.baseline}</td>
                        <td className="p-2.5 font-sans text-slate-600 text-xs">{f.significance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reasoning Chain Waterfall */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 block">② 诊断引擎因果判定推演链：</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                {result.reasoningChain.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Log Excerpts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-700 block">③ 引用的关键日志证据帧：</span>
              <div className="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto max-h-48">
                {result.evidenceLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      log.highlight ? 'text-amber-300 bg-white/10 px-1 rounded font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={`px-1 py-0.2 rounded text-[9px] shrink-0 ${
                        log.level === 'FATAL'
                          ? 'bg-rose-600 text-white'
                          : log.level === 'ERROR'
                          ? 'bg-rose-500 text-white'
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
        </div>

        {/* RIGHT COLUMN: 5 Cols (SOP Recommendation & Similar Cases) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 4: SOP 推荐 (4.12.3.3 标准处理方案) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">SOP 推荐 (标准处理方案)</h3>
                  <div className="text-[11px] text-slate-400">基于根因从方案库匹配推荐 (R18)</div>
                </div>
              </div>
              {onNavigateToSopLibrary && (
                <button
                  onClick={onNavigateToSopLibrary}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  浏览 SOP 库 &rarr;
                </button>
              )}
            </div>

            {/* List of Matched SOPs */}
            <div className="space-y-3">
              {result.recommendedSops.map(sop => {
                const isExpanded = expandedSops[sop.id] || false;
                return (
                  <div
                    key={sop.id}
                    className="border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/30"
                  >
                    {/* SOP Header */}
                    <div
                      onClick={() => toggleSopExpand(sop.id)}
                      className="p-3.5 bg-emerald-50/70 cursor-pointer flex items-center justify-between hover:bg-emerald-100/60 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{sop.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">
                            匹配度 {sop.matchScore}%
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800 font-mono mt-0.5">
                          {sop.sopCode} ({sop.version}) · 预计耗时: {sop.estimatedDuration}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>

                    {/* SOP Details */}
                    {isExpanded && (
                      <div className="p-3.5 space-y-3 text-xs bg-white">
                        {/* Recommendation Reason */}
                        <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
                          <strong>推荐理由: </strong>
                          {sop.recommendReason}
                        </div>

                        {/* Tools & Spares */}
                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <strong className="text-slate-700">所需工器具: </strong>
                            <span className="text-slate-600">{sop.requiredTools.join('、')}</span>
                          </div>
                          <div>
                            <strong className="text-slate-700">所需备件: </strong>
                            <span className="text-slate-600">{sop.requiredParts.join('、')}</span>
                          </div>
                        </div>

                        {/* Risk Warnings */}
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>安全风险警示：</span>
                          </div>
                          {sop.riskWarnings.map((w, idx) => (
                            <div key={idx}>• {w}</div>
                          ))}
                        </div>

                        {/* Steps List */}
                        <div className="space-y-2 pt-1">
                          <strong className="text-slate-800 block text-xs">处置实施步骤清单:</strong>
                          <div className="space-y-1.5">
                            {sop.steps.map(s => (
                              <div key={s.stepNumber} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                                    {s.stepNumber}
                                  </span>
                                  <span>{s.title}</span>
                                </div>
                                <p className="text-slate-600 text-[11px] pl-5">{s.description}</p>
                                {s.keyParams && (
                                  <div className="text-[10px] text-emerald-700 font-mono pl-5">
                                    标准要求: {s.keyParams}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 5: 相似案例 (4.12.3.4 经验复用) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">相似案例参考 (经验复用)</h3>
                  <div className="text-[11px] text-slate-400">多维度语义与参数相似匹配 (R17)</div>
                </div>
              </div>
              {onNavigateToCaseLibrary && (
                <button
                  onClick={onNavigateToCaseLibrary}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  案例库 ({caseLibrary.length}) &rarr;
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {result.similarCases.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedSimilarCase(c)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer transition space-y-2 bg-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs hover:text-indigo-600">
                        {c.title}
                      </h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {c.siteName} · {c.deviceModel}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                      相似度 {c.similarityScore}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    <strong>根因：</strong>{c.rootCause}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                    <span>消缺耗时: <strong className="text-slate-700">{c.mttrMinutes} 分钟</strong></span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                      查看完整案例 &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Negative Feedback (Point down with correct root cause - R15) */}
      {showNegativeFeedbackModal && (
        <NegativeFeedbackModal
          taskNo={task.taskNo}
          currentRootCause={result.rootCause}
          onClose={() => setShowNegativeFeedbackModal(false)}
          onSubmit={handleThumbsDownSubmit}
        />
      )}

      {/* MODAL 2: Diagnosis Report Preview & Export */}
      {showReportModal && (
        <DiagnosisReportModal
          task={task}
          result={result}
          onClose={() => setShowReportModal(false)}
          onSaveToReportCenter={handleSaveToReportCenter}
        />
      )}

      {/* MODAL 3: Similar Case Detail Modal */}
      {selectedSimilarCase && (
        <SimilarCaseDetailModal
          caseItem={selectedSimilarCase}
          onClose={() => setSelectedSimilarCase(null)}
        />
      )}
    </div>
  );
};
