// 能源领域辅助销售产品 · 机会点发现与价值量化引擎
// PRD-ENGY-2026-001 V1.0 真实仿真业务数据
// 覆盖：光伏 (PV) · 储能 (Storage) · 数据中心能源 (DC)

import {
  OpportunityCard,
  OpportunityEngineSummary,
  PvDiagnosticItem,
  PvWarrantyClaimItem,
  StorageRetrofitScanItem,
  StorageCalculatorParams,
  StorageCalculatorResult,
  DataCenterPueItem,
  TenderRadarNotice,
  PolicyAlertItem,
  TargetAccountItem,
  CarbonAssetMetric,
  BehaviorTrackEvent,
  ClientIntentProfile,
  ChampionOnepagerData
} from '../types/opportunityMining';

// 1. 北极星指标与大盘概览
export const INITIAL_ENGINE_SUMMARY: OpportunityEngineSummary = {
  northStarMonthlyCardsCount: 38, // 北极星指标：当月有效商机卡片生成数
  northStarMonthlyCardsGrowthPct: 26.7,
  totalAssetsCoveredMw: 3480, // 纳管资产总规模 (MW/机柜折算)
  totalPipelineValueYuan: 94600000, // 挖掘商机潜在年化增收/节约总额 9460 万元
  activeFollowingCardsCount: 22, // 销售正在推进跟进的卡片数
  wonDealsValueYuan: 41800000, // 已立项落地合同金额
  overallConversionRatePct: 34.2, // 商机卡片到立项转化率 %
  avgIrrPct: 11.8, // 测算平均 IRR %
  avgPaybackYears: 4.6 // 平均回收期 年
};

