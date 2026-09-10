import React, { useState } from 'react';
import {
  SiteHealthSummary,
  PerformanceFactor,
  OptimizationAdviceItem,
  AdviceLevel
} from '../../types/performanceEvaluation';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PerformanceReportModal } from './PerformanceReportModal';

interface EvaluationSummaryTabProps {
  siteSummary: SiteHealthSummary;
  allFactors: PerformanceFactor[];
  onExportToReportCenter: () => void;
}

export const EvaluationSummaryTab: React.FC<EvaluationSummaryTabProps> = ({
  siteSummary,
  allFactors,
  onExportToReportCenter
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const hitFactors = allFactors.filter(f => f.isHit);

  const filteredAdvices = siteSummary.adviceList.filter(a =>
    filterLevel === 'ALL' ? true : a.level === filterLevel
  );

  const criticalCount = siteSummary.adviceList.filter(a => a.level === 'CRITICAL').length;
  const normalCount = siteSummary.adviceList.filter(a => a.level === 'NORMAL').length;
  const observationCount = siteSummary.adviceList.filter(a => a.level === 'OBSERVATION').length;

  const handleExportReport = (format: 'PDF' | 'EXCEL') => {
    onExportToReportCenter();
    setExportNotice(`已成功生成《${siteSummary.siteName} 性能体检评估报告 (${format})》，并自动并入【报告生成中心】历史归档库！`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Overall Score & Assessment */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white shadow-xs">
              评估输出与建议
            </span>
            <h2 className="text-lg font-black text-slate-900">{siteSummary.siteName} · 综合性能体检</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            融合模组性能工况、CMU温度一致性、PACK级SOH衰减、SOC离散度与设备消缺台账，通过 13 类影响因子理论框架，输出分级优化指引与体检报告。
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>评估时刻: {siteSummary.evaluatedAt}</span>
            <span>·</span>
            <span>数据源: 离线日志 + CMU采集 + 核心设备台账</span>
          </div>
        </div>

        {/* Score Card */}
        <div className="flex items-center gap-5 bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
          <div className="text-center pr-4 border-r border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">系统综合体检分</span>
            <div className="text-3xl font-black text-blue-600 font-mono mt-0.5">
              {siteSummary.overallScore}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">满分 100 分</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{siteSummary.gradeLabel}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              命中影响因子：<strong className="text-rose-600 font-mono">{hitFactors.length}</strong> / 13 类
            </div>
            <div className="text-[11px] text-slate-500">
              待执行建议：<strong className="text-amber-600 font-mono">{siteSummary.adviceList.length}</strong> 项
            </div>
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono underline cursor-pointer">
            立即前往报告中心查看 →
          </span>
        </div>
      )}

      {/* Report Generation Center Integration Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>性能体检报告生成中心 (PRD 4.11 报告中心并入)</span>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            一键将当前站点的体检结论、命中影响因子追溯明细、PACK级SOH衰减预测及分级优化建议汇编成专业报告，支持 PDF / Excel 下载导出。
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
          >
            <Eye className="w-3.5 h-3.5" />
            预览体检报告
          </button>

          <button
            onClick={() => handleExportReport('PDF')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            生成并导出 PDF
          </button>

          <button
            onClick={() => handleExportReport('EXCEL')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            导出 Excel
          </button>
        </div>
      </div>

      {/* Hit Factors Traceability Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900">
              命中影响因子追溯链 ({hitFactors.length} 类因子存在异常或紧平衡)
            </h3>
          </div>
          <span className="text-xs text-slate-400">满足验收要点：评估结论可追溯到命中因子</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hitFactors.map(factor => (
            <div
              key={factor.id}
              className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                factor.status === 'CRITICAL'
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  #{factor.id} {factor.name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    factor.status === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {factor.status === 'CRITICAL' ? '严重超标' : '警戒命中'}
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">实测当前值:</span>
                <strong className="text-slate-900">{factor.currentValueDisplay}</strong>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2">
                {factor.hitReason || factor.impactAnalysis}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Graded Optimization Advice List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              分级优化建议清单 (按 紧急 / 一般 / 观察 3级分类)
            </h3>
            <span className="text-[11px] text-slate-400">
              现场运维、工程与商务履约落地实操指引
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterLevel('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterLevel === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部 ({siteSummary.adviceList.length})
            </button>
            <button
              onClick={() => setFilterLevel('CRITICAL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterLevel === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              紧急 ({criticalCount})
            </button>
            <button
              onClick={() => setFilterLevel('NORMAL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterLevel === 'NORMAL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              一般 ({normalCount})
            </button>
            <button
              onClick={() => setFilterLevel('OBSERVATION')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterLevel === 'OBSERVATION'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              观察 ({observationCount})
            </button>
          </div>
        </div>

        {/* Advice Cards */}
        <div className="space-y-3">
          {filteredAdvices.map(advice => {
            const isCrit = advice.level === 'CRITICAL';
            const isNorm = advice.level === 'NORMAL';
            return (
              <div
                key={advice.id}
                className={`p-4 rounded-xl border text-xs space-y-3 transition hover:shadow-xs ${
                  isCrit
                    ? 'bg-red-50/30 border-red-200'
                    : isNorm
                    ? 'bg-amber-50/30 border-amber-200'
                    : 'bg-blue-50/30 border-blue-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCrit
                          ? 'bg-rose-600 text-white'
                          : isNorm
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isCrit ? '紧急处置' : isNorm ? '一般优化' : '观察推进'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{advice.title}</h4>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
                    <span>关联因子: #{advice.factorId} {advice.factorName}</span>
                    <span>·</span>
                    <span className="text-amber-700 font-bold">时效: {advice.deadline}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 pl-1 leading-relaxed">
                  <strong className="text-slate-900">现状问题诊断：</strong>{advice.problemStatement}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-slate-200/80 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-800">实施行动指引：</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{advice.actionGuideline}</p>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-800">预期业务收益：</span>
                    <p className="text-emerald-700 mt-0.5 leading-relaxed">{advice.expectedBenefit}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">涉及范围: {advice.targetScope}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Modal Preview */}
      <PerformanceReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        siteSummary={siteSummary}
        allFactors={allFactors}
        onDownloadPdf={() => handleExportReport('PDF')}
        onDownloadExcel={() => handleExportReport('EXCEL')}
      />
    </div>
  );
};
