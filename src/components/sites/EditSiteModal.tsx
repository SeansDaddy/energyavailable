import React, { useState, useEffect } from 'react';
import { Site, RedundancyLevel } from '../../types';
import {
  X,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  Zap,
  Shield,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface EditSiteModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (siteId: string, updatedData: Partial<Site>) => void;
}

export const EditSiteModal: React.FC<EditSiteModalProps> = ({
  site,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Site>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'sla' | 'grid'>('basic');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (site) {
      setFormData({
        siteCode: site.siteCode,
        siteName: site.siteName,
        customer: site.customer,
        owner: site.owner,
        contactPhone: site.contactPhone || '138-0000-8888',
        commissioningDate: site.commissioningDate || '2023-11-18',
        region: site.region,
        representativeOffice: site.representativeOffice,
        capacityMw: site.capacityMw,
        gridVoltageLevel: site.gridVoltageLevel || '35kV',
        location: site.location || '示范基地配电站内',
        domain: site.domain || '独立储能电站',
        contractNo: site.contractNo,
        slaThreshold: site.slaThreshold,
        redundancy: site.redundancy,
        redundancyNotes: site.redundancyNotes
      });
      setErrorMsg(null);
      setIsSuccess(false);
    }
  }, [site, isOpen]);

  if (!isOpen || !site) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siteName?.trim()) {
      setErrorMsg('请填写站点名称');
      return;
    }
    if (!formData.customer?.trim()) {
      setErrorMsg('请填写所属客户');
      return;
    }
    if (!formData.owner?.trim()) {
      setErrorMsg('请填写运维负责人');
      return;
    }

    onSave(site.id, formData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>编辑站点台账档案</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {site.siteCode}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                修改所属客户、运维负责人、装机容量、SLA及并网工程台账信息，保存后全网实时联动生效
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 border-b border-slate-100 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>客户与负责人信息</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sla')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sla'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>合同与 SLA 阈值</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`pb-2 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'grid'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>工程容量与冗余组网</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">站点台账信息已成功保存更新！正在同步全局状态...</span>
            </div>
          )}

          {/* TAB 1: BASIC & OWNER */}
          {activeTab === 'basic' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    站点编码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.siteCode || ''}
                    onChange={e => setFormData({ ...formData, siteCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    站点名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.siteName || ''}
                    onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>所属客户 <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">支持直接输入或选择</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="customer-suggestions"
                    value={formData.customer || ''}
                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="如：国家电网、南方电网、宁德时代"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs font-semibold"
                  />
                  <datalist id="customer-suggestions">
                    <option value="国家电网" />
                    <option value="南方电网" />
                    <option value="三峡能源" />
                    <option value="宁德时代" />
                    <option value="华能集团" />
                    <option value="国家能源集团" />
                    <option value="中广核新能源" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    业务领域 / 应用场景
                  </label>
                  <select
                    value={formData.domain || '独立储能电站'}
                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="独立储能电站">独立储能电站</option>
                    <option value="源网荷储一体化">源网荷储一体化</option>
                    <option value="工商业光储充">工商业光储充</option>
                    <option value="火电联合调频">火电联合调频</option>
                    <option value="共享储能电站">共享储能电站</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>运维负责人 <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.owner || ''}
                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="如：张工、李主管"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>负责人联系电话 / 应急电话</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone || ''}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="如：138-1234-5678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    所属大区
                  </label>
                  <input
                    type="text"
                    value={formData.region || ''}
                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                    placeholder="如：华东区、西北区"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    所属代表处
                  </label>
                  <input
                    type="text"
                    value={formData.representativeOffice || ''}
                    onChange={e => setFormData({ ...formData, representativeOffice: e.target.value })}
                    placeholder="如：上海代表处、西安代表处"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>站点详细位置 / 经纬度</span>
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="如：江苏省盐城市大丰区港南路8号 (120.48°E, 33.20°N)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SLA & CONTRACT */}
          {activeTab === 'sla' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>关联合同编号</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contractNo || ''}
                    onChange={e => setFormData({ ...formData, contractNo: e.target.value })}
                    placeholder="如：CTR-2024-001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-semibold text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>合同 SLA 可用度基线 (%)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">通常为 99.00% ~ 99.80%</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="90"
                    max="100"
                    value={formData.slaThreshold || 99.50}
                    onChange={e => setFormData({ ...formData, slaThreshold: parseFloat(e.target.value) || 99.50 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-xs text-amber-800">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>SLA 考核履约规则说明 (Rule R1)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90">
                  当期可用度低于此基线时，系统状态灯将判定为红色（已跌破违约风险）；若处于缓冲带将显示黄色（预测跌破）。
                  外部电网限电与外因停机（ECO 外因停机时间）经核免后不扣减本基线可用度。
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: GRID & REDUNDANCY */}
          {activeTab === 'grid' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>额定装机容量 (MW)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.capacityMw || 10}
                    onChange={e => setFormData({ ...formData, capacityMw: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>正式并网投运日期</span>
                  </label>
                  <input
                    type="date"
                    value={formData.commissioningDate || ''}
                    onChange={e => setFormData({ ...formData, commissioningDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    并网电压等级
                  </label>
                  <select
                    value={formData.gridVoltageLevel || '35kV'}
                    onChange={e => setFormData({ ...formData, gridVoltageLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="10kV">10kV 专线接入</option>
                    <option value="35kV">35kV 升压变接入</option>
                    <option value="110kV">110kV 汇集站并网</option>
                    <option value="220kV">220kV 区域变电站</option>
                    <option value="0.4kV">0.4kV 低压配电网</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    组网冗余模式 (Rule R2)
                  </label>
                  <select
                    value={formData.redundancy || 'N_PLUS_1'}
                    onChange={e => setFormData({ ...formData, redundancy: e.target.value as RedundancyLevel })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="NONE">无冗余 (单机运行)</option>
                    <option value="N_PLUS_1">N+1 单元冗余</option>
                    <option value="DUAL_HOT_BACKUP">双机热备 (Dual-Hot)</option>
                    <option value="RING_TOPOLOGY">环网冗余 (Ring Topology)</option>
                    <option value="MULTI_ACTIVE">多活集群冗余 (Multi-Active)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  冗余与拓扑工程说明
                </label>
                <textarea
                  rows={2}
                  value={formData.redundancyNotes || ''}
                  onChange={e => setFormData({ ...formData, redundancyNotes: e.target.value })}
                  placeholder="如：双母线分段接线，配备自动负荷转移切换，单台PCS故障不影响整站并网运行"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存台账修改</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