// 2. 核心交付物：商机卡片列表 (覆盖 3 大领域，4 类触发器，真实参数)
export const INITIAL_OPPORTUNITY_CARDS: OpportunityCard[] = [
  {
    cardId: 'CARD-2026-0842',
    title: '华东盐城 100MW 集中光伏电站 20MW/40MWh 储能加装与弃电消纳商机',
    domain: 'storage',
    targetObject: '国家能源集团华东分公司 · 盐城大丰100MW光伏电站',
    region: '江苏省 · 盐城',
    capacityScale: '100 MW 光伏 / 拟配 20MW/40MWh 储能',
    triggerType: 'policy_price',
    triggerReason: '江苏省发改委最新发文峰谷电价差扩大至 0.87 元/kWh，且电站近 6 个月平均弃光率上升至 6.4%，触发全投资 IRR 12.4% 加装储能最优寻优阈值。',
    valueMetrics: {
      irr: 12.4,
      paybackYears: 4.2,
      annualRevenueOrSavingYuan: 8600000,
      investmentYuan: 28000000,
      curtailmentSavedMwh: 12400,
      co2ReductionTons: 9850
    },
    intentScore: 92,
    icpScore: 94,
    behaviorScore: 89,
    suggestedAction: '建议重点拜访计划发展部王总，携带《加装储能立项一页纸》，主打峰谷套利+容量租赁双轮驱动模型。',
    status: 'following',
    owner: '张伟 (大客户总监)',
    createdAt: '2026-08-18 10:15',
    updatedAt: '2026-08-25 14:30',
    dataSource: '电站SCADA历史出力 + 江苏省发改委2026年第14号电价文件',
    hasDiagnosticReport: true,
    hasOnepager: true,
    crmSynced: true,
    crmSyncTarget: 'Salesforce CRM'
  },
  {
    cardId: 'CARD-2026-0839',
    title: '粤港澳大湾区某超大型智算中心 (5000机柜) 间接蒸发冷与AI温控PUE技改',
    domain: 'dc',
    targetObject: '华南数据互联科技 · 广州南沙智算产业园数据中心',
    region: '广东省 · 广州',
    capacityScale: '5,000 机柜 (IT负荷 25 MW)',
    triggerType: 'diagnosis',
    triggerReason: '实测年均运行 PUE 达 1.48，超出广东省工信厅数据中心 1.25 准入红线；年超标浪费电量达 320 万度，多支出电费 256 万元，面临限期整改与阶梯加价。',
    valueMetrics: {
      irr: 18.6,
      paybackYears: 3.1,
      annualRevenueOrSavingYuan: 2560000,
      investmentYuan: 7200000,
      efficiencyGainPct: 15.5,
      co2ReductionTons: 2240
    },
    intentScore: 88,
    icpScore: 90,
    behaviorScore: 85,
    suggestedAction: '向数据中心机房技术总监推送《PUE政策合规与能耗优化诊断白皮书》，预约现场能效审计与节能效益分享商务谈判。',
    status: 'following',
    owner: '李志国 (华南销售总监)',
    createdAt: '2026-08-19 14:20',
    updatedAt: '2026-08-26 09:10',
    dataSource: '动力环境监控系统实测数据 + 粤工信节能字[2026]8号文',
    hasDiagnosticReport: true,
    hasOnepager: true,
    crmSynced: true,
    crmSyncTarget: '纷享销客'
  },
  {
    cardId: 'CARD-2026-0835',
    title: '宁夏中卫 50MW 地面光伏电站 组件早期异常衰减与质保违约索赔协助',
    domain: 'pv',
    targetObject: '华能宁夏清洁能源分公司 · 中卫沙坡头50MW光伏电站',
    region: '宁夏回族自治区 · 中卫',
    capacityScale: '50 MWp (约 11.2 万片双面单晶组件)',
    triggerType: 'diagnosis',
    triggerReason: '第 4 运行年累计衰减实测值达到 8.2%，大幅超过质保合同约定上限 5.1% (超标 3.1%)，累计年发电量损失折合 184 万元，符合质保违约索赔赔偿条款。',
    valueMetrics: {
      irr: 24.5,
      paybackYears: 1.2,
      annualRevenueOrSavingYuan: 1840000,
      investmentYuan: 350000,
      curtailmentSavedMwh: 4600
    },
    intentScore: 95,
    icpScore: 92,
    behaviorScore: 98,
    suggestedAction: '向业主运检部提供自动生成的《第三方组件衰减实测证据链》，主推我方协助索赔及组件局部升级置换服务。',
    status: 'won',
    owner: '陈敏 (西北商务总监)',
    createdAt: '2026-08-10 09:30',
    updatedAt: '2026-08-22 16:40',
    dataSource: '无人机红外热斑巡检 + IV曲线拟合算法 + 采购质保合同文本',
    hasDiagnosticReport: true,
    hasOnepager: true,
    crmSynced: true,
    crmSyncTarget: 'Salesforce CRM'
  },
  {
    cardId: 'CARD-2026-0831',
    title: '三峡新能源张北风光基地 50MW/100MWh 储能系统标讯响应与联合竞标',
    domain: 'storage',
    targetObject: '中国三峡新能源集团河北分公司',
    region: '河北省 · 张家口',
    capacityScale: '50 MW / 100 MWh 集中共享储能',
    triggerType: 'tender',
    triggerReason: '河北省公共资源交易平台发布 EPC 招标公告，预算 1.15 亿元；业主与我方有两座在运电站数据对接，我方历史运维算法与安全指标高度匹配。',
    valueMetrics: {
      irr: 10.8,
      paybackYears: 5.4,
      annualRevenueOrSavingYuan: 14200000,
      investmentYuan: 105000000,
      co2ReductionTons: 16800
    },
    intentScore: 84,
    icpScore: 96,
    behaviorScore: 72,
    suggestedAction: '联合中能建华北院组成 EPC+运营联合体报名投标，调出张北基地历史气象模型及充放电高拟合预测曲线作为技术答辩亮点。',
    status: 'following',
    owner: '周亮 (北方区域总监)',
    createdAt: '2026-08-21 11:00',
    updatedAt: '2026-08-26 10:15',
    dataSource: '河北省公共资源交易中心电子招投标平台公告 (招标编号: CTG-HB-2026-091)',
    hasDiagnosticReport: false,
    hasOnepager: true,
    crmSynced: true,
    crmSyncTarget: '销售易'
  },
  {
    cardId: 'CARD-2026-0828',
    title: '浙江宁波某大型汽车零部件产业园 5MW 工商业光伏 PR 严重落后综合整改',
    domain: 'pv',
    targetObject: '宁波均胜汽车电子制造基地',
    region: '浙江省 · 宁波',
    capacityScale: '5.2 MWp 分布式屋顶光伏',
    triggerType: 'diagnosis',
    triggerReason: '电站实测 PR (系统能效比) 仅为 72.8%，较浙江屋顶同类项目均值 81.5% 落后 8.7%；诊断显示工业粉尘严重积聚且 3 台逆变器存在离散率超标 14%。',
    valueMetrics: {
      irr: 21.0,
      paybackYears: 2.1,
      annualRevenueOrSavingYuan: 760000,
      investmentYuan: 1450000,
      efficiencyGainPct: 8.7
    },
    intentScore: 79,
    icpScore: 82,
    behaviorScore: 76,
    suggestedAction: '提供智能清洗机器人+组串级MPPT逆变优化改造联合方案，按合同能源管理(EMC)节能分成模式推进。',
    status: 'pending',
    owner: '赵峰 (华东工业客户经理)',
    createdAt: '2026-08-24 15:45',
    updatedAt: '2026-08-25 18:00',
    dataSource: '工商业能管云平台实时遥测遥信数据',
    hasDiagnosticReport: true,
    hasOnepager: false,
    crmSynced: false
  },
  {
    cardId: 'CARD-2026-0822',
    title: '上海某跨国金融云华东数据中心 绿电交易与绿证(GEC)全生命周期碳资产',
    domain: 'dc',
    targetObject: '润泽科技集团 · 上海松江金融数据中心',
    region: '上海市 · 松江',
    capacityScale: '3,800 机柜',
    triggerType: 'behavior',
    triggerReason: '该数据中心能源采购主管在产品端连续 4 次使用碳收益计算器，并在昨日下载了《绿证交易与CCER碳抵消申报指引》，意向评分跃升至 91 分。',
    valueMetrics: {
      irr: 15.2,
      paybackYears: 2.8,
      annualRevenueOrSavingYuan: 1680000,
      investmentYuan: 800000,
      co2ReductionTons: 18600
    },
    intentScore: 91,
    icpScore: 88,
    behaviorScore: 95,
    suggestedAction: '客户正在编制 2027 年 ESG 减排白皮书，建议在 24 小时内由碳资产架构师带队上门沟通绿电直接交易+区块链绿证存证打包服务。',
    status: 'following',
    owner: '孙伟 (碳资产业务经理)',
    createdAt: '2026-08-23 09:00',
    updatedAt: '2026-08-26 11:20',
    dataSource: 'SaaS用户交互行为日志埋点 + 上海电力交易中心公开牌价',
    hasDiagnosticReport: false,
    hasOnepager: true,
    crmSynced: true,
    crmSyncTarget: 'Salesforce CRM'
  },
  {
    cardId: 'CARD-2026-0816',
    title: '青海海西 200MW 荒漠光伏电站 跟踪支架倾角失步导致出力损失技改',
    domain: 'pv',
    targetObject: '国投电力青海新能源 · 格尔木200MW光伏电站',
    region: '青海省 · 格尔木',
    capacityScale: '200 MWp',
    triggerType: 'diagnosis',
    triggerReason: '大风沙尘导致 38% 平单轴跟踪支架机械阻力过大产生回程失步，实测晴天出力曲线较理论凹陷 7.8%，折合年弃电损失 310 万元。',
    valueMetrics: {
      irr: 16.5,
      paybackYears: 3.5,
      annualRevenueOrSavingYuan: 3100000,
      investmentYuan: 9500000,
      curtailmentSavedMwh: 10500
    },
    intentScore: 68,
    icpScore: 85,
    behaviorScore: 52,
    suggestedAction: '出具支架电机力矩保护与 AI 智能寻日阴影规避软件升级方案，先选取 2 个方阵做试运行验证。',
    status: 'closed',
    closedReason: 'budget_insufficient',
    closedReasonNote: '业主下半年技改资金已被防洪工程挪用，延期至 2027 年一季度再行立项评估。',
    owner: '陈敏 (西北商务总监)',
    createdAt: '2026-07-28 14:00',
    updatedAt: '2026-08-20 17:30',
    dataSource: '支架控制器回传遥信 + SCADA组串功率对比',
    hasDiagnosticReport: true,
    hasOnepager: true,
    crmSynced: true,
    crmSyncTarget: '纷享销客'
  },
  {
    cardId: 'CARD-2026-0810',
    title: '苏州某大型半导体晶圆制造厂 10MW/20MWh 用户侧储能需量平抑与高品质供电',
    domain: 'storage',
    targetObject: '苏州工业园区某半导体芯片先进制造基地',
    region: '江苏省 · 苏州',
    capacityScale: '10 MW / 20 MWh 高安全半固态储能',
    triggerType: 'policy_price',
    triggerReason: '江苏省执行两部制电价夏冬尖峰加价新政，且客户存在毫秒级电压暂降晃电停线风险，配储综合削峰可降低基本电费及峰段电费达 540 万元/年。',
    valueMetrics: {
      irr: 14.8,
      paybackYears: 3.8,
      annualRevenueOrSavingYuan: 5400000,
      investmentYuan: 18500000,
      efficiencyGainPct: 18.2
    },
    intentScore: 86,
    icpScore: 95,
    behaviorScore: 78,
    suggestedAction: '针对半导体客户最在意的保电可靠性，协同施耐德/汇川联合提供毫秒级 STS 切换+储能峰谷套利整体解决方案。',
    status: 'following',
    owner: '张伟 (大客户总监)',
    createdAt: '2026-08-15 16:20',
    updatedAt: '2026-08-26 15:40',
    dataSource: '厂区进线负荷需量监测 + 2026年迎峰度夏尖峰电价通知',
    hasDiagnosticReport: true,
    hasOnepager: true,
    crmSynced: true,
    crmSyncTarget: 'Salesforce CRM'
  }
];

