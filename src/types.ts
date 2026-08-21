export type StatusLamp = 'green' | 'yellow' | 'red' | 'grey';

export type AlertType = 'sla_breached' | 'predicted_breach' | 'data_starved';

export type AlertStatus = 'active' | 'confirmed' | 'ignored';

export type UserRole = 'admin' | 'ops' | 'sales' | 'management';

export type RedundancyLevel = 'NONE' | 'N_PLUS_1' | 'DUAL_HOT_BACKUP' | 'RING_TOPOLOGY' | 'MULTI_ACTIVE';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  domain: string;
  avatar: string;
}

export interface FactorScore {
  name: string;
  score: number; // 0-100
  weight: number; // e.g. 0.25 (sum to 1.0)
  rawValue: string;
  description: string;
}

export interface ReliabilityScore {
  totalScore: number; // 0-100
  updatedAt: string;
  factors: {
    historyInterruptionFreq: FactorScore;
    mttr: FactorScore;
    redundancy: FactorScore;
    alarmDensity: FactorScore;
    dataCoverage: FactorScore;
  };
}

export interface CoreDevice {
  id: string;
  deviceCode: string;
  deviceName: string;
  deviceType: 'PCS_INVERTER' | 'BMS_CLUSTER' | 'EMS_HOST' | 'TRANSFORMER' | 'HVAC_COOLING';
  model: string;
  status: 'NORMAL' | 'WARNING' | 'FAULT' | 'MAINTENANCE';
  isKeyDevice: boolean; // 核心设备
  installedDate: string;
  ratedPowerKw?: number;
}

export interface RawEvent {
  id: string;
  type: 'alarm' | 'workorder' | 'log';
  timestamp: string;
  title: string;
  code: string;
  durationMinutes: number;
  equivalentInterruptionMinutes: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  description: string;
}

export interface MergedFault {
  id: string;
  faultCode: string;
  siteId: string;
  siteName: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  equivalentInterruptionMinutes: number; // 等效 PCS 中断时长
  impactPercentage: number;
  rootCause: string;
  mergedEventsCount: number;
  rawEvents: RawEvent[];
}

export interface DailySnapshot {
  date: string;
  siteId: string;
  availability: number; // 0 - 100
  slaThreshold: number;
  pcsInterruptionMins: number;
  plannedMaintenanceMins: number;
  events: {
    id: string;
    type: 'alarm' | 'workorder_created' | 'workorder_resolved' | 'log_imported' | 'alert_triggered';
    title: string;
    time: string;
    level?: string;
  }[];
}

export interface Site {
  id: string;
  siteCode: string;
  siteName: string;
  region: string; // 区域 (如 华东区、华南区、西北区)
  representativeOffice: string; // 代表处 (如 上海代表处、深圳代表处、西安代表处)
  customer: string; // 客户 (如 国家电网、南方电网、三峡能源、宁德时代)
  capacityMw: number; // 装机容量 MW
  coreDeviceCount: number;
  redundancy: RedundancyLevel;
  redundancyNotes: string;
  slaThreshold: number; // 合同 SLA 阈值，例如 99.50%
  currentAvailability: number; // 当期累计可用度 %
  predictedAvailability?: number; // 预测月末可用度 %
  predictedBreachProb?: number; // 预测跌破概率 %
  statusLamp: StatusLamp; // 绿=达标, 黄=预测跌破, 红=已跌破, 灰=数据断供
  dataCoverage: number; // 数据覆盖率 %
  lastImportTime: string; // 最后导入时间
  dataStarvedDays: number; // 距今未导入天数
  starveThresholdDays: number; // 断供阈值（可配置，默认 30）
  contractId: string;
  contractNo: string;
  owner: string;
  domain: string;
  coreDevices: CoreDevice[];
  reliabilityScore: ReliabilityScore;
  mergedFaults: MergedFault[];
  dailySnapshots: DailySnapshot[];
}

export interface ImportBatch {
  id: string;
  batchNo: string;
  siteId: string;
  siteName: string;
  fileName: string;
  fileSize: string;
  importTime: string;
  periodStart: string;
  periodEnd: string;
  status: 'SUCCESS' | 'PARSING' | 'OVERRIDDEN' | 'FAILED';
  operator: string;
  equivalentInterruptionMinutes: number;
  eventsCount: number;
  isLatestWinning: boolean; // Latest-wins 参与可用度计算
  replacedBatchNo?: string;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  siteId: string;
  siteName: string;
  region: string;
  representativeOffice: string;
  customer: string;
  slaThreshold: number;
  currentValue: number;
  predictedValue?: number;
  breachProbability?: number; // 跌破概率
  dataStarvedDays?: number;
  triggerTime: string;
  status: AlertStatus;
  handler?: string;
  handleTime?: string;
  handleNote?: string;
  relatedWorkOrderNo?: string;
}

export interface WorkOrder {
  id: string;
  orderNo: string;
  title: string;
  siteId: string;
  siteName: string;
  customer: string;
  contractNo: string;
  status: 'PROCESSING' | 'SOLUTION_READY' | 'CLOSED'; // SOLUTION_READY 即视为闭环 (R4)
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  faultCategory: string;
  createTime: string;
  solutionTime?: string; // 闭环时间：到达"已输出解决方案、待执行"状态时刻
  closeTime?: string;
  assignee: string;
  description: string;
  solutionSummary?: string;
}

export interface Contract {
  id: string;
  contractNo: string;
  title: string;
  customer: string;
  evaluationPeriod: string; // 考核周期，如 "自然月度 (每月1日-月末)"
  slaThreshold: number; // 合同基准 SLA 阈值
  siteCount: number;
  fulfilledSiteCount: number;
  validFrom: string;
  validTo: string;
  penaltyClause: string; // 违约条款
  overallStatus: 'FULFILLED' | 'AT_RISK' | 'BREACHED';
  lastSyncedAt: string;
  associatedSites: {
    siteId: string;
    siteCode: string;
    siteName: string;
    siteSlaThreshold: number;
    currentAvailability: number;
    statusLamp: StatusLamp;
  }[];
  monthlyTrend: {
    month: string;
    targetSla: number;
    actualSla: number;
    isFulfilled: boolean;
  }[];
}

export interface ReportItem {
  id: string;
  reportNo: string;
  name: string;
  type: 'SITE_REPORT' | 'NETWORK_MONTHLY' | 'CONTRACT_FULFILLMENT';
  scopeName: string;
  period: string;
  formats: ('EXCEL' | 'PDF')[];
  generatedAt: string;
  generator: string;
  fileSize: string;
  downloadCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  content: string;
  queryType?: 'metric_card' | 'trend_chart' | 'site_table' | 'prediction_card' | 'fallback' | 'pivot_analysis';
  dataPayload?: any;
}
