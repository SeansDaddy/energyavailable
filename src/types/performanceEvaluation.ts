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
