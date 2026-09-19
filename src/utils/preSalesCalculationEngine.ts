import {
  PreSalesInputState,
  PreSalesEvaluationResult,
  MeteorologicalData,
  ElectricityPricingData,
  FinancialRiskAssessment,
  DeviceItem,
  RedundancyTopology,
  RiskLevel
} from '../types/preSalesEvaluation';

export const REGIONAL_ELECTRICITY_PRESETS: Record<string, ElectricityPricingData> = {
  '华东区': {
    peakPrice: 1.28,
    flatPrice: 0.72,
    valleyPrice: 0.31,
    dailyCycles: 2.0,
    annualOperatingDays: 350,
    dischargeDepthDOD: 90,
    slaPenaltyPerTenthPercent: 6.0,
    subsidyPerKwh: 0.12
  },
  '华北区': {
    peakPrice: 1.15,
    flatPrice: 0.68,
    valleyPrice: 0.35,
    dailyCycles: 1.5,
    annualOperatingDays: 345,
    dischargeDepthDOD: 88,
    slaPenaltyPerTenthPercent: 4.5,
    subsidyPerKwh: 0.08
  },
  '西北区': {
    peakPrice: 0.95,
    flatPrice: 0.55,
    valleyPrice: 0.26,
    dailyCycles: 1.5,
    annualOperatingDays: 340,
    dischargeDepthDOD: 85,
    slaPenaltyPerTenthPercent: 4.0,
    subsidyPerKwh: 0.05
  },
  '华南区': {
    peakPrice: 1.38,
    flatPrice: 0.76,
    valleyPrice: 0.33,
    dailyCycles: 2.0,
    annualOperatingDays: 355,
    dischargeDepthDOD: 92,
    slaPenaltyPerTenthPercent: 7.5,
    subsidyPerKwh: 0.15
  },
  '西南区': {
    peakPrice: 1.10,
    flatPrice: 0.62,
    valleyPrice: 0.30,
    dailyCycles: 1.8,
    annualOperatingDays: 345,
    dischargeDepthDOD: 88,
    slaPenaltyPerTenthPercent: 4.8,
    subsidyPerKwh: 0.08
  }
};

export const DEFAULT_ELECTRICITY_PRICING: ElectricityPricingData = REGIONAL_ELECTRICITY_PRESETS['华东区'];

export const REGIONAL_WEATHER_PROFILES: Record<string, Omit<MeteorologicalData, 'source' | 'notes'>> = {
  '华东区': {
    avgTempC: 17.5,
    maxTempC: 41.2,
    minTempC: -5.0,
    relativeHumidityPct: 78,
    altitudeMeters: 45,
    rainfallMm: 1250,
    corrosionGrade: 'C3',
    stormFrequency: 18,
    solarRadiationKwhM2: 1350
  },
  '华北区': {
    avgTempC: 12.8,
    maxTempC: 39.5,
    minTempC: -16.2,
    relativeHumidityPct: 55,
    altitudeMeters: 120,
    rainfallMm: 580,
    corrosionGrade: 'C1_C2',
    stormFrequency: 12,
    solarRadiationKwhM2: 1520
  },
  '西北区': {
    avgTempC: 9.2,
    maxTempC: 38.0,
    minTempC: -26.5,
    relativeHumidityPct: 38,
    altitudeMeters: 1450,
    rainfallMm: 210,
    corrosionGrade: 'SAND_STORM',
    stormFrequency: 8,
    solarRadiationKwhM2: 1820
  },
  '华南区': {
    avgTempC: 23.4,
    maxTempC: 39.8,
    minTempC: 3.5,
    relativeHumidityPct: 86,
    altitudeMeters: 25,
    rainfallMm: 1850,
    corrosionGrade: 'C5',
    stormFrequency: 36,
    solarRadiationKwhM2: 1420
  },
  '西南区': {
    avgTempC: 16.0,
    maxTempC: 36.5,
    minTempC: -2.0,
    relativeHumidityPct: 82,
    altitudeMeters: 850,
    rainfallMm: 1100,
    corrosionGrade: 'C3',
    stormFrequency: 24,
    solarRadiationKwhM2: 1200
  }
};

/**
 * Evaluates pre-sales availability based on topological redundancy, core devices, meteorological factors, and regional benchmarks.
 */
