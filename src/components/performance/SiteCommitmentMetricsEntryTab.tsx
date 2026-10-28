import React, { useState } from 'react';
import { PerformanceCommitmentMetrics } from '../../types/performanceEvaluation';
import {
  Sliders,
  CheckCircle2,
  Save,
  RotateCcw,
  Clock,
  History,
  FileCheck2,
  Zap,
  BatteryCharging,
  Activity,
  Thermometer,
  Scale,
  ShieldCheck,
  Edit3,
  Check,
  Info
} from 'lucide-react';

interface SiteCommitmentMetricsEntryTabProps {
  initialMetrics: PerformanceCommitmentMetrics;
  siteName: string;
  onSaveMetrics?: (updated: PerformanceCommitmentMetrics) => void;
}

export const SiteCommitmentMetricsEntryTab: React.FC<SiteCommitmentMetricsEntryTabProps> = ({
  initialMetrics,
  siteName,
  onSaveMetrics
}) => {
  const [metrics, setMetrics] = useState<PerformanceCommitmentMetrics>(initialMetrics);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<PerformanceCommitmentMetrics>(initialMetrics);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartEdit = () => {
    setFormData({ ...metrics });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({ ...metrics });
    setIsEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newVersionNo = `V${(parseFloat(metrics.version.replace('V', '')) + 0.1).toFixed(1)}`;
    const nowTime = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const updated: PerformanceCommitmentMetrics = {
      ...formData,
      version: newVersionNo,
      updatedAt: nowTime,
      auditLog: [
        {
          version: newVersionNo,
          modifiedAt: nowTime,
          modifier: formData.updatedBy || '当前运营负责人',
          changeSummary: formData.amendmentBasis || '手动更新性能承诺关键指标基准'
        },
        ...metrics.auditLog
      ]
    };

    setMetrics(updated);
    setIsEditing(false);
    if (onSaveMetrics) onSaveMetrics(updated);
    showToast(`承诺指标已成功更新并发布 ${newVersionNo} 版本！`);
  };

  const handleResetToContractBaseline = () => {
    if (confirm('确定要将承诺指标重置为合同原始初始指标吗？')) {
      const resetData: PerformanceCommitmentMetrics = {
        ...metrics,
        rteGuaranteePct: 87.50,
        sohFloorPct: 90.00,
        availabilityGuaranteePct: 99.20,
        maxAnnualDegradationPct: 1.80,
        maxCellDeltaTCelsius: 4.00,
        maxAllowedDeltaSocPct: 5.00,
        maxGridMeterLossPct: 1.50
      };
      setMetrics(resetData);
      setFormData(resetData);
      showToast('已重置为合同原始初始基准指标');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                当前站点性能承诺指标录入与基准参数配置
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                基准版本: {metrics.version}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              针对当前储能站录入或按补充协议调整承诺关键履约指标（包括 RTE 保证线、SOH 最低保有底线、可用度 EAF、最大年化衰减容许率、电芯温差限制及关口线损上限）。
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={handleResetToContractBaseline}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置合同原始基准</span>
                </button>
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>编辑修改承诺指标</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>保存发布新版本</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Parameters Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* RTE Guarantee Target */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>交流往返综合能效 (RTE) 保证指标</span>
              </span>
              <span className="text-slate-400 font-mono">%</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={formData.rteGuaranteePct}
                onChange={e =>
                  setFormData({ ...formData, rteGuaranteePct: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-slate-900">
                {metrics.rteGuaranteePct.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">%</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              35kV 并网关口处的全生命周期交流充放电净能效保证底限。
            </p>
          </div>

          {/* SOH Floor Target */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>目标 SOH 最低保证线 (第2年)</span>
              </span>
              <span className="text-slate-400 font-mono">%</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={formData.sohFloorPct}
                onChange={e =>
                  setFormData({ ...formData, sohFloorPct: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-emerald-700">
                {metrics.sohFloorPct.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">%</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              低于此阈值时触发电池容量补齐或模组免费更换质保条款。
            </p>
          </div>

          {/* Availability EAF Target */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>综合系统等效可用系数 (EAF) 保证</span>
              </span>
              <span className="text-slate-400 font-mono">%</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={formData.availabilityGuaranteePct}
                onChange={e =>
                  setFormData({ ...formData, availabilityGuaranteePct: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-blue-700">
                {metrics.availabilityGuaranteePct.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">%</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              年度商业运行期可用时间占比，考核计划与非计划停运。
            </p>
          </div>

          {/* AUC Available Capacity Target */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-amber-600" />
                <span>可用电能量 AUC 最低保证底线</span>
              </span>
              <span className="text-slate-400 font-mono">MWh</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={formData.aucMinMwh}
                onChange={e =>
                  setFormData({ ...formData, aucMinMwh: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-amber-700">
                {metrics.aucMinMwh.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">MWh</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              0.5C 充放电实测标定放电有效积分可用电能量底线。
            </p>
          </div>

          {/* Max Annual Degradation Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>最大年化容量衰减率上限</span>
              </span>
              <span className="text-slate-400 font-mono">%/年</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={formData.maxAnnualDegradationPct}
                onChange={e =>
                  setFormData({ ...formData, maxAnnualDegradationPct: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-purple-700">
                ≤ {metrics.maxAnnualDegradationPct.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">%/年</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              合同约定的第2年起每年实际容量衰减容许上限。
            </p>
          </div>

          {/* Max Cell Delta T */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-rose-600" />
                <span>最大允许电芯温差 (ΔT) 考核限值</span>
              </span>
              <span className="text-slate-400 font-mono">℃</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.1"
                value={formData.maxCellDeltaTCelsius}
                onChange={e =>
                  setFormData({ ...formData, maxCellDeltaTCelsius: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-rose-700">
                ≤ {metrics.maxCellDeltaTCelsius.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-500">℃</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              液冷系统全工况充放电期间单簇/全站电芯最高温差红线。
            </p>
          </div>

          {/* Max Delta SOC */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-cyan-600" />
                <span>最大允许 SOC 极差 (ΔSOC) 考核值</span>
              </span>
              <span className="text-slate-400 font-mono">%</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.1"
                value={formData.maxAllowedDeltaSocPct}
                onChange={e =>
                  setFormData({ ...formData, maxAllowedDeltaSocPct: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-cyan-700">
                ≤ {metrics.maxAllowedDeltaSocPct.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-500">%</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              充放电末端各簇之间的 SOC 不均衡离散度考核门限。
            </p>
          </div>

          {/* Max Grid Meter Loss Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>并网关口计量综合线损率考核上限</span>
              </span>
              <span className="text-slate-400 font-mono">%</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={formData.maxGridMeterLossPct}
                onChange={e =>
                  setFormData({ ...formData, maxGridMeterLossPct: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-indigo-700">
                ≤ {metrics.maxGridMeterLossPct.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">%</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              站内 PCS 汇总电量与 35kV 关口电表之间的综合线损率限制。
            </p>
          </div>

          {/* Lifecycle Commitment Cycles */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                <span>全生命周期承诺累计等效循环 (FEC)</span>
              </span>
              <span className="text-slate-400 font-mono">次</span>
            </div>
            {isEditing ? (
              <input
                type="number"
                value={formData.lifecycleCommitmentCycles}
                onChange={e =>
                  setFormData({ ...formData, lifecycleCommitmentCycles: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-lg font-mono font-bold text-slate-900 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <div className="text-2xl font-black font-mono text-slate-900">
                {metrics.lifecycleCommitmentCycles}{' '}
                <span className="text-xs font-normal text-slate-500">次 FEC</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              10 年商业运营期承诺保证循环总次数（或以 SOH 80% 终止）。
            </p>
          </div>
        </div>

        {/* Audit & Revision Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">修订依据与版本变更履历</h3>
            </div>
            <div className="text-xs text-slate-500">
              最后核准人: <strong className="text-slate-800">{metrics.updatedBy}</strong> · {metrics.updatedAt}
            </div>
          </div>

          {isEditing && (
            <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  本次修订依据与协议编号 (必填)
                </label>
                <input
                  type="text"
                  value={formData.amendmentBasis}
                  onChange={e => setFormData({ ...formData, amendmentBasis: e.target.value })}
                  placeholder="例如：依据2026年三方补充协议第02号修订..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  审核人 / 运检总监姓名
                </label>
                <input
                  type="text"
                  value={formData.updatedBy}
                  onChange={e => setFormData({ ...formData, updatedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Audit Logs Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3">基准版本</th>
                  <th className="py-2.5 px-3">修订时间</th>
                  <th className="py-2.5 px-3">审核负责人</th>
                  <th className="py-2.5 px-3">变更摘要与协议依据</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.auditLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                      {log.version}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{log.modifiedAt}</td>
                    <td className="py-2.5 px-3 text-slate-800">{log.modifier}</td>
                    <td className="py-2.5 px-3 text-slate-700">{log.changeSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
};
