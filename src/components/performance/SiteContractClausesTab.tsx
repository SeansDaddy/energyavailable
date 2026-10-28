import React, { useState } from 'react';
import { SiteContractGuarantee, ContractClauseItem } from '../../types/performanceEvaluation';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Clock,
  Zap,
  BatteryCharging,
  Activity,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Building,
  Calendar,
  Layers,
  Thermometer,
  Flame
} from 'lucide-react';

interface SiteContractClausesTabProps {
  contractData: SiteContractGuarantee;
  siteName: string;
}

export const SiteContractClausesTab: React.FC<SiteContractClausesTabProps> = ({
  contractData,
  siteName
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({
    '第 4.1 条': true,
    '第 4.2 条': true,
    '第 4.4 条': true
  });

  const toggleExpand = (clauseNo: string) => {
    setExpandedClauses(prev => ({
      ...prev,
      [clauseNo]: !prev[clauseNo]
    }));
  };

  const filteredClauses = contractData.clauses.filter(clause => {
    if (activeCategory === 'ALL') return true;
    return clause.category === activeCategory;
  });

  const compliantCount = contractData.clauses.filter(c => c.complianceStatus === 'COMPLIANT').length;
  const warningCount = contractData.clauses.filter(c => c.complianceStatus === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                当前站点性能保障合同核心条款与履约考核
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                法律效力条款库
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              数字化沉淀当前站点与电网及业主签署的《全生命周期性能保障协议》（SLA）。涵盖 RTE 阶梯基线、SOH 衰减容限、AUC 标定可用容量、可用度考核扣罚与超工况免责界定。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-right">
              <div className="text-[10px] text-slate-500">合同履行状态</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>投运第 {contractData.currentYearOfOperation} 年 · 正常履约</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contract Basic Info Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1 md:col-span-2">
            <div className="text-xs text-indigo-300 font-medium">协议全称</div>
            <div className="text-lg font-bold tracking-tight text-white">{contractData.contractName}</div>
            <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{contractData.contractNo}</span>
              <span>· 业主主体: {contractData.clientName}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-indigo-300 font-medium">生效日期与保证年限</div>
            <div className="text-base font-bold font-mono text-white">
              {contractData.effectiveDate}
              <span className="text-xs font-normal text-slate-300 ml-1.5">
                ({contractData.warrantyPeriodYears}年质保期)
              </span>
            </div>
            <div className="text-xs text-emerald-400">签订日期: {contractData.contractSignDate}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-indigo-300 font-medium">履约保证金/保函保障</div>
            <div className="text-base font-bold font-mono text-amber-400">
              {contractData.guaranteeDepositAmount}
            </div>
            <div className="text-xs text-slate-300">
              条款履约率: <strong className="text-white">{compliantCount} / {contractData.clauses.length} 达标</strong>
              {warningCount > 0 && <span className="text-amber-400 ml-1">({warningCount} 项临界)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            全部条款 ({contractData.clauses.length})
          </button>
          <button
            onClick={() => setActiveCategory('RTE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'RTE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            RTE 保证条款
          </button>
          <button
            onClick={() => setActiveCategory('SOH_DEGRADATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'SOH_DEGRADATION'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            SOH 衰减条款
          </button>
          <button
            onClick={() => setActiveCategory('AUC_CAPACITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'AUC_CAPACITY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            AUC 可用容量
          </button>
          <button
            onClick={() => setActiveCategory('AVAILABILITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'AVAILABILITY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            可用度 EAF
          </button>
          <button
            onClick={() => setActiveCategory('PENALTY_COMPENSATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'PENALTY_COMPENSATION'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            超工况免责与考核机制
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          点击条款卡片可展开法言法语原文与免责认定标准
        </div>
      </div>

      {/* 4. Clauses Cards List */}
      <div className="space-y-4">
        {filteredClauses.map(clause => {
          const isExpanded = !!expandedClauses[clause.clauseNo];
          const isWarning = clause.complianceStatus === 'WARNING';

          return (
            <div
              key={clause.clauseNo}
              className={`bg-white border rounded-xl shadow-xs transition-all ${
                isWarning
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(clause.clauseNo)}
                className="p-4 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-50/50 rounded-t-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {clause.clauseNo.slice(0, 4)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {clause.clauseNo}: {clause.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isWarning
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isWarning ? '临界预警 (需关注)' : '达标执行中'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>保证标准: <strong className="text-slate-800">{clause.guaranteedTarget}</strong></span>
                      <span>·</span>
                      <span>当前实测: <strong className={isWarning ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>{clause.currentActualValue}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-xs hidden sm:inline text-slate-500">
                    {isExpanded ? '收起详情' : '展开条款细则'}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs bg-slate-50/40 rounded-b-xl">
                  {/* Clause Text */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>合同原始约定条款 (法言法语摘要)</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {clause.clauseText}
                    </p>
                  </div>

                  {/* Grid of Penalty & Exemption */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3">
                      <div className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                        <Scale className="w-3.5 h-3.5 text-rose-600" />
                        <span>违约考核与扣罚补偿机制</span>
                      </div>
                      <p className="text-rose-800 leading-relaxed text-[11px]">
                        {clause.penaltyMechanism}
                      </p>
                    </div>

                    <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3">
                      <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>超工况运行免责条件</span>
                      </div>
                      <p className="text-blue-800 leading-relaxed text-[11px]">
                        {clause.exemptionConditions}
                      </p>
                    </div>

                    <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3">
                      <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>当前履约风险研判</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed text-[11px]">
                        {clause.riskAssessment}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
