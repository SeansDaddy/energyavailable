// 性能评估分析 数据类型定义

export type AdviceLevel = 'CRITICAL' | 'NORMAL' | 'OBSERVATION'; // 紧急 / 一般 / 观察

export interface PerformanceFactor {
  id: number; // 1 - 13
  name: string; // 影响因素
  impactAnalysis: string; // 影响分析
  category: '容量设计' | '策略与工况' | '一致性' | '热管理与环境' | '电气与损耗' | 'BMS与运维' | '电芯缺陷';
  weight: number; // 权重 % (可在线配置)
  thresholdName: string; // 监控指标名称
  unit: string;
  warningThreshold: number; // 预警阈值
  criticalThreshold: number; // 异常阈值
  operator: '>' | '<' | 'range';
  idealRange: string;
  currentValue: number;
  currentValueDisplay: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  isHit: boolean; // 是否命中影响因子
  hitReason?: string; // 命中深度追溯
}

export interface ModuleMetric {
  id: string;
  moduleCode: string; // e.g. M01-01
  cluster: string;
  voltageMaxV: number;
  voltageMinV: number;
  voltageDeltaMv: number; // 电压极差 mV
  currentRateC: number; // 充放电倍率 C
  actualCapacityAh: number; // 实际放电容量 Ah
  ratedCapacityAh: number;
  capacityRetentionPct: number; // 额定容量保持率 %
  dailyCycles: number; // 日均循环次数
  restSocPct: number; // 静置 SOC %
  aucScore: number; // AUC 工况利用率得分 0-100
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  abnormalReason?: string;
}

export interface CmuThermalRecord {
  cmuId: string;
  cmuCode: string;
  location: string; // 簇/层级位置
  cluster: string;
  currentTemp: number; // 当前温度 ℃
  maxTemp: number; // 最高温度 ℃
  minTemp: number; // 最低温度 ℃
  deltaT: number; // 温差 ℃
  ambientTemp: number; // 舱内/运行环境温度 ℃
  coolingMode: 'LIQUID_COOLING' | 'AIR_COOLING';
  thermalStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'OVERHEATED' | 'COOLING_DEFECT';
  thermalAdvice: string;
  hourlyTrends: {
    time: string;
    cmuTemp: number;
    ambientTemp: number;
    coolingPowerKw: number;
  }[];
}

export interface PackSohMetric {
  packId: string;
  packCode: string;
  cluster: string;
  soh: number; // %
  sohGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  capacityLossPct: number; // 容量累计衰减 %
  dcirMOhms: number; // 直流内阻 mΩ
  dcirGrowthPct: number; // 内阻较出厂增长 %
  coulombicEfficiency: number; // 库伦效率 %
  isStandard: boolean; // 是否达标 (SOH >= 90%)
  bottleneckImpact: string; // 短板制约影响分析
  historyTrend: {
    month: string;
    actualSoh: number;
    predictedSoh: number;
  }[];
}

export interface SocBalanceRecord {
  id: string;
  packCode: string;
  cluster: string;
  currentSoc: number; // %
  targetSoc: number; // %
  deltaSoc: number; // 不均衡度 %
  balanceType: 'SOFTWARE_ACTIVE' | 'SOFTWARE_PASSIVE' | 'MANUAL_ONSITE';
  balanceTypeLabel: string;
  triggerCondition: string;
  executionStatus: 'BALANCED' | 'BALANCING' | 'PENDING_MANUAL';
  lastExecutedTime: string;
  gainDescription: string;
  beforeDeltaSoc: number;
  afterDeltaSoc: number;
}

export interface DefectActionRecord {
  id: string;
  defectType: 'LOW_EFFICIENCY_DIAG' | 'ALARM_CLEAR' | 'HARDWARE_REPLACE';
  defectTypeLabel: string;
  title: string;
  targetDevice: string;
  triggerAlarmOrCode: string;
  beforeMetric: string;
  afterMetric: string;
  efficiencyGain: string;
  completedAt: string;
  operator: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FOLLOW_UP';
  residualIssues: string[]; // 遗留问题清单
}

