import {
  Site,
  WorkOrder,
  DailySnapshot,
  AvailabilityRecalcRecord,
  AvailabilityRecalcDayDetail
} from '../types';

export interface RecalcAvailabilityOptions {
  site: Site;
  workOrders: WorkOrder[];
  startDate: string;
  endDate: string;
  applyEcoExempt: boolean;
  applyR4OrderClosure: boolean;
  applyLatestWinsLog: boolean;
  operator?: string;
  syncSiteKpi?: boolean;
}

export interface RecalcAvailabilityComputation {
  record: AvailabilityRecalcRecord;
  updatedSnapshots: DailySnapshot[];
  matchedFaultCount: number;
  matchedWorkOrderCount: number;
}

function enumerateDates(startDate: string, endDate: string, maxDays = 62): string[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && dates.length < maxDays) {
    const yyyy = cursor.getFullYear();
    const mm = String(cursor.getMonth() + 1).padStart(2, '0');
    const dd = String(cursor.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function computeSiteAvailabilityRecalculation(
  opts: RecalcAvailabilityOptions
): RecalcAvailabilityComputation {
  const {
    site,
    workOrders,
    startDate,
    endDate,
    applyEcoExempt,
    applyR4OrderClosure,
    applyLatestWinsLog,
    operator = '当前值班工程师',
    syncSiteKpi = true
  } = opts;

  const existingMap = new Map<string, DailySnapshot>();
  (site.dailySnapshots || []).forEach(s => existingMap.set(s.date, s));

  const targetDates = enumerateDates(startDate, endDate, 62);
  const effectiveDates =
    targetDates.length > 0
      ? targetDates
      : (site.dailySnapshots || []).map(s => s.date);

  const siteOrders = workOrders.filter(
    w =>
      (w.siteId && w.siteId === site.id) ||
      (w.siteName && w.siteName === site.siteName) ||
      (w.contractNo && site.contractNo && w.contractNo === site.contractNo)
  );

  const siteFaults = site.mergedFaults || [];

  const matchedFaultSet = new Set<string>();
  const matchedOrderSet = new Set<string>();

  const dayBreakdown: AvailabilityRecalcDayDetail[] = [];
  const nextSnapshotMap = new Map<string, DailySnapshot>(existingMap);

  effectiveDates.forEach((date, idx) => {
    const existing = existingMap.get(date);
    const dayNum = parseInt(date.split('-')[2] || String(idx + 1), 10);

    // Baseline snapshot if date wasn't previously materialized
    const baselineAvail = existing
      ? existing.availability
      : Number(
          Math.max(
            97.2,
            Math.min(100, site.currentAvailability + (((dayNum * 13) % 5) - 2) * 0.04)
          ).toFixed(2)
        );

    const baselineInterruptMins = existing
      ? existing.pcsInterruptionMins > 0
        ? existing.pcsInterruptionMins
        : Math.max(0, Math.round(((100 - existing.availability) / 100) * 1440))
      : Math.max(0, Math.round(((100 - baselineAvail) / 100) * 1440));

    const plannedMaintMins = existing ? existing.plannedMaintenanceMins || 0 : 0;

    // Match faults & work orders on this date
    const dayFaults = siteFaults.filter(
      f => f.startTime?.startsWith(date) || f.endTime?.startsWith(date)
    );
    dayFaults.forEach(f => matchedFaultSet.add(f.id));

    const dayOrders = siteOrders.filter(
      w => w.createTime?.startsWith(date) || w.solutionTime?.startsWith(date)
    );
    dayOrders.forEach(w => matchedOrderSet.add(w.id));

    let recoveredMins = 0;
    let addedPenaltyMins = 0;
    const notes: string[] = [];

    // 1. Rule R2: ECO & planned maintenance exemption
    const ecoOrderMins = dayOrders.reduce(
      (acc, w) => acc + (w.isEcoExempt ? w.ecoExemptMins || 30 : 0),
      0
    );
    const ecoFaultMins = dayFaults.reduce((acc, f) => {
      const isEco =
        f.title?.includes('ECO') ||
        f.title?.includes('外因') ||
        f.title?.includes('电网');
      return acc + (isEco ? Math.round((f.equivalentInterruptionMinutes || 30) * 0.6) : 0);
    }, 0);

    if (applyEcoExempt) {
      const r2Mins =
        ecoOrderMins +
        ecoFaultMins +
        (baselineInterruptMins > 15 && ecoOrderMins === 0 && ecoFaultMins === 0
          ? Math.round(baselineInterruptMins * 0.18)
          : 0);
      if (r2Mins > 0) {
        recoveredMins += r2Mins;
        notes.push(`Rule R2 核免 ${r2Mins} min`);
      }
    } else {
      // Disabling R2 restores planned maintenance / ECO external outage back into deduction
      const unexempted = plannedMaintMins + ecoOrderMins + (dayNum % 3 === 0 ? 12 : 0);
      if (unexempted > 0) {
        addedPenaltyMins += unexempted;
        notes.push(`未启用 R2 免责 (+${unexempted} min 扣减)`);
      }
    }

    // 2. Rule R4: PCare solution-ready closure stops interruption timer early
    const hasSolutionReadyOrder = dayOrders.some(
      w => w.status === 'SOLUTION_READY' || w.status === 'CLOSED'
    );
    if (applyR4OrderClosure && (hasSolutionReadyOrder || baselineInterruptMins >= 20)) {
      const r4Mins = hasSolutionReadyOrder
        ? Math.max(12, Math.round(baselineInterruptMins * 0.28))
        : Math.round(baselineInterruptMins * 0.14);
      if (r4Mins > 0) {
        recoveredMins += r4Mins;
        notes.push(`Rule R4 工单方案闭环提前 ${r4Mins} min`);
      }
    } else if (!applyR4OrderClosure && hasSolutionReadyOrder) {
      const physicalLag = 18;
      addedPenaltyMins += physicalLag;
      notes.push(`按现场物理关单计 (+${physicalLag} min)`);
    }

    // 3. Rule R3: Latest-Wins offline log overlap deduplication
    if (applyLatestWinsLog && baselineInterruptMins >= 25) {
      const r3Mins = Math.max(4, Math.round(baselineInterruptMins * 0.1));
      recoveredMins += r3Mins;
      notes.push(`Rule R3 Latest-Wins 去重 ${r3Mins} min`);
    }

    const afterInterruptMins = Math.max(
      0,
      Math.min(1440, baselineInterruptMins - recoveredMins + addedPenaltyMins)
    );
    const afterAvail = Number(
      Math.max(0, Math.min(100, ((1440 - afterInterruptMins) / 1440) * 100)).toFixed(2)
    );

    const netRecovered = baselineInterruptMins - afterInterruptMins;

    dayBreakdown.push({
      date,
      beforeAvail: baselineAvail,
      afterAvail,
      beforeInterruptMins: baselineInterruptMins,
      afterInterruptMins,
      recoveredMins: netRecovered,
      note: notes.length > 0 ? notes.join(' · ') : '全时段运行稳定，无需修正'
    });

    nextSnapshotMap.set(date, {
      date,
      siteId: site.id,
      availability: afterAvail,
      slaThreshold: site.slaThreshold,
      pcsInterruptionMins: afterInterruptMins,
      plannedMaintenanceMins: plannedMaintMins,
      events: [
        ...(existing?.events || []),
        ...(Math.abs(afterAvail - baselineAvail) >= 0.01
          ? [
              {
                id: `evt-recalc-${date}-${Date.now().toString().slice(-4)}`,
                type: 'log_imported' as const,
                title: `指定时段重算生效: ${baselineAvail}% → ${afterAvail}%`,
                time: new Date().toTimeString().slice(0, 5)
              }
            ]
          : [])
      ]
    });
  });

  const updatedSnapshots = Array.from(nextSnapshotMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const beforePeriodAvgAvail =
    dayBreakdown.length > 0
      ? Number(
          (
            dayBreakdown.reduce((acc, d) => acc + d.beforeAvail, 0) /
            dayBreakdown.length
          ).toFixed(2)
        )
      : site.currentAvailability;

  const afterPeriodAvgAvail =
    dayBreakdown.length > 0
      ? Number(
          (
            dayBreakdown.reduce((acc, d) => acc + d.afterAvail, 0) /
            dayBreakdown.length
          ).toFixed(2)
        )
      : site.currentAvailability;

  const beforeInterruptionMins = dayBreakdown.reduce(
    (acc, d) => acc + d.beforeInterruptMins,
    0
  );
  const afterInterruptionMins = dayBreakdown.reduce(
    (acc, d) => acc + d.afterInterruptMins,
    0
  );
  const recoveredMins = beforeInterruptionMins - afterInterruptionMins;

  // Compute updated site-wide current availability across all snapshots
  const allSnapshotsAvg =
    updatedSnapshots.length > 0
      ? Number(
          (
            updatedSnapshots.reduce((acc, s) => acc + s.availability, 0) /
            updatedSnapshots.length
          ).toFixed(2)
        )
      : afterPeriodAvgAvail;

  const periodDelta = Number((afterPeriodAvgAvail - beforePeriodAvgAvail).toFixed(2));
  const afterSiteCurrentAvail = syncSiteKpi
    ? Number(
        Math.max(
          0,
          Math.min(100, Number((site.currentAvailability + periodDelta).toFixed(2)))
        ).toFixed(2)
      )
    : site.currentAvailability;

  // Ensure if all snapshots average is even cleaner when full period selected, blend or preserve delta consistency
  const finalSiteAvail =
    syncSiteKpi && effectiveDates.length >= (site.dailySnapshots?.length || 1)
      ? Math.max(afterSiteCurrentAvail, Math.min(100, allSnapshotsAvg))
      : afterSiteCurrentAvail;

  const appliedRules: string[] = [];
  if (applyEcoExempt) appliedRules.push('Rule R2 (ECO外因/计划维护免责)');
  if (applyR4OrderClosure) appliedRules.push('Rule R4 (PCare方案输出即闭环)');
  if (applyLatestWinsLog) appliedRules.push('Rule R3 (Latest-Wins日志去重)');

  const record: AvailabilityRecalcRecord = {
    id: `recalc-${Date.now().toString().slice(-6)}`,
    siteId: site.id,
    siteName: site.siteName,
    startDate,
    endDate,
    recalculatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    operator,
    beforePeriodAvgAvail,
    afterPeriodAvgAvail,
    beforeSiteCurrentAvail: site.currentAvailability,
    afterSiteCurrentAvail: finalSiteAvail,
    deltaAvail: Number((afterPeriodAvgAvail - beforePeriodAvgAvail).toFixed(2)),
    beforeInterruptionMins,
    afterInterruptionMins,
    recoveredMins,
    appliedRules,
    affectedDaysCount: dayBreakdown.length,
    syncedToSiteKpi: syncSiteKpi,
    dayBreakdown
  };

  return {
    record,
    updatedSnapshots,
    matchedFaultCount: matchedFaultSet.size,
    matchedWorkOrderCount: matchedOrderSet.size
  };
}
