import { Site, CoreDevice, WorkOrder } from '../types';

export interface AvailabilityAlarmItem {
  id: string;
  code: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING';
  deviceCode: string;
  deviceName: string;
  deviceType: 'PCS_INVERTER' | 'BMS_CLUSTER' | 'EMS_HOST' | 'TRANSFORMER' | 'HVAC_COOLING';
  triggerTime: string;
  clearTime?: string;
  durationMinutes: number;
  equivalentInterruptionMinutes: number;
  availabilityImpactPercent: number;
  isExempt: boolean; // 是否免责 (如计划检修)
  isEcoExempt?: boolean; // 是否标注ECO免责 (节能待机/经济运行免责)
  ecoExemptReason?: string; // ECO免责原因说明
  ecoExemptTime?: string; // 标注生效时间
  ecoExemptOperator?: string; // 标注人
  slaCounted: boolean; // 是否计入SLA考核
  status: 'ACTIVE' | 'RESOLVED' | 'AUTO_CLEARED';
  rootCause: string;
  solution?: string;
  workOrderNo?: string;
  actionTaken?: string;
}

export interface PeriodDeviceStatus {
  id: string;
  deviceCode: string;
  deviceName: string;
  deviceType: 'PCS_INVERTER' | 'BMS_CLUSTER' | 'EMS_HOST' | 'TRANSFORMER' | 'HVAC_COOLING';
  model: string;
  isKeyDevice: boolean;
  ratedPowerKw?: number;
  periodStatus: 'NORMAL' | 'WARNING' | 'FAULT' | 'MAINTENANCE';
  periodStatusLabel: string;
  faultCountInPeriod: number;
  alarmCountInPeriod: number;
  totalInterruptionMinutesInPeriod: number;
  availabilityContribution: number; // 0 ~ 100%
  latestConditionNotes: string;
  hasImpactedAvailability: boolean;
}

export interface EquipmentAndAlarmsResult {
  devices: PeriodDeviceStatus[];
  alarms: AvailabilityAlarmItem[];
  stats: {
    totalDevices: number;
    normalDevices: number;
    warningDevices: number;
    faultDevices: number;
    maintenanceDevices: number;
    totalAlarms: number;
    criticalAlarms: number;
    majorAlarms: number;
    ecoExemptAlarms: number;
    totalInterruptionMinutes: number;
    slaCountedInterruptionMinutes: number;
  };
}

const DEFAULT_DEVICES: CoreDevice[] = [
  {
    id: 'dev-101',
    deviceCode: 'PCS-INV-01A',
    deviceName: '1.25MW 储能变流器 A组 (主)',
    deviceType: 'PCS_INVERTER',
    model: 'EN-PCS-1250-PRO',
    status: 'NORMAL',
    isKeyDevice: true,
    installedDate: '2024-05-12',
    ratedPowerKw: 1250
  },
  {
    id: 'dev-102',
    deviceCode: 'PCS-INV-01B',
    deviceName: '1.25MW 储能变流器 B组 (备)',
    deviceType: 'PCS_INVERTER',
    model: 'EN-PCS-1250-PRO',
    status: 'WARNING',
    isKeyDevice: true,
    installedDate: '2024-05-12',
    ratedPowerKw: 1250
  },
  {
    id: 'dev-103',
    deviceCode: 'EMS-CTRL-01',
    deviceName: 'EMS 能量管理主控单元',
    deviceType: 'EMS_HOST',
    model: 'EN-EMS-5000',
    status: 'NORMAL',
    isKeyDevice: true,
    installedDate: '2024-05-10'
  },
  {
    id: 'dev-104',
    deviceCode: 'BMS-RACK-01',
    deviceName: '磷酸铁锂高压电池簇 01号',
    deviceType: 'BMS_CLUSTER',
    model: 'CATL-LFP-280Ah',
    status: 'NORMAL',
    isKeyDevice: true,
    installedDate: '2024-05-15'
  },
  {
    id: 'dev-105',
    deviceCode: 'TR-MAIN-01',
    deviceName: '35kV 主升压变压器',
    deviceType: 'TRANSFORMER',
    model: 'S11-2500/35',
    status: 'NORMAL',
    isKeyDevice: true,
    installedDate: '2024-05-08',
    ratedPowerKw: 2500
  },
  {
    id: 'dev-106',
    deviceCode: 'HVAC-COOL-01',
    deviceName: '集装箱工业液冷温控机组',
    deviceType: 'HVAC_COOLING',
    model: 'EN-COLD-45KW',
    status: 'NORMAL',
    isKeyDevice: false,
    installedDate: '2024-05-10'
  }
];