export interface OptimizationAdviceItem {
  id: string;
  level: AdviceLevel; // 紧急 / 一般 / 观察
  factorId: number;
  factorName: string;
  title: string;
  problemStatement: string; // 现状问题诊断
  actionGuideline: string; // 优化操作指引
  expectedBenefit: string; // 预期优化收益
  targetScope: string; // 涉及范围/模组/设备
  deadline: string; // 建议处理时效
}

export interface SiteHealthSummary {
  siteId: string;
  siteName: string;
  evaluatedAt: string;
  overallScore: number; // 0 - 100 综合体检得分
  grade: 'EXCELLENT' | 'GOOD' | 'MEDIUM' | 'RISKY';
  gradeLabel: string;
  hitFactors: PerformanceFactor[];
  adviceList: OptimizationAdviceItem[];
  keyHighlights: string[];
}

export interface PerformanceHistoryRecord {
  id: string;
  siteId: string;
  evaluatedAt: string;
  versionNo: string; // e.g. "REV-20260820-01"
  logFileName: string;
  logFileSize: string;
  logPeriod: string;
  overallScore: number;
  grade: 'EXCELLENT' | 'GOOD' | 'MEDIUM' | 'RISKY';
  gradeLabel: string;
  hitFactorsCount: number;
  hitFactorNames: string[];
  evaluator: string;
  summary: string;
  factors: PerformanceFactor[];
  advicesCount: number;
}

// ======================= 新增核心指标扩展类型 =======================

// 1. 可用度指标与失效设备失效时刻告警关联
export interface FailureAlarmItem {
  id: string;
  alarmCode: string;
  alarmName: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING';
  deviceCode: string;
  deviceName: string;
  subsystem: 'PCS' | 'BMS' | 'HV_BOX' | 'THERMAL' | 'TRANSFORMER' | 'GRID_CONNECT';
  triggeredAt: string; // 告警发生时间 (精确至秒)
  clearedAt?: string; // 告警消除时间
  durationMinutes: number; // 持续时间 (分钟)
  correlationType: 'ROOT_CAUSE' | 'CASCADE' | 'PRECURSOR' | 'SECONDARY'; // 首发根因 / 连锁保护 / 异常前兆 / 次生衍生
  description: string;
  workOrderId?: string;
  isConfirmed: boolean;
}

export interface EquipmentFailureRecord {
  id: string;
  failureId: string; // e.g. "FLR-20260818-01"
  deviceCode: string; // e.g. "PCS-02"
  deviceName: string; // e.g. "2#变流升压舱 2号PCS逆变器"
  deviceType: 'PCS' | 'BMS_MASTER' | 'BMU_SLAVE' | 'HV_JUNCTION' | 'COOLING_UNIT' | 'STEP_UP_TRANSFORMER';
  cabinLocation: string; // e.g. "2#变流升压一体舱 A列"
  failedAt: string; // 失效发生时刻 "2026-08-18 14:22:15"
  recoveredAt: string; // 恢复投运时刻 "2026-08-18 16:05:30"
  outageDurationHours: number; // 停运历时 (h)
  capacityLossMw: number; // 影响容量 (MW)
  energyLossMwh: number; // 损失电能量 (MWh)
  failureReason: string; // 失效简述
  rcaChain: string; // 根因分析诊断链
  availabilityLossPct: number; // 导致可用度损失 %
  status: 'RESOLVED' | 'UNDER_REPAIR' | 'MONITORING';
  relatedAlarms: FailureAlarmItem[]; // 失效时刻系统相关告警关联清单
}

export interface AvailabilityMetricData {
  siteId: string;
  availabilityRate: number; // 系统综合可用率 % (e.g. 99.28%)
  eaf: number; // 等效可用系数 EAF % (e.g. 99.15%)
  contractGuaranteeAvailability: number; // 合同保证可用度 % (e.g. 98.50%)
  totalOperatingHours: number; // 周期统计小时数
  plannedOutageHours: number; // 计划停运时长 POH (h)
  unplannedOutageHours: number; // 非计划停运时长 UOH (h)
  mtbfHours: number; // 平均无故障工作时间 MTBF (h)
  mttrHours: number; // 平均故障修复时间 MTTR (h)
  failureCount: number; // 统计周期失效事件总数
  monthlyTrend: {
    month: string;
    availability: number;
    eaf: number;
    target: number;
    unplannedHours: number;
  }[];
  failures: EquipmentFailureRecord[]; // 失效设备与失效时刻告警关联记录
}

