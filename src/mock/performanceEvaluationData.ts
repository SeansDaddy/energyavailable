import {
  PerformanceFactor,
  ModuleMetric,
  CmuThermalRecord,
  PackSohMetric,
  SocBalanceRecord,
  DefectActionRecord,
  OptimizationAdviceItem,
  SiteHealthSummary,
  PerformanceHistoryRecord
} from '../types/performanceEvaluation';

// 4.11.2 预置 13 类性能影响因子清单 (支持权重与异常阈值配置)
export const INITIAL_PERFORMANCE_FACTORS: PerformanceFactor[] = [
  {
    id: 1,
    name: '电站初始容量配置',
    category: '容量设计',
    impactAnalysis: '电池总容量决定储能电站可用放电容量。设计容量不足,无法满足电网调节或负荷跟踪需求;超配则较容易满足承诺指标。',
    weight: 9,
    thresholdName: '装机额定冗余系数',
    unit: '%',
    warningThreshold: 105,
    criticalThreshold: 100,
    operator: '<',
    idealRange: '≥ 110%',
    currentValue: 104.2,
    currentValueDisplay: '104.2%',
    status: 'WARNING',
    isHit: true,
    hitReason: '初始装机冗余度为 104.2%，低于安全裕度 105%，在重负荷调峰工况下存在可用容量紧平衡风险。'
  },
  {
    id: 2,
    name: '充放电策略 / 充放电功率变化曲线',
    category: '策略与工况',
    impactAnalysis: '频繁的充放电循环增加能量损失,降低整体能效;高使用强度的充放电策略还可能导致电池老化加速,进一步影响综合能效 / RTE 指标。',
    weight: 9,
    thresholdName: '日均充放电倍率 (C-rate)',
    unit: 'C',
    warningThreshold: 0.65,
    criticalThreshold: 0.85,
    operator: '>',
    idealRange: '≤ 0.50 C',
    currentValue: 0.58,
    currentValueDisplay: '0.58 C',
    status: 'NORMAL',
    isHit: false
  },
  {
    id: 3,
    name: '使用工况(循环次数/日、充放电运行区间、充放电间隔时间、静置SOC)',
    category: '策略与工况',
    impactAnalysis: '使用工况越恶劣(充放电倍率越大、每日循环次数越多、充放电区间越大、间隔时间越小、静置SOC越高),电芯寿命衰减加快,SOH/AUC 越低。',
    weight: 10,
    thresholdName: '综合工况应力指数 (含日循环/静置SOC)',
    unit: '分',
    warningThreshold: 75,
    criticalThreshold: 85,
    operator: '>',
    idealRange: '≤ 70分',
    currentValue: 79.4,
    currentValueDisplay: '79.4分 (高静置SOC 82%)',
    status: 'WARNING',
    isHit: true,
    hitReason: '午间非充放电时段静置 SOC 长期维持在 82%~86% 高位，且充放电间隔短于 45 分钟，加剧电芯日历衰减。'
  },
  {
    id: 4,
    name: '一致性(模组 / PACK / 系统层级)',
    category: '一致性',
    impactAnalysis: '储能各层级通常根据最弱单元调整整体输出,一致性较差时受各级短板效应影响,系统充放电容量性能受限,SOH/AUC 较差。',
    weight: 11,
    thresholdName: '模组间压差极差 / 容量离散度',
    unit: 'mV',
    warningThreshold: 45,
    criticalThreshold: 70,
    operator: '>',
    idealRange: '≤ 30 mV',
    currentValue: 58.0,
    currentValueDisplay: '58 mV (离散度 4.6%)',
    status: 'WARNING',
    isHit: true,
    hitReason: '2号簇 M02-04 与 M02-07 模组放电截止压降过快，充放电截止触发木桶短板效应，限制整簇容量输出约 3.2%。'
  },
  {
    id: 5,
    name: '环境温度(运行环境)',
    category: '热管理与环境',
    impactAnalysis: '高温运行致制冷时间增加、辅电损耗增加,拉低综合能效;低温运行致非充放电时段加热时间增加、辅电损耗增加,拉低综合能效。',
    weight: 7,
    thresholdName: '仓内月均极端环境温度',
    unit: '℃',
    warningThreshold: 38,
    criticalThreshold: 42,
    operator: '>',
    idealRange: '18℃ ~ 28℃',
    currentValue: 36.5,
    currentValueDisplay: '36.5 ℃',
    status: 'NORMAL',
    isHit: false
  },
  {
    id: 6,
    name: '电芯温度',
    category: '热管理与环境',
    impactAnalysis: '温度对电池性能与寿命影响显著:高温加速老化,低温影响充放电效率与容量;无效热管理导致温度波动过大,影响整体性能。',
    weight: 9,
    thresholdName: '电芯工作最高温度 (CMU监测)',
    unit: '℃',
    warningThreshold: 35,
    criticalThreshold: 40,
    operator: '>',
    idealRange: '20℃ ~ 30℃',
    currentValue: 38.6,
    currentValueDisplay: '38.6 ℃',
    status: 'WARNING',
    isHit: true,
    hitReason: '重载放电末期 2 号簇顶层 CMU-08 采集点最高温度达到 38.6℃，超过 35℃ 预警阈值。'
  },
  {
    id: 7,
    name: '运行模式(VSG / 热备 / 冷备)',
    category: '策略与工况',
    impactAnalysis: '箱变空载损耗和 PCS 零功率损耗在不同运行模式下差异较大,影响系统综合能效。',
    weight: 6,
    thresholdName: '热备零负荷空载损耗占比',
    unit: '%',
    warningThreshold: 3.5,
    criticalThreshold: 5.0,
    operator: '>',
    idealRange: '≤ 2.0%',
    currentValue: 2.3,
    currentValueDisplay: '2.3%',
    status: 'NORMAL',
    isHit: false
  },
  {
    id: 8,
    name: '电气链接与线路损耗(箱变 / PCS / ESS / PACK)',
    category: '电气与损耗',
    impactAnalysis: '线路损耗过大可能导致实际可用容量低于理论值;某一部件效率过低,拉低整站 RTE 和综合能效表现。',
    weight: 8,
    thresholdName: '直流侧内阻损耗与综合链路压降',
    unit: '%',
    warningThreshold: 2.8,
    criticalThreshold: 4.0,
    operator: '>',
    idealRange: '≤ 2.0%',
    currentValue: 2.1,
    currentValueDisplay: '2.1%',
    status: 'NORMAL',
    isHit: false
  },
  {
    id: 9,
    name: '热管理系统 / 温控策略',
    category: '热管理与环境',
    impactAnalysis: '良好的热管理通过维持电池在适宜温度范围内工作,可提高电池效率,降低环境温度对 SOH/AUC 的影响。',
    weight: 8,
    thresholdName: '系统电芯最大温差 (ΔT)',
    unit: '℃',
    warningThreshold: 3.5,
    criticalThreshold: 5.0,
    operator: '>',
    idealRange: '≤ 2.5 ℃',
    currentValue: 4.8,
    currentValueDisplay: '4.8 ℃',
    status: 'CRITICAL',
    isHit: true,
    hitReason: '电芯间最大温差 ΔT 达到 4.8℃，液冷歧管进出口流量分配不均，3 号分支电磁阀开度迟滞。'
  },
  {
    id: 10,
    name: '辅电能耗',
    category: '热管理与环境',
    impactAnalysis: '制冷 / 加热等辅电损耗受环境温度与运行模式影响,直接影响综合能效(RTE)。',
    weight: 6,
    thresholdName: '辅电能耗占系统总吞吐比率',
    unit: '%',
    warningThreshold: 4.5,
    criticalThreshold: 6.0,
    operator: '>',
    idealRange: '≤ 3.5%',
    currentValue: 4.2,
    currentValueDisplay: '4.2%',
    status: 'NORMAL',
    isHit: false
  },
  {
    id: 11,
    name: '电池管理系统(BMS)',
    category: 'BMS与运维',
    impactAnalysis: '非满充放评估容量时受预估精度影响,导致充放电量偏低;BMS 设计不合理或性能不佳,可能导致过充、过放、不均衡,加速老化或限制放电量。',
    weight: 7,
    thresholdName: 'BMS SOC 预估精度误差',
    unit: '%',
    warningThreshold: 4.0,
    criticalThreshold: 7.0,
    operator: '>',
    idealRange: '≤ 2.5%',
    currentValue: 3.1,
    currentValueDisplay: '3.1%',
    status: 'NORMAL',
    isHit: false
  },
  {
    id: 12,
    name: '维护与管理(故障处理、定期维护)',
    category: 'BMS与运维',
    impactAnalysis: '定期检查维护可及时发现并解决潜在问题,延长寿命、减少能量损失、提高综合能效;维护不及时会导致 SOH/AUC 下降。',
    weight: 5,
    thresholdName: '巡检与工单闭环延期率',
    unit: '%',
    warningThreshold: 10,
    criticalThreshold: 20,
    operator: '>',
    idealRange: '0%',
    currentValue: 4.0,
    currentValueDisplay: '4.0%',
    status: 'NORMAL',
    isHit: false
  },
  {
    id: 13,
    name: '电芯本体问题(低压、漏液、跳水等)',
    category: '电芯缺陷',
    impactAnalysis: '电芯本体缺陷直接引发故障,影响系统可用性与 SOH。',
    weight: 7,
    thresholdName: '电芯自放电率 / 异常压降跳水事件数',
    unit: '次/月',
    warningThreshold: 1,
    criticalThreshold: 3,
    operator: '>',
    idealRange: '0 次',
    currentValue: 2,
    currentValueDisplay: '2 次 (已定位短板模组)',
    status: 'WARNING',
    isHit: true,
    hitReason: '检测到 M02-04 在 15% 低 SOC 阶段出现 2 次电压陡降加速（压降跳水特征），具有内部轻微缺陷隐患。'
  }
];

