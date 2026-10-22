import {
  PerformanceFactor,
  ModuleMetric,
  CmuThermalRecord,
  PackSohMetric,
  SocBalanceRecord,
  DefectActionRecord,
  OptimizationAdviceItem,
  SiteHealthSummary,
  PerformanceHistoryRecord,
  AvailabilityMetricData,
  EquipmentFailureRecord,
  FailureAlarmItem,
  RtePerformanceData,
  ChargeDischargeStrategy,
  AmbientTemperatureData,
  OperatingModeData,
  CellTemperatureData,
  TransformerEfficiencyData,
  PcsEfficiencyData,
  LossWaterfallItem,
  UsableCapacityData,
  CapacityTestCondition,
  ClusterCapacityItem,
  SohComprehensiveData,
  SocConsistencyData,
  ElectricalEnergyData,
  SohConsistencyData,
  OperatingConditionData
} from '../types/performanceEvaluation';
import {
  INITIAL_PERFORMANCE_FACTORS,
  INITIAL_MODULE_METRICS,
  INITIAL_CMU_RECORDS,
  INITIAL_PACK_SOH_METRICS,
  INITIAL_SOC_BALANCE_RECORDS,
  INITIAL_DEFECT_RECORDS,
  INITIAL_OPTIMIZATION_ADVICES,
  INITIAL_PERFORMANCE_HISTORY
} from './performanceEvaluationData';

export interface SitePerformanceConditionSummary {
  siteId: string;
  siteCode: string;
  siteName: string;
  region: string;
  representativeOffice: string;
  customer: string;
  capacityMw: number;
  overallScore: number; // 0 - 100
  grade: 'EXCELLENT' | 'GOOD' | 'MEDIUM' | 'RISKY'; // 优良 (>=90) / 良好 (80-89) / 关注 (70-79) / 风险 (<70)
  gradeLabel: string;
  hitFactorsCount: number; // e.g. 4
  totalFactorsCount: number; // 13
  topBottleneckFactor: string; // 核心短板因子描述
  maxVoltageDeltaMv: number; // 模组最大压差 mV
  bottleneckModuleCode: string; // 如 "M02-04"
  maxCmuDeltaT: number; // CMU 最大温差 ℃
  maxCmuTemp: number; // CMU 最高温 ℃
  thermalStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'OVERHEATED' | 'COOLING_DEFECT';
  minPackSoh: number; // PACK 最低 SOH %
  abnormalPackCount: number; // SOH < 90% 的 PACK 数量
  deltaSocPct: number; // SOC 不均衡度 %
  rtePct: number; // 系统综合充放电能效 RTE %
  pendingActionsCount: number; // 待消缺与优化建议项数
  criticalActionsCount: number; // 紧急优化项数
  lastEvaluatedTime: string; // 最新体检时间
  versionNo: string; // 评估版本
  // 新增指标看板字段
  availabilityRate: number; // 可用率 %
  eaf: number; // 等效可用系数 %
  ratedCapacityMwh: number; // 额定容量 MWh
  usableCapacityMwh: number; // 实测可用容量 MWh
  guaranteedCapacityMwh: number; // 保证容量 MWh
  capacityRetentionPct: number; // 容量保持率 %
}

