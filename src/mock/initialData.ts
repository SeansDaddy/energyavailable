import {
  Site,
  ImportBatch,
  AlertItem,
  WorkOrder,
  PcareImportRecord,
  Contract,
  ReportItem,
  UserProfile,
  ChatMessage
} from '../types';

export const CURRENT_USERS: UserProfile[] = [
  {
    id: 'u-1',
    name: '林可用 (Lin Admin)',
    role: 'admin',
    roleTitle: '全网可用度高级管理员',
    department: '技术运营部 / 可用度治理中心',
    domain: 'GLOBAL_NETWORK',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-2',
    name: '张维保 (Zhang Ops)',
    role: 'ops',
    roleTitle: '区域运维主管',
    department: '华东区运维支持中心',
    domain: 'REGION_EAST_CHINA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-3',
    name: '王合同 (Wang Sales)',
    role: 'sales',
    roleTitle: '大客户销售与履约总监',
    department: '大客户商业交付部',
    domain: 'KEY_ACCOUNTS',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'u-4',
    name: '赵决策 (Zhao VP)',
    role: 'management',
    roleTitle: '公司副总裁 / 能源数字化委员会',
    department: '总裁办 / 战略运营部',
    domain: 'EXECUTIVE_ALL',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  }
];

export const NETWORK_KPI = {
  totalSites: 38420,
  activeSites: 38112,
  monthlyAvailability: 99.42,
  targetSla: 99.20,
  slaBreachedCount: 142,
  predictedBreachCount: 56,
  dataStarvedCount: 78,
  activeAlertsCount: 28,
  monthlyAlarmsCount: 1845,
  workOrderCloseRate: 94.6,
  avgMttrHours: 2.4,
  monthlyImportBatches: 628,
};

// 12 Months Network Availability Trend
export const NETWORK_12_MONTHS_TREND = [
  { month: '2025-09', availability: 99.18, targetSla: 99.00, breachedSites: 185 },
  { month: '2025-10', availability: 99.25, targetSla: 99.00, breachedSites: 160 },
  { month: '2025-11', availability: 99.31, targetSla: 99.00, breachedSites: 148 },
  { month: '2025-12', availability: 99.12, targetSla: 99.00, breachedSites: 210 },
  { month: '2026-01', availability: 99.38, targetSla: 99.20, breachedSites: 155 },
  { month: '2026-02', availability: 99.45, targetSla: 99.20, breachedSites: 130 },
  { month: '2026-03', availability: 99.40, targetSla: 99.20, breachedSites: 142 },
  { month: '2026-04', availability: 99.48, targetSla: 99.20, breachedSites: 124 },
  { month: '2026-05', availability: 99.52, targetSla: 99.20, breachedSites: 110 },
  { month: '2026-06', availability: 99.39, targetSla: 99.20, breachedSites: 162 },
  { month: '2026-07', availability: 99.46, targetSla: 99.20, breachedSites: 138 },
  { month: '2026-08', availability: 99.42, targetSla: 99.20, breachedSites: 142 }
];

export const REGION_DISTRIBUTION = [
  { region: '华东区', siteCount: 13450, availability: 99.54, slaPassedRate: 98.8, breachedCount: 32 },
  { region: '华南区', siteCount: 10220, availability: 99.48, slaPassedRate: 98.4, breachedCount: 28 },
  { region: '华北区', siteCount: 7890, availability: 99.35, slaPassedRate: 97.6, breachedCount: 42 },
  { region: '西北区', siteCount: 4620, availability: 99.22, slaPassedRate: 96.8, breachedCount: 26 },
  { region: '西南区', siteCount: 2240, availability: 99.41, slaPassedRate: 97.9, breachedCount: 14 }
];

