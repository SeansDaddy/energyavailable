import React, { useState, useMemo } from 'react';
import { BaselineEvaluationTaskRecord } from '../../types/baselineConditionEvaluation';
import { NextYearConditionPlan } from '../../types/warrantyCondition';
import {
  getDefaultContractBaseline,
  DEFAULT_SOH_BASELINE_CURVE,
  simulateNextYearConditionPlan
} from '../../utils/flexibleWarrantyAlgorithm';
import {
  Calendar,
  Zap,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Download,
  FileCheck2,
  Printer,
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

interface NextYearConditionPlanPanelProps {
  task: BaselineEvaluationTaskRecord;
  onBackToInterimAssessment?: () => void;
}

export const NextYearConditionPlanPanel: React.FC<NextYearConditionPlanPanelProps> = ({
  task,
  onBackToInterimAssessment
}) => {
  // 选中的计划类型
  const [selectedPlanType, setSelectedPlanType] = useState<
    'CONSERVATIVE' | 'BASELINE' | 'AGGRESSIVE' | 'CUSTOM'
  >('BASELINE');

  // 自定义工况参数状态
  const [customCycles, setCustomCycles] = useState<number>(420);
  const [customCrate, setCustomCrate] = useState<number>(0.58);
  const [customMaxTemp, setCustomMaxTemp] = useState<number>(36.5);
  const [customMaxDod, setCustomMaxDod] = useState<number>(92.0);
  const [customAvgSoc, setCustomAvgSoc] = useState<number>(52.0);

  // 官方确认签署状态
  const [confirmedPlan, setConfirmedPlan] = useState<NextYearConditionPlan | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [signSuccessNotice, setSignSuccessNotice] = useState<string | null>(null);

  // 1. 基准配置
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

  // 2. 预先计算 3 种标准预设工况
  const conservativePlan = useMemo(() => {
    return simulateNextYearConditionPlan(baseline, sohCurve, 'CONSERVATIVE');
  }, [baseline, sohCurve]);

  const baselinePlan = useMemo(() => {
    return simulateNextYearConditionPlan(baseline, sohCurve, 'BASELINE');
  }, [baseline, sohCurve]);

  const aggressivePlan = useMemo(() => {
    return simulateNextYearConditionPlan(baseline, sohCurve, 'AGGRESSIVE');
  }, [baseline, sohCurve]);

  // 3. 计算自定义工况
  const customPlan = useMemo(() => {
    return simulateNextYearConditionPlan(baseline, sohCurve, 'CUSTOM', {
      plannedAnnualCycles: customCycles,
      plannedMaxCrate: customCrate,
      plannedMaxTemp: customMaxTemp,
      plannedMaxDod: customMaxDod,
      plannedAvgSoc: customAvgSoc
    });
  }, [baseline, sohCurve, customCycles, customCrate, customMaxTemp, customMaxDod, customAvgSoc]);

  // 当前激活的工况计划
  const currentPlan = useMemo(() => {
    switch (selectedPlanType) {
      case 'CONSERVATIVE':
        return conservativePlan;
      case 'AGGRESSIVE':
        return aggressivePlan;
      case 'CUSTOM':
        return customPlan;
      case 'BASELINE':
      default:
        return baselinePlan;
    }
  }, [selectedPlanType, conservativePlan, baselinePlan, aggressivePlan, customPlan]);

  // 确认并签署下一年计划工况
  const handleConfirmPlan = () => {
    setConfirmedPlan(currentPlan);
    setShowConfirmModal(false);
    setSignSuccessNotice(`已成功将【${currentPlan.planName}】确定为第4合同年 (2027年度) 官方执行工况及质保计费基准！`);
    setTimeout(() => {
      setSignSuccessNotice(null);
    }, 4500);
  };

  const handleExportProtocol = () => {
    setSignSuccessNotice(`已成功生成《${currentPlan.planName} · 下一年度工况计划与灵活性能保证服务协议附件.pdf》并准备下载！`);
    setTimeout(() => {
      setSignSuccessNotice(null);
    }, 4000);
  };

  return (
    <div className="space-y-4">
      {/* 提示条 Toast */}
      {signSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{signSuccessNotice}</span>
          </div>
          <button
            onClick={() => setSignSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 顶部醒目说明横幅：明确第9条业务背景与目的 */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-sm border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-400/40 uppercase tracking-wider">
                年底前规划 · 下一年工况计划与质保服务报价
              </span>
              <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-300/30">
                规划目标：第4合同年 (2027年度)
              </span>
              <span className="text-slate-300 text-xs font-mono">
                电站规模: {task.input.capacityMw} MW / {task.input.capacityMwh} MWh
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{task.siteName} 下一年度工况计划模拟与灵活性能保证服务报价测算</span>
            </h2>
            <p className="text-xs text-indigo-100/90 leading-relaxed max-w-3xl">
              <strong className="text-white">业务初衷：</strong>在合同年结束之前，电站业主需前瞻计划下一年的充放工况强度；服务部门基于计划工况评估下一年年底灵活性能保证 SOH，
              综合评估衰减损耗联动出具<span className="text-amber-300 font-semibold">灵活性能保证服务报价</span>，并结合客户峰谷套利收益，最终协同<span className="text-emerald-300 font-semibold">确定并锁定下一年的计划工况</span>。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBackToInterimAssessment && (
              <button
                onClick={onBackToInterimAssessment}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer border border-white/20"
              >
                <span>← 查看今年年底临时评估</span>
              </button>
            )}
            <button
              onClick={handleExportProtocol}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出下一年度工况服务方案</span>
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>确定下一年的计划工况</span>
            </button>
          </div>
        </div>
      </div>

      {/* 已官方确认签署标记卡片 (若已签署) */}
      {confirmedPlan && (
        <div className="bg-emerald-50/80 border border-emerald-300 p-4 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-600 text-white rounded-lg">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                <span>第4合同年 (2027年度) 官方执行工况已完成锁定签署</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                  OFFICIAL SIGNED
                </span>
              </div>
              <div className="text-emerald-700 text-[11px] mt-0.5">
                已确认为：【{confirmedPlan.planName}】· 计划循环 {confirmedPlan.plannedAnnualCycles} EFC/年 · 预测年底 SOH: {confirmedPlan.projectedYearEndFlexibleSoh}% · 年服务报价: ¥{confirmedPlan.servicePricing.totalAnnualServiceFeeWan} 万元/年
              </div>
            </div>
          </div>
          <span className="font-mono text-emerald-800 text-[11px] font-semibold">
            签约时间: {new Date().toLocaleDateString()}
          </span>
        </div>
      )}

      {/* 4 组预设计划工况方案横向卡片对比 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* 方案 1: 温和寿命保全型 */}
        <div
          onClick={() => setSelectedPlanType('CONSERVATIVE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedPlanType === 'CONSERVATIVE'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">1. 温和寿命保全型</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">保质稳健</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-700">
            {conservativePlan.projectedYearEndFlexibleSoh}%
            <span className="text-[11px] font-normal text-slate-400 ml-1">期末SOH</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
            较基准高出 +{conservativePlan.projectedSohDelta}%
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>计划年循环:</span>
              <span className="font-mono font-bold text-slate-800">320 EFC/年</span>
            </div>
            <div className="flex justify-between">
              <span>放电倍率上限:</span>
              <span className="font-mono text-slate-800">0.40 C</span>
            </div>
            <div className="flex justify-between">
              <span>质保年报价:</span>
              <span className="font-mono font-bold text-blue-700">¥{conservativePlan.servicePricing.totalAnnualServiceFeeWan} 万</span>
            </div>
            <div className="flex justify-between">
              <span>客户净套利:</span>
              <span className="font-mono font-bold text-emerald-600">¥{conservativePlan.servicePricing.customerNetGainWan} 万</span>
            </div>
          </div>
        </div>

        {/* 方案 2: 标准基准平衡型 */}
        <div
          onClick={() => setSelectedPlanType('BASELINE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedPlanType === 'BASELINE'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">2. 标准基准平衡型</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">合同基准</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-blue-800">
            {baselinePlan.projectedYearEndFlexibleSoh}%
            <span className="text-[11px] font-normal text-slate-400 ml-1">期末SOH</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
            完全契合合同保证基准线
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>计划年循环:</span>
              <span className="font-mono font-bold text-slate-800">365 EFC/年</span>
            </div>
            <div className="flex justify-between">
              <span>放电倍率上限:</span>
              <span className="font-mono text-slate-800">0.50 C</span>
            </div>
            <div className="flex justify-between">
              <span>质保年报价:</span>
              <span className="font-mono font-bold text-blue-700">¥{baselinePlan.servicePricing.totalAnnualServiceFeeWan} 万</span>
            </div>
            <div className="flex justify-between">
              <span>客户净套利:</span>
              <span className="font-mono font-bold text-emerald-600">¥{baselinePlan.servicePricing.customerNetGainWan} 万</span>
            </div>
          </div>
        </div>

        {/* 方案 3: 高收益现货调频型 */}
        <div
          onClick={() => setSelectedPlanType('AGGRESSIVE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedPlanType === 'AGGRESSIVE'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">3. 高收益现货调频型</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">高收益顶峰</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-700">
            {aggressivePlan.projectedYearEndFlexibleSoh}%
            <span className="text-[11px] font-normal text-slate-400 ml-1">期末SOH</span>
          </div>
          <div className="text-[10px] text-rose-600 font-medium mt-0.5">
            衰减加速 (折损 {aggressivePlan.projectedSohDelta}%)
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>计划年循环:</span>
              <span className="font-mono font-bold text-slate-800">480 EFC/年</span>
            </div>
            <div className="flex justify-between">
              <span>放电倍率上限:</span>
              <span className="font-mono text-slate-800">0.65 C</span>
            </div>
            <div className="flex justify-between">
              <span>质保年报价:</span>
              <span className="font-mono font-bold text-blue-700">¥{aggressivePlan.servicePricing.totalAnnualServiceFeeWan} 万</span>
            </div>
            <div className="flex justify-between">
              <span>客户净套利:</span>
              <span className="font-mono font-bold text-emerald-600">¥{aggressivePlan.servicePricing.customerNetGainWan} 万</span>
            </div>
          </div>
        </div>

        {/* 方案 4: 深度自定义工况调节 */}
        <div
          onClick={() => setSelectedPlanType('CUSTOM')}
          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
            selectedPlanType === 'CUSTOM'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">4. 自定义定制工况</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">自由测算</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-purple-800">
            {customPlan.projectedYearEndFlexibleSoh}%
            <span className="text-[11px] font-normal text-slate-400 ml-1">期末SOH</span>
          </div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">
            加速老化因子: {customPlan.accelerationFactor}x
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>设定年循环:</span>
              <span className="font-mono font-bold text-slate-800">{customCycles} EFC/年</span>
            </div>
            <div className="flex justify-between">
              <span>设定倍率:</span>
              <span className="font-mono text-slate-800">{customCrate} C</span>
            </div>
            <div className="flex justify-between">
              <span>质保年报价:</span>
              <span className="font-mono font-bold text-blue-700">¥{customPlan.servicePricing.totalAnnualServiceFeeWan} 万</span>
            </div>
            <div className="flex justify-between">
              <span>客户净套利:</span>
              <span className="font-mono font-bold text-emerald-600">¥{customPlan.servicePricing.customerNetGainWan} 万</span>
            </div>
          </div>
        </div>
      </div>

      {/* 若选中自定义方案，展开可交互调参滑块 */}
      {selectedPlanType === 'CUSTOM' && (
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900">
                下一年计划工况参数微调 (拖动滑块实时测算年底 SOH 与质保服务费)
              </h3>
            </div>
            <button
              onClick={() => {
                setCustomCycles(365);
                setCustomCrate(0.5);
                setCustomMaxTemp(35.0);
                setCustomMaxDod(90.0);
                setCustomAvgSoc(50.0);
              }}
              className="text-[11px] text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重置为标准基准工况</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
            {/* 滑块 1: 计划年循环 */}
            <div className="space-y-1.5 bg-purple-50/40 p-3 rounded-xl border border-purple-100">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">计划年循环 (EFC)</span>
                <span className="font-mono font-bold text-purple-700">{customCycles} 次/年</span>
              </div>
              <input
                type="range"
                min="200"
                max="600"
                step="5"
                value={customCycles}
                onChange={(e) => setCustomCycles(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>200次 (低频)</span>
                <span>365次 (基准)</span>
                <span>600次 (高频)</span>
              </div>
            </div>

            {/* 滑块 2: 充放电倍率 */}
            <div className="space-y-1.5 bg-purple-50/40 p-3 rounded-xl border border-purple-100">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">最大充放倍率 (C)</span>
                <span className="font-mono font-bold text-purple-700">{customCrate} C</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="1.0"
                step="0.01"
                value={customCrate}
                onChange={(e) => setCustomCrate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.25C</span>
                <span>0.50C (基准)</span>
                <span>1.0C (顶峰)</span>
              </div>
            </div>

            {/* 滑块 3: 最高工作温度 */}
            <div className="space-y-1.5 bg-purple-50/40 p-3 rounded-xl border border-purple-100">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">最高电芯温度 (℃)</span>
                <span className="font-mono font-bold text-purple-700">{customMaxTemp} ℃</span>
              </div>
              <input
                type="range"
                min="25"
                max="42"
                step="0.5"
                value={customMaxTemp}
                onChange={(e) => setCustomMaxTemp(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>25℃ (极优)</span>
                <span>35℃ (基准线)</span>
                <span>42℃ (高温)</span>
              </div>
            </div>

            {/* 滑块 4: 最大 DOD */}
            <div className="space-y-1.5 bg-purple-50/40 p-3 rounded-xl border border-purple-100">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">最大放电深度 DOD</span>
                <span className="font-mono font-bold text-purple-700">{customMaxDod}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                step="1"
                value={customMaxDod}
                onChange={(e) => setCustomMaxDod(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>70% (浅放)</span>
                <span>90% (基准)</span>
                <span>98% (满放)</span>
              </div>
            </div>

            {/* 滑块 5: 计划平均运行 SOC */}
            <div className="space-y-1.5 bg-purple-50/40 p-3 rounded-xl border border-purple-100">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">计划平均 SOC</span>
                <span className="font-mono font-bold text-purple-700">{customAvgSoc}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="65"
                step="1"
                value={customAvgSoc}
                onChange={(e) => setCustomAvgSoc(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>35% (偏低)</span>
                <span>50% (标准)</span>
                <span>65% (浮充高)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 综合灵活性能保证 SOH 衰减与服务报价测算核心仪表盘 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>当前选定工况方案【{currentPlan.planName}】年底 SOH 评估与服务报价测算</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              计划工况强度直接决定电芯加速老化速率与质保风险附加费，并与客户电力套利收益深度联动
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            目标年度: {currentPlan.targetYearLabel}
          </span>
        </div>

        {/* 顶部两个主结果大卡片：SOH 预测 vs 服务报价与收益 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧：下一年年底 SOH 预测 */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                第4合同年年底灵活性能保证预期 SOH
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                加速因子: {currentPlan.accelerationFactor}x
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold font-mono text-blue-900">
                {currentPlan.projectedYearEndFlexibleSoh}%
              </span>
              <div className="text-xs">
                <div className="text-slate-500">
                  合同底线保证: <span className="font-mono font-bold text-slate-800">{currentPlan.baselineYearEndSoh}%</span>
                </div>
                <div className={`font-mono font-bold ${currentPlan.projectedSohDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {currentPlan.projectedSohDelta >= 0 ? `+${currentPlan.projectedSohDelta}% (安全充裕)` : `${currentPlan.projectedSohDelta}% (轻度超工况折损)`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">计划年吞吐量</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {currentPlan.plannedThroughputMwh.toLocaleString()} MWh
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">日均循环次数</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {currentPlan.plannedDailyCycles} EFC/日
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">最大允许温升</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {currentPlan.plannedMaxTemp} ℃
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：灵活性能保证服务商业报价与客户净套利收益 */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/40 p-4 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                综合灵活性能保证服务报价与商业效益
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                客户投入产出比 ROI: {currentPlan.servicePricing.costBenefitRatio}x
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-baseline">
              <div>
                <span className="text-[10px] text-slate-500">年度灵活性能保证服务总报价</span>
                <div className="text-3xl font-extrabold font-mono text-blue-700 mt-0.5">
                  ¥ {currentPlan.servicePricing.totalAnnualServiceFeeWan} <span className="text-xs font-normal">万元/年</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">客户扣除质保费后净套利收益</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-0.5">
                  ¥ {currentPlan.servicePricing.customerNetGainWan} <span className="text-xs font-normal">万元/年</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/80 text-[11px]">
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400">客户总售电与调频套利收益</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  ¥ {currentPlan.servicePricing.customerExpectedRevenueWan} 万元/年
                </div>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400">超工况风险保障附加费</span>
                <div className="font-mono font-bold text-amber-700 mt-0.5">
                  {currentPlan.servicePricing.excessStressSurchargeWan > 0 ? `+¥ ${currentPlan.servicePricing.excessStressSurchargeWan} 万元/年` : '¥ 0.0 万元 (基准免收)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 商业报价详细构成清单拆解 */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>灵活性能保证服务报价模型构成拆解 (万元/年)</span>
            <span className="font-mono text-xs text-blue-700 font-bold">
              总报价: ¥ {currentPlan.servicePricing.totalAnnualServiceFeeWan} 万元
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-slate-700 font-semibold">
                <span>① 基础智能运维与质保服务费</span>
                <span className="font-mono font-bold text-slate-900">
                  ¥ {currentPlan.servicePricing.baseServiceFeeWan} 万元
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                挂钩系统额定容量 (20.0 MWh × 1.3万元/MWh·年)，涵盖常规巡检、BMS固件升级、常规备件质保与云端全息监控。
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-slate-700 font-semibold">
                <span>② 超工况风险保障附加费</span>
                <span className={`font-mono font-bold ${currentPlan.servicePricing.excessStressSurchargeWan > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  +¥ {currentPlan.servicePricing.excessStressSurchargeWan} 万元
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                针对计划循环次数 ({currentPlan.plannedAnnualCycles} EFC)、充放倍率 ({currentPlan.plannedMaxCrate}C) 及极限温度超出基准部分的阶梯风险托底费。
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-slate-700 font-semibold">
                <span>③ 衰减维护与备件调优储备金</span>
                <span className={`font-mono font-bold ${currentPlan.servicePricing.extendedCapacityReserveWan > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  +¥ {currentPlan.servicePricing.extendedCapacityReserveWan} 万元
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                若计划工况导致年底预估 SOH 略低于基准线，计提容量维护专款，用于后续电芯主动均衡调优或备件局部重构。
              </p>
            </div>
          </div>
        </div>

        {/* 商业决策指引与确定计划工况按钮 */}
        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>协同决策建议：确定【{currentPlan.planName}】为下一年度官方计划工况</span>
            </div>
            <p className="text-[11px] text-indigo-800/90 mt-0.5">
              综合考虑客户套利预期收益 (¥{currentPlan.servicePricing.customerExpectedRevenueWan}万) 与质保费 (¥{currentPlan.servicePricing.totalAnnualServiceFeeWan}万)，客户每投入 1 元质保服务费可换取 {currentPlan.servicePricing.costBenefitRatio} 元电网套利回报。
            </p>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>确定并签署下一年计划工况</span>
          </button>
        </div>
      </div>

      {/* 确认签署弹窗 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 text-slate-800 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileCheck2 className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  确认确定下一年计划工况与灵活性能保证服务报价
                </h3>
                <p className="text-xs text-slate-500">
                  第4合同年 (2027年度) 工况确认与服务报价协议附录锁定
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">电站名称:</span>
                <span className="font-semibold text-slate-800">{task.siteName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">选定工况方案:</span>
                <span className="font-bold text-blue-700">{currentPlan.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">计划年循环额度:</span>
                <span className="font-mono font-bold text-slate-800">{currentPlan.plannedAnnualCycles} EFC/年</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">最大允许放电倍率:</span>
                <span className="font-mono text-slate-800">{currentPlan.plannedMaxCrate} C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">预测年底灵活性能保证 SOH:</span>
                <span className="font-mono font-bold text-blue-700">{currentPlan.projectedYearEndFlexibleSoh}%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-semibold">年度灵活性能保证服务总报价:</span>
                <span className="font-mono font-extrabold text-blue-700 text-sm">
                  ¥ {currentPlan.servicePricing.totalAnnualServiceFeeWan} 万元/年
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-semibold">客户年净套利增益:</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">
                  ¥ {currentPlan.servicePricing.customerNetGainWan} 万元/年
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              确定后，系统将自动将此计划工况注入站点灵活性能保证台账，并作为第4合同年日工况超限判定的最新边界基准，同时下发下一年度服务执行计划。
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                取消返回
              </button>
              <button
                onClick={handleConfirmPlan}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                确认锁定并签署计划工况
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