// 日常模组工况数据
export const INITIAL_MODULE_METRICS: ModuleMetric[] = [
  {
    id: 'm-01',
    moduleCode: 'M01-01',
    cluster: '1号储能簇',
    voltageMaxV: 3.48,
    voltageMinV: 3.42,
    voltageDeltaMv: 24,
    currentRateC: 0.50,
    actualCapacityAh: 278.4,
    ratedCapacityAh: 280,
    capacityRetentionPct: 99.4,
    dailyCycles: 1.8,
    restSocPct: 65,
    aucScore: 95.8,
    status: 'NORMAL'
  },
  {
    id: 'm-02',
    moduleCode: 'M01-02',
    cluster: '1号储能簇',
    voltageMaxV: 3.47,
    voltageMinV: 3.41,
    voltageDeltaMv: 26,
    currentRateC: 0.50,
    actualCapacityAh: 277.2,
    ratedCapacityAh: 280,
    capacityRetentionPct: 99.0,
    dailyCycles: 1.8,
    restSocPct: 66,
    aucScore: 94.6,
    status: 'NORMAL'
  },
  {
    id: 'm-03',
    moduleCode: 'M02-04',
    cluster: '2号储能簇',
    voltageMaxV: 3.51,
    voltageMinV: 3.32,
    voltageDeltaMv: 68,
    currentRateC: 0.58,
    actualCapacityAh: 254.0,
    ratedCapacityAh: 280,
    capacityRetentionPct: 90.7,
    dailyCycles: 2.1,
    restSocPct: 84,
    aucScore: 81.2,
    status: 'CRITICAL',
    abnormalReason: '【短板模组】压差达 68mV，低 SOC 端放电截止提前，拖累整簇可用容量'
  },
  {
    id: 'm-04',
    moduleCode: 'M02-07',
    cluster: '2号储能簇',
    voltageMaxV: 3.49,
    voltageMinV: 3.37,
    voltageDeltaMv: 52,
    currentRateC: 0.55,
    actualCapacityAh: 261.2,
    ratedCapacityAh: 280,
    capacityRetentionPct: 93.3,
    dailyCycles: 2.0,
    restSocPct: 82,
    aucScore: 86.5,
    status: 'WARNING',
    abnormalReason: '【一致性衰退】静置自放电速率高于均值 18%，建议执行主动均衡'
  },
  {
    id: 'm-05',
    moduleCode: 'M03-01',
    cluster: '3号储能簇',
    voltageMaxV: 3.48,
    voltageMinV: 3.43,
    voltageDeltaMv: 22,
    currentRateC: 0.48,
    actualCapacityAh: 276.5,
    ratedCapacityAh: 280,
    capacityRetentionPct: 98.8,
    dailyCycles: 1.7,
    restSocPct: 62,
    aucScore: 96.0,
    status: 'NORMAL'
  },
  {
    id: 'm-06',
    moduleCode: 'M03-08',
    cluster: '3号储能簇',
    voltageMaxV: 3.46,
    voltageMinV: 3.40,
    voltageDeltaMv: 28,
    currentRateC: 0.49,
    actualCapacityAh: 275.0,
    ratedCapacityAh: 280,
    capacityRetentionPct: 98.2,
    dailyCycles: 1.7,
    restSocPct: 64,
    aucScore: 93.5,
    status: 'NORMAL'
  },
  {
    id: 'm-07',
    moduleCode: 'M04-03',
    cluster: '4号储能簇',
    voltageMaxV: 3.48,
    voltageMinV: 3.41,
    voltageDeltaMv: 35,
    currentRateC: 0.52,
    actualCapacityAh: 272.4,
    ratedCapacityAh: 280,
    capacityRetentionPct: 97.3,
    dailyCycles: 1.9,
    restSocPct: 70,
    aucScore: 91.2,
    status: 'NORMAL'
  }
];

