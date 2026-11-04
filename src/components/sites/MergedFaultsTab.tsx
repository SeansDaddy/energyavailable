import React, { useState, useMemo, useEffect } from 'react';
import { Site, MergedFault, RawEvent, WorkOrder } from '../../types';
import { useApp } from '../../context/AppContext';
import { NewDiagnosisWizardModal } from '../diagnosis/NewDiagnosisWizardModal';
import {
  getEquipmentAndAlarmsForPeriod,
  PeriodDeviceStatus,
  AvailabilityAlarmItem
} from '../../utils/equipmentAndAlarmsGenerator';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Layers,
  Sparkles,
  Info,
  Wrench,
  FileText,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Filter,
  Search,
  ZapOff,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Tag,
  Check,
  SlidersHorizontal,
  Zap,
  Activity,
  Calendar,
  Edit3,
  Link2,
  Unlink
} from 'lucide-react';
import { AssociateWorkOrderModal } from './AssociateWorkOrderModal';

interface MergedFaultsTabProps {
  site: Site;
  onNavigateTab: (tabIdx: number, extra?: any) => void;
  workOrders?: WorkOrder[];
  currentDate?: string;
  initialTarget?: {
    deviceCode?: string;
    activeSubView?: 'merged' | 'alarms';
    alarmId?: string;
    startDate?: string;
    endDate?: string;
    timeRangeLabel?: string;
  } | null;
  onClearTarget?: () => void;
}

interface EcoExemptModalData {
  alarm: AvailabilityAlarmItem;
  reason: string;
  customReason: string;
  operator: string;
  // 告警原始起止时间 (只读展示，基准对照)
  alarmStartTime: string;
  alarmEndTime: string;
  alarmDurationMinutes: number;
  // 标注ECO的外因免责生效时间 (默认当前告警时间，支持修改为自定义ECO时间)
  ecoStartTime: string;
  ecoEndTime: string;
  ecoDurationMinutes: number;
  isCustomEcoTime: boolean;
}

// 格式化时间辅助函数
const formatDateTime = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// 获取告警默认结束时间
const getAlarmDefaultEndTime = (alarm: AvailabilityAlarmItem): string => {
  if (alarm.clearTime && alarm.clearTime.trim().length > 0) {
    return alarm.clearTime;
  }
  try {
    const parsed = new Date(alarm.triggerTime.replace(' ', 'T')).getTime();
    if (!isNaN(parsed)) {
      const durationMs = (alarm.durationMinutes || 45) * 60 * 1000;
      return formatDateTime(new Date(parsed + durationMs));
    }
  } catch {
    // fallback
  }
  return alarm.triggerTime;
};

// 计算时间差 (分钟)
const calculateTimeDifferenceMinutes = (startStr: string, endStr: string): number => {
  try {
    const s = new Date(startStr.replace(' ', 'T')).getTime();
    const e = new Date(endStr.replace(' ', 'T')).getTime();
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      return Math.max(1, Math.round((e - s) / (60 * 1000)));
    }
  } catch {
    // ignore
  }
  return 0;
};

// 调整时间分钟数
const adjustTimeStringByMinutes = (timeStr: string, offsetMinutes: number): string => {
  try {
    const d = new Date(timeStr.replace(' ', 'T')).getTime();
    if (!isNaN(d)) {
      return formatDateTime(new Date(d + offsetMinutes * 60 * 1000));
    }
  } catch {
    // ignore
  }
  return timeStr;
};

