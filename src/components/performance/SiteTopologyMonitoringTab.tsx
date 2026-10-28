import React, { useState } from 'react';
import { TopologyNodeData } from '../../types/performanceEvaluation';
import {
  GitFork,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
  Thermometer,
  ShieldAlert,
  ArrowDown,
  Cpu,
  Info,
  Sliders,
  Filter,
  Eye,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface SiteTopologyMonitoringTabProps {
  topologyNodes: TopologyNodeData[];
  siteName: string;
}

export const SiteTopologyMonitoringTab: React.FC<SiteTopologyMonitoringTabProps> = ({
  topologyNodes,
  siteName
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'BREACHED_ONLY' | 'PCS' | 'BATTERY' | 'AUX'>('ALL');

  const selectedNode = topologyNodes.find(n => n.id === selectedNodeId) || null;
  const breachedNodes = topologyNodes.filter(n => n.isSlaBreached);

  // Group nodes by hierarchy level
  const gridNodes = topologyNodes.filter(n => n.level === 'GRID_TIE');
  const transformerNodes = topologyNodes.filter(n => n.level === 'TRANSFORMER');
  const hvSwitchNodes = topologyNodes.filter(n => n.level === 'HV_SWITCH');
  const pcsNodes = topologyNodes.filter(n => n.level === 'PCS');
  const dcBoxNodes = topologyNodes.filter(n => n.level === 'DC_COMBINER');
  const clusterNodes = topologyNodes.filter(n => n.level === 'BATTERY_CLUSTER');
  const auxNodes = topologyNodes.filter(n => n.level === 'AUX_COOLING');

  const renderNodeCard = (node: TopologyNodeData) => {
    const isBreached = node.isSlaBreached;
    const isSelected = node.id === selectedNodeId;

    if (filterMode === 'BREACHED_ONLY' && !isBreached) {
      return null;
    }
    if (filterMode === 'PCS' && node.level !== 'PCS' && node.level !== 'HV_SWITCH' && node.level !== 'TRANSFORMER') {
      return null;
    }
    if (filterMode === 'BATTERY' && node.level !== 'BATTERY_CLUSTER' && node.level !== 'DC_COMBINER') {
      return null;
    }
    if (filterMode === 'AUX' && node.level !== 'AUX_COOLING') {
      return null;
    }

    return (
      <div
        key={node.id}
        onClick={() => setSelectedNodeId(node.id)}
        className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
          isBreached
            ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/50 shadow-lg shadow-rose-500/10 animate-pulse-subtle'
            : isSelected
            ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/40 shadow-md'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
        }`}
      >
        {/* Breach Alert Tag */}
        {isBreached && (
          <div className="absolute -top-2.5 -right-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-bounce">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>低于 SLA</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
              {node.code}
            </span>
            <div className="text-xs font-bold text-slate-900 mt-0.5">{node.name}</div>
          </div>
          <div className="text-right">
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isBreached
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              SLA: {node.metrics.slaScore}%
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              目标: {node.metrics.slaTarget}%
            </span>
          </div>
        </div>

        {/* Live Metrics Grid on Node */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2.5 pt-2 border-t border-slate-100 text-[11px] font-mono">
          {node.metrics.power && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400 font-sans text-[10px]">功率:</span>
              <span className="font-bold text-slate-800">{node.metrics.power}</span>
            </div>
          )}
          {node.metrics.efficiency && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400 font-sans text-[10px]">能效:</span>
              <span
                className={`font-bold ${
                  isBreached ? 'text-rose-600 underline' : 'text-emerald-700'
                }`}
              >
                {node.metrics.efficiency}
              </span>
            </div>
          )}
          {node.metrics.voltage && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400 font-sans text-[10px]">电压:</span>
              <span className="font-medium text-slate-700">{node.metrics.voltage}</span>
            </div>
          )}
          {node.metrics.temperature && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400 font-sans text-[10px]">温度:</span>
              <span
                className={`font-bold ${
                  parseFloat(node.metrics.temperature) > 35
                    ? 'text-rose-600'
                    : 'text-slate-700'
                }`}
              >
                {node.metrics.temperature}
              </span>
            </div>
          )}
          {node.metrics.soc && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400 font-sans text-[10px]">SOC:</span>
              <span className="font-bold text-blue-700">{node.metrics.soc}</span>
            </div>
          )}
          {node.metrics.soh && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-slate-400 font-sans text-[10px]">SOH:</span>
              <span
                className={`font-bold ${
                  parseFloat(node.metrics.soh) < 90 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {node.metrics.soh}
              </span>
            </div>
          )}
        </div>

        {/* Breach reason banner */}
        {isBreached && node.slaBreachReason && (
          <div className="mt-2 text-[10px] text-rose-700 bg-rose-100/70 p-1.5 rounded leading-tight">
            <strong>告警根因: </strong>
            {node.slaBreachReason}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                当前站点电气与系统全景拓扑监控 (低于 SLA 异常节点与链路高亮)
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                分级链路拓扑图
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              展示从 35kV 并网关口、升压箱变、交流配电柜、PCS 逆变变流器、直流汇流箱、电池储能簇至辅助液冷系统的完整拓扑架构。实时呈现关键节点参数，并高亮标红低于 SLA 保证线的不良设备节点与关联异常链路。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-500 font-medium">拓扑节点总数:</span>
              <span className="font-bold text-slate-900 font-mono">{topologyNodes.length}</span>
              <span className="text-slate-300">|</span>
              <span className="text-rose-600 font-bold flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{breachedNodes.length} 个低于 SLA</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Topology Filter Bar & Visual Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>拓扑视图:</span>
          </span>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            全部节点 ({topologyNodes.length})
          </button>
          <button
            onClick={() => setFilterMode('BREACHED_ONLY')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
              filterMode === 'BREACHED_ONLY'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>低于 SLA 异常节点与链路 ({breachedNodes.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('PCS')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterMode === 'PCS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            变流 PCS 链路
          </button>
          <button
            onClick={() => setFilterMode('BATTERY')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterMode === 'BATTERY'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            电池簇直流系统
          </button>
          <button
            onClick={() => setFilterMode('AUX')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              filterMode === 'AUX'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            液冷温控机组
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">正常达标</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-300 animate-pulse"></span>
            <span className="text-rose-700 font-bold">低于SLA (高亮告警)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-0.5 border-t-2 border-rose-500 border-dashed"></span>
            <span className="text-rose-600 text-[11px]">SLA异常链路</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Topology Diagram Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topology Flow Canvas */}
        <div className="lg:col-span-2 bg-slate-900/95 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6 text-white overflow-hidden relative">
          <div className="absolute top-3 right-4 text-[10px] text-slate-400 font-mono">
            LIVE TOPOLOGY BUS · 35kV/0.69kV/1500V DC
          </div>

          {/* Level 1: Grid Tie */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
              <span>1. 35kV 并网关口层 (关口计量与电网侧)</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {gridNodes.map(node => renderNodeCard(node))}
            </div>
          </div>

          {/* Flow Connector Arrow */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-mono">
              <div className="h-4 w-0.5 bg-slate-700"></div>
              <span>35kV 高压电缆进线</span>
            </div>
          </div>

          {/* Level 2: Transformer */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
              <span>2. 升压变电层 (35kV / 0.69kV 升压箱变)</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {transformerNodes.map(node => renderNodeCard(node))}
            </div>
          </div>

          {/* Flow Connector Arrow */}
          <div className="flex justify-center">
            <div className="h-4 w-0.5 bg-slate-700"></div>
          </div>

          {/* Level 3: HV Switch & AC Busbar */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
              <span>3. 交流配电层 (0.69kV 进线母线与开关柜)</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {hvSwitchNodes.map(node => renderNodeCard(node))}
            </div>
          </div>

          {/* Flow Connector with Branching */}
          <div className="relative py-1">
            <div className="h-0.5 w-full bg-slate-800"></div>
            {/* Below-SLA Highlight Link to PCS-02 */}
            <div className="absolute top-1 right-1/4 w-1/4 h-0.5 border-t-2 border-rose-500 border-dashed animate-pulse"></div>
            <div className="text-center text-[9px] text-slate-500 mt-1 font-mono">
              交流 0.69kV 分路供电支路 (标红链路示降载变流支路)
            </div>
          </div>

          {/* Level 4: PCS & Aux Liquid Cooling */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
              <span>4. 变流 PCS 与辅机液冷层</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pcsNodes.map(node => renderNodeCard(node))}
              {auxNodes.map(node => renderNodeCard(node))}
            </div>
          </div>

          {/* Flow Connector with Below-SLA Link to DC Box 2 */}
          <div className="relative py-1">
            <div className="h-0.5 w-full bg-slate-800"></div>
            <div className="absolute top-1 right-1/4 w-1/4 h-0.5 border-t-2 border-rose-500 border-dashed animate-pulse"></div>
            <div className="text-center text-[9px] text-slate-500 mt-1 font-mono">
              DC 1500V 直流母排动力线缆 (2#支路存在接触发热线损)
            </div>
          </div>

          {/* Level 5: DC Combiner Boxes */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
              <span>5. 直流高压汇流与配电层</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dcBoxNodes.map(node => renderNodeCard(node))}
            </div>
          </div>

          {/* Flow Connector to Clusters */}
          <div className="relative py-1">
            <div className="h-0.5 w-full bg-slate-800"></div>
            <div className="absolute top-1 right-1/3 w-1/3 h-0.5 border-t-2 border-rose-500 border-dashed animate-pulse"></div>
          </div>

          {/* Level 6: Battery Clusters */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
              <span>6. 电池储能簇群 (500kWh / 簇 · 磷酸铁锂液冷模组)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {clusterNodes.map(node => renderNodeCard(node))}
            </div>
          </div>
        </div>

        {/* Node Inspector & SLA Breach Root Cause Analysis Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {selectedNode.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedNode.name}
                  </h3>
                  <span className="text-xs text-indigo-600 font-medium">
                    {selectedNode.levelLabel}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                    selectedNode.isSlaBreached
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  SLA: {selectedNode.metrics.slaScore}%
                </span>
              </div>

              {/* Breach Banner if Applicable */}
              {selectedNode.isSlaBreached && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>低于 SLA 考核承诺底线 (目标 ≥ {selectedNode.metrics.slaTarget}%)</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    {selectedNode.slaBreachReason}
                  </p>
                </div>
              )}

              {/* Detailed Metrics Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800">实时工况与电气参数明细</div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  {Object.entries(selectedNode.metrics).map(([key, val]) => {
                    if (key === 'slaScore' || key === 'slaTarget') return null;
                    return (
                      <div key={key} className="flex items-center justify-between font-mono">
                        <span className="text-slate-500 font-sans uppercase text-[11px]">{key}:</span>
                        <span className="font-bold text-slate-800">{String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alarms and Dispatch Actions */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800">关联活动告警与消缺建议</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>当前活动告警数:</span>
                    <strong className={selectedNode.alarmCount > 0 ? 'text-rose-600' : 'text-slate-800'}>
                      {selectedNode.alarmCount} 项
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                    {selectedNode.isSlaBreached
                      ? '建议安排现场驻点工程师进行热成像测温、检查接触端子紧固力矩，并在低谷窗口期执行主动补电均衡以恢复 SLA 可用度。'
                      : '设备运行正常，通信心跳平稳，处于健康 SLA 保证绿区。'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedNodeId(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                关闭节点详情
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>拓扑节点 SLA 履约健康度榜单</span>
              </div>
              <p className="text-xs text-slate-500">
                点击左侧拓扑图任意节点卡片可查看其详细电气参数与 SLA 偏差归因。
              </p>

              <div className="space-y-2">
                {topologyNodes.map(n => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNodeId(n.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      n.isSlaBreached
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900 hover:bg-rose-100/70'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{n.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{n.levelLabel}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          n.isSlaBreached ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {n.metrics.slaScore}%
                      </span>
                      {n.isSlaBreached && (
                        <div className="text-[9px] text-rose-600 font-bold">低于SLA</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
