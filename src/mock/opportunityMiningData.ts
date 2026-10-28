import {
  OpportunityLead,
  HealthPredictionOpportunity,
  LossRetrofitOpportunity,
  AssetValuationOpportunity,
  CarbonGreenCertOpportunity,
  SafetyComplianceOpportunity,
  DataApiProduct,
  MiningRuleItem,
  ClosedLoopEffectRecord,
  OpportunityWarningAlert,
  OpportunityFunnelSummary
} from '../types/opportunityMining';

// 1. 商机线索全量数据 (覆盖不同阶段、类别、客户与同步状态)
export const INITIAL_OPPORTUNITY_LEADS: OpportunityLead[] = [
  {
    id: 'lead-001',
    leadNo: 'OPP-2026-0842',
    title: '深圳光明储能电站 3# 簇老化模组整体置换与扩容技改商机',
    category: 'EQUIPMENT_HEALTH_RUL',
    categoryLabel: '设备健康与寿命预测',
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    clientName: '南方电网深圳供电局',
    region: '华南区',
    stage: 'NEGOTIATION',
    stageLabel: '商务谈判竞价',
    triggerReason: '3# 簇实测 SOH 跌破 88.4%，且电芯局部超温 38.6℃，触发整簇提前置换与电能量扩容补齐规则',
    estimatedValueYuan: 2480000,
    probabilityPct: 85,
    weightedValueYuan: 2108000,
    createdAt: '2026-08-05 10:30',
    dueDate: '2026-09-15',
    owner: '张伟 (大客户商务总监)',
    syncStatus: 'SYNCED',
    syncTarget: 'Salesforce CRM / PCare 工单中心',
    urgency: 'HIGH',
    riskAlert: '商务谈判已持续 18 天，建议安排区域技术总监参与技术交底',
    technicalDiagnosis: {
      currentMetric: '3# 簇 SOH 88.4% (全站最低短板)',
      potentialGain: '全站放电量恢复 +1.82 MWh/日，消除短板提前截断损失',
      paybackMonths: 14.5,
      roiPct: 28.4
    }
  },
  {
    id: 'lead-002',
    leadNo: 'OPP-2026-0839',
    title: '河西风光基地储能1号站 液冷管路水力平衡与高效变频水泵技改',
    category: 'LOSS_RETROFIT',
    categoryLabel: '损失诊断与技改评估',
    siteId: 'site-003',
    siteName: '河西风光基地集中式储能1号站',
    clientName: '国家能源投资集团甘肃分公司',
    region: '西北区',
    stage: 'CLIENT_PITCHED',
    stageLabel: '客户推介沟通',
    triggerReason: '液冷温控机组 COP 衰减至 2.45，辅电功耗占比上升 2.8%，触发冷机变频节能与管阻优化方案',
    estimatedValueYuan: 850000,
    probabilityPct: 65,
    weightedValueYuan: 552500,
    createdAt: '2026-08-12 14:15',
    dueDate: '2026-09-30',
    owner: '李志国 (西北运维总监)',
    syncStatus: 'SYNCED',
    syncTarget: '国能物资招采接口',
    urgency: 'MEDIUM',
    technicalDiagnosis: {
      currentMetric: '辅电功耗率 4.8% (超标 +1.6%)',
      potentialGain: '年节约站用电 284,000 kWh，提升综合 RTE 1.15%',
      paybackMonths: 18.2,
      roiPct: 22.8
    }
  },
  {
    id: 'lead-003',
    leadNo: 'OPP-2026-0835',
    title: '华东区储能集群 2026 年度集中预防性维保与备件寄售框架协议',
    category: 'DISPATCH_SPARE_PARTS',
    categoryLabel: '智能调度与备件优化',
    siteId: 'site-002',
    siteName: '苏州工业园区综合能源储能站',
    clientName: '国家电网江苏省电力公司',
    region: '华东区',
    stage: 'CONTRACTED',
    stageLabel: '签约落地履约',
    triggerReason: '基于全网健康度算法预测下半年 12 座站将迎峰度夏，触发集约化备件寄售与预防巡检服务包',
    estimatedValueYuan: 4200000,
    probabilityPct: 100,
    weightedValueYuan: 4200000,
    createdAt: '2026-07-20 09:00',
    dueDate: '2026-08-25',
    owner: '陈敏 (华东大区经理)',
    syncStatus: 'SYNCED',
    syncTarget: '国网新源 ERP 系统',
    urgency: 'LOW',
    technicalDiagnosis: {
      currentMetric: '备件响应时长平均 18 小时',
      potentialGain: '停运 MTTR 压缩至 3.2 小时以内，避免电网考核 60+ 万元',
      paybackMonths: 9.6,
      roiPct: 41.2
    },
    closedLoopResult: {
      actualValueYuan: 4200000,
      actualRteGainPct: 0.85,
      actualPaybackMonths: 9.2,
      feedbackScore: 98,
      completedAt: '2026-08-22'
    }
  },
  {
    id: 'lead-004',
    leadNo: 'OPP-2026-0831',
    title: '江苏如东海上风电储能 35kV 关口母排接触电阻发热改造商机',
    category: 'COMMERCIAL_LEAD',
    categoryLabel: '核心商机线索生成',
    siteId: 'site-005',
    siteName: '江苏如东海上风电配套储能示范站',
    clientName: '中国三峡新能源集团',
    region: '华东区',
    stage: 'EVALUATING',
    stageLabel: '方案评估中',
    triggerReason: '高盐雾腐蚀致使直流汇流箱端子温升达 14.4℃，综合线损率突破 1.48%，触发铜排镀锡防腐改造',
    estimatedValueYuan: 620000,
    probabilityPct: 70,
    weightedValueYuan: 434000,
    createdAt: '2026-08-18 16:40',
    dueDate: '2026-09-20',
    owner: '周亮 (电气改造专家)',
    syncStatus: 'SYNCED',
    syncTarget: '三峡供应链协同平台',
    urgency: 'HIGH',
    technicalDiagnosis: {
      currentMetric: '直流端子最高温 48.6℃ / 线损率 1.48%',
      potentialGain: '年挽回线损电量 36.8 MWh，降低火灾安全隐患',
      paybackMonths: 12.0,
      roiPct: 32.5
    }
  },
  {
    id: 'lead-005',
    leadNo: 'OPP-2026-0828',
    title: '乌鲁木齐高新区集中储能项目 并网交易尽调评级与并购估值服务',
    category: 'ASSET_VALUATION',
    categoryLabel: '资产尽调评级与交易估值',
    siteId: 'site-007',
    siteName: '乌鲁木齐达坂城光伏配套储能电站',
    clientName: '中国广核集团新能源控股',
    region: '西北区',
    stage: 'CLIENT_PITCHED',
    stageLabel: '客户推介沟通',
    triggerReason: '业主拟开展基础设施公募 REITs 发行与股权转让，需出具基于数字孪生 SOH 衰减的第三方专业估值',
    estimatedValueYuan: 450000,
    probabilityPct: 60,
    weightedValueYuan: 270000,
    createdAt: '2026-08-15 11:00',
    dueDate: '2026-09-30',
    owner: '赵峰 (专业服务运营总监)',
    syncStatus: 'SYNCED',
    syncTarget: '中金证券投行项目库',
    urgency: 'MEDIUM',
    technicalDiagnosis: {
      currentMetric: '资产评估评级 AA 级',
      potentialGain: '估值提升 1,200 万元，助力低成本债券融资发行',
      paybackMonths: 6.0,
      roiPct: 65.0
    }
  },
  {
    id: 'lead-006',
    leadNo: 'OPP-2026-0822',
    title: '宁夏中宁电网侧储能电站 绿电绿证 (GEC) 核发与 CCER 碳资产开发',
    category: 'CARBON_GREEN_CERT',
    categoryLabel: '功率预测与绿证碳资产',
    siteId: 'site-006',
    siteName: '中宁电网侧独立储能电站',
    clientName: '国家电网宁夏电力调度中心',
    region: '西北区',
    stage: 'NEGOTIATION',
    stageLabel: '商务谈判竞价',
    triggerReason: '充放电能量计量达标，具备完整绿电交易区块链溯源存证，触发绿证代核发与碳减排量交易分成服务',
    estimatedValueYuan: 1350000,
    probabilityPct: 80,
    weightedValueYuan: 1080000,
    createdAt: '2026-08-08 15:20',
    dueDate: '2026-09-10',
    owner: '孙伟 (碳资产业务经理)',
    syncStatus: 'SYNCED',
    syncTarget: '北京电力交易中心绿色碳证平台',
    urgency: 'MEDIUM',
    technicalDiagnosis: {
      currentMetric: '年均充放电吞吐 48,000 MWh',
      potentialGain: '可核发绿证 48,000 张，额外创造增量收益 144 万元/年',
      paybackMonths: 8.5,
      roiPct: 46.8
    }
  },
  {
    id: 'lead-007',
    leadNo: 'OPP-2026-0818',
    title: '深圳前海数字能源零碳园区 GB 51048 消防与防爆合规认证辅导',
    category: 'SAFETY_COMPLIANCE',
    categoryLabel: '安全合规与零碳认证',
    siteId: 'site-004',
    siteName: '深圳前海金融中心用户侧储能站',
    clientName: '招商局集团前海蛇口自贸区',
    region: '华南区',
    stage: 'CONTRACTED',
    stageLabel: '签约落地履约',
    triggerReason: '地方住建与消防新规强制要求密闭地下空间储能站完成全工况防爆与热失控闭环认证',
    estimatedValueYuan: 580000,
    probabilityPct: 100,
    weightedValueYuan: 580000,
    createdAt: '2026-07-15 14:00',
    dueDate: '2026-08-20',
    owner: '黄华 (合规认证首席架构师)',
    syncStatus: 'SYNCED',
    syncTarget: '前海政务协同审批平台',
    urgency: 'LOW',
    technicalDiagnosis: {
      currentMetric: '合规评分 82 分 (存在排烟联动微小间隙)',
      potentialGain: '获取保险公司财产保费 18% 折扣，获批零碳建筑示范补贴',
      paybackMonths: 7.2,
      roiPct: 52.0
    },
    closedLoopResult: {
      actualValueYuan: 580000,
      actualRteGainPct: 0.0,
      actualPaybackMonths: 6.8,
      feedbackScore: 96,
      completedAt: '2026-08-18'
    }
  },
  {
    id: 'lead-008',
    leadNo: 'OPP-2026-0812',
    title: '全网储能电池退化健康指数 (EHI) 行业数据 API 商业授权产品',
    category: 'DATA_API',
    categoryLabel: '行业数据API与指数产品',
    siteId: 'site-001',
    siteName: '专业服务运营平台全网电站数据总线',
    clientName: '中诚信国际信用评级 / 阳光电源技术研究院',
    region: '华东区',
    stage: 'NEGOTIATION',
    stageLabel: '商务谈判竞价',
    triggerReason: '38,420 座在运储能站全生命周期退化脱敏数据，具备极高宏观指数价值，触发 API 年费授权',
    estimatedValueYuan: 1200000,
    probabilityPct: 90,
    weightedValueYuan: 1080000,
    createdAt: '2026-08-01 09:30',
    dueDate: '2026-09-05',
    owner: '钱进 (数字化产品总监)',
    syncStatus: 'SYNCED',
    syncTarget: 'OpenAPI 网关与开发者门户',
    urgency: 'HIGH',
    technicalDiagnosis: {
      currentMetric: '已集成 38,420 座电站多维指标',
      potentialGain: '边际成本为零的高毛利纯软件收入，年费稳定续签',
      paybackMonths: 2.0,
      roiPct: 180.0
    }
  },
  {
    id: 'lead-009',
    leadNo: 'OPP-2026-0805',
    title: '河北张家口坝上储能电站 低温环境下负极析锂抑制主动预热改造',
    category: 'LOSS_RETROFIT',
    categoryLabel: '损失诊断与技改评估',
    siteId: 'site-008',
    siteName: '张家口风电配套张北储能电站',
    clientName: '中国华能集团华北分公司',
    region: '华北区',
    stage: 'DISCOVERED',
    stageLabel: '发现与触发',
    triggerReason: '历史冬季存在 14 次在 8.5℃ 低温下强制大电流充电记录，触发防析锂循环主动辅热改造算法',
    estimatedValueYuan: 760000,
    probabilityPct: 45,
    weightedValueYuan: 342000,
    createdAt: '2026-08-25 11:20',
    dueDate: '2026-10-15',
    owner: '周亮 (电气改造专家)',
    syncStatus: 'PENDING',
    syncTarget: '华能电子招投标系统',
    urgency: 'MEDIUM',
    riskAlert: '新触发机会点，尚未完成第一轮客户技术对接',
    technicalDiagnosis: {
      currentMetric: '低温极化导致 SOH 年化加速衰减 0.45%',
      potentialGain: '消除电芯析锂短路风险，延长电芯日历寿命 2.5 年',
      paybackMonths: 16.0,
      roiPct: 25.5
    }
  },
  {
    id: 'lead-010',
    leadNo: 'OPP-2026-0801',
    title: '广州南沙微电网储能站 峰谷套利与需量控制算法动态优化服务',
    category: 'COMMERCIAL_LEAD',
    categoryLabel: '核心商机线索生成',
    siteId: 'site-009',
    siteName: '广州南沙自贸区微网储能站',
    clientName: '广州越秀集团产业园',
    region: '华南区',
    stage: 'CLOSED',
    stageLabel: '归档复盘',
    triggerReason: '客户工业用电基本电费占比偏高，触发最大需量平抑与分时现货交易算法增值运营服务',
    estimatedValueYuan: 420000,
    probabilityPct: 100,
    weightedValueYuan: 420000,
    createdAt: '2026-06-10 10:00',
    dueDate: '2026-07-20',
    owner: '张伟 (大客户商务总监)',
    syncStatus: 'SYNCED',
    syncTarget: '越秀能管系统',
    urgency: 'LOW',
    technicalDiagnosis: {
      currentMetric: '月度基本电费 42 万元',
      potentialGain: '需量控制削峰 18%，年节约电费支出 52 万元',
      paybackMonths: 8.0,
      roiPct: 48.0
    },
    closedLoopResult: {
      actualValueYuan: 460000,
      actualRteGainPct: 0.45,
      actualPaybackMonths: 7.5,
      feedbackScore: 99,
      completedAt: '2026-07-28'
    }
  }
];

