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
