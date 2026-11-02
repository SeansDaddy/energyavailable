import { Site } from '../types';

export interface ArchivedContractMonthlyRecord {
  month: string;
  label: string;
  availability: number;
  slaThreshold: number;
  interruptionMins: number;
  maintenanceHours: number;
  eventsCount: number;
  isBreached: boolean;
  status: '达标' | '未达标';
  settlementStatus: string;
}

export interface ArchivedCoreDeviceRecord {
  deviceCode: string;
  deviceName: string;
  deviceType: string;
  model: string;
  annualOperatingHours: number;
  availabilityRate: number;
  annualInterruptionMins: number;
  annualFaultCount: number;
  annualHealthScore: number;
  evaluationGrade: '优良 (A+)' | '良好 (A)' | '关注 (B)' | '告警 (C)';
}

export interface ArchivedMajorEventRecord {
  eventId: string;
  eventCode: string;
  title: string;
  triggerTime: string;
  clearTime: string;
  durationMins: number;
  equivalentInterruptionMins: number;
  rootCause: string;
  workOrderNo: string;
  closureStatus: string;
}

export interface ArchivedContractYearInfo {
  year: number;
  contractNo: string;
  contractTitle: string;
  customer: string;
  validFrom: string; // 当年合同起始时间，如 "2025-01-01"
  validTo: string;   // 当年合同结束时间，如 "2025-12-31"
  totalDays: number;
  slaThreshold: number;
  finalAvailability: number;
  gap: number;
  isBreached: boolean;
  statusLabel: '达标归档' | '考核扣减结清' | '超额履约表彰';
  totalInterruptionMins: number;
  totalInterruptionHours: number;
  plannedMaintenanceHours: number;
  totalEventsCount: number;
  penaltyOrBonusAmount: number; // 正数为奖励，负数为扣罚违约金
  settlementStatus: string;
  archiveDate: string;
  archiveAuditor: string;
  archiveCertificateNo: string;
  monthlyRecords: ArchivedContractMonthlyRecord[];
  coreDeviceRecords: ArchivedCoreDeviceRecord[];
  majorEvents: ArchivedMajorEventRecord[];
}