// 2. 机会点转换漏斗统计数据
export const INITIAL_FUNNEL_SUMMARY: OpportunityFunnelSummary = {
  totalLeads: 10,
  totalPipelineValueYuan: 12560000,
  weightedPipelineValueYuan: 9546500,
  wonDealsValueYuan: 5240000,
  overallConversionRatePct: 41.7,
  avgSalesCycleDays: 34.5,
  stages: [
    { stage: 'DISCOVERED', label: '1. 发现与触发', count: 1, amountYuan: 760000, conversionFromPreviousPct: 100 },
    { stage: 'EVALUATING', label: '2. 方案评估中', count: 1, amountYuan: 620000, conversionFromPreviousPct: 81.5 },
    { stage: 'CLIENT_PITCHED', label: '3. 客户推介沟通', count: 2, amountYuan: 1300000, conversionFromPreviousPct: 74.2 },
    { stage: 'NEGOTIATION', label: '4. 商务谈判竞价', count: 3, amountYuan: 5030000, conversionFromPreviousPct: 68.0 },
    { stage: 'CONTRACTED', label: '5. 签约落地履约', count: 2, amountYuan: 4780000, conversionFromPreviousPct: 58.6 },
    { stage: 'CLOSED', label: '6. 归档复盘', count: 1, amountYuan: 420000, conversionFromPreviousPct: 100 }
  ]
};