// 8个站点的性能工况台账汇总数据（参考可用度监控结构）
export const INITIAL_SITE_PERFORMANCE_SUMMARIES: SitePerformanceConditionSummary[] = [
  {
    siteId: 'site-001',
    siteCode: 'SZ-ESS-0042',
    siteName: '深圳光明储能电站二期-04号站',
    region: '华南区',
    representativeOffice: '深圳代表处',
    customer: '南方电网深圳供电局',
    capacityMw: 10.0,
    overallScore: 78,
    grade: 'MEDIUM',
    gradeLabel: '关注 (存在模组压差与温控短板)',
    hitFactorsCount: 4,
    totalFactorsCount: 13,
    topBottleneckFactor: 'M02-04 模组放电截止压降陡增 & 顶层电芯局部高温',
    maxVoltageDeltaMv: 68,
    bottleneckModuleCode: 'M02-04',
    maxCmuDeltaT: 4.8,
    maxCmuTemp: 38.6,
    thermalStatus: 'OVERHEATED',
    minPackSoh: 88.4,
    abnormalPackCount: 1,
    deltaSocPct: 6.5,
    rtePct: 86.8,
    pendingActionsCount: 3,
    criticalActionsCount: 2,
    lastEvaluatedTime: '2026-08-20 16:30',
    versionNo: 'REV-20260820-01',
    availabilityRate: 99.28,
    eaf: 99.15,
    ratedCapacityMwh: 20.0,
    usableCapacityMwh: 19.28,
    guaranteedCapacityMwh: 19.00,
    capacityRetentionPct: 96.4
  },
  {
    siteId: 'site-002',
    siteCode: 'SH-BW-0108',
    siteName: '上海宝武钢铁微电网储能示范站-01站',
    region: '华东区',
    representativeOffice: '上海代表处',
    customer: '中国宝武钢铁集团',
    capacityMw: 20.0,
    overallScore: 96,
    grade: 'EXCELLENT',
    gradeLabel: '优良 (全站各簇电芯一致性极佳)',
    hitFactorsCount: 0,
    totalFactorsCount: 13,
    topBottleneckFactor: '各项因子皆在理想区间，无短板木桶制约',
    maxVoltageDeltaMv: 18,
    bottleneckModuleCode: 'M01-03',
    maxCmuDeltaT: 1.8,
    maxCmuTemp: 28.5,
    thermalStatus: 'OPTIMAL',
    minPackSoh: 97.2,
    abnormalPackCount: 0,
    deltaSocPct: 1.4,
    rtePct: 91.5,
    pendingActionsCount: 0,
    criticalActionsCount: 0,
    lastEvaluatedTime: '2026-08-20 16:15',
    versionNo: 'REV-20260820-01',
    availabilityRate: 99.85,
    eaf: 99.78,
    ratedCapacityMwh: 40.0,
    usableCapacityMwh: 39.20,
    guaranteedCapacityMwh: 38.00,
    capacityRetentionPct: 98.0
  },
  {
    siteId: 'site-003',
    siteCode: 'NW-XA-0019',
    siteName: '西安高新热电联产储能调峰站',
    region: '西北区',
    representativeOffice: '西安代表处',
    customer: '陕煤电力集团',
    capacityMw: 15.0,
    overallScore: 83,
    grade: 'GOOD',
    gradeLabel: '良好 (高倍率工况应力偏高，建议调优静置SOC)',
    hitFactorsCount: 2,
    totalFactorsCount: 13,
    topBottleneckFactor: '午间静置 SOC 长期在 84% 高位，导致日历老化略快',
    maxVoltageDeltaMv: 46,
    bottleneckModuleCode: 'M01-08',
    maxCmuDeltaT: 3.6,
    maxCmuTemp: 33.2,
    thermalStatus: 'ACCEPTABLE',
    minPackSoh: 92.4,
    abnormalPackCount: 0,
    deltaSocPct: 3.8,
    rtePct: 88.4,
    pendingActionsCount: 2,
    criticalActionsCount: 0,
    lastEvaluatedTime: '2026-08-19 11:00',
    versionNo: 'REV-20260819-02',
    availabilityRate: 99.42,
    eaf: 99.30,
    ratedCapacityMwh: 30.0,
    usableCapacityMwh: 28.95,
    guaranteedCapacityMwh: 28.50,
    capacityRetentionPct: 96.5
  },
  {
    siteId: 'site-004',
    siteCode: 'HB-BJ-0077',
    siteName: '北京怀柔科学城智能微电网站-03站',
    region: '华北区',
    representativeOffice: '北京代表处',
    customer: '国家电投北京分公司',
    capacityMw: 8.0,
    overallScore: 68,
    grade: 'RISKY',
    gradeLabel: '风险 (多重严重短板叠加，需紧急离线消缺)',
    hitFactorsCount: 6,
    totalFactorsCount: 13,
    topBottleneckFactor: 'M03-01 电芯低压自放电跳水 & PACK-02/03 SOH加速衰减',
    maxVoltageDeltaMv: 85,
    bottleneckModuleCode: 'M03-01',
    maxCmuDeltaT: 5.4,
    maxCmuTemp: 41.2,
    thermalStatus: 'COOLING_DEFECT',
    minPackSoh: 86.2,
    abnormalPackCount: 2,
    deltaSocPct: 8.2,
    rtePct: 83.5,
    pendingActionsCount: 4,
    criticalActionsCount: 3,
    lastEvaluatedTime: '2026-07-15 09:30',
    versionNo: 'REV-20260715-01',
    availabilityRate: 97.45,
    eaf: 96.80,
    ratedCapacityMwh: 16.0,
    usableCapacityMwh: 14.80,
    guaranteedCapacityMwh: 15.20,
    capacityRetentionPct: 92.5
  },
  {
    siteId: 'site-005',
    siteCode: 'JS-NJ-0023',
    siteName: '南京江北储能电站01号变电侧站',
    region: '华东区',
    representativeOffice: '南京代表处',
    customer: '江苏省国信集团',
    capacityMw: 30.0,
    overallScore: 94,
    grade: 'EXCELLENT',
    gradeLabel: '优良 (多活分担运行，温控均匀)',
    hitFactorsCount: 1,
    totalFactorsCount: 13,
    topBottleneckFactor: '辅电系统轻微能耗波动，风道滤网建议巡检除尘',
    maxVoltageDeltaMv: 22,
    bottleneckModuleCode: 'M02-01',
    maxCmuDeltaT: 2.2,
    maxCmuTemp: 29.8,
    thermalStatus: 'OPTIMAL',
    minPackSoh: 96.5,
    abnormalPackCount: 0,
    deltaSocPct: 1.8,
    rtePct: 90.8,
    pendingActionsCount: 1,
    criticalActionsCount: 0,
    lastEvaluatedTime: '2026-08-20 15:40',
    versionNo: 'REV-20260820-01',
    availabilityRate: 99.75,
    eaf: 99.68,
    ratedCapacityMwh: 60.0,
    usableCapacityMwh: 58.62,
    guaranteedCapacityMwh: 57.00,
    capacityRetentionPct: 97.7
  },
  {
    siteId: 'site-006',
    siteCode: 'GD-GZ-0089',
    siteName: '广州南沙自贸区综合能源港储能站',
    region: '华南区',
    representativeOffice: '广州代表处',
    customer: '广东粤电储能',
    capacityMw: 12.0,
    overallScore: 76,
    grade: 'MEDIUM',
    gradeLabel: '关注 (高温环境散热制约，顶层电芯温差偏大)',
    hitFactorsCount: 3,
    totalFactorsCount: 13,
    topBottleneckFactor: '顶层排风风道导流板阻力偏大，引发局部温升过快',
    maxVoltageDeltaMv: 62,
    bottleneckModuleCode: 'M03-02',
    maxCmuDeltaT: 4.2,
    maxCmuTemp: 37.8,
    thermalStatus: 'OVERHEATED',
    minPackSoh: 89.1,
    abnormalPackCount: 1,
    deltaSocPct: 5.2,
    rtePct: 87.2,
    pendingActionsCount: 3,
    criticalActionsCount: 1,
    lastEvaluatedTime: '2026-08-20 12:10',
    versionNo: 'REV-20260820-01',
    availabilityRate: 98.90,
    eaf: 98.65,
    ratedCapacityMwh: 24.0,
    usableCapacityMwh: 22.80,
    guaranteedCapacityMwh: 22.80,
    capacityRetentionPct: 95.0
  },
  {
    siteId: 'site-007',
    siteCode: 'ZJ-HZ-0033',
    siteName: '杭州钱塘新区数据中心储能备电站',
    region: '华东区',
    representativeOffice: '杭州代表处',
    customer: '浙江省能源集团',
    capacityMw: 25.0,
    overallScore: 89,
    grade: 'GOOD',
    gradeLabel: '良好 (高可靠双路热备，整体性能优良)',
    hitFactorsCount: 1,
    totalFactorsCount: 13,
    topBottleneckFactor: '日历静置 SOC 偏高 (81%)，建议结合策略下调至 70% 以内',
    maxVoltageDeltaMv: 32,
    bottleneckModuleCode: 'M01-05',
    maxCmuDeltaT: 2.6,
    maxCmuTemp: 30.5,
    thermalStatus: 'OPTIMAL',
    minPackSoh: 94.6,
    abnormalPackCount: 0,
    deltaSocPct: 2.5,
    rtePct: 89.6,
    pendingActionsCount: 1,
    criticalActionsCount: 0,
    lastEvaluatedTime: '2026-08-20 10:15',
    versionNo: 'REV-20260820-01',
    availabilityRate: 99.60,
    eaf: 99.52,
    ratedCapacityMwh: 50.0,
    usableCapacityMwh: 48.75,
    guaranteedCapacityMwh: 47.50,
    capacityRetentionPct: 97.5
  },
  {
    siteId: 'site-008',
    siteCode: 'GS-LZ-0055',
    siteName: '兰州新区光伏配储能电站02站',
    region: '西北区',
    representativeOffice: '兰州代表处',
    customer: '三峡新能源西北分公司',
    capacityMw: 50.0,
    overallScore: 92,
    grade: 'EXCELLENT',
    gradeLabel: '优良 (大容量集群协调控制平稳)',
    hitFactorsCount: 1,
    totalFactorsCount: 13,
    topBottleneckFactor: '夜间低温加热启动频次较高，注意辅电能耗损耗',
    maxVoltageDeltaMv: 28,
    bottleneckModuleCode: 'M04-03',
    maxCmuDeltaT: 3.1,
    maxCmuTemp: 31.5,
    thermalStatus: 'ACCEPTABLE',
    minPackSoh: 95.8,
    abnormalPackCount: 0,
    deltaSocPct: 2.2,
    rtePct: 90.2,
    pendingActionsCount: 1,
    criticalActionsCount: 0,
    lastEvaluatedTime: '2026-08-20 09:00',
    versionNo: 'REV-20260820-01',
    availabilityRate: 99.68,
    eaf: 99.55,
    ratedCapacityMwh: 100.0,
    usableCapacityMwh: 97.20,
    guaranteedCapacityMwh: 95.00,
    capacityRetentionPct: 97.2
  }
];