// CMU 温度分析记录 (支持多小时趋势与热力分析)
export const INITIAL_CMU_RECORDS: CmuThermalRecord[] = [
  {
    cmuId: 'cmu-01',
    cmuCode: 'CMU-1-BOT',
    location: '1号簇-底层模组排',
    cluster: '1号储能簇',
    currentTemp: 26.2,
    maxTemp: 28.5,
    minTemp: 24.1,
    deltaT: 2.1,
    ambientTemp: 24.0,
    coolingMode: 'LIQUID_COOLING',
    thermalStatus: 'OPTIMAL',
    thermalAdvice: '换热状态优良，进液温度 21℃，维持当前温控逻辑。',
    hourlyTrends: [
      { time: '00:00', cmuTemp: 23.5, ambientTemp: 22.0, coolingPowerKw: 4.2 },
      { time: '04:00', cmuTemp: 22.8, ambientTemp: 21.5, coolingPowerKw: 3.8 },
      { time: '08:00', cmuTemp: 24.8, ambientTemp: 23.0, coolingPowerKw: 5.5 },
      { time: '12:00', cmuTemp: 27.2, ambientTemp: 27.5, coolingPowerKw: 7.8 },
      { time: '16:00', cmuTemp: 28.5, ambientTemp: 29.0, coolingPowerKw: 8.5 },
      { time: '20:00', cmuTemp: 26.2, ambientTemp: 25.5, coolingPowerKw: 6.2 }
    ]
  },
  {
    cmuId: 'cmu-08',
    cmuCode: 'CMU-2-TOP',
    location: '2号簇-顶层模组排 (近舱顶排风口)',
    cluster: '2号储能簇',
    currentTemp: 38.6,
    maxTemp: 39.8,
    minTemp: 29.2,
    deltaT: 4.8,
    ambientTemp: 34.5,
    coolingMode: 'LIQUID_COOLING',
    thermalStatus: 'OVERHEATED',
    thermalAdvice: '顶层局部积热严重，建议检查液冷分流阀并调整机舱顶层排风风道导流板开度。',
    hourlyTrends: [
      { time: '00:00', cmuTemp: 28.5, ambientTemp: 23.0, coolingPowerKw: 5.2 },
      { time: '04:00', cmuTemp: 27.2, ambientTemp: 22.0, coolingPowerKw: 4.8 },
      { time: '08:00', cmuTemp: 31.8, ambientTemp: 25.5, coolingPowerKw: 7.2 },
      { time: '12:00', cmuTemp: 37.5, ambientTemp: 32.0, coolingPowerKw: 11.5 },
      { time: '16:00', cmuTemp: 39.8, ambientTemp: 35.2, coolingPowerKw: 13.0 },
      { time: '20:00', cmuTemp: 38.6, ambientTemp: 31.0, coolingPowerKw: 10.5 }
    ]
  },
  {
    cmuId: 'cmu-12',
    cmuCode: 'CMU-3-MID',
    location: '3号簇-中层模组排',
    cluster: '3号储能簇',
    currentTemp: 29.4,
    maxTemp: 31.2,
    minTemp: 26.0,
    deltaT: 2.8,
    ambientTemp: 26.5,
    coolingMode: 'LIQUID_COOLING',
    thermalStatus: 'ACCEPTABLE',
    thermalAdvice: '运行在正常工况区间，温升速率与充放电功率拟合度正常。',
    hourlyTrends: [
      { time: '00:00', cmuTemp: 25.0, ambientTemp: 22.5, coolingPowerKw: 4.5 },
      { time: '04:00', cmuTemp: 24.1, ambientTemp: 21.8, coolingPowerKw: 4.0 },
      { time: '08:00', cmuTemp: 27.0, ambientTemp: 24.0, coolingPowerKw: 6.0 },
      { time: '12:00', cmuTemp: 30.5, ambientTemp: 29.0, coolingPowerKw: 8.8 },
      { time: '16:00', cmuTemp: 31.2, ambientTemp: 30.5, coolingPowerKw: 9.2 },
      { time: '20:00', cmuTemp: 29.4, ambientTemp: 27.0, coolingPowerKw: 7.0 }
    ]
  }
];

