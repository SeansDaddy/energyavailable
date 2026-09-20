import React, { useState, useMemo } from 'react';
import { Site, WorkOrder } from '../../types';
import {
  getEquipmentAndAlarmsForPeriod,
  PeriodDeviceStatus,
  AvailabilityAlarmItem
} from '../../utils/equipmentAndAlarmsGenerator';
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Wrench,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles,
  Zap,
  Activity,
  FileText,
  Tag,
  Leaf
} from 'lucide-react';

interface DimensionEquipmentAndAlarmsSectionProps {
  site: Site;
  startDate: string;
  endDate: string;
  dimension: '5min' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  timeRangeLabel: string;
  workOrders?: WorkOrder[];
  onNavigateTab?: (tabIdx: number, extra?: any) => void;
}

export const DimensionEquipmentAndAlarmsSection: React.FC<DimensionEquipmentAndAlarmsSectionProps> = ({
  site,
  startDate,
  endDate,
  dimension,
  timeRangeLabel,
  workOrders = [],
  onNavigateTab
}) => {
  // Device filter & search states
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<
    'ALL' | 'NORMAL' | 'WARNING' | 'FAULT' | 'MAINTENANCE'
  >('ALL');
  const [deviceSearchTerm, setDeviceSearchTerm] = useState<string>('');
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<string | null>(null);
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  // Generate equipment and alarms dataset for the given time range
  const { devices, alarms, stats } = useMemo(() => {
    return getEquipmentAndAlarmsForPeriod(site, startDate, endDate, workOrders);
  }, [site, startDate, endDate, workOrders]);

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      // Device code selection filter
      if (selectedDeviceCode && d.deviceCode !== selectedDeviceCode) return false;
      // Status filter
      if (deviceStatusFilter !== 'ALL' && d.periodStatus !== deviceStatusFilter) return false;
      // Search term
      if (deviceSearchTerm) {
        const term = deviceSearchTerm.toLowerCase();
        return (
          d.deviceName.toLowerCase().includes(term) ||
          d.deviceCode.toLowerCase().includes(term) ||
          d.model.toLowerCase().includes(term) ||
          d.latestConditionNotes.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [devices, selectedDeviceCode, deviceStatusFilter, deviceSearchTerm]);

  const dimensionNameMap: Record<string, string> = {
    '5min': '5分钟颗粒度',
    daily: '日维度',
    weekly: '周维度',
    monthly: '月维度',
    yearly: '年维度'
  };

  const deviceTypeBadgeMap: Record<string, { label: string; bg: string; text: string }> = {
    PCS_INVERTER: { label: 'PCS 变流器', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    BMS_CLUSTER: { label: 'BMS 电池簇', bg: 'bg-teal-50', text: 'text-teal-700' },
    EMS_HOST: { label: 'EMS 主控系统', bg: 'bg-cyan-50', text: 'text-cyan-700' },
    TRANSFORMER: { label: '升压变压器', bg: 'bg-purple-50', text: 'text-purple-700' },
    HVAC_COOLING: { label: '液冷温控机组', bg: 'bg-sky-50', text: 'text-sky-700' }
  };

  const toggleExpandDevice = (devId: string) => {
    setExpandedDeviceId(prev => (prev === devId ? null : devId));
  };

  // Jump to Fault Causal Chain tab with target device
  const handleDrilldownToCausalChain = (devCode?: string) => {
    onNavigateTab?.(1, {
      deviceCode: devCode,
      activeSubView: 'alarms'
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Section Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Cpu className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              核心设备状态统计
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {dimensionNameMap[dimension] || dimension}
            </span>
            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
              {timeRangeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            监控当前时段内核心设备运行工况、等效停运时长与可用度贡献率。点击设备关联告警即可下钻跳转至【故障因果链】及根因溯源。
          </p>
        </div>

        {/* Drilldown Navigation Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDrilldownToCausalChain()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs"
            title="下钻前往故障因果链页签查看全站可用度告警与时序瀑布流"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>查看故障因果链与可用度告警</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards (保留核心统计) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>核心设备健康度</span>
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-lg font-black font-mono text-slate-800 mt-1">
            {stats.normalDevices} / {stats.totalDevices}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">台正常</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {stats.warningDevices > 0 && (
              <span className="text-amber-600 font-semibold">
                {stats.warningDevices}台预警{' '}
              </span>
            )}
            {stats.faultDevices > 0 && (
              <span className="text-red-600 font-semibold">
                · {stats.faultDevices}台停运{' '}
              </span>
            )}
            {stats.maintenanceDevices > 0 && (
              <span className="text-blue-600 font-semibold">
                · {stats.maintenanceDevices}台检修
              </span>
            )}
            {stats.faultDevices === 0 && stats.warningDevices === 0 && (
              <span className="text-emerald-600 font-semibold">全量核心设备稳定运行</span>
            )}
          </div>
        </div>

        {/* 可用度告警 KPI: Click jumps directly to Fault Causal Chain Tab */}
        <div
          onClick={() => handleDrilldownToCausalChain()}
          className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/20 cursor-pointer transition-all group"
          title="点击直接下钻跳转至【故障因果链】查看可用度告警"
        >
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>可用度告警</span>
            <span className="flex items-center gap-1 text-amber-600 text-[10px] font-bold group-hover:underline">
              <span>下钻因果链</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-lg font-black font-mono text-slate-800 mt-1">
            {stats.totalAlarms}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">次</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            严重停运 <strong className="text-red-600 font-mono">{stats.criticalAlarms}</strong>{' '}
            · 重要 <strong className="text-amber-600 font-mono">{stats.majorAlarms}</strong>
            {stats.ecoExemptAlarms > 0 && (
              <span>
                {' '}
                · ECO免责{' '}
                <strong className="text-emerald-600 font-mono">
                  {stats.ecoExemptAlarms}
                </strong>
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>SLA 考核停机扣减</span>
            <Clock className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-lg font-black font-mono text-red-600 mt-1">
            {stats.slaCountedInterruptionMinutes}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">分钟</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            等效折算{' '}
            <strong className="text-slate-700 font-mono">
              {(stats.slaCountedInterruptionMinutes / 60).toFixed(1)}
            </strong>{' '}
            小时 (扣减考核)
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>告警闭环处置率</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-lg font-black font-mono text-blue-700 mt-1">100%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">工单闭环与免责追溯完成</div>
        </div>
      </div>

      {/* Quick Filter Bar (保留快捷筛选) */}
      <div className="flex flex-col gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>工况状态筛选:</span>
            </span>
            <button
              onClick={() => setDeviceStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                deviceStatusFilter === 'ALL'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              全部状态 ({devices.length})
            </button>
            <button
              onClick={() => setDeviceStatusFilter('NORMAL')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                deviceStatusFilter === 'NORMAL'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>正常运行 ({stats.normalDevices})</span>
            </button>
            <button
              onClick={() => setDeviceStatusFilter('WARNING')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                deviceStatusFilter === 'WARNING'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>告警预警 ({stats.warningDevices})</span>
            </button>
            <button
              onClick={() => setDeviceStatusFilter('FAULT')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                deviceStatusFilter === 'FAULT'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>故障停运 ({stats.faultDevices})</span>
            </button>
            {stats.maintenanceDevices > 0 && (
              <button
                onClick={() => setDeviceStatusFilter('MAINTENANCE')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  deviceStatusFilter === 'MAINTENANCE'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>计划检修 ({stats.maintenanceDevices})</span>
              </button>
            )}
          </div>

          {/* Device Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索设备名称、编号、型号..."
              value={deviceSearchTerm}
              onChange={e => setDeviceSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Quick Device Code Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/60 text-xs">
          <span className="text-slate-500 font-medium">设备编码锁定:</span>
          <button
            onClick={() => setSelectedDeviceCode(null)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              selectedDeviceCode === null
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            全部
          </button>
          {devices.map(d => {
            const isSelected = selectedDeviceCode === d.deviceCode;
            const isFault = d.periodStatus === 'FAULT';
            const isWarning = d.periodStatus === 'WARNING';
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDeviceCode(isSelected ? null : d.deviceCode)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold'
                    : isFault
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : isWarning
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isFault
                      ? 'bg-red-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : d.periodStatus === 'MAINTENANCE'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>{d.deviceCode}</span>
                {d.alarmCountInPeriod > 0 && (
                  <span className="text-[10px] font-bold text-amber-600">
                    ({d.alarmCountInPeriod})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE EQUIPMENT STATUS STATISTICS LIST (核心设备状态统计列表) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold">
              <tr>
                <th scope="col" className="py-3 px-4 text-left">设备名称与编号</th>
                <th scope="col" className="py-3 px-3 text-left">设备类别</th>
                <th scope="col" className="py-3 px-3 text-center">额定规格</th>
                <th scope="col" className="py-3 px-3 text-center">工况运行状态</th>
                <th scope="col" className="py-3 px-3 text-center">期间可用贡献率</th>
                <th scope="col" className="py-3 px-3 text-center">期间等效停运</th>
                <th scope="col" className="py-3 px-3 text-center">关联可用度告警</th>
                <th scope="col" className="py-3 px-4 text-left">运行工况简述与诊断</th>
                <th scope="col" className="py-3 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">未检索到匹配的核心设备记录</p>
                    <p className="text-xs text-slate-400 mt-1">请尝试调整状态筛选条件或清空关键字</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map(dev => {
                  const isExpanded = expandedDeviceId === dev.id;
                  const typeBadge = deviceTypeBadgeMap[dev.deviceType] || {
                    label: '储能设备',
                    bg: 'bg-slate-50',
                    text: 'text-slate-700'
                  };
                  const isFault = dev.periodStatus === 'FAULT';
                  const isWarning = dev.periodStatus === 'WARNING';
                  const isMaint = dev.periodStatus === 'MAINTENANCE';

                  return (
                    <React.Fragment key={dev.id}>
                      <tr
                        className={`hover:bg-blue-50/20 transition-colors ${
                          isFault
                            ? 'bg-red-50/15'
                            : isWarning
                            ? 'bg-amber-50/15'
                            : ''
                        }`}
                      >
                        {/* Device Name & Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpandDevice(dev.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title={isExpanded ? '收起详情' : '展开详情'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">
                                  {dev.deviceName}
                                </span>
                                {dev.isKeyDevice && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                    核心
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="text-blue-600 font-semibold">
                                  {dev.deviceCode}
                                </span>
                                <span>·</span>
                                <span>{dev.model}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Device Type */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${typeBadge.bg} ${typeBadge.text}`}
                          >
                            {typeBadge.label}
                          </span>
                        </td>

                        {/* Rated Power */}
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {dev.ratedPowerKw ? `${dev.ratedPowerKw} kW` : '系统标配'}
                        </td>

                        {/* Period Status Badge */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isFault
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isWarning
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : isMaint
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isFault
                                  ? 'bg-red-600 animate-pulse'
                                  : isWarning
                                  ? 'bg-amber-500'
                                  : isMaint
                                  ? 'bg-blue-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <span>{dev.periodStatusLabel}</span>
                          </span>
                        </td>

                        {/* Availability Contribution */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`font-mono font-black text-xs ${
                                dev.availabilityContribution < 99.5
                                  ? 'text-red-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {dev.availabilityContribution}%
                            </span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  dev.availabilityContribution < 99.5
                                    ? 'bg-red-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, dev.availabilityContribution)}%`
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Interruption Minutes */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold ${
                              dev.totalInterruptionMinutesInPeriod > 0
                                ? 'text-red-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {dev.totalInterruptionMinutesInPeriod} 分钟
                          </span>
                        </td>

                        {/* 关联可用度告警: 点击下钻跳转至故障因果链 */}
                        <td className="py-3 px-3 text-center">
                          {dev.alarmCountInPeriod > 0 ? (
                            <button
                              onClick={() => handleDrilldownToCausalChain(dev.deviceCode)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
                              title="点击下钻跳转至【故障因果链】查看该设备告警与根因时序"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{dev.alarmCountInPeriod} 条告警</span>
                              <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">0 条</span>
                          )}
                        </td>

                        {/* Condition Notes */}
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                            {dev.latestConditionNotes}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => toggleExpandDevice(dev.id)}
                              className="text-slate-600 hover:text-slate-900 font-medium text-[11px] px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                            >
                              {isExpanded ? '收起' : '详情'}
                            </button>

                            <button
                              onClick={() => handleDrilldownToCausalChain(dev.deviceCode)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-[11px] px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                              title="下钻至【故障因果链】查看告警与时序链"
                            >
                              <span>下钻告警</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={9} className="p-4">
                            <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 text-xs">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {dev.deviceName} ({dev.deviceCode})
                                  </span>
                                  <span className="text-slate-500">工况下钻与诊断详情</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                                  <span>型号: {dev.model}</span>
                                  <span>·</span>
                                  <span>额定容量: {dev.ratedPowerKw || 1250} kW</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <span className="text-slate-500 text-[11px]">周期工况运行说明</span>
                                  <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                                    {dev.latestConditionNotes}
                                  </p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <span className="text-slate-500 text-[11px]">SLA 考核停机折算</span>
                                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                                    {dev.totalInterruptionMinutesInPeriod} 分钟
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    {dev.totalInterruptionMinutesInPeriod > 0
                                      ? '当期已扣减可用度，支持在【故障因果链】中评估 ECO 节能运行免责条款。'
                                      : '本考核周期未发生导致可用度下降的非计划停运。'}
                                  </p>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <span className="text-slate-500 text-[11px]">因果链与告警联动</span>
                                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                                    {dev.alarmCountInPeriod} 项关联告警
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    包含重叠时间窗内由该设备引发的保护跳闸、温升过载或通信超时。
                                  </p>
                                </div>
                              </div>

                              {/* Prominent CTA to jump to Fault Causal Chain */}
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-[11px] text-slate-500">
                                  下钻穿透：查看该设备的原始因果时序事件瀑布流、AI 根因分析及 ECO 免责清册。
                                </span>
                                <button
                                  onClick={() => handleDrilldownToCausalChain(dev.deviceCode)}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>
                                    下钻跳转至【故障因果链】查看设备【{dev.deviceCode}】告警与根因
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
