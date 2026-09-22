import React, { useState, useMemo, useCallback } from 'react';
import { Site, WorkOrder, DailySnapshot, FiveMinAvailabilityPoint } from '../../types';
import { FiveMinAvailabilityDotsView, FiveMinTimeRangeLinkageInfo } from '../sites/FiveMinAvailabilityDotsView';
import { DimensionEquipmentAndAlarmsSection } from './DimensionEquipmentAndAlarmsSection';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Wrench,
  Search,
  Activity,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  CalendarDays,
  CalendarRange,
  FileSpreadsheet,
  Download,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sliders,
  Link2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  Area,
  Legend
} from 'recharts';

export type MonitoringCycle = '5min' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface AvailabilityDetailsTabProps {
  site: Site;
  workOrders?: WorkOrder[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onNavigateTab: (tabIdx: number, extra?: any) => void;
}

export const AvailabilityDetailsTab: React.FC<AvailabilityDetailsTabProps> = ({
  site,
  workOrders = [],
  selectedDate: initialSelectedDate,
  onSelectDate,
  onNavigateTab
}) => {
  const [cycle, setCycle] = useState<MonitoringCycle>('5min');
  
  const snapshots = site.dailySnapshots || [];
  const defaultDate =
    initialSelectedDate ||
    (snapshots.length > 0 ? snapshots[snapshots.length - 1].date : '2026-08-15');
  const [activeDate, setActiveDate] = useState<string>(defaultDate);

  // Custom Time Range States for Each Dimension
  const [dayStartDate, setDayStartDate] = useState<string>('2026-08-01');
  const [dayEndDate, setDayEndDate] = useState<string>('2026-08-30');

  const [weekStart, setWeekStart] = useState<string>('2026-W31');
  const [weekEnd, setWeekEnd] = useState<string>('2026-W35');

  const [monthStart, setMonthStart] = useState<string>('2026-01');
  const [monthEnd, setMonthEnd] = useState<string>('2026-08');

  const [yearStart, setYearStart] = useState<string>('2022');
  const [yearEnd, setYearEnd] = useState<string>('2026');

  // Display Mode States for Dimensions: 'chart' | 'table' | 'all'
  const [dailyDisplayMode, setDailyDisplayMode] = useState<'chart' | 'table' | 'all'>('chart');
  const [weeklyDisplayMode, setWeeklyDisplayMode] = useState<'chart' | 'table' | 'all'>('chart');
  const [monthlyDisplayMode, setMonthlyDisplayMode] = useState<'chart' | 'table' | 'all'>('chart');
  const [yearlyDisplayMode, setYearlyDisplayMode] = useState<'chart' | 'table' | 'all'>('chart');

  // Time Range Linkage States for Core Device Status
  const [fiveMinLinkageMode, setFiveMinLinkageMode] = useState<'window' | 'selected' | 'all'>('window');
  const [fiveMinLinkageInfo, setFiveMinLinkageInfo] = useState<FiveMinTimeRangeLinkageInfo | null>(null);
  const [fiveMinTimeWindow, setFiveMinTimeWindow] = useState<'all' | 'fault_focus' | '00_06' | '06_12' | '12_18' | '18_24' | 'custom'>('fault_focus');
  const [fiveMinCustomStart, setFiveMinCustomStart] = useState<string>('08:00');
  const [fiveMinCustomEnd, setFiveMinCustomEnd] = useState<string>('18:00');
  const [fiveMinSelectedPointIndex, setFiveMinSelectedPointIndex] = useState<number | null>(null);

  const handle5MinTimeRangeLinkageChange = useCallback((info: FiveMinTimeRangeLinkageInfo) => {
    setFiveMinLinkageInfo(info);
    if (info.selectedPoint) {
      setFiveMinLinkageMode('selected');
    }
  }, []);

  const [selectedDailyDate, setSelectedDailyDate] = useState<string | null>(null);
  const [dailyLinkageMode, setDailyLinkageMode] = useState<'range' | 'selected'>('range');

  const [selectedWeekNo, setSelectedWeekNo] = useState<string | null>(null);
  const [weeklyLinkageMode, setWeeklyLinkageMode] = useState<'range' | 'selected'>('range');

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyLinkageMode, setMonthlyLinkageMode] = useState<'range' | 'selected'>('range');

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [yearlyLinkageMode, setYearlyLinkageMode] = useState<'range' | 'selected'>('range');

  const handleDateClick = (date: string) => {
    setActiveDate(date);
    if (onSelectDate) onSelectDate(date);
  };

  // 1. Daily Aggregation Data
  const dailyData = useMemo(() => {
    return snapshots.map(s => {
      const isBreached = s.availability < s.slaThreshold;
      return {
        date: s.date,
        availability: s.availability,
        slaThreshold: s.slaThreshold,
        pcsInterruptionMins: s.pcsInterruptionMins || 0,
        plannedMaintenanceMins: s.plannedMaintenanceMins || 0,
        eventsCount: s.events ? s.events.length : 0,
        isBreached,
        status: isBreached ? '未达标' : '达标'
      };
    });
  }, [snapshots]);

  // Filtered Daily Data by Custom Date Range
  const filteredDailyData = useMemo(() => {
    return dailyData.filter(d => d.date >= dayStartDate && d.date <= dayEndDate);
  }, [dailyData, dayStartDate, dayEndDate]);

  // Daily Summary Stats (Reactively calculated on filtered range)
  const dailySummary = useMemo(() => {
    if (filteredDailyData.length === 0) {
      return {
        totalDays: 0,
        avgAvailability: 0,
        passedDays: 0,
        breachedDays: 0,
        passRate: 0,
        totalInterruptionMins: 0,
        totalMaintenanceMins: 0,
        minDay: null as any
      };
    }
    const totalDays = filteredDailyData.length;
    const sumAvail = filteredDailyData.reduce((acc, d) => acc + d.availability, 0);
    const avgAvailability = Number((sumAvail / totalDays).toFixed(2));
    const passedDays = filteredDailyData.filter(d => !d.isBreached).length;
    const breachedDays = totalDays - passedDays;
    const passRate = Number(((passedDays / totalDays) * 100).toFixed(1));
    const totalInterruptionMins = filteredDailyData.reduce((acc, d) => acc + d.pcsInterruptionMins, 0);
    const totalMaintenanceMins = filteredDailyData.reduce((acc, d) => acc + d.plannedMaintenanceMins, 0);

    let minDay = filteredDailyData[0];
    filteredDailyData.forEach(d => {
      if (d.availability < minDay.availability) {
        minDay = d;
      }
    });

    return {
      totalDays,
      avgAvailability,
      passedDays,
      breachedDays,
      passRate,
      totalInterruptionMins,
      totalMaintenanceMins,
      minDay
    };
  }, [filteredDailyData]);

  // 2. Weekly Aggregation Data (Chunk daily snapshots into standard weeks)
  const weeklyData = useMemo(() => {
    if (dailyData.length === 0) return [];

    // Map 30 days into 5 calendar weeks
    const weeksDef = [
      { weekNo: '2026-W31', label: '第31周 (08-01 ~ 08-03)', startIdx: 0, endIdx: 2 },
      { weekNo: '2026-W32', label: '第32周 (08-04 ~ 08-10)', startIdx: 3, endIdx: 9 },
      { weekNo: '2026-W33', label: '第33周 (08-11 ~ 08-17)', startIdx: 10, endIdx: 16 },
      { weekNo: '2026-W34', label: '第34周 (08-18 ~ 08-24)', startIdx: 17, endIdx: 23 },
      { weekNo: '2026-W35', label: '第35周 (08-25 ~ 08-30)', startIdx: 24, endIdx: 29 }
    ];

    return weeksDef
      .map(w => {
        const slice = dailyData.slice(w.startIdx, Math.min(dailyData.length, w.endIdx + 1));
        if (slice.length === 0) return null;

        const dayCount = slice.length;
        const avgAvail = Number((slice.reduce((acc, d) => acc + d.availability, 0) / dayCount).toFixed(2));
        const interruptionMins = slice.reduce((acc, d) => acc + d.pcsInterruptionMins, 0);
        const maintenanceMins = slice.reduce((acc, d) => acc + d.plannedMaintenanceMins, 0);
        const totalEvents = slice.reduce((acc, d) => acc + d.eventsCount, 0);
        const isBreached = avgAvail < site.slaThreshold;
        const gap = Number((avgAvail - site.slaThreshold).toFixed(2));

        return {
          weekNo: w.weekNo,
          label: w.label,
          days: dayCount,
          startDate: slice[0].date,
          endDate: slice[slice.length - 1].date,
          avgAvailability: avgAvail,
          slaThreshold: site.slaThreshold,
          gap,
          interruptionMins,
          maintenanceMins,
          totalEvents,
          isBreached,
          status: isBreached ? '未达标' : '达标'
        };
      })
      .filter(Boolean) as {
        weekNo: string;
        label: string;
        days: number;
        startDate: string;
        endDate: string;
        avgAvailability: number;
        slaThreshold: number;
        gap: number;
        interruptionMins: number;
        maintenanceMins: number;
        totalEvents: number;
        isBreached: boolean;
        status: string;
      }[];
  }, [dailyData, site.slaThreshold]);

  // Filtered Weekly Data by Custom Week Range
  const filteredWeeklyData = useMemo(() => {
    return weeklyData.filter(w => w.weekNo >= weekStart && w.weekNo <= weekEnd);
  }, [weeklyData, weekStart, weekEnd]);

  // Weekly Summary Stats (Reactively calculated on filtered weeks)
  const weeklySummary = useMemo(() => {
    if (filteredWeeklyData.length === 0) return null;
    const totalWeeks = filteredWeeklyData.length;
    const passedWeeks = filteredWeeklyData.filter(w => !w.isBreached).length;
    const breachedWeeks = totalWeeks - passedWeeks;
    const passRate = Number(((passedWeeks / totalWeeks) * 100).toFixed(1));
    const avgAvail = Number(
      (filteredWeeklyData.reduce((acc, w) => acc + w.avgAvailability, 0) / totalWeeks).toFixed(2)
    );
    const totalInterruptionMins = filteredWeeklyData.reduce((acc, w) => acc + w.interruptionMins, 0);

    let worstWeek = filteredWeeklyData[0];
    let bestWeek = filteredWeeklyData[0];
    filteredWeeklyData.forEach(w => {
      if (w.avgAvailability < worstWeek.avgAvailability) worstWeek = w;
      if (w.avgAvailability > bestWeek.avgAvailability) bestWeek = w;
    });

    return {
      totalWeeks,
      passedWeeks,
      breachedWeeks,
      passRate,
      avgAvail,
      totalInterruptionMins,
      worstWeek,
      bestWeek
    };
  }, [filteredWeeklyData]);

  const weeklyDateRange = useMemo(() => {
    if (filteredWeeklyData.length === 0) return { start: '2026-08-01', end: '2026-08-30' };
    const start = filteredWeeklyData[0].startDate;
    const end = filteredWeeklyData[filteredWeeklyData.length - 1].endDate;
    return { start, end };
  }, [filteredWeeklyData]);

  // 3. Monthly Aggregation Data (Trailing 12 months: 2025-09 to 2026-08)
  const monthlyData = useMemo(() => {
    const isCurrentBreached = site.currentAvailability < site.slaThreshold;
    const curInterruption = site.mergedFaults
      ? site.mergedFaults.reduce((acc, f) => acc + f.equivalentInterruptionMinutes, 0)
      : 185;

    return [
      {
        month: '2025-09',
        label: '2025年09月',
        days: 30,
        availability: 99.82,
        slaThreshold: site.slaThreshold,
        interruptionMins: 30,
        maintenanceMins: 60,
        eventsCount: 2,
        penaltyAmount: 0,
        isBreached: 99.82 < site.slaThreshold,
        status: 99.82 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2025-10',
        label: '2025年10月',
        days: 31,
        availability: 99.75,
        slaThreshold: site.slaThreshold,
        interruptionMins: 45,
        maintenanceMins: 60,
        eventsCount: 3,
        penaltyAmount: 0,
        isBreached: 99.75 < site.slaThreshold,
        status: 99.75 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2025-11',
        label: '2025年11月',
        days: 30,
        availability: 99.88,
        slaThreshold: site.slaThreshold,
        interruptionMins: 20,
        maintenanceMins: 120,
        eventsCount: 1,
        penaltyAmount: 0,
        isBreached: 99.88 < site.slaThreshold,
        status: 99.88 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2025-12',
        label: '2025年12月',
        days: 31,
        availability: 99.68,
        slaThreshold: site.slaThreshold,
        interruptionMins: 55,
        maintenanceMins: 90,
        eventsCount: 4,
        penaltyAmount: 0,
        isBreached: 99.68 < site.slaThreshold,
        status: 99.68 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-01',
        label: '2026年01月',
        days: 31,
        availability: 99.91,
        slaThreshold: site.slaThreshold,
        interruptionMins: 15,
        maintenanceMins: 60,
        eventsCount: 1,
        penaltyAmount: 0,
        isBreached: 99.91 < site.slaThreshold,
        status: 99.91 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-02',
        label: '2026年02月',
        days: 28,
        availability: 99.82,
        slaThreshold: site.slaThreshold,
        interruptionMins: 28,
        maintenanceMins: 60,
        eventsCount: 2,
        penaltyAmount: 0,
        isBreached: 99.82 < site.slaThreshold,
        status: 99.82 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-03',
        label: '2026年03月',
        days: 31,
        availability: 99.85,
        slaThreshold: site.slaThreshold,
        interruptionMins: 25,
        maintenanceMins: 60,
        eventsCount: 3,
        penaltyAmount: 0,
        isBreached: 99.85 < site.slaThreshold,
        status: 99.85 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-04',
        label: '2026年04月',
        days: 30,
        availability: 99.72,
        slaThreshold: site.slaThreshold,
        interruptionMins: 40,
        maintenanceMins: 120,
        eventsCount: 5,
        penaltyAmount: 0,
        isBreached: 99.72 < site.slaThreshold,
        status: 99.72 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-05',
        label: '2026年05月',
        days: 31,
        availability: 99.60,
        slaThreshold: site.slaThreshold,
        interruptionMins: 65,
        maintenanceMins: 90,
        eventsCount: 4,
        penaltyAmount: 0,
        isBreached: 99.60 < site.slaThreshold,
        status: 99.60 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-06',
        label: '2026年06月',
        days: 30,
        availability: 99.46,
        slaThreshold: site.slaThreshold,
        interruptionMins: 110,
        maintenanceMins: 180,
        eventsCount: 8,
        penaltyAmount: site.slaThreshold > 99.46 ? 6000 : 0,
        isBreached: 99.46 < site.slaThreshold,
        status: 99.46 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-07',
        label: '2026年07月',
        days: 31,
        availability: 99.78,
        slaThreshold: site.slaThreshold,
        interruptionMins: 35,
        maintenanceMins: 60,
        eventsCount: 2,
        penaltyAmount: 0,
        isBreached: 99.78 < site.slaThreshold,
        status: 99.78 < site.slaThreshold ? '未达标' : '达标',
        importStatus: '已归档结清'
      },
      {
        month: '2026-08',
        label: '2026年08月 (当期)',
        days: 30,
        availability: site.currentAvailability,
        slaThreshold: site.slaThreshold,
        interruptionMins: curInterruption,
        maintenanceMins: 120,
        eventsCount: site.mergedFaults?.length || 4,
        penaltyAmount: isCurrentBreached ? 12000 : 0,
        isBreached: isCurrentBreached,
        status: isCurrentBreached ? '未达标 (预警)' : '达标',
        importStatus: '当期持续采集'
      }
    ];
  }, [site.currentAvailability, site.slaThreshold, site.mergedFaults]);

  // Filtered Monthly Data by Custom Month Range
  const filteredMonthlyData = useMemo(() => {
    return monthlyData.filter(m => m.month >= monthStart && m.month <= monthEnd);
  }, [monthlyData, monthStart, monthEnd]);

  // Monthly Summary Stats (Reactively calculated on filtered months)
  const monthlySummary = useMemo(() => {
    if (filteredMonthlyData.length === 0) {
      return {
        totalMonths: 0,
        passedMonths: 0,
        breachedMonths: 0,
        passRate: 0,
        avgAvail: 0,
        totalInterruptionMins: 0,
        totalPenalty: 0,
        worstMonth: null as any
      };
    }
    const totalMonths = filteredMonthlyData.length;
    const passedMonths = filteredMonthlyData.filter(m => !m.isBreached).length;
    const breachedMonths = totalMonths - passedMonths;
    const passRate = Number(((passedMonths / totalMonths) * 100).toFixed(1));
    const avgAvail = Number(
      (filteredMonthlyData.reduce((acc, m) => acc + m.availability, 0) / totalMonths).toFixed(2)
    );
    const totalInterruptionMins = filteredMonthlyData.reduce((acc, m) => acc + m.interruptionMins, 0);
    const totalPenalty = filteredMonthlyData.reduce((acc, m) => acc + m.penaltyAmount, 0);

    let worstMonth = filteredMonthlyData[0];
    filteredMonthlyData.forEach(m => {
      if (m.availability < worstMonth.availability) worstMonth = m;
    });

    return {
      totalMonths,
      passedMonths,
      breachedMonths,
      passRate,
      avgAvail,
      totalInterruptionMins,
      totalPenalty,
      worstMonth
    };
  }, [filteredMonthlyData]);

  // 4. Yearly Aggregation Data (Historical Annual SLA Performance: 2021 to 2026)
  const yearlyData = useMemo(() => {
    const curYearBreached = site.currentAvailability < site.slaThreshold;
    const curYearInterruptionMins = 520;

    return [
      {
        year: '2021',
        label: '2021年度',
        days: 365,
        availability: 99.86,
        slaThreshold: site.slaThreshold,
        gap: Number((99.86 - site.slaThreshold).toFixed(2)),
        interruptionMins: 280,
        interruptionHours: 4.7,
        maintenanceHours: 10.0,
        eventsCount: 11,
        penaltyAmount: 0,
        isBreached: 99.86 < site.slaThreshold,
        status: '达标',
        settlementStatus: '已终审结清'
      },
      {
        year: '2022',
        label: '2022年度',
        days: 365,
        availability: 99.88,
        slaThreshold: site.slaThreshold,
        gap: Number((99.88 - site.slaThreshold).toFixed(2)),
        interruptionMins: 260,
        interruptionHours: 4.3,
        maintenanceHours: 12.0,
        eventsCount: 14,
        penaltyAmount: 0,
        isBreached: 99.88 < site.slaThreshold,
        status: '达标',
        settlementStatus: '已终审结清'
      },
      {
        year: '2023',
        label: '2023年度',
        days: 365,
        availability: 99.76,
        slaThreshold: site.slaThreshold,
        gap: Number((99.76 - site.slaThreshold).toFixed(2)),
        interruptionMins: 490,
        interruptionHours: 8.2,
        maintenanceHours: 14.0,
        eventsCount: 22,
        penaltyAmount: 0,
        isBreached: 99.76 < site.slaThreshold,
        status: '达标',
        settlementStatus: '已终审结清'
      },
      {
        year: '2024',
        label: '2024年度',
        days: 366,
        availability: 99.42,
        slaThreshold: site.slaThreshold,
        gap: Number((99.42 - site.slaThreshold).toFixed(2)),
        interruptionMins: 890,
        interruptionHours: 14.8,
        maintenanceHours: 16.0,
        eventsCount: 31,
        penaltyAmount: 24000,
        isBreached: 99.42 < site.slaThreshold,
        status: '未达标',
        settlementStatus: '已扣罚结清'
      },
      {
        year: '2025',
        label: '2025年度',
        days: 365,
        availability: 99.82,
        slaThreshold: site.slaThreshold,
        gap: Number((99.82 - site.slaThreshold).toFixed(2)),
        interruptionMins: 360,
        interruptionHours: 6.0,
        maintenanceHours: 10.0,
        eventsCount: 18,
        penaltyAmount: 0,
        isBreached: 99.82 < site.slaThreshold,
        status: '达标',
        settlementStatus: '已终审结清'
      },
      {
        year: '2026',
        label: '2026年度 (至今)',
        days: 242,
        availability: site.currentAvailability,
        slaThreshold: site.slaThreshold,
        gap: Number((site.currentAvailability - site.slaThreshold).toFixed(2)),
        interruptionMins: curYearInterruptionMins,
        interruptionHours: Number((curYearInterruptionMins / 60).toFixed(1)),
        maintenanceHours: 9.0,
        eventsCount: 16,
        penaltyAmount: curYearBreached ? 12000 : 0,
        isBreached: curYearBreached,
        status: curYearBreached ? '未达标 (预警)' : '达标',
        settlementStatus: '当期动态采集'
      }
    ];
  }, [site.currentAvailability, site.slaThreshold]);

  // Filtered Yearly Data by Custom Year Range
  const filteredYearlyData = useMemo(() => {
    return yearlyData.filter(y => y.year >= yearStart && y.year <= yearEnd);
  }, [yearlyData, yearStart, yearEnd]);

  // Yearly Summary Stats
  const yearlySummary = useMemo(() => {
    if (filteredYearlyData.length === 0) {
      return {
        totalYears: 0,
        passedYears: 0,
        breachedYears: 0,
        passRate: 0,
        avgAvail: 0,
        totalInterruptionHours: 0,
        totalInterruptionMins: 0,
        totalPenalty: 0,
        worstYear: null as any,
        bestYear: null as any
      };
    }
    const totalYears = filteredYearlyData.length;
    const passedYears = filteredYearlyData.filter(y => !y.isBreached).length;
    const breachedYears = totalYears - passedYears;
    const passRate = Number(((passedYears / totalYears) * 100).toFixed(1));
    const avgAvail = Number(
      (filteredYearlyData.reduce((acc, y) => acc + y.availability, 0) / totalYears).toFixed(2)
    );
    const totalInterruptionHours = Number(
      filteredYearlyData.reduce((acc, y) => acc + y.interruptionHours, 0).toFixed(1)
    );
    const totalInterruptionMins = filteredYearlyData.reduce((acc, y) => acc + y.interruptionMins, 0);
    const totalPenalty = filteredYearlyData.reduce((acc, y) => acc + y.penaltyAmount, 0);

    let worstYear = filteredYearlyData[0];
    let bestYear = filteredYearlyData[0];
    filteredYearlyData.forEach(y => {
      if (y.availability < worstYear.availability) worstYear = y;
      if (y.availability > bestYear.availability) bestYear = y;
    });

    return {
      totalYears,
      passedYears,
      breachedYears,
      passRate,
      avgAvail,
      totalInterruptionHours,
      totalInterruptionMins,
      totalPenalty,
      worstYear,
      bestYear
    };
  }, [filteredYearlyData]);

  // Daily deep inspector selection
  const selectedSnapshot = snapshots.find(s => s.date === activeDate) || snapshots[0];

  // Effective Linkage Calculations for 5-Minute Dimension
  const effective5MinStart = useMemo(() => {
    if (fiveMinLinkageMode === 'all') {
      return `${activeDate} 00:00:00`;
    }
    if (fiveMinLinkageMode === 'selected' && fiveMinLinkageInfo?.selectedPoint) {
      return `${activeDate} ${fiveMinLinkageInfo.selectedPoint.time}:00`;
    }
    return fiveMinLinkageInfo?.startDateTime || `${activeDate} 00:00:00`;
  }, [fiveMinLinkageMode, fiveMinLinkageInfo, activeDate]);

  const effective5MinEnd = useMemo(() => {
    if (fiveMinLinkageMode === 'all') {
      return `${activeDate} 23:59:59`;
    }
    if (fiveMinLinkageMode === 'selected' && fiveMinLinkageInfo?.selectedPoint) {
      return `${activeDate} ${fiveMinLinkageInfo.selectedPoint.time}:59`;
    }
    return fiveMinLinkageInfo?.endDateTime || `${activeDate} 23:59:59`;
  }, [fiveMinLinkageMode, fiveMinLinkageInfo, activeDate]);

  const fiveMinTimeRangeLabel = useMemo(() => {
    if (fiveMinLinkageMode === 'all') {
      return `${activeDate} (5分钟颗粒度全天288点汇总)`;
    }
    if (fiveMinLinkageMode === 'selected' && fiveMinLinkageInfo?.selectedPoint) {
      return `${activeDate} ${fiveMinLinkageInfo.selectedPoint.time} (点位 #${fiveMinLinkageInfo.selectedPoint.index + 1} 5分钟单打点聚焦)`;
    }
    return fiveMinLinkageInfo?.timeRangeLabel || `${activeDate} (5分钟颗粒度全天288点)`;
  }, [fiveMinLinkageMode, fiveMinLinkageInfo, activeDate]);

  // Effective Linkage Calculations for Daily Dimension
  const effectiveDailyStart = dailyLinkageMode === 'selected' && selectedDailyDate ? selectedDailyDate : dayStartDate;
  const effectiveDailyEnd = dailyLinkageMode === 'selected' && selectedDailyDate ? selectedDailyDate : dayEndDate;
  const dailyTimeRangeLabel = dailyLinkageMode === 'selected' && selectedDailyDate
    ? `${selectedDailyDate} (单日联动聚焦)`
    : `${dayStartDate} 至 ${dayEndDate} (共 ${dailySummary.totalDays} 天全区间)`;

  const handleSelectDailyRowOrDot = (date: string) => {
    setSelectedDailyDate(date);
    setDailyLinkageMode('selected');
    handleDateClick(date);
  };

  // Effective Linkage Calculations for Weekly Dimension
  const activeWeekItem = useMemo(() => {
    return filteredWeeklyData.find(w => w.weekNo === selectedWeekNo) || filteredWeeklyData[0];
  }, [filteredWeeklyData, selectedWeekNo]);

  const effectiveWeeklyStart = weeklyLinkageMode === 'selected' && activeWeekItem ? activeWeekItem.startDate : weeklyDateRange.start;
  const effectiveWeeklyEnd = weeklyLinkageMode === 'selected' && activeWeekItem ? activeWeekItem.endDate : weeklyDateRange.end;
  const weeklyTimeRangeLabel = weeklyLinkageMode === 'selected' && activeWeekItem
    ? `${activeWeekItem.label} (${activeWeekItem.startDate} 至 ${activeWeekItem.endDate})`
    : `${weekStart} ~ ${weekEnd} (${weeklyDateRange.start} 至 ${weeklyDateRange.end}，共 ${filteredWeeklyData.length} 周)`;

  const handleSelectWeeklyRowOrBar = (weekNo: string) => {
    setSelectedWeekNo(weekNo);
    setWeeklyLinkageMode('selected');
  };

  // Effective Linkage Calculations for Monthly Dimension
  const activeMonthItem = useMemo(() => {
    return filteredMonthlyData.find(m => m.month === selectedMonth) || filteredMonthlyData[filteredMonthlyData.length - 1];
  }, [filteredMonthlyData, selectedMonth]);

  const effectiveMonthlyStart = monthlyLinkageMode === 'selected' && activeMonthItem ? `${activeMonthItem.month}-01` : `${monthStart}-01`;
  const effectiveMonthlyEnd = monthlyLinkageMode === 'selected' && activeMonthItem ? `${activeMonthItem.month}-31` : `${monthEnd}-31`;
  const monthlyTimeRangeLabel = monthlyLinkageMode === 'selected' && activeMonthItem
    ? `${activeMonthItem.label} (${activeMonthItem.month}-01 至 ${activeMonthItem.month}-31)`
    : `${monthStart} 至 ${monthEnd} (共 ${filteredMonthlyData.length} 个月)`;

  const handleSelectMonthlyRowOrBar = (month: string) => {
    setSelectedMonth(month);
    setMonthlyLinkageMode('selected');
  };

  // Effective Linkage Calculations for Yearly Dimension
  const activeYearItem = useMemo(() => {
    return filteredYearlyData.find(y => y.year === selectedYear) || filteredYearlyData[filteredYearlyData.length - 1];
  }, [filteredYearlyData, selectedYear]);

  const effectiveYearlyStart = yearlyLinkageMode === 'selected' && activeYearItem ? `${activeYearItem.year}-01-01` : `${yearStart}-01-01`;
  const effectiveYearlyEnd = yearlyLinkageMode === 'selected' && activeYearItem ? `${activeYearItem.year}-12-31` : `${yearEnd}-12-31`;
  const yearlyTimeRangeLabel = yearlyLinkageMode === 'selected' && activeYearItem
    ? `${activeYearItem.label} (${activeYearItem.year}年全年)`
    : `${yearStart}年 至 ${yearEnd}年 (共 ${filteredYearlyData.length} 个年度)`;

  const handleSelectYearlyRowOrBar = (year: string) => {
    setSelectedYear(year);
    setYearlyLinkageMode('selected');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Dimension Selection Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 5 Dimension Buttons */}
          <button
            id="btn-cycle-5min"
            onClick={() => setCycle('5min')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              cycle === '5min'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${cycle === '5min' ? 'text-white' : 'text-amber-500'}`} />
            <span>5分钟维度</span>
          </button>

          <button
            id="btn-cycle-daily"
            onClick={() => setCycle('daily')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              cycle === 'daily'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${cycle === 'daily' ? 'text-white' : 'text-blue-500'}`} />
            <span>日维度</span>
          </button>

          <button
            id="btn-cycle-weekly"
            onClick={() => setCycle('weekly')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              cycle === 'weekly'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className={`w-3.5 h-3.5 ${cycle === 'weekly' ? 'text-white' : 'text-indigo-500'}`} />
            <span>周维度</span>
          </button>

          <button
            id="btn-cycle-monthly"
            onClick={() => setCycle('monthly')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              cycle === 'monthly'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CalendarRange className={`w-3.5 h-3.5 ${cycle === 'monthly' ? 'text-white' : 'text-emerald-500'}`} />
            <span>月维度</span>
          </button>

          <button
            id="btn-cycle-yearly"
            onClick={() => setCycle('yearly')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              cycle === 'yearly'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${cycle === 'yearly' ? 'text-white' : 'text-purple-500'}`} />
            <span>年维度</span>
          </button>
        </div>

        {/* Contract SLA Reference */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>合同 SLA 门槛:</span>
          <strong className="text-blue-600 font-mono">{site.slaThreshold}%</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. FIVE-MINUTE DIMENSION (5分钟)                                          */}
      {/* ========================================================================= */}
      {cycle === '5min' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <FiveMinAvailabilityDotsView
            site={site}
            activeDate={activeDate}
            onChangeDate={handleDateClick}
            workOrders={workOrders}
            onNavigateTab={onNavigateTab}
            timeWindow={fiveMinTimeWindow}
            onTimeWindowChange={w => {
              setFiveMinTimeWindow(w);
              if (fiveMinLinkageMode === 'all') {
                setFiveMinLinkageMode('window');
              }
            }}
            customStartTime={fiveMinCustomStart}
            onCustomStartTimeChange={t => {
              setFiveMinCustomStart(t);
              setFiveMinLinkageMode('window');
            }}
            customEndTime={fiveMinCustomEnd}
            onCustomEndTimeChange={t => {
              setFiveMinCustomEnd(t);
              setFiveMinLinkageMode('window');
            }}
            selectedPointIndex={fiveMinSelectedPointIndex}
            onSelectPointIndex={idx => {
              setFiveMinSelectedPointIndex(idx);
              if (idx !== null) {
                setFiveMinLinkageMode('selected');
              }
            }}
            onTimeRangeLinkageChange={handle5MinTimeRangeLinkageChange}
          />

          {/* 5-Min Time Range Linkage Control Bar */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded bg-blue-600 text-white">
                <Link2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-slate-800">核心设备联动时段:</span>
              <span className="font-mono font-bold text-blue-800 bg-white px-2.5 py-1 rounded border border-blue-200 shadow-2xs">
                {fiveMinTimeRangeLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {fiveMinLinkageMode === 'selected'
                  ? '（已聚焦图表/表格选中的单打点时刻，精准呈现该时刻设备运行工况与瞬时报警）'
                  : fiveMinLinkageMode === 'all'
                  ? '（已联动当日全天 288 点打点走势全时段，展示全日设备工况与扣减明细）'
                  : '（已联动上方打点走势自定义/筛选时段，展示该时段设备运行、告警与停机统计）'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setFiveMinLinkageMode('window');
                  setFiveMinSelectedPointIndex(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  fiveMinLinkageMode === 'window'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                走势时段联动 ({fiveMinLinkageInfo?.windowLabel || '筛选时段'})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFiveMinLinkageMode('all');
                  setFiveMinSelectedPointIndex(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  fiveMinLinkageMode === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                全天288点汇总
              </button>
              {fiveMinLinkageInfo?.selectedPoint && (
                <button
                  type="button"
                  onClick={() => setFiveMinLinkageMode('selected')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    fiveMinLinkageMode === 'selected'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  聚焦单点 ({fiveMinLinkageInfo.selectedPoint.time})
                </button>
              )}
            </div>
          </div>

          {/* Equipment Status & Availability Alarms for 5-Min Dimension */}
          <DimensionEquipmentAndAlarmsSection
            site={site}
            startDate={effective5MinStart}
            endDate={effective5MinEnd}
            dimension="5min"
            timeRangeLabel={fiveMinTimeRangeLabel}
            workOrders={workOrders}
            onNavigateTab={onNavigateTab}
            linkageMode={fiveMinLinkageMode === 'all' ? 'range' : 'selected'}
            onResetToRange={() => {
              setFiveMinLinkageMode('window');
              setFiveMinSelectedPointIndex(null);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DAILY DIMENSION (日维度)                                               */}
      {/* ========================================================================= */}
      {cycle === 'daily' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Custom Date Range Toolbar for Daily Dimension */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>自定义统计日期范围:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dayStartDate}
                  min="2026-08-01"
                  max={dayEndDate}
                  onChange={e => setDayStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                />
                <span className="text-slate-500">至</span>
                <input
                  type="date"
                  value={dayEndDate}
                  min={dayStartDate}
                  max="2026-08-30"
                  onChange={e => setDayEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
              <button
                onClick={() => { setDayStartDate('2026-08-01'); setDayEndDate('2026-08-30'); }}
                title="重置为全月30天"
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium mr-1">快捷区间:</span>
              <button
                onClick={() => { setDayStartDate('2026-08-24'); setDayEndDate('2026-08-30'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dayStartDate === '2026-08-24' && dayEndDate === '2026-08-30'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近7天
              </button>
              <button
                onClick={() => { setDayStartDate('2026-08-16'); setDayEndDate('2026-08-30'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dayStartDate === '2026-08-16' && dayEndDate === '2026-08-30'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近15天
              </button>
              <button
                onClick={() => { setDayStartDate('2026-08-01'); setDayEndDate('2026-08-15'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dayStartDate === '2026-08-01' && dayEndDate === '2026-08-15'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                上半月
              </button>
              <button
                onClick={() => { setDayStartDate('2026-08-16'); setDayEndDate('2026-08-30'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dayStartDate === '2026-08-16' && dayEndDate === '2026-08-30'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                下半月
              </button>
              <button
                onClick={() => { setDayStartDate('2026-08-01'); setDayEndDate('2026-08-30'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  dayStartDate === '2026-08-01' && dayEndDate === '2026-08-30'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                全月30天
              </button>
            </div>
          </div>

          {/* Summary Statistics KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>统计日历天数</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {dailySummary.totalDays} <span className="text-xs font-normal text-slate-500">天</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{dayStartDate.slice(5)} ~ {dayEndDate.slice(5)}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>周期算术平均可用度</span>
              </div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  dailySummary.avgAvailability < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {dailySummary.avgAvailability}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                SLA考核基线: {site.slaThreshold}%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>SLA 达标履约天数</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {dailySummary.passedDays}{' '}
                <span className="text-xs font-normal text-slate-500">/ {dailySummary.totalDays} 天</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                达标率: {dailySummary.passRate}% (破约 {dailySummary.breachedDays} 天)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>累计等效停机扣减</span>
              </div>
              <div className="text-xl font-bold font-mono text-red-600 mt-1">
                {dailySummary.totalInterruptionMins}{' '}
                <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                免责维护: {dailySummary.totalMaintenanceMins} min
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs col-span-2 md:col-span-1">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>最低单日可用度</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                {dailySummary.minDay ? `${dailySummary.minDay.availability}%` : '--'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                发生于: {dailySummary.minDay ? dailySummary.minDay.date : '--'}
              </div>
            </div>
          </div>

          {/* Daily Display Mode Switcher (Tab切换: 图表 vs 列表 vs 全部展开) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">展示形式选择</span>
                  <span className="text-[11px] text-slate-500">
                    支持在【可用度走势图表】与【日履约明细表】之间自由切换
                  </span>
                </div>
              </div>
            </div>

            {/* Segmented Mode Selector */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setDailyDisplayMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  dailyDisplayMode === 'chart'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>图表：可用度走势与等效中断</span>
              </button>

              <button
                type="button"
                onClick={() => setDailyDisplayMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  dailyDisplayMode === 'table'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span>列表：日履约明细表</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono font-normal">
                  {dailySummary.totalDays}天
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDailyDisplayMode('all')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  dailyDisplayMode === 'all'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="同时并列查看图表走势与明细表"
              >
                <span>全部展开</span>
              </button>
            </div>
          </div>

          {/* Daily Trend Chart (Shown in 'chart' or 'all' mode) */}
          {(dailyDisplayMode === 'chart' || dailyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>每日可用度走势与等效中断时长分析图 ({dayStartDate} ~ {dayEndDate}，共 {dailySummary.totalDays} 天)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    折线表示当日可用度 (低于SLA标红)；柱状表示当日等效停机扣减分钟数；点击任意日期点位可联动下方核心设备状态
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-600">可用度(%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-400/80" />
                    <span className="text-slate-600">等效停机(min)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-red-500" />
                    <span className="text-slate-600 font-medium">SLA基线 ({site.slaThreshold}%)</span>
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredDailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                      tickFormatter={val => (val ? String(val).slice(5) : '')}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[96.0, 100]}
                      stroke="#2563eb"
                      tick={{ fontSize: 11 }}
                      unit="%"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 120]}
                      stroke="#ef4444"
                      tick={{ fontSize: 11 }}
                      unit="m"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs space-y-1 font-sans">
                              <div className="font-bold text-slate-900 font-mono flex items-center justify-between gap-3">
                                <span>{data.date}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                                    data.isBreached
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {data.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-1">
                                <span className="text-slate-500">当日可用度:</span>
                                <span
                                  className={`font-mono font-bold ${
                                    data.isBreached ? 'text-red-600' : 'text-emerald-600'
                                  }`}
                                >
                                  {data.availability}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">等效停机扣减:</span>
                                <span className="font-mono text-red-600 font-semibold">
                                  {data.pcsInterruptionMins} 分钟
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">免责计划维护:</span>
                                <span className="font-mono text-blue-600">
                                  {data.plannedMaintenanceMins} 分钟
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">关联事件数:</span>
                                <span className="font-mono text-slate-700">{data.eventsCount} 件</span>
                              </div>
                              <div className="text-[10px] text-blue-600 pt-1 border-t border-slate-100 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>点击可在下方联动查看该日核心设备工况</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={site.slaThreshold}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `SLA ${site.slaThreshold}%`,
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="pcsInterruptionMins"
                      fill="#f87171"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={16}
                      opacity={0.8}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="availability"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={props => {
                        const { cx, cy, payload } = props;
                        const isBreach = payload.availability < site.slaThreshold;
                        const isCur = selectedDailyDate ? payload.date === selectedDailyDate : payload.date === activeDate;
                        return (
                          <circle
                            key={payload.date}
                            cx={cx}
                            cy={cy}
                            r={isCur ? 6.5 : isBreach ? 4.5 : 3.5}
                            fill={isBreach ? '#ef4444' : isCur ? '#1d4ed8' : '#2563eb'}
                            stroke={isCur ? '#ffffff' : 'none'}
                            strokeWidth={isCur ? 2.5 : 0}
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onClick={() => handleSelectDailyRowOrDot(payload.date)}
                          />
                        );
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Daily Detail List Table (Shown in 'table' or 'all' mode) */}
          {(dailyDisplayMode === 'table' || dailyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    日可用度与考核履约明细表 (当前筛选: {dailySummary.totalDays} 天)
                  </h3>
                </div>
                <div className="text-xs text-slate-500">
                  点击表格行可联动下方核心设备状态；点击【下钻5分钟打点】进入该日 288 点位微观审查
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">日期</th>
                      <th className="py-2.5 px-3">日可用度 (%)</th>
                      <th className="py-2.5 px-3">合同 SLA 阈值</th>
                      <th className="py-2.5 px-3">履约达成判定</th>
                      <th className="py-2.5 px-3">等效中断扣减</th>
                      <th className="py-2.5 px-3">免责维护时长</th>
                      <th className="py-2.5 px-3">发生事件数</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDailyData.map(d => {
                      const isSelected = selectedDailyDate ? d.date === selectedDailyDate : d.date === activeDate;
                      return (
                        <tr
                          key={d.date}
                          onClick={() => handleSelectDailyRowOrDot(d.date)}
                          className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/80 font-medium border-l-4 border-l-blue-600' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{d.date}</span>
                              {isSelected && dailyLinkageMode === 'selected' && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-600 text-white font-normal">
                                  已联动
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            <span className={d.isBreached ? 'text-red-600' : 'text-emerald-600'}>
                              {d.availability}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{d.slaThreshold}%</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                d.isBreached
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-red-600">
                            {d.pcsInterruptionMins > 0 ? `${d.pcsInterruptionMins} min` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-blue-600">
                            {d.plannedMaintenanceMins > 0 ? `${d.plannedMaintenanceMins} min` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {d.eventsCount > 0 ? `${d.eventsCount} 项` : '正常无异常'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleDateClick(d.date);
                                setCycle('5min');
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <Zap className="w-3 h-3 text-blue-600" />
                              <span>下钻5分钟打点</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Time Range Linkage Control Bar */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded bg-blue-600 text-white">
                <Link2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-slate-800">核心设备联动时段:</span>
              <span className="font-mono font-bold text-blue-800 bg-white px-2.5 py-1 rounded border border-blue-200 shadow-2xs">
                {dailyTimeRangeLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {dailyLinkageMode === 'selected'
                  ? '（已聚焦选中单日，下方设备状态呈现该日详细运行与停运扣减）'
                  : '（已联动当前自定义全区间，展示全区间累计工况与告警明细）'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDailyLinkageMode('range')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  dailyLinkageMode === 'range'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                全区间汇总 ({dayStartDate} ~ {dayEndDate})
              </button>
              {selectedDailyDate && (
                <button
                  type="button"
                  onClick={() => setDailyLinkageMode('selected')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    dailyLinkageMode === 'selected'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  聚焦单日 ({selectedDailyDate})
                </button>
              )}
            </div>
          </div>

          {/* Equipment Status & Availability Alarms for Daily Dimension */}
          <DimensionEquipmentAndAlarmsSection
            site={site}
            startDate={effectiveDailyStart}
            endDate={effectiveDailyEnd}
            dimension="daily"
            timeRangeLabel={dailyTimeRangeLabel}
            workOrders={workOrders}
            onNavigateTab={onNavigateTab}
            linkageMode={dailyLinkageMode}
            onResetToRange={() => setDailyLinkageMode('range')}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WEEKLY DIMENSION (周维度)                                                */}
      {/* ========================================================================= */}
      {cycle === 'weekly' && weeklySummary && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Custom Week Range Toolbar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                <span>自定义统计周范围:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={weekStart}
                  onChange={e => setWeekStart(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                >
                  {['2026-W31', '2026-W32', '2026-W33', '2026-W34', '2026-W35'].map(w => (
                    <option key={w} value={w}>
                      {w.replace('2026-', '')}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500">至</span>
                <select
                  value={weekEnd}
                  onChange={e => setWeekEnd(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
                >
                  {['2026-W31', '2026-W32', '2026-W33', '2026-W34', '2026-W35'].map(w => (
                    <option key={w} value={w}>
                      {w.replace('2026-', '')}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => { setWeekStart('2026-W31'); setWeekEnd('2026-W35'); }}
                title="重置为全5周"
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium mr-1">快捷区间:</span>
              <button
                onClick={() => { setWeekStart('2026-W34'); setWeekEnd('2026-W35'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  weekStart === '2026-W34' && weekEnd === '2026-W35'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近2周 (W34~W35)
              </button>
              <button
                onClick={() => { setWeekStart('2026-W33'); setWeekEnd('2026-W35'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  weekStart === '2026-W33' && weekEnd === '2026-W35'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近3周 (W33~W35)
              </button>
              <button
                onClick={() => { setWeekStart('2026-W31'); setWeekEnd('2026-W35'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  weekStart === '2026-W31' && weekEnd === '2026-W35'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                全部5周 (W31~W35)
              </button>
            </div>
          </div>

          {/* Weekly Summary Statistics KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                <span>统计周期周数</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {weeklySummary.totalWeeks} <span className="text-xs font-normal text-slate-500">周</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">2026年 {weekStart} ~ {weekEnd}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>全周期周均可用度</span>
              </div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  weeklySummary.avgAvail < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {weeklySummary.avgAvail}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                SLA考核阈值: {site.slaThreshold}%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>周 SLA 达成率</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {weeklySummary.passRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                达标 {weeklySummary.passedWeeks} 周 / 破约 {weeklySummary.breachedWeeks} 周
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>周累计等效停机</span>
              </div>
              <div className="text-xl font-bold font-mono text-red-600 mt-1">
                {weeklySummary.totalInterruptionMins}{' '}
                <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                周均停运: {(weeklySummary.totalInterruptionMins / Math.max(1, weeklySummary.totalWeeks)).toFixed(1)} min
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs col-span-2 md:col-span-1">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>停机最长周</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                {weeklySummary.worstWeek ? weeklySummary.worstWeek.weekNo : '--'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                周可用度: {weeklySummary.worstWeek ? `${weeklySummary.worstWeek.avgAvailability}%` : '--'}
              </div>
            </div>
          </div>

          {/* Weekly Display Mode Switcher (Tab切换: 图表 vs 列表 vs 全部展开) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">展示形式选择</span>
                  <span className="text-[11px] text-slate-500">
                    支持在【周走势图表】与【周履约明细表】之间自由切换
                  </span>
                </div>
              </div>
            </div>

            {/* Segmented Mode Selector */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setWeeklyDisplayMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  weeklyDisplayMode === 'chart'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>图表：周走势与等效中断</span>
              </button>

              <button
                type="button"
                onClick={() => setWeeklyDisplayMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  weeklyDisplayMode === 'table'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span>列表：周度分析明细表</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono font-normal">
                  {filteredWeeklyData.length}周
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWeeklyDisplayMode('all')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  weeklyDisplayMode === 'all'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="同时并列查看图表走势与明细表"
              >
                <span>全部展开</span>
              </button>
            </div>
          </div>

          {/* Weekly Detail Chart (Shown in 'chart' or 'all' mode) */}
          {(weeklyDisplayMode === 'chart' || weeklyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                    <span>周可用度走势与等效停机分析图 ({weekStart} ~ {weekEnd}，共 {weeklySummary.totalWeeks} 周)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    柱状为每周平均可用度；次轴折线为当周累计停机时长；点击柱状或图例可联动下方核心设备状态
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-600" />
                    <span className="text-slate-600">周可用度(%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-slate-600">周停机时长(min)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-red-500" />
                    <span className="text-slate-600 font-medium">SLA基线 ({site.slaThreshold}%)</span>
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={filteredWeeklyData}
                    onClick={(state: any) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        handleSelectWeeklyRowOrBar(state.activePayload[0].payload.weekNo);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="weekNo" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      domain={[97.0, 100]}
                      stroke="#2563eb"
                      tick={{ fontSize: 11 }}
                      unit="%"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 150]}
                      stroke="#ef4444"
                      tick={{ fontSize: 11 }}
                      unit="m"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs space-y-1 font-sans">
                              <div className="font-bold text-slate-900 font-mono flex items-center justify-between gap-3">
                                <span>{data.label}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                                    data.isBreached
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {data.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-1">
                                <span className="text-slate-500">周平均可用度:</span>
                                <span
                                  className={`font-mono font-bold ${
                                    data.isBreached ? 'text-red-600' : 'text-emerald-600'
                                  }`}
                                >
                                  {data.avgAvailability}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">当周等效中断:</span>
                                <span className="font-mono text-red-600 font-semibold">
                                  {data.interruptionMins} 分钟
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">免责计划维护:</span>
                                <span className="font-mono text-blue-600">
                                  {data.maintenanceMins} 分钟
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">当周故障事件:</span>
                                <span className="font-mono text-slate-700">{data.totalEvents} 项</span>
                              </div>
                              <div className="text-[10px] text-indigo-600 pt-1 border-t border-slate-100 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>点击该周可在下方联动查看该周设备状态</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={site.slaThreshold}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `SLA ${site.slaThreshold}%`,
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="avgAvailability"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                      className="cursor-pointer"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="interruptionMins"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#ef4444', strokeWidth: 1, stroke: '#ffffff' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Weekly Detail Table (Shown in 'table' or 'all' mode) */}
          {(weeklyDisplayMode === 'table' || weeklyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    周度可用度履约分析明细表 (共 {filteredWeeklyData.length} 周)
                  </h3>
                </div>
                <div className="text-xs text-slate-500">
                  点击表格行可联动下方核心设备状态；点击【查看该周逐日】可下钻至日维度
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">周次编码</th>
                      <th className="py-2.5 px-3">自然周起止区间</th>
                      <th className="py-2.5 px-3">有效天数</th>
                      <th className="py-2.5 px-3">周均可用度 (%)</th>
                      <th className="py-2.5 px-3">合同 SLA 阈值</th>
                      <th className="py-2.5 px-3">偏离值 (Gap)</th>
                      <th className="py-2.5 px-3">达标判定</th>
                      <th className="py-2.5 px-3">周等效停机扣减</th>
                      <th className="py-2.5 px-3">当周事件数</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWeeklyData.map(w => {
                      const isSelected = selectedWeekNo === w.weekNo;
                      return (
                        <tr
                          key={w.weekNo}
                          onClick={() => handleSelectWeeklyRowOrBar(w.weekNo)}
                          className={`hover:bg-indigo-50/40 cursor-pointer transition-colors ${
                            isSelected && weeklyLinkageMode === 'selected'
                              ? 'bg-indigo-50/80 font-medium border-l-4 border-l-indigo-600'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{w.weekNo}</span>
                              {isSelected && weeklyLinkageMode === 'selected' && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-600 text-white font-normal">
                                  已联动
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {w.startDate} ~ {w.endDate}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{w.days} 天</td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            <span className={w.isBreached ? 'text-red-600' : 'text-emerald-600'}>
                              {w.avgAvailability}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{w.slaThreshold}%</td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            <span className={w.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {w.gap >= 0 ? `+${w.gap}%` : `${w.gap}%`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                w.isBreached
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-red-600">
                            {w.interruptionMins > 0 ? `${w.interruptionMins} min` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{w.totalEvents} 项</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleDateClick(w.startDate);
                                setCycle('daily');
                              }}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <Calendar className="w-3 h-3 text-indigo-600" />
                              <span>查看该周逐日</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Weekly Time Range Linkage Control Bar */}
          <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50 border border-indigo-200/80 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded bg-indigo-600 text-white">
                <Link2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-slate-800">核心设备联动时段:</span>
              <span className="font-mono font-bold text-indigo-800 bg-white px-2.5 py-1 rounded border border-indigo-200 shadow-2xs">
                {weeklyTimeRangeLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {weeklyLinkageMode === 'selected'
                  ? '（已聚焦选中周，下方设备状态呈现该周运行与停运扣减）'
                  : '（已联动当前筛选周区间，展示全区间累计工况与告警明细）'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setWeeklyLinkageMode('range')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  weeklyLinkageMode === 'range'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                全周区间汇总 ({weekStart} ~ {weekEnd})
              </button>
              {selectedWeekNo && (
                <button
                  type="button"
                  onClick={() => setWeeklyLinkageMode('selected')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    weeklyLinkageMode === 'selected'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  聚焦单周 ({selectedWeekNo})
                </button>
              )}
            </div>
          </div>

          {/* Equipment Status & Availability Alarms for Weekly Dimension */}
          <DimensionEquipmentAndAlarmsSection
            site={site}
            startDate={effectiveWeeklyStart}
            endDate={effectiveWeeklyEnd}
            dimension="weekly"
            timeRangeLabel={weeklyTimeRangeLabel}
            workOrders={workOrders}
            onNavigateTab={onNavigateTab}
            linkageMode={weeklyLinkageMode}
            onResetToRange={() => setWeeklyLinkageMode('range')}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MONTHLY DIMENSION (月维度)                                               */}
      {/* ========================================================================= */}
      {cycle === 'monthly' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Custom Month Range Toolbar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CalendarRange className="w-4 h-4 text-emerald-600" />
                <span>自定义统计月范围:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={monthStart}
                  onChange={e => setMonthStart(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  {['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'].map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500">至</span>
                <select
                  value={monthEnd}
                  onChange={e => setMonthEnd(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  {['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'].map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => { setMonthStart('2026-03'); setMonthEnd('2026-08'); }}
                title="重置为默认近6个月"
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium mr-1">快捷区间:</span>
              <button
                onClick={() => { setMonthStart('2026-06'); setMonthEnd('2026-08'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  monthStart === '2026-06' && monthEnd === '2026-08'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近3个月 (06~08)
              </button>
              <button
                onClick={() => { setMonthStart('2026-03'); setMonthEnd('2026-08'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  monthStart === '2026-03' && monthEnd === '2026-08'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近6个月 (03~08)
              </button>
              <button
                onClick={() => { setMonthStart('2026-01'); setMonthEnd('2026-08'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  monthStart === '2026-01' && monthEnd === '2026-08'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2026全年前8个月
              </button>
            </div>
          </div>

          {/* Monthly Summary Statistics KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
                <span>统计月度跨度</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {monthlySummary.totalMonths} <span className="text-xs font-normal text-slate-500">个月</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{monthStart} ~ {monthEnd}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>区间加权可用度</span>
              </div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  monthlySummary.avgAvail < site.slaThreshold ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {monthlySummary.avgAvail}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                考核门槛: {site.slaThreshold}%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>月度 SLA 达成率</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {monthlySummary.passRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                达标 {monthlySummary.passedMonths} 月 / 破约 {monthlySummary.breachedMonths} 月
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>累计停运损失时长</span>
              </div>
              <div className="text-xl font-bold font-mono text-red-600 mt-1">
                {monthlySummary.totalInterruptionMins}{' '}
                <span className="text-xs font-normal text-slate-400">min</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                月均中断: {(monthlySummary.totalInterruptionMins / Math.max(1, monthlySummary.totalMonths)).toFixed(1)} min
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs col-span-2 md:col-span-1">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>预估 SLA 考核扣罚</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                ¥{monthlySummary.totalPenalty.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                包含所选月度破约罚则预备金
              </div>
            </div>
          </div>

          {/* Monthly Display Mode Switcher (Tab切换: 图表 vs 列表 vs 全部展开) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">展示形式选择</span>
                  <span className="text-[11px] text-slate-500">
                    支持在【月履约走势图】与【月结算明细表】之间自由切换
                  </span>
                </div>
              </div>
            </div>

            {/* Segmented Mode Selector */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setMonthlyDisplayMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  monthlyDisplayMode === 'chart'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>图表：月度可用度走势与损失</span>
              </button>

              <button
                type="button"
                onClick={() => setMonthlyDisplayMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  monthlyDisplayMode === 'table'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>列表：月度履约结算表</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-normal">
                  {filteredMonthlyData.length}月
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMonthlyDisplayMode('all')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  monthlyDisplayMode === 'all'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="同时并列查看月度图表与明细结算表"
              >
                <span>全部展开</span>
              </button>
            </div>
          </div>

          {/* Monthly Detail Chart (Shown in 'chart' or 'all' mode) */}
          {(monthlyDisplayMode === 'chart' || monthlyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CalendarRange className="w-4 h-4 text-emerald-600" />
                    <span>月度可用度履约走势与停运损失图 ({monthStart} ~ {monthEnd}，共 {monthlySummary.totalMonths} 个月)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    各月结算可用度柱状走势；红虚线为合同 SLA {site.slaThreshold}% 履约红线；点击柱状可在下方联动展示该月设备状态
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                    <span className="text-slate-600">月度可用度(%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-slate-600">等效停机(min)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-red-500" />
                    <span className="text-slate-600 font-medium">SLA基线 ({site.slaThreshold}%)</span>
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={filteredMonthlyData}
                    onClick={(state: any) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        handleSelectMonthlyRowOrBar(state.activePayload[0].payload.month);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      domain={[99.0, 100]}
                      stroke="#059669"
                      tick={{ fontSize: 11 }}
                      unit="%"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 240]}
                      stroke="#ef4444"
                      tick={{ fontSize: 11 }}
                      unit="m"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs space-y-1 font-sans">
                              <div className="font-bold text-slate-900 font-mono flex items-center justify-between gap-3">
                                <span>{data.label}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                                    data.isBreached
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {data.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-1">
                                <span className="text-slate-500">月度可用度:</span>
                                <span
                                  className={`font-mono font-bold ${
                                    data.isBreached ? 'text-red-600' : 'text-emerald-600'
                                  }`}
                                >
                                  {data.availability}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">等效中断扣减:</span>
                                <span className="font-mono text-red-600 font-semibold">
                                  {data.interruptionMins} 分钟
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">免责计划维护:</span>
                                <span className="font-mono text-blue-600">
                                  {data.maintenanceMins} 分钟
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">预估违约扣款:</span>
                                <span className="font-mono text-amber-600">
                                  {data.penaltyAmount > 0 ? `¥${data.penaltyAmount.toLocaleString()}` : '无'}
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-600 pt-1 border-t border-slate-100 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>点击该月可在下方联动查看该月核心设备状态</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={site.slaThreshold}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `SLA ${site.slaThreshold}%`,
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="availability"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                      className="cursor-pointer"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="interruptionMins"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#ef4444', strokeWidth: 1, stroke: '#ffffff' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Monthly Detail Table (Shown in 'table' or 'all' mode) */}
          {(monthlyDisplayMode === 'table' || monthlyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    月度履约与 SLA 考核结算明细表 (当前筛选: {filteredMonthlyData.length} 个月)
                  </h3>
                </div>
                <div className="text-xs text-slate-500">
                  点击表格行可联动下方核心设备状态；点击【查看逐日】可下钻至该月日粒度
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">统计月份</th>
                      <th className="py-2.5 px-3">日历天数</th>
                      <th className="py-2.5 px-3">结算可用度 (%)</th>
                      <th className="py-2.5 px-3">SLA 门槛 (%)</th>
                      <th className="py-2.5 px-3">履约达成状态</th>
                      <th className="py-2.5 px-3">等效中断分钟</th>
                      <th className="py-2.5 px-3">免责维护时长</th>
                      <th className="py-2.5 px-3">关联事件数</th>
                      <th className="py-2.5 px-3">预估罚则扣款</th>
                      <th className="py-2.5 px-3">采集状态</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMonthlyData.map(m => {
                      const isSelected = selectedMonth === m.month;
                      return (
                        <tr
                          key={m.month}
                          onClick={() => handleSelectMonthlyRowOrBar(m.month)}
                          className={`hover:bg-emerald-50/40 cursor-pointer transition-colors ${
                            isSelected && monthlyLinkageMode === 'selected'
                              ? 'bg-emerald-50/80 font-medium border-l-4 border-l-emerald-600'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{m.month}</span>
                              {isSelected && monthlyLinkageMode === 'selected' && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-600 text-white font-normal">
                                  已联动
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{m.days} 天</td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            <span className={m.isBreached ? 'text-red-600' : 'text-emerald-600'}>
                              {m.availability}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{m.slaThreshold}%</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                m.isBreached
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-red-600">
                            {m.interruptionMins > 0 ? `${m.interruptionMins} min` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-blue-600">
                            {m.maintenanceMins > 0 ? `${m.maintenanceMins} min` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{m.eventsCount} 件</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-amber-600">
                            {m.penaltyAmount > 0 ? `¥${m.penaltyAmount.toLocaleString()}` : '¥0'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                              {m.importStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setDayStartDate(`${m.month}-01`);
                                setDayEndDate(`${m.month}-${m.days < 10 ? '0' + m.days : m.days}`);
                                setCycle('daily');
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              <span>查看逐日</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Time Range Linkage Control Bar */}
          <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded bg-emerald-600 text-white">
                <Link2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-slate-800">核心设备联动时段:</span>
              <span className="font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded border border-emerald-200 shadow-2xs">
                {monthlyTimeRangeLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {monthlyLinkageMode === 'selected'
                  ? '（已聚焦选中单月，下方设备状态呈现该月运行工况与告警明细）'
                  : '（已联动当前筛选月区间，展示全月度累计工况与告警明细）'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMonthlyLinkageMode('range')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  monthlyLinkageMode === 'range'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                全月区间汇总 ({monthStart} ~ {monthEnd})
              </button>
              {selectedMonth && (
                <button
                  type="button"
                  onClick={() => setMonthlyLinkageMode('selected')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    monthlyLinkageMode === 'selected'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  聚焦单月 ({selectedMonth})
                </button>
              )}
            </div>
          </div>

          {/* Equipment Status & Availability Alarms for Monthly Dimension */}
          <DimensionEquipmentAndAlarmsSection
            site={site}
            startDate={effectiveMonthlyStart}
            endDate={effectiveMonthlyEnd}
            dimension="monthly"
            timeRangeLabel={monthlyTimeRangeLabel}
            workOrders={workOrders}
            onNavigateTab={onNavigateTab}
            linkageMode={monthlyLinkageMode}
            onResetToRange={() => setMonthlyLinkageMode('range')}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. YEARLY DIMENSION (年维度)                                                */}
      {/* ========================================================================= */}
      {cycle === 'yearly' && yearlySummary && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Custom Year Range Toolbar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>自定义统计年份范围:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={yearStart}
                  onChange={e => setYearStart(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-500 shadow-xs"
                >
                  {yearlyData.map(y => (
                    <option key={y.year} value={y.year}>
                      {y.year}年
                    </option>
                  ))}
                </select>
                <span className="text-slate-500">至</span>
                <select
                  value={yearEnd}
                  onChange={e => setYearEnd(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-500 shadow-xs"
                >
                  {yearlyData.map(y => (
                    <option key={y.year} value={y.year}>
                      {y.year}年
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => { setYearStart('2022'); setYearEnd('2026'); }}
                title="重置为默认近5年"
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium mr-1">快捷区间:</span>
              <button
                onClick={() => { setYearStart('2024'); setYearEnd('2026'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  yearStart === '2024' && yearEnd === '2026'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近3年 (2024~2026)
              </button>
              <button
                onClick={() => { setYearStart('2022'); setYearEnd('2026'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  yearStart === '2022' && yearEnd === '2026'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                近5年 (2022~2026)
              </button>
              <button
                onClick={() => { setYearStart('2021'); setYearEnd('2026'); }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  yearStart === '2021' && yearEnd === '2026'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                建站至今全部 (2021~2026)
              </button>
            </div>
          </div>

          {/* Yearly Summary Statistics KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>统计年度跨度</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {yearlySummary.totalYears} <span className="text-xs font-normal text-slate-500">个年度</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{yearStart}年 ~ {yearEnd}年</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-600" />
                <span>历年平均可用度</span>
              </div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  yearlySummary.avgAvail < site.slaThreshold ? 'text-red-600' : 'text-purple-600'
                }`}
              >
                {yearlySummary.avgAvail}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                SLA考核阈值: {site.slaThreshold}%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>年度 SLA 达成率</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {yearlySummary.passRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                达标 {yearlySummary.passedYears} 年 / 破约 {yearlySummary.breachedYears} 年
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>累计等效停机扣减</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                {yearlySummary.totalInterruptionHours}{' '}
                <span className="text-xs font-normal text-slate-400">小时</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                折合: {yearlySummary.totalInterruptionMins} min
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs col-span-2 md:col-span-1">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>历年累计考核扣罚</span>
              </div>
              <div className="text-xl font-bold font-mono text-red-600 mt-1">
                ¥{yearlySummary.totalPenalty.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                历史年度考核违约金总额
              </div>
            </div>
          </div>

          {/* Yearly Display Mode Switcher (Tab切换: 图表 vs 列表 vs 全部展开) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">展示形式选择</span>
                  <span className="text-[11px] text-slate-500">
                    支持在【年度走势图表】与【年度台账清册列表】之间自由切换
                  </span>
                </div>
              </div>
            </div>

            {/* Segmented Mode Selector */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setYearlyDisplayMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  yearlyDisplayMode === 'chart'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-purple-600" />
                <span>图表：历年走势与停运损失</span>
              </button>

              <button
                type="button"
                onClick={() => setYearlyDisplayMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  yearlyDisplayMode === 'table'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                <span>列表：年度履约结算清册</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono font-normal">
                  {filteredYearlyData.length}年
                </span>
              </button>

              <button
                type="button"
                onClick={() => setYearlyDisplayMode('all')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  yearlyDisplayMode === 'all'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="同时并列查看年度图表与结算清册"
              >
                <span>全部展开</span>
              </button>
            </div>
          </div>

          {/* Yearly Detail Chart (Shown in 'chart' or 'all' mode) */}
          {(yearlyDisplayMode === 'chart' || yearlyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>历年可用度履约走势与停运损失时长分析图 ({yearStart} ~ {yearEnd}，共 {yearlySummary.totalYears} 个年度)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    柱状为年度结算可用度；次轴折线为当年度累计等效停运小时数；点击柱状可在下方联动展示该年设备工况
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-purple-600" />
                    <span className="text-slate-600">年度可用度(%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600">停运时长(小时)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-red-500" />
                    <span className="text-slate-600 font-medium">SLA基线 ({site.slaThreshold}%)</span>
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={filteredYearlyData}
                    onClick={(state: any) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        handleSelectYearlyRowOrBar(state.activePayload[0].payload.year);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      domain={[98.5, 100]}
                      stroke="#7c3aed"
                      tick={{ fontSize: 11 }}
                      unit="%"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 'auto']}
                      stroke="#f59e0b"
                      tick={{ fontSize: 11 }}
                      unit="h"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs space-y-1 font-sans">
                              <div className="font-bold text-slate-900 font-mono flex items-center justify-between gap-3">
                                <span>{data.label}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                                    data.isBreached
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {data.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-1">
                                <span className="text-slate-500">年度可用度:</span>
                                <span
                                  className={`font-mono font-bold ${
                                    data.isBreached ? 'text-red-600' : 'text-purple-600'
                                  }`}
                                >
                                  {data.availability}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">SLA偏差 (Gap):</span>
                                <span
                                  className={`font-mono font-semibold ${
                                    data.gap >= 0 ? 'text-emerald-600' : 'text-red-600'
                                  }`}
                                >
                                  {data.gap >= 0 ? `+${data.gap}%` : `${data.gap}%`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">等效停运扣减:</span>
                                <span className="font-mono text-amber-600 font-semibold">
                                  {data.interruptionHours} 小时 ({data.interruptionMins} min)
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">免责维护时长:</span>
                                <span className="font-mono text-blue-600">
                                  {data.maintenanceHours} 小时
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">年度考核罚则:</span>
                                <span className="font-mono text-red-600 font-semibold">
                                  {data.penaltyAmount > 0 ? `¥${data.penaltyAmount.toLocaleString()}` : '¥0'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500">核销审计状态:</span>
                                <span className="font-mono text-slate-700">{data.settlementStatus}</span>
                              </div>
                              <div className="text-[10px] text-purple-600 pt-1 border-t border-slate-100 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>点击该年度可在下方联动查看该年度核心设备状态</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine
                      yAxisId="left"
                      y={site.slaThreshold}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{
                        value: `SLA ${site.slaThreshold}%`,
                        fill: '#ef4444',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="availability"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={52}
                      className="cursor-pointer"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="interruptionHours"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1, stroke: '#ffffff' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Yearly Detail Table (Shown in 'table' or 'all' mode) */}
          {(yearlyDisplayMode === 'table' || yearlyDisplayMode === 'all') && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    年度可用度履约台账与结算清册 (当前筛选: {filteredYearlyData.length} 个年度)
                  </h3>
                </div>
                <div className="text-xs text-slate-500">
                  点击表格行可联动下方核心设备状态；点击【查看逐月】可下钻至该年月度明细
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">统计年度</th>
                      <th className="py-2.5 px-3">日历天数</th>
                      <th className="py-2.5 px-3">结算可用度 (%)</th>
                      <th className="py-2.5 px-3">SLA 门槛 (%)</th>
                      <th className="py-2.5 px-3">偏差 (Gap)</th>
                      <th className="py-2.5 px-3">履约达成判定</th>
                      <th className="py-2.5 px-3">等效中断 (h)</th>
                      <th className="py-2.5 px-3">免责维护 (h)</th>
                      <th className="py-2.5 px-3">故障事件数</th>
                      <th className="py-2.5 px-3">SLA 考核扣款</th>
                      <th className="py-2.5 px-3">核销结算状态</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredYearlyData.map(y => {
                      const isSelected = selectedYear === y.year;
                      return (
                        <tr
                          key={y.year}
                          onClick={() => handleSelectYearlyRowOrBar(y.year)}
                          className={`hover:bg-purple-50/40 cursor-pointer transition-colors ${
                            isSelected && yearlyLinkageMode === 'selected'
                              ? 'bg-purple-50/80 font-medium border-l-4 border-l-purple-600'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{y.year} 年</span>
                              {isSelected && yearlyLinkageMode === 'selected' && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-600 text-white font-normal">
                                  已联动
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{y.days} 天</td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            <span className={y.isBreached ? 'text-red-600' : 'text-purple-600'}>
                              {y.availability}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{y.slaThreshold}%</td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            <span className={y.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {y.gap >= 0 ? `+${y.gap}%` : `${y.gap}%`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                y.isBreached
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {y.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-600">
                            {y.interruptionHours > 0 ? `${y.interruptionHours} h` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-blue-600">
                            {y.maintenanceHours > 0 ? `${y.maintenanceHours} h` : '--'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{y.eventsCount} 项</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-red-600">
                            {y.penaltyAmount > 0 ? `¥${y.penaltyAmount.toLocaleString()}` : '¥0'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                y.settlementStatus === '进行中'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {y.settlementStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setMonthStart('2026-01');
                                setMonthEnd('2026-08');
                                setCycle('monthly');
                              }}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <CalendarRange className="w-3 h-3 text-purple-600" />
                              <span>查看逐月</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Yearly Time Range Linkage Control Bar */}
          <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50 border border-purple-200/80 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded bg-purple-600 text-white">
                <Link2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-slate-800">核心设备联动时段:</span>
              <span className="font-mono font-bold text-purple-800 bg-white px-2.5 py-1 rounded border border-purple-200 shadow-2xs">
                {yearlyTimeRangeLabel}
              </span>
              <span className="text-[11px] text-slate-500">
                {yearlyLinkageMode === 'selected'
                  ? '（已聚焦选中单年度，下方设备状态呈现该年度设备运行与停运分析）'
                  : '（已联动当前筛选年度跨度，展示全年度累计工况与告警明细）'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setYearlyLinkageMode('range')}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  yearlyLinkageMode === 'range'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                全年度区间汇总 ({yearStart}年 ~ {yearEnd}年)
              </button>
              {selectedYear && (
                <button
                  type="button"
                  onClick={() => setYearlyLinkageMode('selected')}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    yearlyLinkageMode === 'selected'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  聚焦单年 ({selectedYear}年)
                </button>
              )}
            </div>
          </div>

          {/* Equipment Status & Availability Alarms for Yearly Dimension */}
          <DimensionEquipmentAndAlarmsSection
            site={site}
            startDate={effectiveYearlyStart}
            endDate={effectiveYearlyEnd}
            dimension="yearly"
            timeRangeLabel={yearlyTimeRangeLabel}
            workOrders={workOrders}
            onNavigateTab={onNavigateTab}
            linkageMode={yearlyLinkageMode}
            onResetToRange={() => setYearlyLinkageMode('range')}
          />
        </div>
      )}
    </div>
  );
};