// 3. 设备健康评分与寿命预测机会点
export const INITIAL_HEALTH_PREDICTION_OPPS: HealthPredictionOpportunity[] = [
  {
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    deviceType: '3# 电池簇 (CLUSTER-#03)',
    currentHealthScore: 78.4,
    predictedRulMonths: 14.5,
    optimalSwapDate: '2027-02-15 (最佳经济置换窗口)',
    earlyWarningDays: 168,
    preventiveLossSavingYuan: 580000,
    recommendedAction: '提前采购匹配批次磷酸铁锂电池模组，制定迎峰度夏前整簇热平衡更换工单',
    cellDegradationRateAnnual: 2.85
  },
  {
    siteId: 'site-003',
    siteName: '河西风光基地集中式储能1号站',
    deviceType: '2# 储能双向变流器 PCS (2.5MW)',
    currentHealthScore: 81.2,
    predictedRulMonths: 18.0,
    optimalSwapDate: '2027-06-30',
    earlyWarningDays: 142,
    preventiveLossSavingYuan: 420000,
    recommendedAction: 'IGBT 模块结温偏高，建议在 18 个月内安排驱动板及主功率管束预防性轮换',
    cellDegradationRateAnnual: 2.10
  },
  {
    siteId: 'site-005',
    siteName: '江苏如东海上风电配套储能示范站',
    deviceType: '1# 直流高压汇流接触器与继电器',
    currentHealthScore: 84.0,
    predictedRulMonths: 22.0,
    optimalSwapDate: '2027-10-15',
    earlyWarningDays: 210,
    preventiveLossSavingYuan: 260000,
    recommendedAction: '触头灭弧栅耐受寿命消耗 68%，建议纳入秋季检修免拆换新计划',
    cellDegradationRateAnnual: 1.75
  }
];

