import { Site, CoreDevice, SitePowerTopology, TopologyNode, TopologyEdge, TopologyNodeType, TopologyEdgeType } from '../../types';

export const NODE_TYPE_META: Record<TopologyNodeType, {
  label: string;
  category: 'grid' | 'conversion' | 'storage' | 'control' | 'bus';
  defaultVoltage?: string;
  iconBg: string;
  borderColor: string;
  badgeColor: string;
}> = {
  GRID: {
    label: '电网并网点',
    category: 'grid',
    defaultVoltage: '35kV',
    iconBg: 'bg-sky-50 text-sky-700',
    borderColor: 'border-sky-300',
    badgeColor: 'bg-sky-100 text-sky-800'
  },
  TRANSFORMER: {
    label: '升压变压器',
    category: 'conversion',
    defaultVoltage: '35kV/0.69kV',
    iconBg: 'bg-indigo-50 text-indigo-700',
    borderColor: 'border-indigo-300',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  AC_BUS: {
    label: '交流母线',
    category: 'bus',
    defaultVoltage: '0.69kV AC',
    iconBg: 'bg-blue-50 text-blue-700',
    borderColor: 'border-blue-400',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  PCS: {
    label: 'PCS储能变流器',
    category: 'conversion',
    defaultVoltage: '690V AC / 1500V DC',
    iconBg: 'bg-cyan-50 text-cyan-700',
    borderColor: 'border-cyan-300',
    badgeColor: 'bg-cyan-100 text-cyan-800'
  },
  DC_BUS: {
    label: '直流汇流母线',
    category: 'bus',
    defaultVoltage: '1500V DC',
    iconBg: 'bg-amber-50 text-amber-700',
    borderColor: 'border-amber-400',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  BATTERY: {
    label: 'BMS电池簇/堆',
    category: 'storage',
    defaultVoltage: '1500V DC',
    iconBg: 'bg-emerald-50 text-emerald-700',
    borderColor: 'border-emerald-300',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  EMS: {
    label: 'EMS能量管控中枢',
    category: 'control',
    defaultVoltage: '220V AC',
    iconBg: 'bg-purple-50 text-purple-700',
    borderColor: 'border-purple-300',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  PV_STRING: {
    label: '光伏汇流/组串',
    category: 'conversion',
    defaultVoltage: '1500V DC',
    iconBg: 'bg-yellow-50 text-yellow-700',
    borderColor: 'border-yellow-300',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  LOAD: {
    label: '站用电/负荷',
    category: 'grid',
    defaultVoltage: '380V AC',
    iconBg: 'bg-slate-50 text-slate-700',
    borderColor: 'border-slate-300',
    badgeColor: 'bg-slate-100 text-slate-800'
  }
};

/**
 * 为任意站点生成默认、符合电气单线图规范的功率拓扑
 */
export function generateDefaultSiteTopology(site: Site): SitePowerTopology {
  const nodes: TopologyNode[] = [];
  const edges: TopologyEdge[] = [];

  const pcsDevices = site.coreDevices.filter(d => d.deviceType === 'PCS_INVERTER');
  const bmsDevices = site.coreDevices.filter(d => d.deviceType === 'BMS_CLUSTER');
  const emsDevice = site.coreDevices.find(d => d.deviceType === 'EMS_HOST');
  const transDevice = site.coreDevices.find(d => d.deviceType === 'TRANSFORMER');

  // 1. 电网并网点 (Grid Node)
  const gridNodeId = `node-grid-${site.id}`;
  nodes.push({
    id: gridNodeId,
    name: `${site.region || '区域'}主电网并网间隔`,
    code: 'GRID-PCC-01',
    type: 'GRID',
    voltageLevel: site.gridVoltageLevel || '35kV',
    ratedPowerKw: site.capacityMw ? site.capacityMw * 1000 : 5000,
    x: 480,
    y: 40,
    status: 'NORMAL',
    isKeyDevice: true
  });

  // 2. 升压变压器 (Transformer Node)
  const transNodeId = transDevice ? `node-dev-${transDevice.id}` : `node-trans-${site.id}`;
  nodes.push({
    id: transNodeId,
    deviceId: transDevice?.id,
    name: transDevice?.deviceName || '35kV/0.69kV 双绕组升压变压器 #1',
    code: transDevice?.deviceCode || 'TR-35-01',
    type: 'TRANSFORMER',
    model: transDevice?.model || 'S11-M-2500/35',
    voltageLevel: '35kV / 0.69kV',
    ratedPowerKw: site.capacityMw ? site.capacityMw * 1000 : 2500,
    x: 480,
    y: 160,
    status: transDevice?.status || 'NORMAL',
    isKeyDevice: true
  });

  edges.push({
    id: `edge-grid-trans`,
    fromNodeId: gridNodeId,
    toNodeId: transNodeId,
    edgeType: 'AC_POWER',
    flowDirection: 'BIDIRECTIONAL',
    ratedVoltage: site.gridVoltageLevel || '35kV',
    label: '35kV 进线'
  });

  // 3. 交流母线 (AC Bus)
  const acBusId = `node-ac-bus-${site.id}`;
  nodes.push({
    id: acBusId,
    name: '0.69kV 交流主母线 (AC Bus I段)',
    code: 'BUS-AC-0.69kV',
    type: 'AC_BUS',
    voltageLevel: '0.69kV AC',
    ratedPowerKw: site.capacityMw ? site.capacityMw * 1000 : 2500,
    x: 480,
    y: 280,
    status: 'NORMAL',
    isKeyDevice: true
  });

  edges.push({
    id: `edge-trans-acbus`,
    fromNodeId: transNodeId,
    toNodeId: acBusId,
    edgeType: 'AC_POWER',
    flowDirection: 'BIDIRECTIONAL',
    ratedVoltage: '0.69kV',
    label: '低压侧进线'
  });

  // 4. PCS 变流机组
  const actualPcs = pcsDevices.length > 0 ? pcsDevices : [
    {
      id: `mock-pcs-1`,
      deviceCode: 'PCS-01A',
      deviceName: '1.25MW 储能变流器 #1',
      deviceType: 'PCS_INVERTER' as const,
      model: 'EN-PCS-1250',
      status: 'NORMAL' as const,
      isKeyDevice: true,
      installedDate: '2024-05-01',
      ratedPowerKw: 1250
    },
    {
      id: `mock-pcs-2`,
      deviceCode: 'PCS-01B',
      deviceName: '1.25MW 储能变流器 #2',
      deviceType: 'PCS_INVERTER' as const,
      model: 'EN-PCS-1250',
      status: 'NORMAL' as const,
      isKeyDevice: true,
      installedDate: '2024-05-01',
      ratedPowerKw: 1250
    }
  ];

  const pcsSpacing = 280;
  const pcsStartX = Math.max(160, 480 - ((actualPcs.length - 1) * pcsSpacing) / 2);

  actualPcs.forEach((pcs, idx) => {
    const pcsNodeId = `node-dev-${pcs.id}`;
    nodes.push({
      id: pcsNodeId,
      deviceId: pcs.id,
      name: pcs.deviceName,
      code: pcs.deviceCode,
      type: 'PCS',
      model: pcs.model,
      voltageLevel: '690V AC / 1500V DC',
      ratedPowerKw: pcs.ratedPowerKw || 1250,
      x: pcsStartX + idx * pcsSpacing,
      y: 400,
      status: pcs.status,
      isKeyDevice: true
    });

    edges.push({
      id: `edge-acbus-pcs-${pcs.id}`,
      fromNodeId: acBusId,
      toNodeId: pcsNodeId,
      edgeType: 'AC_POWER',
      flowDirection: 'BIDIRECTIONAL',
      ratedVoltage: '690V AC',
      label: 'AC并网支路'
    });
  });

  // 5. 直流汇流母线 (DC Bus)
  const dcBusId = `node-dc-bus-${site.id}`;
  nodes.push({
    id: dcBusId,
    name: '1500V 直流汇流主母线 (DC Bus I段)',
    code: 'BUS-DC-1500V',
    type: 'DC_BUS',
    voltageLevel: '1500V DC',
    x: 480,
    y: 530,
    status: 'NORMAL',
    isKeyDevice: true
  });

  actualPcs.forEach(pcs => {
    edges.push({
      id: `edge-pcs-dcbus-${pcs.id}`,
      fromNodeId: `node-dev-${pcs.id}`,
      toNodeId: dcBusId,
      edgeType: 'DC_POWER',
      flowDirection: 'BIDIRECTIONAL',
      ratedVoltage: '1500V DC',
      label: 'DC汇流'
    });
  });

  // 6. BMS 电池簇堆
  const actualBms = bmsDevices.length > 0 ? bmsDevices : [
    {
      id: `mock-bms-1`,
      deviceCode: 'BMS-RACK-01',
      deviceName: '磷酸铁锂高压电池簇 #1 (280Ah)',
      deviceType: 'BMS_CLUSTER' as const,
      model: 'CATL-LFP-280Ah',
      status: 'NORMAL' as const,
      isKeyDevice: true,
      installedDate: '2024-05-15',
      ratedPowerKw: 625
    },
    {
      id: `mock-bms-2`,
      deviceCode: 'BMS-RACK-02',
      deviceName: '磷酸铁锂高压电池簇 #2 (280Ah)',
      deviceType: 'BMS_CLUSTER' as const,
      model: 'CATL-LFP-280Ah',
      status: 'NORMAL' as const,
      isKeyDevice: true,
      installedDate: '2024-05-15',
      ratedPowerKw: 625
    }
  ];

  const bmsSpacing = 280;
  const bmsStartX = Math.max(160, 480 - ((actualBms.length - 1) * bmsSpacing) / 2);

  actualBms.forEach((bms, idx) => {
    const bmsNodeId = `node-dev-${bms.id}`;
    nodes.push({
      id: bmsNodeId,
      deviceId: bms.id,
      name: bms.deviceName,
      code: bms.deviceCode,
      type: 'BATTERY',
      model: bms.model,
      voltageLevel: '1500V DC',
      ratedPowerKw: bms.ratedPowerKw || 625,
      x: bmsStartX + idx * bmsSpacing,
      y: 660,
      status: bms.status,
      isKeyDevice: true
    });

    edges.push({
      id: `edge-dcbus-bms-${bms.id}`,
      fromNodeId: dcBusId,
      toNodeId: bmsNodeId,
      edgeType: 'DC_POWER',
      flowDirection: 'BIDIRECTIONAL',
      ratedVoltage: '1500V DC',
      label: '电池回路'
    });
  });

  // 7. EMS 主控中枢 (Side position)
  const emsNodeId = emsDevice ? `node-dev-${emsDevice.id}` : `node-ems-${site.id}`;
  nodes.push({
    id: emsNodeId,
    deviceId: emsDevice?.id,
    name: emsDevice?.deviceName || 'EMS 站控能量管理系统',
    code: emsDevice?.deviceCode || 'EMS-STATION-01',
    type: 'EMS',
    model: emsDevice?.model || 'EN-EMS-5000',
    voltageLevel: '220V 控制电源',
    x: 80,
    y: 350,
    status: emsDevice?.status || 'NORMAL',
    isKeyDevice: true
  });

  // EMS 控制通讯线
  edges.push({
    id: `edge-ems-acbus`,
    fromNodeId: emsNodeId,
    toNodeId: acBusId,
    edgeType: 'COMMUNICATION',
    label: 'IEC 61850'
  });
  if (actualPcs[0]) {
    edges.push({
      id: `edge-ems-pcs0`,
      fromNodeId: emsNodeId,
      toNodeId: `node-dev-${actualPcs[0].id}`,
      edgeType: 'COMMUNICATION',
      label: 'Modbus TCP'
    });
  }

  return {
    siteId: site.id,
    nodes,
    edges,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    layoutVersion: 'v1.0'
  };
}

/**
 * 自动层次排版算法
 */
export function autoLayoutTopology(nodes: TopologyNode[]): TopologyNode[] {
  // 分组
  const grids = nodes.filter(n => n.type === 'GRID');
  const transformers = nodes.filter(n => n.type === 'TRANSFORMER');
  const acBuses = nodes.filter(n => n.type === 'AC_BUS');
  const pcsNodes = nodes.filter(n => n.type === 'PCS' || n.type === 'PV_STRING');
  const dcBuses = nodes.filter(n => n.type === 'DC_BUS');
  const batteryNodes = nodes.filter(n => n.type === 'BATTERY');
  const emsNodes = nodes.filter(n => n.type === 'EMS');
  const otherNodes = nodes.filter(n => n.type === 'LOAD');

  const centerX = 500;
  const updatedNodes = [...nodes];

  // 1. Grid
  grids.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = centerX + (idx - (grids.length - 1) / 2) * 260;
      node.y = 40;
    }
  });

  // 2. Transformers
  transformers.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = centerX + (idx - (transformers.length - 1) / 2) * 260;
      node.y = 160;
    }
  });

  // 3. AC Buses
  acBuses.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = centerX + (idx - (acBuses.length - 1) / 2) * 280;
      node.y = 280;
    }
  });

  // 4. PCS
  pcsNodes.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = Math.max(160, centerX + (idx - (pcsNodes.length - 1) / 2) * 280);
      node.y = 400;
    }
  });

  // 5. DC Buses
  dcBuses.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = centerX + (idx - (dcBuses.length - 1) / 2) * 280;
      node.y = 530;
    }
  });

  // 6. Batteries
  batteryNodes.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = Math.max(160, centerX + (idx - (batteryNodes.length - 1) / 2) * 280);
      node.y = 660;
    }
  });

  // 7. EMS
  emsNodes.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = 80;
      node.y = 350 + idx * 100;
    }
  });

  // 8. Other Loads
  otherNodes.forEach((n, idx) => {
    const node = updatedNodes.find(item => item.id === n.id);
    if (node) {
      node.x = 860;
      node.y = 280 + idx * 120;
    }
  });

  return updatedNodes;
}