// 3. F1: 光伏健康诊断报告指标 (PR落后差距、损失折算、改造路径)
export const INITIAL_PV_DIAGNOSTICS: PvDiagnosticItem[] = [
  {
    id: 'pvd-01',
    stationName: '宁波均胜汽车电子 5.2MW 分布式光伏',
    ownerGroup: '均胜集团',
    installedCapacityMw: 5.2,
    actualPrPct: 72.8,
    benchmarkPrPct: 81.5,
    prGapPct: 8.7,
    annualGenerationLossMwh: 1240,
    annualRevenueLossYuan: 760000,
    primaryDefect: 'DUST_SOILING',
    defectLabel: '重度工业粉尘积聚及组串阴影遮挡',
    retrofitSolution: '加装全自动导轨式干洗机器人+喷淋自清洁涂层',
    estimatedRetrofitCostYuan: 1450000,
    retrofitIrrPct: 21.0,
    cardGenerated: true
  },
  {
    id: 'pvd-02',
    stationName: '格尔木 200MW 荒漠地面光伏电站',
    ownerGroup: '国投电力青海公司',
    installedCapacityMw: 200.0,
    actualPrPct: 76.5,
    benchmarkPrPct: 84.0,
    prGapPct: 7.5,
    annualGenerationLossMwh: 8600,
    annualRevenueLossYuan: 3100000,
    primaryDefect: 'TRACKER_FAULT',
    defectLabel: '平单轴机械传动失步与阴影避让算法失效',
    retrofitSolution: '替换大扭矩驱动齿轮箱+更新智能寻光逆跟踪算法',
    estimatedRetrofitCostYuan: 9500000,
    retrofitIrrPct: 16.5,
    cardGenerated: true
  },
  {
    id: 'pvd-03',
    stationName: '山东临沂 30MW 农光互补示范光伏电站',
    ownerGroup: '鲁能新能源集团',
    installedCapacityMw: 30.0,
    actualPrPct: 74.2,
    benchmarkPrPct: 82.0,
    prGapPct: 7.8,
    annualGenerationLossMwh: 2450,
    annualRevenueLossYuan: 980000,
    primaryDefect: 'INVERTER_DISPERSION',
    defectLabel: '逆变器 MPPT 离散度高，早期集中逆变失配',
    retrofitSolution: '实施组串化改造，将集中逆变升级为分布式多路 MPPT',
    estimatedRetrofitCostYuan: 3800000,
    retrofitIrrPct: 17.8,
    cardGenerated: false
  },
  {
    id: 'pvd-04',
    stationName: '河北张家口 80MW 山地风光互补光伏区',
    ownerGroup: '华电河北新能源',
    installedCapacityMw: 80.0,
    actualPrPct: 75.8,
    benchmarkPrPct: 83.5,
    prGapPct: 7.7,
    annualGenerationLossMwh: 4800,
    annualRevenueLossYuan: 1720000,
    primaryDefect: 'STRING_DISCONNECT',
    defectLabel: '汇流箱熔断器频繁烧毁导致断串率高达 4.6%',
    retrofitSolution: '更换智能自愈型固态断路器并重布低阻抗阻燃电缆',
    estimatedRetrofitCostYuan: 2200000,
    retrofitIrrPct: 24.2,
    cardGenerated: false
  }
];

