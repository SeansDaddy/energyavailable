// 性能工况 - 灵活质保工况与SOH衰减数据类型定义

/**
 * 1. 合同工况（基准工况）定义
 */
export interface ContractBaselineCondition {
  siteId: string;
  contractNo: string;
  warrantyStartDate: string; // 质保起始日期, e.g. "2024-01-01"
  warrantyEndDate: string; // 质保终止日期, e.g. "2033-12-31"
  warrantyYears: number; // 质保年限, e.g. 10
  ratedEnergyMwh: number; // 额定装机能量, e.g. 20.0 MWh
  ratedPowerMw: number; // 额定功率, e.g. 10.0 MW
  annualBaselineEfc: number; // 基准年等效全充放循环次数 (次/年), e.g. 365
  dailyBaselineEfc: number; // 基准日满充循环次数, e.g. 1.0
  maxCrate: number; // 基准最大充放电倍率, e.g. 0.50 C
  maxDodPct: number; // 基准充放电深度 (DOD %), e.g. 90.0
  baselineTempMin: number; // 基准工作温度下限 ℃, e.g. 10.0
  baselineTempAvg: number; // 基准设计平均工作温度 ℃, e.g. 25.0
  baselineTempMax: number; // 基准允许最高工作温度上限 ℃, e.g. 35.0
  annualEnergyThroughputLimitMwh: number; // 年度累计放电能量限额 (MWh), e.g. 7300 MWh
  baselineRestSocLimitPct: number; // 基准静置SOC上限 (%), e.g. 80.0
  plannedAvgSocPct?: number; // 合同规划平均SOC (%), e.g. 50.0%
  finalGuaranteedSoh: number; // 质保期终了SOH保证值 (%), e.g. 80.0
  lastModified?: string;
  sourceType: 'TEMPLATE_IMPORT' | 'MANUAL_INPUT' | 'DEFAULT';
}

/**
 * 2. SOH 基准衰减曲线打点 (年度保证值)
 */
export interface SohBaselineCurvePoint {
  year: number; // 0, 1, 2, ..., 10
  guaranteedSoh: number; // % 如 100.0, 97.2, 94.6, 92.2, 90.0, 88.0, 86.2, 84.5, 82.9, 81.4, 80.0
  cumulativeCycles: number; // 累计基准等效循环
  cumulativeThroughputMwh: number; // 累计基准能量吞吐 MWh
  description?: string;
}

/**
 * 3. 电池 PACK 级原始工况数据记录 (从质保工况日志解析)
 */
export interface PackConditionRecord {
  id: string;
  timestamp: string;
  packId: string;
  packCode: string; // e.g. "PACK-01"
  clusterId: string; // e.g. "Cluster-A"
  voltageV: number;
  currentA: number;
  cRate: number; // 实际倍率
  maxTemp: number; // ℃
  minTemp: number; // ℃
  avgTemp: number; // ℃
  soc: number; // %
  throughputAh: number;
  energyKwh: number;
  soh: number; // %
  isOverCondition: boolean; // 是否超工况
  overReason?: string; // 超工况类型: 超温 / 超倍率 / 超深DOD
}

/**
 * 质保工况数据日志文件元信息
 */
export interface WarrantyLogFileSummary {
  fileName: string;
  fileSize: string;
  uploadTime: string;
  rowCount: number;
  timeSpan: string;
  packCount: number;
  samplingIntervalSec: number;
  status: 'PARSED' | 'PARSING' | 'ERROR';
  metricsSummary: {
    totalEnergyMwh: number;
    avgTemp: number;
    maxTemp: number;
    maxCrate: number;
    avgDeltaSoc: number;
    overConditionCount: number;
  };
}

/**
 * 4. 换算后的站级日工况数据 (包含超工况计算)
 */