/**
 * Generates all availability-impacting alarms and period device statuses for a site across a given date range.
 */
export function getEquipmentAndAlarmsForPeriod(
  site: Site,
  startDateStr: string,
  endDateStr: string,
  workOrders: WorkOrder[] = []
): EquipmentAndAlarmsResult {
  const sDate = startDateStr.slice(0, 10);
  const eDate = endDateStr.slice(0, 10);

  // Helper to normalize datetime string to "YYYY-MM-DD HH:mm:ss"
  const normalizeDateTime = (dtStr: string, isEnd = false): string => {
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

  const periodStartFull = normalizeDateTime(startDateStr, false);
  const periodEndFull = normalizeDateTime(endDateStr, true);

  // Check if an event or interval [eventStart, eventEnd] overlaps with [periodStartFull, periodEndFull]
  const isTimeOverlap = (eventStart?: string, eventEnd?: string) => {
    if (!eventStart) return false;
    const eStart = normalizeDateTime(eventStart, false);
    const eEnd = eventEnd ? normalizeDateTime(eventEnd, true) : eStart;
    return eStart <= periodEndFull && eEnd >= periodStartFull;
  };

  // Calculate actual overlapping minutes between an event and the requested period
  const calculateOverlapMinutes = (startStr: string, endStr: string | undefined, totalMins: number) => {
    if (!startStr) return 0;
    try {
      const eStart = new Date(normalizeDateTime(startStr, false).replace(' ', 'T')).getTime();
      const eEnd = endStr
        ? new Date(normalizeDateTime(endStr, true).replace(' ', 'T')).getTime()
        : eStart + totalMins * 60 * 1000;
      const pStart = new Date(periodStartFull.replace(' ', 'T')).getTime();
      const pEnd = new Date(periodEndFull.replace(' ', 'T')).getTime();

      const overlapStart = Math.max(eStart, pStart);
      const overlapEnd = Math.min(eEnd, pEnd);
      if (overlapEnd <= overlapStart) return 0;
      return Math.round((overlapEnd - overlapStart) / (60 * 1000));
    } catch {
      return totalMins;
    }
  };

  // 1. Gather all potential alarms from site's mergedFaults
  const alarmsList: AvailabilityAlarmItem[] = [];

  // Extract from mergedFaults
  (site.mergedFaults || []).forEach(f => {
    if (isTimeOverlap(f.startTime, f.endTime)) {
      // Look for alarms in rawEvents
      const rawAlarms = f.rawEvents?.filter(e => e.type === 'alarm') || [];
      if (rawAlarms.length > 0) {
        rawAlarms.forEach(ra => {
          if (isTimeOverlap(ra.timestamp, f.endTime)) {
            // Determine device from title or code
            let devCode = 'PCS-INV-01B';
            let devName = '1.25MW 储能变流器 B组 (备)';
            let devType: AvailabilityAlarmItem['deviceType'] = 'PCS_INVERTER';

            if (ra.title.includes('BMS') || f.title.includes('BMS')) {
              devCode = 'BMS-RACK-01';
              devName = '磷酸铁锂高压电池簇 01号';
              devType = 'BMS_CLUSTER';
            } else if (ra.title.includes('EMS') || f.title.includes('EMS')) {
              devCode = 'EMS-CTRL-01';
              devName = 'EMS 能量管理主控单元';
              devType = 'EMS_HOST';
            } else if (ra.title.includes('变压器') || ra.title.includes('TR')) {
              devCode = 'TR-MAIN-01';
              devName = '35kV 主升压变压器';
              devType = 'TRANSFORMER';
            } else if (ra.title.includes('温控') || ra.title.includes('液冷') || ra.title.includes('HVAC')) {
              devCode = 'HVAC-COOL-01';
              devName = '集装箱工业液冷温控机组';
              devType = 'HVAC_COOLING';
            }

            // Associated work order
            const linkedWo = workOrders.find(
              w => w.siteId === site.id && (w.createTime?.startsWith(ra.timestamp.slice(0, 10)) || w.orderNo?.includes('9921'))
            );

            const totalMins = f.durationMinutes || ra.durationMinutes || 60;
            const overlapMins = calculateOverlapMinutes(ra.timestamp || f.startTime, f.endTime, totalMins);

            alarmsList.push({
              id: `alm-${ra.id || f.id}`,
              code: ra.code || f.faultCode || 'ALM-PCS-3042',
              title: ra.title || f.title,
              severity: (ra.severity as any) || 'CRITICAL',
              deviceCode: devCode,
              deviceName: devName,
              deviceType: devType,
              triggerTime: ra.timestamp || f.startTime,
              clearTime: f.endTime,
              durationMinutes: overlapMins > 0 ? overlapMins : totalMins,
              equivalentInterruptionMinutes: overlapMins > 0 ? overlapMins : totalMins,
              availabilityImpactPercent: Number((((overlapMins > 0 ? overlapMins : totalMins)) / 14.4).toFixed(2)),
              isExempt: false,
              slaCounted: true,
              status: f.endTime && normalizeDateTime(f.endTime, true) <= periodEndFull ? 'RESOLVED' : 'ACTIVE',
              rootCause: f.rootCause || '散热风道堵塞引发热敏保护动作',
              solution: '清理风道积灰，更换进气初效滤网，升级热敏保护固件',
              workOrderNo: linkedWo?.orderNo || 'WO-20260815-9921',
              actionTaken: '运维人员到场检修，实施导热脂涂敷与带载复测通过'
            });
          }
        });
      } else {
        const totalMins = f.durationMinutes || 60;
        const overlapMins = calculateOverlapMinutes(f.startTime, f.endTime, totalMins);
        // Fallback: create alarm from fault directly
        alarmsList.push({
          id: `alm-${f.id}`,
          code: f.faultCode || 'ALM-PCS-FAULT',
          title: f.title,
          severity: 'CRITICAL',
          deviceCode: 'PCS-INV-01B',
          deviceName: '1.25MW 储能变流器 B组 (备)',
          deviceType: 'PCS_INVERTER',
          triggerTime: f.startTime,
          clearTime: f.endTime,
          durationMinutes: overlapMins > 0 ? overlapMins : totalMins,
          equivalentInterruptionMinutes: overlapMins > 0 ? overlapMins : totalMins,
          availabilityImpactPercent: Number((((overlapMins > 0 ? overlapMins : totalMins)) / 14.4).toFixed(2)),
          isExempt: false,
          slaCounted: true,
          status: f.endTime && normalizeDateTime(f.endTime, true) <= periodEndFull ? 'RESOLVED' : 'ACTIVE',
          rootCause: f.rootCause,
          solution: '工单已闭环并完成硬件与通信恢复',
          workOrderNo: 'WO-20260815-9921',
          actionTaken: '完成现场复查与并网联锁解除'
        });
      }
    }
  });

  // Extract from dailySnapshots for other days (e.g. 2026-08-04, 2026-08-11, 2026-08-22, 2026-08-27)
  (site.dailySnapshots || []).forEach(snap => {
    const snapStart = `${snap.date} 00:00:00`;
    const snapEnd = `${snap.date} 23:59:59`;
    if (isTimeOverlap(snapStart, snapEnd)) {
      // Check if this date is already covered by mergedFaults
      const alreadyCovered = alarmsList.some(a => a.triggerTime.startsWith(snap.date));
      if (!alreadyCovered) {
        if (snap.pcsInterruptionMins > 0) {
          if (snap.date === '2026-08-04') {
            const trig = `${snap.date} 14:20:12`;
            const clr = `${snap.date} 17:40:00`;
            if (isTimeOverlap(trig, clr)) {
              const dur = 200;
              const ov = calculateOverlapMinutes(trig, clr, dur);
              alarmsList.push({
                id: `alm-snap-${snap.date}-1`,
                code: 'ALM-BMS-2108',
                title: 'BMS 主控通信总线瞬时丢包超限降额告警',
                severity: 'MAJOR',
                deviceCode: 'BMS-RACK-01',
                deviceName: '磷酸铁锂高压电池簇 01号',
                deviceType: 'BMS_CLUSTER',
                triggerTime: trig,
                clearTime: clr,
                durationMinutes: ov > 0 ? ov : dur,
                equivalentInterruptionMinutes: ov > 0 ? ov : dur,
                availabilityImpactPercent: 13.89,
                isExempt: false,
                slaCounted: true,
                status: 'RESOLVED',
                rootCause: 'CAN 通信屏蔽层接地电位差导致瞬时丢包，触发防孤岛保护',
                solution: '重做通信屏蔽端子压接，加装磁环滤波器',
                workOrderNo: 'WO-20260804-8711',
                actionTaken: '更换双绞屏蔽通信线，复测丢包率降至 0.001%'
              });
            }
          } else if (snap.date === '2026-08-22') {
            const trig = `${snap.date} 11:15:30`;
            const clr = `${snap.date} 11:55:30`;
            if (isTimeOverlap(trig, clr)) {
              const dur = 40;
              const ov = calculateOverlapMinutes(trig, clr, dur);
              alarmsList.push({
                id: `alm-snap-${snap.date}-1`,
                code: 'ALM-PCS-1049',
                title: 'PCS 变流器并网交流接触器触头温升超限告警',
                severity: 'MAJOR',
                deviceCode: 'PCS-INV-01A',
                deviceName: '1.25MW 储能变流器 A组 (主)',
                deviceType: 'PCS_INVERTER',
                triggerTime: trig,
                clearTime: clr,
                durationMinutes: ov > 0 ? ov : dur,
                equivalentInterruptionMinutes: ov > 0 ? ov : dur,
                availabilityImpactPercent: 2.78,
                isExempt: false,
                slaCounted: true,
                status: 'RESOLVED',
                rootCause: '交流侧主接触器动静触头微弱氧化导致接触电阻增加',
                solution: '接触器触指研磨清洁，涂敷导电膏',
                workOrderNo: 'WO-20260822-4521',
                actionTaken: '紧固接触器接线端子，升载带电运行温升正常'
              });
            }
          } else if (snap.date === '2026-08-27') {
            const trig = `${snap.date} 08:30:00`;
            const clr = `${snap.date} 08:50:00`;
            if (isTimeOverlap(trig, clr)) {
              const dur = 20;
              const ov = calculateOverlapMinutes(trig, clr, dur);
              alarmsList.push({
                id: `alm-snap-${snap.date}-1`,
                code: 'ALM-HVAC-0412',
                title: '集装箱液冷温控节能ECO自适应待机降频',
                severity: 'MINOR',
                deviceCode: 'HVAC-COOL-01',
                deviceName: '集装箱工业液冷温控机组',
                deviceType: 'HVAC_COOLING',
                triggerTime: trig,
                clearTime: clr,
                durationMinutes: ov > 0 ? ov : dur,
                equivalentInterruptionMinutes: ov > 0 ? ov : dur,
                availabilityImpactPercent: 1.39,
                isExempt: false,
                isEcoExempt: true,
                ecoExemptReason: '符合调度协议 Clause 4.2 节能温控自适应启停免责条款',
                ecoExemptTime: `${snap.date} 09:05:00`,
                ecoExemptOperator: '运维专工·张强',
                slaCounted: false,
                status: 'RESOLVED',
                rootCause: '站内环境温度适宜，液冷机组根据节能优化策略自动进入ECO休眠轮换待机',
                solution: '仓温正常，待温升阈值触发自动切回全速冷却，无需消缺处理',
                workOrderNo: 'WO-20260827-1108',
                actionTaken: 'ECO 节能运行策略审核通过，依规标注免除考核扣减'
              });
            }
          } else {
            const trig = `${snap.date} 10:00:00`;
            const clr = `${snap.date} 11:00:00`;
            if (isTimeOverlap(trig, clr)) {
              const dur = snap.pcsInterruptionMins;
              const ov = calculateOverlapMinutes(trig, clr, dur);
              alarmsList.push({
                id: `alm-snap-${snap.date}-gen`,
                code: 'ALM-PCS-FAULT-GEN',
                title: 'PCS 系统短时停机与联锁重合闸',
                severity: 'MAJOR',
                deviceCode: 'PCS-INV-01B',
                deviceName: '1.25MW 储能变流器 B组 (备)',
                deviceType: 'PCS_INVERTER',
                triggerTime: trig,
                clearTime: clr,
                durationMinutes: ov > 0 ? ov : dur,
                equivalentInterruptionMinutes: ov > 0 ? ov : dur,
                availabilityImpactPercent: Number(((snap.pcsInterruptionMins / 1440) * 100).toFixed(2)),
                isExempt: false,
                slaCounted: true,
                status: 'RESOLVED',
                rootCause: '电网瞬态扰动引起变流器电压暂降保护动作',
                solution: '自检通过后重新并网',
                actionTaken: '自动恢复正常并网运行'
              });
            }
          }
        } else if (snap.plannedMaintenanceMins > 0) {
          const trig = `${snap.date} 02:00:00`;
          const clr = `${snap.date} 04:00:00`;
          if (isTimeOverlap(trig, clr)) {
            const dur = snap.plannedMaintenanceMins;
            const ov = calculateOverlapMinutes(trig, clr, dur);
            // Rule R2 Exempt planned maintenance
            alarmsList.push({
              id: `alm-maint-${snap.date}`,
              code: 'ALM-MAINT-R2',
              title: '计划性月度预防性定检维护 (Rule R2 免责)',
              severity: 'WARNING',
              deviceCode: 'TR-MAIN-01',
              deviceName: '35kV 主升压变压器',
              deviceType: 'TRANSFORMER',
              triggerTime: trig,
              clearTime: clr,
              durationMinutes: ov > 0 ? ov : dur,
              equivalentInterruptionMinutes: 0,
              availabilityImpactPercent: 0,
              isExempt: true,
              slaCounted: false,
              status: 'RESOLVED',
              rootCause: '合同约定的预防性定期试验与红外测温',
              solution: '完成断路器合分闸试验与绝缘油色谱化验',
              workOrderNo: 'WO-PLAN-20260811',
              actionTaken: '维保完成，系统按规范复归并网'
            });
          }
        }
      }
    }
  });

  // Historical yearly/monthly fallback alarms for long ranges (e.g. 2021 ~ 2025)
  const isHistoricalYear = (year: number) => {
    const yStr = `${year}`;
    return sDate <= `${yStr}-12-31` && eDate >= `${yStr}-01-01`;
  };

  if (isHistoricalYear(2025) && !alarmsList.some(a => a.triggerTime.startsWith('2025'))) {
    alarmsList.push({
      id: 'alm-hist-2025-1',
      code: 'ALM-PCS-2025-09',
      title: 'PCS 变流器电网电压高穿保护动作停机',
      severity: 'MAJOR',
      deviceCode: 'PCS-INV-01A',
      deviceName: '1.25MW 储能变流器 A组 (主)',
      deviceType: 'PCS_INVERTER',
      triggerTime: '2025-09-18 16:22:00',
      clearTime: '2025-09-18 18:02:00',
      durationMinutes: 100,
      equivalentInterruptionMinutes: 100,
      availabilityImpactPercent: 0.12,
      isExempt: false,
      slaCounted: true,
      status: 'RESOLVED',
      rootCause: '对端变电站投切电容器组引起电网过电压扰动',
      solution: '升级高低压穿越 (HVRT/LVRT) 固件参数自适应阈值',
      actionTaken: '完成电网适应性固件联调'
    });
    alarmsList.push({
      id: 'alm-hist-2025-2',
      code: 'ALM-BMS-2025-12',
      title: 'BMS 电池单体极柱低温预热保护联锁',
      severity: 'MINOR',
      deviceCode: 'BMS-RACK-01',
      deviceName: '磷酸铁锂高压电池簇 01号',
      deviceType: 'BMS_CLUSTER',
      triggerTime: '2025-12-08 04:10:00',
      clearTime: '2025-12-08 06:10:00',
      durationMinutes: 120,
      equivalentInterruptionMinutes: 60,
      availabilityImpactPercent: 0.08,
      isExempt: false,
      slaCounted: true,
      status: 'RESOLVED',
      rootCause: '冬季极寒气温导致电芯低于0℃充电闭锁',
      solution: '启动舱体集装箱 PTC 加热棒提升底仓进风温度',
      actionTaken: '热管理自适应算法升级，电芯温升至 12℃ 恢复'
    });
  }

  if (isHistoricalYear(2024) && !alarmsList.some(a => a.triggerTime.startsWith('2024'))) {
    alarmsList.push({
      id: 'alm-hist-2024-1',
      code: 'ALM-TR-2024-07',
      title: '35kV 主变重瓦斯联锁继电保护动作',
      severity: 'CRITICAL',
      deviceCode: 'TR-MAIN-01',
      deviceName: '35kV 主升压变压器',
      deviceType: 'TRANSFORMER',
      triggerTime: '2024-07-22 13:40:00',
      clearTime: '2024-07-22 16:40:00',
      durationMinutes: 180,
      equivalentInterruptionMinutes: 180,
      availabilityImpactPercent: 0.21,
      isExempt: false,
      slaCounted: true,
      status: 'RESOLVED',
      rootCause: '夏季雷暴雷电波侵入过电压，避雷器动作但波涌引起微气泡析出',
      solution: '取油化验微水与绝缘强度合格，重置瓦斯继电器气室',
      actionTaken: '加装二次防雷浪涌抑制器并试验通过'
    });
  }

  if (isHistoricalYear(2023) && !alarmsList.some(a => a.triggerTime.startsWith('2023'))) {
    alarmsList.push({
      id: 'alm-hist-2023-1',
      code: 'ALM-EMS-2023-04',
      title: 'EMS 站控机双机冗余心跳切换丢包超时',
      severity: 'MAJOR',
      deviceCode: 'EMS-CTRL-01',
      deviceName: 'EMS 能量管理主控单元',
      deviceType: 'EMS_HOST',
      triggerTime: '2023-04-14 09:30:00',
      clearTime: '2023-04-14 13:00:00',
      durationMinutes: 210,
      equivalentInterruptionMinutes: 105,
      availabilityImpactPercent: 0.15,
      isExempt: false,
      slaCounted: true,
      status: 'RESOLVED',
      rootCause: '双机以太网交换机光口收发光功率衰减超限',
      solution: '更换千兆多模光模块及跳线',
      actionTaken: '光衰恢复至 -14dBm，双机心跳热备正常'
    });
  }

  // Sort alarms descending by triggerTime
  alarmsList.sort((a, b) => b.triggerTime.localeCompare(a.triggerTime));

  // 2. Build period device statuses
  const rawDevices = site.coreDevices && site.coreDevices.length > 0 ? site.coreDevices : DEFAULT_DEVICES;

  const devices: PeriodDeviceStatus[] = rawDevices.map(dev => {
    // Check alarms associated with this device
    const devAlarms = alarmsList.filter(
      a => a.deviceCode === dev.deviceCode || a.deviceName === dev.deviceName || a.deviceType === dev.deviceType
    );

    const faultAlarms = devAlarms.filter(a => a.severity === 'CRITICAL' && !a.isExempt);
    const warningAlarms = devAlarms.filter(a => a.severity === 'MAJOR' || a.severity === 'WARNING');
    const maintAlarms = devAlarms.filter(a => a.isExempt);

    const totalInterruptionMinutesInPeriod = devAlarms.reduce(
      (acc, cur) => acc + (cur.isExempt || cur.isEcoExempt ? 0 : cur.equivalentInterruptionMinutes),
      0
    );

    let periodStatus: PeriodDeviceStatus['periodStatus'] = 'NORMAL';
    let periodStatusLabel = '正常运行';
    let conditionNotes = '设备运行工况指标在额定阈值内，通信正常';

    if (faultAlarms.length > 0) {
      periodStatus = 'FAULT';
      periodStatusLabel = '发生故障停运';
      conditionNotes = `期间发生 ${faultAlarms.length} 次停机故障 (累计中断 ${totalInterruptionMinutesInPeriod}分钟)，已处置闭环`;
    } else if (warningAlarms.length > 0) {
      periodStatus = 'WARNING';
      periodStatusLabel = '告警预警';
      conditionNotes = `期间触发 ${warningAlarms.length} 次运行预警，参数轻微波动，未造成持久脱网`;
    } else if (maintAlarms.length > 0) {
      periodStatus = 'MAINTENANCE';
      periodStatusLabel = '计划检修 (免责)';
      conditionNotes = '执行合同约定的预防性定期检修维护，不扣减考核可用度';
    }

    // Availability contribution for this device
    const availContribution = totalInterruptionMinutesInPeriod > 0
      ? Math.max(85, Number((100 - (totalInterruptionMinutesInPeriod / 60) * 0.4).toFixed(2)))
      : 100.0;

    return {
      id: dev.id,
      deviceCode: dev.deviceCode,
      deviceName: dev.deviceName,
      deviceType: dev.deviceType,
      model: dev.model || '通用工业型号',
      isKeyDevice: dev.isKeyDevice ?? true,
      ratedPowerKw: dev.ratedPowerKw,
      periodStatus,
      periodStatusLabel,
      faultCountInPeriod: faultAlarms.length,
      alarmCountInPeriod: devAlarms.length,
      totalInterruptionMinutesInPeriod,
      availabilityContribution: availContribution,
      latestConditionNotes: conditionNotes,
      hasImpactedAvailability: totalInterruptionMinutesInPeriod > 0
    };
  });

  // 3. Aggregate Stats
  const totalDevices = devices.length;
  const normalDevices = devices.filter(d => d.periodStatus === 'NORMAL').length;
  const warningDevices = devices.filter(d => d.periodStatus === 'WARNING').length;
  const faultDevices = devices.filter(d => d.periodStatus === 'FAULT').length;
  const maintenanceDevices = devices.filter(d => d.periodStatus === 'MAINTENANCE').length;

  const totalAlarms = alarmsList.length;
  const criticalAlarms = alarmsList.filter(a => a.severity === 'CRITICAL').length;
  const majorAlarms = alarmsList.filter(a => a.severity === 'MAJOR').length;
  const ecoExemptAlarms = alarmsList.filter(a => a.isEcoExempt).length;
  const totalInterruptionMinutes = alarmsList.reduce((sum, a) => sum + a.durationMinutes, 0);
  const slaCountedInterruptionMinutes = alarmsList.reduce(
    (sum, a) => sum + (a.slaCounted && !a.isExempt && !a.isEcoExempt ? a.equivalentInterruptionMinutes : 0),
    0
  );

  return {
    devices,
    alarms: alarmsList,
    stats: {
      totalDevices,
      normalDevices,
      warningDevices,
      faultDevices,
      maintenanceDevices,
      totalAlarms,
      criticalAlarms,
      majorAlarms,
      ecoExemptAlarms,
      totalInterruptionMinutes,
      slaCountedInterruptionMinutes
    }
  };
}
