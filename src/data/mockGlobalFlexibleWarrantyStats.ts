// 全网灵活质保统计 - 宏观多维分析数据

export interface GlobalWarrantyOverview {
  totalSites: number;
  totalCapacityMw: number;
  totalCapacityMwh: number;
  avgMeasuredSohPct: number;
  avgContractGuaranteeSohPct: number;
  avgSafetyMarginPct: number;
  complianceRatePct: number;
  overConditionSitesCount: number;
  overConditionRatioPct: number;
  totalContractValueYuanMln: number; // 百万元 (如 1860 百万 = 18.6亿)
  retentionDepositYuanMln: number;
  exceedingAdjustFeeYuanMln: number; // 动态加收调节服务费 (百万元)
}

export interface DimensionWarrantyItem {
  id: string;
  name: string;
  siteCount: number;
  capacityMw: number;
  capacityMwh: number;
  avgMeasuredSohPct: number;
  avgContractGuaranteeSohPct: number;
  sohSafetyMarginPct: number;
  annualDecayRatePct: number;
  overConditionCount: number;
  overConditionRatioPct: number;
  complianceRatePct: number;
  avgDailyCycles: number;
  avgCellTempC: number;
  contractValueYuanMln: number;
  gradeLabel: string;
}

export interface MonthlyWarrantyTrend {
  month: string;
  measuredSohPct: number;
  contractGuaranteeSohPct: number;
  labNominalSohPct: number;
  overConditionSitesCount: number;
  newBreachSitesCount: number;
}

export interface SohDistributionRange {
  range: string;
  siteCount: number;
  ratioPct: number;
  status: 'EXCELLENT' | 'NORMAL' | 'ATTENTION' | 'WARNING';
}

export interface OverConditionStressItem {
  name: string;
  siteCount: number;
  ratioPct: number;
  avgSohImpactPct: number;
  description: string;
}

// 1. 全网核心概览指标
export const GLOBAL_WARRANTY_OVERVIEW: GlobalWarrantyOverview = {
  totalSites: 38420,
  totalCapacityMw: 48650,
  totalCapacityMwh: 97300,
  avgMeasuredSohPct: 95.82,
  avgContractGuaranteeSohPct: 93.15,
  avgSafetyMarginPct: 2.67,
  complianceRatePct: 97.6,
  overConditionSitesCount: 922,
  overConditionRatioPct: 2.40,
  totalContractValueYuanMln: 1860.5,
  retentionDepositYuanMln: 111.6,
  exceedingAdjustFeeYuanMln: 42.8
};

// 2. 大区维度数据
export const REGION_WARRANTY_STATS: DimensionWarrantyItem[] = [
  {
    id: 'region-east',
    name: '华东区',
    siteCount: 14200,
    capacityMw: 18450,
    capacityMwh: 36900,
    avgMeasuredSohPct: 96.42,
    avgContractGuaranteeSohPct: 93.20,
    sohSafetyMarginPct: 3.22,
    annualDecayRatePct: 1.62,
    overConditionCount: 228,
    overConditionRatioPct: 1.61,
    complianceRatePct: 98.4,
    avgDailyCycles: 1.52,
    avgCellTempC: 24.8,
    contractValueYuanMln: 698.5,
    gradeLabel: '标杆履约区'
  },
  {
    id: 'region-south',
    name: '华南区',
    siteCount: 11800,
    capacityMw: 15200,
    capacityMwh: 30400,
    avgMeasuredSohPct: 95.50,
    avgContractGuaranteeSohPct: 93.10,
    sohSafetyMarginPct: 2.40,
    annualDecayRatePct: 1.95,
    overConditionCount: 382,
    overConditionRatioPct: 3.24,
    complianceRatePct: 96.8,
    avgDailyCycles: 1.78,
    avgCellTempC: 27.6,
    contractValueYuanMln: 582.0,
    gradeLabel: '高温关注区'
  },
  {
    id: 'region-north',
    name: '华北区',
    siteCount: 7600,
    capacityMw: 9800,
    capacityMwh: 19600,
    avgMeasuredSohPct: 95.95,
    avgContractGuaranteeSohPct: 93.30,
    sohSafetyMarginPct: 2.65,
    annualDecayRatePct: 1.74,
    overConditionCount: 164,
    overConditionRatioPct: 2.16,
    complianceRatePct: 97.8,
    avgDailyCycles: 1.45,
    avgCellTempC: 23.2,
    contractValueYuanMln: 375.2,
    gradeLabel: '平稳履约区'
  },
  {
    id: 'region-northwest',
    name: '西北区',
    siteCount: 4820,
    capacityMw: 5200,
    capacityMwh: 10400,
    avgMeasuredSohPct: 94.88,
    avgContractGuaranteeSohPct: 92.80,
    sohSafetyMarginPct: 2.08,
    annualDecayRatePct: 2.18,
    overConditionCount: 148,
    overConditionRatioPct: 3.07,
    complianceRatePct: 95.2,
    avgDailyCycles: 1.84,
    avgCellTempC: 26.4,
    contractValueYuanMln: 204.8,
    gradeLabel: '大倍率调频区'
  }
];