// 根据站点ID获取定制化的性能工况详情数据（保证切换站点时数据真实映射）
export function getSitePerformanceDetailData(siteId: string) {
  const summary =
    INITIAL_SITE_PERFORMANCE_SUMMARIES.find(s => s.siteId === siteId) ||
    INITIAL_SITE_PERFORMANCE_SUMMARIES[0];

  // 深度定制因子命中状态
  const customizedFactors: PerformanceFactor[] = INITIAL_PERFORMANCE_FACTORS.map(factor => {
    if (summary.overallScore >= 95) {
      // 优良站点，基本无命中
      return {
        ...factor,
        status: 'NORMAL',
        isHit: false,
        hitReason: undefined
      };
    } else if (summary.overallScore <= 70) {
      // 风险站点，命中严重
      const hitIds = [1, 3, 4, 6, 9, 13];
      const isHit = hitIds.includes(factor.id);
      return {
        ...factor,
        isHit,
        status: isHit ? (factor.id === 9 || factor.id === 13 ? 'CRITICAL' : 'WARNING') : 'NORMAL',
        hitReason: isHit ? `【${summary.siteName}】${factor.name} 达到异常阈值，加剧整站性能恶化。` : undefined
      };
    } else {
      // 中等关注站点
      return {
        ...factor
      };
    }
  });

  // 模组数据适配
  const customizedModules: ModuleMetric[] = INITIAL_MODULE_METRICS.map(m => {
    if (summary.overallScore >= 90) {
      return {
        ...m,
        voltageDeltaMv: Math.round(m.voltageDeltaMv * 0.4),
        status: 'NORMAL',
        abnormalReason: undefined
      };
    } else if (summary.overallScore <= 70) {
      return {
        ...m,
        voltageDeltaMv: Math.round(m.voltageDeltaMv * 1.3),
        status: m.id === 'm-04' ? 'CRITICAL' : m.status
      };
    }
    return m;
  });

  // CMU 温度数据适配
  const customizedCmu: CmuThermalRecord[] = INITIAL_CMU_RECORDS.map(c => {
    if (summary.overallScore >= 90) {
      return {
        ...c,
        deltaT: Number((c.deltaT * 0.5).toFixed(1)),
        thermalStatus: 'OPTIMAL',
        thermalAdvice: '各温区运行正常，液冷系统流量匹配平衡。'
      };
    } else if (summary.overallScore <= 70) {
      return {
        ...c,
        deltaT: Number((c.deltaT * 1.2).toFixed(1)),
        maxTemp: Number((c.maxTemp + 2).toFixed(1)),
        thermalStatus: 'OVERHEATED'
      };
    }
    return c;
  });

  // PACK SOH 适配
  const customizedPack: PackSohMetric[] = INITIAL_PACK_SOH_METRICS.map(p => {
    if (summary.overallScore >= 90) {
      return {
        ...p,
        soh: Math.max(95, p.soh),
        isStandard: true,
        bottleneckImpact: '处于设计寿命正常衰减曲线内，无短板木桶制约。'
      };
    } else if (summary.overallScore <= 70) {
      return {
        ...p,
        soh: Math.min(88, p.soh),
        isStandard: p.packId === 'pack-04' ? false : p.isStandard
      };
    }
    return p;
  });

  // 优化建议适配
  const adviceList: OptimizationAdviceItem[] =
    summary.overallScore >= 90
      ? [
          {
            id: 'adv-normal-01',
            level: 'OBSERVATION',
            factorId: 2,
            factorName: '充放电策略',
            title: '维持当前充放电工况，按计划例行巡检',
            problemStatement: '当前系统一致性与热工况优良，各簇电芯健康度均衡。',
            actionGuideline: '建议继续保持充放电倍率在 0.5C 以下，每月例行检查液冷歧管压力。',
            expectedBenefit: '预计年衰减率可保持在 1.8% 以内，寿命延长 1.5 年。',
            targetScope: '全站所有储能簇',
            deadline: '例行季度巡检'
          }
        ]
      : INITIAL_OPTIMIZATION_ADVICES;

  // 最终组装该站点的健康摘要
  const hitFactorsList = customizedFactors.filter(f => f.isHit);
  const siteHealthSummary: SiteHealthSummary = {
    siteId: summary.siteId,
    siteName: summary.siteName,
    evaluatedAt: summary.lastEvaluatedTime,
    overallScore: summary.overallScore,
    grade: summary.grade,
    gradeLabel: summary.gradeLabel,
    hitFactors: hitFactorsList,
    adviceList: adviceList,
    keyHighlights: [
      `当前版本 [${summary.versionNo}] 综合体检得分 ${summary.overallScore} 分，处于【${summary.gradeLabel}】区间。`,
      `制约短板分析：模组最大极差 ${summary.maxVoltageDeltaMv} mV (${summary.bottleneckModuleCode})，CMU 最高温差 ΔT ${summary.maxCmuDeltaT} ℃。`,
      `PACK 最低 SOH 为 ${summary.minPackSoh}%，${summary.abnormalPackCount > 0 ? `存在 ${summary.abnormalPackCount} 组低于90%标准` : '全站各组均在达标线以上'}。`,
      summary.pendingActionsCount > 0
        ? `系统推荐输出 ${summary.pendingActionsCount} 项分级治理方案（含 ${summary.criticalActionsCount} 项紧急），已自动关联消缺闭环跟踪。`
        : '系统运行平稳，无需紧急硬件干预，维持定期巡检即可。'
    ]
  };

  return {
    summary,
    factors: customizedFactors,
    moduleMetrics: customizedModules,
    cmuRecords: customizedCmu,
    packMetrics: customizedPack,
    socRecords: INITIAL_SOC_BALANCE_RECORDS,
    defectRecords: INITIAL_DEFECT_RECORDS,
    adviceList,
    siteHealthSummary,
    historyRecords: INITIAL_PERFORMANCE_HISTORY
  };
}

