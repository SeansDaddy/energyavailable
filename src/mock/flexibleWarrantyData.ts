// 全网站点灵活质保大盘与对比台账 Mock 数据
import { Site } from '../types';

export interface SiteFlexibleWarrantySummary {
  siteId: string;
  siteCode: string;
  siteName: string;
  region: string;
  representativeOffice: string;
  customer: string;
  capacityMw: number;
  ratedEnergyMwh: number;
  contractNo: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  warrantyYears: number;

  // 1. 合同基准工况约定
  annualBaselineEfc: number; // 基准年等效循环 (次)
  maxCrate: number; // 基准倍率 (C)
  baselineTempMax: number; // 基准允许最高工作温度 (℃)
  baselineTempAvg: number; // 基准平均工作温度 (℃)
  finalGuaranteedSoh: number; // 质保终了保证 SOH (%)

  // 2. 实际运行工况统计
  actualCumulativeEfc: number; // 实际累计等效循环 (次)
  actualThroughputMwh: number; // 实际放电能量吞吐 (MWh)
  actualMaxTemp: number; // 实际最高工作温度 (℃)
  actualAvgTemp: number; // 实际平均工作温度 (℃)
  actualMaxCrate: number; // 实际峰值倍率 (C)

  // 3. 超工况计算指标
  excessEfc: number; // 超额等效循环 = max(0, actualCumulativeEfc - baselineCumulativeEfc)
  overTempHours: number; // 超温小时数 (h)
  overTempDegreeHours: number; // 超温度时 (℃·h)
  overCrateThroughputMwh: number; // 超倍率区间能量吞吐 (MWh)
  overConditionIndex: number; // 综合超工况指数 (0-100)

  // 4. SOH 估算与双曲线当前打点对比
  currentBaselineSoh: number; // 当前基准工况 SOH 保证点 (%)
  currentFlexibleSoh: number; // 当前灵活质保估算打点 SOH (%)
  sohDelta: number; // SOH 裕度 = flexible - baseline
  estimatedEndLifeSoh: number; // 算法预估 10 年质保终了 SOH (%)
  equivalentWarrantyDaysChange: number; // 灵活质保期折算增减天数 (天)

  // 5. 履约判定与最新状态
  warrantyStatus: 'HEALTHY' | 'SLIGHT_OVER' | 'CRITICAL_OVER';
  warrantyStatusLabel: string;
  lastEvaluatedTime: string;
  algorithmVersion: string;
}

