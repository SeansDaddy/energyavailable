// 能源领域辅助销售产品 · 机会点发现与价值量化引擎
// 产品需求文档（PRD-ENGY-2026-001 V1.0）类型定义
// 覆盖领域：光伏 (PV) · 储能 (Storage) · 数据中心能源 (Data Center)

// 领域枚举
export type OpportunityDomain = 'pv' | 'storage' | 'dc';

// 触发器类型
export type OpportunityTriggerType =
  | 'diagnosis' // 运行数据诊断（PR落后、容量衰减超标、PUE超标）
  | 'policy_price' // 政策与电价变动（峰谷价差扩大、尖峰电价出台）
  | 'tender' // 标讯与项目事件（公开招标、扩容立项、业主更迭）
  | 'behavior'; // 客户行为意向（多次测算、高频查阅报告、转发分享）

// 商机卡片流转状态
export type OpportunityCardStatus =
  | 'pending' // 待分配 / 待认领
  | 'following' // 销售跟进中
  | 'won' // 已立项 / 赢单落地
  | 'closed'; // 已关闭 / 归档复盘

// 关闭原因分类（输单或无效归因）
export type ClosedReasonCategory =
  | 'budget_insufficient' // 客户预算不足或暂缓
  | 'competitor_won' // 竞对低价或排他中标
  | 'policy_change' // 地方政策调整暂缓
  | 'no_interest' // 客户无意向/内部未立项
  | 'data_inaccurate' // 运行数据测算偏差
  | 'other';

// 价值量化核心指标 (PRD 6.1 数据字典)
export interface OpportunityValueMetrics {
  irr: number; // 全投资内部收益率 % (如 12.4%)
  paybackYears: number; // 静态投资回收期 (年) (如 4.2 年)
  annualRevenueOrSavingYuan: number; // 年化增收或节电金额 (元/年) (如 8600000)
  investmentYuan: number; // 建议投资额 (元) (如 28000000)
  co2ReductionTons?: number; // 年碳减排量 (吨)
  curtailmentSavedMwh?: number; // 挽回弃电量 (MWh/年)
  efficiencyGainPct?: number; // 能效提升百分比 %
}

// 核心交付物：商机卡片实体 (PRD 6.1 数据字典)
export interface OpportunityCard {
  cardId: string; // 唯一编号，如 "CARD-2026-0842"
  title: string; // 标题概括
  domain: OpportunityDomain; // 业务领域
  targetObject: string; // 目标企业或电站全称
  region: string; // 所在区域/省份
  capacityScale: string; // 规模，如 "100 MW / 200 MWh" 或 "5000 机柜"
  triggerType: OpportunityTriggerType; // 触发器类型
  triggerReason: string; // 触发机理与量化依据（回答为什么是现在）
  valueMetrics: OpportunityValueMetrics; // 价值量化指标（回答能带来多少价值）
  intentScore: number; // 意向综合评分 (0~100)
  icpScore: number; // 客户画像属性分 (0~100)
  behaviorScore: number; // 实时行为活跃分 (0~100)
  suggestedAction: string; // 推荐销售下一步行动指引
  status: OpportunityCardStatus; // 状态
  closedReason?: ClosedReasonCategory; // 关闭归因
  closedReasonNote?: string;
  owner: string; // 责任销售/跟进人
  createdAt: string; // 生成时间
  updatedAt: string; // 更新时间
  dataSource: string; // 数据源来源（如 "SCADA历史出力+发改委[2026]14号文"）
  hasDiagnosticReport: boolean; // 是否已有诊断报告
  hasOnepager: boolean; // 是否已生成内线一页纸
  crmSynced: boolean; // 是否已同步 CRM
  crmSyncTarget?: string; // 如 "Salesforce / 纷享销客"
}