export interface StationDailyCondition {
  date: string; // e.g. "2026-08-01"
  siteId: string;
  actualThroughputMwh: number; // 实际放电能量吞吐 MWh
  actualEfc: number; // 实际等效全充放循环 EFC (次)
  baselineEfc: number; // 基准 EFC (次)
  overEfc: number; // 超额 EFC 次数 = max(0, actualEfc - baselineEfc)
  baselineThroughputMwh: number; // 基准能量吞吐
  overThroughputMwh: number; // 超额能量吞吐
  avgTemp: number; // 站级平均工作温度 ℃
  maxTemp: number; // 站级极端最高温度 ℃
  baselineTempMax: number; // 基准最高允许工作温度 (35℃)
  overTempDegreeHours: number; // 超温度时 ℃·h (超出上限部分积分)
  overTempHours: number; // 超温小时数 h
  maxCrate: number; // 站级峰值充放电倍率 C
  baselineCrate: number; // 基准倍率 (0.50 C)
  overCrateMwh: number; // 超倍率区间的能量吞吐量 MWh
  avgDod: number; // 实际放电深度 %
  baselineDod: number; // 基准 DOD %
  deltaSoc: number; // 簇间/Pack间最大不均衡度 %
  overConditionIndex: number; // 综合超工况指数 (0-100, >30为轻度超, >60为严重超)
  isOverCondition: boolean;
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'EXCEEDED';
  equivalentSohLossPct: number; // 当日等效 SOH 额外损耗 (算法折算 %)

  // 核心设备工况数据 (日充放电倍率、日电池PACK平均SOC、日系统运行时间、日循环次数、日DOD、充放电电量)
  dailyCrate: number; // 日充放电倍率 C (平均)
  dailyChargeCrate: number; // 日充电倍率 C
  dailyDischargeCrate: number; // 日放电倍率 C
  dailyPackAvgSoc: number; // 日电池PACK平均SOC (%)
  dailyOperatingHours: number; // 日系统运行时间 (小时 h)
  dailyCycles: number; // 日循环次数 (次 / FEC)
  dailyDod: number; // 日DOD (%)
  chargeEnergyMwh: number; // 日充电电量 MWh
  dischargeEnergyMwh: number; // 日放电电量 MWh
  totalEnergyMwh: number; // 日充放电电量合计 MWh
}

/**
 * 5. 站级月度工况统计数据 (表格展示)
 */
export interface StationMonthlyCondition {
  month: string; // e.g. "2026-08"
  daysCount: number;
  baselineEfc: number; // 月基准循环
  actualEfc: number; // 月实际循环
  overEfc: number; // 月超额循环
  baselineThroughputMwh: number; // 基准吞吐 MWh
  actualThroughputMwh: number; // 实际吞吐 MWh
  overThroughputMwh: number; // 超额吞吐 MWh
  avgTemp: number; // 月均温度 ℃
  maxTemp: number; // 月峰值温度 ℃
  overTempHours: number; // 累计超温时长 h
  overTempDegreeHours: number; // 累计超温度时 ℃·h
  maxCrate: number; // 月峰值倍率
  overCrateMwh: number; // 超倍率吞吐 MWh
  overConditionIndex: number; // 综合超工况偏离度指数 %
  complianceRate: number; // 工况合规履约率 %
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED';

  // 设备工况月度汇总 (日充放电倍率、日电池PACK平均SOC、日系统运行时间、日循环次数、日DOD、充放电电量)
  avgDailyCrate: number; // 月均日充放电倍率 C
  avgDailyPackSoc: number; // 月均日电池PACK平均SOC (%)
  avgDailyOperatingHours: number; // 月均日系统运行时间 h
  totalCycles: number; // 月累计循环次数 次
  avgDailyDod: number; // 月均日DOD (%)
  totalChargeEnergyMwh: number; // 月累计充电电量 MWh
  totalDischargeEnergyMwh: number; // 月累计放电电量 MWh
  totalEnergyMwh: number; // 月充放电总电量 MWh
  dailyDetails: StationDailyCondition[];
}

