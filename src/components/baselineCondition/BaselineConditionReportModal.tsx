import React from 'react';
import { BaselineEvaluationTaskRecord } from '../../types/baselineConditionEvaluation';
import {
  X,
  Printer,
  Download,
  FileCheck2,
  ShieldCheck,
  Building,
  Zap,
  Calendar,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface BaselineConditionReportModalProps {
  task: BaselineEvaluationTaskRecord;
  onClose: () => void;
}

export const BaselineConditionReportModal: React.FC<BaselineConditionReportModalProps> = ({
  task,
  onClose
}) => {
  const { input, result } = task;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-150">
        {/* 顶部操作条 */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm font-bold">灵活质保基准工况评估与签约建议报告 (预览)</div>
              <div className="text-[10px] text-slate-400 font-mono">编号: {task.taskNo} · 生成日期: {task.createdAt}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印报告</span>
            </button>
            <button
              onClick={() => {
                alert('报告已生成并准备导出 (PDF/Word 格式)');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 报告主体内容 (模拟 A4 专业技术评估文件) */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs bg-[#f8fafc]">
          <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200/90 space-y-6">
            {/* 报告页眉 */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] text-blue-600 font-bold tracking-widest uppercase">
                  PROFESSIONAL SERVICES · FLEXIBLE WARRANTY ASSESSMENT REPORT
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  电化学储能电站灵活质保基准工况评估与商务签约建议书
                </h1>
                <div className="text-xs text-slate-500 mt-1">
                  评估电站：<span className="font-semibold text-slate-800">{task.siteName}</span> · 
                  业主方：<span className="font-semibold text-slate-800">{task.customerName}</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                    result.riskLevel === 'LOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.riskLevel === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {result.riskLevel === 'LOW' ? '优质达标 (建议签约)' : result.riskLevel === 'HIGH' ? '超工况预警 (需增设免责条款)' : '临界工况 (需调偏折算)'}
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1">评估版本: v2.4 (Arrhenius)</div>
              </div>
            </div>

            {/* 一、评估核心结论概览 */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-l-4 border-blue-600 pl-2">
                一、基准工况推演核心结论
              </h3>
              <div className="grid grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <div className="text-[11px] text-slate-500">质保服务期限</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{input.warrantyPeriodYears} 年期</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">承诺终止保证底线</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{result.contractGuaranteedEndSohPct}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">期末预测到达 SOH</div>
                  <div className="text-base font-bold text-blue-700 mt-0.5">{result.endOfWarrantyProjectedSohPct}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">质保安全裕度</div>
                  <div className={`text-base font-bold mt-0.5 ${result.sohSafetyMarginPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.sohSafetyMarginPct >= 0 ? `+${result.sohSafetyMarginPct}%` : `${result.sohSafetyMarginPct}%`}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-slate-700 text-xs leading-relaxed bg-blue-50/50 p-2.5 rounded border border-blue-100">
                <span className="font-semibold text-blue-900">综合技术结论：</span>
                {result.riskSummary}
              </p>
            </div>

            {/* 二、基准工况参数清单 */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-l-4 border-blue-600 pl-2">
                二、评估输入基准工况参数核定表
              </h3>
              <table className="w-full text-xs border border-slate-200 text-left">
                <thead className="bg-slate-100 text-slate-700 font-medium">
                  <tr>
                    <th className="p-2 border-r border-slate-200">参数类别</th>
                    <th className="p-2 border-r border-slate-200">具体工况指标</th>
                    <th className="p-2 border-r border-slate-200">核定输入值</th>
                    <th className="p-2">行业基准值与影响权重</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td rowSpan={3} className="p-2 border-r border-slate-200 font-semibold bg-slate-50/50">
                      充放电策略
                    </td>
                    <td className="p-2 border-r border-slate-200">标称充放电倍率 (C-rate)</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{input.nominalCrate} C</td>
                    <td className="p-2 text-slate-600">标称两充两放 0.5C (大倍率加速老化权重 35%)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200">日等效完全循环 (FEC)</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{input.dailyFullEquivalentCycles} 次/日</td>
                    <td className="p-2 text-slate-600">基准 1.5 次/日，年等效吞吐量 {Math.round(input.expectedAnnualThroughputMwh)} MWh</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200">放电深度 (DOD) / 常用 SOC</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{input.depthOfDischargeDodPct}% DOD ({input.socOperatingLowerPct}%~{input.socOperatingUpperPct}%)</td>
                    <td className="p-2 text-slate-600">建议避免长期处于极限深度过放 (&gt;95%)</td>
                  </tr>
                  <tr>
                    <td rowSpan={2} className="p-2 border-r border-slate-200 font-semibold bg-slate-50/50">
                      热管理温控
                    </td>
                    <td className="p-2 border-r border-slate-200">冷却形式与年均温</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{input.coolingType === 'LIQUID_COOLING' ? '液冷温控' : '精密风冷'} · 均温 {input.baselineCellTempC} ℃</td>
                    <td className="p-2 text-slate-600">基准理想温度 25.0 ℃，允许区间 {input.allowedCellTempMinC}℃ ~ {input.allowedCellTempMaxC}℃</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200">极端超温天数与温差 ΔT</td>
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-900">{input.extremeHighTempDaysPerYear} 天/年 · ΔT ≤ {input.maxCellTempDifferenceC} ℃</td>
                    <td className="p-2 text-slate-600">超温持续 72h 将触发超工况免责保护</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 三、质保合同关键风控与免责条款建议 */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-l-4 border-blue-600 pl-2">
                三、建议质保合同关键条款与免责约定
              </h3>
              <div className="space-y-2">
                {result.clauseRecommendations.map((clause, idx) => (
                  <div key={clause.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {idx + 1}. {clause.clauseTitle}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                        {clause.categoryLabel}
                      </span>
                    </div>
                    <p className="mt-1.5 text-slate-700 leading-relaxed text-[11px] font-serif">
                      "{clause.clauseContent}"
                    </p>
                    <div className="mt-1.5 text-[10px] text-emerald-700 font-medium">
                      风控防护价值：{clause.riskMitigationValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 四、商务报价与履约财务核算 */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-l-4 border-blue-600 pl-2">
                四、商务报价与履约财务核算
              </h3>
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-500">建议基础质保合同总额</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    ¥ {result.financialAssessment.baseWarrantyContractTotalYuan} 万元
                  </div>
                  <div className="text-[10px] text-slate-400">单价: {input.warrantyPricingPerWhPerYear} 元/Wh·年</div>
                </div>

                <div>
                  <div className="text-slate-500">建议质保保证金保留</div>
                  <div className="text-base font-bold text-amber-600 mt-0.5">
                    ¥ {result.financialAssessment.recommendedRetentionDepositYuan} 万元
                  </div>
                  <div className="text-[10px] text-slate-400">比例: {input.warrantyRetentionDepositPct}%</div>
                </div>

                <div>
                  <div className="text-slate-500">潜在超工况调节加收费</div>
                  <div className="text-base font-bold text-blue-600 mt-0.5">
                    ¥ {result.financialAssessment.projectedExceedingConditionServiceFeeYuan} 万元
                  </div>
                  <div className="text-[10px] text-slate-400">动态折算缓冲</div>
                </div>
              </div>
            </div>

            {/* 五、年底灵活质保 SOH 临时手动评估结论与提前加强服务措施 */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-l-4 border-amber-600 pl-2">
                五、年底灵活质保 SOH 临时手动评估结论与提前加强服务措施 (合同年结束前评估)
              </h3>
              <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200/80 text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-amber-200/60">
                  <div>
                    <span className="text-slate-500 text-[10px]">合同工况年底预期 SOH:</span>
                    <div className="font-mono font-bold text-blue-900 text-sm">92.20%</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">年初至今实际超工况扣减:</span>
                    <div className="font-mono font-bold text-rose-600 text-sm">-0.74% SOH</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">临时手动评估年底 SOH:</span>
                    <div className="font-mono font-bold text-indigo-900 text-sm">91.46% (裕度 +1.46%)</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-700 leading-relaxed space-y-1">
                  <div>• <strong>超工况核算：</strong>实测平均SOC 52.8% (高于合同规划50.0%)，累计超温 32 天 (124.6 ℃·h)，超倍率吞吐 342.5 MWh，超额等效循环 14.8 EFC。</div>
                  <div>• <strong>提前加强质保服务举措：</strong>全面开展液冷冷媒清洗加注、设定待机浮充SOC回降至45%~50%、秋季调频放电限制单次顶峰倍率，并出具专项技术备忘录确保年底顺利履约。</div>
                </div>
              </div>
            </div>

            {/* 六、下一年度工况计划与灵活质保服务报价建议 */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 border-l-4 border-emerald-600 pl-2">
                六、下一年度工况计划与灵活质保服务报价建议 (协同决策确定)
              </h3>
              <div className="p-3.5 bg-emerald-50/60 rounded-lg border border-emerald-200/80 text-xs space-y-2">
                <div className="grid grid-cols-4 gap-2 pb-2 border-b border-emerald-200/60">
                  <div>
                    <span className="text-slate-500 text-[10px]">推荐计划工况方案:</span>
                    <div className="font-bold text-emerald-950 text-xs">标准基准平衡型 (365 EFC)</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">下一年年底预估 SOH:</span>
                    <div className="font-mono font-bold text-blue-900 text-sm">90.00% (达标底线)</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">年度质保服务总报价:</span>
                    <div className="font-mono font-bold text-blue-700 text-sm">¥ 26.0 万元/年</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">客户年净套利回报:</span>
                    <div className="font-mono font-bold text-emerald-700 text-sm">¥ 33.8 万元 (ROI 2.3x)</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>商务闭环说明：</strong>经技术与财务综合评估，推荐双方以标准平衡型工况作为第4合同年执行基准；若业主拟提高参与电力现货调频频次至480次/年，灵活质保年报价相应调节为38.6万元/年，客户总套利增益可提升至43.1万元/年。
                </div>
              </div>
            </div>

            {/* 报告页脚签署 */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <div>评估编制单位：专业服务运营平台 · 灵活质保与储能健康保障中心</div>
                <div className="mt-0.5 font-mono">评估责任工程师：{task.creator}</div>
              </div>
              <div className="text-right">
                <div className="font-mono">审核日期：{task.updatedAt}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">本报告包含知识产权保密协议约束</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
