import { CoreDevice } from '../../types';

export interface TelemetryDataPoint {
  timestamp: string;
  timeLabel: string;
  // Common electrical
  activePowerKw?: number; // 交流有功功率
  reactivePowerKvar?: number; // 交流无功功率
  voltageV?: number; // 电压 (PCS AC/BMS Total)
  currentA?: number; // 电流 (PCS AC/BMS Total)
  dcVoltageV?: number; // 直流侧母线电压
  dcCurrentA?: number; // 直流侧母线电流
  frequencyHz?: number; // 电网频率
  efficiencyPct?: number; // 转换效率 %
  
  // Thermal / Environment
  temperatureC?: number; // IGBT温度 / 电池最高温 / 主机CPU温度
  tempMinC?: number; // 最低单体温
  tempMaxC?: number; // 最高单体温
  ambientTempC?: number; // 环境温度

  // BMS specifics
  socPct?: number; // 荷电状态 %
  sohPct?: number; // 健康度 %
  cellVoltageMaxMv?: number; // 单体最高电压 mV
  cellVoltageMinMv?: number; // 单体最低电压 mV
  cellVoltageDeltaMv?: number; // 单体压差 mV
  insulationResistanceKohm?: number; // 绝缘阻抗 kΩ

  // EMS specifics
  cpuUsagePct?: number; // CPU利用率 %
  memoryUsagePct?: number; // 内存占用率 %
  networkLatencyMs?: number; // 通信时延 ms
  commandTrackAccuracyPct?: number; // 调度指令跟踪精度 %
  packetLossPct?: number; // 丢包率 %

  // Operating Condition State
  operatingState: 'CHARGING' | 'DISCHARGING' | 'STANDBY' | 'REGULATING' | 'FAULT_TRIP' | 'MAINTENANCE';
  operatingStateLabel: string;
}

export interface TelemetryPointItem {
  id: string;
  pointCode: string;
  pointName: string;
  category: 'ELECTRICAL' | 'THERMAL' | 'STATUS_DI' | 'CONTROL_AO' | 'SETTING';
  currentValue: string | number;
  unit: string;
  rawHex: string;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  lowerThreshold?: number | string;
  upperThreshold?: number | string;
  updatePeriodMs: number;
  lastUpdated: string;
  trendSparkline: number[];
}

export interface OperatingCycleRecord {
  id: string;
  period: string;
  mode: string;
  modeType: 'charge' | 'discharge' | 'standby' | 'fault' | 'maintenance';
  durationHours: number;
  throughputKwh: number;
  avgPowerKw: number;
  peakTempC: number;
  efficiencyPct: number;
  status: 'COMPLETED' | 'RUNNING' | 'TRIPPED';
  remark: string;
}

export interface DeviceAlarmLog {
  id: string;
  timestamp: string;
  alarmCode: string;
  alarmTitle: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INFO';
  recoveryTime?: string;
  equivalentInterruptionMins: number;
  rootCause: string;
  workOrderNo?: string;
  workOrderStatus?: 'RESOLVED' | 'PROCESSING' | 'PENDING';
}