// 4. 损失诊断与技改评估
export const INITIAL_LOSS_RETROFIT_OPPS: LossRetrofitOpportunity[] = [
  {
    id: 'loss-01',
    siteName: '深圳光明储能电站二期-04号站',
    lossType: 'BUSBAR_THERMAL',
    lossTypeLabel: '直流母排与线缆阻抗发热损耗',
    currentAnnualLossMwh: 36.8,
    lossCostYuanPerYear: 276000,
    retrofitScheme: '主正极铜排加装双面夹紧导电板，电缆端子涂覆纳米防氧化阻抗膏',
    retrofitInvestmentYuan: 180000,
    paybackYears: 0.65,
    fiveYearNetBenefitYuan: 1200000,
    roiPct: 42.5
  },
  {
    id: 'loss-02',
    siteName: '河西风光基地集中式储能1号站',
    lossType: 'PUMP_COOLING',
    lossTypeLabel: '液冷温控循环机组效率偏低',
    currentAnnualLossMwh: 58.4,
    lossCostYuanPerYear: 385000,
    retrofitScheme: '增设压差旁通变频水泵，优化末端分流平衡阀开度，降低沿程水阻 35%',
    retrofitInvestmentYuan: 320000,
    paybackYears: 0.83,
    fiveYearNetBenefitYuan: 1605000,
    roiPct: 38.6
  },
  {
    id: 'loss-03',
    siteName: '中宁电网侧独立储能电站',
    lossType: 'LOW_LOAD_EFF',
    lossTypeLabel: '低负荷率 (<0.2C) 运行变流损耗',
    currentAnnualLossMwh: 72.0,
    lossCostYuanPerYear: 468000,
    retrofitScheme: '在 EMS 站控层加载动态休眠算法，多机并联时切除轻载冗余 PCS',
    retrofitInvestmentYuan: 120000,
    paybackYears: 0.26,
    fiveYearNetBenefitYuan: 2220000,
    roiPct: 78.0
  },
  {
    id: 'loss-04',
    siteName: '苏州工业园区综合能源储能站',
    lossType: 'PACK_MISMATCH',
    lossTypeLabel: '模组木桶短板提前截断充放损失',
    currentAnnualLossMwh: 32.4,
    lossCostYuanPerYear: 243000,
    retrofitScheme: '部署站端双向主动均衡仪 (5A)，在谷充末期对短板模组快速补电',
    retrofitInvestmentYuan: 150000,
    paybackYears: 0.62,
    fiveYearNetBenefitYuan: 1065000,
    roiPct: 45.2
  }
];

