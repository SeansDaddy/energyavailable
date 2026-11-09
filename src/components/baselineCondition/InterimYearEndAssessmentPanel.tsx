import React, { useState, useMemo } from 'react';
import { BaselineEvaluationTaskRecord } from '../../types/baselineConditionEvaluation';
import {
  getDefaultContractBaseline,
  DEFAULT_SOH_BASELINE_CURVE,
  generateStationDailyAndMonthlyData,
  performInterimYearEndSohAssessment
} from '../../utils/flexibleWarrantyAlgorithm';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sliders,
  Sparkles,
  Download,
  Send,
  RefreshCw,
  Thermometer,
  Zap,
  Layers,
  BatteryCharging,
  Info,
  FileText
} from 'lucide-react';

interface InterimYearEndAssessmentPanelProps {
  task: BaselineEvaluationTaskRecord;
  onGoToNextYearPlan?: () => void;
}

export const InterimYearEndAssessmentPanel: React.FC<InterimYearEndAssessmentPanelProps> = ({
  task,
  onGoToNextYearPlan
}) => {
  // 干预模式状态：当前惯性延续、提前加强运维调优、激进高频套利
  const [interventionMode, setInterventionMode] = useState<
    'CURRENT_INERTIA' | 'CONSERVATIVE_PROTECT' | 'AGGRESSIVE_UTILIZATION'
  >('CURRENT_INERTIA');

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 1. 获取基准与曲线
  const baseline = useMemo(() => {
    const siteId = task.input.selectedSiteId || `site-${task.id.slice(-3)}`;
    const b = getDefaultContractBaseline(siteId, task.input.capacityMwh || 20.0);
    b.plannedAvgSocPct = 50.0;
    b.maxCrate = task.input.nominalCrate || 0.50;
    b.baselineTempMax = task.input.allowedCellTempMaxC || 35.0;
    b.contractNo = `CT-ESS-2024-${task.taskNo.slice(-4)}-SLA`;
    return b;
  }, [task]);

  const sohCurve = useMemo(() => {
    return DEFAULT_SOH_BASELINE_CURVE;
  }, []);

  // 2. 生成年初至今日的工况数据
  const { daily: dailyList, monthly: monthlyList } = useMemo(() => {
    return generateStationDailyAndMonthlyData(baseline.siteId, baseline);
  }, [baseline]);

  // 3. 执行临时手动评估测算
  const assessment = useMemo(() => {
    return performInterimYearEndSohAssessment(
      baseline.siteId,
      baseline,
      sohCurve,
      dailyList,
      monthlyList,
      interventionMode
    );
  }, [baseline, sohCurve, dailyList, monthlyList, interventionMode]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleExport = () => {
    setExportNotice('已成功生成《年底灵活性能保证SOH临时手动评估与处置备忘录.pdf》并准备下载！');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleDispatchOrder = () => {
    setExportNotice('已向现场服务工程部下发【预防性热管理与SOC浮充调优服务工单】(单号: WO-SRV-2026-0889)！');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const {
    actualOverConditionSummary,
    deductionBreakdown,
    contractBaselineExpectedYearEndSoh,
    interimEvaluatedYearEndSoh,
    sohMarginVsBaseline
  } = assessment;

  const isSocExceeded = actualOverConditionSummary.actualAvgSoc > actualOverConditionSummary.contractPlannedSoc;

  return (
    <div className="space-y-4">
      {/* 消息提示通知 */}
      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 顶部醒目说明横幅：明确第9条业务背景与目的 */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-500/30 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-400/40 uppercase tracking-wider">
                合同年结束前 · 临时手动评估
              </span>
              <span className="bg-amber-400/20 text-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-300/30">
                评估节点：{assessment.todayDate} (已运行 {assessment.elapsedDays} 天 · 距年底还剩 {assessment.remainingDays} 天)
              </span>
              <span className="text-slate-300 text-xs font-mono">
                {assessment.contractYearLabel}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{task.siteName} 灵活性能保证年底 SOH 临时手动评估</span>
            </h2>
            <p className="text-xs text-blue-100/90 leading-relaxed max-w-3xl">
              <strong className="text-white">业务初衷：</strong>在合同年结束之前，服务部门需提前对年底的灵活性能保证 SOH 有所预期，以便及时发现超工况损耗并提前加强质保服务与热管理优化。
              评估逻辑以<span className="text-amber-300 font-semibold">合同工况年底预期 SOH (92.20%)</span> 为基准，结合<span className="text-rose-300 font-semibold">年初至今日实际超工况运行情况</span>执行精准 SOH 扣减，得出临时评估值。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer border border-white/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>重新触发测算</span>
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出临时评估备忘录</span>
            </button>
            <button
              onClick={handleDispatchOrder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>下发提前加强质保工单</span>
            </button>
          </div>
        </div>
      </div>

      {/* 核心扣减计算主看板 (基于公式：合同工况年底预期 SOH - 实际超工况扣减 = 评估值) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>SOH 临时手动评估计算模型推演看板</span>
              <span className="text-xs font-normal text-slate-500">
                (公式：合同工况年底预期 SOH － 年初至今日实际超工况扣减 ＝ 临时手动评估年底 SOH)
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">评估单号:</span>
            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {assessment.assessmentId}
            </span>
          </div>
        </div>

        {/* 公式计算流程 4 阶段大卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          {/* 阶段 1: 合同工况年底预期 SOH */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/90 relative group">
            <div className="text-[11px] font-semibold text-blue-700 flex items-center justify-between">
              <span>① 合同工况年底预期 SOH</span>
              <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-mono">基准约定</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-blue-900">
                {contractBaselineExpectedYearEndSoh}%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-blue-600/90 leading-tight">
              按合同基准工况 (1.0 EFC/日、0.5C、≤35℃) 履约时第3年底正常预期保证值
            </div>
          </div>

          {/* 阶段 2: 实际超工况应力扣减折损 */}
          <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-200/90 relative group">
            <div className="text-[11px] font-semibold text-rose-700 flex items-center justify-between">
              <span>② 实际超工况总扣减折损</span>
              <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-mono">应力扣减</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-rose-600">
                -{deductionBreakdown.totalDeductionPct}%
              </span>
              <span className="text-xs text-rose-500 font-medium">SOH</span>
            </div>
            <div className="mt-1 text-[11px] text-rose-600/90 leading-tight">
              年初至今日超温、超倍率、高SOC及剩余{assessment.remainingDays}天预期损耗综合折损
            </div>
          </div>

          {/* 阶段 3: 临时手动评估年底灵活性能保证 SOH */}
          <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200/90 relative group">
            <div className="text-[11px] font-semibold text-indigo-700 flex items-center justify-between">
              <span>③ 临时手动评估年底 SOH</span>
              <span className="text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded font-mono">评估结论</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-indigo-900">
                {interimEvaluatedYearEndSoh}%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-indigo-700/90 leading-tight">
              年底时灵活性能保证实际预期 SOH (扣减后最终实测预估)
            </div>
          </div>

          {/* 阶段 4: 质保健康裕度与预警状态 */}
          <div
            className={`p-4 rounded-xl border relative ${
              assessment.warrantyHealthStatus === 'HEALTHY'
                ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200/90 text-amber-900'
            }`}
          >
            <div className="text-[11px] font-semibold flex items-center justify-between">
              <span>④ 质保履约相对安全裕度</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  assessment.warrantyHealthStatus === 'HEALTHY'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {assessment.warrantyHealthStatus === 'HEALTHY' ? '达标受控' : '轻度预警'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-extrabold">
                {sohMarginVsBaseline >= 0 ? `+${sohMarginVsBaseline}%` : `${sohMarginVsBaseline}%`}
              </span>
              <span className="text-xs opacity-80">底线 90.0%</span>
            </div>
            <div className="mt-1 text-[11px] opacity-90 leading-tight">
              {assessment.warrantyHealthLabel}
            </div>
          </div>
        </div>

        {/* 运维干预模式选择器：模拟剩余 122 天的保全强度 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>剩余 {assessment.remainingDays} 天质保服务干预模式模拟 (实时联动扣减与期末评估)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                提前采取差异化运维调优策略，将直接影响剩余时期的电芯老化速率及年底最终 SOH 评估值
              </p>
            </div>

            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <button
                onClick={() => setInterventionMode('CONSERVATIVE_PROTECT')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  interventionMode === 'CONSERVATIVE_PROTECT'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                🛡️ 提前加强运维调优与降额保全
              </button>
              <button
                onClick={() => setInterventionMode('CURRENT_INERTIA')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  interventionMode === 'CURRENT_INERTIA'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ⚖️ 惯性延续当前运行趋势 (默认)
              </button>
              <button
                onClick={() => setInterventionMode('AGGRESSIVE_UTILIZATION')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  interventionMode === 'AGGRESSIVE_UTILIZATION'
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                ⚡ 高频电力现货套利强化
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 合同年开始日期(2026-01-01)至今日(2026-08-20)实际超工况运行情况统计 (超限或SOC偏高标红) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>实际超工况运行情况全息台账 (2026-01-01 至 2026-08-20 实测累积)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              规则：若超限次数/天数大于0，或实际平均SOC大于合同规划SOC，对应指标强制标红报警提示
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            采样样本天数: {assessment.elapsedDays} 天 · 合同基准: 0.5C / ≤35℃ / 50% SOC / 90% DOD
          </span>
        </div>

        {/* 4 项超工况应力指标卡片 (满足要求：超限>0 或 平均SOC>合同规划SOC 标红) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 指标 1: 日电池PACK平均SOC 与 合同规划SOC 对比 */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isSocExceeded
                ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <BatteryCharging className={`w-4 h-4 ${isSocExceeded ? 'text-rose-600' : 'text-slate-500'}`} />
                <span>日电池PACK平均SOC</span>
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isSocExceeded ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isSocExceeded ? '超标红报警' : '正常受控'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={`text-2xl font-extrabold font-mono ${
                  isSocExceeded ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {actualOverConditionSummary.actualAvgSoc}%
              </span>
              <span className="text-xs text-slate-500">
                (合同规划: {actualOverConditionSummary.contractPlannedSoc}%)
              </span>
            </div>

            <div className="mt-2 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">超额偏差:</span>
                <span className={`font-mono font-bold ${isSocExceeded ? 'text-rose-600' : 'text-slate-700'}`}>
                  {actualOverConditionSummary.socDiff > 0 ? `+${actualOverConditionSummary.socDiff}%` : `${actualOverConditionSummary.socDiff}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SOH算法扣减:</span>
                <span className="font-mono font-bold text-rose-600">
                  -{deductionBreakdown.highSocCalendarDeductionPct}% SOH
                </span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 leading-tight">
                长期处于高SOC开路电压将加速正极过渡金属溶出及日历析锂老化
              </p>
            </div>
          </div>

          {/* 指标 2: 电芯超温运行应力 */}
          {(() => {
            const hasOverTemp = actualOverConditionSummary.tempOverLimitDays > 0;
            return (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  hasOverTemp
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Thermometer className={`w-4 h-4 ${hasOverTemp ? 'text-rose-600' : 'text-slate-500'}`} />
                    <span>电芯超温运行累计</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      hasOverTemp ? `超限 ${actualOverConditionSummary.tempOverLimitDays} 天 (标红)` : '未超限'
                    }`}
                  >
                    {hasOverTemp ? `超限 ${actualOverConditionSummary.tempOverLimitDays} 天 (标红)` : '未超限'}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-extrabold font-mono ${
                      hasOverTemp ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {actualOverConditionSummary.accumulatedTempDegreeHours}
                  </span>
                  <span className="text-xs text-slate-500">℃·h (超温积)</span>
                </div>

                <div className="mt-2 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">最高实测温度:</span>
                    <span className="font-mono font-bold text-rose-600">38.9 ℃ (基准≤35℃)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arrhenius扣减:</span>
                    <span className="font-mono font-bold text-rose-600">
                      -{deductionBreakdown.tempStressDeductionPct}% SOH
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 leading-tight">
                    夏季连续高负荷致液冷管路温升加剧，副反应速率呈指数级加速
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 指标 3: 充放电倍率超限应力 */}
          {(() => {
            const hasOverCrate = actualOverConditionSummary.crateOverLimitDays > 0;
            return (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  hasOverCrate
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Zap className={`w-4 h-4 ${hasOverCrate ? 'text-rose-600' : 'text-slate-500'}`} />
                    <span>充放电倍率超限运行</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      hasOverCrate ? `超限 ${actualOverConditionSummary.crateOverLimitDays} 天 (标红)` : '未超限'
                    }`}
                  >
                    {hasOverCrate ? `超限 ${actualOverConditionSummary.crateOverLimitDays} 天 (标红)` : '未超限'}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-extrabold font-mono ${
                      hasOverCrate ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {actualOverConditionSummary.accumulatedOverCrateMwh}
                  </span>
                  <span className="text-xs text-slate-500">MWh (超倍率吞吐)</span>
                </div>

                <div className="mt-2 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">最高放电倍率:</span>
                    <span className="font-mono font-bold text-rose-600">0.64 C (合同保证 0.50C)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">极化损耗扣减:</span>
                    <span className="font-mono font-bold text-rose-600">
                      -{deductionBreakdown.cratePolarizationDeductionPct}% SOH
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 leading-tight">
                    电力现货调频顶峰放电产生极化副反应与电芯微观机械形变
                  </p>
                </div>
              </div>
            );
          })()}

          {/* 指标 4: 循环次数与放电深度超限 */}
          {(() => {
            const hasExcessCycles = actualOverConditionSummary.excessCycles > 0;
            return (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  hasExcessCycles
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <RefreshCw className={`w-4 h-4 ${hasExcessCycles ? 'text-rose-600' : 'text-slate-500'}`} />
                    <span>等效循环超额与DOD</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      hasExcessCycles ? `超基准 ${actualOverConditionSummary.excessCycles} 次 (标红)` : '正常'
                    }`}
                  >
                    {hasExcessCycles ? `超基准 ${actualOverConditionSummary.excessCycles} 次 (标红)` : '正常'}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-extrabold font-mono ${
                      hasExcessCycles ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    +{actualOverConditionSummary.excessCycles}
                  </span>
                  <span className="text-xs text-slate-500">EFC (超额循环)</span>
                </div>

                <div className="mt-2 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">DOD超限天数:</span>
                    <span className="font-mono font-bold text-rose-600">
                      {actualOverConditionSummary.dodOverLimitDays} 天 (基准≤90%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">疲劳衰减扣减:</span>
                    <span className="font-mono font-bold text-rose-600">
                      -{deductionBreakdown.excessCyclesFatigueDeductionPct}% SOH
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 leading-tight">
                    高频浅充与深放交替致负极石墨颗粒微裂纹与活性锂损失
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 扣减明细清单表 */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>SOH 扣减多应力归因核算明细 (Arrhenius & 疲劳损伤微观机理)</span>
            <span className="font-mono text-rose-600 font-bold">
              总计扣减: -{deductionBreakdown.totalDeductionPct}% SOH
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400">电芯超温热应力</span>
              <div className="font-mono font-bold text-rose-600 mt-1">
                -{deductionBreakdown.tempStressDeductionPct}% SOH
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">占比: 11%</div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400">超倍率极化损伤</span>
              <div className="font-mono font-bold text-rose-600 mt-1">
                -{deductionBreakdown.cratePolarizationDeductionPct}% SOH
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">占比: 14%</div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400">高SOC日历老化</span>
              <div className="font-mono font-bold text-rose-600 mt-1">
                -{deductionBreakdown.highSocCalendarDeductionPct}% SOH
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">占比: 32% (最大诱因)</div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400">超额循环疲劳</span>
              <div className="font-mono font-bold text-rose-600 mt-1">
                -{deductionBreakdown.excessCyclesFatigueDeductionPct}% SOH
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">占比: 8%</div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400">剩余{assessment.remainingDays}天预估损耗</span>
              <div className="font-mono font-bold text-indigo-600 mt-1">
                -{deductionBreakdown.remainingDaysProjectedDeductionPct}% SOH
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">受干预模式调控</div>
            </div>
          </div>
        </div>
      </div>

      {/* 提前加强质保服务的具体处置建议 (5 大措施) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                提前加强质保服务 · 5 项落地处置与运维调优建议清单
              </h3>
              <p className="text-[11px] text-slate-400">
                服务工程部依据本次临时手动评估结论，需在年底前实施的技术与商务强化动作
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            P0 级提前干预建议
          </span>
        </div>

        <div className="space-y-2">
          {assessment.proactiveServiceRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs transition-colors flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px] font-medium flex-1">
                {rec}
              </p>
            </div>
          ))}
        </div>

        {/* 下一步联动按钮 */}
        {onGoToNextYearPlan && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              完成年底临时手动评估后，建议立即开展下一年度工况规划与服务报价联动测算：
            </div>
            <button
              onClick={onGoToNextYearPlan}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>前往测算下一年工况计划与服务报价</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