// 4. F2: 组件衰减与质保索赔助手数据
export const INITIAL_PV_WARRANTY_CLAIMS: PvWarrantyClaimItem[] = [
  {
    id: 'pvw-01',
    stationName: '宁夏中卫沙坡头 50MW 光伏电站',
    moduleManufacturer: '某一线组件品牌 (2022批次 PERC 540W)',
    operatingYears: 4,
    contractMaxDegradationPct: 5.1,
    actualMeasuredDegradationPct: 8.2,
    excessDegradationPct: 3.1,
    totalModulesCount: 112000,
    claimAmountYuan: 1840000,
    claimStatus: 'SETTLED',
    evidenceBundleUrl: '/reports/claims/EVIDENCE_ZW_50MW_2026.pdf',
    legalClauseRef: '《组件供货技术协议》第 8.3 条：4年累计功率衰减保证不低于 94.9%'
  },
  {
    id: 'pvw-02',
    stationName: '陕西定边 100MW 沙漠集中光伏电站',
    moduleManufacturer: '某知名光伏制造企业 (2021批次 双面双玻)',
    operatingYears: 5,
    contractMaxDegradationPct: 5.8,
    actualMeasuredDegradationPct: 9.4,
    excessDegradationPct: 3.6,
    totalModulesCount: 220000,
    claimAmountYuan: 4200000,
    claimStatus: 'READY_TO_CLAIM',
    evidenceBundleUrl: '/reports/claims/EVIDENCE_DB_100MW_2026.pdf',
    legalClauseRef: '《采购合同》附录三性能保证：第5年线性衰减保证上限 94.2%'
  },
  {
    id: 'pvw-03',
    stationName: '内蒙古乌兰察布 60MW 荒漠电站',
    moduleManufacturer: '某老牌光伏厂 (2020批次 单晶组件)',
    operatingYears: 6,
    contractMaxDegradationPct: 6.5,
    actualMeasuredDegradationPct: 8.9,
    excessDegradationPct: 2.4,
    totalModulesCount: 145000,
    claimAmountYuan: 1950000,
    claimStatus: 'CLAIMING',
    evidenceBundleUrl: '/reports/claims/EVIDENCE_WLCB_60MW_2026.pdf',
    legalClauseRef: '《长期质量质保函》第二章第 2.1 款'
  }
];

// 5. F3: 加装储能机会扫描项 (按 IRR 寻优排行)
export const INITIAL_STORAGE_SCANS: StorageRetrofitScanItem[] = [
  {
    id: 'scan-01',
    stationName: '盐城大丰 100MW 光伏电站',
    type: 'PV_COLOCATED',
    pvCapacityMw: 100,
    annualCurtailmentRatePct: 6.4,
    recommendedStorageMw: 20,
    recommendedStorageMwh: 40,
    estimatedCapExYuan: 28000000,
    projectedIrrPct: 12.4,
    projectedPaybackYears: 4.2,
    annualGainYuan: 8600000,
    arbitrageRevenueYuan: 5400000,
    capacityLeasingRevenueYuan: 3200000,
    priorityRank: 1
  },
  {
    id: 'scan-02',
    stationName: '苏州工业园区半导体基地',
    type: 'C_AND_I_INDUSTRIAL',
    pvCapacityMw: 8,
    annualCurtailmentRatePct: 0.0,
    recommendedStorageMw: 10,
    recommendedStorageMwh: 20,
    estimatedCapExYuan: 18500000,
    projectedIrrPct: 14.8,
    projectedPaybackYears: 3.8,
    annualGainYuan: 5400000,
    arbitrageRevenueYuan: 4600000,
    capacityLeasingRevenueYuan: 800000,
    priorityRank: 2
  },
  {
    id: 'scan-03',
    stationName: '甘肃河西金塔 150MW 光伏基地',
    type: 'PV_COLOCATED',
    pvCapacityMw: 150,
    annualCurtailmentRatePct: 8.9,
    recommendedStorageMw: 30,
    recommendedStorageMwh: 60,
    estimatedCapExYuan: 41000000,
    projectedIrrPct: 11.2,
    projectedPaybackYears: 4.8,
    annualGainYuan: 11200000,
    arbitrageRevenueYuan: 6800000,
    capacityLeasingRevenueYuan: 4400000,
    priorityRank: 3
  },
  {
    id: 'scan-04',
    stationName: '广东东莞某大型精密五金制造园',
    type: 'C_AND_I_INDUSTRIAL',
    pvCapacityMw: 4.5,
    annualCurtailmentRatePct: 0.0,
    recommendedStorageMw: 4,
    recommendedStorageMwh: 8,
    estimatedCapExYuan: 7600000,
    projectedIrrPct: 13.9,
    projectedPaybackYears: 4.0,
    annualGainYuan: 2100000,
    arbitrageRevenueYuan: 1850000,
    capacityLeasingRevenueYuan: 250000,
    priorityRank: 4
  }
];