// =========================================================================
// 1. 可用度指标与失效设备失效时刻告警关联数据生成
// =========================================================================
export function getSiteAvailabilityMetricData(siteId: string): AvailabilityMetricData {
  const summary =
    INITIAL_SITE_PERFORMANCE_SUMMARIES.find(s => s.siteId === siteId) ||
    INITIAL_SITE_PERFORMANCE_SUMMARIES[0];

  const isRisky = summary.overallScore <= 70;
  const isExcellent = summary.overallScore >= 90;

  const availabilityRate = summary.availabilityRate || (isRisky ? 97.45 : isExcellent ? 99.85 : 99.28);
  const eaf = summary.eaf || (isRisky ? 96.8 : isExcellent ? 99.78 : 99.15);
  const unplannedHours = isRisky ? 18.35 : isExcellent ? 1.08 : 5.18;
  const plannedHours = isRisky ? 8.0 : 4.0;
  const failureCount = isRisky ? 4 : isExcellent ? 1 : 2;

  const failures: EquipmentFailureRecord[] = [
    {
      id: `${siteId}-flr-01`,
      failureId: 'FLR-20260818-01',
      deviceCode: 'PCS-02',
      deviceName: `${summary.siteName} 2#变流舱 PCS-02逆变器`,
      deviceType: 'PCS',
      cabinLocation: '2#变流升压一体舱 B列2号变流柜',
      failedAt: '2026-08-18 14:22:15',
      recoveredAt: '2026-08-18 16:05:30',
      outageDurationHours: 1.72,
      capacityLossMw: 2.5,
      energyLossMwh: 4.3,
      failureReason: 'PCS B相逆变桥臂IGBT结温超限(>115℃)自锁硬件保护停机',
      rcaChain: '外部高温(36.8℃)大负荷充放 -> 2#顶置散热离心风机轴承抖动卡阻 -> 散热风量突降45% -> IGBT温升梯度达2.4℃/min -> 硬件温控保护动作联跳',
      availabilityLossPct: 0.24,
      status: 'RESOLVED',
      relatedAlarms: [
        {
          id: 'alm-01',
          alarmCode: 'ALM-PCS-3042',
          alarmName: 'PCS 2#内部风道离心风机转速异常抖动预警',
          severity: 'WARNING',
          deviceCode: 'PCS-02-FAN2',
          deviceName: '2#PCS逆变柜 辅流冷却风机',
          subsystem: 'PCS',
          triggeredAt: '2026-08-18 14:21:05',
          clearedAt: '2026-08-18 16:05:30',
          durationMinutes: 104,
          correlationType: 'PRECURSOR',
          description: '风机转速反馈由额定 2850 RPM 突降至 1120 RPM，并伴随测速脉冲抖动',
          workOrderId: 'WO-20260818-08',
          isConfirmed: true
        },
        {
          id: 'alm-02',
          alarmCode: 'ALM-PCS-3088',
          alarmName: 'PCS B相逆变桥臂IGBT瞬态结温超限急停保护',
          severity: 'CRITICAL',
          deviceCode: 'PCS-02-MOD-B',
          deviceName: '2#PCS逆变柜 B相主桥臂模块',
          subsystem: 'PCS',
          triggeredAt: '2026-08-18 14:22:15',
          clearedAt: '2026-08-18 15:45:10',
          durationMinutes: 83,
          correlationType: 'ROOT_CAUSE',
          description: 'NTC实测结温达到 118.5℃ (安全阈值 115℃)，触发变流器硬件级自锁分闸跳闸',
          workOrderId: 'WO-20260818-08',
          isConfirmed: true
        },
        {
          id: 'alm-03',
          alarmCode: 'ALM-BMS-2015',
          alarmName: '2#储能直流汇流柜主接触器受联动欠压分闸',
          severity: 'MAJOR',
          deviceCode: 'DC-CAB-02',
          deviceName: '2#直流汇流配电柜',
          subsystem: 'HV_BOX',
          triggeredAt: '2026-08-18 14:22:16',
          clearedAt: '2026-08-18 16:05:25',
          durationMinutes: 103,
          correlationType: 'CASCADE',
          description: '变流器故障硬节点信号下发，直流侧快速断开接触器防止孤岛反送',
          workOrderId: 'WO-20260818-08',
          isConfirmed: true
        },
        {
          id: 'alm-04',
          alarmCode: 'ALM-EMS-1002',
          alarmName: 'EMS AGC电网调度跟踪功率偏差超限告警',
          severity: 'MINOR',
          deviceCode: 'EMS-MASTER',
          deviceName: '全站中央能量管理系统 EMS',
          subsystem: 'GRID_CONNECT',
          triggeredAt: '2026-08-18 14:22:18',
          clearedAt: '2026-08-18 14:23:00',
          durationMinutes: 1,
          correlationType: 'SECONDARY',
          description: '实发功率由于 2.5MW PCS跳脱瞬间跌出AGC考核响应死区',
          isConfirmed: true
        }
      ]
    },
    {
      id: `${siteId}-flr-02`,
      failureId: 'FLR-20260805-02',
      deviceCode: 'BMU-03-A',
      deviceName: `${summary.siteName} 1#电池舱 3号电池簇从控BMU模块`,
      deviceType: 'BMU_SLAVE',
      cabinLocation: '1#电池储能集装箱 3号簇高压箱下部',
      failedAt: '2026-08-05 09:12:40',
      recoveredAt: '2026-08-05 10:28:10',
      outageDurationHours: 1.26,
      capacityLossMw: 1.25,
      energyLossMwh: 1.57,
      failureReason: 'CAN总线瞬态浪涌干扰引发从控BMU通信丢包超时，从控安全自检断开',
      rcaChain: '汇流柜真空断路器分合操作瞬间产生地电位波动 -> 屏蔽接地电阻偏大(4.2Ω) -> CAN通信差分信号畸变丢包 -> BMS主控连续3s未收到心跳 -> 保护跳开该簇',
      availabilityLossPct: 0.17,
      status: 'RESOLVED',
      relatedAlarms: [
        {
          id: 'alm-05',
          alarmCode: 'ALM-BMS-1102',
          alarmName: '3#电池簇BMU从控CAN通信帧校验误码率高频告警',
          severity: 'WARNING',
          deviceCode: 'BMU-03-A',
          deviceName: '3号簇从控单元',
          subsystem: 'BMS',
          triggeredAt: '2026-08-05 09:11:58',
          clearedAt: '2026-08-05 10:28:05',
          durationMinutes: 76,
          correlationType: 'PRECURSOR',
          description: 'CRC校验失败率连续10s超过5%，通信链路信噪比恶化',
          workOrderId: 'WO-20260805-03',
          isConfirmed: true
        },
        {
          id: 'alm-06',
          alarmCode: 'ALM-BMS-1105',
          alarmName: '3#电池簇从控单元通信中断超时停机保护',
          severity: 'CRITICAL',
          deviceCode: 'BMS-MASTER-01',
          deviceName: '1#电池舱BMS主控单元',
          subsystem: 'BMS',
          triggeredAt: '2026-08-05 09:12:40',
          clearedAt: '2026-08-05 10:15:30',
          durationMinutes: 63,
          correlationType: 'ROOT_CAUSE',
          description: '主控单元超过 3000ms 未接收到 3# 从控周期遥测数据，判定通信失步',
          workOrderId: 'WO-20260805-03',
          isConfirmed: true
        },
        {
          id: 'alm-07',
          alarmCode: 'ALM-HV-2030',
          alarmName: '3号电池簇直流高压断路器保护脱扣断开',
          severity: 'MAJOR',
          deviceCode: 'CB-DC-03',
          deviceName: '3#簇直流断路器',
          subsystem: 'HV_BOX',
          triggeredAt: '2026-08-05 09:12:41',
          clearedAt: '2026-08-05 10:28:00',
          durationMinutes: 75,
          correlationType: 'CASCADE',
          description: 'BMS硬线跳闸联锁下发，切开该簇正负极断路器',
          workOrderId: 'WO-20260805-03',
          isConfirmed: true
        }
      ]
    }
  ];

  if (isRisky) {
    failures.push({
      id: `${siteId}-flr-03`,
      failureId: 'FLR-20260722-03',
      deviceCode: 'CHILLER-01',
      deviceName: `${summary.siteName} 1号电池集装箱 液冷机组1号压缩机`,
      deviceType: 'COOLING_UNIT',
      cabinLocation: '1#储能集装箱 顶置液冷机组舱',
      failedAt: '2026-07-22 13:40:12',
      recoveredAt: '2026-07-22 15:10:00',
      outageDurationHours: 1.5,
      capacityLossMw: 2.5,
      energyLossMwh: 3.75,
      failureReason: '液冷机组排气高压保护动作导致压缩机自保护停运',
      rcaChain: '夏日连续高温38℃ -> 冷凝翅片灰尘堵塞换热受阻 -> 高压压力传感器触点受潮轻微漂移 -> 排气压力达到2.85MPa上限跳机',
      availabilityLossPct: 0.21,
      status: 'RESOLVED',
      relatedAlarms: [
        {
          id: 'alm-08',
          alarmCode: 'ALM-TH-5021',
          alarmName: '液冷机组压缩机排气高压超限保护停机',
          severity: 'CRITICAL',
          deviceCode: 'CHILLER-01-COMP',
          deviceName: '液冷变频压缩机',
          subsystem: 'THERMAL',
          triggeredAt: '2026-07-22 13:40:12',
          clearedAt: '2026-07-22 15:08:20',
          durationMinutes: 88,
          correlationType: 'ROOT_CAUSE',
          description: '排气冷凝压力突破 2.85 MPa 上限，压缩机紧急停运',
          workOrderId: 'WO-20260722-05',
          isConfirmed: true
        },
        {
          id: 'alm-09',
          alarmCode: 'ALM-TH-5028',
          alarmName: '储能液冷循环回路出水流量偏低报警',
          severity: 'MAJOR',
          deviceCode: 'COOLANT-FLOW-01',
          deviceName: '液冷水路流量传感器',
          subsystem: 'THERMAL',
          triggeredAt: '2026-07-22 13:40:18',
          clearedAt: '2026-07-22 15:09:00',
          durationMinutes: 89,
          correlationType: 'CASCADE',
          description: '循环流量由 38 L/min 降至 11 L/min',
          workOrderId: 'WO-20260722-05',
          isConfirmed: true
        }
      ]
    });
  }

  return {
    siteId,
    availabilityRate,
    eaf,
    contractGuaranteeAvailability: 98.5,
    totalOperatingHours: 720,
    plannedOutageHours: plannedHours,
    unplannedOutageHours: unplannedHours,
    mtbfHours: isRisky ? 1120 : isExcellent ? 4800 : 2860,
    mttrHours: isRisky ? 2.1 : isExcellent ? 0.8 : 1.45,
    failureCount: failures.length,
    monthlyTrend: [
      { month: '2026-03', availability: 99.4, eaf: 99.25, target: 98.5, unplannedHours: 4.3 },
      { month: '2026-04', availability: 99.6, eaf: 99.5, target: 98.5, unplannedHours: 2.8 },
      { month: '2026-05', availability: 99.1, eaf: 98.95, target: 98.5, unplannedHours: 6.5 },
      { month: '2026-06', availability: 98.8, eaf: 98.6, target: 98.5, unplannedHours: 8.6 },
      { month: '2026-07', availability: isRisky ? 97.2 : 99.2, eaf: isRisky ? 96.6 : 99.05, target: 98.5, unplannedHours: isRisky ? 20.2 : 5.8 },
      { month: '2026-08', availability: availabilityRate, eaf: eaf, target: 98.5, unplannedHours: unplannedHours }
    ],
    failures
  };
}