// Generate realistic telemetry time series based on device type and time range
export function generateDeviceTelemetrySeries(
  device: CoreDevice,
  timeRange: '24h' | '7d' | '30d'
): TelemetryDataPoint[] {
  const points: TelemetryDataPoint[] = [];
  const isPcs = device.deviceType === 'PCS_INVERTER';
  const isBms = device.deviceType === 'BMS_CLUSTER';
  const isEms = device.deviceType === 'EMS_HOST';
  const ratedPower = device.ratedPowerKw || 1250;

  if (timeRange === '24h') {
    // 24 hours in 1-hour increments (00:00 to 23:00)
    for (let h = 0; h < 24; h++) {
      const hh = h.toString().padStart(2, '0');
      const timeLabel = `${hh}:00`;
      const timestamp = `2026-08-20 ${timeLabel}`;

      let opState: TelemetryDataPoint['operatingState'] = 'STANDBY';
      let opStateLabel = '待机热备';
      let activeP = 0;
      let reactiveP = Math.round((Math.sin(h / 3) * 20 + 15) * 10) / 10;
      let temp = 38 + Math.sin(h / 4) * 5;
      let soc = 65;

      // Typical 2-charge 2-discharge cycle for energy storage:
      // 00:00-06:00 Valley Charge (谷电充电)
      // 09:00-12:00 Peak Discharge (早高峰放电)
      // 14:00-17:00 Midday Charge (平段充电)
      // 18:00-21:00 Evening Peak Discharge (晚高峰放电)
      // Other: Standby / Frequency Regulation
      if (h >= 1 && h <= 5) {
        opState = 'CHARGING';
        opStateLabel = '谷电恒功率充电';
        activeP = -Math.round(ratedPower * (0.85 + Math.sin(h) * 0.1));
        temp = 43 + (h - 1) * 1.5;
        soc = Math.min(98, 20 + h * 15);
      } else if (h >= 9 && h <= 11) {
        opState = 'DISCHARGING';
        opStateLabel = '尖峰时段顶峰放电';
        activeP = Math.round(ratedPower * (0.92 + Math.cos(h) * 0.05));
        temp = 48 + (h - 8) * 2.2;
        soc = Math.max(15, 95 - (h - 8) * 25);
      } else if (h >= 13 && h <= 15) {
        opState = 'CHARGING';
        opStateLabel = '光伏平段消纳充电';
        activeP = -Math.round(ratedPower * (0.75 + Math.sin(h) * 0.08));
        temp = 42 + (h - 12) * 1.2;
        soc = Math.min(88, 20 + (h - 12) * 22);
      } else if (h >= 18 && h <= 21) {
        opState = 'DISCHARGING';
        opStateLabel = '晚高峰电网保供放电';
        activeP = Math.round(ratedPower * (0.88 + Math.sin(h) * 0.06));
        temp = 46 + (h - 17) * 2.0;
        soc = Math.max(12, 85 - (h - 17) * 23);
      } else if (h === 14 && device.status === 'WARNING') {
        // Warning simulation for specific device
        opState = 'REGULATING';
        opStateLabel = '一次调频响应(微调降额)';
        activeP = Math.round(ratedPower * 0.35);
        temp = 54.8;
      } else {
        opState = 'STANDBY';
        opStateLabel = '待机热备状态';
        activeP = 0;
        temp = 36.5 + Math.sin(h / 3) * 2;
        soc = h < 9 ? 95 : h < 18 ? 85 : 15;
      }

      const voltage = 690 + Math.round(Math.sin(h) * 8);
      const current = activeP !== 0 ? Math.round((Math.abs(activeP) * 1000) / (Math.sqrt(3) * voltage)) : 0;
      const efficiency = activeP !== 0 ? Math.min(99.1, 98.2 + (Math.abs(activeP) / ratedPower) * 0.7) : 0;

      points.push({
        timestamp,
        timeLabel,
        activePowerKw: isPcs ? activeP : isBms ? -activeP : undefined,
        reactivePowerKvar: isPcs ? reactiveP : undefined,
        voltageV: isPcs ? voltage : isBms ? 768 + Math.round((soc / 100) * 80) : 220,
        currentA: isPcs ? current : isBms ? Math.round(current * 0.9) : 4.5,
        dcVoltageV: isPcs ? 820 + Math.round(Math.sin(h) * 12) : undefined,
        dcCurrentA: isPcs ? Math.round(current * 1.15) : undefined,
        frequencyHz: 50.0 + Math.round(Math.sin(h * 1.5) * 0.08 * 100) / 100,
        efficiencyPct: isPcs ? Number(efficiency.toFixed(2)) : undefined,
        temperatureC: Number(temp.toFixed(1)),
        tempMinC: isBms ? Number((temp - 2.8).toFixed(1)) : undefined,
        tempMaxC: isBms ? Number((temp + 3.2).toFixed(1)) : undefined,
        ambientTempC: 28 + Math.round(Math.sin((h - 6) / 4) * 6),
        socPct: isBms ? soc : undefined,
        sohPct: isBms ? 98.4 : undefined,
        cellVoltageMaxMv: isBms ? Math.round(3200 + (soc / 100) * 350 + 12) : undefined,
        cellVoltageMinMv: isBms ? Math.round(3200 + (soc / 100) * 350 - 15) : undefined,
        cellVoltageDeltaMv: isBms ? 27 : undefined,
        insulationResistanceKohm: isBms ? 2450 : undefined,
        cpuUsagePct: isEms ? Math.round(28 + Math.sin(h) * 12) : undefined,
        memoryUsagePct: isEms ? Math.round(45 + (h / 24) * 8) : undefined,
        networkLatencyMs: isEms ? Math.round(2.4 + Math.random() * 1.2) : undefined,
        commandTrackAccuracyPct: isEms ? 99.85 : undefined,
        packetLossPct: isEms ? 0.0 : undefined,
        operatingState: opState,
        operatingStateLabel: opStateLabel
      });
    }
  } else if (timeRange === '7d') {
    // 7 days daily summaries / 12h points
    const days = ['8-14', '8-15', '8-16', '8-17', '8-18', '8-19', '8-20'];
    days.forEach((day, idx) => {
      ['08:00', '20:00'].forEach((time, tIdx) => {
        const timeLabel = `${day} ${time}`;
        const isDischarging = tIdx === 1;
        const activeP = isDischarging ? Math.round(ratedPower * 0.9) : -Math.round(ratedPower * 0.85);
        const temp = 44 + idx * 0.8 + (isDischarging ? 4 : 0);

        points.push({
          timestamp: `2026-0${day} ${time}`,
          timeLabel,
          activePowerKw: isPcs ? activeP : undefined,
          reactivePowerKvar: isPcs ? 25 : undefined,
          voltageV: 690,
          currentA: Math.round((Math.abs(activeP) * 1000) / (Math.sqrt(3) * 690)),
          efficiencyPct: 98.85,
          temperatureC: Number(temp.toFixed(1)),
          socPct: isBms ? (isDischarging ? 25 : 92) : undefined,
          sohPct: isBms ? 98.4 : undefined,
          cpuUsagePct: isEms ? Math.round(32 + idx * 2) : undefined,
          memoryUsagePct: isEms ? 48 : undefined,
          networkLatencyMs: isEms ? 2.8 : undefined,
          operatingState: isDischarging ? 'DISCHARGING' : 'CHARGING',
          operatingStateLabel: isDischarging ? '晚峰放电' : '晨间充电'
        });
      });
    });
  } else {
    // 30 days daily points
    for (let d = 1; d <= 20; d++) {
      const dd = d.toString().padStart(2, '0');
      const timeLabel = `08-${dd}`;
      const activeP = Math.round(ratedPower * (0.8 + Math.sin(d / 3) * 0.15));
      const temp = 42 + Math.sin(d / 4) * 5;

      points.push({
        timestamp: `2026-08-${dd}`,
        timeLabel,
        activePowerKw: isPcs ? activeP : undefined,
        voltageV: 690,
        currentA: 1050,
        efficiencyPct: 98.9,
        temperatureC: Number(temp.toFixed(1)),
        socPct: isBms ? 88 : undefined,
        sohPct: isBms ? Number((99.0 - (d / 30) * 0.3).toFixed(2)) : undefined,
        cpuUsagePct: isEms ? 30 : undefined,
        memoryUsagePct: isEms ? 46 : undefined,
        networkLatencyMs: isEms ? 2.5 : undefined,
        operatingState: 'DISCHARGING',
        operatingStateLabel: '日充放循环'
      });
    }
  }

  return points;
}

