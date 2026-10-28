// 机会点挖掘与商业化价值分析 类型定义

export type OpportunityFunnelStage =
  | 'DISCOVERED' // 发现与触发
  | 'EVALUATING' // 方案评估中
  | 'CLIENT_PITCHED' // 客户推介沟通
  | 'NEGOTIATION' // 商务谈判竞价
  | 'CONTRACTED' // 签约落地履约
  | 'CLOSED'; // 归档复盘

export type OpportunityCategory =
  | 'EQUIPMENT_HEALTH_RUL' // 设备健康与寿命预测
  | 'LOSS_RETROFIT' // 损失诊断与技改评估
  | 'DISPATCH_SPARE_PARTS' // 智能调度与备件优化
  | 'COMMERCIAL_LEAD' // 核心商机线索生成
  | 'ASSET_VALUATION' // 资产尽调评级与交易估值
  | 'CARBON_GREEN_CERT' // 功率预测与绿证碳资产
  | 'SAFETY_COMPLIANCE' // 安全合规与零碳认证
  | 'DATA_API'; // 行业数据API与指数产品

// 1. 商机线索实体
export interface OpportunityLead {
  id: string;
  leadNo: string; // 如 "OPP-2026-0842"
  title: string;
  category: OpportunityCategory;
  categoryLabel: string;
  siteId: string;
  siteName: string;
  clientName: string;
  region: string;
  stage: OpportunityFunnelStage;
  stageLabel: string;
  triggerReason: string; // 触发机理
  estimatedValueYuan: number; // 预估商业价值/合同额（元）
  probabilityPct: number; // 预期赢单转化概率 %
  weightedValueYuan: number; // 加权预期规模（元）
  createdAt: string;
  dueDate: string;
  owner: string; // 责任跟进人
  syncStatus: 'SYNCED' | 'PENDING' | 'FAILED'; // 自动同步状态
  syncTarget: string; // 同步目标平台
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  riskAlert?: string; // 漏斗阶段停滞或流失预警
  technicalDiagnosis: {
    currentMetric: string;
    potentialGain: string;
    paybackMonths: number;
    roiPct: number;
  };
  closedLoopResult?: {
    actualValueYuan: number;
    actualRteGainPct: number;
    actualPaybackMonths: number;
    feedbackScore: number;
    completedAt: string;
  };
}

// 2. 设备健康评分与寿命预测机会点
export interface HealthPredictionOpportunity {
  siteId: string;
  siteName: string;
  deviceType: string;
  currentHealthScore: number;
  predictedRulMonths: number; // 预测剩余寿命 (月)
  optimalSwapDate: string; // 最佳经济置换窗口
  earlyWarningDays: number;
  preventiveLossSavingYuan: number; // 提前预防停机节约金额
  recommendedAction: string;
  cellDegradationRateAnnual: number;
}

// 3. 损失诊断与技改评估
export interface LossRetrofitOpportunity {
  id: string;
  siteName: string;
  lossType: 'BUSBAR_THERMAL' | 'PUMP_COOLING' | 'LOW_LOAD_EFF' | 'PACK_MISMATCH';
  lossTypeLabel: string;
  currentAnnualLossMwh: number;
  lossCostYuanPerYear: number;
  retrofitScheme: string; // 技改方案
  retrofitInvestmentYuan: number; // 技改投资额
  paybackYears: number; // 静态回收期 (年)
  fiveYearNetBenefitYuan: number; // 5年净收益
  roiPct: number; // 投资回报率 %
}

// 4. 资产尽调评级与估值
export interface AssetValuationOpportunity {
  siteId: string;
  siteName: string;
  rating: 'AAA' | 'AA+' | 'AA' | 'A' | 'BBB';
  ratingLabel: string;
  capacityMw: number;
  valuationMlnYuan: number; // 资产估值 (百万元)
  irrPct: number; // 预期全投资内部收益率 %
  remainingLifeYears: number;
  dueDiligenceSummary: string;
  transactionAdvice: string;
}

// 5. 功率预测与绿证碳资产
export interface CarbonGreenCertOpportunity {
  siteId: string;
  siteName: string;
  annualGreenPowerMwh: number;
  potentialGecCount: number; // 潜在可核发绿证张数 (1张=1MWh)
  gecRevenueYuan: number; // 绿证收益测算 (元)
  ccerEmissionReductionTons: number; // CCER 减排量 (吨CO2)
  ccerRevenueYuan: number; // 碳配额收益 (元)
  forecastAccuracyPct: number; // 日前预测精度 %
  imbalancePenaltySavingYuan: number; // 考核免罚收益 (元)
}

// 6. 安全合规与零碳认证
export interface SafetyComplianceOpportunity {
  siteId: string;
  siteName: string;
  standardName: string; // 如 GB 51048 / NFPA 855
  complianceScore: number; // 0-100
  gapItemCount: number;
  zeroCarbonReadiness: 'READY' | 'MINOR_GAP' | 'MAJOR_RETROFIT';
  insurancePremiumSavingPct: number; // 风险减免保费折扣率 %
  suggestedRemediation: string;
}

// 7. 行业数据API与指数产品
export interface DataApiProduct {
  id: string;
  apiName: string;
  apiEndpoint: string;
  category: string;
  subscribersCount: number;
  callVolumeMonthly: number;
  pricing: string;
  annualRevenueYuan: number;
  status: 'ACTIVE' | 'BETA';
}

// 8. 挖掘规则运营管理
export interface MiningRuleItem {
  id: string;
  ruleCode: string;
  ruleName: string;
  category: OpportunityCategory;
  categoryLabel: string;
  triggerCondition: string;
  thresholdValue: string;
  debounceCooldownDays: number; // 去抖冷却期 (天)
  estimatedAnnualLeads: number; // 年预期线索数
  conversionRateHistorical: number; // 历史赢单转化率 %
  isEnabled: boolean;
  priority: 'P1' | 'P2' | 'P3';
}

// 9. 效果闭环回填
export interface ClosedLoopEffectRecord {
  id: string;
  leadNo: string;
  siteName: string;
  serviceItem: string;
  predictedBenefit: string;
  actualBenefit: string;
  variancePct: number;
  modelFeedbackAccuracy: number;
  backfilledAt: string;
  evaluator: string;
}

// 10. 运营预警与告警
export interface OpportunityWarningAlert {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  relatedLeadNo: string;
  siteName: string;
  alertReason: string;
  triggerTime: string;
  slaRemainingHours: number;
  handlingAdvice: string;
}

// 11. 机会点转换漏斗统计数据
export interface OpportunityFunnelSummary {
  totalLeads: number;
  totalPipelineValueYuan: number; // 漏斗总额
  weightedPipelineValueYuan: number; // 加权总额
  wonDealsValueYuan: number; // 签约落地总额
  overallConversionRatePct: number; // 综合转化率 %
  avgSalesCycleDays: number; // 平均销售周期 (天)
  stages: {
    stage: OpportunityFunnelStage;
    label: string;
    count: number;
    amountYuan: number;
    conversionFromPreviousPct: number;
  }[];
}