// 5. 资产尽调评级与估值
export const INITIAL_ASSET_VALUATION_OPPS: AssetValuationOpportunity[] = [
  {
    siteId: 'site-002',
    siteName: '苏州工业园区综合能源储能站',
    rating: 'AAA',
    ratingLabel: 'AAA 标杆投资级 (极低违约风险)',
    capacityMw: 20.0,
    valuationMlnYuan: 46.8,
    irrPct: 8.85,
    remainingLifeYears: 8.2,
    dueDiligenceSummary: '电芯一致性极佳，历史 RTE 88.1% 优于保证线，具备长期稳定工商业峰谷套利充放电现金流',
    transactionAdvice: '建议作为核心底仓资产优先打包注入产业基金或公募 REITs 扩募标的'
  },
  {
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    rating: 'AA',
    ratingLabel: 'AA 良好投资级 (关注局部短板)',
    capacityMw: 10.0,
    valuationMlnYuan: 21.5,
    irrPct: 7.92,
    remainingLifeYears: 7.8,
    dueDiligenceSummary: '整体运维记录详实，需在并购估值对价中预扣 180 万元用于 3# 簇老旧模组置换备用金',
    transactionAdvice: '可按照估值 2,150 万元完成控股权收购，签署技术改造对赌回购条款'
  },
  {
    siteId: 'site-003',
    siteName: '河西风光基地集中式储能1号站',
    rating: 'A',
    ratingLabel: 'A 级 (需技改提升)',
    capacityMw: 50.0,
    valuationMlnYuan: 98.6,
    irrPct: 6.84,
    remainingLifeYears: 6.5,
    dueDiligenceSummary: '大倍率调频工况应力偏大，需注入电网辅助服务算法优化，提升现货市场收益率',
    transactionAdvice: '建议与电网签订长期容量租赁协议，平抑电力现货价格波动风险'
  }
];