// F1: 光伏健康诊断分析指标
export interface PvDiagnosticItem {
  id: string;
  stationName: string;
  ownerGroup: string;
  installedCapacityMw: number;
  actualPrPct: number; // 实际性能比 PR %
  benchmarkPrPct: number; // 区域同类标杆 PR %
  prGapPct: number; // PR 落后差距 %
  annualGenerationLossMwh: number; // 年损失发电量 MWh
  annualRevenueLossYuan: number; // 年折算损失收益 (元)
  primaryDefect: 'STRING_DISCONNECT' | 'INVERTER_DISPERSION' | 'DUST_SOILING' | 'TRACKER_FAULT';
  defectLabel: string;
  retrofitSolution: string;
  estimatedRetrofitCostYuan: number;
  retrofitIrrPct: number;
  cardGenerated: boolean;
}

// F2: 组件衰减与质保索赔数据
export interface PvWarrantyClaimItem {
  id: string;
  stationName: string;
  moduleManufacturer: string;
  operatingYears: number; // 投运年限
  contractMaxDegradationPct: number; // 质保上限累计衰减 %
  actualMeasuredDegradationPct: number; // 实测累计衰减 %
  excessDegradationPct: number; // 超标衰减偏差 %
  totalModulesCount: number;
  claimAmountYuan: number; // 建议索赔金额 (元)
  claimStatus: 'READY_TO_CLAIM' | 'CLAIMING' | 'SETTLED' | 'REJECTED';
  evidenceBundleUrl: string;
  legalClauseRef: string;
}

// F3: 加装储能机会扫描项
export interface StorageRetrofitScanItem {
  id: string;
  stationName: string;
  type: 'PV_COLOCATED' | 'C_AND_I_INDUSTRIAL'; // 光伏配储 / 工商业用户侧储能
  pvCapacityMw: number;
  annualCurtailmentRatePct: number; // 弃光率 %
  recommendedStorageMw: number; // 推荐功率 MW
  recommendedStorageMwh: number; // 推荐容量 MWh
  estimatedCapExYuan: number; // 预估投资额 (元)
  projectedIrrPct: number; // 测算全投资 IRR %
  projectedPaybackYears: number; // 回本期 (年)
  annualGainYuan: number; // 年均收益 (元)
  arbitrageRevenueYuan: number; // 峰谷套利收益
  capacityLeasingRevenueYuan: number; // 容量租赁/辅助服务收益
  priorityRank: number; // 寻优推荐排名
}

// F4: 储能收益测算器参数与结果 (交互式重算)
export interface StorageCalculatorParams {
  storagePowerMw: number; // 储能功率 MW (0.5 ~ 100)
  storageCapacityMwh: number; // 储能容量 MWh (1 ~ 400)
  unitCostYuanPerWh: number; // 系统单位造价 元/Wh (0.6 ~ 1.4)
  peakValleySpreadYuan: number; // 峰谷电价差 元/kWh (0.4 ~ 1.5)
  dailyCycles: number; // 日均充放循环次数 (1 ~ 2.5)
  annualOperatingDays: number; // 年运行天数 (300 ~ 365)
  efficiencyPct: number; // 综合系统充放 RTE % (82 ~ 92)
  capacityRentalPriceYuanPerKwYear: number; // 容量租赁单价 元/kW·年 (0 ~ 300)
  ancillaryServiceGainYuan: number; // 辅助服务/调频年收益 (元)
  discountRatePct: number; // 贴现率 % (default 6.5)
  projectLifespanYears: number; // 运营周期 年 (10 ~ 15)
}

export interface StorageCalculatorResult {
  totalCapExYuan: number; // 初始总投资
  annualArbitrageYuan: number; // 年峰谷套利净收益
  annualRentalYuan: number; // 年容量租赁收益
  annualTotalRevenueYuan: number; // 年综合总收益
  annualOpexYuan: number; // 年运维成本 (按CapEx 1.5%)
  annualNetProfitYuan: number; // 年净收益
  paybackYears: number; // 静态回收期 (年)
  irrPct: number; // 全投资内部收益率 %
  tenYearCashFlow: {
    year: number;
    revenue: number;
    opex: number;
    netCash: number;
    cumulativeCash: number;
  }[];
}