// PACK 级 SOH 评估数据
export const INITIAL_PACK_SOH_METRICS: PackSohMetric[] = [
  {
    packId: 'pack-01',
    packCode: 'PACK-01 (1号簇)',
    cluster: '1号簇',
    soh: 96.8,
    sohGrade: 'EXCELLENT',
    capacityLossPct: 3.2,
    dcirMOhms: 0.62,
    dcirGrowthPct: 5.1,
    coulombicEfficiency: 99.7,
    isStandard: true,
    bottleneckImpact: '无瓶颈制约，保持标准循环衰减曲线。',
    historyTrend: [
      { month: '2026-03', actualSoh: 98.9, predictedSoh: 98.8 },
      { month: '2026-04', actualSoh: 98.3, predictedSoh: 98.2 },
      { month: '2026-05', actualSoh: 97.9, predictedSoh: 97.7 },
      { month: '2026-06', actualSoh: 97.4, predictedSoh: 97.2 },
      { month: '2026-07', actualSoh: 97.1, predictedSoh: 96.9 },
      { month: '2026-08', actualSoh: 96.8, predictedSoh: 96.6 }
    ]
  },
  {
    packId: 'pack-04',
    packCode: 'PACK-04 (2号簇-短板)',
    cluster: '2号簇',
    soh: 88.4,
    sohGrade: 'FAIR',
    capacityLossPct: 11.6,
    dcirMOhms: 0.89,
    dcirGrowthPct: 24.8,
    coulombicEfficiency: 97.8,
    isStandard: false,
    bottleneckImpact: '【触发短板限制】该 PACK 内阻高且 SOH 跌破 90%，导致整簇提早到达下限截止，限制容量输出 3.2%。',
    historyTrend: [
      { month: '2026-03', actualSoh: 96.5, predictedSoh: 96.2 },
      { month: '2026-04', actualSoh: 94.8, predictedSoh: 94.6 },
      { month: '2026-05', actualSoh: 93.1, predictedSoh: 93.0 },
      { month: '2026-06', actualSoh: 91.2, predictedSoh: 91.1 },
      { month: '2026-07', actualSoh: 89.6, predictedSoh: 89.5 },
      { month: '2026-08', actualSoh: 88.4, predictedSoh: 88.0 }
    ]
  },
  {
    packId: 'pack-07',
    packCode: 'PACK-07 (3号簇)',
    cluster: '3号簇',
    soh: 95.1,
    sohGrade: 'EXCELLENT',
    capacityLossPct: 4.9,
    dcirMOhms: 0.65,
    dcirGrowthPct: 7.2,
    coulombicEfficiency: 99.5,
    isStandard: true,
    bottleneckImpact: '衰减平稳，符合前 3 年保修衰减履约基准。',
    historyTrend: [
      { month: '2026-03', actualSoh: 98.0, predictedSoh: 98.0 },
      { month: '2026-04', actualSoh: 97.4, predictedSoh: 97.3 },
      { month: '2026-05', actualSoh: 96.8, predictedSoh: 96.7 },
      { month: '2026-06', actualSoh: 96.2, predictedSoh: 96.0 },
      { month: '2026-07', actualSoh: 95.6, predictedSoh: 95.4 },
      { month: '2026-08', actualSoh: 95.1, predictedSoh: 94.9 }
    ]
  }
];

