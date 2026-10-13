// 报告中心 (Report Center) - 按照站点维度管理的统一报告档案模型定义

export type ReportCategory =
  | 'FLEXIBLE_WARRANTY' // 灵活质保SOH评估报告
  | 'PERFORMANCE_CONDITION' // 性能工况月度体检报告
  | 'AVAILABILITY_SLA' // 可用度监控与SLA履约结算报告
  | 'FAULT_DIAGNOSIS' // 核心设备异常与AI根因诊断报告
  | 'PRE_CONTRACT_EVAL'; // 售前可用度签约前风控评估报告

export type ReportStatus = 'VALID' | 'ARCHIVED' | 'APPROVED' | 'DRAFT';

export interface ReportKpiMetric {
  label: string;
  value: string;
  unit?: string;
  benchmark?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export interface ReportCenterItem {
  id: string;
  reportNo: string;
  title: string;
  category: ReportCategory;
  categoryName: string;
  siteId: string; // 'ALL' 代表全网汇总，或特定站点ID如 'site-001'
  siteCode: string;
  siteName: string;
  region: string;
  period: string; // 统计周期，如 "2026-08 (自然月)", "2026年度累计"
  format: 'PDF' | 'EXCEL' | 'BOTH';
  fileSize: string;
  createdTime: string;
  author: string;
  downloadCount: number;
  status: ReportStatus;
  version: string; // e.g. "v1.0", "v2.1"
  summary: string;
  kpis: ReportKpiMetric[];
  diagnostics?: string[];
  recommendations?: string[];
  approvalDept?: string;
  approvalSigner?: string;
  approvalTime?: string;
  rawSnapshotData?: {
    sohEstimated?: number;
    sohBaseline?: number;
    sohDelta?: number;
    agingAcceleratedPct?: number;
    overConditionDays?: number;
    totalThroughputMwh?: number;
    equivalentCyclesEfc?: number;
    avgTemp?: number;
    maxCrate?: number;
  };
}

export interface SiteReportSummary {
  siteId: string;
  siteCode: string;
  siteName: string;
  region: string;
  capacityMw: number;
  statusLamp: 'green' | 'yellow' | 'red' | 'gray';
  totalReports: number;
  flexibleWarrantyReports: number;
  performanceReports: number;
  slaReports: number;
  latestReportDate: string;
  latestReportTitle: string;
  latestSoh?: number;
  latestAvailability?: number;
}