// F5: 数据中心 PUE 对标与节能诊断
export interface DataCenterPueItem {
  id: string;
  facilityName: string;
  operator: string;
  cabinetCount: number; // 机柜数量
  itLoadMw: number; // IT额定负荷 MW
  currentAnnualPue: number; // 当前年度平均 PUE
  policyBenchmarkPue: number; // 地方政策合规准入红线 PUE (如 1.25)
  excessPueGap: number; // 超出红线差距
  annualPowerConsumptionKwh: number; // 年总耗电量 (kWh)
  wastedPowerKwh: number; // 超额能耗浪费电量 (kWh)
  wastedElectricityBillYuan: number; // 年超额电费支出 (元)
  coolingRetrofitScheme: string; // 推荐节能技改方案
  retrofitCostYuan: number; // 改造预算 (元)
  retrofitIrrPct: number; // 技改 IRR %
  complianceRiskLevel: 'HIGH_PENALTY' | 'MEDIUM_WARNING' | 'COMPLIANT';
}

// F7: 标讯雷达抓取条目
export interface TenderRadarNotice {
  id: string;
  tenderNo: string;
  title: string;
  domain: OpportunityDomain;
  purchaserName: string; // 招标人 / 业主
  publishDate: string;
  closingDate: string;
  estimatedBudgetYuan: number; // 招标预算 (元)
  region: string;
  matchScore: number; // 业务匹配度评分 (0~100)
  keyRequirements: string;
  tenderStatus: 'BIDDING' | 'UPCOMING' | 'CLOSED';
  triggeredCardId?: string;
}

// F8: 政策与分时电价变动事件
export interface PolicyAlertItem {
  id: string;
  policyNo: string;
  title: string;
  issuingAuthority: string; // 发文机构 (如 江苏省发改委)
  effectiveDate: string;
  category: 'PRICE_SPREAD' | 'STORAGE_SUBSIDY' | 'PUE_REGULATION' | 'GREEN_POWER';
  summary: string;
  spreadChangeNote: string; // 如 "尖峰上浮20%，峰谷价差由0.72元扩大至0.87元/kWh"
  impactedStationsCount: number; // 受影响存量站点数
  autoRecalculatedOpportunitiesCount: number; // 自动重算生成商机数
  isUrgent: boolean;
}

// F9: Target List 与 ICP 评分实体
export interface TargetAccountItem {
  id: string;
  companyName: string;
  domain: OpportunityDomain;
  industry: string;
  tierRank: 'S' | 'A' | 'B' | 'C';
  totalIcpScore: number; // 0~100
  scoreBreakdown: {
    scaleScore: number; // 资产规模与负荷 (30分)
    priceSensitivityScore: number; // 用电痛点与电价敏感度 (25分)
    carbonTargetScore: number; // 绿电/ESG政策紧迫度 (20分)
    budgetDecisionScore: number; // 采购决策周期与预算实力 (25分)
  };
  keyDecisionMaker: string;
  recommendVisitReason: string;
  createdCardsCount: number;
}

// F10: 碳与绿证收益计算实体
export interface CarbonAssetMetric {
  id: string;
  targetName: string;
  domain: OpportunityDomain;
  annualCleanEnergyMwh: number;
  gecPotentialCertificates: number; // 可核发绿证张数 (1张=1MWh)
  gecUnitPriceYuan: number; // 绿证单价 (元/张)
  annualGecRevenueYuan: number; // 绿证年收益 (元)
  co2ReductionTons: number; // 年减排吨数
  ccerPotentialRevenueYuan: number; // CCER 交易潜力 (元)
  esgRatingBoost: string;
}