// 6. F4: 储能收益交互测算器计算逻辑 (输入参数 -> 实时输出结果与逐年现金流)
export const calculateStorageEconomics = (
  params: StorageCalculatorParams
): StorageCalculatorResult => {
  const {
    storagePowerMw,
    storageCapacityMwh,
    unitCostYuanPerWh,
    peakValleySpreadYuan,
    dailyCycles,
    annualOperatingDays,
    efficiencyPct,
    capacityRentalPriceYuanPerKwYear,
    ancillaryServiceGainYuan,
    discountRatePct,
    projectLifespanYears
  } = params;

  // 1. 初始资本支出 CapEx (元) = 容量 (MWh * 1e6 Wh) * 单价 (元/Wh)
  const totalCapExYuan = storageCapacityMwh * 1000000 * unitCostYuanPerWh;

  // 2. 年峰谷套利充放电量 (kWh) = 容量(kWh) * 循环次数 * 年运行天数 * 综合效率
  const annualDischargeKwh = storageCapacityMwh * 1000 * dailyCycles * annualOperatingDays * (efficiencyPct / 100);
  const annualArbitrageYuan = annualDischargeKwh * peakValleySpreadYuan;

  // 3. 年容量租赁收益 (元) = 功率 (kW) * 单价 (元/kW·年)
  const annualRentalYuan = storagePowerMw * 1000 * capacityRentalPriceYuanPerKwYear;

  // 4. 年综合总收益 = 套利 + 租赁 + 辅助服务
  const annualTotalRevenueYuan = annualArbitrageYuan + annualRentalYuan + ancillaryServiceGainYuan;

  // 5. 年运维 OpEx (约占 CapEx 的 1.6%)
  const annualOpexYuan = totalCapExYuan * 0.016;

  // 6. 年净现金流入 (简化不计所得税或折旧抵税的纯运营现金流)
  const annualNetProfitYuan = annualTotalRevenueYuan - annualOpexYuan;

  // 7. 静态投资回收期 (年)
  const paybackYears = annualNetProfitYuan > 0 ? Number((totalCapExYuan / annualNetProfitYuan).toFixed(1)) : 99.9;

  // 8. 内部收益率 IRR 近似迭代求解
  // NPV = -CapEx + sum(NetCash_t / (1+r)^t) = 0
  let low = -0.1;
  let high = 0.5;
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    let npv = -totalCapExYuan;
    for (let y = 1; y <= projectLifespanYears; y++) {
      // 假设电池容量逐年衰减 1.8%
      const degradationFactor = Math.pow(0.982, y - 1);
      const cash_y = (annualArbitrageYuan * degradationFactor) + annualRentalYuan + ancillaryServiceGainYuan - annualOpexYuan;
      npv += cash_y / Math.pow(1 + mid, y);
    }
    if (npv > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }
  const irrPct = Number((((low + high) / 2) * 100).toFixed(1));

  // 9. 10年逐年现金流表
  const tenYearCashFlow = [];
  let cumCash = -totalCapExYuan;
  for (let year = 1; year <= 10; year++) {
    const deg = Math.pow(0.982, year - 1);
    const rev = Math.round(annualArbitrageYuan * deg + annualRentalYuan + ancillaryServiceGainYuan);
    const opex = Math.round(annualOpexYuan);
    const net = rev - opex;
    cumCash += net;
    tenYearCashFlow.push({
      year,
      revenue: rev,
      opex,
      netCash: net,
      cumulativeCash: cumCash
    });
  }

  return {
    totalCapExYuan,
    annualArbitrageYuan: Math.round(annualArbitrageYuan),
    annualRentalYuan: Math.round(annualRentalYuan),
    annualTotalRevenueYuan: Math.round(annualTotalRevenueYuan),
    annualOpexYuan: Math.round(annualOpexYuan),
    annualNetProfitYuan: Math.round(annualNetProfitYuan),
    paybackYears,
    irrPct: isNaN(irrPct) ? 0 : irrPct,
    tenYearCashFlow
  };
};

// 7. F5: 数据中心 PUE 对标诊断与节能改造
export const INITIAL_DATA_CENTER_PUES: DataCenterPueItem[] = [
  {
    id: 'dcp-01',
    facilityName: '广州南沙智算中心机房 (5000机柜)',
    operator: '华南数据互联科技',
    cabinetCount: 5000,
    itLoadMw: 25.0,
    currentAnnualPue: 1.48,
    policyBenchmarkPue: 1.25,
    excessPueGap: 0.23,
    annualPowerConsumptionKwh: 324120000,
    wastedPowerKwh: 3200000,
    wastedElectricityBillYuan: 2560000,
    coolingRetrofitScheme: '间接蒸发冷水系统 + AI 精准群控调频',
    retrofitCostYuan: 7200000,
    retrofitIrrPct: 18.6,
    complianceRiskLevel: 'HIGH_PENALTY'
  },
  {
    id: 'dcp-02',
    facilityName: '深圳光明金融灾备中心机房 (2200机柜)',
    operator: '某头部股份制商业银行数据部',
    cabinetCount: 2200,
    itLoadMw: 11.0,
    currentAnnualPue: 1.39,
    policyBenchmarkPue: 1.25,
    excessPueGap: 0.14,
    annualPowerConsumptionKwh: 133880000,
    wastedPowerKwh: 1350000,
    wastedElectricityBillYuan: 1180000,
    coolingRetrofitScheme: '机柜冷通道密闭 + 氟泵自然冷却多联机改造',
    retrofitCostYuan: 3400000,
    retrofitIrrPct: 22.4,
    complianceRiskLevel: 'MEDIUM_WARNING'
  },
  {
    id: 'dcp-03',
    facilityName: '江苏苏州太湖超算节点 (3500机柜)',
    operator: '长三角算力网络有限公司',
    cabinetCount: 3500,
    itLoadMw: 17.5,
    currentAnnualPue: 1.32,
    policyBenchmarkPue: 1.30,
    excessPueGap: 0.02,
    annualPowerConsumptionKwh: 202356000,
    wastedPowerKwh: 310000,
    wastedElectricityBillYuan: 260000,
    coolingRetrofitScheme: '水冷冷水机组磁悬浮变频压缩机局部优化',
    retrofitCostYuan: 950000,
    retrofitIrrPct: 15.2,
    complianceRiskLevel: 'COMPLIANT'
  }
];

// 8. F7: 标讯雷达抓取条目
export const INITIAL_TENDER_NOTICES: TenderRadarNotice[] = [
  {
    id: 'tnd-01',
    tenderNo: 'CTG-HB-2026-091',
    title: '三峡新能源张北基地 50MW/100MWh 独立共享储能 EPC 总承包招标',
    domain: 'storage',
    purchaserName: '中国三峡新能源集团河北分公司',
    publishDate: '2026-08-20',
    closingDate: '2026-09-18',
    estimatedBudgetYuan: 115000000,
    region: '河北 · 张家口',
    matchScore: 94,
    keyRequirements: '要求投标方具备大型电网侧储能系统集成业绩，具备站端数字化监控与算法调优能力',
    tenderStatus: 'BIDDING',
    triggeredCardId: 'CARD-2026-0831'
  },
  {
    id: 'tnd-02',
    tenderNo: 'SPIC-JS-2026-042',
    title: '国家电投盐城沿海 200MW 渔光互补光伏电站运维与性能提升服务招标',
    domain: 'pv',
    purchaserName: '国家电力投资集团江苏电力',
    publishDate: '2026-08-16',
    closingDate: '2026-09-08',
    estimatedBudgetYuan: 8800000,
    region: '江苏 · 盐城',
    matchScore: 89,
    keyRequirements: '针对高盐雾、高湿度环境下组件脏污与支架腐蚀的专业治理方案',
    tenderStatus: 'BIDDING'
  },
  {
    id: 'tnd-03',
    tenderNo: 'GZ-IDC-2026-015',
    title: '广州南沙人工智能公共算力中心节能降碳与 PUE 达标技改公开比选',
    domain: 'dc',
    purchaserName: '广州南沙区科技创新局下属科创产业投资平台',
    publishDate: '2026-08-22',
    closingDate: '2026-09-12',
    estimatedBudgetYuan: 7500000,
    region: '广东 · 广州',
    matchScore: 92,
    keyRequirements: '需在 3 个月内将机房综合 PUE 从 1.45 降至 1.25 以下，提供节能量验证及质保担保',
    tenderStatus: 'UPCOMING',
    triggeredCardId: 'CARD-2026-0839'
  }
];