// 3. 电芯厂商与技术路线维度
export const CELL_MANUFACTURER_WARRANTY_STATS: DimensionWarrantyItem[] = [
  {
    id: 'cell-catl',
    name: '宁德时代 (CATL 280Ah/314Ah)',
    siteCount: 18600,
    capacityMw: 24200,
    capacityMwh: 48400,
    avgMeasuredSohPct: 96.38,
    avgContractGuaranteeSohPct: 93.20,
    sohSafetyMarginPct: 3.18,
    annualDecayRatePct: 1.58,
    overConditionCount: 360,
    overConditionRatioPct: 1.94,
    complianceRatePct: 98.6,
    avgDailyCycles: 1.62,
    avgCellTempC: 24.9,
    contractValueYuanMln: 924.5,
    gradeLabel: '超长寿命标杆'
  },
  {
    id: 'cell-byd',
    name: '比亚迪 (BYD 刀片储能电芯)',
    siteCount: 9400,
    capacityMw: 11800,
    capacityMwh: 23600,
    avgMeasuredSohPct: 95.80,
    avgContractGuaranteeSohPct: 93.15,
    sohSafetyMarginPct: 2.65,
    annualDecayRatePct: 1.76,
    overConditionCount: 215,
    overConditionRatioPct: 2.29,
    complianceRatePct: 97.7,
    avgDailyCycles: 1.58,
    avgCellTempC: 25.4,
    contractValueYuanMln: 452.0,
    gradeLabel: '高结构安全'
  },
  {
    id: 'cell-eve',
    name: '亿纬动力 (EVE 314Ah 长循环)',
    siteCount: 6200,
    capacityMw: 7850,
    capacityMwh: 15700,
    avgMeasuredSohPct: 95.20,
    avgContractGuaranteeSohPct: 93.10,
    sohSafetyMarginPct: 2.10,
    annualDecayRatePct: 1.92,
    overConditionCount: 198,
    overConditionRatioPct: 3.19,
    complianceRatePct: 96.2,
    avgDailyCycles: 1.80,
    avgCellTempC: 26.2,
    contractValueYuanMln: 301.2,
    gradeLabel: '大倍率表现优'
  },
  {
    id: 'cell-others',
    name: '其他品牌 (中创新航/国轩高科等)',
    siteCount: 4220,
    capacityMw: 4800,
    capacityMwh: 9600,
    avgMeasuredSohPct: 94.65,
    avgContractGuaranteeSohPct: 92.90,
    sohSafetyMarginPct: 1.75,
    annualDecayRatePct: 2.25,
    overConditionCount: 149,
    overConditionRatioPct: 3.53,
    complianceRatePct: 94.8,
    avgDailyCycles: 1.68,
    avgCellTempC: 26.8,
    contractValueYuanMln: 182.8,
    gradeLabel: '需动态折算'
  }
];