// 6. 功率预测与绿证碳资产
export const INITIAL_CARBON_GREEN_CERT_OPPS: CarbonGreenCertOpportunity[] = [
  {
    siteId: 'site-006',
    siteName: '中宁电网侧独立储能电站',
    annualGreenPowerMwh: 48000,
    potentialGecCount: 48000,
    gecRevenueYuan: 1440000, // 30元/张
    ccerEmissionReductionTons: 28400,
    ccerRevenueYuan: 1988000, // 70元/吨
    forecastAccuracyPct: 94.6,
    imbalancePenaltySavingYuan: 380000
  },
  {
    siteId: 'site-003',
    siteName: '河西风光基地集中式储能1号站',
    annualGreenPowerMwh: 92000,
    potentialGecCount: 92000,
    gecRevenueYuan: 2760000,
    ccerEmissionReductionTons: 54600,
    ccerRevenueYuan: 3822000,
    forecastAccuracyPct: 93.8,
    imbalancePenaltySavingYuan: 640000
  },
  {
    siteId: 'site-005',
    siteName: '江苏如东海上风电配套储能示范站',
    annualGreenPowerMwh: 36000,
    potentialGecCount: 36000,
    gecRevenueYuan: 1080000,
    ccerEmissionReductionTons: 21300,
    ccerRevenueYuan: 1491000,
    forecastAccuracyPct: 95.2,
    imbalancePenaltySavingYuan: 290000
  }
];

// 7. 安全合规与零碳认证
export const INITIAL_SAFETY_COMPLIANCE_OPPS: SafetyComplianceOpportunity[] = [
  {
    siteId: 'site-004',
    siteName: '深圳前海金融中心用户侧储能站',
    standardName: 'GB 51048-2014 & NFPA 855 电化学储能防火安全',
    complianceScore: 92.5,
    gapItemCount: 2,
    zeroCarbonReadiness: 'READY',
    insurancePremiumSavingPct: 18.0,
    suggestedRemediation: '已通过国家应急管理部现场抽验，防爆抗爆门封条补充打胶即可通过复审'
  },
  {
    siteId: 'site-002',
    siteName: '苏州工业园区综合能源储能站',
    standardName: 'ISO 14064 组织温室气体盘查与零碳工厂认证',
    complianceScore: 96.0,
    gapItemCount: 1,
    zeroCarbonReadiness: 'READY',
    insurancePremiumSavingPct: 22.0,
    suggestedRemediation: '全生命周期碳足迹核算报告已备齐，建议直接申报国家级绿色微电网示范项目'
  },
  {
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    standardName: 'DL/T 2528 储能电站检修试验规程',
    complianceScore: 84.5,
    gapItemCount: 4,
    zeroCarbonReadiness: 'MINOR_GAP',
    insurancePremiumSavingPct: 12.0,
    suggestedRemediation: '完善电芯温控管路耐压绝缘试验报告，建议在下季度完成复测闭环'
  }
];