// 9. F8: 政策与分时电价变动事件
export const INITIAL_POLICY_ALERTS: PolicyAlertItem[] = [
  {
    id: 'pol-01',
    policyNo: '苏发改价格发〔2026〕14号',
    title: '江苏省发展和改革委员会关于进一步优化工商业分时电价机制的通知',
    issuingAuthority: '江苏省发改委',
    effectiveDate: '2026-09-01',
    category: 'PRICE_SPREAD',
    summary: '夏冬季 7-8 月、12-1 月尖峰电价在高峰电价基础上再上浮 20%，峰谷电价差扩大至 0.87 元/kWh，午间光伏大发时段设为平段或低谷段。',
    spreadChangeNote: '峰谷价差由 0.72 元扩大至 0.87 元/kWh (+20.8%)，储能套利 IRR 普遍上调 2.2%~3.5%',
    impactedStationsCount: 14,
    autoRecalculatedOpportunitiesCount: 6,
    isUrgent: true
  },
  {
    id: 'pol-02',
    policyNo: '粤工信节能字〔2026〕8号',
    title: '广东省工业和信息化厅关于印发广东省数据中心能效准入及节能改造实施细则的通知',
    issuingAuthority: '广东省工信厅',
    effectiveDate: '2026-07-01',
    category: 'PUE_REGULATION',
    summary: '全省既有大型及以上数据中心 PUE 须于 2026 年底前降至 1.30 以下，新建/扩建严格执行 1.25；对超标机房实施差别化超额累进加价电费。',
    spreadChangeNote: '超标 PUE 超过 0.1 者每度电加价 0.08 元，超标 0.2 者加价 0.15 元',
    impactedStationsCount: 8,
    autoRecalculatedOpportunitiesCount: 3,
    isUrgent: true
  },
  {
    id: 'pol-03',
    policyNo: '鲁能发新能〔2026〕23号',
    title: '山东省能源局关于鼓励集中式新能源电站市场化配置储能及参与辅助服务的指引',
    issuingAuthority: '山东省能源局',
    effectiveDate: '2026-08-01',
    category: 'STORAGE_SUBSIDY',
    summary: '支持新能源电站自主按 15%~25% 容量配储并参与现货调峰，对调频辅助服务响应里程补偿标准提高 15%。',
    spreadChangeNote: '辅助服务收益预计提升 18~25 万元/MW·年',
    impactedStationsCount: 22,
    autoRecalculatedOpportunitiesCount: 9,
    isUrgent: false
  }
];

// 10. F9: Target List 与 ICP 评分实体
export const INITIAL_TARGET_ACCOUNTS: TargetAccountItem[] = [
  {
    id: 'tgt-01',
    companyName: '国家能源集团华东电力分公司',
    domain: 'storage',
    industry: '央企五大发电集团',
    tierRank: 'S',
    totalIcpScore: 94,
    scoreBreakdown: {
      scaleScore: 29, // 满分 30
      priceSensitivityScore: 23, // 满分 25
      carbonTargetScore: 19, // 满分 20
      budgetDecisionScore: 23 // 满分 25
    },
    keyDecisionMaker: '王建平 (规划发展部主任兼副总工)',
    recommendVisitReason: '存量新能源配储考核压力大，手握 2.8 亿年度技改专项目标，且其盐城大丰电站正处于价差扩大测算窗口。',
    createdCardsCount: 3
  },
  {
    id: 'tgt-02',
    companyName: '华南数据互联科技有限公司',
    domain: 'dc',
    industry: '头部第三方 IDC 与算力基础设施',
    tierRank: 'S',
    totalIcpScore: 90,
    scoreBreakdown: {
      scaleScore: 27,
      priceSensitivityScore: 24,
      carbonTargetScore: 18,
      budgetDecisionScore: 21
    },
    keyDecisionMaker: '周崇德 (集团技术运维总监)',
    recommendVisitReason: '受广东省工信厅 PUE 1.25 红线督察，广州南沙机房若不整改将面临阶梯电费处罚，痛点迫切。',
    createdCardsCount: 2
  },
  {
    id: 'tgt-03',
    companyName: '宁波均胜电子股份有限公司',
    domain: 'pv',
    industry: '汽车零部件上市制造企业 (高耗能大工业客户)',
    tierRank: 'A',
    totalIcpScore: 82,
    scoreBreakdown: {
      scaleScore: 22,
      priceSensitivityScore: 23,
      carbonTargetScore: 17,
      budgetDecisionScore: 20
    },
    keyDecisionMaker: '刘刚 (动力总务部长)',
    recommendVisitReason: '工厂屋顶光伏 PR 长期偏低，管理层对电费降本极度敏感，接受合同能源管理分成模式。',
    createdCardsCount: 1
  },
  {
    id: 'tgt-04',
    companyName: '润泽科技集团上海运营中心',
    domain: 'dc',
    industry: '智算中心运营商',
    tierRank: 'A',
    totalIcpScore: 88,
    scoreBreakdown: {
      scaleScore: 26,
      priceSensitivityScore: 21,
      carbonTargetScore: 20,
      budgetDecisionScore: 21
    },
    keyDecisionMaker: '沈嘉豪 (碳中和办公室负责人)',
    recommendVisitReason: '正在申报零碳数据中心示范项目，需要批量采购绿电绿证抵消 Scope 2 碳排放。',
    createdCardsCount: 1
  }
];