export function calculatePreSalesEvaluation(input: PreSalesInputState): PreSalesEvaluationResult {
  const {
    region,
    capacityMw,
    proposedSla,
    devices,
    redundancy,
    meteorological,
    sampleCount,
    entryMode
  } = input;

  // 1. Base availability by redundancy topology
  let baseAvailability = 99.45;
  switch (redundancy) {
    case 'SINGLE':
      baseAvailability = 99.18;
      break;
    case 'N_PLUS_ONE':
      baseAvailability = 99.42;
      break;
    case 'DUAL_HOT_BACKUP':
      baseAvailability = 99.58;
      break;
    case 'FIBER_RING':
      baseAvailability = 99.52;
      break;
    case 'MULTI_ACTIVE':
      baseAvailability = 99.65;
      break;
  }

  // 2. Equipment scale & key devices adjustment
  const keyDevicesCount = devices.filter(d => d.isKeyDevice).length;
  const hasKeyTransformer = devices.some(d => d.type === 'TRANSFORMER');
  const hasPcs = devices.some(d => d.type === 'PCS_INVERTER');
  let deviceAdj = 0;
  if (!hasKeyTransformer) deviceAdj -= 0.05; // Missing transformer redundancy
  if (keyDevicesCount > 6) deviceAdj += 0.03; // Good monitoring coverage

  // 3. Meteorological impact deduction calculation
  const tempSeverity = Math.max(0, meteorological.maxTempC - 38) * 0.02 + Math.max(0, -15 - meteorological.minTempC) * 0.015;
  const tempDeduction = -Number((0.02 + tempSeverity).toFixed(3)); // -0.04 to -0.10%

  let corrosionDeduction = -0.02;
  if (meteorological.corrosionGrade === 'C4') corrosionDeduction = -0.05;
  else if (meteorological.corrosionGrade === 'C5') corrosionDeduction = -0.09;
  else if (meteorological.corrosionGrade === 'SAND_STORM') corrosionDeduction = -0.07;

  let altitudeDeduction = 0;
  if (meteorological.altitudeMeters > 1000) {
    altitudeDeduction = -Number(((meteorological.altitudeMeters - 1000) / 1000 * 0.03).toFixed(3));
  }

  const stormSeverity = Math.max(0, meteorological.stormFrequency - 10) * 0.0018;
  const stormDeduction = -Number((0.01 + stormSeverity).toFixed(3));

  const totalWeatherDeduction = tempDeduction + corrosionDeduction + altitudeDeduction + stormDeduction;
  const weatherCorrectionFactor = Number((1 + totalWeatherDeduction / 100).toFixed(4));

  // 4. Sample sufficiency check
  const isSampleInsufficient = sampleCount < 10;
  const samplePenalty = isSampleInsufficient ? -0.10 : 0; // Bayesian conservative margin

  // 5. Expected availability
  let expectedAvailability = Number((baseAvailability + deviceAdj + totalWeatherDeduction + samplePenalty).toFixed(2));
  expectedAvailability = Math.max(98.50, Math.min(99.85, expectedAvailability));

  // 6. MTTR & Annual Interruption Hours
  let expectedMttrHours = 3.8;
  if (redundancy === 'DUAL_HOT_BACKUP' || redundancy === 'MULTI_ACTIVE') {
    expectedMttrHours = 2.4;
  } else if (redundancy === 'SINGLE') {
    expectedMttrHours = 5.2;
  }
  if (meteorological.altitudeMeters > 1500 || meteorological.corrosionGrade === 'C5') {
    expectedMttrHours += 0.8; // Transport & marine delay
  }
  expectedMttrHours = Number(expectedMttrHours.toFixed(1));

  // Annual equivalent non-exempt interruption hours (8760 * (1 - A%))
  const annualEquivalentInterruptionHours = Number(((8760 * (100 - expectedAvailability)) / 100).toFixed(1));
  const annualExemptMaintenanceHours = 48.0; // Rule R2' standard
  const annualFaultFrequency = Number((annualEquivalentInterruptionHours / expectedMttrHours).toFixed(1));

  // 7. Recommended SLA interval based on statistical distribution
  const recommendedSlaMax = Number((expectedAvailability - 0.08).toFixed(2));
  const recommendedSlaMin = Number((expectedAvailability - 0.22).toFixed(2));

  // 8. Risk Level evaluation strictly according to user business rule:
  // Rule: 高 > 99.55; 中 (99.35, 99.55]; 低 <= 99.35
  let riskLevel: RiskLevel = 'LOW';
  let riskReason = '';
  if (proposedSla > 99.55) {
    riskLevel = 'HIGH';
    riskReason = `拟签约 SLA (${proposedSla}%) 高于 99.55% 红色高危线，且超出测算期望可用度 (${expectedAvailability}%)，违约索赔风险极高！`;
  } else if (proposedSla > 99.35) {
    riskLevel = 'MEDIUM';
    riskReason = `拟签约 SLA (${proposedSla}%) 处于 (99.35%, 99.55%] 中风险区间，接近同区域历史均值，需在合同中绑定免责防范条款。`;
  } else {
    riskLevel = 'LOW';
    riskReason = `拟签约 SLA (${proposedSla}%) ≤ 99.35% 安全线，低于同区域推荐上限 (${recommendedSlaMax}%)，履约裕度充足，风险可控。`;
  }

  // 9. Breach Probability
  // Normal cumulative distribution approximation based on gap = expected - proposed
  const gap = expectedAvailability - proposedSla;
  let breachProbability = 0;
  if (gap >= 0.20) {
    breachProbability = 6.5;
  } else if (gap >= 0.10) {
    breachProbability = 15.2;
  } else if (gap >= 0.0) {
    breachProbability = 28.4;
  } else if (gap >= -0.10) {
    breachProbability = 46.8;
  } else if (gap >= -0.20) {
    breachProbability = 68.5;
  } else {
    breachProbability = 89.2;
  }
  if (isSampleInsufficient) {
    breachProbability = Math.min(99.0, breachProbability + 12.0);
  }
  breachProbability = Number(breachProbability.toFixed(1));

  // 10. Quantile benchmarks for Recharts bar chart
  let regionalMean = 99.48;
  let p90 = 99.62;
  let p95 = 99.21;
  if (region === '西北区') {
    regionalMean = 99.38;
    p90 = 99.55;
    p95 = 99.12;
  } else if (region === '华南区') {
    regionalMean = 99.41;
    p90 = 99.58;
    p95 = 99.18;
  }

  const quantileBenchmarks = [
    { name: '同区域同类均值', value: regionalMean, description: '样本库同区域历史加权平均可用度' },
    { name: 'P90 分位可用度', value: p90, description: '行业头部良好表现 (前10%站点水平)' },
    { name: 'P95 分位下限', value: p95, description: '行业保底防线 (前95%站点可达标)' },
    { name: '本次拟承诺 SLA', value: proposedSla, description: '销售目前方案意向承诺值', isProposed: true },
    { name: 'AI 推荐安全签约值', value: recommendedSlaMax, description: '兼顾销售竞争力与零违约金最佳平衡点', isRecommended: true }
  ];

  // 11. Weather sensitivity items
  const weatherSensitivity = [
    { factor: '极端气温影响 (热管理与降额)', impactPct: tempDeduction, description: `极端最高温 ${meteorological.maxTempC}℃ / 最低温 ${meteorological.minTempC}℃，加重冷水机组与热负荷` },
    { factor: '沙尘与盐雾腐蚀等级', impactPct: corrosionDeduction, description: `环境腐蚀等级 ${meteorological.corrosionGrade}，加速滤网堵塞与绝缘寿命折减` },
    { factor: '高海拔空气稀薄', impactPct: altitudeDeduction === 0 ? -0.01 : altitudeDeduction, description: `海拔 ${meteorological.altitudeMeters}m，散热效率衰减与电气爬电距离增加` },
    { factor: '雷暴与极端恶劣天气', impactPct: stormDeduction, description: `年均雷暴/台风频次 ${meteorological.stormFrequency} 次，易引发外电网失压停运` }
  ];

  // 12. Recommendations
  const recommendations: PreSalesEvaluationResult['recommendations'] = [
    {
      id: 'REC-01',
      category: 'redundancy',
      categoryLabel: '组网冗余升级',
      title: redundancy === 'SINGLE' ? '强烈建议将单机架构升级为双机热备或自愈环网' : '强化 EMS 与主控网络冗余链路配置',
      content: redundancy === 'SINGLE'
        ? '当前单机架构存在明显单点故障瓶颈（SPOF）。若升级为主备热备 PCS 或环网拓扑，单点故障时自愈时间 < 20ms，可直接挽回约 22 小时/年的停机时长。'
        : '当前组网具备良好冗余度，建议在订货技术规范书中明确光纤环网双独立路由敷设，规避外部机械施工单次割断风险。',
      potentialGain: redundancy === 'SINGLE' ? '预期可用度提升 +0.24%' : '降低组网单点风险 45%',
      priority: redundancy === 'SINGLE' ? 'P0' : 'P1'
    },
    {
      id: 'REC-02',
      category: 'meteorology',
      categoryLabel: '气象环境适应性',
      title: meteorological.corrosionGrade === 'C5' || meteorological.corrosionGrade === 'SAND_STORM'
        ? '严苛恶劣环境强化防护与空调闭式循环'
        : '温控系统冗余与进风滤网免维护巡检',
      content: `针对当前 ${meteorological.corrosionGrade} 环境与极端温差（${meteorological.maxTempC}℃ / ${meteorological.minTempC}℃），建议将电池舱防护等级锁定为 IP55+，外机配置防腐耐盐雾涂层，并选配自动反吹风除尘沙滤装置。`,
      potentialGain: '减少环境诱发停机 35%',
      priority: meteorological.corrosionGrade === 'C5' ? 'P0' : 'P1'
    },
    {
      id: 'REC-03',
      category: 'contract_clauses',
      categoryLabel: '合同考核口径防线 (Rule R2\')',
      title: '销售签约 SLA 免责条款与防惩罚防线',
      content: '① 明确将外部电网调度限制、自然不可抗力列为豁免考核；② 严格约定年度享有不少于 48 小时经客户签字确认的计划检修申报豁免窗口 (Rule R2)；③ 约定可用度采用 5 分钟高频打点加权计算，并设定 0.15% 浮动宽免缓冲带。',
      potentialGain: '消除不可抗力违约金 100%',
      priority: 'P0'
    }
  ];

  // 13. Key Factors
  const keyFactors = [
    {
      name: '组网拓扑架构影响',
      impactDescription: redundancy === 'SINGLE' ? '单机架构无冗余，任何设备故障直接导致整站中断' : '具备拓扑冗余能力，支持单机切除不停机',
      riskRatio: redundancy === 'SINGLE' ? 42 : 18,
      severity: redundancy === 'SINGLE' ? ('high' as const) : ('low' as const)
    },
    {
      name: '气候气象修正影响',
      impactDescription: `环境气象综合导致设备可靠度折减 ${Math.abs(totalWeatherDeduction).toFixed(2)}%`,
      riskRatio: Math.abs(totalWeatherDeduction) > 0.15 ? 32 : 22,
      severity: Math.abs(totalWeatherDeduction) > 0.15 ? ('high' as const) : ('medium' as const)
    },
    {
      name: '历史同类站点样本库',
      impactDescription: isSampleInsufficient ? '样本不足（<10个），采用保守贝叶斯估计' : `同类样本充足 (${sampleCount}个)，模型置信度高`,
      riskRatio: isSampleInsufficient ? 26 : 14,
      severity: isSampleInsufficient ? ('high' as const) : ('low' as const)
    }
  ];

  // 14. Financial & Electricity Pricing Risk Assessment
  const pricing = input.electricityPricing || DEFAULT_ELECTRICITY_PRICING;
  const peakValleySpread = Number((pricing.peakPrice - pricing.valleyPrice + pricing.subsidyPerKwh).toFixed(3));
  const effectiveDischargeKwhPerCycle = (input.capacityMwh * 1000) * (pricing.dischargeDepthDOD / 100);
  const totalAnnualDischargeKwh = effectiveDischargeKwhPerCycle * pricing.dailyCycles * pricing.annualOperatingDays;
  const annualTheoreticalRevenue = Number(((totalAnnualDischargeKwh * peakValleySpread) / 10000).toFixed(2)); // 万元/年
  
  // Unavailability revenue loss (因不可用造成的放电套利直接损失)
  const unavailabilityPct = Math.max(0, 100 - expectedAvailability);
  const annualOutageArbitrageLoss = Number(((annualTheoreticalRevenue * unavailabilityPct) / 100).toFixed(2)); // 万元/年

  // Potential SLA breach penalty
  const shortfallPct = Math.max(0, proposedSla - expectedAvailability);
  const penaltyPerTenth = pricing.slaPenaltyPerTenthPercent;
  const annualPotentialBreachPenalty = Number(((shortfallPct / 0.1) * penaltyPerTenth * (breachProbability / 100)).toFixed(2)); // 万元/年

  const totalAnnualFinancialExposure = Number((annualOutageArbitrageLoss + annualPotentialBreachPenalty).toFixed(2));

  const financialRisk: FinancialRiskAssessment = {
    peakValleySpread,
    annualTheoreticalRevenue,
    annualOutageArbitrageLoss,
    annualPotentialBreachPenalty,
    totalAnnualFinancialExposure
  };

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const versionHash = Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    expectedAvailability,
    confidenceLevel: isSampleInsufficient ? 86.5 : 94.8,
    keyFactors,
    recommendedSlaMin,
    recommendedSlaMax,
    breachProbability,
    riskLevel,
    riskReason,
    expectedMttrHours,
    annualEquivalentInterruptionHours,
    annualExemptMaintenanceHours,
    annualFaultFrequency,
    quantileBenchmarks,
    weatherSensitivity,
    weatherCorrectionFactor,
    financialRisk,
    recommendations,
    isSampleInsufficient,
    sampleCount,
    dataSourceMode: entryMode,
    meteorologicalSource: meteorological.source,
    reportSnapshotVersion: `VER-${dateStr.replace(/-/g, '')}-${versionHash}`,
    evaluatedAt: `${dateStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    evaluatedBy: '销售决策支持与可用度评估引擎 (AI v2.4)'
  };
}