// 4. 运行场景维度
export const SCENARIO_WARRANTY_STATS: DimensionWarrantyItem[] = [
  {
    id: 'scenario-arbitrage',
    name: '工商业与电网常规峰谷套利',
    siteCount: 21400,
    capacityMw: 27800,
    capacityMwh: 55600,
    avgMeasuredSohPct: 96.25,
    avgContractGuaranteeSohPct: 93.20,
    sohSafetyMarginPct: 3.05,
    annualDecayRatePct: 1.64,
    overConditionCount: 380,
    overConditionRatioPct: 1.78,
    complianceRatePct: 98.2,
    avgDailyCycles: 1.55,
    avgCellTempC: 25.1,
    contractValueYuanMln: 1045.0,
    gradeLabel: '基线稳定'
  },
  {
    id: 'scenario-fm',
    name: '独立一次/二次调频服务',
    siteCount: 5800,
    capacityMw: 8400,
    capacityMwh: 16800,
    avgMeasuredSohPct: 94.70,
    avgContractGuaranteeSohPct: 92.80,
    sohSafetyMarginPct: 1.90,
    annualDecayRatePct: 2.30,
    overConditionCount: 265,
    overConditionRatioPct: 4.57,
    complianceRatePct: 95.4,
    avgDailyCycles: 2.35,
    avgCellTempC: 28.2,
    contractValueYuanMln: 342.5,
    gradeLabel: '超工况加权高'
  },
  {
    id: 'scenario-renewable',
    name: '风光新能源平滑与共享配储',
    siteCount: 8100,
    capacityMw: 9850,
    capacityMwh: 19700,
    avgMeasuredSohPct: 95.75,
    avgContractGuaranteeSohPct: 93.10,
    sohSafetyMarginPct: 2.65,
    annualDecayRatePct: 1.82,
    overConditionCount: 182,
    overConditionRatioPct: 2.25,
    complianceRatePct: 97.8,
    avgDailyCycles: 1.25,
    avgCellTempC: 24.5,
    contractValueYuanMln: 368.0,
    gradeLabel: '长储时充放'
  },
  {
    id: 'scenario-microgrid',
    name: '微电网与关键负荷高可靠备电',
    siteCount: 3120,
    capacityMw: 2600,
    capacityMwh: 5200,
    avgMeasuredSohPct: 96.80,
    avgContractGuaranteeSohPct: 93.50,
    sohSafetyMarginPct: 3.30,
    annualDecayRatePct: 1.38,
    overConditionCount: 95,
    overConditionRatioPct: 3.04,
    complianceRatePct: 97.0,
    avgDailyCycles: 0.85,
    avgCellTempC: 24.0,
    contractValueYuanMln: 105.0,
    gradeLabel: '浮充衰减可控'
  }
];

// 5. 重点客户维度
export const CUSTOMER_WARRANTY_STATS: DimensionWarrantyItem[] = [
  {
    id: 'cust-sgcc',
    name: '国家电网有限公司',
    siteCount: 14800,
    capacityMw: 19200,
    capacityMwh: 38400,
    avgMeasuredSohPct: 96.10,
    avgContractGuaranteeSohPct: 93.20,
    sohSafetyMarginPct: 2.90,
    annualDecayRatePct: 1.68,
    overConditionCount: 310,
    overConditionRatioPct: 2.09,
    complianceRatePct: 98.1,
    avgDailyCycles: 1.60,
    avgCellTempC: 25.0,
    contractValueYuanMln: 735.0,
    gradeLabel: '战略优质客户'
  },
  {
    id: 'cust-csg',
    name: '中国南方电网有限责任公司',
    siteCount: 11400,
    capacityMw: 14600,
    capacityMwh: 29200,
    avgMeasuredSohPct: 95.55,
    avgContractGuaranteeSohPct: 93.10,
    sohSafetyMarginPct: 2.45,
    annualDecayRatePct: 1.92,
    overConditionCount: 375,
    overConditionRatioPct: 3.29,
    complianceRatePct: 96.7,
    avgDailyCycles: 1.75,
    avgCellTempC: 27.4,
    contractValueYuanMln: 562.5,
    gradeLabel: '夏季负荷大'
  },
  {
    id: 'cust-chnenergy',
    name: '国家能源投资集团有限责任公司',
    siteCount: 5600,
    capacityMw: 7100,
    capacityMwh: 14200,
    avgMeasuredSohPct: 95.70,
    avgContractGuaranteeSohPct: 93.00,
    sohSafetyMarginPct: 2.70,
    annualDecayRatePct: 1.85,
    overConditionCount: 125,
    overConditionRatioPct: 2.23,
    complianceRatePct: 97.8,
    avgDailyCycles: 1.50,
    avgCellTempC: 24.6,
    contractValueYuanMln: 278.0,
    gradeLabel: '新能源基地群'
  },
  {
    id: 'cust-ctg',
    name: '中国长江三峡集团有限公司',
    siteCount: 4200,
    capacityMw: 5150,
    capacityMwh: 10300,
    avgMeasuredSohPct: 96.05,
    avgContractGuaranteeSohPct: 93.15,
    sohSafetyMarginPct: 2.90,
    annualDecayRatePct: 1.70,
    overConditionCount: 72,
    overConditionRatioPct: 1.71,
    complianceRatePct: 98.3,
    avgDailyCycles: 1.48,
    avgCellTempC: 24.2,
    contractValueYuanMln: 205.0,
    gradeLabel: '海上与陆上标杆'
  },
  {
    id: 'cust-others',
    name: '其他工商业与央国企投资人',
    siteCount: 2420,
    capacityMw: 2600,
    capacityMwh: 5200,
    avgMeasuredSohPct: 95.20,
    avgContractGuaranteeSohPct: 92.90,
    sohSafetyMarginPct: 2.30,
    annualDecayRatePct: 2.05,
    overConditionCount: 40,
    overConditionRatioPct: 1.65,
    complianceRatePct: 97.1,
    avgDailyCycles: 1.65,
    avgCellTempC: 25.8,
    contractValueYuanMln: 80.0,
    gradeLabel: '多元分散资产'
  }
];

