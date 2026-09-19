import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder } from '../../types';
import { ImportPcareModal } from './ImportPcareModal';
import { PcareImportHistoryModal } from './PcareImportHistoryModal';
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
  Calendar,
  Upload,
  Layers,
  Download,
  ShieldAlert,
  Database,
  FileSpreadsheet,
  CheckCircle,
  FileText,
  Eye,
  X
} from 'lucide-react';

export const WorkOrdersView: React.FC = () => {
  const { workOrders, navigateToSiteDetail, networkKpi, lastPcareImportTime, pcareImportHistory } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 弹窗状态
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<{ msg: string } | null>(null);

  // 查看工单详情弹窗
  const [viewingOrder, setViewingOrder] = useState<WorkOrder | null>(null);

  const filteredOrders = workOrders.filter(w => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && w.faultCategory !== categoryFilter) return false;
    if (searchTerm) {
      const match =
        w.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.importBatchNo && w.importBatchNo.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  // 处理导入成功提示
  const handleImportSuccess = (stats: { addedCount: number; updatedCount: number; batchNo: string }) => {
    setSuccessToast({
      msg: `已成功入库 PCare 离线工单台账【${stats.batchNo}】！新增 ${stats.addedCount} 笔，更新覆盖 ${stats.updatedCount} 笔。系统已自动重算关联站点 SLA 可用度。`
    });
    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  // 导出工单台账为 CSV
  const handleExportFilteredOrders = () => {
    const headers = [
      '工单编号',
      '工单标题',
      '所属站点',
      '关联合同号',
      '故障分类',
      '状态',
      '指派运维人',
      '创建时间',
      '方案就绪时间(R4闭环)',
      '导入批次',
      '解决方案摘要'
    ];

    const rows = filteredOrders.map(o => [
      `"${o.orderNo}"`,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${o.siteName}"`,
      `"${o.contractNo}"`,
      `"${o.faultCategory}"`,
      `"${o.status === 'SOLUTION_READY' ? '方案就绪(已闭环)' : o.status === 'CLOSED' ? '已归档完结' : '现场处理中'}"`,
      `"${o.assignee}"`,
      `"${o.createTime}"`,
      `"${o.solutionTime || '-'}"`,
      `"${o.importBatchNo || '初始化导入'}"`,
      `"${(o.solutionSummary || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PCare_WorkOrders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg shadow-sm flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successToast.msg}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              PCare 离线消缺工单导入与闭环台账
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              电力网段安全隔离 · 离线导入模式
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              Rule R4: 方案输出即闭环
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            因工控与电力监控网段安全合规限制，PCare 运维系统不具备外部 API 直连通道。通过定期导出 PCare 工单台账并在此批量导入，驱动全网可用度 (SLA) 扣减核算与消缺闭环跟踪。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            导入批次记录 ({pcareImportHistory.length})
          </button>

          <button
            type="button"
            onClick={handleExportFilteredOrders}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            导出当前台账
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            导入 PCare 工单报表
          </button>
        </div>
      </div>

      {/* KPI Cards for Work Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">当前在册工单总数</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-mono">
              PCare 离线单据
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {workOrders.length} <span className="text-xs font-normal text-slate-400">单</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>最近导入: </span>
            <span className="font-mono text-slate-700 font-medium">{lastPcareImportTime}</span>
          </div>
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
          <span className="text-xs text-amber-700 font-semibold">现场排查中工单</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {workOrders.filter(w => w.status === 'PROCESSING').length} 笔
          </div>
          <div className="text-[11px] text-slate-500 mt-1">待现场输出处置方案即可满足 R4 闭环</div>
        </div>
      </div>

      {/* Security & Rule R4 Explanation Banner */}
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-slate-700 space-y-1">
          <div>
            <strong className="text-blue-900">PCare 非直连与工单闭环核心业务判定规则：</strong>
          </div>
          <div className="text-slate-600">
            1. <strong>非直连模式</strong>：外部 PCare 系统部署于工控安全专网，本平台通过管理员或运维工程师定期导出标准报表后执行<strong>批量导入</strong>维护。
          </div>
          <div className="text-slate-600">
            2. <strong>Rule R4 方案输出即闭环</strong>：工单到达“已输出解决方案、待执行”状态即视为闭环，闭环时间为该状态出现时刻，后续现场施工不影响可用度计算中的 MTTR 统计。所有工单通过【关联合同号】与对应能源站点进行自动对齐挂接 (R9)。
          </div>
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
              <option value="变流器电气与散热故障">变流器电气与散热故障</option>
              <option value="通信与采集链路故障">通信与采集链路故障</option>
              <option value="BMS与电芯保护">BMS与电芯保护</option>
              <option value="液冷系统维护">液冷系统维护</option>
              <option value="辅机与暖通定检">辅机与暖通定检</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索工单号 / 标题 / 站点 / 指派人 / 批次..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-slate-800 w-72 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span>
            当前展示 <strong className="text-blue-600 font-semibold">{filteredOrders.length}</strong> 笔工单
          </span>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            + 导入新批次
          </button>
        </div>
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
              <th className="py-3 px-3">数据来源 / 批次</th>
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
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-blue-600 font-mono font-medium">{wo.orderNo}</span>
                  </div>
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
                <td className="py-3.5 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                    {wo.importBatchNo || 'PCare-Batch'}
                  </span>
                </td>
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setViewingOrder(wo)}
                      className="text-slate-600 hover:text-blue-600 text-xs font-medium"
                      title="查看工单详情"
                    >
                      详情
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => navigateToSiteDetail(wo.siteId, 2)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      站点溯源 &rarr;
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 工单详情抽屉/弹窗 */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  PCare 工单台账详情 · {viewingOrder.orderNo}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{viewingOrder.title}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] border border-blue-200">
                    导入批次: {viewingOrder.importBatchNo || '初始导入'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                    客户单位: {viewingOrder.customer}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                    合同编号: {viewingOrder.contractNo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">所属储能电站</span>
                  <span className="font-semibold text-slate-800">{viewingOrder.siteName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">故障分类</span>
                  <span className="text-slate-800 font-medium">{viewingOrder.faultCategory}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">指派运维责任人</span>
                  <span className="text-slate-800 font-medium">{viewingOrder.assignee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PCare 原单状态</span>
                  <span className="text-blue-700 font-medium">{viewingOrder.rawPcareStatus || '正常流转'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">工单创建时间</span>
                  <span className="font-mono text-slate-700">{viewingOrder.createTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">方案就绪闭环时刻 (R4)</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {viewingOrder.solutionTime || '方案排查中'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">现场故障描述：</span>
                <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                  {viewingOrder.description || '无详细描述'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">
                  处置解决方案 (Rule R4 判定依据)：
                </span>
                <p className="p-2.5 bg-emerald-50/60 rounded border border-emerald-200 text-slate-800 leading-relaxed">
                  {viewingOrder.solutionSummary || '现场排查中，待输出消缺方案。'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                本工单由 PCare 离线报表导入，受网段物理隔离保护
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const sid = viewingOrder.siteId;
                    setViewingOrder(null);
                    navigateToSiteDetail(sid, 2);
                  }}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  跳转至对应站点台账
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PCare 导入弹窗 */}
      <ImportPcareModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* PCare 导入批次历史抽屉 */}
      <PcareImportHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />
    </div>
  );
};