// =========================================================================
// 2. RTE 性能指标数据生成
// =========================================================================
export function getSiteRtePerformanceData(siteId: string): RtePerformanceData {
  const summary =
    INITIAL_SITE_PERFORMANCE_SUMMARIES.find(s => s.siteId === siteId) ||
    INITIAL_SITE_PERFORMANCE_SUMMARIES[0];

  const overallRte = summary.rtePct;
  const isRisky = summary.overallScore <= 70;
  const isExcellent = summary.overallScore >= 90;

  const chargeStrategy: ChargeDischargeStrategy = {
    strategyName: '两充两放削峰填谷 + 动态电网AGC调频协同运行',
    cyclesPerDay: 2.0,
    chargeRateC: 0.5,
    dischargeRateC: 0.5,
    chargeCutoffSocPct: 98,
    dischargeCutoffSocPct: 5,
    modeDescription: '日充放执行「两充两放」策略：利用夜间低谷与午间光伏低谷电价充电，在早间高峰与晚间尖峰时段按额定 0.5C 恒功率顶峰放电，其余待机时段执行电网快速一次调频动态调节。',
    peakValleySchedule: [
      { periodName: '夜间谷段充电', timeRange: '00:00 - 06:30', action: 'CHARGE', powerKw: summary.capacityMw * 500, priceYuanPerKwh: 0.28 },
      { periodName: '早高峰顶峰放电', timeRange: '08:30 - 11:30', action: 'DISCHARGE', powerKw: summary.capacityMw * 500, priceYuanPerKwh: 0.98 },
      { periodName: '午间平价充电', timeRange: '12:00 - 14:30', action: 'CHARGE', powerKw: summary.capacityMw * 400, priceYuanPerKwh: 0.42 },
      { periodName: '晚尖峰最大放电', timeRange: '18:00 - 21:30', action: 'DISCHARGE', powerKw: summary.capacityMw * 500, priceYuanPerKwh: 1.35 },
      { periodName: '调频待机运行', timeRange: '其余时段', action: 'STANDBY', powerKw: 0, priceYuanPerKwh: 0.65 }
    ]
  };

  const hourlyCurve = [
    { time: '00:00', ambientTemp: 24.5, cabinTemp: 23.2, coolingPowerKw: 12.0, rteImpactPct: -0.04 },
    { time: '03:00', ambientTemp: 23.8, cabinTemp: 22.8, coolingPowerKw: 10.5, rteImpactPct: -0.02 },
    { time: '06:00', ambientTemp: 25.2, cabinTemp: 24.0, coolingPowerKw: 14.2, rteImpactPct: -0.06 },
    { time: '09:00', ambientTemp: 29.5, cabinTemp: 26.5, coolingPowerKw: 22.0, rteImpactPct: -0.14 },
    { time: '12:00', ambientTemp: 34.2, cabinTemp: 28.6, coolingPowerKw: 38.5, rteImpactPct: -0.28 },
    { time: '14:00', ambientTemp: 36.8, cabinTemp: 29.8, coolingPowerKw: 46.0, rteImpactPct: -0.38 },
    { time: '16:00', ambientTemp: 35.1, cabinTemp: 29.0, coolingPowerKw: 41.2, rteImpactPct: -0.32 },
    { time: '18:00', ambientTemp: 32.0, cabinTemp: 27.5, coolingPowerKw: 31.0, rteImpactPct: -0.21 },
    { time: '21:00', ambientTemp: 28.4, cabinTemp: 25.6, coolingPowerKw: 19.5, rteImpactPct: -0.11 },
    { time: '23:00', ambientTemp: 26.0, cabinTemp: 24.2, coolingPowerKw: 15.0, rteImpactPct: -0.07 }
  ];

  const ambientTemperature: AmbientTemperatureData = {
    currentTemp: 32.4,
    minTemp: 23.5,
    maxTemp: 36.8,
    avgTemp: 28.9,
    dailyDeltaT: 13.3,
    tempSensitivityRteLossPctPer5C: 0.18,
    hourlyCurve
  };

  const operatingMode: OperatingModeData = {
    currentMode: 'AGC调度响应 + 恒功率削峰填谷模式',
    gridDispatchCompliancePct: isRisky ? 97.2 : 99.4,
    modeDistribution: [
      { mode: '恒功率充放 (削峰填谷)', percentage: 62, hours: 446.4, color: '#3b82f6', description: '计划性两充两放，按固定倍率执行充放' },
      { mode: '电网 AGC 调度响应', percentage: 22, hours: 158.4, color: '#10b981', description: '响应调度中心实时指令调节功率输出' },
      { mode: '一次调频 (快速频响)', percentage: 10, hours: 72.0, color: '#8b5cf6', description: '电网频率偏离时瞬时毫秒级自动动作' },
      { mode: '热备用就绪待机', percentage: 6, hours: 43.2, color: '#64748b', description: '接触器闭合、系统保持受电随时响应' }
    ]
  };

  const cellTemperature: CellTemperatureData = {
    maxCellTemp: summary.maxCmuTemp,
    minCellTemp: isRisky ? 29.2 : 28.0,
    avgCellTemp: Number(((summary.maxCmuTemp + 28.0) / 2).toFixed(1)),
    maxDeltaT: summary.maxCmuDeltaT,
    tempRiseRatePerHour: isRisky ? 1.85 : isExcellent ? 0.95 : 1.25,
    coolingTriggerThreshold: 28.0,
    tempSocCurve: [
      { soc: 10, chargeTemp: 26.5, dischargeTemp: 27.2, coolantInTemp: 20.0 },
      { soc: 30, chargeTemp: 28.8, dischargeTemp: 29.5, coolantInTemp: 20.5 },
      { soc: 50, chargeTemp: 31.2, dischargeTemp: 32.4, coolantInTemp: 21.0 },
      { soc: 70, chargeTemp: 34.0, dischargeTemp: 35.2, coolantInTemp: 21.8 },
      { soc: 90, chargeTemp: 37.2, dischargeTemp: 38.0, coolantInTemp: 22.5 },
      { soc: 100, chargeTemp: summary.maxCmuTemp, dischargeTemp: summary.maxCmuTemp - 0.5, coolantInTemp: 23.0 }
    ]
  };

  const transformerEfficiency: TransformerEfficiencyData = {
    ratedEfficiency: 99.1,
    actualEfficiency: isRisky ? 98.72 : isExcellent ? 99.05 : 98.92,
    noLoadLossKw: 12.4,
    loadLossKw: 48.6,
    currentLoadRatePct: 74.5,
    efficiencyCurve: [
      { loadPct: 20, efficiency: 97.85 },
      { loadPct: 40, efficiency: 98.65 },
      { loadPct: 60, efficiency: 98.98 },
      { loadPct: 80, efficiency: 98.95 },
      { loadPct: 100, efficiency: 98.78 }
    ]
  };

  const pcsEfficiency: PcsEfficiencyData = {
    ratedEfficiency: 99.0,
    actualEfficiency: isRisky ? 98.25 : isExcellent ? 98.88 : 98.65,
    chargingEfficiency: isRisky ? 98.1 : isExcellent ? 98.65 : 98.42,
    dischargingEfficiency: isRisky ? 98.35 : isExcellent ? 98.95 : 98.78,
    powerFactor: 0.998,
    lossSummaryKw: 34.2,
    efficiencyCurve: [
      { loadPct: 25, chargingEff: 97.4, dischargingEff: 97.8 },
      { loadPct: 50, chargingEff: 98.2, dischargingEff: 98.5 },
      { loadPct: 75, chargingEff: 98.6, dischargingEff: 98.9 },
      { loadPct: 100, chargingEff: 98.4, dischargingEff: 98.7 }
    ]
  };

  const lossWaterfall: LossWaterfallItem[] = [
    { stage: '1. 交流并网端充入电能', energyMwh: 20.0, efficiencyLossPct: 0, description: '电网结算关口表实测基准 (100%)' },
    { stage: '2. 箱式变压器降压损耗', energyMwh: 19.78, efficiencyLossPct: -1.1, description: '箱变铁损与铜损 (实测效率 98.9%)' },
    { stage: '3. PCS 变流整流损耗', energyMwh: 19.47, efficiencyLossPct: -1.6, description: '变流器整流逆变损耗 (充电效率 98.4%)' },
    { stage: '4. 电池内阻极化与副反应损耗', energyMwh: 18.05, efficiencyLossPct: -7.1, description: '直流侧欧姆内阻与电化学发热损耗 (库伦/能量效率)' },
    { stage: '5. 液冷与辅助系统自用电损耗', energyMwh: 17.38, efficiencyLossPct: -3.4, description: '冷水机组、循环泵、BMS控制系统站用电扣减' },
    { stage: '6. PCS 放电逆变损耗', energyMwh: 17.16, efficiencyLossPct: -1.1, description: '直流电转交流放电变流损耗 (逆变效率 98.7%)' },
    { stage: '7. 箱变升压并网损耗', energyMwh: 16.97, efficiencyLossPct: -0.9, description: '放电升压至 35kV 关口并网损耗' },
    { stage: '8. 最终关口净输出电能量', energyMwh: 16.97, efficiencyLossPct: 0, description: `综合系统 RTE 转化率达成 ${overallRte}%` }
  ];

  return {
    siteId,
    overallRtePct: overallRte,
    guaranteedRtePct: 85.0,
    designRtePct: 88.5,
    dcSideRtePct: isRisky ? 90.8 : isExcellent ? 93.6 : 92.4,
    auxiliaryPowerLossPct: isRisky ? 4.6 : isExcellent ? 2.8 : 3.6,
    chargeStrategy,
    ambientTemperature,
    operatingMode,
    cellTemperature,
    transformerEfficiency,
    pcsEfficiency,
    lossWaterfall
  };
}