// F11: 行为意向埋点事件
export interface BehaviorTrackEvent {
  id: string;
  timestamp: string;
  clientAccountId: string;
  clientOrgName: string;
  userRole: string; // 如 "计划部副部长" / "设备运维主管"
  actionType:
    | 'USE_CALCULATOR' // 调整储能测算器参数
    | 'VIEW_REPORT' // 查阅电站诊断报告
    | 'DOWNLOAD_ONEPAGER' // 下载立项一页纸
    | 'FORWARD_SHARED' // 转发分享材料给领导
    | 'RETRY_CALCULATION'; // 多次深度重算
  targetProject: string;
  durationSeconds: number;
  weightPoint: number;
  details: string;
}

// F12: 客户行为意向评分画像
export interface ClientIntentProfile {
  clientOrgName: string;
  contactPerson: string;
  domain: OpportunityDomain;
  activeScore: number; // 0~100 行为活跃分
  scoreSurgeTrend: 'SURGING' | 'STEADY' | 'COOLING'; // 跃升 / 平稳 / 降温
  lastActiveTime: string;
  recent7DaysEventsCount: number;
  interestedSolutions: string[];
  recommendedOutreachStrategy: string;
}

// F13: 内线弹药库（给领导看的一页纸汇报材料数据）
export interface ChampionOnepagerData {
  cardId: string;
  title: string;
  stationName: string;
  clientOrgName: string;
  domain: OpportunityDomain;
  decisionRole: string; // 汇报受众角色 (如 "常务副总经理 / 集团计划投资部主任")
  executiveSummary: string; // 30秒电梯演说
  currentPainData: {
    metric: string;
    actualValue: string;
    gapVsStandard: string;
    annualFinancialLoss: string;
  };
  investmentAndReturn: {
    recommendedCapEx: string;
    irrPct: string;
    paybackYears: string;
    tenYearCumulativeNetCash: string;
  };
  implementationRoadmap: {
    phase: string;
    timeframe: string;
    deliverable: string;
  }[];
  riskMitigationAndSafety: string[];
  faqForLeadership: {
    question: string;
    answer: string;
  }[];
}

// 引擎整体统计指标 (北极星指标与大盘看板)
export interface OpportunityEngineSummary {
  northStarMonthlyCardsCount: number; // 北极星指标：月度有效商机卡片生成数
  northStarMonthlyCardsGrowthPct: number;
  totalAssetsCoveredMw: number; // 纳管资产总规模 (MW/机柜)
  totalPipelineValueYuan: number; // 挖掘商机年化总增收/节费潜力 (元/年)
  activeFollowingCardsCount: number; // 销售跟进中卡片数
  wonDealsValueYuan: number; // 已落成立项累计金额 (元)
  overallConversionRatePct: number; // 卡片到立项转化率 %
  avgIrrPct: number; // 平均测算 IRR %
  avgPaybackYears: number; // 平均回收期 (年)
}

// 运行数据诊断与测算自定义规则配置实体
export interface CalculationRuleConfig {
  id: string;
  ruleCode: string;
  ruleName: string;
  domain: OpportunityDomain | 'all';
  domainLabel: string;
  category: 'STORAGE_ECONOMICS' | 'PV_PR_GAP' | 'MODULE_WARRANTY' | 'STORAGE_CAPACITY_SCAN' | 'PUE_BENCHMARK';
  categoryLabel: string;
  targetMetric: string; // 测算核心指标
  triggerCondition: string; // 触发商机门槛逻辑
  thresholdValue: number; // 关键数值阈值
  thresholdUnit: string; // 阈值单位 (% / 年 / 元/kWh)
  benchmarkReference: string; // 对标基准来源
  algorithmFormula: string; // 测算模型与算法公式简述
  parameters: {
    name: string;
    key: string;
    value: number;
    unit: string;
    description: string;
  }[];
  cooldownDays: number; // 去抖冷却期 (天)
  autoTriggerCard: boolean; // 是否自动触发商机卡片
  priority: 'P1' | 'P2' | 'P3';
  isEnabled: boolean;
  lastModified: string;
}

