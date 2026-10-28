import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  DollarSign,
  Award,
  Layers,
  Zap,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Download,
  Filter,
  Search,
  Sliders,
  Database,
  Activity,
  FileText,
  Building2,
  Cpu,
  BarChart2,
  Eye,
  Check,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  OpportunityLead,
  OpportunityFunnelStage,
  OpportunityCategory,
  HealthPredictionOpportunity,
  LossRetrofitOpportunity,
  AssetValuationOpportunity,
  CarbonGreenCertOpportunity,
  SafetyComplianceOpportunity,
  DataApiProduct,
  MiningRuleItem,
  ClosedLoopEffectRecord,
  OpportunityWarningAlert
} from '../../types/opportunityMining';
import {
  INITIAL_OPPORTUNITY_LEADS,
  INITIAL_FUNNEL_SUMMARY,
  INITIAL_HEALTH_PREDICTION_OPPS,
  INITIAL_LOSS_RETROFIT_OPPS,
  INITIAL_ASSET_VALUATION_OPPS,
  INITIAL_CARBON_GREEN_CERT_OPPS,
  INITIAL_SAFETY_COMPLIANCE_OPPS,
  INITIAL_DATA_API_PRODUCTS,
  INITIAL_MINING_RULES,
  INITIAL_CLOSED_LOOP_RECORDS,
  INITIAL_OPPORTUNITY_WARNINGS
} from '../../mock/opportunityMiningData';

type ActiveTabKey = 'funnel_report' | 'technical_valuation' | 'leads_dispatch' | 'rules_closedloop';

