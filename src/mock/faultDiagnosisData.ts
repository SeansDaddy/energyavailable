import {
  SopItem,
  SimilarCase,
  DiagnosisTask,
  DiagnosisResult,
  DiagnosisFeedbackStats
} from '../types/faultDiagnosis';

export const INITIAL_SOPS: SopItem[] = [
  {
    id: 'sop-001',
    sopCode: 'SOP-PCS-TH01',
    title: 'PCS 变流器 IGBT 桥臂过温停机排查与冷却循环疏通',
    equipmentCategory: 'PCS 变流器',
    faultCategory: '过温过热',
    version: 'v2.4',
    status: 'ACTIVE',
    matchScore: 97,
    recommendReason: '诊断根因命中变流器散热风道受阻与冷却液压差异常，与本 SOP 适用工况 100% 吻合',
    estimatedDuration: '45 分钟',
    requiredTools: ['红外测温成像仪 (FLIR E6)', '防静电绝缘工具套装 (1000V)', '冷却液压力检测表 (0-1.0MPa)', '吸尘吹风机'],
    requiredParts: ['IGBT 驱动散热导热硅脂 (Dow 340)', '进风口初效滤网 (350×400mm)', '备用电动电磁阀 (DN25)'],
    riskWarnings: [
      '变流器内部直流母线存在 750V~1500V 高压直流电，必须断开直流侧主开关并静置放电至少 10 分钟',
      '严禁用万用表电阻档直接测量通电母线，接触前必须使用验电笔验电'
    ],
    steps: [
      {
        stepNumber: 1,
        title: '电气隔离与验电挂牌',
        description: '断开 PCS 交流并网断路器与直流侧隔离开关，悬挂“有人工作，禁止合闸”标示牌，等待母线电容放电完毕后使用验电器确认母线电压 < 36V。',
        keyParams: '母线残压 < 36V DC',
        safetyWarning: '必须穿戴绝缘鞋与 1000V 防护手套'
      },
      {
        stepNumber: 2,
        title: '液冷回路压力与流量检查',
        description: '检查 PCS 水冷模块进出水压力表差值。若进出水压差低于 0.08MPa，说明管路内部可能存在气阻或循环泵叶轮卡涩。开启顶部自动排气阀。',
        keyParams: '进出水压差正常范围: 0.12 ~ 0.25 MPa',
        safetyWarning: '避免冷却液泄漏渗入电气控制板'
      },
      {
        stepNumber: 3,
        title: '散热器翅片灰尘清理与风道疏通',
        description: '拆卸 PCS 进风滤网，使用工业压缩空气/吹吸风机自内向外反向吹扫散热铝翅片积灰，检查内部辅助轴流散热风扇转速。',
        keyParams: '轴流风扇全速转速 > 2800 RPM',
        safetyWarning: '吹风机喷嘴距电路板至少保持 20cm 距离'
      },
      {
        stepNumber: 4,
        title: 'IGBT 表面测温复测与带载试运行',
        description: '重新合闸启动辅助控制回路，使用红外热像仪扫描三相桥臂 IGBT 模块表面温度，各相温差不得超过 5℃。阶梯升载至 50%、100% 观察 15 分钟。',
        keyParams: '各桥臂稳态温差 ΔT ≤ 5.0℃，最高温 < 78℃'
      }
    ],
    author: '储能专家技术支持组 · 董建国',
    updatedAt: '2026-08-15',
    changeLog: 'v2.4: 增补了红外热成像测温标准及进出水压差阈值量化要求'
  },
  {
    id: 'sop-002',
    sopCode: 'SOP-BMS-VOLT02',
    title: '电池簇模组单体压差偏大均衡修复与绝缘检测',
    equipmentCategory: 'BMS 电池簇',
    faultCategory: '电压失衡',
    version: 'v1.8',
    status: 'ACTIVE',
    matchScore: 92,
    recommendReason: '诊断命中电芯压差超限，优先推荐该均衡策略与排查规范',
    estimatedDuration: '60 分钟',
    requiredTools: ['高精度数字万用表 (Fluke 289)', '模组级便携式主动均衡仪 (5A/通道)', '兆欧表 (1000V/2500V)', '力矩扳手 (8Nm)'],
    requiredParts: ['CMU 采集排线线束', '导电铜排备件', 'BMS 采样板 (BMU)'],
    riskWarnings: [
      '高压电池簇存在触电与短路起火风险，严禁任何金属工具搭接正负极',
      '作业区域禁止携带钥匙、手表等金属饰品'
    ],
    steps: [
      {
        stepNumber: 1,
        title: '单体电压精测与短板电芯锁定',
        description: '在静置断开状态下，使用 Fluke 万用表逐针脚复测 CMU 采集线束端子电压，对比 BMS 上报数据，判断是真实电芯压差还是采样插头虚接。',
        keyParams: '实测与上报电压误差不得大于 ±2mV'
      },
      {
        stepNumber: 2,
        title: '外接主动均衡仪充放电干预',
        description: '将 5A 便携式主动均衡仪接入短板模组，对落后电芯实施单体补电，或对过高单体实施受控放电，将压差收敛至 20mV 以内。',
        keyParams: '目标压差收敛至 ≤ 15mV'
      },
      {
        stepNumber: 3,
        title: '模组压降内阻及绝缘阻抗测试',
        description: '使用 1000V 兆欧表测量电池簇对地绝缘电阻，确保阻抗 ≥ 1000 MΩ。复测铜排紧固螺栓力矩。',
        keyParams: '绝缘电阻 ≥ 1000 MΩ, 铜排螺栓紧固力矩 8.0 N·m'
      }
    ],
    author: '现场技术工程部 · 李晓明',
    updatedAt: '2026-07-28',
    changeLog: 'v1.8: 规范便携式均衡仪操作流程与安全防呆插头'
  },
  {
    id: 'sop-003',
    sopCode: 'SOP-EMS-COMM01',
    title: 'EMS 与 PCS/BMS 通信中断及总线报文干扰排查',
    equipmentCategory: 'EMS 通信系统',
    faultCategory: '通讯中断',
    version: 'v3.0',
    status: 'ACTIVE',
    matchScore: 88,
    recommendReason: '适用于通讯丢包、总线告警、遥信遥测数据闪断等故障',
    estimatedDuration: '30 分钟',
    requiredTools: ['便携式示波器', 'Modbus/CAN 报文抓包分析仪', '网络寻线仪与水晶头压线钳'],
    requiredParts: ['屏蔽双绞线 (RVVP 2×0.75)', '120Ω 终端匹配电阻', '光电隔离中继器'],
    riskWarnings: [
      '插拔总线插头前确认通信中继器供电，避免热插拔冲击损坏主控芯片'
    ],
    steps: [
      {
        stepNumber: 1,
        title: '总线链路物理状态与终端电阻检查',
        description: '测量 RS485/CAN 总线 A-B 差分信号静态电压与终端匹配电阻，确认两端总阻抗为 60Ω 左右。',
        keyParams: '总线末端阻抗: 60Ω ± 5Ω'
      },
      {
        stepNumber: 2,
        title: '屏蔽层单端接地与共模干扰消除',
        description: '检查屏蔽双绞线屏蔽层是否在主站端单点接地，严禁两端重复接地形成地环路地电流干扰。',
        keyParams: '对地杂散交流电压 < 0.5V'
      },
      {
        stepNumber: 3,
        title: '协议报文抓取与 CRC 校验错误定位',
        description: '接入分析仪抓取 5 分钟报文，统计丢包率与 CRC 校验错误帧比例，定位具体异常子站地址。',
        keyParams: '通信误码率 BER < 0.01%'
      }
    ],
    author: '自动化系统研发 · 周伟',
    updatedAt: '2026-06-12',
    changeLog: 'v3.0: 统一了 CAN 与 RS485 两种物理介质的排查步骤'
  },
  {
    id: 'sop-004',
    sopCode: 'SOP-HVAC-PUMP03',
    title: '液冷温控机组低压告警与水泵气蚀排气操作',
    equipmentCategory: '液冷温控系统',
    faultCategory: '液冷故障',
    version: 'v1.5',
    status: 'ACTIVE',
    matchScore: 84,
    recommendReason: '适用于液冷流量过低、膨胀水箱液位低、循环水泵异响气蚀排障',
    estimatedDuration: '40 分钟',
    requiredTools: ['手动排气螺丝刀', '乙二醇防冻液浓度折射计', '充氮加压工具'],
    requiredParts: ['50% 乙二醇预混冷却液', '压力变送器 (4-20mA)', '排气阀密封垫圈'],
    riskWarnings: [
      '高温状态下严禁打开排气阀或注液口，防止高温防冻液喷溅烫伤'
    ],
    steps: [
      {
        stepNumber: 1,
        title: '机组停机与膨胀水箱液位确认',
        description: '在空调控制器上切断压缩机与水泵电源，观察膨胀水箱光学液位计，液位必须位于 1/2 至 2/3 标线之间。',
        keyParams: '常温液位比例 ≥ 55%'
      },
      {
        stepNumber: 2,
        title: '各支路最高点手动排气排空',
        description: '自电池集装箱底部进水至顶部回水逐一拧开排气阀，排出夹杂在管道中的残余气泡，直至呈均匀水柱流出。',
        keyParams: '系统补液保压 0.25 MPa 稳压 10 分钟'
      },
      {
        stepNumber: 3,
        title: '试运转与水泵扬程电流校核',
        description: '启动循环泵，观察变频水泵三相电流平稳度，监听泵体无杂音异响，温控屏低压告警自动复归。',
        keyParams: '水泵运转电流在额定值 ±10% 以内'
      }
    ],
    author: '温控系统工程师 · 赵海峰',
    updatedAt: '2026-05-19',
    changeLog: 'v1.5: 补充防冻液冰点浓度折射测量标准'
  }
];

