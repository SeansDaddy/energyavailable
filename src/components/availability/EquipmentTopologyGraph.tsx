import React, { useState, useMemo } from 'react';
import {
  PeriodDeviceStatus,
  AvailabilityAlarmItem
} from '../../utils/equipmentAndAlarmsGenerator';
import {
  Zap,
  ZapOff,
  Activity,
  Server,
  Wind,
  Radio,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  X,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface EquipmentTopologyGraphProps {
  devices: PeriodDeviceStatus[];
  alarms: AvailabilityAlarmItem[];
  selectedDeviceCode: string | null;
  onSelectDeviceCode: (code: string | null) => void;
  onDrilldownToCausalChain: (deviceCode?: string) => void;
  onNavigateTab?: (tabIdx: number, extra?: any) => void;
  timeRangeLabel: string;
  dimension: string;
  startDate: string;
  endDate: string;
}

export const EquipmentTopologyGraph: React.FC<EquipmentTopologyGraphProps> = ({
  devices,
  alarms,
  selectedDeviceCode,
  onSelectDeviceCode,
  onDrilldownToCausalChain,
  timeRangeLabel
}) => {
  // Status highlight filter: ALL, NORMAL, WARNING, FAULT, ECO_STANDBY, MAINTENANCE
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Inspected device code for bottom drawer/card
  const [inspectedCode, setInspectedCode] = useState<string | null>(
    selectedDeviceCode || null
  );

  React.useEffect(() => {
    if (selectedDeviceCode) {
      setInspectedCode(selectedDeviceCode);
    }
  }, [selectedDeviceCode]);

  // Find inspected device
  const inspectedDevice = useMemo(() => {
    if (!inspectedCode) return null;
    return devices.find(d => d.deviceCode === inspectedCode) || null;
  }, [devices, inspectedCode]);

  // Alarms associated with inspected device
  const inspectedDeviceAlarms = useMemo(() => {
    if (!inspectedCode) return [];
    return alarms.filter(
      a =>
        a.deviceCode === inspectedCode ||
        a.deviceName === inspectedDevice?.deviceName ||
        a.deviceType === inspectedDevice?.deviceType
    );
  }, [alarms, inspectedCode, inspectedDevice]);

  // Group devices by topology role
  const transformer = devices.find(d => d.deviceType === 'TRANSFORMER') || {
    id: 'tr-def',
    deviceCode: 'TR-MAIN-01',
    deviceName: '35kV 主升压变压器',
    deviceType: 'TRANSFORMER' as const,
    model: 'S11-2500/35',
    isKeyDevice: true,
    ratedPowerKw: 2500,
    periodStatus: 'NORMAL' as const,
    periodStatusLabel: '正常运行',
    faultCountInPeriod: 0,
    alarmCountInPeriod: 0,
    totalInterruptionMinutesInPeriod: 0,
    ecoOutageMinutesInPeriod: 0,
    availabilityContribution: 100,
    latestConditionNotes: '35kV 主变运行正常，顶层油温与温升合格',
    hasImpactedAvailability: false
  };

  const ems = devices.find(d => d.deviceType === 'EMS_HOST') || {
    id: 'ems-def',
    deviceCode: 'EMS-CTRL-01',
    deviceName: 'EMS 能量管理主控',
    deviceType: 'EMS_HOST' as const,
    model: 'EN-EMS-5000',
    isKeyDevice: true,
    periodStatus: 'NORMAL' as const,
    periodStatusLabel: '正常运行',
    faultCountInPeriod: 0,
    alarmCountInPeriod: 0,
    totalInterruptionMinutesInPeriod: 0,
    ecoOutageMinutesInPeriod: 0,
    availabilityContribution: 100,
    latestConditionNotes: 'EMS主备系统双机热备，IEC 61850调度通信正常',
    hasImpactedAvailability: false
  };

  const hvac = devices.find(d => d.deviceType === 'HVAC_COOLING') || {
    id: 'hvac-def',
    deviceCode: 'HVAC-COOL-01',
    deviceName: '工业液冷温控机组',
    deviceType: 'HVAC_COOLING' as const,
    model: 'EN-COLD-45KW',
    isKeyDevice: false,
    ratedPowerKw: 45,
    periodStatus: 'NORMAL' as const,
    periodStatusLabel: '正常运行',
    faultCountInPeriod: 0,
    alarmCountInPeriod: 0,
    totalInterruptionMinutesInPeriod: 0,
    ecoOutageMinutesInPeriod: 0,
    availabilityContribution: 100,
    latestConditionNotes: '液冷温控机组自适应运行，供回液温差正常',
    hasImpactedAvailability: false
  };

  const pcsList = useMemo(() => {
    const list = devices.filter(d => d.deviceType === 'PCS_INVERTER');
    if (list.length > 0) return list;
    return [
      {
        id: 'pcs-1',
        deviceCode: 'PCS-INV-01A',
        deviceName: '1.25MW 变流器 A (主)',
        deviceType: 'PCS_INVERTER' as const,
        model: 'EN-PCS-1250',
        isKeyDevice: true,
        ratedPowerKw: 1250,
        periodStatus: 'NORMAL' as const,
        periodStatusLabel: '正常运行',
        faultCountInPeriod: 0,
        alarmCountInPeriod: 0,
        totalInterruptionMinutesInPeriod: 0,
        ecoOutageMinutesInPeriod: 0,
        availabilityContribution: 100,
        latestConditionNotes: '变流器逆变正常',
        hasImpactedAvailability: false
      },
      {
        id: 'pcs-2',
        deviceCode: 'PCS-INV-01B',
        deviceName: '1.25MW 变流器 B (备)',
        deviceType: 'PCS_INVERTER' as const,
        model: 'EN-PCS-1250',
        isKeyDevice: true,
        ratedPowerKw: 1250,
        periodStatus: 'WARNING' as const,
        periodStatusLabel: '告警预警',
        faultCountInPeriod: 0,
        alarmCountInPeriod: 1,
        totalInterruptionMinutesInPeriod: 0,
        ecoOutageMinutesInPeriod: 0,
        availabilityContribution: 99.2,
        latestConditionNotes: '轻微散热受阻预警',
        hasImpactedAvailability: false
      }
    ];
  }, [devices]);

  const bmsRacks = useMemo(() => {
    const list = devices.filter(d => d.deviceType === 'BMS_CLUSTER');
    if (list.length >= 4) return list.slice(0, 4);
    const base: PeriodDeviceStatus[] = [...list];
    for (let i = base.length + 1; i <= 4; i++) {
      const pad = String(i).padStart(2, '0');
      base.push({
        id: `bms-${pad}`,
        deviceCode: `BMS-RACK-${pad}`,
        deviceName: `${pad}# 电池簇`,
        deviceType: 'BMS_CLUSTER' as const,
        model: '280Ah-LFP',
        isKeyDevice: true,
        periodStatus: 'NORMAL' as const,
        periodStatusLabel: '正常运行',
        faultCountInPeriod: 0,
        alarmCountInPeriod: 0,
        totalInterruptionMinutesInPeriod: 0,
        ecoOutageMinutesInPeriod: 0,
        availabilityContribution: 100,
        latestConditionNotes: '单体压差及温升正常',
        hasImpactedAvailability: false
      });
    }
    return base;
  }, [devices]);

  // Overall status counts
  const counts = useMemo(() => {
    let normal = 0;
    let warning = 0;
    let fault = 0;
    let eco = 0;
    let maint = 0;
    devices.forEach(d => {
      if (d.periodStatus === 'FAULT') fault++;
      else if (d.periodStatus === 'ECO_STANDBY' || (d.ecoOutageMinutesInPeriod || 0) > 0) eco++;
      else if (d.periodStatus === 'WARNING') warning++;
      else if (d.periodStatus === 'MAINTENANCE') maint++;
      else normal++;
    });
    return { total: devices.length, normal, warning, fault, eco, maint };
  }, [devices]);

  // Node Color-Coding configuration - Light enterprise theme in full harmony with page
  const getNodeDyeTheme = (
    status: PeriodDeviceStatus['periodStatus'],
    isSelected: boolean,
    isDimmed: boolean
  ) => {
    if (isDimmed) {
      return {
        container: 'bg-slate-50/70 border-slate-200 opacity-40 grayscale',
        badge: 'bg-slate-100 text-slate-400 border-slate-200',
        iconBg: 'bg-slate-100 text-slate-400 border-slate-200',
        dot: 'bg-slate-400'
      };
    }

    if (isSelected) {
      return {
        container: 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/40 shadow-sm scale-[1.02]',
        badge: 'bg-blue-600 text-white border-blue-600 font-bold',
        iconBg: 'bg-blue-100 text-blue-700 border-blue-300',
        dot: 'bg-blue-500'
      };
    }

    switch (status) {
      case 'FAULT':
        return {
          container: 'bg-red-50/60 border-red-400 ring-2 ring-red-400/50 shadow-xs animate-pulse-subtle',
          badge: 'bg-red-100 text-red-700 border border-red-200 font-bold',
          iconBg: 'bg-red-100 text-red-600 border border-red-200',
          dot: 'bg-red-500 animate-pulse'
        };
      case 'WARNING':
        return {
          container: 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/60 shadow-2xs',
          badge: 'bg-amber-100 text-amber-800 border border-amber-200 font-bold',
          iconBg: 'bg-amber-100 text-amber-700 border border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'ECO_STANDBY':
        return {
          container: 'bg-cyan-50/60 border-cyan-300 ring-1 ring-cyan-300/60 shadow-2xs',
          badge: 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold',
          iconBg: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
          dot: 'bg-cyan-600'
        };
      case 'MAINTENANCE':
        return {
          container: 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300/60 shadow-2xs',
          badge: 'bg-blue-100 text-blue-800 border border-blue-200 font-bold',
          iconBg: 'bg-blue-100 text-blue-700 border border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'NORMAL':
      default:
        return {
          container: 'bg-white border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/20 shadow-2xs',
          badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
          dot: 'bg-emerald-500'
        };
    }
  };

  const handleNodeClick = (code: string) => {
    if (inspectedCode === code) {
      setInspectedCode(null);
      onSelectDeviceCode(null);
    } else {
      setInspectedCode(code);
      onSelectDeviceCode(code);
    }
  };

  const isDimmed = (status: PeriodDeviceStatus['periodStatus'], dev: PeriodDeviceStatus) => {
    if (statusFilter === 'ALL') return false;
    if (statusFilter === 'ECO_STANDBY') {
      return status !== 'ECO_STANDBY' && (dev.ecoOutageMinutesInPeriod || 0) === 0;
    }
    return status !== statusFilter;
  };

  return (
    <div className="space-y-4">
      {/* Topology Legend Bar (染色状态说明 - 全面契合整体浅色卡片风格) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5 mr-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>工况拓扑染色图例:</span>
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            全部 ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'NORMAL' ? 'ALL' : 'NORMAL')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              statusFilter === 'NORMAL'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'NORMAL' ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>正常 ({counts.normal})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'WARNING' ? 'ALL' : 'WARNING')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              statusFilter === 'WARNING'
                ? 'bg-amber-600 text-white font-bold shadow-2xs'
                : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'WARNING' ? 'bg-white' : 'bg-amber-500'}`} />
            <span>预警 ({counts.warning})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'FAULT' ? 'ALL' : 'FAULT')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              statusFilter === 'FAULT'
                ? 'bg-red-600 text-white font-bold shadow-2xs'
                : 'bg-white text-red-800 border border-red-200 hover:bg-red-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'FAULT' ? 'bg-white' : 'bg-red-500 animate-pulse'}`} />
            <span>故障 ({counts.fault})</span>
          </button>

          {counts.eco > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'ECO_STANDBY' ? 'ALL' : 'ECO_STANDBY')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'ECO_STANDBY'
                  ? 'bg-cyan-600 text-white font-bold shadow-2xs'
                  : 'bg-white text-cyan-800 border border-cyan-300 hover:bg-cyan-50'
              }`}
            >
              <ZapOff className={`w-3.5 h-3.5 ${statusFilter === 'ECO_STANDBY' ? 'text-white' : 'text-cyan-600'}`} />
              <span>ECO外因停机 ({counts.eco})</span>
            </button>
          )}

          {counts.maint > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'MAINTENANCE' ? 'ALL' : 'MAINTENANCE')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'MAINTENANCE'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'MAINTENANCE' ? 'bg-white' : 'bg-blue-500'}`} />
              <span>计划检修 ({counts.maint})</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>点击节点可下钻关联告警与责任诊断</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOPOLOGY SCHEMATIC CANVAS (整体浅色统一风格的电气与控制拓扑图)             */}
      {/* ========================================================================= */}
      <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-6 text-slate-800 shadow-2xs relative overflow-x-auto">
        {/* Schematic Grid Content */}
        <div className="min-w-[760px] max-w-4xl mx-auto space-y-7">
          
          {/* LEVEL 1: GRID & TRANSFORMER (电网与主升压变) */}
          <div className="flex items-center justify-between gap-6">
            {/* Left: PCC Virtual Grid Node */}
            <div className="flex items-center gap-3 w-64 p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="w-9 h-9 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900">110kV/35kV 电网并网点</div>
                <div className="text-[10px] text-purple-700 font-mono mt-0.5">PCC 公共连接点</div>
              </div>
            </div>

            {/* Connecting Bus Line */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="h-0.5 w-full bg-purple-300" />
              <span className="absolute -top-3.5 text-[10px] font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 shadow-2xs">
                35kV 进线
              </span>
            </div>

            {/* Center: Transformer Node (TR-MAIN-01) */}
            {(() => {
              const dimmed = isDimmed(transformer.periodStatus, transformer);
              const selected = inspectedCode === transformer.deviceCode;
              const theme = getNodeDyeTheme(transformer.periodStatus, selected, dimmed);

              return (
                <div
                  onClick={() => handleNodeClick(transformer.deviceCode)}
                  className={`w-64 p-3 rounded-lg border cursor-pointer transition-all ${theme.container}`}
                  title="点击查看主变运行工况与告警"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {transformer.deviceCode}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {transformer.deviceName}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] ${theme.badge}`}>
                      {transformer.periodStatusLabel}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Right: EMS Master Node (跨层监控中枢) */}
            {(() => {
              const dimmed = isDimmed(ems.periodStatus, ems);
              const selected = inspectedCode === ems.deviceCode;
              const theme = getNodeDyeTheme(ems.periodStatus, selected, dimmed);

              return (
                <div
                  onClick={() => handleNodeClick(ems.deviceCode)}
                  className={`w-60 p-3 rounded-lg border cursor-pointer transition-all ${theme.container}`}
                  title="EMS 能量管理主控单元"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {ems.deviceCode}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {ems.deviceName}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] ${theme.badge}`}>
                      {ems.periodStatusLabel}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* BUSBAR 1: 35kV/0.69kV AC BUSBAR (交流中压母线) */}
          <div className="relative py-2">
            <div className="h-1.5 bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-400 rounded-full shadow-2xs" />
            <div className="absolute left-6 -top-2 bg-white px-2.5 py-0.5 rounded border border-indigo-200 text-[10px] font-mono text-indigo-800 font-bold shadow-2xs">
              35kV / 0.69kV 交流并网母线 (AC Busbar)
            </div>
            {/* Feed branch lines down to PCS */}
            <div className="flex justify-around px-24">
              <div className="w-0.5 h-6 bg-indigo-300" />
              <div className="w-0.5 h-6 bg-indigo-300" />
            </div>
          </div>

          {/* LEVEL 2: PCS INVERTERS (变流器机组) */}
          <div className="grid grid-cols-2 gap-8 px-12">
            {pcsList.map(pcs => {
              const dimmed = isDimmed(pcs.periodStatus, pcs);
              const selected = inspectedCode === pcs.deviceCode;
              const theme = getNodeDyeTheme(pcs.periodStatus, selected, dimmed);

              return (
                <div
                  key={pcs.id}
                  onClick={() => handleNodeClick(pcs.deviceCode)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${theme.container}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${theme.iconBg}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {pcs.deviceCode}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {pcs.deviceName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${theme.badge}`}>
                        {pcs.periodStatusLabel}
                      </span>
                      {pcs.alarmCountInPeriod > 0 && (
                        <span className="text-[10px] font-mono text-amber-700 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>{pcs.alarmCountInPeriod}条告警</span>
                        </span>
                      )}
                      {pcs.totalInterruptionMinutesInPeriod > 0 && (
                        <span className="text-[10px] font-mono text-red-600 font-bold">
                          停运 {pcs.totalInterruptionMinutesInPeriod}分
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BUSBAR 2: 1500V DC BUSBAR (直流高压汇流母线) */}
          <div className="relative py-2">
            <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-600 to-teal-400 rounded-full shadow-2xs" />
            <div className="absolute left-6 -top-2 bg-white px-2.5 py-0.5 rounded border border-teal-200 text-[10px] font-mono text-teal-800 font-bold shadow-2xs">
              1500V DC 直流汇流母线 (DC Busbar)
            </div>
            {/* Feed branch lines down to Battery Racks */}
            <div className="flex justify-around px-8">
              <div className="w-0.5 h-6 bg-teal-300" />
              <div className="w-0.5 h-6 bg-teal-300" />
              <div className="w-0.5 h-6 bg-teal-300" />
              <div className="w-0.5 h-6 bg-teal-300" />
            </div>
          </div>

          {/* LEVEL 3: BATTERY RACKS & HVAC (储能集装箱电池簇群与液冷) */}
          <div className="relative p-4 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-900 font-bold">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>1# 储能预制舱直流侧电池簇群 (2.5MW / 5.0MWh)</span>
              </div>

              {/* HVAC Node (温控回路) */}
              {(() => {
                const dimmed = isDimmed(hvac.periodStatus, hvac);
                const selected = inspectedCode === hvac.deviceCode;
                const theme = getNodeDyeTheme(hvac.periodStatus, selected, dimmed);

                return (
                  <div
                    onClick={() => handleNodeClick(hvac.deviceCode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${theme.container}`}
                    title="集装箱工业液冷温控机组"
                  >
                    <Wind className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {hvac.deviceCode}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {hvac.deviceName}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] ${theme.badge}`}>
                      {hvac.periodStatusLabel}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* 4 Battery Racks (简洁染色卡片) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bmsRacks.map(rack => {
                const dimmed = isDimmed(rack.periodStatus, rack);
                const selected = inspectedCode === rack.deviceCode;
                const theme = getNodeDyeTheme(rack.periodStatus, selected, dimmed);

                return (
                  <div
                    key={rack.id}
                    onClick={() => handleNodeClick(rack.deviceCode)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${theme.container}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {rack.deviceCode}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] ${theme.badge}`}>
                        {rack.periodStatusLabel}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                      {rack.deviceName}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>可用贡献: <strong className="text-slate-800">{rack.availabilityContribution}%</strong></span>
                      <span className="text-blue-600 font-sans flex items-center">
                        详情 <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INSPECTED NODE DRAWER (选中设备专属下钻与告警面板)                         */}
      {/* ========================================================================= */}
      {inspectedDevice && (
        <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {inspectedDevice.deviceName} ({inspectedDevice.deviceCode})
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      inspectedDevice.periodStatus === 'FAULT'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : inspectedDevice.periodStatus === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : inspectedDevice.periodStatus === 'ECO_STANDBY'
                        ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                        : inspectedDevice.periodStatus === 'MAINTENANCE'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {inspectedDevice.periodStatusLabel}
                  </span>
                  {inspectedDevice.isKeyDevice && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      Rule R2 核心设备
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  型号: {inspectedDevice.model} · 统计区间: {timeRangeLabel} · 可用度贡献: {inspectedDevice.availabilityContribution}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDrilldownToCausalChain(inspectedDevice.deviceCode)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>下钻中断告警与根因</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setInspectedCode(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="关闭详情面板"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500">工况简述</span>
              <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                {inspectedDevice.latestConditionNotes}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500">考核停机折算</span>
              <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                {inspectedDevice.totalInterruptionMinutesInPeriod} 分钟责任停机
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {inspectedDevice.totalInterruptionMinutesInPeriod > 0
                  ? '当期已扣减可用度，可在【中断告警】查看详细扣减。'
                  : '本周期未发生非计划停运。'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500">关联可用度告警</span>
              <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                {inspectedDevice.alarmCountInPeriod} 项可用度告警
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {(inspectedDevice.ecoOutageMinutesInPeriod || 0) > 0 ? (
                  <span className="text-cyan-700 font-semibold">
                    含 ECO 外因停机 {inspectedDevice.ecoOutageMinutesInPeriod} 分钟 (SLA已核免)
                  </span>
                ) : (
                  '符合 Rule R2 核心计量规则'
                )}
              </p>
            </div>
          </div>

          {/* Alarms list for this device */}
          {inspectedDeviceAlarms.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>该设备关联告警 ({inspectedDeviceAlarms.length} 条)</span>
              </div>
              <div className="space-y-1">
                {inspectedDeviceAlarms.map(a => (
                  <div key={a.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{a.title}</span>
                      <span className="text-slate-500 text-[11px] ml-2 font-mono">[{a.code}] {a.triggerTime}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDrilldownToCausalChain(inspectedDevice.deviceCode)}
                      className="text-blue-600 hover:underline text-[11px] font-semibold"
                    >
                      溯源根因
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