// 6. 全网 12 个月 SOH 衰减演进与保证底线趋势
export const NETWORK_WARRANTY_12_MONTHS: MonthlyWarrantyTrend[] = [
  { month: '2025-09', measuredSohPct: 97.40, contractGuaranteeSohPct: 94.60, labNominalSohPct: 98.10, overConditionSitesCount: 650, newBreachSitesCount: 8 },
  { month: '2025-10', measuredSohPct: 97.25, contractGuaranteeSohPct: 94.45, labNominalSohPct: 97.95, overConditionSitesCount: 680, newBreachSitesCount: 11 },
  { month: '2025-11', measuredSohPct: 97.10, contractGuaranteeSohPct: 94.30, labNominalSohPct: 97.80, overConditionSitesCount: 710, newBreachSitesCount: 9 },
  { month: '2025-12', measuredSohPct: 96.95, contractGuaranteeSohPct: 94.15, labNominalSohPct: 97.65, overConditionSitesCount: 740, newBreachSitesCount: 14 },
  { month: '2026-01', measuredSohPct: 96.80, contractGuaranteeSohPct: 94.00, labNominalSohPct: 97.50, overConditionSitesCount: 765, newBreachSitesCount: 12 },
  { month: '2026-02', measuredSohPct: 96.65, contractGuaranteeSohPct: 93.85, labNominalSohPct: 97.35, overConditionSitesCount: 780, newBreachSitesCount: 10 },
  { month: '2026-03', measuredSohPct: 96.50, contractGuaranteeSohPct: 93.70, labNominalSohPct: 97.20, overConditionSitesCount: 805, newBreachSitesCount: 15 },
  { month: '2026-04', measuredSohPct: 96.35, contractGuaranteeSohPct: 93.55, labNominalSohPct: 97.05, overConditionSitesCount: 825, newBreachSitesCount: 13 },
  { month: '2026-05', measuredSohPct: 96.20, contractGuaranteeSohPct: 93.40, labNominalSohPct: 96.90, overConditionSitesCount: 860, newBreachSitesCount: 18 },
  { month: '2026-06', measuredSohPct: 96.05, contractGuaranteeSohPct: 93.25, labNominalSohPct: 96.75, overConditionSitesCount: 890, newBreachSitesCount: 22 },
  { month: '2026-07', measuredSohPct: 95.92, contractGuaranteeSohPct: 93.20, labNominalSohPct: 96.60, overConditionSitesCount: 945, newBreachSitesCount: 28 },
  { month: '2026-08', measuredSohPct: 95.82, contractGuaranteeSohPct: 93.15, labNominalSohPct: 96.48, overConditionSitesCount: 922, newBreachSitesCount: 19 }
];

// 7. SOH 保持率分布阶梯
export const SOH_DISTRIBUTION_RANGES: SohDistributionRange[] = [
  { range: 'SOH ≥ 96.0% (优良标杆)', siteCount: 24860, ratioPct: 64.7, status: 'EXCELLENT' },
  { range: '93.0% ≤ SOH < 96.0% (合规达标)', siteCount: 11240, ratioPct: 29.3, status: 'NORMAL' },
  { range: '90.0% ≤ SOH < 93.0% (临界关注)', siteCount: 1780, ratioPct: 4.6, status: 'ATTENTION' },
  { range: 'SOH < 90.0% (超工况高危预警)', siteCount: 540, ratioPct: 1.4, status: 'WARNING' }
];

// 8. 超工况应力诱因分类剖析
export const OVER_CONDITION_STRESS_BREAKDOWN: OverConditionStressItem[] = [
  {
    name: '极端高温与冷机故障温升',
    siteCount: 387,
    ratioPct: 42.0,
    avgSohImpactPct: -1.85,
    description: '电芯温度长期超过 35℃，阿伦尼乌斯热加速老化加剧'
  },
  {
    name: '日循环频次超标 (FEC > 2.0次)',
    siteCount: 258,
    ratioPct: 28.0,
    avgSohImpactPct: -1.45,
    description: '电力现货频发深度套利，累计吞吐电量超过标称年限基准'
  },
  {
    name: '大倍率充放与高频调频脉冲',
    siteCount: 166,
    ratioPct: 18.0,
    avgSohImpactPct: -1.20,
    description: '瞬时大电流造成电芯极化加剧与晶格局部损伤'
  },
  {
    name: '深度放电 (DOD > 95%) 触底',
    siteCount: 111,
    ratioPct: 12.0,
    avgSohImpactPct: -0.95,
    description: '末端脱锂过度造成负极活性物质永久损失'
  }
];