export const DIMENSION_TREE_DATA = [
  {
    id: 'region-east',
    name: '华东区 (13,450站)',
    children: [
      {
        id: 'rep-shanghai',
        name: '上海代表处',
        children: [
          { id: 'cust-sgcc-sh', name: '国家电网上海电力 (2,840站)' },
          { id: 'cust-baowu', name: '中国宝武钢铁集团 (920站)' },
          { id: 'cust-catl-sh', name: '宁德时代储能科技 (640站)' }
        ]
      },
      {
        id: 'rep-nanjing',
        name: '南京代表处',
        children: [
          { id: 'cust-js-power', name: '江苏省国信集团 (3,120站)' },
          { id: 'cust-huaneng-js', name: '华能江苏清洁能源 (2,450站)' }
        ]
      },
      {
        id: 'rep-hangzhou',
        name: '杭州代表处',
        children: [
          { id: 'cust-zj-energy', name: '浙江省能源集团 (3,480站)' }
        ]
      }
    ]
  },
  {
    id: 'region-south',
    name: '华南区 (10,220站)',
    children: [
      {
        id: 'rep-shenzhen',
        name: '深圳代表处',
        children: [
          { id: 'cust-csg-sz', name: '南方电网深圳供电局 (3,980站)' },
          { id: 'cust-byd-sz', name: '比亚迪储能事业部 (1,450站)' }
        ]
      },
      {
        id: 'rep-guangzhou',
        name: '广州代表处',
        children: [
          { id: 'cust-gd-energy', name: '广东粤电储能 (4,790站)' }
        ]
      }
    ]
  },
  {
    id: 'region-north',
    name: '华北区 (7,890站)',
    children: [
      {
        id: 'rep-beijing',
        name: '北京代表处',
        children: [
          { id: 'cust-spic-bj', name: '国家电投北京分公司 (4,210站)' }
        ]
      },
      {
        id: 'rep-shijiazhuang',
        name: '石家庄代表处',
        children: [
          { id: 'cust-hb-power', name: '河北建投能源 (3,680站)' }
        ]
      }
    ]
  },
  {
    id: 'region-northwest',
    name: '西北区 (4,620站)',
    children: [
      {
        id: 'rep-xian',
        name: '西安代表处',
        children: [
          { id: 'cust-sx-energy', name: '陕煤电力集团 (2,840站)' }
        ]
      },
      {
        id: 'rep-lanzhou',
        name: '兰州代表处',
        children: [
          { id: 'cust-three-gorges-nw', name: '三峡新能源西北分公司 (1,780站)' }
        ]
      }
    ]
  }
];

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-001',
    siteCode: 'SZ-ESS-0042',
    siteName: '深圳光明储能电站二期-04号站',
    region: '华南区',
    representativeOffice: '深圳代表处',
    customer: '南方电网深圳供电局',
    capacityMw: 10.0,
    coreDeviceCount: 8,
    redundancy: 'DUAL_HOT_BACKUP',
    redundancyNotes: '2026-06已改造为双机热备，双PCS变流器并联运行',
    slaThreshold: 99.50,
    currentAvailability: 98.62, // RED - Breached
    predictedAvailability: 98.54,
    predictedBreachProb: 98,
    statusLamp: 'red',
    dataCoverage: 99.1,
    lastImportTime: '2026-08-20 14:30',
    dataStarvedDays: 0,
    starveThresholdDays: 30,
    contractId: 'cnt-2025-081',
    contractNo: 'CSG-SZ-2025-SLA-081',
    owner: '张维保 (运维工程师)',
    domain: 'REGION_SOUTH_CHINA',
    reliabilityScore: {
      totalScore: 78.5,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: {
          name: '历史中断频率',
          score: 62.0,
          weight: 0.25,
          rawValue: '本月中断4次 (累计等效时长596分钟)',
          description: '过去30天等效PCS非计划停运次数与持续时间'
        },
        mttr: {
          name: '平均恢复时长 (MTTR)',
          score: 75.0,
          weight: 0.20,
          rawValue: '2.8 小时/次',
          description: '从故障发生到工单闭环（输出方案）的平均时间'
        },
        redundancy: {
          name: '组网冗余度',
          score: 95.0,
          weight: 0.20,
          rawValue: '双机热备 (Dual Hot-Backup)',
          description: '核心设备拓扑冗余能力评级'
        },
        alarmDensity: {
          name: '告警密度',
          score: 72.0,
          weight: 0.15,
          rawValue: '14条/周 (中等密度)',
          description: '单位时间内影响核心设备的告警发生频次'
        },
        dataCoverage: {
          name: '数据覆盖率',
          score: 99.1,
          weight: 0.20,
          rawValue: '99.1% (近30天日志连续完整)',
          description: '离线日志采集时间段覆盖有效率'
        }
      }
    },
    coreDevices: [
      {
        id: 'dev-101',
        deviceCode: 'PCS-INV-01A',
        deviceName: '1.25MW 储能变流器 A组 (主)',
        deviceType: 'PCS_INVERTER',
        model: 'EN-PCS-1250-PRO',
        status: 'NORMAL',
        isKeyDevice: true,
        installedDate: '2024-05-12',
        ratedPowerKw: 1250
      },
      {
        id: 'dev-102',
        deviceCode: 'PCS-INV-01B',
        deviceName: '1.25MW 储能变流器 B组 (备)',
        deviceType: 'PCS_INVERTER',
        model: 'EN-PCS-1250-PRO',
        status: 'WARNING',
        isKeyDevice: true,
        installedDate: '2024-05-12',
        ratedPowerKw: 1250
      },
      {
        id: 'dev-103',
        deviceCode: 'EMS-CTRL-01',
        deviceName: 'EMS 能量管理主控单元',
        deviceType: 'EMS_HOST',
        model: 'EN-EMS-5000',
        status: 'NORMAL',
        isKeyDevice: true,
        installedDate: '2024-05-10'
      },
      {
        id: 'dev-104',
        deviceCode: 'BMS-RACK-01',
        deviceName: '磷酸铁锂高压电池簇 01号',
        deviceType: 'BMS_CLUSTER',
        model: 'CATL-LFP-280Ah',
        status: 'NORMAL',
        isKeyDevice: true,
        installedDate: '2024-05-15'
      }
    ],
    mergedFaults: [
      {
        id: 'fault-001',
        faultCode: 'FLT-20260815-01',
        siteId: 'site-001',
        siteName: '深圳光明储能电站二期-04号站',
        title: 'PCS变流器IGBT驱动过温联锁停机（时间窗重叠归并）',
        startTime: '2026-08-15 09:12',
        endTime: '2026-08-15 15:48',
        durationMinutes: 396,
        equivalentInterruptionMinutes: 396,
        impactPercentage: 0.89,
        rootCause: '散热风道异物堵塞导致IGBT模块热敏探头触发极限保护，伴生BMS降额告警与工单派发',
        mergedEventsCount: 5,
        rawEvents: [
          {
            id: 'raw-1',
            type: 'alarm',
            timestamp: '2026-08-15 09:12:04',
            title: 'PCS_INV_01B IGBT桥臂热敏电阻超限(>85℃)告警',
            code: 'ALM-PCS-3042',
            durationMinutes: 396,
            equivalentInterruptionMinutes: 396,
            severity: 'CRITICAL',
            description: '变流器逆变模块硬件级停机信号上报'
          },
          {
            id: 'raw-2',
            type: 'workorder',
            timestamp: '2026-08-15 09:18:22',
            title: 'PCare工单创建: WO-20260815-9921 现场风道清理与驱动板检测',
            code: 'WO-20260815-9921',
            durationMinutes: 330,
            equivalentInterruptionMinutes: 0,
            severity: 'MAJOR',
            description: '指派现场工程师前往现场排查'
          },
          {
            id: 'raw-3',
            type: 'log',
            timestamp: '2026-08-15 10:05:00',
            title: '离线日志记录: PCS 停机状态字 BIT_12 置位 (IGBT Fault)',
            code: 'LOG-STATUS-01',
            durationMinutes: 343,
            equivalentInterruptionMinutes: 0,
            severity: 'CRITICAL',
            description: '日志解析服务提取非计划停机事件'
          },
          {
            id: 'raw-4',
            type: 'workorder',
            timestamp: '2026-08-15 14:48:10',
            title: 'PCare工单闭环: 输出解决方案(风道滤网更换+固件升级)',
            code: 'WO-20260815-9921-CLOSE',
            durationMinutes: 0,
            equivalentInterruptionMinutes: 0,
            severity: 'INFO',
            description: '符合R4闭环规则：到达"已输出解决方案、待执行"状态时刻'
          },
          {
            id: 'raw-5',
            type: 'alarm',
            timestamp: '2026-08-15 15:48:00',
            title: 'PCS_INV_01B 告警消除，重合闸自检通过',
            code: 'ALM-PCS-CLEAR',
            durationMinutes: 0,
            equivalentInterruptionMinutes: 0,
            severity: 'INFO',
            description: '恢复满额并网运行'
          }
        ]
      },
      {
        id: 'fault-002',
        faultCode: 'FLT-20260804-02',
        siteId: 'site-001',
        siteName: '深圳光明储能电站二期-04号站',
        title: 'BMS 主控通信总线瞬时丢包引发降额',
        startTime: '2026-08-04 14:20',
        endTime: '2026-08-04 17:40',
        durationMinutes: 200,
        equivalentInterruptionMinutes: 200,
        impactPercentage: 0.45,
        rootCause: 'CAN通信电磁干扰导致主从BMS心跳超时中断',
        mergedEventsCount: 3,
        rawEvents: [
          {
            id: 'raw-6',
            type: 'alarm',
            timestamp: '2026-08-04 14:20:00',
            title: 'BMS 主从通信中断告警',
            code: 'ALM-BMS-1102',
            durationMinutes: 200,
            equivalentInterruptionMinutes: 200,
            severity: 'MAJOR',
            description: 'CAN收发器校验失败'
          }
        ]
      }
    ],
    dailySnapshots: generateSnapshots(98.62, 99.50, [
      { dayOffset: 5, event: { id: 'e1', type: 'alarm_triggered', title: 'IGBT过温停运事件', time: '09:12' } },
      { dayOffset: 5, event: { id: 'e2', type: 'alert_triggered', title: '跌破SLA阈值预警(98.62% < 99.50%)', time: '12:00' } },
      { dayOffset: 16, event: { id: 'e3', type: 'workorder_resolved', title: 'PCare工单闭环(WO-9921)', time: '14:48' } },
      { dayOffset: 0, event: { id: 'e4', type: 'log_imported', title: '离线日志批次 BATCH-20260820-001 导入生效', time: '14:30' } }
    ])
  },
  {
    id: 'site-002',
    siteCode: 'SH-BW-0108',
    siteName: '上海宝武钢铁微电网储能示范站-01站',
    region: '华东区',
    representativeOffice: '上海代表处',
    customer: '中国宝武钢铁集团',
    capacityMw: 20.0,
    coreDeviceCount: 16,
    redundancy: 'RING_TOPOLOGY',
    redundancyNotes: '全站光纤环网冗余拓扑，支持单节点毫秒级自愈',
    slaThreshold: 99.80,
    currentAvailability: 99.89, // GREEN - Passed
    predictedAvailability: 99.91,
    predictedBreachProb: 2,
    statusLamp: 'green',
    dataCoverage: 100.0,
    lastImportTime: '2026-08-20 16:15',
    dataStarvedDays: 0,
    starveThresholdDays: 30,
    contractId: 'cnt-2025-012',
    contractNo: 'BW-SH-2025-SLA-012',
    owner: '陈工 (高级工程师)',
    domain: 'REGION_EAST_CHINA',
    reliabilityScore: {
      totalScore: 96.8,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: {
          name: '历史中断频率',
          score: 98.0,
          weight: 0.25,
          rawValue: '本月中断0次 (0分钟等效中断)',
          description: '过去30天无核心设备非计划停机'
        },
        mttr: {
          name: '平均恢复时长 (MTTR)',
          score: 95.0,
          weight: 0.20,
          rawValue: '0.8 小时 (极速闭环)',
          description: '快速响应机制与完备备件库'
        },
        redundancy: {
          name: '组网冗余度',
          score: 98.0,
          weight: 0.20,
          rawValue: '光纤环网冗余 (Ring Topology)',
          description: '最高等级工业环网冗余'
        },
        alarmDensity: {
          name: '告警密度',
          score: 94.0,
          weight: 0.15,
          rawValue: '2条/月 (极低密度)',
          description: '设备运行工况平稳'
        },
        dataCoverage: {
          name: '数据覆盖率',
          score: 100.0,
          weight: 0.20,
          rawValue: '100.0% (无任何数据丢失)',
          description: '每日定时无损采集'
        }
      }
    },
    coreDevices: [
      {
        id: 'dev-201',
        deviceCode: 'BW-PCS-2500-1',
        deviceName: '2.5MW 集中式储能变流器 #1',
        deviceType: 'PCS_INVERTER',
        model: 'EN-PCS-2500-ULTRA',
        status: 'NORMAL',
        isKeyDevice: true,
        installedDate: '2025-01-10',
        ratedPowerKw: 2500
      }
    ],
    mergedFaults: [],
    dailySnapshots: generateSnapshots(99.89, 99.80, [])
  },
  {
    id: 'site-003',
    siteCode: 'NW-XA-0019',
    siteName: '西安高新热电联产储能调峰站',
    region: '西北区',
    representativeOffice: '西安代表处',
    customer: '陕煤电力集团',
    capacityMw: 15.0,
    coreDeviceCount: 12,
    redundancy: 'N_PLUS_1',
    redundancyNotes: 'N+1 备用变流器模块架构',
    slaThreshold: 99.20,
    currentAvailability: 99.24, // YELLOW - Predicted Breach
    predictedAvailability: 99.11,
    predictedBreachProb: 84, // 84% 概率跌破
    statusLamp: 'yellow',
    dataCoverage: 96.5,
    lastImportTime: '2026-08-19 11:00',
    dataStarvedDays: 1,
    starveThresholdDays: 30,
    contractId: 'cnt-2025-095',
    contractNo: 'SM-NW-2025-SLA-095',
    owner: '李工 (运维工程师)',
    domain: 'REGION_NORTHWEST',
    reliabilityScore: {
      totalScore: 82.4,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: {
          name: '历史中断频率',
          score: 80.0,
          weight: 0.25,
          rawValue: '本月中断1次 (累计32分钟)',
          description: '轻微扰动已恢复'
        },
        mttr: {
          name: '平均恢复时长 (MTTR)',
          score: 82.0,
          weight: 0.20,
          rawValue: '2.1 小时',
          description: '常规工单响应节奏'
        },
        redundancy: {
          name: '组网冗余度',
          score: 85.0,
          weight: 0.20,
          rawValue: 'N+1 热备',
          description: '具备单机容错能力'
        },
        alarmDensity: {
          name: '告警密度',
          score: 74.0,
          weight: 0.15,
          rawValue: '28条/周 (近期呈上升趋势)',
          description: '近期逆变器电容寿命预警增多'
        },
        dataCoverage: {
          name: '数据覆盖率',
          score: 96.5,
          weight: 0.20,
          rawValue: '96.5%',
          description: '部分时段存在短时日志补采'
        }
      }
    },
    coreDevices: [],
    mergedFaults: [],
    dailySnapshots: generateSnapshots(99.24, 99.20, [
      { dayOffset: 1, event: { id: 'e-y1', type: 'alert_triggered', title: 'AI预测月末可用度将跌破SLA (99.11% < 99.20%, 概率84%)', time: '11:00' } }
    ])
  },
  {
    id: 'site-004',
    siteCode: 'HB-BJ-0077',
    siteName: '北京怀柔科学城智能微电网站-03站',
    region: '华北区',
    representativeOffice: '北京代表处',
    customer: '国家电投北京分公司',
    capacityMw: 8.0,
    coreDeviceCount: 6,
    redundancy: 'NONE',
    redundancyNotes: '单机无冗余，计划下季度升级',
    slaThreshold: 99.00,
    currentAvailability: 99.15, // GREY - Data Starved (>30 days)
    statusLamp: 'grey',
    dataCoverage: 62.0,
    lastImportTime: '2026-07-15 09:30',
    dataStarvedDays: 36, // > 30 days starved
    starveThresholdDays: 30,
    contractId: 'cnt-2025-044',
    contractNo: 'SPIC-BJ-2025-SLA-044',
    owner: '刘工 (现场技术员)',
    domain: 'REGION_NORTH_CHINA',
    reliabilityScore: {
      totalScore: 64.2,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: {
          name: '历史中断频率',
          score: 75.0,
          weight: 0.25,
          rawValue: '数据缺失，按历史均值估算',
          description: '缺少近期日志数据'
        },
        mttr: {
          name: '平均恢复时长 (MTTR)',
          score: 70.0,
          weight: 0.20,
          rawValue: '3.5 小时',
          description: '偏远站点响应较缓'
        },
        redundancy: {
          name: '组网冗余度',
          score: 50.0,
          weight: 0.20,
          rawValue: '单机无冗余 (None)',
          description: '无热备单点脆弱'
        },
        alarmDensity: {
          name: '告警密度',
          score: 60.0,
          weight: 0.15,
          rawValue: '未接收到最新告警',
          description: '数据断供中'
        },
        dataCoverage: {
          name: '数据覆盖率',
          score: 62.0,
          weight: 0.20,
          rawValue: '62.0% (超过36天未导入新日志)',
          description: '触发数据断供预警 (R5)'
        }
      }
    },
    coreDevices: [],
    mergedFaults: [],
    dailySnapshots: generateSnapshots(99.15, 99.00, [
      { dayOffset: 6, event: { id: 'e-g1', type: 'alert_triggered', title: '数据断供预警 (超过30天未收到新导入批次)', time: '00:00' } }
    ])
  },
  {
    id: 'site-005',
    siteCode: 'JS-NJ-0023',
    siteName: '南京江北储能电站01号变电侧站',
    region: '华东区',
    representativeOffice: '南京代表处',
    customer: '江苏省国信集团',
    capacityMw: 30.0,
    coreDeviceCount: 24,
    redundancy: 'MULTI_ACTIVE',
    redundancyNotes: '多活负荷分担拓扑',
    slaThreshold: 99.60,
    currentAvailability: 99.78,
    statusLamp: 'green',
    dataCoverage: 99.5,
    lastImportTime: '2026-08-20 15:40',
    dataStarvedDays: 0,
    starveThresholdDays: 30,
    contractId: 'cnt-2025-067',
    contractNo: 'JS-GX-2025-SLA-067',
    owner: '周工',
    domain: 'REGION_EAST_CHINA',
    reliabilityScore: {
      totalScore: 94.2,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: { name: '历史中断频率', score: 96, weight: 0.25, rawValue: '中断0次', description: '正常' },
        mttr: { name: '平均恢复时长', score: 92, weight: 0.20, rawValue: '1.2小时', description: '良好' },
        redundancy: { name: '组网冗余度', score: 96, weight: 0.20, rawValue: '多活负荷分担', description: '极高' },
        alarmDensity: { name: '告警密度', score: 90, weight: 0.15, rawValue: '5条/月', description: '正常' },
        dataCoverage: { name: '数据覆盖率', score: 99.5, weight: 0.20, rawValue: '99.5%', description: '完整' }
      }
    },
    coreDevices: [],
    mergedFaults: [],
    dailySnapshots: generateSnapshots(99.78, 99.60, [])
  },
  {
    id: 'site-006',
    siteCode: 'GD-GZ-0089',
    siteName: '广州南沙自贸区综合能源港储能站',
    region: '华南区',
    representativeOffice: '广州代表处',
    customer: '广东粤电储能',
    capacityMw: 12.0,
    coreDeviceCount: 10,
    redundancy: 'DUAL_HOT_BACKUP',
    redundancyNotes: '变流器双机热备',
    slaThreshold: 99.50,
    currentAvailability: 99.12, // RED - Breached
    statusLamp: 'red',
    dataCoverage: 98.2,
    lastImportTime: '2026-08-20 12:10',
    dataStarvedDays: 0,
    starveThresholdDays: 30,
    contractId: 'cnt-2025-072',
    contractNo: 'GD-YD-2025-SLA-072',
    owner: '黄工',
    domain: 'REGION_SOUTH_CHINA',
    reliabilityScore: {
      totalScore: 76.2,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: { name: '历史中断频率', score: 60, weight: 0.25, rawValue: '中断3次 (410分钟)', description: '偏高' },
        mttr: { name: '平均恢复时长', score: 72, weight: 0.20, rawValue: '3.1小时', description: '一般' },
        redundancy: { name: '组网冗余度', score: 90, weight: 0.20, rawValue: '双机热备', description: '高' },
        alarmDensity: { name: '告警密度', score: 70, weight: 0.15, rawValue: '18条/周', description: '较多' },
        dataCoverage: { name: '数据覆盖率', score: 98.2, weight: 0.20, rawValue: '98.2%', description: '正常' }
      }
    },
    coreDevices: [],
    mergedFaults: [],
    dailySnapshots: generateSnapshots(99.12, 99.50, [])
  },
  {
    id: 'site-007',
    siteCode: 'ZJ-HZ-0033',
    siteName: '杭州钱塘新区数据中心储能备电站',
    region: '华东区',
    representativeOffice: '杭州代表处',
    customer: '浙江省能源集团',
    capacityMw: 25.0,
    coreDeviceCount: 20,
    redundancy: 'DUAL_HOT_BACKUP',
    redundancyNotes: '金融级双路供电热备',
    slaThreshold: 99.90,
    currentAvailability: 99.84, // YELLOW - Predicted Breach
    predictedAvailability: 99.79,
    predictedBreachProb: 76,
    statusLamp: 'yellow',
    dataCoverage: 99.8,
    lastImportTime: '2026-08-20 10:15',
    dataStarvedDays: 0,
    starveThresholdDays: 30,
    contractId: 'cnt-2025-033',
    contractNo: 'ZJ-NY-2025-SLA-033',
    owner: '徐工',
    domain: 'REGION_EAST_CHINA',
    reliabilityScore: {
      totalScore: 89.0,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: { name: '历史中断频率', score: 85, weight: 0.25, rawValue: '中断1次 (18分钟)', description: '轻微' },
        mttr: { name: '平均恢复时长', score: 90, weight: 0.20, rawValue: '1.0小时', description: '良好' },
        redundancy: { name: '组网冗余度', score: 95, weight: 0.20, rawValue: '双机热备', description: '极高' },
        alarmDensity: { name: '告警密度', score: 86, weight: 0.15, rawValue: '6条/月', description: '良好' },
        dataCoverage: { name: '数据覆盖率', score: 99.8, weight: 0.20, rawValue: '99.8%', description: '完整' }
      }
    },
    coreDevices: [],
    mergedFaults: [],
    dailySnapshots: generateSnapshots(99.84, 99.90, [])
  },
  {
    id: 'site-008',
    siteCode: 'GS-LZ-0055',
    siteName: '兰州新区光伏配储能电站02站',
    region: '西北区',
    representativeOffice: '兰州代表处',
    customer: '三峡新能源西北分公司',
    capacityMw: 50.0,
    coreDeviceCount: 36,
    redundancy: 'N_PLUS_1',
    redundancyNotes: 'N+1 单元模块化设计',
    slaThreshold: 99.00,
    currentAvailability: 99.35,
    statusLamp: 'green',
    dataCoverage: 98.6,
    lastImportTime: '2026-08-20 09:00',
    dataStarvedDays: 0,
    starveThresholdDays: 30,
    contractId: 'cnt-2025-058',
    contractNo: 'CTG-NW-2025-SLA-058',
    owner: '马工',
    domain: 'REGION_NORTHWEST',
    reliabilityScore: {
      totalScore: 91.5,
      updatedAt: '2026-08-20 00:00',
      factors: {
        historyInterruptionFreq: { name: '历史中断频率', score: 92, weight: 0.25, rawValue: '中断0次', description: '稳定' },
        mttr: { name: '平均恢复时长', score: 88, weight: 0.20, rawValue: '1.5小时', description: '良好' },
        redundancy: { name: '组网冗余度', score: 88, weight: 0.20, rawValue: 'N+1热备', description: '良好' },
        alarmDensity: { name: '告警密度', score: 85, weight: 0.15, rawValue: '9条/月', description: '良好' },
        dataCoverage: { name: '数据覆盖率', score: 98.6, weight: 0.20, rawValue: '98.6%', description: '稳定' }
      }
    },
    coreDevices: [],
    mergedFaults: [],
    dailySnapshots: generateSnapshots(99.35, 99.00, [])
  }
];

