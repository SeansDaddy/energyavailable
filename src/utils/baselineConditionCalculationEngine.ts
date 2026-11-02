import {
  BaselineConditionInput,
  BaselineConditionEvaluationResult,
  AnnualSohPoint,
  StressFactorSensitivity,
  WarrantyContractClauseRecommendation,
  FinancialWarrantyRiskAssessment,
  BaselineRiskLevel
} from '../types/baselineConditionEvaluation';

// 场景预设基准模板
export const SCENARIO_PRESETS: Record<
  string,
  {
    name: string;
    nominalCrate: number;
    dailyCycles: number;
    dodPct: number;
    socRange: [number, number];
    tempAllowed: [number, number];
    cooling: 'LIQUID_COOLING' | 'AIR_COOLING';
    pulseRatio: number;
    description: string;
  }
> = {
  PEAK_VALLEY_ARBITRAGE: {
    name: '工商业/电网侧常规峰谷套利',
    nominalCrate: 0.5,
    dailyCycles: 1.8,
    dodPct: 90,
    socRange: [10, 90],
    tempAllowed: [15, 35],
    cooling: 'LIQUID_COOLING',
    pulseRatio: 5,
    description: '标准两充两放，充放电倍率适中，液冷温控为主，应力主要来源于日循环频次。'
  },
  FREQUENCY_REGULATION: {
    name: '独立一次/二次调频服务',
    nominalCrate: 1.0,
    dailyCycles: 2.4,
    dodPct: 80,
    socRange: [20, 80],
    tempAllowed: [15, 33],
    cooling: 'LIQUID_COOLING',
    pulseRatio: 35,
    description: '大倍率浅充浅放高频响应，热应力与极化应力显著，需重点把控电芯最大温升。'
  },
  RENEWABLE_SMOOTHING: {
    name: '风光新能源平滑与共享配储',
    nominalCrate: 0.25,
    dailyCycles: 1.2,
    dodPct: 85,
    socRange: [10, 95],
    tempAllowed: [10, 38],
    cooling: 'LIQUID_COOLING',
    pulseRatio: 8,
    description: '充放电时长较长（4小时），但极端户外气候及沙尘高寒应力较大。'
  },
  MICROGRID_ISLAND: {
    name: '微电网孤岛离网与关键负荷备电',
    nominalCrate: 0.5,
    dailyCycles: 0.8,
    dodPct: 95,
    socRange: [5, 95],
    tempAllowed: [15, 35],
    cooling: 'AIR_COOLING',
    pulseRatio: 12,
    description: '浮充静置时间长，日历衰减占比高，偶发深充深放备电保供。'
  },
  HYBRID_MULTI_USE: {
    name: '多策略现货交易与辅助服务协同',
    nominalCrate: 0.75,
    dailyCycles: 2.1,
    dodPct: 92,
    socRange: [8, 92],
    tempAllowed: [15, 35],
    cooling: 'LIQUID_COOLING',
    pulseRatio: 22,
    description: '策略动态多变，需引入动态折算系数与月度工况审计纠偏。'
  }
};

/**
 * 核心基准工况 SOH 推演与履约风险评估引擎
 */
