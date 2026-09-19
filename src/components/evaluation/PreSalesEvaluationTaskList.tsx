import React, { useState, useMemo } from 'react';
import { EvaluationTaskRecord } from '../../types/preSalesEvaluation';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  Building,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Zap,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  User,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

interface PreSalesEvaluationTaskListProps {
  tasks: EvaluationTaskRecord[];
  onCreateTask: () => void;
  onViewTask: (task: EvaluationTaskRecord) => void;
  onDeleteTask: (taskId: string) => void;
}

export const PreSalesEvaluationTaskList: React.FC<PreSalesEvaluationTaskListProps> = ({
  tasks,
  onCreateTask,
  onViewTask,
  onDeleteTask
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [taskToDelete, setTaskToDelete] = useState<EvaluationTaskRecord | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return { total: 0, avgAvailability: 0, compliantCount: 0, highRiskCount: 0, totalExposure: 0 };
    }
    const sumAvail = tasks.reduce((acc, t) => acc + t.resultSnapshot.expectedAvailability, 0);
    const avgAvailability = Number((sumAvail / total).toFixed(2));
    const highRiskCount = tasks.filter(t => t.resultSnapshot.riskLevel === 'HIGH').length;
    const compliantCount = tasks.filter(t => t.resultSnapshot.riskLevel === 'LOW').length;
    const totalExposure = Number(
      tasks.reduce((acc, t) => acc + (t.resultSnapshot.financialRisk?.totalAnnualFinancialExposure || 0), 0).toFixed(1)
    );

    return { total, avgAvailability, compliantCount, highRiskCount, totalExposure };
  }, [tasks]);

  // Filtered task records
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchKeyword =
        !searchKeyword.trim() ||
        task.taskName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.siteName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.customerName.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchRegion = selectedRegion === 'all' || task.region === selectedRegion;
      const matchRisk = selectedRisk === 'all' || task.resultSnapshot.riskLevel === selectedRisk;

      return matchKeyword && matchRegion && matchRisk;
    });
  }, [tasks, searchKeyword, selectedRegion, selectedRisk]);

  const confirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 售前决策与履约护航
            </span>
            <span className="text-xs text-slate-400">Rule R1 / R2' 科学加权引擎</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            售前可用度评估任务
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            签约前基于站点设备清单、组网冗余拓扑、气象环境、电价峰谷套利模型与同区域历史样本，量化推演预期可用度与违约经济风险，输出科学的 SLA 承诺建议清单。
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onCreateTask}
            id="btn-create-evaluation-task"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-400/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>创建可用度评估任务</span>
          </button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>累计评估任务</span>
            <FileCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">当前用户历史评测库</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>平均测算可用度</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{stats.avgAvailability || '--'}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">区域样本修正均值</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>安全履约项目</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-700">{stats.compliantCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">拟签约 SLA ≤ 99.35%</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>高风险预警拦截</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{stats.highRiskCount}</div>
          <div className="text-[11px] text-rose-500/80 mt-0.5">拟约 &gt; 99.55% 红色高危</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>年化综合经济敞口</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">¥{stats.totalExposure}万</div>
          <div className="text-[11px] text-slate-400 mt-0.5">停机折损 + 违约赔付</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 w-full">
          {/* Keyword search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索任务编号、评估任务名、站点名或客户名称..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Region filter */}
          <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-600">
            <span className="hidden sm:inline text-slate-500 font-medium">区域:</span>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="all">全部区域</option>
              <option value="华东区">华东区</option>
              <option value="华北区">华北区</option>
              <option value="西北区">西北区</option>
              <option value="华南区">华南区</option>
              <option value="西南区">西南区</option>
            </select>
          </div>

          {/* Risk filter */}
          <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-600">
            <span className="hidden sm:inline text-slate-500 font-medium">风险等级:</span>
            <select
              value={selectedRisk}
              onChange={e => setSelectedRisk(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="all">全部风险</option>
              <option value="LOW">低风险 (安全)</option>
              <option value="MEDIUM">中风险 (需防范)</option>
              <option value="HIGH">高风险 (极高赔付)</option>
            </select>
          </div>
        </div>

        {/* Total found info */}
        <div className="text-xs text-slate-400 shrink-0 font-medium">
          共找到 <span className="text-slate-700 font-bold">{filteredTasks.length}</span> 条评估任务
        </div>
      </div>

      {/* Task Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">未找到匹配的评估任务</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              当前筛选条件下暂无评估记录，您可以清空筛选条件或直接创建新的售前可用度评估任务。
            </p>
            <div className="flex items-center justify-center gap-2">
              {(searchKeyword || selectedRegion !== 'all' || selectedRisk !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setSelectedRegion('all');
                    setSelectedRisk('all');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  重置筛选条件
                </button>
              )}
              <button
                type="button"
                onClick={onCreateTask}
                className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>创建新评估任务</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold tracking-wider">
                  <th className="py-3 px-4">评估任务 / 编号</th>
                  <th className="py-3 px-3">意向站点与客户</th>
                  <th className="py-3 px-3">装机规模</th>
                  <th className="py-3 px-3 text-center">拟签约 SLA vs 预期</th>
                  <th className="py-3 px-3 text-center">建议签约区间</th>
                  <th className="py-3 px-3 text-center">违约风险等级</th>
                  <th className="py-3 px-3 text-right">年化经济风险敞口</th>
                  <th className="py-3 px-3">评估时间</th>
                  <th className="py-3 px-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => {
                  const res = task.resultSnapshot;
                  const isHigh = res.riskLevel === 'HIGH';
                  const isMed = res.riskLevel === 'MEDIUM';

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => onViewTask(task)}
                    >
                      {/* Task ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {task.taskName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] text-slate-500 font-medium">
                            {task.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {task.inputSnapshot.redundancy}
                          </span>
                        </div>
                      </td>

                      {/* Site & Customer */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">{task.siteName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{task.customerName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-blue-600 font-medium">{task.region}</span>
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{task.capacityMw} MW</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">{task.capacityMwh} MWh</span>
                      </td>

                      {/* Proposed SLA vs Expected */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {task.proposedSla}%
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          测算: <strong className="text-blue-700">{res.expectedAvailability}%</strong>
                        </div>
                      </td>

                      {/* Recommended Interval */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 text-[11px]">
                          [{res.recommendedSlaMin}%, {res.recommendedSlaMax}%]
                        </span>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {isHigh ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> 高风险
                          </span>
                        ) : isMed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> 中风险
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 低风险 (安全)
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          违约概率: {res.breachProbability}%
                        </div>
                      </td>

                      {/* Financial Risk Exposure */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          ¥{res.financialRisk?.totalAnnualFinancialExposure || 0} 万元/年
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          停机损 ¥{res.financialRisk?.annualOutageArbitrageLoss || 0}万
                        </div>
                      </td>

                      {/* Evaluated At & Creator */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-slate-700 font-medium">{task.evaluatedAt}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{task.creatorName}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewTask(task)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100/60 rounded-md transition-colors cursor-pointer"
                            title="查看本次评估详情与报告"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100/60 rounded-md transition-colors cursor-pointer"
                            title="删除评估记录"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">确认删除该评估任务？</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              您即将删除评估任务：
              <strong className="text-slate-900 block mt-1">【{taskToDelete.taskName}】({taskToDelete.id})</strong>
              包含该站点的所有拓扑快照、气象参数、电价模型及推演报告，删除后无法恢复。
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
