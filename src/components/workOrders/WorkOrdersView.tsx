import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Check,
  AlertTriangle,
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';

export const WorkOrdersView: React.FC = () => {
  const { workOrders, navigateToSiteDetail, networkKpi } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = workOrders.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && w.faultCategory !== categoryFilter) return false;
    if (searchTerm) {
      const match =
        w.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.assignee.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              PCare 工单系统准实时同步与闭环大盘
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              Rule R4: 方案输出即闭环
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            PCare 工单系统准实时推送故障工单数据。闭环判定：工单到达“已输出解决方案、待执行”状态即视为闭环。
          </p>
        </div>
      </div>

      {/* KPI Cards for Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs text-slate-500 font-medium">本月工单总数</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {workOrders.length * 280 + 120}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">全网各区域现场派单总计</div>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs text-emerald-700 font-semibold">已闭环工单数 (方案就绪)</span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {networkKpi.workOrderCloseRate}% 闭环率
          </div>
          <div className="text-[11px] text-slate-500 mt-1">严格执行 Rule R4 闭环判定口径</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs text-slate-500 font-medium">平均修复闭环 MTTR</span>
          <div className="text-2xl font-black text-blue-600 font-mono mt-1">
            {networkKpi.avgMttrHours} 小时
          </div>
          <div className="text-[11px] text-slate-500 mt-1">从工单创建到方案输出平均耗时</div>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-lg shadow-sm">
          <span className="text-xs text-amber-700 font-semibold">进行中待闭环工单</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {workOrders.filter(w => w.status === 'PROCESSING').length} 笔
          </div>
          <div className="text-[11px] text-slate-500 mt-1">运维工程师现场排查中</div>
        </div>
      </div>

      {/* Rule R4 Explanation Banner */}
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-700">
          <strong className="text-blue-900">工单闭环核心业务判定规则 (Rule R4)：</strong>
          工单到达“已输出解决方案、待执行”状态即视为闭环，闭环时间为该状态出现时刻，后续执行跟踪不影响可用度计算中的 MTTR 统计。所有工单通过【关联合同号】与对应能源站点进行自动对齐挂接 (R9)。
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">工单状态:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="ALL">全部状态</option>
              <option value="PROCESSING">现场处理中</option>
              <option value="SOLUTION_READY">🟢 已输出方案 (已闭环 R4)</option>
              <option value="CLOSED">已归档完结</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">故障分类:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="ALL">全部分类</option>
              <option value="变流器硬件故障">变流器硬件故障</option>
              <option value="通讯链路中断">通讯链路中断</option>
              <option value="BMS单体电压异常">BMS单体电压异常</option>
              <option value="计划内维护保障">计划内维护保障</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索工单号 / 标题 / 站点 / 指派人..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-slate-800 w-64 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        <span className="text-slate-500">
          共查询到 <strong className="text-blue-600 font-semibold">{filteredOrders.length}</strong> 条工单记录
        </span>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">工单号 / 标题</th>
              <th className="py-3 px-3">所属站点 (对齐)</th>
              <th className="py-3 px-3">关联合同号 (R9)</th>
              <th className="py-3 px-3">故障分类</th>
              <th className="py-3 px-3">指派运维人</th>
              <th className="py-3 px-3">工单状态</th>
              <th className="py-3 px-3">创建时间</th>
              <th className="py-3 px-3">闭环时间 (R4)</th>
              <th className="py-3 px-4">解决方案摘要</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map(wo => (
              <tr key={wo.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900">{wo.title}</div>
                  <div className="text-[11px] text-blue-600 font-mono">{wo.orderNo}</div>
                </td>
                <td className="py-3.5 px-3">
                  <span
                    onClick={() => navigateToSiteDetail(wo.siteId)}
                    className="font-medium text-slate-800 hover:text-blue-600 cursor-pointer"
                  >
                    {wo.siteName}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-mono text-blue-600">{wo.contractNo}</td>
                <td className="py-3.5 px-3 text-slate-700">{wo.faultCategory}</td>
                <td className="py-3.5 px-3 text-slate-700">{wo.assignee}</td>
                <td className="py-3.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      wo.status === 'SOLUTION_READY'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : wo.status === 'CLOSED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {wo.status === 'SOLUTION_READY'
                      ? '🟢 方案就绪 (已闭环)'
                      : wo.status === 'CLOSED'
                      ? '已完结归档'
                      : '🟡 现场处理中'}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                  {wo.createTime}
                </td>
                <td className="py-3.5 px-3 text-emerald-600 font-mono text-[11px] font-bold">
                  {wo.solutionTime || '-'}
                </td>
                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                  {wo.solutionSummary || '现场排查诊断中...'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => navigateToSiteDetail(wo.siteId, 2)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                  >
                    站点溯源 &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