// 8. 行业数据API与指数产品
export const INITIAL_DATA_API_PRODUCTS: DataApiProduct[] = [
  {
    id: 'api-01',
    apiName: '全网储能电站电池衰减退化指数 API (ESS-EHI)',
    apiEndpoint: 'https://api.energystorage.com/v1/indices/battery-health',
    category: '行业宏观指数',
    subscribersCount: 28,
    callVolumeMonthly: 420000,
    pricing: '¥ 120,000 / 年 (企业授权版)',
    annualRevenueYuan: 3360000,
    status: 'ACTIVE'
  },
  {
    id: 'api-02',
    apiName: '跨区域储能系统 RTE 能效基准与损耗剖析 API',
    apiEndpoint: 'https://api.energystorage.com/v1/benchmark/rte-loss',
    category: '技术对标指数',
    subscribersCount: 19,
    callVolumeMonthly: 280000,
    pricing: '¥ 80,000 / 年',
    annualRevenueYuan: 1520000,
    status: 'ACTIVE'
  },
  {
    id: 'api-03',
    apiName: '储能电站全生命周期资产 DCF 估值引擎 API',
    apiEndpoint: 'https://api.energystorage.com/v1/valuation/dcf-pricing',
    category: '金融与投资分析',
    subscribersCount: 14,
    callVolumeMonthly: 96000,
    pricing: '¥ 150,000 / 年',
    annualRevenueYuan: 2100000,
    status: 'BETA'
  }
];

// 9. 挖掘规则运营管理
export const INITIAL_MINING_RULES: MiningRuleItem[] = [
  {
    id: 'rule-01',
    ruleCode: 'RULE-HEALTH-SWAP',
    ruleName: '电芯/模组短板 SOH 跌破阈值置换商机规则',
    category: 'EQUIPMENT_HEALTH_RUL',
    categoryLabel: '设备健康与寿命预测',
    triggerCondition: '任意储能簇实测 SOH < 89.0% 且全生命周期超过 1000 FEC',
    thresholdValue: 'SOH < 89.0%',
    debounceCooldownDays: 30,
    estimatedAnnualLeads: 24,
    conversionRateHistorical: 68.5,
    isEnabled: true,
    priority: 'P1'
  },
  {
    id: 'rule-02',
    ruleCode: 'RULE-THERMAL-RETROFIT',
    ruleName: '电芯温差持续超标水力管阻技改规则',
    category: 'LOSS_RETROFIT',
    categoryLabel: '损失诊断与技改评估',
    triggerCondition: '电芯最大温差 ΔT > 4.5℃ 持续累计超过 48 小时',
    thresholdValue: 'ΔT > 4.5℃',
    debounceCooldownDays: 14,
    estimatedAnnualLeads: 18,
    conversionRateHistorical: 72.0,
    isEnabled: true,
    priority: 'P1'
  },
  {
    id: 'rule-03',
    ruleCode: 'RULE-LINE-LOSS-CABLE',
    ruleName: '直流配电盒与端子接触电阻异常线损改造规则',
    category: 'COMMERCIAL_LEAD',
    categoryLabel: '核心商机线索生成',
    triggerCondition: '关口实测综合线损率 > 1.40% 且端子温升 > 12.0℃',
    thresholdValue: '线损 > 1.40%',
    debounceCooldownDays: 21,
    estimatedAnnualLeads: 12,
    conversionRateHistorical: 64.0,
    isEnabled: true,
    priority: 'P2'
  },
  {
    id: 'rule-04',
    ruleCode: 'RULE-CARBON-GEC-MINT',
    ruleName: '绿色电力绿证核发与 CCER 碳配额开发规则',
    category: 'CARBON_GREEN_CERT',
    categoryLabel: '功率预测与绿证碳资产',
    triggerCondition: '单月放电吞吐量超过 2000 MWh 且具备电网双向计量绿电存证',
    thresholdValue: '放电 > 2000 MWh/月',
    debounceCooldownDays: 60,
    estimatedAnnualLeads: 36,
    conversionRateHistorical: 82.0,
    isEnabled: true,
    priority: 'P2'
  },
  {
    id: 'rule-05',
    ruleCode: 'RULE-ASSET-DUE-DILIGENCE',
    ruleName: '商业运营满2周年电站并购尽调与估值触发规则',
    category: 'ASSET_VALUATION',
    categoryLabel: '资产尽调评级与交易估值',
    triggerCondition: '商业投运年限 COD >= 2.0 年且加权健康得分 > 85.0',
    thresholdValue: '投运 >= 2.0年',
    debounceCooldownDays: 90,
    estimatedAnnualLeads: 15,
    conversionRateHistorical: 55.0,
    isEnabled: true,
    priority: 'P3'
  }
];

