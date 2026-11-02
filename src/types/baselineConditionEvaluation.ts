// 灵活质保 - 基准工况评估 类型定义

export type BaselineEntryMode = 'site_select' | 'manual' | 'template_preset';

export type ThermalCoolingType = 'LIQUID_COOLING' | 'AIR_COOLING' | 'HYBRID_COOLING';

export type OperatingScenario = 
  | 'PEAK_VALLEY_ARBITRAGE' // 工商业/电网侧峰谷套利
  | 'FREQUENCY_REGULATION'  // 独立一次/二次调频
  | 'RENEWABLE_SMOOTHING'   // 新能源风光平滑与配储
  | 'MICROGRID_ISLAND'      // 微电网孤岛与备电
  | 'HYBRID_MULTI_USE';     // 综合多策略现货交易

export type BaselineRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// 1. 基准工况输入参数
export interface BaselineConditionInput {
  entryMode: BaselineEntryMode;
  selectedSiteId?: string;
  siteName: string;
  region: string;
  customerName: string;
  operatingScenario: OperatingScenario;
  operatingScenarioLabel: string;
  capacityMw: number;
  capacityMwh: number;
  cellManufacturer: string; // 如 宁德时代 LFP 280Ah / 314Ah
  batteryChemistry: string; // 磷酸铁锂 LFP / 钠离子
  commissioningDate: string; // 投运时间
  warrantyPeriodYears: number; // 承诺质保年限 (如 5/8/10/12/15 年)
  guaranteedEndSohPct: number; // 合同承诺终止保证 SOH (如 70.0% 或 80.0%)
  
  // 工况维度 1: 充放电策略与循环强度
  nominalCrate: number; // 基准充放电倍率 (如 0.5C)
  dailyFullEquivalentCycles: number; // 日等效完全循环次数 FEC (如 1.0, 1.5, 2.0 次)
  depthOfDischargeDodPct: number; // 标称放电深度 DOD % (如 90%)
  socOperatingLowerPct: number; // SOC 运行下限 % (如 10%)
  socOperatingUpperPct: number; // SOC 运行上限 % (如 90%)
  annualOperatingDays: number; // 年运行天数 (如 350 天)
  
  // 工况维度 2: 热管理与电芯温控
  coolingType: ThermalCoolingType;
  coolingTypeLabel: string;
  baselineCellTempC: number; // 基准电芯平均工作温度 (℃, 如 25℃)
  allowedCellTempMinC: number; // 合同允许最低电芯温度 (℃, 如 15℃)
  allowedCellTempMaxC: number; // 合同允许最高电芯温度 (℃, 如 35℃)
  extremeHighTempDaysPerYear: number; // 预估极端超温 (>38℃) 天数/年
  maxCellTempDifferenceC: number; // 簇内电芯最大允许温差 ΔT (℃, 如 3.0℃)
  
  // 工况维度 3: 辅助系统与电能量吞吐
  expectedAnnualThroughputMwh: number; // 预期年吞吐电能量 (MWh)
  auxPowerConsumptionRatioPct: number; // 辅电功耗占比 % (如 3.2%)
  highPowerPulseRatioPct: number; // 瞬时大倍率脉冲 (>1.0C) 工况占比 %
  
  // 工况维度 4: 商务条款与费率
  warrantyPricingPerWhPerYear: number; // 质保基础服务费 (元/Wh·年, 如 0.045)
  warrantyRetentionDepositPct: number; // 质保金扣留比例 % (如 5%)
  penaltyPerOnePctSohBreachYuan: number; // 每低于质保 SOH 1% 违约赔偿金 (万元)
}

// 2. SOH 预测曲线年际离散点
export interface AnnualSohPoint {
  year: number;
  calendarYear: string;
  idealLabSohPct: number; // 实验室标称曲线
  contractGuaranteedSohPct: number; // 合同保证底线 (SLA 保底)
  projectedBaselineSohPct: number; // 本次基准工况预测曲线
  worstCaseStressSohPct: number; // 恶劣超工况预测曲线
  accumulatedCycles: number; // 累计循环 FEC
  accumulatedThroughputMwh: number; // 累计吞吐电量 MWh
}

// 3. 超工况应力归因敏感度项
export interface StressFactorSensitivity {
  factorKey: 'TEMPERATURE' | 'CRATE' | 'DOD' | 'PULSE' | 'DEVIATION';
  factorName: string;
  benchmarkValue: string; // 基准值
  projectedValue: string; // 评估输入值
  stressWeight: number; // 应力权重因子 (1.0 为基准, >1.0 为加速老化)
  impactSohReductionPct: number; // 预计导致 SOH 加速衰减负向影响 %
  severity: 'NORMAL' | 'WARNING' | 'ALARM';
  description: string;
}

// 4. 合同签约与风控条款建议
export interface WarrantyContractClauseRecommendation {
  id: string;
  category: 'EXCLUSION' | 'DYNAMIC_ADJUSTMENT' | 'PRICING' | 'MAINTENANCE';
  categoryLabel: string;
  clauseTitle: string;
  clauseContent: string;
  riskMitigationValue: string; // 风控防护价值
  priority: 'P0' | 'P1' | 'P2';
}

// 5. 财务与履约风控测算
export interface FinancialWarrantyRiskAssessment {
  baseWarrantyContractTotalYuan: number; // 基础灵活质保合同总额 (万元)
  projectedExceedingConditionServiceFeeYuan: number; // 预估超工况调节加收服务费 (万元)
  potentialBreachExposureYuan: number; // 潜在违约赔偿风险敞口 (万元)
  recommendedRetentionDepositYuan: number; // 建议预留质保保证金 (万元)
  warrantyRoiGainPct: number; // 灵活质保对客户的全生命周期增益收益率 %
}

// 6. 完整基准工况评估结果
export interface BaselineConditionEvaluationResult {
  riskLevel: BaselineRiskLevel;
  riskScore: number; // 0-100 (越高风险越大)
  riskSummary: string;
  
  endOfWarrantyProjectedSohPct: number; // 质保期末预测 SOH %
  contractGuaranteedEndSohPct: number; // 承诺终止保证 SOH %
  sohSafetyMarginPct: number; // 安全裕度 % (正数为达标安全，负数为跌破风险)
  isCompliant: boolean;
  
  expectedBreachYear?: number; // 若跌破，预测第几年发生违约
  maxTolerableAnnualCycles: number; // 当前热管理条件下最大可容忍年循环数
  optimalSwapWindowYear: number; // 建议最佳电芯补齐/置换年份
  
  annualSohTrend: AnnualSohPoint[];
  stressFactors: StressFactorSensitivity[];
  clauseRecommendations: WarrantyContractClauseRecommendation[];
  financialAssessment: FinancialWarrantyRiskAssessment;
}

// 7. 评估任务记录实体 (用于任务列表持久化与管理)
export interface BaselineEvaluationTaskRecord {
  id: string;
  taskNo: string; // 如 "BC-TASK-2026-001"
  taskName: string;
  siteName: string;
  region: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  creator: string;
  status: 'COMPLETED' | 'IN_EVALUATION' | 'DRAFT';
  input: BaselineConditionInput;
  result: BaselineConditionEvaluationResult;
}