// SOC 均衡支持数据
export const INITIAL_SOC_BALANCE_RECORDS: SocBalanceRecord[] = [
  {
    id: 'soc-b-01',
    packCode: 'PACK-04 (2号簇)',
    cluster: '2号簇',
    currentSoc: 78.5,
    targetSoc: 85.0,
    deltaSoc: 6.5,
    balanceType: 'MANUAL_ONSITE',
    balanceTypeLabel: '现场便携充电机介入补电均衡',
    triggerCondition: 'ΔSOC > 5.0% 且软件主动均衡无法在3小时内收敛',
    executionStatus: 'PENDING_MANUAL',
    lastExecutedTime: '2026-08-18 14:00',
    gainDescription: '现场人工补电介入后，预估可消除 6.5% 不均衡，释放 2.4 MWh 有效吞吐',
    beforeDeltaSoc: 7.2,
    afterDeltaSoc: 1.5
  },
  {
    id: 'soc-b-02',
    packCode: 'PACK-07 (3号簇)',
    cluster: '3号簇',
    currentSoc: 83.2,
    targetSoc: 85.0,
    deltaSoc: 1.8,
    balanceType: 'SOFTWARE_ACTIVE',
    balanceTypeLabel: 'BMS 策略触发软件主动均衡',
    triggerCondition: '充放电静置阶段满足 SOC 极差 > 1.5%',
    executionStatus: 'BALANCED',
    lastExecutedTime: '2026-08-20 02:30',
    gainDescription: '系统夜间静置自动完成微均衡，恢复压差一致性至 18mV',
    beforeDeltaSoc: 3.1,
    afterDeltaSoc: 0.9
  }
];

