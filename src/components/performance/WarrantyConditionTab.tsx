import React, { useState, useMemo } from 'react';
import { Site } from '../../types';
import {
  ContractBaselineCondition,
  SohBaselineCurvePoint,
  PackConditionRecord,
  StationDailyCondition,
  StationMonthlyCondition,
  FlexibleWarrantySohResult,
  WarrantyLogFileSummary,
  ContractYearOverConditionSummary,
  InterimYearEndSohAssessment,
  NextYearConditionPlan
} from '../../types/warrantyCondition';
import {
  DEFAULT_SOH_BASELINE_CURVE,
  getDefaultContractBaseline,
  downloadContractBaselineTemplate,
  downloadSohBaselineCurveTemplate,
  parseContractBaselineCsv,
  parseSohBaselineCurveCsv,
  generateSamplePackRecords,
  convertPackToStationSummary,
  generateStationDailyAndMonthlyData,
  calculateFlexibleWarrantySohAlgorithm,
  exportDailyConditionsToCsv,
  calculateContractYearOverCondition,
  performInterimYearEndSohAssessment,
  simulateNextYearConditionPlan
} from '../../utils/flexibleWarrantyAlgorithm';
import { exportFlexibleWarrantyPdfReport } from '../../utils/flexibleWarrantyPdfReport';
import { useApp } from '../../context/AppContext';
import { MonthlyComplianceMatrix } from './MonthlyComplianceMatrix';
import { WarrantyConditionDetailView } from './WarrantyConditionDetailView';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import {
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Layers,
  Thermometer,
  Calendar,
  FileText,
  Clock,
  Cpu,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Maximize2,
  Check,
  FileCheck2,
  FolderKanban,
  Activity,
  X
} from 'lucide-react';

interface WarrantyConditionTabProps {
  site: Site;
  mode?: 'eval' | 'running' | 'contract';
  onNavigateToContractManagement?: () => void;
  onNavigateToRunningData?: () => void;
}