export interface NodeTelemetrySnapshot {
  activePowerKw: number;
  reactivePowerKvar: number;
  voltageV: number;
  currentA: number;
  frequencyHz: number;
  powerFactor: number;
  loadRatePct: number;
  temperatureC: number;
  ambientTempC: number;
  coolingStatus: string;
  operatingMode: string;
  breakerStatus: 'CLOSED' | 'OPEN';
  insulationKohm: number;
  commQuality: 'EXCELLENT' | 'GOOD' | 'WARNING';
  socPct?: number;
  sohPct?: number;
  maxCellTempC?: number;
  maxCellVoltMv?: number;
  minCellVoltMv?: number;
  cellDeltaMv?: number;
  cycleCount?: number;
  topOilTempC?: number;
  windingTempC?: number;
  efficiencyPct?: number;
  cpuUsagePct?: number;
  memoryUsagePct?: number;
  networkLatencyMs?: number;
  dispatchAccuracyPct?: number;
}

/**
 * 获取或模拟生成节点当前现场遥测工况数据
 */
export function getNodeTelemetrySnapshot(node: TopologyNode, site: Site): NodeTelemetrySnapshot {
  const isNormal = node.status === 'NORMAL';
  const isWarning = node.status === 'WARNING';
  const isFault = node.status === 'FAULT';

  const basePower = node.ratedPowerKw || (site.capacityMw ? (site.capacityMw * 1000) / 2 : 1250);

  if (node.type === 'PCS') {
    return {
      activePowerKw: isFault ? 0 : Number((basePower * (isWarning ? 0.45 : 0.88)).toFixed(1)),
      reactivePowerKvar: isFault ? 0 : Number((basePower * 0.08).toFixed(1)),
      voltageV: 692.4,
      currentA: isFault ? 0 : Number(((basePower * 0.88 * 1000) / (Math.sqrt(3) * 690)).toFixed(1)),
      frequencyHz: 50.01,
      powerFactor: 0.994,
      loadRatePct: isFault ? 0 : isWarning ? 45.0 : 88.0,
      temperatureC: isWarning ? 78.4 : isFault ? 92.5 : 43.6,
      ambientTempC: 28.2,
      coolingStatus: isFault ? '风机过载告警' : isWarning ? '双风机全速运转' : '液冷恒温循环正常',
      operatingMode: isFault ? '故障联锁停机' : 'P-Q 恒功率调度模式',
      breakerStatus: isFault ? 'OPEN' : 'CLOSED',
      insulationKohm: isFault ? 180 : 1420,
      commQuality: isFault ? 'WARNING' : 'EXCELLENT',
      efficiencyPct: 98.92
    };
  }

  if (node.type === 'BATTERY') {
    return {
      activePowerKw: isFault ? 0 : Number((basePower * 0.85).toFixed(1)),
      reactivePowerKvar: 0,
      voltageV: 1488.6,
      currentA: isFault ? 0 : Number(((basePower * 0.85 * 1000) / 1488).toFixed(1)),
      frequencyHz: 50.0,
      powerFactor: 1.0,
      loadRatePct: isFault ? 0 : 85.0,
      temperatureC: isWarning ? 38.2 : 31.5,
      ambientTempC: 24.5,
      coolingStatus: '高压箱智能液冷回路正常',
      operatingMode: '恒流放电工况 (0.5C)',
      breakerStatus: isFault ? 'OPEN' : 'CLOSED',
      insulationKohm: 1350,
      commQuality: 'EXCELLENT',
      socPct: 68.4,
      sohPct: 98.6,
      maxCellTempC: 32.1,
      maxCellVoltMv: 3285,
      minCellVoltMv: 3272,
      cellDeltaMv: 13,
      cycleCount: 428
    };
  }

  if (node.type === 'TRANSFORMER') {
    return {
      activePowerKw: Number((basePower * 0.82).toFixed(1)),
      reactivePowerKvar: Number((basePower * 0.12).toFixed(1)),
      voltageV: 35120,
      currentA: Number(((basePower * 0.82 * 1000) / (Math.sqrt(3) * 35000)).toFixed(1)),
      frequencyHz: 50.02,
      powerFactor: 0.985,
      loadRatePct: 82.4,
      temperatureC: 56.4,
      ambientTempC: 30.1,
      coolingStatus: '强迫油循环风冷 (ONAN/ONAF)',
      operatingMode: '主网双向并网变换',
      breakerStatus: 'CLOSED',
      insulationKohm: 2800,
      commQuality: 'EXCELLENT',
      topOilTempC: 52.8,
      windingTempC: 61.2,
      efficiencyPct: 99.15
    };
  }

  if (node.type === 'GRID') {
    return {
      activePowerKw: site.capacityMw ? site.capacityMw * 860 : 4300,
      reactivePowerKvar: 320,
      voltageV: 35240,
      currentA: 72.8,
      frequencyHz: 50.02,
      powerFactor: 0.996,
      loadRatePct: 86.0,
      temperatureC: 32.0,
      ambientTempC: 29.5,
      coolingStatus: '户外GIS六氟化硫封闭开关',
      operatingMode: 'PCC 并网运行 (AGC/AVC投运)',
      breakerStatus: 'CLOSED',
      insulationKohm: 5000,
      commQuality: 'EXCELLENT'
    };
  }

  if (node.type === 'EMS') {
    return {
      activePowerKw: 1.8,
      reactivePowerKvar: 0.2,
      voltageV: 220.5,
      currentA: 8.2,
      frequencyHz: 50.0,
      powerFactor: 0.98,
      loadRatePct: 24.5,
      temperatureC: 38.0,
      ambientTempC: 22.0,
      coolingStatus: '机房双路精密空调恒温',
      operatingMode: '实时调度闭环 (1s级下发)',
      breakerStatus: 'CLOSED',
      insulationKohm: 3500,
      commQuality: 'EXCELLENT',
      cpuUsagePct: 23.4,
      memoryUsagePct: 41.8,
      networkLatencyMs: 3.6,
      dispatchAccuracyPct: 99.82
    };
  }

  // Default Bus / PV / Load
  return {
    activePowerKw: basePower ? Number((basePower * 0.75).toFixed(1)) : 1000,
    reactivePowerKvar: 80,
    voltageV: node.voltageLevel?.includes('690') ? 692.0 : node.voltageLevel?.includes('1500') ? 1485.0 : 35000,
    currentA: 450,
    frequencyHz: 50.01,
    powerFactor: 0.99,
    loadRatePct: 75.0,
    temperatureC: 36.5,
    ambientTempC: 28.0,
    coolingStatus: '母线自然对流散热',
    operatingMode: '带电运行通电中',
    breakerStatus: 'CLOSED',
    insulationKohm: 1800,
    commQuality: 'EXCELLENT'
  };
}

