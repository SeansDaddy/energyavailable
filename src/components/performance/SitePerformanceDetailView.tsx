import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PerformanceFactor,
  ModuleMetric,
  CmuThermalRecord,
  PackSohMetric,
  SocBalanceRecord,
  DefectActionRecord,
  SiteHealthSummary,
  OptimizationAdviceItem,
  PerformanceHistoryRecord,
  AvailabilityMetricData,
  RtePerformanceData,
  UsableCapacityData,
  SohComprehensiveData,
  GridMeterRecord,
  SiteContractGuarantee,
  PerformanceCommitmentMetrics,
  TopologyNodeData
} from '../../types/performanceEvaluation';
import {
  getSitePerformanceDetailData,
  getSiteAvailabilityMetricData,
  getSiteRtePerformanceData,
  getSiteUsableCapacityData,
  getSiteSohComprehensiveData,
  getSiteGridMeterRecords,
  getSiteContractGuarantee,
  getSiteCommitmentMetrics,
  getSiteTopologyData
} from '../../mock/sitePerformanceConditionData';
import { FactorLibraryConfigTab } from './FactorLibraryConfigTab';
import { ModuleWorkloadTab } from './ModuleWorkloadTab';
import { CmuThermalTab } from './CmuThermalTab';
import { PackSohTab } from './PackSohTab';
import { SocBalanceTab } from './SocBalanceTab';
import { DefectEliminationTab } from './DefectEliminationTab';
import { EvaluationSummaryTab } from './EvaluationSummaryTab';
import { LogUploadAndHistoryTab } from './LogUploadAndHistoryTab';
import { WarrantyConditionTab } from './WarrantyConditionTab';
import { AvailabilityMetricTab } from './AvailabilityMetricTab';
import { RtePerformanceTab } from './RtePerformanceTab';
import { UsableCapacityTab } from './UsableCapacityTab';
import { SohPerformanceTab } from './SohPerformanceTab';
import { GridMeterDataEntryTab } from './GridMeterDataEntryTab';
import { SiteContractClausesTab } from './SiteContractClausesTab';
import { SiteCommitmentMetricsEntryTab } from './SiteCommitmentMetricsEntryTab';
import { SiteTopologyMonitoringTab } from './SiteTopologyMonitoringTab';
import { SiteScopedReportCenter } from '../reports/SiteScopedReportCenter';
import {
  HeartPulse,
  Sliders,
  Layers,
  Thermometer,
  Activity,
  Scale,
  Wrench,
  FileCheck2,
  RefreshCw,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Zap,
  BatteryCharging,
  FolderKanban,
  GitFork,
  FileSpreadsheet
} from 'lucide-react';

interface SitePerformanceDetailViewProps {
  siteId: string;
  onBackToList: () => void;
  onSwitchSite: (siteId: string) => void;
}