export const OpportunityMiningView: React.FC = () => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<ActiveTabKey>('funnel_report');

  // Leads list state
  const [leads, setLeads] = useState<OpportunityLead[]>(INITIAL_OPPORTUNITY_LEADS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<OpportunityLead | null>(leads[0]);

  // Rules list state
  const [rules, setRules] = useState<MiningRuleItem[]>(INITIAL_MINING_RULES);

  // Closed loop records state
  const [closedLoopRecords, setClosedLoopRecords] = useState<ClosedLoopEffectRecord[]>(INITIAL_CLOSED_LOOP_RECORDS);

  // Warnings alert state
  const [warnings, setWarnings] = useState<OpportunityWarningAlert[]>(INITIAL_OPPORTUNITY_WARNINGS);

  // Technical Assessment sub-tab
  const [techSubTab, setTechSubTab] = useState<'health' | 'loss' | 'valuation' | 'carbon' | 'safety'>('health');

  // Syncing state notification
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  // Modal for backfill record
  const [showBackfillModal, setShowBackfillModal] = useState(false);
  const [backfillForm, setBackfillForm] = useState({
    leadNo: 'OPP-2026-0842',
    siteName: '深圳光明储能电站二期-04号站',
    serviceItem: '3# 簇老化模组整体置换与扩容技改',
    predictedBenefit: '放电量恢复 +1.82 MWh/日，年化收益 78 万元',
    actualBenefit: '实测放电量恢复 +1.95 MWh/日，月增量收益 7.1 万元',
    variancePct: 9.2,
    accuracy: 96.5,
    evaluator: '张伟 (大客户商务总监)'
  });

  // Filtered leads
  const filteredLeads = leads.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedStage !== 'ALL' && item.stage !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${item.leadNo} ${item.title} ${item.siteName} ${item.clientName} ${item.owner}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Handle Sync All
  const handleSyncAll = () => {
    setSyncingAll(true);
    setTimeout(() => {
      setLeads((prev) =>
        prev.map((lead) => ({
          ...lead,
          syncStatus: 'SYNCED'
        }))
      );
      setSyncingAll(false);
      setSyncSuccessToast('已成功将全量 10 个商业机会点双向同步至 Salesforce CRM 与 PCare 工单中心！');
      setTimeout(() => setSyncSuccessToast(null), 4000);
    }, 900);
  };

  // Toggle Rule
  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  // Handle Backfill Submit
  const handleSaveBackfill = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ClosedLoopEffectRecord = {
      id: `loop-0${closedLoopRecords.length + 1}`,
      leadNo: backfillForm.leadNo,
      siteName: backfillForm.siteName,
      serviceItem: backfillForm.serviceItem,
      predictedBenefit: backfillForm.predictedBenefit,
      actualBenefit: backfillForm.actualBenefit,
      variancePct: backfillForm.variancePct,
      modelFeedbackAccuracy: backfillForm.accuracy,
      backfilledAt: new Date().toISOString().split('T')[0],
      evaluator: backfillForm.evaluator
    };
    setClosedLoopRecords([newRecord, ...closedLoopRecords]);
    setShowBackfillModal(false);
    setSyncSuccessToast(`商机 [${backfillForm.leadNo}] 效果闭环回填成功，模型置信度自适应更新！`);
    setTimeout(() => setSyncSuccessToast(null), 4000);
  };

  // Resolve Alert
  const handleDismissWarning = (id: string) => {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
    setSyncSuccessToast('预警已完成现场协同核实并闭环归档');
    setTimeout(() => setSyncSuccessToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-4 pb-12 text-slate-800">
      {/* 顶部标题区与快捷操作栏 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg shadow-sm">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">机会点挖掘与商业化价值运营</h1>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 rounded">
                    14 项全链路闭环能力
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  从设备工况与技术诊断深度挖掘潜在商机，涵盖寿命预测、损耗技改、资产尽调、绿证碳资产、API产品及全流程商机漏斗闭环
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              {syncingAll ? '正在同步CRM...' : '机会点自动同步 (CRM/PCare)'}
            </button>
            <button
              onClick={() => {
                setSyncSuccessToast('正在生成《2026年度电站机会点挖掘与商业化落地成效报告.pdf》...');
                setTimeout(() => setSyncSuccessToast(null), 3500);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              导出商业化价值报告
            </button>
          </div>
        </div>

        {/* 顶部全局 KPI 卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              商机漏斗总额
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">¥ 1,256.0 <span className="text-xs font-normal text-slate-500">万</span></div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">较上月 +18.4% 增量</div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              加权预期规模
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">¥ 954.6 <span className="text-xs font-normal text-slate-500">万</span></div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">综合概率加权评估</div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              已签约落地总额
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-700 mt-1">¥ 524.0 <span className="text-xs font-normal text-slate-500">万</span></div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">累计完成 3 项交付</div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              全流程综合转化率
              <Award className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">41.7 <span className="text-xs font-normal text-slate-500">%</span></div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">行业均值 28.5%</div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              平均商务推进周期
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">34.5 <span className="text-xs font-normal text-slate-500">天</span></div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">同比提速 12.3 天</div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-lg">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              待协同运营预警
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-lg font-bold text-rose-600 mt-1">{warnings.length} <span className="text-xs font-normal text-slate-500">条</span></div>
            <div className="text-[10px] text-rose-500 font-medium mt-0.5">含 1 项停滞紧急超时</div>
          </div>
        </div>
      </div>

      {/* 提示条 Toast */}
      {syncSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncSuccessToast}</span>
          </div>
          <button
            onClick={() => setSyncSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* 4 个主功能导航页签 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('funnel_report')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'funnel_report'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>转换漏斗看板与定期报告</span>
          <span className="text-[10px] opacity-80">(漏斗/报告/预警)</span>
        </button>

        <button
          onClick={() => setActiveTab('technical_valuation')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'technical_valuation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>技术与资产价值挖掘</span>
          <span className="text-[10px] opacity-80">(健康/技改/估值/碳资产)</span>
        </button>

        <button
          onClick={() => setActiveTab('leads_dispatch')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'leads_dispatch'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>商机线索与运维协同</span>
          <span className="text-[10px] opacity-80">(线索生成/备件/同步)</span>
        </button>

        <button
          onClick={() => setActiveTab('rules_closedloop')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rules_closedloop'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>规则引擎与闭环运营</span>
          <span className="text-[10px] opacity-80">(挖掘规则/效果回填/API)</span>
        </button>
      </div>

      {/* ======================= Tab 1: 转换漏斗看板、定期报告与运营预警 ======================= */}
      {activeTab === 'funnel_report' && (
        <div className="flex flex-col gap-4">
          {/* 1. 运营预警与告警看板 (能力 14) */}
          {warnings.length > 0 && (
            <div className="bg-white border border-rose-200/80 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-slate-900">【机会点分析】运营预警与跟进告警</h3>
                  <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    {warnings.length} 项需重点协调
                  </span>
                </div>
                <span className="text-xs text-slate-500">基于商机各阶段停留 SLA 及商务履约关键期自动触发</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${
                      warn.level === 'CRITICAL'
                        ? 'bg-rose-50/60 border-rose-200'
                        : warn.level === 'WARNING'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-blue-50/60 border-blue-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            warn.level === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : warn.level === 'WARNING'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {warn.level === 'CRITICAL' ? '紧急滞留' : warn.level === 'WARNING' ? '审批延迟' : '待指派'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">SLA剩余: {warn.slaRemainingHours}h</span>
                      </div>
                      <div className="font-bold text-slate-900 mt-2 text-xs line-clamp-1">{warn.title}</div>
                      <div className="text-slate-600 mt-1 line-clamp-2 text-[11px]">{warn.alertReason}</div>
                      <div className="mt-2 p-2 bg-white/80 rounded border border-slate-200/60 text-[11px] text-slate-700">
                        <span className="font-semibold text-slate-900">协同建议：</span>
                        {warn.handlingAdvice}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">{warn.triggerTime}</span>
                      <button
                        onClick={() => handleDismissWarning(warn.id)}
                        className="px-2 py-1 text-[11px] font-medium bg-white text-slate-700 hover:text-blue-600 rounded border border-slate-300 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        已核实闭环
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 转换漏斗看板 (能力 10) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">【机会点分析】商机全生命周期转换漏斗看板</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  全流程跟踪从技术触发到签约落地各个阶段的转化率、流失损耗与滞留周期
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>当前漏斗健康度良好 (整体转化率 41.7%)</span>
              </div>
            </div>

            {/* 漏斗各阶段柱形展示 */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
              {INITIAL_FUNNEL_SUMMARY.stages.map((st, idx) => {
                const widthPct = Math.max(25, 100 - idx * 12);
                return (
                  <div
                    key={st.stage}
                    className="flex flex-col justify-between p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl relative group hover:border-blue-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{st.label}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{st.count} 个</span>
                      </div>
                      <div className="text-base font-bold text-blue-700 mt-2">
                        ¥ {(st.amountYuan / 10000).toFixed(1)} <span className="text-xs font-normal text-slate-500">万</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      {/* 漏斗宽条模拟 */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${widthPct}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                        <span>上一环节流转率</span>
                        <span className="font-mono font-semibold text-emerald-600">
                          {st.conversionFromPreviousPct}%
                        </span>
                      </div>
                    </div>

                    {idx < 5 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 漏斗深度诊断分析指标 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="font-bold text-blue-900">漏斗最大转化卡点</div>
                <div className="text-slate-600 mt-1">
                  【客户推介】至【商务谈判】阶段转化损耗约 32%，主要系客户内部招标立项审批周期较长。
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="font-bold text-emerald-900">最高转化价值类别</div>
                <div className="text-slate-600 mt-1">
                  【损失诊断与水阻技改】平均投资回收期仅 0.8 年，客户推介后赢单签约率高达 72.0%。
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <div className="font-bold text-amber-900">下一阶段扩容预期</div>
                <div className="text-slate-600 mt-1">
                  预计 9 月末将有 3 处电站完成商业满 2 年运行期，自动触发并购尽调与估值商机 135 万元。
                </div>
              </div>
            </div>
          </div>

          {/* 3. 转换情况定期报告 (能力 11) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">【机会点分析】商机转换情况定期报告中心</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  自动化汇总月度、季度与专项商业化转化成果，支持多维归因剖析与一键交付归档
                </p>
              </div>
              <button
                onClick={() => {
                  setSyncSuccessToast('已生成《2026年Q3储能专业服务机会点转化季报》');
                  setTimeout(() => setSyncSuccessToast(null), 3000);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                + 生成最新月度复盘报告
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 报告卡片 1 */}
              <div className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow bg-gradient-to-br from-white to-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                    季度综合转化报表
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">2026-Q2 复盘</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5">
                  2026 年第二季度专业服务机会点商业化转化闭环报告
                </h4>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>挖掘商机总数:</span>
                    <span className="font-semibold text-slate-900">18 项</span>
                  </div>
                  <div className="flex justify-between">
                    <span>实际签约转化额:</span>
                    <span className="font-semibold text-emerald-600">¥ 780.0 万元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>转化周期中位数:</span>
                    <span className="font-semibold text-slate-900">28.0 天</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">主编：商业化运营组</span>
                  <button
                    onClick={() => {
                      setSyncSuccessToast('开始下载: 2026-Q2-专业服务商业化转化报告.pdf');
                      setTimeout(() => setSyncSuccessToast(null), 3000);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载 PDF
                  </button>
                </div>
              </div>

              {/* 报告卡片 2 */}
              <div className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow bg-gradient-to-br from-white to-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
                    专项技改损耗分析
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">2026-08 专项</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5">
                  华南与西北大型储能基地液冷管损与母排发热技改效益专项报告
                </h4>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>技改立项试点站:</span>
                    <span className="font-semibold text-slate-900">4 座</span>
                  </div>
                  <div className="flex justify-between">
                    <span>预计年化节能量:</span>
                    <span className="font-semibold text-emerald-600">199.6 MWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均综合 ROI:</span>
                    <span className="font-semibold text-slate-900">46.5%</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">主编：技术运维支持部</span>
                  <button
                    onClick={() => {
                      setSyncSuccessToast('开始下载: 2026-08-大型储能基地技改效益报告.xlsx');
                      setTimeout(() => setSyncSuccessToast(null), 3000);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载 Excel
                  </button>
                </div>
              </div>

              {/* 报告卡片 3 */}
              <div className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow bg-gradient-to-br from-white to-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded">
                    绿电绿证交易分析
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">2026-07 盘点</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5">
                  全网在运独立储能电站绿证 (GEC) 核发潜力与碳资产变现白皮书
                </h4>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>潜在可核发绿证:</span>
                    <span className="font-semibold text-slate-900">176,000 张</span>
                  </div>
                  <div className="flex justify-between">
                    <span>碳市场预计分成:</span>
                    <span className="font-semibold text-emerald-600">¥ 528.0 万元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>预测日前免罚率:</span>
                    <span className="font-semibold text-slate-900">94.5%</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">主编：绿电与碳资产事业部</span>
                  <button
                    onClick={() => {
                      setSyncSuccessToast('开始下载: 2026-07-独立储能绿证碳资产白皮书.pdf');
                      setTimeout(() => setSyncSuccessToast(null), 3000);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载 PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= Tab 2: 技术与资产价值挖掘 ======================= */}
      {activeTab === 'technical_valuation' && (
        <div className="flex flex-col gap-4">
          {/* 子维度切换卡片 */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700">深度挖掘模块选择：</span>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setTechSubTab('health')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    techSubTab === 'health'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ① 设备健康评分与寿命预测
                </button>
                <button
                  onClick={() => setTechSubTab('loss')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    techSubTab === 'loss'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ② 损失诊断与技改评估
                </button>
                <button
                  onClick={() => setTechSubTab('valuation')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    techSubTab === 'valuation'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⑤ 资产尽调评级与交易估值
                </button>
                <button
                  onClick={() => setTechSubTab('carbon')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    techSubTab === 'carbon'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⑥ 功率预测与绿证碳资产
                </button>
                <button
                  onClick={() => setTechSubTab('safety')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    techSubTab === 'safety'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⑦ 安全合规与零碳认证
                </button>
              </div>
            </div>
          </div>

          {/* 1. 设备健康评分与寿命预测 (能力 1) */}
          {techSubTab === 'health' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】设备健康评分与剩余寿命预测 (RUL)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  基于电芯衰减模型、极化内阻及运行温度累积损伤，精准预测关键部件最佳经济置换窗口
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_HEALTH_PREDICTION_OPPS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.siteName}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                          预警提前 {item.earlyWarningDays} 天
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-blue-700 mt-2">
                        部件：{item.deviceType}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                        <div>
                          <div className="text-slate-500 text-[11px]">当前综合健康得分</div>
                          <div className="text-base font-bold text-slate-900 mt-0.5">
                            {item.currentHealthScore} <span className="text-xs font-normal">分</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[11px]">预测剩余寿命 (RUL)</div>
                          <div className="text-base font-bold text-amber-600 mt-0.5">
                            {item.predictedRulMonths} <span className="text-xs font-normal">个月</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[11px]">年化容量衰减率</div>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {item.cellDegradationRateAnnual}% /年
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[11px]">提前置换避免停机损失</div>
                          <div className="font-bold text-emerald-700 mt-0.5">
                            ¥ {(item.preventiveLossSavingYuan / 10000).toFixed(1)} 万
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 bg-blue-50/60 rounded-lg text-xs text-slate-700">
                        <span className="font-semibold text-blue-900">置换窗口决策：</span>
                        {item.optimalSwapDate}
                        <div className="text-[11px] text-slate-500 mt-1">{item.recommendedAction}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSyncSuccessToast(`已将 [${item.siteName} - ${item.deviceType}] 置换方案推送至商机线索池`);
                        setTimeout(() => setSyncSuccessToast(null), 3500);
                      }}
                      className="mt-4 w-full py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      生成备件更换与扩容商机线索
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 损失诊断与技改评估 (能力 2) */}
          {techSubTab === 'loss' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】损失诊断与技改评估体系
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  全网四维损耗溯源（母排发热、水泵冷机水阻、低负荷变流、木桶短板），定量算清投资回收期 (ROI)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_LOSS_RETROFIT_OPPS.map((loss) => (
                  <div
                    key={loss.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{loss.siteName}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                        {loss.lossTypeLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3 p-3 bg-slate-50 rounded-lg text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">年电量损耗</div>
                        <div className="font-bold text-slate-900 mt-0.5">{loss.currentAnnualLossMwh} MWh</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">年化经济损失</div>
                        <div className="font-bold text-rose-600 mt-0.5">¥ {(loss.lossCostYuanPerYear / 10000).toFixed(1)}万</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">技改预计投资</div>
                        <div className="font-bold text-slate-900 mt-0.5">¥ {(loss.retrofitInvestmentYuan / 10000).toFixed(1)}万</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">投资回收期</div>
                        <div className="font-bold text-emerald-600 mt-0.5">{loss.paybackYears} 年</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs">
                      <span className="font-semibold text-slate-700">推荐技改方案：</span>
                      <span className="text-slate-600 ml-1">{loss.retrofitScheme}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-slate-600">
                        5年累计净收益: <span className="font-bold text-emerald-700">¥ {(loss.fiveYearNetBenefitYuan / 10000).toFixed(1)} 万元</span>
                        <span className="text-slate-400 ml-2">(ROI: {loss.roiPct}%)</span>
                      </div>
                      <button
                        onClick={() => {
                          setSyncSuccessToast(`已导出 [${loss.siteName}] 技改投资可行性研判报告书`);
                          setTimeout(() => setSyncSuccessToast(null), 3000);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                      >
                        出具技改方案书
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. 资产尽调评级与估值 (能力 5) */}
          {techSubTab === 'valuation' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】资产尽调评级与交易估值
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  针对存量电站转让、股权收购与基础设施 REITs 发行，基于真实衰减工况出具专业技术尽调与 DCF 估值
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_ASSET_VALUATION_OPPS.map((item) => (
                  <div
                    key={item.siteId}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.siteName}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded ${
                            item.rating === 'AAA'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.rating === 'AA'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          评级: {item.rating}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-slate-50 rounded-lg text-xs">
                        <div>
                          <div className="text-[10px] text-slate-500">储能规模</div>
                          <div className="font-bold text-slate-900 mt-0.5">{item.capacityMw} MW</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">资产基准估值</div>
                          <div className="font-bold text-blue-700 mt-0.5">¥ {item.valuationMlnYuan} 百万</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">预期全投 IRR</div>
                          <div className="font-bold text-emerald-600 mt-0.5">{item.irrPct}%</div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs space-y-1.5">
                        <div className="text-slate-600">
                          <span className="font-semibold text-slate-800">尽调核心结论：</span>
                          {item.dueDiligenceSummary}
                        </div>
                        <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded text-[11px] text-amber-900">
                          <span className="font-semibold">交易风控建议：</span>
                          {item.transactionAdvice}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSyncSuccessToast(`已生成 [${item.siteName}] 资产并购交易估值报告书 (送审投委会)`);
                        setTimeout(() => setSyncSuccessToast(null), 3000);
                      }}
                      className="mt-4 w-full py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                    >
                      出具第三方资产尽调估值报告 (REITs/并购)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 功率预测与绿证碳资产 (能力 6) */}
          {techSubTab === 'carbon' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】功率预测与绿证 (GEC) / CCER 碳资产开发
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  依托精准日前功率充放预测提升免罚率，打通北京电力交易中心与自愿减排量交易通道
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_CARBON_GREEN_CERT_OPPS.map((item) => (
                  <div
                    key={item.siteId}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.siteName}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                          日前预测精度 {item.forecastAccuracyPct}%
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                          <div className="flex justify-between text-slate-600 text-[11px]">
                            <span>潜在可核发绿证 (GEC):</span>
                            <span className="font-bold text-slate-900">{item.potentialGecCount.toLocaleString()} 张</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-bold mt-1">
                            <span>绿证预期收入 (30元/张):</span>
                            <span>¥ {(item.gecRevenueYuan / 10000).toFixed(1)} 万元</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                          <div className="flex justify-between text-slate-600 text-[11px]">
                            <span>CCER 碳减排量:</span>
                            <span className="font-bold text-slate-900">{item.ccerEmissionReductionTons.toLocaleString()} 吨 CO2</span>
                          </div>
                          <div className="flex justify-between text-blue-700 font-bold mt-1">
                            <span>碳配额交易估值:</span>
                            <span>¥ {(item.ccerRevenueYuan / 10000).toFixed(1)} 万元</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[11px] text-slate-500 px-1">
                          <span>考核免罚节约收益:</span>
                          <span className="font-semibold text-slate-800">¥ {(item.imbalancePenaltySavingYuan / 10000).toFixed(1)} 万元/年</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSyncSuccessToast(`已向国家绿色电力证书交易平台提交 [${item.siteName}] 绿证核发申请流水`);
                        setTimeout(() => setSyncSuccessToast(null), 3000);
                      }}
                      className="mt-4 w-full py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                    >
                      一键发起绿证核发与 CCER 碳配额代理交易
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. 安全合规与零碳认证 (能力 7) */}
          {techSubTab === 'safety' && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】安全合规体系与零碳园区认证支持
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  对标国家标准 GB 51048、国际标准 NFPA 855 及 ISO 14064 碳中和认证，提供现场辅导与保险保费减免商机
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_SAFETY_COMPLIANCE_OPPS.map((item) => (
                  <div
                    key={item.siteId}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.siteName}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            item.zeroCarbonReadiness === 'READY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.zeroCarbonReadiness === 'READY' ? '达标通过' : '存在微小差距项'}
                        </span>
                      </div>

                      <div className="text-xs text-blue-700 font-semibold mt-2">{item.standardName}</div>

                      <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-50 rounded-lg text-xs">
                        <div>
                          <div className="text-[10px] text-slate-500">合规审计得分</div>
                          <div className="font-bold text-slate-900 mt-0.5">{item.complianceScore} 分</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">待闭环差距项</div>
                          <div className="font-bold text-amber-600 mt-0.5">{item.gapItemCount} 项</div>
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-emerald-50/70 border border-emerald-200/70 rounded text-xs text-emerald-800">
                        <span className="font-semibold">财产保费减免折扣：</span>
                        <span className="font-bold ml-1">{item.insurancePremiumSavingPct}% 折扣</span>
                        <div className="text-[11px] text-slate-600 mt-1">{item.suggestedRemediation}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSyncSuccessToast(`已预约第三方权威机构为 [${item.siteName}] 开展防爆与零碳现场预检`);
                        setTimeout(() => setSyncSuccessToast(null), 3000);
                      }}
                      className="mt-4 w-full py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      生成合规整改与认证辅导服务包
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= Tab 3: 商机线索与运维协同 ======================= */}
      {activeTab === 'leads_dispatch' && (
        <div className="flex flex-col gap-4">
          {/* 筛选与搜索控制栏 */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索线索编号、电站名称、客户或责任人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
              >
                <option value="ALL">全部业务类别</option>
                <option value="EQUIPMENT_HEALTH_RUL">设备健康与寿命预测</option>
                <option value="LOSS_RETROFIT">损失诊断与技改评估</option>
                <option value="COMMERCIAL_LEAD">核心商机线索</option>
                <option value="ASSET_VALUATION">资产尽调评级与估值</option>
                <option value="CARBON_GREEN_CERT">功率预测与绿证碳资产</option>
                <option value="SAFETY_COMPLIANCE">安全合规与零碳认证</option>
                <option value="DATA_API">行业数据API与指数</option>
              </select>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
              >
                <option value="ALL">全部漏斗阶段</option>
                <option value="DISCOVERED">1. 发现与触发</option>
                <option value="EVALUATING">2. 方案评估中</option>
                <option value="CLIENT_PITCHED">3. 客户推介沟通</option>
                <option value="NEGOTIATION">4. 商务谈判竞价</option>
                <option value="CONTRACTED">5. 签约落地履约</option>
                <option value="CLOSED">6. 归档复盘</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                共找到 <span className="font-bold text-slate-800">{filteredLeads.length}</span> 条商机线索
              </span>
            </div>
          </div>

          {/* 商机线索表格与右侧详情 (能力 4: 商机线索自动生成、能力 3: 智能调度与备件、能力 9: 自动同步) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧线索列表 */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>【机会点分析】商机线索生成与多端流转池</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    (涵盖自动机理触发与商机流转)
                  </span>
                </div>
                <button
                  onClick={handleSyncAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  全部同步至 CRM
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">线索编号 / 主题</th>
                      <th className="py-2.5 px-3">站点与客户</th>
                      <th className="py-2.5 px-3">阶段 / 赢单率</th>
                      <th className="py-2.5 px-3">预估金额 (元)</th>
                      <th className="py-2.5 px-3">责任人</th>
                      <th className="py-2.5 px-3">同步状态</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((item) => {
                      const isSelected = selectedLeadDetail?.id === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedLeadDetail(item)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 max-w-[240px]">
                            <div className="font-mono text-[11px] font-bold text-slate-500">{item.leadNo}</div>
                            <div className="font-medium text-slate-900 mt-0.5 line-clamp-1">{item.title}</div>
                            <div className="text-[10px] text-blue-600 mt-0.5">{item.categoryLabel}</div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800 line-clamp-1">{item.siteName}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{item.clientName}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.stage === 'CONTRACTED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.stage === 'NEGOTIATION'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : item.stage === 'CLIENT_PITCHED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.stageLabel}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">赢率: {item.probabilityPct}%</div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">¥ {(item.estimatedValueYuan / 10000).toFixed(1)} 万</div>
                            <div className="text-[10px] text-slate-400">加权: ¥{(item.weightedValueYuan / 10000).toFixed(1)}万</div>
                          </td>

                          <td className="py-3 px-3 text-slate-700">
                            <div>{item.owner}</div>
                            <div className="text-[10px] text-slate-400 font-mono">截止: {item.dueDate}</div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                item.syncStatus === 'SYNCED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.syncStatus === 'SYNCED' ? <Check className="w-2.5 h-2.5" /> : null}
                              {item.syncStatus === 'SYNCED' ? '已同步CRM' : '待同步'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadDetail(item);
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 右侧选定线索详情与智能协同 (能力 3: 调度与备件、能力 9: 自动同步) */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              {selectedLeadDetail ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {selectedLeadDetail.leadNo}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded border border-blue-200">
                      {selectedLeadDetail.stageLabel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {selectedLeadDetail.title}
                    </h4>
                    <div className="text-xs text-slate-500 mt-1">
                      电站：{selectedLeadDetail.siteName}
                    </div>
                  </div>

                  {/* 触发机理 */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-lg text-xs">
                    <div className="font-bold text-amber-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      触发诊断机理
                    </div>
                    <div className="text-amber-800 mt-1 leading-relaxed text-[11px]">
                      {selectedLeadDetail.triggerReason}
                    </div>
                  </div>

                  {/* 技术指标与经济性预估 */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1.5">
                    <div className="font-semibold text-slate-800">技术诊断与收益测算：</div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>现状指标:</span>
                      <span className="font-medium text-slate-900">{selectedLeadDetail.technicalDiagnosis.currentMetric}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>改善收益:</span>
                      <span className="font-medium text-emerald-700">{selectedLeadDetail.technicalDiagnosis.potentialGain}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>静态回收期:</span>
                      <span className="font-medium text-slate-900">{selectedLeadDetail.technicalDiagnosis.paybackMonths} 个月</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>预期 ROI:</span>
                      <span className="font-bold text-emerald-600">{selectedLeadDetail.technicalDiagnosis.roiPct}%</span>
                    </div>
                  </div>

                  {/* 能力 3: 智能运维调度与备件优化协同 */}
                  <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-lg text-xs">
                    <div className="font-bold text-blue-900 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      【机会点分析】智能调度与备件优化协同
                    </div>
                    <div className="text-slate-700 mt-1.5 space-y-1 text-[11px]">
                      <div>
                        • 推荐备件批次：<span className="font-semibold text-slate-900">集中采购匹配磷酸铁锂高一致性模组</span>
                      </div>
                      <div>
                        • 调度派工建议：<span className="font-semibold text-slate-900">安排区域运维主管与电气技师协同上站</span>
                      </div>
                      <div>
                        • 窗口期调度：<span className="font-semibold text-emerald-700">利用谷电检修窗口（01:00-06:00），避免充放套利损失</span>
                      </div>
                    </div>
                  </div>

                  {/* 能力 9: 机会点自动同步服务 */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">【机会点分析】自动同步服务</span>
                      <span className="text-slate-500 font-mono">双向状态: {selectedLeadDetail.syncStatus}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      同步目标：<span className="font-mono text-slate-800">{selectedLeadDetail.syncTarget}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">请选择左侧商机查看详情</div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSyncSuccessToast(`已将商机 [${selectedLeadDetail?.leadNo}] 再次推送同步至 CRM / PCare 派单`);
                    setTimeout(() => setSyncSuccessToast(null), 3000);
                  }}
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  推送并同步工单
                </button>
                <button
                  onClick={() => setShowBackfillModal(true)}
                  className="py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  回填闭环
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= Tab 4: 规则引擎、闭环回填与数据API ======================= */}
      {activeTab === 'rules_closedloop' && (
        <div className="flex flex-col gap-4">
          {/* 1. 挖掘规则运营管理 (能力 12) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】机会点挖掘规则运营管理
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  维护设备诊断、工况劣化及商业触发规则，配置去抖冷却期与阈值，管控线索质量
                </p>
              </div>
              <button
                onClick={() => {
                  setSyncSuccessToast('已打开规则编辑器，可新增工况触发策略');
                  setTimeout(() => setSyncSuccessToast(null), 3000);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                新建挖掘规则
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">规则编码 / 名称</th>
                    <th className="py-2.5 px-3">业务类别</th>
                    <th className="py-2.5 px-3">触发条件与阈值</th>
                    <th className="py-2.5 px-3">去抖冷却期</th>
                    <th className="py-2.5 px-3">年预期线索</th>
                    <th className="py-2.5 px-3">历史转化率</th>
                    <th className="py-2.5 px-3">优先级</th>
                    <th className="py-2.5 px-3 text-right">状态 / 开关</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] font-bold text-slate-500">{rule.ruleCode}</div>
                        <div className="font-bold text-slate-900 mt-0.5">{rule.ruleName}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {rule.categoryLabel}
                      </td>

                      <td className="py-3 px-3 max-w-[260px]">
                        <div className="text-slate-800 line-clamp-2">{rule.triggerCondition}</div>
                        <span className="inline-block mt-1 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          阈值: {rule.thresholdValue}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700">
                        {rule.debounceCooldownDays} 天
                      </td>

                      <td className="py-3 px-3 font-bold text-blue-700">
                        ~{rule.estimatedAnnualLeads} 条/年
                      </td>

                      <td className="py-3 px-3 font-bold text-emerald-600">
                        {rule.conversionRateHistorical}%
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                            rule.priority === 'P1'
                              ? 'bg-rose-100 text-rose-800'
                              : rule.priority === 'P2'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rule.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                            rule.isEnabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {rule.isEnabled ? '运行中 (已启用)' : '已停用'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. 运营指标与效果闭环回填 (能力 13) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】运营指标与效果闭环回填
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  对比预测效益与实际落地收益，反哺自适应优化技术机理阈值与商业化转化模型
                </p>
              </div>
              <button
                onClick={() => setShowBackfillModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                + 手动录入效果回填
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {closedLoopRecords.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700">{item.leadNo}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        模型准确度 {item.modelFeedbackAccuracy}%
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-2">{item.siteName}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{item.serviceItem}</div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-medium">前期预测效益：</div>
                        <div className="text-slate-800 mt-0.5 text-[11px]">{item.predictedBenefit}</div>
                      </div>

                      <div className="p-2 bg-emerald-50/60 rounded border border-emerald-100">
                        <div className="text-[10px] text-emerald-700 font-medium">实测闭环效益：</div>
                        <div className="text-emerald-900 font-semibold mt-0.5 text-[11px]">{item.actualBenefit}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>评估人: {item.evaluator}</span>
                    <span className="font-mono">回填: {item.backfilledAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 行业数据API与指数产品 (能力 8) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  【机会点分析】行业数据 API 与指数产品商业化矩阵
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  沉淀全网三万余座电站退化、能效基准与估值引擎，面向保险、评级机构及金融资方提供对外授权服务
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                年化 API 纯软件收入: ¥ 698.0 万元
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_DATA_API_PRODUCTS.map((api) => (
                <div
                  key={api.id}
                  className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                        {api.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          api.status === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {api.status === 'ACTIVE' ? '● 商用中' : '● 公测中 (Beta)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-2">{api.apiName}</h4>
                    <div className="text-[11px] font-mono text-slate-500 mt-1 bg-slate-100 p-1.5 rounded truncate">
                      {api.apiEndpoint}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-slate-50 rounded-lg text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">订阅企业客户</div>
                        <div className="font-bold text-slate-900 mt-0.5">{api.subscribersCount} 家</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">月均调用频次</div>
                        <div className="font-bold text-blue-700 mt-0.5">{(api.callVolumeMonthly / 10000).toFixed(1)} 万次</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs flex justify-between items-center text-slate-700">
                      <span>授权定价：</span>
                      <span className="font-semibold text-slate-900">{api.pricing}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">
                      年收入: ¥ {(api.annualRevenueYuan / 10000).toFixed(1)} 万元
                    </span>
                    <button
                      onClick={() => {
                        setSyncSuccessToast(`已复制 ${api.apiName} 开发者 OpenAPI 文档链接`);
                        setTimeout(() => setSyncSuccessToast(null), 3000);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      <span>接口文档</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 录入效果闭环回填 Modal */}
      {showBackfillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 text-xs text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                【机会点分析】商机落地效果闭环回填录入
              </h3>
              <button
                onClick={() => setShowBackfillModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBackfill} className="space-y-3 mt-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">对应商机线索编号</label>
                <input
                  type="text"
                  value={backfillForm.leadNo}
                  onChange={(e) => setBackfillForm({ ...backfillForm, leadNo: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">电站名称</label>
                <input
                  type="text"
                  value={backfillForm.siteName}
                  onChange={(e) => setBackfillForm({ ...backfillForm, siteName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">落地服务项目</label>
                <input
                  type="text"
                  value={backfillForm.serviceItem}
                  onChange={(e) => setBackfillForm({ ...backfillForm, serviceItem: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">模型前期预测效益</label>
                  <input
                    type="text"
                    value={backfillForm.predictedBenefit}
                    onChange={(e) => setBackfillForm({ ...backfillForm, predictedBenefit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">实测落地实际效益</label>
                  <input
                    type="text"
                    value={backfillForm.actualBenefit}
                    onChange={(e) => setBackfillForm({ ...backfillForm, actualBenefit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">偏差率 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={backfillForm.variancePct}
                    onChange={(e) => setBackfillForm({ ...backfillForm, variancePct: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">模型准确度评分 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={backfillForm.accuracy}
                    onChange={(e) => setBackfillForm({ ...backfillForm, accuracy: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">评估责任人</label>
                <input
                  type="text"
                  value={backfillForm.evaluator}
                  onChange={(e) => setBackfillForm({ ...backfillForm, evaluator: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBackfillModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded cursor-pointer shadow-xs"
                >
                  确认回填并更新模型
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
