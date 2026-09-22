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
  PerformanceHistoryRecord
} from '../../types/performanceEvaluation';
import { getSitePerformanceDetailData } from '../../mock/sitePerformanceConditionData';
import { FactorLibraryConfigTab } from './FactorLibraryConfigTab';
import { ModuleWorkloadTab } from './ModuleWorkloadTab';
import { CmuThermalTab } from './CmuThermalTab';
import { PackSohTab } from './PackSohTab';
import { SocBalanceTab } from './SocBalanceTab';
import { DefectEliminationTab } from './DefectEliminationTab';
import { EvaluationSummaryTab } from './EvaluationSummaryTab';
import { LogUploadAndHistoryTab } from './LogUploadAndHistoryTab';
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
  FileText
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
  const { sites, addReportItem } = useApp();

  const currentSite = sites.find(s => s.id === siteId) || sites[0];

  // Active sub-tab state (0 - 7)
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

  // Export report to AppContext report center
  const handleExportToReportCenter = () => {
    if (addReportItem) {
      addReportItem({
        id: `rep-perf-${Date.now()}`,
        reportNo: `REP-PERF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${currentSite?.siteName || '储能站点'} 系统级性能体检与评估报告`,
        type: 'SITE_REPORT',
        scopeName: currentSite?.siteName || '储能站点',
        period: '2026-08',
        formats: ['PDF', 'EXCEL'],
        generatedAt: lastEvaluatedTime,
        generator: '储能性能评估引擎',
        fileSize: '3.4 MB',
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

  const navSubTabs = [
    { id: 0, label: '评估结论与报告', icon: FileCheck2, badge: `${hitFactorsList.length} 因子命中` },
    { id: 1, label: '日志上传与历史记录', icon: UploadCloud, badge: `${historyRecords.length} 轮评估` },
    { id: 2, label: '影响因子库维护', icon: Sliders, badge: '13类因子' },
    { id: 3, label: '模组工况评估', icon: Layers, badge: `${siteData.summary.bottleneckModuleCode} 短板` },
    { id: 4, label: 'CMU 温度分析', icon: Thermometer, badge: `ΔT ${siteData.summary.maxCmuDeltaT}℃` },
    { id: 5, label: 'PACK SOH 评估', icon: Activity, badge: `${siteData.summary.abnormalPackCount > 0 ? `${siteData.summary.abnormalPackCount}组超标` : '达标'}` },
    { id: 6, label: 'SOC 均衡支持', icon: Scale, badge: `ΔSOC ${siteData.summary.deltaSocPct}%` },
    { id: 7, label: '故障消缺复盘', icon: Wrench, badge: `${siteData.summary.pendingActionsCount} 项建议` }
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
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                {currentSite.siteCode}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
                评估版本: {activeRecord?.versionNo || 'REV-最新'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              所属区域: <strong className="text-slate-700">{currentSite.region} / {currentSite.representativeOffice}</strong> · 装机容量: <strong className="text-slate-700">{currentSite.capacityMw} MW</strong> · 客户单位: <strong className="text-slate-700">{currentSite.customer}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap">
          <button
            onClick={() => setActiveSubTab(1)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>上传运行日志</span>
          </button>

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? 'AI体检计算中...' : '重新运行体检'}</span>
          </button>

          <button
            onClick={handleExportToReportCenter}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-300" />
            <span>导出体检报告</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Score & Grade */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">综合体检得分</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                siteData.summary.grade === 'RISKY'
                  ? 'text-red-600'
                  : siteData.summary.grade === 'MEDIUM'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {siteData.summary.overallScore}
            </span>
            <span className="text-xs text-slate-500">分</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 truncate">
            {siteData.summary.gradeLabel}
          </div>
        </div>

        {/* Hit Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">影响因子命中</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {hitFactorsList.length}
            </span>
            <span className="text-xs text-slate-500">/ 13 项</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-600 truncate">
            {hitFactorsList.length > 0 ? '存在短板木桶制约' : '全因子在理想区间'}
          </div>
        </div>

        {/* Voltage Delta */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">模组最大极差 ΔV</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                siteData.summary.maxVoltageDeltaMv > 60
                  ? 'text-red-600'
                  : siteData.summary.maxVoltageDeltaMv > 30
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {siteData.summary.maxVoltageDeltaMv}
            </span>
            <span className="text-xs text-slate-500">mV</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            短板: <strong className="text-indigo-600">{siteData.summary.bottleneckModuleCode}</strong>
          </div>
        </div>

        {/* Thermal Delta */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">CMU 最大温差 ΔT</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                siteData.summary.maxCmuDeltaT > 4.0
                  ? 'text-red-600'
                  : siteData.summary.maxCmuDeltaT > 2.5
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {siteData.summary.maxCmuDeltaT}
            </span>
            <span className="text-xs text-slate-500">℃</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            最高温: {siteData.summary.maxCmuTemp}℃
          </div>
        </div>

        {/* SOH */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">PACK 最低 SOH</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                siteData.summary.minPackSoh < 90 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {siteData.summary.minPackSoh}
            </span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {siteData.summary.abnormalPackCount > 0 ? (
              <span className="text-red-600 font-medium">
                {siteData.summary.abnormalPackCount} 组 SOH 低于90%
              </span>
            ) : (
              <span className="text-emerald-600">全站达标</span>
            )}
          </div>
        </div>

        {/* RTE & SOC */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">能效与不均衡度</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-600 font-mono tracking-tight">
              {siteData.summary.rtePct}
            </span>
            <span className="text-xs text-slate-500">% RTE</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            ΔSOC: <strong className="text-slate-800">{siteData.summary.deltaSocPct}%</strong>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
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

        {activeSubTab === 1 && (
          <LogUploadAndHistoryTab
            historyRecords={historyRecords}
            activeVersionId={activeVersionId}
            onSelectVersion={handleSelectHistoryVersion}
            onUploadNewRecord={handleUploadAndEvaluate}
          />
        )}

        {activeSubTab === 2 && (
          <FactorLibraryConfigTab
            factors={factors}
            onUpdateFactors={handleUpdateFactors}
            onResetToDefault={handleResetFactors}
          />
        )}

        {activeSubTab === 3 && <ModuleWorkloadTab modules={moduleMetrics} />}

        {activeSubTab === 4 && <CmuThermalTab cmuRecords={cmuRecords} />}

        {activeSubTab === 5 && <PackSohTab packMetrics={packMetrics} />}

        {activeSubTab === 6 && <SocBalanceTab records={socRecords} />}

        {activeSubTab === 7 && <DefectEliminationTab records={defectRecords} />}
      </div>
    </div>
  );
};
