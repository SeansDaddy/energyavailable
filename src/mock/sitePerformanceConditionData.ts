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
    versionNo: 'REV-20260820-01'
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
    versionNo: 'REV-20260820-01'
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
    versionNo: 'REV-20260819-02'
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
    versionNo: 'REV-20260715-01'
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
    versionNo: 'REV-20260820-01'
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
    versionNo: 'REV-20260820-01'
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
    versionNo: 'REV-20260820-01'
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
    versionNo: 'REV-20260820-01'
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
