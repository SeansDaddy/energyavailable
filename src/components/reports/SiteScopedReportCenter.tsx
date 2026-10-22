import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ReportCenterItem, ReportCategory, ReportStatus } from '../../types/reportCenter';
import { Site } from '../../types';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  X,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  FolderKanban,
  TableProperties,
  LayoutGrid,
  ShieldCheck,
  HeartPulse,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Radio,
  FileCheck2,
  Layers,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Check,
  CheckCircle
} from 'lucide-react';
import {
  getDefaultContractBaseline,
  DEFAULT_SOH_BASELINE_CURVE,
  generateStationDailyAndMonthlyData,
  calculateFlexibleWarrantySohAlgorithm
} from '../../utils/flexibleWarrantyAlgorithm';
import { exportFlexibleWarrantyPdfReport } from '../../utils/flexibleWarrantyPdfReport';

export type ReportModuleScope =
  | 'AVAILABILITY'
  | 'PERFORMANCE'
  | 'FLEXIBLE_WARRANTY'
  | 'SITE_LEDGER'
  | 'ALL';

interface SiteScopedReportCenterProps {
  moduleScope: ReportModuleScope;
  initialSiteId?: string;
  onBackToOverview?: () => void;
  lockSite?: boolean;
}

export const SiteScopedReportCenter: React.FC<SiteScopedReportCenterProps> = ({
  moduleScope,
  initialSiteId,
  onBackToOverview,
  lockSite = false
}) => {
  const {
    sites,
    reportCenterItems,
    addReportToCenter,
    deleteReportFromCenter,
    batchDeleteReportsFromCenter,
    currentUser
  } = useApp();

  // Module configuration metadata
  const moduleConfig = useMemo(() => {
    switch (moduleScope) {
      case 'AVAILABILITY':
        return {
          title: '可用度报告中心',
          badge: 'SLA履约与运行考核',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          accentColor: 'blue',
          defaultCategory: 'AVAILABILITY_SLA' as ReportCategory,
          description: '按站点维度沉淀全网储能电站可用度打点档案、SLA履约结算报告及等效停运分析单。'
        };
      case 'PERFORMANCE':
        return {
          title: '性能工况报告中心',
          badge: '体检与健康度档案',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          accentColor: 'indigo',
          defaultCategory: 'PERFORMANCE_CONDITION' as ReportCategory,
          description: '按站点维度沉淀储能系统深度体检、综合RTE能效、可用容量保持率与SOH性能工况报告。'
        };
      case 'FLEXIBLE_WARRANTY':
        return {
          title: '灵活质保报告中心',
          badge: 'SOH衰减与质保档案',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accentColor: 'emerald',
          defaultCategory: 'FLEXIBLE_WARRANTY' as ReportCategory,
          description: '按站点维度沉淀双衰减曲线拟合分析、超工况动力学寿命折算与质保延保审核评估报告。'
        };
      case 'SITE_LEDGER':
        return {
          title: '站点台账报告中心',
          badge: '数字化资产与设备档案',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          accentColor: 'amber',
          defaultCategory: 'SITE_LEDGER' as ReportCategory,
          description: '按站点维度归档全景资产台账总册、核心设备全生命周期履历、拓扑冗余架构与运维技术档案。'
        };
      default:
        return {
          title: '站点报告中心',
          badge: '全业务维度档案',
          badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
          accentColor: 'blue',
          defaultCategory: 'ALL' as any,
          description: '按站点维度集中检索、预览、生成并批量导出全生命周期标准化报告。'
        };
    }
  }, [moduleScope]);

  // View Mode: 'site_centric' (Site Dimension Management) vs 'table' (All Reports Table View)
  const [viewMode, setViewMode] = useState<'site_centric' | 'table'>('site_centric');

  // Currently focused site (Site dimension)
  const [activeSiteId, setActiveSiteId] = useState<string>(() => {
    if (initialSiteId && sites.some(s => s.id === initialSiteId)) {
      return initialSiteId;
    }
    return sites[0]?.id || 'site-001';
  });

  // Left-rail site search in site_centric mode
  const [siteSearchTerm, setSiteSearchTerm] = useState('');
  const [siteRegionFilter, setSiteRegionFilter] = useState('ALL');

  // Filter & Search states for reports
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(() => {
    if (moduleScope === 'ALL') return 'ALL';
    return moduleConfig.defaultCategory;
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [tableSiteFilter, setTableSiteFilter] = useState<string>('ALL');

  // Multi-select for batch actions
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  // Modals & Async States
  const [previewReport, setPreviewReport] = useState<ReportCenterItem | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New report wizard form
  const [newReportTargetSiteId, setNewReportTargetSiteId] = useState<string>(activeSiteId);
  const [newReportCategory, setNewReportCategory] = useState<ReportCategory>(moduleConfig.defaultCategory);
  const [newReportPeriod, setNewReportPeriod] = useState<string>('2026-08 (当期累计)');
  const [newReportNotes, setNewReportNotes] = useState<string>('');

  // Keep activeSiteId in sync with initialSiteId if provided or when switching sites
  React.useEffect(() => {
    if (initialSiteId && sites.some(s => s.id === initialSiteId)) {
      setActiveSiteId(initialSiteId);
      setNewReportTargetSiteId(initialSiteId);
      if (lockSite) {
        setTableSiteFilter(initialSiteId);
      }
    }
  }, [initialSiteId, sites, lockSite]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Site Object
  const activeSite = useMemo(() => {
    return sites.find(s => s.id === activeSiteId) || sites[0];
  }, [sites, activeSiteId]);

  // Filtered Site list for left selector
  const filteredSitesList = useMemo(() => {
    return sites.filter(s => {
      const matchRegion = siteRegionFilter === 'ALL' || s.region === siteRegionFilter;
      const matchSearch =
        !siteSearchTerm ||
        s.siteName.toLowerCase().includes(siteSearchTerm.toLowerCase()) ||
        s.siteCode.toLowerCase().includes(siteSearchTerm.toLowerCase()) ||
        s.customer.toLowerCase().includes(siteSearchTerm.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [sites, siteRegionFilter, siteSearchTerm]);

  // Site reports count map (module-aware or overall)
  const siteReportsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    reportCenterItems.forEach(item => {
      if (item.siteId) {
        // If module scope is not ALL, count reports matching category
        if (moduleScope !== 'ALL') {
          if (item.category === moduleConfig.defaultCategory) {
            map.set(item.siteId, (map.get(item.siteId) || 0) + 1);
          }
        } else {
          map.set(item.siteId, (map.get(item.siteId) || 0) + 1);
        }
      }
    });
    return map;
  }, [reportCenterItems, moduleScope, moduleConfig.defaultCategory]);

  // Reports belonging to the active site
  const activeSiteReports = useMemo(() => {
    return reportCenterItems.filter(r => {
      const matchSite = r.siteId === activeSiteId;
      const matchCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
      const matchSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSite && matchCategory && matchSearch;
    });
  }, [reportCenterItems, activeSiteId, categoryFilter, searchQuery]);

  // All reports filtered for Table view (when lockSite is active, lock to activeSiteId)
  const effectiveTableSiteFilter = lockSite ? activeSiteId : tableSiteFilter;
  const filteredAllReports = useMemo(() => {
    return reportCenterItems.filter(item => {
      const matchSite = effectiveTableSiteFilter === 'ALL' || item.siteId === effectiveTableSiteFilter;
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchPeriod = periodFilter === 'ALL' || item.period.includes(periodFilter);
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reportNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSite && matchCategory && matchStatus && matchPeriod && matchSearch;
    });
  }, [reportCenterItems, effectiveTableSiteFilter, categoryFilter, statusFilter, periodFilter, searchQuery]);

  // Trigger Report Download
  const handleDownloadReport = async (report: ReportCenterItem) => {
    try {
      setDownloadingReportId(report.id);
      const targetSite = sites.find(s => s.id === report.siteId) || sites[0];

      if (report.category === 'FLEXIBLE_WARRANTY' && targetSite) {
        const baseline = getDefaultContractBaseline(
          targetSite.id,
          targetSite.capacityMw ? targetSite.capacityMw * 2 : 20.0
        );
        const { daily, monthly } = generateStationDailyAndMonthlyData(targetSite.id, baseline);
        const sohResult = calculateFlexibleWarrantySohAlgorithm(
          baseline,
          DEFAULT_SOH_BASELINE_CURVE,
          monthly,
          daily
        );

        await exportFlexibleWarrantyPdfReport({
          site: targetSite,
          contractBaseline: baseline,
          sohResult,
          monthlyConditions: monthly,
          dailyConditions: daily,
          sohBaselineCurve: DEFAULT_SOH_BASELINE_CURVE
        });
        showToast(`《${report.title}.pdf》已成功导出！`);
      } else {
        const textContent =
          `=================================================================\n` +
          `       能源数字化管控体系 · 标准技术与管理报告归档档案\n` +
          `=================================================================\n\n` +
          `【档案信息】\n` +
          `报告编号: ${report.reportNo}\n` +
          `档案版本: ${report.version}\n` +
          `报告标题: ${report.title}\n` +
          `业务类别: ${report.categoryName}\n` +
          `归属站点: ${report.siteName} (${report.siteCode})\n` +
          `所在大区: ${report.region}\n` +
          `考核/统计周期: ${report.period}\n` +
          `编制人员: ${report.author}\n` +
          `生成时间: ${report.createdTime}\n` +
          `审核签章: ${report.approvalDept || '能源工程技术委员会'} / ${report.approvalSigner || '技术专家'}\n\n` +
          `【执行摘要】\n` +
          `${report.summary}\n\n` +
          `【关键指标 (KPIs)】\n` +
          (report.kpis || []).map(k => ` - ${k.label}: ${k.value} (基准要求: ${k.benchmark || 'N/A'})`).join('\n') +
          `\n\n【诊断分析结论】\n` +
          (report.diagnostics || ['各项指标稳定，未发现重大工况偏离。']).map((d, i) => ` ${i + 1}. ${d}`).join('\n') +
          `\n\n【运维与优化建议】\n` +
          (report.recommendations || ['建议维持当前策略，定期打点监测。']).map((r, i) => ` ${i + 1}. ${r}`).join('\n') +
          `\n\n` +
          `-----------------------------------------------------------------\n` +
          `本报告数据源自实测工况传感器与平台算法引擎，具有正式结算与技术溯源效力。\n` +
          `=================================================================\n`;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/[\/\\:*?"<>|]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`已成功下载报告《${report.title}》！`);
      }
    } catch (err) {
      console.error('Download report error', err);
      showToast('报告下载失败，请稍后重试');
    } finally {
      setDownloadingReportId(null);
    }
  };

  // Export as CSV/Excel tabular format
  const handleExportExcelFormat = (report: ReportCenterItem) => {
    const csvRows = [
      ['档案编号', report.reportNo],
      ['报告标题', report.title],
      ['业务类型', report.categoryName],
      ['归属站点', report.siteName],
      ['站点编码', report.siteCode],
      ['所在区域', report.region],
      ['考核周期', report.period],
      ['编制人员', report.author],
      ['生成时间', report.createdTime],
      ['归档状态', report.status === 'APPROVED' ? '已签章' : '正常归档'],
      ['执行摘要', `"${report.summary.replace(/"/g, '""')}"`],
      [],
      ['指标名称', '实测数值', '考核基线', '状态评价'],
      ...(report.kpis || []).map(k => [k.label, k.value, k.benchmark || '-', k.status || 'normal']),
      [],
      ['诊断分析项', '详细说明'],
      ...(report.diagnostics || []).map((d, i) => [`诊断 ${i + 1}`, `"${d.replace(/"/g, '""')}"`]),
      [],
      ['工程优化建议', '建议内容'],
      ...(report.recommendations || []).map((r, i) => [`建议 ${i + 1}`, `"${r.replace(/"/g, '""')}"`])
    ];

    const csvContent = '\uFEFF' + csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[\/\\:*?"<>|]/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`已成功导出《${report.title}.csv》表格数据！`);
  };

  // Batch download
  const handleBatchDownload = () => {
    if (selectedReportIds.length === 0) {
      showToast('请先勾选需要下载的报告');
      return;
    }
    showToast(`正在批量打包下载选中的 ${selectedReportIds.length} 份报告文档...`);
    setTimeout(() => {
      showToast(`已完成 ${selectedReportIds.length} 份报告打包导出！`);
      setSelectedReportIds([]);
    }, 1200);
  };

  // Batch delete
  const handleBatchDelete = () => {
    if (selectedReportIds.length === 0) return;
    if (window.confirm(`确定要从报告中心删除选中的 ${selectedReportIds.length} 份报告吗？`)) {
      batchDeleteReportsFromCenter(selectedReportIds);
      setSelectedReportIds([]);
      showToast('已成功批量删除选中的报告记录');
    }
  };

  // Quick recalculate and generate latest report for active site
  const handleRegenerateForSite = (siteObj: Site) => {
    let newReport: ReportCenterItem;

    if (moduleScope === 'FLEXIBLE_WARRANTY') {
      const baseline = getDefaultContractBaseline(siteObj.id, siteObj.capacityMw ? siteObj.capacityMw * 2 : 20.0);
      const { daily, monthly } = generateStationDailyAndMonthlyData(siteObj.id, baseline);
      const sohResult = calculateFlexibleWarrantySohAlgorithm(baseline, DEFAULT_SOH_BASELINE_CURVE, monthly, daily);

      newReport = addReportToCenter({
        title: `${siteObj.siteName} 灵活质保工况与SOH衰减综合评估报告 (最新重算版)`,
        category: 'FLEXIBLE_WARRANTY',
        categoryName: '灵活质保SOH评估',
        siteId: siteObj.id,
        siteCode: siteObj.siteCode,
        siteName: siteObj.siteName,
        region: siteObj.region,
        period: '2026-08 (当期累计)',
        format: 'PDF',
        fileSize: '3.9 MB',
        author: `${currentUser.name} (质保算法组)`,
        version: 'v2.2 (最新)',
        status: 'APPROVED',
        summary: `基于实测PACK工况高频积分测算，当前灵活估算SOH为 ${sohResult.currentFlexibleSoh.toFixed(2)}%，相比基准曲线保证值 (${sohResult.currentBaselineSoh.toFixed(2)}%) 裕度为 ${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin.toFixed(2)}%，月度等效循环 ${monthly.reduce((s, m) => s + m.actualEfc, 0).toFixed(1)} EFC。`,
        kpis: [
          { label: '灵活估算SOH', value: `${sohResult.currentFlexibleSoh.toFixed(2)}%`, benchmark: '95.40%', status: 'success' },
          { label: '基准偏离裕度', value: `${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin.toFixed(2)}%`, benchmark: '≥0.00%', status: 'success' },
          { label: '超工况天数', value: `${daily.filter(d => d.isOverCondition).length} 天`, benchmark: '≤5天/月', status: daily.filter(d => d.isOverCondition).length > 5 ? 'warning' : 'success' },
          { label: '累计等效循环 (EFC)', value: `${monthly.reduce((s, m) => s + m.actualEfc, 0).toFixed(1)} 次`, benchmark: '30.0 次', status: 'info' },
          { label: '平均工作温度', value: `${(monthly[0]?.avgTemp || 25.0).toFixed(1)} ℃`, benchmark: '25.0 ℃', status: 'info' }
        ],
        diagnostics: [
          '已按实测温度场分布校准极化阻抗偏离，未发现电芯快速析锂不可逆衰减。',
          '月度综合能量效率保持在 91.2%，温升受控。'
        ],
        recommendations: [
          '维持当前平滑充放电调度策略。',
          '建议在下个周期微调液冷温控启动死区阈值。'
        ]
      });
    } else if (moduleScope === 'PERFORMANCE') {
      newReport = addReportToCenter({
        title: `${siteObj.siteName} 性能工况体检与RTE综合能效诊断报告 (最新重算版)`,
        category: 'PERFORMANCE_CONDITION',
        categoryName: '性能工况体检',
        siteId: siteObj.id,
        siteCode: siteObj.siteCode,
        siteName: siteObj.siteName,
        region: siteObj.region,
        period: '2026-08 (当期累计)',
        format: 'PDF',
        fileSize: '4.1 MB',
        author: `${currentUser.name} (性能评估组)`,
        version: 'v2.1 (最新)',
        status: 'APPROVED',
        summary: `全站24簇电芯深度扫描完成，综合性能得分 94.2 分。实测综合RTE为 91.4%，可用容量保持率 97.6%，簇间开路电压一致性离散度为 22mV。`,
        kpis: [
          { label: '综合性能得分', value: '94.2 分', benchmark: '85.0 分', status: 'success' },
          { label: '综合RTE效率', value: '91.40%', benchmark: '88.00%', status: 'success' },
          { label: '可用容量保持率', value: '97.60%', benchmark: '95.00%', status: 'success' },
          { label: '簇间压差离散度', value: '22 mV', benchmark: '≤50 mV', status: 'success' }
        ],
        diagnostics: [
          'PCS变流器各桥臂效率均衡，箱变损耗处于标称正常范围。',
          'BMS电芯一致性好，未出现异常热点。'
        ],
        recommendations: [
          '保持现有谷充峰放运行工况。',
          '建议每季度开展一次全站标定充放电测试。'
        ]
      });
    } else if (moduleScope === 'SITE_LEDGER') {
      newReport = addReportToCenter({
        title: `${siteObj.siteName} 数字化资产台账与设备档案全景总册 (最新标定版)`,
        category: 'SITE_LEDGER',
        categoryName: '站点台账档案',
        siteId: siteObj.id,
        siteCode: siteObj.siteCode,
        siteName: siteObj.siteName,
        region: siteObj.region,
        period: '2026年度档案',
        format: 'PDF',
        fileSize: '4.8 MB',
        author: `${currentUser.name} (资产台账组)`,
        version: 'v2.3 (最新)',
        status: 'APPROVED',
        summary: `站点数字化台账100%全要素入库，核心设备纳管 ${siteObj.coreDeviceCount || 12} 台套，当前拓扑冗余架构为 ${siteObj.redundancy}，满足SLA ${siteObj.slaThreshold}% 安全交付要求。`,
        kpis: [
          { label: '额定装机功率', value: `${siteObj.capacityMw} MW`, benchmark: `${siteObj.capacityMw} MW`, status: 'info' },
          { label: '核心纳管设备', value: `${siteObj.coreDeviceCount || 12} 台套`, benchmark: '标准配置', status: 'success' },
          { label: '拓扑冗余等级', value: siteObj.redundancy, benchmark: '≥N+1', status: 'success' },
          { label: '签约SLA基线', value: `${siteObj.slaThreshold}%`, benchmark: '≥99.00%', status: 'success' }
        ],
        diagnostics: [
          '变压器、变流柜、高压开关柜四遥点位连通率 100%。',
          '设备三包质保凭据、原厂出厂检验证书电子档案已归档锁定。'
        ],
        recommendations: [
          '按季度组织备品备件库易损件安全冗余库存盘点。'
        ]
      });
    } else {
      // AVAILABILITY default
      const slaGap = siteObj.currentAvailability - siteObj.slaThreshold;
      newReport = addReportToCenter({
        title: `${siteObj.siteName} 可用度与SLA履约结算报告 (最新重算版)`,
        category: 'AVAILABILITY_SLA',
        categoryName: 'SLA可用度履约',
        siteId: siteObj.id,
        siteCode: siteObj.siteCode,
        siteName: siteObj.siteName,
        region: siteObj.region,
        period: '2026-08 (当期累计)',
        format: 'PDF',
        fileSize: '3.6 MB',
        author: `${currentUser.name} (可用度运营中心)`,
        version: 'v2.0 (最新)',
        status: 'APPROVED',
        summary: `当期实测可用度 ${siteObj.currentAvailability.toFixed(2)}%，合同SLA基准要求为 ${siteObj.slaThreshold.toFixed(2)}%，履约裕度 ${slaGap >= 0 ? '+' : ''}${slaGap.toFixed(2)}%。数据采集覆盖率 ${siteObj.dataCoverage}%。`,
        kpis: [
          { label: '当期实测可用度', value: `${siteObj.currentAvailability.toFixed(2)}%`, benchmark: `${siteObj.slaThreshold.toFixed(2)}%`, status: slaGap >= 0 ? 'success' : 'danger' },
          { label: 'SLA履约差额', value: `${slaGap >= 0 ? '+' : ''}${slaGap.toFixed(2)}%`, benchmark: '≥0.00%', status: slaGap >= 0 ? 'success' : 'danger' },
          { label: '等效停机时间', value: slaGap >= 0 ? '0 分钟' : '45 分钟', benchmark: '≤30分钟', status: slaGap >= 0 ? 'success' : 'warning' },
          { label: '日志覆盖完整率', value: `${siteObj.dataCoverage}%`, benchmark: '≥98.0%', status: 'info' }
        ],
        diagnostics: [
          slaGap >= 0
            ? '本周期内未触发一类严重停运事件，各关键子系统运行健康。'
            : '本周期内因逆变变流器过温告警产生短暂降额停机，已闭环处理。'
        ],
        recommendations: [
          '继续执行每日0点日界数据核算与自动化工单复核机制。'
        ]
      });
    }

    showToast(`已成功为《${siteObj.siteName}》重新生成并归档最新报告！`);
    setPreviewReport(newReport);
  };

  // Submit new report from wizard modal
  const handleCreateNewReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const targetSite = sites.find(s => s.id === newReportTargetSiteId) || activeSite;

      let generatedSummary = '';
      let generatedKpis = [];

      if (newReportCategory === 'FLEXIBLE_WARRANTY') {
        const baseline = getDefaultContractBaseline(targetSite.id, targetSite.capacityMw ? targetSite.capacityMw * 2 : 20.0);
        const { daily, monthly } = generateStationDailyAndMonthlyData(targetSite.id, baseline);
        const sohResult = calculateFlexibleWarrantySohAlgorithm(baseline, DEFAULT_SOH_BASELINE_CURVE, monthly, daily);

        generatedSummary = `基于实测PACK工况数据换算，估算SOH为 ${sohResult.currentFlexibleSoh.toFixed(2)}%，相比基准衰减曲线保证值 (${sohResult.currentBaselineSoh.toFixed(2)}%) 质保偏离裕度为 ${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin.toFixed(2)}%。`;
        generatedKpis = [
          { label: '灵活估算SOH', value: `${sohResult.currentFlexibleSoh.toFixed(2)}%`, benchmark: '95.40%', status: 'success' as const },
          { label: '基准偏离裕度', value: `${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin.toFixed(2)}%`, benchmark: '≥0.00%', status: 'success' as const },
          { label: '超工况天数', value: `${daily.filter(d => d.isOverCondition).length} 天`, benchmark: '≤5天/月', status: 'success' as const },
          { label: '累计等效循环', value: `${monthly.reduce((s, m) => s + m.actualEfc, 0).toFixed(1)} EFC`, benchmark: '30.0 EFC', status: 'info' as const }
        ];
      } else if (newReportCategory === 'PERFORMANCE_CONDITION') {
        generatedSummary = `针对全站设备进行完整健康度与性能工况深度扫描，综合性能得分 93.8 分，综合RTE为 91.5%，容量保持率 97.4%，热场一致性优良。`;
        generatedKpis = [
          { label: '综合性能得分', value: '93.8 分', benchmark: '85.0 分', status: 'success' as const },
          { label: '综合RTE效率', value: '91.50%', benchmark: '88.00%', status: 'success' as const },
          { label: '容量保持率', value: '97.40%', benchmark: '95.00%', status: 'success' as const },
          { label: '簇间压差离散度', value: '24 mV', benchmark: '≤50 mV', status: 'success' as const }
        ];
      } else if (newReportCategory === 'SITE_LEDGER') {
        generatedSummary = `全站资产与设备数字化档案完成核准，设备全生命周期记录完备，纳管核心设备 ${targetSite.coreDeviceCount || 12} 台套，当前冗余架构 ${targetSite.redundancy}。`;
        generatedKpis = [
          { label: '额定装机功率', value: `${targetSite.capacityMw} MW`, benchmark: `${targetSite.capacityMw} MW`, status: 'info' as const },
          { label: '核心设备纳管数', value: `${targetSite.coreDeviceCount || 12} 台套`, benchmark: '12 台套', status: 'success' as const },
          { label: '拓扑冗余等级', value: targetSite.redundancy, benchmark: '≥N+1', status: 'success' as const },
          { label: '数字化健康度', value: '99.5 分', benchmark: '≥90.0 分', status: 'success' as const }
        ];
      } else {
        const slaGap = targetSite.currentAvailability - targetSite.slaThreshold;
        generatedSummary = `本考核周期内站点可用度稳定达标，实测综合可用度 ${targetSite.currentAvailability.toFixed(2)}%，SLA履约差额 ${slaGap >= 0 ? '+' : ''}${slaGap.toFixed(2)}%。`;
        generatedKpis = [
          { label: '当期实测可用度', value: `${targetSite.currentAvailability.toFixed(2)}%`, benchmark: `${targetSite.slaThreshold.toFixed(2)}%`, status: slaGap >= 0 ? ('success' as const) : ('danger' as const) },
          { label: 'SLA达标差额', value: `${slaGap >= 0 ? '+' : ''}${slaGap.toFixed(2)}%`, benchmark: '≥0.00%', status: slaGap >= 0 ? ('success' as const) : ('danger' as const) },
          { label: '数据覆盖率', value: `${targetSite.dataCoverage}%`, benchmark: '≥98.0%', status: 'info' as const }
        ];
      }

      const reportNames: Record<ReportCategory, string> = {
        FLEXIBLE_WARRANTY: '灵活质保工况与SOH衰减综合评估报告',
        PERFORMANCE_CONDITION: '性能工况深度体检与能效诊断报告',
        AVAILABILITY_SLA: '可用度与SLA履约运行考核报告',
        SITE_LEDGER: '站点资产台账与设备档案全景报告',
        FAULT_DIAGNOSIS: '核心设备异常与AI根因诊断报告',
        PRE_CONTRACT_EVAL: '销售签约前可用度参考评估意见书'
      };

      const newReport = addReportToCenter({
        title: `${targetSite.siteName} ${reportNames[newReportCategory]} (${newReportPeriod})`,
        category: newReportCategory,
        siteId: targetSite.id,
        siteCode: targetSite.siteCode,
        siteName: targetSite.siteName,
        region: targetSite.region,
        period: newReportPeriod,
        format: 'PDF',
        fileSize: '3.8 MB',
        author: `${currentUser.name} (${currentUser.roleTitle})`,
        version: 'v1.0',
        status: 'APPROVED',
        summary: generatedSummary,
        kpis: generatedKpis,
        diagnostics: [
          '数据链路完整，工况日志采集完整度达 100%。',
          newReportNotes || '各项运行参数处于标称稳定受控区间，符合技术规范。'
        ],
        recommendations: [
          '建议维持现有运行策略，定期跟进指标打点趋势与预防性检修。'
        ]
      });

      setIsGenerateModalOpen(false);
      showToast(`已成功为《${targetSite.siteName}》生成并归档新报告！`);
      setPreviewReport(newReport);
      setActiveSiteId(targetSite.id);
    }, 600);
  };

  const getCategoryBadge = (category: ReportCategory) => {
    switch (category) {
      case 'FLEXIBLE_WARRANTY':
        return { label: '灵活质保SOH', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PERFORMANCE_CONDITION':
        return { label: '性能工况体检', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'AVAILABILITY_SLA':
        return { label: 'SLA可用度履约', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'SITE_LEDGER':
        return { label: '站点台账档案', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'FAULT_DIAGNOSIS':
        return { label: 'AI故障诊断', className: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: '综合报告', className: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-18 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation & Action Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToOverview && !lockSite && (
            <button
              onClick={onBackToOverview}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="返回业务大盘"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              返回大盘
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <FolderKanban className="w-4.5 h-4.5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {lockSite ? `${activeSite.siteName} · ${moduleConfig.title}` : moduleConfig.title}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${moduleConfig.badgeColor}`}>
                {moduleConfig.badge}
              </span>
              {lockSite && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                  站点下钻专属档案
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lockSite
                ? `针对【${activeSite.siteName}】专属归档的${moduleConfig.badge}档案，支持一键重算、在线签章预览、PDF与Excel表格导出。`
                : moduleConfig.description}
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setViewMode('site_centric')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'site_centric'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{lockSite ? '卡片视图' : '按站点维度管理'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>{lockSite ? '明细数据表' : '全量报告明细表'}</span>
            </button>
          </div>

          {/* New Report Wizard Button */}
          <button
            onClick={() => {
              setNewReportTargetSiteId(activeSiteId);
              setNewReportCategory(moduleConfig.defaultCategory);
              setIsGenerateModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建评估报告</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'site_centric' ? (
        /* ================= 1. 站点维度管理视角 (Site Dimension Management) ================= */
        <div className={lockSite ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-12 gap-4 items-start'}>
          {/* Left Column: Interactive Site Dimension Selector (3.5 cols) - Only show if not lockSite */}
          {!lockSite && (
            <div className="lg:col-span-4 xl:col-span-3.5 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>选择管理站点 ({filteredSitesList.length}/{sites.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                已生成报告站点: {sites.filter(s => (siteReportsCountMap.get(s.id) || 0) > 0).length} 站
              </span>
            </div>

            {/* Site Search & Region Quick Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={siteSearchTerm}
                  onChange={e => setSiteSearchTerm(e.target.value)}
                  placeholder="搜索站点名称/编码/客户..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-1">
                {['ALL', '华东区', '华南区', '华北区', '西北区'].map(r => (
                  <button
                    key={r}
                    onClick={() => setSiteRegionFilter(r)}
                    className={`px-2 py-0.5 rounded-full shrink-0 transition-colors cursor-pointer ${
                      siteRegionFilter === r
                        ? 'bg-blue-600 text-white font-medium shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'ALL' ? '全部大区' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Site Cards List */}
            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredSitesList.map(site => {
                const isSelected = site.id === activeSiteId;
                const reportsCount = siteReportsCountMap.get(site.id) || 0;

                const lampColor =
                  site.statusLamp === 'green'
                    ? 'bg-emerald-500'
                    : site.statusLamp === 'yellow'
                    ? 'bg-amber-500'
                    : site.statusLamp === 'red'
                    ? 'bg-rose-500'
                    : 'bg-slate-400';

                return (
                  <div
                    key={site.id}
                    onClick={() => setActiveSiteId(site.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${lampColor}`} />
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {site.siteName}
                          </h4>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>{site.siteCode}</span>
                          <span>·</span>
                          <span>{site.region}</span>
                          <span>·</span>
                          <span>{site.capacityMw}MW</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 font-mono ${
                          reportsCount > 0
                            ? isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {reportsCount}份
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Right Column: Focused Site Report Center Workspace (full width when lockSite) */}
          <div className={lockSite ? 'w-full space-y-4' : 'lg:col-span-8 xl:col-span-8.5 space-y-4'}>
            {/* Active Site Header Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeSite.statusLamp === 'green'
                          ? 'bg-emerald-500 ring-2 ring-emerald-200'
                          : activeSite.statusLamp === 'yellow'
                          ? 'bg-amber-500 ring-2 ring-amber-200'
                          : activeSite.statusLamp === 'red'
                          ? 'bg-rose-500 ring-2 ring-rose-200'
                          : 'bg-slate-400'
                      }`}
                    />
                    <h3 className="text-base font-black text-slate-900">
                      {activeSite.siteName}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                      {activeSite.siteCode}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                      {activeSite.region} · {activeSite.representativeOffice}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>签约客户: <strong className="text-slate-700">{activeSite.customer}</strong></span>
                    <span>装机规模: <strong className="text-slate-700 font-mono">{activeSite.capacityMw} MW</strong></span>
                    <span>合同SLA: <strong className="text-blue-700 font-mono">{activeSite.slaThreshold}%</strong></span>
                  </div>
                </div>

                {/* Quick Actions for this site */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRegenerateForSite(activeSite)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="调用核心算法一键更新并归档最新报告"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>一键生成最新版</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewReportTargetSiteId(activeSite.id);
                      setIsGenerateModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>自定义向导</span>
                  </button>
                </div>
              </div>

              {/* Site Quick Domain Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">实测可用度 (当期)</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                    {activeSite.currentAvailability}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    基准: {activeSite.slaThreshold}%
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">归档历史报告总数</div>
                  <div className="text-base font-black font-mono text-blue-700 mt-0.5">
                    {activeSiteReports.length} <span className="text-xs font-normal text-slate-500">份</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    覆盖全周期核算
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">核心设备纳管状态</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                    {activeSite.coreDeviceCount || 12} <span className="text-xs font-normal text-slate-500">台套</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3 inline" /> 架构: {activeSite.redundancy}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">数据完整度 & 状态</div>
                  <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                    {activeSite.dataCoverage}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    四色灯: {activeSite.statusLamp.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List for the Active Site */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    该站点专属历史报告归档 ({activeSiteReports.length} 份)
                  </h4>
                </div>

                {/* Filter inside active site reports */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="搜索报告编号/标题/人员..."
                      className="bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-800 w-44 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">全部类型</option>
                    <option value="AVAILABILITY_SLA">SLA可用度履约</option>
                    <option value="PERFORMANCE_CONDITION">性能工况体检</option>
                    <option value="FLEXIBLE_WARRANTY">灵活质保SOH</option>
                    <option value="SITE_LEDGER">站点台账档案</option>
                    <option value="FAULT_DIAGNOSIS">AI故障诊断</option>
                  </select>
                </div>
              </div>

              {/* Site Reports Cards Grid */}
              {activeSiteReports.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <FolderKanban className="w-8 h-8 mx-auto text-slate-300" />
                  <div className="text-xs font-medium">当前站点在该筛选条件下暂无归档报告</div>
                  <button
                    onClick={() => handleRegenerateForSite(activeSite)}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    立即为该站点一键生成最新版报告 &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeSiteReports.map(rep => {
                    const badge = getCategoryBadge(rep.category);
                    const isDownloading = downloadingReportId === rep.id;

                    return (
                      <div
                        key={rep.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                                {badge.label}
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-500">
                                {rep.reportNo}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                                {rep.version}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                                {rep.status === 'APPROVED' ? '已签章' : '正常归档'}
                              </span>
                            </div>

                            <h4
                              onClick={() => setPreviewReport(rep)}
                              className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              {rep.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                              {rep.summary}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setPreviewReport(rep)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              title="在线高保真预览"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>预览</span>
                            </button>

                            <button
                              onClick={() => handleDownloadReport(rep)}
                              disabled={isDownloading}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="下载报告文档"
                            >
                              {isDownloading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                              ) : (
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                              )}
                              <span>下载</span>
                            </button>

                            <button
                              onClick={() => handleExportExcelFormat(rep)}
                              className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              title="导出为 CSV/Excel 数据表"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`确定要删除报告《${rep.title}》吗？`)) {
                                  deleteReportFromCenter(rep.id);
                                  showToast('报告已删除');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="删除此报告"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* KPIs Chips row */}
                        {rep.kpis && rep.kpis.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-slate-100 text-[11px]">
                            {rep.kpis.slice(0, 4).map((kpi, kIdx) => (
                              <div
                                key={kIdx}
                                className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 font-mono flex items-center gap-1"
                              >
                                <span className="text-slate-400 font-sans">{kpi.label}:</span>
                                <strong className="text-slate-900">{kpi.value}</strong>
                                {kpi.benchmark && (
                                  <span className="text-[10px] text-slate-400">({kpi.benchmark})</span>
                                )}
                              </div>
                            ))}
                            <div className="ml-auto text-[10px] text-slate-400 font-mono">
                              周期: {rep.period} · {rep.createdTime}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= 2. 全量报告明细表视图 (All Reports Table View) ================= */
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Site selector dropdown / badge */}
              {!lockSite ? (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">站点:</span>
                  <select
                    value={tableSiteFilter}
                    onChange={e => setTableSiteFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="ALL">全网所有站点</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.siteName} ({s.siteCode})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 text-blue-800 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>站点: {activeSite.siteName}</span>
                </div>
              )}

              {/* Category selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">类型:</span>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-800 focus:outline-none"
                >
                  <option value="ALL">全部业务类型</option>
                  <option value="AVAILABILITY_SLA">SLA可用度履约</option>
                  <option value="PERFORMANCE_CONDITION">性能工况体检</option>
                  <option value="FLEXIBLE_WARRANTY">灵活质保SOH</option>
                  <option value="SITE_LEDGER">站点台账档案</option>
                  <option value="FAULT_DIAGNOSIS">AI故障诊断</option>
                </select>
              </div>

              {/* Search text */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索报告编号/标题/站点..."
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 w-52 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Batch Action Buttons */}
            {selectedReportIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in duration-150">
                <span className="text-xs text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded">
                  已勾选 {selectedReportIds.length} 份
                </span>
                <button
                  onClick={handleBatchDownload}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  批量打包下载
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer"
                >
                  批量删除
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredAllReports.length > 0 &&
                        selectedReportIds.length === filteredAllReports.length
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedReportIds(filteredAllReports.map(r => r.id));
                        } else {
                          setSelectedReportIds([]);
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">报告编号 & 标题</th>
                  <th className="py-2.5 px-3">归属站点</th>
                  <th className="py-2.5 px-3">业务类别</th>
                  <th className="py-2.5 px-3">考核周期</th>
                  <th className="py-2.5 px-3">核心指标</th>
                  <th className="py-2.5 px-3">格式与大小</th>
                  <th className="py-2.5 px-3">编制人与时间</th>
                  <th className="py-2.5 px-3">状态</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllReports.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      未检索到匹配的报告归档记录
                    </td>
                  </tr>
                ) : (
                  filteredAllReports.map(rep => {
                    const badge = getCategoryBadge(rep.category);
                    const isSelected = selectedReportIds.includes(rep.id);

                    return (
                      <tr
                        key={rep.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedReportIds(prev =>
                                prev.includes(rep.id)
                                  ? prev.filter(id => id !== rep.id)
                                  : [...prev, rep.id]
                              );
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 max-w-xs">
                          <div className="font-mono text-[10px] text-slate-400">{rep.reportNo}</div>
                          <div
                            onClick={() => setPreviewReport(rep)}
                            className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer truncate"
                          >
                            {rep.title}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{rep.siteName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rep.siteCode}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                          {rep.period}
                        </td>
                        <td className="py-2.5 px-3">
                          {rep.kpis && rep.kpis[0] ? (
                            <span className="text-[11px] font-mono font-bold text-slate-800">
                              {rep.kpis[0].label}: {rep.kpis[0].value}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                          {rep.format} ({rep.fileSize})
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-slate-700">{rep.author}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rep.createdTime}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                              rep.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rep.status === 'APPROVED' ? '已签章' : '已归档'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setPreviewReport(rep)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs cursor-pointer"
                          >
                            预览
                          </button>
                          <button
                            onClick={() => handleDownloadReport(rep)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold cursor-pointer"
                          >
                            下载
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`确定要删除报告《${rep.title}》吗？`)) {
                                deleteReportFromCenter(rep.id);
                                showToast('报告已删除');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 3. 新建评估报告向导模态框 ================= */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  新建站点评估报告向导 ({moduleConfig.title})
                </h3>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  目标储能站点 <span className="text-rose-500">*</span>
                </label>
                {lockSite ? (
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold flex items-center justify-between">
                    <span>{activeSite.siteName} ({activeSite.siteCode})</span>
                    <span className="text-[11px] font-normal text-slate-500">{activeSite.capacityMw}MW · {activeSite.region}</span>
                  </div>
                ) : (
                  <select
                    value={newReportTargetSiteId}
                    onChange={e => setNewReportTargetSiteId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.siteName} ({s.siteCode} · {s.capacityMw}MW · {s.region})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  选择报告评估模板 <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'AVAILABILITY_SLA',
                      title: 'SLA可用度履约考核报告',
                      desc: '等效PCS中断小时、违约索赔风险、可用度达标率核算'
                    },
                    {
                      id: 'PERFORMANCE_CONDITION',
                      title: '性能工况深度体检报告',
                      desc: '综合RTE能效、PACK一致性、容量保持率、热场温升'
                    },
                    {
                      id: 'FLEXIBLE_WARRANTY',
                      title: '灵活质保SOH评估报告',
                      desc: '双衰减曲线拟合、日超工况积分、动力学寿命折算'
                    },
                    {
                      id: 'SITE_LEDGER',
                      title: '站点资产台账与设备档案',
                      desc: '设备全生命周期记录、核心部件四遥接入、冗余架构'
                    }
                  ].map(tmpl => (
                    <div
                      key={tmpl.id}
                      onClick={() => setNewReportCategory(tmpl.id as ReportCategory)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        newReportCategory === tmpl.id
                          ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/20'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{tmpl.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {tmpl.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">考核与评估周期</label>
                  <select
                    value={newReportPeriod}
                    onChange={e => setNewReportPeriod(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="2026-08 (当期累计)">2026年08月 (当期累计)</option>
                    <option value="2026-07 (自然月)">2026年07月 (整月闭环)</option>
                    <option value="2026年度累计">2026年度累计 (工况总账)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">编制工程师</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.name} (${currentUser.roleTitle})`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">技术备注与编制说明</label>
                <textarea
                  rows={2}
                  placeholder="可输入本期工况数据说明、调峰工况异常或特殊调优要求..."
                  value={newReportNotes}
                  onChange={e => setNewReportNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>正在调用算法模型计算并排版...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>立即生成并归档至报告中心</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 4. 高保真专业报告在线预览模态框 ================= */}
      {previewReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {previewReport.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    档案编号: {previewReport.reportNo} · 版本: {previewReport.version}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Report Content */}
            <div className="overflow-y-auto flex-1 text-xs space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans">
              {/* Cover title and metadata */}
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono mb-1">
                  {previewReport.categoryName} · 正式技术归档
                </div>
                <h2 className="text-lg font-black text-slate-900">{previewReport.title}</h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  生成时间: {previewReport.createdTime} · 编制人员: {previewReport.author} · 归属站点: {previewReport.siteName}
                </p>
              </div>

              {/* Section 1: Site assets and contract baseline */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-bold text-blue-800 text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  一、 站点资产档案与基准合同概况
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 font-mono">
                  <div>站点名称: <strong className="text-slate-800">{previewReport.siteName}</strong></div>
                  <div>站点编码: <strong className="text-slate-800">{previewReport.siteCode}</strong></div>
                  <div>所在大区: <strong className="text-slate-800">{previewReport.region}</strong></div>
                  <div>考核周期: <strong className="text-slate-800">{previewReport.period}</strong></div>
                </div>
              </div>

              {/* Section 2: Core KPIs */}
              {previewReport.kpis && previewReport.kpis.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-blue-800 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    二、 关键执行指标与基准工况对比 (KPIs)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {previewReport.kpis.map((kpi, kIdx) => (
                      <div
                        key={kIdx}
                        className="bg-white p-3 rounded-lg border border-slate-200 space-y-1"
                      >
                        <div className="text-[10px] text-slate-500 font-medium">{kpi.label}</div>
                        <div
                          className={`text-lg font-black font-mono ${
                            kpi.status === 'success'
                              ? 'text-emerald-700'
                              : kpi.status === 'danger'
                              ? 'text-rose-700'
                              : kpi.status === 'warning'
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {kpi.value}
                        </div>
                        {kpi.benchmark && (
                          <div className="text-[9px] text-slate-400 font-mono">
                            基准要求: {kpi.benchmark}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Summary and Physical Analysis */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-bold text-blue-800 text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  三、 执行摘要与工况分析结论
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                  {previewReport.summary}
                </p>

                {previewReport.diagnostics && previewReport.diagnostics.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="font-bold text-slate-800 text-[11px]">关键诊断与机理说明:</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
                      {previewReport.diagnostics.map((diag, dIdx) => (
                        <li key={dIdx}>{diag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Section 4: Engineering recommendations */}
              {previewReport.recommendations && previewReport.recommendations.length > 0 && (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <h4 className="font-bold text-blue-800 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    四、 工程运维与调优建议
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    {previewReport.recommendations.map((rec, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official Seal / Signature block */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>审核机构: <strong className="text-slate-800">{previewReport.approvalDept || '能源工程技术委员会'}</strong></div>
                  <div>签发签署: <strong className="text-slate-800">{previewReport.approvalSigner || '陈建华 (首席可靠性算法专家)'}</strong></div>
                  <div>签章日期: <span className="font-mono">{previewReport.approvalTime || previewReport.createdTime}</span></div>
                </div>

                <div className="w-24 h-24 border-2 border-red-500 rounded-full flex flex-col items-center justify-center text-red-600 transform -rotate-12 select-none shadow-xs">
                  <div className="text-[8px] font-bold tracking-widest uppercase">能源技术委员会</div>
                  <div className="text-[13px] font-black border-y border-red-500 my-0.5 py-0.5 px-1 tracking-wider">正式归档</div>
                  <div className="text-[7px] font-mono">APPROVED</div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500 font-mono">
                文件大小: {previewReport.fileSize} · 状态: {previewReport.status}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportExcelFormat(previewReport)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>导出为 Excel (CSV)</span>
                </button>

                <button
                  onClick={() => handleDownloadReport(previewReport)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出为 PDF 报告</span>
                </button>

                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
