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
  ArrowLeft,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Activity,
  FileText,
  ExternalLink,
  Info,
  Search,
  CheckSquare,
  Square,
  Copy,
  BookOpen,
  Filter,
  Check,
  Scale
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
    sopLibrary,
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

  // Auxiliary Analysis Tab: 'SOP' | 'CASES' | 'SYNTHESIS'
  const [auxTab, setAuxTab] = useState<'SOP' | 'CASES' | 'SYNTHESIS'>('SOP');

  // Accordion state for SOP steps
  const [expandedSops, setExpandedSops] = useState<Record<string, boolean>>({
    [result?.recommendedSops[0]?.id || 'sop-001']: true
  });

  // Interactive Checklist state for SOP steps
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  // Search inside auxiliary panels
  const [sopSearchKey, setSopSearchKey] = useState('');
  const [showSopExplorer, setShowSopExplorer] = useState(false);

  const [caseSearchKey, setCaseSearchKey] = useState('');
  const [showCaseExplorer, setShowCaseExplorer] = useState(false);

  // Active compared case for side-by-side comparison
  const [activeComparedCase, setActiveComparedCase] = useState<SimilarCase>(
    result?.similarCases[0] || caseLibrary[0]
  );

  // Copied synthesis memo state
  const [copiedMemo, setCopiedMemo] = useState(false);

  const toggleSopExpand = (sopId: string) => {
    setExpandedSops(prev => ({ ...prev, [sopId]: !prev[sopId] }));
  };

  const toggleStepCheck = (stepKey: string) => {
    setCheckedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  if (!result) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-900">该任务正在诊断计算中</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          任务编号 {task.taskNo}，当前进度 {task.progress}%：{task.currentStepDescription || '正在解构时序特征向量与知识图谱推演...'}
        </p>
        {onBackToTaskList && (
          <button
            onClick={onBackToTaskList}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回任务列表</span>
          </button>
        )}
      </div>
    );
  }

  // 1. Action: Transfer to Case (转案例)
  const handleTransferToCase = () => {
    if (result.isTransferredToCase) {
      if (onNavigateToCaseLibrary) onNavigateToCaseLibrary();
      return;
    }
    const caseNo = result.transferredCaseNo || `CASE-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    transferDiagnosisToCase(task.id, {
      caseNo,
      title: `${task.siteName} - ${result.rootCause}`,
      siteName: task.siteName,
      deviceModel: task.eventContext?.deviceType || 'PCS-2500KTL / 磷酸铁锂储能系统',
      rootCause: result.rootCause,
      symptomDescription: task.eventContext?.eventTitle || '综合工况异常告警触发',
      resolutionSteps: result.recommendedSops[0]
        ? `依《${result.recommendedSops[0].title}》规程执行排查消缺`
        : '依标准化作业流程执行部件检测与更换',
      outcome: '现场完成消缺，设备正常重新并网，SLA 履约指标恢复正常',
      mttrMinutes: 45,
      similarityScore: 100,
      matchDimensions: ['同型号拓扑', '同因果规则路径', '实操闭环复盘']
    });
    setActionSuccessMsg(`已成功沉淀为经验案例【${caseNo}】，已存入案例库供全网检索复用！`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 2. Action: Thumbs Up / Down (点赞/点踩)
  const handleThumbsUp = () => {
    giveDiagnosisFeedback(task.id, true);
    setActionSuccessMsg('感谢反馈！已标记为【有效诊断】，成功提升该故障特征的因果匹配权重。');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleThumbsDownSubmit = (correctRootCause: string, notes: string) => {
    giveDiagnosisFeedback(task.id, false, {
      verifiedRootCause: correctRootCause,
      remarks: notes,
      reasonCategory: '现场实测不符',
      engineerName: currentUser.name
    });
    setActionSuccessMsg('已记录现场修正的真实根因！标注数据已回流大模型调优知识库 (ADR-0005)。');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 3. Action: Transfer to Work Order (转工单)
  const handleTransferToWorkOrder = () => {
    if (result.isTransferredToWorkOrder) {
      setActiveTab('work_orders');
      return;
    }
    const woNo = result.transferredWorkOrderNo || `WO-DIAG-${Date.now().toString().slice(-6)}`;
    const recommendedSop = result.recommendedSops[0];
    transferDiagnosisToWorkOrder(task.id, {
      orderNo: woNo,
      siteId: task.siteId,
      siteName: task.siteName,
      title: `【AI诊断消缺】${task.siteName} - ${result.rootCause.slice(0, 32)}`,
      description: `由 AI 故障诊断中心任务 [${task.taskNo}] 一键派发。\n- 判定根因: ${result.rootCause}\n- 推荐 SOP: ${recommendedSop?.title || '通用规程'} (${recommendedSop?.sopCode || '--'})\n- 关键工器具: ${recommendedSop?.requiredTools.join('、') || '常规电工仪表'}\n- 备件建议: ${recommendedSop?.requiredParts.join('、') || '依现场实测按需申请'}`
    });
    setActionSuccessMsg(`已成功创建消缺工单【${woNo}】并录入工单台账，已自动预填站点、设备与诊断处置方案！`);
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

  // Copy Synthesis Memo
  const handleCopySynthesisMemo = () => {
    const memoText = `【${task.siteName} 故障诊断辅助分析与消缺建议纪要】
任务编号: ${task.taskNo}
诊断时间: ${task.completedAt}
判定根因: ${result.rootCause} (置信度: ${result.confidencePercent}%)
推荐 SOP: ${result.recommendedSops[0]?.title || '标准作业规程'} (${result.recommendedSops[0]?.sopCode || '--'})
参考案例: ${result.similarCases[0]?.title || '同类历史案例'} (相似度: ${result.similarCases[0]?.similarityScore || 90}%)
预计消缺耗时: ${result.recommendedSops[0]?.estimatedDuration || '45分钟'}
SLA 折算影响: 预计等效中断 ${result.availabilityImpact.estimatedInterruptionMins} 分钟，扣减 ${result.availabilityImpact.availabilityLossPercent}%
安全红线: ${result.recommendedSops[0]?.riskWarnings.join('；') || '严格执行停电、验电、挂接地线规程'}`;

    navigator.clipboard.writeText(memoText);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  // Filtered SOPs for Explorer
  const filteredLibrarySops = sopLibrary.filter(
    s =>
      s.title.toLowerCase().includes(sopSearchKey.toLowerCase()) ||
      s.sopCode.toLowerCase().includes(sopSearchKey.toLowerCase()) ||
      s.faultCategory.toLowerCase().includes(sopSearchKey.toLowerCase())
  );

  // Filtered Cases for Explorer
  const filteredLibraryCases = caseLibrary.filter(
    c =>
      c.title.toLowerCase().includes(caseSearchKey.toLowerCase()) ||
      c.siteName.toLowerCase().includes(caseSearchKey.toLowerCase()) ||
      c.rootCause.toLowerCase().includes(caseSearchKey.toLowerCase()) ||
      c.caseNo.toLowerCase().includes(caseSearchKey.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Task Meta Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {onBackToTaskList && (
              <button
                onClick={onBackToTaskList}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer mr-1"
                title="返回任务列表"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>返回任务列表</span>
              </button>
            )}
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {task.taskNo}
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {task.siteName} · 诊断分析与消缺决策全景
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
            <span>完成时间: {task.completedAt}</span>
          </div>
        </div>

        {/* 4 Core Result Action Buttons (4.12.3.2) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Action 1: 转案例 */}
          <button
            onClick={handleTransferToCase}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-xs cursor-pointer ${
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
              className={`px-2.5 py-2 text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
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
              className={`px-2.5 py-2 text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
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
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="在线查看与导出 PDF/Excel 诊断报告"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>诊断报告</span>
          </button>

          {/* Action 4: 转工单 */}
          <button
            onClick={handleTransferToWorkOrder}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
              result.isTransferredToWorkOrder
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="一键转入运维消缺工单台账"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{result.isTransferredToWorkOrder ? '已转工单台账 (查看)' : '转消缺工单台账'}</span>
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

      {/* Main Split Grid: Left Column (Root Cause + Evidence) & Right Column (Auxiliary Analysis Studio) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: 6 Cols (Root Cause, SLA Impact, Telemetry & Log Evidence) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card 1: 故障根因判断 (Root Cause Card) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">故障根因定性与置信度 (R13)</h3>
                  <div className="text-[11px] text-slate-400 font-mono">命中大模型决策树与物理机理推演</div>
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
            <div className="p-4 bg-gradient-to-r from-rose-50/80 to-amber-50/60 border border-rose-200 rounded-xl space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>AI 诊断引擎核心根因结论：</span>
              </div>
              <p className="text-sm font-black text-slate-900 leading-snug">
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
                <span className="font-semibold text-slate-800">推理规则 / 因果模型路径：</span>
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
                <span className="text-[11px] font-bold text-slate-400">直接涉及设备 / 模组 / 部件：</span>
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
                <span>诊断依据追溯 (特征遥测 + 逻辑因果链)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {result.evidenceLogs.length} 条关键日志 · {result.evidenceFeatures.length} 个异常指标
              </span>
            </div>

            {/* Abnormal Feature Indicators Table */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">① 提取的关键遥测指标与基准偏离对比：</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">指标名称</th>
                      <th className="p-2.5">故障时刻值</th>
                      <th className="p-2.5">正常基准区间</th>
                      <th className="p-2.5">机理解释</th>
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
              <span className="text-xs font-bold text-slate-700 block">② 诊断引擎因果推演逻辑链：</span>
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
              <span className="text-xs font-bold text-slate-700 block">③ 引用的关键时序日志帧证据：</span>
              <div className="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto max-h-44">
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

        {/* RIGHT COLUMN: 6 Cols (Auxiliary Analysis Studio: SOP Library & Case Library Integration) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Auxiliary Analysis Studio Header & Mode Switcher */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
                    <span>AI 辅助分析决策工作台</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      双库智能协同
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    深度融合 SOP 方案库与历史故障案例库，为现场消缺决策提供针对性指引
                  </p>
                </div>
              </div>

              {/* Quick links to global libraries */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                {onNavigateToSopLibrary && (
                  <button
                    onClick={onNavigateToSopLibrary}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
                    title="查看全部 SOP 方案库"
                  >
                    <span>SOP库</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                <span className="text-slate-300">|</span>
                {onNavigateToCaseLibrary && (
                  <button
                    onClick={onNavigateToCaseLibrary}
                    className="text-indigo-700 hover:text-indigo-800 hover:underline flex items-center gap-0.5"
                    title="查看全部故障案例库"
                  >
                    <span>案例库</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* 3 Studio Tabs */}
            <div className="grid grid-cols-3 gap-1.5 pt-3">
              <button
                onClick={() => setAuxTab('SOP')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  auxTab === 'SOP'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>SOP 方案库推荐 ({result.recommendedSops.length})</span>
              </button>

              <button
                onClick={() => setAuxTab('CASES')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  auxTab === 'CASES'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>故障案例库对比 ({result.similarCases.length})</span>
              </button>

              <button
                onClick={() => setAuxTab('SYNTHESIS')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  auxTab === 'SYNTHESIS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>综合研判决策</span>
              </button>
            </div>
          </div>

          {/* TAB 1 CONTENT: SOP 方案库推荐与辅助处置指导 */}
          {auxTab === 'SOP' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* SOP Explorer Toggle & Search Bar */}
              <div className="flex items-center justify-between gap-2 bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-emerald-900">
                    基于当前根因命中 {result.recommendedSops.length} 套推荐规程，SOP 方案库实时在线
                  </span>
                </div>
                <button
                  onClick={() => setShowSopExplorer(!showSopExplorer)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showSopExplorer ? '收起方案库搜索' : '从方案库检索更多'}</span>
                </button>
              </div>

              {/* Collapsible SOP Explorer */}
              {showSopExplorer && (
                <div className="p-4 bg-white border border-emerald-300 rounded-2xl shadow-sm space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>全量 SOP 方案库辅助检索 (共 {sopLibrary.length} 套规程)</span>
                    </span>
                    <button
                      onClick={() => setShowSopExplorer(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={sopSearchKey}
                      onChange={e => setSopSearchKey(e.target.value)}
                      placeholder="搜索 SOP 标题、编号、适用设备分类..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                    {filteredLibrarySops.map(sop => (
                      <div
                        key={sop.id}
                        className="pt-2 pb-1.5 first:pt-0 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{sop.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {sop.sopCode} · {sop.equipmentCategory} · {sop.estimatedDuration}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setExpandedSops(prev => ({ ...prev, [sop.id]: true }));
                            setActionSuccessMsg(`已将规程【${sop.title}】调入当前消缺辅助分析`);
                            setShowSopExplorer(false);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                        >
                          调入参考
                        </button>
                      </div>
                    ))}
                    {filteredLibrarySops.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400">未找到匹配的 SOP 规程</div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended SOP Cards */}
              <div className="space-y-3">
                {result.recommendedSops.map(sop => {
                  const isExpanded = expandedSops[sop.id] || false;
                  return (
                    <div
                      key={sop.id}
                      className="border border-emerald-200 rounded-2xl overflow-hidden bg-white shadow-xs"
                    >
                      {/* SOP Header */}
                      <div
                        onClick={() => toggleSopExpand(sop.id)}
                        className="p-4 bg-emerald-50/70 cursor-pointer flex items-center justify-between hover:bg-emerald-100/60 transition border-b border-emerald-100"
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm">{sop.title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white">
                              匹配度 {sop.matchScore}%
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-emerald-300 text-emerald-800 font-mono">
                              预计消缺耗时: {sop.estimatedDuration}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-mono mt-1">
                            规程编号: {sop.sopCode} ({sop.version}) · 所属分类: {sop.equipmentCategory || 'PCS 变流器'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-800 font-semibold hidden sm:inline">
                            {isExpanded ? '收起详情' : '展开实施指导'}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-emerald-700" />
                          )}
                        </div>
                      </div>

                      {/* SOP Details */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 text-xs bg-white">
                          {/* 1. Recommendation Reason */}
                          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-950 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-blue-900">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>AI 方案库匹配推演理由 (辅助分析依据)：</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              {sop.recommendReason}
                            </p>
                          </div>

                          {/* 2. Tools & Spares */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                                <span>现场必备工器具仪表清单：</span>
                              </span>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {sop.requiredTools.map((tool, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px]">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                                <span>备件领用建议规格：</span>
                              </span>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {sop.requiredParts.map((part, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold">
                                    {part}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 3. Safety Warning */}
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-amber-900">
                              <ShieldAlert className="w-4 h-4 text-amber-600" />
                              <span>安全操作红线警示 (现场人身与设备安全强控)：</span>
                            </div>
                            <div className="space-y-0.5 text-[11px] pl-5">
                              {sop.riskWarnings.map((w, idx) => (
                                <div key={idx} className="list-disc leading-relaxed">• {w}</div>
                              ))}
                            </div>
                          </div>

                          {/* 4. Steps Checklist (Interactive) */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                                <span>标准化处置排查实施步骤 (现场核查闭环 Checklist)</span>
                                <span className="text-[10px] text-slate-400 font-normal font-mono">
                                  [已勾选核验: {Object.values(checkedSteps).filter(Boolean).length}/{sop.steps.length}]
                                </span>
                              </strong>
                              <button
                                onClick={handleTransferToWorkOrder}
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <span>同步步骤至工单预案 &rarr;</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {sop.steps.map(s => {
                                const stepKey = `${sop.id}-step-${s.stepNumber}`;
                                const isChecked = checkedSteps[stepKey] || false;
                                return (
                                  <div
                                    key={s.stepNumber}
                                    onClick={() => toggleStepCheck(stepKey)}
                                    className={`p-3 rounded-xl border transition cursor-pointer ${
                                      isChecked
                                        ? 'bg-emerald-50/50 border-emerald-300'
                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div className="mt-0.5 text-emerald-600">
                                        {isChecked ? (
                                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                          <Square className="w-4 h-4 text-slate-400" />
                                        )}
                                      </div>
                                      <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                          <div className={`font-bold text-xs ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                            步骤 {s.stepNumber}：{s.title}
                                          </div>
                                          {isChecked && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                                              已核对确认
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-slate-600 text-[11px] leading-relaxed">
                                          {s.description}
                                        </p>
                                        {s.keyParams && (
                                          <div className="p-1.5 bg-white border border-emerald-200 rounded-lg text-[10px] text-emerald-800 font-mono flex items-center gap-1.5">
                                            <span className="font-bold text-slate-700 font-sans">标准量化控制参数:</span>
                                            <span>{s.keyParams}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: 故障案例库推荐与对比复盘 */}
          {auxTab === 'CASES' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Case Explorer Toggle & Search */}
              <div className="flex items-center justify-between gap-2 bg-indigo-50/60 border border-indigo-200 rounded-xl p-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-bold text-indigo-900">
                    基于多维特征向量命中 {result.similarCases.length} 篇相似历史案例，沉淀全网经验
                  </span>
                </div>
                <button
                  onClick={() => setShowCaseExplorer(!showCaseExplorer)}
                  className="text-indigo-700 hover:text-indigo-900 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showCaseExplorer ? '收起案例搜索' : '检索全网案例库'}</span>
                </button>
              </div>

              {/* Collapsible Case Explorer */}
              {showCaseExplorer && (
                <div className="p-4 bg-white border border-indigo-300 rounded-2xl shadow-sm space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>全量故障案例库辅助检索 (共 {caseLibrary.length} 篇)</span>
                    </span>
                    <button
                      onClick={() => setShowCaseExplorer(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={caseSearchKey}
                      onChange={e => setCaseSearchKey(e.target.value)}
                      placeholder="搜索案例编号、站名、故障分类、根因关键字..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                    {filteredLibraryCases.map(c => (
                      <div
                        key={c.id}
                        className="pt-2 pb-1.5 first:pt-0 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{c.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {c.caseNo} · {c.siteName} · 耗时 {c.mttrMinutes} 分钟
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setSelectedSimilarCase(c)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            查阅报告
                          </button>
                          <button
                            onClick={() => {
                              setActiveComparedCase(c);
                              setShowCaseExplorer(false);
                              setActionSuccessMsg(`已切换横向对比案例为【${c.title}】`);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            横向对比
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredLibraryCases.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-400">未找到匹配的案例</div>
                    )}
                  </div>
                </div>
              )}

              {/* Side-by-side Contrast Matrix (当前故障 vs 推荐相似案例) */}
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      【当前故障诊断】与【历史标杆案例】横向辅助对比
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    综合相似度 {activeComparedCase.similarityScore}%
                  </span>
                </div>

                {/* Match dimensions tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">相似维度判定:</span>
                  {activeComparedCase.matchDimensions.map((dim, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold"
                    >
                      ✓ {dim}
                    </span>
                  ))}
                </div>

                {/* Contrast Matrix Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-24">对比维度</th>
                        <th className="p-2.5 w-1/2 bg-blue-50/50 text-blue-900 border-r border-slate-200">
                          当前诊断工况 ({task.siteName})
                        </th>
                        <th className="p-2.5 w-1/2 bg-indigo-50/50 text-indigo-900">
                          历史相似案例 ({activeComparedCase.siteName})
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-500 bg-slate-50/50">告警/现象</td>
                        <td className="p-2.5 text-slate-800 border-r border-slate-200">
                          {task.eventContext?.eventTitle || '变流器逆变桥臂触发开路/超温保护并网解列'}
                        </td>
                        <td className="p-2.5 text-slate-800">
                          {activeComparedCase.symptomDescription}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-500 bg-slate-50/50">判定根因</td>
                        <td className="p-2.5 font-bold text-rose-700 border-r border-slate-200">
                          {result.rootCause}
                        </td>
                        <td className="p-2.5 font-bold text-indigo-700">
                          {activeComparedCase.rootCause}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-500 bg-slate-50/50">消缺实操</td>
                        <td className="p-2.5 text-slate-700 border-r border-slate-200">
                          推荐依《{result.recommendedSops[0]?.title}》更换驱动板并校验力矩
                        </td>
                        <td className="p-2.5 text-slate-700">
                          {activeComparedCase.resolutionSteps}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-slate-500 bg-slate-50/50">成效与MTTR</td>
                        <td className="p-2.5 text-slate-600 border-r border-slate-200">
                          预计耗时: {result.recommendedSops[0]?.estimatedDuration || '45分钟'}
                        </td>
                        <td className="p-2.5 text-emerald-700 font-bold">
                          历史消缺实测 {activeComparedCase.mttrMinutes} 分钟 · {activeComparedCase.outcome}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">
                    案例编号: {activeComparedCase.caseNo} ({activeComparedCase.source === 'TRANSFERRED' ? '系统转案例沉淀' : '历史知识库汇编'})
                  </span>
                  <button
                    onClick={() => setSelectedSimilarCase(activeComparedCase)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>查看该案例完整复盘报告 &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Recommended Case List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">命中相似案例列表 (点击切换横向对比)：</span>
                {result.similarCases.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setActiveComparedCase(c)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                      activeComparedCase.id === c.id
                        ? 'border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-400'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs hover:text-indigo-600">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {c.siteName} · {c.deviceModel} · 编号: {c.caseNo}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        相似度 {c.similarityScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      <strong>真实根因复盘：</strong>{c.rootCause}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                      <span>消缺耗时: <strong className="text-slate-700">{c.mttrMinutes} 分钟</strong></span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedSimilarCase(c);
                        }}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        详情报告 &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: 综合研判决策树与纪要 */}
          {auxTab === 'SYNTHESIS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">全要素消缺辅助分析研判建议书</h4>
                      <p className="text-[11px] text-slate-400">结合大模型推演、SOP 标准规程与案例库实证的一体化决策支持</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopySynthesisMemo}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMemo ? '已复制纪要' : '复制研判纪要'}</span>
                  </button>
                </div>

                {/* Synthesis Key Insights Blocks */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>① 现场应急安全隔离建议：</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                      立即断开该单元交流断路器与直流母线接触器，执行挂牌上锁 (LOTO)；切断驱动板辅助供电，静置释放母线电容残压至安全电压（实测 ≤ 10V）后方可开启柜门。
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                      <span>② 标准处置实施建议 (SOP 规程落地)：</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                      依据推荐规程《{result.recommendedSops[0]?.title}》，优先使用高阻摇表排查桥臂吸收回路阻抗，确认击穿点；更换同规格驱动模块，紧固力矩严格控制在 28 N·m，通电前务必测量栅极绝缘阻抗 ≥ 20 MΩ。
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>③ 历史标杆案例经验借鉴 (防范复发)：</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                      参考案例【{result.similarCases[0]?.title}】，该类故障多伴随高粉尘或湿度超标引起的爬电。在更换部件后，建议对柜内风道进行绝缘除尘，并加固柜体防尘滤网。
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1 text-blue-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      <span>④ 可用度 (SLA) 恢复时间线预期：</span>
                    </span>
                    <div className="text-[11px] space-y-0.5 pl-5">
                      <div>• 预计排障消缺耗时: <strong>45 分钟</strong> (包含验电、换件与力矩复核)</div>
                      <div>• 并网自检与带载测试耗时: <strong>15 分钟</strong></div>
                      <div>• 预计等效停运时间可控制在 <strong>60 分钟以内</strong>，最大程度保全电站本月 SLA 可用度考核得分。</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action inside synthesis */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>预览完整诊断报告</span>
                  </button>
                  <button
                    onClick={handleTransferToWorkOrder}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>立即按此研判建议派发消缺工单</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