export const INITIAL_SIMILAR_CASES: SimilarCase[] = [
  {
    id: 'case-001',
    caseNo: 'CASE-202607-009',
    title: '宝武钢铁1号站 2# PCS 变流器散热风道受阻致 IGBT 过温跳机',
    siteName: '宝武钢铁1号储能站',
    deviceModel: 'PCS-1500k-HV (1500kW 集中式变流器)',
    faultCategory: '过温过热',
    rootCause: '进风滤网积聚重工业粉尘，且液冷三通阀执行器卡在 30% 开度，冷却液流量由 45L/min 降至 18L/min，引发 IGBT 结温达到 98℃ 触发自保护停机',
    symptomDescription: 'PCS 控制器报“E-0422 IGBT 桥臂过温”，支路停机，折算等效 PCS 停运 596 分钟',
    resolutionSteps: '更换进风口高效初效滤网；手动润滑并校准液冷三通调节阀；使用 SOP-PCS-TH01 进行冲洗排气；阶梯加载测试恢复。',
    outcome: '故障彻底消除，变流器三相温差恢复至 2.3℃，满载连续运行 72 小时无复发',
    mttrMinutes: 130,
    similarityScore: 96,
    matchDimensions: ['根因特征高度吻合 (结温斜率异常)', '设备型号同系列', '报警代码 E-0422 相同', '液冷回路流量骤降'],
    source: 'TRANSFERRED',
    createdAt: '2026-07-16 17:20',
    createdBy: '张建军 (现场运维专家)',
    rawLogSnippet: '[WARN] PCS-02 T_IGBT_W > 92C\n[ERROR] Flow_Coolant = 18.2 L/min (Thresh: >35)\n[FATAL] E-0422 Bridge Over-temp Protection Active, Inverter Trip'
  },
  {
    id: 'case-002',
    caseNo: 'CASE-202606-015',
    title: '深圳光明储能站 M02 模组内部单体微短路导致充放电末端压差超限',
    siteName: '深圳光明储能电站二期-04号站',
    deviceModel: 'LFP-280Ah-1P16S (磷酸铁锂高压电池簇)',
    faultCategory: '电压失衡',
    rootCause: 'PACK-03 内部 M02-04 模组 7# 电芯隔膜存在局部微缺陷，自放电率高出同簇均值 4 倍，静置 24h 压差拉大至 68mV',
    symptomDescription: 'BMS 报“单体欠压保护”提前终止放电，导致系统放电可用度损失 0.88%',
    resolutionSteps: '使用主动均衡仪进行单独补电纠偏，随后在检修窗口更换该缺陷模组，执行全簇充放电标定。',
    outcome: '电池簇满充压差降至 14mV，释放可用容量 +3.2kWh',
    mttrMinutes: 180,
    similarityScore: 89,
    matchDimensions: ['压差超限短板特征', '同款磷酸铁锂 280Ah 电池模组', '静置压降衰减斜率吻合'],
    source: 'HISTORICAL_IMPORT',
    createdAt: '2026-06-22 11:45',
    createdBy: '李工 (华南代表处)',
    rawLogSnippet: '[BMS] Cell_07_Volt = 2.912V, Cluster_Mean = 3.125V\n[WARN] Delta_V_Max = 213mV Exceeds Thresh(50mV)\n[ACTION] Premature Discharge Cut-off Triggered'
  },
  {
    id: 'case-003',
    caseNo: 'CASE-202605-003',
    title: '石家庄循环化工园区储能站 RS485 通信接地环路干扰致遥测跳变',
    siteName: '石家庄循环化工园区储能站',
    deviceModel: 'EMS-RTU-8000 (场站能量管理数据采集装置)',
    faultCategory: '通讯中断',
    rootCause: '现场施工人员在变流器柜与监控屏柜两端均将屏蔽层接地，地电位差引发共模工频干扰，导致通讯 CRC 校验失败丢包率达 42%',
    symptomDescription: 'EMS 画面变流器功率频繁掉为 0，伴随虚假离线报警，影响可用度统计连续性',
    resolutionSteps: '挑开变流器侧屏蔽层接地，保留监控主柜单端接地；增加 120Ω 终端电阻；复测波形恢复平直方波。',
    outcome: '通信恢复 0 丢包，遥测数据连续刷新',
    mttrMinutes: 45,
    similarityScore: 82,
    matchDimensions: ['通讯瞬断特征', 'CRC 校验错误率异常', '现场接地接线不良'],
    source: 'HISTORICAL_IMPORT',
    createdAt: '2026-05-10 14:15',
    createdBy: '自动化支持团队',
    rawLogSnippet: '[EMS_COMM] Port /dev/ttyS2: CRC Error Count: 1420/3000\n[WARN] Modbus Timeout Node=0x04 (PCS-01)\n[SYS] Data Packet Dropped, Telemetry Flatline'
  },
  {
    id: 'case-004',
    caseNo: 'CASE-202604-021',
    title: '广州南沙储能港液冷回路气阻导致水泵吸空与低流量报警',
    siteName: '广州南沙综合能源港储能站',
    deviceModel: 'Chiller-40kW (集装箱顶置液冷循环机组)',
    faultCategory: '液冷故障',
    rootCause: '年度补液后未充分开启管网末端排气阀，冷热交替循环中析出微小气泡积聚在泵头，引发气蚀与水流震荡',
    symptomDescription: '液冷温控面板显示“水流不足”，压缩机停运，引发电芯温差迅速扩大到 6.2℃',
    resolutionSteps: '执行 SOP-HVAC-PUMP03，利用便携充氮设备保压，自底向上彻底排气注液，复位液位开关。',
    outcome: '循环流量恢复 62 L/min，电芯温差收敛至 2.8℃',
    mttrMinutes: 50,
    similarityScore: 78,
    matchDimensions: ['水流量低报警', '液冷温控系统', '排气消缺方案'],
    source: 'TRANSFERRED',
    createdAt: '2026-04-18 16:30',
    createdBy: '温控工程师',
    rawLogSnippet: '[HVAC] Pump Current Fluctuation: 2.1A ~ 5.4A (Chatter)\n[ERROR] Flow Switch Contact Open: Flow < 20 L/min\n[ALERT] Chiller Unit Locked'
  }
];

