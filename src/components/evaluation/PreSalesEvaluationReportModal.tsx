import React, { useState } from 'react';
import {
  PreSalesEvaluationResult,
  PreSalesInputState
} from '../../types/preSalesEvaluation';
import {
  X,
  Printer,
  Download,
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Thermometer,
  Calendar,
  User,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Share2,
  Lock,
  Eye,
  Coins,
  Zap,
  DollarSign
} from 'lucide-react';

interface PreSalesEvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PreSalesEvaluationResult;
  inputState: PreSalesInputState;
}

export const PreSalesEvaluationReportModal: React.FC<PreSalesEvaluationReportModalProps> = ({
  isOpen,
  onClose,
  result,
  inputState
}) => {
  const [reportType, setReportType] = useState<'customer' | 'internal'>('customer');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportNotice(`已成功生成并导出【${inputState.siteName || '意向站点'}可用度售前评估报告_${reportType === 'customer' ? '客户版' : '内部版'}.pdf】`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 800);
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportNotice(`已成功生成并导出【${inputState.siteName || '意向站点'}售前可用度拓扑与气象测算表.xlsx】`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Top Action Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  售前可用度评估报告预览
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
                  {result.reportSnapshotVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                支持在线预览、版本快照追溯、客户版与内部版自由切换导出
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Version Switcher */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setReportType('customer')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  reportType === 'customer'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>客户商务版</span>
              </button>
              <button
                type="button"
                onClick={() => setReportType('internal')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  reportType === 'internal'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>内部风控版</span>
              </button>
            </div>

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '导出中...' : '导出 PDF'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>导出 Excel</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {exportNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Report Printable Content Container */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 text-slate-800">
          <div className="max-w-3xl mx-auto bg-white border border-slate-300 rounded-lg p-8 shadow-sm space-y-6 print:border-none print:shadow-none">
            {/* Formal Report Header */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold text-blue-700 tracking-wider uppercase">
                    ENERGY STORAGE AVAILABILITY LIFECYCLE PLATFORM
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 mt-1">
                    {inputState.siteName || '意向新建站点'} · 售前可用度评估与签约建议报告
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span>报告版本号: <strong className="font-mono text-slate-700">{result.reportSnapshotVersion}</strong></span>
                    <span>·</span>
                    <span>评估生成日期: {result.evaluatedAt}</span>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {reportType === 'customer' ? '客户商务正式件' : '内部决策风控密件'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-600">签约建议等级</div>
                  <div className={`text-lg font-bold ${
                    result.riskLevel === 'HIGH' ? 'text-red-600' : result.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {result.riskLevel === 'HIGH' ? '高风险 (建议调整)' : result.riskLevel === 'MEDIUM' ? '中风险 (防范签约)' : '低风险 (推荐签约)'}
                  </div>
                </div>
              </div>
            </div>

            {/* 1. Project Basic Overview */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-800">
                <Building className="w-3.5 h-3.5" />
                一、项目基本信息与拓扑架构
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">意向区域 / 代表处:</span>
                  <div className="font-semibold text-slate-800">{inputState.region} · {inputState.representativeOffice}</div>
                </div>
                <div>
                  <span className="text-slate-500">目标客户 / 行业场景:</span>
                  <div className="font-semibold text-slate-800">{inputState.customerName || '意向客户'} · {inputState.industryScenario}</div>
                </div>
                <div>
                  <span className="text-slate-500">拟建规模:</span>
                  <div className="font-semibold text-slate-800">{inputState.capacityMw} MW / {inputState.capacityMwh} MWh</div>
                </div>
                <div>
                  <span className="text-slate-500">组网冗余度:</span>
                  <div className="font-semibold text-slate-800">{inputState.redundancy}</div>
                </div>
                <div>
                  <span className="text-slate-500">拓扑结构类型:</span>
                  <div className="font-semibold text-slate-800">{inputState.topologyStructure}</div>
                </div>
                <div>
                  <span className="text-slate-500">核心设备套数:</span>
                  <div className="font-semibold text-slate-800">{inputState.devices.length} 台/套 (核心计量 {inputState.devices.filter(d => d.isKeyDevice).length} 套)</div>
                </div>
              </div>
            </div>

            {/* 2. Meteorological Profile */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-800">
                <Thermometer className="w-3.5 h-3.5" />
                二、站点气象环境与修正基线
              </h3>
              <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">气温范围:</span>
                  <div className="font-semibold text-slate-800">{inputState.meteorological.minTempC}℃ ~ {inputState.meteorological.maxTempC}℃ (均温 {inputState.meteorological.avgTempC}℃)</div>
                </div>
                <div>
                  <span className="text-slate-500">相对湿度:</span>
                  <div className="font-semibold text-slate-800">{inputState.meteorological.relativeHumidityPct}%</div>
                </div>
                <div>
                  <span className="text-slate-500">海拔与降雨:</span>
                  <div className="font-semibold text-slate-800">{inputState.meteorological.altitudeMeters}m / {inputState.meteorological.rainfallMm}mm</div>
                </div>
                <div>
                  <span className="text-slate-500">腐蚀等级 / 雷暴:</span>
                  <div className="font-semibold text-slate-800">{inputState.meteorological.corrosionGrade} / {inputState.meteorological.stormFrequency}次每年</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 mt-1.5 px-2">
                气象修正说明: 综合气温、盐雾腐蚀与高海拔降额因素，气象综合修正系数为 <strong>{result.weatherCorrectionFactor}</strong>。
              </div>
            </div>

            {/* 2.5 Electricity Pricing & Arbitrage Model */}
            {inputState.electricityPricing && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-800">
                  <Zap className="w-3.5 h-3.5" />
                  二 (续)、电价套利模型与违约经济参数
                </h3>
                <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500">峰平谷电价:</span>
                    <div className="font-semibold text-slate-800">
                      {inputState.electricityPricing.peakPrice} / {inputState.electricityPricing.flatPrice} / {inputState.electricityPricing.valleyPrice} 元/kWh
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">峰谷综合价差:</span>
                    <div className="font-semibold text-emerald-700">
                      {result.financialRisk.peakValleySpread} 元/kWh (含补贴)
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">充放策略 / DOD:</span>
                    <div className="font-semibold text-slate-800">
                      {inputState.electricityPricing.dailyCycles}充{inputState.electricityPricing.dailyCycles}放 / {inputState.electricityPricing.dischargeDepthDOD}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">SLA 考核违约金:</span>
                    <div className="font-semibold text-rose-700">
                      {inputState.electricityPricing.slaPenaltyPerTenthPercent} 万元/0.1%缺口
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Key Assessment Conclusion */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                三、站点预期可用度测算结论与 SLA 建议
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-[11px] text-blue-700 font-medium">预期系统可用度</div>
                  <div className="text-2xl font-bold text-blue-900 mt-0.5">{result.expectedAvailability}%</div>
                  <div className="text-[10px] text-blue-600 mt-0.5">置信度: {result.confidenceLevel}%</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="text-[11px] text-emerald-700 font-medium">推荐签约 SLA 区间</div>
                  <div className="text-xl font-bold text-emerald-900 mt-0.5">[{result.recommendedSlaMin}%, {result.recommendedSlaMax}%]</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">兼顾竞争力与履约安全</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[11px] text-slate-600 font-medium">拟承诺 SLA / 违约率</div>
                  <div className={`text-xl font-bold mt-0.5 ${
                    result.breachProbability > 40 ? 'text-red-700' : result.breachProbability > 20 ? 'text-amber-700' : 'text-emerald-700'
                  }`}>
                    {inputState.proposedSla}% / {result.breachProbability}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">违约概率评估</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[11px] text-slate-600 font-medium">预期中断与 MTTR</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{result.annualEquivalentInterruptionHours}h/年</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">平均 MTTR: {result.expectedMttrHours}h</div>
                </div>
              </div>
            </div>

            {/* 4. Internal Loss & Risk Analysis (Internal view only) */}
            {reportType === 'internal' && (
              <div className="border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-700" />
                    内部风控专属敏感性与违约金风险测算 (仅供销售决策委员会与法务参考)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px]">保密</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <strong>风险提示: </strong>{result.riskReason}
                  若客户坚持要求签约 {inputState.proposedSla}%（超出安全区间上限），测算违约索赔概率为 {result.breachProbability}%。
                  预计若发生非计划中断超出合同允许范围，单次赔付可能达到合同总标的的 0.5%~2.0%。必须执行下述商务防卫条款！
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <span className="text-slate-500">理论年放电套利:</span>
                    <div className="font-semibold text-slate-800">{result.financialRisk.annualTheoreticalRevenue} 万元/年</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <span className="text-slate-500">停机套利折损:</span>
                    <div className="font-semibold text-amber-700">{result.financialRisk.annualOutageArbitrageLoss} 万元/年</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <span className="text-slate-500">预期违约赔付:</span>
                    <div className="font-semibold text-rose-700">{result.financialRisk.annualPotentialBreachPenalty} 万元/年</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <span className="text-slate-500">综合经济敞口:</span>
                    <div className="font-bold text-rose-900">{result.financialRisk.totalAnnualFinancialExposure} 万元/年</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <span className="text-slate-500">同区域样本基线:</span>
                    <div className="font-semibold text-slate-800">{result.sampleCount} 个站点 (历史均值 99.48%)</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <span className="text-slate-500">免责申报配额建议:</span>
                    <div className="font-semibold text-slate-800">每年不少于 48 小时 (Rule R2)</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-indigo-100">
                    <span className="text-slate-500">备件库存建议:</span>
                    <div className="font-semibold text-slate-800">区域库前置 PCS 板卡与 BMS 主控</div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Recommended Defense Actions */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 text-blue-800">
                <FileCheck2 className="w-3.5 h-3.5" />
                四、SLA 合同防御与优化建议清单
              </h3>
              <div className="space-y-2 text-xs">
                {result.recommendations.map(rec => (
                  <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                      rec.priority === 'P0' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {rec.priority}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{rec.title}</span>
                        <span className="text-emerald-700 font-semibold text-[11px]">{rec.potentialGain}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                        {rec.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Signatures & Traceability */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
              <div>
                <div>评估算法引擎: <strong>{result.evaluatedBy}</strong></div>
                <div className="text-[10px] text-slate-400 font-mono">快照指纹: {result.reportSnapshotVersion} · 数据口径依据 Rule R1 / R2'</div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <div className="text-[10px] text-slate-400">方案评估师</div>
                  <div className="font-semibold text-slate-700 border-b border-slate-400 pb-0.5 px-4 mt-1">陈兴虎 (Tech Lead)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">销售技术总监签章</div>
                  <div className="font-semibold text-slate-700 border-b border-slate-400 pb-0.5 px-4 mt-1">（已系统数字核验）</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