export const WarrantyConditionTab: React.FC<WarrantyConditionTabProps> = ({
  site,
  mode,
  onNavigateToContractManagement,
  onNavigateToRunningData
}) => {
  const { addReportToCenter, navigateToReportsCenter, reportCenterItems } = useApp();
  // 视图切换
  // 0: 双曲线对比与算法估算
  // 1: 合同工况管理 (原合同与SOH基准模版导入)
  // 2: 质保工况数据日志解析与展示
  // 3: PACK级工况换算站级工况
  // 4: 站级月度统计与按天导出
  // 5: 当前合同年超工况统计
  // 6: 年底SOH临时评估与下年工况计划报价
  const [activeSubView, setActiveSubView] = useState<number>(() => {
    if (mode === 'running') return 5;
    if (mode === 'contract') return 1;
    return 0;
  });

  // 当外部 mode 切换时，自动同步对应子视图
  React.useEffect(() => {
    if (mode === 'running') {
      if (activeSubView !== 5 && activeSubView !== 2 && activeSubView !== 3 && activeSubView !== 4) {
        setActiveSubView(5);
      }
    } else if (mode === 'contract') {
      setActiveSubView(1);
    } else if (mode === 'eval') {
      if (activeSubView !== 0 && activeSubView !== 6) {
        setActiveSubView(0);
      }
    }
  }, [mode]);

  // 1. 合同基准工况状态
  const [contractBaseline, setContractBaseline] = useState<ContractBaselineCondition>(() =>
    getDefaultContractBaseline(site.id, site.capacityMw ? site.capacityMw * 2 : 20.0)
  );

  // 2. SOH 基准衰减曲线
  const [sohBaselineCurve, setSohBaselineCurve] = useState<SohBaselineCurvePoint[]>(
    DEFAULT_SOH_BASELINE_CURVE
  );

  // 3. 电池 PACK 级原始日志记录
  const [packRecords, setPackRecords] = useState<PackConditionRecord[]>(() =>
    generateSamplePackRecords(24)
  );
  const [logFileMeta, setLogFileMeta] = useState<WarrantyLogFileSummary>({
    fileName: `${site.siteCode}_WARRANTY_LOG_202608.csv`,
    fileSize: '4.8 MB',
    uploadTime: '2026-08-20 14:32:00',
    rowCount: 28800,
    timeSpan: '2026-08-01 ~ 2026-08-20',
    packCount: 24,
    samplingIntervalSec: 5,
    status: 'PARSED',
    metricsSummary: {
      totalEnergyMwh: 184.5,
      avgTemp: 28.4,
      maxTemp: 38.6,
      maxCrate: 0.68,
      avgDeltaSoc: 4.8,
      overConditionCount: 4
    }
  });

  // 日志解析搜索与筛选
  const [logSearchPack, setLogSearchPack] = useState('');
  const [logFilterOverOnly, setLogFilterOverOnly] = useState(false);

  // 月度履约指标分析与超限考核矩阵联动事件日志的过滤条件 (双向绑定)
  const [matrixFilterMonth, setMatrixFilterMonth] = useState<string | null>(null);
  const [matrixFilterMetricType, setMatrixFilterMetricType] = useState<string | null>(null);

  // 4. 换算后的站级日数据与月度数据
  const { daily: dailyConditions, monthly: monthlyConditions } = useMemo(() => {
    return generateStationDailyAndMonthlyData(site.id, contractBaseline);
  }, [site.id, contractBaseline]);

  // 月度明细展开折叠状态 (key: month string)
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({
    '2026-08': true
  });

  // 5. 算法团队灵活性能保证 SOH 估算结果
  const [isAlgorithmCalculating, setIsAlgorithmCalculating] = useState(false);
  const [algorithmCalcTimestamp, setAlgorithmCalcTimestamp] = useState('2026-08-20 14:35:10');

  const sohResult: FlexibleWarrantySohResult = useMemo(() => {
    return calculateFlexibleWarrantySohAlgorithm(
      contractBaseline,
      sohBaselineCurve,
      monthlyConditions,
      dailyConditions
    );
  }, [contractBaseline, sohBaselineCurve, monthlyConditions, dailyConditions, algorithmCalcTimestamp]);

  // PACK 级换算站级工况摘要
  const packStationSummary = useMemo(() => {
    return convertPackToStationSummary(
      packRecords,
      contractBaseline.ratedEnergyMwh,
      contractBaseline.baselineTempMax,
      contractBaseline.maxCrate
    );
  }, [packRecords, contractBaseline]);

  // 6. 当前合同年超工况统计数据计算
  const [selectedContractYear, setSelectedContractYear] = useState<number>(3); // 默认第3合同年(当前合同年 2026)
  const contractYearSummary: ContractYearOverConditionSummary = useMemo(() => {
    return calculateContractYearOverCondition(
      site.id,
      contractBaseline,
      dailyConditions,
      monthlyConditions
    );
  }, [site.id, contractBaseline, dailyConditions, monthlyConditions]);

  // 7. 年底灵活性能保证 SOH 临时手动评估状态
  const [interventionMode, setInterventionMode] = useState<
    'CURRENT_INERTIA' | 'CONSERVATIVE_PROTECT' | 'AGGRESSIVE_UTILIZATION'
  >('CURRENT_INERTIA');
  const [assessmentTimestamp, setAssessmentTimestamp] = useState<string>('2026-08-20 16:00:00');

  const interimAssessment: InterimYearEndSohAssessment = useMemo(() => {
    return performInterimYearEndSohAssessment(
      site.id,
      contractBaseline,
      sohBaselineCurve,
      dailyConditions,
      monthlyConditions,
      interventionMode
    );
  }, [site.id, contractBaseline, sohBaselineCurve, dailyConditions, monthlyConditions, interventionMode, assessmentTimestamp]);

  // 8. 下一年工况计划、SOH预测与灵活性能保证服务报价测算状态
  const [activePlanType, setActivePlanType] = useState<'CONSERVATIVE' | 'BASELINE' | 'AGGRESSIVE' | 'CUSTOM'>('BASELINE');
  const [customPlanParams, setCustomPlanParams] = useState({
    plannedAnnualCycles: 420,
    plannedMaxCrate: 0.55,
    plannedMaxTemp: 36.0,
    plannedMaxDod: 91.0,
    plannedAvgSoc: 52.0
  });
  const [confirmedPlan, setConfirmedPlan] = useState<NextYearConditionPlan | null>(null);

  const nextYearPlan: NextYearConditionPlan = useMemo(() => {
    return simulateNextYearConditionPlan(
      contractBaseline,
      sohBaselineCurve,
      activePlanType,
      activePlanType === 'CUSTOM' ? customPlanParams : undefined
    );
  }, [contractBaseline, sohBaselineCurve, activePlanType, customPlanParams]);

  // 操作提示消息 (Toast feedback)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 触发临时手动评估重算
  const handleTriggerInterimAssessment = () => {
    setAssessmentTimestamp(new Date().toLocaleString());
    showToast(`已完成第${interimAssessment.contractYear}合同年年底灵活性能保证SOH临时评估：年底预期为 ${interimAssessment.interimEvaluatedYearEndSoh}% (累计超工况折损 -${interimAssessment.deductionBreakdown.totalDeductionPct}%)`);
  };

  // 归档临时手动评估报告
  const handleArchiveInterimAssessment = () => {
    addReportToCenter({
      title: `${site.siteName} 第${interimAssessment.contractYear}合同年年底灵活性能保证SOH临时手动评估表`,
      category: 'FLEXIBLE_WARRANTY',
      categoryName: '临时SOH评估',
      siteId: site.id,
      siteCode: site.siteCode,
      siteName: site.siteName,
      region: site.region,
      period: `${interimAssessment.startDate} ~ ${interimAssessment.todayDate} (年底前预判)`,
      format: 'PDF',
      fileSize: '2.4 MB',
      author: interimAssessment.evaluator,
      status: 'APPROVED',
      version: 'v1.0-Interim',
      summary: `基于合同工况年底预期SOH保证值 (${interimAssessment.contractBaselineExpectedYearEndSoh}%)，结合年初至今实测超工况运行累计折损 (-${interimAssessment.deductionBreakdown.totalDeductionPct}%)，临时评估年底灵活性能保证SOH为 ${interimAssessment.interimEvaluatedYearEndSoh}%。已生成针对性提前加强质保服务处置方案。`,
      kpis: [
        { label: '合同年底保证SOH', value: `${interimAssessment.contractBaselineExpectedYearEndSoh}%`, benchmark: '基准保证', status: 'info' },
        { label: '临时评估年底SOH', value: `${interimAssessment.interimEvaluatedYearEndSoh}%`, benchmark: `${interimAssessment.contractBaselineExpectedYearEndSoh}%`, status: interimAssessment.sohMarginVsBaseline >= 0 ? 'success' : 'warning' },
        { label: '超工况扣减折损', value: `-${interimAssessment.deductionBreakdown.totalDeductionPct}%`, benchmark: '≤0.30%', status: 'warning' },
        { label: '质保服务状态', value: interimAssessment.warrantyHealthLabel, benchmark: '受控达标', status: interimAssessment.sohMarginVsBaseline >= 0 ? 'success' : 'warning' }
      ],
      diagnostics: interimAssessment.proactiveServiceRecommendations.slice(0, 3),
      recommendations: interimAssessment.proactiveServiceRecommendations.slice(1, 4)
    });
    showToast(`《${site.siteName} 年底灵活性能保证SOH临时评估表》已归档至报告中心！`);
  };

  // 确认下一年计划工况与质保服务报价
  const handleConfirmNextYearPlan = () => {
    setConfirmedPlan(nextYearPlan);
    addReportToCenter({
      title: `${site.siteName} ${nextYearPlan.targetYearLabel} 计划工况协议与灵活性能保证服务报价单`,
      category: 'FLEXIBLE_WARRANTY',
      categoryName: '下年工况计划',
      siteId: site.id,
      siteCode: site.siteCode,
      siteName: site.siteName,
      region: site.region,
      period: `${nextYearPlan.targetYearLabel} 规划年度`,
      format: 'PDF',
      fileSize: '3.1 MB',
      author: '质量技术部与客户服务部联合签发',
      status: 'APPROVED',
      version: 'v1.0-Confirmed',
      summary: `已确认 ${nextYearPlan.targetYearLabel} 执行【${nextYearPlan.planName}】：计划年循环 ${nextYearPlan.plannedAnnualCycles} EFC，充放倍率 ${nextYearPlan.plannedMaxCrate}C，预计年底灵活性能保证SOH为 ${nextYearPlan.projectedYearEndFlexibleSoh}%。综合灵活性能保证服务总报价为 ¥${nextYearPlan.servicePricing.totalAnnualServiceFeeWan} 万元/年，客户预期电力现货套利收益 ¥${nextYearPlan.servicePricing.customerExpectedRevenueWan} 万元/年，客户净增益 ¥${nextYearPlan.servicePricing.customerNetGainWan} 万元/年。`,
      kpis: [
        { label: '计划年等效循环', value: `${nextYearPlan.plannedAnnualCycles} 次`, benchmark: '365 次', status: 'info' },
        { label: '预估下年底SOH', value: `${nextYearPlan.projectedYearEndFlexibleSoh}%`, benchmark: `${nextYearPlan.baselineYearEndSoh}%`, status: nextYearPlan.projectedSohDelta >= 0 ? 'success' : 'warning' },
        { label: '质保服务总报价', value: `¥${nextYearPlan.servicePricing.totalAnnualServiceFeeWan}万/年`, benchmark: '标准报价', status: 'info' },
        { label: '客户预期净增益', value: `+¥${nextYearPlan.servicePricing.customerNetGainWan}万/年`, benchmark: '正向增益', status: 'success' }
      ],
      diagnostics: [
        `计划工况加速老化加权指数为 ${nextYearPlan.accelerationFactor}x，电芯温度上限控制在 ${nextYearPlan.plannedMaxTemp}℃。`,
        `服务报价中基础运维保障费 ¥${nextYearPlan.servicePricing.baseServiceFeeWan}万，超工况风险保障附加费 ¥${nextYearPlan.servicePricing.excessStressSurchargeWan}万，容量维护准备金 ¥${nextYearPlan.servicePricing.extendedCapacityReserveWan}万。`
      ],
      recommendations: [
        '计划工况参数已同步写入电站BMS与EMS调度策略系统，于下一合同年首日(2027-01-01)生效。',
        '建议服务组在下合同年开启前完成首批液冷管路保养与电芯阻抗复测。'
      ]
    });
    showToast(`🎉 已成功确认并签署《${nextYearPlan.targetYearLabel} 计划工况与灵活性能保证服务报价单》！`);
  };

  // 触发算法重新估算
  const handleRunAlgorithm = () => {
    setIsAlgorithmCalculating(true);
    setTimeout(() => {
      setIsAlgorithmCalculating(false);
      setAlgorithmCalcTimestamp(new Date().toLocaleString());
      showToast('算法团队灵活性能保证SOH接口调用成功，已根据最新站级超工况更新打点与衰减曲线！');
    }, 700);
  };

  // 导入合同工况 CSV 文件
  const handleImportContractCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const res = parseContractBaselineCsv(text, site.id);
      if (res.success && res.data) {
        setContractBaseline(res.data);
        showToast(`成功导入《合同基准工况》模板！合同编号: ${res.data.contractNo}`);
      } else {
        alert(`导入解析失败: ${res.error || '格式不匹配'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 导入 SOH 基准衰减曲线 CSV
  const handleImportSohCurveCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const res = parseSohBaselineCurveCsv(text);
      if (res.success && res.data) {
        setSohBaselineCurve(res.data);
        showToast(`成功导入《SOH基准衰减曲线》！已加载 ${res.data.length} 个年度保证打点`);
      } else {
        alert(`SOH曲线解析失败: ${res.error || '数据格式异常'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 上传/解析质保工况数据日志
  const handleUploadLogFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 模拟真实日志解析耗时与元数据提取
    setLogFileMeta(prev => ({
      ...prev,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadTime: new Date().toLocaleString(),
      status: 'PARSING'
    }));

    setTimeout(() => {
      const freshPacks = generateSamplePackRecords(24);
      setPackRecords(freshPacks);
      setLogFileMeta({
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadTime: new Date().toLocaleString(),
        rowCount: Math.floor(25000 + Math.random() * 8000),
        timeSpan: '2026-08-01 ~ 2026-08-20',
        packCount: 24,
        samplingIntervalSec: 5,
        status: 'PARSED',
        metricsSummary: {
          totalEnergyMwh: +(180 + Math.random() * 20).toFixed(1),
          avgTemp: +(27.5 + Math.random() * 2).toFixed(1),
          maxTemp: +(37.5 + Math.random() * 2).toFixed(1),
          maxCrate: +(0.62 + Math.random() * 0.1).toFixed(2),
          avgDeltaSoc: +(4.5 + Math.random() * 1.5).toFixed(1),
          overConditionCount: 3
        }
      });
      showToast(`质保工况数据日志《${file.name}》解析完成，已提取 24 组 PACK 高频工况序列！`);
    }, 600);

    e.target.value = '';
  };

  // 快速加载标准样例日志
  const handleLoadSampleLog = () => {
    const freshPacks = generateSamplePackRecords(24);
    setPackRecords(freshPacks);
    setLogFileMeta({
      fileName: `STANDARD_WARRANTY_SAMPLE_${site.siteCode}.csv`,
      fileSize: '5.2 MB',
      uploadTime: new Date().toLocaleString(),
      rowCount: 34560,
      timeSpan: '2026-08-01 ~ 2026-08-20',
      packCount: 24,
      samplingIntervalSec: 5,
      status: 'PARSED',
      metricsSummary: {
        totalEnergyMwh: 192.4,
        avgTemp: 28.2,
        maxTemp: 38.6,
        maxCrate: 0.65,
        avgDeltaSoc: 4.6,
        overConditionCount: 4
      }
    });
    showToast('已加载标准质保工况遥测日志样例，包含真实超温与超倍率记录！');
  };

  // 导出站级日工况与超工况明细 CSV
  const handleExportDailyData = () => {
    exportDailyConditionsToCsv(dailyConditions, site.siteName);
    showToast(`已生成并导出《${site.siteName} 站级日工况与超工况明细.csv》！`);
  };

  // 导出灵活性能保证评估报告为 PDF 文档
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const handleExportPdfReport = async () => {
    try {
      setIsExportingPdf(true);
      await exportFlexibleWarrantyPdfReport({
        site,
        contractBaseline,
        sohResult,
        monthlyConditions,
        dailyConditions,
        sohBaselineCurve
      });

      // 归档至统一历史报告中心
      addReportToCenter({
        title: `${site.siteName} 灵活性能保证工况与SOH衰减综合评估报告 (2026-08)`,
        category: 'FLEXIBLE_WARRANTY',
        categoryName: '灵活性能保证SOH评估',
        siteId: site.id,
        siteCode: site.siteCode,
        siteName: site.siteName,
        region: site.region,
        period: '2026-08 (当期累计)',
        format: 'PDF',
        fileSize: '3.8 MB',
        author: '质量技术部算法工程组',
        status: 'APPROVED',
        version: 'v2.1',
        summary: `基于实测PACK工况数据换算站级工况积分，调用算法团队灵活性能保证模型测算：当前灵活估算SOH为 ${sohResult.currentFlexibleSoh}%，相比基准衰减曲线打点保证值 (${sohResult.currentBaselineSoh}%) 质保裕度为 ${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin}%，资产处于健康受控状态。`,
        kpis: [
          { label: '灵活估算SOH', value: `${sohResult.currentFlexibleSoh}%`, benchmark: '95.40%', status: 'success' },
          { label: '基准偏离裕度', value: `${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin}%`, benchmark: '≥0.00%', status: 'success' },
          { label: '超工况天数', value: `${dailyConditions.filter(d => d.isOverCondition).length} 天`, benchmark: '≤5天/月', status: dailyConditions.filter(d => d.isOverCondition).length > 5 ? 'warning' : 'success' },
          { label: '累计等效循环 (EFC)', value: `${monthlyConditions.reduce((s, m) => s + m.actualEfc, 0).toFixed(1)} 次`, benchmark: '30.0 次', status: 'info' }
        ],
        diagnostics: [
          `实测月度等效循环 ${monthlyConditions.reduce((s, m) => s + m.actualEfc, 0).toFixed(1)} EFC，实际平均工作温度 ${(monthlyConditions[0]?.avgTemp || 25.0).toFixed(1)}℃。`,
          `工况衰减动力学模型计算健康度偏离正常，未发生加速老化析锂风险。`
        ],
        recommendations: [
          '建议根据夏季负荷优化液冷机组启动温度阈值。',
          '维持充放电调度平稳，避免在极限高温时段长时间大倍率放电。'
        ]
      });

      showToast(`《${site.siteName} 灵活性能保证工况评估报告.pdf》已导出并成功归档至报告中心！`);
    } catch (err) {
      console.error('PDF export failed', err);
      showToast('导出评估报告失败，请重试');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 过滤后的 PACK 记录
  const filteredPackRecords = useMemo(() => {
    return packRecords.filter(p => {
      const matchSearch =
        p.packCode.toLowerCase().includes(logSearchPack.toLowerCase()) ||
        p.clusterId.toLowerCase().includes(logSearchPack.toLowerCase());
      const matchOver = logFilterOverOnly ? p.isOverCondition : true;
      return matchSearch && matchOver;
    });
  }, [packRecords, logSearchPack, logFilterOverOnly]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Evaluation Workbench Mode: Top SOH KPI Banner + 当前合同基准工况 Card + Eval Sub-Tabs */}
      {(!mode || mode === 'eval') && (
        <>
          {/* Top Banner: Flexible Warranty SOH KPI Overview */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-800/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                    站点质保概览
                  </span>
                  <span className="text-xs text-indigo-200/80">
                    算法模型: <strong className="text-white font-mono">{sohResult.algorithmVersion}</strong>
                  </span>
                  <span className="text-[11px] text-indigo-300/60 font-mono">
                    更新: {algorithmCalcTimestamp}
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{site.siteName}</span>
                  <span className="text-xs font-normal text-indigo-200 px-2 py-0.5 bg-indigo-800/50 rounded-md">
                    质保期: {contractBaseline.warrantyStartDate} 至 {contractBaseline.warrantyEndDate} ({contractBaseline.warrantyYears}年)
                  </span>
                </h2>
                <p className="text-xs text-indigo-200/80 leading-relaxed max-w-4xl">
                  结合合同约定基准工况参数与实测设备工况折算，调用灵活性能保证模型推算真实 SOH 衰减轨迹、年度折损与年底保证水平，联动下年工况计划与服务报价。
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start lg:self-center flex-wrap">
                <button
                  onClick={handleRunAlgorithm}
                  disabled={isAlgorithmCalculating}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAlgorithmCalculating ? 'animate-spin' : ''}`} />
                  <span>{isAlgorithmCalculating ? '算法接口计算中...' : '调用算法重新测算'}</span>
                </button>
                <button
                  onClick={handleExportDailyData}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  title="导出站级每日工况与超工况明细 CSV 表格"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>按天导出工况数据</span>
                </button>
                <button
                  onClick={handleExportPdfReport}
                  disabled={isExportingPdf}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  title="将当前站点的灵活性能保证计算结果下载为PDF文档，格式包含关键性能指标和计算逻辑说明"
                >
                  <FileText className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-pulse' : ''}`} />
                  <span>{isExportingPdf ? '正在生成PDF报告...' : '导出评估报告'}</span>
                </button>
                <button
                  onClick={() => navigateToReportsCenter(site.id, 'FLEXIBLE_WARRANTY')}
                  className="px-3.5 py-2 bg-indigo-800/80 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-600/50"
                  title="前往报告中心按站点维度查看历史归档报告"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-300" />
                  <span>报告中心 ({reportCenterItems.filter(r => r.siteId === site.id).length} 份)</span>
                </button>
              </div>
            </div>

            {/* KPI Mini Metric Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-indigo-800/60">
              <div className="bg-indigo-950/60 rounded-xl p-2.5 border border-indigo-800/40">
                <div className="text-[10px] text-indigo-300 font-medium">当前灵活估算SOH</div>
                <div className="text-xl font-black font-mono mt-0.5 text-white flex items-baseline gap-1">
                  <span>{sohResult.currentFlexibleSoh}%</span>
                  <span className="text-[10px] font-normal text-indigo-300">
                    (基准 {sohResult.currentBaselineSoh}%)
                  </span>
                </div>
              </div>

              <div className="bg-indigo-950/60 rounded-xl p-2.5 border border-indigo-800/40">
                <div className="text-[10px] text-indigo-300 font-medium">SOH 质保裕度 (ΔSOH)</div>
                <div
                  className={`text-xl font-black font-mono mt-0.5 flex items-baseline gap-1 ${
                    sohResult.sohMargin >= 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  <span>{sohResult.sohMargin >= 0 ? `+${sohResult.sohMargin}` : sohResult.sohMargin}%</span>
                  <span className="text-[10px] font-normal text-indigo-300">
                    {sohResult.sohMargin >= 0 ? '优于基准' : '存在透支'}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-950/60 rounded-xl p-2.5 border border-indigo-800/40">
                <div className="text-[10px] text-indigo-300 font-medium">质保终了预估 SOH</div>
                <div className="text-xl font-black font-mono mt-0.5 text-white flex items-baseline gap-1">
                  <span className={sohResult.estimatedEndLifeSoh >= contractBaseline.finalGuaranteedSoh ? 'text-emerald-400' : 'text-red-400'}>
                    {sohResult.estimatedEndLifeSoh}%
                  </span>
                  <span className="text-[10px] font-normal text-indigo-300">
                    (门槛 {contractBaseline.finalGuaranteedSoh}%)
                  </span>
                </div>
              </div>

              <div className="bg-indigo-950/60 rounded-xl p-2.5 border border-indigo-800/40">
                <div className="text-[10px] text-indigo-300 font-medium">累计超额循环 (EFC)</div>
                <div className="text-xl font-black font-mono mt-0.5 text-amber-400 flex items-baseline gap-1">
                  <span>+{sohResult.overConditionSummary.totalExcessEfc}</span>
                  <span className="text-[10px] font-normal text-indigo-300">次满充</span>
                </div>
              </div>

              <div className="bg-indigo-950/60 rounded-xl p-2.5 border border-indigo-800/40">
                <div className="text-[10px] text-indigo-300 font-medium">累计超温度时 (℃·h)</div>
                <div className="text-xl font-black font-mono mt-0.5 text-amber-400 flex items-baseline gap-1">
                  <span>{sohResult.overConditionSummary.totalOverTempDegreeHours}</span>
                  <span className="text-[10px] font-normal text-indigo-300">&gt;35℃</span>
                </div>
              </div>

              <div className="bg-indigo-950/60 rounded-xl p-2.5 border border-indigo-800/40">
                <div className="text-[10px] text-indigo-300 font-medium">综合老化加速因子</div>
                <div className="text-xl font-black font-mono mt-0.5 text-indigo-200 flex items-baseline gap-1">
                  <span>{sohResult.overConditionSummary.overallAccelerationFactor}x</span>
                  <span className="text-[10px] font-normal text-indigo-300">加权指数</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 核心需求 1：灵活性能保证评估工作台重点展示【当前合同基准工况】卡片 */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 rounded-2xl p-5 text-white shadow-sm space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-indigo-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/40 text-indigo-100 border border-indigo-400/40 flex items-center gap-1.5 shadow-2xs">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-300" />
                    当前合同基准工况
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    已签署生效基准
                  </span>
                  <span className="text-xs text-indigo-200 font-mono">
                    合同协议编号: <strong className="text-white font-bold">{contractBaseline.contractNo}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  当前履约周期: <strong>第 {contractYearSummary.contractYear} 合同年 (2026年度)</strong> · 质保服务期: <strong className="text-white font-mono">{contractBaseline.warrantyStartDate} 至 {contractBaseline.warrantyEndDate}</strong> ({contractBaseline.warrantyYears}年期) · 额定装机能量: <strong className="text-white font-mono">{contractBaseline.ratedEnergyMwh} MWh</strong> ({contractBaseline.ratedPowerMw} MW)
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
                {onNavigateToRunningData && (
                  <button
                    onClick={onNavigateToRunningData}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-600/50 flex items-center gap-1.5 transition-all cursor-pointer"
                    title="切换至工况检测分析监测页面"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-300" />
                    <span>查看工况检测分析</span>
                  </button>
                )}
                {onNavigateToContractManagement ? (
                  <button
                    onClick={onNavigateToContractManagement}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                    title="前往合同工况管理维护基准参数与SOH曲线"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>前往合同工况管理</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveSubView(1)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>合同工况管理</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 8大核心合同基准工况参数指标卡片 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">1. 充放倍率上限</div>
                <div className="text-base font-black font-mono mt-0.5 text-indigo-200">
                  ≤ {contractBaseline.maxCrate} <span className="text-[10px] font-normal text-slate-400">C</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">基准设计上限</div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">2. 规划平均SOC</div>
                <div className="text-base font-black font-mono mt-0.5 text-emerald-300">
                  {contractBaseline.plannedAvgSocPct ?? 50.0} <span className="text-[10px] font-normal text-slate-400">%</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">&gt;规划值标红</div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">3. 运行时间基准</div>
                <div className="text-base font-black font-mono mt-0.5 text-white">
                  10.0 <span className="text-[10px] font-normal text-slate-400">h/日</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">额定满载充放</div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">4. 日循环次数基准</div>
                <div className="text-base font-black font-mono mt-0.5 text-white">
                  1.0 <span className="text-[10px] font-normal text-slate-400">次/日</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">年等效 {contractBaseline.annualBaselineEfc} 次</div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">5. 放电深度DOD</div>
                <div className="text-base font-black font-mono mt-0.5 text-white">
                  ≤ {contractBaseline.maxDodPct} <span className="text-[10px] font-normal text-slate-400">%</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">合同DOD门槛</div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">6. 充放设计电量</div>
                <div className="text-xs font-black font-mono mt-0.5 text-white">
                  充28.5 / 放25
                </div>
                <div className="text-[10px] text-slate-400 truncate">{contractBaseline.annualEnergyThroughputLimitMwh} MWh/年</div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">7. 基准温限要求</div>
                <div className="text-xs font-black font-mono mt-0.5 text-amber-300">
                  均{contractBaseline.baselineTempAvg}℃ · 顶≤{contractBaseline.baselineTempMax}℃
                </div>
                <div className="text-[10px] text-slate-400 truncate">最高超温红线</div>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-2.5 border border-indigo-900/60 shadow-2xs">
                <div className="text-[10px] text-slate-400 font-medium">8. 保证SOH底线</div>
                <div className="text-xs font-black font-mono mt-0.5 text-blue-300">
                  当96.5% · 终≥{contractBaseline.finalGuaranteedSoh}%
                </div>
                <div className="text-[10px] text-slate-400 truncate">EOL质保承诺</div>
              </div>
            </div>
          </div>

          {/* 灵活性能保证评估工作台内部子导航 */}
          <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setActiveSubView(0)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeSubView === 0
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingDown className={`w-4 h-4 ${activeSubView === 0 ? 'text-white' : 'text-slate-500'}`} />
                <span>1. SOH衰减双曲线与算法估算</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeSubView === 0 ? 'bg-indigo-700 text-indigo-100 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                  全寿命双曲线对比
                </span>
              </button>

              <button
                onClick={() => setActiveSubView(6)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeSubView === 6
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeSubView === 6 ? 'text-white' : 'text-slate-500'}`} />
                <span>2. 年底SOH临时评估与下年工况计划报价</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${activeSubView === 6 ? 'bg-indigo-700 text-indigo-100 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                  {confirmedPlan ? '已签署下年工况' : '临时评估与报价'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2. 工况检测分析 (运行期间工况数据) */}
      {mode === 'running' && (
        <>

          {/* 运行期间工况数据 2 个子标签页导航 */}
          <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {[
                {
                  id: 5,
                  label: '1. 当前合同年超工况统计',
                  icon: AlertTriangle,
                  badge: contractYearSummary.isRedAlert ? '🔴 标红预警' : '履约合规',
                  isAlert: contractYearSummary.isRedAlert
                },
                {
                  id: 2,
                  label: '2. 质保工况数据详情',
                  icon: FileText,
                  badge: '24组PACK · 站/PACK双层级'
                }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeSubView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubView(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : tab.isAlert
                        ? 'text-red-700 bg-red-50 hover:bg-red-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.isAlert ? 'text-red-600' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                        isActive
                          ? 'bg-indigo-700 text-indigo-100 font-bold'
                          : tab.isAlert
                          ? 'bg-red-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 3. Contract Management Mode: 纯合同工况管理，不包含任何运行期间数据 */}
      {mode === 'contract' && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-800/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-300" />
                  合同工况管理
                </span>
                <span className="text-xs text-indigo-200/80">
                  标准基准规范: <strong className="text-white font-mono">v2.0-Contract-Baseline</strong>
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  ● 独立合同基准档案 (无混杂运行遥测)
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{site.siteName}</span>
                <span className="text-xs font-normal text-indigo-200 px-2 py-0.5 bg-indigo-800/50 rounded-md">
                  合同编号: {contractBaseline.contractNo} · 服务年限: {contractBaseline.warrantyYears}年
                </span>
              </h2>
              <p className="text-xs text-indigo-200/80 leading-relaxed max-w-4xl">
                独立维护电站合同基准工况参数、质保起止周期与全寿命 SOH 基准衰减曲线。在此处设定的基准参数将作为灵活性能保证算法计算超工况与寿命折损的唯一法定基准。
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start lg:self-center flex-wrap">
              <button
                onClick={downloadContractBaselineTemplate}
                className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>下载合同基准模板</span>
              </button>
              <button
                onClick={downloadSohBaselineCurveTemplate}
                className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>下载SOH曲线模板</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 0: 双曲线对比与算法估算 (核心需求 4) */}
      {/* ========================================================================= */}
      {activeSubView === 0 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Main Dual Curve Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-indigo-600" />
                  <span>SOH基准工况衰减曲线 vs. 灵活性能保证工况SOH衰减曲线 (全寿命10年对比)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  深蓝曲线为合同约定的标准 SOH 基准衰减底线；翡翠/琥珀曲线为基于实际日工况与超工况应力测算的灵活性能保证 SOH 打点值。
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-0.5 bg-blue-600 inline-block rounded-full"></span>
                  <span>SOH基准工况衰减曲线</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block rounded-full"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  <span>灵活性能保证工况SOH打点曲线</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-red-400 border-t border-dashed inline-block"></span>
                  <span>80% EOL保证红线</span>
                </span>
                <button
                  onClick={handleExportPdfReport}
                  disabled={isExportingPdf}
                  className="ml-2 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="下载当前站点的灵活性能保证双曲线及SOH计算结果为PDF评估报告"
                >
                  <FileText className="w-3 h-3 text-rose-600" />
                  <span>{isExportingPdf ? '导出中...' : '导出评估报告 (PDF)'}</span>
                </button>
              </div>
            </div>

            {/* Recharts Dual Curve Visual */}
            <div className="h-[360px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sohResult.annualPoints}
                  margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickFormatter={y => (y === 0 ? '投运' : `第${y}年`)}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    domain={[75, 102]}
                    tickCount={7}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const point = payload[0].payload as any;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5">
                          <div className="font-bold flex items-center justify-between gap-4 border-b border-slate-700 pb-1">
                            <span>{point.yearLabel} ({point.date.slice(0, 4)}年)</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-800 text-indigo-200">
                              {point.isHistorical ? '历史实测打点' : '算法外推估算'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                            <div>基准保证SOH: <strong className="text-blue-400 font-mono">{point.baselineSoh}%</strong></div>
                            <div>灵活性能保证SOH: <strong className="text-emerald-400 font-mono">{point.flexibleWarrantySoh}%</strong></div>
                            <div>偏离差值 ΔSOH: <strong className={point.deltaSoh >= 0 ? 'text-emerald-400' : 'text-amber-400 font-mono'}>{point.deltaSoh >= 0 ? `+${point.deltaSoh}` : point.deltaSoh}%</strong></div>
                            <div>累计超工况惩罚: <strong className="text-red-400 font-mono">-{point.cumulativeOverPenaltyPct}%</strong></div>
                            <div>累计等效满充循环: <strong className="text-slate-300 font-mono">{point.cumulativeCycles} 次</strong></div>
                            <div>累计放电吞吐量: <strong className="text-slate-300 font-mono">{point.cumulativeThroughputMwh} MWh</strong></div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={contractBaseline.finalGuaranteedSoh}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: `EOL保证底线 ${contractBaseline.finalGuaranteedSoh}%`,
                      position: 'insideBottomRight',
                      fill: '#ef4444',
                      fontSize: 10
                    }}
                  />
                  {/* SOH 基准衰减曲线 (深蓝) */}
                  <Line
                    type="monotone"
                    dataKey="baselineSoh"
                    name="SOH基准工况衰减曲线"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb' }}
                  />
                  {/* 灵活性能保证工况SOH衰减曲线 (翠绿/琥珀打点) */}
                  <Line
                    type="monotone"
                    dataKey="flexibleWarrantySoh"
                    name="灵活性能保证工况SOH衰减曲线"
                    stroke="#059669"
                    strokeWidth={2.5}
                    strokeDasharray="0"
                    dot={{
                      r: 5,
                      fill: '#10b981',
                      stroke: '#064e3b',
                      strokeWidth: 2
                    }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 年度打点数值对比表格 */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">运营年份</th>
                    <th className="py-2.5 px-3">状态阶段</th>
                    <th className="py-2.5 px-3">SOH基准工况值(%)</th>
                    <th className="py-2.5 px-3">灵活性能保证估算打点值(%)</th>
                    <th className="py-2.5 px-3">差值 (ΔSOH)</th>
                    <th className="py-2.5 px-3">累计超工况扣减(%)</th>
                    <th className="py-2.5 px-3">累计等效循环(次)</th>
                    <th className="py-2.5 px-3">累计吞吐量(MWh)</th>
                    <th className="py-2.5 px-3 text-center">质保状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sohResult.annualPoints.map(p => (
                    <tr key={p.year} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {p.yearLabel}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            p.isHistorical
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {p.isHistorical ? '实测标定点' : '模型外推点'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-600">
                        {p.baselineSoh}%
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                        {p.flexibleWarrantySoh}%
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span
                          className={
                            p.deltaSoh >= 0
                              ? 'text-emerald-600 font-semibold'
                              : 'text-amber-600 font-semibold'
                          }
                        >
                          {p.deltaSoh >= 0 ? `+${p.deltaSoh}` : p.deltaSoh}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-red-500">
                        -{p.cumulativeOverPenaltyPct}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {p.cumulativeCycles}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {p.cumulativeThroughputMwh}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'SAFE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status === 'SAFE' ? '履约安全' : p.status === 'WARNING' ? '超工况预警' : '履约超标'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: 合同工况（基准工况）与SOH基准模版录入/导入 (核心需求 2) */}
      {/* ========================================================================= */}
      {activeSubView === 1 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Action Row: Template Download & Import */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>合同工况管理 (Contract Baseline Condition Management)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                独立维护电站合同基准工况参数、质保起止周期与全寿命 SOH 基准衰减曲线。支持下载官方标准 CSV 模版并在本地填写后一键上传导入，系统将自动校验并刷新基准参数。
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Template Download Buttons */}
              <button
                onClick={downloadContractBaselineTemplate}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>下载《合同基准工况标准模板.csv》</span>
              </button>

              <button
                onClick={downloadSohBaselineCurveTemplate}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>下载《SOH基准衰减曲线标准模板.csv》</span>
              </button>

              {/* Template Import Inputs */}
              <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>导入合同基准模版</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleImportContractCsv}
                  className="hidden"
                />
              </label>

              <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>导入SOH衰减曲线模版</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleImportSohCurveCsv}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form 1: Contract Baseline Condition Parameters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>合同工况（基准工况）与质保起止时间录入表单</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                数据来源: {contractBaseline.sourceType === 'TEMPLATE_IMPORT' ? '模版导入' : '默认/手动编辑'} · 修改时间: {contractBaseline.lastModified}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">合同协议编号</label>
                <input
                  type="text"
                  value={contractBaseline.contractNo}
                  onChange={e => setContractBaseline(prev => ({ ...prev, contractNo: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">质保起始日期 (起运日)</label>
                <input
                  type="date"
                  value={contractBaseline.warrantyStartDate}
                  onChange={e => setContractBaseline(prev => ({ ...prev, warrantyStartDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">质保终止日期 (届满日)</label>
                <input
                  type="date"
                  value={contractBaseline.warrantyEndDate}
                  onChange={e => setContractBaseline(prev => ({ ...prev, warrantyEndDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">质保服务年限 (年)</label>
                <input
                  type="number"
                  value={contractBaseline.warrantyYears}
                  onChange={e => setContractBaseline(prev => ({ ...prev, warrantyYears: parseFloat(e.target.value) || 10 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">额定装机能量 (MWh)</label>
                <input
                  type="number"
                  value={contractBaseline.ratedEnergyMwh}
                  onChange={e => setContractBaseline(prev => ({ ...prev, ratedEnergyMwh: parseFloat(e.target.value) || 20 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">基准年等效循环 EFC (次/年)</label>
                <input
                  type="number"
                  value={contractBaseline.annualBaselineEfc}
                  onChange={e => setContractBaseline(prev => ({ ...prev, annualBaselineEfc: parseFloat(e.target.value) || 365 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">基准充放电倍率上限 (C-rate)</label>
                <input
                  type="number"
                  step="0.05"
                  value={contractBaseline.maxCrate}
                  onChange={e => setContractBaseline(prev => ({ ...prev, maxCrate: parseFloat(e.target.value) || 0.5 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">基准放电深度上限 DOD (%)</label>
                <input
                  type="number"
                  value={contractBaseline.maxDodPct}
                  onChange={e => setContractBaseline(prev => ({ ...prev, maxDodPct: parseFloat(e.target.value) || 90 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">基准设计平均工作温度 (℃)</label>
                <input
                  type="number"
                  value={contractBaseline.baselineTempAvg}
                  onChange={e => setContractBaseline(prev => ({ ...prev, baselineTempAvg: parseFloat(e.target.value) || 25 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">基准最高允许工作温度 (℃) [超温红线]</label>
                <input
                  type="number"
                  value={contractBaseline.baselineTempMax}
                  onChange={e => setContractBaseline(prev => ({ ...prev, baselineTempMax: parseFloat(e.target.value) || 35 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">年度累计能量吞吐限额 (MWh)</label>
                <input
                  type="number"
                  value={contractBaseline.annualEnergyThroughputLimitMwh}
                  onChange={e => setContractBaseline(prev => ({ ...prev, annualEnergyThroughputLimitMwh: parseFloat(e.target.value) || 7300 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">质保终了 SOH 保证承诺值 (%)</label>
                <input
                  type="number"
                  value={contractBaseline.finalGuaranteedSoh}
                  onChange={e => setContractBaseline(prev => ({ ...prev, finalGuaranteedSoh: parseFloat(e.target.value) || 80 }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-red-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Table: SOH Baseline Degradation Curve Points Editor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>SOH 基准衰减曲线打点数据列表 (0-10年保证值)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  支持直接在表格内调整各年份的保证 SOH 数值，系统将实时更新基准曲线与算法估算结果。
                </p>
              </div>

              <button
                onClick={() => setSohBaselineCurve(DEFAULT_SOH_BASELINE_CURVE)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                重置为出厂标准曲线
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">运营年份</th>
                    <th className="py-2.5 px-3">SOH保证值 (%)</th>
                    <th className="py-2.5 px-3">累计基准循环 (次)</th>
                    <th className="py-2.5 px-3">累计吞吐量额度 (MWh)</th>
                    <th className="py-2.5 px-3">阶段特征说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sohBaselineCurve.map((item, index) => (
                    <tr key={item.year} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.year === 0 ? '第0年 (出厂)' : `第 ${item.year} 年`}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.1"
                          value={item.guaranteedSoh}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || item.guaranteedSoh;
                            setSohBaselineCurve(prev => {
                              const next = [...prev];
                              next[index] = { ...next[index], guaranteedSoh: val };
                              return next;
                            });
                          }}
                          className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono font-bold text-blue-600 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {item.cumulativeCycles}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {item.cumulativeThroughputMwh}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Preview: 纯合同SOH基准衰减曲线可视化 (不含任何运行实测数据) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  <span>合同基准衰减曲线全景预览 (0-10年保证底线，无混杂运行数据)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  仅展示当前合同约定的法定保证衰减曲线与 EOL 承诺底线 ({contractBaseline.finalGuaranteedSoh}%)，作为质保结算与超工况寿命折损的法律基准。
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200">
                基准保证承诺点: {sohBaselineCurve.length} 个
              </span>
            </div>

            <div className="h-[260px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sohBaselineCurve} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickFormatter={y => (y === 0 ? '出厂' : `第${y}年`)}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    domain={[75, 102]}
                    tickCount={6}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as SohBaselineCurvePoint;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                          <div className="font-bold border-b border-slate-700 pb-1 flex justify-between gap-4">
                            <span>{d.year === 0 ? '出厂第0年' : `第${d.year}运营年`}</span>
                            <span className="text-blue-400 font-mono font-black">{d.guaranteedSoh}%</span>
                          </div>
                          <div>累计基准循环: <span className="font-mono text-slate-300">{d.cumulativeCycles} 次</span></div>
                          <div>累计吞吐额度: <span className="font-mono text-slate-300">{d.cumulativeThroughputMwh} MWh</span></div>
                          {d.description && <div className="text-[10px] text-slate-400">{d.description}</div>}
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={contractBaseline.finalGuaranteedSoh}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: `EOL底线 ${contractBaseline.finalGuaranteedSoh}%`,
                      position: 'insideBottomRight',
                      fill: '#ef4444',
                      fontSize: 10
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="guaranteedSoh"
                    name="合同保证SOH"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table: 合同工况版本履历与变更说明 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>合同工况基准版本履历与变更归档 (合规审计记录)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  追踪每次合同条款补充协议与基准工况参数调整的历史记录，确保灵活性能保证计算具有完整法律依据。
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                当前生效版本: v1.1
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">版本号</th>
                    <th className="py-2.5 px-3">签署生效日期</th>
                    <th className="py-2.5 px-3">变更协议名称</th>
                    <th className="py-2.5 px-3">核心变更条款与工况约定</th>
                    <th className="py-2.5 px-3">审批签发人</th>
                    <th className="py-2.5 px-3 text-center">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold font-mono text-indigo-600">v1.1</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">2025-06-15</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">电站二期充放电调度与灵活性能保证补充协议</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      明确日平均规划SOC基准为 50.0%（高出规划按超工况标红考核），放宽夏季极端负荷日放电深度上限至 90.0%。
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">南方电网 / 质保技术组</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        当前生效
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold font-mono text-slate-500">v1.0</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">2024-01-01</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">储能电站首期投运设备采购与性能保障合同</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      初始合同基准：10年期保证，0.50C 倍率上限，35℃ 工作温限，365次/年等效循环，10年终了EOL保证 80.0%。
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">深圳供电局 / 商务法务组</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        历史归档
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: 质保工况数据详情 (单站场景：站级与 PACK 级双层级排查工作台) */}
      {/* ========================================================================= */}
      {(activeSubView === 2 || activeSubView === 3 || activeSubView === 4) && (
        <WarrantyConditionDetailView
          site={site}
          contractBaseline={contractBaseline}
          monthlyConditions={monthlyConditions}
          dailyConditions={dailyConditions}
          packRecords={packRecords}
          initialLevel={activeSubView === 4 ? 'station' : 'pack'}
          onNavigateToOverConditionStats={() => setActiveSubView(5)}
        />
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: 基于电池PACK级工况换算为站级工况 (核心需求 3) */}
      {false && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Conversion Algorithm Formulation Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>电池 PACK 级工况换算站级工况算法模型</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                储能电站通常由数十至上百组电池 PACK 并联/串联构成。质保履约评估必须将离散的 PACK 遥测科学换算为电站级统一综合工况。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. 站级能量吞吐求和换算</span>
                </div>
                <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-indigo-900">
                  E_station = ∑ E_pack / 1000 (MWh)
                </div>
                <p className="text-[11px] text-slate-500">
                  各电池簇直流侧实际放电能量累加，换算为电站级总放电 MWh。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. 站级等效满充循环 EFC</span>
                </div>
                <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-blue-900">
                  EFC = E_station / (2 × E_rated)
                </div>
                <p className="text-[11px] text-slate-500">
                  消除不同日充放深度的差异，折算为全站标准等效全充全放次数。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. 温度场短板极值与加权</span>
                </div>
                <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-amber-900">
                  T_max = max(T_pack), T_avg = mean(T)
                </div>
                <p className="text-[11px] text-slate-500">
                  基于木桶短板原则，最高温 PACK 决定系统热失控与加速老化风险。
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4. 离散度与短板定位</span>
                </div>
                <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-emerald-900">
                  ΔSOC = max(SOC) - min(SOC)
                </div>
                <p className="text-[11px] text-slate-500">
                  提取 PACK 间最大 SOC 极差与最低 SOH PACK，定位系统瓶颈。
                </p>
              </div>
            </div>
          </div>

          {/* Current Conversion Result Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: PACK Level Dispersed Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>输入: 24 组 PACK 级工况分布</span>
                </h4>
                <span className="text-xs text-slate-500">
                  样本数: {packRecords.length} 组
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">各 PACK 放电能量区间:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {Math.min(...packRecords.map(p => p.energyKwh)).toFixed(1)} ~ {Math.max(...packRecords.map(p => p.energyKwh)).toFixed(1)} kWh
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">各 PACK 温度场分布:</span>
                  <span className="font-mono font-semibold text-amber-600">
                    {Math.min(...packRecords.map(p => p.minTemp)).toFixed(1)}℃ ~ {packStationSummary.stationMaxTemp}℃ (极差 { (packStationSummary.stationMaxTemp - Math.min(...packRecords.map(p => p.minTemp))).toFixed(1) }℃)
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">PACK 间 SOC 不均衡度:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ΔSOC = {packStationSummary.deltaSoc}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600">超工况异常 PACK 数:</span>
                  <span className="font-mono font-bold text-red-600">
                    {packStationSummary.overConditionPackCount} 组 (短板: {packStationSummary.bottleneckPackCode})
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Converted Station-Level Unified Condition */}
            <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>输出: 换算后站级综合工况指标</span>
                </h4>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  换算完成
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                  <span className="text-slate-600">全站等效放电能量吞吐:</span>
                  <span className="font-mono font-black text-indigo-700 text-sm">
                    {packStationSummary.stationEnergyMwh} MWh
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                  <span className="text-slate-600">站级等效满充循环 (EFC):</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {packStationSummary.stationEfc} 次 / 日
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                  <span className="text-slate-600">站级最高工作温 / 平均温:</span>
                  <span className="font-mono font-bold text-amber-600">
                    {packStationSummary.stationMaxTemp}℃ / {packStationSummary.stationAvgTemp}℃
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                  <span className="text-slate-600">站级峰值充放电倍率:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {packStationSummary.stationPeakCrate} C (基准上限 0.50 C)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: 站级月度工况统计表格与按天导出 (核心需求 5) */}
      {false && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>站级基准工况、实际工况与超工况月度统计分析</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                月度数据支持点击展开查看该月全量日工况明细；右侧按钮支持一键将站级全量日工况明细导出为标准 CSV 表格文件。
              </p>
            </div>

            <button
              onClick={handleExportDailyData}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-center"
            >
              <Download className="w-4 h-4" />
              <span>按天导出站级工况明细 (CSV)</span>
            </button>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">统计月份</th>
                    <th className="py-2.5 px-3">日均倍率(C)</th>
                    <th className="py-2.5 px-3">PACK均SOC(%)</th>
                    <th className="py-2.5 px-3">日均运行时(h)</th>
                    <th className="py-2.5 px-3">月循环(次)</th>
                    <th className="py-2.5 px-3">均DOD(%)</th>
                    <th className="py-2.5 px-3">充电/放电(MWh)</th>
                    <th className="py-2.5 px-3">超循环(次)</th>
                    <th className="py-2.5 px-3">平均温(℃)</th>
                    <th className="py-2.5 px-3">最高温(℃)</th>
                    <th className="py-2.5 px-3">超温时数(h)</th>
                    <th className="py-2.5 px-3">峰值倍率(C)</th>
                    <th className="py-2.5 px-3">超工况指数</th>
                    <th className="py-2.5 px-3 text-center">质保状态</th>
                    <th className="py-2.5 px-3 text-center">日明细</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyConditions.map(m => {
                    const isExpanded = !!expandedMonths[m.month];
                    const isSocOver = m.avgDailyPackSoc > (contractBaseline.plannedAvgSocPct ?? 50.0);
                    return (
                      <React.Fragment key={m.month}>
                        <tr className={`hover:bg-slate-50 transition-colors ${m.status === 'EXCEEDED' || isSocOver ? 'bg-red-50/20' : ''}`}>
                          <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                            {m.month}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">{m.avgDailyCrate} C</td>
                          <td className={`py-3 px-3 font-mono font-bold ${isSocOver ? 'text-red-600 bg-red-50/80 px-2 rounded' : 'text-slate-800'}`}>
                            {m.avgDailyPackSoc}%
                            {isSocOver && <span className="text-[10px] ml-1 text-red-500 font-normal">(超规划)</span>}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">{m.avgDailyOperatingHours} h</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-900">{m.totalCycles}</td>
                          <td className="py-3 px-3 font-mono text-slate-700">{m.avgDailyDod}%</td>
                          <td className="py-3 px-3 font-mono text-slate-800">
                            {m.totalChargeEnergyMwh} / {m.totalDischargeEnergyMwh}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-amber-600">
                            {m.overEfc > 0 ? `+${m.overEfc}` : '0'}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">{m.avgTemp}℃</td>
                          <td
                            className={`py-3 px-3 font-mono font-bold ${
                              m.maxTemp > contractBaseline.baselineTempMax
                                ? 'text-red-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {m.maxTemp}℃
                          </td>
                          <td
                            className={`py-3 px-3 font-mono ${
                              m.overTempHours > 0 ? 'text-red-500 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {m.overTempHours} h
                          </td>
                          <td className="py-3 px-3 font-mono">{m.maxCrate} C</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                            {m.overConditionIndex}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === 'NORMAL' && !isSocOver
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'EXCEEDED' || isSocOver
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {m.status === 'NORMAL' && !isSocOver ? '正常履约' : m.status === 'EXCEEDED' || isSocOver ? '标红超工况' : '轻度预警'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() =>
                                setExpandedMonths(prev => ({
                                  ...prev,
                                  [m.month]: !prev[m.month]
                                }))
                              }
                              className="px-2 py-1 text-[11px] rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors inline-flex items-center gap-1"
                            >
                              <span>{isExpanded ? '收起' : '展开'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Daily Sub-Table */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={15} className="bg-slate-50/70 p-3.5 border-y border-slate-200">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                                    <span>{m.month} 月日级工况下钻明细 ({m.dailyDetails.length} 天)</span>
                                    <span className="text-[11px] font-normal text-slate-500">
                                      含日充放倍率、日PACK平均SOC、日运行时间、日循环、日DOD、充放电量
                                    </span>
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    点击右上角可一键按天导出全量日工况明细
                                  </span>
                                </div>

                                <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                                  <table className="w-full text-[11px] text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                                      <tr>
                                        <th className="py-1.5 px-2.5">日期</th>
                                        <th className="py-1.5 px-2.5">日充/放倍率(C)</th>
                                        <th className="py-1.5 px-2.5">日PACK均SOC(%)</th>
                                        <th className="py-1.5 px-2.5">日运行(h)</th>
                                        <th className="py-1.5 px-2.5">日循环(EFC)</th>
                                        <th className="py-1.5 px-2.5">日DOD(%)</th>
                                        <th className="py-1.5 px-2.5">充电量(MWh)</th>
                                        <th className="py-1.5 px-2.5">放电量(MWh)</th>
                                        <th className="py-1.5 px-2.5">超额EFC</th>
                                        <th className="py-1.5 px-2.5">最高温(℃)</th>
                                        <th className="py-1.5 px-2.5">峰值倍率(C)</th>
                                        <th className="py-1.5 px-2.5">超工况指数</th>
                                        <th className="py-1.5 px-2.5 text-center">履约状态</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-mono">
                                      {m.dailyDetails.map(d => {
                                        const isDaySocOver = d.dailyPackAvgSoc > (contractBaseline.plannedAvgSocPct ?? 50.0);
                                        const isDayRed = d.isOverCondition || isDaySocOver;
                                        return (
                                          <tr key={d.date} className={`hover:bg-slate-50 ${isDayRed ? 'bg-red-50/30' : ''}`}>
                                            <td className="py-1.5 px-2.5 font-sans font-medium text-slate-800">
                                              {d.date}
                                            </td>
                                            <td className="py-1.5 px-2.5 text-slate-700">
                                              {d.dailyChargeCrate} / {d.dailyDischargeCrate}
                                            </td>
                                            <td className={`py-1.5 px-2.5 font-bold ${isDaySocOver ? 'text-red-600 bg-red-100/60 px-1.5 rounded' : 'text-slate-800'}`}>
                                              {d.dailyPackAvgSoc}%
                                            </td>
                                            <td className="py-1.5 px-2.5 text-slate-700">{d.dailyOperatingHours}h</td>
                                            <td className="py-1.5 px-2.5 font-semibold text-slate-900">{d.dailyCycles}</td>
                                            <td className="py-1.5 px-2.5 text-slate-700">{d.dailyDod}%</td>
                                            <td className="py-1.5 px-2.5 text-slate-700">{d.chargeEnergyMwh}</td>
                                            <td className="py-1.5 px-2.5 font-semibold text-slate-900">{d.dischargeEnergyMwh}</td>
                                            <td className="py-1.5 px-2.5 text-amber-600">
                                              {d.overEfc > 0 ? `+${d.overEfc}` : '0'}
                                            </td>
                                            <td className={`py-1.5 px-2.5 ${d.maxTemp > contractBaseline.baselineTempMax ? 'text-red-600 font-bold' : ''}`}>
                                              {d.maxTemp}℃
                                            </td>
                                            <td className="py-1.5 px-2.5">{d.maxCrate} C</td>
                                            <td className="py-1.5 px-2.5">{d.overConditionIndex}</td>
                                            <td className="py-1.5 px-2.5 text-center font-sans">
                                              <span
                                                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                                  !isDayRed
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}
                                              >
                                                {!isDayRed ? '合规' : '超工况/超SOC'}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 5: 当前合同年超工况统计数据 (新核心需求) */}
      {/* ========================================================================= */}
      {activeSubView === 5 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header Card with Contract Year Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  合同年维度工况考核
                </span>
                <span className="text-xs font-mono text-slate-500">
                  合同编号: <strong className="text-slate-800">{contractYearSummary.contractNo}</strong>
                </span>
                <span className="text-xs text-slate-500">
                  当前履约周期: <strong className="text-slate-800">{contractYearSummary.startDate} ~ {contractYearSummary.endDate}</strong>
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <span>{contractYearSummary.contractYearLabel} 超工况统计看板</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    contractYearSummary.isRedAlert
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {contractYearSummary.isRedAlert ? '🔴 标红预警 (超工况已触发)' : '🟢 履约完全合规'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                统计已累计 <strong className="text-slate-800">{contractYearSummary.elapsedDays} 天</strong> / 全年 {contractYearSummary.totalDays} 天 (年度时间进度 {contractYearSummary.progressPct}%)。
                依据合同质保协议，对该年度超温、超倍率、超DOD深度放电、超循环及平均SOC偏离进行闭环考核。
              </p>
            </div>

            {/* Contract Year Switcher */}
            <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
              <span className="text-xs font-medium text-slate-500">合同年选择:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                {[
                  { year: 1, label: '第1合同年 (2024)' },
                  { year: 2, label: '第2合同年 (2025)' },
                  { year: 3, label: '第3合同年 (2026 当前)' }
                ].map(item => (
                  <button
                    key={item.year}
                    onClick={() => setSelectedContractYear(item.year)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedContractYear === item.year
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 标红规则警示条: 如果超限次数大于0，或者平均SOC大于合同规划SOC，则标红展示 */}
          {contractYearSummary.isRedAlert ? (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 shadow-sm text-red-950 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-red-500/30">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-red-700">
                      ⚠️ 当前合同年已触发超工况标红预警！
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      合同质保考核告警
                    </span>
                  </div>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    <strong>规则触发判定: </strong>
                    {contractYearSummary.totalOverLimitCount > 0 && (
                      <span className="mr-2">
                        ① 累计超限次数为 <strong className="text-red-700 underline font-black">{contractYearSummary.totalOverLimitCount} 次</strong> (&gt; 0次超限门槛)；
                      </span>
                    )}
                    {contractYearSummary.isSocExceeded && (
                      <span>
                        ② 实际平均SOC为 <strong className="text-red-700 underline font-black">{contractYearSummary.actualAvgSoc}%</strong>，已超出合同规划SOC <strong className="text-red-700">{contractYearSummary.contractPlannedSoc}%</strong> (+{contractYearSummary.socDiff}%)；
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-red-700/80 mt-1">
                    影响说明: 触发双重应力加速老化模型 (Arrhenius热加速与高开路电压析锂加速)，算法已累计折算加速衰减；建议立即优化BMS浮充电压与错峰充放策略。
                  </p>
                </div>
              </div>

              <div className="self-end md:self-center shrink-0">
                <button
                  onClick={handleExportDailyData}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出超工况明细分析表</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-950 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800">
                  当前合同年工况履约完全达标，未触发标红预警
                </span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  超限总次数为 0 次，实际平均SOC ({contractYearSummary.actualAvgSoc}%) 处于合同规划SOC ({contractYearSummary.contractPlannedSoc}%) 允许边界内。
                </p>
              </div>
            </div>
          )}

          {/* 当前合同年工况考核指标全景卡片 (9 项指标卡网格) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                    当前合同年工况考核指标全景
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                    9项核心考核指标
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  依据当前合同履约基准对倍率、温度、SOC、运行时间、循环及衰减进行闭环监测，作为灵活性能保证 SOH 加速折损评定依据。
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  合同考核基准 · 实测运行统计 · 履约判定
                </span>
              </div>
            </div>

            {/* 单行横向排布 9 个指标卡 */}
            <div className="overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
              <div className="grid grid-cols-9 gap-2.5 min-w-[1240px]">
                {[
                  {
                    id: 1,
                    name: '充电倍率',
                    benchmark: '≤ 0.5 C',
                    value: '年均 0.33 C',
                    status: '履约合规',
                    type: 'compliant' as const,
                    icon: Zap,
                    iconColor: 'text-amber-500'
                  },
                  {
                    id: 2,
                    name: '放电倍率',
                    benchmark: '≤ 0.5 C',
                    value: '年均 0.41 C',
                    status: '履约合规',
                    type: 'compliant' as const,
                    icon: Zap,
                    iconColor: 'text-blue-500'
                  },
                  {
                    id: 3,
                    name: '循环平均温度',
                    benchmark: '均≤25℃',
                    value: '年均 21.2℃',
                    status: '履约合规',
                    type: 'compliant' as const,
                    icon: Thermometer,
                    iconColor: 'text-orange-500'
                  },
                  {
                    id: 4,
                    name: '平均SOC',
                    benchmark: '≤ 50 %',
                    value: '年均 47.4 %',
                    status: '履约合规',
                    type: 'compliant' as const,
                    icon: Activity,
                    iconColor: 'text-emerald-500'
                  },
                  {
                    id: 5,
                    name: '系统运行时间',
                    benchmark: '10.0 h/日',
                    value: '年均 18.8 h/日',
                    status: '正常运行',
                    type: 'normal' as const,
                    icon: Clock,
                    iconColor: 'text-indigo-500'
                  },
                  {
                    id: 6,
                    name: '循环次数',
                    benchmark: '365 次/年',
                    value: '累计 199.3 次',
                    status: '占额度 54.6%',
                    type: 'quota' as const,
                    icon: RefreshCw,
                    iconColor: 'text-purple-500'
                  },
                  {
                    id: 7,
                    name: '最大放电深度DOD',
                    benchmark: '≤ 90 %',
                    value: '峰值 92.1 %',
                    status: '超限 3 次',
                    type: 'alert' as const,
                    icon: TrendingDown,
                    iconColor: 'text-red-500'
                  },
                  {
                    id: 8,
                    name: '滑窗内充放电量',
                    benchmark: '7300 MWh',
                    value: '充4305.8/放3986.8',
                    status: '占额度 54.6%',
                    type: 'quota' as const,
                    icon: Layers,
                    iconColor: 'text-cyan-600'
                  },
                  {
                    id: 9,
                    name: 'SOH',
                    benchmark: '92.09 %',
                    value: '基准 92.54 %',
                    status: '低于基准 -0.45%',
                    type: 'warning' as const,
                    icon: ShieldCheck,
                    iconColor: 'text-indigo-500'
                  }
                ].map(item => {
                  const Icon = item.icon;
                  const isAlert = item.type === 'alert';
                  const isWarning = item.type === 'warning';
                  const isCompliant = item.type === 'compliant';
                  const isNormal = item.type === 'normal';

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-3 transition-all duration-200 flex flex-col justify-between group ${
                        isAlert
                          ? 'bg-red-50/50 border-2 border-red-500/90 shadow-sm shadow-red-500/10'
                          : isWarning
                          ? 'bg-amber-50/40 border border-amber-300 shadow-2xs hover:border-amber-400'
                          : 'bg-slate-50/60 hover:bg-white border border-slate-200/90 hover:border-indigo-200 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      {/* 第1行：指标名（左带图标）   限值/基准（右） */}
                      <div className="flex items-center justify-between gap-1.5 pb-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <Icon className={`w-3.5 h-3.5 ${item.iconColor} shrink-0`} />
                          <span className="text-[11px] font-bold text-slate-800 tracking-tight truncate" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/90 shadow-2xs shrink-0">
                          {item.benchmark}
                        </span>
                      </div>

                      {/* 第2行：核心数值（大号加粗字体突出展示） */}
                      <div className="my-2.5">
                        <div
                          className={`font-black font-mono tracking-tight truncate ${
                            item.value.length > 12 ? 'text-xs xl:text-sm' : 'text-base xl:text-lg'
                          } ${
                            isAlert
                              ? 'text-red-600'
                              : isWarning
                              ? 'text-amber-700'
                              : 'text-slate-900'
                          }`}
                          title={item.value}
                        >
                          {item.value}
                        </div>
                      </div>

                      {/* 第3行：状态/结论（Badge标签样式） */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors truncate ${
                            isAlert
                              ? 'bg-red-600 text-white shadow-2xs'
                              : isWarning
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isCompliant
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : isNormal
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isAlert && <AlertTriangle className="w-3 h-3 animate-pulse shrink-0" />}
                          {isCompliant && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                          {isNormal && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                          {isWarning && <TrendingDown className="w-3 h-3 text-amber-700 shrink-0" />}
                          <span className="truncate">{item.status}</span>
                        </span>

                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          #{item.id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 月度履约指标分析与超限考核矩阵 (承上启下的下钻枢纽) */}
          <MonthlyComplianceMatrix
            contractYearSummary={contractYearSummary}
            contractBaseline={contractBaseline}
            filterMonth={matrixFilterMonth}
            filterMetricType={matrixFilterMetricType}
            onFilterChange={(m, t) => {
              setMatrixFilterMonth(m);
              setMatrixFilterMetricType(t);
            }}
          />

          {/* Detailed Over-Limit Events Log Table (带双向联动过滤) */}
          {(() => {
            const filteredEvents = contractYearSummary.overLimitEvents.filter(evt => {
              if (matrixFilterMonth && !evt.date.startsWith(matrixFilterMonth)) {
                return false;
              }
              if (matrixFilterMetricType && matrixFilterMetricType !== 'ALL') {
                if (matrixFilterMetricType === 'THROUGHPUT') {
                  return true;
                }
                if (evt.type !== matrixFilterMetricType) {
                  return false;
                }
              }
              return true;
            });

            const hasActiveFilter = Boolean(matrixFilterMonth || (matrixFilterMetricType && matrixFilterMetricType !== 'ALL'));

            // 获取指标类型名称映射
            const getTypeName = (code: string | null) => {
              switch (code) {
                case 'TEMP': return '循环平均温度 (TEMP)';
                case 'CRATE': return '放电倍率 (CRATE)';
                case 'SOC': return '平均SOC (SOC)';
                case 'DOD': return '最大放电深度 (DOD)';
                case 'CYCLE': return '循环次数 (CYCLE)';
                case 'THROUGHPUT': return '充放电量 (THROUGHPUT)';
                default: return '全部指标类型';
              }
            };

            return (
              <div id="over-limit-events-section" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 scroll-mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span>当前合同年超工况事件详细日志记录 (下钻分析)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      记录发生超温、超倍率、超深DOD、日均SOC超规划的具体事件与电池加速衰减机理分析。支持从上方矩阵点击直接联动。
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg font-mono">
                      展示 {filteredEvents.length} / 累计 {contractYearSummary.overLimitEvents.length} 条违约日志
                    </span>
                  </div>
                </div>

                {/* 联动筛选控制栏 (双向同步) */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <span>日志筛选:</span>
                    </span>

                    {/* 月份下拉 */}
                    <select
                      value={matrixFilterMonth || ''}
                      onChange={e => setMatrixFilterMonth(e.target.value ? e.target.value : null)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 text-xs font-mono font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">全部月份 (2026-01 ~ 2026-08)</option>
                      {['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'].map(m => (
                        <option key={m} value={m}>{m} ({m === '2026-07' ? '10条超限' : m === '2026-06' ? '5条超限' : m === '2026-08' ? '4条超限' : m === '2026-05' ? '3条超限' : '0条合规'})</option>
                      ))}
                    </select>

                    {/* 指标类型下拉 */}
                    <select
                      value={matrixFilterMetricType || 'ALL'}
                      onChange={e => setMatrixFilterMetricType(e.target.value === 'ALL' ? null : e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="ALL">全部超限类型</option>
                      <option value="TEMP">电芯工作温度超限 (TEMP · 8条)</option>
                      <option value="SOC">日平均SOC超合同规划 (SOC · 5条)</option>
                      <option value="CRATE">放电倍率超限 (CRATE · 3条)</option>
                      <option value="CYCLE">月度等效循环超限 (CYCLE · 3条)</option>
                      <option value="DOD">放电深度DOD超限 (DOD · 3条)</option>
                    </select>
                  </div>

                  {/* 激活状态下的提示与清除按钮 */}
                  {hasActiveFilter && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md text-[11px] font-medium">
                        <span>当前过滤:</span>
                        <strong className="font-mono">{matrixFilterMonth || '所有月份'}</strong>
                        <span>×</span>
                        <strong className="font-sans">{getTypeName(matrixFilterMetricType)}</strong>
                      </div>

                      <button
                        onClick={() => {
                          setMatrixFilterMonth(null);
                          setMatrixFilterMetricType(null);
                        }}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title="清除筛选条件恢复全量日志"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>清除筛选</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 日志表格或空态提示 */}
                {filteredEvents.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      当前筛选条件下无超限事件记录
                    </div>
                    <div className="text-[11px] text-slate-500 max-w-md mx-auto">
                      该月份/指标在合同基准窗口内运行合规，未触发加速老化与超工况考核违约。
                    </div>
                    <button
                      onClick={() => {
                        setMatrixFilterMonth(null);
                        setMatrixFilterMetricType(null);
                      }}
                      className="mt-2 px-3 py-1 bg-white hover:bg-slate-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      查看全量超工况日志 (22条)
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">序号</th>
                          <th className="py-2.5 px-3">发生日期</th>
                          <th className="py-2.5 px-3">超限指标类型</th>
                          <th className="py-2.5 px-3">实测记录值</th>
                          <th className="py-2.5 px-3">合同基准门槛</th>
                          <th className="py-2.5 px-3">超标偏离幅度</th>
                          <th className="py-2.5 px-3">质保与电芯损伤机理说明</th>
                          <th className="py-2.5 px-3 text-center">预警等级</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {filteredEvents.map(evt => (
                          <tr key={evt.id} className="hover:bg-red-50/20 transition-colors">
                            <td className="py-2.5 px-3 text-slate-500 font-sans">{evt.id}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">{evt.date}</td>
                            <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                              <span className="inline-flex items-center gap-1.5">
                                {evt.type === 'TEMP' && <Thermometer className="w-3.5 h-3.5 text-orange-500" />}
                                {evt.type === 'CRATE' && <Zap className="w-3.5 h-3.5 text-blue-500" />}
                                {evt.type === 'SOC' && <Activity className="w-3.5 h-3.5 text-emerald-500" />}
                                {evt.type === 'DOD' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                                {evt.type === 'CYCLE' && <RefreshCw className="w-3.5 h-3.5 text-purple-500" />}
                                <span>{evt.typeName}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-red-600 bg-red-50/80 px-2 rounded">
                              {evt.recordedValue}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{evt.contractLimit}</td>
                            <td className="py-2.5 px-3 font-black text-red-600">{evt.deviation}</td>
                            <td className="py-2.5 px-3 font-sans text-slate-600 max-w-md text-[11px] leading-relaxed">
                              {evt.impactDescription}
                            </td>
                            <td className="py-2.5 px-3 text-center font-sans">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  evt.severity === 'CRITICAL'
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {evt.severity === 'CRITICAL' ? '严重超限 (红)' : '轻度超限 (黄)'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 6: 年底灵活性能保证 SOH 临时手动评估与下年工况计划报价测算 */}
      {/* ========================================================================= */}
      {activeSubView === 6 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header & Mode Switcher */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  第 {interimAssessment.contractYear} 合同年年底灵活性能保证 SOH 临时手动评估与处置
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  提前预判干预
                </span>
              </div>
              <p className="text-xs text-slate-500">
                评估周期: {interimAssessment.startDate} 至 {interimAssessment.todayDate} (年底前预判) · 评估人: {interimAssessment.evaluator} · 基于年初至今实测超工况推算年底灵活性能保证状态。
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleTriggerInterimAssessment}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>重新执行临时评估测算</span>
              </button>

              <button
                onClick={handleArchiveInterimAssessment}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>归档临时评估表至报告中心</span>
              </button>
            </div>
          </div>

          {/* Intervention Strategy Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>后续履约调度干预策略模式 (影响年底预期灵活性能保证SOH推算)：</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'CURRENT_INERTIA',
                  title: '1. 现状惯性推演',
                  desc: '维持年初至今的充放电倍率与超温频次继续运行至年底。',
                  badge: '惯性基线'
                },
                {
                  id: 'CONSERVATIVE_PROTECT',
                  title: '2. 保守防护调控',
                  desc: '启动BMS温控强化与充放倍率限额保护，收敛后续超工况折损。',
                  badge: '质保止损'
                },
                {
                  id: 'AGGRESSIVE_UTILIZATION',
                  title: '3. 激进套利调度',
                  desc: '为迎峰度夏现货套利全力放宽倍率与循环，预估折损进一步增加。',
                  badge: '效益优先'
                }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setInterventionMode(opt.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    interventionMode === opt.id
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{opt.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      interventionMode === opt.id ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment KPI Metric Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">合同年底预期保证 SOH</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {interimAssessment.contractBaselineExpectedYearEndSoh}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">合同约定基准门槛</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">临时评估年底预期 SOH</div>
              <div className={`text-2xl font-black font-mono mt-1 ${
                interimAssessment.sohMarginVsBaseline >= 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {interimAssessment.interimEvaluatedYearEndSoh}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                较合同保证: <strong className={interimAssessment.sohMarginVsBaseline >= 0 ? 'text-emerald-600 font-mono' : 'text-amber-600 font-mono'}>
                  {interimAssessment.sohMarginVsBaseline >= 0 ? `+${interimAssessment.sohMarginVsBaseline}` : interimAssessment.sohMarginVsBaseline}%
                </strong>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">累计超工况扣减折损</div>
              <div className="text-2xl font-black font-mono text-red-600 mt-1">
                -{interimAssessment.deductionBreakdown.totalDeductionPct}%
              </div>
              <div className="text-[10px] text-red-500 mt-0.5">多因子加速老化折损</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">质保服务综合定级</div>
              <div className="text-base font-black text-indigo-700 mt-1 truncate">
                {interimAssessment.warrantyHealthLabel}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">基于当前干预模式评估</div>
            </div>
          </div>

          {/* Deduction Breakdown & Proactive Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500" />
                <span>超工况加速衰减折损归因拆解 (扣减明细)</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">超额等效循环折损</div>
                  <div className="text-base font-black font-mono text-slate-800 mt-0.5">
                    -{interimAssessment.deductionBreakdown.excessCyclesFatigueDeductionPct}%
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">超温工作累积折损</div>
                  <div className="text-base font-black font-mono text-slate-800 mt-0.5">
                    -{interimAssessment.deductionBreakdown.tempStressDeductionPct}%
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">超倍率充放折损</div>
                  <div className="text-base font-black font-mono text-slate-800 mt-0.5">
                    -{interimAssessment.deductionBreakdown.cratePolarizationDeductionPct}%
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">高SOC偏离滞留折损</div>
                  <div className="text-base font-black font-mono text-slate-800 mt-0.5">
                    -{interimAssessment.deductionBreakdown.highSocCalendarDeductionPct}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>提前加强质保服务处置方案建议</span>
              </h4>
              <div className="space-y-2">
                {interimAssessment.proactiveServiceRecommendations.map((rec, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 下一年工况计划、SOH预测与灵活性能保证服务报价测算 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{nextYearPlan.targetYearLabel} 计划工况协议与灵活性能保证服务报价测算</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  根据本年度实测工况与业主下一年运行需求，联动测算下年底 SOH 保证水平与差异化灵活性能保证服务报价。
                </p>
              </div>

              <button
                onClick={handleConfirmNextYearPlan}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
              >
                <Check className="w-4 h-4" />
                <span>确认并签署下一年计划工况协议</span>
              </button>
            </div>

            {/* Plan Types */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'CONSERVATIVE', title: '保守延寿型', desc: '300次/年 · 0.40C · 温控强化' },
                { type: 'BASELINE', title: '标准基准型', desc: '365次/年 · 0.50C · 标准运行' },
                { type: 'AGGRESSIVE', title: '激进现货套利型', desc: '450次/年 · 0.60C · 高负荷' },
                { type: 'CUSTOM', title: '自定义定制型', desc: '手动配置各项工况计划指标' }
              ].map(p => (
                <div
                  key={p.type}
                  onClick={() => setActivePlanType(p.type as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activePlanType === p.type
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{p.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Custom Inputs if active */}
            {activePlanType === 'CUSTOM' && (
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 text-[10px] mb-1">计划年循环 (EFC)</label>
                  <input
                    type="number"
                    value={customPlanParams.plannedAnnualCycles}
                    onChange={e => setCustomPlanParams(prev => ({ ...prev, plannedAnnualCycles: parseInt(e.target.value) || 365 }))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-1">充放倍率上限 (C)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={customPlanParams.plannedMaxCrate}
                    onChange={e => setCustomPlanParams(prev => ({ ...prev, plannedMaxCrate: parseFloat(e.target.value) || 0.5 }))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-1">最高允许工作温度 (℃)</label>
                  <input
                    type="number"
                    value={customPlanParams.plannedMaxTemp}
                    onChange={e => setCustomPlanParams(prev => ({ ...prev, plannedMaxTemp: parseFloat(e.target.value) || 35 }))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-1">放电深度 DOD (%)</label>
                  <input
                    type="number"
                    value={customPlanParams.plannedMaxDod}
                    onChange={e => setCustomPlanParams(prev => ({ ...prev, plannedMaxDod: parseFloat(e.target.value) || 90 }))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] mb-1">平均规划 SOC (%)</label>
                  <input
                    type="number"
                    value={customPlanParams.plannedAvgSoc}
                    onChange={e => setCustomPlanParams(prev => ({ ...prev, plannedAvgSoc: parseFloat(e.target.value) || 50 }))}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Pricing Breakdown & Client ROI Metrics */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">计划年循环</div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {nextYearPlan.plannedAnnualCycles} <span className="text-xs font-normal text-slate-400">次</span>
                  </div>
                  <div className="text-[10px] text-slate-400">倍率 {nextYearPlan.plannedMaxCrate}C</div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">预估下年底 SOH</div>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {nextYearPlan.projectedYearEndFlexibleSoh}%
                  </div>
                  <div className="text-[10px] text-slate-400">基准 {nextYearPlan.baselineYearEndSoh}%</div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">基础运维保障费</div>
                  <div className="text-base font-black font-mono text-white mt-1">
                    ¥{nextYearPlan.servicePricing.baseServiceFeeWan} <span className="text-xs font-normal text-slate-400">万/年</span>
                  </div>
                  <div className="text-[10px] text-slate-400">常规巡检与备件</div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">超工况风险附加费</div>
                  <div className="text-base font-black font-mono text-amber-400 mt-1">
                    ¥{nextYearPlan.servicePricing.excessStressSurchargeWan} <span className="text-xs font-normal text-slate-400">万/年</span>
                  </div>
                  <div className="text-[10px] text-slate-400">加速老化风险贴水</div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
                  <div className="text-[10px] text-slate-400">质保服务总报价</div>
                  <div className="text-xl font-black font-mono text-indigo-300 mt-1">
                    ¥{nextYearPlan.servicePricing.totalAnnualServiceFeeWan} <span className="text-xs font-normal text-slate-400">万/年</span>
                  </div>
                  <div className="text-[10px] text-indigo-400">全包式灵活性能保证</div>
                </div>

                <div className="bg-emerald-950/70 rounded-xl p-3 border border-emerald-600/50">
                  <div className="text-[10px] text-emerald-300">客户预计净收益</div>
                  <div className="text-xl font-black font-mono text-emerald-300 mt-1">
                    +¥{nextYearPlan.servicePricing.customerNetGainWan} <span className="text-xs font-normal text-emerald-200">万/年</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 truncate">现货套利扣除服务费</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