export function calculateBaselineConditionEvaluation(
  input: BaselineConditionInput
): BaselineConditionEvaluationResult {
  const years = Math.max(1, input.warrantyPeriodYears || 10);
  const targetEndSoh = input.guaranteedEndSohPct || 70.0;
  
  // 1. 应力因子计算
  // 温度因子: 25℃ 为理想基准，每偏离 1℃ 或极端超温累积增加衰减
  const tempDelta = Math.max(0, input.baselineCellTempC - 25);
  const extremeDaysWeight = (input.extremeHighTempDaysPerYear || 0) * 0.003;
  const tempStressWeight = 1.0 + tempDelta * 0.04 + extremeDaysWeight;

  // 倍率因子: 0.5C 为基准 1.0
  const crateStressWeight = Math.max(0.85, 1.0 + (input.nominalCrate - 0.5) * 0.65 + (input.highPowerPulseRatioPct / 100) * 0.4);

  // 放电深度 DOD 因子: 80% 为基准 1.0
  const dodStressWeight = Math.max(0.9, 1.0 + ((input.depthOfDischargeDodPct - 80) / 100) * 0.8);

  // 循环频次年等效 FEC
  const annualCycles = input.dailyFullEquivalentCycles * (input.annualOperatingDays || 350);

  // 综合加速老化因子
  const combinedStress = tempStressWeight * 0.35 + crateStressWeight * 0.35 + dodStressWeight * 0.30;

  // 2. 逐年衰减推演
  const annualSohTrend: AnnualSohPoint[] = [];
  const startYear = parseInt(input.commissioningDate ? input.commissioningDate.substring(0, 4) : '2026', 10) || 2026;

  let idealSoh = 100.0;
  let contractGuaranteedSoh = 100.0;
  let projectedSoh = 100.0;
  let worstCaseSoh = 100.0;

  let accumulatedCycles = 0;
  let accumulatedThroughput = 0;
  const annualThroughputMwh = input.expectedAnnualThroughputMwh || (input.capacityMwh * input.dailyFullEquivalentCycles * 350 * 0.9);

  let expectedBreachYear: number | undefined = undefined;

  for (let y = 0; y <= years; y++) {
    const calYear = `${startYear + y}`;
    if (y === 0) {
      annualSohTrend.push({
        year: 0,
        calendarYear: calYear,
        idealLabSohPct: 100.0,
        contractGuaranteedSohPct: 100.0,
        projectedBaselineSohPct: 100.0,
        worstCaseStressSohPct: 100.0,
        accumulatedCycles: 0,
        accumulatedThroughputMwh: 0
      });
      continue;
    }

    accumulatedCycles += Math.round(annualCycles);
    accumulatedThroughput += Math.round(annualThroughputMwh);

    // 标准实验室标称衰减 (理想情况)
    // 首次循环损耗 SEI ~2.0%, 后续年化 ~1.8%
    const idealYearDecay = y === 1 ? 2.5 : 1.7;
    idealSoh = Math.max(65.0, Number((idealSoh - idealYearDecay).toFixed(2)));

    // 合同保底保证曲线 (线性/两段式平滑到底线 targetEndSoh)
    const guaranteedYearlyDrop = (100.0 - targetEndSoh) / years;
    contractGuaranteedSoh = Math.max(targetEndSoh, Number((100.0 - y * guaranteedYearlyDrop).toFixed(2)));

    // 本次工况推演衰减
    // 综合工况衰减率 = 基础日历衰减 (1.1%) + 循环应力衰减 (0.0035% * cycles * combinedStress)
    const calendarDecay = 1.05;
    const cycleDecay = (annualCycles * 0.0032) * combinedStress;
    const actualYearDecay = y === 1 ? (calendarDecay + cycleDecay + 0.8) : (calendarDecay + cycleDecay);
    projectedSoh = Math.max(50.0, Number((projectedSoh - actualYearDecay).toFixed(2)));

    // 严苛恶劣超工况预测 (在输入工况基础上假定出现 1.25 倍应力偏离)
    const worstCaseDecay = actualYearDecay * 1.28;
    worstCaseSoh = Math.max(45.0, Number((worstCaseSoh - worstCaseDecay).toFixed(2)));

    // 检查是否跌破合同底线
    if (projectedSoh < contractGuaranteedSoh && expectedBreachYear === undefined) {
      expectedBreachYear = y;
    }

    annualSohTrend.push({
      year: y,
      calendarYear: calYear,
      idealLabSohPct: idealSoh,
      contractGuaranteedSohPct: contractGuaranteedSoh,
      projectedBaselineSohPct: projectedSoh,
      worstCaseStressSohPct: worstCaseSoh,
      accumulatedCycles,
      accumulatedThroughputMwh: accumulatedThroughput
    });
  }

  // 期末指标
  const endProjectedSoh = annualSohTrend[annualSohTrend.length - 1].projectedBaselineSohPct;
  const sohSafetyMargin = Number((endProjectedSoh - targetEndSoh).toFixed(2));
  const isCompliant = sohSafetyMargin >= 0;

  // 3. 风险等级评定
  let riskLevel: BaselineRiskLevel = 'LOW';
  let riskScore = 25;
  if (!isCompliant) {
    riskLevel = 'HIGH';
    riskScore = Math.min(95, 75 + Math.abs(sohSafetyMargin) * 4);
  } else if (sohSafetyMargin < 2.0) {
    riskLevel = 'MEDIUM';
    riskScore = Math.min(70, 50 + (2.0 - sohSafetyMargin) * 10);
  } else {
    riskLevel = 'LOW';
    riskScore = Math.max(15, 35 - sohSafetyMargin * 3);
  }

  // 4. 超工况应力项归因
  const stressFactors: StressFactorSensitivity[] = [
    {
      factorKey: 'TEMPERATURE',
      factorName: '电芯平均温升与极端超温',
      benchmarkValue: '25.0 ℃ (基准)',
      projectedValue: `${input.baselineCellTempC.toFixed(1)} ℃ (超温天数: ${input.extremeHighTempDaysPerYear}天)`,
      stressWeight: Number(tempStressWeight.toFixed(2)),
      impactSohReductionPct: Number(((tempStressWeight - 1.0) * 3.5).toFixed(2)),
      severity: tempStressWeight > 1.2 ? 'ALARM' : tempStressWeight > 1.08 ? 'WARNING' : 'NORMAL',
      description: input.baselineCellTempC > 28
        ? '电芯长期处于 28℃ 以上高位，阿伦尼乌斯化学反应速率加倍，负极 SEI 膜持续增厚。'
        : '温控设计基本处于良好区间，热失控与容量热加速衰减风险可控。'
    },
    {
      factorKey: 'CRATE',
      factorName: '充放电倍率与脉冲应力',
      benchmarkValue: '0.50 C (标称两充两放)',
      projectedValue: `${input.nominalCrate.toFixed(2)} C (脉冲占比: ${input.highPowerPulseRatioPct}%)`,
      stressWeight: Number(crateStressWeight.toFixed(2)),
      impactSohReductionPct: Number(((crateStressWeight - 1.0) * 3.0).toFixed(2)),
      severity: crateStressWeight > 1.2 ? 'ALARM' : crateStressWeight > 1.08 ? 'WARNING' : 'NORMAL',
      description: input.nominalCrate >= 1.0
        ? '大倍率充放导致正负极材料晶格相变剧烈，局部过电位引发极化加剧。'
        : '充放倍率符合标称电芯热平衡区间，机械应力较小。'
    },
    {
      factorKey: 'DOD',
      factorName: '标称放电深度 (DOD) 极限',
      benchmarkValue: '80.0% DOD',
      projectedValue: `${input.depthOfDischargeDodPct.toFixed(1)}% DOD (SOC: ${input.socOperatingLowerPct}%~${input.socOperatingUpperPct}%)`,
      stressWeight: Number(dodStressWeight.toFixed(2)),
      impactSohReductionPct: Number(((dodStressWeight - 1.0) * 2.5).toFixed(2)),
      severity: dodStressWeight > 1.15 ? 'ALARM' : dodStressWeight > 1.05 ? 'WARNING' : 'NORMAL',
      description: input.depthOfDischargeDodPct >= 95
        ? '深度过放触碰相界极限，负极脱锂脱嵌应变累积，易产生非活性锂析出。'
        : '放电深度预留安全缓冲区，有效规避拐点断崖式容量跳水。'
    },
    {
      factorKey: 'PULSE',
      factorName: '年等效循环次数 (FEC)',
      benchmarkValue: '525 次/年 (1.5次/日)',
      projectedValue: `${Math.round(annualCycles)} 次/年 (${input.dailyFullEquivalentCycles.toFixed(1)}次/日)`,
      stressWeight: Number((annualCycles / 525).toFixed(2)),
      impactSohReductionPct: Number((Math.max(0, annualCycles - 525) * 0.005).toFixed(2)),
      severity: annualCycles > 700 ? 'ALARM' : annualCycles > 580 ? 'WARNING' : 'NORMAL',
      description: annualCycles > 600
        ? '日均超 1.8 次循环，全生命周期通量达到电芯设计疲劳上限，需按等效吞吐折算质保。'
        : '循环负荷在常规保证范围以内。'
    }
  ];

  // 5. 建议合同条款与风控措施
  const clauseRecommendations: WarrantyContractClauseRecommendation[] = [
    {
      id: 'clause-01',
      category: 'EXCLUSION',
      categoryLabel: '超工况免责保护条款',
      clauseTitle: '电芯持续超温及最大温差免责触发线',
      clauseContent: `在质保期内，若电站因客户调度或冷却故障，单簇电芯温度持续超过 ${input.allowedCellTempMaxC}℃ 累计达 72 小时，或簇内温差 ΔT 超过 ${input.maxCellTempDifferenceC}℃ 持续达 48 小时，相应期间不纳入基准 SOH 衰减考核，且由此造成的不可逆容量损失由客户承担。`,
      riskMitigationValue: '完全规避因现场环温极端超温或液冷停机引发的电池厂家连带赔偿责任',
      priority: 'P0'
    },
    {
      id: 'clause-02',
      category: 'DYNAMIC_ADJUSTMENT',
      categoryLabel: '灵活质保动态折算条款',
      clauseTitle: '基于等效完全循环吞吐量 (FEC/Throughput) 的质保年限动态折算机制',
      clauseContent: `本合同约定的 ${input.warrantyPeriodYears} 年质保期，系基于年吞吐电量不超过 ${Math.round(annualThroughputMwh)} MWh 及年等效循环不超过 ${Math.round(annualCycles)} FEC。若经双方联合计量审计，实际吞吐量超出基准 10% 以上，质保年限按实际吞吐量等比动态前置折算，或由客户按 0.038 元/kWh 补缴超工况质保补充服务费。`,
      riskMitigationValue: '防止客户利用现货峰谷大负荷套利超频充放电，保障服务商合理收益与资产对冲',
      priority: 'P0'
    },
    {
      id: 'clause-03',
      category: 'PRICING',
      categoryLabel: '质保服务费率与保证金',
      clauseTitle: '阶梯式质保服务费与保证金比例配置',
      clauseContent: `建议基础质保服务费定价为 ${input.warrantyPricingPerWhPerYear.toFixed(4)} 元/Wh·年。尾款质保保证金建议锁定在 ${input.warrantyRetentionDepositPct}%，并在第 ${Math.round(years * 0.7)} 年末经第三方 SOH 检测达标后释放首期 50%，有效锁定资金流动性风险。`,
      riskMitigationValue: '平抑合同期末违约清算风险，确保长期现金流稳健',
      priority: 'P1'
    },
    {
      id: 'clause-04',
      category: 'MAINTENANCE',
      categoryLabel: '主动预防性维保配套条款',
      clauseTitle: '定期液冷介质更换与主动均衡校准服务承诺',
      clauseContent: `服务商每年提供 2 次主动均衡校准及液冷防冻液 pH 值耐压检测；在质保第 ${Math.max(3, Math.round(years * 0.5))} 年由服务商提供免费簇级短板容量重构评估，确保全站电芯一致性离散度控制在 2% 以内。`,
      riskMitigationValue: '从源头消除木桶短板提前截断导致的虚假 SOH 衰减超标',
      priority: 'P1'
    }
  ];

  // 6. 财务与履约风控测算
  const totalWh = input.capacityMwh * 1000 * 1000;
  const baseContractYuan = Number(((totalWh * input.warrantyPricingPerWhPerYear * years) / 10000).toFixed(1)); // 万元
  const projectedExceedingFee = !isCompliant 
    ? Number((baseContractYuan * 0.22).toFixed(1))
    : Number((baseContractYuan * 0.06).toFixed(1));

  const breachExposure = !isCompliant
    ? Number((Math.abs(sohSafetyMargin) * (input.penaltyPerOnePctSohBreachYuan || 25)).toFixed(1))
    : 0;

  const retentionDeposit = Number((baseContractYuan * (input.warrantyRetentionDepositPct / 100)).toFixed(1));

  const financialAssessment: FinancialWarrantyRiskAssessment = {
    baseWarrantyContractTotalYuan: baseContractYuan,
    projectedExceedingConditionServiceFeeYuan: projectedExceedingFee,
    potentialBreachExposureYuan: breachExposure,
    recommendedRetentionDepositYuan: retentionDeposit,
    warrantyRoiGainPct: Number((24.5 + (isCompliant ? 8.5 : -12.0)).toFixed(1))
  };

  // 综合判定结论
  const riskSummary = isCompliant
    ? `基准工况评估达标！质保期末（第 ${years} 年）预测 SOH 为 ${endProjectedSoh}%，高于合同底线 ${targetEndSoh}%，安全裕度为 +${sohSafetyMargin}%。在当前液冷与运行强度下具备优质可承保性。`
    : `注意！当前工况存在超负荷衰减风险！预测在第 ${expectedBreachYear || Math.round(years * 0.8)} 年 SOH 将跌破合同保证底线，期末预期 SOH 为 ${endProjectedSoh}% (缺口 -${Math.abs(sohSafetyMargin)}%)。建议引入动态折算条款或调低日循环次数！`;

  const maxTolerableCycles = Number(((525 * (targetEndSoh / (endProjectedSoh || 70.0)))).toFixed(0));
  const optimalSwapYear = expectedBreachYear ? Math.max(1, expectedBreachYear - 1) : Math.round(years * 0.7);

  return {
    riskLevel,
    riskScore: Math.round(riskScore),
    riskSummary,
    endOfWarrantyProjectedSohPct: endProjectedSoh,
    contractGuaranteedEndSohPct: targetEndSoh,
    sohSafetyMarginPct: sohSafetyMargin,
    isCompliant,
    expectedBreachYear,
    maxTolerableAnnualCycles: Math.min(850, Math.max(400, Number(maxTolerableCycles))),
    optimalSwapWindowYear: optimalSwapYear,
    annualSohTrend,
    stressFactors,
    clauseRecommendations,
    financialAssessment
  };
}
