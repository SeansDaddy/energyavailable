import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WarrantyConditionTab } from '../performance/WarrantyConditionTab';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Activity,
  HeartPulse,
  FileText,
  CheckCircle2
} from 'lucide-react';
import {
  DEFAULT_SOH_BASELINE_CURVE,
  getDefaultContractBaseline,
  downloadContractBaselineTemplate,
  downloadSohBaselineCurveTemplate,
  generateStationDailyAndMonthlyData,
  calculateFlexibleWarrantySohAlgorithm
} from '../../utils/flexibleWarrantyAlgorithm';
import { exportFlexibleWarrantyPdfReport } from '../../utils/flexibleWarrantyPdfReport';

interface SiteFlexibleWarrantyDetailViewProps {
  siteId: string;
  onBackToList: () => void;
  onSwitchSite: (siteId: string) => void;
}

export const SiteFlexibleWarrantyDetailView: React.FC<SiteFlexibleWarrantyDetailViewProps> = ({
  siteId,
  onBackToList,
  onSwitchSite
}) => {
  const { sites, navigateToPerformanceDetail } = useApp();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentSite = sites.find(s => s.id === siteId) || sites[0] || {
    id: siteId,
    siteCode: 'SZ-ESS-0042',
    siteName: '深圳光明储能电站二期-04号站',
    region: '华南区',
    representativeOffice: '深圳代表处',
    customer: '南方电网深圳供电局',
    capacityMw: 10.0,
    contractNo: 'CSG-SZ-2025-SLA-081'
  };

  const handleExportPdfReport = async () => {
    try {
      setIsExportingPdf(true);
      const baseline = getDefaultContractBaseline(
        currentSite.id,
        currentSite.capacityMw ? currentSite.capacityMw * 2 : 20.0
      );
      const { daily, monthly } = generateStationDailyAndMonthlyData(currentSite.id, baseline);
      const sohResult = calculateFlexibleWarrantySohAlgorithm(
        baseline,
        DEFAULT_SOH_BASELINE_CURVE,
        monthly,
        daily
      );
      await exportFlexibleWarrantyPdfReport({
        site: currentSite as any,
        contractBaseline: baseline,
        sohResult,
        monthlyConditions: monthly,
        dailyConditions: daily,
        sohBaselineCurve: DEFAULT_SOH_BASELINE_CURVE
      });
      setToastMsg(`《${currentSite.siteName} 灵活质保评估报告.pdf》已成功导出！`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error('PDF export failed', err);
      setToastMsg('导出评估报告失败，请重试');
      setTimeout(() => setToastMsg(null), 3500);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-[1700px] mx-auto pb-16 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Top Breadcrumb & Quick Site Switcher */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-all font-medium group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
            <span>返回全网灵活质保大盘</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-500">灵活质保工况评估</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-bold text-slate-900">{currentSite.siteName}</span>
        </div>

        {/* Quick site switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">切换站点:</span>
          <select
            value={siteId}
            onChange={e => onSwitchSite(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.siteName} ({s.siteCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top Header Bar with Site Ledger & Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {currentSite.siteName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                {currentSite.siteCode}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
                质保服务中 · 算法版本: v3.4.2
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              所属区域: <strong className="text-slate-700">{currentSite.region} / {currentSite.representativeOffice}</strong> · 装机容量: <strong className="text-slate-700">{currentSite.capacityMw} MW</strong> · 客户单位: <strong className="text-slate-700">{currentSite.customer}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          <button
            onClick={handleExportPdfReport}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-sm shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="将当前站点的灵活质保计算结果下载为PDF文档，含关键性能指标和计算逻辑说明"
          >
            <FileText className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-pulse' : ''}`} />
            <span>{isExportingPdf ? '正在生成PDF报告...' : '导出评估报告'}</span>
          </button>

          <button
            onClick={downloadContractBaselineTemplate}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="下载合同基准工况标准CSV模板"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>下载合同基准模板</span>
          </button>

          <button
            onClick={downloadSohBaselineCurveTemplate}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="下载SOH基准衰减曲线打点标准CSV模板"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>下载SOH曲线模板</span>
          </button>

          <button
            onClick={() => navigateToPerformanceDetail(currentSite.id)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="联动查看该站点的性能工况全面体检与因子分析"
          >
            <HeartPulse className="w-3.5 h-3.5 text-indigo-600" />
            <span>联动查看性能工况</span>
            <ExternalLink className="w-3 h-3 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* 3. The Comprehensive 5-Sub-Capability Flexible Warranty Workbench */}
      <WarrantyConditionTab site={currentSite as any} />
    </div>
  );
};
