import React, { useState } from 'react';
import { EvaluationTaskRecord } from '../../types/preSalesEvaluation';
import { PreSalesEvaluationReportModal } from './PreSalesEvaluationReportModal';
import {
  ArrowLeft,
  FileCheck2,
  Download,
  Share2,
  Calendar,
  Building,
  User,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Thermometer,
  Zap,
  DollarSign,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  Info,
  Sliders,
  Sparkles,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';

interface EvaluationTaskDetailViewProps {
  task: EvaluationTaskRecord;
  onBack: () => void;
  onCloneAndEdit?: (task: EvaluationTaskRecord) => void;
}

export const EvaluationTaskDetailView: React.FC<EvaluationTaskDetailViewProps> = ({
  task,
  onBack,
  onCloneAndEdit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'weather_pricing' | 'recommendations'>('overview');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const res = task.resultSnapshot;
  const input = task.inputSnapshot;
  const isHigh = res.riskLevel === 'HIGH';
  const isMed = res.riskLevel === 'MEDIUM';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="返回评估列表"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span className="hover:text-blue-600 cursor-pointer" onClick={onBack}>售前可用度评估</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-medium text-slate-700">{task.id}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">评估时间: {task.evaluatedAt}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {task.taskName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onCloneAndEdit && (
            <button
              type="button"
              onClick={() => onCloneAndEdit(task)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>基于此配置重新测算</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            id="btn-open-report-from-detail"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>预览与导出评估报告</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Expected Availability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">预期可用度</div>
          <div className="text-2xl font-black text-blue-700">{res.expectedAvailability}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">置信度: {res.confidenceLevel}%</div>
        </div>

        {/* Proposed SLA */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">拟承诺签约 SLA</div>
          <div className="text-2xl font-black text-slate-900">{task.proposedSla}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            差额: <span className={task.proposedSla > res.expectedAvailability ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              {(task.proposedSla - res.expectedAvailability).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Recommended SLA Interval */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">建议签约安全区间</div>
          <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
            [{res.recommendedSlaMin}%, {res.recommendedSlaMax}%]
          </div>
          <div className="text-[10px] text-emerald-600/80 mt-1">兼顾销售与零违约</div>
        </div>

        {/* Breach Risk Level */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">违约风险等级</div>
          <div className="mt-0.5">
            {isHigh ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> 高风险
              </span>
            ) : isMed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 中风险
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 低风险 (安全)
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">违约概率: {res.breachProbability}%</div>
        </div>

        {/* Interruption & MTTR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">年等效中断时长</div>
          <div className="text-xl font-bold text-slate-800">{res.annualEquivalentInterruptionHours}h/年</div>
          <div className="text-[10px] text-slate-400 mt-0.5">平均 MTTR: {res.expectedMttrHours}h</div>
        </div>

        {/* Annual Financial Exposure */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 mb-1">年化经济风险敞口</div>
          <div className="text-xl font-bold text-amber-700">¥{res.financialRisk?.totalAnnualFinancialExposure || 0}万</div>
          <div className="text-[10px] text-slate-400 mt-0.5">套利损 + 违约赔偿</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>测算结论与经济分析</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('devices')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'devices'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>站点规模与设备拓扑快照 ({input.devices.length}台套)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weather_pricing')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'weather_pricing'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>气象环境与电价经济参数</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'recommendations'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>SLA 合同防御与建议清单 ({res.recommendations.length}条)</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Reason banner */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
            isHigh
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isMed
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="shrink-0 mt-0.5">
              {isHigh || isMed ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm mb-0.5">风险评价与判定结论:</div>
              <p>{res.riskReason}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quantile Benchmark Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  可用度分位数行业对标分布
                </h3>
                <span className="text-[11px] text-slate-400">同区域历史样本 ({res.sampleCount}个)</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={res.quantileBenchmarks} margin={{ top: 15, right: 20, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[98.5, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      unit="%"
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, '可用度数值']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#cbd5e1' }}
                    />
                    <ReferenceLine y={task.proposedSla} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `拟签约: ${task.proposedSla}%`, fill: '#e11d48', fontSize: 10, position: 'top' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {res.quantileBenchmarks.map((entry, index) => {
                        let fill = '#94a3b8';
                        if (entry.isProposed) fill = '#f43f5e';
                        else if (entry.isRecommended) fill = '#10b981';
                        else if (entry.name.includes('均值')) fill = '#3b82f6';
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-xs bg-rose-500"></div>
                  <span>拟承诺 SLA: <strong>{task.proposedSla}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></div>
                  <span>推荐签约上限: <strong>{res.recommendedSlaMax}%</strong></span>
                </div>
              </div>
            </div>

            {/* Financial Risk & Electricity Impact */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  电价套利损失与 SLA 违约赔付测算
                </h3>
                <span className="text-[11px] text-slate-400">基于 {input.capacityMwh}MWh 装机测算</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/70">
                  <div className="text-[11px] text-amber-800 font-medium">满容量理论年套利放电收入</div>
                  <div className="text-lg font-bold text-amber-950 mt-0.5">
                    ¥{res.financialRisk?.annualTheoreticalRevenue || 0} 万元/年
                  </div>
                  <div className="text-[10px] text-amber-700/80 mt-0.5">
                    峰谷综合价差: {res.financialRisk?.peakValleySpread || 0} 元/kWh
                  </div>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200/70">
                  <div className="text-[11px] text-rose-800 font-medium">预期非计划停机套利折损</div>
                  <div className="text-lg font-bold text-rose-950 mt-0.5">
                    ¥{res.financialRisk?.annualOutageArbitrageLoss || 0} 万元/年
                  </div>
                  <div className="text-[10px] text-rose-700/80 mt-0.5">
                    不可用度占比: {(100 - res.expectedAvailability).toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200/70">
                  <div className="text-[11px] text-indigo-800 font-medium">SLA 违约索赔潜在发生额</div>
                  <div className="text-lg font-bold text-indigo-950 mt-0.5">
                    ¥{res.financialRisk?.annualPotentialBreachPenalty || 0} 万元/年
                  </div>
                  <div className="text-[10px] text-indigo-700/80 mt-0.5">
                    每 0.1% 缺口: {input.electricityPricing?.slaPenaltyPerTenthPercent || 5} 万元
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-lg">
                  <div className="text-[11px] text-slate-400 font-medium">年化综合经济风险敞口</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    ¥{res.financialRisk?.totalAnnualFinancialExposure || 0} 万元/年
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">停机损失与违约金合计</div>
                </div>
              </div>

              {/* Weather sensitivity breakdown */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 mb-2">气象因子敏感度折减明细:</div>
                <div className="space-y-1.5">
                  {res.weatherSensitivity.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">{w.factor}</span>
                      <span className="font-bold font-mono text-rose-600">{w.impactPct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Devices & Topology */}
      {activeTab === 'devices' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-500">组网冗余架构:</span>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{input.redundancy}</div>
              <div className="text-xs text-slate-500 mt-0.5">{input.topologyStructure}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">通信专网链路:</span>
              <div className="text-sm font-bold text-slate-800 mt-0.5">工业以太网 / 环网</div>
              <div className="text-xs text-slate-500 mt-0.5">{input.linkDescription}</div>
            </div>
            <div>
              <span className="text-xs text-slate-500">装机容量规模:</span>
              <div className="text-sm font-bold text-blue-700 mt-0.5">{input.capacityMw} MW / {input.capacityMwh} MWh</div>
              <div className="text-xs text-slate-500 mt-0.5">{input.industryScenario}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>站点核心设备清单快照</span>
              <span className="text-slate-400 font-normal">共 {input.devices.length} 项核心设备</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">设备类别</th>
                    <th className="py-2.5 px-3">规格型号</th>
                    <th className="py-2.5 px-3 text-center">数量</th>
                    <th className="py-2.5 px-3 text-right">单台功率 (kW)</th>
                    <th className="py-2.5 px-3 text-center">关键设备</th>
                    <th className="py-2.5 px-3 text-right">MTBF (小时)</th>
                    <th className="py-2.5 px-3 text-right">MTTR (小时)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {input.devices.map(dev => (
                    <tr key={dev.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{dev.typeName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{dev.model}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{dev.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{dev.ratedPowerKw}</td>
                      <td className="py-2.5 px-3 text-center">
                        {dev.isKeyDevice ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                            核心关键
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">辅助</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{dev.mtbfHours.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{dev.mttrHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Weather & Electricity Pricing */}
      {activeTab === 'weather_pricing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meteorological params */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-blue-600" />
              气象与地理环境基线
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">气温特征:</span>
                <div className="font-bold text-slate-800 mt-1">
                  {input.meteorological.minTempC}℃ ~ {input.meteorological.maxTempC}℃
                </div>
                <div className="text-[10px] text-slate-400">年均气温 {input.meteorological.avgTempC}℃</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">相对湿度:</span>
                <div className="font-bold text-slate-800 mt-1">{input.meteorological.relativeHumidityPct}%</div>
                <div className="text-[10px] text-slate-400">凝露与除湿负荷评估</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">海拔与降雨:</span>
                <div className="font-bold text-slate-800 mt-1">
                  {input.meteorological.altitudeMeters}m / {input.meteorological.rainfallMm}mm
                </div>
                <div className="text-[10px] text-slate-400">散热折减与绝缘防护</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500">腐蚀等级 / 雷暴:</span>
                <div className="font-bold text-slate-800 mt-1">
                  {input.meteorological.corrosionGrade} / {input.meteorological.stormFrequency}次每年
                </div>
                <div className="text-[10px] text-slate-400">防腐涂层与避雷器标号</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <strong>气象评估结论: </strong>{input.meteorological.notes || '该地区气候条件经模型综合评估，气象综合折减系数稳定。'}
            </div>
          </div>

          {/* Electricity Pricing Model */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              电价套利模型与违约金约定
            </h3>
            {input.electricityPricing ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">尖峰 / 平段 / 谷段电价:</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {input.electricityPricing.peakPrice} / {input.electricityPricing.flatPrice} / {input.electricityPricing.valleyPrice}
                  </div>
                  <div className="text-[10px] text-slate-400">单位: 元/kWh</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">充放电策略 & DOD:</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {input.electricityPricing.dailyCycles} 充 {input.electricityPricing.dailyCycles} 放
                  </div>
                  <div className="text-[10px] text-slate-400">放电深度 DOD: {input.electricityPricing.dischargeDepthDOD}%</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">度电放电补贴:</span>
                  <div className="font-bold text-emerald-700 mt-1">
                    +{input.electricityPricing.subsidyPerKwh} 元/kWh
                  </div>
                  <div className="text-[10px] text-slate-400">地方储能产业专项补贴</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">SLA 考核违约赔偿金:</span>
                  <div className="font-bold text-rose-700 mt-1">
                    ¥{input.electricityPricing.slaPenaltyPerTenthPercent} 万元
                  </div>
                  <div className="text-[10px] text-slate-400">每低于约定 SLA 0.1% 的年化罚款</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">采用标准参考电价模型</div>
            )}
            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-xs text-amber-900 leading-relaxed">
              <strong>经济履约建议: </strong>建议在售前技术协议中绑定非电网不可抗力引起的充放电计划调整豁免条款，防止电网限电计入可用度考核。
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">售前 SLA 防御建议与技术优化清单</h3>
            <span className="text-[11px] text-slate-400">依据 Rule R1 / R2' 规范生成</span>
          </div>

          <div className="space-y-3">
            {res.recommendations.map(rec => (
              <div key={rec.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      rec.priority === 'P0' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{rec.title}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {rec.potentialGain}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  {rec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      <PreSalesEvaluationReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={res}
        inputState={input}
      />
    </div>
  );
};