// 故障消缺记录
export const INITIAL_DEFECT_RECORDS: DefectActionRecord[] = [
  {
    id: 'df-01',
    defectType: 'LOW_EFFICIENCY_DIAG',
    defectTypeLabel: '低效率故障定位与处理',
    title: '2号储能柜 PCS 功率模块散热风道积尘致转换效率降低排查',
    targetDevice: 'PCS-02 逆变升压单元',
    triggerAlarmOrCode: 'ALM-PCS-EFF-089',
    beforeMetric: '转换效率 RTE 87.2%',
    afterMetric: '转换效率 RTE 恢复至 91.5%',
    efficiencyGain: '综合能效提升 +4.3%，日充放损耗降低 180 kWh',
    completedAt: '2026-08-15 16:20',
    operator: '张维保 (现场工程师)',
    status: 'COMPLETED',
    residualIssues: ['风道滤网需在下月例行业务定检中增加清洗频次']
  },
  {
    id: 'df-02',
    defectType: 'HARDWARE_REPLACE',
    defectTypeLabel: '短板硬件消缺与替换',
    title: 'PACK-04 中短板电芯模组 M02-04 备件申请与替换准备',
    targetDevice: '2号簇 PACK-04 电池模组',
    triggerAlarmOrCode: 'ALM-BMS-CELL-V-DROP',
    beforeMetric: 'SOH 88.4%，内阻增长 24.8%',
    afterMetric: '预估替换后恢复 SOH 至 96.5%',
    efficiencyGain: '消除全站最大短板木桶瓶颈，预计释放受限放电量 3.2%',
    completedAt: '2026-08-22 (方案已敲定，备件发货中)',
    operator: '李工 (仓储调配组)',
    status: 'IN_PROGRESS',
    residualIssues: ['备品备件抵达现场后需安排 4 小时窗口期停电更换']
  },
  {
    id: 'df-03',
    defectType: 'ALARM_CLEAR',
    defectTypeLabel: '误报告警消除与参数校验',
    title: 'CMU-08 热敏探头瞬态毛刺滤波算法升级消警',
    targetDevice: 'CMU-08 采集线束',
    triggerAlarmOrCode: 'ALM-TEMP-SPIKE-WARN',
    beforeMetric: '日均误发高温告警 3 次',
    afterMetric: '告警误报归零，数据连续稳定',
    efficiencyGain: '杜绝误降额保护触发，挽回不必要停机损耗',
    completedAt: '2026-08-16 11:30',
    operator: '王软件 (研发支持)',
    status: 'COMPLETED',
    residualIssues: []
  }
];

