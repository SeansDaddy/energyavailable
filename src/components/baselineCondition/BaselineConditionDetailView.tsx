import React, { useState } from 'react';
import { BaselineEvaluationTaskRecord } from '../../types/baselineConditionEvaluation';
import { BaselineConditionReportModal } from './BaselineConditionReportModal';
import { InterimYearEndAssessmentPanel } from './InterimYearEndAssessmentPanel';
import { NextYearConditionPlanPanel } from './NextYearConditionPlanPanel';
import {
  ArrowLeft,
  FileCheck2,
  Download,
  Share2,
  Copy,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Building,
  Zap,
  Calendar,
  Thermometer,
  Layers,
  Coins,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export type BaselineDetailSubTab = 'baseline' | 'interim_eval' | 'next_year_plan';

interface BaselineConditionDetailViewProps {
  task: BaselineEvaluationTaskRecord;
  onBackToList: () => void;
  onCloneAndEdit?: (task: BaselineEvaluationTaskRecord) => void;
  initialTab?: BaselineDetailSubTab;
}

export const BaselineConditionDetailView: React.FC<BaselineConditionDetailViewProps> = ({
  task,
  onBackToList,
  onCloneAndEdit,
  initialTab = 'baseline'
}) => {
  const [activeTab, setActiveTab] = useState<BaselineDetailSubTab>(initialTab);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const { input, result } = task;

  const isLow = result.riskLevel === 'LOW';
  const isHigh = result.riskLevel === 'HIGH';

  return (
    <div className="space-y-4">
      {/* 顶部导航与操作栏 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="返回评估列表"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {task.taskNo}
              </span>
              <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                {task.taskName}
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isLow
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isHigh
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isLow ? '低风险 (达标安全)' : isHigh ? '高风险 (超工况跌破)' : '中风险 (临界关注)'}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
              <span>电站：{task.siteName}</span>
              <span>·</span>
              <span>客户：{task.customerName}</span>
              <span>·</span>
              <span>评估人：{task.creator}</span>
              <span>·</span>
              <span className="font-mono">{task.updatedAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCloneAndEdit && (
            <button
              onClick={() => onCloneAndEdit(task)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>克隆微调工况</span>
            </button>
          )}

          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>查看并导出官方签约报告</span>
          </button>
        </div>
      </div>

      {/* 3 大核心功能子页签切换栏 */}
      <div className="bg-white px-3 pt-2 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab('baseline')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer border-b-2 -mb-px ${
              activeTab === 'baseline'
                ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>基准工况全景评估与SLA</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
              10年衰减基准
            </span>
          </button>

          <button
            onClick={() => setActiveTab('interim_eval')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer border-b-2 -mb-px ${
              activeTab === 'interim_eval'
                ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>⚡ 年底SOH临时手动评估</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
              提前加强质保服务
            </span>
          </button>

          <button
            onClick={() => setActiveTab('next_year_plan')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer border-b-2 -mb-px ${
              activeTab === 'next_year_plan'
                ? 'border-blue-600 text-blue-600 bg-blue-50/60 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>📋 下一年工况计划与质保服务报价</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
              规划与测算确定
            </span>
          </button>
        </div>
      </div>

      {/* 子页签 1: 基准工况全景评估 */}
      {activeTab === 'baseline' && (
        <div className="space-y-4">
          {/* 核心指标 KPI 仪表盘 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] text-slate-500">质保期末预测 SOH</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {result.endOfWarrantyProjectedSohPct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">第 {input.warrantyPeriodYears} 年期末预期</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] text-slate-500">合同保证底线 SOH</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {result.contractGuaranteedEndSohPct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">SLA 违约清算阈值</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] text-slate-500">质保安全裕度</div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              result.sohSafetyMarginPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {result.sohSafetyMarginPct >= 0 ? `+${result.sohSafetyMarginPct}%` : `${result.sohSafetyMarginPct}%`}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {result.isCompliant ? '完全达标 (允许签约)' : `预计第${result.expectedBreachYear}年跌破`}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] text-slate-500">最大容忍年循环数</div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            {result.maxTolerableAnnualCycles}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">FEC/年 (当前设置: {Math.round(input.dailyFullEquivalentCycles * input.annualOperatingDays)})</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] text-slate-500">建议电芯置换年份</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">
            第 {result.optimalSwapWindowYear} 年
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">最优经济性重构窗口</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] text-slate-500">基础灵活性能保证合同额</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ¥ {result.financialAssessment.baseWarrantyContractTotalYuan} 万
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">单价: {input.warrantyPricingPerWhPerYear}元/Wh·年</div>
        </div>
      </div>

      {/* 综合结论说明卡片 */}
      <div
        className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 shadow-2xs ${
          result.isCompliant
            ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
            : 'bg-rose-50/70 border-rose-200/80 text-rose-900'
        }`}
      >
        <span className="p-2 rounded-lg bg-white shrink-0 shadow-2xs">
          {result.isCompliant ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          )}
        </span>
        <div className="flex-1">
          <div className="font-bold text-sm">
            {result.isCompliant ? '基准工况评估通过：具备优质承保性' : '基准工况评估预警：存在超负荷工况老化风险'}
          </div>
          <p className="mt-1 text-xs opacity-90 leading-relaxed">
            {result.riskSummary}
          </p>
        </div>
      </div>

      {/* 中部图表与应力归因分解 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧：SOH 衰减趋势曲线图 (7 栏) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                SOH 全生命周期衰减曲线对比与合规边界
              </h3>
              <p className="text-[11px] text-slate-400">
                对比实验室标称、合同保证底线、基准工况预测与恶劣超工况曲线
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">单位: % SOH</span>
          </div>

          <div className="h-64 w-full bg-slate-50/40 rounded-lg p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.annualSohTrend}
                margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => (v === 0 ? '投运' : `${v}年`)}
                />
                <YAxis domain={[55, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`${value}%`]}
                  labelFormatter={(label) => `第 ${label} 年 (${parseInt(input.commissioningDate.substring(0,4)||'2026', 10) + Number(label)}年)`}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line
                  type="monotone"
                  dataKey="idealLabSohPct"
                  name="实验室标称"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="contractGuaranteedSohPct"
                  name="合同保证底线 (SLA)"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="projectedBaselineSohPct"
                  name="本次工况预测"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="worstCaseStressSohPct"
                  name="恶劣超工况预测"
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 右侧：4 项超工况应力项归因分解 (5 栏) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              超工况加速老化应力归因分解
            </h3>
            <p className="text-[11px] text-slate-400">
              基于运行温度、充放电倍率、放电深度及循环频次定量核算
            </p>
          </div>

          <div className="space-y-2.5">
            {result.stressFactors.map((item) => (
              <div
                key={item.factorKey}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.severity === 'ALARM'
                          ? 'bg-rose-500'
                          : item.severity === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    ></span>
                    <span>{item.factorName}</span>
                  </div>
                  <span className="font-mono text-slate-600 font-bold">
                    应力加权: {item.stressWeight}x
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>评估输入: {item.projectedValue}</span>
                  <span
                    className={`font-semibold ${
                      item.severity === 'ALARM'
                        ? 'text-rose-600'
                        : item.severity === 'WARNING'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    负向影响: -{item.impactSohReductionPct}% SOH
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed bg-white p-1.5 rounded border border-slate-100">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 逐年详细推演数据表格 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            逐年 SOH 衰减推演详细数据表 (履约核验台账)
          </div>
          <span className="text-[11px] text-slate-400 font-mono">共 {result.annualSohTrend.length} 个年际测算节点</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">年份</th>
                <th className="py-2.5 px-3">自然日历年</th>
                <th className="py-2.5 px-3">累计循环 (FEC)</th>
                <th className="py-2.5 px-3">累计吞吐量 (MWh)</th>
                <th className="py-2.5 px-3">实验室标称 SOH</th>
                <th className="py-2.5 px-3">合同保证底线 SOH</th>
                <th className="py-2.5 px-3">工况预测 SOH</th>
                <th className="py-2.5 px-3">恶劣超工况 SOH</th>
                <th className="py-2.5 px-3 text-right">安全裕度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.annualSohTrend.map((row) => {
                const margin = Number((row.projectedBaselineSohPct - row.contractGuaranteedSohPct).toFixed(2));
                return (
                  <tr key={row.year} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-700">
                      {row.year === 0 ? '投运起始 (第0年)' : `第 ${row.year} 年`}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500">{row.calendarYear}</td>
                    <td className="py-2 px-3 font-mono text-slate-800">{row.accumulatedCycles.toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-slate-800">{row.accumulatedThroughputMwh.toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{row.idealLabSohPct}%</td>
                    <td className="py-2 px-3 font-mono font-semibold text-rose-600">{row.contractGuaranteedSohPct}%</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{row.projectedBaselineSohPct}%</td>
                    <td className="py-2 px-3 font-mono text-amber-600">{row.worstCaseStressSohPct}%</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">
                      <span className={margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {margin >= 0 ? `+${margin}%` : `${margin}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 质保合同商务与风控条款建议 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              质保合同定制化关键风控与免责条款建议
            </h3>
            <p className="text-[11px] text-slate-400">
              依据本次基准工况应力测算结果，为业务与法务部门提供标准化对赌及保护条款
            </p>
          </div>
          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            推荐采纳 4 项条款
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.clauseRecommendations.map((clause, idx) => (
            <div
              key={clause.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {clause.clauseTitle}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                    {clause.categoryLabel}
                  </span>
                </div>
                <p className="mt-2 text-slate-700 leading-relaxed text-[11px] font-serif bg-white p-2 rounded border border-slate-100">
                  "{clause.clauseContent}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-emerald-700 font-medium">
                风控保护价值：{clause.riskMitigationValue}
              </div>
            </div>
          ))}
          </div>
        </div>
        </div>
      )}

      {/* 子页签 2: 年底SOH临时手动评估 */}
      {activeTab === 'interim_eval' && (
        <InterimYearEndAssessmentPanel
          task={task}
          onGoToNextYearPlan={() => setActiveTab('next_year_plan')}
        />
      )}

      {/* 子页签 3: 下一年工况计划与质保服务报价 */}
      {activeTab === 'next_year_plan' && (
        <NextYearConditionPlanPanel
          task={task}
          onBackToInterimAssessment={() => setActiveTab('interim_eval')}
        />
      )}

      {/* 报告预览弹窗 */}
      {showReportModal && (
        <BaselineConditionReportModal
          task={task}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
