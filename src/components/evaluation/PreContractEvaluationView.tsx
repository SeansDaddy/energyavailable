import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RedundancyLevel } from '../../types';
import {
  FileCheck2,
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Download,
  Info,
  TrendingUp,
  Layers,
  CheckCircle2,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export const PreContractEvaluationView: React.FC = () => {
  // Input parameters
  const [region, setRegion] = useState('华东区');
  const [customerType, setCustomerType] = useState('钢铁重工业微网');
  const [capacityMw, setCapacityMw] = useState<number>(20);
  const [redundancy, setRedundancy] = useState<RedundancyLevel>('DUAL_HOT_BACKUP');
  const [proposedSla, setProposedSla] = useState<number>(99.50);

  // Result state
  const [hasEvaluated, setHasEvaluated] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRunEvaluation = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setHasEvaluated(true);
    }, 400);
  };

  // Mock benchmark comparisons
  const benchmarkData = [
    { name: '同区域同类站点均值', value: 99.48 },
    { name: 'P90 分位可用度', value: 99.62 },
    { name: 'P95 分位可用度', value: 99.21 },
    { name: '本次拟承诺 SLA', value: proposedSla },
    { name: 'AI 推荐安全签约阈值', value: 99.30 }
  ];

  // Risk evaluation logic
  const isHighRisk = proposedSla > 99.55;
  const isMediumRisk = proposedSla > 99.35 && proposedSla <= 99.55;

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              签约前可用度参考评估 (销售决策支持)
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              管理口径风险模型 (R1)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            签约前依据同区域、同类组网与历史同规格站点的真实运行数据，为销售人员提供科学的 SLA 承诺阈值建议与违约风险防范。
          </p>
        </div>

        <button
          onClick={() => window.alert('已成功生成并下载【可用度签约前参考评估意见书.pdf】')}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>导出评估意见书 (PDF)</span>
        </button>
      </div>

      {/* Input Parameters Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          拟签约意向站点参数配置
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">意向归属区域</label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="华东区">华东区 (历史达标率 98.6%)</option>
              <option value="华南区">华南区 (历史达标率 97.4%)</option>
              <option value="华北区">华北区 (历史达标率 96.2%)</option>
              <option value="西北区">西北区 (历史达标率 94.8%)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">客户行业场景</label>
            <select
              value={customerType}
              onChange={e => setCustomerType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="钢铁重工业微网">钢铁重工业微网 (电网波动大)</option>
              <option value="电网侧独立储能">电网侧独立储能 (调频调峰)</option>
              <option value="工商业园区储能">工商业园区储能 (负荷稳定)</option>
              <option value="风光储多能互补站">风光储多能互补站 (极寒/高海拔)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">拟建装机容量 (MW)</label>
            <input
              type="number"
              value={capacityMw}
              onChange={e => setCapacityMw(parseFloat(e.target.value) || 10)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">拟定组网冗余度</label>
            <select
              value={redundancy}
              onChange={e => setRedundancy(e.target.value as RedundancyLevel)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="DUAL_HOT_BACKUP">双机热备 (推荐)</option>
              <option value="N_PLUS_1">N+1 单元热备</option>
              <option value="RING_TOPOLOGY">光纤自愈环网</option>
              <option value="MULTI_ACTIVE">多活负荷分担</option>
              <option value="NONE">单机无冗余 (高风险)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              拟承诺 SLA 阈值 (%) <span className="text-blue-600 font-mono">*</span>
            </label>
            <input
              type="number"
              step="0.05"
              value={proposedSla}
              onChange={e => setProposedSla(parseFloat(e.target.value) || 99.5)}
              className="w-full bg-white border border-blue-500 rounded-lg px-3 py-2 text-blue-600 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-sm"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={handleRunEvaluation}
            disabled={isCalculating}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 text-xs transition-colors"
          >
            {isCalculating ? (
              <span>模型计算中...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>基于全网历史样本运行评估</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Results */}
      {hasEvaluated && (
        <div className="space-y-5 animate-in fade-in">
          {/* Main Assessment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Recommendation Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>建议签约 SLA 阈值</span>
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">
                99.30% ~ 99.40%
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                基于所选【{region}】同类 3,800+ 站点近 12 个月稳定运行统计，在此区间内违约概率 &lt; 2.5%。
              </p>
            </div>

            {/* Risk Level Card */}
            <div
              className={`border rounded-lg p-5 shadow-sm ${
                isHighRisk
                  ? 'bg-red-50/50 border-red-200'
                  : isMediumRisk
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-emerald-50/50 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className={isHighRisk ? 'text-red-700' : isMediumRisk ? 'text-amber-700' : 'text-emerald-700'}>
                  当前承诺违约风险评级
                </span>
              </div>
              <div
                className={`text-3xl font-black font-mono ${
                  isHighRisk
                    ? 'text-red-600'
                    : isMediumRisk
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {isHighRisk ? '高风险 (High Risk)' : isMediumRisk ? '中风险 (Caution)' : '低风险 (Safe)'}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isHighRisk
                  ? `拟承诺 ${proposedSla}% 显著高于同类 P95 统计水准 (99.21%)，极易因突发单次 PCS 中断导致违约索赔。`
                  : isMediumRisk
                  ? `拟承诺 ${proposedSla}% 处于合理上沿，建议在合同中明确扣减计划内维护 (R2) 与电网不可抗力停机条款。`
                  : `拟承诺 ${proposedSla}% 处于安全缓冲区间内，签约可行性极高。`}
              </p>
            </div>

            {/* Expected MTTR & Interruption Hours */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>预期故障恢复基准 MTTR</span>
              </div>
              <div className="text-3xl font-black text-indigo-600 font-mono">
                3.2 小时
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                当前组网下预计年等效中断时长为 42.8 小时。提升备件库响应速度可进一步降低索赔敞口。
              </p>
            </div>
          </div>

          {/* Benchmark Comparison Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              历史样本分位数对比与可行性分布
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              对比同类历史站点实际运行 P90/P95 分位数与本次承诺
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[98.5, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.375rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(val: any) => [`${val}%`, '可用度']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {benchmarkData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name.includes('本次')
                            ? '#ef4444'
                            : entry.name.includes('AI')
                            ? '#10b981'
                            : '#2563eb'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engineering Optimization Advice */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              组网架构优化与合同条款避坑建议
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">1. 组网冗余配置优化</div>
                <p className="text-slate-600 leading-relaxed">
                  若客户坚持要求设定高于 99.50% 的 SLA 阈值，建议方案将核心 PCS 组网升级为【多活负荷分担 + 光纤自愈环网】，可使可靠性五因子中的冗余因子提升 25 分。
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">2. 合同免责与考核口径约定 (Rule R2)</div>
                <p className="text-slate-600 leading-relaxed">
                  务必在合同技术协议中明确【计划内停机维护不计入中断】以及【电网不可抗力停机除外】条款，并以【等效 PCS 中断时长】作为唯一违约金结算口径。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
