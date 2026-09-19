import { EvaluationTaskRecord, PreSalesInputState } from '../types/preSalesEvaluation';
import {
  calculatePreSalesEvaluation,
  REGIONAL_ELECTRICITY_PRESETS,
  REGIONAL_WEATHER_PROFILES
} from '../utils/preSalesCalculationEngine';

// Default mock input for EVAL-001 (宁德时代)
const input001: PreSalesInputState = {
  entryMode: 'site_select',
  selectedSiteId: 'SITE-001',
  siteName: '宁德时代一期储能电站',
  region: '华东区',
  representativeOffice: '江苏代表处',
  customerName: '宁德时代新能源科技有限公司',
  industryScenario: '工商业高负荷储能',
  capacityMw: 25,
  capacityMwh: 50,
  proposedSla: 99.50,
  devices: [
    {
      id: 'DEV-01',
      type: 'PCS_INVERTER',
      typeName: 'PCS 变流器',
      model: 'PCS-1250K-HV (高压变流)',
      quantity: 20,
      ratedPowerKw: 1250,
      isKeyDevice: true,
      mtbfHours: 85000,
      mttrHours: 2.5
    },
    {
      id: 'DEV-02',
      type: 'BMS_CLUSTER',
      typeName: 'BMS 电池簇',
      model: 'LFP-280Ah-Rack (磷酸铁锂)',
      quantity: 40,
      ratedPowerKw: 1250,
      isKeyDevice: true,
      mtbfHours: 120000,
      mttrHours: 1.8
    },
    {
      id: 'DEV-03',
      type: 'EMS_HOST',
      typeName: 'EMS 主控系统',
      model: 'EMS-Core-V3 (双机冗余站)',
      quantity: 2,
      ratedPowerKw: 50,
      isKeyDevice: true,
      mtbfHours: 150000,
      mttrHours: 1.0
    },
    {
      id: 'DEV-04',
      type: 'TRANSFORMER',
      typeName: '主变压器',
      model: 'SCB14-2500/35 (干式变压器)',
      quantity: 10,
      ratedPowerKw: 2500,
      isKeyDevice: true,
      mtbfHours: 200000,
      mttrHours: 4.5
    },
    {
      id: 'DEV-05',
      type: 'HVAC_COOLING',
      typeName: '暖通温控 HVAC',
      model: 'LiquidCool-40KW (闭式液冷机组)',
      quantity: 20,
      ratedPowerKw: 40,
      isKeyDevice: false,
      mtbfHours: 60000,
      mttrHours: 3.0
    }
  ],
  redundancy: 'DUAL_HOT_BACKUP',
  topologyStructure: '双环网环切拓扑 (Dual Fiber Ring)',
  linkDescription: '双路光纤千兆工业以太网，支持自愈环网协议切换，时延 < 20ms',
  sampleSourceType: 'regional_pool',
  sampleCount: 38,
  meteorological: {
    source: 'auto_regional',
    ...REGIONAL_WEATHER_PROFILES['华东区'],
    notes: '东部沿海湿热气候，夏季极端高温持续时间长，需强化闭式液冷温控防护'
  },
  electricityPricing: REGIONAL_ELECTRICITY_PRESETS['华东区']
};