/**
 * 6. 灵活质保 SOH 估算算法接口返回结果 (年度打点与曲线)
 */
export interface AnnualFlexibleSohPoint {
  year: number; // 0, 1, 2, ..., 10
  yearLabel: string; // "第0年(投运)", "第1年", ...
  date: string; // 年份对应日期节点
  baselineSoh: number; // SOH基准工况衰减值 (%)
  flexibleWarrantySoh: number; // 灵活质保工况SOH打点值 (%)
  deltaSoh: number; // 偏离差值 (flexible - baseline)
  isHistorical: boolean; // true = 实际历史实测打点, false = 算法根据当前超工况外推预测打点
  cumulativeCycles: number;
  cumulativeThroughputMwh: number;
  cumulativeOverPenaltyPct: number; // 累计超工况惩罚损耗 %
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface FlexibleWarrantySohResult {
  siteId: string;
  algorithmVersion: string; // e.g. "v3.4.2-FlexibleWarranty-Arrhenius-Fatigue"
  evaluatedAt: string;
  currentOperationYears: number; // 当前运营年数, e.g. 2.6
  currentBaselineSoh: number; // 当前基准保证 SOH
  currentFlexibleSoh: number; // 当前灵活质保估算打点 SOH
  sohMargin: number; // SOH 裕度 = flexible - baseline
  estimatedEndLifeSoh: number; // 预估10年质保终了 SOH
  guaranteedEndLifeSoh: number; // 合同承诺终了 SOH (80.0%)
  warrantyHealthStatus: 'HEALTHY' | 'MARGINAL_RISK' | 'OVER_WARRANTY_RISK';
  annualPoints: AnnualFlexibleSohPoint[];
  overConditionSummary: {
    totalExcessEfc: number;
    totalOverTempDegreeHours: number;
    totalOverCrateThroughputMwh: number;
    overallAccelerationFactor: number; // 加速老化因子
    extendedOrReducedWarrantyDays: number; // 灵活质保期折算增减天数 (天)
  };
}

/**
 * 7. 当前合同年超工况统计数据结构
 */
export interface ContractYearOverConditionSummary {
  siteId: string;
  contractNo: string;
  contractYear: number; // 当前第几合同年, e.g. 3
  contractYearLabel: string; // e.g. "第3合同年 (2026年度)"
  startDate: string; // e.g. "2026-01-01"
  endDate: string; // e.g. "2026-12-31"
  elapsedDays: number; // 累计天数 e.g. 243
  totalDays: number; // 合同年度总天数 365
  progressPct: number; // 年度时间进度 %

  // 1. SOC 规划与实测对比
  contractPlannedSoc: number; // 合同规划SOC (%), e.g. 50.0%
  actualAvgSoc: number; // 实际平均SOC (%), e.g. 52.8%
  isSocExceeded: boolean; // actualAvgSoc > contractPlannedSoc
  socDiff: number; // actualAvgSoc - contractPlannedSoc

  // 2. 超限总频次
  totalOverLimitCount: number; // 超限总次数 (超温 + 超倍率 + 超DOD + 超循环 + 超SOC规划)
  isOverLimitExceeded: boolean; // totalOverLimitCount > 0

  // 3. 标红规则触发判定: 超限次数 > 0 或者 平均SOC > 合同规划SOC
  isRedAlert: boolean; // totalOverLimitCount > 0 || actualAvgSoc > contractPlannedSoc
  alertMessage?: string;

  // 4. 各细分维度超限统计
  tempOverLimitCount: number; // 超温超限天数/次数
  tempMaxRecorded: number; // 实测最高温
  tempThreshold: number; // 合同上限温
  totalOverTempDegreeHours: number; // 累计超温度时 ℃·h
  totalOverTempHours: number; // 累计超温时长 h

  crateOverLimitCount: number; // 超倍率超限天数/次数
  crateMaxRecorded: number; // 实测最高倍率
  crateThreshold: number; // 合同上限倍率
  crateOverMwh: number; // 超倍率电量 MWh