// 10. 效果闭环回填
export const INITIAL_CLOSED_LOOP_RECORDS: ClosedLoopEffectRecord[] = [
  {
    id: 'loop-01',
    leadNo: 'OPP-2026-0835',
    siteName: '苏州工业园区综合能源储能站',
    serviceItem: '华东区储能集群年度集中预防性维保与备件寄售',
    predictedBenefit: '降低 MTTR 至 3.2h，节约电网考核 60 万元',
    actualBenefit: '实测 MTTR 降至 2.8h，当季考核实现零罚款，增量套利电量 124 MWh',
    variancePct: 18.5,
    modelFeedbackAccuracy: 94.2,
    backfilledAt: '2026-08-22',
    evaluator: '赵峰 (运营总监)'
  },
  {
    id: 'loop-02',
    leadNo: 'OPP-2026-0818',
    siteName: '深圳前海金融中心用户侧储能站',
    serviceItem: '地下密闭空间储能消防与全工况防爆认证辅导',
    predictedBenefit: '保费折扣 18%，获评零碳园区示范补贴',
    actualBenefit: '中国太保核发 19.5% 优质保费折扣 (节约 11.2 万元)，顺利通过安监复核',
    variancePct: 8.3,
    modelFeedbackAccuracy: 97.0,
    backfilledAt: '2026-08-18',
    evaluator: '黄华 (认证架构师)'
  },
  {
    id: 'loop-03',
    leadNo: 'OPP-2026-0801',
    siteName: '广州南沙自贸区微网储能站',
    serviceItem: '需量控制削峰填谷算法与工商业峰谷套利协同',
    predictedBenefit: '年节约基本电费 52 万元，投资回收期 8 个月',
    actualBenefit: '7月份单一自然月电费降低 4.8 万元，年化收益超出预期 9.6%',
    variancePct: 9.6,
    modelFeedbackAccuracy: 95.8,
    backfilledAt: '2026-07-28',
    evaluator: '张伟 (大客户总监)'
  }
];

// 11. 运营预警与告警
export const INITIAL_OPPORTUNITY_WARNINGS: OpportunityWarningAlert[] = [
  {
    id: 'warn-01',
    level: 'CRITICAL',
    title: '深圳光明储能电站 3# 簇置换商机谈判停滞超标预警',
    relatedLeadNo: 'OPP-2026-0842',
    siteName: '深圳光明储能电站二期-04号站',
    alertReason: '在【商务谈判竞价】阶段已停留超过 18 天，距迎峰度夏保供窗口期不足 20 天，存在流失风险',
    triggerTime: '2026-08-26 09:00',
    slaRemainingHours: 48,
    handlingAdvice: '立即由大区总经理安排带队拜访南网客户分管领导，出具免费赠送首年巡检优惠函'
  },
  {
    id: 'warn-02',
    level: 'WARNING',
    title: '如东海上风电储能 35kV 端子发热改造方案客户审批迟延',
    relatedLeadNo: 'OPP-2026-0831',
    siteName: '江苏如东海上风电配套储能示范站',
    alertReason: '三峡供应链招采平台审批流未在预计 7 个工作日内回传结果，需现场配合出具红外测温报告',
    triggerTime: '2026-08-25 15:30',
    slaRemainingHours: 72,
    handlingAdvice: '协调驻点运维组向三峡电站运维长提交两票三制现场隐患工单，加速技改立项'
  },
  {
    id: 'warn-03',
    level: 'INFO',
    title: '河北张北储能电站 低温析锂抑制商机线索自动生成待确认',
    relatedLeadNo: 'OPP-2026-0805',
    siteName: '张家口风电配套张北储能电站',
    alertReason: '系统根据历史低温充放日志自动挖掘产生高价值技改线索，待商务负责人认领',
    triggerTime: '2026-08-25 11:20',
    slaRemainingHours: 96,
    handlingAdvice: '由华北区商务经理周亮完成第一轮技术可行性研判并在 CRM 中确认分配'
  }
];