// 2. RTE 性能指标
export interface ChargeDischargeStrategy {
  strategyName: string; // e.g. "两充两放削峰填谷 + 动态电网AGC调频"
  cyclesPerDay: number; // 日充放循环频次 e.g. 2.0
  chargeRateC: number; // 充电倍率 e.g. 0.5C
  dischargeRateC: number; // 放电倍率 e.g. 0.5C
  chargeCutoffSocPct: number; // 充电截止 SOC e.g. 98%
  dischargeCutoffSocPct: number; // 放电截止 SOC e.g. 5%
  modeDescription: string;
  peakValleySchedule: {
    periodName: string; // "早谷充" | "午峰放" | "下午平充" | "晚尖峰放"
    timeRange: string;
    action: 'CHARGE' | 'DISCHARGE' | 'STANDBY';
    powerKw: number;
    priceYuanPerKwh: number;
  }[];
}

export interface AmbientTemperatureData {
  currentTemp: number; // 当前室外环温 ℃
  minTemp: number; // 周期最低环温 ℃
  maxTemp: number; // 周期最高环温 ℃
  avgTemp: number; // 平均室外环温 ℃
  dailyDeltaT: number; // 昼夜最大温差 ℃
  tempSensitivityRteLossPctPer5C: number; // 环温上升5℃引起的RTE能耗损耗 %
  hourlyCurve: {
    time: string;
    ambientTemp: number; // 室外环温 ℃
    cabinTemp: number; // 舱内环境温 ℃
    coolingPowerKw: number; // 辅助温控功耗 kW
    rteImpactPct: number; // 对即时RTE效率影响 %
  }[];
}

export interface OperatingModeData {
  currentMode: string;
  gridDispatchCompliancePct: number; // 电网调度指令执行达标率 %
  modeDistribution: {
    mode: string;
    percentage: number;
    hours: number;
    color: string;
    description: string;
  }[];
}

export interface CellTemperatureData {
  maxCellTemp: number; // 最高电芯温度 ℃
  minCellTemp: number; // 最低电芯温度 ℃
  avgCellTemp: number; // 平均电芯温度 ℃
  maxDeltaT: number; // 最大电芯温差 ℃
  tempRiseRatePerHour: number; // 充放电平均温升速率 ℃/h
  coolingTriggerThreshold: number; // 液冷启动阈值 ℃
  tempSocCurve: {
    soc: number;
    chargeTemp: number;
    dischargeTemp: number;
    coolantInTemp: number;
  }[];
}

export interface TransformerEfficiencyData {
  ratedEfficiency: number; // 额定效率 %
  actualEfficiency: number; // 实测运行效率 %
  noLoadLossKw: number; // 空载损耗 (铁损) kW
  loadLossKw: number; // 额定负载损耗 (铜损) kW
  currentLoadRatePct: number; // 当前平均负荷率 %
  efficiencyCurve: {
    loadPct: number;
    efficiency: number;
  }[];
}

export interface PcsEfficiencyData {
  ratedEfficiency: number; // 额定转换效率 %
  actualEfficiency: number; // 实测综合综合效率 %
  chargingEfficiency: number; // 充电整流效率 %
  dischargingEfficiency: number; // 放电逆变效率 %
  powerFactor: number; // 运行功率因数 cosφ
  lossSummaryKw: number; // 变流器自身功耗损失 kW
  efficiencyCurve: {
    loadPct: number;
    chargingEff: number;
    dischargingEff: number;
  }[];
}

export interface LossWaterfallItem {
  stage: string;
  energyMwh: number;
  efficiencyLossPct: number;
  description: string;
}

