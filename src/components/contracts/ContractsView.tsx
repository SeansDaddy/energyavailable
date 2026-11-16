import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Contract, Site } from '../../types';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Calendar,
  X,
  Plus,
  Edit3,
  Eye,
  RefreshCw,
  Building2,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Link2,
  Check
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

interface ContractFormState {
  contractNo: string;
  title: string;
  customer: string;
  evaluationPeriod: string;
  slaThreshold: number;
  validFrom: string;
  validTo: string;
  overallStatus: Contract['overallStatus'];
  penaltyClause: string;
  linkedSiteIds: string[];
  syncSiteSla: boolean;
}

const EVALUATION_PERIOD_PRESETS = [
  '自然月度 (每月1日00:00 - 月末24:00)',
  '自然季度与月度双重考核',
  '自然年度与月度联合考核',
  '滚动12个月合同周期考核'
];

export const ContractsView: React.FC = () => {
  const {
    contracts,
    sites,
    selectedContractId,
    setSelectedContractId,
    contractViewAction,
    setContractViewAction,
    addContract,
    updateContract,
    syncContracts,
    navigateToSiteDetail,
    navigateToAvailabilityDrilldown
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Contract['overallStatus']>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Detail viewer modal & Form modal
  const [viewingContractId, setViewingContractId] = useState<string | null>(null);
  const [formModal, setFormModal] = useState<{
    mode: 'create' | 'edit';
    contractId?: string;
  } | null>(null);
  const [siteSearchInForm, setSiteSearchInForm] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [formState, setFormState] = useState<ContractFormState>({
    contractNo: '',
    title: '',
    customer: '',
    evaluationPeriod: EVALUATION_PERIOD_PRESETS[0],
    slaThreshold: 99.5,
    validFrom: '2026-01-01',
    validTo: '2028-12-31',
    overallStatus: 'FULFILLED',
    penaltyClause: '',
    linkedSiteIds: [],
    syncSiteSla: true
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  // Resolve bound sites for a contract (combining site.contractId / site.contractNo / contract.associatedSites)
  const getBoundSitesForContract = (contract: Contract): Site[] => {
    const assocIds = new Set(contract.associatedSites.map(a => a.siteId));
    return sites.filter(
      s =>
        s.contractId === contract.id ||
        (contract.contractNo && s.contractNo === contract.contractNo) ||
        assocIds.has(s.id)
    );
  };

  const activeContractId =
    selectedContractId && contracts.some(c => c.id === selectedContractId)
      ? selectedContractId
      : contracts[0]?.id || '';

  const inspectedContract =
    contracts.find(c => c.id === activeContractId) || contracts[0];

  const viewingContract = viewingContractId
    ? contracts.find(c => c.id === viewingContractId) || null
    : null;

  const openCreateModal = (prefillSiteId?: string) => {
    const prefillSite = prefillSiteId ? sites.find(s => s.id === prefillSiteId) : undefined;
    const defaultNo = `SLA-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`;
    setFormState({
      contractNo: prefillSite?.contractNo || defaultNo,
      title: prefillSite
        ? `${prefillSite.siteName} 可用度 SLA 保障运维合同`
        : '',
      customer: prefillSite?.customer || '',
      evaluationPeriod: EVALUATION_PERIOD_PRESETS[0],
      slaThreshold: prefillSite?.slaThreshold ?? 99.5,
      validFrom: '2026-01-01',
      validTo: '2028-12-31',
      overallStatus: 'FULFILLED',
      penaltyClause:
        '单月可用度低于合同约定阈值时，每低 0.1% 扣减当月基础运维服务费的 2.5%（单月封顶 25%）；计划内维护与外部电网限电免责。',
      linkedSiteIds: prefillSite ? [prefillSite.id] : [],
      syncSiteSla: true
    });
    setSiteSearchInForm('');
    setFormError(null);
    setFormModal({ mode: 'create' });
  };

  const openEditModal = (contract: Contract) => {
    const boundIds = getBoundSitesForContract(contract).map(s => s.id);
    setFormState({
      contractNo: contract.contractNo,
      title: contract.title,
      customer: contract.customer,
      evaluationPeriod: contract.evaluationPeriod,
      slaThreshold: contract.slaThreshold,
      validFrom: contract.validFrom,
      validTo: contract.validTo,
      overallStatus: contract.overallStatus,
      penaltyClause: contract.penaltyClause,
      linkedSiteIds: boundIds,
      syncSiteSla: true
    });
    setSiteSearchInForm('');
    setFormError(null);
    setFormModal({ mode: 'edit', contractId: contract.id });
  };

  // Handle cross-page deep link actions (e.g. from SiteAvailabilityDetailView)
  useEffect(() => {
    if (!contractViewAction) return;

    if (contractViewAction.mode === 'view' && contractViewAction.contractId) {
      const target = contracts.find(c => c.id === contractViewAction.contractId);
      if (target) {
        setSelectedContractId(target.id);
        setViewingContractId(target.id);
      }
    } else if (contractViewAction.mode === 'edit' && contractViewAction.contractId) {
      const target = contracts.find(c => c.id === contractViewAction.contractId);
      if (target) {
        setSelectedContractId(target.id);
        openEditModal(target);
      }
    } else if (contractViewAction.mode === 'create') {
      openCreateModal(contractViewAction.prefillSiteId);
    }

    setContractViewAction(null);
  }, [contractViewAction]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      if (statusFilter !== 'ALL' && c.overallStatus !== statusFilter) return false;
      if (searchTerm.trim()) {
        const key = searchTerm.trim().toLowerCase();
        const boundSites = getBoundSitesForContract(c);
        const matchSite = boundSites.some(
          s =>
            s.siteName.toLowerCase().includes(key) ||
            s.siteCode.toLowerCase().includes(key) ||
            s.region.toLowerCase().includes(key)
        );
        const matchSelf =
          c.contractNo.toLowerCase().includes(key) ||
          c.title.toLowerCase().includes(key) ||
          c.customer.toLowerCase().includes(key);
        if (!matchSelf && !matchSite) return false;
      }
      return true;
    });
  }, [contracts, sites, statusFilter, searchTerm]);

  const summaryStats = useMemo(() => {
    const fulfilled = contracts.filter(c => c.overallStatus === 'FULFILLED').length;
    const atRisk = contracts.filter(c => c.overallStatus === 'AT_RISK').length;
    const breached = contracts.filter(c => c.overallStatus === 'BREACHED').length;
    const coveredSiteIds = new Set<string>();
    contracts.forEach(c => {
      getBoundSitesForContract(c).forEach(s => coveredSiteIds.add(s.id));
    });
    return {
      total: contracts.length,
      fulfilled,
      atRisk,
      breached,
      coveredSites: coveredSiteIds.size
    };
  }, [contracts, sites]);

  const handleToggleSiteInForm = (siteId: string) => {
    setFormState(prev => {
      const exists = prev.linkedSiteIds.includes(siteId);
      const nextIds = exists
        ? prev.linkedSiteIds.filter(id => id !== siteId)
        : [...prev.linkedSiteIds, siteId];

      // Auto-populate customer if creating & customer empty
      let nextCustomer = prev.customer;
      if (!exists && !nextCustomer.trim()) {
        const picked = sites.find(s => s.id === siteId);
        if (picked?.customer) nextCustomer = picked.customer;
      }
      return { ...prev, linkedSiteIds: nextIds, customer: nextCustomer };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.contractNo.trim()) {
      setFormError('请填写合同编号');
      return;
    }
    if (!formState.title.trim()) {
      setFormError('请填写合同名称');
      return;
    }
    if (!formState.customer.trim()) {
      setFormError('请填写签约客户');
      return;
    }
    if (formState.validFrom > formState.validTo) {
      setFormError('合同生效日期不能晚于终止日期');
      return;
    }
    if (formState.slaThreshold < 80 || formState.slaThreshold > 100) {
      setFormError('SLA 约定阈值必须在 80.00% ~ 100.00% 之间');
      return;
    }

    const duplicateNo = contracts.find(
      c =>
        c.contractNo.trim().toLowerCase() === formState.contractNo.trim().toLowerCase() &&
        (formModal?.mode === 'create' || c.id !== formModal?.contractId)
    );
    if (duplicateNo) {
      setFormError(`合同编号【${formState.contractNo.trim()}】已存在，请使用唯一合同编号`);
      return;
    }

    if (formModal?.mode === 'create') {
      const created = addContract(
        {
          contractNo: formState.contractNo,
          title: formState.title,
          customer: formState.customer,
          evaluationPeriod: formState.evaluationPeriod,
          slaThreshold: formState.slaThreshold,
          validFrom: formState.validFrom,
          validTo: formState.validTo,
          overallStatus: formState.overallStatus,
          penaltyClause: formState.penaltyClause
        },
        formState.linkedSiteIds,
        formState.syncSiteSla
      );
      setSelectedContractId(created.id);
      setFormModal(null);
      showToast(`已录入合同【${created.contractNo}】，关联 ${formState.linkedSiteIds.length} 个站点并同步可用度监控参数`);
    } else if (formModal?.mode === 'edit' && formModal.contractId) {
      updateContract(
        formModal.contractId,
        {
          contractNo: formState.contractNo,
          title: formState.title,
          customer: formState.customer,
          evaluationPeriod: formState.evaluationPeriod,
          slaThreshold: formState.slaThreshold,
          validFrom: formState.validFrom,
          validTo: formState.validTo,
          overallStatus: formState.overallStatus,
          penaltyClause: formState.penaltyClause
        },
        formState.linkedSiteIds,
        formState.syncSiteSla
      );
      setSelectedContractId(formModal.contractId);
      setFormModal(null);
      showToast(`已保存合同【${formState.contractNo}】更新，关联站点 SLA 与合同周期已实时联动`);
    }
  };

  const handleExportContracts = () => {
    const headers = ['合同编号', '合同名称', '签约客户', 'SLA阈值(%)', '生效日期', '终止日期', '履约状态', '关联站点数'];
    const rows = filteredContracts.map(c => {
      const boundCount = getBoundSitesForContract(c).length;
      const statusLabel =
        c.overallStatus === 'FULFILLED'
          ? '达标履约中'
          : c.overallStatus === 'AT_RISK'
          ? '履约风险预警'
          : '已违约';
      return [
        `"${c.contractNo}"`,
        `"${c.title}"`,
        `"${c.customer}"`,
        c.slaThreshold.toFixed(2),
        c.validFrom,
        c.validTo,
        statusLabel,
        boundCount
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SLA_Contracts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`已导出 ${filteredContracts.length} 份合同 SLA 履约台账 (CSV)`);
  };

  const renderStatusBadge = (status: Contract['overallStatus'], compact = false) => {
    if (status === 'FULFILLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{compact ? '达标' : '达标履约中'}</span>
        </span>
      );
    }
    if (status === 'AT_RISK') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>{compact ? '预警' : '履约风险预警'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
        <XCircle className="w-3 h-3 text-red-600" />
        <span>{compact ? '违约' : '已违约索赔'}</span>
      </span>
    );
  };

  const filteredFormSites = useMemo(() => {
    if (!siteSearchInForm.trim()) return sites;
    const q = siteSearchInForm.trim().toLowerCase();
    return sites.filter(
      s =>
        s.siteName.toLowerCase().includes(q) ||
        s.siteCode.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q)
    );
  }, [sites, siteSearchInForm]);

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Inline Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-medium animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              合同与履约台账 (Contract Hub)
            </h1>
            <span className="text-xs text-slate-500">
              Rules R9 & R10 · 关联站点可用度自动联动
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持站点 SLA 合同录入、查看、编辑与站点绑定；合同周期及 SLA 阈值变动实时同步至单站点可用度监控视图。
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              syncContracts();
              showToast('已完成合同台账与站点履约状态校验同步');
            }}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>同步校验</span>
          </button>

          <button
            onClick={handleExportContracts}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>导出履约清单</span>
          </button>

          <button
            id="btn-create-contract"
            onClick={() => openCreateModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>录入站点合同</span>
          </button>
        </div>
      </div>

      {/* Compact Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">在管 SLA 合同总数</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black font-mono tabular-nums text-slate-900">
              {summaryStats.total}
            </span>
            <span className="text-xs text-slate-500">份</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">达标履约中</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black font-mono tabular-nums text-emerald-600">
              {summaryStats.fulfilled}
            </span>
            <span className="text-xs text-slate-500">
              份 · 占比 {summaryStats.total > 0 ? Math.round((summaryStats.fulfilled / summaryStats.total) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">预警 / 违约合同</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black font-mono tabular-nums text-amber-600">
              {summaryStats.atRisk}
            </span>
            <span className="text-xs text-slate-500">预警</span>
            <span className="text-slate-300">·</span>
            <span className="text-xl font-black font-mono tabular-nums text-red-600">
              {summaryStats.breached}
            </span>
            <span className="text-xs text-slate-500">违约</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">已关联合同站点覆盖</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black font-mono tabular-nums text-blue-600">
              {summaryStats.coveredSites}
            </span>
            <span className="text-xs text-slate-500">/ {sites.length} 个在管站点</span>
          </div>
        </div>
      </div>

      {/* Contract Fulfillment Trend Hero Card */}
      {inspectedContract && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">
                  {inspectedContract.title}
                </h2>
                <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                  {inspectedContract.contractNo}
                </span>
                {renderStatusBadge(inspectedContract.overallStatus)}
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  签约客户: <strong className="text-slate-800">{inspectedContract.customer}</strong>
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  合同周期:{' '}
                  <strong className="text-slate-800 font-mono tabular-nums">
                    {inspectedContract.validFrom} ~ {inspectedContract.validTo}
                  </strong>
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  考核周期: <strong className="text-slate-800">{inspectedContract.evaluationPeriod}</strong>
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  SLA 约定阈值:{' '}
                  <strong className="text-blue-600 font-mono tabular-nums">
                    {inspectedContract.slaThreshold.toFixed(2)}%
                  </strong>
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewingContractId(inspectedContract.id)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>查看详情</span>
              </button>
              <button
                onClick={() => openEditModal(inspectedContract)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>编辑合同</span>
              </button>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inspectedContract.monthlyTrend} margin={{ top: 10, right: 36, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[
                    Math.max(95, Math.floor((inspectedContract.slaThreshold - 1.2) * 10) / 10),
                    100
                  ]}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                />
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
                    value: `SLA ${inspectedContract.slaThreshold}%`,
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

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-red-600">违约与赔偿约定：</span>
              <span className="text-slate-700 ml-1">{inspectedContract.penaltyClause}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono shrink-0">
              最近更新: {inspectedContract.lastSyncedAt}
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">履约状态:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="ALL">全部状态</option>
              <option value="FULFILLED">达标履约中</option>
              <option value="AT_RISK">履约风险预警</option>
              <option value="BREACHED">已违约索赔</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索合同号 / 名称 / 客户 / 关联站点..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-slate-800 w-72 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>

        <span className="text-slate-500">
          共查询到 <strong className="text-blue-600 font-mono tabular-nums">{filteredContracts.length}</strong> 份合同
        </span>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">合同编号 / 合同名称</th>
              <th className="py-3 px-3">签约客户</th>
              <th className="py-3 px-3">覆盖站点 / 区域</th>
              <th className="py-3 px-3 font-mono">SLA 阈值</th>
              <th className="py-3 px-3">考核周期</th>
              <th className="py-3 px-3">合同有效期</th>
              <th className="py-3 px-3">履约状态</th>
              <th className="py-3 px-3 text-center">关联站点数</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  暂无符合条件的合同记录，可点击右上角「录入站点合同」新增。
                </td>
              </tr>
            ) : (
              filteredContracts.map(c => {
                const boundSites = getBoundSitesForContract(c);
                const isSelected = c.id === activeContractId;
                const regionsText = Array.from(new Set(boundSites.map(s => s.region))).join(' · ') || '待绑定站点';
                const firstSite = boundSites[0];

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedContractId(c.id)}
                    className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 max-w-[300px]">
                      <div className="font-semibold text-slate-900 truncate" title={c.title}>
                        {c.title}
                      </div>
                      <div className="text-[11px] text-blue-600 font-mono mt-0.5">{c.contractNo}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                      {c.customer}
                    </td>
                    <td className="py-3.5 px-3 max-w-[230px]">
                      {firstSite ? (
                        <>
                          <div className="text-slate-800 font-medium truncate" title={boundSites.map(s => s.siteName).join('、')}>
                            {firstSite.siteName}
                            {boundSites.length > 1 ? ` 等${boundSites.length}站` : ''}
                          </div>
                          <div className="text-[11px] text-slate-500">{regionsText}</div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">尚未绑定站点</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono tabular-nums font-bold text-blue-600 text-sm whitespace-nowrap">
                      {c.slaThreshold.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-[180px] truncate" title={c.evaluationPeriod}>
                      {c.evaluationPeriod}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-mono tabular-nums text-[11px] whitespace-nowrap">
                      {c.validFrom} ~ {c.validTo}
                    </td>
                    <td className="py-3.5 px-3">{renderStatusBadge(c.overallStatus, true)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedContractId(c.id);
                          setViewingContractId(c.id);
                        }}
                        className="px-2.5 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-blue-700 font-mono font-semibold border border-slate-200 hover:border-blue-300 transition-colors whitespace-nowrap"
                      >
                        {boundSites.length} 站
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedContractId(c.id);
                            setViewingContractId(c.id);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 rounded text-xs font-medium inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>查看</span>
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedContractId(c.id);
                            openEditModal(c);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 hover:border-amber-300 rounded text-xs font-medium inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: Contract Detail View Modal (查看合同详情 + 跳转可用度单站监控) */}
      {/* ===================================================================== */}
      {viewingContract && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">
                        {viewingContract.title}
                      </h3>
                      {renderStatusBadge(viewingContract.overallStatus)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span className="font-mono text-blue-600 font-semibold">
                        {viewingContract.contractNo}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>签约客户: {viewingContract.customer}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">同步时间: {viewingContract.lastSyncedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const target = viewingContract;
                    setViewingContractId(null);
                    openEditModal(target);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>编辑合同</span>
                </button>
                <button
                  onClick={() => setViewingContractId(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 py-4 space-y-5 pr-1 text-xs">
              {/* Contract Core Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">约定 SLA 门槛</div>
                  <div className="text-lg font-black font-mono tabular-nums text-blue-600 mt-1">
                    {viewingContract.slaThreshold.toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">合同生效日期</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1.5">
                    {viewingContract.validFrom}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">合同终止日期</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1.5">
                    {viewingContract.validTo}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500">考核结算周期</div>
                  <div className="text-xs font-bold text-slate-800 mt-1.5">
                    {viewingContract.evaluationPeriod}
                  </div>
                </div>
              </div>

              {/* Penalty Clause */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>违约赔偿与考核条款</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{viewingContract.penaltyClause}</p>
              </div>

              {/* Bound Sites Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>合同关联站点与可用度履约实况 ({getBoundSitesForContract(viewingContract).length} 站)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    可直接跳转至单站点可用度监控或站点台账
                  </span>
                </div>

                {getBoundSitesForContract(viewingContract).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500 space-y-2">
                    <p>该合同暂未绑定任何站点。</p>
                    <button
                      onClick={() => {
                        const target = viewingContract;
                        setViewingContractId(null);
                        openEditModal(target);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>立即绑定关联站点</span>
                    </button>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">站点名称 / 编码</th>
                          <th className="py-2.5 px-3">区域 / 代表处</th>
                          <th className="py-2.5 px-3 font-mono">当期可用度</th>
                          <th className="py-2.5 px-3 font-mono">站点SLA门槛</th>
                          <th className="py-2.5 px-3">履约状态</th>
                          <th className="py-2.5 px-3 text-right">跨页面跳转</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {getBoundSitesForContract(viewingContract).map(s => {
                          const isBreached = s.currentAvailability < s.slaThreshold;
                          return (
                            <tr key={s.id} className="hover:bg-blue-50/40">
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-900">{s.siteName}</div>
                                <div className="text-[11px] text-blue-600 font-mono">{s.siteCode}</div>
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                {s.region} · {s.representativeOffice}
                              </td>
                              <td className="py-3 px-3 font-mono tabular-nums font-bold">
                                <span className={isBreached ? 'text-red-600' : 'text-emerald-600'}>
                                  {s.currentAvailability}%
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                                {s.slaThreshold}%
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    s.statusLamp === 'grey'
                                      ? 'bg-slate-100 text-slate-600 border-slate-300'
                                      : isBreached
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {s.statusLamp === 'grey'
                                    ? '数据断供'
                                    : isBreached
                                    ? '未达标'
                                    : '达标'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                                <button
                                  onClick={() => {
                                    setViewingContractId(null);
                                    navigateToAvailabilityDrilldown(s.id, 0);
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold inline-flex items-center gap-1 transition-colors"
                                >
                                  <Activity className="w-3 h-3" />
                                  <span>可用度监控</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    setViewingContractId(null);
                                    navigateToSiteDetail(s.id, 2);
                                  }}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium inline-flex items-center gap-1 transition-colors"
                                >
                                  <span>站点台账</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setViewingContractId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: Create / Edit Site Contract Modal (录入 & 编辑站点合同)       */}
      {/* ===================================================================== */}
      {formModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {formModal.mode === 'create' ? '录入站点 SLA 合同' : '编辑站点 SLA 合同'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    保存后自动关联所选站点并同步合同周期、合同编号及 SLA 门槛至可用度监控单站页面
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    合同编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.contractNo}
                    onChange={e => setFormState({ ...formState, contractNo: e.target.value })}
                    placeholder="如：CSG-SZ-2026-SLA-102"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    签约客户 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.customer}
                    onChange={e => setFormState({ ...formState, customer: e.target.value })}
                    placeholder="如：南方电网深圳供电局"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  合同名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={e => setFormState({ ...formState, title: e.target.value })}
                  placeholder="如：南方电网深圳区域储能电站高可用度运维保障合同"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SLA 约定阈值 (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="80"
                    max="100"
                    required
                    value={formState.slaThreshold}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        slaThreshold: parseFloat(e.target.value) || 99.5
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    生效日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.validFrom}
                    onChange={e => setFormState({ ...formState, validFrom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    终止日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.validTo}
                    onChange={e => setFormState({ ...formState, validTo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">考核周期</label>
                  <input
                    type="text"
                    list="eval-period-presets"
                    value={formState.evaluationPeriod}
                    onChange={e => setFormState({ ...formState, evaluationPeriod: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <datalist id="eval-period-presets">
                    {EVALUATION_PERIOD_PRESETS.map(p => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">当前履约状态</label>
                  <select
                    value={formState.overallStatus}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        overallStatus: e.target.value as Contract['overallStatus']
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="FULFILLED">达标履约中</option>
                    <option value="AT_RISK">履约风险预警</option>
                    <option value="BREACHED">已违约索赔</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">违约与赔偿条款</label>
                <textarea
                  rows={2}
                  value={formState.penaltyClause}
                  onChange={e => setFormState({ ...formState, penaltyClause: e.target.value })}
                  placeholder="描述可用度低于阈值时的扣款比例、免责情形等约定..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Site Association Picker */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/70 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>关联绑定站点 ({formState.linkedSiteIds.length} 已选)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      绑定后的站点将在「可用度监控单站页面」显示此合同周期、阈值及跳转入口
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={siteSearchInForm}
                      onChange={e => setSiteSearchInForm(e.target.value)}
                      placeholder="筛选站点名 / 编码..."
                      className="bg-white border border-slate-300 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 w-52 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
                  {filteredFormSites.map(s => {
                    const checked = formState.linkedSiteIds.includes(s.id);
                    const hasOtherContract =
                      s.contractNo &&
                      s.contractNo !== formState.contractNo &&
                      s.contractId !== formModal.contractId;
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                          checked ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleSiteInForm(s.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 truncate">{s.siteName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {s.siteCode} · {s.region} · 当前可用度 {s.currentAvailability}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          {checked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                              <Check className="w-3 h-3" />
                              已关联
                            </span>
                          ) : hasOtherContract ? (
                            <span className="text-[11px] text-amber-600 font-mono">
                              原合同: {s.contractNo}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">未关联</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formState.syncSiteSla}
                    onChange={e => setFormState({ ...formState, syncSiteSla: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    保存时同步将合同 SLA 阈值 (
                    <strong className="font-mono text-blue-600">{formState.slaThreshold}%</strong>
                    ) 下发更新至所选站点
                  </span>
                </label>
              </div>

              {/* Submit Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{formModal.mode === 'create' ? '确认录入合同' : '保存合同修改'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