// Generate full Telemetry Point Matrix (测点点表清单)
export function generateDevicePointMatrix(device: CoreDevice): TelemetryPointItem[] {
  const isPcs = device.deviceType === 'PCS_INVERTER';
  const isBms = device.deviceType === 'BMS_CLUSTER';
  const isEms = device.deviceType === 'EMS_HOST';
  const prefix = device.deviceCode.replace(/-/g, '_');

  if (isPcs) {
    return [
      {
        id: 'pt-001',
        pointCode: `${prefix}_P_ACT`,
        pointName: '交流侧三相有功功率 (Active Power)',
        category: 'ELECTRICAL',
        currentValue: 1148.5,
        unit: 'kW',
        rawHex: '0x44939000',
        quality: 'GOOD',
        lowerThreshold: -1250,
        upperThreshold: 1250,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [0, -1100, -1200, 0, 1150, 1180, 1148]
      },
      {
        id: 'pt-002',
        pointCode: `${prefix}_Q_REACT`,
        pointName: '交流侧无功功率 (Reactive Power)',
        category: 'ELECTRICAL',
        currentValue: 24.6,
        unit: 'kvar',
        rawHex: '0x41C4CCCD',
        quality: 'GOOD',
        lowerThreshold: -600,
        upperThreshold: 600,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [15, 20, 28, 22, 25, 24, 24.6]
      },
      {
        id: 'pt-003',
        pointCode: `${prefix}_U_GRID_AB`,
        pointName: '电网线电压 Uab (Grid Voltage AB)',
        category: 'ELECTRICAL',
        currentValue: 692.4,
        unit: 'V',
        rawHex: '0x442D199A',
        quality: 'GOOD',
        lowerThreshold: 621,
        upperThreshold: 759,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [690, 691, 693, 692, 694, 692, 692.4]
      },
      {
        id: 'pt-004',
        pointCode: `${prefix}_I_GRID_A`,
        pointName: '交流输出相电流 Ia (AC Phase Current A)',
        category: 'ELECTRICAL',
        currentValue: 958.2,
        unit: 'A',
        rawHex: '0x446F8CCD',
        quality: 'GOOD',
        lowerThreshold: 0,
        upperThreshold: 1150,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [0, 920, 980, 0, 950, 970, 958.2]
      },
      {
        id: 'pt-005',
        pointCode: `${prefix}_U_DC_BUS`,
        pointName: '直流侧母线电压 (DC Bus Voltage)',
        category: 'ELECTRICAL',
        currentValue: 824.5,
        unit: 'V',
        rawHex: '0x444E2000',
        quality: 'GOOD',
        lowerThreshold: 650,
        upperThreshold: 950,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [780, 810, 825, 820, 830, 822, 824.5]
      },
      {
        id: 'pt-006',
        pointCode: `${prefix}_T_IGBT_MAX`,
        pointName: 'IGBT 功率桥臂最高温度 (IGBT Max Temp)',
        category: 'THERMAL',
        currentValue: device.status === 'WARNING' ? 58.4 : 46.2,
        unit: '℃',
        rawHex: '0x4238CCCD',
        quality: device.status === 'WARNING' ? 'UNCERTAIN' : 'GOOD',
        lowerThreshold: 0,
        upperThreshold: 75,
        updatePeriodMs: 2000,
        lastUpdated: '2026-08-20 19:48:31',
        trendSparkline: [38, 42, 45, 48, 52, 56, device.status === 'WARNING' ? 58.4 : 46.2]
      },
      {
        id: 'pt-007',
        pointCode: `${prefix}_FREQ_GRID`,
        pointName: '电网实时采样频率 (Grid Frequency)',
        category: 'ELECTRICAL',
        currentValue: 50.02,
        unit: 'Hz',
        rawHex: '0x4248147B',
        quality: 'GOOD',
        lowerThreshold: 49.5,
        upperThreshold: 50.5,
        updatePeriodMs: 500,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [50.01, 49.98, 50.04, 50.01, 49.99, 50.02, 50.02]
      },
      {
        id: 'pt-008',
        pointCode: `${prefix}_RUN_STATUS`,
        pointName: '变流器主运行状态字 (Main Run State)',
        category: 'STATUS_DI',
        currentValue: '0x0002 (恒功率放电)',
        unit: 'HEX',
        rawHex: '0x0002',
        quality: 'GOOD',
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [1, 2, 2, 1, 2, 2, 2]
      },
      {
        id: 'pt-009',
        pointCode: `${prefix}_EFFICIENCY`,
        pointName: '交直流实时双向转换效率',
        category: 'CONTROL_AO',
        currentValue: 98.92,
        unit: '%',
        rawHex: '0x42C5D70A',
        quality: 'GOOD',
        lowerThreshold: 97.0,
        upperThreshold: 100.0,
        updatePeriodMs: 5000,
        lastUpdated: '2026-08-20 19:48:30',
        trendSparkline: [98.5, 98.7, 98.9, 98.8, 99.0, 98.9, 98.92]
      }
    ];
  }

  if (isBms) {
    return [
      {
        id: 'pt-101',
        pointCode: `${prefix}_SOC`,
        pointName: '电池簇荷电状态 (State of Charge)',
        category: 'ELECTRICAL',
        currentValue: 64.8,
        unit: '%',
        rawHex: '0x4281999A',
        quality: 'GOOD',
        lowerThreshold: 10,
        upperThreshold: 95,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [20, 45, 90, 85, 40, 75, 64.8]
      },
      {
        id: 'pt-102',
        pointCode: `${prefix}_SOH`,
        pointName: '电池簇健康状态 (State of Health)',
        category: 'ELECTRICAL',
        currentValue: 98.4,
        unit: '%',
        rawHex: '0x42C4CCCD',
        quality: 'GOOD',
        lowerThreshold: 80,
        upperThreshold: 100,
        updatePeriodMs: 60000,
        lastUpdated: '2026-08-20 19:40:00',
        trendSparkline: [98.5, 98.5, 98.4, 98.4, 98.4, 98.4, 98.4]
      },
      {
        id: 'pt-103',
        pointCode: `${prefix}_VOLT_CLUSTER`,
        pointName: '电池簇总电压 (Cluster Total Voltage)',
        category: 'ELECTRICAL',
        currentValue: 792.6,
        unit: 'V',
        rawHex: '0x44462666',
        quality: 'GOOD',
        lowerThreshold: 672,
        upperThreshold: 864,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [720, 750, 840, 820, 740, 810, 792.6]
      },
      {
        id: 'pt-104',
        pointCode: `${prefix}_CELL_V_MAX`,
        pointName: '单体最高电芯电压 (Max Cell Voltage)',
        category: 'ELECTRICAL',
        currentValue: 3348,
        unit: 'mV',
        rawHex: '0x0D14',
        quality: 'GOOD',
        lowerThreshold: 2800,
        upperThreshold: 3650,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [3150, 3250, 3450, 3400, 3200, 3380, 3348]
      },
      {
        id: 'pt-105',
        pointCode: `${prefix}_CELL_V_DELTA`,
        pointName: '单体电芯最大压差 (Cell Voltage Delta)',
        category: 'ELECTRICAL',
        currentValue: 24,
        unit: 'mV',
        rawHex: '0x0018',
        quality: 'GOOD',
        lowerThreshold: 0,
        upperThreshold: 50,
        updatePeriodMs: 1000,
        lastUpdated: '2026-08-20 19:48:32',
        trendSparkline: [18, 22, 26, 28, 22, 25, 24]
      },
      {
        id: 'pt-106',
        pointCode: `${prefix}_TEMP_CELL_MAX`,
        pointName: '单体最高温度 (Max Cell Temp)',
        category: 'THERMAL',
        currentValue: 36.8,
        unit: '℃',
        rawHex: '0x42133333',
        quality: 'GOOD',
        lowerThreshold: 15,
        upperThreshold: 45,
        updatePeriodMs: 2000,
        lastUpdated: '2026-08-20 19:48:30',
        trendSparkline: [26, 29, 34, 38, 35, 37, 36.8]
      },
      {
        id: 'pt-107',
        pointCode: `${prefix}_INSULATION_POS`,
        pointName: '正极对地绝缘电阻 (Pos Ground Insulation)',
        category: 'STATUS_DI',
        currentValue: 2450,
        unit: 'kΩ',
        rawHex: '0x0992',
        quality: 'GOOD',
        lowerThreshold: 500,
        upperThreshold: 5000,
        updatePeriodMs: 10000,
        lastUpdated: '2026-08-20 19:48:20',
        trendSparkline: [2480, 2460, 2450, 2450, 2450, 2450, 2450]
      }
    ];
  }

  // EMS Host
  return [
    {
      id: 'pt-201',
      pointCode: `${prefix}_CPU_LOAD`,
      pointName: '调度主机 CPU 利用率',
      category: 'CONTROL_AO',
      currentValue: 28.5,
      unit: '%',
      rawHex: '0x41E40000',
      quality: 'GOOD',
      lowerThreshold: 0,
      upperThreshold: 85,
      updatePeriodMs: 2000,
      lastUpdated: '2026-08-20 19:48:32',
      trendSparkline: [22, 26, 35, 29, 32, 28, 28.5]
    },
    {
      id: 'pt-202',
      pointCode: `${prefix}_MEM_LOAD`,
      pointName: '调度主机物理内存使用率',
      category: 'CONTROL_AO',
      currentValue: 46.2,
      unit: '%',
      rawHex: '0x4238CCCD',
      quality: 'GOOD',
      lowerThreshold: 0,
      upperThreshold: 90,
      updatePeriodMs: 5000,
      lastUpdated: '2026-08-20 19:48:30',
      trendSparkline: [44, 45, 45, 46, 46, 46, 46.2]
    },
    {
      id: 'pt-203',
      pointCode: `${prefix}_IEC104_LATENCY`,
      pointName: '电网调度 IEC-104 通信时延',
      category: 'ELECTRICAL',
      currentValue: 2.15,
      unit: 'ms',
      rawHex: '0x4009999A',
      quality: 'GOOD',
      lowerThreshold: 0,
      upperThreshold: 50,
      updatePeriodMs: 1000,
      lastUpdated: '2026-08-20 19:48:32',
      trendSparkline: [2.1, 2.4, 2.8, 2.0, 2.3, 2.2, 2.15]
    },
    {
      id: 'pt-204',
      pointCode: `${prefix}_SYNC_HEARTBEAT`,
      pointName: '双机热备心跳对齐时钟偏差',
      category: 'STATUS_DI',
      currentValue: 0.12,
      unit: 'ms',
      rawHex: '0x3DF5C28F',
      quality: 'GOOD',
      lowerThreshold: 0,
      upperThreshold: 5,
      updatePeriodMs: 500,
      lastUpdated: '2026-08-20 19:48:32',
      trendSparkline: [0.1, 0.15, 0.12, 0.11, 0.14, 0.12, 0.12]
    },
    {
      id: 'pt-205',
      pointCode: `${prefix}_AGC_ACCURACY`,
      pointName: 'AGC 自动发电控制跟踪达成率',
      category: 'CONTROL_AO',
      currentValue: 99.88,
      unit: '%',
      rawHex: '0x42C7C28F',
      quality: 'GOOD',
      lowerThreshold: 98.0,
      upperThreshold: 100.0,
      updatePeriodMs: 10000,
      lastUpdated: '2026-08-20 19:48:25',
      trendSparkline: [99.8, 99.9, 99.85, 99.92, 99.88, 99.88, 99.88]
    }
  ];
}

