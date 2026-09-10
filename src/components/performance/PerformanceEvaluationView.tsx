import React, { useState } from 'react';
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
import {
  INITIAL_PERFORMANCE_FACTORS,
  INITIAL_MODULE_METRICS,
  INITIAL_CMU_RECORDS,
  INITIAL_PACK_SOH_METRICS,
  INITIAL_SOC_BALANCE_RECORDS,
  INITIAL_DEFECT_RECORDS,
  INITIAL_OPTIMIZATION_ADVICES,
  INITIAL_SITE_HEALTH_SUMMARY,
  INITIAL_PERFORMANCE_HISTORY
} from '../../mock/performanceEvaluationData';
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
  FileSpreadsheet,
  UploadCloud,
  History
} from 'lucide-react';

export const PerformanceEvaluationView: React.FC = () => {
  const { sites, addReportItem } = useApp();

  // Selected site state
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || 'site-001');
  const currentSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  // Active sub-tab state (0 - 7)
  const [activeSubTab, setActiveSubTab] = useState<number>(0);

  // Performance history records state
  const [historyRecords, setHistoryRecords] = useState<PerformanceHistoryRecord[]>(
    INITIAL_PERFORMANCE_HISTORY
  );
  const [activeVersionId, setActiveVersionId] = useState<string>(
    INITIAL_PERFORMANCE_HISTORY[0]?.id || 'eval-hist-01'
  );

  // Performance active data state
  const [factors, setFactors] = useState<PerformanceFactor[]>(INITIAL_PERFORMANCE_FACTORS);
  const [moduleMetrics, setModuleMetrics] = useState<ModuleMetric[]>(INITIAL_MODULE_METRICS);
  const [cmuRecords, setCmuRecords] = useState<CmuThermalRecord[]>(INITIAL_CMU_RECORDS);
  const [packMetrics, setPackMetrics] = useState<PackSohMetric[]>(INITIAL_PACK_SOH_METRICS);
  const [socRecords, setSocRecords] = useState<SocBalanceRecord[]>(INITIAL_SOC_BALANCE_RECORDS);
  const [defectRecords, setDefectRecords] = useState<DefectActionRecord[]>(INITIAL_DEFECT_RECORDS);

  // Evaluating animation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [lastEvaluatedTime, setLastEvaluatedTime] = useState<string>('2026-08-20 16:30');

  // Switch to a historical evaluation version
  const handleSelectHistoryVersion = (record: PerformanceHistoryRecord) => {
    setActiveVersionId(record.id);
    setLastEvaluatedTime(record.evaluatedAt);
    setFactors(record.factors || INITIAL_PERFORMANCE_FACTORS);
  };

  // Upload new log and generate a new evaluation version
  const handleUploadAndEvaluate = (newRecord: PerformanceHistoryRecord) => {
    setHistoryRecords(prev => [newRecord, ...prev]);
    setActiveVersionId(newRecord.id);
    setLastEvaluatedTime(newRecord.evaluatedAt);
    setFactors(newRecord.factors || INITIAL_PERFORMANCE_FACTORS);
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
    setFactors(INITIAL_PERFORMANCE_FACTORS);
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

  // Compile dynamic site health summary
  const hitFactorsList = factors.filter(f => f.isHit);
  const activeRecord = historyRecords.find(r => r.id === activeVersionId) || historyRecords[0];
  const overallScore = activeRecord?.overallScore ?? Math.max(
    60,
    Math.round(100 - hitFactorsList.reduce((sum, f) => sum + f.weight * 0.35, 0))
  );

  const siteSummary: SiteHealthSummary = {
    siteId: currentSite?.id || 'site-001',
    siteName: currentSite?.siteName || '深圳光明储能电站二期-04号站',
    evaluatedAt: lastEvaluatedTime,
    overallScore: overallScore,
    grade: overallScore >= 90 ? 'EXCELLENT' : overallScore >= 80 ? 'GOOD' : 'MEDIUM',
    gradeLabel:
      overallScore >= 90
        ? '优良健康 (系统工况稳定)'
        : overallScore >= 80
        ? '良好 (存在局部温控与模组不均衡隐患)'
        : '亚健康 (需紧急介入消缺与均衡)',
    hitFactors: hitFactorsList,
    adviceList: INITIAL_OPTIMIZATION_ADVICES,
    keyHighlights: [
      `当前版本 [${activeRecord?.versionNo || '最新'}] 命中 ${hitFactorsList.length} 项性能影响因子：重点包括模组电压极差、电芯局部高温、温差超标及静置高SOC。`,
      '已结合因子框架输出 2 项紧急、2 项一般及 1 项观察优化行动建议。',
      '消除短板模组限制并调节液冷温控策略后，预计可释放受限放电可用度 +0.88%，综合能效 RTE 提升 +1.2%。'
    ]
  };

  const navSubTabs = [
    { id: 0, label: '评估结论与报告', icon: FileCheck2, badge: `${hitFactorsList.length} 因子命中` },
    { id: 1, label: '日志上传与历史记录', icon: UploadCloud, badge: `${historyRecords.length} 轮评估` },
    { id: 2, label: '影响因子库维护', icon: Sliders, badge: '13类因子' },
    { id: 3, label: '模组工况评估', icon: Layers, badge: 'M02-04 短板' },
    { id: 4, label: 'CMU 温度分析', icon: Thermometer, badge: 'ΔT 4.8℃' },
    { id: 5, label: 'PACK SOH 评估', icon: Activity, badge: '1 组不达标' },
    { id: 6, label: 'SOC 均衡支持', icon: Scale, badge: 'ΔSOC 6.5%' },
    { id: 7, label: '故障消缺复盘', icon: Wrench, badge: '3 项动作' }
  ];

  return (
    <div className="space-y-5 p-4 max-w-[1600px] mx-auto pb-16">
      {/* Top Header Section with Site Switcher and Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                性能评估分析
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                储能专业服务作战平台
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
                当前版本: {activeRecord?.versionNo || 'REV-最新'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              面向储能站点系统级“性能体检”：支持上传运行日志驱动评估，识别 13 类性能影响因子，输出评估结论、分级建议与历史追溯对比。
            </p>
          </div>
        </div>

        {/* Site Switcher + Evaluation Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">目标站点:</span>
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.siteName} ({s.siteCode})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveSubTab(1)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>上传日志</span>
          </button>

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-blue-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? '体检测算中...' : '重新运行性能体检'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">综合体检得分</span>
          <div className="text-xl font-black text-blue-600 font-mono mt-0.5">
            {overallScore} <span className="text-xs font-normal text-slate-400">分</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>{siteSummary.grade === 'EXCELLENT' ? '极佳' : '良好'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">命中制约因子</span>
          <div className="text-xl font-black text-rose-600 font-mono mt-0.5">
            {hitFactorsList.length} <span className="text-xs font-normal text-slate-400">/ 13 类</span>
          </div>
          <div className="text-[10px] text-rose-500 font-medium mt-0.5">短板木桶制约</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">模组最大极差</span>
          <div className="text-xl font-black text-amber-600 font-mono mt-0.5">
            68 <span className="text-xs font-normal text-slate-400">mV</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">M02-04 短板模组</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">CMU 最高温差 ΔT</span>
          <div className="text-xl font-black text-rose-600 font-mono mt-0.5">
            4.8 <span className="text-xs font-normal text-slate-400">℃</span>
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">需调整液冷风道</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">PACK 不达标数</span>
          <div className="text-xl font-black text-indigo-600 font-mono mt-0.5">
            1 <span className="text-xs font-normal text-slate-400">组 (PACK-04)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">SOH 88.4% (标准≥90%)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">历史评估版本</span>
          <div className="text-xl font-black text-slate-800 font-mono mt-0.5">
            {historyRecords.length} <span className="text-xs font-normal text-slate-400">轮记录</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">支持多版本追溯</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs flex items-center gap-1 overflow-x-auto">
        {navSubTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View Rendering */}
      <div>
        {activeSubTab === 0 && (
          <EvaluationSummaryTab
            siteSummary={siteSummary}
            allFactors={factors}
            onExportToReportCenter={handleExportToReportCenter}
          />
        )}

        {activeSubTab === 1 && (
          <LogUploadAndHistoryTab
            currentSiteId={selectedSiteId}
            currentSiteName={currentSite?.siteName || '储能站点'}
            historyRecords={historyRecords}
            activeVersionId={activeVersionId}
            onSelectVersion={handleSelectHistoryVersion}
            onUploadAndEvaluate={handleUploadAndEvaluate}
          />
        )}

        {activeSubTab === 2 && (
          <FactorLibraryConfigTab
            factors={factors}
            onUpdateFactors={handleUpdateFactors}
            onResetDefaults={handleResetFactors}
          />
        )}

        {activeSubTab === 3 && (
          <ModuleWorkloadTab moduleMetrics={moduleMetrics} />
        )}

        {activeSubTab === 4 && (
          <CmuThermalTab cmuRecords={cmuRecords} />
        )}

        {activeSubTab === 5 && (
          <PackSohTab packMetrics={packMetrics} />
        )}

        {activeSubTab === 6 && (
          <SocBalanceTab socRecords={socRecords} />
        )}

        {activeSubTab === 7 && (
          <DefectEliminationTab defectRecords={defectRecords} />
        )}
      </div>
    </div>
  );
};
