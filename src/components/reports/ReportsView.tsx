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
  Share2,
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
  SlidersHorizontal,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  Radio,
  FileCheck2,
  History
} from 'lucide-react';
import {
  getDefaultContractBaseline,
  DEFAULT_SOH_BASELINE_CURVE,
  generateStationDailyAndMonthlyData,
  calculateFlexibleWarrantySohAlgorithm
} from '../../utils/flexibleWarrantyAlgorithm';
import { exportFlexibleWarrantyPdfReport } from '../../utils/flexibleWarrantyPdfReport';

export const ReportsView: React.FC = () => {
  const {
    sites,
    reportCenterItems,
    addReportToCenter,
    deleteReportFromCenter,
    batchDeleteReportsFromCenter,
    selectedReportSiteFilter,
    setSelectedReportSiteFilter,
    selectedReportCategoryFilter,
    setSelectedReportCategoryFilter,
    currentUser
  } = useApp();

  // 视图模式: 'site_centric' (按站点维度管理) | 'table' (全网报告列表视图)
  const [viewMode, setViewMode] = useState<'site_centric' | 'table'>('site_centric');

  // 当前选中的焦点站点 (站点维度管理视角)
  const [activeSiteId, setActiveSiteId] = useState<string>(() => {
    if (selectedReportSiteFilter && selectedReportSiteFilter !== 'ALL') {
      return selectedReportSiteFilter;
    }
    return sites[0]?.id || 'site-001';
  });

  // 筛选与搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedReportCategoryFilter || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  // 表格多选
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  // 弹窗状态
  const [previewReport, setPreviewReport] = useState<ReportCenterItem | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 新建报告向导表单状态
  const [newReportTargetSiteId, setNewReportTargetSiteId] = useState<string>(activeSiteId || sites[0]?.id || 'site-001');
  const [newReportCategory, setNewReportCategory] = useState<ReportCategory>('FLEXIBLE_WARRANTY');
  const [newReportPeriod, setNewReportPeriod] = useState<string>('2026-08 (当期累计)');
  const [newReportNotes, setNewReportNotes] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 站点列表与其拥有的报告数量映射
  const siteReportsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    reportCenterItems.forEach(item => {
      if (item.siteId) {
        map.set(item.siteId, (map.get(item.siteId) || 0) + 1);
      }
    });
    return map;
  }, [reportCenterItems]);

  // 全网指标统计
  const metricsOverview = useMemo(() => {
    const totalReports = reportCenterItems.length;
    const coveredSiteIds = new Set(reportCenterItems.filter(r => r.siteId && r.siteId !== 'ALL').map(r => r.siteId));
    const flexibleReports = reportCenterItems.filter(r => r.category === 'FLEXIBLE_WARRANTY').length;
    const currentMonthReports = reportCenterItems.filter(r => r.period.includes('2026-08')).length;
    const approvedReports = reportCenterItems.filter(r => r.status === 'APPROVED').length;

    return {
      totalReports,
      coveredSitesCount: coveredSiteIds.size,
      totalSitesCount: sites.length,
      siteCoverageRate: sites.length > 0 ? Math.round((coveredSiteIds.size / sites.length) * 100) : 0,
      flexibleReports,
      currentMonthReports,
      approvedReports
    };
  }, [reportCenterItems, sites]);

  // 当前选中站点对象
  const activeSite = useMemo(() => {
    return sites.find(s => s.id === activeSiteId) || sites[0];
  }, [sites, activeSiteId]);

  // 站点专属的历史报告列表
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

  // 全量过滤后的历史报告列表 (表格模式)
  const filteredAllReports = useMemo(() => {
    return reportCenterItems.filter(item => {
      // 站点筛选
      const matchSite = selectedReportSiteFilter === 'ALL' || item.siteId === selectedReportSiteFilter;
      // 类别筛选
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      // 状态筛选
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      // 周期筛选
      const matchPeriod = periodFilter === 'ALL' || item.period.includes(periodFilter);
      // 区域筛选
      const matchRegion = regionFilter === 'ALL' || item.region === regionFilter;
      // 文本搜索
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reportNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSite && matchCategory && matchStatus && matchPeriod && matchRegion && matchSearch;
    });
  }, [
    reportCenterItems,
    selectedReportSiteFilter,
    categoryFilter,
    statusFilter,
    periodFilter,
    regionFilter,
    searchQuery
  ]);

  // 触发单份报告下载 (真实导出 PDF)
  const handleDownloadReport = async (report: ReportCenterItem) => {
    try {
      setDownloadingReportId(report.id);
      const targetSite = sites.find(s => s.id === report.siteId) || sites[0];

      if (report.category === 'FLEXIBLE_WARRANTY' && targetSite) {
        // 调用标准灵活质保 PDF 渲染导出引擎
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
        // 模拟其他标准报告下载
        const blob = new Blob(
          [
            `【能源技术中心标准报告归档档案】\n` +
            `报告编号: ${report.reportNo}\n` +
            `报告标题: ${report.title}\n` +
            `归属站点: ${report.siteName} (${report.siteCode})\n` +
            `业务类型: ${report.categoryName}\n` +
            `考核周期: ${report.period}\n` +
            `编制人员: ${report.author}\n` +
            `签章机构: ${report.approvalDept || '能源工程技术委员会'}\n\n` +
            `【执行摘要】\n${report.summary}\n\n` +
            `【核心指标】\n` +
            report.kpis.map(k => `- ${k.label}: ${k.value} (基准: ${k.benchmark || 'N/A'})`).join('\n') +
            `\n\n【诊断说明】\n` +
            (report.diagnostics || []).map((d, i) => `${i + 1}. ${d}`).join('\n') +
            `\n\n【调优建议】\n` +
            (report.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join('\n')
          ],
          { type: 'text/plain;charset=utf-8' }
        );
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

  // 批量下载
  const handleBatchDownload = () => {
    if (selectedReportIds.length === 0) {
      showToast('请先勾选需要下载的报告');
      return;
    }
    showToast(`正在批量打包下载选中的 ${selectedReportIds.length} 份报告文档...`);
    setTimeout(() => {
      showToast(`已完成 ${selectedReportIds.length} 份历史报告打包导出！`);
      setSelectedReportIds([]);
    }, 1500);
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedReportIds.length === 0) return;
    if (window.confirm(`确定要从报告中心删除选中的 ${selectedReportIds.length} 份报告归档吗？`)) {
      batchDeleteReportsFromCenter(selectedReportIds);
      setSelectedReportIds([]);
      showToast('已成功批量删除选中的报告记录');
    }
  };

  // 重新测算并生成该站点的最新版本报告
  const handleRegenerateForSite = (siteObj: Site) => {
    const baseline = getDefaultContractBaseline(siteObj.id, siteObj.capacityMw ? siteObj.capacityMw * 2 : 20.0);
    const { daily, monthly } = generateStationDailyAndMonthlyData(siteObj.id, baseline);
    const sohResult = calculateFlexibleWarrantySohAlgorithm(baseline, DEFAULT_SOH_BASELINE_CURVE, monthly, daily);

    const newReport = addReportToCenter({
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
      author: `${currentUser.name} (算法重新标定)`,
      version: 'v2.2 (最新)',
      status: 'APPROVED',
      summary: `基于最新站级工况重新测算，当前灵活估算SOH为 ${sohResult.currentFlexibleSoh.toFixed(2)}%，相比基准曲线保证值 (${sohResult.currentBaselineSoh.toFixed(2)}%) 裕度为 ${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin.toFixed(2)}%，月度等效循环 ${monthly.reduce((s, m) => s + m.actualEfc, 0).toFixed(1)} EFC。`,
      kpis: [
        { label: '灵活估算SOH', value: `${sohResult.currentFlexibleSoh.toFixed(2)}%`, benchmark: '95.40%', status: 'success' },
        { label: '基准偏离裕度', value: `${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin.toFixed(2)}%`, benchmark: '≥0.00%', status: 'success' },
        { label: '超工况天数', value: `${daily.filter(d => d.isOverCondition).length} 天`, benchmark: '≤5天/月', status: daily.filter(d => d.isOverCondition).length > 5 ? 'warning' : 'success' },
        { label: '累计等效循环 (EFC)', value: `${monthly.reduce((s, m) => s + m.actualEfc, 0).toFixed(1)} 次`, benchmark: '30.0 次', status: 'info' },
        { label: '平均工作温度', value: `${(monthly[0]?.avgTemp || 25.0).toFixed(1)} ℃`, benchmark: '25.0 ℃', status: 'info' }
      ],
      diagnostics: [
        '已重新校准电池簇极化阻抗偏离，未发现电芯快速析锂不可逆衰减。',
        '月度综合能量效率保持在 91.2%，温升受控。'
      ],
      recommendations: [
        '维持当前平滑充放电调度策略。',
        '建议在下个周期微调液冷温控启动阈值。'
      ]
    });

    showToast(`已成功为《${siteObj.siteName}》重新生成并归档最新评估报告！`);
    setPreviewReport(newReport);
  };

  // 表单向导提交创建新报告
  const handleCreateNewReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const targetSite = sites.find(s => s.id === newReportTargetSiteId) || sites[0];

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
        generatedSummary = `针对全站设备进行完整健康度与性能工况深度扫描，综合性能得分 93.6 分，容量保持率 97.4%，热场一致性优良。`;
        generatedKpis = [
          { label: '综合性能得分', value: '93.6 分', benchmark: '85.0 分', status: 'success' as const },
          { label: '容量保持率', value: '97.40%', benchmark: '95.00%', status: 'success' as const },
          { label: '簇间压差离散度', value: '24 mV', benchmark: '≤50 mV', status: 'success' as const }
        ];
      } else {
        generatedSummary = `本考核周期内站点可用度稳定达标，实测综合可用度 99.64%，超越合同 SLA 承诺基线 (99.50%) 0.14 个百分点。`;
        generatedKpis = [
          { label: '当期实测可用度', value: '99.64%', benchmark: '99.50%', status: 'success' as const },
          { label: 'SLA达标差额', value: '+0.14%', benchmark: '≥0.00%', status: 'success' as const },
          { label: '等效停运时长', value: '0 分钟', benchmark: '≤30分钟', status: 'success' as const }
        ];
      }

      const reportNames: Record<ReportCategory, string> = {
        FLEXIBLE_WARRANTY: '灵活质保工况与SOH衰减综合评估报告',
        PERFORMANCE_CONDITION: '性能工况月度深度体检分析报告',
        AVAILABILITY_SLA: 'SLA可用度履约与运行考核月报',
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
        fileSize: '3.7 MB',
        author: `${currentUser.name} (${currentUser.roleTitle})`,
        version: 'v1.0',
        status: 'APPROVED',
        summary: generatedSummary,
        kpis: generatedKpis,
        diagnostics: [
          '数据链路完整，高频工况日志采集完整度达 100%。',
          newReportNotes || '各项运行参数处于标称稳定受控区间。'
        ],
        recommendations: [
          '建议维持现有运行策略，定期跟进SOH与可用度打点趋势。'
        ]
      });

      setIsGenerateModalOpen(false);
      showToast(`已成功为《${targetSite.siteName}》生成并归档新报告！`);
      setPreviewReport(newReport);
      setActiveSiteId(targetSite.id);
    }, 700);
  };

  const getCategoryBadge = (category: ReportCategory) => {
    switch (category) {
      case 'FLEXIBLE_WARRANTY':
        return {
          label: '灵活质保SOH',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'PERFORMANCE_CONDITION':
        return {
          label: '性能工况体检',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'AVAILABILITY_SLA':
        return {
          label: 'SLA可用度履约',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'SITE_LEDGER':
        return {
          label: '站点台账档案',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'FAULT_DIAGNOSIS':
        return {
          label: 'AI故障诊断',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'PRE_CONTRACT_EVAL':
        return {
          label: '售前签约评估',
          className: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      default:
        return {
          label: '综合报告',
          className: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200 pb-16">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Global Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_right,_rgba(59,130,246,0.15),_transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-md">
                <FolderKanban className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono tracking-wider">
                STATION REPORT CENTER
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                站点维度归档管理 · 统一质保与可用度档案库
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              能源电站评估与质保报告管理中心
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              集中存储和管理全网历史上所有生成的《灵活质保SOH评估报告》、《性能工况体检月报》、《SLA可用度履约分析报告》与《AI故障诊断报告》，支持按照站点维度进行历史版本归档、在线高清预览、真实 PDF 导出及重新标定测算。
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
            <button
              onClick={() => {
                setNewReportTargetSiteId(activeSiteId);
                setIsGenerateModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新建智能评估报告</span>
            </button>

            {/* View Mode Switcher */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setViewMode('site_centric')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'site_centric'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>按站点维度管理</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>全网报告大表 ({filteredAllReports.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Metrics Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-5 border-t border-blue-900/60">
          <div className="bg-slate-900/80 rounded-xl p-3 border border-blue-900/40">
            <div className="text-[11px] text-blue-300 font-medium flex items-center justify-between">
              <span>历史归档报告总数</span>
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {metricsOverview.totalReports} <span className="text-xs font-normal text-slate-400">份</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-blue-900/40">
            <div className="text-[11px] text-blue-300 font-medium flex items-center justify-between">
              <span>报告纳管覆盖站点</span>
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1 flex items-baseline gap-1.5">
              <span>{metricsOverview.coveredSitesCount} / {metricsOverview.totalSitesCount}</span>
              <span className="text-xs font-semibold text-emerald-400">({metricsOverview.siteCoverageRate}%)</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-blue-900/40">
            <div className="text-[11px] text-emerald-300 font-medium flex items-center justify-between">
              <span>灵活质保评估报告</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
              {metricsOverview.flexibleReports} <span className="text-xs font-normal text-slate-400">份</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-blue-900/40">
            <div className="text-[11px] text-blue-300 font-medium flex items-center justify-between">
              <span>2026年8月当期报告</span>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {metricsOverview.currentMonthReports} <span className="text-xs font-normal text-slate-400">份</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-blue-900/40">
            <div className="text-[11px] text-indigo-300 font-medium flex items-center justify-between">
              <span>已签章生效档案</span>
              <Award className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black font-mono text-indigo-200 mt-1">
              {metricsOverview.approvedReports} <span className="text-xs font-normal text-slate-400">份</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 主体展示区域 */}
      {viewMode === 'site_centric' ? (
        /* ================= 模式一：按站点维度管理 (Site-Centric Explorer) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 左侧：站点选择侧边栏与报告指标统计 */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>储能站点档案导航</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  共 {sites.length} 站
                </span>
              </div>

              {/* 站点搜索框 */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索站点名称或编号..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* 站点列表卡片 */}
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {sites
                  .filter(s =>
                    !searchQuery ||
                    s.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.siteCode.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(siteItem => {
                    const count = siteReportsCountMap.get(siteItem.id) || 0;
                    const isSelected = siteItem.id === activeSiteId;

                    return (
                      <div
                        key={siteItem.id}
                        onClick={() => {
                          setActiveSiteId(siteItem.id);
                          setSelectedReportSiteFilter(siteItem.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  siteItem.statusLamp === 'green'
                                    ? 'bg-emerald-500 ring-2 ring-emerald-200'
                                    : siteItem.statusLamp === 'yellow'
                                    ? 'bg-amber-500 ring-2 ring-amber-200'
                                    : 'bg-rose-500 ring-2 ring-rose-200'
                                }`}
                              />
                              <span className="truncate">{siteItem.siteName}</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              {siteItem.siteCode} · {siteItem.region}
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono shrink-0 ${
                              count > 0
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {count} 份报告
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 font-mono">
                          <span>容量: {siteItem.capacityMw} MW</span>
                          <span className="text-slate-600">SLA: {siteItem.slaThreshold}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* 右侧：当前选中站点的专属历史报告归档库 */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* 站点详情横幅与操作工具栏 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      站点专属报告档案库
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      编码: {activeSite?.siteCode}
                    </span>
                    <span className="text-xs text-slate-500">
                      区域: {activeSite?.region} ({activeSite?.representativeOffice})
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{activeSite?.siteName}</span>
                    <span className="text-xs font-medium text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      客户: {activeSite?.customer}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                  <button
                    onClick={() => handleRegenerateForSite(activeSite)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    title="根据最新工况重新计算并生成一份最新报告"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>一键重新测算并生成报告</span>
                  </button>

                  <button
                    onClick={() => {
                      setNewReportTargetSiteId(activeSite.id);
                      setIsGenerateModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>生成自定义报告</span>
                  </button>
                </div>
              </div>

              {/* 筛选标签栏 */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-slate-400" /> 报告类别:
                  </span>
                  {[
                    { id: 'ALL', label: '全部类别' },
                    { id: 'FLEXIBLE_WARRANTY', label: '灵活质保SOH评估' },
                    { id: 'PERFORMANCE_CONDITION', label: '性能工况体检' },
                    { id: 'AVAILABILITY_SLA', label: 'SLA可用度履约' },
                    { id: 'FAULT_DIAGNOSIS', label: '故障诊断报告' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCategoryFilter(tab.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        categoryFilter === tab.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  该站点共归档 <strong>{activeSiteReports.length}</strong> 份历史评估文档
                </div>
              </div>
            </div>

            {/* 报告卡片列表 (站点维度历史时间线) */}
            {activeSiteReports.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">暂无该类别的历史报告记录</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  该站点尚未生成此类评估报告，您可以点击上方「一键重新测算并生成报告」基于工况日志智能创建。
                </p>
                <button
                  onClick={() => handleRegenerateForSite(activeSite)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>立即生成灵活质保评估报告</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeSiteReports.map((report, idx) => {
                  const badge = getCategoryBadge(report.category);
                  const isDownloading = downloadingReportId === report.id;

                  return (
                    <div
                      key={report.id}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      {/* 报告头部 */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              版本: {report.version}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              编号: {report.reportNo}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              周期: {report.period}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                            {report.title}
                          </h3>
                        </div>

                        {/* 状态与格式标签 */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {report.status === 'APPROVED' ? '已签章归档' : '正常有效'}
                          </span>
                          <span className="px-2 py-1 rounded-lg text-xs font-mono bg-slate-100 text-slate-600">
                            {report.format} ({report.fileSize})
                          </span>
                        </div>
                      </div>

                      {/* 核心指标 Mini 网格 */}
                      {report.kpis && report.kpis.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          {report.kpis.map((kpi, kIdx) => (
                            <div key={kIdx} className="space-y-0.5">
                              <div className="text-[10px] text-slate-500 font-medium truncate">
                                {kpi.label}
                              </div>
                              <div
                                className={`text-sm font-black font-mono ${
                                  kpi.status === 'success'
                                    ? 'text-emerald-700'
                                    : kpi.status === 'warning'
                                    ? 'text-amber-700'
                                    : kpi.status === 'danger'
                                    ? 'text-rose-700'
                                    : 'text-slate-900'
                                }`}
                              >
                                {kpi.value}
                              </div>
                              {kpi.benchmark && (
                                <div className="text-[9px] text-slate-400 font-mono">
                                  基准: {kpi.benchmark}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 摘要说明 */}
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/40 p-2.5 rounded-lg border border-slate-100">
                        {report.summary}
                      </p>

                      {/* 底部信息与操作按钮 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            生成时间: {report.createdTime}
                          </span>
                          <span>编制人: {report.author}</span>
                          {report.approvalSigner && (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              签章人: {report.approvalSigner}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setPreviewReport(report)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>在线预览</span>
                          </button>

                          <button
                            onClick={() => handleDownloadReport(report)}
                            disabled={isDownloading}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                            <span>{isDownloading ? '正在生成并下载...' : '下载 PDF 报告'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`确定要删除报告《${report.title}》吗？`)) {
                                deleteReportFromCenter(report.id);
                                showToast('报告已成功删除');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="删除报告"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= 模式二：全网报告大表视图 (Global Filterable Table Mode) ================= */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
          {/* 筛选过滤工具栏 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 站点筛选 */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">选择目标站点</label>
              <select
                value={selectedReportSiteFilter}
                onChange={e => setSelectedReportSiteFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
              >
                <option value="ALL">全网站点 (全部)</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.siteName} ({s.siteCode})
                  </option>
                ))}
              </select>
            </div>

            {/* 报告类别筛选 */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">报告业务类别</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
              >
                <option value="ALL">全部业务类别</option>
                <option value="FLEXIBLE_WARRANTY">灵活质保SOH评估报告</option>
                <option value="PERFORMANCE_CONDITION">性能工况深度体检报告</option>
                <option value="AVAILABILITY_SLA">可用度监控与SLA履约月报</option>
                <option value="FAULT_DIAGNOSIS">核心设备异常与故障诊断报告</option>
                <option value="PRE_CONTRACT_EVAL">售前签约前可用度评估意见书</option>
              </select>
            </div>

            {/* 周期筛选 */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">评估周期</label>
              <select
                value={periodFilter}
                onChange={e => setPeriodFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
              >
                <option value="ALL">全部周期</option>
                <option value="2026-08">2026年08月 (当期)</option>
                <option value="2026-07">2026年07月</option>
                <option value="2026年度">2026年度累计</option>
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">归档签章状态</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
              >
                <option value="ALL">全部状态</option>
                <option value="APPROVED">已签章生效 (APPROVED)</option>
                <option value="VALID">正常有效 (VALID)</option>
                <option value="ARCHIVED">历史封存 (ARCHIVED)</option>
              </select>
            </div>

            {/* 搜索框 */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">关键词搜索</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索报告标题、编号或编制人..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* 批量操作工具栏 */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono">
                检索到 <strong>{filteredAllReports.length}</strong> 份报告档案
              </span>
              {selectedReportIds.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold font-mono text-[11px]">
                  已勾选 {selectedReportIds.length} 份
                </span>
              )}
            </div>

            {selectedReportIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchDownload}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>批量打包下载</span>
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>批量删除</span>
                </button>
              </div>
            )}
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
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
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3 px-4">报告标题与编号</th>
                  <th className="py-3 px-3">归属站点与区域</th>
                  <th className="py-3 px-3">业务类别</th>
                  <th className="py-3 px-3">考核周期</th>
                  <th className="py-3 px-3">核心性能指标</th>
                  <th className="py-3 px-3">格式与大小</th>
                  <th className="py-3 px-3">编制人 / 生成时间</th>
                  <th className="py-3 px-3">状态</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllReports.map(rep => {
                  const badge = getCategoryBadge(rep.category);
                  const isChecked = selectedReportIds.includes(rep.id);
                  const isDownloading = downloadingReportId === rep.id;

                  return (
                    <tr
                      key={rep.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isChecked ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedReportIds(prev => [...prev, rep.id]);
                            } else {
                              setSelectedReportIds(prev => prev.filter(id => id !== rep.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{rep.title}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {rep.reportNo} · {rep.version}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{rep.siteName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {rep.siteCode} · {rep.region}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono">
                        {rep.period}
                      </td>

                      <td className="py-3 px-3">
                        {rep.kpis && rep.kpis[0] ? (
                          <div className="text-[11px] font-mono font-bold text-emerald-700">
                            {rep.kpis[0].label}: {rep.kpis[0].value}
                            {rep.kpis[1] && (
                              <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                                ({rep.kpis[1].label} {rep.kpis[1].value})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                        <span className="font-bold text-slate-800">{rep.format}</span>{' '}
                        <span className="text-slate-500">({rep.fileSize})</span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        <div>{rep.author}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rep.createdTime}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            rep.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rep.status === 'APPROVED' ? '已签章' : '正常'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setPreviewReport(rep)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
                        >
                          <Eye className="w-3 h-3 inline mr-1 text-slate-500" />
                          预览
                        </button>
                        <button
                          onClick={() => handleDownloadReport(rep)}
                          disabled={isDownloading}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold cursor-pointer"
                        >
                          <Download className="w-3 h-3 inline mr-1 text-blue-600" />
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
                          title="删除报告"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
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

      {/* ================= 3. 新建智能评估报告模态框 ================= */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  新建站点评估报告向导
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
                  选择目标储能站点 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newReportTargetSiteId}
                  onChange={e => setNewReportTargetSiteId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} ({s.siteCode} · {s.capacityMw}MW)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  选择报告评估模板 <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'FLEXIBLE_WARRANTY',
                      title: '灵活质保SOH评估报告',
                      desc: '双衰减曲线拟合、日超工况积分、动力学寿命折算'
                    },
                    {
                      id: 'PERFORMANCE_CONDITION',
                      title: '性能工况深度体检报告',
                      desc: 'PACK一致性极化偏离、内阻分布、容量保持率'
                    },
                    {
                      id: 'AVAILABILITY_SLA',
                      title: 'SLA可用度履约考核报告',
                      desc: '等效PCS中断小时、违约索赔风险、SLA达标率'
                    },
                    {
                      id: 'FAULT_DIAGNOSIS',
                      title: '设备故障与AI根因报告',
                      desc: '单站核心设备告警时间线、逆变器/BMS诊断结论'
                    }
                  ].map(tmpl => (
                    <div
                      key={tmpl.id}
                      onClick={() => setNewReportCategory(tmpl.id as ReportCategory)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        newReportCategory === tmpl.id
                          ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500/20'
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
            {/* 模态框顶部栏 */}
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

            {/* 报告正文预览 (滚动区域，结构严整) */}
            <div className="overflow-y-auto flex-1 text-xs space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans">
              {/* 封面标题与编制信息 */}
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono mb-1">
                  {previewReport.categoryName} · 正式评估档案
                </div>
                <h2 className="text-lg font-black text-slate-900">{previewReport.title}</h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  生成时间: {previewReport.createdTime} · 编制人员: {previewReport.author} · 归属站点: {previewReport.siteName}
                </p>
              </div>

              {/* 一、 站点档案与合同基准 */}
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

              {/* 二、 核心性能指标看板 */}
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
                              : kpi.status === 'warning'
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {kpi.value}
                        </div>
                        {kpi.benchmark && (
                          <div className="text-[9px] text-slate-400 font-mono">
                            合同保证值: {kpi.benchmark}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 三、 综合执行摘要 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-blue-800 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  三、 运行工况与SOH衰减综合判定结论
                </h4>
                <p className="text-slate-700 text-xs leading-relaxed">{previewReport.summary}</p>
              </div>

              {/* 四、 动力学归因与异常分析 */}
              {previewReport.diagnostics && previewReport.diagnostics.length > 0 && (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-amber-800 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    四、 超工况应力提取与电芯老化机理分析
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                    {previewReport.diagnostics.map((diag, dIdx) => (
                      <li key={dIdx}>{diag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 五、 运维调优建议 */}
              {previewReport.recommendations && previewReport.recommendations.length > 0 && (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    五、 运维调优与寿命延长策略建议
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                    {previewReport.recommendations.map((rec, rIdx) => (
                      <li key={rIdx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 六、 签章栏 */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <div>
                  <div>签发部门: <strong>{previewReport.approvalDept || '能源储能质量技术委员会 / 算法工程组'}</strong></div>
                  <div className="text-slate-400 font-mono mt-0.5">签发时间: {previewReport.approvalTime || previewReport.createdTime}</div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">
                    <Award className="w-3.5 h-3.5" />
                    <span>{previewReport.approvalSigner || '陈建华 (首席可靠性算法专家)'} [已电子签章]</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 模态框底部操作栏 */}
            <div className="flex justify-between items-center pt-3.5 border-t border-slate-200 mt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                文件大小: {previewReport.fileSize} · 支持矢量 A4 PDF 打印输出
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  关闭预览
                </button>
                <button
                  onClick={() => {
                    handleDownloadReport(previewReport);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>立即下载 PDF 报告</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
