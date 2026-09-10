import React from 'react';
import { SimilarCase } from '../../types/faultDiagnosis';
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  Cpu,
  Building2,
  Tag,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';

interface SimilarCaseDetailModalProps {
  caseItem: SimilarCase;
  onClose: () => void;
}

export const SimilarCaseDetailModal: React.FC<SimilarCaseDetailModalProps> = ({
  caseItem,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{caseItem.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {caseItem.caseNo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    caseItem.source === 'TRANSFERRED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {caseItem.source === 'TRANSFERRED' ? '诊断转案例沉淀' : '线下历史案例导入'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {caseItem.siteName}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  录入时间: {caseItem.createdAt}
                </span>
                <span>·</span>
                <span>录入人: {caseItem.createdBy}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Similarity matching strip if available */}
          {caseItem.similarityScore && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-blue-900">与当前诊断综合相似度: </span>
                  <span className="text-blue-700 font-bold font-mono text-sm ml-1">
                    {caseItem.similarityScore}%
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {caseItem.matchDimensions.map((dim, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-blue-700 border border-blue-200"
                  >
                    {dim}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Meta Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-400">设备型号</span>
              <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>{caseItem.deviceModel}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-400">故障分类</span>
              <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>{caseItem.faultCategory}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-400">消缺处理耗时 (MTTR)</span>
              <div className="font-bold font-mono text-indigo-600 text-sm mt-0.5 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>{caseItem.mttrMinutes} 分钟</span>
              </div>
            </div>
          </div>

          {/* Symptom */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>现场故障表象与报警信息</span>
            </h4>
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-slate-800 leading-relaxed">
              {caseItem.symptomDescription}
            </div>
          </div>

          {/* Root cause */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>最终核实故障根因</span>
            </h4>
            <div className="p-3 bg-rose-50/40 border border-rose-200 rounded-xl text-slate-900 font-medium leading-relaxed">
              {caseItem.rootCause}
            </div>
          </div>

          {/* Resolution Steps */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>实际采取的处理方案与消缺步骤</span>
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-sans">
              {caseItem.resolutionSteps}
            </div>
          </div>

          {/* Outcome */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>处理结果与跟踪验证</span>
            </h4>
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{caseItem.outcome}</span>
            </div>
          </div>

          {/* Raw Log Excerpt if available */}
          {caseItem.rawLogSnippet && (
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>关联典型原始日志特征片段</span>
              </h4>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed">
                {caseItem.rawLogSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  );
};