function generateSnapshots(currentAvail: number, slaTarget: number, specialEvents: { dayOffset: number; event: any }[]) {
  const list = [];
  const daysInMonth = 20; // up to current day in August
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const dateStr = `2026-08-${dayStr}`;
    
    // Simulate daily availability variance around the current value
    const noise = ((i * 17) % 7 - 3) * 0.04;
    let val = Number((currentAvail + noise).toFixed(2));
    if (val > 100) val = 100;
    if (val < 97.0) val = 97.0;

    const matchedEvents = specialEvents
      .filter(se => se.dayOffset === (daysInMonth - i))
      .map(se => se.event);

    list.push({
      date: dateStr,
      siteId: 'site-mock',
      availability: val,
      slaThreshold: slaTarget,
      pcsInterruptionMins: val < slaTarget ? 120 : 0,
      plannedMaintenanceMins: i === 3 ? 60 : 0,
      events: matchedEvents
    });
  }
  return list;
}

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-001',
    type: 'sla_breached',
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    region: '华南区',
    representativeOffice: '深圳代表处',
    customer: '南方电网深圳供电局',
    slaThreshold: 99.50,
    currentValue: 98.62,
    triggerTime: '2026-08-15 12:00',
    status: 'active',
    relatedWorkOrderNo: 'WO-20260815-9921'
  },
  {
    id: 'alt-002',
    type: 'sla_breached',
    siteId: 'site-006',
    siteName: '广州南沙自贸区综合能源港储能站',
    region: '华南区',
    representativeOffice: '广州代表处',
    customer: '广东粤电储能',
    slaThreshold: 99.50,
    currentValue: 99.12,
    triggerTime: '2026-08-18 16:30',
    status: 'active',
    relatedWorkOrderNo: 'WO-20260818-7712'
  },
  {
    id: 'alt-003',
    type: 'predicted_breach',
    siteId: 'site-003',
    siteName: '西安高新热电联产储能调峰站',
    region: '西北区',
    representativeOffice: '西安代表处',
    customer: '陕煤电力集团',
    slaThreshold: 99.20,
    currentValue: 99.24,
    predictedValue: 99.11,
    breachProbability: 84,
    triggerTime: '2026-08-19 11:00',
    status: 'active'
  },
  {
    id: 'alt-004',
    type: 'predicted_breach',
    siteId: 'site-007',
    siteName: '杭州钱塘新区数据中心储能备电站',
    region: '华东区',
    representativeOffice: '杭州代表处',
    customer: '浙江省能源集团',
    slaThreshold: 99.90,
    currentValue: 99.84,
    predictedValue: 99.79,
    breachProbability: 76,
    triggerTime: '2026-08-20 08:30',
    status: 'active'
  },
  {
    id: 'alt-005',
    type: 'data_starved',
    siteId: 'site-004',
    siteName: '北京怀柔科学城智能微电网站-03站',
    region: '华北区',
    representativeOffice: '北京代表处',
    customer: '国家电投北京分公司',
    slaThreshold: 99.00,
    currentValue: 99.15,
    dataStarvedDays: 36,
    triggerTime: '2026-08-14 00:00',
    status: 'active'
  },
  {
    id: 'alt-006',
    type: 'sla_breached',
    siteId: 'site-008',
    siteName: '石家庄循环化工园区储能站',
    region: '华北区',
    representativeOffice: '石家庄代表处',
    customer: '河北建投能源',
    slaThreshold: 99.30,
    currentValue: 99.10,
    triggerTime: '2026-08-10 14:00',
    status: 'confirmed',
    handler: '林可用 (管理员)',
    handleTime: '2026-08-10 14:45',
    handleNote: '已与现场站长沟通，系上游电网线路例行检修，备件已到位。'
  }
];