export const INITIAL_DIAGNOSIS_TASKS: DiagnosisTask[] = [
  {
    id: 'task-diag-001',
    taskNo: 'DIAG-20260812-001',
    siteId: 'site-001',
    siteName: '宝武钢铁1号储能站',
    siteCode: 'SZ-ESS-0001',
    eventContext: {
      eventId: 'fault-001',
      eventTitle: '2# PCS 变流器过温告警与非计划停运',
      eventType: 'fault',
      eventTime: '2026-08-12 14:20',
      severity: 'CRITICAL',
      description: '变流器 W 相 IGBT 结温达到 98℃ 触发系统急停，等效 PCS 中断 596 分钟'
    },
    logSourceType: 'BATCH_REF',
    logBatchNo: 'LOG-20260815-001',
    uploadedFileName: 'BAOWU_ESS_PCS_20260812_RUNLOG.zip',
    uploadedFileSize: '48.6 MB',
    logCategory: 'PCS',
    timeRange: {
      start: '2026-08-12 12:00',
      end: '2026-08-12 18:00'
    },
    status: 'COMPLETED',
    progress: 100,
    currentStepDescription: 'AI 诊断完成，已输出根因、证据链、SOP 及相似案例',
    createdAt: '2026-08-12 14:35',
    completedAt: '2026-08-12 14:38',
    creator: '张建军 (现场运维工程师)',
    result: {
      id: 'res-diag-001',
      taskId: 'task-diag-001',
      rootCause: 'PCS 变流器进风滤网积聚粉尘引发风阻上升，叠加液冷三通阀开度机械卡涩，导致高负荷充放电下 IGBT 结温急剧爬升超限跳机。',
      rootCauseDetail: '综合分析 14:00~14:20 运行特征：变流器输出功率持续 1200kW 时，冷却液流量从额定 45L/min 突降至 18.2L/min，W相桥臂散热基板温升速率达 1.8℃/s，远超正常工况（≤0.3℃/s）。判定为“外循环滤网重污染 + 内循环液冷调温阀物理卡涩”双重诱发。',
      ruleOrModelPath: '故障因果链诊断模型 v4.2 -> [Rule-TH04 变流器温升动态偏置] -> [Decision_Tree: T_IGBT_Rise > 1.5℃/s & Coolant_Flow < 25L/min -> 机械执行卡涩]',
      confidence: 'HIGH',
      confidencePercent: 96,
      affectedScope: [
        { deviceName: '2# PCS 变流器柜 (PCS-1500k-HV)', moduleName: 'W相 IGBT 逆变驱动桥臂', details: '编号 INV-MOD-03' },
        { deviceName: '变流器内置液冷电磁调节阀', details: '阀体型号 DN25-PRO' }
      ],
      availabilityImpact: {
        estimatedInterruptionMins: 596,
        availabilityLossPercent: 0.86,
        slaImpactDescription: '直接导致当期可用度由 99.50% 跌落至 98.64%，跌破 SLA 阈值红线，触发合同违约考核预警。'
      },
      evidenceLogs: [
        {
          timestamp: '2026-08-12 14:15:02',
          level: 'WARN',
          component: 'PCS_TEMP_CTRL',
          message: 'IGBT Module Phase-W Temp = 86.4C, approaching high warning line (85C)',
          highlight: false
        },
        {
          timestamp: '2026-08-12 14:17:40',
          level: 'ERROR',
          component: 'COOLING_SYSTEM',
          message: 'Flow Sensor FS-02 Readout = 18.2 L/min (Expected Nominal >= 42.0 L/min), Delta_P = 0.04MPa',
          highlight: true
        },
        {
          timestamp: '2026-08-12 14:19:12',
          level: 'WARN',
          component: 'PCS_VALVE',
          message: 'Proportional Valve Stepper Motor position feedback stalled at 32% (Command: 100%)',
          highlight: true
        },
        {
          timestamp: '2026-08-12 14:20:00',
          level: 'FATAL',
          component: 'PCS_PROTECTION',
          message: 'Trip Signal Triggered: [E-0422] IGBT Bridge W-phase Over-temperature (Peak: 98.2C >= 95C Threshold)',
          highlight: true
        },
        {
          timestamp: '2026-08-12 14:20:05',
          level: 'INFO',
          component: 'GRID_BREAKER',
          message: 'AC Main Contactor Tripped open safely. Zero current confirmed.',
          highlight: false
        }
      ],
      evidenceFeatures: [
        {
          name: 'W相 IGBT 结温瞬时升温速率',
          value: '1.82 ℃/s',
          baseline: '≤ 0.35 ℃/s',
          status: 'ANOMALOUS',
          significance: '热量堆积严重，表明内冷循环散热热阻急剧恶化'
        },
        {
          name: '液冷管路循环流量',
          value: '18.2 L/min',
          baseline: '42.0 ~ 48.0 L/min',
          status: 'ANOMALOUS',
          significance: '较额定值跌落 62%，冷却剂无法及时将热量导出柜体'
        },
        {
          name: '进风口前后负压差',
          value: '142 Pa',
          baseline: '30 ~ 55 Pa',
          status: 'WARNING',
          significance: '初效过滤网严重被重工业环境粉尘堵塞'
        },
        {
          name: '电网交流输出对称度',
          value: '99.4 %',
          baseline: '≥ 98.0 %',
          status: 'NORMAL',
          significance: '变流器电气主拓扑无硬件绝缘或击穿损坏'
        }
      ],
      reasoningChain: [
        '步骤 1: 提取 14:15~14:20 PCS 关键遥测数据，发现输出功率 1200kW 保持恒定，排除电网短路冲击。',
        '步骤 2: 关联液冷机组日志，发现冷却液流量突降至 18.2L/min，压差仅 0.04MPa，定位至冷却介质循环受阻。',
        '步骤 3: 提取执行器状态字，确认电动调节阀在 32% 位置卡死，未能如期全开至 100%。',
        '步骤 4: 结合进风压差 142Pa 超标，判定外部辅助风道与内部液冷回路发生双重散热瓶颈，触发 E-0422 保护动作。'
      ],
      recommendedSops: [INITIAL_SOPS[0], INITIAL_SOPS[3]],
      similarCases: [INITIAL_SIMILAR_CASES[0], INITIAL_SIMILAR_CASES[3]],
      feedback: {
        type: 'THUMBS_UP',
        timestamp: '2026-08-12 15:10',
        userName: '张建军 (现场专家)'
      },
      isTransferredToCase: true,
      transferredCaseNo: 'CASE-202607-009',
      isTransferredToWorkOrder: true,
      transferredWorkOrderNo: 'WO-20260812-004',
      reportExportCount: 3
    }
  },
  {
    id: 'task-diag-002',
    taskNo: 'DIAG-20260818-002',
    siteId: 'site-004',
    siteName: '深圳光明储能电站二期-04号站',
    siteCode: 'SZ-ESS-0042',
    eventContext: {
      eventId: 'alert-002',
      eventTitle: '3# 电池簇 M02-04 短板模组单体压差超限',
      eventType: 'availability_alert',
      eventTime: '2026-08-18 09:15',
      severity: 'MAJOR',
      description: '单体压差达到 68mV，触发充放电功率降额约束'
    },
    logSourceType: 'BATCH_REF',
    logBatchNo: 'LOG-20260818-002',
    logCategory: 'BMS',
    timeRange: {
      start: '2026-08-17 00:00',
      end: '2026-08-18 12:00'
    },
    status: 'COMPLETED',
    progress: 100,
    currentStepDescription: 'AI 诊断完成，已输出电芯微短路短板诊断与被动均衡排障建议',
    createdAt: '2026-08-18 09:30',
    completedAt: '2026-08-18 09:33',
    creator: '系统自动预警触发',
    result: {
      id: 'res-diag-002',
      taskId: 'task-diag-002',
      rootCause: 'PACK-03 模组 M02-04 内部 7# 单体电芯存在微弱局部自放电异常，静置期间压降速率偏高，导致充放电末端木桶短板效应显现。',
      rootCauseDetail: '对比全簇 224 节电芯静置曲线，7# 电芯自放电斜率达到 3.2mV/h（正常 ≤0.5mV/h）。放电截止时该单体率先触碰 2.90V 下限，导致整簇提早终止放电，放电容量损失约 0.88%。',
      ruleOrModelPath: 'BMS 电芯微短路自放电异常检测模型 v3.1 -> [Rule-VOLT09 单体离群分析] -> [Outlier_Score: 9.4 > 3.0]',
      confidence: 'HIGH',
      confidencePercent: 91,
      affectedScope: [
        { deviceName: '3# 电池簇 (CLUSTER-03)', moduleName: 'M02-04 模组', packName: 'PACK-03', details: '7# 电芯 (Cell-07)' }
      ],
      availabilityImpact: {
        estimatedInterruptionMins: 180,
        availabilityLossPercent: 0.32,
        slaImpactDescription: '限制系统全容量充放调度，当前可用度潜在扣减 0.32%，需在下个检修窗口实施均衡消除短板。'
      },
      evidenceLogs: [
        {
          timestamp: '2026-08-18 04:00:00',
          level: 'INFO',
          component: 'BMS_CLUSTER_03',
          message: 'System Rest State Check: Cell_07 = 3.284V, Pack Mean = 3.310V',
          highlight: false
        },
        {
          timestamp: '2026-08-18 08:30:15',
          level: 'WARN',
          component: 'BMU_MOD_04',
          message: 'Cell_07 Voltage dropped to 3.216V during 4.5h rest (Delta_V = 68mV vs mean)',
          highlight: true
        },
        {
          timestamp: '2026-08-18 09:12:00',
          level: 'ERROR',
          component: 'BMS_MASTER',
          message: 'Cluster-03 Power Derating Active: Delta_V_Max = 68mV > Thresh(50mV)',
          highlight: true
        }
      ],
      evidenceFeatures: [
        {
          name: '7# 电芯静置压降斜率',
          value: '3.20 mV/h',
          baseline: '≤ 0.50 mV/h',
          status: 'ANOMALOUS',
          significance: '显著高于同批次均值，符合内部微短路早期特征'
        },
        {
          name: '充放电末端最大电压极差',
          value: '68 mV',
          baseline: '≤ 30 mV',
          status: 'ANOMALOUS',
          significance: '触发 BMS 二级功率降额与木桶短板截断'
        }
      ],
      reasoningChain: [
        '步骤 1: 扫描电池簇历史充放电数据，排除采样线接触电阻虚高（交流内阻正常）。',
        '步骤 2: 计算多周期静置自放电率，发现 7# 单体压降速率持续偏离正态分布，离群度达到 9.4σ。',
        '步骤 3: 给出干预策略：先使用便携式均衡仪补电（可快速收敛可用度损失），若 15 天内再次复发则安排停机换模组。'
      ],
      recommendedSops: [INITIAL_SOPS[1]],
      similarCases: [INITIAL_SIMILAR_CASES[1]],
      feedback: undefined,
      isTransferredToCase: false,
      isTransferredToWorkOrder: false,
      reportExportCount: 1
    }
  },
  {
    id: 'task-diag-003',
    taskNo: 'DIAG-20260810-003',
    siteId: 'site-008',
    siteName: '石家庄循环化工园区储能站',
    siteCode: 'HB-SJZ-008',
    eventContext: {
      eventId: 'alarm-003',
      eventTitle: 'EMS 与 1# PCS 通信链路丢包与遥测瞬断',
      eventType: 'alarm',
      eventTime: '2026-08-10 16:40',
      severity: 'MAJOR',
      description: 'RS485 总线报文 CRC 校验错误率高达 38%，导致调度指令延时超 5s'
    },
    logSourceType: 'MANUAL_UPLOAD',
    uploadedFileName: 'SJZ_EMS_COMM_DEBUG_20260810.log',
    uploadedFileSize: '12.4 MB',
    logCategory: 'EMS',
    timeRange: {
      start: '2026-08-10 14:00',
      end: '2026-08-10 18:00'
    },
    status: 'COMPLETED',
    progress: 100,
    currentStepDescription: 'AI 诊断完成，已输出通信干扰地环路根因及屏蔽层接线 SOP',
    createdAt: '2026-08-10 16:50',
    completedAt: '2026-08-10 16:52',
    creator: '运维值班员 · 郭浩',
    result: {
      id: 'res-diag-003',
      taskId: 'task-diag-003',
      rootCause: 'RS485 通信双绞线屏蔽层两端同时接地，变电站地网电位波动在屏蔽层形成环流，诱发共模电磁干扰造成报文 CRC 校验失败。',
      rootCauseDetail: '抓包数据显示丢包周期与附近 110kV 升压变负荷阶跃完全同步，屏蔽层存在 1.8V 50Hz 工频感应电压，破坏了差分接收门限。',
      ruleOrModelPath: '工业总线抗干扰诊断知识库 -> [Rule-COMM03 地环路电位差干扰识别]',
      confidence: 'MEDIUM',
      confidencePercent: 84,
      affectedScope: [
        { deviceName: '1# 储能变流器 (PCS-01)', details: 'RS485 通讯口 COM-2' },
        { deviceName: '场站 EMS 数据网关 (RTU-8000)', details: '通道 CH-04' }
      ],
      availabilityImpact: {
        estimatedInterruptionMins: 45,
        availabilityLossPercent: 0.12,
        slaImpactDescription: '造成短期数据断供与遥控指令失败，消除干扰后即刻恢复。'
      },
      evidenceLogs: [
        {
          timestamp: '2026-08-10 16:38:10',
          level: 'ERROR',
          component: 'MODBUS_GATEWAY',
          message: 'COM2 CRC Error Rate = 38.2% (Frame: 01 03 00 20 ... Bad Checksum: 0x8F12)',
          highlight: true
        },
        {
          timestamp: '2026-08-10 16:39:00',
          level: 'WARN',
          component: 'EMS_POLLER',
          message: 'Retry Limit Exceeded for Node 1# PCS, Telemetry Freeze for 8 cycles',
          highlight: false
        }
      ],
      evidenceFeatures: [
        {
          name: '总线丢包率',
          value: '38.2 %',
          baseline: '< 0.05 %',
          status: 'ANOMALOUS',
          significance: '严重影响调度指令下发与遥信刷新'
        },
        {
          name: '屏蔽层地环路工频杂散电压',
          value: '1.85 V AC',
          baseline: '< 0.30 V AC',
          status: 'ANOMALOUS',
          significance: '两端接地引起电位差感应环流'
        }
      ],
      reasoningChain: [
        '步骤 1: 检查波特率配置无漂移，物理水晶头插拔紧固无松动。',
        '步骤 2: 示波器抓取差分信号，发现低电平叠加 50Hz 正弦工频干扰。',
        '步骤 3: 结合变电站母线负荷波动，锁定为两端接地造成的共模电位差干扰。'
      ],
      recommendedSops: [INITIAL_SOPS[2]],
      similarCases: [INITIAL_SIMILAR_CASES[2]],
      feedback: {
        type: 'THUMBS_UP',
        timestamp: '2026-08-10 18:20',
        userName: '郭浩'
      },
      isTransferredToCase: true,
      transferredCaseNo: 'CASE-202605-003',
      isTransferredToWorkOrder: false,
      reportExportCount: 1
    }
  },
  {
    id: 'task-diag-004',
    taskNo: 'DIAG-20260820-004',
    siteId: 'site-002',
    siteName: '广州南沙综合能源港储能站',
    siteCode: 'GD-GZ-0089',
    eventContext: {
      eventId: 'alarm-004',
      eventTitle: '液冷温控机组低压告警与压缩机停运',
      eventType: 'alarm',
      eventTime: '2026-08-20 14:10',
      severity: 'CRITICAL',
      description: '冷水机低压传感器动作，循环泵异响，电芯温差有扩大趋势'
    },
    logSourceType: 'BATCH_REF',
    logBatchNo: 'LOG-20260820-001',
    logCategory: 'HVAC',
    timeRange: {
      start: '2026-08-20 12:00',
      end: '2026-08-20 15:00'
    },
    status: 'DIAGNOSING',
    progress: 68,
    currentStepDescription: '正在分析液冷机组温差与水泵流量特征参数...',
    createdAt: '2026-08-20 14:25',
    creator: '运维值班长 · 陈启明'
  }
];

export const INITIAL_FEEDBACK_STATS: DiagnosisFeedbackStats = {
  totalDiagnoses: 142,
  thumbsUpCount: 128,
  thumbsDownCount: 6,
  transferredCasesCount: 54,
  transferredWorkOrdersCount: 48,
  avgMttrReductionMinutes: 38
};
