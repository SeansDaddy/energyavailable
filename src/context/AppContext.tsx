import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Site,
  ImportBatch,
  AlertItem,
  WorkOrder,
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
  INITIAL_CONTRACTS,
  INITIAL_REPORTS,
  INITIAL_CHAT_MESSAGES,
  NETWORK_KPI,
  NETWORK_12_MONTHS_TREND,
  REGION_DISTRIBUTION,
  DIMENSION_TREE_DATA
} from '../mock/initialData';

export type NavigationTab =
  | 'login'
  | 'workbench'
  | 'sites'
  | 'site_detail'
  | 'log_import'
  | 'availability_monitor'
  | 'alerts'
  | 'analytics'
  | 'reports'
  | 'work_orders'
  | 'contracts'
  | 'ai_assistant';

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
  siteDetailTab: number; // 0..5
  setSiteDetailTab: (idx: number) => void;
  
  // Data lists
  sites: Site[];
  alerts: AlertItem[];
  batches: ImportBatch[];
  workOrders: WorkOrder[];
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
  sendChatMessage: (content: string) => void;
  syncContracts: () => void;
  
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
  
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [batches, setBatches] = useState<ImportBatch[]>(INITIAL_BATCHES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  
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
        sites,
        alerts,
        batches,
        workOrders,
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
        sendChatMessage,
        syncContracts,
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
