import React, { useState } from 'react';
import { Site, CoreDevice, RedundancyLevel } from '../../types';
import { RedundancyBadge } from '../common/StatusBadge';
import {
  Cpu,
  Shield,
  Edit,
  Save,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  Server,
  Activity,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CoreDevicesTabProps {
  site: Site;
  onUpdateRedundancy: (siteId: string, redundancy: RedundancyLevel, notes: string) => void;
  onNavigateTab: (tabIdx: number) => void;
}

export const CoreDevicesTab: React.FC<CoreDevicesTabProps> = ({
  site,
  onUpdateRedundancy,
  onNavigateTab
}) => {
  const [isEditingRedundancy, setIsEditingRedundancy] = useState(false);
  const [editRedundancy, setEditRedundancy] = useState<RedundancyLevel>(site.redundancy);
  const [editNotes, setEditNotes] = useState(site.redundancyNotes || '');
  const [selectedDevice, setSelectedDevice] = useState<CoreDevice | null>(null);

  const handleSave = () => {
    onUpdateRedundancy(site.id, editRedundancy, editNotes);
    setIsEditingRedundancy(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Rule R2 Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-900 font-semibold">
            核心设备认定与冗余拓扑规则 (Rule R2 & R1)：
          </strong>
          可用度计算仅统计由<strong>核心计量设备（PCS变流器、BMS电池簇、EMS主控）</strong>非计划停机所引发的等效中断时长。辅机设备（如普通照明、外围温湿度传感）故障不触发扣除。组网冗余度由运维人员维护，直接输入至可靠性评分五因子模型。
        </div>
      </div>

      {/* Redundancy Maintenance & Visual Topology */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              组网冗余拓扑与在线维护 (运维实时维护)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              当前等级: <strong className="text-slate-800 font-semibold">{site.redundancy}</strong> · 影响内部管理可靠性评分 (权重 20%)
            </p>
          </div>

          {!isEditingRedundancy ? (
            <button
              onClick={() => setIsEditingRedundancy(true)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>修改组网冗余配置</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsEditingRedundancy(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存并重算得分</span>
              </button>
            </div>
          )}
        </div>

        {/* Visual Topology Diagram */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>现场组网拓扑结构简图</span>
            </span>
            <RedundancyBadge level={isEditingRedundancy ? editRedundancy : site.redundancy} />
          </div>

          {/* Graphical Topology Map */}
          <div className="p-4 bg-white rounded border border-slate-200 flex flex-col md:flex-row items-center justify-around gap-4 text-xs">
            <div className="p-3 rounded bg-blue-50 border border-blue-200 text-center w-full md:w-44 shadow-sm">
              <Server className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">EMS 调度主站</div>
              <div className="text-[10px] text-slate-500 mt-0.5">IEC 61850 / 104</div>
            </div>

            <div className="text-slate-400 font-mono text-xs flex md:flex-col items-center gap-1">
              <span>◄──双环自愈网──►</span>
            </div>

            <div className="p-3 rounded bg-indigo-50 border border-indigo-200 text-center w-full md:w-44 shadow-sm">
              <Zap className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">双机并联 PCS 变流组</div>
              <div className="text-[10px] text-slate-500 mt-0.5">主用 01A + 备用 01B</div>
            </div>

            <div className="text-slate-400 font-mono text-xs flex md:flex-col items-center gap-1">
              <span>◄──CAN/RS485──►</span>
            </div>

            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-center w-full md:w-44 shadow-sm">
              <Activity className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">BMS 高压电池堆</div>
              <div className="text-[10px] text-slate-500 mt-0.5">280Ah LFP 簇控</div>
            </div>
          </div>

          {!isEditingRedundancy ? (
            <div className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-200">
              <strong className="text-slate-800">运维备注说明:</strong>{' '}
              {site.redundancyNotes || '现场按标准双机热备架构组网，支持无缝热备切换。'}
            </div>
          ) : (
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  选择组网拓扑冗余等级
                </label>
                <select
                  value={editRedundancy}
                  onChange={e => setEditRedundancy(e.target.value as RedundancyLevel)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  <option value="DUAL_HOT_BACKUP">双机热备 (Dual Hot-Backup) - 95分</option>
                  <option value="RING_TOPOLOGY">光纤自愈环网 (Ring Topology) - 98分</option>
                  <option value="MULTI_ACTIVE">多活负荷分担 (Multi-Active) - 100分</option>
                  <option value="N_PLUS_1">N+1 单元模块热备 (N+1 Modular) - 85分</option>
                  <option value="NONE">单机无冗余 (None) - 40分</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  拓扑变更原因与现场说明
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
                  placeholder="填写现场组网改造日期及拓扑架构变动描述..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Core Devices Inventory */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              站点核心计量设备台账清单 (点击设备下钻运行指标)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              共挂接 {site.coreDevices.length} 台核心设备 · 仅核心设备停运触发可用度扣减
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">设备编码 / 设备名称</th>
                <th className="py-3 px-3">类型</th>
                <th className="py-3 px-3">规格型号</th>
                <th className="py-3 px-3 font-mono">额定功率</th>
                <th className="py-3 px-3">核心计量属性</th>
                <th className="py-3 px-3">投运日期</th>
                <th className="py-3 px-3">运行状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {site.coreDevices.map(dev => (
                <tr
                  key={dev.id}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedDevice(dev)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{dev.deviceName}</div>
                    <div className="text-[11px] text-blue-600 font-mono">{dev.deviceCode}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">{dev.deviceType}</td>
                  <td className="py-3.5 px-3 text-slate-600">{dev.model}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-800">
                    {dev.ratedPowerKw ? `${dev.ratedPowerKw} kW` : '-'}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      ★ 核心计量设备
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {dev.installedDate}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dev.status === 'NORMAL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {dev.status === 'NORMAL' ? '🟢 正常运行' : '🟡 预警/热备'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedDevice(dev);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      参数下钻 &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Device Detail Drilldown */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-blue-50 text-blue-600 border border-blue-200">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedDevice.deviceName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    设备编码: {selectedDevice.deviceCode} · 所属站点: {site.siteName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-xs space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">设备类型</span>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">
                    {selectedDevice.deviceType}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">规格型号</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedDevice.model}</div>
                </div>
                <div>
                  <span className="text-slate-500">额定功率</span>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">
                    {selectedDevice.ratedPowerKw ? `${selectedDevice.ratedPowerKw} kW` : '集控主控主机'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">投运日期</span>
                  <div className="font-bold text-slate-800 font-mono mt-0.5">
                    {selectedDevice.installedDate}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>实时遥测与工况状态</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2 bg-white rounded border border-blue-100">
                    <span className="text-slate-500">工作温度</span>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">42.5 ℃ (正常)</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-100">
                    <span className="text-slate-500">转换效率</span>
                    <div className="font-mono font-bold text-emerald-600 mt-0.5">98.92%</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-100">
                    <span className="text-slate-500">通信心跳</span>
                    <div className="font-mono font-bold text-blue-600 mt-0.5">实时 (0ms延迟)</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800">维护与巡检记录</div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 leading-relaxed text-[11px]">
                  ● 2026-08-15: 配合工单 WO-20260815-9921 完成风道滤网更换与 IGBT 探头校准。<br />
                  ● 2026-06-12: 固件升级至 v3.4.2 版本，并入全站双机热备环网。
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