// Generate Historical Operating Cycle Records (工况运行历史记录)
export function generateOperatingCycles(device: CoreDevice): OperatingCycleRecord[] {
  const isPcs = device.deviceType === 'PCS_INVERTER';
  const rated = device.ratedPowerKw || 1250;

  return [
    {
      id: 'cyc-001',
      period: '2026-08-20 18:00 ~ 21:30',
      mode: '晚高峰保供放电 (Peak Discharge)',
      modeType: 'discharge',
      durationHours: 3.5,
      throughputKwh: Math.round(rated * 3.5 * 0.88),
      avgPowerKw: Math.round(rated * 0.88),
      peakTempC: 48.6,
      efficiencyPct: 98.92,
      status: 'RUNNING',
      remark: '响应南网调度指令，全功率削峰顶峰输出，各项遥测电气指标处于优良区间。'
    },
    {
      id: 'cyc-002',
      period: '2026-08-20 13:00 ~ 15:30',
      mode: '平段光伏消纳充电 (Midday Charge)',
      modeType: 'charge',
      durationHours: 2.5,
      throughputKwh: Math.round(rated * 2.5 * 0.75),
      avgPowerKw: Math.round(rated * 0.75),
      peakTempC: 43.2,
      efficiencyPct: 98.85,
      status: 'COMPLETED',
      remark: '消纳区域分布式光伏盈余电量，SOC从22%平滑充至85%。'
    },
    {
      id: 'cyc-003',
      period: '2026-08-20 09:00 ~ 12:00',
      mode: '早高峰顶峰放电 (Morning Discharge)',
      modeType: 'discharge',
      durationHours: 3.0,
      throughputKwh: Math.round(rated * 3.0 * 0.92),
      avgPowerKw: Math.round(rated * 0.92),
      peakTempC: 50.4,
      efficiencyPct: 98.95,
      status: 'COMPLETED',
      remark: '高负荷工况连续运行3小时，无过温或越限告警。'
    },
    {
      id: 'cyc-004',
      period: '2026-08-20 01:00 ~ 06:00',
      mode: '谷电恒功率充电 (Valley Charge)',
      modeType: 'charge',
      durationHours: 5.0,
      throughputKwh: Math.round(rated * 5.0 * 0.85),
      avgPowerKw: Math.round(rated * 0.85),
      peakTempC: 44.1,
      efficiencyPct: 98.88,
      status: 'COMPLETED',
      remark: '低谷电价时段储能充满，完成一次全生命周期电芯被动均衡。'
    },
    {
      id: 'cyc-005',
      period: '2026-08-15 14:20 ~ 16:30',
      mode: 'IGBT过温联锁跳闸检修 (Trip & Maintenance)',
      modeType: 'fault',
      durationHours: 2.17,
      throughputKwh: 0,
      avgPowerKw: 0,
      peakTempC: 68.5,
      efficiencyPct: 0,
      status: 'TRIPPED',
      remark: 'Rule R2 & R4 考核事件：变流器 2# 桥臂滤网堵塞触发过温闭锁，产生等效 PCS 中断 130 分钟。工单 WO-20260815-9921 闭环更换。'
    }
  ];
}

