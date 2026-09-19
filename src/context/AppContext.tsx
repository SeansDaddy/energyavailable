import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Site,
  ImportBatch,
  AlertItem,
  WorkOrder,
  PcareImportRecord,
  Contract,
  ReportItem,
  UserProfile,
  ChatMessage,
  StatusLamp,
  RedundancyLevel
} from '../types';
import {
  CURRENT_USERS,
  INITIAL_SITES,
  INITIAL_ALERTS,
  INITIAL_BATCHES,
  INITIAL_WORK_ORDERS,
  INITIAL_PCARE_IMPORT_HISTORY,
  INITIAL_CONTRACTS,
  INITIAL_REPORTS,
  INITIAL_CHAT_MESSAGES,
  NETWORK_KPI,
  NETWORK_12_MONTHS_TREND,
  REGION_DISTRIBUTION,
  DIMENSION_TREE_DATA
} from '../mock/initialData';
import {
  DiagnosisTask,
  SimilarCase,
  SopItem,
  DiagnosisFeedbackStats
} from '../types/faultDiagnosis';
import {
  INITIAL_DIAGNOSIS_TASKS,
  INITIAL_SIMILAR_CASES,
  INITIAL_SOPS,
  INITIAL_FEEDBACK_STATS
} from '../mock/faultDiagnosisData';

export type NavigationTab =
  | 'login'
  | 'workbench'
  | 'sites'
  | 'site_detail'
  | 'pre_sales_eval'
  | 'log_import'
  | 'availability_monitor'
  | 'alerts'
  | 'analytics'
  | 'performance_evaluation'
  | 'fault_diagnosis'
  | 'reports'
  | 'work_orders'
  | 'contracts';

