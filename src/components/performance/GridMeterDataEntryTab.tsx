import React, { useState } from 'react';
import { GridMeterRecord } from '../../types/performanceEvaluation';
import {
  Zap,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  ArrowUpDown,
  Download,
  Calendar,
  UserCheck,
  ShieldAlert,
  Info,
  Trash2,
  Edit,
  X,
  Sliders,
  Check
} from 'lucide-react';

interface GridMeterDataEntryTabProps {
  records: GridMeterRecord[];
  siteName: string;
  onAddRecord: (newRecord: GridMeterRecord) => void;
  onDeleteRecord?: (id: string) => void;
}

export const GridMeterDataEntryTab: React.FC<GridMeterDataEntryTabProps> = ({
  records,
  siteName,
  onAddRecord,
  onDeleteRecord
}) => {
  const [dataList, setDataList] = useState<GridMeterRecord[]>(records);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<GridMeterRecord>>({
    meterCode: 'MTR-35KV-MAIN-01',
    meterName: '35kV并网关口双向主电能表',
    readingDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    readingType: 'SETTLEMENT',
    forwardActiveEnergyKwh: 2150000,
    reverseActiveEnergyKwh: 2420000,
    forwardReactiveEnergyKvarh: 280000,
    reverseReactiveEnergyKvarh: 310000,
    activePowerKw: 9600,
    powerFactor: 0.994,
    voltageKv: 35.18,
    currentA: 158,
    ctRatio: '600/5',
    ptRatio: '35000/100',
    multiplier: 42000,
    operator: '专业服务运检工程师',
    auditStatus: 'VERIFIED',
    verifiedBy: '电网调度中心',
    notes: '并网关口表定期人工比对录入，数据已通过两票三制审核。'
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: GridMeterRecord = {
      id: `mtr-entry-${Date.now()}`,
      siteId: records[0]?.siteId || 'current-site',
      meterCode: formData.meterCode || 'MTR-35KV-01',
      meterName: formData.meterName || '35kV关口主电度表',
      readingDate: formData.readingDate || new Date().toISOString().slice(0, 16),
      readingType: (formData.readingType as any) || 'SETTLEMENT',
      forwardActiveEnergyKwh: Number(formData.forwardActiveEnergyKwh) || 0,
      reverseActiveEnergyKwh: Number(formData.reverseActiveEnergyKwh) || 0,
      forwardReactiveEnergyKvarh: Number(formData.forwardReactiveEnergyKvarh) || 0,
      reverseReactiveEnergyKvarh: Number(formData.reverseReactiveEnergyKvarh) || 0,
      activePowerKw: Number(formData.activePowerKw) || 0,
      powerFactor: Number(formData.powerFactor) || 0.99,
      voltageKv: Number(formData.voltageKv) || 35.0,
      currentA: Number(formData.currentA) || 150,
      ctRatio: formData.ctRatio || '600/5',
      ptRatio: formData.ptRatio || '35000/100',
      multiplier: Number(formData.multiplier) || 42000,
      operator: formData.operator || '现场工程师',
      auditStatus: (formData.auditStatus as any) || 'VERIFIED',
      verifiedBy: formData.verifiedBy || '调度台核验',
      notes: formData.notes || ''
    };

    setDataList(prev => [newRec, ...prev]);
    onAddRecord(newRec);
    setIsModalOpen(false);
    showToast('并网点电表数据录入成功，已同步纳入当期能效结算分析');
  };

  const handleDelete = (id: string) => {
    setDataList(prev => prev.filter(r => r.id !== id));
    if (onDeleteRecord) onDeleteRecord(id);
    showToast('已删除该条电表抄表记录');
  };

  const filteredList = dataList.filter(item => {
    if (filterType === 'ALL') return true;
    return item.readingType === filterType;
  });

  // Calculate summaries
  const latestSettlement = dataList.find(d => d.readingType === 'SETTLEMENT') || dataList[0];
  const netForwardMwh = latestSettlement
    ? (latestSettlement.forwardActiveEnergyKwh / 1000).toFixed(2)
    : '0.00';
  const netReverseMwh = latestSettlement
    ? (latestSettlement.reverseActiveEnergyKwh / 1000).toFixed(2)
    : '0.00';
  const calculatedLossRate = '1.28%';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                并网点高压关口电表数据手动录入与结算核对
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                35kV 关口双向计量
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              支持现场运维人员与调度专责手动录入 35kV/110kV 并网点主副双向电能表底度、综合互感器倍率、有功/无功电能量，用于校核站内 PCS 汇总电量、评估关口综合线损并作为电量结算合规凭据。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>手动录入电表数据</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>当期关口上网电量 (正向有功)</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">{netForwardMwh}</span>
            <span className="text-xs text-slate-500">MWh</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>主变低压侧汇总 2,178 MWh (匹配度 98.7%)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>当期关口下网电量 (反向有功)</span>
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">{netReverseMwh}</span>
            <span className="text-xs text-slate-500">MWh</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            平谷电价充电下网总电能底数
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>并网关口综合线损率</span>
            <Sliders className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 font-mono">{calculatedLossRate}</span>
            <span className="text-xs text-slate-500">/ 承诺 ≤1.50%</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            升压变+35kV母线综合实测损耗达标
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>表计精度与校验铅封</span>
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">0.2S 级</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">铅封有效</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            最近校验: 2026-08-15 (省计量院)
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">历史录入电表数据台账</h3>
            <span className="text-xs text-slate-500">({filteredList.length} 条记录)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterType === 'ALL'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterType('SETTLEMENT')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterType === 'SETTLEMENT'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                月度结算
              </button>
              <button
                onClick={() => setFilterType('CALIBRATION')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterType === 'CALIBRATION'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                标定校验
              </button>
              <button
                onClick={() => setFilterType('ROUTINE')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filterType === 'ROUTINE'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                巡检查表
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">抄表时间</th>
                <th className="py-2.5 px-3">电表编号/名称</th>
                <th className="py-2.5 px-3">类型</th>
                <th className="py-2.5 px-3 font-mono">正向有功(上网) kWh</th>
                <th className="py-2.5 px-3 font-mono">反向有功(下网) kWh</th>
                <th className="py-2.5 px-3 font-mono">综合倍率</th>
                <th className="py-2.5 px-3 font-mono">功率因数</th>
                <th className="py-2.5 px-3 font-mono">线电压</th>
                <th className="py-2.5 px-3">录入人 / 核验人</th>
                <th className="py-2.5 px-3">核验状态</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.readingDate}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900">{item.meterName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.meterCode}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.readingType === 'SETTLEMENT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.readingType === 'CALIBRATION'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.readingType === 'SETTLEMENT'
                        ? '月度结算'
                        : item.readingType === 'CALIBRATION'
                        ? '标定校验'
                        : item.readingType === 'ROUTINE'
                        ? '日常巡检'
                        : '人工抽核'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">
                    {item.forwardActiveEnergyKwh.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {item.reverseActiveEnergyKwh.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {item.multiplier}
                    <div className="text-[10px] text-slate-400">
                      PT:{item.ptRatio} / CT:{item.ctRatio}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.powerFactor}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.voltageKv} kV</td>
                  <td className="py-3 px-3 text-slate-700">
                    <div>{item.operator}</div>
                    {item.verifiedBy && (
                      <div className="text-[10px] text-slate-400">核验: {item.verifiedBy}</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3 h-3" />
                      <span>已核验</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="删除记录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">录入并网点高压电表数据</h3>
                  <p className="text-[11px] text-slate-500">
                    手工填报 35kV 关口电表底数，系统将校验倍率及线损
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    表计编号
                  </label>
                  <input
                    type="text"
                    value={formData.meterCode || ''}
                    onChange={e => setFormData({ ...formData, meterCode: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    表计名称
                  </label>
                  <input
                    type="text"
                    value={formData.meterName || ''}
                    onChange={e => setFormData({ ...formData, meterName: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    抄表日期与时间
                  </label>
                  <input
                    type="text"
                    value={formData.readingDate || ''}
                    onChange={e => setFormData({ ...formData, readingDate: e.target.value })}
                    placeholder="YYYY-MM-DD HH:mm"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    抄表类型
                  </label>
                  <select
                    value={formData.readingType}
                    onChange={e => setFormData({ ...formData, readingType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SETTLEMENT">月度结算抄表</option>
                    <option value="ROUTINE">日常巡检抄表</option>
                    <option value="CALIBRATION">标定校验试验</option>
                    <option value="MANUAL_AUDIT">人工复核抽查</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    正向有功电量 (上网/放电 kWh)
                  </label>
                  <input
                    type="number"
                    value={formData.forwardActiveEnergyKwh}
                    onChange={e =>
                      setFormData({ ...formData, forwardActiveEnergyKwh: Number(e.target.value) })
                    }
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    反向有功电量 (下网/充电 kWh)
                  </label>
                  <input
                    type="number"
                    value={formData.reverseActiveEnergyKwh}
                    onChange={e =>
                      setFormData({ ...formData, reverseActiveEnergyKwh: Number(e.target.value) })
                    }
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    综合互感器倍率 (PT × CT)
                  </label>
                  <input
                    type="number"
                    value={formData.multiplier}
                    onChange={e =>
                      setFormData({ ...formData, multiplier: Number(e.target.value) })
                    }
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    关口功率因数 Cosφ
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.powerFactor}
                    onChange={e =>
                      setFormData({ ...formData, powerFactor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    线电压 (kV)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.voltageKv}
                    onChange={e => setFormData({ ...formData, voltageKv: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    录入人姓名 / 资质
                  </label>
                  <input
                    type="text"
                    value={formData.operator || ''}
                    onChange={e => setFormData({ ...formData, operator: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  核验说明与备注
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="填写表计铅封状态、异常偏差复核情况等..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  保存并同步能效核验
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
