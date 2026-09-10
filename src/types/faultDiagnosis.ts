export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type DiagnosisTaskStatus = 'PENDING' | 'DIAGNOSING' | 'COMPLETED' | 'FAILED';

export type LogSourceType = 'BATCH_REF' | 'MANUAL_UPLOAD';

export type LogCategory = 'ALL' | 'BMS' | 'PCS' | 'EMS' | 'HVAC' | 'FIRE_ELECTRIC';

export interface DiagnosisEvidenceLog {
  timestamp: string;
  level: 'FATAL' | 'ERROR' | 'WARN' | 'INFO';
  component: string;
  message: string;
  highlight?: boolean;
}

export interface DiagnosisEvidenceFeature {
  name: string;
  value: string;
  baseline: string;
  status: 'ANOMALOUS' | 'WARNING' | 'NORMAL';
  significance: string;
}

export interface SopStep {
  stepNumber: number;
  title: string;
  description: string;
  keyParams?: string;
  safetyWarning?: string;
}

export interface SopItem {
  id: string;
  sopCode: string;
  title: string;
  equipmentCategory: string; // e.g. 'PCS 变流器', 'BMS 电池簇', '液冷温控系统', 'EMS 通信系统'
  faultCategory: string; // e.g. '过温过热', '采样断线', '绝缘阻抗低', '电压极差'
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  matchScore?: number; // 匹配度 0-100
  recommendReason?: string;
  estimatedDuration: string;
  requiredTools: string[];
  requiredParts: string[];
  riskWarnings: string[];
  steps: SopStep[];
  author: string;
  updatedAt: string;
  changeLog?: string;
}

export interface SimilarCase {
  id: string;
  caseNo: string;
  title: string;
  siteName: string;
  deviceModel: string;
  faultCategory: string;
  rootCause: string;
  symptomDescription: string;
  resolutionSteps: string;
  outcome: string;
  mttrMinutes: number;
  similarityScore: number; // 0-100
  matchDimensions: string[];
  source: 'TRANSFERRED' | 'HISTORICAL_IMPORT';
  createdAt: string;
  createdBy: string;
  rawLogSnippet?: string;
}

export interface DiagnosisResult {
  id: string;
  taskId: string;
  rootCause: string;
  rootCauseDetail: string;
  ruleOrModelPath: string;
  confidence: ConfidenceLevel;
  confidencePercent: number;
  affectedScope: {
    deviceName: string;
    moduleName?: string;
    packName?: string;
    details?: string;
  }[];
  availabilityImpact: {
    estimatedInterruptionMins: number;
    availabilityLossPercent: number;
    slaImpactDescription: string;
  };
  evidenceLogs: DiagnosisEvidenceLog[];
  evidenceFeatures: DiagnosisEvidenceFeature[];
  reasoningChain: string[];
  recommendedSops: SopItem[];
  similarCases: SimilarCase[];
  feedback?: {
    type: 'THUMBS_UP' | 'THUMBS_DOWN';
    timestamp: string;
    userName: string;
    correctRootCause?: string;
    feedbackNotes?: string;
  };
  isTransferredToCase?: boolean;
  transferredCaseNo?: string;
  isTransferredToWorkOrder?: boolean;
  transferredWorkOrderNo?: string;
  reportExportCount?: number;
}

export interface DiagnosisTask {
  id: string;
  taskNo: string;
  siteId: string;
  siteName: string;
  siteCode: string;
  eventContext?: {
    eventId: string;
    eventTitle: string;
    eventType: 'alarm' | 'fault' | 'availability_alert' | 'manual';
    eventTime: string;
    severity?: string;
    description?: string;
  };
  logSourceType: LogSourceType;
  logBatchNo?: string;
  uploadedFileName?: string;
  uploadedFileSize?: string;
  logCategory: LogCategory;
  timeRange: {
    start: string;
    end: string;
  };
  status: DiagnosisTaskStatus;
  progress: number;
  currentStepDescription?: string;
  createdAt: string;
  completedAt?: string;
  creator: string;
  result?: DiagnosisResult;
}

export interface DiagnosisFeedbackStats {
  totalDiagnoses: number;
  thumbsUpCount: number;
  thumbsDownCount: number;
  transferredCasesCount: number;
  transferredWorkOrdersCount: number;
  avgMttrReductionMinutes: number;
}