// Default mock input for EVAL-002 (中能建江苏金坛独立储能)
const input002: PreSalesInputState = {
  entryMode: 'offline_import',
  selectedSiteId: 'SITE-002',
  siteName: '中能建江苏金坛独立储能电站',
  region: '华东区',
  representativeOffice: '江苏代表处',
  customerName: '中国能源建设集团江苏省电力设计院',
  industryScenario: '独立共享储能电站',
  capacityMw: 50,
  capacityMwh: 100,
  proposedSla: 99.30,
  devices: [
    {
      id: 'DEV-01',
      type: 'PCS_INVERTER',
      typeName: 'PCS 变流器',
      model: 'PCS-1725K-E (集中式逆变器)',
      quantity: 30,
      ratedPowerKw: 1725,
      isKeyDevice: true,
      mtbfHours: 92000,
      mttrHours: 2.2
    },
    {
      id: 'DEV-02',
      type: 'BMS_CLUSTER',
      typeName: 'BMS 电池簇',
      model: 'LFP-314Ah-HighVolt',
      quantity: 64,
      ratedPowerKw: 1725,
      isKeyDevice: true,
      mtbfHours: 135000,
      mttrHours: 1.6
    },
    {
      id: 'DEV-03',
      type: 'EMS_HOST',
      typeName: 'EMS 主控系统',
      model: 'EMS-Grid-Plus (电网级冗余调度台)',
      quantity: 2,
      ratedPowerKw: 100,
      isKeyDevice: true,
      mtbfHours: 180000,
      mttrHours: 0.8
    },
    {
      id: 'DEV-04',
      type: 'TRANSFORMER',
      typeName: '主变压器',
      model: 'S13-50000/110kV 主变',
      quantity: 2,
      ratedPowerKw: 50000,
      isKeyDevice: true,
      mtbfHours: 240000,
      mttrHours: 5.0
    }
  ],
  redundancy: 'MULTI_ACTIVE',
  topologyStructure: '110kV 升压站多活分布式环网',
  linkDescription: '双冗余环网自愈调度专线',
  sampleSourceType: 'regional_pool',
  sampleCount: 42,
  meteorological: {
    source: 'auto_regional',
    ...REGIONAL_WEATHER_PROFILES['华东区'],
    notes: '常州金坛内陆丘陵湖泊区，防雷电浪涌配置标准提升'
  },
  electricityPricing: {
    ...REGIONAL_ELECTRICITY_PRESETS['华东区'],
    dailyCycles: 1.8,
    slaPenaltyPerTenthPercent: 8.0
  }
};

// Default mock input for EVAL-003 (高风险: 珠海高栏港)
const input003: PreSalesInputState = {
  entryMode: 'manual',
  selectedSiteId: 'SITE-003',
  siteName: '广东珠海高栏港重工业微网储能',
  region: '华南区',
  representativeOffice: '广东代表处',
  customerName: '华南某重工装备制造基地',
  industryScenario: '钢铁重工业微网',
  capacityMw: 20,
  capacityMwh: 40,
  proposedSla: 99.60, // 超过 99.55% 红色高危线！
  devices: [
    {
      id: 'DEV-01',
      type: 'PCS_INVERTER',
      typeName: 'PCS 变流器',
      model: 'PCS-1000K-Coastal',
      quantity: 20,
      ratedPowerKw: 1000,
      isKeyDevice: true,
      mtbfHours: 75000,
      mttrHours: 3.5
    },
    {
      id: 'DEV-02',
      type: 'BMS_CLUSTER',
      typeName: 'BMS 电池簇',
      model: 'LFP-280Ah-C5',
      quantity: 32,
      ratedPowerKw: 1000,
      isKeyDevice: true,
      mtbfHours: 110000,
      mttrHours: 2.2
    }
  ],
  redundancy: 'SINGLE', // 单机无冗余，高危！
  topologyStructure: '单机辐射形拓扑 (Single Star)',
  linkDescription: '单路工业网线直连，无冗余备份',
  sampleSourceType: 'regional_pool',
  sampleCount: 24,
  meteorological: {
    source: 'manual',
    ...REGIONAL_WEATHER_PROFILES['华南区'],
    corrosionGrade: 'C5',
    stormFrequency: 42,
    relativeHumidityPct: 92,
    maxTempC: 42.5,
    notes: '近海高盐雾强台风频发区，盐雾沉积与热湿负荷极大'
  },
  electricityPricing: REGIONAL_ELECTRICITY_PRESETS['华南区']
};

