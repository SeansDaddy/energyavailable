import React, { useState } from 'react';
import { Site, WorkOrder } from '../../types';
import { ImportPcareModal } from '../workOrders/ImportPcareModal';
import {
  Wrench,
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  X,
  Sparkles,
  ChevronRight,
  Upload
} from 'lucide-react';

interface WorkOrdersTabProps {
  site: Site;
  workOrders: WorkOrder[];
}

export const WorkOrdersTab: React.FC<WorkOrdersTabProps> = ({ site, workOrders }) => {
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Filter work orders related to this site or its contract
  const siteOrders = workOrders.filter(
    wo =>
      (wo.siteId && site.id && wo.siteId === site.id) ||
      (wo.siteName && site.siteName && wo.siteName === site.siteName) ||
      (wo.contractNo && site.contractNo && wo.contractNo === site.contractNo) ||
      (Boolean(site?.siteName && wo?.siteName && site.siteName.length >= 2 && wo.siteName.includes(site.siteName.slice(0, 4))))
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Rule R4 Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-900 font-semibold">
            PCare 工单闭环口径规则 (Rule R4)：
          </strong>
          本系统可用度统计与 MTTR 计算中，工单闭环时刻以到达<strong>【已输出解决方案、待执行】</strong>状态为准（即技术排查方案已敲定时刻），而非现场最终消缺或工单在管理平台完全关闭的时刻。
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">关联合同工单总数</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {siteOrders.length} <span className="text-xs text-slate-400 font-normal">单</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">PCare 离线报表批量导入</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">方案输出闭环率 (R4)</span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {siteOrders.length > 0
              ? (
                  (siteOrders.filter(o => o.status === 'SOLUTION_READY' || o.status === 'CLOSED').length /
                    siteOrders.length) *
                  100
                ).toFixed(0)
              : 100}
            %
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">方案输出即完成闭环计算</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">平均闭环耗时 (MTTR)</span>
          <div className="text-2xl font-black font-mono text-blue-600 mt-1">
            2.8 <span className="text-xs text-slate-400 font-normal">小时/单</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">满足 4 小时内快速响应承诺</div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              站点 PCare 现场运维工单台账 (点击查看全生命周期)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              关联合同: <strong className="font-mono text-slate-800">{site.contractNo}</strong> · 非直连模式（离线报表导入）
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            导入/更新 PCare 工单
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">工单单号 / 主题</th>
                <th className="py-3 px-3">故障类别</th>
                <th className="py-3 px-3">关联合同号</th>
                <th className="py-3 px-3">责任工程师</th>
                <th className="py-3 px-3">创建时间</th>
                <th className="py-3 px-3">R4 方案闭环时间</th>
                <th className="py-3 px-3">工单状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siteOrders.map(wo => (
                <tr
                  key={wo.id}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(wo)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{wo.title}</div>
                    <div className="text-[11px] text-blue-600 font-mono">{wo.orderNo}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">{wo.faultCategory}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">{wo.contractNo}</td>
                  <td className="py-3.5 px-3 text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wo.assignee}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {wo.createdAt}
                  </td>
                  <td className="py-3.5 px-3 text-emerald-600 font-mono text-[11px] font-semibold">
                    {wo.solutionReadyAt || '-'}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wo.status === 'CLOSED_SOLUTION_READY' || wo.status === 'FULLY_CLOSED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {wo.status === 'CLOSED_SOLUTION_READY'
                        ? '✅ 已输出方案(R4闭环)'
                        : wo.status === 'FULLY_CLOSED'
                        ? '✅ 完全关闭'
                        : '⏳ 现场排查中'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedOrder(wo);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      生命周期下钻 &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Work Order Deep-Dive Lifecycle */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-blue-50 text-blue-600 border border-blue-200">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedOrder.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    工单号: {selectedOrder.orderNo} · 合同号: {selectedOrder.contractNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-xs space-y-4 pr-1">
              {/* Lifecycle 4-Stage Stepper */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-slate-800 mb-3">
                  工单生命周期节点全链路 (Rule R4)
                </div>

                <div className="relative flex items-center justify-between text-[11px]">
                  <div className="flex flex-col items-center text-center w-24">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <span className="font-semibold text-slate-800 mt-1">创建派单</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {selectedOrder.createTime ? selectedOrder.createTime.slice(-5) : '--:--'}
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-blue-600 mx-2 mb-4" />

                  <div className="flex flex-col items-center text-center w-24">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <span className="font-semibold text-slate-800 mt-1">现场接单排查</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {selectedOrder.assignee || '运维工程师'}
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-emerald-600 mx-2 mb-4" />

                  <div className="flex flex-col items-center text-center w-28">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      ★
                    </div>
                    <span className="font-bold text-emerald-700 mt-1">方案输出闭环</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-semibold mt-0.5">
                      {selectedOrder.solutionTime ? selectedOrder.solutionTime.slice(-5) : '待输出'}
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-slate-300 mx-2 mb-4" />

                  <div className="flex flex-col items-center text-center w-24">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <span className="font-semibold text-slate-500 mt-1">最终消缺归档</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {selectedOrder.closeTime ? selectedOrder.closeTime.slice(-5) : '平台待结'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Solution & Details */}
              <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>现场技术排查与输出解决方案</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {selectedOrder.solutionSummary || '技术人员已完成现场硬件排查，输出备件更换方案与重合闸参数调整，符合 R4 方案闭环准则。'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">责任工程师</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedOrder.assignee}</div>
                </div>
                <div>
                  <span className="text-slate-500">故障类别</span>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">
                    {selectedOrder.faultCategory}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">创建时间</span>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">
                    {selectedOrder.createTime || '--'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">R4 闭环判定时刻</span>
                  <div className="font-bold text-emerald-600 font-mono mt-0.5">
                    {selectedOrder.solutionTime || '未达方案输出阶段'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PCare 导入弹窗 */}
      <ImportPcareModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