// 11. F10: 碳与绿证计算
export const INITIAL_CARBON_ASSET_METRICS: CarbonAssetMetric[] = [
  {
    id: 'cbn-01',
    targetName: '华东盐城大丰 100MW 光伏电站',
    domain: 'storage',
    annualCleanEnergyMwh: 135000,
    gecPotentialCertificates: 135000,
    gecUnitPriceYuan: 28,
    annualGecRevenueYuan: 3780000,
    co2ReductionTons: 108000,
    ccerPotentialRevenueYuan: 5400000,
    esgRatingBoost: '提升企业 ESG 评级至 MSCI A 级'
  },
  {
    id: 'cbn-02',
    targetName: '广州南沙智算中心机房 (5000机柜)',
    domain: 'dc',
    annualCleanEnergyMwh: 48000,
    gecPotentialCertificates: 48000,
    gecUnitPriceYuan: 26,
    annualGecRevenueYuan: 1248000,
    co2ReductionTons: 38400,
    ccerPotentialRevenueYuan: 1920000,
    esgRatingBoost: '获批国家绿色数据中心示范'
  },
  {
    id: 'cbn-03',
    targetName: '宁夏中卫沙坡头 50MW 光伏电站',
    domain: 'pv',
    annualCleanEnergyMwh: 76000,
    gecPotentialCertificates: 76000,
    gecUnitPriceYuan: 22,
    annualGecRevenueYuan: 1672000,
    co2ReductionTons: 60800,
    ccerPotentialRevenueYuan: 3040000,
    esgRatingBoost: '纳入宁夏回族自治区绿电外送示范标杆'
  }
];

// 12. F11: 行为意向信号埋点事件流
export const INITIAL_BEHAVIOR_EVENTS: BehaviorTrackEvent[] = [
  {
    id: 'evt-01',
    timestamp: '2026-08-26 15:22:18',
    clientAccountId: 'acc-国能华东',
    clientOrgName: '国家能源集团华东分公司',
    userRole: '规划部项目主管',
    actionType: 'RETRY_CALCULATION',
    targetProject: '盐城大丰100MW光伏加装储能项目',
    durationSeconds: 380,
    weightPoint: 25,
    details: '连续调整峰谷价差参数（0.78 -> 0.87元）并对比 2h vs 4h 方案，重算 4 次，停留超 6 分钟。'
  },
  {
    id: 'evt-02',
    timestamp: '2026-08-26 14:05:42',
    clientAccountId: 'acc-润泽科技',
    clientOrgName: '润泽科技集团上海数据中心',
    userRole: '碳中和办公室主任',
    actionType: 'DOWNLOAD_ONEPAGER',
    targetProject: '松江金融数据中心绿证交易与碳抵消方案',
    durationSeconds: 120,
    weightPoint: 30,
    details: '一键导出了完整版《内线立项汇报一页纸 (PDF)》，触发意向分跃升报警。'
  },
  {
    id: 'evt-03',
    timestamp: '2026-08-26 11:30:10',
    clientAccountId: 'acc-华南数据',
    clientOrgName: '华南数据互联科技',
    userRole: '数据中心机电总监',
    actionType: 'VIEW_REPORT',
    targetProject: '广州南沙智算中心PUE能效审计报告',
    durationSeconds: 240,
    weightPoint: 15,
    details: '在线查阅《PUE诊断与年电费损失拆解》，在“制冷系统热工负荷”章节停留 180 秒。'
  },
  {
    id: 'evt-04',
    timestamp: '2026-08-25 17:40:00',
    clientAccountId: 'acc-国能华东',
    clientOrgName: '国家能源集团华东分公司',
    userRole: '规划发展部副主任',
    actionType: 'FORWARD_SHARED',
    targetProject: '盐城大丰加装储能商业测算',
    durationSeconds: 45,
    weightPoint: 35,
    details: '通过企业微信将测算结果小程序卡片转发至内部“华东新能源立项研讨”工作群。'
  }
];

// 13. F12: 客户行为意向评分画像
export const INITIAL_CLIENT_INTENT_PROFILES: ClientIntentProfile[] = [
  {
    clientOrgName: '国家能源集团华东分公司',
    contactPerson: '王建平 (主任)',
    domain: 'storage',
    activeScore: 92,
    scoreSurgeTrend: 'SURGING',
    lastActiveTime: '10 分钟前',
    recent7DaysEventsCount: 14,
    interestedSolutions: ['100MW光伏加装储能', '峰谷套利IRR测算', '容量租赁分成协议'],
    recommendedOutreachStrategy: '客户高层已将测算结果转发至内部立项研讨群，属于极度高意向！建议销售总监张伟在 2 小时内电话跟进，敲定线下闭门汇报。'
  },
  {
    clientOrgName: '润泽科技集团上海数据中心',
    contactPerson: '沈嘉豪 (主管)',
    domain: 'dc',
    activeScore: 91,
    scoreSurgeTrend: 'SURGING',
    lastActiveTime: '1 小时前',
    recent7DaysEventsCount: 9,
    interestedSolutions: ['绿电直接采购', '区块链绿证存证', 'ESG减排申报一页纸'],
    recommendedOutreachStrategy: '客户刚刚下载了一页纸立项材料，准备向集团汇报，建议提供可直接编辑的 PPT 汇报模板支持。'
  },
  {
    clientOrgName: '华南数据互联科技',
    contactPerson: '周崇德 (总监)',
    domain: 'dc',
    activeScore: 85,
    scoreSurgeTrend: 'STEADY',
    lastActiveTime: '4 小时前',
    recent7DaysEventsCount: 6,
    interestedSolutions: ['间接蒸发冷改造', 'PUE合规整改', '合同能源管理EMC'],
    recommendedOutreachStrategy: '持续关注 PUE 罚款细则，建议安排暖通与控制专家进行线上技术答疑。'
  }
];