export interface RtePerformanceData {
  siteId: string;
  overallRtePct: number; // 系统综合 RTE % (交流到交流)
  guaranteedRtePct: number; // 合同保证 RTE %
  designRtePct: number; // 设计基准 RTE %
  dcSideRtePct: number; // 直流侧效率 %
  auxiliaryPowerLossPct: number; // 站用辅电/温控损耗率 %
  chargeStrategy: ChargeDischargeStrategy;
  ambientTemperature: AmbientTemperatureData;
  operatingMode: OperatingModeData;
  cellTemperature: CellTemperatureData;
  transformerEfficiency: TransformerEfficiencyData;
  pcsEfficiency: PcsEfficiencyData;
  lossWaterfall: LossWaterfallItem[];
}

// 3. 可用容量指标
export interface CapacityTestCondition {
  testDate: string;
  testStandard: string; // e.g. "GB/T 36276-2023 / 现场验收充放电容量测试规程"
  ambientTemp: number; // 测试时环境温度 ℃
  cRate: number; // 测试充放电倍率 C (e.g. 0.5C)
  cutoffChargeVoltageV: number;
  cutoffDischargeVoltageV: number;
  chargingEnergyMwh: number;
  dischargingEnergyMwh: number;
  executor: string;
  conclusion: string;
}