export const INITIAL_BATCHES: ImportBatch[] = [
  {
    id: 'batch-001',
    batchNo: 'BATCH-20260820-001',
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    fileName: 'SZ_GM_ESS04_LOG_20260801_0820.zip',
    fileSize: '48.6 MB',
    importTime: '2026-08-20 14:30',
    periodStart: '2026-08-01 00:00',
    periodEnd: '2026-08-20 12:00',
    status: 'SUCCESS',
    operator: '张维保 (运维工程师)',
    equivalentInterruptionMinutes: 596,
    eventsCount: 142,
    isLatestWinning: true
  },
  {
    id: 'batch-002',
    batchNo: 'BATCH-20260810-089',
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    fileName: 'SZ_GM_ESS04_LOG_20260801_0810_OLD.zip',
    fileSize: '24.2 MB',
    importTime: '2026-08-10 18:00',
    periodStart: '2026-08-01 00:00',
    periodEnd: '2026-08-10 17:00',
    status: 'OVERRIDDEN',
    operator: '李工',
    equivalentInterruptionMinutes: 200,
    eventsCount: 56,
    isLatestWinning: false,
    replacedBatchNo: 'BATCH-20260820-001'
  },
  {
    id: 'batch-003',
    batchNo: 'BATCH-20260820-002',
    siteId: 'site-002',
    siteName: '上海宝武钢铁微电网储能示范站-01站',
    fileName: 'SH_BW_MICRO01_202608.zip',
    fileSize: '62.1 MB',
    importTime: '2026-08-20 16:15',
    periodStart: '2026-08-01 00:00',
    periodEnd: '2026-08-20 16:00',
    status: 'SUCCESS',
    operator: '陈工',
    equivalentInterruptionMinutes: 0,
    eventsCount: 18,
    isLatestWinning: true
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-001',
    orderNo: 'WO-20260815-9921',
    title: '深圳光明04站 PCS变流器过温联锁停运排查处理',
    siteId: 'site-001',
    siteName: '深圳光明储能电站二期-04号站',
    customer: '南方电网深圳供电局',
    contractNo: 'CSG-SZ-2025-SLA-081',
    status: 'SOLUTION_READY', // 闭环 (R4)
    priority: 'URGENT',
    faultCategory: '变流器电气与散热故障',
    createTime: '2026-08-15 09:18',
    solutionTime: '2026-08-15 14:48', // 闭环时刻 (R4)
    assignee: '张维保 (运维主管)',
    description: 'PCS变流器IGBT温度探头超标停机，需清理风道及更换驱动控制板',
    solutionSummary: '已清理异物阻塞风道，更换备用IGBT驱动保护卡，自检运行正常，待现场下周定检复核。',
    importBatchNo: 'PCare-Batch-20260816-01',
    importedAt: '2026-08-16 08:30:15',
    source: 'PCARE_IMPORT',
    rawPcareStatus: '已输出解决方案(方案确认中)'
  },
  {
    id: 'wo-002',
    orderNo: 'WO-20260818-7712',
    title: '广州南沙储能港 BMS通讯线束屏蔽层破损更换',
    siteId: 'site-006',
    siteName: '广州南沙自贸区综合能源港储能站',
    customer: '广东粤电储能',
    contractNo: 'GD-YD-2025-SLA-072',
    status: 'PROCESSING',
    priority: 'HIGH',
    faultCategory: '通信与采集链路故障',
    createTime: '2026-08-18 16:40',
    assignee: '黄工',
    description: 'BMS从控板CAN通讯间歇性闪断，导致系统降额运行',
    importBatchNo: 'PCare-Batch-20260819-01',
    importedAt: '2026-08-19 09:12:00',
    source: 'PCARE_IMPORT',
    rawPcareStatus: '工程师现场排查处理中'
  },
  {
    id: 'wo-003',
    orderNo: 'WO-20260804-5510',
    title: '西安高新调峰站 夏季空调节能参数调优',
    siteId: 'site-003',
    siteName: '西安高新热电联产储能调峰站',
    customer: '陕煤电力集团',
    contractNo: 'SM-NW-2025-SLA-095',
    status: 'CLOSED',
    priority: 'MEDIUM',
    faultCategory: '辅机与暖通定检',
    createTime: '2026-08-04 10:00',
    solutionTime: '2026-08-04 15:30',
    closeTime: '2026-08-05 09:00',
    assignee: '李工',
    description: '高温环境下集装箱空调制冷风量再分配',
    solutionSummary: '调整温控阈值与送风角度，集装箱内最高温差降至2.3℃以内。',
    importBatchNo: 'PCare-Batch-20260805-01',
    importedAt: '2026-08-05 10:00:22',
    source: 'PCARE_IMPORT',
    rawPcareStatus: '已完结归档'
  }
];

