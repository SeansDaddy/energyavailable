import { Site, WorkOrder, MergedFault, DailySnapshot, FiveMinAvailabilityPoint } from '../types';

/**
 * Parses time string like "09:12" or "2026-08-15 09:12" into minutes from 00:00
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const timePart = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr;
  const [h, m] = timePart.split(':').map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Formats minutes from 00:00 into "HH:mm"
 */
export function minutesToTime(totalMins: number): string {
  const m = Math.max(0, Math.min(1439, Math.floor(totalMins)));
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Generate 288 data points (every 5 minutes) for a given site on a specific day
 */
export function generateFiveMinutePointsForDate(
  site: Site,
  date: string,
  workOrders: WorkOrder[] = []
): FiveMinAvailabilityPoint[] {
  const totalPoints = 288; // 24 * 12 = 288 points per day
  const points: FiveMinAvailabilityPoint[] = [];

  const snapshot = site.dailySnapshots?.find(s => s.date === date);
  const siteFaults = (site.mergedFaults || []).filter(f => f.startTime?.startsWith(date) || f.endTime?.startsWith(date));
  const siteOrders = workOrders.filter(w => 
    (w.siteId === site.id || w.siteName === site.siteName || w.contractNo === site.contractNo) &&
    (w.createTime?.startsWith(date) || w.solutionTime?.startsWith(date))
  );

  // Total capacity of PCS in site (approx sum of PCS rated power or 2500 kW default)
  const totalPcsKw = site.coreDevices
    ?.filter(d => d.deviceType === 'PCS_INVERTER')
    .reduce((acc, cur) => acc + (cur.ratedPowerKw || 1250), 0) || (site.capacityMw ? site.capacityMw * 1000 : 2500);

  // Determine fault interval(s) for the day
  const faultRanges: {
    startMin: number;
    endMin: number;
    title: string;
    code: string;
    impactRatio: number; // 0 to 1
  }[] = [];

  siteFaults.forEach(f => {
    const sMin = f.startTime?.startsWith(date) ? timeToMinutes(f.startTime) : 0;
    const eMin = f.endTime?.startsWith(date) ? timeToMinutes(f.endTime) : 1440;
    faultRanges.push({
      startMin: sMin,
      endMin: Math.max(sMin + 5, eMin),
      title: f.title,
      code: f.faultCode,
      impactRatio: f.impactPercentage > 0 ? Math.min(1, f.impactPercentage) : 1
    });
  });

  // Fallback: If snapshot has pcsInterruptionMins > 0 but no explicit fault object, synthesize an afternoon/morning event
  if (faultRanges.length === 0 && snapshot && snapshot.pcsInterruptionMins > 0) {
    const interruptMins = Math.min(1440, snapshot.pcsInterruptionMins);
    const startMin = 540; // 09:00 default
    faultRanges.push({
      startMin,
      endMin: Math.min(1440, startMin + interruptMins),
      title: 'PCS变流系统非计划停机/过温限功率',
      code: 'FLT-AUTO-SYNTH',
      impactRatio: 1
    });
  }

  // Determine PCare work orders active intervals
  const orderRanges: {
    startMin: number;
    solutionMin: number;
    orderNo: string;
    title: string;
    assignee: string;
    status: string;
  }[] = [];

  siteOrders.forEach(wo => {
    const createMin = wo.createTime?.startsWith(date) ? timeToMinutes(wo.createTime) : 0;
    // Rule R4: Solution output = closed!
    const solMin = wo.solutionTime?.startsWith(date)
      ? timeToMinutes(wo.solutionTime)
      : (wo.createTime?.startsWith(date) ? Math.min(1440, createMin + 330) : 1440);

    orderRanges.push({
      startMin: createMin,
      solutionMin: solMin,
      orderNo: wo.orderNo,
      title: wo.title,
      assignee: wo.assignee,
      status: wo.status
    });
  });

  // Determine maintenance intervals (exempt under Rule R2)
  const maintenanceRanges: { startMin: number; endMin: number }[] = [];
  if (snapshot && snapshot.plannedMaintenanceMins > 0) {
    const startMin = 120; // 02:00 ~ 04:00 typically
    maintenanceRanges.push({
      startMin,
      endMin: startMin + snapshot.plannedMaintenanceMins
    });
  }

  let accumulatedInterruptionMins = 0;

  for (let i = 0; i < totalPoints; i++) {
    const pointMin = i * 5;
    const nextMin = (i + 1) * 5;
    const timeStr = minutesToTime(pointMin);
    const timestampStr = `${date} ${timeStr}`;

    // Check if in planned maintenance (Rule R2: exempt)
    const isInMaintenance = maintenanceRanges.some(
      r => pointMin >= r.startMin && pointMin < r.endMin
    );

    // Check active fault
    const activeFault = faultRanges.find(
      r => pointMin >= r.startMin && pointMin < r.endMin
    );

    // Check active work order
    const activeOrder = orderRanges.find(
      r => pointMin >= r.startMin && pointMin < r.solutionMin
    );

    let availability = 100;
    let status: FiveMinAvailabilityPoint['status'] = 'NORMAL';
    let statusLabel = '正常运行';
    let pcsAvailableKw = totalPcsKw;
    let interruptionMins = 0;

    if (isInMaintenance) {
      status = 'MAINTENANCE';
      statusLabel = '计划维护 (免责)';
      pcsAvailableKw = 0;
      // Rule R2: Planned maintenance does not deduct availability
      availability = 100;
      interruptionMins = 0;
    } else if (activeFault) {
      if (activeOrder) {
        status = 'WORKORDER_ACTIVE';
        statusLabel = '工单排查中';
      } else {
        status = 'FAULT_TRIP';
        statusLabel = '故障中断';
      }
      const impact = activeFault.impactRatio;
      availability = Number(Math.max(0, (1 - impact) * 100).toFixed(2));
      pcsAvailableKw = Math.round(totalPcsKw * (1 - impact));
      interruptionMins = Number((5 * impact).toFixed(2));
      accumulatedInterruptionMins += interruptionMins;
    } else if (activeOrder) {
      // Work order active but fault cleared or preparing restart
      status = 'WORKORDER_ACTIVE';
      statusLabel = '方案就绪/复位中';
      availability = 90;
      pcsAvailableKw = Math.round(totalPcsKw * 0.9);
      interruptionMins = 0.5;
      accumulatedInterruptionMins += interruptionMins;
    }

    // Cumulative availability from 00:00 up to this 5-min point
    const elapsedMinutes = nextMin;
    const dayAvailability = Number(
      Math.max(0, Math.min(100, ((elapsedMinutes - accumulatedInterruptionMins) / elapsedMinutes) * 100)).toFixed(2)
    );

    // Fault trigger event on exact 5-min slot
    const hasFaultEvent = activeFault && Math.abs(pointMin - activeFault.startMin) < 5;

    points.push({
      index: i,
      time: timeStr,
      timestamp: timestampStr,
      availability,
      status,
      statusLabel,
      pcsAvailableKw,
      pcsTotalKw: totalPcsKw,
      interruptionMins,
      hasFaultEvent: Boolean(hasFaultEvent),
      faultEventTitle: activeFault?.title,
      faultEventCode: activeFault?.code,
      isWorkOrderActive: Boolean(activeOrder),
      workOrderNo: activeOrder?.orderNo,
      workOrderStatus: activeOrder?.status,
      isExempt: isInMaintenance,
      cumulativeDayAvailability: dayAvailability
    });
  }

  return points;
}

/**
 * Panorama Timeline Dataset:
 * Correlates availability curve, device fault dots, and PCare work orders
 */
export interface PanoramaTimelineData {
  timeSeries: {
    time: string; // e.g. "09:15"
    timestamp: string;
    availability: number; // 0 ~ 100
    slaThreshold: number; // 99.50%
    isBreached: boolean;
    // Device fault signal (0 or 100 for step chart or null for scatter)
    hasFaultMarker: boolean;
    faultTitle?: string;
    faultCode?: string;
    // PCare work order status
    workOrderActive: boolean;
    workOrderNo?: string;
    workOrderDurationMins?: number;
  }[];
  faultEvents: {
    id: string;
    code: string;
    title: string;
    deviceCode?: string;
    deviceName?: string;
    triggerTime: string;
    recoverTime: string;
    durationMinutes: number;
    equivalentInterruptionMinutes: number;
    impactPercentage: number;
    rootCause: string;
  }[];
  workOrders: {
    id: string;
    orderNo: string;
    title: string;
    siteName: string;
    createTime: string; // e.g. "2026-08-15 09:18"
    solutionTime: string; // e.g. "2026-08-15 14:48" (Rule R4)
    durationMinutes: number; // 330 mins
    assignee: string;
    status: string;
    rawPcareStatus?: string;
    solutionSummary?: string;
  }[];
  conversionMetrics: {
    totalWindowMinutes: number; // e.g. 1440 mins (day) or 43200 (month)
    totalDotsCount: number; // 288 dots
    faultDowntimeMinutes: number; // e.g. 396 mins
    pcareDurationMinutes: number; // e.g. 330 mins
    exemptMaintenanceMinutes: number; // e.g. 0 mins
    netDeductMinutes: number; // e.g. 396 mins
    effectiveAvailability: number; // e.g. 72.50% (day) or 98.62% (current site)
    slaThreshold: number;
    slaGap: number;
    formulaExplanation: string;
  };
}

export function buildPanoramaTimelineData(
  site: Site,
  targetDate: string,
  allWorkOrders: WorkOrder[] = []
): PanoramaTimelineData {
  const fiveMinPoints = generateFiveMinutePointsForDate(site, targetDate, allWorkOrders);
  const snapshot = site.dailySnapshots?.find(s => s.date === targetDate);

  // Associated faults for this date
  const siteFaults = (site.mergedFaults || []).filter(
    f => f.startTime?.startsWith(targetDate) || f.endTime?.startsWith(targetDate)
  );

  // Associated work orders for this date
  const siteOrders = allWorkOrders.filter(
    w =>
      (w.siteId === site.id || w.siteName === site.siteName || w.contractNo === site.contractNo) &&
      (w.createTime?.startsWith(targetDate) || w.solutionTime?.startsWith(targetDate))
  );

  // If site has no direct orders for target date, fallback to initial matching order (e.g. WO-20260815-9921)
  const effectiveOrders = siteOrders.length > 0 ? siteOrders : (allWorkOrders.filter(w => w.siteId === site.id));

  // Time-series mapping (sampled every 5 minutes)
  const timeSeries = fiveMinPoints.map(pt => ({
    time: pt.time,
    timestamp: pt.timestamp,
    availability: pt.availability,
    slaThreshold: site.slaThreshold,
    isBreached: pt.availability < site.slaThreshold,
    hasFaultMarker: Boolean(pt.hasFaultEvent),
    faultTitle: pt.faultEventTitle,
    faultCode: pt.faultEventCode,
    workOrderActive: Boolean(pt.isWorkOrderActive),
    workOrderNo: pt.workOrderNo,
    workOrderDurationMins: pt.interruptionMins
  }));

  const faultEvents = siteFaults.map(f => ({
    id: f.id,
    code: f.faultCode,
    title: f.title,
    deviceCode: 'PCS-INV-01B',
    deviceName: '1.25MW 储能变流器 B组',
    triggerTime: f.startTime,
    recoverTime: f.endTime,
    durationMinutes: f.durationMinutes,
    equivalentInterruptionMinutes: f.equivalentInterruptionMinutes,
    impactPercentage: f.impactPercentage,
    rootCause: f.rootCause
  }));

  const parsedWorkOrders = effectiveOrders.map(wo => {
    let dur = 330;
    if (wo.createTime && wo.solutionTime) {
      const c = new Date(wo.createTime).getTime();
      const s = new Date(wo.solutionTime).getTime();
      if (!isNaN(c) && !isNaN(s) && s > c) {
        dur = Math.round((s - c) / (1000 * 60));
      }
    }
    return {
      id: wo.id,
      orderNo: wo.orderNo,
      title: wo.title,
      siteName: wo.siteName,
      createTime: wo.createTime || `${targetDate} 09:18`,
      solutionTime: wo.solutionTime || `${targetDate} 14:48`,
      durationMinutes: dur,
      assignee: wo.assignee || '现场运维团队',
      status: wo.status,
      rawPcareStatus: wo.rawPcareStatus,
      solutionSummary: wo.solutionSummary
    };
  });

  const faultDowntime = siteFaults.reduce((acc, cur) => acc + cur.equivalentInterruptionMinutes, 0) ||
    (snapshot?.pcsInterruptionMins || 0);

  const pcareDuration = parsedWorkOrders.reduce((acc, cur) => acc + cur.durationMinutes, 0);
  const exemptMins = snapshot?.plannedMaintenanceMins || 0;
  const netDeduct = Math.max(0, faultDowntime - exemptMins);
  const effectiveAvail = Number(
    Math.max(0, Math.min(100, ((1440 - netDeduct) / 1440) * 100)).toFixed(2)
  );

  return {
    timeSeries,
    faultEvents,
    workOrders: parsedWorkOrders,
    conversionMetrics: {
      totalWindowMinutes: 1440,
      totalDotsCount: 288,
      faultDowntimeMinutes: faultDowntime,
      pcareDurationMinutes: pcareDuration,
      exemptMaintenanceMinutes: exemptMins,
      netDeductMinutes: netDeduct,
      effectiveAvailability: effectiveAvail,
      slaThreshold: site.slaThreshold,
      slaGap: Number((effectiveAvail - site.slaThreshold).toFixed(2)),
      formulaExplanation: `[1440分钟 - (${faultDowntime}分故障 - ${exemptMins}分免责)] / 1440分钟 × 100% = ${effectiveAvail}%`
    }
  };
}