// 4.11.3 分级优化建议清单 (紧急 / 一般 / 观察)
export const INITIAL_OPTIMIZATION_ADVICES: OptimizationAdviceItem[] = [
  {
    id: 'adv-01',
    level: 'CRITICAL',
    factorId: 4,
    factorName: '一致性 (模组/PACK层级)',
    title: '尽快实施 2 号簇 PACK-04 模组更换或现场深度补电均衡',
    problemStatement: '2 号簇 M02-04 模组压差达 68mV，SOH 仅 88.4%，严重触发短板木桶效应，使全站放电深度受制约。',
    actionGuideline: '协调现场便携充电机介入单模组补电，并推进备件到位后执行模组物理替换。',
    expectedBenefit: '消除短板木桶限制，直接恢复电站可用放电容量 +3.2%，消除SLA跌破违约风险。',
    targetScope: '2号储能簇 / PACK-04 / M02-04',
    deadline: '72 小时内'
  },
  {
    id: 'adv-02',
    level: 'CRITICAL',
    factorId: 9,
    factorName: '热管理系统 / 温控策略',
    title: '疏通 2 号簇顶层排风风道并校准 3 号液冷电磁阀开度',
    problemStatement: 'CMU-08 采集点最高温度达 38.6℃，最大温差 ΔT 达到 4.8℃，高出设计标称上限。',
    actionGuideline: '排查舱顶导流挡板卡涩，增加液冷支路回水开度，将液冷启动阈值由 32℃ 微调至 29℃。',
    expectedBenefit: '压低电芯峰值温度至 33℃ 以下，温差收敛至 2.5℃ 内，减缓电芯日历衰减 15%。',
    targetScope: '液冷温控单元 / 2号储能柜顶层风道',
    deadline: '48 小时内'
  },
  {
    id: 'adv-03',
    level: 'NORMAL',
    factorId: 3,
    factorName: '使用工况 (静置SOC与循环)',
    title: '优化调峰间歇静置 SOC 策略，避免长期处于 80%+ 高位',
    problemStatement: '午间非充放电时段静置 SOC 处于 82%~86%，高 SOC 静置导致电芯 SEI 膜持续副反应加剧。',
    actionGuideline: '建议调度平台调整午间谷段策略，将待机静置 SOC 控制在 50%~60% 黄金寿命区间。',
    expectedBenefit: '显著降低容量不可逆日历衰减，延缓年化衰减率约 0.35%。',
    targetScope: 'EMS 能量调度控制策略',
    deadline: '7 天内'
  },
  {
    id: 'adv-04',
    level: 'NORMAL',
    factorId: 1,
    factorName: '电站初始容量配置',
    title: '当前装机冗余度偏紧，建议在迎峰度夏高负荷期建立容量动态监控机制',
    problemStatement: '初始冗余度 104.2%，随着电池正常衰减，预计在第 2 年末放电深度将逼近考核临界线。',
    actionGuideline: '利用性能体检模型按月推演可用容量演化曲线，适时提出后备舱补电扩容规划建议。',
    expectedBenefit: '提前锁定客户二期扩容商机，确保合同全生命周期 SLA 履约免罚。',
    targetScope: '售前与履约商机转化',
    deadline: '本月内'
  },
  {
    id: 'adv-05',
    level: 'OBSERVATION',
    factorId: 10,
    factorName: '辅电能耗',
    title: '持续观测冷水机组夏季制冷电耗，适时启用春秋季自然冷循环模式',
    problemStatement: '目前辅电能耗占比 4.2%，在盛夏季节处于受控边界内。',
    actionGuideline: '观察季节交替时外界环境温度变化，当室外低于 18℃ 时切入自然冷却热交换。',
    expectedBenefit: '预计在过渡季节可削减辅电损耗 25%，提高全站综合能效 RTE 0.8%。',
    targetScope: '制冷辅电回路',
    deadline: '长期观察'
  }
];

// 综合体检结果对象
export const INITIAL_SITE_HEALTH_SUMMARY: SiteHealthSummary = {
  siteId: 'site-001',
  siteName: '深圳光明储能电站二期-04号站',
  evaluatedAt: '2026-08-20 16:30',
  overallScore: 82.5,
  grade: 'GOOD',
  gradeLabel: '良好 (存在局部温控短板与模组不均衡隐患)',
  hitFactors: INITIAL_PERFORMANCE_FACTORS.filter(f => f.isHit),
  adviceList: INITIAL_OPTIMIZATION_ADVICES,
  keyHighlights: [
    '命中 5 项性能影响因子：一致性差(M02-04压差68mV)、电芯局部高温(38.6℃)、温差超标(4.8℃)、高静置SOC(82%)与初始容量冗余偏紧(104.2%)',
    '已梳理输出 2 项紧急优化措施、2 项一般优化措施、1 项持续观察建议',
    '消除短板模组木桶限制与温控优化后，预计可提升综合放电可用度 +0.88%，综合 RTE 提升 +1.2%'
  ]
};

