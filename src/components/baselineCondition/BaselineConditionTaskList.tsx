import React, { useState, useMemo } from 'react';
import { BaselineEvaluationTaskRecord } from '../../types/baselineConditionEvaluation';
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
  RefreshCw,
  Copy
} from 'lucide-react';

interface BaselineConditionTaskListProps {
  tasks: BaselineEvaluationTaskRecord[];
  onCreateTask: () => void;
  onViewTask: (task: BaselineEvaluationTaskRecord, subTab?: 'baseline' | 'interim_eval' | 'next_year_plan') => void;
  onDeleteTask: (taskId: string) => void;
  onCloneTask?: (task: BaselineEvaluationTaskRecord) => void;
}

export const BaselineConditionTaskList: React.FC<BaselineConditionTaskListProps> = ({
  tasks,
  onCreateTask,
  onViewTask,
  onDeleteTask,
  onCloneTask
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<string>('all');
  const [taskToDelete, setTaskToDelete] = useState<BaselineEvaluationTaskRecord | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    if (total === 0) {
      return { total: 0, avgEndSoh: 0, compliantCount: 0, highRiskCount: 0, totalContractValue: 0 };
    }
    const sumSoh = tasks.reduce((acc, t) => acc + t.result.endOfWarrantyProjectedSohPct, 0);
    const avgEndSoh = Number((sumSoh / total).toFixed(1));
    const compliantCount = tasks.filter(t => t.result.isCompliant).length;
    const highRiskCount = tasks.filter(t => t.result.riskLevel === 'HIGH').length;
    const totalContractValue = Number(
      tasks.reduce((acc, t) => acc + (t.result.financialAssessment?.baseWarrantyContractTotalYuan || 0), 0).toFixed(1)
    );

    return { total, avgEndSoh, compliantCount, highRiskCount, totalContractValue };
  }, [tasks]);

  // Filtered task records
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchKeyword =
        !searchKeyword.trim() ||
        task.taskName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.taskNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.siteName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.customerName.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchRegion = selectedRegion === 'all' || task.region === selectedRegion;
      const matchRisk = selectedRisk === 'all' || task.result.riskLevel === selectedRisk;
      const matchScenario = selectedScenario === 'all' || task.input.operatingScenario === selectedScenario;

      return matchKeyword && matchRegion && matchRisk && matchScenario;
    });
  }, [tasks, searchKeyword, selectedRegion, selectedRisk, selectedScenario]);

  const confirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>基准评估任务总数</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{stats.total}</span>
            <span className="text-xs text-slate-400">个评估项目</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>覆盖全网多场景工况</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>期末平均预测 SOH</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700 font-mono">{stats.avgEndSoh}%</span>
            <span className="text-xs text-slate-500">期末均值</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            承诺底线 SOH: 68%~72%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>质保履约达标率</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono">
              {stats.total > 0 ? ((stats.compliantCount / stats.total) * 100).toFixed(0) : 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({stats.compliantCount}/{stats.total} 达标)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>裕度充足可直接签约</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>超工况高危预警</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">{stats.highRiskCount}</span>
            <span className="text-xs text-slate-400">个需加固条款</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-500">
            建议引入动态折算/免责
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>灵活性能保证合同总额</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">¥ {stats.totalContractValue}</span>
            <span className="text-xs text-slate-500">万元</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            全生命周期质保服务规模
          </div>
        </div>
      </div>

      {/* 搜索与过滤工具栏 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索任务编号、评估任务名称、站点或客户..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部区域</option>
              <option value="华南区">华南区</option>
              <option value="华东区">华东区</option>
              <option value="华北区">华北区</option>
              <option value="西北区">西北区</option>
            </select>

            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部运行场景</option>
              <option value="PEAK_VALLEY_ARBITRAGE">峰谷套利</option>
              <option value="FREQUENCY_REGULATION">独立调频</option>
              <option value="RENEWABLE_SMOOTHING">新能源平滑</option>
              <option value="MICROGRID_ISLAND">微网备电</option>
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">全部履约风险</option>
              <option value="LOW">低风险 (达标安全)</option>
              <option value="MEDIUM">中风险 (边界关注)</option>
              <option value="HIGH">高风险 (超工况跌破)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCreateTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建基准工况评估</span>
          </button>
        </div>
      </div>

      {/* 评估任务列表表格 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-600 font-medium border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-3.5">任务编号 / 评估项目名称</th>
                <th className="py-3 px-3.5">所属电站与客户</th>
                <th className="py-3 px-3.5">运行场景 / 承诺年限</th>
                <th className="py-3 px-3.5">充放工况强度 (倍率/FEC/温控)</th>
                <th className="py-3 px-3.5">期末预测 SOH / 安全裕度</th>
                <th className="py-3 px-3.5">履约风险评级</th>
                <th className="py-3 px-3.5">合同估算规模</th>
                <th className="py-3 px-3.5">评估人 / 更新时间</th>
                <th className="py-3 px-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">暂无符合条件的基准工况评估任务</p>
                    <button
                      onClick={onCreateTask}
                      className="mt-3 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium cursor-pointer"
                    >
                      立即发起第一笔评估
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isLow = task.result.riskLevel === 'LOW';
                  const isHigh = task.result.riskLevel === 'HIGH';
                  const margin = task.result.sohSafetyMarginPct;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onViewTask(task)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="font-mono text-[11px] font-bold text-slate-500">
                          {task.taskNo}
                        </div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5 line-clamp-1">
                          {task.taskName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {task.input.capacityMw} MW / {task.input.capacityMwh} MWh · {task.input.batteryChemistry}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {task.siteName}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {task.customerName}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded">
                          {task.input.operatingScenarioLabel}
                        </span>
                        <div className="text-[11px] text-slate-600 font-mono mt-1">
                          {task.input.warrantyPeriodYears} 年期 (保底 {task.input.guaranteedEndSohPct}%)
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="text-[11px] text-slate-800">
                          {task.input.nominalCrate}C · {task.input.dailyFullEquivalentCycles} FEC/日
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {task.input.coolingType === 'LIQUID_COOLING' ? '液冷' : '风冷'} · 均温 {task.input.baselineCellTempC}℃
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {task.result.endOfWarrantyProjectedSohPct}%
                          </span>
                          <span
                            className={`text-[10px] font-mono font-semibold ${
                              margin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            ({margin >= 0 ? `+${margin}%` : `${margin}%`})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          保证底线: {task.result.contractGuaranteedEndSohPct}%
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLow
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isHigh
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isLow ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isHigh ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>
                            {isLow ? '低风险 (达标)' : isHigh ? '高风险 (超工况)' : '中风险 (边界)'}
                          </span>
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-slate-900">
                          ¥ {task.result.financialAssessment.baseWarrantyContractTotalYuan} 万
                        </div>
                        <div className="text-[10px] text-slate-400">
                          单价: {task.input.warrantyPricingPerWhPerYear} 元/Wh·年
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-600">
                        <div className="text-[11px] truncate max-w-[110px]">{task.creator}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{task.updatedAt}</div>
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onViewTask(task, 'baseline')}
                            className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="查看基准工况全景评估与SOH推演曲线"
                          >
                            <Eye className="w-3 h-3" />
                            <span>基准</span>
                          </button>

                          <button
                            onClick={() => onViewTask(task, 'interim_eval')}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="在合同年结束之前，提供临时手动评估能力，基于按合同工况的年底预期SOH与年初至今实际超工况运行扣减得出评估值"
                          >
                            <Zap className="w-3 h-3 text-amber-600" />
                            <span>年底临时评估</span>
                          </button>

                          <button
                            onClick={() => onViewTask(task, 'next_year_plan')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="在年底之前计划下一年工况，基于计划工况评估下一年年底灵活性能保证SOH并联动服务报价确定计划工况"
                          >
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            <span>下年工况报价</span>
                          </button>

                          {onCloneTask && (
                            <button
                              onClick={() => onCloneTask(task)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="基于该任务克隆微调新工况"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="删除任务"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="p-2 bg-rose-50 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h4 className="text-sm font-bold text-slate-900">确认删除基准工况评估任务？</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              您确定要删除评估任务【<span className="font-semibold text-slate-900">{taskToDelete.taskName}</span>】吗？删除后此评估记录与推演数据将无法恢复。
            </p>
            <div className="mt-5 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
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