// Default mock input for EVAL-004 (样本不足: 新疆克拉玛依)
const input004: PreSalesInputState = {
  entryMode: 'manual',
  selectedSiteId: 'SITE-004',
  siteName: '新疆克拉玛依光储一体化示范项目',
  region: '西北区',
  representativeOffice: '新疆代表处',
  customerName: '中石油克拉玛依油田新能源分公司',
  industryScenario: '光伏电站配储',
  capacityMw: 30,
  capacityMwh: 60,
  proposedSla: 99.25,
  devices: [
    {
      id: 'DEV-01',
      type: 'PCS_INVERTER',
      typeName: 'PCS 变流器',
      model: 'PCS-1500K-Desert (荒漠风沙版)',
      quantity: 20,
      ratedPowerKw: 1500,
      isKeyDevice: true,
      mtbfHours: 88000,
      mttrHours: 3.2
    },
    {
      id: 'DEV-02',
      type: 'BMS_CLUSTER',
      typeName: 'BMS 电池簇',
      model: 'LFP-280Ah-Desert',
      quantity: 40,
      ratedPowerKw: 1500,
      isKeyDevice: true,
      mtbfHours: 115000,
      mttrHours: 2.0
    },
    {
      id: 'DEV-03',
      type: 'EMS_HOST',
      typeName: 'EMS 主控系统',
      model: 'EMS-Core-Plus',
      quantity: 2,
      ratedPowerKw: 50,
      isKeyDevice: true,
      mtbfHours: 160000,
      mttrHours: 1.2
    }
  ],
  redundancy: 'N_PLUS_ONE',
  topologyStructure: '光储箱变环网拓扑',
  linkDescription: '铠装单模光纤环网通信',
  sampleSourceType: 'regional_pool',
  sampleCount: 8, // < 10 样本不足！
  meteorological: {
    source: 'auto_regional',
    ...REGIONAL_WEATHER_PROFILES['西北区'],
    corrosionGrade: 'SAND_STORM',
    minTempC: -28.5,
    altitudeMeters: 1450,
    notes: '戈壁大风沙低温气候，极端严寒下需强化舱体保温及热管理闭环加热'
  },
  electricityPricing: REGIONAL_ELECTRICITY_PRESETS['西北区']
};

export const INITIAL_EVALUATION_TASKS: EvaluationTaskRecord[] = [
  {
    id: 'EVAL-202609-001',
    taskName: '宁德时代一期储能电站签约评估',
    siteName: '宁德时代一期储能电站',
    region: '华东区',
    representativeOffice: '江苏代表处',
    customerName: '宁德时代新能源科技有限公司',
    capacityMw: 25,
    capacityMwh: 50,
    proposedSla: 99.50,
    status: 'completed',
    createdAt: '2026-09-18 14:32',
    evaluatedAt: '2026-09-18 14:35',
    creatorName: '陈兴虎 (Tech Lead)',
    creatorEmail: 'xinghuchen@gmail.com',
    inputSnapshot: input001,
    resultSnapshot: calculatePreSalesEvaluation(input001)
  },
  {
    id: 'EVAL-202609-002',
    taskName: '中能建江苏金坛独立储能站签约评估',
    siteName: '中能建江苏金坛独立储能电站',
    region: '华东区',
    representativeOffice: '江苏代表处',
    customerName: '中国能源建设集团江苏省电力设计院',
    capacityMw: 50,
    capacityMwh: 100,
    proposedSla: 99.30,
    status: 'completed',
    createdAt: '2026-09-17 10:15',
    evaluatedAt: '2026-09-17 10:18',
    creatorName: '陈兴虎 (Tech Lead)',
    creatorEmail: 'xinghuchen@gmail.com',
    inputSnapshot: input002,
    resultSnapshot: calculatePreSalesEvaluation(input002)
  },
  {
    id: 'EVAL-202609-003',
    taskName: '珠海高栏港重工业微网高风险评估',
    siteName: '广东珠海高栏港重工业微网储能',
    region: '华南区',
    representativeOffice: '广东代表处',
    customerName: '华南某重工装备制造基地',
    capacityMw: 20,
    capacityMwh: 40,
    proposedSla: 99.60,
    status: 'completed',
    createdAt: '2026-09-16 16:40',
    evaluatedAt: '2026-09-16 16:44',
    creatorName: '陈兴虎 (Tech Lead)',
    creatorEmail: 'xinghuchen@gmail.com',
    inputSnapshot: input003,
    resultSnapshot: calculatePreSalesEvaluation(input003)
  },
  {
    id: 'EVAL-202609-004',
    taskName: '新疆克拉玛依光储一体化项目预审',
    siteName: '新疆克拉玛依光储一体化示范项目',
    region: '西北区',
    representativeOffice: '新疆代表处',
    customerName: '中石油克拉玛依油田新能源分公司',
    capacityMw: 30,
    capacityMwh: 60,
    proposedSla: 99.25,
    status: 'completed',
    createdAt: '2026-09-15 09:20',
    evaluatedAt: '2026-09-15 09:24',
    creatorName: '陈兴虎 (Tech Lead)',
    creatorEmail: 'xinghuchen@gmail.com',
    inputSnapshot: input004,
    resultSnapshot: calculatePreSalesEvaluation(input004)
  }
];