export const INITIAL_SITE_WARRANTY_SUMMARIES: SiteFlexibleWarrantySummary[] = [
  {
    siteId: 'site-001',
    siteCode: 'SZ-ESS-0042',
    siteName: '深圳光明储能电站二期-04号站',
    region: '华南区',
    representativeOffice: '深圳代表处',
    customer: '南方电网深圳供电局',
    capacityMw: 10.0,
    ratedEnergyMwh: 20.0,
    contractNo: 'CSG-SZ-2025-SLA-081',
    warrantyStartDate: '2024-01-01',
    warrantyEndDate: '2033-12-31',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 980,
    actualThroughputMwh: 19600,
    actualMaxTemp: 38.6,
    actualAvgTemp: 28.4,
    actualMaxCrate: 0.65,
    excessEfc: 68,
    overTempHours: 142,
    overTempDegreeHours: 420,
    overCrateThroughputMwh: 860,
    overConditionIndex: 45.2,
    currentBaselineSoh: 93.8,
    currentFlexibleSoh: 92.5,
    sohDelta: -1.3,
    estimatedEndLifeSoh: 78.4,
    equivalentWarrantyDaysChange: -237,
    warrantyStatus: 'SLIGHT_OVER',
    warrantyStatusLabel: '轻度超工况 (温升与超频导致SOH衰减偏快，建议质保补充协议)',
    lastEvaluatedTime: '2026-08-20 16:30',
    algorithmVersion: 'v3.4.2-Arrhenius'
  },
  {
    siteId: 'site-002',
    siteCode: 'SH-BW-0108',
    siteName: '上海宝武钢铁微电网储能示范站-01站',
    region: '华东区',
    representativeOffice: '上海代表处',
    customer: '中国宝武钢铁集团',
    capacityMw: 20.0,
    ratedEnergyMwh: 40.0,
    contractNo: 'BW-SH-2024-ESS-018',
    warrantyStartDate: '2024-03-01',
    warrantyEndDate: '2034-02-28',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 890,
    actualThroughputMwh: 35600,
    actualMaxTemp: 30.2,
    actualAvgTemp: 23.6,
    actualMaxCrate: 0.48,
    excessEfc: 0,
    overTempHours: 0,
    overTempDegreeHours: 0,
    overCrateThroughputMwh: 0,
    overConditionIndex: 4.5,
    currentBaselineSoh: 94.2,
    currentFlexibleSoh: 95.6,
    sohDelta: 1.4,
    estimatedEndLifeSoh: 82.8,
    equivalentWarrantyDaysChange: 255,
    warrantyStatus: 'HEALTHY',
    warrantyStatusLabel: '达标受保 (工况温和，SOH保持率高于基准线，可延长质保)',
    lastEvaluatedTime: '2026-08-20 16:15',
    algorithmVersion: 'v3.4.2-Arrhenius'
  },
  {
    siteId: 'site-003',
    siteCode: 'NW-XA-0019',
    siteName: '西安高新热电联产储能调峰站',
    region: '西北区',
    representativeOffice: '西安代表处',
    customer: '陕煤电力集团',
    capacityMw: 15.0,
    ratedEnergyMwh: 30.0,
    contractNo: 'SM-XA-2024-SLA-032',
    warrantyStartDate: '2024-05-01',
    warrantyEndDate: '2034-04-30',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 830,
    actualThroughputMwh: 24900,
    actualMaxTemp: 33.2,
    actualAvgTemp: 24.8,
    actualMaxCrate: 0.52,
    excessEfc: 12,
    overTempHours: 18,
    overTempDegreeHours: 35,
    overCrateThroughputMwh: 120,
    overConditionIndex: 18.6,
    currentBaselineSoh: 94.8,
    currentFlexibleSoh: 94.4,
    sohDelta: -0.4,
    estimatedEndLifeSoh: 80.6,
    equivalentWarrantyDaysChange: -73,
    warrantyStatus: 'HEALTHY',
    warrantyStatusLabel: '正常履约 (微量超频可自动冲抵，寿命终了预测满足80%保证)',
    lastEvaluatedTime: '2026-08-19 11:00',
    algorithmVersion: 'v3.4.2-Arrhenius'
  },
  {
    siteId: 'site-004',
    siteCode: 'HB-BJ-0077',
    siteName: '北京怀柔科学城智能微电网站-03站',
    region: '华北区',
    representativeOffice: '北京代表处',
    customer: '国家电投北京分公司',
    capacityMw: 8.0,
    ratedEnergyMwh: 16.0,
    contractNo: 'SPIC-BJ-2024-ESS-009',
    warrantyStartDate: '2023-11-01',
    warrantyEndDate: '2033-10-31',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 1140,
    actualThroughputMwh: 18240,
    actualMaxTemp: 41.2,
    actualAvgTemp: 30.5,
    actualMaxCrate: 0.72,
    excessEfc: 145,
    overTempHours: 268,
    overTempDegreeHours: 890,
    overCrateThroughputMwh: 1450,
    overConditionIndex: 72.8,
    currentBaselineSoh: 93.0,
    currentFlexibleSoh: 89.2,
    sohDelta: -3.8,
    estimatedEndLifeSoh: 74.2,
    equivalentWarrantyDaysChange: -693,
    warrantyStatus: 'CRITICAL_OVER',
    warrantyStatusLabel: '严重超工况 (超温超倍率高负荷运行，SOH衰减过快，需停机核损与责任界定)',
    lastEvaluatedTime: '2026-07-15 09:30',
    algorithmVersion: 'v3.4.2-Arrhenius'
  },
  {
    siteId: 'site-005',
    siteCode: 'JS-NJ-0023',
    siteName: '南京江北储能电站01号变电侧站',
    region: '华东区',
    representativeOffice: '南京代表处',
    customer: '江苏省国信集团',
    capacityMw: 30.0,
    ratedEnergyMwh: 60.0,
    contractNo: 'GX-JS-2024-SLA-055',
    warrantyStartDate: '2024-02-15',
    warrantyEndDate: '2034-02-14',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 915,
    actualThroughputMwh: 54900,
    actualMaxTemp: 29.8,
    actualAvgTemp: 24.1,
    actualMaxCrate: 0.49,
    excessEfc: 5,
    overTempHours: 0,
    overTempDegreeHours: 0,
    overCrateThroughputMwh: 0,
    overConditionIndex: 8.2,
    currentBaselineSoh: 94.4,
    currentFlexibleSoh: 95.1,
    sohDelta: 0.7,
    estimatedEndLifeSoh: 81.6,
    equivalentWarrantyDaysChange: 128,
    warrantyStatus: 'HEALTHY',
    warrantyStatusLabel: '达标受保 (集群均衡良好，工况符合合同基准约定)',
    lastEvaluatedTime: '2026-08-20 15:40',
    algorithmVersion: 'v3.4.2-Arrhenius'
  },
  {
    siteId: 'site-006',
    siteCode: 'GD-GZ-0089',
    siteName: '广州南沙自贸区综合能源港储能站',
    region: '华南区',
    representativeOffice: '广州代表处',
    customer: '广东粤电储能',
    capacityMw: 12.0,
    ratedEnergyMwh: 24.0,
    contractNo: 'YD-GD-2024-ESS-042',
    warrantyStartDate: '2024-04-01',
    warrantyEndDate: '2034-03-31',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 895,
    actualThroughputMwh: 21480,
    actualMaxTemp: 37.8,
    actualAvgTemp: 27.9,
    actualMaxCrate: 0.58,
    excessEfc: 28,
    overTempHours: 92,
    overTempDegreeHours: 210,
    overCrateThroughputMwh: 340,
    overConditionIndex: 38.5,
    currentBaselineSoh: 94.6,
    currentFlexibleSoh: 93.4,
    sohDelta: -1.2,
    estimatedEndLifeSoh: 79.1,
    equivalentWarrantyDaysChange: -219,
    warrantyStatus: 'SLIGHT_OVER',
    warrantyStatusLabel: '轻度超工况 (夏季局部风道温升偏高，终了预测略低于80%保证)',
    lastEvaluatedTime: '2026-08-20 12:10',
    algorithmVersion: 'v3.4.2-Arrhenius'
  },
  {
    siteId: 'site-007',
    siteCode: 'ZJ-HZ-0033',
    siteName: '杭州钱塘新区数据中心储能备电站',
    region: '华东区',
    representativeOffice: '杭州代表处',
    customer: '浙江省能源集团',
    capacityMw: 25.0,
    ratedEnergyMwh: 50.0,
    contractNo: 'ZE-ZJ-2024-SLA-061',
    warrantyStartDate: '2024-01-10',
    warrantyEndDate: '2034-01-09',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 930,
    actualThroughputMwh: 46500,
    actualMaxTemp: 30.5,
    actualAvgTemp: 23.9,
    actualMaxCrate: 0.45,
    excessEfc: 0,
    overTempHours: 0,
    overTempDegreeHours: 0,
    overCrateThroughputMwh: 0,
    overConditionIndex: 6.0,
    currentBaselineSoh: 94.1,
    currentFlexibleSoh: 95.0,
    sohDelta: 0.9,
    estimatedEndLifeSoh: 82.0,
    equivalentWarrantyDaysChange: 164,
    warrantyStatus: 'HEALTHY',
    warrantyStatusLabel: '达标受保 (数据中心后备式运行，放电深度适中，寿命保持良好)',
    lastEvaluatedTime: '2026-08-20 10:15',
    algorithmVersion: 'v3.4.2-Arrhenius'
  },
  {
    siteId: 'site-008',
    siteCode: 'GS-LZ-0055',
    siteName: '兰州新区光伏配储能电站02站',
    region: '西北区',
    representativeOffice: '兰州代表处',
    customer: '三峡新能源西北分公司',
    capacityMw: 50.0,
    ratedEnergyMwh: 100.0,
    contractNo: 'CTG-GS-2024-ESS-099',
    warrantyStartDate: '2024-06-01',
    warrantyEndDate: '2034-05-31',
    warrantyYears: 10,
    annualBaselineEfc: 365,
    maxCrate: 0.50,
    baselineTempMax: 35.0,
    baselineTempAvg: 25.0,
    finalGuaranteedSoh: 80.0,
    actualCumulativeEfc: 805,
    actualThroughputMwh: 80500,
    actualMaxTemp: 28.5,
    actualAvgTemp: 21.2,
    actualMaxCrate: 0.50,
    excessEfc: 0,
    overTempHours: 0,
    overTempDegreeHours: 0,
    overCrateThroughputMwh: 0,
    overConditionIndex: 5.2,
    currentBaselineSoh: 95.2,
    currentFlexibleSoh: 96.0,
    sohDelta: 0.8,
    estimatedEndLifeSoh: 82.5,
    equivalentWarrantyDaysChange: 146,
    warrantyStatus: 'HEALTHY',
    warrantyStatusLabel: '达标受保 (高原冷凉气候散热佳，容量衰减速率显著低于基准)',
    lastEvaluatedTime: '2026-08-20 09:20',
    algorithmVersion: 'v3.4.2-Arrhenius'
  }
];

export const getSiteFlexibleWarrantySummary = (siteId: string): SiteFlexibleWarrantySummary => {
  const found = INITIAL_SITE_WARRANTY_SUMMARIES.find(s => s.siteId === siteId);
  if (found) return found;
  return {
    ...INITIAL_SITE_WARRANTY_SUMMARIES[0],
    siteId,
    siteName: '储能电站',
    siteCode: `ESS-${siteId}`
  };
};