// =========================================================================
// 3. 可用容量指标数据生成
// =========================================================================
export function getSiteUsableCapacityData(siteId: string): UsableCapacityData {
  const summary =
    INITIAL_SITE_PERFORMANCE_SUMMARIES.find(s => s.siteId === siteId) ||
    INITIAL_SITE_PERFORMANCE_SUMMARIES[0];

  const ratedCapacity = summary.ratedCapacityMwh || summary.capacityMw * 2;
  const usableCapacity = summary.usableCapacityMwh || Number((ratedCapacity * 0.964).toFixed(2));
  const guaranteedCapacity = summary.guaranteedCapacityMwh || Number((ratedCapacity * 0.95).toFixed(2));
  const retentionPct = summary.capacityRetentionPct || Number(((usableCapacity / ratedCapacity) * 100).toFixed(1));
  const marginMwh = Number((usableCapacity - guaranteedCapacity).toFixed(2));
  const marginPct = Number(((marginMwh / ratedCapacity) * 100).toFixed(1));

  const isRisky = summary.overallScore <= 70;

  const testCondition: CapacityTestCondition = {
    testDate: '2026-08-15',
    testStandard: 'GB/T 36276-2023 / 现场充放电可用容量验收试验规程',
    ambientTemp: 25.0,
    cRate: 0.5,
    cutoffChargeVoltageV: 1450.0,
    cutoffDischargeVoltageV: 1050.0,
    chargingEnergyMwh: Number((usableCapacity * 1.15).toFixed(2)),
    dischargingEnergyMwh: usableCapacity,
    executor: '国家智能电网与储能质检中心工程测试组',
    conclusion: isRisky
      ? '实测可用容量略低于合同保证承诺线，检测到第3簇及第4簇木桶效应明显，建议立即进行容量重构均衡。'
      : '实测可用容量达成率为 101.4% (对比保证基线)，系统容量裕度充足，履约健康度优良。'
  };

  const clusterCount = 8;
  const singleRated = Number((ratedCapacity / clusterCount).toFixed(2));

  const clusters: ClusterCapacityItem[] = Array.from({ length: clusterCount }).map((_, i) => {
    const clusterCode = `CLUSTER-#0${i + 1}`;
    let clusterRetention = retentionPct;
    let isBottleneck = false;
    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';

    if (i === 1 && isRisky) {
      clusterRetention = 88.5;
      isBottleneck = true;
      status = 'CRITICAL';
    } else if (i === 3 && summary.overallScore < 85) {
      clusterRetention = 92.0;
      isBottleneck = true;
      status = 'WARNING';
    } else {
      clusterRetention = Number((retentionPct + (i % 2 === 0 ? 0.8 : -0.5)).toFixed(1));
    }

    const clusterUsable = Number((singleRated * (clusterRetention / 100)).toFixed(2));
    const deviation = Number((clusterRetention - retentionPct).toFixed(1));

    return {
      clusterId: `cl-${i + 1}`,
      clusterCode,
      ratedCapacityMwh: singleRated,
      usableCapacityMwh: clusterUsable,
      retentionPct: clusterRetention,
      deviationFromMeanPct: deviation,
      isBottleneck,
      status
    };
  });

  return {
    siteId,
    ratedCapacityMwh: ratedCapacity,
    actualUsableCapacityMwh: usableCapacity,
    guaranteedCapacityMwh: guaranteedCapacity,
    capacityRetentionPct: retentionPct,
    capacityMarginMwh: marginMwh,
    capacityMarginPct: marginPct,
    status: usableCapacity >= guaranteedCapacity ? 'SURPLUS' : 'BREACHED',
    testCondition,
    clusters,
    degradationHistory: [
      { evaluatedDate: '出厂验收 (COD)', actualUsableMwh: ratedCapacity, guaranteedBaselineMwh: ratedCapacity * 0.98, designPredictedMwh: ratedCapacity },
      { evaluatedDate: '运行 6 个月', actualUsableMwh: Number((ratedCapacity * 0.985).toFixed(2)), guaranteedBaselineMwh: Number((ratedCapacity * 0.97).toFixed(2)), designPredictedMwh: Number((ratedCapacity * 0.986).toFixed(2)) },
      { evaluatedDate: '运行 12 个月', actualUsableMwh: Number((ratedCapacity * 0.974).toFixed(2)), guaranteedBaselineMwh: Number((ratedCapacity * 0.96).toFixed(2)), designPredictedMwh: Number((ratedCapacity * 0.975).toFixed(2)) },
      { evaluatedDate: '运行 18 个月', actualUsableMwh: Number((ratedCapacity * 0.968).toFixed(2)), guaranteedBaselineMwh: Number((ratedCapacity * 0.955).toFixed(2)), designPredictedMwh: Number((ratedCapacity * 0.965).toFixed(2)) },
      { evaluatedDate: '运行 24 个月 (最新)', actualUsableMwh: usableCapacity, guaranteedBaselineMwh: guaranteedCapacity, designPredictedMwh: Number((ratedCapacity * 0.958).toFixed(2)) }
    ]
  };
}

