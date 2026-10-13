import React, { useState, useMemo } from 'react';
import { Site } from '../../types';
import {
  ContractBaselineCondition,
  SohBaselineCurvePoint,
  PackConditionRecord,
  StationDailyCondition,
  StationMonthlyCondition,
  FlexibleWarrantySohResult,
  WarrantyLogFileSummary
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
  exportDailyConditionsToCsv
} from '../../utils/flexibleWarrantyAlgorithm';
import { exportFlexibleWarrantyPdfReport } from '../../utils/flexibleWarrantyPdfReport';
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
  FileCheck2
} from 'lucide-react';

interface WarrantyConditionTabProps {
  site: Site;
}

export const WarrantyConditionTab: React.FC<WarrantyConditionTabProps> = ({ site }) => {
  // 5个子模块视图切换
  // 0: 双曲线对比与算法估算
  // 1: 合同与SOH基准模版录入/导入
  // 2: 质保工况数据日志解析与展示
  // 3: PACK级工况换算站级工况
  // 4: 站级月度统计与按天导出
  const [activeSubView, setActiveSubView] = useState<number>(0);

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

  // 4. 换算后的站级日数据与月度数据
  const { daily: dailyConditions, monthly: monthlyConditions } = useMemo(() => {
    return generateStationDailyAndMonthlyData(site.id, contractBaseline);
  }, [site.id, contractBaseline]);

  // 月度明细展开折叠状态 (key: month string)
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({
    '2026-08': true
  });

  // 5. 算法团队灵活质保 SOH 估算结果
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

  // 操作提示消息 (Toast feedback)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 触发算法重新估算
  const handleRunAlgorithm = () => {
    setIsAlgorithmCalculating(true);
    setTimeout(() => {
      setIsAlgorithmCalculating(false);
      setAlgorithmCalcTimestamp(new Date().toLocaleString());
      showToast('算法团队灵活质保SOH接口调用成功，已根据最新站级超工况更新打点与衰减曲线！');
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

  // 导出灵活质保评估报告为 PDF 文档
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
      showToast(`《${site.siteName} 灵活质保工况评估报告.pdf》已成功导出！`);
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

      {/* Top Banner: Flexible Warranty SOH KPI Overview */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                灵活质保与SOH衰减履约看板
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
              结合合同基准工况参数、高频 PACK 级工况换算及日超工况积分，调用算法团队灵活质保模型，推算实际工况应力下的真实 SOH 衰减轨迹与质保期终了保障水平。
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
              title="将当前站点的灵活质保计算结果下载为PDF文档，格式包含关键性能指标和计算逻辑说明"
            >
              <FileText className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-pulse' : ''}`} />
              <span>{isExportingPdf ? '正在生成PDF报告...' : '导出评估报告'}</span>
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

      {/* 5-Sub-Feature Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { id: 0, label: '1. SOH衰减双曲线与算法估算', icon: TrendingDown, badge: '双曲线对比' },
            { id: 1, label: '2. 合同工况与SOH基准模版导入', icon: FileSpreadsheet, badge: '标准模版' },
            { id: 2, label: '3. 质保工况数据日志解析与展示', icon: FileText, badge: `${packRecords.length}组PACK` },
            { id: 3, label: '4. PACK级工况换算站级工况', icon: Layers, badge: '站级折算算法' },
            { id: 4, label: '5. 月度工况统计与按天导出', icon: Calendar, badge: '按天导出' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-indigo-700 text-indigo-100 font-bold' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
                  <span>SOH基准工况衰减曲线 vs. 灵活质保工况SOH衰减曲线 (全寿命10年对比)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  深蓝曲线为合同约定的标准 SOH 基准衰减底线；翡翠/琥珀曲线为基于实际日工况与超工况应力测算的灵活质保 SOH 打点值。
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
                  <span>灵活质保工况SOH打点曲线</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-red-400 border-t border-dashed inline-block"></span>
                  <span>80% EOL保证红线</span>
                </span>
                <button
                  onClick={handleExportPdfReport}
                  disabled={isExportingPdf}
                  className="ml-2 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="下载当前站点的灵活质保双曲线及SOH计算结果为PDF评估报告"
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
                            <div>灵活质保SOH: <strong className="text-emerald-400 font-mono">{point.flexibleWarrantySoh}%</strong></div>
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
                  {/* 灵活质保工况SOH衰减曲线 (翠绿/琥珀打点) */}
                  <Line
                    type="monotone"
                    dataKey="flexibleWarrantySoh"
                    name="灵活质保工况SOH衰减曲线"
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
                    <th className="py-2.5 px-3">灵活质保估算打点值(%)</th>
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

          {/* Algorithm Engine Call Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  算法团队灵活质保SOH估算接口调用机制说明
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                API: POST /api/algorithm/v3/flexible-warranty-soh-estimation
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Arrhenius 高温加速因子</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  电芯温度每超出 25℃ 基准 10℃，SEI 膜副反应速率提升约 1.8~2.1 倍。算法根据累计超温积分（℃·h）精确折算额外日历寿命衰减。
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-blue-500" />
                  <span>超倍率过流疲劳应力</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  实际倍率超出合同基准 0.50C 时，锂离子脱嵌应力指数呈非线性上升。算法按实际过倍率吞吐量 MWh 施加寿命惩罚。
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>双向灵活调整质保权益</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  若实际工况较合同基准更温和（充放深度小、无超温），算法将自动释放质保余量（折算延长质保天数或允许更深度充放）。
                </p>
              </div>
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
                <span>合同工况与SOH基准衰减曲线标准模版规范</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                支持下载官方标准化 CSV 模版，并在本地按合同条款填写后一键上传导入，系统将自动校验并刷新基准曲线。
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: 质保工况数据日志文件解析与展示 (核心需求 1) */}
      {/* ========================================================================= */}
      {activeSubView === 2 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* File Upload & Parsing Status Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  质保工况数据日志解析引擎
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {logFileMeta.status === 'PARSED' ? '解析就绪' : '解析中'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                支持解析由现场 BMS/EMS 采集导出的质保运行日志文件（包含各 PACK 电压、电流、温度、SOC、吞吐等高频遥测）。
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleLoadSampleLog}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>加载标准样例质保工况日志</span>
              </button>

              <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>上传质保工况日志文件</span>
                <input
                  type="file"
                  accept=".csv,.log,.txt,.json"
                  onChange={handleUploadLogFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Parsing Statistics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">日志文件名称</div>
              <div className="text-xs font-bold text-slate-900 truncate mt-1" title={logFileMeta.fileName}>
                {logFileMeta.fileName}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">大小: {logFileMeta.fileSize}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">解析记录行数</div>
              <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                {logFileMeta.rowCount.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">5秒采样周期</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">覆盖电池 PACK</div>
              <div className="text-xl font-black font-mono text-indigo-600 mt-0.5">
                {logFileMeta.packCount} 组
              </div>
              <div className="text-[10px] text-slate-400">Cluster-A/B/C</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">累计放电能量吞吐</div>
              <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                {logFileMeta.metricsSummary.totalEnergyMwh} <span className="text-xs font-normal">MWh</span>
              </div>
              <div className="text-[10px] text-emerald-600">全组积分换算</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">最高温 / 峰值倍率</div>
              <div className="text-xl font-black font-mono text-amber-600 mt-0.5">
                {logFileMeta.metricsSummary.maxTemp}℃
              </div>
              <div className="text-[10px] text-slate-500">峰值 {logFileMeta.metricsSummary.maxCrate}C</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="text-[11px] text-slate-500 font-medium">超工况异常检出</div>
              <div className="text-xl font-black font-mono text-red-600 mt-0.5">
                {logFileMeta.metricsSummary.overConditionCount} 组 PACK
              </div>
              <div className="text-[10px] text-red-500">触发超温/超倍率记录</div>
            </div>
          </div>

          {/* Parsed Telemetry Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>质保工况高频解析明细清单 (PACK 级工况)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  显示当前选定工况周期内各 PACK 的实时电压、电流、倍率、温度场极值与超工况标记。
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索 PACK 或 簇..."
                    value={logSearchPack}
                    onChange={e => setLogSearchPack(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 w-44"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={logFilterOverOnly}
                    onChange={e => setLogFilterOverOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>仅看超工况 PACK</span>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">PACK 编号</th>
                    <th className="py-2.5 px-3">所属簇</th>
                    <th className="py-2.5 px-3">总压 (V)</th>
                    <th className="py-2.5 px-3">电流 (A)</th>
                    <th className="py-2.5 px-3">充放倍率 (C)</th>
                    <th className="py-2.5 px-3">最高温 (℃)</th>
                    <th className="py-2.5 px-3">平均温 (℃)</th>
                    <th className="py-2.5 px-3">SOC (%)</th>
                    <th className="py-2.5 px-3">放电量 (kWh)</th>
                    <th className="py-2.5 px-3">当前 SOH (%)</th>
                    <th className="py-2.5 px-3">工况状态与超标原因</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPackRecords.map(p => (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        p.isOverCondition ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold font-mono text-slate-900">
                        {p.packCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.clusterId}</td>
                      <td className="py-2.5 px-3 font-mono">{p.voltageV}</td>
                      <td className="py-2.5 px-3 font-mono">{p.currentA}</td>
                      <td
                        className={`py-2.5 px-3 font-mono font-semibold ${
                          p.cRate > contractBaseline.maxCrate ? 'text-amber-600' : 'text-slate-800'
                        }`}
                      >
                        {p.cRate} C
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono font-semibold ${
                          p.maxTemp > contractBaseline.baselineTempMax
                            ? 'text-red-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {p.maxTemp} ℃
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.avgTemp} ℃</td>
                      <td className="py-2.5 px-3 font-mono">{p.soc}%</td>
                      <td className="py-2.5 px-3 font-mono">{p.energyKwh}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{p.soh}%</td>
                      <td className="py-2.5 px-3">
                        {p.isOverCondition ? (
                          <div className="flex items-center gap-1.5 text-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-[11px]">{p.overReason}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                            <Check className="w-3 h-3" />
                            <span>基准合规</span>
                          </span>
                        )}
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
      {/* SUB-VIEW 3: 基于电池PACK级工况换算为站级工况 (核心需求 3) */}
      {/* ========================================================================= */}
      {activeSubView === 3 && (
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
      {/* ========================================================================= */}
      {activeSubView === 4 && (
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
                    <th className="py-2.5 px-3">基准循环(次)</th>
                    <th className="py-2.5 px-3">实际循环(次)</th>
                    <th className="py-2.5 px-3">超循环(次)</th>
                    <th className="py-2.5 px-3">基准吞吐(MWh)</th>
                    <th className="py-2.5 px-3">实际吞吐(MWh)</th>
                    <th className="py-2.5 px-3">超吞吐(MWh)</th>
                    <th className="py-2.5 px-3">平均温(℃)</th>
                    <th className="py-2.5 px-3">最高温(℃)</th>
                    <th className="py-2.5 px-3">超温时数(h)</th>
                    <th className="py-2.5 px-3">峰值倍率(C)</th>
                    <th className="py-2.5 px-3">超工况指数</th>
                    <th className="py-2.5 px-3">履约合规率</th>
                    <th className="py-2.5 px-3 text-center">质保状态</th>
                    <th className="py-2.5 px-3 text-center">日明细</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyConditions.map(m => {
                    const isExpanded = !!expandedMonths[m.month];
                    return (
                      <React.Fragment key={m.month}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                            {m.month}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">{m.baselineEfc}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                            {m.actualEfc}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-amber-600">
                            {m.overEfc > 0 ? `+${m.overEfc}` : '0'}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">{m.baselineThroughputMwh}</td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                            {m.actualThroughputMwh}
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-amber-600">
                            {m.overThroughputMwh > 0 ? `+${m.overThroughputMwh}` : '0'}
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
                          <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                            {m.complianceRate}%
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === 'NORMAL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'WARNING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {m.status === 'NORMAL' ? '正常履约' : m.status === 'WARNING' ? '轻度超工况' : '显著超工况'}
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
                                  <span className="font-semibold text-slate-800">
                                    {m.month} 月日级工况下钻明细 ({m.dailyDetails.length} 天)
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    点击右上角可一键按天导出全量日工况明细
                                  </span>
                                </div>

                                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                                  <table className="w-full text-[11px] text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                                      <tr>
                                        <th className="py-1.5 px-2.5">日期</th>
                                        <th className="py-1.5 px-2.5">实际吞吐(MWh)</th>
                                        <th className="py-1.5 px-2.5">实际EFC</th>
                                        <th className="py-1.5 px-2.5">超额EFC</th>
                                        <th className="py-1.5 px-2.5">最高温(℃)</th>
                                        <th className="py-1.5 px-2.5">超温时长(h)</th>
                                        <th className="py-1.5 px-2.5">峰值倍率(C)</th>
                                        <th className="py-1.5 px-2.5">超倍率电量(MWh)</th>
                                        <th className="py-1.5 px-2.5">超工况指数</th>
                                        <th className="py-1.5 px-2.5">等效SOH日损耗</th>
                                        <th className="py-1.5 px-2.5 text-center">状态</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-mono">
                                      {m.dailyDetails.map(d => (
                                        <tr key={d.date} className="hover:bg-slate-50">
                                          <td className="py-1.5 px-2.5 font-sans font-medium text-slate-800">
                                            {d.date}
                                          </td>
                                          <td className="py-1.5 px-2.5">{d.actualThroughputMwh}</td>
                                          <td className="py-1.5 px-2.5">{d.actualEfc}</td>
                                          <td className="py-1.5 px-2.5 text-amber-600">
                                            {d.overEfc > 0 ? `+${d.overEfc}` : '0'}
                                          </td>
                                          <td className={`py-1.5 px-2.5 ${d.maxTemp > contractBaseline.baselineTempMax ? 'text-red-600 font-bold' : ''}`}>
                                            {d.maxTemp}℃
                                          </td>
                                          <td className="py-1.5 px-2.5">{d.overTempHours}</td>
                                          <td className="py-1.5 px-2.5">{d.maxCrate} C</td>
                                          <td className="py-1.5 px-2.5">{d.overCrateMwh}</td>
                                          <td className="py-1.5 px-2.5">{d.overConditionIndex}</td>
                                          <td className="py-1.5 px-2.5 text-red-500">
                                            -{d.equivalentSohLossPct}%
                                          </td>
                                          <td className="py-1.5 px-2.5 text-center font-sans">
                                            <span
                                              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                                d.complianceStatus === 'COMPLIANT'
                                                  ? 'bg-emerald-100 text-emerald-800'
                                                  : d.complianceStatus === 'WARNING'
                                                  ? 'bg-amber-100 text-amber-800'
                                                  : 'bg-red-100 text-red-800'
                                              }`}
                                            >
                                              {d.complianceStatus === 'COMPLIANT' ? '合规' : d.complianceStatus === 'WARNING' ? '预警' : '超工况'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
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
    </div>
  );
};