  dodOverLimitCount: number; // 超DOD超限天数/次数
  dodMaxRecorded: number; // 实测最高DOD
  dodThreshold: number; // 合同上限DOD

  cyclesOverLimitDays: number; // 超循环天数
  cumulativeActualCycles: number; // 年度累计实际循环 EFC
  plannedAnnualCycles: number; // 合同年度规划循环 EFC

  throughputActualMwh: number; // 实际累计吞吐 MWh
  throughputLimitMwh: number; // 合同累计额度 MWh

  socOverLimitDays: number; // 单日平均SOC超规划天数

  // 5. 设备 6 项核心工况指标年度均值与累计
  annualAvgDailyCrate: number; // 年均日充放电倍率 C
  annualAvgPackSoc: number; // 年均日PACK平均SOC %
  annualAvgOperatingHours: number; // 年均日运行时间 h
  annualTotalCycles: number; // 年累计循环次数
  annualAvgDod: number; // 年均DOD %
  annualTotalChargeMwh: number; // 年累计充电量 MWh
  annualTotalDischargeMwh: number; // 年累计放电量 MWh
  annualTotalEnergyMwh: number; // 年充放电总能量 MWh

  // 6. 合同年月度拆解列表
  monthlyBreakdown: {
    month: string;
    daysCount: number;
    overLimitCount: number;
    avgSoc: number;
    isSocExceeded: boolean;
    isOverLimit: boolean;
    isRed: boolean;
    maxTemp: number;
    maxCrate: number;
    actualCycles: number;
    plannedCycles: number;
    throughputMwh: number;
  }[];

  // 7. 超限历史事件明细
  overLimitEvents: {
    id: string;
    date: string;
    type: 'TEMP' | 'CRATE' | 'DOD' | 'SOC' | 'CYCLE';
    typeName: string;
    recordedValue: string;
    contractLimit: string;
    deviation: string;
    impactDescription: string;
    severity: 'WARNING' | 'CRITICAL';
  }[];
}

/**
 * 8. 临时手动评估年底灵活质保 SOH 数据结构
 * 依据: 按合同工况的年底预期SOH，结合合同年开始日期至今日的实际超工况运行情况进行SOH扣减
 */
export interface InterimYearEndSohAssessment {
  assessmentId: string;
  siteId: string;
  contractNo: string;
  contractYear: number; // 当前第几合同年 (e.g. 3)
  contractYearLabel: string; // e.g. "第3合同年 (2026年度)"
  startDate: string; // 2026-01-01
  todayDate: string; // 2026-08-20
  yearEndDate: string; // 2026-12-31
  elapsedDays: number; // 243
  remainingDays: number; // 122
  progressPct: number; // 66.6%

  // 合同工况基准年底预期 SOH
  contractBaselineExpectedYearEndSoh: number; // 保证值 (e.g. 92.20%)

  // 合同年开始至今日实际超工况累计运行情况
  actualOverConditionSummary: {
    totalOverLimitCount: number; // 累计超限次数 (次)
    tempOverLimitDays: number; // 超温天数
    accumulatedTempDegreeHours: number; // 累计超温度时 (℃·h)
    crateOverLimitDays: number; // 超倍率天数
    accumulatedOverCrateMwh: number; // 累计超倍率能量 (MWh)
    excessCycles: number; // 累计超额循环 (EFC)
    dodOverLimitDays: number; // 超深DOD天数
    actualAvgSoc: number; // 实际平均SOC (%)
    contractPlannedSoc: number; // 合同规划SOC (%)
    socDiff: number; // 实际平均SOC超规划偏离幅度 (%)
  };

