import React from 'react';
import { Site, Contract } from '../../types';
import {
  FileText,
  Info,
  ShieldAlert,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Building,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface ContractFulfillmentTabProps {
  site: Site;
  contracts: Contract[];
  allSites: Site[];
  onSelectSite?: (siteId: string) => void;
}

export const ContractFulfillmentTab: React.FC<ContractFulfillmentTabProps> = ({
  site,
  contracts,
  allSites,
  onSelectSite
}) => {
  const currentContract =
    contracts.find(c => c.contractNo === site.contractNo || c.id === site.contractId) ||
    contracts[0];

  const peerSites = allSites.filter(
    s => s.contractNo === site.contractNo || (currentContract && s.customer === currentContract.customer)
  );

  const isBreached = site.currentAvailability < site.slaThreshold;
  const gap = Number((site.currentAvailability - site.slaThreshold).toFixed(2));

  // Monthly trend for this contract
  const contractTrendData = [
    { month: '2026-03', availability: 99.65, sla: site.slaThreshold },
    { month: '2026-04', availability: 99.72, sla: site.slaThreshold },
    { month: '2026-05', availability: 99.81, sla: site.slaThreshold },
    { month: '2026-06', availability: 99.55, sla: site.slaThreshold },
    { month: '2026-07', availability: 99.62, sla: site.slaThreshold },
    { month: '2026-08', availability: site.currentAvailability, sla: site.slaThreshold }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Rule R9 & R10 Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-900 font-semibold">
            合同履约结算与违约金测算规则 (Rule R9 & R10)：
          </strong>
          SLA 考核以<strong>自然月（每月1日00:00至最后一日24:00）</strong>为独立结算周期。SLA 阈值按合同唯一约定执行。当月可用度低于约定阈值时，自动触发违约金梯级测算（按装机容量与短缺比率核算），并同步至销售与运营履约视图。
        </div>
      </div>

      {/* Contract Profile & Risk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contract Info Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-blue-50 text-blue-600 border border-blue-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentContract ? currentContract.contractName : '储能电站全生命周期运维保障SLA合同'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  合同编号: {site.contractNo} · 客户: {site.customer}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              履行中 (In Force)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">约定 SLA 阈值</span>
              <div className="text-lg font-black font-mono text-slate-900 mt-1">
                {site.slaThreshold}%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">当期合同可用度</span>
              <div
                className={`text-lg font-black font-mono mt-1 ${
                  isBreached ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {site.currentAvailability}%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">履约状态</span>
              <div
                className={`text-xs font-bold mt-1.5 ${
                  isBreached ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {isBreached ? '⚠️ 跌破阈值 (未达标)' : '✅ 履约达标'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500">结算周期</span>
              <div className="text-xs font-bold text-slate-800 font-mono mt-1.5">
                自然月度 (R10)
              </div>
            </div>
          </div>

          {/* Contract Terms */}
          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-800">关键合同约束条款摘要：</div>
            <div>● 违约赔偿触发条件: 当月可用度低于 {site.slaThreshold}%。</div>
            <div>● 赔偿费率: 每低于 0.1% 扣除当月运维服务费的 2.5%（单月上限为 30%）。</div>
            <div>● 数据免责: 计划内停电、外部电网原因停电不计入等效 PCS 中断时间。</div>
          </div>
        </div>

        {/* Penalty & Risk Estimate Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">违约金与履约风险测算 (R9)</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">当期预计违约赔偿金</span>
                <div
                  className={`text-2xl font-black font-mono mt-1 ${
                    isBreached ? 'text-red-600' : 'text-slate-400'
                  }`}
                >
                  {isBreached ? '¥ 22,000' : '¥ 0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isBreached
                    ? `较阈值短缺 ${Math.abs(gap)}%，触发梯级赔偿`
                    : '当期可用度达标，无违约金'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500">销售续约与商誉风险</span>
                <div
                  className={`text-xs font-bold mt-1 ${
                    isBreached ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {isBreached ? '高风险 (需运维专项复盘)' : '良好 (可作为销售标杆案例)'}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
            * 违约金为系统根据合同约定算法自动测算值，供销售与财务预审。
          </div>
        </div>
      </div>

      {/* 6-Month SLA Trend for Contract */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              近 6 个月自然月度履约达标历史走势 (Rule R10)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              考核周期: 自然月结算 · 基准线: {site.slaThreshold}%
            </p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contractTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis domain={[96.0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.375rem',
                  fontSize: '11px'
                }}
                formatter={(val: any) => [`${val}%`, '月度可用度']}
              />
              <ReferenceLine
                y={site.slaThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `SLA ${site.slaThreshold}%`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'right'
                }}
              />
              <Bar dataKey="availability" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peer Sites under Same Contract */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              同合同 / 同客户关联站点达标横向对比
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              共 {peerSites.length} 个站点受同份 SLA 合同约束
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {peerSites.map(ps => {
            const isCurrent = ps.id === site.id;
            const psBreached = ps.currentAvailability < ps.slaThreshold;
            return (
              <div
                key={ps.id}
                onClick={() => onSelectSite && onSelectSite(ps.id)}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate pr-2">
                      {ps.siteName}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white shrink-0">
                        当前站点
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{ps.siteCode}</div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-slate-500">
                    可用度:{' '}
                    <strong
                      className={`font-mono font-bold ${
                        psBreached ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {ps.currentAvailability}%
                    </strong>
                  </span>
                  {!isCurrent && (
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      <span>切换查看</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
