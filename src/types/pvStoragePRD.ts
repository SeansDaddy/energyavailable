// 分布式光储充领域 · 机会点挖掘与 AI 光储运营分析
// 现网数据底座与特性需求类型定义 (M-01 ~ M-08, O-01 ~ O-11)

export type GlobalRegion = 'China' | 'Europe' | 'AsiaPacific' | 'LatinAmerica' | 'MiddleEastAfrica';

export type OnboardingStatus = 'OPENED' | 'EVALUATING' | 'CLOSED_UNSUBSCRIBED';

export type ReadinessState = 'READY' | 'NEED_RETROFIT' | 'NOT_ELIGIBLE';

export type TariffMode = 'TOU' | 'DYNAMIC' | 'FLAT';

export type StorageWorkMode = 'TOU' | 'MAX_SELF_CONSUMPTION' | 'FIXED_POWER';

export type LoggerModel = 'SmartLogger3000' | 'SmartLogger5000B' | 'MGC5000B' | 'Other';

export type MeterModelType = 'HUAWEI_DDSU' | 'HUAWEI_DTSU' | 'THIRD_PARTY_CHINT' | 'THIRD_PARTY_ACREL';

// 8项约束条件校验项
export interface ConstraintCheckItem {
  id: string;
  name: string;
  category: 'HARDWARE' | 'SOFTWARE' | 'CONFIG' | 'DATA';
  required: string;
  actual: string;
  passed: boolean;
  blockReason?: string;
  fixGuidance?: string;
}

// 现网数据底座实体 (现网 757 站 / 全球 106 站样本)
export interface PvStorageSiteProfile {
  id: string;
  siteCode: string;
  siteName: string;
  country: string;
  region: GlobalRegion;
  stationType: 'INDUSTRIAL_PARK' | 'COMMERCIAL_BUILDING' | 'LOGISTICS_CENTER' | 'MANUFACTURING_FACTORY';
  gridConnectionDate: string;
  
  // 装机容量
  pvCapacityKw: number;
  storageCapacityKwh: number;
  storagePowerKw: number;
  transformerCapacityKva: number;
  transformerCount: number; // 进线与变压器数
  incomerLinesCount: number;

  // 组网与设备
  loggerModel: LoggerModel;
  loggerVersion: string;
  isLatestLoggerVersion: boolean;
  loggerCount: number;
  meterModel: MeterModelType;
  meterCount: number;
  isHuaweiMeter: boolean;

  // 配置数据
  tariffMode: TariffMode;
  isTariffConfigured: boolean;
  peakPriceLocal: number; // 峰电价
  valleyPriceLocal: number; // 谷电价
  peakValleySpreadLocal: number; // 峰谷价差
  currencyCode: 'CNY' | 'EUR' | 'USD' | 'JPY';
  demandConfigType: 'CAPACITY' | 'MAX_DEMAND';
  contractDemandKw?: number;
  storageWorkMode: StorageWorkMode;

  // 运行数据统计 (近30天)
  historicalDays: number;
  dailyAvgPvGenKwh: number;
  dailyAvgLoadKwh: number;
  dailyAvgCurtailmentKwh: number; // 弃光量
  storageUtilizationRate: number; // 储能利用率 %
  peakLoadKw: number;
  storageCycleCountPerDay: number;

  // 状态数据
  onboardingStatus: OnboardingStatus;
  onboardingDate?: string;
  closedReason?: string;
  evaluatingStage?: string;
  evaluatingDays?: number;

  // 数据质量评估 (M-07)
  dataQualityScore: number; // 0 ~ 100
  isDataValidForMining: boolean;
  dataQualityIssues: string[]; // '断链' | '跳变' | '长期零值' | '开通不足一月'

  // 开通性 8 项约束核算 (M-01)
  readinessState: ReadinessState;
  constraints: ConstraintCheckItem[];
  missingGaps: string[]; // 具体的缺口项，如 "数采版本过低", "电价未配置"