export interface ClusterCapacityItem {
  clusterId: string;
  clusterCode: string;
  ratedCapacityMwh: number;
  usableCapacityMwh: number;
  retentionPct: number;
  deviationFromMeanPct: number;
  isBottleneck: boolean;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface UsableCapacityData {
  siteId: string;
  ratedCapacityMwh: number; // 额定设计容量 MWh
  actualUsableCapacityMwh: number; // 实测可用容量 MWh
  guaranteedCapacityMwh: number; // 合同承诺保证可用容量 MWh
  capacityRetentionPct: number; // 可用容量保持率 %
  capacityMarginMwh: number; // 裕度余量 MWh
  capacityMarginPct: number; // 裕度百分比 %
  status: 'SURPLUS' | 'NEAR_THRESHOLD' | 'BREACHED';
  testCondition: CapacityTestCondition;
  clusters: ClusterCapacityItem[];
  degradationHistory: {
    evaluatedDate: string;
    actualUsableMwh: number;
    guaranteedBaselineMwh: number;
    designPredictedMwh: number;
  }[];
}

// 4. SOH 性能指标 (整合 SOC一致性、电能量数据、SOH值一致性、运行工况)
export interface ClusterSocItem {
  clusterCode: string;
  currentSoc: number; // %
  chargeEndSoc: number; // 满充末期 SOC %
  dischargeEndSoc: number; // 满放末期 SOC %
  deviationFromAvgPct: number; // 偏离均值 %
  status: 'NORMAL' | 'DEVIATED';
}

export interface SocConsistencyData {
  avgSocPct: number; // 全站平均 SOC %
  maxDeltaSocPct: number; // 最大极差 ΔSOC %
  standardDeviationPct: number; // SOC 标准差 σ
  chargeEndDispersionPct: number; // 满充末期离散度 %
  dischargeEndDispersionPct: number; // 满放末期离散度 %
  evaluationNote: string;
  clusterSocList: ClusterSocItem[];
}

export interface DailyEnergyItem {
  date: string;
  chargedMwh: number;
  dischargedMwh: number;
  throughputMwh: number;
  dailyRtePct: number;
}

export interface ClusterThroughputItem {
  clusterCode: string;
  chargedMwh: number;
  dischargedMwh: number;
  throughputMwh: number;
  deviationPct: number;
}

export interface ElectricalEnergyData {
  cumulativeChargedMwh: number; // 累计充入电能量 MWh
  cumulativeDischargedMwh: number; // 累计放出电能量 MWh
  cumulativeThroughputMwh: number; // 累计充放吞吐量 MWh
  currentMonthChargedMwh: number;
  currentMonthDischargedMwh: number;
  avgDailyDischargeMwh: number;
  dailyTrend: DailyEnergyItem[];
  clusterThroughput: ClusterThroughputItem[];
}

export interface PackSohConsistencyItem {
  packCode: string;
  cluster: string;
  soh: number; // %
  deviationFromMeanPct: number; // %
  dcirMOhms: number;
  isSubstandard: boolean;
  status: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
}

export interface SohConsistencyData {
  avgSohPct: number; // 全站平均 SOH %
  maxSohPct: number; // 最高 PACK SOH %
  minSohPct: number; // 最低 PACK SOH %
  deltaSohPct: number; // SOH 极差 %
  standardDeviation: number; // SOH 标准差
  substandardCount: number; // 低于保证值 (90%) 数量
  distribution: {
    range: string; // e.g. "95%-100%", "90%-95%", "<90%"
    count: number;
    percentage: number;
  }[];
  packs: PackSohConsistencyItem[];
}

export interface OperatingConditionData {
  cumulativeFecCycles: number; // 累计等效全循环次数 FEC
  designLifeCycles: number; // 设计寿命循环次数
  cycleConsumptionPct: number; // 循环寿命消耗占比 %
  avgOperatingTemp: number; // 平均运行工作温度 ℃
  highSocRestRatioPct: number; // 高SOC (>90%) 持续停留时间占比 %
  overDischargeRatioPct: number; // 过放深放 (<5%) 时间占比 %
  dodDistribution: {
    range: string; // "0-40% 浅充浅放", "40-80% 中度充放", "80-100% 深度充放"
    percentage: number;
    cycleEquivalent: number;
  }[];
  cRateDistribution: {
    rateRange: string; // "<0.2C", "0.2C-0.5C", "0.5C-0.8C", ">0.8C 脉冲"
    hoursPct: number;
    impactLevel: 'LOW' | 'NORMAL' | 'HIGH';
  }[];
}

export interface SohComprehensiveData {
  siteId: string;
  socConsistency: SocConsistencyData;
  electricalEnergy: ElectricalEnergyData;
  sohConsistency: SohConsistencyData;
  operatingCondition: OperatingConditionData;
}

// 5. 并网点电表数据手动录入类型
export interface GridMeterRecord {
  id: string;
  siteId: string;
  meterCode: string; // 计量表计编号，如 "MTR-35KV-MAIN-01"
  meterName: string; // 关口表名称，如 "35kV关口双向电能主表"
  readingDate: string; // 抄表日期时间，如 "2026-08-31 23:59"
  readingType: 'SETTLEMENT' | 'ROUTINE' | 'CALIBRATION' | 'MANUAL_AUDIT'; // 结算抄表 / 日常巡检 / 标定校验 / 人工抽核
  forwardActiveEnergyKwh: number; // 正向有功总电量 kWh (上网/放电)
  reverseActiveEnergyKwh: number; // 反向有功总电量 kWh (下网/充电)
  forwardReactiveEnergyKvarh: number; // 正向无功总电量 kvarh
  reverseReactiveEnergyKvarh: number; // 反向无功总电量 kvarh
  activePowerKw: number; // 实时有功功率 kW
  powerFactor: number; // 功率因数 Cosφ
  voltageKv: number; // 线电压 kV
  currentA: number; // 电流 A
  ctRatio: string; // 电流互感器 CT 变比 "600/5"
  ptRatio: string; // 电压互感器 PT 变比 "35000/100"
  multiplier: number; // 综合倍率 = 120 * 350 = 42000
  operator: string; // 录入人员
  auditStatus: 'VERIFIED' | 'PENDING' | 'DISCREPANCY'; // 已核验 / 待复核 / 数据存疑
  verifiedBy?: string; // 审核人
  notes?: string; // 备注说明
}

// 6. 站点性能保障合同条款类型
export interface ContractClauseItem {
  clauseNo: string; // 条款编号，如 "第 4.2 条"
  title: string; // 条款名称
  category: 'RTE' | 'SOH_DEGRADATION' | 'AVAILABILITY' | 'AUC_CAPACITY' | 'GRID_DISPATCH' | 'THERMAL_BOUNDARY' | 'PENALTY_COMPENSATION';
  guaranteedTarget: string; // 保证指标标准
  currentActualValue: string; // 当前实测达成值
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'BREACHED'; // 达标 / 临界预警 / 违约
  clauseText: string; // 条款合同原文
  penaltyMechanism: string; // 考核扣罚/补齐赔偿机制
  riskAssessment: string; // 履约风险与研判
  exemptionConditions: string; // 免责条款（如电网超工况调度造成的免除）
}

export interface SiteContractGuarantee {
  siteId: string;
  contractNo: string; // 合同编号
  contractName: string; // 合同名称
  clientName: string; // 业主/客户
  effectiveDate: string; // 生效日期
  warrantyPeriodYears: number; // 质保保证年限
  currentYearOfOperation: number; // 已投运年数
  guaranteeDepositAmount: string; // 履约质保金金额
  contractSignDate: string; // 签订日期
  clauses: ContractClauseItem[];
}

// 7. 站点性能承诺指标录入与配置类型
export interface PerformanceCommitmentMetrics {
  siteId: string;
  version: string; // "V2.2"
  updatedAt: string;
  updatedBy: string;
  reviewStatus: 'APPROVED' | 'IN_REVIEW' | 'DRAFT';
  rteGuaranteePct: number; // RTE 承诺保证值 % (e.g. 87.50%)
  sohFloorPct: number; // SOH 最低保证线 % (e.g. 90.00%)
  availabilityGuaranteePct: number; // 系统等效可用率保证 % (e.g. 99.20%)
  aucMinMwh: number; // 额定可用容量底线 MWh (e.g. 19.40 MWh)
  maxAnnualDegradationPct: number; // 最大年化衰减容许率 %/年 (e.g. 1.80%)
  maxCellDeltaTCelsius: number; // 最大允许电芯温差 ℃ (e.g. 4.0℃)
  maxAllowedDeltaSocPct: number; // 最大允许 SOC 极差 % (e.g. 5.0%)
  lifecycleCommitmentCycles: number; // 全生命周期设计循环次数 (e.g. 6000 次)
  maxGridMeterLossPct: number; // 关口计量线损率考核上限 % (e.g. 1.50%)
  benchmarkTempCelsius: number; // 标准测试基准温度 ℃ (e.g. 25.0℃)
  amendmentBasis: string; // 修订依据
  auditLog: {
    version: string;
    modifiedAt: string;
    modifier: string;
    changeSummary: string;
  }[];
}

// 8. 站点拓扑结构与SLA监控节点类型
export interface TopologyNodeData {
  id: string;
  code: string;
  name: string;
  level: 'GRID_TIE' | 'TRANSFORMER' | 'HV_SWITCH' | 'PCS' | 'DC_COMBINER' | 'BATTERY_CLUSTER' | 'AUX_COOLING';
  levelLabel: string;
  parentIds: string[];
  metrics: {
    voltage?: string;
    current?: string;
    power?: string;
    efficiency?: string;
    temperature?: string;
    soc?: string;
    soh?: string;
    slaScore: number; // e.g. 98.2
    slaTarget: number; // e.g. 99.0
  };
  isSlaBreached: boolean; // 是否低于 SLA
  slaBreachReason?: string; // 低于 SLA 的归因分析
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  linkToParentSlaBreached?: boolean;
  alarmCount: number;
}

// 9. 超工况影响 SOH 衰减因子列表项类型
export interface OverConditionSohFactor {
  id: string;
  factorName: string; // 影响因素名称
  description: string; // 机理解释
  baselineLimit: string; // 合同/正常工况限值
  actualExceedValue: string; // 现场实际超标监测值
  accumulatedHoursOrTimes: string; // 累计超工况时长/频次
  sohExtraLossPct: number; // 折算导致 SOH 额外衰减贡献 %
  weightPct: number; // 综合衰减影响占比权重 %
  affectedUnits: string; // 关联受影响设备/簇
  mitigationAdvice: string; // 运维改善与规避建议
  responsibleParty: 'GRID_DISPATCH' | 'OWNER_OPERATION' | 'EQUIPMENT_MAINTENANCE' | 'ENVIRONMENT';
}