// =========================================================================
// 4. SOH 性能指标数据生成 (SOC一致性、电能量数据、SOH值一致性、运行工况)
// =========================================================================
export function getSiteSohComprehensiveData(siteId: string): SohComprehensiveData {
  const summary =
    INITIAL_SITE_PERFORMANCE_SUMMARIES.find(s => s.siteId === siteId) ||
    INITIAL_SITE_PERFORMANCE_SUMMARIES[0];

  const isRisky = summary.overallScore <= 70;
  const isExcellent = summary.overallScore >= 90;

  // 4.1 SOC 一致性
  const clusterSocList = [
    { clusterCode: 'CLUSTER-#01', currentSoc: 62.4, chargeEndSoc: 98.5, dischargeEndSoc: 4.8, deviationFromAvgPct: 0.8, status: 'NORMAL' as const },
    { clusterCode: 'CLUSTER-#02', currentSoc: 61.2, chargeEndSoc: 97.8, dischargeEndSoc: 5.2, deviationFromAvgPct: -0.4, status: 'NORMAL' as const },
    { clusterCode: 'CLUSTER-#03', currentSoc: isRisky ? 55.4 : 60.8, chargeEndSoc: isRisky ? 94.2 : 98.0, dischargeEndSoc: isRisky ? 8.9 : 5.4, deviationFromAvgPct: isRisky ? -6.2 : -0.8, status: isRisky ? 'DEVIATED' as const : 'NORMAL' as const },
    { clusterCode: 'CLUSTER-#04', currentSoc: 62.8, chargeEndSoc: 98.8, dischargeEndSoc: 4.6, deviationFromAvgPct: 1.2, status: 'NORMAL' as const },
    { clusterCode: 'CLUSTER-#05', currentSoc: 61.9, chargeEndSoc: 98.1, dischargeEndSoc: 5.0, deviationFromAvgPct: 0.3, status: 'NORMAL' as const },
    { clusterCode: 'CLUSTER-#06', currentSoc: 60.5, chargeEndSoc: 97.5, dischargeEndSoc: 5.6, deviationFromAvgPct: -1.1, status: 'NORMAL' as const },
    { clusterCode: 'CLUSTER-#07', currentSoc: 62.1, chargeEndSoc: 98.2, dischargeEndSoc: 4.9, deviationFromAvgPct: 0.5, status: 'NORMAL' as const },
    { clusterCode: 'CLUSTER-#08', currentSoc: 61.5, chargeEndSoc: 98.0, dischargeEndSoc: 5.1, deviationFromAvgPct: -0.1, status: 'NORMAL' as const }
  ];

  const socConsistency: SocConsistencyData = {
    avgSocPct: 61.6,
    maxDeltaSocPct: summary.deltaSocPct,
    standardDeviationPct: isRisky ? 2.45 : isExcellent ? 0.65 : 1.18,
    chargeEndDispersionPct: isRisky ? 4.6 : 1.2,
    dischargeEndDispersionPct: isRisky ? 4.3 : 1.1,
    evaluationNote: isRisky
      ? `检测到 CLUSTER-#03 充放电末期离散度达 ${summary.deltaSocPct}%，触发均衡下发阈值。`
      : '全站 8 组储能簇 SOC 标准差维持在 1.2% 以内，满充末期与满放末期一致性良好。',
    clusterSocList
  };

  // 4.2 电能量数据
  const dailyTrend = [
    { date: '08-07', chargedMwh: 36.8, dischargedMwh: 32.1, throughputMwh: 68.9, dailyRtePct: 87.2 },
    { date: '08-08', chargedMwh: 37.2, dischargedMwh: 32.5, throughputMwh: 69.7, dailyRtePct: 87.4 },
    { date: '08-09', chargedMwh: 38.0, dischargedMwh: 33.1, throughputMwh: 71.1, dailyRtePct: 87.1 },
    { date: '08-10', chargedMwh: 36.5, dischargedMwh: 31.8, throughputMwh: 68.3, dailyRtePct: 87.1 },
    { date: '08-11', chargedMwh: 37.5, dischargedMwh: 32.8, throughputMwh: 70.3, dailyRtePct: 87.5 },
    { date: '08-12', chargedMwh: 36.9, dischargedMwh: 32.2, throughputMwh: 69.1, dailyRtePct: 87.3 },
    { date: '08-13', chargedMwh: 37.8, dischargedMwh: 33.0, throughputMwh: 70.8, dailyRtePct: 87.3 },
    { date: '08-14', chargedMwh: 38.4, dischargedMwh: 33.5, throughputMwh: 71.9, dailyRtePct: 87.2 },
    { date: '08-15', chargedMwh: 37.0, dischargedMwh: 32.3, throughputMwh: 69.3, dailyRtePct: 87.3 },
    { date: '08-16', chargedMwh: 37.6, dischargedMwh: 32.8, throughputMwh: 70.4, dailyRtePct: 87.2 },
    { date: '08-17', chargedMwh: 38.1, dischargedMwh: 33.2, throughputMwh: 71.3, dailyRtePct: 87.1 },
    { date: '08-18', chargedMwh: 32.5, dischargedMwh: 28.2, throughputMwh: 60.7, dailyRtePct: 86.8 }, // 故障停运日
    { date: '08-19', chargedMwh: 37.4, dischargedMwh: 32.6, throughputMwh: 70.0, dailyRtePct: 87.2 },
    { date: '08-20', chargedMwh: 37.9, dischargedMwh: 33.1, throughputMwh: 71.0, dailyRtePct: 87.3 }
  ];

  const clusterThroughput = clusterSocList.map((c, idx) => ({
    clusterCode: c.clusterCode,
    chargedMwh: Number((1852 + (idx % 2 === 0 ? 12 : -15)).toFixed(1)),
    dischargedMwh: Number((1608 + (idx % 2 === 0 ? 10 : -13)).toFixed(1)),
    throughputMwh: Number((3460 + (idx % 2 === 0 ? 22 : -28)).toFixed(1)),
    deviationPct: Number(((idx % 2 === 0 ? 0.6 : -0.8)).toFixed(1))
  }));

  const electricalEnergy: ElectricalEnergyData = {
    cumulativeChargedMwh: 14820,
    cumulativeDischargedMwh: 12864,
    cumulativeThroughputMwh: 27684,
    currentMonthChargedMwh: 1125,
    currentMonthDischargedMwh: 978,
    avgDailyDischargeMwh: 32.6,
    dailyTrend,
    clusterThroughput
  };

  // 4.3 SOH 值一致性
  const minSoh = summary.minPackSoh;
  const maxSoh = 97.4;
  const avgSoh = Number(((maxSoh + minSoh) / 2 + (isRisky ? -1.5 : 1.2)).toFixed(1));

  const packs = [
    { packCode: 'PACK-01-01', cluster: 'CLUSTER-#01', soh: 96.8, deviationFromMeanPct: 1.2, dcirMOhms: 0.42, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-01-02', cluster: 'CLUSTER-#01', soh: 96.5, deviationFromMeanPct: 0.9, dcirMOhms: 0.43, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-01-03', cluster: 'CLUSTER-#01', soh: 95.8, deviationFromMeanPct: 0.2, dcirMOhms: 0.44, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-02-01', cluster: 'CLUSTER-#02', soh: 96.2, deviationFromMeanPct: 0.6, dcirMOhms: 0.43, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-02-02', cluster: 'CLUSTER-#02', soh: 95.9, deviationFromMeanPct: 0.3, dcirMOhms: 0.44, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-02-03', cluster: 'CLUSTER-#02', soh: 95.2, deviationFromMeanPct: -0.4, dcirMOhms: 0.45, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-03-01', cluster: 'CLUSTER-#03', soh: minSoh, deviationFromMeanPct: Number((minSoh - avgSoh).toFixed(1)), dcirMOhms: 0.58, isSubstandard: minSoh < 90, status: minSoh < 90 ? ('CRITICAL' as const) : ('ATTENTION' as const) },
    { packCode: 'PACK-03-02', cluster: 'CLUSTER-#03', soh: Number((minSoh + 1.2).toFixed(1)), deviationFromMeanPct: Number((minSoh + 1.2 - avgSoh).toFixed(1)), dcirMOhms: 0.54, isSubstandard: (minSoh + 1.2) < 90, status: (minSoh + 1.2) < 90 ? ('CRITICAL' as const) : ('ATTENTION' as const) },
    { packCode: 'PACK-04-01', cluster: 'CLUSTER-#04', soh: 97.4, deviationFromMeanPct: 1.8, dcirMOhms: 0.41, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-04-02', cluster: 'CLUSTER-#04', soh: 97.0, deviationFromMeanPct: 1.4, dcirMOhms: 0.42, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-05-01', cluster: 'CLUSTER-#05', soh: 96.1, deviationFromMeanPct: 0.5, dcirMOhms: 0.43, isSubstandard: false, status: 'NORMAL' as const },
    { packCode: 'PACK-06-01', cluster: 'CLUSTER-#06', soh: 95.7, deviationFromMeanPct: 0.1, dcirMOhms: 0.44, isSubstandard: false, status: 'NORMAL' as const }
  ];

  const sohConsistency: SohConsistencyData = {
    avgSohPct: avgSoh,
    maxSohPct: maxSoh,
    minSohPct: minSoh,
    deltaSohPct: Number((maxSoh - minSoh).toFixed(1)),
    standardDeviation: isRisky ? 2.85 : 1.42,
    substandardCount: summary.abnormalPackCount,
    distribution: [
      { range: 'SOH ≥ 95% (优良)', count: packs.filter(p => p.soh >= 95).length, percentage: Number(((packs.filter(p => p.soh >= 95).length / packs.length) * 100).toFixed(1)) },
      { range: '90% ≤ SOH < 95% (达标)', count: packs.filter(p => p.soh >= 90 && p.soh < 95).length, percentage: Number(((packs.filter(p => p.soh >= 90 && p.soh < 95).length / packs.length) * 100).toFixed(1)) },
      { range: 'SOH < 90% (短板预警)', count: packs.filter(p => p.soh < 90).length, percentage: Number(((packs.filter(p => p.soh < 90).length / packs.length) * 100).toFixed(1)) }
    ],
    packs
  };

  // 4.4 运行工况
  const operatingCondition: OperatingConditionData = {
    cumulativeFecCycles: 1482,
    designLifeCycles: 6000,
    cycleConsumptionPct: 24.7,
    avgOperatingTemp: 24.8,
    highSocRestRatioPct: isRisky ? 18.5 : 8.2,
    overDischargeRatioPct: 0.8,
    dodDistribution: [
      { range: '0-40% 浅充浅放', percentage: 18, cycleEquivalent: 266 },
      { range: '40-80% 中度充放', percentage: 32, cycleEquivalent: 474 },
      { range: '80-100% 深度充放', percentage: 50, cycleEquivalent: 742 }
    ],
    cRateDistribution: [
      { rateRange: '<0.25C 低倍率缓充放', hoursPct: 35, impactLevel: 'LOW' },
      { rateRange: '0.25C - 0.5C 额定工况', hoursPct: 52, impactLevel: 'NORMAL' },
      { rateRange: '0.5C - 0.8C 高峰顶电', hoursPct: 11, impactLevel: 'NORMAL' },
      { rateRange: '>0.8C 调频瞬态脉冲', hoursPct: 2, impactLevel: 'HIGH' }
    ]
  };

  return {
    siteId,
    socConsistency,
    electricalEnergy,
    sohConsistency,
    operatingCondition
  };
}
