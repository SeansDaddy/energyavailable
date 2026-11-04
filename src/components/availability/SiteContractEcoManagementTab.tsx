import React, { useState, useMemo } from 'react';
import { Site, WorkOrder } from '../../types';
import { AvailabilityAlarmItem } from '../../utils/equipmentAndAlarmsGenerator';
import {
  ShieldCheck,
  ZapOff,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Plus,
  Edit3,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  ChevronRight,
  Printer,
  X,
  ExternalLink,
  Info,
  Check,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Building,
  UserCheck
} from 'lucide-react';

interface SiteContractEcoManagementTabProps {
  site: Site;
  contractStart: string;
  contractEnd: string;
  workOrders: WorkOrder[];
  onNavigateTab: (tabIdx: number, extra?: any) => void;
}

// Category options for ECO exemption
export const ECO_CATEGORIES = [
  { id: 'ALL', label: '全部外因类别' },
  { id: 'GRID_DISPATCH', label: '电网调度限电/调峰' },
  { id: 'FORCE_MAJEURE', label: '不可抗力极端天气' },
  { id: 'PLANNED_GRID_MAINTENANCE', label: '电网计划停电检修' },
  { id: 'CUSTOMER_SHUTDOWN', label: '业主客户侧停产检修' },
  { id: 'THIRD_PARTY_DAMAGE', label: '第三方施工外力破坏' },
  { id: 'OTHER', label: '其他合同约定免责' }
];

