export type EntryMode = 'site_select' | 'offline_import' | 'manual';

export type MeteorologicalSource = 'auto_regional' | 'manual' | 'file_import';

export type CorrosionGrade = 'C1_C2' | 'C3' | 'C4' | 'C5' | 'SAND_STORM';

export type RedundancyTopology = 'SINGLE' | 'N_PLUS_ONE' | 'DUAL_HOT_BACKUP' | 'FIBER_RING' | 'MULTI_ACTIVE';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DeviceItem {
  id: string;
  type: 'PCS_INVERTER' | 'BMS_CLUSTER' | 'EMS_HOST' | 'TRANSFORMER' | 'HVAC_COOLING';
  typeName: string;
  model: string;
  quantity: number;
  ratedPowerKw: number;
  isKeyDevice: boolean;
  mtbfHours: number; // 预期单机平均无故障运行时间(小时)
  mttrHours: number; // 预期单机现场平均修复时间(小时)
}

export interface MeteorologicalData {
  source: MeteorologicalSource;
  avgTempC: number;
  maxTempC: number;
  minTempC: number;
  relativeHumidityPct: number;
  altitudeMeters: number;
  rainfallMm: number;
  corrosionGrade: CorrosionGrade;
  stormFrequency: number; // 次/年
  solarRadiationKwhM2: number; // kWh/m²
  notes: string;
}

export interface ElectricityPricingData {
  peakPrice: number; // 尖峰/峰段电价 (元/kWh)
  flatPrice: number; // 平段电价 (元/kWh)
  valleyPrice: number; // 谷段电价 (元/kWh)
  dailyCycles: number; // 每日充放电循环次数 (如 2.0 次)
  annualOperatingDays: number; // 年运行天数 (如 350 天)
  dischargeDepthDOD: number; // 放电深度 DOD (%) (如 90%)
  slaPenaltyPerTenthPercent: number; // 每低于约定 SLA 0.1% 违约金 (万元/年)
  subsidyPerKwh: number; // 地方度电放电补贴 (元/kWh)
}

export interface FinancialRiskAssessment {
  peakValleySpread: number; // 峰谷价差 (元/kWh)
  annualTheoreticalRevenue: number; // 满容量理论年套利与放电收益 (万元/年)
  annualOutageArbitrageLoss: number; // 预期因不可用停机损失的套利收益 (万元/年)
  annualPotentialBreachPenalty: number; // 预期违约赔付金额 (万元/年)
  totalAnnualFinancialExposure: number; // 预期年化综合经济风险敞口 (万元/年)
}

export interface PreSalesInputState {
  entryMode: EntryMode;
  selectedSiteId: string;
  siteName: string;
  region: string;
  representativeOffice: string;
  customerName: string;
  industryScenario: string;
  capacityMw: number;
  capacityMwh: number;
  proposedSla: number;
  devices: DeviceItem[];
  redundancy: RedundancyTopology;
  topologyStructure: string;
  linkDescription: string;
  sampleSourceType: 'regional_pool' | 'custom_pool';
  sampleCount: number;
  meteorological: MeteorologicalData;
  electricityPricing: ElectricityPricingData;
}

export interface QuantileBenchmarkItem {
  name: string;
  value: number;
  description: string;
  isProposed?: boolean;
  isRecommended?: boolean;
}

export interface WeatherSensitivityItem {
  factor: string;
  impactPct: number; // 负值扣减，如 -0.08
  description: string;
}

export interface RecommendationItem {
  id: string;
  category: 'redundancy' | 'meteorology' | 'contract_clauses';
  categoryLabel: string;
  title: string;
  content: string;
  potentialGain: string;
  priority: 'P0' | 'P1' | 'P2';
}

export interface PreSalesEvaluationResult {
  expectedAvailability: number; // 预期可用度
  confidenceLevel: number; // 置信度 %
  keyFactors: {
    name: string;
    impactDescription: string;
    riskRatio: number;
    severity: 'high' | 'medium' | 'low';
  }[];
  recommendedSlaMin: number;
  recommendedSlaMax: number;
  breachProbability: number;
  riskLevel: RiskLevel;
  riskReason: string;
  expectedMttrHours: number;
  annualEquivalentInterruptionHours: number;
  annualExemptMaintenanceHours: number;
  annualFaultFrequency: number;
  quantileBenchmarks: QuantileBenchmarkItem[];
  weatherSensitivity: WeatherSensitivityItem[];
  weatherCorrectionFactor: number;
  financialRisk: FinancialRiskAssessment;
  recommendations: RecommendationItem[];
  isSampleInsufficient: boolean;
  sampleCount: number;
  dataSourceMode: EntryMode;
  meteorologicalSource: MeteorologicalSource;
  reportSnapshotVersion: string;
  evaluatedAt: string;
  evaluatedBy: string;
}

export interface EvaluationTaskRecord {
  id: string; // 如 EVAL-202609-001
  taskName: string;
  siteName: string;
  region: string;
  representativeOffice: string;
  customerName: string;
  capacityMw: number;
  capacityMwh: number;
  proposedSla: number;
  status: 'completed' | 'draft';
  createdAt: string;
  evaluatedAt: string;
  creatorName: string;
  creatorEmail: string;
  inputSnapshot: PreSalesInputState;
  resultSnapshot: PreSalesEvaluationResult;
}