export const MergedFaultsTab: React.FC<MergedFaultsTabProps> = ({
  site,
  onNavigateTab,
  workOrders = [],
  currentDate = '2026-08-15',
  initialTarget,
  onClearTarget
}) => {
  const { createDiagnosisTask, setActiveDiagnosisTaskId, setActiveTab } = useApp();

  // Sub-view switch: 'merged' (故障因果链 Rule R11) vs 'alarms' (可用度告警清册)
  const [activeSubView, setActiveSubView] = useState<'merged' | 'alarms'>(
    initialTarget?.activeSubView === 'alarms' ? 'alarms' : 'merged'
  );

  // Selected device code for filtering/highlighting
  const [selectedDeviceCode, setSelectedDeviceCode] = useState<string | null>(
    initialTarget?.deviceCode || null
  );

  // Custom Time Range Filter States
  const [periodStartDate, setPeriodStartDate] = useState<string>(() => {
    if (initialTarget?.startDate) return initialTarget.startDate;
    return '2026-08-01 00:00:00';
  });
  const [periodEndDate, setPeriodEndDate] = useState<string>(() => {
    if (initialTarget?.endDate) return initialTarget.endDate;
    return '2026-08-30 23:59:59';
  });
  const [drilldownSourceLabel, setDrilldownSourceLabel] = useState<string | null>(
    initialTarget?.timeRangeLabel || null
  );
  const [isTimeRangeFromDrilldown, setIsTimeRangeFromDrilldown] = useState<boolean>(
    Boolean(initialTarget?.startDate && initialTarget?.endDate)
  );

  // Update when initialTarget changes
  useEffect(() => {
    if (initialTarget) {
      if (initialTarget.activeSubView) {
        setActiveSubView(initialTarget.activeSubView);
      }
      if (initialTarget.deviceCode !== undefined) {
        setSelectedDeviceCode(initialTarget.deviceCode || null);
      }
      if (initialTarget.startDate && initialTarget.endDate) {
        setPeriodStartDate(initialTarget.startDate);
        setPeriodEndDate(initialTarget.endDate);
        setDrilldownSourceLabel(
          initialTarget.timeRangeLabel || `${initialTarget.startDate} ~ ${initialTarget.endDate}`
        );
        setIsTimeRangeFromDrilldown(true);
      }
    }
  }, [initialTarget]);

  // Helper to normalize datetime string
  const normalizeDateTimeLocal = (dtStr: string, isEnd = false): string => {
    if (!dtStr) return isEnd ? '9999-12-31 23:59:59' : '0000-01-01 00:00:00';
    const trimmed = dtStr.trim();
    if (trimmed.length === 10) {
      return isEnd ? `${trimmed} 23:59:59` : `${trimmed} 00:00:00`;
    }
    if (trimmed.length === 16) {
      return isEnd ? `${trimmed}:59` : `${trimmed}:00`;
    }
    return trimmed;
  };

  // Date and Time parsing helpers for custom inputs
  const parseDatePart = (str: string) => {
    if (!str) return '2026-08-15';
    const clean = str.trim().replace('T', ' ');
    return clean.split(' ')[0] || '2026-08-15';
  };

  const parseTimePart = (str: string, defaultTime: string) => {
    if (!str) return defaultTime;
    const clean = str.trim().replace('T', ' ');
    const parts = clean.split(' ');
    if (parts.length > 1 && parts[1]) {
      return parts[1].slice(0, 5);
    }
    return defaultTime;
  };

  const handleStartDateChange = (newDate: string) => {
    const t = parseTimePart(periodStartDate, '00:00');
    setPeriodStartDate(`${newDate} ${t}:00`);
    setIsTimeRangeFromDrilldown(false);
  };

  const handleStartTimeChange = (newTime: string) => {
    const d = parseDatePart(periodStartDate);
    setPeriodStartDate(`${d} ${newTime}:00`);
    setIsTimeRangeFromDrilldown(false);
  };

  const handleEndDateChange = (newDate: string) => {
    const t = parseTimePart(periodEndDate, '23:59');
    setPeriodEndDate(`${newDate} ${t}:59`);
    setIsTimeRangeFromDrilldown(false);
  };

  const handleEndTimeChange = (newTime: string) => {
    const d = parseDatePart(periodEndDate);
    setPeriodEndDate(`${d} ${newTime}:59`);
    setIsTimeRangeFromDrilldown(false);
  };

  const handleResetToMonth = () => {
    setPeriodStartDate('2026-08-01 00:00:00');
    setPeriodEndDate('2026-08-30 23:59:59');
    setIsTimeRangeFromDrilldown(false);
    setDrilldownSourceLabel(null);
  };

  const handleApplyPreset = (preset: 'today' | '7days' | '15days' | 'month') => {
    setIsTimeRangeFromDrilldown(false);
    setDrilldownSourceLabel(null);
    if (preset === 'today') {
      setPeriodStartDate('2026-08-15 00:00:00');
      setPeriodEndDate('2026-08-15 23:59:59');
    } else if (preset === '7days') {
      setPeriodStartDate('2026-08-24 00:00:00');
      setPeriodEndDate('2026-08-30 23:59:59');
    } else if (preset === '15days') {
      setPeriodStartDate('2026-08-16 00:00:00');
      setPeriodEndDate('2026-08-30 23:59:59');
    } else if (preset === 'month') {
      setPeriodStartDate('2026-08-01 00:00:00');
      setPeriodEndDate('2026-08-30 23:59:59');
    }
  };

  // Merged fault expanded items
  const [expandedFaults, setExpandedFaults] = useState<Record<string, boolean>>({
    'fault-001': true
  });
  const [modalFault, setModalFault] = useState<MergedFault | null>(null);
  const [diagnosisFault, setDiagnosisFault] = useState<MergedFault | null>(null);

  // Availability alarms state & filters
  const [alarmSeverityFilter, setAlarmSeverityFilter] = useState<
    'ALL' | 'CRITICAL' | 'MAJOR' | 'ECO_EXEMPT' | 'EXEMPT'
  >('ALL');
  const [alarmSearchTerm, setAlarmSearchTerm] = useState<string>('');
  const [expandedAlarmId, setExpandedAlarmId] = useState<string | null>(
    initialTarget?.alarmId || null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ecoModalData, setEcoModalData] = useState<EcoExemptModalData | null>(null);

  // Interactive ECO Exemption Overrides
  const [ecoOverrides, setEcoOverrides] = useState<
    Record<
      string,
      {
        isEcoExempt: boolean;
        reason: string;
        operator: string;
        timestamp: string;
        ecoStartTime?: string;
        ecoEndTime?: string;
        ecoDurationMinutes?: number;
        isCustomEcoTime?: boolean;
      }
    >
  >({});

  // Interactive Work Order Association Overrides
  const [workOrderOverrides, setWorkOrderOverrides] = useState<Record<string, string | null>>({});
  const [associateModalAlarm, setAssociateModalAlarm] = useState<AvailabilityAlarmItem | null>(null);

  // Compute period alarms & devices for this site and custom period
  const { devices, alarms: rawAlarms } = useMemo(() => {
    return getEquipmentAndAlarmsForPeriod(site, periodStartDate, periodEndDate, workOrders);
  }, [site, periodStartDate, periodEndDate, workOrders]);

  // Merge ecoOverrides and workOrderOverrides into alarms
  const alarms: AvailabilityAlarmItem[] = useMemo(() => {
    return rawAlarms.map(a => {
      let item = { ...a };
      const override = ecoOverrides[a.id];
      if (override !== undefined) {
        item = {
          ...item,
          isEcoExempt: override.isEcoExempt,
          ecoExemptReason: override.reason,
          ecoExemptOperator: override.operator,
          ecoExemptTime: override.timestamp,
          ecoStartTime: override.ecoStartTime || a.triggerTime,
          ecoEndTime: override.ecoEndTime || a.clearTime,
          ecoDurationMinutes: override.ecoDurationMinutes !== undefined ? override.ecoDurationMinutes : a.durationMinutes,
          isCustomEcoTime: override.isCustomEcoTime,
          slaCounted: override.isEcoExempt ? false : a.slaCounted,
          equivalentInterruptionMinutes: override.isEcoExempt ? 0 : a.equivalentInterruptionMinutes,
          availabilityImpactPercent: override.isEcoExempt ? 0 : a.availabilityImpactPercent
        };
      }
      if (workOrderOverrides[a.id] !== undefined) {
        item.workOrderNo = workOrderOverrides[a.id] || undefined;
      }
      return item;
    });
  }, [rawAlarms, ecoOverrides, workOrderOverrides]);

  // Filtered alarms
  const filteredAlarms = useMemo(() => {
    return alarms.filter(a => {
      // Device filter
      if (selectedDeviceCode && a.deviceCode !== selectedDeviceCode) return false;
      // Severity & exemption filter
      if (alarmSeverityFilter === 'CRITICAL' && a.severity !== 'CRITICAL') return false;
      if (alarmSeverityFilter === 'MAJOR' && a.severity !== 'MAJOR') return false;
      if (alarmSeverityFilter === 'ECO_EXEMPT' && !a.isEcoExempt) return false;
      if (alarmSeverityFilter === 'EXEMPT' && !a.isExempt) return false;
      // Search term
      if (alarmSearchTerm) {
        const term = alarmSearchTerm.toLowerCase();
        return (
          a.code.toLowerCase().includes(term) ||
          a.title.toLowerCase().includes(term) ||
          a.deviceName.toLowerCase().includes(term) ||
          a.deviceCode.toLowerCase().includes(term) ||
          a.rootCause.toLowerCase().includes(term) ||
          (a.ecoExemptReason && a.ecoExemptReason.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [alarms, selectedDeviceCode, alarmSeverityFilter, alarmSearchTerm]);

  // Alarms KPI metrics
  const alarmsStats = useMemo(() => {
    const total = alarms.length;
    const critical = alarms.filter(a => a.severity === 'CRITICAL').length;
    const major = alarms.filter(a => a.severity === 'MAJOR').length;
    const ecoExempt = alarms.filter(a => a.isEcoExempt).length;
    const slaCountedMinutes = alarms
      .filter(a => a.slaCounted)
      .reduce((sum, a) => sum + a.equivalentInterruptionMinutes, 0);

    return {
      total,
      critical,
      major,
      ecoExempt,
      slaCountedMinutes
    };
  }, [alarms]);

  // Merged faults filtered by both device code and custom time period overlap
  const filteredMergedFaults = useMemo(() => {
    const list = site.mergedFaults || [];
    const pStart = normalizeDateTimeLocal(periodStartDate, false);
    const pEnd = normalizeDateTimeLocal(periodEndDate, true);

    return list.filter(f => {
      // Time overlap check
      const fStart = normalizeDateTimeLocal(f.startTime, false);
      const fEnd = f.endTime ? normalizeDateTimeLocal(f.endTime, true) : fStart;
      const isOverlap = fStart <= pEnd && fEnd >= pStart;
      if (!isOverlap) return false;

      // Device filter check
      if (!selectedDeviceCode) return true;
      const devLower = selectedDeviceCode.toLowerCase();
      const codeMatch = f.faultCode.toLowerCase().includes(devLower);
      const titleMatch = f.title.toLowerCase().includes(devLower);
      const rawMatch = f.rawEvents?.some(
        e =>
          e.code?.toLowerCase().includes(devLower) ||
          e.title?.toLowerCase().includes(devLower) ||
          e.description?.toLowerCase().includes(devLower)
      );
      return codeMatch || titleMatch || rawMatch;
    });
  }, [site.mergedFaults, selectedDeviceCode, periodStartDate, periodEndDate]);

  const totalInterruptionMinutes = (site.mergedFaults || []).reduce(
    (acc, f) => acc + f.equivalentInterruptionMinutes,
    0
  );

  const toggleFaultExpand = (faultId: string) => {
    setExpandedFaults(prev => ({
      ...prev,
      [faultId]: !prev[faultId]
    }));
  };

  // Handle open ECO exemption modal
  const handleOpenEcoModal = (alarm: AvailabilityAlarmItem) => {
    const alarmStart = alarm.triggerTime || '2026-08-15 08:30:00';
    const alarmEnd = getAlarmDefaultEndTime(alarm);
    const initialEcoStart = alarm.ecoStartTime || alarmStart;
    const initialEcoEnd = alarm.ecoEndTime || alarmEnd;
    const isCustom = Boolean(
      alarm.isCustomEcoTime ||
      (alarm.ecoStartTime && alarm.ecoStartTime !== alarmStart) ||
      (alarm.ecoEndTime && alarm.ecoEndTime !== alarmEnd)
    );
    const duration = calculateTimeDifferenceMinutes(initialEcoStart, initialEcoEnd) || alarm.durationMinutes || 45;

    setEcoModalData({
      alarm,
      reason: alarm.ecoExemptReason || '电网调度指令性限电 / 负荷低谷备用停机 (ECO电网调度免责条款)',
      customReason: '',
      operator: alarm.ecoExemptOperator || '现场运维调度·李维',
      alarmStartTime: alarmStart,
      alarmEndTime: alarmEnd,
      alarmDurationMinutes: alarm.durationMinutes || duration,
      ecoStartTime: initialEcoStart,
      ecoEndTime: initialEcoEnd,
      ecoDurationMinutes: duration,
      isCustomEcoTime: isCustom
    });
  };

  // Submit ECO exemption
  const handleConfirmEcoExempt = () => {
    if (!ecoModalData) return;
    const finalReason =
      ecoModalData.reason === 'CUSTOM'
        ? ecoModalData.customReason || '经现场审核确认的ECO外因停机(电网限电/线路检修)免责'
        : ecoModalData.reason;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setEcoOverrides(prev => ({
      ...prev,
      [ecoModalData.alarm.id]: {
        isEcoExempt: true,
        reason: finalReason,
        operator: ecoModalData.operator || '调度运维专工',
        timestamp: nowStr,
        ecoStartTime: ecoModalData.ecoStartTime,
        ecoEndTime: ecoModalData.ecoEndTime,
        ecoDurationMinutes: ecoModalData.ecoDurationMinutes,
        isCustomEcoTime: ecoModalData.isCustomEcoTime
      }
    }));

    const timeModeDesc = ecoModalData.isCustomEcoTime ? '自定义ECO时段' : '告警默认时段';
    setToastMessage(
      `已成功为告警【${ecoModalData.alarm.code}】标注 ECO 外因停机免责！生效时段: ${ecoModalData.ecoStartTime} ~ ${ecoModalData.ecoEndTime} (${timeModeDesc}，核免 ${ecoModalData.ecoDurationMinutes} 分钟)，SLA 考核停机时长已全额核免！`
    );
    setEcoModalData(null);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Cancel ECO exemption
  const handleCancelEcoExempt = (alarmId: string, alarmCode: string) => {
    setEcoOverrides(prev => ({
      ...prev,
      [alarmId]: {
        isEcoExempt: false,
        reason: '',
        operator: '',
        timestamp: '',
        ecoStartTime: undefined,
        ecoEndTime: undefined,
        ecoDurationMinutes: undefined,
        isCustomEcoTime: false
      }
    }));
    setToastMessage(`已取消告警【${alarmCode}】的 ECO 外因停机免责标注，恢复纳入 SLA 考核。`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Helper to find overlapping work orders for any alarm
  const getOverlappingWorkOrders = (alarm: AvailabilityAlarmItem): WorkOrder[] => {
    if (!workOrders || workOrders.length === 0) return [];
    let sMs = 0;
    let eMs = 0;
    try {
      sMs = new Date((alarm.triggerTime || '').replace(' ', 'T')).getTime();
      const endStr = alarm.clearTime || getAlarmDefaultEndTime(alarm);
      eMs = new Date(endStr.replace(' ', 'T')).getTime();
      if (isNaN(eMs) || eMs <= sMs) {
        eMs = sMs + (alarm.durationMinutes || 60) * 60000;
      }
    } catch {
      return [];
    }

    return workOrders.filter(wo => {
      if (wo.siteId && site.id && wo.siteId !== site.id) return false;
      let woStartMs = 0;
      let woEndMs = 0;
      try {
        woStartMs = new Date(wo.createTime.replace(' ', 'T')).getTime();
        const endStr = wo.closeTime || wo.solutionTime;
        if (endStr) {
          woEndMs = new Date(endStr.replace(' ', 'T')).getTime();
        } else {
          woEndMs = woStartMs + 24 * 3600 * 1000;
        }
      } catch {
        return false;
      }
      return sMs <= woEndMs && woStartMs <= eMs;
    });
  };

  const handleAssociateWorkOrder = (alarmId: string, orderNo: string) => {
    setWorkOrderOverrides(prev => ({
      ...prev,
      [alarmId]: orderNo
    }));
    setToastMessage(`已成功将告警关联至现场闭环工单【${orderNo}】！可在告警与工单间双向穿透`);
    setAssociateModalAlarm(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUnlinkWorkOrder = (alarmId: string) => {
    setWorkOrderOverrides(prev => ({
      ...prev,
      [alarmId]: null
    }));
    setToastMessage(`已解除该告警的工单关联`);
    setAssociateModalAlarm(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const clearDeviceFilter = () => {
    setSelectedDeviceCode(null);
    onClearTarget?.();
  };

  // Find target device detail if selected
  const activeDevice = selectedDeviceCode
    ? devices.find(d => d.deviceCode === selectedDeviceCode)
    : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center justify-between shadow-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drilldown Active Banner (When jumped from Core Equipment Status Statistics) */}
      {selectedDeviceCode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-blue-700 font-bold">
                  下钻锁定设备穿透中
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-black bg-blue-600 text-white shadow-2xs">
                  {selectedDeviceCode}
                </span>
                {activeDevice && (
                  <span className="text-xs font-bold text-slate-800">
                    {activeDevice.deviceName} ({activeDevice.model})
                  </span>
                )}
                {activeDevice && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      activeDevice.periodStatus === 'FAULT'
                        ? 'bg-red-100 text-red-700'
                        : activeDevice.periodStatus === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    工况: {activeDevice.periodStatusLabel}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                已自动为您穿透展示该核心设备的关联可用度告警与中断告警归并时序事件。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearDeviceFilter}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              <span>清除设备锁定 (查看站点全部)</span>
            </button>
            <button
              onClick={() => onNavigateTab(0)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回核心设备状态统计</span>
            </button>
          </div>
        </div>
      )}

      {/* Time Range Drilldown Linkage Banner (When jumped from Availability Details) */}
      {isTimeRangeFromDrilldown && (
        <div className="bg-gradient-to-r from-blue-50 via-cyan-50/70 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-blue-800 font-bold">
                  已保持单站可用度监控所选时段
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-black bg-blue-600 text-white shadow-2xs">
                  {drilldownSourceLabel || `${periodStartDate} ~ ${periodEndDate}`}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span>时段联动锁定中</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                当前中断告警与因果时序已精准同步该自定义时段（{periodStartDate} 至 {periodEndDate}）。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToMonth}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
              title="解除时段锁定，恢复查看全月"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>解除时段锁定 (重置全月)</span>
            </button>
            <button
              onClick={() => onNavigateTab(0)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回可用度详情</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Time Range Toolbar (支持自定义时段与快捷切换) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2.5 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="font-bold text-slate-900 text-sm">
              中断告警时段筛选与统计区间
            </span>
            <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded shadow-2xs">
              {periodStartDate} 至 {periodEndDate}
            </span>
            {isTimeRangeFromDrilldown && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                来自单站可用度下钻
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium mr-1">快捷时段:</span>
            <button
              onClick={() => handleApplyPreset('today')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                parseDatePart(periodStartDate) === '2026-08-15' && parseDatePart(periodEndDate) === '2026-08-15'
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              本日 (08-15)
            </button>
            <button
              onClick={() => handleApplyPreset('7days')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                parseDatePart(periodStartDate) === '2026-08-24' && parseDatePart(periodEndDate) === '2026-08-30'
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              近7天
            </button>
            <button
              onClick={() => handleApplyPreset('15days')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                parseDatePart(periodStartDate) === '2026-08-16' && parseDatePart(periodEndDate) === '2026-08-30'
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              近15天
            </button>
            <button
              onClick={() => handleApplyPreset('month')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                parseDatePart(periodStartDate) === '2026-08-01' && parseDatePart(periodEndDate) === '2026-08-30' && !isTimeRangeFromDrilldown
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              全月 (08-01~08-30)
            </button>
            <button
              onClick={handleResetToMonth}
              title="重置为全月"
              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date and Time custom inputs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 font-semibold whitespace-nowrap">自定义起止时段:</span>
            
            {/* Start Date & Time */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1 shadow-2xs">
              <span className="text-slate-400 font-medium">起:</span>
              <input
                type="date"
                value={parseDatePart(periodStartDate)}
                onChange={e => handleStartDateChange(e.target.value)}
                className="font-mono font-bold text-slate-800 text-xs focus:outline-none bg-transparent"
              />
              <input
                type="time"
                value={parseTimePart(periodStartDate, '00:00')}
                onChange={e => handleStartTimeChange(e.target.value)}
                className="font-mono font-bold text-slate-700 text-xs focus:outline-none bg-transparent border-l border-slate-200 pl-1"
              />
            </div>

            <span className="text-slate-400 font-bold">至</span>

            {/* End Date & Time */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1 shadow-2xs">
              <span className="text-slate-400 font-medium">止:</span>
              <input
                type="date"
                value={parseDatePart(periodEndDate)}
                onChange={e => handleEndDateChange(e.target.value)}
                className="font-mono font-bold text-slate-800 text-xs focus:outline-none bg-transparent"
              />
              <input
                type="time"
                value={parseTimePart(periodEndDate, '23:59')}
                onChange={e => handleEndTimeChange(e.target.value)}
                className="font-mono font-bold text-slate-700 text-xs focus:outline-none bg-transparent border-l border-slate-200 pl-1"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 self-end sm:self-auto">
            <span>当前时段内包含:</span>
            <span className="font-mono font-bold text-indigo-700">{filteredMergedFaults.length} 项中断归并</span>
            <span>·</span>
            <span className="font-mono font-bold text-amber-700">{filteredAlarms.length} 条可用度告警</span>
          </div>
        </div>
      </div>

      {/* Main Tab Banner & Sub-View Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                中断告警
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Rule R11 故障归并 / 中断告警 / ECO免责
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              合并呈现同站点中断归并事件因果时序与可用度告警清册，支持设备穿透溯源、ECO节能运行免责标注与
              SLA 考核核减。
            </p>
          </div>

          {/* Sub-view Switch Buttons */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setActiveSubView('merged')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubView === 'merged'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>中断归并事件 (Rule R11)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono">
                {filteredMergedFaults.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubView('alarms')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubView === 'alarms'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>可用度告警清册</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
                {filteredAlarms.length}
              </span>
              {alarmsStats.ecoExempt > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-100 text-cyan-800 font-mono flex items-center gap-0.5">
                  <ZapOff className="w-2.5 h-2.5 text-cyan-600" />
                  <span>{alarmsStats.ecoExempt} ECO免责</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-VIEW 1: INTERRUPTION MERGED EVENTS WATERFALL (Rule R11)              */}
        {/* ========================================================================= */}
        {activeSubView === 'merged' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Rule R11 Explanation Callout */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-900 font-semibold">
                  中断告警归并与根因追溯口径 (Rule R11)：
                </strong>
                同站点内时间窗相互重叠的事件记录（告警、工单、离线日志）自动归并形成展示单元。以等效
                PCS 中断时长为 SLA 考核计算依据，支持展开原始事件因果时序链瀑布流，实现从表象告警到根因诊断的穿透。
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-2xs">
                <span className="text-slate-500 font-medium">本周期归并故障数</span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {filteredMergedFaults.length}{' '}
                  <span className="text-xs text-slate-400 font-normal">场</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">重叠时间窗自动合并</div>
              </div>

              <div className="bg-slate-50 border border-red-200 p-4 rounded-lg shadow-2xs">
                <span className="text-red-700 font-semibold">累计等效 PCS 中断时长</span>
                <div className="text-2xl font-black font-mono text-red-600 mt-1">
                  {totalInterruptionMinutes}{' '}
                  <span className="text-xs text-slate-400 font-normal">分钟</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">扣减当期合同可用度 (Rule R2)</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-2xs">
                <span className="text-slate-500 font-medium">单次故障平均停机</span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {filteredMergedFaults.length > 0
                    ? (totalInterruptionMinutes / filteredMergedFaults.length).toFixed(1)
                    : 0}{' '}
                  <span className="text-xs text-slate-400 font-normal">分钟/场</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">包含排查与方案闭环耗时</div>
              </div>
            </div>

            {/* Merged Faults List */}
            {filteredMergedFaults.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center text-slate-500 shadow-2xs">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                <div className="font-bold text-slate-900">
                  {selectedDeviceCode
                    ? `设备【${selectedDeviceCode}】在本考核周期无重叠归并故障`
                    : '本考核周期无非计划停机归并故障'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {selectedDeviceCode
                    ? '可点击上方“可用度告警清册”查看该设备触发的单项可用度告警明细。'
                    : '站点核心设备运行平稳'}
                </div>
                {selectedDeviceCode && (
                  <button
                    onClick={() => setActiveSubView('alarms')}
                    className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <span>查看【{selectedDeviceCode}】可用度告警</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMergedFaults.map(fault => {
                  const isExpanded = expandedFaults[fault.id];
                  return (
                    <div
                      key={fault.id}
                      className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs transition-all hover:border-slate-300"
                    >
                      {/* Fault Header Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded bg-red-50 text-red-600 border border-red-200 mt-0.5 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                {fault.faultCode}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{fault.title}</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                                等效PCS中断 {fault.equivalentInterruptionMinutes} 分钟
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                              <strong className="text-slate-800 font-medium">根因诊断:</strong>{' '}
                              {fault.rootCause}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-500 mt-2 font-mono">
                              <span>
                                起止时间:{' '}
                                <strong className="text-slate-700">
                                  {fault.startTime} ~ {fault.endTime}
                                </strong>
                              </span>
                              <span>持续时间: {fault.durationMinutes} 分钟</span>
                              <span>归并原始事件: {fault.mergedEventsCount} 项</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => setDiagnosisFault(fault)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded text-xs font-bold shadow-2xs flex items-center gap-1 transition-colors"
                            title="调用 AI 诊断引擎分析本次停机故障根因与匹配 SOP"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI 故障诊断</span>
                          </button>
                          <button
                            onClick={() => setModalFault(fault)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>查看深度归因报告</span>
                          </button>
                          <button
                            onClick={() => toggleFaultExpand(fault.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? '收起事件链' : '展开原始事件链'}</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Raw Events Waterfall */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-blue-600" />
                              <span>原始因果事件时序瀑布流 (告警 / 工单 / 日志)</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              按发生时刻升序排列
                            </span>
                          </div>

                          <div className="space-y-2">
                            {fault.rawEvents.map((evt, idx) => (
                              <div
                                key={evt.id || idx}
                                className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-blue-50/20 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-slate-400 text-[11px] w-6 shrink-0">
                                    #{idx + 1}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                      evt.type === 'alarm'
                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                        : evt.type === 'workorder'
                                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    }`}
                                  >
                                    {evt.type === 'alarm'
                                      ? '告警事件'
                                      : evt.type === 'workorder'
                                      ? 'PCare工单'
                                      : '离线日志'}
                                  </span>
                                  <div>
                                    <div className="font-semibold text-slate-900">{evt.title}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                      {evt.description}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right text-[11px] text-slate-500 font-mono shrink-0 flex md:flex-col items-center md:items-end justify-between gap-1">
                                  <div>{evt.timestamp}</div>
                                  <div className="text-blue-600 font-mono font-medium">
                                    {evt.code}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 2: AVAILABILITY ALARMS & ECO EXEMPTION (单站可用度告警清册)       */}
        {/* ========================================================================= */}
        {activeSubView === 'alarms' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Alarms KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>可用度告警总数</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-lg font-black font-mono text-slate-800 mt-1">
                  {alarmsStats.total} <span className="text-xs font-sans font-normal">条</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  严重 <strong className="text-red-600">{alarmsStats.critical}</strong> · 重要{' '}
                  <strong className="text-amber-600">{alarmsStats.major}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-50/70 border border-cyan-300">
                <div className="text-[11px] text-cyan-900 font-semibold flex items-center justify-between">
                  <span>ECO 外因停机免责</span>
                  <ZapOff className="w-3.5 h-3.5 text-cyan-700" />
                </div>
                <div className="text-lg font-black font-mono text-cyan-800 mt-1">
                  {alarmsStats.ecoExempt} <span className="text-xs font-sans font-normal">条</span>
                </div>
                <div className="text-[10px] text-cyan-700 mt-0.5">外因停机 · 核免SLA考核</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-red-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>SLA 考核停机扣减</span>
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="text-lg font-black font-mono text-red-600 mt-1">
                  {alarmsStats.slaCountedMinutes}{' '}
                  <span className="text-xs font-sans font-normal">分钟</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  折合 {(alarmsStats.slaCountedMinutes / 60).toFixed(1)} 小时 (扣减考核)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>告警闭环处置率</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-lg font-black font-mono text-blue-700 mt-1">100%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">全量工单/免责追溯</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Severity & Exemption Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-700 flex items-center gap-1 mr-1">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    <span>级别与免责筛选:</span>
                  </span>
                  <button
                    onClick={() => setAlarmSeverityFilter('ALL')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      alarmSeverityFilter === 'ALL'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    全部 ({alarms.length})
                  </button>
                  <button
                    onClick={() => setAlarmSeverityFilter('CRITICAL')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      alarmSeverityFilter === 'CRITICAL'
                        ? 'bg-red-600 text-white font-bold'
                        : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>严重停机 ({alarmsStats.critical})</span>
                  </button>
                  <button
                    onClick={() => setAlarmSeverityFilter('MAJOR')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      alarmSeverityFilter === 'MAJOR'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>重要告警 ({alarmsStats.major})</span>
                  </button>
                  <button
                    onClick={() => setAlarmSeverityFilter('ECO_EXEMPT')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      alarmSeverityFilter === 'ECO_EXEMPT'
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-white text-cyan-800 border border-cyan-300 hover:bg-cyan-50'
                    }`}
                  >
                    <ZapOff className="w-3 h-3 text-cyan-600" />
                    <span>ECO外因免责 ({alarmsStats.ecoExempt})</span>
                  </button>
                  <button
                    onClick={() => setAlarmSeverityFilter('EXEMPT')}
                    className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      alarmSeverityFilter === 'EXEMPT'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    <span>免责检修</span>
                  </button>
                </div>

                {/* Alarm Search Box */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="搜索告警编号、标题、设备、ECO免责..."
                    value={alarmSearchTerm}
                    onChange={e => setAlarmSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Device Quick Filters */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium">按设备筛选:</span>
                <button
                  onClick={() => setSelectedDeviceCode(null)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    selectedDeviceCode === null
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  全部设备
                </button>
                {devices.map(d => {
                  const isSelected = selectedDeviceCode === d.deviceCode;
                  const hasAlarms = d.alarmCountInPeriod > 0;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDeviceCode(isSelected ? null : d.deviceCode)}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : hasAlarms
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{d.deviceCode}</span>
                      {hasAlarms && (
                        <span className="text-[10px] font-bold">({d.alarmCountInPeriod})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alarms List */}
            {filteredAlarms.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-10 text-center text-slate-500 shadow-2xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <div className="font-bold text-slate-900">未检索到符合条件的可用度告警</div>
                <div className="text-xs text-slate-400 mt-1">可尝试调整筛选级别或清空搜索词</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlarms.map(alarm => {
                  const isExpanded = expandedAlarmId === alarm.id;
                  const isCritical = alarm.severity === 'CRITICAL';
                  const isMajor = alarm.severity === 'MAJOR';
                  const overlappingWOs = getOverlappingWorkOrders(alarm);
                  const linkedOrder = alarm.workOrderNo ? (workOrders || []).find(w => w.orderNo === alarm.workOrderNo) : null;

                  return (
                    <div
                      key={alarm.id}
                      className={`rounded-xl border transition-all p-4 text-xs ${
                        alarm.isEcoExempt
                          ? 'bg-cyan-50/25 border-cyan-300 shadow-2xs'
                          : isCritical
                          ? 'bg-white border-red-200 hover:border-red-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                              alarm.isEcoExempt
                                ? 'bg-cyan-100 text-cyan-800'
                                : isCritical
                                ? 'bg-red-100 text-red-700'
                                : isMajor
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {alarm.isEcoExempt ? (
                              <ZapOff className="w-4 h-4 text-cyan-700" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-slate-800">
                                {alarm.code}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">
                                {alarm.title}
                              </span>

                              {/* Severity Badge */}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isCritical
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : isMajor
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {isCritical ? '严重停运' : isMajor ? '重要告警' : '一般预警'}
                              </span>

                              {/* Device Badge */}
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                                {alarm.deviceCode} · {alarm.deviceName}
                              </span>

                              {/* ECO Exemption Badge */}
                              {alarm.isEcoExempt ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-600 text-white shadow-2xs flex items-center gap-1">
                                  <ZapOff className="w-3 h-3 text-white" />
                                  <span>ECO外因停机免责 (电网限电/线路检修，已豁免SLA考核)</span>
                                </span>
                              ) : alarm.isExempt ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                                  检修免责
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                  计入 SLA 考核
                                </span>
                              )}
                            </div>

                            {/* Trigger & Duration Times */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-mono">
                              <span>
                                触发时刻: <strong className="text-slate-700">{alarm.triggerTime}</strong>
                              </span>
                              <span>
                                恢复时刻:{' '}
                                <strong className="text-slate-700">
                                  {alarm.clearTime || '已自动复归'}
                                </strong>
                              </span>
                              <span>
                                持续时长: <strong>{alarm.durationMinutes} 分钟</strong>
                              </span>
                              <span>
                                SLA 考核停运:{' '}
                                <strong
                                  className={
                                    alarm.equivalentInterruptionMinutes > 0
                                      ? 'text-red-600'
                                      : 'text-emerald-600'
                                  }
                                >
                                  {alarm.equivalentInterruptionMinutes} 分钟
                                </strong>
                              </span>
                              <span>
                                可用度贡献影响:{' '}
                                <strong
                                  className={
                                    alarm.availabilityImpactPercent > 0
                                      ? 'text-red-600'
                                      : 'text-emerald-600'
                                  }
                                >
                                  -{alarm.availabilityImpactPercent}%
                                </strong>
                              </span>
                            </div>

                            {/* Linked Work Order or Overlapping Work Order Prompt */}
                            {alarm.workOrderNo ? (
                              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span className="text-slate-600">已关联现场工单:</span>
                                  <strong className="font-mono text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs font-bold">
                                    {alarm.workOrderNo}
                                  </strong>
                                  {linkedOrder && (
                                    <span className="text-slate-700 font-medium truncate max-w-[280px]">
                                      ({linkedOrder.title})
                                    </span>
                                  )}
                                  {linkedOrder?.assignee && (
                                    <span className="text-slate-400 font-mono text-[11px]">
                                      · 负责人: {linkedOrder.assignee}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => setAssociateModalAlarm(alarm)}
                                    className="px-2 py-1 rounded bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                    title="更换所关联的现场工单"
                                  >
                                    <Link2 className="w-3 h-3 text-indigo-600" />
                                    <span>更换工单</span>
                                  </button>
                                  <button
                                    onClick={() => handleUnlinkWorkOrder(alarm.id)}
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-[11px] font-medium transition-colors cursor-pointer"
                                    title="解除与工单的关联"
                                  >
                                    <Unlink className="w-3 h-3" />
                                    <span>解除</span>
                                  </button>
                                  <button
                                    onClick={() => onNavigateTab(2)}
                                    className="px-2 py-1 text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-0.5"
                                  >
                                    <span>前往工单</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : overlappingWOs.length > 0 ? (
                              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-50/90 border border-amber-300 text-xs text-amber-950 shadow-2xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="font-bold text-amber-900">提示：告警发生时段与现场工单重叠！可能关联工单：</span>
                                  <span className="font-mono font-bold text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
                                    {overlappingWOs[0].orderNo}
                                  </span>
                                  <span className="text-amber-800 truncate max-w-[240px] font-medium">
                                    {overlappingWOs[0].title}
                                  </span>
                                  {overlappingWOs.length > 1 && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold font-mono">
                                      共 {overlappingWOs.length} 个重叠工单
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleAssociateWorkOrder(alarm.id, overlappingWOs[0].orderNo)}
                                    className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                    title={`一键关联检测到的时段重叠工单 ${overlappingWOs[0].orderNo}`}
                                  >
                                    <Link2 className="w-3 h-3" />
                                    <span>关联此工单</span>
                                  </button>
                                  <button
                                    onClick={() => setAssociateModalAlarm(alarm)}
                                    className="px-2 py-1 rounded-md bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                    title="查看全部重叠工单时段与详情并选择关联"
                                  >
                                    <span>{overlappingWOs.length > 1 ? `挑选全部(${overlappingWOs.length})` : '时段详情'}</span>
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            {/* ECO Rationale if exempt */}
                            {alarm.isEcoExempt && alarm.ecoExemptReason && (
                              <div className="mt-2 text-[11px] bg-cyan-50/90 text-cyan-950 p-2.5 rounded-lg border border-cyan-200 space-y-1.5">
                                <div className="flex items-start gap-1.5">
                                  <ZapOff className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <strong>ECO 外因停机免责依据:</strong> {alarm.ecoExemptReason}
                                    {alarm.ecoExemptOperator && (
                                      <span className="text-cyan-800 ml-2">
                                        (核准人: {alarm.ecoExemptOperator} · 生效时间:{' '}
                                        {alarm.ecoExemptTime || '即时生效'})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-cyan-200/60 font-mono text-[10px] text-cyan-900">
                                  <Clock className="w-3 h-3 text-cyan-700" />
                                  <span>
                                    ECO 免责时段: <strong className="text-cyan-950">{alarm.ecoStartTime || alarm.triggerTime}</strong> 至{' '}
                                    <strong className="text-cyan-950">{alarm.ecoEndTime || alarm.clearTime || '已自动复归'}</strong>
                                  </span>
                                  <span>
                                    (核免时长: <strong className="text-cyan-950 font-bold">{alarm.ecoDurationMinutes || alarm.durationMinutes} 分钟</strong>)
                                  </span>
                                  {alarm.isCustomEcoTime && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-sans font-bold">
                                      自定义ECO时段
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          {/* ECO Exemption Buttons */}
                          {alarm.isEcoExempt ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEcoModal(alarm)}
                                className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="查看并修改当前告警的 ECO 外因起止时间或依据条款"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-cyan-600" />
                                <span>修改ECO时间/依据</span>
                              </button>
                              <button
                                onClick={() => handleCancelEcoExempt(alarm.id, alarm.code)}
                                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                title="撤销该告警的 ECO 外因停机免责标注，恢复纳入 SLA 考核"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                                <span>取消免责</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenEcoModal(alarm)}
                              className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="标注外部电网限电或线路检修等 ECO 外因停机免责"
                            >
                              <ZapOff className="w-3.5 h-3.5 text-cyan-700" />
                              <span>标注ECO外因免责</span>
                            </button>
                          )}

                          {/* Link Work Order Button */}
                          <button
                            onClick={() => setAssociateModalAlarm(alarm)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                              alarm.workOrderNo
                                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                                : overlappingWOs.length > 0
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-2xs font-bold'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                            title={
                              alarm.workOrderNo
                                ? `已关联工单: ${alarm.workOrderNo}，点击可更换`
                                : overlappingWOs.length > 0
                                ? `检测到 ${overlappingWOs.length} 个时段重叠工单，点击关联`
                                : '关联现场消缺工单'
                            }
                          >
                            <Link2
                              className={`w-3.5 h-3.5 ${
                                alarm.workOrderNo
                                  ? 'text-indigo-600'
                                  : overlappingWOs.length > 0
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                              }`}
                            />
                            <span>{alarm.workOrderNo ? '已关联工单' : '关联工单'}</span>
                            {!alarm.workOrderNo && overlappingWOs.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </button>

                          {/* AI Diagnostic Button */}
                          <button
                            onClick={() => {
                              const syntheticFault: MergedFault = {
                                id: `synth-${alarm.id}`,
                                faultCode: alarm.code,
                                siteId: site.id,
                                siteName: site.siteName,
                                title: `${alarm.deviceName} - ${alarm.title}`,
                                startTime: alarm.triggerTime,
                                endTime: alarm.clearTime || alarm.triggerTime,
                                durationMinutes: alarm.durationMinutes,
                                equivalentInterruptionMinutes: alarm.equivalentInterruptionMinutes,
                                impactPercentage: alarm.availabilityImpactPercent,
                                mergedEventsCount: 1,
                                rootCause: alarm.rootCause,
                                rawEvents: [
                                  {
                                    id: `evt-${alarm.id}`,
                                    timestamp: alarm.triggerTime,
                                    type: 'alarm',
                                    title: alarm.title,
                                    code: alarm.code,
                                    severity: alarm.severity,
                                    description: alarm.rootCause,
                                    durationMinutes: alarm.durationMinutes,
                                    equivalentInterruptionMinutes: alarm.equivalentInterruptionMinutes
                                  }
                                ]
                              };
                              setDiagnosisFault(syntheticFault);
                            }}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>AI 根因分析</span>
                          </button>

                          {/* Expand Details */}
                          <button
                            onClick={() =>
                              setExpandedAlarmId(isExpanded ? null : alarm.id)
                            }
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? '收起详情' : '展开详情'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Alarm Details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 text-xs bg-slate-50/70 p-3 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <strong className="text-slate-800 font-semibold">
                                根因诊断与机理分析:
                              </strong>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">
                                {alarm.rootCause}
                              </p>
                            </div>
                            <div>
                              <strong className="text-slate-800 font-semibold">
                                处置闭环与消缺方案:
                              </strong>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">
                                {alarm.solution || '系统已自动自适应复归，持续监视工况运行。'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                            <div className="flex items-center gap-3">
                              {alarm.workOrderNo && (
                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                                  关联工单: <strong>{alarm.workOrderNo}</strong>
                                </span>
                              )}
                              <span>处理动作: {alarm.actionTaken || '自检复归 / 远端监控确认'}</span>
                            </div>

                            <button
                              onClick={() => {
                                onNavigateTab(2); // Work Orders tab
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                            >
                              <span>前往【工单详情】追溯</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ECO Exemption Tagging Modal */}
      {ecoModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4 max-h-[92vh] flex flex-col">
            {/* 弹框顶部 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                  <ZapOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">标注 ECO 外因停机免责确认</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    站点: {site.siteName} · 告警: {ecoModalData.alarm.code} · 设备: {ecoModalData.alarm.deviceCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEcoModalData(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3.5 text-xs pr-1">
              {/* 1. 当前告警基础信息与 SLA 影响 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{ecoModalData.alarm.title}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {ecoModalData.alarm.deviceName}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  {ecoModalData.alarm.rootCause}
                </div>
                <div className="text-[11px] text-red-600 font-medium pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-1">
                  <span>当前计入 SLA 考核停运: <strong className="font-mono text-red-700">{ecoModalData.alarm.equivalentInterruptionMinutes} 分钟</strong></span>
                  <span className="text-cyan-800 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    标注为外因停机后将全额核减为 0 分钟
                  </span>
                </div>
              </div>

              {/* 2. 当前告警原始起止时间展示 (基准参照区) */}
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/90 space-y-2">
                <div className="flex items-center justify-between text-blue-950 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>当前告警原始起止时间 (基准参照)</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-medium">
                    原始持续: {ecoModalData.alarmDurationMinutes} 分钟
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                    <span className="text-slate-400 block text-[10px]">告警开始时间 (Trigger Time)</span>
                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                      {ecoModalData.alarmStartTime}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
                    <span className="text-slate-400 block text-[10px]">告警结束时间 (Clear Time)</span>
                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                      {ecoModalData.alarmEndTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. ECO 外因免责时间配置区 (默认这段时间，并支持修改为自定义ECO时间) */}
              <div className="p-3.5 bg-cyan-50/70 rounded-xl border border-cyan-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-cyan-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-950 text-xs flex items-center gap-1.5">
                        <ZapOff className="w-3.5 h-3.5 text-cyan-700" />
                        <span>ECO 外因免责生效时段</span>
                      </span>
                      {ecoModalData.isCustomEcoTime ? (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-amber-700" />
                          已修改为自定义 ECO 时间
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          默认匹配告警时间
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-800/90 mt-0.5">
                      默认采用当前告警的起止时间。如外部电网调度限电或线路检修时段与告警不同，可直接修改为实际的 ECO 时间。
                    </p>
                  </div>

                  {/* 一键恢复默认告警时间按钮 */}
                  {ecoModalData.isCustomEcoTime && (
                    <button
                      type="button"
                      onClick={() => {
                        setEcoModalData({
                          ...ecoModalData,
                          ecoStartTime: ecoModalData.alarmStartTime,
                          ecoEndTime: ecoModalData.alarmEndTime,
                          ecoDurationMinutes: ecoModalData.alarmDurationMinutes,
                          isCustomEcoTime: false
                        });
                      }}
                      className="self-start sm:self-auto px-2.5 py-1 bg-white hover:bg-cyan-100 text-cyan-800 border border-cyan-300 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs shrink-0 cursor-pointer"
                      title="重置为告警原始开始与结束时间"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-600" />
                      <span>恢复默认告警时间</span>
                    </button>
                  )}
                </div>

                {/* 开始与结束时间输入框 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-700" />
                        <span>ECO 开始时间 (自定义):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">YYYY-MM-DD HH:mm:ss</span>
                    </label>
                    <input
                      type="text"
                      value={ecoModalData.ecoStartTime}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        const isCustom = newStart !== ecoModalData.alarmStartTime || ecoModalData.ecoEndTime !== ecoModalData.alarmEndTime;
                        const diff = calculateTimeDifferenceMinutes(newStart, ecoModalData.ecoEndTime);
                        setEcoModalData({
                          ...ecoModalData,
                          ecoStartTime: newStart,
                          ecoDurationMinutes: diff,
                          isCustomEcoTime: isCustom
                        });
                      }}
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-cyan-500 rounded-lg text-xs font-mono text-slate-900 shadow-2xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-700" />
                        <span>ECO 结束时间 (自定义):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">YYYY-MM-DD HH:mm:ss</span>
                    </label>
                    <input
                      type="text"
                      value={ecoModalData.ecoEndTime}
                      onChange={(e) => {
                        const newEnd = e.target.value;
                        const isCustom = ecoModalData.ecoStartTime !== ecoModalData.alarmStartTime || newEnd !== ecoModalData.alarmEndTime;
                        const diff = calculateTimeDifferenceMinutes(ecoModalData.ecoStartTime, newEnd);
                        setEcoModalData({
                          ...ecoModalData,
                          ecoEndTime: newEnd,
                          ecoDurationMinutes: diff,
                          isCustomEcoTime: isCustom
                        });
                      }}
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-cyan-500 rounded-lg text-xs font-mono text-slate-900 shadow-2xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* 快捷微调结束时间按钮 */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                  <span className="text-slate-500 text-[10px]">快捷调整结束时间:</span>
                  {[
                    { label: '+15分钟', mins: 15 },
                    { label: '+30分钟', mins: 30 },
                    { label: '+1小时', mins: 60 },
                    { label: '-15分钟', mins: -15 }
                  ].map(adj => (
                    <button
                      key={adj.label}
                      type="button"
                      onClick={() => {
                        const newEnd = adjustTimeStringByMinutes(ecoModalData.ecoEndTime, adj.mins);
                        const isCustom = ecoModalData.ecoStartTime !== ecoModalData.alarmStartTime || newEnd !== ecoModalData.alarmEndTime;
                        const diff = calculateTimeDifferenceMinutes(ecoModalData.ecoStartTime, newEnd);
                        setEcoModalData({
                          ...ecoModalData,
                          ecoEndTime: newEnd,
                          ecoDurationMinutes: diff,
                          isCustomEcoTime: isCustom
                        });
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded text-[10px] font-mono font-medium shadow-2xs cursor-pointer transition-colors"
                    >
                      {adj.label}
                    </button>
                  ))}
                </div>

                {/* 实时核算提示条 */}
                <div className="p-2.5 bg-white rounded-lg border border-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-[11px]">ECO 外因免责核免时长:</span>
                      <span className="font-mono font-bold text-cyan-700 text-sm">
                        {ecoModalData.ecoDurationMinutes} 分钟
                      </span>
                      {ecoModalData.isCustomEcoTime && (
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          (偏差: {ecoModalData.ecoDurationMinutes - ecoModalData.alarmDurationMinutes >= 0 ? `+${ecoModalData.ecoDurationMinutes - ecoModalData.alarmDurationMinutes}` : `${ecoModalData.ecoDurationMinutes - ecoModalData.alarmDurationMinutes}`} 分钟)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {ecoModalData.isCustomEcoTime
                        ? `自定义时间已生效，系统将以填写的 ECO 时间区间全额核免 ${ecoModalData.ecoDurationMinutes} 分钟 SLA 考核。`
                        : `默认时间已生效，系统以告警完整起止时段 (${ecoModalData.alarmDurationMinutes} 分钟) 全额核免 SLA 考核。`}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. ECO 免责依据条款选择 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  选择外因停机(ECO)免责依据条款:
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      key: '电网调度指令性限电 / 负荷低谷备用停机 (ECO电网调度免责条款)',
                      label: '电网调度指令性限电 / 负荷低谷备用停机 (ECO电网调度免责条款)'
                    },
                    {
                      key: '外部输配电线路检修 / 变电站配合停电停机 (外因线路免责条款)',
                      label: '外部输配电线路检修 / 变电站配合停电停机 (外因线路免责条款)'
                    },
                    {
                      key: '电网频率/电压异常越限导致机组外部联锁解列停机 (电网故障外因免责)',
                      label: '电网频率/电压异常越限导致机组外部联锁解列停机 (电网故障外因免责)'
                    },
                    {
                      key: '极端天气防灾指令 / 外部不可抗力要求解列备用 (不可抗力外因免责)',
                      label: '极端天气防灾指令 / 外部不可抗力要求解列备用 (不可抗力外因免责)'
                    },
                    {
                      key: 'CUSTOM',
                      label: '其他自定义外因停机(ECO)免责依据与调度令号...'
                    }
                  ].map(opt => (
                    <label
                      key={opt.key}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        ecoModalData.reason === opt.key
                          ? 'bg-cyan-50/70 border-cyan-400 text-cyan-950 font-semibold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ecoReason"
                        checked={ecoModalData.reason === opt.key}
                        onChange={() =>
                          setEcoModalData({ ...ecoModalData, reason: opt.key })
                        }
                        className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-xs">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {ecoModalData.reason === 'CUSTOM' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    请输入自定义外因停机免责条款与调度令号:
                  </label>
                  <textarea
                    rows={2}
                    value={ecoModalData.customReason}
                    onChange={e =>
                      setEcoModalData({ ...ecoModalData, customReason: e.target.value })
                    }
                    placeholder="请输入调度令号或供电局线路检修通知文号..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500 shadow-2xs"
                  />
                </div>
              )}

              {/* 5. 核准人 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  核准人 / 运维调度员:
                </label>
                <input
                  type="text"
                  value={ecoModalData.operator}
                  onChange={e =>
                    setEcoModalData({ ...ecoModalData, operator: e.target.value })
                  }
                  placeholder="例如: 现场运维调度·李维"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500 shadow-2xs"
                />
              </div>
            </div>

            {/* 弹框底部操作按钮 */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 shrink-0">
              <button
                onClick={() => setEcoModalData(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmEcoExempt}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认标注 ECO 外因免责 ({ecoModalData.ecoDurationMinutes} 分钟已核免)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Deep Root-Cause Causality Report */}
      {modalFault && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-red-50 text-red-600 border border-red-200">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    故障归因与事件链深度报告 ({modalFault.faultCode})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    所属站点: {site.siteName} · 合同号: {site.contractNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalFault(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-xs space-y-4 pr-1">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{modalFault.title}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">起止时间</span>
                    <div className="font-mono font-medium text-slate-800 mt-0.5">
                      {modalFault.startTime} ~{' '}
                      {modalFault.endTime ? modalFault.endTime.slice(-5) : '处理中'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">持续时长</span>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">
                      {modalFault.durationMinutes} 分钟
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">等效PCS扣减</span>
                    <div className="font-mono font-bold text-red-600 mt-0.5">
                      {modalFault.equivalentInterruptionMinutes} 分钟
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">归并事件数</span>
                    <div className="font-mono font-bold text-blue-600 mt-0.5">
                      {modalFault.mergedEventsCount} 项
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI 智能诊断与根因分析结论</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{modalFault.rootCause}</p>
                <div className="pt-2 border-t border-blue-200/60 text-[11px] text-blue-800 space-y-1">
                  <div>
                    <strong>● 预防治理建议:</strong> 针对变流器 IGBT
                    驱动模块增加定期风道巡检频次，建议加装进风口智能压差变送器，提前 48 小时预警风道积尘阻塞。
                  </div>
                  <div>
                    <strong>● 组网升级建议:</strong> 建议评估将该站升级为【双机热备】拓扑，单 PCS
                    检修时不产生等效停运中断。
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>全时序原始事件流追踪</span>
                </div>
                <div className="space-y-2">
                  {modalFault.rawEvents.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-slate-400 text-[11px] mt-0.5">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{evt.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                evt.severity === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800'
                                  : evt.severity === 'MAJOR'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {evt.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{evt.description}</p>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                        <div>{evt.timestamp}</div>
                        <div className="text-blue-600">{evt.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => {
                  setModalFault(null);
                  onNavigateTab(2); // Work orders tab
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>查看关联合同工单</span>
              </button>

              <button
                onClick={() => setModalFault(null)}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI Fault Diagnosis Wizard */}
      {diagnosisFault && (
        <NewDiagnosisWizardModal
          initialSiteId={site.id}
          initialEvent={{
            eventId: diagnosisFault.id,
            eventTitle: `${diagnosisFault.title} (${diagnosisFault.faultCode})`,
            eventType: 'fault',
            eventTime: diagnosisFault.startTime,
            severity: 'CRITICAL',
            description: `等效 PCS 中断 ${diagnosisFault.equivalentInterruptionMinutes} 分钟，起止: ${diagnosisFault.startTime} ~ ${diagnosisFault.endTime}。根因初步定性: ${diagnosisFault.rootCause}`
          }}
          onClose={() => setDiagnosisFault(null)}
          onLaunchTask={newTask => {
            createDiagnosisTask(newTask);
            setActiveDiagnosisTaskId(newTask.id);
            setActiveTab('fault_diagnosis');
          }}
        />
      )}
      {/* MODAL 4: Associate Work Order Modal */}
      <AssociateWorkOrderModal
        isOpen={Boolean(associateModalAlarm)}
        onClose={() => setAssociateModalAlarm(null)}
        alarm={associateModalAlarm}
        siteWorkOrders={workOrders || []}
        currentAssociatedOrderNo={associateModalAlarm?.workOrderNo}
        onAssociate={(alarmId, orderNo) => handleAssociateWorkOrder(alarmId, orderNo)}
        onUnlink={alarmId => handleUnlinkWorkOrder(alarmId)}
      />
    </div>
  );
};
