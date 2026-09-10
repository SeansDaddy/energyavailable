import React from 'react';
import {
  PerformanceFactor,
  OptimizationAdviceItem,
  SiteHealthSummary
} from '../../types/performanceEvaluation';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Activity,
  Layers,
  Thermometer,
  Scale,
  Wrench,
  Sparkles
} from 'lucide-react';

interface PerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSummary: SiteHealthSummary;
  allFactors: PerformanceFactor[];
  onDownloadExcel?: () => void;
  onDownloadPdf?: () => void;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  isOpen,
  onClose,
  siteSummary,
  allFactors,
  onDownloadExcel,
  onDownloadPdf
}) => {
  if (!isOpen) return null;

  const hitFactors = allFactors.filter(f => f.isHit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#0a192f] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                储能站点系统级性能体检报告 (性能评估分析)
              </h2>
              <div className="text-[10px] text-blue-300 font-mono">
                REPORT NO: ESS-PERF-{siteSummary.siteId.toUpperCase()}-202608 | 生成时间: {siteSummary.evaluatedAt}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onDownloadPdf || (() => window.print())}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              导出 PDF 报告
            </button>
            <button
              onClick={onDownloadExcel}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              导出 Excel 明细
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Printable Document Flow */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 bg-[#f8fafc]">
          {/* Executive Overview Header */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">
                  电站系统级性能体检与健康画像
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{siteSummary.siteName}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">系统综合体检得分</div>
                  <div className="text-2xl font-black text-blue-600 font-mono">
                    {siteSummary.overallScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold text-xs">
                  {siteSummary.gradeLabel}
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 text-xs">核心评估结论摘要：</span>
              <ul className="space-y-1 text-slate-600 text-[11px] pl-3 list-disc">
                {siteSummary.keyHighlights.map((k, i) => (
                  <li key={i} className="leading-relaxed">{k}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 1: 13 Factors Hit Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>性能影响因子框架与命中因子归因 ({hitFactors.length} 项触发优化)</span>
              </h4>
              <span className="text-[11px] text-slate-400">总计配置 13 类因子</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">影响因素</th>
                    <th className="py-2 px-2">权重</th>
                    <th className="py-2 px-3">实测值与阈值</th>
                    <th className="py-2 px-3">命中归因机理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hitFactors.map(f => (
                    <tr key={f.id} className="bg-amber-50/20">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        #{f.id} {f.name}
                      </td>
                      <td className="py-2.5 px-2 font-mono">{f.weight}%</td>
                      <td className="py-2.5 px-3 font-mono">
                        <strong className="text-rose-600">{f.currentValueDisplay}</strong>
                        <span className="text-slate-400 text-[10px] block">基准: {f.idealRange}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {f.hitReason || f.impactAnalysis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Graded Actionable Advices */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>分级优化建议书 (紧急 / 一般 / 观察)</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                共 {siteSummary.adviceList.length} 条实施路径
              </span>
            </div>

            <div className="space-y-3">
              {siteSummary.adviceList.map(item => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    item.level === 'CRITICAL'
                      ? 'bg-red-50/40 border-red-200'
                      : item.level === 'NORMAL'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-blue-50/40 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.level === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : item.level === 'NORMAL'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {item.level === 'CRITICAL' ? '紧急处置' : item.level === 'NORMAL' ? '一般优化' : '长期观察'}
                      </span>
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">时限: {item.deadline}</span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed pl-1">
                    <strong>现状诊断：</strong>{item.problemStatement}
                  </p>

                  <div className="p-2.5 bg-white/80 rounded border border-slate-200/60 text-[11px] space-y-1">
                    <div><strong>优化行动指引：</strong>{item.actionGuideline}</div>
                    <div className="text-emerald-700"><strong>预期效益：</strong>{item.expectedBenefit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signoff / Disclaimer */}
          <div className="p-4 bg-slate-100 rounded-lg text-[10px] text-slate-500 space-y-1">
            <div>* 评估口径说明：本报告评估数据严格基于离线日志分析、CMU温度探针与电站设备台账，口径独立于合同可用度SLA统计，旨在支撑专业运维消缺与技术改进。</div>
            <div>* 报告归档：本报告已同步归档至储能作战平台【报告生成中心】，支持各区域运维经理与售前团队调用。</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">储能专业服务作战平台 · 性能体检引擎</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
};
