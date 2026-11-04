import React, { useState, useMemo } from 'react';
import { AvailabilityAlarmItem } from '../../utils/equipmentAndAlarmsGenerator';
import { WorkOrder } from '../../types';
import {
  X,
  Link2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Check,
  Calendar,
  Layers,
  Wrench,
  Unlink,
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface AssociateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarm: AvailabilityAlarmItem | null;
  siteWorkOrders: WorkOrder[];
  currentAssociatedOrderNo?: string;
  onAssociate: (alarmId: string, orderNo: string) => void;
  onUnlink: (alarmId: string) => void;
}

export const AssociateWorkOrderModal: React.FC<AssociateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  alarm,
  siteWorkOrders,
  currentAssociatedOrderNo,
  onAssociate,
  onUnlink
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overlapping' | 'all'>('overlapping');

  // Compute alarm time bounds
  const { alarmStartMs, alarmEndMs, alarmStartStr, alarmEndStr } = useMemo(() => {
    if (!alarm) return { alarmStartMs: 0, alarmEndMs: 0, alarmStartStr: '', alarmEndStr: '' };
    const sStr = alarm.triggerTime || '';
    const eStr = alarm.clearTime || (alarm.triggerTime ? `${alarm.triggerTime.slice(0, 10)} 23:59:59` : '');
    
    let sMs = 0;
    let eMs = 0;
    try {
      sMs = new Date(sStr.replace(' ', 'T')).getTime();
      eMs = eStr ? new Date(eStr.replace(' ', 'T')).getTime() : sMs + (alarm.durationMinutes || 60) * 60000;
      if (isNaN(eMs) || eMs <= sMs) {
        eMs = sMs + (alarm.durationMinutes || 60) * 60000;
      }
    } catch {
      sMs = Date.now();
      eMs = sMs + 3600000;
    }
    return { alarmStartMs: sMs, alarmEndMs: eMs, alarmStartStr: sStr, alarmEndStr: eStr };
  }, [alarm]);

  // Compute overlapping work orders with overlap details
  const overlappingWorkOrders = useMemo(() => {
    if (!alarm || !siteWorkOrders) return [];

    return siteWorkOrders
      .map(wo => {
        let woStartMs = 0;
        let woEndMs = 0;
        try {
          woStartMs = new Date(wo.createTime.replace(' ', 'T')).getTime();
          const endStr = wo.closeTime || wo.solutionTime;
          if (endStr) {
            woEndMs = new Date(endStr.replace(' ', 'T')).getTime();
          } else {
            woEndMs = woStartMs + 24 * 3600 * 1000; // default 24h active window
          }
        } catch {
          woStartMs = 0;
          woEndMs = 0;
        }

        // Check time overlap: alarmStart <= woEnd && woStart <= alarmEnd
        const isOverlap = alarmStartMs <= woEndMs && woStartMs <= alarmEndMs;
        let overlapMinutes = 0;
        if (isOverlap) {
          const oStart = Math.max(alarmStartMs, woStartMs);
          const oEnd = Math.min(alarmEndMs, woEndMs);
          overlapMinutes = Math.max(0, Math.round((oEnd - oStart) / 60000));
        }

        return {
          workOrder: wo,
          isOverlap,
          overlapMinutes,
          woStartMs,
          woEndMs
        };
      })
      .filter(item => item.isOverlap)
      .sort((a, b) => b.overlapMinutes - a.overlapMinutes);
  }, [alarm, siteWorkOrders, alarmStartMs, alarmEndMs]);

  // Filtered lists for manual tab
  const filteredAllOrders = useMemo(() => {
    if (!siteWorkOrders) return [];
    if (!searchTerm) return siteWorkOrders;
    const term = searchTerm.toLowerCase();
    return siteWorkOrders.filter(
      w =>
        w.orderNo.toLowerCase().includes(term) ||
        w.title.toLowerCase().includes(term) ||
        w.assignee.toLowerCase().includes(term) ||
        w.faultCategory.toLowerCase().includes(term)
    );
  }, [siteWorkOrders, searchTerm]);

  if (!isOpen || !alarm) return null;

  const currentLinkedOrder = siteWorkOrders.find(w => w.orderNo === currentAssociatedOrderNo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Link2 className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">中断告警关联工单</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-bold">
                  时段重叠智能检测
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                根据告警发生起止时间，自动匹配并推荐时段重叠的现场闭环工单，建立告警与工单联动溯源关系
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alarm Context Profile */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {alarm.code}
              </span>
              <strong className="text-slate-900 text-sm">{alarm.title}</strong>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-semibold">
                {alarm.deviceName} ({alarm.deviceCode})
              </span>
            </div>

            {currentAssociatedOrderNo && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">当前已关联:</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                  {currentAssociatedOrderNo}
                </span>
                <button
                  onClick={() => {
                    onUnlink(alarm.id);
                  }}
                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-colors flex items-center gap-1"
                  title="解除当前关联工单"
                >
                  <Unlink className="w-3 h-3 text-rose-600" />
                  <span>解除关联</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-600 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              告警发生时段: <strong className="text-slate-800">{alarmStartStr}</strong> 至{' '}
              <strong className="text-slate-800">{alarmEndStr || '持续运行中'}</strong>
            </span>
            <span>
              持续时长: <strong className="text-slate-800">{alarm.durationMinutes} 分钟</strong>
            </span>
            <span>
              等效中断: <strong className="text-red-600">{alarm.equivalentInterruptionMinutes} 分钟</strong>
            </span>
            <span>
              可用度扣减: <strong className="text-red-600">-{alarm.availabilityImpactPercent}%</strong>
            </span>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overlapping')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === 'overlapping'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>智能推荐时段重叠工单</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'overlapping' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {overlappingWorkOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>所有现场工单清册</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {siteWorkOrders.length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索工单号/标题/负责人..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Modal Body - Work Order Candidate Cards */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'overlapping' && (
            <div className="space-y-3">
              {overlappingWorkOrders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <Info className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    在当前告警发生时段内未检测到时间重叠的工单
                  </p>
                  <p className="text-[11px] text-slate-400">
                    您可以切换到「所有现场工单清册」Tab 进行手动关联，或前往工单中心新建对应消缺工单。
                  </p>
                  <button
                    onClick={() => setActiveTab('all')}
                    className="mt-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <span>查看全站工单</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      算法检测到 <strong>{overlappingWorkOrders.length}</strong> 个现场工单的执行时段与该告警重叠，按时间重叠紧密程度推荐如下：
                    </span>
                  </div>

                  {overlappingWorkOrders.map(({ workOrder: wo, overlapMinutes }) => {
                    const isSelected = currentAssociatedOrderNo === wo.orderNo;
                    return (
                      <div
                        key={wo.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                                {wo.orderNo}
                              </span>
                              <strong className="text-slate-900 text-sm">{wo.title}</strong>
                              
                              {/* Priority badge */}
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                  wo.priority === 'URGENT'
                                    ? 'bg-red-100 text-red-800'
                                    : wo.priority === 'HIGH'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {wo.priority === 'URGENT' ? '紧急工单' : wo.priority === 'HIGH' ? '高优先级' : '中优先级'}
                              </span>

                              {/* Status badge */}
                              <span
                                className={`px-2 py-0.2 rounded text-[10px] font-semibold ${
                                  wo.status === 'CLOSED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : wo.status === 'SOLUTION_READY'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {wo.status === 'CLOSED' ? '已闭环归档' : wo.status === 'SOLUTION_READY' ? '方案就绪闭环' : '现场处理中'}
                              </span>

                              {/* Overlap tag */}
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>时段重叠 {overlapMinutes} 分钟</span>
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-1">{wo.description}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono">
                              <span>消缺类别: <strong className="text-slate-700">{wo.faultCategory}</strong></span>
                              <span>
                                工单时段: {wo.createTime} 至 {wo.closeTime || wo.solutionTime || '处理中'}
                              </span>
                              <span>现场负责人: <strong className="text-slate-700">{wo.assignee}</strong></span>
                              {wo.isEcoExempt && (
                                <span className="text-cyan-700 font-sans font-bold">
                                  [已配置 ECO 外因免责: {wo.ecoExemptMins}min]
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="shrink-0">
                            {isSelected ? (
                              <button
                                disabled
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-default"
                              >
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>当前已关联</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  onAssociate(alarm.id, wo.orderNo);
                                }}
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                <span>确认关联此工单</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="space-y-3">
              {filteredAllOrders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                  没有找到匹配的工单记录
                </div>
              ) : (
                filteredAllOrders.map(wo => {
                  const isSelected = currentAssociatedOrderNo === wo.orderNo;
                  return (
                    <div
                      key={wo.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                              {wo.orderNo}
                            </span>
                            <strong className="text-slate-900 text-xs">{wo.title}</strong>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {wo.faultCategory}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              {wo.status === 'CLOSED' ? '已闭环' : '处理中'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex flex-wrap items-center gap-x-4">
                            <span>创建: {wo.createTime}</span>
                            <span>负责人: {wo.assignee}</span>
                          </div>
                        </div>

                        <div>
                          {isSelected ? (
                            <button
                              disabled
                              className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-default"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>已关联</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                onAssociate(alarm.id, wo.orderNo);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span>关联该工单</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>关联工单后，可在告警清册与工单详情中实现双向穿透与故障处置复盘</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