export interface ReliabilityWeights {
  historyInterruptionFreq: number;
  mttr: number;
  redundancy: number;
  alarmDensity: number;
  dataCoverage: number;
}

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  selectedSiteId: string;
  setSelectedSiteId: (id: string) => void;
  siteDetailTab: number; // 0..6
  setSiteDetailTab: (idx: number) => void;
  
  // AI Drawer state
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  openAiDrawer: (initialQuery?: string) => void;
  closeAiDrawer: () => void;
  clearChatMessages: () => void;
  
  // Data lists
  sites: Site[];
  alerts: AlertItem[];
  batches: ImportBatch[];
  workOrders: WorkOrder[];
  pcareImportHistory: PcareImportRecord[];
  lastPcareImportTime: string;
  importWorkOrders: (
    newOrders: WorkOrder[],
    batchMeta?: { batchNo?: string; fileName?: string; remarks?: string; fileSize?: string }
  ) => { addedCount: number; updatedCount: number };
  contracts: Contract[];
  reports: ReportItem[];
  chatMessages: ChatMessage[];
  
  // Navigation & Drilldown
  drilldownFilter: {
    region?: string;
    repOffice?: string;
    customer?: string;
    statusLamp?: StatusLamp;
    searchKey?: string;
  };
  setDrilldownFilter: React.Dispatch<React.SetStateAction<{
    region?: string;
    repOffice?: string;
    customer?: string;
    statusLamp?: StatusLamp;
    searchKey?: string;
  }>>;
  navigateToSiteDetail: (siteId: string, defaultTabIdx?: number) => void;
  navigateToAlertsWithFilter: (typeFilter?: string) => void;

  // Actions
  handleAlert: (alertId: string, action: 'confirmed' | 'ignored', note?: string) => void;
  addSite: (site: Partial<Site>) => void;
  updateSiteRedundancy: (siteId: string, redundancy: RedundancyLevel, notes: string) => void;
  importLogBatch: (siteId: string, fileName: string, periodStart: string, periodEnd: string, isOverride: boolean) => ImportBatch;
  generateReport: (type: ReportItem['type'], scopeName: string, period: string, format: 'PDF' | 'EXCEL' | 'BOTH') => ReportItem;
  addReportItem?: (report: ReportItem) => void;
  sendChatMessage: (content: string) => void;
  syncContracts: () => void;

  // AI Fault Diagnosis
  diagnosisTasks: DiagnosisTask[];
  activeDiagnosisTaskId: string | null;
  setActiveDiagnosisTaskId: (id: string | null) => void;
  caseLibrary: SimilarCase[];
  sopLibrary: SopItem[];
  feedbackStats: DiagnosisFeedbackStats;
  createDiagnosisTask: (task: DiagnosisTask) => void;
  giveDiagnosisFeedback: (
    taskId: string,
    isThumbsUp: boolean,
    negativeDetails?: {
      verifiedRootCause: string;
      reasonCategory: string;
      remarks: string;
      engineerName: string;
    }
  ) => void;
  transferDiagnosisToCase: (taskId: string, caseData: Partial<SimilarCase>) => void;
  transferDiagnosisToWorkOrder: (taskId: string, workOrderData: Partial<WorkOrder>) => void;
  addCaseToLibrary: (newCase: SimilarCase) => void;
  addSopToLibrary: (newSop: SopItem) => void;
  updateSopInLibrary: (sopId: string, updated: Partial<SopItem>) => void;
  
  // Reliability Weights config
  reliabilityWeights: ReliabilityWeights;
  setReliabilityWeights: (weights: ReliabilityWeights) => void;
  
  // Constants
  networkKpi: typeof NETWORK_KPI;
  trend12Months: typeof NETWORK_12_MONTHS_TREND;
  regionDistribution: typeof REGION_DISTRIBUTION;
  dimensionTree: typeof DIMENSION_TREE_DATA;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('workbench');
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USERS[0]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-001');
  const [siteDetailTab, setSiteDetailTab] = useState<number>(0);
  
  // AI Drawer state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);

  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [batches, setBatches] = useState<ImportBatch[]>(INITIAL_BATCHES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [pcareImportHistory, setPcareImportHistory] = useState<PcareImportRecord[]>(INITIAL_PCARE_IMPORT_HISTORY);
  const [lastPcareImportTime, setLastPcareImportTime] = useState<string>('2026-09-08 17:35:20');
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  
  // AI Fault Diagnosis State
  const [diagnosisTasks, setDiagnosisTasks] = useState<DiagnosisTask[]>(INITIAL_DIAGNOSIS_TASKS);
  const [activeDiagnosisTaskId, setActiveDiagnosisTaskId] = useState<string | null>(null);
  const [caseLibrary, setCaseLibrary] = useState<SimilarCase[]>(INITIAL_SIMILAR_CASES);
  const [sopLibrary, setSopLibrary] = useState<SopItem[]>(INITIAL_SOPS);
  const [feedbackStats, setFeedbackStats] = useState<DiagnosisFeedbackStats>(INITIAL_FEEDBACK_STATS);
  
  const [drilldownFilter, setDrilldownFilter] = useState<{
    region?: string;
    repOffice?: string;
    customer?: string;
    statusLamp?: StatusLamp;
    searchKey?: string;
  }>({});

  const [reliabilityWeights, setReliabilityWeights] = useState<ReliabilityWeights>({
    historyInterruptionFreq: 0.25,
    mttr: 0.20,
    redundancy: 0.20,
    alarmDensity: 0.15,
    dataCoverage: 0.20
  });

  const openAiDrawer = (initialQuery?: string) => {
    setIsAiDrawerOpen(true);
    if (initialQuery && initialQuery.trim()) {
      sendChatMessage(initialQuery.trim());
    }
  };

  const closeAiDrawer = () => {
    setIsAiDrawerOpen(false);
  };

  const clearChatMessages = () => {
    setChatMessages([
      {
        id: `chat-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: '已为您清空当前会话记录。我是能源站点可用度 AI 智能分析与 ChatBI 助手，随时待命为您解答全网台账、SLA 履约分析、故障归因及售前评估。',
        queryType: 'fallback'
      }
    ]);
  };

  const navigateToSiteDetail = (siteId: string, defaultTabIdx: number = 0) => {
    setSelectedSiteId(siteId);
    setSiteDetailTab(defaultTabIdx);
    setActiveTab('site_detail');
  };

  const navigateToAlertsWithFilter = (typeFilter?: string) => {
    setActiveTab('alerts');
  };

  const handleAlert = (alertId: string, action: 'confirmed' | 'ignored', note?: string) => {
    setAlerts(prev =>
      prev.map(item => {
        if (item.id === alertId) {
          return {
            ...item,
            status: action,
            handler: currentUser.name,
            handleTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
            handleNote: note || (action === 'confirmed' ? '已确认并纳入重点跟进' : '已核实确属计划内操作，已忽略')
          };
        }
        return item;
      })
    );
  };

  const addSite = (siteData: Partial<Site>) => {
    const newId = `site-${Date.now().toString().slice(-4)}`;
    const newSite: Site = {
      id: newId,
      siteCode: siteData.siteCode || `ESS-NEW-${newId}`,
      siteName: siteData.siteName || '新增储能示范站',
      region: siteData.region || '华东区',
      representativeOffice: siteData.representativeOffice || '上海代表处',
      customer: siteData.customer || '中国宝武钢铁集团',
      capacityMw: siteData.capacityMw || 10.0,
      coreDeviceCount: siteData.coreDeviceCount || 6,
      redundancy: siteData.redundancy || 'N_PLUS_1',
      redundancyNotes: siteData.redundancyNotes || '标准模块化热备',
      slaThreshold: siteData.slaThreshold || 99.50,
      currentAvailability: 99.85,
      statusLamp: 'green',
      dataCoverage: 100,
      lastImportTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dataStarvedDays: 0,
      starveThresholdDays: 30,
      contractId: 'cnt-001',
      contractNo: 'CSG-SZ-2025-SLA-081',
      owner: currentUser.name,
      domain: currentUser.domain,
      reliabilityScore: {
        totalScore: 92.0,
        updatedAt: '2026-08-20 00:00',
        factors: {
          historyInterruptionFreq: { name: '历史中断频率', score: 95, weight: 0.25, rawValue: '中断0次', description: '正常' },
          mttr: { name: '平均恢复时长', score: 90, weight: 0.20, rawValue: '1.0小时', description: '正常' },
          redundancy: { name: '组网冗余度', score: 90, weight: 0.20, rawValue: 'N+1', description: '良好' },
          alarmDensity: { name: '告警密度', score: 90, weight: 0.15, rawValue: '3条/月', description: '正常' },
          dataCoverage: { name: '数据覆盖率', score: 100, weight: 0.20, rawValue: '100%', description: '完整' }
        }
      },
      coreDevices: [],
      mergedFaults: [],
      dailySnapshots: []
    };
    setSites(prev => [newSite, ...prev]);
  };

  const updateSiteRedundancy = (siteId: string, redundancy: RedundancyLevel, notes: string) => {
    setSites(prev =>
      prev.map(site => {
        if (site.id === siteId) {
          const scoreMap: Record<RedundancyLevel, number> = {
            NONE: 50,
            N_PLUS_1: 85,
            DUAL_HOT_BACKUP: 95,
            RING_TOPOLOGY: 98,
            MULTI_ACTIVE: 96
          };
          const redundancyScore = scoreMap[redundancy] || 80;
          
          const updatedFactors = {
            ...site.reliabilityScore.factors,
            redundancy: {
              ...site.reliabilityScore.factors.redundancy,
              score: redundancyScore,
              rawValue: `${redundancy} (${notes})`
            }
          };

          const newTotal = Number((
            updatedFactors.historyInterruptionFreq.score * reliabilityWeights.historyInterruptionFreq +
            updatedFactors.mttr.score * reliabilityWeights.mttr +
            updatedFactors.redundancy.score * reliabilityWeights.redundancy +
            updatedFactors.alarmDensity.score * reliabilityWeights.alarmDensity +
            updatedFactors.dataCoverage.score * reliabilityWeights.dataCoverage
          ).toFixed(1));

          return {
            ...site,
            redundancy,
            redundancyNotes: notes,
            reliabilityScore: {
              ...site.reliabilityScore,
              totalScore: newTotal,
              factors: updatedFactors
            }
          };
        }
        return site;
      })
    );
  };

  // Rule R3: Latest-Wins log import and instant recalculation
  const importLogBatch = (
    siteId: string,
    fileName: string,
    periodStart: string,
    periodEnd: string,
    isOverride: boolean
  ): ImportBatch => {
    const targetSite = sites.find(s => s.id === siteId) || sites[0];
    const newBatchNo = `BATCH-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random()*900)}`;
    
    // Mark previous overlapping batches as OVERRIDDEN
    if (isOverride) {
      setBatches(prev =>
        prev.map(b => (b.siteId === siteId ? { ...b, status: 'OVERRIDDEN', isLatestWinning: false, replacedBatchNo: newBatchNo } : b))
      );
    }

    const newBatch: ImportBatch = {
      id: `batch-${Date.now()}`,
      batchNo: newBatchNo,
      siteId: targetSite.id,
      siteName: targetSite.siteName,
      fileName: fileName || `${targetSite.siteCode}_LOG.zip`,
      fileSize: '36.4 MB',
      importTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      periodStart,
      periodEnd,
      status: 'SUCCESS',
      operator: currentUser.name,
      equivalentInterruptionMinutes: 0,
      eventsCount: 42,
      isLatestWinning: true
    };

    setBatches(prev => [newBatch, ...prev]);

    // Instant recalculation & update target site
    setSites(prev =>
      prev.map(s => {
        if (s.id === targetSite.id) {
          return {
            ...s,
            lastImportTime: newBatch.importTime,
            dataStarvedDays: 0,
            dataCoverage: 100,
            statusLamp: s.currentAvailability >= s.slaThreshold ? 'green' : 'red'
          };
        }
        return s;
      })
    );

    return newBatch;
  };

  const generateReport = (
    type: ReportItem['type'],
    scopeName: string,
    period: string,
    format: 'PDF' | 'EXCEL' | 'BOTH'
  ): ReportItem => {
    const typeTitleMap = {
      SITE_REPORT: '单站可用度履约分析报告',
      NETWORK_MONTHLY: '全网能源站点可用度综合运营月报',
      CONTRACT_FULFILLMENT: 'SLA合同履约情况评估报告 (销售沟通专用)'
    };
    
    const formats: ('EXCEL' | 'PDF')[] = format === 'BOTH' ? ['EXCEL', 'PDF'] : [format];

    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      reportNo: `REP-${period.replace('-', '')}-${Math.floor(1000 + Math.random()*9000)}`,
      name: `${period} ${scopeName} ${typeTitleMap[type]}`,
      type,
      scopeName,
      period,
      formats,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      generator: `${currentUser.name} (${currentUser.roleTitle})`,
      fileSize: format === 'EXCEL' ? '4.8 MB' : '11.2 MB',
      downloadCount: 0
    };

    setReports(prev => [newReport, ...prev]);
    return newReport;
  };

  const addReportItem = (report: ReportItem) => {
    setReports(prev => [report, ...prev]);
  };

  const syncContracts = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' (手动触发同步完成)';
    setContracts(prev =>
      prev.map(c => ({
        ...c,
        lastSyncedAt: nowStr
      }))
    );
  };

  const sendChatMessage = (userQuery: string) => {
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userQuery
    };

    setChatMessages(prev => [...prev, userMsg]);

    // NLP intent routing simulation
    setTimeout(() => {
      let aiMsg: ChatMessage;
      const lower = userQuery.toLowerCase();

      if (lower.includes('华东') && (lower.includes('可用度') || lower.includes('月度') || lower.includes('数据'))) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '【ChatBI 查询结果】华东区 2026年8月累计可用度为 **99.54%**，高于全网平均值 (99.42%)。SLA 达标率为 **98.8%**，当前在册站点 13,450 个，其中未达标站点 32 个。',
          queryType: 'metric_card',
          dataPayload: {
            title: '华东区可用度运行态势 (2026-08)',
            metrics: [
              { label: '当期可用度', value: '99.54%', status: 'success' },
              { label: 'SLA 达标率', value: '98.8%', status: 'success' },
              { label: '总站点数', value: '13,450 站', status: 'neutral' },
              { label: '未达标站数', value: '32 站', status: 'warning' }
            ]
          }
        };
      } else if (lower.includes('预测') || lower.includes('月末') || lower.includes('跌破')) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '【时序预测分析】基于公司大数据平台现有时序模型评估：**西安高新热电联产储能调峰站** 月末预测可用度为 **99.11%** (置信度 91%)，有 **84% 概率** 跌破合同 SLA 阈值 (99.20%)；**杭州钱塘新区备电站** 预测可用度为 **99.79%**，有 **76% 概率** 跌破阈值 (99.90%)。建议提前安排辅机巡检与防尘滤网清理。',
          queryType: 'prediction_card',
          dataPayload: {
            siteName: '西安高新热电联产储能调峰站 (NW-XA-0019)',
            currentValue: '99.24%',
            predictedValue: '99.11%',
            slaThreshold: '99.20%',
            breachProbability: '84%',
            riskLevel: 'HIGH_RISK',
            suggestions: [
              '排查逆变器驱动模块温升与电容阻抗',
              '与调度中心沟通避开高峰负荷时段例行调试',
              '核查现场备品备件库存'
            ]
          }
        };
      } else if (lower.includes('未达标') || lower.includes('排名') || lower.includes('top') || lower.includes('跌破sla')) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '【透视分析】为您提取当前全网 SLA 跌破差距最大的关键站点清单（Top 3）：',
          queryType: 'site_table',
          dataPayload: {
            sites: [
              { code: 'SZ-ESS-0042', name: '深圳光明储能电站二期-04号站', sla: '99.50%', current: '98.62%', gap: '-0.88%', lamp: 'red' },
              { code: 'GD-GZ-0089', name: '广州南沙综合能源港储能站', sla: '99.50%', current: '99.12%', gap: '-0.38%', lamp: 'red' },
              { code: 'HB-SJZ-008', name: '石家庄循环化工园区储能站', sla: '99.30%', current: '99.10%', gap: '-0.20%', lamp: 'red' }
            ]
          }
        };
      } else if (lower.includes('断供') || lower.includes('离线') || lower.includes('日志')) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '【数据断供预警统计 (R5)】全网当前共有 **78 个** 站点超过 30 天未导入新离线日志批次。其中 **北京怀柔科学城智能微电网站-03站** 已断供 36 天，当前数据覆盖率降至 62.0%，已被标记为灰色断供状态，建议运维督办催收。',
          queryType: 'metric_card',
          dataPayload: {
            title: '全网离线日志断供监控',
            metrics: [
              { label: '断供站点总数', value: '78 站', status: 'danger' },
              { label: '全局断供阈值', value: '30 天', status: 'neutral' },
              { label: '最长断供天数', value: '54 天', status: 'warning' },
              { label: '平均月导入批次', value: '628 批次', status: 'success' }
            ]
          }
        };
      } else if (lower.includes('可靠性') || lower.includes('五因子') || lower.includes('权重')) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '【管理口径五因子评分 (R1)】依据平台双层指标模型，可靠性得分由五大因子加权生成（满分100）：\n1. 历史中断频率 (权重 25%)\n2. 平均恢复时长 MTTR (权重 20%)\n3. 组网冗余度 (权重 20%)\n4. 告警密度 (权重 15%)\n5. 数据覆盖率 (权重 20%)\n如需微调权重参数，可在可靠性设置面板进行全局调整。',
          queryType: 'fallback'
        };
      } else if (lower.includes('宝武') || lower.includes('归因') || lower.includes('因果链') || lower.includes('中断原因')) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '【故障归因与因果链诊断 (Rule R11)】针对【宝武钢铁1号储能站 (SZ-ESS-0001)】深度剖析：\n• **核心事件**：8月12日 14:20~16:30 发生 2# PCS 变流器过温告警，导致该支路非计划停机，折算等效 PCS 停运时长 596 分钟。\n• **PCare 工单闭环 (R4)**：现场运维工程师于 16:30 输出备件更换与风道清洗方案，系统即时恢复可用度基准。\n• **组网与扣减**：该站为双机热备架构，扣除计划内维护 120 分钟后，当期累计可用度为 98.64% (低于 SLA 99.50%)。\n• **整改建议**：建议升级变流器散热风道并加装进风口滤网温差传感器。',
          queryType: 'pivot_analysis',
          dataPayload: {
            siteId: 'site-001',
            siteName: '宝武钢铁1号储能站',
            faultCode: 'FAULT-20260812-001',
            equivalentMins: 596,
            mttr: '2.17 小时'
          }
        };
      } else if (lower.includes('售前') || lower.includes('可行性') || lower.includes('99.6') || lower.includes('意向')) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: '【售前风控评估决策意见】针对意向华东区 20MW 工商业储能站拟承诺 99.60% SLA 的可行性评估：\n⚠️ **违约风险等级：【高风险】**\n• **历史基准数据**：华东区同类工商业微网近 12 个月平均可用度为 99.48%，P90 值为 99.62%，P95 值为 99.21%。\n• **决策建议**：拟承诺 99.60% 处于高位极限边界。若要履约达标，必须在技术协议中采用【双机热备 + 光纤环网】并明确【电网不可抗力停机除外】与【计划内维护不扣减】条款 (R2)。建议推荐签约阈值为 99.35% ~ 99.45%。',
          queryType: 'prediction_card',
          dataPayload: {
            siteName: '华东区 20MW 工商业储能拟建站',
            currentValue: '99.48% (区域均值)',
            predictedValue: '99.42% ~ 99.60%',
            slaThreshold: '99.60%',
            breachProbability: '68%',
            riskLevel: 'HIGH_RISK',
            suggestions: [
              '技术方案采用双机热备架构 (+3.5% 可用度裕量)',
              '合同中锁定计划内免责检修工时 (建议 ≥ 12 小时/月)',
              '推荐将签约 SLA 调整至 99.40%'
            ]
          }
        };
      } else {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `关于您咨询的问题：“${userQuery}”，我已检索全网 38,420 站台账及 12 个月打点库。您可以通过左侧导航进入【可用度监控】或【统计分析】进行多维钻取，也可以告诉我具体的站点名称或代表处进行秒级查数。`,
          queryType: 'fallback'
        };
      }

      setChatMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  // Fault Diagnosis handlers
  const createDiagnosisTask = (task: DiagnosisTask) => {
    setDiagnosisTasks(prev => [task, ...prev]);
    setActiveDiagnosisTaskId(task.id);
    if (task.status === 'DIAGNOSING') {
      setTimeout(() => {
        setDiagnosisTasks(prev =>
          prev.map(t => {
            if (t.id === task.id) {
              return {
                ...t,
                status: 'COMPLETED' as const,
                progress: 100,
                completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                currentStepDescription: 'AI 诊断推理与 SOP 检索匹配完成'
              };
            }
            return t;
          })
        );
      }, 2500);
    }
  };

  const giveDiagnosisFeedback = (
    taskId: string,
    isThumbsUp: boolean,
    negativeDetails?: {
      verifiedRootCause: string;
      reasonCategory: string;
      remarks: string;
      engineerName: string;
    }
  ) => {
    setDiagnosisTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && t.result) {
          return {
            ...t,
            result: {
              ...t.result,
              feedback: {
                type: isThumbsUp ? 'THUMBS_UP' : 'THUMBS_DOWN',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                userName: negativeDetails?.engineerName || currentUser.name,
                correctRootCause: negativeDetails?.verifiedRootCause,
                feedbackNotes: negativeDetails?.remarks
              }
            }
          };
        }
        return t;
      })
    );

    setFeedbackStats(prev => ({
      ...prev,
      thumbsUpCount: isThumbsUp ? prev.thumbsUpCount + 1 : prev.thumbsUpCount,
      thumbsDownCount: !isThumbsUp ? prev.thumbsDownCount + 1 : prev.thumbsDownCount
    }));
  };

  const transferDiagnosisToCase = (taskId: string, caseData: Partial<SimilarCase>) => {
    const caseNo = caseData.caseNo || `CASE-${new Date().getFullYear()}-${String(caseLibrary.length + 1).padStart(3, '0')}`;
    setDiagnosisTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && t.result) {
          return {
            ...t,
            result: {
              ...t.result,
              isTransferredToCase: true,
              transferredCaseNo: caseNo
            }
          };
        }
        return t;
      })
    );

    const newCase: SimilarCase = {
      id: `case-${Date.now()}`,
      caseNo,
      title: caseData.title || 'AI 诊断沉淀经验案例',
      siteName: caseData.siteName || '目标储能站',
      deviceModel: caseData.deviceModel || 'PCS-2500KTL / 280Ah 磷酸铁锂',
      faultCategory: caseData.faultCategory || '变流器故障',
      rootCause: caseData.rootCause || '由 AI 诊断自动沉淀',
      symptomDescription: caseData.symptomDescription || '异常特征已归档',
      resolutionSteps: caseData.resolutionSteps || '按照推荐 SOP 执行消缺',
      outcome: caseData.outcome || '消缺完成，设备并网运行正常，SLA 恢复',
      mttrMinutes: caseData.mttrMinutes || 45,
      similarityScore: 100,
      matchDimensions: caseData.matchDimensions || ['同类拓扑架构', '相同告警根因', '同型号部件'],
      source: 'TRANSFERRED',
      createdAt: new Date().toISOString().substring(0, 10),
      createdBy: currentUser.name
    };

    setCaseLibrary(prev => [newCase, ...prev]);
    setFeedbackStats(prev => ({
      ...prev,
      transferredCasesCount: prev.transferredCasesCount + 1
    }));
  };

  const transferDiagnosisToWorkOrder = (taskId: string, workOrderData: Partial<WorkOrder>) => {
    const woNo = workOrderData.orderNo || `WO-DIAG-${Date.now().toString().slice(-6)}`;
    setDiagnosisTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && t.result) {
          return {
            ...t,
            result: {
              ...t.result,
              isTransferredToWorkOrder: true,
              transferredWorkOrderNo: woNo
            }
          };
        }
        return t;
      })
    );

    const targetSite = sites.find(s => s.id === (workOrderData.siteId || selectedSiteId));
    const newWo: WorkOrder = {
      id: `wo-${Date.now()}`,
      orderNo: woNo,
      siteId: workOrderData.siteId || selectedSiteId,
      siteName: workOrderData.siteName || targetSite?.siteName || '目标储能电站',
      customer: workOrderData.customer || targetSite?.customer || '华东电力新能源',
      contractNo: workOrderData.contractNo || targetSite?.contractNo || 'CT-2024-001',
      title: workOrderData.title || 'AI 诊断现场消缺工单',
      priority: workOrderData.priority || 'URGENT',
      status: 'PROCESSING',
      faultCategory: workOrderData.faultCategory || '变流器电气系统',
      assignee: workOrderData.assignee || '现场值班工程师',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: workOrderData.description || '由 AI 故障诊断中心一键下发至 PCare 系统'
    };

    setWorkOrders(prev => [newWo, ...prev]);
    setFeedbackStats(prev => ({
      ...prev,
      transferredWorkOrdersCount: prev.transferredWorkOrdersCount + 1
    }));
  };

  const importWorkOrders = (
    newOrders: WorkOrder[],
    batchMeta?: { batchNo?: string; fileName?: string; remarks?: string; fileSize?: string }
  ) => {
    const batchNo =
      batchMeta?.batchNo ||
      `PCare-Batch-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-2)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let addedCount = 0;
    let updatedCount = 0;
    let solutionReadyCount = 0;

    setWorkOrders(prev => {
      const existingMap = new Map<string, WorkOrder>();
      prev.forEach(w => existingMap.set(w.orderNo, w));

      newOrders.forEach(incoming => {
        // 尝试自动对齐站点
        const matchedSite = sites.find(
          s =>
            s.id === incoming.siteId ||
            s.siteName === incoming.siteName ||
            (incoming.siteName && s.siteName.includes(incoming.siteName.slice(0, 4)))
        );

        const isSolutionReady = incoming.status === 'SOLUTION_READY' || incoming.status === 'CLOSED';
        if (isSolutionReady) {
          solutionReadyCount++;
        }

        const enriched: WorkOrder = {
          ...incoming,
          id: incoming.id || `wo-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          siteId: matchedSite?.id || incoming.siteId || 'site-001',
          siteName: matchedSite?.siteName || incoming.siteName || '目标储能电站',
          customer: matchedSite?.customer || incoming.customer || '电网调度单位',
          contractNo: matchedSite?.contractNo || incoming.contractNo || 'CT-SLA-DEFAULT',
          importBatchNo: batchNo,
          importedAt: nowStr,
          source: 'PCARE_IMPORT',
          rawPcareStatus:
            incoming.rawPcareStatus ||
            (incoming.status === 'SOLUTION_READY'
              ? '已输出解决方案(待执行)'
              : incoming.status === 'CLOSED'
              ? '已归档完结'
              : '现场处理中')
        };

        if (existingMap.has(incoming.orderNo)) {
          existingMap.set(incoming.orderNo, {
            ...existingMap.get(incoming.orderNo)!,
            ...enriched
          });
          updatedCount++;
        } else {
          existingMap.set(incoming.orderNo, enriched);
          addedCount++;
        }
      });

      return Array.from(existingMap.values());
    });

    const newRecord: PcareImportRecord = {
      id: `pcare-imp-${Date.now()}`,
      batchNo,
      fileName: batchMeta?.fileName || 'PCare_WorkOrders_Import.xlsx',
      fileSize: batchMeta?.fileSize || '1.18 MB',
      importTime: nowStr,
      operator: currentUser.name,
      totalParsedCount: newOrders.length,
      addedCount,
      updatedCount,
      solutionReadyCount,
      status: 'SUCCESS',
      remarks: batchMeta?.remarks || 'PCare 离线单据导入入库'
    };

    setPcareImportHistory(prev => [newRecord, ...prev]);
    setLastPcareImportTime(nowStr);

    return { addedCount, updatedCount };
  };

  const addCaseToLibrary = (newCase: SimilarCase) => {
    setCaseLibrary(prev => [newCase, ...prev]);
  };

  const addSopToLibrary = (newSop: SopItem) => {
    setSopLibrary(prev => [newSop, ...prev]);
  };

  const updateSopInLibrary = (sopId: string, updated: Partial<SopItem>) => {
    setSopLibrary(prev =>
      prev.map(s => (s.id === sopId ? { ...s, ...updated, updatedAt: new Date().toISOString().substring(0, 10) } : s))
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        selectedSiteId,
        setSelectedSiteId,
        siteDetailTab,
        setSiteDetailTab,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        openAiDrawer,
        closeAiDrawer,
        clearChatMessages,
        sites,
        alerts,
        batches,
        workOrders,
        pcareImportHistory,
        lastPcareImportTime,
        importWorkOrders,
        contracts,
        reports,
        chatMessages,
        drilldownFilter,
        setDrilldownFilter,
        navigateToSiteDetail,
        navigateToAlertsWithFilter,
        handleAlert,
        addSite,
        updateSiteRedundancy,
        importLogBatch,
        generateReport,
        addReportItem,
        sendChatMessage,
        syncContracts,
        diagnosisTasks,
        activeDiagnosisTaskId,
        setActiveDiagnosisTaskId,
        caseLibrary,
        sopLibrary,
        feedbackStats,
        createDiagnosisTask,
        giveDiagnosisFeedback,
        transferDiagnosisToCase,
        transferDiagnosisToWorkOrder,
        addCaseToLibrary,
        addSopToLibrary,
        updateSopInLibrary,
        reliabilityWeights,
        setReliabilityWeights,
        networkKpi: NETWORK_KPI,
        trend12Months: NETWORK_12_MONTHS_TREND,
        regionDistribution: REGION_DISTRIBUTION,
        dimensionTree: DIMENSION_TREE_DATA
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
