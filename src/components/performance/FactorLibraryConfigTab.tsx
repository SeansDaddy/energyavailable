import React, { useState } from 'react';
import { PerformanceFactor } from '../../types/performanceEvaluation';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  HelpCircle,
  TrendingUp,
  Tag,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';

interface FactorLibraryConfigTabProps {
  factors: PerformanceFactor[];
  onUpdateFactors: (updated: PerformanceFactor[]) => void;
  onResetDefaults: () => void;
}

export const FactorLibraryConfigTab: React.FC<FactorLibraryConfigTabProps> = ({
  factors,
  onUpdateFactors,
  onResetDefaults
}) => {
  const [localFactors, setLocalFactors] = useState<PerformanceFactor[]>(factors);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const totalWeight = localFactors.reduce((sum, f) => sum + f.weight, 0);

  const handleWeightChange = (id: number, newWeight: number) => {
    setLocalFactors(prev =>
      prev.map(f => (f.id === id ? { ...f, weight: Math.max(1, Math.min(30, newWeight)) } : f))
    );
    setHasUnsavedChanges(true);
  };

  const handleThresholdChange = (id: number, field: 'warning' | 'critical', val: number) => {
    setLocalFactors(prev =>
      prev.map(f => {
        if (f.id === id) {
          const warning = field === 'warning' ? val : f.warningThreshold;
          const critical = field === 'critical' ? val : f.criticalThreshold;
          // Re-evaluate hit status
          let isHit = false;
          let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
          if (f.operator === '>') {
            if (f.currentValue >= critical) {
              isHit = true;
              status = 'CRITICAL';
            } else if (f.currentValue >= warning) {
              isHit = true;
              status = 'WARNING';
            }
          } else {
            if (f.currentValue <= critical) {
              isHit = true;
              status = 'CRITICAL';
            } else if (f.currentValue <= warning) {
              isHit = true;
              status = 'WARNING';
            }
          }
          return {
            ...f,
            warningThreshold: warning,
            criticalThreshold: critical,
            isHit,
            status
          };
        }
        return f;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onUpdateFactors(localFactors);
    setHasUnsavedChanges(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleReset = () => {
    onResetDefaults();
    setHasUnsavedChanges(false);
  };

  // Radar chart data
  const radarData = localFactors.map(f => ({
    subject: f.name.length > 6 ? f.name.slice(0, 6) + '..' : f.name,
    weight: f.weight,
    score: f.status === 'NORMAL' ? 100 : f.status === 'WARNING' ? 65 : 40,
    fullMark: 100
  }));

  const filteredList = localFactors.filter(f =>
    filterCategory === 'ALL' ? true : f.category === filterCategory
  );

  const categories = ['ALL', ...Array.from(new Set(localFactors.map(f => f.category)))];

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">性能影响因子清单与权重阈值配置框架</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              预置 13 类影响因子
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            提供电站性能评估分析理论框架。支持按因子配置业务权重与异常阈值，评估结论可精确穿透追溯至命中因子。
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <Scale className="w-4 h-4 text-slate-400" />
            <span>当前总权重: </span>
            <strong className={`font-mono font-bold ${totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totalWeight}%
            </strong>
            {totalWeight !== 100 && (
              <span className="text-[11px] text-amber-600 font-medium">(非标准 100%)</span>
            )}
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            重置为行业基准
          </button>

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              hasUnsavedChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            保存配置并触发重测
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>影响因子权重与阈值配置已成功更新，系统级性能评估模型已自动完成联动测算！</span>
        </div>
      )}

      {/* Overview Grid: Radar Chart + Hit Factor Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar of 13 Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800">13类因子权重与健康评分雷达映射</div>
            <span className="text-[11px] text-slate-400">满分 100</span>
          </div>
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 9 }} />
                <Radar name="健康得分" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                <Radar name="配置权重" dataKey="weight" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500 opacity-60"></span>
              <span>实测工况健康分 (高为优)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 opacity-60"></span>
              <span>评估权重比率 (%)</span>
            </div>
          </div>
        </div>

        {/* Hit Factors Analysis Summary */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900">当前实测命中异常影响因子清单 (触发优化)</h3>
              </div>
              <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                已命中 {localFactors.filter(f => f.isHit).length} 项制约因子
              </span>
            </div>

            <div className="space-y-2.5">
              {localFactors
                .filter(f => f.isHit)
                .map(f => (
                  <div
                    key={f.id}
                    className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      f.status === 'CRITICAL'
                        ? 'bg-red-50/60 border-red-200 text-red-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] shadow-sm font-mono border">
                          #{f.id}
                        </span>
                        <span>{f.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white border">
                          权重 {f.weight}%
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 pl-7">{f.hitReason || f.impactAnalysis}</p>
                    </div>

                    <div className="sm:text-right shrink-0 pl-7 sm:pl-0 font-mono">
                      <div className="text-[11px] text-slate-500">实测当前值</div>
                      <div className="font-bold text-sm text-red-600">{f.currentValueDisplay}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>* 命中因子将直接计入系统级体检扣分项，并联动输出紧急/一般优化实施路径建议。</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500">分类过滤:</span>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterCategory === c
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c === 'ALL' ? '全部 13 类因子' : c}
          </button>
        ))}
      </div>

      {/* 13 Factors Editable Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3 w-40">影响因素</th>
                <th className="py-3 px-3 w-28">领域分类</th>
                <th className="py-3 px-4 min-w-[280px]">影响分析与机理</th>
                <th className="py-3 px-3 w-28 text-center">评估权重 (%)</th>
                <th className="py-3 px-3 w-36">当前实测值</th>
                <th className="py-3 px-4 w-44">预警 / 异常阈值配置</th>
                <th className="py-3 px-3 w-28 text-center">命中判定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(factor => {
                return (
                  <tr
                    key={factor.id}
                    className={`hover:bg-blue-50/30 transition-colors ${
                      factor.status === 'CRITICAL'
                        ? 'bg-rose-50/20'
                        : factor.status === 'WARNING'
                        ? 'bg-amber-50/20'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                      {factor.id}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <div>{factor.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        基准区间: {factor.idealRange}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {factor.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-relaxed">
                      {factor.impactAnalysis}
                    </td>

                    {/* Weight Input */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center border border-slate-300 rounded-md overflow-hidden bg-white shadow-xs">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={factor.weight}
                          onChange={e => handleWeightChange(factor.id, Number(e.target.value))}
                          className="w-12 py-1 px-1.5 text-center text-xs font-mono font-bold text-slate-800 focus:outline-none focus:bg-blue-50/50"
                        />
                        <span className="pr-1.5 text-[11px] text-slate-400 font-mono">%</span>
                      </div>
                    </td>

                    {/* Current Value */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="font-bold text-slate-900">{factor.currentValueDisplay}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]" title={factor.thresholdName}>
                        {factor.thresholdName}
                      </div>
                    </td>

                    {/* Thresholds Config */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-amber-600 w-9 font-medium">预警值:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={factor.warningThreshold}
                          onChange={e => handleThresholdChange(factor.id, 'warning', Number(e.target.value))}
                          className="w-14 py-0.5 px-1 bg-white border border-slate-200 rounded text-center font-mono font-semibold text-slate-700"
                        />
                        <span className="text-slate-400">{factor.unit}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-rose-600 w-9 font-medium">异常值:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={factor.criticalThreshold}
                          onChange={e => handleThresholdChange(factor.id, 'critical', Number(e.target.value))}
                          className="w-14 py-0.5 px-1 bg-white border border-slate-200 rounded text-center font-mono font-semibold text-slate-700"
                        />
                        <span className="text-slate-400">{factor.unit}</span>
                      </div>
                    </td>

                    {/* Status / Hit Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {factor.isHit ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            factor.status === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-amber-100 text-amber-700 border border-amber-300'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          命中异常
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          指标正常
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