// 历史评估分析记录 (支持多版本追溯与对比)
export const INITIAL_PERFORMANCE_HISTORY: PerformanceHistoryRecord[] = [
  {
    id: 'eval-hist-01',
    siteId: 'site-001',
    evaluatedAt: '2026-08-20 16:30',
    versionNo: 'REV-20260820-02',
    logFileName: 'SZ-GM-04_BMS_EMS_20260801_20260815.tar.gz',
    logFileSize: '48.6 MB',
    logPeriod: '2026-08-01 ~ 2026-08-15',
    overallScore: 82.5,
    grade: 'GOOD',
    gradeLabel: '良好 (存在局部温控与模组不均衡隐患)',
    hitFactorsCount: 5,
    hitFactorNames: ['一致性(模组/PACK)', '热管理温差超标', '电芯局部高温', '使用工况高静置SOC', '电站初始容量配置'],
    evaluator: '张工 (高级服务专家)',
    summary: '检测到 2 号簇 M02-04 模组严重压差达 68mV，CMU-08 温差 4.8℃，短板木桶限制容量 3.2%。已输出 2 项紧急、2 项一般措施。',
    factors: INITIAL_PERFORMANCE_FACTORS,
    advicesCount: 5
  },
  {
    id: 'eval-hist-02',
    siteId: 'site-001',
    evaluatedAt: '2026-07-25 10:15',
    versionNo: 'REV-20260725-01',
    logFileName: 'SZ-GM-04_PCS_BMS_20260701_20260720.zip',
    logFileSize: '42.1 MB',
    logPeriod: '2026-07-01 ~ 2026-07-20',
    overallScore: 76.8,
    grade: 'MEDIUM',
    gradeLabel: '亚健康 (高温重载致热管理与损耗加剧)',
    hitFactorsCount: 7,
    hitFactorNames: ['PCS转换效率损耗', '辅电能耗偏高', '一致性衰退', '热管理温差超标', '电芯最高温度超标', '高静置SOC', '初始容量冗余偏紧'],
    evaluator: '李维保 (现场工程师)',
    summary: '盛夏重载阶段 PCS-02 散热受阻导致 RTE 跌至 87.2%，辅电能耗上升至 5.1%。随后实施了风道清灰及消缺动作。',
    factors: INITIAL_PERFORMANCE_FACTORS.map(f => {
      if (f.id === 7 || f.id === 8 || f.id === 10) {
        return { ...f, isHit: true, status: 'WARNING' };
      }
      return f;
    }),
    advicesCount: 7
  },
  {
    id: 'eval-hist-03',
    siteId: 'site-001',
    evaluatedAt: '2026-06-20 14:00',
    versionNo: 'REV-20260620-01',
    logFileName: 'SZ-GM-04_DAILY_LOGS_20260601_20260618.csv',
    logFileSize: '28.4 MB',
    logPeriod: '2026-06-01 ~ 2026-06-18',
    overallScore: 89.4,
    grade: 'GOOD',
    gradeLabel: '良好 (工况平稳，无严重短板)',
    hitFactorsCount: 2,
    hitFactorNames: ['电站初始容量配置', '使用工况高静置SOC'],
    evaluator: '系统自动化周期体检',
    summary: '各储能簇模组一致性良好，全站无超过 40mV 压差模组，温控工作平稳，仅高静置 SOC 需轻微关注。',
    factors: INITIAL_PERFORMANCE_FACTORS.map(f => {
      if (f.id === 4 || f.id === 6 || f.id === 9 || f.id === 13) {
        return { ...f, isHit: false, status: 'NORMAL' };
      }
      return f;
    }),
    advicesCount: 3
  },
  {
    id: 'eval-hist-04',
    siteId: 'site-001',
    evaluatedAt: '2026-05-15 09:30',
    versionNo: 'REV-20260515-01',
    logFileName: 'SZ-GM-04_ACCEPTANCE_LOGS_202605.zip',
    logFileSize: '54.0 MB',
    logPeriod: '2026-05-01 ~ 2026-05-14',
    overallScore: 94.2,
    grade: 'EXCELLENT',
    gradeLabel: '优良 (新投运健康基准态)',
    hitFactorsCount: 1,
    hitFactorNames: ['电站初始容量配置偏紧 (104.2%)'],
    evaluator: '王交付 (项目总监)',
    summary: '投运初验阶段性能综合基线，所有模组电压极差 < 25mV，SOH 均为 100%，温差 ΔT < 2.0℃，作为全生命周期性能基线标杆。',
    factors: INITIAL_PERFORMANCE_FACTORS.map(f => {
      if (f.id !== 1) {
        return { ...f, isHit: false, status: 'NORMAL', currentValueDisplay: '正常基线' };
      }
      return f;
    }),
    advicesCount: 1
  }
];
