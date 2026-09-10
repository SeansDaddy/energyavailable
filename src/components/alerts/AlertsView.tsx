import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertItem, AlertType, AlertStatus } from '../../types';
import { AlertTypeBadge } from '../common/StatusBadge';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sliders,
  Filter,
  Search,
  Check,
  X,
  Settings2,
  FileSpreadsheet,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { NewDiagnosisWizardModal } from '../diagnosis/NewDiagnosisWizardModal';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    handleAlert,
    navigateToSiteDetail,
    currentUser,
    createDiagnosisTask,
    setActiveDiagnosisTaskId,
    setActiveTab
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Diagnosis Modal from Alert Context
  const [diagnosisAlert, setDiagnosisAlert] = useState<AlertItem | null>(null);

  // Handle modal
  const [selectedAlertForHandle, setSelectedAlertForHandle] = useState<AlertItem | null>(null);
  const [handleAction, setHandleAction] = useState<'confirmed' | 'ignored'>('confirmed');
  const [handleNote, setHandleNote] = useState('');

  // Config modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [globalStarveThreshold, setGlobalStarveThreshold] = useState(30);

  const filteredAlerts = alerts.filter(a => {
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (searchTerm) {
      const match =
        a.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.representativeOffice.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleOpenProcessModal = (alert: AlertItem, action: 'confirmed' | 'ignored') => {
    setSelectedAlertForHandle(alert);
    setHandleAction(action);
    setHandleNote(
      action === 'confirmed'
        ? '已核实异常影响，已通知对应区域运维主管加急跟进处理。'
        : '经核实为上游电网计划内检修操作，不计入可用度考核违约，予以忽略。'
    );
  };

  const handleConfirmProcess = () => {
    if (selectedAlertForHandle) {
      handleAlert(selectedAlertForHandle.id, handleAction, handleNote);
      setSelectedAlertForHandle(null);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              预警中心 (三类预警闭环治理)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
              Rule R6 & R8: 处理留痕不复推
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            提供【已跌破 SLA】、【预测将跌破】及【数据断供】三类预警，强化风险前置预控。确认或忽略后留痕存档并不再重复推送。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Settings2 className="w-4 h-4 text-blue-600" />
            <span>断供阈值与推送配置</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => {
            setTypeFilter('sla_breached');
            setStatusFilter('active');
          }}
          className="bg-white border border-red-200 hover:border-red-400 p-4 rounded-lg cursor-pointer transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-red-700 mb-1">
            <span>已跌破 SLA 预警</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {alerts.filter(a => a.type === 'sla_breached' && a.status === 'active').length}
            <span className="text-xs text-slate-500 font-normal ml-2">件待处理</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">当前累计可用度已低于合同约定红线</p>
        </div>

        <div
          onClick={() => {
            setTypeFilter('predicted_breach');
            setStatusFilter('active');
          }}
          className="bg-white border border-amber-200 hover:border-amber-400 p-4 rounded-lg cursor-pointer transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 mb-1">
            <span>预测将跌破预警 (AI时序模型)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {alerts.filter(a => a.type === 'predicted_breach' && a.status === 'active').length}
            <span className="text-xs text-slate-500 font-normal ml-2">件待防范</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">提前 1~2 周预警，输出预测值与跌破概率</p>
        </div>

        <div
          onClick={() => {
            setTypeFilter('data_starved');
            setStatusFilter('active');
          }}
          className="bg-white border border-slate-200 hover:border-slate-400 p-4 rounded-lg cursor-pointer transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>数据断供预警 (Rule R5)</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {alerts.filter(a => a.type === 'data_starved' && a.status === 'active').length}
            <span className="text-xs text-slate-500 font-normal ml-2">站超期未传</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">超过设定阈值 ({globalStarveThreshold}天) 未导入新离线日志</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">预警类型:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">全部预警类型</option>
              <option value="sla_breached">已跌破 SLA</option>
              <option value="predicted_breach">预测将跌破</option>
              <option value="data_starved">数据断供</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">处理状态:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">全部状态 (含历史留痕)</option>
              <option value="active">待处理 (活跃)</option>
              <option value="confirmed">已确认 (留痕存档)</option>
              <option value="ignored">已忽略 (留痕存档)</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索站点 / 客户 / 代表处..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-slate-800 w-56 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <span className="text-slate-500">
          共查询到 <strong className="text-blue-600 font-semibold">{filteredAlerts.length}</strong> 条预警记录
        </span>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">预警类型</th>
              <th className="py-3 px-3">涉及站点名称 / 区域</th>
              <th className="py-3 px-3">客户</th>
              <th className="py-3 px-3 font-mono">SLA 阈值</th>
              <th className="py-3 px-3 font-mono">当前值 / 预测值</th>
              <th className="py-3 px-3">风险概率 / 断供天数</th>
              <th className="py-3 px-3">触发时间</th>
              <th className="py-3 px-3">处理状态 (R8)</th>
              <th className="py-3 px-4 text-right">处置动作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAlerts.map(alert => (
              <tr key={alert.id} className="hover:bg-blue-50/50">
                <td className="py-3.5 px-4">
                  <AlertTypeBadge type={alert.type} />
                </td>
                <td className="py-3.5 px-3">
                  <div
                    onClick={() => navigateToSiteDetail(alert.siteId)}
                    className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer"
                  >
                    {alert.siteName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {alert.region} / {alert.representativeOffice}
                  </div>
                </td>
                <td className="py-3.5 px-3 text-slate-700">{alert.customer}</td>
                <td className="py-3.5 px-3 font-mono font-medium text-slate-800">{alert.slaThreshold}%</td>
                <td className="py-3.5 px-3 font-mono">
                  <span className="font-bold text-red-600">{alert.currentValue}%</span>
                  {alert.predictedValue !== undefined && (
                    <span className="text-amber-600 block text-[11px] font-semibold">
                      预测: {alert.predictedValue}%
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-3 font-mono">
                  {alert.breachProbability !== undefined ? (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      {alert.breachProbability}% 概率
                    </span>
                  ) : alert.dataStarvedDays !== undefined ? (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      断供 {alert.dataStarvedDays} 天
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                  {alert.triggerTime}
                </td>
                <td className="py-3.5 px-3">
                  {alert.status === 'active' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                      待处理
                    </span>
                  ) : alert.status === 'confirmed' ? (
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        已确认
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                        {alert.handler} ({alert.handleTime?.slice(5)})
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        已忽略
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                        {alert.handler}
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  {alert.status === 'active' ? (
                    <>
                      <button
                        onClick={() => setDiagnosisAlert(alert)}
                        className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded font-bold text-xs shadow-xs inline-flex items-center gap-1 transition-colors"
                        title="针对该预警一键调起 AI 故障诊断"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI诊断</span>
                      </button>
                      <button
                        onClick={() => handleOpenProcessModal(alert, 'confirmed')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-xs border border-emerald-200 transition-colors"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => handleOpenProcessModal(alert, 'ignored')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition-colors"
                      >
                        忽略
                      </button>
                      <button
                        onClick={() => {
                          window.alert(`模拟跳转至 PCare 工单创建系统外链...\n已自动携带站点: ${alert.siteName} 与客户: ${alert.customer}`);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs border border-blue-200 transition-colors"
                        title="转工单至 PCare 系统"
                      >
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        转工单
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigateToSiteDetail(alert.siteId)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      溯源 &rarr;
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Handle Alert (Confirm / Ignore with Trace Log) */}
      {selectedAlertForHandle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                {handleAction === 'confirmed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500" />
                )}
                <h3 className="text-base font-bold text-slate-900">
                  {handleAction === 'confirmed' ? '确认预警事件并留痕' : '忽略预警事件并留痕'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertForHandle(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-1">
                <div>
                  <span className="text-slate-500">预警站点:</span>{' '}
                  <span className="text-slate-900 font-semibold">{selectedAlertForHandle.siteName}</span>
                </div>
                <div>
                  <span className="text-slate-500">处理人员:</span>{' '}
                  <span className="text-blue-600 font-bold">{currentUser.name} ({currentUser.roleTitle})</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  处置意见与留痕备注 (Rule R8: 留痕存档且不再复推)
                </label>
                <textarea
                  rows={3}
                  value={handleNote}
                  onChange={e => setHandleNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-3 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedAlertForHandle(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmProcess}
                  className={`px-5 py-2 font-bold rounded shadow-sm ${
                    handleAction === 'confirmed'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-800 text-white'
                  }`}
                >
                  确认提交留痕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Configuration Modal (R5) */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">预警与数据断供阈值参数配置 (R5)</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  全局离线日志数据断供默认阈值 (天数)
                </label>
                <input
                  type="number"
                  value={globalStarveThreshold}
                  onChange={e => setGlobalStarveThreshold(parseInt(e.target.value) || 30)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  站点超过断供阈值未收到新导入批次时自动触发断供预警并点亮灰灯 (R5, R6)
                </p>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  预警通知推送通道与接收人
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>站内通知实时推送 (顶部铃铛角标)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span>邮件每日摘要订阅 (接收人: 各区域运维主管、可用度管理员)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: AI Fault Diagnosis Wizard */}
      {diagnosisAlert && (
        <NewDiagnosisWizardModal
          initialSiteId={diagnosisAlert.siteId}
          initialEvent={{
            eventId: diagnosisAlert.id,
            eventTitle: `${diagnosisAlert.type === 'sla_breached' ? 'SLA已跌破预警' : '预测将跌破预警'} (${diagnosisAlert.currentValue}%)`,
            eventType: 'availability_alert',
            eventTime: diagnosisAlert.triggerTime,
            severity: diagnosisAlert.severity.toUpperCase(),
            description: `当前站点可用度 ${diagnosisAlert.currentValue}%，低于合同阈值 ${diagnosisAlert.slaThreshold}%`
          }}
          onClose={() => setDiagnosisAlert(null)}
          onLaunchTask={newTask => {
            createDiagnosisTask(newTask);
            setActiveDiagnosisTaskId(newTask.id);
            setActiveTab('fault_diagnosis');
          }}
        />
      )}
    </div>
  );
};
