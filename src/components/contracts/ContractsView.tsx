import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract } from '../../types';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  Building2,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export const ContractsView: React.FC = () => {
  const { contracts, sites, navigateToSiteDetail } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected contract for inspected view
  const [activeContractId, setActiveContractId] = useState<string>(contracts[0].id);

  // Modal for associated sites list
  const [modalContract, setModalContract] = useState<Contract | null>(null);

  const inspectedContract =
    contracts.find(c => c.id === activeContractId) || contracts[0];

  const filteredContracts = contracts.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchTerm) {
      const match =
        c.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.representativeOffice.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const getContractSites = (contractNo: string) => {
    return sites.filter(s => s.contractNo === contractNo);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              合同系统同步与 SLA 履约台账 (Contract Hub)
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              Rules R9 & R10: 实体对齐枢纽
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            以合同号为全局枢纽，打通合同数据、PCare 工单与站点台账。为销售提供签约后透明履约视图与违约罚款风险预警。
          </p>
        </div>

        <button
          onClick={() => window.alert('已导出合同 SLA 履约综合清单 (Excel 格式)')}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>导出合同履约清单</span>
        </button>
      </div>

      {/* Contract Fulfillment Trend Hero Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                销售签约后履约大盘 (Fulfillment View)
              </h2>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                当前合同: {inspectedContract.contractName} ({inspectedContract.contractNo})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              客户: <strong className="text-slate-700">{inspectedContract.customer}</strong> ·
              考核周期: <strong className="text-slate-700">{inspectedContract.evaluationPeriod}</strong> ·
              合同约定 SLA 阈值:{' '}
              <strong className="text-blue-600 font-mono">{inspectedContract.slaThreshold}%</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                inspectedContract.status === 'FULFILLED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : inspectedContract.status === 'AT_RISK'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {inspectedContract.status === 'FULFILLED'
                ? '🟢 达标履约中'
                : inspectedContract.status === 'AT_RISK'
                ? '🟡 履约风险预警'
                : '🔴 已违约索赔'}
            </span>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={inspectedContract.monthlyTrend} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis domain={[98.5, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(val: any) => [`${val}%`, '实际月度可用度']}
              />
              <ReferenceLine
                y={inspectedContract.slaThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `合同约定 ${inspectedContract.slaThreshold}%`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'right'
                }}
              />
              <Line
                type="monotone"
                dataKey="actualSla"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mt-2">
          <span className="font-semibold text-red-600">违约与赔偿约定：</span>
          <span className="text-slate-700 ml-1">{inspectedContract.penaltyClause}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">履约状态:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="ALL">全部状态</option>
              <option value="FULFILLED">🟢 达标履约中</option>
              <option value="AT_RISK">🟡 履约风险预警</option>
              <option value="BREACHED">🔴 已违约索赔</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索合同号 / 合同名称 / 客户..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-slate-800 w-64 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        <span className="text-slate-500">
          共查询到 <strong className="text-blue-600 font-semibold">{filteredContracts.length}</strong> 份合同
        </span>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">合同编号 / 合同名称</th>
              <th className="py-3 px-3">签约客户</th>
              <th className="py-3 px-3">区域 / 代表处</th>
              <th className="py-3 px-3 font-mono">SLA 约定阈值 (R10)</th>
              <th className="py-3 px-3">考核周期</th>
              <th className="py-3 px-3">生效日期 ~ 终止日期</th>
              <th className="py-3 px-3">履约状态</th>
              <th className="py-3 px-3 text-center">关联站点数</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContracts.map(c => {
              const contractSites = getContractSites(c.contractNo);
              const isSelected = c.id === activeContractId;

              return (
                <tr
                  key={c.id}
                  onClick={() => setActiveContractId(c.id)}
                  className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/70 border-l-2 border-blue-600' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{c.contractName}</div>
                    <div className="text-[11px] text-blue-600 font-mono">{c.contractNo}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-800 font-medium">{c.customer}</td>
                  <td className="py-3.5 px-3">
                    <div className="text-slate-800">{c.region}</div>
                    <div className="text-[11px] text-slate-500">{c.representativeOffice}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-600 text-sm">
                    {c.slaThreshold}%
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">{c.evaluationPeriod}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {c.startDate} ~ {c.endDate}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.status === 'FULFILLED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status === 'AT_RISK'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {c.status === 'FULFILLED'
                        ? '🟢 达标'
                        : c.status === 'AT_RISK'
                        ? '🟡 预警'
                        : '🔴 违约'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setModalContract(c);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-blue-600 underline font-medium"
                    >
                      {contractSites.length} 站
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActiveContractId(c.id);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-xs shadow-sm font-medium"
                    >
                      走势
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Associated Sites List for Contract */}
      {modalContract && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  合同关联站点清单 (合同号: {modalContract.contractNo})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  客户: {modalContract.customer} · 合同 SLA 阈值: {modalContract.slaThreshold}%
                </p>
              </div>
              <button
                onClick={() => setModalContract(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-xs">
              <table className="w-full text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">站点名称 / 编码</th>
                    <th className="py-2.5 px-3">区域 / 代表处</th>
                    <th className="py-2.5 px-3 font-mono">当期累计可用度</th>
                    <th className="py-2.5 px-3">达标状态</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getContractSites(modalContract.contractNo).map(s => {
                    const isBreached = s.currentAvailability < modalContract.slaThreshold;
                    return (
                      <tr key={s.id} className="hover:bg-blue-50/40">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{s.siteName}</div>
                          <div className="text-[11px] text-blue-600 font-mono">{s.siteCode}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {s.region} / {s.representativeOffice}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          <span className={isBreached ? 'text-red-600' : 'text-emerald-600'}>
                            {s.currentAvailability}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isBreached
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isBreached ? '未达标' : '达标'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setModalContract(null);
                              navigateToSiteDetail(s.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            站点详情 &rarr;
                          </button>
                        </td>
                      </tr>
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
