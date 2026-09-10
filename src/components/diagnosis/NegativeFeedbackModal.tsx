import React, { useState } from 'react';
import { ThumbsDown, X, AlertCircle, Send, CheckCircle2 } from 'lucide-react';

interface NegativeFeedbackModalProps {
  taskNo: string;
  currentRootCause: string;
  onClose: () => void;
  onSubmit: (correctRootCause: string, notes: string) => void;
}

export const NegativeFeedbackModal: React.FC<NegativeFeedbackModalProps> = ({
  taskNo,
  currentRootCause,
  onClose,
  onSubmit
}) => {
  const [correctRootCause, setCorrectRootCause] = useState('');
  const [errorCategory, setErrorCategory] = useState('根因定位偏差');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctRootCause.trim()) return;

    const fullNotes = `[偏差类型: ${errorCategory}] ${notes}`;
    onSubmit(correctRootCause, fullNotes);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-200">
              <ThumbsDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-900 font-black text-base">诊断质量反馈 (点踩纠错)</div>
              <div className="text-[11px] text-slate-500 font-normal">任务编号: {taskNo} · 触发规则 R15 机制</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">反馈标注已成功提交</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              感谢您的专业校准！修正后的正确根因已存入模型调优数据集 (ADR-0005)，将在下一轮微调中持续提升诊断精准度。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
            {/* Rule R15 Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>业务规则 R15 约束：</strong>
                点赞标记为有效诊断；点踩必填现场核实的<strong>真实正确根因</strong>，作为回流大模型调优的数据闭环资产。
              </div>
            </div>

            {/* Current Diagnosis */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">当前 AI 诊断结论：</span>
              <p className="text-xs text-slate-800 font-semibold">{currentRootCause}</p>
            </div>

            {/* Error Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                偏差原因归类 <span className="text-rose-500">*</span>
              </label>
              <select
                value={errorCategory}
                onChange={e => setErrorCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="根因定位偏差">根因定位偏差 (部件定位错误)</option>
                <option value="表象误判为根因">表象误判为根因 (未穿透至本质机理)</option>
                <option value="关键特征提取遗漏">关键特征提取遗漏 (日志关键帧丢失)</option>
                <option value="工况误报">现场正常操作被误报为故障</option>
                <option value="其他原因">其他原因</option>
              </select>
            </div>

            {/* Correct Root Cause (Mandatory) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                现场核实的真实根因 <span className="text-rose-500">* (必填)</span>
              </label>
              <textarea
                value={correctRootCause}
                onChange={e => setCorrectRootCause(e.target.value)}
                placeholder="请详细描述现场实际排查确定的真实根因，例如：实际为接触器辅助触点氧化造成虚接断开，非线圈烧毁..."
                rows={3}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">补充说明与排查过程 (可选)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="可附带现场测量参数、更换部件编号或消缺耗时等..."
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!correctRootCause.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-rose-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>提交校准并回流模型库</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