export const SiteContractEcoManagementTab: React.FC<SiteContractEcoManagementTabProps> = ({
  site,
  contractStart,
  contractEnd,
  workOrders,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alarms' | 'workOrders' | 'monthly'>('alarms');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formal Report Preview Modal State
  const [showReportModal, setShowReportModal] = useState(false);

  // Edit / Add Modal States
  const [editingAlarmEco, setEditingAlarmEco] = useState<AvailabilityAlarmItem | null>(null);
  const [editingWoEco, setEditingWoEco] = useState<WorkOrder | null>(null);
  const [showAddAlarmEcoModal, setShowAddAlarmEcoModal] = useState(false);
  const [showAddWoEcoModal, setShowAddWoEcoModal] = useState(false);

  // Initial ECO Alarms for the site in this contract period
  const [alarmEcoList, setAlarmEcoList] = useState<AvailabilityAlarmItem[]>([
    {
      id: 'eco-alm-001',
      code: 'ALM-PCS-3042',
      title: 'PCS 变流器外部电网指令受控下压停运告警',
      severity: 'MAJOR',
      deviceCode: 'PCS-INV-01A',
      deviceName: '1.25MW 储能变流器 A组 (主)',
      deviceType: 'PCS_INVERTER',
      triggerTime: '2026-08-15 09:18:20',
      clearTime: '2026-08-15 13:48:20',
      durationMinutes: 270,
      equivalentInterruptionMinutes: 0,
      availabilityImpactPercent: 0.19,
      isExempt: true,
      isEcoExempt: true,
      ecoExemptReason: '调度中心下发 008 号调令强制下压负荷解列待机，属电网外因免责',
      ecoExemptOperator: '张维保 (经供电局调度中心核准)',
      ecoExemptTime: '2026-08-15 14:00',
      ecoStartTime: '2026-08-15 09:18:00',
      ecoEndTime: '2026-08-15 13:48:00',
      ecoDurationMinutes: 270,
      isCustomEcoTime: false,
      slaCounted: false,
      status: 'RESOLVED',
      rootCause: '迎峰度夏负荷消峰受限，上游母线过载告警联锁解列',
      solution: '调度令解除后即刻恢复满功率并网',
      workOrderNo: 'WO-20260815-9921'
    },
    {
      id: 'eco-alm-002',
      code: 'ALM-GRID-0089',
      title: '35kV 并网点电网频率异常超限保护停机',
      severity: 'CRITICAL',
      deviceCode: 'TR-MAIN-01',
      deviceName: '35kV 主升压变压器',
      deviceType: 'TRANSFORMER',
      triggerTime: '2026-08-11 14:10:00',
      clearTime: '2026-08-11 17:30:00',
      durationMinutes: 200,
      equivalentInterruptionMinutes: 0,
      availabilityImpactPercent: 0.14,
      isExempt: true,
      isEcoExempt: true,
      ecoExemptReason: '台风强暴雨致外部公用电网 110kV 变电站周波跌落低于 49.2Hz 触发防孤岛自保',
      ecoExemptOperator: '调度员李工',
      ecoExemptTime: '2026-08-11 18:00',
      ecoStartTime: '2026-08-11 14:00:00',
      ecoEndTime: '2026-08-11 17:30:00',
      ecoDurationMinutes: 210,
      isCustomEcoTime: true,
      slaCounted: false,
      status: 'RESOLVED',
      rootCause: '极端雷暴大风天气引发电网侧系统震荡',
      solution: '电网侧故障消除后自动重新合闸并网',
      workOrderNo: 'WO-20260811-1904'
    },
    {
      id: 'eco-alm-003',
      code: 'ALM-BMS-5512',
      title: 'BMS 电池系统上游计划性停电定检受电中断',
      severity: 'MAJOR',
      deviceCode: 'BMS-RACK-01',
      deviceName: '磷酸铁锂高压电池簇 01号',
      deviceType: 'BMS_CLUSTER',
      triggerTime: '2026-07-20 09:00:00',
      clearTime: '2026-07-20 16:00:00',
      durationMinutes: 420,
      equivalentInterruptionMinutes: 0,
      availabilityImpactPercent: 0.29,
      isExempt: true,
      isEcoExempt: true,
      ecoExemptReason: '供电局上游 110kV 变电站春季预防性停电定检，依合同免除SLA考核',
      ecoExemptOperator: '南方电网调度部-赵工',
      ecoExemptTime: '2026-07-20 16:30',
      ecoStartTime: '2026-07-20 09:00:00',
      ecoEndTime: '2026-07-20 16:00:00',
      ecoDurationMinutes: 420,
      isCustomEcoTime: false,
      slaCounted: false,
      status: 'RESOLVED',
      rootCause: '上游主变计划性检修，全站配合失电',
      solution: '检修完工送电后系统自动重启复归',
      workOrderNo: 'WO-20260720-3108'
    },
    {
      id: 'eco-alm-004',
      code: 'ALM-PCS-1102',
      title: 'PCS 变流器电网调度调频低谷限电停运',
      severity: 'MINOR',
      deviceCode: 'PCS-INV-01B',
      deviceName: '1.25MW 储能变流器 B组 (备)',
      deviceType: 'PCS_INVERTER',
      triggerTime: '2026-06-14 12:30:00',
      clearTime: '2026-06-14 16:00:00',
      durationMinutes: 210,
      equivalentInterruptionMinutes: 0,
      availabilityImpactPercent: 0.15,
      isExempt: true,
      isEcoExempt: true,
      ecoExemptReason: '调度AGC指令暂停变流器充放电，要求进入备用经济运行待机',
      ecoExemptOperator: '深圳供电调度-调度员07',
      ecoExemptTime: '2026-06-14 16:30',
      ecoStartTime: '2026-06-14 12:30:00',
      ecoEndTime: '2026-06-14 16:00:00',
      ecoDurationMinutes: 210,
      isCustomEcoTime: false,
      slaCounted: false,
      status: 'RESOLVED',
      rootCause: '区域新能源光伏大发反送，调度临时切出储能消纳',
      solution: '待用电高峰到来后恢复满充指令',
      workOrderNo: 'WO-20260614-1102'
    }
  ]);

  // Initial ECO Work Orders
  const [woEcoList, setWoEcoList] = useState<WorkOrder[]>(() => {
    return (workOrders || []).filter(w => w.isEcoExempt);
  });

  // Calculate summary metrics
  const totalAlarmEcoMinutes = useMemo(() => {
    return alarmEcoList.reduce((acc, a) => acc + (a.ecoDurationMinutes || a.durationMinutes || 0), 0);
  }, [alarmEcoList]);

  const totalWoEcoMinutes = useMemo(() => {
    return woEcoList.reduce((acc, w) => acc + (w.ecoExemptMins || 0), 0);
  }, [woEcoList]);

  const totalEcoMinutes = totalAlarmEcoMinutes + totalWoEcoMinutes;
  const totalEcoHours = (totalEcoMinutes / 60).toFixed(1);

  // Estimated recovered availability
  const recoveredAvailability = useMemo(() => {
    // 1 year calendar minutes = 365 * 1440 = 525,600
    // percentage gain = (totalEcoMinutes / 525600) * 100
    return Number(((totalEcoMinutes / 525600) * 100).toFixed(2));
  }, [totalEcoMinutes]);

  const auditedAvailability = Number((site.currentAvailability + recoveredAvailability).toFixed(2));

  // Filtered Alarm list
  const filteredAlarms = useMemo(() => {
    return alarmEcoList.filter(a => {
      if (categoryFilter !== 'ALL') {
        const reason = (a.ecoExemptReason || '').toLowerCase();
        if (categoryFilter === 'GRID_DISPATCH' && !reason.includes('调度') && !reason.includes('限电')) return false;
        if (categoryFilter === 'FORCE_MAJEURE' && !reason.includes('台风') && !reason.includes('暴雨') && !reason.includes('天气')) return false;
        if (categoryFilter === 'PLANNED_GRID_MAINTENANCE' && !reason.includes('检修') && !reason.includes('停电')) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          a.code.toLowerCase().includes(term) ||
          a.title.toLowerCase().includes(term) ||
          a.deviceName.toLowerCase().includes(term) ||
          (a.ecoExemptReason && a.ecoExemptReason.toLowerCase().includes(term)) ||
          (a.workOrderNo && a.workOrderNo.toLowerCase().includes(term)) ||
          (a.ecoExemptOperator && a.ecoExemptOperator.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [alarmEcoList, categoryFilter, searchTerm]);

  // Filtered Work Orders list
  const filteredWorkOrders = useMemo(() => {
    return woEcoList.filter(w => {
      if (categoryFilter !== 'ALL') {
        const cat = w.ecoExemptCategory || '';
        if (categoryFilter === 'GRID_DISPATCH' && !cat.includes('调度') && !cat.includes('限电')) return false;
        if (categoryFilter === 'FORCE_MAJEURE' && !cat.includes('不可抗力') && !cat.includes('天气')) return false;
        if (categoryFilter === 'PLANNED_GRID_MAINTENANCE' && !cat.includes('计划停电') && !cat.includes('检修')) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          w.orderNo.toLowerCase().includes(term) ||
          w.title.toLowerCase().includes(term) ||
          (w.ecoExemptReason && w.ecoExemptReason.toLowerCase().includes(term)) ||
          (w.assignee && w.assignee.toLowerCase().includes(term)) ||
          (w.ecoExemptDocNo && w.ecoExemptDocNo.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [woEcoList, categoryFilter, searchTerm]);

  // Monthly breakdown mock data for current contract year (2026-01 ~ 2026-12)
  const monthlyData = [
    { month: '2026-01', calMins: 44640, rawMins: 120, ecoMins: 0, rawAvail: 99.73, auditAvail: 99.73, status: 'PASSED' },
    { month: '2026-02', calMins: 40320, rawMins: 60, ecoMins: 0, rawAvail: 99.85, auditAvail: 99.85, status: 'PASSED' },
    { month: '2026-03', calMins: 44640, rawMins: 180, ecoMins: 60, rawAvail: 99.60, auditAvail: 99.73, status: 'PASSED' },
    { month: '2026-04', calMins: 43200, rawMins: 90, ecoMins: 0, rawAvail: 99.79, auditAvail: 99.79, status: 'PASSED' },
    { month: '2026-05', calMins: 44640, rawMins: 240, ecoMins: 120, rawAvail: 99.46, auditAvail: 99.73, status: 'PASSED' },
    { month: '2026-06', calMins: 43200, rawMins: 590, ecoMins: 480, rawAvail: 98.63, auditAvail: 99.75, status: 'PASSED' },
    { month: '2026-07', calMins: 44640, rawMins: 680, ecoMins: 540, rawAvail: 98.48, auditAvail: 99.69, status: 'PASSED' },
    { month: '2026-08', calMins: 44640, rawMins: 780, ecoMins: 690, rawAvail: 98.25, auditAvail: 99.80, status: 'PASSED' },
    { month: '2026-09', calMins: 43200, rawMins: 0, ecoMins: 0, rawAvail: 100.0, auditAvail: 100.0, status: 'PASSED' },
    { month: '2026-10', calMins: 44640, rawMins: 0, ecoMins: 0, rawAvail: 100.0, auditAvail: 100.0, status: 'PASSED' },
    { month: '2026-11', calMins: 43200, rawMins: 0, ecoMins: 0, rawAvail: 100.0, auditAvail: 100.0, status: 'PASSED' },
    { month: '2026-12', calMins: 44640, rawMins: 0, ecoMins: 0, rawAvail: 100.0, auditAvail: 100.0, status: 'PASSED' }
  ];

  // CSV Export Function
  const handleExportCsv = () => {
    const rows = [
      ['合同期 ECO 外因停机免责审计清单'],
      ['站点名称', site.siteName],
      ['站点编号', site.siteCode],
      ['合同编号', site.contractNo],
      ['所属客户', site.customer],
      ['当年合同周期', `${contractStart} 至 ${contractEnd}`],
      ['合同 SLA 门槛', `${site.slaThreshold}%`],
      ['当前实际可用度', `${site.currentAvailability}%`],
      ['ECO免责修正后审计可用度', `${auditedAvailability}%`],
      ['累计核免时长', `${totalEcoMinutes} 分钟 (${totalEcoHours} 小时)`],
      [''],
      ['--- 告警 ECO 免责明细列表 ---'],
      ['告警编号', '告警名称', '核心设备', '告警发生时段', 'ECO生效时段', '免责核减时长(分钟)', '免责依据分类', '详细免责说明', '核准人', '关联工单编号']
    ];

    alarmEcoList.forEach(a => {
      rows.push([
        a.code,
        a.title,
        `${a.deviceName} (${a.deviceCode})`,
        `${a.triggerTime} ~ ${a.clearTime || '已复归'}`,
        `${a.ecoStartTime || a.triggerTime} ~ ${a.ecoEndTime || a.clearTime || ''}`,
        String(a.ecoDurationMinutes || a.durationMinutes),
        '电网调度/外因免责',
        a.ecoExemptReason || '',
        a.ecoExemptOperator || '',
        a.workOrderNo || '无'
      ]);
    });

    rows.push(['']);
    rows.push(['--- 工单 ECO 免责明细列表 ---']);
    rows.push(['工单编号', '工单标题', '消缺类别', '工单执行时段', '免责工时(分钟)', '免责依据分类', '证明函件编号', '审核状态', '核准专工']);

    woEcoList.forEach(w => {
      rows.push([
        w.orderNo,
        w.title,
        w.faultCategory,
        `${w.createTime} ~ ${w.closeTime || w.solutionTime || ''}`,
        String(w.ecoExemptMins || 0),
        w.ecoExemptCategory || '',
        w.ecoExemptDocNo || '',
        w.ecoApprovalStatus === 'APPROVED' ? '已核准生效' : '审核中',
        w.ecoExemptOperator || w.assignee
      ]);
    });

    const csvContent = '\uFEFF' + rows.map(e => e.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${site.siteCode}_合同期ECO外因免责审计底稿_${contractStart}_${contractEnd}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`已成功导出 ${site.siteCode} 合同期 ECO 外因免责审计清单 (.csv)`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Remove Alarm Eco
  const handleRemoveAlarmEco = (alarmId: string) => {
    setAlarmEcoList(prev => prev.filter(a => a.id !== alarmId));
    setToastMessage('已撤销该告警的 ECO 外因免责配置');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Remove Work Order Eco
  const handleRemoveWoEco = (orderNo: string) => {
    setWoEcoList(prev => prev.filter(w => w.orderNo !== orderNo));
    setToastMessage('已撤销该工单的 ECO 外因免责工时');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Contract Context Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <ShieldCheck className="w-6 h-6 text-cyan-300" />
              </span>
              <h2 className="text-xl font-bold text-white">合同期 ECO 外因停机免责管理与审计</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                Rule R11 / ECO 节能与外因免责
              </span>
            </div>

            <p className="text-xs text-slate-300/90 mt-2 leading-relaxed max-w-4xl">
              针对外部电网调度计划限电、防汛抗台极端恶劣天气、客户侧计划停电检修及第三方外力破坏等非储能设备本体故障，
              在当年合同履约期内进行合规核减并固化审计证据链，修正当期可用度达成率。
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800 font-mono">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>站点:</span>
                <strong className="text-white font-sans">{site.siteName} ({site.siteCode})</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>当年合同周期:</span>
                <strong className="text-cyan-200">{contractStart} 至 {contractEnd}</strong>
              </span>
              <span>
                合同编号: <strong className="text-white">{site.contractNo}</strong>
              </span>
              <span>
                考核门槛: <strong className="text-amber-400">{site.slaThreshold}%</strong>
              </span>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              title="导出包含告警与工单免责明细的原始 CSV 审计底稿"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>导出审计清单 (CSV)</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              title="生成并预览带双方签字盖章栏的标准 SLA 履约免责正式报告"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>预览/打印正式免责报告</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">合同期累计核免时长</span>
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-900 mt-2">
            {totalEcoMinutes.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">分钟</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <span>折合约 {totalEcoHours} 小时连续免责停运</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">SLA 可用度挽回修正幅度</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-2">
            +{recoveredAvailability}%
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
            <span>原始: {site.currentAvailability}%</span>
            <span>&rarr;</span>
            <strong className="text-emerald-700 font-mono">审计后: {auditedAvailability}%</strong>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">告警已配置 ECO 免责</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <ZapOff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-900 mt-2">
            {alarmEcoList.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">项告警</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            告警核减时长: {totalAlarmEcoMinutes} 分钟
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">工单已配置 ECO 免责</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-purple-900 mt-2">
            {woEcoList.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">张闭环工单</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            工单核免时长: {totalWoEcoMinutes} 分钟
          </div>
        </div>
      </div>

      {/* Main Container: Sub-tabs, Filters and Tables */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Navigation & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* SubTab switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setActiveSubTab('alarms')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'alarms'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ZapOff className="w-3.5 h-3.5 text-cyan-600" />
              <span>告警 ECO 配置详情列表</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-100 text-cyan-800">
                {alarmEcoList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('workOrders')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'workOrders'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-purple-600" />
              <span>工单 ECO 配置详情列表</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-100 text-purple-800">
                {woEcoList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('monthly')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'monthly'
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>合同期月度 ECO 考核对比</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-cyan-500 shadow-2xs"
            >
              {ECO_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索编号/原因/设备/人员..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* TAB 1: 告警 ECO 配置详情列表 */}
        {activeSubTab === 'alarms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>共找到</span>
                <strong className="font-mono text-cyan-800 font-bold">{filteredAlarms.length}</strong>
                <span>条已配置 ECO 外因免责的告警记录</span>
              </div>
              <div className="text-[11px] text-slate-400">
                支持查看原始告警时段与核定 ECO 时段，并核算停运全额免责
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="py-3 px-3">告警编号 / 告警名称</th>
                      <th className="py-3 px-3">影响核心设备</th>
                      <th className="py-3 px-3">告警发生时段</th>
                      <th className="py-3 px-3">ECO 生效免责时段</th>
                      <th className="py-3 px-3 text-right">核减时长</th>
                      <th className="py-3 px-3 text-right">SLA贡献</th>
                      <th className="py-3 px-3">免责依据分类与说明</th>
                      <th className="py-3 px-3">核准专工</th>
                      <th className="py-3 px-3">关联工单</th>
                      <th className="py-3 px-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAlarms.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-400">
                          没有符合条件的告警 ECO 免责记录
                        </td>
                      </tr>
                    ) : (
                      filteredAlarms.map(alarm => (
                        <tr key={alarm.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-medium">
                            <div className="flex flex-col">
                              <span className="font-mono text-[11px] font-bold text-slate-900">
                                {alarm.code}
                              </span>
                              <span className="text-slate-800 font-semibold mt-0.5">
                                {alarm.title}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-mono text-[11px] text-indigo-700 font-semibold">
                              {alarm.deviceCode}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {alarm.deviceName}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                            <div>起: {alarm.triggerTime}</div>
                            <div>止: {alarm.clearTime || '已自动复归'}</div>
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px]">
                            <div className="text-cyan-900 font-semibold">
                              起: {alarm.ecoStartTime || alarm.triggerTime}
                            </div>
                            <div className="text-cyan-900 font-semibold">
                              止: {alarm.ecoEndTime || alarm.clearTime || '已自动复归'}
                            </div>
                            {alarm.isCustomEcoTime && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-sans font-bold">
                                自定义ECO时段
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-cyan-800">
                            {alarm.ecoDurationMinutes || alarm.durationMinutes} min
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                            +{alarm.availabilityImpactPercent}%
                          </td>

                          <td className="py-3 px-3 max-w-[260px]">
                            <p className="text-slate-800 leading-snug line-clamp-2">
                              {alarm.ecoExemptReason || '经审核确认的电网限电/外因免责'}
                            </p>
                          </td>

                          <td className="py-3 px-3 text-slate-600 text-[11px]">
                            <div>{alarm.ecoExemptOperator || '调度专工'}</div>
                            <div className="text-slate-400 font-mono text-[10px]">
                              {alarm.ecoExemptTime || '已生效'}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {alarm.workOrderNo ? (
                              <button
                                onClick={() => onNavigateTab(2)}
                                className="font-mono text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline flex items-center gap-0.5"
                                title="点击前往工单详情查看处置闭环"
                              >
                                <span>{alarm.workOrderNo}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">未关联</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setEditingAlarmEco(alarm)}
                                className="p-1 rounded text-cyan-700 hover:bg-cyan-100 transition-colors"
                                title="修改 ECO 免责生效起止时间与依据说明"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveAlarmEco(alarm.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="撤回该告警的 ECO 免责配置"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 工单 ECO 配置详情列表 */}
        {activeSubTab === 'workOrders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>共找到</span>
                <strong className="font-mono text-purple-800 font-bold">{filteredWorkOrders.length}</strong>
                <span>张已配置 ECO 外因免责工时的现场闭环工单</span>
              </div>
              <div className="text-[11px] text-slate-400">
                工单经核准后，其对应消缺所占用的停运时间将从 SLA 违约考核中剔除
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="py-3 px-3">工单编号</th>
                      <th className="py-3 px-3">工单标题与消缺类别</th>
                      <th className="py-3 px-3">工单执行时段</th>
                      <th className="py-3 px-3 text-right">核免工时 (min)</th>
                      <th className="py-3 px-3">免责依据分类</th>
                      <th className="py-3 px-3">证明函件编号</th>
                      <th className="py-3 px-3">审核状态</th>
                      <th className="py-3 px-3">核准专工</th>
                      <th className="py-3 px-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          没有符合条件的工单 ECO 免责记录
                        </td>
                      </tr>
                    ) : (
                      filteredWorkOrders.map(wo => (
                        <tr key={wo.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {wo.orderNo}
                          </td>

                          <td className="py-3 px-3 max-w-[280px]">
                            <div className="text-slate-900 font-semibold leading-snug">
                              {wo.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {wo.faultCategory}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                            <div>起: {wo.createTime}</div>
                            <div>止: {wo.closeTime || wo.solutionTime || '处理中'}</div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-purple-800">
                            {wo.ecoExemptMins || 0} min
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                              {wo.ecoExemptCategory || '电网外因免责'}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                              {wo.ecoExemptReason}
                            </p>
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                            {wo.ecoExemptDocNo || 'CSG-GRID-2026-DISP'}
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>已核准生效</span>
                            </span>
                          </td>

                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {wo.ecoExemptOperator || wo.assignee}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setEditingWoEco(wo)}
                                className="p-1 rounded text-purple-700 hover:bg-purple-100 transition-colors"
                                title="编辑工单 ECO 核免工时与证明函件编号"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onNavigateTab(2)}
                                className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                title="前往工单详情查看详细消缺报告"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveWoEco(wo.orderNo)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="撤销工单 ECO 免责配置"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 合同期月度 ECO 考核核算对比 */}
        {activeSubTab === 'monthly' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>当年合同期 12 个月逐月 ECO 核减对比与可用度修正履约表</span>
              <span className="font-mono text-slate-500">
                考核门槛: <strong className="text-amber-600">{site.slaThreshold}%</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="py-3 px-3">合同月份</th>
                      <th className="py-3 px-3 text-right">日历运行总分钟</th>
                      <th className="py-3 px-3 text-right">原始停机扣减 (min)</th>
                      <th className="py-3 px-3 text-right font-bold text-cyan-800">ECO 免责核减 (min)</th>
                      <th className="py-3 px-3 text-right">净扣减时长 (min)</th>
                      <th className="py-3 px-3 text-right font-mono">原始可用度</th>
                      <th className="py-3 px-3 text-right font-mono font-bold text-emerald-600">ECO修正审计可用度</th>
                      <th className="py-3 px-3 text-center">SLA考核结论</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {monthlyData.map(m => {
                      const netMins = Math.max(0, m.rawMins - m.ecoMins);
                      const isGain = m.auditAvail > m.rawAvail;
                      return (
                        <tr key={m.month} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-800">{m.month}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{m.calMins.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-red-600">{m.rawMins}</td>
                          <td className="py-3 px-3 text-right font-bold text-cyan-700">
                            {m.ecoMins > 0 ? `-${m.ecoMins}` : '0'}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-800">{netMins}</td>
                          <td className="py-3 px-3 text-right text-slate-700">{m.rawAvail}%</td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-600">
                            <span>{m.auditAvail}%</span>
                            {isGain && (
                              <span className="text-[10px] text-cyan-600 font-normal ml-1">
                                (+{(m.auditAvail - m.rawAvail).toFixed(2)}%)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              履约达标
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Edit Alarm ECO Details */}
      {editingAlarmEco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">编辑告警 ECO 免责配置</h3>
              </div>
              <button
                onClick={() => setEditingAlarmEco(null)}
                className="p-1 rounded text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">{editingAlarmEco.code} - {editingAlarmEco.title}</div>
                <div className="text-slate-500 font-mono">设备: {editingAlarmEco.deviceName} ({editingAlarmEco.deviceCode})</div>
                <div className="text-slate-500 font-mono">告警时段: {editingAlarmEco.triggerTime} 至 {editingAlarmEco.clearTime || '已复归'}</div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">ECO 免责起止生效时段</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editingAlarmEco.ecoStartTime || editingAlarmEco.triggerTime}
                    onChange={e => setEditingAlarmEco({ ...editingAlarmEco, ecoStartTime: e.target.value, isCustomEcoTime: true })}
                    className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-800"
                    placeholder="开始时间"
                  />
                  <input
                    type="text"
                    value={editingAlarmEco.ecoEndTime || editingAlarmEco.clearTime || ''}
                    onChange={e => setEditingAlarmEco({ ...editingAlarmEco, ecoEndTime: e.target.value, isCustomEcoTime: true })}
                    className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-800"
                    placeholder="结束时间"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">免责核减时长 (分钟)</label>
                <input
                  type="number"
                  value={editingAlarmEco.ecoDurationMinutes || editingAlarmEco.durationMinutes}
                  onChange={e => setEditingAlarmEco({ ...editingAlarmEco, ecoDurationMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">免责依据与原因条款说明</label>
                <textarea
                  rows={3}
                  value={editingAlarmEco.ecoExemptReason || ''}
                  onChange={e => setEditingAlarmEco({ ...editingAlarmEco, ecoExemptReason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">核准人 / 调度专工</label>
                <input
                  type="text"
                  value={editingAlarmEco.ecoExemptOperator || ''}
                  onChange={e => setEditingAlarmEco({ ...editingAlarmEco, ecoExemptOperator: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingAlarmEco(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setAlarmEcoList(prev => prev.map(a => a.id === editingAlarmEco.id ? editingAlarmEco : a));
                  setEditingAlarmEco(null);
                  setToastMessage('已更新告警 ECO 外因免责配置');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs"
              >
                保存变更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Work Order ECO Details */}
      {editingWoEco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm">编辑工单 ECO 免责工时</h3>
              </div>
              <button
                onClick={() => setEditingWoEco(null)}
                className="p-1 rounded text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">{editingWoEco.orderNo} - {editingWoEco.title}</div>
                <div className="text-slate-500 font-mono">消缺类别: {editingWoEco.faultCategory}</div>
                <div className="text-slate-500 font-mono">创建: {editingWoEco.createTime} · 闭环: {editingWoEco.closeTime || editingWoEco.solutionTime}</div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">ECO 核免工时 (分钟)</label>
                <input
                  type="number"
                  value={editingWoEco.ecoExemptMins || 0}
                  onChange={e => setEditingWoEco({ ...editingWoEco, ecoExemptMins: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">证明函件编号</label>
                <input
                  type="text"
                  value={editingWoEco.ecoExemptDocNo || ''}
                  onChange={e => setEditingWoEco({ ...editingWoEco, ecoExemptDocNo: e.target.value })}
                  placeholder="例如: CSG-DISPATCH-TYPHOON-0811"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">免责依据与原因分类说明</label>
                <textarea
                  rows={3}
                  value={editingWoEco.ecoExemptReason || ''}
                  onChange={e => setEditingWoEco({ ...editingWoEco, ecoExemptReason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">核准人 / 运维主管</label>
                <input
                  type="text"
                  value={editingWoEco.ecoExemptOperator || ''}
                  onChange={e => setEditingWoEco({ ...editingWoEco, ecoExemptOperator: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setEditingWoEco(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setWoEcoList(prev => prev.map(w => w.orderNo === editingWoEco.orderNo ? editingWoEco : w));
                  setEditingWoEco(null);
                  setToastMessage('已更新工单 ECO 免责配置');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
              >
                保存变更
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Formal SLA ECO Exemption Audit Report Preview (Print/PDF) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Bar */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm">合同期 ECO 外因停机免责正式审计核算报告 (预览)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>立即打印 / 存为 PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formal Report Printable Sheet */}
            <div className="p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 bg-white" id="printable-eco-report">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-5 text-center space-y-2">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold font-mono">
                  SLA AVAILABILITY EXEMPTION AUDIT REPORT
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  储能电站合同期 ECO 外因免责与可用度审计认定书
                </h1>
                <div className="text-xs text-slate-500 font-mono">
                  报告归档文号: ECO-AUDIT-{site.siteCode}-2026-FINAL · 签发日期: 2026-11-03
                </div>
              </div>

              {/* Basic Contract Context Matrix */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">被审计站点名称:</span>
                  <strong className="text-slate-900 ml-2 font-bold">{site.siteName} ({site.siteCode})</strong>
                </div>
                <div>
                  <span className="text-slate-500">所属业主客户:</span>
                  <strong className="text-slate-900 ml-2 font-bold">{site.customer}</strong>
                </div>
                <div>
                  <span className="text-slate-500">当年合同履约周期:</span>
                  <strong className="text-slate-900 ml-2 font-mono">{contractStart} 至 {contractEnd}</strong>
                </div>
                <div>
                  <span className="text-slate-500">储能服务合同编号:</span>
                  <strong className="text-slate-900 ml-2 font-mono">{site.contractNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500">约定 SLA 考核门槛:</span>
                  <strong className="text-blue-700 ml-2 font-mono font-bold">{site.slaThreshold}%</strong>
                </div>
                <div>
                  <span className="text-slate-500">电站装机规模:</span>
                  <strong className="text-slate-900 ml-2 font-mono">{site.capacityMw} MW / {site.capacityMw * 2} MWh</strong>
                </div>
              </div>

              {/* Audit Findings & Conclusion */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-l-4 border-cyan-600 pl-2">
                  一、可用度考核修正与审计定性结论
                </h4>
                <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs text-cyan-950 space-y-2 leading-relaxed">
                  <p>
                    经双方运维专工及电网调度中心数据对账，在合同周期 <strong>{contractStart} 至 {contractEnd}</strong> 内，
                    共核定外部电网限电、防汛抗台极端天气及电网春检等免责停运时长 <strong>{totalEcoMinutes} 分钟</strong>（折合约 <strong>{totalEcoHours} 小时</strong>）。
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-cyan-200/80 font-mono text-center">
                    <div className="bg-white p-2 rounded-lg border border-cyan-200">
                      <div className="text-[10px] text-slate-500">原始未核减可用度</div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">{site.currentAvailability}%</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-cyan-200">
                      <div className="text-[10px] text-slate-500">ECO 免责核减贡献</div>
                      <div className="text-base font-bold text-emerald-600 mt-0.5">+{recoveredAvailability}%</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-cyan-200">
                      <div className="text-[10px] text-slate-500">最终审计认定可用度</div>
                      <div className="text-base font-black text-cyan-900 mt-0.5">{auditedAvailability}% (达标)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table 1 in Report: Alarm ECO items */}
              <div className="space-y-2 text-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-l-4 border-indigo-600 pl-2">
                  二、核定告警 ECO 外因停机免责明细清单
                </h4>
                <table className="w-full text-left border border-slate-200 text-[11px]">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2 border-r border-slate-200">告警编号</th>
                      <th className="p-2 border-r border-slate-200">告警名称</th>
                      <th className="p-2 border-r border-slate-200">核心设备</th>
                      <th className="p-2 border-r border-slate-200">ECO生效免责时段</th>
                      <th className="p-2 border-r border-slate-200 text-right">核减时长</th>
                      <th className="p-2 border-r border-slate-200">依据分类与调度令</th>
                      <th className="p-2">核准签章</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {alarmEcoList.map(a => (
                      <tr key={a.id}>
                        <td className="p-2 font-mono border-r border-slate-200">{a.code}</td>
                        <td className="p-2 border-r border-slate-200">{a.title}</td>
                        <td className="p-2 border-r border-slate-200">{a.deviceName}</td>
                        <td className="p-2 font-mono border-r border-slate-200">
                          {a.ecoStartTime || a.triggerTime} ~ {a.ecoEndTime || a.clearTime || ''}
                        </td>
                        <td className="p-2 font-mono text-right font-bold border-r border-slate-200">
                          {a.ecoDurationMinutes || a.durationMinutes} min
                        </td>
                        <td className="p-2 border-r border-slate-200 text-[10px]">{a.ecoExemptReason}</td>
                        <td className="p-2 text-[10px]">{a.ecoExemptOperator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table 2 in Report: Work Order ECO items */}
              <div className="space-y-2 text-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-l-4 border-purple-600 pl-2">
                  三、核定工单 ECO 外因停机免责明细清单
                </h4>
                <table className="w-full text-left border border-slate-200 text-[11px]">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2 border-r border-slate-200">工单编号</th>
                      <th className="p-2 border-r border-slate-200">工单标题</th>
                      <th className="p-2 border-r border-slate-200">工单执行时段</th>
                      <th className="p-2 border-r border-slate-200 text-right">核免工时</th>
                      <th className="p-2 border-r border-slate-200">证明函件文号</th>
                      <th className="p-2">核准人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {woEcoList.map(w => (
                      <tr key={w.id}>
                        <td className="p-2 font-mono border-r border-slate-200">{w.orderNo}</td>
                        <td className="p-2 border-r border-slate-200">{w.title}</td>
                        <td className="p-2 font-mono border-r border-slate-200">
                          {w.createTime} ~ {w.closeTime || w.solutionTime}
                        </td>
                        <td className="p-2 font-mono text-right font-bold border-r border-slate-200">
                          {w.ecoExemptMins} min
                        </td>
                        <td className="p-2 font-mono border-r border-slate-200">{w.ecoExemptDocNo || 'CSG-GRID-2026-DISP'}</td>
                        <td className="p-2">{w.ecoExemptOperator || w.assignee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signature Blocks */}
              <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs">
                <div className="space-y-6">
                  <div className="font-bold text-slate-900">甲方（业主/电网代表）</div>
                  <div className="text-slate-500">签署人: ___________________</div>
                  <div className="text-slate-500">签署日期: _____年___月___日</div>
                  <div className="w-24 h-24 border border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400">
                    [甲方公章处]
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="font-bold text-slate-900">乙方（储能运维技术服务方）</div>
                  <div className="text-slate-500">签署人: ___________________</div>
                  <div className="text-slate-500">签署日期: _____年___月___日</div>
                  <div className="w-24 h-24 border border-dashed border-indigo-300 rounded-full flex items-center justify-center text-[10px] text-indigo-400">
                    [运维服务专用章]
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="font-bold text-slate-900">第三方独立监造/评估机构</div>
                  <div className="text-slate-500">核验工程师: _________________</div>
                  <div className="text-slate-500">核验日期: _____年___月___日</div>
                  <div className="w-24 h-24 border border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400">
                    [审核认证章]
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500">
                本报告自动依据当年合同起止期 ({contractStart} ~ {contractEnd}) 生成，已具备完整合规核免证明链
              </span>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