  // 机会分级与作战沙盘 (M-03 全球统一模型)
  opportunityTier?: 'P0' | 'P1' | 'P2';
  normalizedRelativeSpread: number; // 相对价差 (峰谷价差 / 平均电价)
  normalizedAnnualGainEurPerKwh: number; // 统一折算为 €/kWh/年
  annualGainLocalEstimated: number; // 本币年增收预估
  paybackYearsEstimated: number; // 预估回本周期
  aiGainLiftPercentEstimated: number; // 预估提升率区间下限 ~ 上限
  aiGainLiftPercentMax: number;

  // 收益核算对比 (O-05 全口径收益)
  baselineMonthlyProfitLocal?: number;
  aiMonthlyProfitLocal?: number;
  profitLiftRate?: number; // 收益提升率 %
  profitBreakdown?: {
    touArbitrageLocal: number; // 峰谷套利收益 (占比约 94%)
    pvSelfConsumptionLocal: number; // 光伏自发自用增量
    demandSavingLocal: number; // 需量削峰增量 (部分站点需量增量可能为负)
    feedInTariffLocal: number; // 上网收益
  };

  // 异常诊断打标 (O-06)
  anomalyTags: AnomalyTag[];
  anomalyDiagnosis?: string;
  suggestedAction?: string;
}

export type AnomalyTag =
  | 'NEGATIVE_DEMAND'
  | 'PROFIT_MUTATION'
  | 'ABNORMAL_HIGH_DEMAND'
  | 'ZERO_GAIN'
  | 'DATA_JUMP'
  | 'TARIFF_MISCONFIG';

// 8 项约束条件漏斗聚合看板数据 (M-02)
export interface ConstraintFunnelSummary {
  totalSites: number; // 757
  hardwareEligibleSites: number; // 480
  fullyEligibleSites: number; // 16
  currentlyOpenedSites: number; // 26 (中国区已开通)
  globalOpenedSites: number; // 106 (全球已开通)
  globalEvaluatingSites: number; // 33
  gapsBreakdown: {
    gapType: string;
    gapLabel: string;
    siteCount: number;
    percentage: number;
    fixedCountThisMonth: number;
  }[];
}

// 9步线上化开通工单旅程 (O-01)
export type OnboardingJourneyStage = 
  | 'STAGE_1_APPLY' // 1. 意向申请与留资
  | 'STAGE_2_HEALTH_CHECK' // 2. 8项约束自动体检
  | 'STAGE_3_TARIFF_CONFIRM' // 3. 运营电价与需量复核
  | 'STAGE_4_CUSTOMER_AUTH' // 4. 客户/业主授权签署
  | 'STAGE_5_OP_AUDIT' // 5. 运营团队合规审核
  | 'STAGE_6_INVITE_CODE' // 6. 生成并绑定激活邀请码
  | 'STAGE_7_DISPATCH_CONFIG' // 7. 数采参数远程下发
  | 'STAGE_8_AI_ACTIVE' // 8. AI 算法上线闭环验证
  | 'STAGE_9_WEEK1_ACCEPT'; // 9. 首周收益验收归档

export interface OnboardingJourneyTicket {
  ticketId: string;
  siteId: string;
  siteName: string;
  country: string;
  region: GlobalRegion;
  capacityStr: string;
  currentStage: OnboardingJourneyStage;
  currentStageLabel: string;
  currentRole: 'OP_TEAM' | 'CUSTOMER_REP' | 'SRE_DEV' | 'INSTALLER';
  roleLabel: string;
  stayDays: number;
  isOverdue: boolean;
  benchmarkDaysLimit: number;
  createdAt: string;
  updatedAt: string;
  stageHistory: {
    stage: OnboardingJourneyStage;
    stageLabel: string;
    completedAt?: string;
    operator: string;
    notes?: string;
  }[];
}

// 标杆案例卡片 (O-11)
export interface BenchmarkCaseCard {
  id: string;
  siteName: string;
  region: GlobalRegion;
  country: string;
  industry: string;
  pvScale: string;
  storageScale: string;
  annualGainLocal: string;
  annualGainEur: string;
  liftRatePercent: number;
  paybackPeriodYears: number;
  touArbitragePercent: number;
  demandSavingYuanPerMonth: string;
  highlightFeatures: string[];
  ownerOffice: string;
}
