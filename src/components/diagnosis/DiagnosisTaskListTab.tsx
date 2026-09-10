import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DiagnosisTask } from '../../types/faultDiagnosis';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  FileText,
  AlertTriangle,
  RotateCw,
  Layers
} from 'lucide-react';
import { NewDiagnosisWizardModal } from './NewDiagnosisWizardModal';
import { DiagnosisReportModal } from './DiagnosisReportModal';

interface DiagnosisTaskListTabProps {
  onSelectTask: (task: DiagnosisTask) => void;
  onOpenWizard: () => void;
}

export const DiagnosisTaskListTab: React.FC<DiagnosisTaskListTabProps> = ({
  onSelectTask,
  onOpenWizard
}) => {
  const { diagnosisTasks, createDiagnosisTask, generateReport, addReportItem } = useApp();

  const [searchKey, setSearchKey] = useState('');
  const [siteFilter, setSiteFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Preview report directly
  const [reportTask, setReportTask] = useState<DiagnosisTask | null>(null);

  const filteredTasks = diagnosisTasks.filter(task => {
    const matchSearch =
      task.taskNo.toLowerCase().includes(searchKey.toLowerCase()) ||
      task.siteName.toLowerCase().includes(searchKey.toLowerCase()) ||
      task.siteCode.toLowerCase().includes(searchKey.toLowerCase()) ||
      (task.result?.rootCause || '').toLowerCase().includes(searchKey.toLowerCase()) ||
      (task.eventContext?.eventTitle || '').toLowerCase().includes(searchKey.toLowerCase());

    const matchSite = siteFilter === 'ALL' || task.siteId === siteFilter;
    const matchStatus = statusFilter === 'ALL' || task.status === statusFilter;

    return matchSearch && matchSite && matchStatus;
  });

  // Unique sites from tasks
  const sitesInTasks = Array.from(
    new Map<string, { id: string; name: string }>(
      diagnosisTasks.map(t => [t.siteId, { id: t.siteId, name: t.siteName }])
    ).values()
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Banner & KPI Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">累计诊断执行任务</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {diagnosisTasks.length}
            <span className="text-xs font-normal text-slate-400 ml-1.5">次</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">多维因果模型自动化分析</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">平均单次诊断分析耗时</span>
          <div className="text-2xl font-black font-mono text-blue-600 mt-1">
            1.8
            <span className="text-xs font-normal text-slate-400 ml-1.5">秒</span>
          </div>
          <div className="text-[11px] text-blue-700 mt-0.5">大幅缩短故障识别时间窗</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">高置信度 (High) 占比</span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {(
              (diagnosisTasks.filter(t => t.result?.confidence === 'HIGH').length /
                (diagnosisTasks.length || 1)) *
              100
            ).toFixed(0)}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">具备充分的日志与遥测依据</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">有效反馈闭环率</span>
          <div className="text-2xl font-black font-mono text-indigo-600 mt-1">
            92.6%
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">点赞/点踩与转案例闭环</div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              placeholder="搜索任务单号、站点、故障事件或诊断根因关键词..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部储能站点</option>
            {sitesInTasks.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部状态</option>
            <option value="COMPLETED">诊断完成 (COMPLETED)</option>
            <option value="ANALYZING">诊断中 (ANALYZING)</option>
            <option value="FAILED">诊断失败 (FAILED)</option>
          </select>
        </div>

        <button
          onClick={onOpenWizard}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>发起 AI 故障诊断</span>
        </button>
      </div>

      {/* Task List Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">任务单号 / 诊断时间</th>
                <th className="p-3.5">目标站点 / 站码</th>
                <th className="p-3.5">关联事件 / 来源日志</th>
                <th className="p-3.5">AI 诊断判定核心根因</th>
                <th className="p-3.5">置信度</th>
                <th className="p-3.5">闭环动作</th>
                <th className="p-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(task => {
                const res = task.result;
                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-blue-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{task.taskNo}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {task.completedAt || task.createdAt}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{task.siteName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {task.siteCode}
                      </div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">
                        {task.eventContext?.eventTitle || '全工况运行巡查'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <span>{task.logCategory}</span>
                        <span>·</span>
                        <span>{task.logSourceType === 'BATCH_REF' ? '引用批次' : '手动上传'}</span>
                      </div>
                    </td>

                    <td className="p-3.5 max-w-sm">
                      {res ? (
                        <div className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                          {res.rootCause}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">正在进行因果图谱匹配...</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {res ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            res.confidence === 'HIGH'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : res.confidence === 'MEDIUM'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {res.confidencePercent}% ({res.confidence})
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {res?.isTransferredToCase && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                            已沉淀案例
                          </span>
                        )}
                        {res?.isTransferredToWorkOrder && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                            已派工单
                          </span>
                        )}
                        {res?.feedback && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              res.feedback.type === 'THUMBS_UP'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {res.feedback.type === 'THUMBS_UP' ? '👍 已认可' : '👎 已纠偏'}
                          </span>
                        )}
                        {!res?.isTransferredToCase && !res?.isTransferredToWorkOrder && !res?.feedback && (
                          <span className="text-[11px] text-slate-400">待反馈</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-0.5"
                        >
                          <span>查看详情</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {res && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setReportTask(task);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="查看报告"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">未找到符合条件的 AI 故障诊断任务</p>
          </div>
        )}
      </div>

      {/* Direct Report Preview Modal */}
      {reportTask && reportTask.result && (
        <DiagnosisReportModal
          task={reportTask}
          result={reportTask.result}
          onClose={() => setReportTask(null)}
          onSaveToReportCenter={() => {
            const newRep = generateReport(
              'SITE_REPORT',
              `${reportTask.siteName} 故障诊断`,
              reportTask.timeRange.start.slice(0, 7),
              'PDF'
            );
            newRep.name = `${reportTask.siteName} AI故障根因诊断报告 (${reportTask.taskNo})`;
            if (addReportItem) addReportItem(newRep);
          }}
        />
      )}
    </div>
  );
};