  // 算法多应力折损扣减分解 (SOH扣减模型)
  deductionBreakdown: {
    tempStressDeductionPct: number; // 超温热应力加速衰减扣减 %
    cratePolarizationDeductionPct: number; // 充放电超倍率极化损伤扣减 %
    highSocCalendarDeductionPct: number; // 高SOC日历析锂老化扣减 %
    excessCyclesFatigueDeductionPct: number; // 超额循环机械相变疲劳扣减 %
    remainingDaysProjectedDeductionPct: number; // 剩余天数预期折损扣减 %
    totalDeductionPct: number; // 综合总扣减折损 %
  };

  // 临时评估结论
  interimEvaluatedYearEndSoh: number; // 年底灵活质保SOH评估值 = baseline - totalDeduction (%)
  sohMarginVsBaseline: number; // 评估裕度 (evaluated - baseline, 负值表示透支风险)
  warrantyHealthStatus: 'HEALTHY' | 'MARGINAL_RISK' | 'CRITICAL_RISK';
  warrantyHealthLabel: string;

  // 运维干预调优策略预设
  serviceInterventionMode: 'CURRENT_INERTIA' | 'CONSERVATIVE_PROTECT' | 'AGGRESSIVE_UTILIZATION';

  // 提前加强质保服务的具体处置建议
  proactiveServiceRecommendations: string[];

  evaluatedAt: string;
  evaluator: string;
}

/**
 * 9. 下一年工况计划、SOH预测与灵活质保服务报价测算数据结构
 */
export interface NextYearConditionPlan {
  planId: string;
  planName: string; // 方案名称: 保守保全型 / 标称基准型 / 高收益调频型 / 自定义
  planType: 'CONSERVATIVE' | 'BASELINE' | 'AGGRESSIVE' | 'CUSTOM';
  targetContractYear: number; // e.g. 4
  targetYearLabel: string; // e.g. "第4合同年 (2027年度)"
  
  // 计划工况参数
  plannedAnnualCycles: number; // 计划年等效循环 (次/年, e.g. 365, 420, 500)
  plannedDailyCycles: number; // 计划日均循环 (次/日, e.g. 1.0, 1.15, 1.37)
  plannedMaxCrate: number; // 计划充放电倍率 (C, e.g. 0.50, 0.60, 0.75)
  plannedMaxTemp: number; // 计划工作温度上限 (℃, e.g. 33.0, 35.0, 38.0)
  plannedAvgTemp: number; // 计划设计平均工作温度 (℃, e.g. 25.0)
  plannedMaxDod: number; // 计划放电深度 (DOD %, e.g. 85.0%, 90.0%, 95.0%)
  plannedAvgSoc: number; // 计划平均工作/静置SOC (%, e.g. 48.0%, 50.0%, 55.0%)
  plannedThroughputMwh: number; // 计划年放电吞吐量 (MWh)

  // 基于计划工况评估下一年年底灵活质保 SOH
  baselineYearEndSoh: number; // 第4年基准SOH保证值 (90.00%)
  projectedYearEndFlexibleSoh: number; // 基于计划工况评估的年底灵活质保SOH (%)
  projectedSohDelta: number; // SOH 裕度/偏差 (projected - baseline)
  accelerationFactor: number; // 加速老化加权因子 (x)

  // 综合灵活质保SOH服务报价模型 (万元/年)
  servicePricing: {
    baseServiceFeeWan: number; // 基础智能运维与核心质保服务费
    excessStressSurchargeWan: number; // 灵活质保超工况风险保障附加费
    extendedCapacityReserveWan: number; // 衰减容量维护及备件调优储备金
    totalAnnualServiceFeeWan: number; // 综合灵活质保服务总报价 (万元/年)
    customerExpectedRevenueWan: number; // 客户在计划工况下的电力现货/套利预期商业收益 (万元/年)
    customerNetGainWan: number; // 客户扣除质保服务费后的净增益 (万元/年)
    costBenefitRatio: number; // 投入产出比
  };

  // 计划工况确定状态
  isConfirmedAsOfficialPlan: boolean;
  confirmedAt?: string;
  confirmedBy?: string;
}


