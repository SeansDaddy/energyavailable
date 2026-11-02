import React, { useState } from 'react';
import { Site, CoreDevice, RedundancyLevel } from '../../types';
import { DeviceDetailWorkbench } from './DeviceDetailWorkbench';
import {
  Cpu,
  Shield,
  Info,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';

interface CoreDevicesTabProps {
  site: Site;
  onUpdateRedundancy?: (siteId: string, redundancy: RedundancyLevel, notes: string) => void;
  onNavigateTab: (tabIdx: number) => void;
}

export const CoreDevicesTab: React.FC<CoreDevicesTabProps> = ({
  site,
  onNavigateTab
}) => {
  const [selectedDevice, setSelectedDevice] = useState<CoreDevice | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // If a device is selected for drilldown, render the comprehensive Deep-Dive Workbench
  if (selectedDevice) {
    return (
      <DeviceDetailWorkbench
        site={site}
        device={selectedDevice}
        onBack={() => setSelectedDevice(null)}
        onSelectDevice={dev => setSelectedDevice(dev)}
      />
    );
  }

  const filteredDevices = site.coreDevices.filter(
    d =>
      d.deviceName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      d.deviceCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      d.deviceType.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      d.model.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Rule R2 Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-900 font-semibold">
            核心设备认定规则 (Rule R2 & R1)：
          </strong>
          可用度计算仅统计由<strong>核心计量设备（PCS变流器、BMS电池簇、EMS主控）</strong>非计划停机所引发的等效中断时长。辅机设备故障不触发扣除。点击任意设备可进入<strong>遥测时序、运行工况历史、点表清单与中断责任全景下钻工作台</strong>。
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>现场核心设备拓扑架构与链路全景</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              纳管核心设备共 <strong className="text-slate-800 font-semibold">{site.coreDevices.length}</strong> 台套 · 涵盖变流、储能堆与能源管控中枢
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            Rule R2 核心设备纳管
          </span>
        </div>

        {/* Graphical Topology Map */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="p-4 bg-white rounded border border-slate-200 flex flex-col md:flex-row items-center justify-around gap-4 text-xs">
            <div className="p-3 rounded bg-blue-50 border border-blue-200 text-center w-full md:w-44 shadow-sm">
              <Server className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">EMS 调度主站</div>
              <div className="text-[10px] text-slate-500 mt-0.5">IEC 61850 / 104</div>
            </div>

            <div className="text-slate-400 font-mono text-xs flex md:flex-col items-center gap-1">
              <span>◄──系统通信网络──►</span>
            </div>

            <div className="p-3 rounded bg-indigo-50 border border-indigo-200 text-center w-full md:w-44 shadow-sm">
              <Zap className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">PCS 变流机组</div>
              <div className="text-[10px] text-slate-500 mt-0.5">并网逆变与交直流变换</div>
            </div>

            <div className="text-slate-400 font-mono text-xs flex md:flex-col items-center gap-1">
              <span>◄──CAN / RS485 簇控──►</span>
            </div>

            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-center w-full md:w-44 shadow-sm">
              <Activity className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="font-bold text-slate-900">BMS 高压电池堆</div>
              <div className="text-[10px] text-slate-500 mt-0.5">280Ah LFP 簇控单元</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Devices Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>站点核心计量设备台账清单 (点击设备卡片或行下钻运行详情)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              共挂接 {site.coreDevices.length} 台核心设备 · 仅核心设备停运触发可用度扣减 (Rule R2)
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索设备编码/名称/型号..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-52"
            />
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
                <th className="py-3 px-3">运行工况</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map(dev => (
                <tr
                  key={dev.id}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedDevice(dev)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {dev.deviceName}
                    </div>
                    <div className="text-[11px] text-blue-600 font-mono">{dev.deviceCode}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {dev.deviceType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{dev.model}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-800 font-bold">
                    {dev.ratedPowerKw ? `${dev.ratedPowerKw} kW` : '集控主控'}
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
                      className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1 ml-auto shadow-xs transition-colors"
                    >
                      <span>遥测工况下钻</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