// 14. F13: 内线弹药库（给领导看的一页纸汇报材料模板数据）
export const INITIAL_CHAMPION_ONEPAGERS: Record<string, ChampionOnepagerData> = {
  'CARD-2026-0842': {
    cardId: 'CARD-2026-0842',
    title: '关于盐城大丰 100MW 光伏电站加装 20MW/40MWh 储能项目的立项决策建议报告',
    stationName: '国家能源集团华东分公司 · 盐城大丰 100MW 光伏电站',
    clientOrgName: '国家能源集团华东分公司',
    domain: 'storage',
    decisionRole: '集团分管新能源副总经理 / 计划投资部主任',
    executiveSummary:
      '利用江苏省 2026 年最新峰谷价差扩大政策（0.87元/kWh）及近半年 6.4% 弃光现状，按 20% 容量（20MW/40MWh）配建高可靠储能。项目预计总投资 2,800 万元，年均增收 860 万元，全投资 IRR 达 12.4%，静态回收期 4.2 年，具备显著的经济效益与合规保供标杆意义。',
    currentPainData: {
      metric: '月度弃光率与消纳瓶颈',
      actualValue: '平均弃光 6.4%（年损失 12,400 MWh）',
      gapVsStandard: '地方电网考核消纳红线为弃电率 < 3.0%',
      annualFinancialLoss: '年弃光直接电费损失约 508 万元'
    },
    investmentAndReturn: {
      recommendedCapEx: '2,800 万元（系统造价约 0.70 元/Wh）',
      irrPct: '12.4%（全投资税后）',
      paybackYears: '4.2 年（静态回收期）',
      tenYearCumulativeNetCash: '5,820 万元（扣除10年全部运维与衰减折旧后净现金）'
    },
    implementationRoadmap: [
      {
        phase: '第一阶段：技术方案与立项审批',
        timeframe: '第 1~3 周',
        deliverable: '完成电网接入可行性研判，出具初设方案与内部投委会立项决议'
      },
      {
        phase: '第二阶段：采购与工程建设',
        timeframe: '第 4~12 周',
        deliverable: '完成电池舱/PCS成套采购、土建施工与站端 35kV 升压汇流并网'
      },
      {
        phase: '第三阶段：并网调试与算法投运',
        timeframe: '第 13~14 周',
        deliverable: '接入智慧 EMS 峰谷套利算法，首月即实现套利与容量租赁现金流'
      }
    ],
    riskMitigationAndSafety: [
      '安全保证：选用顶级高安全磷酸铁锂半固态电芯，配置舱级全氟己酮+细水雾双重消防与全生命周期云端热失控预警',
      '收益保底：与电网及工商业负荷签订长期容量租赁协议，锁定至少 35% 底线收益',
      '技术兜底：服务商承诺系统 10 年放电容量吞吐衰减不超过保证线，低于保证线由供应商全额补齐'
    ],
    faqForLeadership: [
      {
        question: '为什么现在是加装储能的最佳时点？',
        answer:
          '一是因为江苏省发改委 9 月起执行尖峰加价新政，峰谷价差扩大 20.8% 至 0.87 元；二是储能系统电芯与 EPC 造价已处于历史极具性价比区间（约0.70元/Wh），投资回收期从过去的 7 年大幅缩短至 4.2 年。'
      },
      {
        question: '对存量光伏电站发电和并网运行是否有负面干扰？',
        answer:
          '无负面影响。储能系统直接并入站内 35kV 母线，采用 AC 耦合独立集装箱化设计，施工周期仅需 60 天，期间无需光伏停机，并网后提升全站对电网的主动支撑与考核免罚能力。'
      }
    ]
  },
  'CARD-2026-0839': {
    cardId: 'CARD-2026-0839',
    title: '关于广州南沙智算中心 (5000机柜) 节能技改与 PUE 达标一页纸立项报告',
    stationName: '华南数据互联科技 · 广州南沙智算产业园数据中心',
    clientOrgName: '华南数据互联科技',
    domain: 'dc',
    decisionRole: '数据中心总裁 / 首席技术官 (CTO)',
    executiveSummary:
      '应对广东省数据中心 PUE 1.25 能效准入红线，通过在现有冷冻水系统基础上部署“间接蒸发冷自然冷却 + AI 动态精准控温”改造。总投资 720 万元，年节约电费 256 万元，3.1 年收回成本，年节电 320 万度，彻底化解阶梯电价惩罚与停机限电整改风险。',
    currentPainData: {
      metric: '机房综合运行 PUE',
      actualValue: '实测 1.48（超标 0.23）',
      gapVsStandard: '广东省工信厅红线准入要求 PUE ≤ 1.25',
      annualFinancialLoss: '年超额电费损失 256 万元，面临度电加价 0.15 元处罚'
    },
    investmentAndReturn: {
      recommendedCapEx: '720 万元（设备加装与群控软件）',
      irrPct: '18.6%',
      paybackYears: '3.1 年',
      tenYearCumulativeNetCash: '1,840 万元'
    },
    implementationRoadmap: [
      {
        phase: '第一阶段：能效诊断与系统仿真',
        timeframe: '第 1~2 周',
        deliverable: '完成机房热负荷 CFD 仿真模型与冷量平衡计算'
      },
      {
        phase: '第二阶段：不停机改造与模块加装',
        timeframe: '第 3~8 周',
        deliverable: '利用夜间低谷负荷时段分批改造，保障算力业务 7x24 不间断'
      },
      {
        phase: '第三阶段：第三方节能量认证',
        timeframe: '第 9~10 周',
        deliverable: '通过省工信厅能评委现场复核，摘除监管黄牌'
      }
    ],
    riskMitigationAndSafety: [
      '不间断运行保证：采用 N+2 冗余容错切换，改造全程不影响任何机架服务器业务供电',
      '节能对赌承诺：合同采用节能量保证条款，若改造后 PUE 达不到 1.25，不足部分由服务商赔付电费差价'
    ],
    faqForLeadership: [
      {
        question: '改造会不会引发算力服务器温升宕机？',
        answer:
          '不会。采用“分单元旁通隔离施工法”，逐列机房改造并预留双路备用应急移动冷源，实测机房冷通道温度波动始终控制在 ±0.5℃ 以内。'
      }
    ]
  }
};