// Generate device specific alarms & SLA impact (设备告警与中断责任)
export function generateDeviceAlarmLogs(device: CoreDevice): DeviceAlarmLog[] {
  if (device.deviceCode.includes('01B') || device.status === 'WARNING') {
    return [
      {
        id: 'alm-dev-01',
        timestamp: '2026-08-20 14:15:20',
        alarmCode: 'ALM-PCS-TEMP-W02',
        alarmTitle: '变流器功率模块 IGBT 驱动板散热片温差偏高预警',
        severity: 'WARNING',
        equivalentInterruptionMins: 0,
        rootCause: '进风滤网积灰导致进出风温差增大至 12.8℃ (阈值 10℃)，未触发停机。',
        workOrderNo: 'WO-20260820-1048',
        workOrderStatus: 'PROCESSING'
      },
      {
        id: 'alm-dev-02',
        timestamp: '2026-08-15 14:20:00',
        alarmCode: 'ALM-PCS-OVERTEMP-TRIP',
        alarmTitle: '2# 桥臂 IGBT 结温超限 (68.5℃) 触发热保护联锁停机',
        severity: 'CRITICAL',
        recoveryTime: '2026-08-15 16:30:00',
        equivalentInterruptionMins: 130,
        rootCause: '风机供电电磁接触器触点烧蚀导致 2# 抽风通道风压不足。',
        workOrderNo: 'WO-20260815-9921',
        workOrderStatus: 'RESOLVED'
      }
    ];
  }

  return [
    {
      id: 'alm-dev-03',
      timestamp: '2026-08-10 09:12:00',
      alarmCode: 'ALM-GRID-FREQ-DIP',
      alarmTitle: '电网侧微小频率突变 (49.85Hz) 触发一次调频动作',
      severity: 'INFO',
      recoveryTime: '2026-08-10 09:12:45',
      equivalentInterruptionMins: 0,
      rootCause: '外部电网扰动，设备按既定下垂曲线输出 120kW 调频功率，正常恢复。'
    },
    {
      id: 'alm-dev-04',
      timestamp: '2026-07-22 18:30:00',
      alarmCode: 'ALM-COMM-HEARTBEAT-RETRY',
      alarmTitle: 'CAN 总线偶发通信重传包 (重传率 0.04%)',
      severity: 'MINOR',
      recoveryTime: '2026-07-22 18:30:10',
      equivalentInterruptionMins: 0,
      rootCause: '电磁干扰自恢复，双环网未发生主备倒换。'
    }
  ];
}