export const getArchivedContractsForSite = (site: Site): ArchivedContractYearInfo[] => {
  const baseContractPrefix = site.contractNo ? site.contractNo.split('-').slice(0, 3).join('-') : 'CSG-SZ-SLA';
  const threshold = site.slaThreshold || 99.50;

  // 1. 2025 年度归档合同
  const monthly2025: ArchivedContractMonthlyRecord[] = [
    { month: '2025-01', label: '1月', availability: 99.85, slaThreshold: threshold, interruptionMins: 25, maintenanceHours: 1.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-02', label: '2月', availability: 99.92, slaThreshold: threshold, interruptionMins: 12, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-03', label: '3月', availability: 99.78, slaThreshold: threshold, interruptionMins: 42, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-04', label: '4月', availability: 99.80, slaThreshold: threshold, interruptionMins: 38, maintenanceHours: 1.5, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-05', label: '5月', availability: 99.90, slaThreshold: threshold, interruptionMins: 18, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-06', label: '6月', availability: 99.72, slaThreshold: threshold, interruptionMins: 55, maintenanceHours: 1.0, eventsCount: 3, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-07', label: '7月', availability: 99.68, slaThreshold: threshold, interruptionMins: 62, maintenanceHours: 1.5, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-08', label: '8月', availability: 99.76, slaThreshold: threshold, interruptionMins: 45, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-09', label: '9月', availability: 99.88, slaThreshold: threshold, interruptionMins: 22, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-10', label: '10月', availability: 99.94, slaThreshold: threshold, interruptionMins: 10, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-11', label: '11月', availability: 99.82, slaThreshold: threshold, interruptionMins: 31, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2025-12', label: '12月', availability: 99.80, slaThreshold: threshold, interruptionMins: 36, maintenanceHours: 0.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' }
  ];

  const devices2025: ArchivedCoreDeviceRecord[] = [
    { deviceCode: 'PCS-INV-01A', deviceName: '1.25MW 储能变流器 A组 (主)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8740, availabilityRate: 99.92, annualInterruptionMins: 52, annualFaultCount: 3, annualHealthScore: 96, evaluationGrade: '优良 (A+)' },
    { deviceCode: 'PCS-INV-01B', deviceName: '1.25MW 储能变流器 B组 (备)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8680, availabilityRate: 99.78, annualInterruptionMins: 124, annualFaultCount: 5, annualHealthScore: 92, evaluationGrade: '良好 (A)' },
    { deviceCode: 'EMS-CTRL-01', deviceName: 'EMS 能量管理主控单元', deviceType: 'EMS_HOST', model: 'EN-EMS-5000', annualOperatingHours: 8758, availabilityRate: 99.98, annualInterruptionMins: 12, annualFaultCount: 1, annualHealthScore: 99, evaluationGrade: '优良 (A+)' },
    { deviceCode: 'BMS-RACK-01', deviceName: '磷酸铁锂高压电池簇 01号', deviceType: 'BMS_CLUSTER', model: 'CATL-LFP-280Ah', annualOperatingHours: 8710, availabilityRate: 99.84, annualInterruptionMins: 92, annualFaultCount: 4, annualHealthScore: 94, evaluationGrade: '良好 (A)' }
  ];

  const events2025: ArchivedMajorEventRecord[] = [
    { eventId: 'ev-2025-01', eventCode: 'FLT-20250614-01', title: '集装箱工业空调制冷液压微泄引发PCS轻度降额保护', triggerTime: '2025-06-14 11:20:00', clearTime: '2025-06-14 12:15:00', durationMins: 55, equivalentInterruptionMins: 55, rootCause: '辅机冷媒气密性轻微泄漏，现场补液后恢复', workOrderNo: 'WO-20250614-3312', closureStatus: '现场闭环验证通过' },
    { eventId: 'ev-2025-02', eventCode: 'FLT-20250720-02', title: '雷暴强对流天气导致并网防孤岛联锁短时跳闸', triggerTime: '2025-07-20 16:05:00', clearTime: '2025-07-20 17:07:00', durationMins: 62, equivalentInterruptionMins: 62, rootCause: '电网瞬态电压暂降跌破保护限值，重合闸自恢复', workOrderNo: 'WO-20250720-4491', closureStatus: '电网调度免责审核并归档' }
  ];

  // 2. 2024 年度归档合同
  const monthly2024: ArchivedContractMonthlyRecord[] = [
    { month: '2024-01', label: '1月', availability: 99.65, slaThreshold: threshold, interruptionMins: 72, maintenanceHours: 1.0, eventsCount: 3, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-02', label: '2月', availability: 99.70, slaThreshold: threshold, interruptionMins: 60, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-03', label: '3月', availability: 99.55, slaThreshold: threshold, interruptionMins: 92, maintenanceHours: 1.5, eventsCount: 3, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-04', label: '4月', availability: 99.62, slaThreshold: threshold, interruptionMins: 78, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-05', label: '5月', availability: 99.58, slaThreshold: threshold, interruptionMins: 85, maintenanceHours: 1.5, eventsCount: 3, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-06', label: '6月', availability: 99.30, slaThreshold: threshold, interruptionMins: 145, maintenanceHours: 2.0, eventsCount: 4, isBreached: true, status: '未达标', settlementStatus: '扣罚核算结清' },
    { month: '2024-07', label: '7月', availability: 99.18, slaThreshold: threshold, interruptionMins: 172, maintenanceHours: 2.5, eventsCount: 5, isBreached: true, status: '未达标', settlementStatus: '扣罚核算结清' },
    { month: '2024-08', label: '8月', availability: 99.25, slaThreshold: threshold, interruptionMins: 156, maintenanceHours: 2.0, eventsCount: 4, isBreached: true, status: '未达标', settlementStatus: '扣罚核算结清' },
    { month: '2024-09', label: '9月', availability: 99.60, slaThreshold: threshold, interruptionMins: 82, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-10', label: '10月', availability: 99.72, slaThreshold: threshold, interruptionMins: 58, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-11', label: '11月', availability: 99.75, slaThreshold: threshold, interruptionMins: 52, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2024-12', label: '12月', availability: 99.68, slaThreshold: threshold, interruptionMins: 68, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' }
  ];

  const devices2024: ArchivedCoreDeviceRecord[] = [
    { deviceCode: 'PCS-INV-01A', deviceName: '1.25MW 储能变流器 A组 (主)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8610, availabilityRate: 99.55, annualInterruptionMins: 290, annualFaultCount: 8, annualHealthScore: 88, evaluationGrade: '良好 (A)' },
    { deviceCode: 'PCS-INV-01B', deviceName: '1.25MW 储能变流器 B组 (备)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8550, availabilityRate: 99.32, annualInterruptionMins: 380, annualFaultCount: 11, annualHealthScore: 84, evaluationGrade: '关注 (B)' },
    { deviceCode: 'EMS-CTRL-01', deviceName: 'EMS 能量管理主控单元', deviceType: 'EMS_HOST', model: 'EN-EMS-5000', annualOperatingHours: 8730, availabilityRate: 99.90, annualInterruptionMins: 45, annualFaultCount: 2, annualHealthScore: 95, evaluationGrade: '优良 (A+)' },
    { deviceCode: 'BMS-RACK-01', deviceName: '磷酸铁锂高压电池簇 01号', deviceType: 'BMS_CLUSTER', model: 'CATL-LFP-280Ah', annualOperatingHours: 8640, availabilityRate: 99.48, annualInterruptionMins: 220, annualFaultCount: 7, annualHealthScore: 89, evaluationGrade: '良好 (A)' }
  ];

  const events2024: ArchivedMajorEventRecord[] = [
    { eventId: 'ev-2024-01', eventCode: 'FLT-20240711-01', title: '迎峰度夏高温负荷下变流器散热风机轴承过载卡阻跳机', triggerTime: '2024-07-11 14:10:00', clearTime: '2024-07-11 17:02:00', durationMins: 172, equivalentInterruptionMins: 172, rootCause: '散热风道积尘与轴承缺润滑导致停机，更换新风机模块后复归', workOrderNo: 'WO-20240711-8812', closureStatus: '完成备件升级与全检' },
    { eventId: 'ev-2024-02', eventCode: 'FLT-20240819-03', title: 'BMS高压箱母线铜排紧固力矩衰减接触发热降额', triggerTime: '2024-08-19 10:30:00', clearTime: '2024-08-19 13:06:00', durationMins: 156, equivalentInterruptionMins: 156, rootCause: '热胀冷缩导致母排力矩微幅松动，全量停电紧固校准', workOrderNo: 'WO-20240819-9104', closureStatus: '红外测温复查正常' }
  ];

  // 3. 2023 年度归档合同
  const monthly2023: ArchivedContractMonthlyRecord[] = [
    { month: '2023-01', label: '1月', availability: 99.80, slaThreshold: threshold, interruptionMins: 38, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-02', label: '2月', availability: 99.82, slaThreshold: threshold, interruptionMins: 32, maintenanceHours: 1.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-03', label: '3月', availability: 99.75, slaThreshold: threshold, interruptionMins: 48, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-04', label: '4月', availability: 99.85, slaThreshold: threshold, interruptionMins: 26, maintenanceHours: 1.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-05', label: '5月', availability: 99.70, slaThreshold: threshold, interruptionMins: 55, maintenanceHours: 1.0, eventsCount: 3, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-06', label: '6月', availability: 99.65, slaThreshold: threshold, interruptionMins: 65, maintenanceHours: 1.5, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-07', label: '7月', availability: 99.72, slaThreshold: threshold, interruptionMins: 52, maintenanceHours: 1.5, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-08', label: '8月', availability: 99.78, slaThreshold: threshold, interruptionMins: 40, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-09', label: '9月', availability: 99.84, slaThreshold: threshold, interruptionMins: 28, maintenanceHours: 1.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-10', label: '10月', availability: 99.90, slaThreshold: threshold, interruptionMins: 18, maintenanceHours: 1.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-11', label: '11月', availability: 99.82, slaThreshold: threshold, interruptionMins: 34, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2023-12', label: '12月', availability: 99.86, slaThreshold: threshold, interruptionMins: 25, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' }
  ];

  const devices2023: ArchivedCoreDeviceRecord[] = [
    { deviceCode: 'PCS-INV-01A', deviceName: '1.25MW 储能变流器 A组 (主)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8715, availabilityRate: 99.88, annualInterruptionMins: 110, annualFaultCount: 4, annualHealthScore: 95, evaluationGrade: '优良 (A+)' },
    { deviceCode: 'PCS-INV-01B', deviceName: '1.25MW 储能变流器 B组 (备)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8670, availabilityRate: 99.72, annualInterruptionMins: 180, annualFaultCount: 7, annualHealthScore: 91, evaluationGrade: '良好 (A)' },
    { deviceCode: 'EMS-CTRL-01', deviceName: 'EMS 能量管理主控单元', deviceType: 'EMS_HOST', model: 'EN-EMS-5000', annualOperatingHours: 8752, availabilityRate: 99.96, annualInterruptionMins: 20, annualFaultCount: 1, annualHealthScore: 98, evaluationGrade: '优良 (A+)' },
    { deviceCode: 'BMS-RACK-01', deviceName: '磷酸铁锂高压电池簇 01号', deviceType: 'BMS_CLUSTER', model: 'CATL-LFP-280Ah', annualOperatingHours: 8690, availabilityRate: 99.78, annualInterruptionMins: 140, annualFaultCount: 5, annualHealthScore: 93, evaluationGrade: '良好 (A)' }
  ];

  const events2023: ArchivedMajorEventRecord[] = [
    { eventId: 'ev-2023-01', eventCode: 'FLT-20230628-02', title: '主变压器油温传感器漂移引发预警联锁', triggerTime: '2023-06-28 09:15:00', clearTime: '2023-06-28 10:20:00', durationMins: 65, equivalentInterruptionMins: 65, rootCause: 'PT100感温探头阻值微弱漂移，更换并标定校验合格', workOrderNo: 'WO-20230628-1120', closureStatus: '归档结清' }
  ];

  // 4. 2022 年度归档合同
  const monthly2022: ArchivedContractMonthlyRecord[] = [
    { month: '2022-01', label: '1月', availability: 99.90, slaThreshold: threshold, interruptionMins: 18, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-02', label: '2月', availability: 99.95, slaThreshold: threshold, interruptionMins: 10, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-03', label: '3月', availability: 99.88, slaThreshold: threshold, interruptionMins: 22, maintenanceHours: 1.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-04', label: '4月', availability: 99.92, slaThreshold: threshold, interruptionMins: 15, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-05', label: '5月', availability: 99.84, slaThreshold: threshold, interruptionMins: 30, maintenanceHours: 1.0, eventsCount: 2, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-06', label: '6月', availability: 99.80, slaThreshold: threshold, interruptionMins: 36, maintenanceHours: 1.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-07', label: '7月', availability: 99.82, slaThreshold: threshold, interruptionMins: 32, maintenanceHours: 1.0, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-08', label: '8月', availability: 99.88, slaThreshold: threshold, interruptionMins: 22, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-09', label: '9月', availability: 99.94, slaThreshold: threshold, interruptionMins: 11, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-10', label: '10月', availability: 99.92, slaThreshold: threshold, interruptionMins: 14, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-11', label: '11月', availability: 99.86, slaThreshold: threshold, interruptionMins: 25, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' },
    { month: '2022-12', label: '12月', availability: 99.82, slaThreshold: threshold, interruptionMins: 31, maintenanceHours: 0.5, eventsCount: 1, isBreached: false, status: '达标', settlementStatus: '已终审结清' }
  ];

  const devices2022: ArchivedCoreDeviceRecord[] = [
    { deviceCode: 'PCS-INV-01A', deviceName: '1.25MW 储能变流器 A组 (主)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8735, availabilityRate: 99.95, annualInterruptionMins: 45, annualFaultCount: 2, annualHealthScore: 98, evaluationGrade: '优良 (A+)' },
    { deviceCode: 'PCS-INV-01B', deviceName: '1.25MW 储能变流器 B组 (备)', deviceType: 'PCS_INVERTER', model: 'EN-PCS-1250-PRO', annualOperatingHours: 8710, availabilityRate: 99.85, annualInterruptionMins: 95, annualFaultCount: 4, annualHealthScore: 94, evaluationGrade: '良好 (A)' },
    { deviceCode: 'EMS-CTRL-01', deviceName: 'EMS 能量管理主控单元', deviceType: 'EMS_HOST', model: 'EN-EMS-5000', annualOperatingHours: 8758, availabilityRate: 99.99, annualInterruptionMins: 8, annualFaultCount: 1, annualHealthScore: 99, evaluationGrade: '优良 (A+)' },
    { deviceCode: 'BMS-RACK-01', deviceName: '磷酸铁锂高压电池簇 01号', deviceType: 'BMS_CLUSTER', model: 'CATL-LFP-280Ah', annualOperatingHours: 8720, availabilityRate: 99.90, annualInterruptionMins: 75, annualFaultCount: 3, annualHealthScore: 96, evaluationGrade: '优良 (A+)' }
  ];

  const events2022: ArchivedMajorEventRecord[] = [
    { eventId: 'ev-2022-01', eventCode: 'FLT-20220612-01', title: '新建站点并网首月通讯光端机浪涌保护触发自愈', triggerTime: '2022-06-12 08:30:00', clearTime: '2022-06-12 09:06:00', durationMins: 36, equivalentInterruptionMins: 36, rootCause: '电站新投运初期线路微扰，自愈保护动作正常', workOrderNo: 'WO-20220612-0081', closureStatus: '归档结清' }
  ];

  return [
    {
      year: 2025,
      contractNo: `${baseContractPrefix}-2025-Y1`,
      contractTitle: `${site.customer} ${site.siteName} 可用度保障合同 (2025年度)`,
      customer: site.customer,
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      totalDays: 365,
      slaThreshold: threshold,
      finalAvailability: 99.82,
      gap: Number((99.82 - threshold).toFixed(2)),
      isBreached: 99.82 < threshold,
      statusLabel: '达标归档',
      totalInterruptionMins: 360,
      totalInterruptionHours: 6.0,
      plannedMaintenanceHours: 10.0,
      totalEventsCount: 18,
      penaltyOrBonusAmount: 0,
      settlementStatus: '年度终审结清 · 质量保证金已全额解冻',
      archiveDate: '2026-01-15',
      archiveAuditor: '运维SLA交付总监·陈浩 / 客户资产专工·李维',
      archiveCertificateNo: `SLA-ARC-2025-${site.siteCode}`,
      monthlyRecords: monthly2025,
      coreDeviceRecords: devices2025,
      majorEvents: events2025
    },
    {
      year: 2024,
      contractNo: `${baseContractPrefix}-2024-Y2`,
      contractTitle: `${site.customer} ${site.siteName} 可用度保障合同 (2024年度)`,
      customer: site.customer,
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      totalDays: 366,
      slaThreshold: threshold,
      finalAvailability: 99.42,
      gap: Number((99.42 - threshold).toFixed(2)),
      isBreached: 99.42 < threshold,
      statusLabel: '考核扣减结清',
      totalInterruptionMins: 890,
      totalInterruptionHours: 14.8,
      plannedMaintenanceHours: 16.0,
      totalEventsCount: 31,
      penaltyOrBonusAmount: -24000,
      settlementStatus: 'SLA跌破违约金已按约扣减结清 (扣款 24,000 元)',
      archiveDate: '2025-01-18',
      archiveAuditor: '运维SLA交付总监·陈浩 / 客户资产专工·李维',
      archiveCertificateNo: `SLA-ARC-2024-${site.siteCode}`,
      monthlyRecords: monthly2024,
      coreDeviceRecords: devices2024,
      majorEvents: events2024
    },
    {
      year: 2023,
      contractNo: `${baseContractPrefix}-2023-Y3`,
      contractTitle: `${site.customer} ${site.siteName} 可用度保障合同 (2023年度)`,
      customer: site.customer,
      validFrom: '2023-01-01',
      validTo: '2023-12-31',
      totalDays: 365,
      slaThreshold: threshold,
      finalAvailability: 99.76,
      gap: Number((99.76 - threshold).toFixed(2)),
      isBreached: 99.76 < threshold,
      statusLabel: '达标归档',
      totalInterruptionMins: 490,
      totalInterruptionHours: 8.2,
      plannedMaintenanceHours: 14.0,
      totalEventsCount: 22,
      penaltyOrBonusAmount: 0,
      settlementStatus: '年度终审结清 · 履约合格',
      archiveDate: '2024-01-20',
      archiveAuditor: '运维SLA交付总监·陈浩 / 客户资产专工·李维',
      archiveCertificateNo: `SLA-ARC-2023-${site.siteCode}`,
      monthlyRecords: monthly2023,
      coreDeviceRecords: devices2023,
      majorEvents: events2023
    },
    {
      year: 2022,
      contractNo: `${baseContractPrefix}-2022-Y4`,
      contractTitle: `${site.customer} ${site.siteName} 投运首年可用度保障合同 (2022年度)`,
      customer: site.customer,
      validFrom: '2022-01-01',
      validTo: '2022-12-31',
      totalDays: 365,
      slaThreshold: threshold,
      finalAvailability: 99.88,
      gap: Number((99.88 - threshold).toFixed(2)),
      isBreached: 99.88 < threshold,
      statusLabel: '超额履约表彰',
      totalInterruptionMins: 280,
      totalInterruptionHours: 4.7,
      plannedMaintenanceHours: 8.0,
      totalEventsCount: 12,
      penaltyOrBonusAmount: 50000,
      settlementStatus: '优异履约表彰 · 获得卓越运维服务激励奖金 50,000 元',
      archiveDate: '2023-01-16',
      archiveAuditor: '运维SLA交付总监·陈浩 / 客户资产专工·李维',
      archiveCertificateNo: `SLA-ARC-2022-${site.siteCode}`,
      monthlyRecords: monthly2022,
      coreDeviceRecords: devices2022,
      majorEvents: events2022
    }
  ];
};