export const SitePerformanceDetailView: React.FC<SitePerformanceDetailViewProps> = ({
  siteId,
  onBackToList,
  onSwitchSite
}) => {
  const { sites, addReportItem, reportCenterItems } = useApp();

  const currentSite = sites.find(s => s.id === siteId) || sites[0];

  // Active sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<number>(0);

  // Initialize site-specific data from mock loader
  const siteData = getSitePerformanceDetailData(siteId);

  const [historyRecords, setHistoryRecords] = useState<PerformanceHistoryRecord[]>(
    siteData.historyRecords
  );
  const [activeVersionId, setActiveVersionId] = useState<string>(
    siteData.historyRecords[0]?.id || 'eval-hist-01'
  );

  const [factors, setFactors] = useState<PerformanceFactor[]>(siteData.factors);
  const [moduleMetrics, setModuleMetrics] = useState<ModuleMetric[]>(siteData.moduleMetrics);
  const [cmuRecords, setCmuRecords] = useState<CmuThermalRecord[]>(siteData.cmuRecords);
  const [packMetrics, setPackMetrics] = useState<PackSohMetric[]>(siteData.packMetrics);
  const [socRecords, setSocRecords] = useState<SocBalanceRecord[]>(siteData.socRecords);
  const [defectRecords, setDefectRecords] = useState<DefectActionRecord[]>(siteData.defectRecords);
  const [lastEvaluatedTime, setLastEvaluatedTime] = useState<string>(siteData.summary.lastEvaluatedTime);

  // 四项原有核心指标数据
  const [availabilityData, setAvailabilityData] = useState<AvailabilityMetricData>(() =>
    getSiteAvailabilityMetricData(siteId)
  );
  const [rteData, setRteData] = useState<RtePerformanceData>(() =>
    getSiteRtePerformanceData(siteId)
  );
  const [usableCapacityData, setUsableCapacityData] = useState<UsableCapacityData>(() =>
    getSiteUsableCapacityData(siteId)
  );
  const [sohComprehensiveData, setSohComprehensiveData] = useState<SohComprehensiveData>(() =>
    getSiteSohComprehensiveData(siteId)
  );

  // 新增特性数据：并网电表、合同条款、承诺指标、拓扑监控
  const [gridMeterRecords, setGridMeterRecords] = useState<GridMeterRecord[]>(() =>
    getSiteGridMeterRecords(siteId)
  );
  const [contractData, setContractData] = useState<SiteContractGuarantee>(() =>
    getSiteContractGuarantee(siteId)
  );
  const [commitmentMetrics, setCommitmentMetrics] = useState<PerformanceCommitmentMetrics>(() =>
    getSiteCommitmentMetrics(siteId)
  );
  const [topologyNodes, setTopologyNodes] = useState<TopologyNodeData[]>(() =>
    getSiteTopologyData(siteId)
  );

  // Sync state when siteId changes
  useEffect(() => {
    const freshData = getSitePerformanceDetailData(siteId);
    setHistoryRecords(freshData.historyRecords);
    setActiveVersionId(freshData.historyRecords[0]?.id || 'eval-hist-01');
    setFactors(freshData.factors);
    setModuleMetrics(freshData.moduleMetrics);
    setCmuRecords(freshData.cmuRecords);
    setPackMetrics(freshData.packMetrics);
    setSocRecords(freshData.socRecords);
    setDefectRecords(freshData.defectRecords);
    setLastEvaluatedTime(freshData.summary.lastEvaluatedTime);

    setAvailabilityData(getSiteAvailabilityMetricData(siteId));
    setRteData(getSiteRtePerformanceData(siteId));
    setUsableCapacityData(getSiteUsableCapacityData(siteId));
    setSohComprehensiveData(getSiteSohComprehensiveData(siteId));

    setGridMeterRecords(getSiteGridMeterRecords(siteId));
    setContractData(getSiteContractGuarantee(siteId));
    setCommitmentMetrics(getSiteCommitmentMetrics(siteId));
    setTopologyNodes(getSiteTopologyData(siteId));
  }, [siteId]);

  // Evaluating animation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Switch to a historical evaluation version
  const handleSelectHistoryVersion = (record: PerformanceHistoryRecord) => {
    setActiveVersionId(record.id);
    setLastEvaluatedTime(record.evaluatedAt);
    if (record.factors) {
      setFactors(record.factors);
    }
  };

  // Upload new log and generate a new evaluation version
  const handleUploadAndEvaluate = (newRecord: PerformanceHistoryRecord) => {
    setHistoryRecords(prev => [newRecord, ...prev]);
    setActiveVersionId(newRecord.id);
    setLastEvaluatedTime(newRecord.evaluatedAt);
    if (newRecord.factors) {
      setFactors(newRecord.factors);
    }
  };

  // Trigger one-click re-evaluation
  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      setLastEvaluatedTime(timeStr);
    }, 600);
  };

  // Callback to update factors
  const handleUpdateFactors = (updated: PerformanceFactor[]) => {
    setFactors(updated);
  };

  const handleResetFactors = () => {
    const fresh = getSitePerformanceDetailData(siteId);
    setFactors(fresh.factors);
  };

  // Handle Add Grid Meter Record
  const handleAddGridMeterRecord = (newRec: GridMeterRecord) => {
    setGridMeterRecords(prev => [newRec, ...prev]);
  };

  // Handle Save Commitment Metrics
  const handleSaveCommitmentMetrics = (updated: PerformanceCommitmentMetrics) => {
    setCommitmentMetrics(updated);
  };

  // Export report to AppContext report center
  const handleExportToReportCenter = () => {
    if (addReportItem) {
      addReportItem({
        id: `rep-perf-${Date.now()}`,
        reportNo: `REP-PERF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${currentSite?.siteName || '储能站点'} 系统级性能工况与SLA体检评估报告`,
        type: 'SITE_REPORT',
        scopeName: currentSite?.siteName || '储能站点',
        period: '2026-08',
        formats: ['PDF', 'EXCEL'],
        generatedAt: lastEvaluatedTime,
        generator: '专业服务性能工况评估引擎',
        fileSize: '3.6 MB',
        downloadCount: 0
      });
    }
  };

  // Dynamic calculations
  const hitFactorsList = factors.filter(f => f.isHit);
  const activeRecord = historyRecords.find(r => r.id === activeVersionId) || historyRecords[0];
  const summaryScore = siteData.summary.overallScore;

  const siteSummary: SiteHealthSummary = {
    siteId: currentSite?.id || siteId,
    siteName: currentSite?.siteName || siteData.summary.siteName,
    evaluatedAt: lastEvaluatedTime,
    overallScore: summaryScore,
    grade: siteData.summary.grade,
    gradeLabel: siteData.summary.gradeLabel,
    hitFactors: hitFactorsList,
    adviceList: siteData.adviceList,
    keyHighlights: siteData.siteHealthSummary.keyHighlights
  };

  const sitePerfReportsCount = reportCenterItems.filter(
    r => r.siteId === currentSite.id && (r.category === 'PERFORMANCE_CONDITION' || !r.category)
  ).length;

  const breachedTopologyCount = topologyNodes.filter(n => n.isSlaBreached).length;

  const navSubTabs = [
    { id: 0, label: '概览', icon: FileCheck2, badge: `${hitFactorsList.length} 因子命中` },
    { id: 1, label: '性能保障合同条款', icon: FileText, badge: `${contractData.clauses.length} 条款` },
    { id: 2, label: '性能承诺指标录入', icon: Sliders, badge: `${commitmentMetrics.version}` },
    {
      id: 3,
      label: '系统拓扑与链路SLA',
      icon: GitFork,
      badge: breachedTopologyCount > 0 ? `${breachedTopologyCount} 个低于SLA` : '全链路达标'
    },
    { id: 4, label: '并网点电表录入', icon: FileSpreadsheet, badge: `${gridMeterRecords.length} 条抄表` },
    {
      id: 5,
      label: 'SOH 衰减与超工况',
      icon: Activity,
      badge: `SOH ${sohComprehensiveData.sohConsistency.avgSohPct}% · 黄色曲线`
    },
    {
      id: 6,
      label: '可用容量 AUC',
      icon: BatteryCharging,
      badge: `${usableCapacityData.actualUsableCapacityMwh} MWh · 6要素`
    },
    {
      id: 7,
      label: 'RTE 综合能效分析',
      icon: Zap,
      badge: `${rteData.overallRtePct}% RTE · 7要素`
    },
    {
      id: 8,
      label: '可用度与故障告警关联',
      icon: ShieldCheck,
      badge: `${availabilityData.availabilityRate}% 可用度`
    },
    { id: 9, label: '模组工况评估', icon: Layers, badge: `${siteData.summary.bottleneckModuleCode} 短板` },
    { id: 10, label: 'CMU 温度分析', icon: Thermometer, badge: `ΔT ${siteData.summary.maxCmuDeltaT}℃` },
    { id: 11, label: 'SOC 均衡支持', icon: Scale, badge: `ΔSOC ${siteData.summary.deltaSocPct}%` },
    { id: 12, label: '影响因子库维护', icon: Sliders, badge: '13类因子' },
    { id: 13, label: '故障消缺复盘', icon: Wrench, badge: `${siteData.summary.pendingActionsCount} 项建议` },
    { id: 14, label: '日志上传与历史记录', icon: UploadCloud, badge: `${historyRecords.length} 轮评估` },
    { id: 15, label: '站点报告中心', icon: FolderKanban, badge: `${sitePerfReportsCount} 份归档` }
  ];

  return (
    <div className="space-y-5 p-4 max-w-[1700px] mx-auto pb-16 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-all font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            <span>返回全网性能工况列表</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-500">性能工况详情</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-bold text-slate-900">{currentSite.siteName}</span>
        </div>

        {/* Quick site switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">切换站点:</span>
          <select
            value={siteId}
            onChange={e => onSwitchSite(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
          >
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.siteName} ({s.siteCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Header Section with Site Info and Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {currentSite.siteName}
              </h1>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                {currentSite.siteCode}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  summaryScore >= 90
                    ? 'bg-emerald-100 text-emerald-800'
                    : summaryScore >= 80
                    ? 'bg-blue-100 text-blue-800'
                    : summaryScore >= 70
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {siteData.summary.gradeLabel}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
              <span>客户: <strong className="text-slate-700">{currentSite.customer || '电网及业主联合体'}</strong></span>
              <span>·</span>
              <span>额定规模: <strong className="text-slate-700">{currentSite.capacityMw || 10} MW / 20 MWh</strong></span>
              <span>·</span>
              <span>最新评估时间: <strong className="text-slate-700 font-mono">{lastEvaluatedTime}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isEvaluating ? '体检重算中...' : '一键重新评估'}</span>
          </button>
          <button
            onClick={handleExportToReportCenter}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>导出并归档报告</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navSubTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-indigo-200/60 text-indigo-800 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Tab Content Rendering */}
      <div className="bg-slate-50/50 min-h-[500px]">
        {activeSubTab === 0 && (
          <EvaluationSummaryTab
            siteSummary={siteSummary}
            allFactors={factors}
            onExportToReportCenter={handleExportToReportCenter}
          />
        )}

        {/* 2. 站点性能保障合同条款展示 (调整到第2个) */}
        {activeSubTab === 1 && (
          <SiteContractClausesTab
            contractData={contractData}
            siteName={currentSite.siteName}
          />
        )}

        {/* 3. 性能承诺指标录入与配置 (调整到第3个) */}
        {activeSubTab === 2 && (
          <SiteCommitmentMetricsEntryTab
            initialMetrics={commitmentMetrics}
            siteName={currentSite.siteName}
            onSaveMetrics={handleSaveCommitmentMetrics}
          />
        )}

        {/* 4. 拓扑结构与节点关键数据及低于SLA异常高亮 */}
        {activeSubTab === 3 && (
          <SiteTopologyMonitoringTab
            topologyNodes={topologyNodes}
            siteName={currentSite.siteName}
          />
        )}

        {/* 1. 并网点电表数据手动录入 */}
        {activeSubTab === 4 && (
          <GridMeterDataEntryTab
            records={gridMeterRecords}
            siteName={currentSite.siteName}
            onAddRecord={handleAddGridMeterRecord}
          />
        )}

        {/* 5. SOH 衰减曲线、合同曲线、黄色超工况折算曲线与工况因素数据列表 */}
        {activeSubTab === 5 && (
          <SohPerformanceTab
            sohData={sohComprehensiveData}
            siteName={currentSite.siteName}
          />
        )}

        {/* 6. 可用容量 AUC (含SOC充放电范围、充放电效率、SOC一致性、电能量统计、SOC值、历史运行工况) */}
        {activeSubTab === 6 && (
          <UsableCapacityTab
            capacityData={usableCapacityData}
            siteName={currentSite.siteName}
          />
        )}

        {/* 7. RTE 综合能效 (含充放电策略、室外环温、系统运行模式、电芯温度、各部件效率、容量一致性、高压配电盒线缆损耗) */}
        {activeSubTab === 7 && (
          <RtePerformanceTab
            rteData={rteData}
            siteName={currentSite.siteName}
          />
        )}

        {/* 可用度指标与故障关联 */}
        {activeSubTab === 8 && (
          <AvailabilityMetricTab
            availabilityData={availabilityData}
            siteName={currentSite.siteName}
          />
        )}

        {activeSubTab === 9 && (
          <ModuleWorkloadTab
            moduleMetrics={moduleMetrics}
            modules={moduleMetrics}
          />
        )}

        {activeSubTab === 10 && <CmuThermalTab cmuRecords={cmuRecords} />}

        {activeSubTab === 11 && (
          <SocBalanceTab
            socRecords={socRecords}
            records={socRecords}
          />
        )}

        {activeSubTab === 12 && (
          <FactorLibraryConfigTab
            factors={factors}
            onUpdateFactors={handleUpdateFactors}
            onResetToDefault={handleResetFactors}
          />
        )}

        {activeSubTab === 13 && (
          <DefectEliminationTab
            defectRecords={defectRecords}
            records={defectRecords}
          />
        )}

        {activeSubTab === 14 && (
          <LogUploadAndHistoryTab
            historyRecords={historyRecords}
            activeVersionId={activeVersionId}
            onSelectVersion={handleSelectHistoryVersion}
            onUploadNewRecord={handleUploadAndEvaluate}
          />
        )}

        {/* 站点报告中心 (锁定在当前站点) */}
        {activeSubTab === 15 && (
          <div className="p-1">
            <SiteScopedReportCenter
              moduleScope="PERFORMANCE"
              initialSiteId={currentSite.id}
              lockSite={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