// PCare 离线报表导入历史记录
export const INITIAL_PCARE_IMPORT_HISTORY: PcareImportRecord[] = [
  {
    id: 'pcare-imp-001',
    batchNo: 'PCare-Batch-20260908-01',
    fileName: 'PCare_WorkOrders_Export_20260908.xlsx',
    fileSize: '1.42 MB',
    importTime: '2026-09-08 17:35:20',
    operator: '张维保 (运维主管)',
    totalParsedCount: 14,
    addedCount: 3,
    updatedCount: 11,
    solutionReadyCount: 9,
    status: 'SUCCESS',
    remarks: '9月第一周全网消缺工单增量导入，核算Rule R4方案就绪闭环'
  },
  {
    id: 'pcare-imp-002',
    batchNo: 'PCare-Batch-20260825-02',
    fileName: 'PCare_National_August_Summary.csv',
    fileSize: '890 KB',
    importTime: '2026-08-25 09:10:45',
    operator: '林可用 (全网管理员)',
    totalParsedCount: 38,
    addedCount: 12,
    updatedCount: 26,
    solutionReadyCount: 22,
    status: 'SUCCESS',
    remarks: '8月月度中旬工单集中对账导入，对齐合同SLA可用度扣减'
  }
];

// 可供快速载入的 PCare 离线报表示例数据包 (方便现场导入测试体验)
export const MOCK_PCARE_NEW_ORDERS_PACK: Partial<WorkOrder>[] = [
  {
    orderNo: 'WO-20260909-8801',
    title: '海口江东储能示范站 液冷回路冷媒压力偏低补加',
    siteName: '海口江东新区绿色微电网储能示范站',
    customer: '海南电网海口供电局',
    contractNo: 'HN-CSG-2025-SLA-033',
    status: 'SOLUTION_READY',
    priority: 'HIGH',
    faultCategory: '液冷系统维护',
    createTime: '2026-09-09 10:20',
    solutionTime: '2026-09-09 13:40',
    assignee: '吴工 (海南现场站长)',
    description: '液冷主管路压力自 0.28MPa 跌至 0.16MPa，触发二级低压报警预警',
    solutionSummary: '经气密性检测排除管路泄漏，按标准补充乙二醇水溶液防冻液至 0.30MPa，自检稳压正常。'
  },
  {
    orderNo: 'WO-20260910-3320',
    title: '宁波舟山港 4#储能柜从控通信模组浪涌损坏应急更换',
    siteName: '宁波舟山港梅山港区储能调频电站',
    customer: '浙江省海港集团',
    contractNo: 'ZJ-HG-2025-SLA-045',
    status: 'SOLUTION_READY',
    priority: 'URGENT',
    faultCategory: '通信与采集链路故障',
    createTime: '2026-09-10 08:30',
    solutionTime: '2026-09-10 11:15',
    assignee: '陈工 (高级电气工程师)',
    description: '受沿海强对流雷暴天气影响，4#箱变通讯光端机出现浪涌残压冲击，光电转换板失步',
    solutionSummary: '已更换同规格备用工业光纤交换机板卡并接地加固，恢复与主控网关通信，报文丢包率恢复为 0。'
  },
  {
    orderNo: 'WO-20260910-5582',
    title: '呼和浩特沙尔沁 3#变流器交流接触器吸合异响排查',
    siteName: '呼和浩特沙尔沁工业园区微网储能电站',
    customer: '内蒙古电力集团',
    contractNo: 'IM-NMD-2025-SLA-058',
    status: 'PROCESSING',
    priority: 'MEDIUM',
    faultCategory: '变流器电气与散热故障',
    createTime: '2026-09-10 14:10',
    assignee: '包工 (华北现场运维)',
    description: '变流器交流并网侧接触器在带载切换时有轻微电磁蜂鸣颤音',
    solutionSummary: '正在调取控制回路激磁线圈电压波形，等待夜间谷段停机验电检测铁芯绝缘。'
  },
  {
    orderNo: 'WO-20260910-6644',
    title: '深圳光明储能电站 5#PACK 单体电压压差微幅发散均衡维护',
    siteName: '深圳光明储能电站二期-04号站',
    customer: '南方电网深圳供电局',
    contractNo: 'CSG-SZ-2025-SLA-081',
    status: 'SOLUTION_READY',
    priority: 'HIGH',
    faultCategory: 'BMS与电芯保护',
    createTime: '2026-09-10 09:00',
    solutionTime: '2026-09-10 12:30',
    assignee: '张维保 (运维主管)',
    description: '满电态下 5#簇第 12 节电芯电压偏高 48mV，超出健康平衡带门限',
    solutionSummary: '启动主动式均衡板进行恒流均衡，并注入修正系数校准采集引线内阻，实测压差已回归 12mV 以内。'
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cnt-001',
    contractNo: 'CSG-SZ-2025-SLA-081',
    title: '南方电网深圳区域储能站点高可用度保障服务合同 (2025-2027)',
    customer: '南方电网深圳供电局',
    evaluationPeriod: '自然月度 (每月1日00:00 - 月末24:00)',
    slaThreshold: 99.50,
    siteCount: 42,
    fulfilledSiteCount: 40,
    validFrom: '2025-01-01',
    validTo: '2027-12-31',
    penaltyClause: '单月可用度低于99.50%但高于99.00%，扣减当月运维服务费的5%；低于99.00%，扣减当月运维服务费的15%并启动专项整改。',
    overallStatus: 'AT_RISK',
    lastSyncedAt: '2026-08-20 04:00 (每日定时同步)',
    associatedSites: [
      {
        siteId: 'site-001',
        siteCode: 'SZ-ESS-0042',
        siteName: '深圳光明储能电站二期-04号站',
        siteSlaThreshold: 99.50,
        currentAvailability: 98.62,
        statusLamp: 'red'
      }
    ],
    monthlyTrend: [
      { month: '2026-03', targetSla: 99.50, actualSla: 99.72, isFulfilled: true },
      { month: '2026-04', targetSla: 99.50, actualSla: 99.68, isFulfilled: true },
      { month: '2026-05', targetSla: 99.50, actualSla: 99.81, isFulfilled: true },
      { month: '2026-06', targetSla: 99.50, actualSla: 99.64, isFulfilled: true },
      { month: '2026-07', targetSla: 99.50, actualSla: 99.58, isFulfilled: true },
      { month: '2026-08', targetSla: 99.50, actualSla: 99.31, isFulfilled: false }
    ]
  },
  {
    id: 'cnt-002',
    contractNo: 'BW-SH-2025-SLA-012',
    title: '宝武钢铁集团上海基地微电网高可靠度运维专项合同',
    customer: '中国宝武钢铁集团',
    evaluationPeriod: '自然季度与月度双重考核',
    slaThreshold: 99.80,
    siteCount: 18,
    fulfilledSiteCount: 18,
    validFrom: '2025-03-01',
    validTo: '2026-12-31',
    penaltyClause: '单站单月可用度跌破99.80%，触发赔付条款并延长维保期1个月。',
    overallStatus: 'FULFILLED',
    lastSyncedAt: '2026-08-20 04:00 (每日定时同步)',
    associatedSites: [
      {
        siteId: 'site-002',
        siteCode: 'SH-BW-0108',
        siteName: '上海宝武钢铁微电网储能示范站-01站',
        siteSlaThreshold: 99.80,
        currentAvailability: 99.89,
        statusLamp: 'green'
      }
    ],
    monthlyTrend: [
      { month: '2026-04', targetSla: 99.80, actualSla: 99.92, isFulfilled: true },
      { month: '2026-05', targetSla: 99.80, actualSla: 99.90, isFulfilled: true },
      { month: '2026-06', targetSla: 99.80, actualSla: 99.88, isFulfilled: true },
      { month: '2026-07', targetSla: 99.80, actualSla: 99.95, isFulfilled: true },
      { month: '2026-08', targetSla: 99.80, actualSla: 99.89, isFulfilled: true }
    ]
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-001',
    reportNo: 'REP-202607-NET-01',
    name: '2026年7月份全网能源站点可用度综合运营月报',
    type: 'NETWORK_MONTHLY',
    scopeName: '全网 (38,420个站点)',
    period: '2026-07 (自然月)',
    formats: ['EXCEL', 'PDF'],
    generatedAt: '2026-08-01 00:30 (定时自动生成)',
    generator: '系统自动生成 (定时任务)',
    fileSize: '14.8 MB',
    downloadCount: 124
  },
  {
    id: 'rep-002',
    reportNo: 'REP-202608-CSG-04',
    name: '深圳光明储能电站二期04号站 单站可用度履约分析报告',
    type: 'SITE_REPORT',
    scopeName: '深圳光明储能电站二期-04号站',
    period: '2026-08 (当期累计)',
    formats: ['EXCEL', 'PDF'],
    generatedAt: '2026-08-20 15:00',
    generator: '林可用 (管理员)',
    fileSize: '3.2 MB',
    downloadCount: 8
  },
  {
    id: 'rep-003',
    reportNo: 'REP-202608-SALE-81',
    name: '南方电网深圳局 SLA合同履约情况评估报告 (销售沟通专用)',
    type: 'CONTRACT_FULFILLMENT',
    scopeName: '合同 CSG-SZ-2025-SLA-081 (42个站点)',
    period: '2026-08 (当期累计)',
    formats: ['EXCEL', 'PDF'],
    generatedAt: '2026-08-20 11:20',
    generator: '王合同 (销售总监)',
    fileSize: '5.6 MB',
    downloadCount: 15
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-0',
    sender: 'ai',
    timestamp: '18:00',
    content: '您好！我是能源站点可用度 AI 智能分析助手。我可以为您执行 ChatBI 查数、SLA 达标预测、多维钻取分析以及报告建议。您可以直接点击下方预设问题，或直接向我提问。',
    queryType: 'fallback'
  }
];
