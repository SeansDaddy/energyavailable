import React, { useState } from 'react';
import {
  OpportunityCard,
  OpportunityCardStatus,
  ClosedReasonCategory,
  TenderRadarNotice,
  PolicyAlertItem
} from '../../types/opportunityMining';
import {
  INITIAL_OPPORTUNITY_CARDS,
  INITIAL_ENGINE_SUMMARY
} from '../../mock/opportunityMiningData';
import { OpportunityCardsHub } from './OpportunityCardsHub';
import { RunDataDiagnosisWorkbench } from './RunDataDiagnosisWorkbench';
import { PublicDataRadarWorkbench } from './PublicDataRadarWorkbench';
import { BehaviorEcosystemWorkbench } from './BehaviorEcosystemWorkbench';
import {
  Target,
  Layers,
  Zap,
  Activity,
  FileCheck2,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  Share2,
  Cpu,
  Sun,
  BatteryCharging,
  Server,
  Building2,
  BarChart3
} from 'lucide-react';

type MainTabKey = 'cards_hub' | 'run_data_v1' | 'public_radar_v2' | 'behavior_ecosystem_v3';

export const OpportunityMiningView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTabKey>('cards_hub');
  const [cards, setCards] = useState<OpportunityCard[]>(INITIAL_OPPORTUNITY_CARDS);
  const [summary, setSummary] = useState(INITIAL_ENGINE_SUMMARY);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 3500);
  };

  // Status transition handler
  const handleUpdateCardStatus = (
    cardId: string,
    status: OpportunityCardStatus,
    reason?: ClosedReasonCategory,
    note?: string
  ) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.cardId === cardId) {
          return {
            ...c,
            status,
            closedReason: reason,
            closedReasonNote: note,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return c;
      })
    );
  };

  // Sync to CRM handler
  const handleSyncCrm = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.cardId === cardId) {
          return {
            ...c,
            crmSynced: true,
            crmSyncTarget: 'Salesforce CRM / 纷享销客'
          };
        }
        return c;
      })
    );
    showToast(`商机卡片 ${cardId} 已完成与 CRM 系统双向绑定并同步至销售线索池！`);
  };

  // Create Card from Tool
  const handleCreateCardFromTool = (newCardData: {
    title: string;
    domain: 'pv' | 'storage' | 'dc';
    targetObject: string;
    region: string;
    capacityScale: string;
    triggerType: 'diagnosis' | 'policy_price';
    triggerReason: string;
    irr: number;
    paybackYears: number;
    annualGainYuan: number;
    investmentYuan: number;
    suggestedAction: string;
  }) => {
    const newId = `CARD-2026-0${850 + cards.length}`;
    const newCard: OpportunityCard = {
      cardId: newId,
      title: newCardData.title,
      domain: newCardData.domain,
      targetObject: newCardData.targetObject,
      region: newCardData.region,
      capacityScale: newCardData.capacityScale,
      triggerType: newCardData.triggerType,
      triggerReason: newCardData.triggerReason,
      valueMetrics: {
        irr: newCardData.irr,
        paybackYears: newCardData.paybackYears,
        annualRevenueOrSavingYuan: newCardData.annualGainYuan,
        investmentYuan: newCardData.investmentYuan
      },
      intentScore: 88,
      icpScore: 90,
      behaviorScore: 86,
      suggestedAction: newCardData.suggestedAction,
      status: 'pending',
      owner: '当前销售待认领',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dataSource: '交互式收益量化引擎敏捷推算',
      hasDiagnosticReport: true,
      hasOnepager: false,
      crmSynced: false
    };

    setCards((prev) => [newCard, ...prev]);
    setSummary((prev) => ({
      ...prev,
      northStarMonthlyCardsCount: prev.northStarMonthlyCardsCount + 1,
      totalPipelineValueYuan: prev.totalPipelineValueYuan + newCardData.annualGainYuan
    }));
  };

  // Create Card from Tender
  const handleCreateCardFromTender = (tender: TenderRadarNotice) => {
    const newId = `CARD-2026-0${850 + cards.length}`;
    const newCard: OpportunityCard = {
      cardId: newId,
      title: `【标讯响应】${tender.title}`,
      domain: tender.domain,
      targetObject: tender.purchaserName,
      region: tender.region,
      capacityScale: `预算 ${(tender.estimatedBudgetYuan / 10000).toLocaleString()} 万元`,
      triggerType: 'tender',
      triggerReason: `公开招投标公告 (编号: ${tender.tenderNo})，匹配度评分达 ${tender.matchScore}%，截标日期 ${tender.closingDate}。`,
      valueMetrics: {
        irr: 12.0,
        paybackYears: 4.5,
        annualRevenueOrSavingYuan: Math.round(tender.estimatedBudgetYuan * 0.12),
        investmentYuan: tender.estimatedBudgetYuan
      },
      intentScore: tender.matchScore,
      icpScore: 92,
      behaviorScore: 75,
      suggestedAction: '联合区域生态伙伴或总包院组建联合体投标，快速锁定技术标答辩优势。',
      status: 'following',
      owner: '大客户招采跟进组',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dataSource: `公共资源交易平台标讯抓取 (${tender.tenderNo})`,
      hasDiagnosticReport: false,
      hasOnepager: true,
      crmSynced: true,
      crmSyncTarget: '纷享销客'
    };

    setCards((prev) => [newCard, ...prev]);
  };

  // Trigger Policy Recalc
  const handleTriggerPolicyRecalc = (policy: PolicyAlertItem) => {
    const newId = `CARD-2026-0${850 + cards.length}`;
    const newCard: OpportunityCard = {
      cardId: newId,
      title: `【政策电价重算】受${policy.issuingAuthority}新政驱动：某50MW电站增配储能商机`,
      domain: 'storage',
      targetObject: '华东区域优质新能源存量电站集群',
      region: '江苏省/浙江省重点电价调整区',
      capacityScale: '50 MW / 100 MWh 储能配置',
      triggerType: 'policy_price',
      triggerReason: `依据发改委文件「${policy.policyNo}」，峰谷价差扩大带来收益率提升，全投资 IRR 自动上浮至 13.8%。`,
      valueMetrics: {
        irr: 13.8,
        paybackYears: 4.0,
        annualRevenueOrSavingYuan: 7200000,
        investmentYuan: 26000000
      },
      intentScore: 90,
      icpScore: 93,
      behaviorScore: 84,
      suggestedAction: '根据最新峰谷价差表预约客户财务总监，出具重算后的对比增收测算表。',
      status: 'pending',
      owner: '当前销售待认领',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dataSource: `政策发文自动重算引擎 (${policy.policyNo})`,
      hasDiagnosticReport: true,
      hasOnepager: true,
      crmSynced: false
    };

    setCards((prev) => [newCard, ...prev]);
  };

  return (
    <div className="space-y-4 pb-12 p-3">
      {/* Global Toast */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{globalToast}</span>
        </div>
      )}

      {/* Top Banner: Product positioning in Clean Light Theme */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                PRD-ENGY-2026-001 V1.0
              </span>
              <span className="text-xs text-slate-500 font-medium">
                能源领域辅助销售产品 · 机会点发现与价值量化引擎
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                光伏 · 储能 · 数据中心能源
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>机会点管理与价值量化工作台</span>
            </h1>

            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              基于电站运行数据、公开政策标讯与客户交互行为，自动发现商机、量化经济价值（全投资 IRR / 回本年限 / 年化增收），输出标准化<strong>「商机卡片」</strong>与<strong>「内线立项一页纸」</strong>，高效赋能一线销售。
            </p>
          </div>

          {/* Quick Domain Tag Badges */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>光伏电站</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>电化学储能</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
              <Server className="w-3.5 h-3.5 text-purple-600" />
              <span>数据中心能源</span>
            </div>
          </div>
        </div>

        {/* 4 KPI Top Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-slate-100">
          {/* Card 1: North Star */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">北极星指标：有效商机卡片</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                +{summary.northStarMonthlyCardsGrowthPct}%
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{cards.length}</span>
              <span className="text-xs text-slate-500">张/月</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              跟进中 {cards.filter((c) => c.status === 'following').length} 张 · 赢单 {cards.filter((c) => c.status === 'won').length} 张
            </div>
          </div>

          {/* Card 2: Total Pipeline Value */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">
              潜在年增收 / 节费总额
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-600 font-mono">
                {(cards.reduce((sum, c) => sum + c.valueMetrics.annualRevenueOrSavingYuan, 0) / 10000).toFixed(0)}
              </span>
              <span className="text-xs text-slate-500">万元/年</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              总投资概算 {(cards.reduce((sum, c) => sum + c.valueMetrics.investmentYuan, 0) / 10000).toFixed(0)} 万元
            </div>
          </div>

          {/* Card 3: Assets Covered */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">
              纳管资产扫描总规模
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{summary.totalAssetsCoveredMw}</span>
              <span className="text-xs text-slate-500">MW / 标柜折算</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">涵盖光伏、集中储能、IDC机房</div>
          </div>

          {/* Card 4: Average IRR & Payback */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">
              平均测算 IRR / 回本期
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">{summary.avgIrrPct}%</span>
              <span className="text-xs text-slate-500">/ {summary.avgPaybackYears} 年回本</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">立项转化率 {summary.overallConversionRatePct}%</div>
          </div>
        </div>
      </div>

      {/* Main Tabs Segmented Control (4 Workspaces in crisp light theme) */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        {[
          {
            id: 'cards_hub',
            label: '📇 商机卡片中心',
            badge: `${cards.length} 张卡片`,
            badgeColor: 'bg-blue-100 text-blue-700',
            desc: '核心交付物 · 全景卡片与生命周期管理'
          },
          {
            id: 'run_data_v1',
            label: '🛠️ V1.0 运行数据诊断与测算',
            badge: '5 大工具',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            desc: '储能敏捷测算、光伏PR诊断、衰减索赔、PUE'
          },
          {
            id: 'public_radar_v2',
            label: '📡 V2.0 公开数据雷达与评分',
            badge: '全网雷达',
            badgeColor: 'bg-amber-100 text-amber-800',
            desc: '分时电价重算、标讯雷达、Target List ICP'
          },
          {
            id: 'behavior_ecosystem_v3',
            label: '🔄 V3.0 行为闭环与开放对接',
            badge: '生态API',
            badgeColor: 'bg-purple-100 text-purple-800',
            desc: '行为埋点、意向跃升预警、企微推送、CRM'
          }
        ].map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[200px] flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div>
                <div className="text-xs">{tab.label}</div>
                <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {tab.desc}
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  isActive ? 'bg-white/20 text-white' : tab.badgeColor
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Workspace Tab Content */}
      <div className="transition-all">
        {/* Tab 1: 商机卡片中心 (核心交付物) */}
        {activeTab === 'cards_hub' && (
          <OpportunityCardsHub
            cards={cards}
            onUpdateCardStatus={handleUpdateCardStatus}
            onSyncCrm={handleSyncCrm}
          />
        )}

        {/* Tab 2: V1.0 运行数据诊断与测算工具箱 */}
        {activeTab === 'run_data_v1' && (
          <RunDataDiagnosisWorkbench
            onCreateCardFromTool={handleCreateCardFromTool}
          />
        )}

        {/* Tab 3: V2.0 公开数据雷达与线索评分 */}
        {activeTab === 'public_radar_v2' && (
          <PublicDataRadarWorkbench
            onCreateCardFromTender={handleCreateCardFromTender}
            onTriggerPolicyRecalc={handleTriggerPolicyRecalc}
          />
        )}

        {/* Tab 4: V3.0 行为闭环与生态开放 */}
        {activeTab === 'behavior_ecosystem_v3' && (
          <BehaviorEcosystemWorkbench
            cards={cards}
          />
        )}
      </div>
    </div>
  );
};
