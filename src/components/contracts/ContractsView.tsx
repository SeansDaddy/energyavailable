import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Contract,
  ContractType,
  FlexibleWarrantyContractSpec,
  FlexibleConditionContractSpec,
  Site
} from '../../types';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
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
  Check,
  BatteryCharging,
  Sliders
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
  contractType: ContractType;
  title: string;
  customer: string;
  evaluationPeriod: string;
  slaThreshold: number;
  flexibleWarrantySpec: FlexibleWarrantyContractSpec;
  flexibleConditionSpec: FlexibleConditionContractSpec;
  validFrom: string;
  validTo: string;
  overallStatus: Contract['overallStatus'];
  penaltyClause: string;
  linkedSiteIds: string[];
  syncSiteSla: boolean;
}

const DEFAULT_FLEXIBLE_WARRANTY_SPEC: FlexibleWarrantyContractSpec = {
  warrantyYears: 10,
  finalGuaranteedSoh: 80.0,
  currentSohBaseline: 93.8,
  annualBaselineEfc: 365,
  maxCrate: 0.5,
  maxDodPct: 90.0,
  baselineTempMax: 35.0,
  plannedAvgSocPct: 50.0
};

const DEFAULT_FLEXIBLE_CONDITION_SPEC: FlexibleConditionContractSpec = {
  sohThreshold: 94.0,
  aucThreshold: 96.5,
  rteBaseline: 88.5,
  availabilitySla: 99.6
};

const CONTRACT_TYPE_META: Record<
  ContractType,
  {
    label: string;
    shortLabel: string;
    focusText: string;
    badgeClass: string;
    activeCardClass: string;
    prefix: string;
    defaultEvalPeriod: string;
    defaultPenalty: string;
  }
> = {
  AVAILABILITY: {
    label: '站点可用度合同',
    shortLabel: '站点可用度',
    focusText: '关注 SLA 可用度阈值、考核周期与短缺违约赔付',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    activeCardClass: 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500',
    prefix: 'SLA',
    defaultEvalPeriod: '自然月度 (每月1日00:00 - 月末24:00)',
    defaultPenalty:
      '单月可用度低于合同约定 SLA 阈值时，每低 0.1% 扣减当月基础运维服务费的 2.5%（单月封顶 25%）；计划内维护与外部电网限电免责。'
  },
  FLEXIBLE_WARRANTY: {
    label: '灵活性能保障合同',
    shortLabel: '灵活性能保障',
    focusText: '关注 SOH 质保年限、终了/当期 SOH 基准及循环边界工况',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeCardClass: 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500',
    prefix: 'SOH',
    defaultEvalPeriod: '年度 SOH 标定与日工况连续积分考核',
    defaultPenalty:
      '按标准基准工况考核质保期终了 SOH；若因超循环、超倍率或高温高 SOC 静置导致衰减加速，按灵活性能保障算法折算质保期或触发补容方案。'
  },
  FLEXIBLE_CONDITION: {
    label: '灵活工况合同',
    shortLabel: '灵活工况',
    focusText: '聚焦 SOH、AUC、RTE、可用度四大核心指标综合履约考核',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    activeCardClass: 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500',
    prefix: 'PERF',
    defaultEvalPeriod: '自然月度与季度四维综合考核',
    defaultPenalty:
      '同时考核 SOH、AUC、RTE 与系统可用度 SLA 四项核心指标；任一指标连续两月未达合同门槛时按阶梯保证金比例扣减。'
  }
};

const EVALUATION_PERIOD_PRESETS = [
  '自然月度 (每月1日00:00 - 月末24:00)',
  '自然季度与月度双重考核',
  '自然年度与月度联合考核',
  '年度 SOH 标定与日工况连续积分考核',
  '自然月度与季度四维综合考核',
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
    navigateToAvailabilityDrilldown,
    navigateToFlexibleWarranty,
    navigateToPerformanceDetail
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ContractType>('ALL');
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
    contractType: 'AVAILABILITY',
    title: '',
    customer: '',
    evaluationPeriod: CONTRACT_TYPE_META.AVAILABILITY.defaultEvalPeriod,
    slaThreshold: 99.5,
    flexibleWarrantySpec: { ...DEFAULT_FLEXIBLE_WARRANTY_SPEC },
    flexibleConditionSpec: { ...DEFAULT_FLEXIBLE_CONDITION_SPEC },
    validFrom: '2026-01-01',
    validTo: '2028-12-31',
    overallStatus: 'FULFILLED',
    penaltyClause: CONTRACT_TYPE_META.AVAILABILITY.defaultPenalty,
    linkedSiteIds: [],
    syncSiteSla: true
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  // Resolve bound sites for a contract
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

  const buildDefaultNo = (type: ContractType) =>
    `${CONTRACT_TYPE_META[type].prefix}-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`;

  const openCreateModal = (prefillSiteId?: string, initialType: ContractType = 'AVAILABILITY') => {
    const prefillSite = prefillSiteId ? sites.find(s => s.id === prefillSiteId) : undefined;
    const meta = CONTRACT_TYPE_META[initialType];
    setFormState({
      contractNo: buildDefaultNo(initialType),
      contractType: initialType,
      title: prefillSite
        ? `${prefillSite.siteName} ${meta.label}`
        : '',
      customer: prefillSite?.customer || '',
      evaluationPeriod: meta.defaultEvalPeriod,
      slaThreshold: prefillSite?.slaThreshold ?? 99.5,
      flexibleWarrantySpec: { ...DEFAULT_FLEXIBLE_WARRANTY_SPEC },
      flexibleConditionSpec: {
        ...DEFAULT_FLEXIBLE_CONDITION_SPEC,
        availabilitySla: prefillSite?.slaThreshold ?? DEFAULT_FLEXIBLE_CONDITION_SPEC.availabilitySla
      },
      validFrom: '2026-01-01',
      validTo: initialType === 'FLEXIBLE_WARRANTY' ? '2035-12-31' : '2028-12-31',
      overallStatus: 'FULFILLED',
      penaltyClause: meta.defaultPenalty,
      linkedSiteIds: prefillSite ? [prefillSite.id] : [],
      syncSiteSla: true
    });
    setSiteSearchInForm('');
    setFormError(null);
    setFormModal({ mode: 'create' });
  };

  const openEditModal = (contract: Contract) => {
    const cType: ContractType = contract.contractType || 'AVAILABILITY';
    const boundIds = getBoundSitesForContract(contract).map(s => s.id);
    setFormState({
      contractNo: contract.contractNo,
      contractType: cType,
      title: contract.title,
      customer: contract.customer,
      evaluationPeriod: contract.evaluationPeriod,
      slaThreshold: contract.slaThreshold,
      flexibleWarrantySpec: contract.flexibleWarrantySpec
        ? { ...contract.flexibleWarrantySpec }
        : { ...DEFAULT_FLEXIBLE_WARRANTY_SPEC },
      flexibleConditionSpec: contract.flexibleConditionSpec
        ? { ...contract.flexibleConditionSpec }
        : {
            ...DEFAULT_FLEXIBLE_CONDITION_SPEC,
            availabilitySla: contract.slaThreshold || DEFAULT_FLEXIBLE_CONDITION_SPEC.availabilitySla
          },
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

  // Switch contract type inside modal cleanly
  const handleSelectTypeInForm = (nextType: ContractType) => {
    if (nextType === formState.contractType) return;
    const prevMeta = CONTRACT_TYPE_META[formState.contractType];
    const nextMeta = CONTRACT_TYPE_META[nextType];

    setFormState(prev => {
      const shouldUpdateNo =
        formModal?.mode === 'create' &&
        (prev.contractNo.startsWith(`${prevMeta.prefix}-`) || !prev.contractNo.trim());
      const shouldUpdateEval =
        prev.evaluationPeriod === prevMeta.defaultEvalPeriod || !prev.evaluationPeriod.trim();
      const shouldUpdatePenalty =
        prev.penaltyClause === prevMeta.defaultPenalty || !prev.penaltyClause.trim();

      return {
        ...prev,
        contractType: nextType,
        contractNo: shouldUpdateNo ? buildDefaultNo(nextType) : prev.contractNo,
        evaluationPeriod: shouldUpdateEval ? nextMeta.defaultEvalPeriod : prev.evaluationPeriod,
        penaltyClause: shouldUpdatePenalty ? nextMeta.defaultPenalty : prev.penaltyClause,
        validTo:
          formModal?.mode === 'create'
            ? nextType === 'FLEXIBLE_WARRANTY'
              ? '2035-12-31'
              : '2028-12-31'
            : prev.validTo
      };
    });
    setFormError(null);
  };

  // Handle cross-page deep link actions
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
      const cType: ContractType = c.contractType || 'AVAILABILITY';
      if (typeFilter !== 'ALL' && cType !== typeFilter) return false;
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
          c.customer.toLowerCase().includes(key) ||
          CONTRACT_TYPE_META[cType].label.toLowerCase().includes(key);
        if (!matchSelf && !matchSite) return false;
      }
      return true;
    });
  }, [contracts, sites, typeFilter, statusFilter, searchTerm]);

  const summaryStats = useMemo(() => {
    const fulfilled = contracts.filter(c => c.overallStatus === 'FULFILLED').length;
    const atRisk = contracts.filter(c => c.overallStatus === 'AT_RISK').length;
    const breached = contracts.filter(c => c.overallStatus === 'BREACHED').length;
    const availCount = contracts.filter(c => (c.contractType || 'AVAILABILITY') === 'AVAILABILITY').length;
    const warrantyCount = contracts.filter(c => c.contractType === 'FLEXIBLE_WARRANTY').length;
    const conditionCount = contracts.filter(c => c.contractType === 'FLEXIBLE_CONDITION').length;
    const coveredSiteIds = new Set<string>();
    contracts.forEach(c => {
      getBoundSitesForContract(c).forEach(s => coveredSiteIds.add(s.id));
    });
    return {
      total: contracts.length,
      fulfilled,
      atRisk,
      breached,
      availCount,
      warrantyCount,
      conditionCount,
      coveredSites: coveredSiteIds.size
    };
  }, [contracts, sites]);

  const handleToggleSiteInForm = (siteId: string) => {
    setFormState(prev => {
      const exists = prev.linkedSiteIds.includes(siteId);
      const nextIds = exists
        ? prev.linkedSiteIds.filter(id => id !== siteId)
        : [...prev.linkedSiteIds, siteId];

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

    // Type-specific metric validation
    if (formState.contractType === 'AVAILABILITY') {
      if (formState.slaThreshold < 80 || formState.slaThreshold > 100) {
        setFormError('站点可用度 SLA 阈值必须在 80.00% ~ 100.00% 之间');
        return;
      }
    } else if (formState.contractType === 'FLEXIBLE_WARRANTY') {
      const fw = formState.flexibleWarrantySpec;
      if (fw.warrantyYears < 1 || fw.warrantyYears > 30) {
        setFormError('质保年限需在 1 ~ 30 年之间');
        return;
      }
      if (fw.finalGuaranteedSoh < 50 || fw.finalGuaranteedSoh > 100) {
        setFormError('质保终了 SOH 保证值必须在 50.0% ~ 100.0% 之间');
        return;
      }
      if (fw.currentSohBaseline < 50 || fw.currentSohBaseline > 100) {
        setFormError('当前阶段基准 SOH 必须在 50.0% ~ 100.0% 之间');
        return;
      }
      if (fw.annualBaselineEfc <= 0 || fw.maxCrate <= 0 || fw.maxDodPct < 10 || fw.maxDodPct > 100) {
        setFormError('请检查年基准等效循环、最大倍率 (>0) 及最大充放电深度 (10% ~ 100%)');
        return;
      }
    } else if (formState.contractType === 'FLEXIBLE_CONDITION') {
      const fc = formState.flexibleConditionSpec;
      if (fc.sohThreshold < 50 || fc.sohThreshold > 100) {
        setFormError('核心 SOH 阈值必须在 50.0% ~ 100.0% 之间');
        return;
      }
      if (fc.aucThreshold < 50 || fc.aucThreshold > 100) {
        setFormError('核心 AUC 阈值必须在 50.0% ~ 100.0% 之间');
        return;
      }
      if (fc.rteBaseline < 50 || fc.rteBaseline > 100) {
        setFormError('核心 RTE 基线必须在 50.0% ~ 100.0% 之间');
        return;
      }
      if (fc.availabilitySla < 80 || fc.availabilitySla > 100) {
        setFormError('核心可用度 SLA 必须在 80.00% ~ 100.00% 之间');
        return;
      }
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

    const effectiveSla =
      formState.contractType === 'FLEXIBLE_CONDITION'
        ? formState.flexibleConditionSpec.availabilitySla
        : formState.contractType === 'FLEXIBLE_WARRANTY'
        ? formState.flexibleWarrantySpec.currentSohBaseline
        : formState.slaThreshold;

    const payload: Partial<Contract> = {
      contractNo: formState.contractNo,
      contractType: formState.contractType,
      title: formState.title,
      customer: formState.customer,
      evaluationPeriod: formState.evaluationPeriod,
      slaThreshold: effectiveSla,
      flexibleWarrantySpec:
        formState.contractType === 'FLEXIBLE_WARRANTY' ? formState.flexibleWarrantySpec : undefined,
      flexibleConditionSpec:
        formState.contractType === 'FLEXIBLE_CONDITION' ? formState.flexibleConditionSpec : undefined,
      validFrom: formState.validFrom,
      validTo: formState.validTo,
      overallStatus: formState.overallStatus,
      penaltyClause: formState.penaltyClause
    };

    const typeName = CONTRACT_TYPE_META[formState.contractType].shortLabel;

    if (formModal?.mode === 'create') {
      const created = addContract(payload, formState.linkedSiteIds, formState.syncSiteSla);
      setSelectedContractId(created.id);
      setFormModal(null);
      showToast(
        `已录入${typeName}合同【${created.contractNo}】，关联 ${formState.linkedSiteIds.length} 个站点`
      );
    } else if (formModal?.mode === 'edit' && formModal.contractId) {
      updateContract(
        formModal.contractId,
        payload,
        formState.linkedSiteIds,
        formState.syncSiteSla
      );
      setSelectedContractId(formModal.contractId);
      setFormModal(null);
      showToast(`已保存${typeName}合同【${formState.contractNo}】更新`);
    }
  };

  const getCoreMetricsSummaryText = (c: Contract): string => {
    const cType: ContractType = c.contractType || 'AVAILABILITY';
    if (cType === 'FLEXIBLE_WARRANTY') {
      const fw = c.flexibleWarrantySpec || DEFAULT_FLEXIBLE_WARRANTY_SPEC;
      return `终了 SOH ≥ ${fw.finalGuaranteedSoh.toFixed(1)}% · 当期基准 ${fw.currentSohBaseline.toFixed(1)}% · ${fw.annualBaselineEfc}次/年 · ${fw.maxCrate.toFixed(2)}C`;
    }
    if (cType === 'FLEXIBLE_CONDITION') {
      const fc = c.flexibleConditionSpec || {
        ...DEFAULT_FLEXIBLE_CONDITION_SPEC,
        availabilitySla: c.slaThreshold
      };
      return `SOH ≥ ${fc.sohThreshold.toFixed(1)}% · AUC ≥ ${fc.aucThreshold.toFixed(1)}% · RTE ≥ ${fc.rteBaseline.toFixed(1)}% · 可用度 ≥ ${fc.availabilitySla.toFixed(2)}%`;
    }
    return `可用度 SLA ≥ ${c.slaThreshold.toFixed(2)}%`;
  };

  const handleExportContracts = () => {
    const headers = [
      '合同编号',
      '合同类型',
      '合同名称',
      '签约客户',
      '核心指标要求',
      '生效日期',
      '终止日期',
      '履约状态',
      '关联站点数'
    ];
    const rows = filteredContracts.map(c => {
      const cType: ContractType = c.contractType || 'AVAILABILITY';
      const boundCount = getBoundSitesForContract(c).length;
      const statusLabel =
        c.overallStatus === 'FULFILLED'
          ? '达标履约中'
          : c.overallStatus === 'AT_RISK'
          ? '履约风险预警'
          : '已违约';
      return [
        `"${c.contractNo}"`,
        `"${CONTRACT_TYPE_META[cType].shortLabel}"`,
        `"${c.title}"`,
        `"${c.customer}"`,
        `"${getCoreMetricsSummaryText(c)}"`,
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
    link.setAttribute('download', `Contracts_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`已导出 ${filteredContracts.length} 份站点合同台账 (CSV)`);
  };

  const renderTypeBadge = (contractType?: ContractType) => {
    const t: ContractType = contractType || 'AVAILABILITY';
    const meta = CONTRACT_TYPE_META[t];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${meta.badgeClass}`}
      >
        {t === 'FLEXIBLE_WARRANTY' ? (
          <BatteryCharging className="w-3 h-3" />
        ) : t === 'FLEXIBLE_CONDITION' ? (
          <Sliders className="w-3 h-3" />
        ) : (
          <Activity className="w-3 h-3" />
        )}
        <span>{meta.shortLabel}</span>
      </span>
    );
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

  const renderTableCoreMetrics = (c: Contract) => {
    const cType: ContractType = c.contractType || 'AVAILABILITY';
    if (cType === 'FLEXIBLE_WARRANTY') {
      const fw = c.flexibleWarrantySpec || DEFAULT_FLEXIBLE_WARRANTY_SPEC;
      return (
        <div className="space-y-0.5 whitespace-nowrap">
          <div className="font-mono tabular-nums font-bold text-emerald-700">
            终了 SOH ≥ {fw.finalGuaranteedSoh.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            当期 {fw.currentSohBaseline.toFixed(1)}% · {fw.annualBaselineEfc}次/年 · {fw.maxCrate.toFixed(2)}C
          </div>
        </div>
      );
    }
    if (cType === 'FLEXIBLE_CONDITION') {
      const fc = c.flexibleConditionSpec || {
        ...DEFAULT_FLEXIBLE_CONDITION_SPEC,
        availabilitySla: c.slaThreshold
      };
      return (
        <div className="space-y-0.5 whitespace-nowrap font-mono tabular-nums">
          <div className="font-bold text-indigo-700">
            SOH ≥ {fc.sohThreshold.toFixed(1)}% · AUC ≥ {fc.aucThreshold.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-600">
            RTE ≥ {fc.rteBaseline.toFixed(1)}% · 可用度 ≥ {fc.availabilitySla.toFixed(2)}%
          </div>
        </div>
      );
    }
    return (
      <div className="whitespace-nowrap">
        <span className="font-mono tabular-nums font-bold text-blue-600 text-sm">
          SLA ≥ {c.slaThreshold.toFixed(2)}%
        </span>
      </div>
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

  const inspectedType: ContractType = inspectedContract?.contractType || 'AVAILABILITY';
  const inspectedChartMin = useMemo(() => {
    if (!inspectedContract) return 95;
    const values = inspectedContract.monthlyTrend.map(t => t.actualSla);
    const minVal = Math.min(...values, inspectedContract.slaThreshold);
    if (inspectedType === 'FLEXIBLE_WARRANTY') {
      return Math.max(70, Math.floor(minVal - 1));
    }
    return Math.max(95, Math.floor((minVal - 0.6) * 10) / 10);
  }, [inspectedContract, inspectedType]);

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
              站点可用度 · 灵活性能保障 · 灵活工况三类合同统一管理
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持按合同类型录入不同的指标约定：站点可用度聚焦 SLA，灵活性能保障聚焦 SOH，灵活工况聚焦 SOH / AUC / RTE / 可用度四维指标。
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              syncContracts();
              showToast('已完成多类型合同台账与站点履约状态校验同步');
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
          <div className="text-[11px] font-medium text-slate-500">在管合同总数 (分类型)</div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-black font-mono tabular-nums text-slate-900">
              {summaryStats.total}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              可用度 {summaryStats.availCount} · 性能保障 {summaryStats.warrantyCount} · 灵活工况 {summaryStats.conditionCount}
            </span>
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
                {renderTypeBadge(inspectedContract.contractType)}
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
                  核心指标约定:{' '}
                  <strong className="text-blue-700 font-mono tabular-nums">
                    {getCoreMetricsSummaryText(inspectedContract)}
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
              <LineChart data={inspectedContract.monthlyTrend} margin={{ top: 10, right: 44, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[inspectedChartMin, 100]}
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
                  formatter={(val: any) => [
                    `${val}%`,
                    inspectedType === 'FLEXIBLE_WARRANTY' ? '当期 SOH 跟踪值' : '实际月度可用度'
                  ]}
                />
                <ReferenceLine
                  y={inspectedContract.slaThreshold}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value:
                      inspectedType === 'FLEXIBLE_WARRANTY'
                        ? `SOH基准 ${inspectedContract.slaThreshold}%`
                        : `SLA ${inspectedContract.slaThreshold}%`,
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'right'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actualSla"
                  stroke={inspectedType === 'FLEXIBLE_WARRANTY' ? '#10b981' : '#2563eb'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: inspectedType === 'FLEXIBLE_WARRANTY' ? '#10b981' : '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-red-600">违约与考核条款：</span>
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
            <span className="text-slate-600 font-medium">合同类型:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'ALL' | ContractType)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="ALL">全部类型</option>
              <option value="AVAILABILITY">站点可用度 (SLA)</option>
              <option value="FLEXIBLE_WARRANTY">灵活性能保障 (SOH)</option>
              <option value="FLEXIBLE_CONDITION">灵活工况 (SOH/AUC/RTE/可用度)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">履约状态:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'ALL' | Contract['overallStatus'])}
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
              <th className="py-3 px-3">合同类型</th>
              <th className="py-3 px-3">签约客户</th>
              <th className="py-3 px-3">覆盖站点 / 区域</th>
              <th className="py-3 px-3">核心指标要求</th>
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
                <td colSpan={10} className="py-10 text-center text-slate-400">
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
                    <td className="py-3.5 px-4 max-w-[270px]">
                      <div className="font-semibold text-slate-900 truncate" title={c.title}>
                        {c.title}
                      </div>
                      <div className="text-[11px] text-blue-600 font-mono mt-0.5">{c.contractNo}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">{renderTypeBadge(c.contractType)}</td>
                    <td className="py-3.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                      {c.customer}
                    </td>
                    <td className="py-3.5 px-3 max-w-[210px]">
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
                    <td className="py-3.5 px-3">{renderTableCoreMetrics(c)}</td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-[165px] truncate" title={c.evaluationPeriod}>
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
      {/* MODAL 1: Contract Detail View Modal (分类型指标展示 + 跨页面跳转)       */}
      {/* ===================================================================== */}
      {viewingContract && (() => {
        const viewType: ContractType = viewingContract.contractType || 'AVAILABILITY';
        const fw = viewingContract.flexibleWarrantySpec || DEFAULT_FLEXIBLE_WARRANTY_SPEC;
        const fc = viewingContract.flexibleConditionSpec || {
          ...DEFAULT_FLEXIBLE_CONDITION_SPEC,
          availabilitySla: viewingContract.slaThreshold
        };
        const boundSites = getBoundSitesForContract(viewingContract);

        return (
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
                        {renderTypeBadge(viewType)}
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
                {/* Type-specific Core Requirements */}
                {viewType === 'AVAILABILITY' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
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
                )}

                {viewType === 'FLEXIBLE_WARRANTY' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                        <div className="text-emerald-700 font-medium">当期基准 SOH</div>
                        <div className="text-lg font-black font-mono tabular-nums text-emerald-700 mt-1">
                          {fw.currentSohBaseline.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200">
                        <div className="text-slate-600 font-medium">质保终了 SOH ({fw.warrantyYears}年)</div>
                        <div className="text-lg font-black font-mono tabular-nums text-slate-900 mt-1">
                          ≥ {fw.finalGuaranteedSoh.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">合同起止日期</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-1.5">
                          {viewingContract.validFrom} ~ {viewingContract.validTo}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">SOH 考核周期</div>
                        <div className="text-xs font-bold text-slate-800 mt-1.5">
                          {viewingContract.evaluationPeriod}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">年基准等效循环</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                          ≤ {fw.annualBaselineEfc} 次/年
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">基准最大充放倍率</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                          {fw.maxCrate.toFixed(2)} C
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">基准放电深度 (DOD)</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                          ≤ {fw.maxDodPct.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">最高温 / 规划均 SOC</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                          {fw.baselineTempMax.toFixed(1)}℃ / {fw.plannedAvgSocPct.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewType === 'FLEXIBLE_CONDITION' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200">
                        <div className="text-indigo-700 font-medium">核心 SOH 阈值</div>
                        <div className="text-lg font-black font-mono tabular-nums text-indigo-700 mt-1">
                          ≥ {fc.sohThreshold.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200">
                        <div className="text-indigo-700 font-medium">核心 AUC 阈值</div>
                        <div className="text-lg font-black font-mono tabular-nums text-indigo-700 mt-1">
                          ≥ {fc.aucThreshold.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200">
                        <div className="text-indigo-700 font-medium">核心 RTE 基线</div>
                        <div className="text-lg font-black font-mono tabular-nums text-indigo-700 mt-1">
                          ≥ {fc.rteBaseline.toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                        <div className="text-blue-700 font-medium">核心可用度 SLA</div>
                        <div className="text-lg font-black font-mono tabular-nums text-blue-700 mt-1">
                          ≥ {fc.availabilitySla.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">合同生效日期</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                          {viewingContract.validFrom}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">合同终止日期</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                          {viewingContract.validTo}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-500">四维综合考核周期</div>
                        <div className="text-xs font-bold text-slate-800 mt-1">
                          {viewingContract.evaluationPeriod}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                      <span>合同关联站点与履约实况 ({boundSites.length} 站)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      可直接跳转至对应专项监控页面或站点台账
                    </span>
                  </div>

                  {boundSites.length === 0 ? (
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
                            <th className="py-2.5 px-3">区域 · 代表处</th>
                            <th className="py-2.5 px-3 font-mono">当期可用度</th>
                            <th className="py-2.5 px-3 font-mono">
                              {viewType === 'FLEXIBLE_WARRANTY' ? '当期 SOH 基准' : '站点 SLA 门槛'}
                            </th>
                            <th className="py-2.5 px-3">履约状态</th>
                            <th className="py-2.5 px-3 text-right">跨页面跳转</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {boundSites.map(s => {
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
                                  {viewType === 'FLEXIBLE_WARRANTY'
                                    ? `${fw.currentSohBaseline.toFixed(1)}%`
                                    : `${s.slaThreshold}%`}
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${
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
                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5">
                                    {viewType === 'FLEXIBLE_WARRANTY' && (
                                      <button
                                        onClick={() => {
                                          setViewingContractId(null);
                                          navigateToFlexibleWarranty(s.id);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                                      >
                                        <BatteryCharging className="w-3 h-3" />
                                        <span>灵活性能保证</span>
                                        <ArrowUpRight className="w-3 h-3" />
                                      </button>
                                    )}
                                    {viewType === 'FLEXIBLE_CONDITION' && (
                                      <button
                                        onClick={() => {
                                          setViewingContractId(null);
                                          navigateToPerformanceDetail(s.id);
                                        }}
                                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                                      >
                                        <Sliders className="w-3 h-3" />
                                        <span>性能工况</span>
                                        <ArrowUpRight className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setViewingContractId(null);
                                        navigateToAvailabilityDrilldown(s.id, 0);
                                      }}
                                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap"
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
                                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                                    >
                                      <span>站点台账</span>
                                    </button>
                                  </div>
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
        );
      })()}

      {/* ===================================================================== */}
      {/* MODAL 2: Create / Edit Site Contract Modal (三类合同差异化录入/编辑)  */}
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
                    {formModal.mode === 'create' ? '录入站点合同' : '编辑站点合同'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    按合同类型配置差异化指标要求，保存后实时关联绑定站点并联动对应监控视图
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

              {/* Step 1: 3-Way Contract Type Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  合同类型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['AVAILABILITY', 'FLEXIBLE_WARRANTY', 'FLEXIBLE_CONDITION'] as ContractType[]).map(
                    tKey => {
                      const meta = CONTRACT_TYPE_META[tKey];
                      const active = formState.contractType === tKey;
                      return (
                        <button
                          key={tKey}
                          type="button"
                          onClick={() => handleSelectTypeInForm(tKey)}
                          className={`text-left p-3 rounded-lg border transition-all ${
                            active
                              ? meta.activeCardClass
                              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {tKey === 'FLEXIBLE_WARRANTY' ? (
                                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                              ) : tKey === 'FLEXIBLE_CONDITION' ? (
                                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                              ) : (
                                <Activity className="w-3.5 h-3.5 text-blue-600" />
                              )}
                              <span>{meta.label}</span>
                            </span>
                            {active && <Check className="w-3.5 h-3.5 text-slate-800 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {meta.focusText}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Step 2: Basic Info */}
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
                    placeholder={`如：CSG-SZ-2026-${CONTRACT_TYPE_META[formState.contractType].prefix}-102`}
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
                  placeholder={`如：XX储能电站${CONTRACT_TYPE_META[formState.contractType].label}`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Step 3: Type-Specific Core Requirements */}
              {formState.contractType === 'AVAILABILITY' && (
                <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/40 space-y-3">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>站点可用度合同核心约定 (SLA)</span>
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formState.contractType === 'FLEXIBLE_WARRANTY' && (
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      <span>灵活性能保障核心指标 (SOH 质保与工况边界)</span>
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      重点约束质保期终了/当期 SOH 基准与运行工况上限
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        当期 SOH 基准 (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="100"
                        required
                        value={formState.flexibleWarrantySpec.currentSohBaseline}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              currentSohBaseline: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        终了 SOH 保证 (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="100"
                        required
                        value={formState.flexibleWarrantySpec.finalGuaranteedSoh}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              finalGuaranteedSoh: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        质保年限 (年) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        required
                        value={formState.flexibleWarrantySpec.warrantyYears}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              warrantyYears: parseInt(e.target.value, 10) || 10
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        年基准循环 (次/年)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        required
                        value={formState.flexibleWarrantySpec.annualBaselineEfc}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              annualBaselineEfc: parseInt(e.target.value, 10) || 365
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        最大充放倍率 (C)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="4"
                        required
                        value={formState.flexibleWarrantySpec.maxCrate}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              maxCrate: parseFloat(e.target.value) || 0.5
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        最大放电深度 (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="10"
                        max="100"
                        required
                        value={formState.flexibleWarrantySpec.maxDodPct}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              maxDodPct: parseFloat(e.target.value) || 90
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        允许最高温 (℃)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="15"
                        max="60"
                        required
                        value={formState.flexibleWarrantySpec.baselineTempMax}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              baselineTempMax: parseFloat(e.target.value) || 35
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        规划平均 SOC (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="10"
                        max="100"
                        required
                        value={formState.flexibleWarrantySpec.plannedAvgSocPct}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleWarrantySpec: {
                              ...formState.flexibleWarrantySpec,
                              plannedAvgSocPct: parseFloat(e.target.value) || 50
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        生效日期 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formState.validFrom}
                        onChange={e => setFormState({ ...formState, validFrom: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formState.contractType === 'FLEXIBLE_CONDITION' && (
                <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>灵活工况合同四大核心指标约定 (SOH / AUC / RTE / 可用度)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        核心 SOH 阈值 (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="100"
                        required
                        value={formState.flexibleConditionSpec.sohThreshold}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleConditionSpec: {
                              ...formState.flexibleConditionSpec,
                              sohThreshold: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        核心 AUC 阈值 (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="100"
                        required
                        value={formState.flexibleConditionSpec.aucThreshold}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleConditionSpec: {
                              ...formState.flexibleConditionSpec,
                              aucThreshold: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        核心 RTE 基线 (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="50"
                        max="100"
                        required
                        value={formState.flexibleConditionSpec.rteBaseline}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleConditionSpec: {
                              ...formState.flexibleConditionSpec,
                              rteBaseline: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        核心可用度 SLA (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="80"
                        max="100"
                        required
                        value={formState.flexibleConditionSpec.availabilitySla}
                        onChange={e =>
                          setFormState({
                            ...formState,
                            flexibleConditionSpec: {
                              ...formState.flexibleConditionSpec,
                              availabilitySla: parseFloat(e.target.value) || 99.5
                            }
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        生效日期 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formState.validFrom}
                        onChange={e => setFormState({ ...formState, validFrom: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                <label className="block font-semibold text-slate-700 mb-1">违约与考核条款</label>
                <textarea
                  rows={2}
                  value={formState.penaltyClause}
                  onChange={e => setFormState({ ...formState, penaltyClause: e.target.value })}
                  placeholder="描述指标未达标时的扣款比例、补容/免责约定..."
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
                      同一站点可同时持有不同类型的合同；仅当同一站点绑定另一份同类型合同时会替换同类型旧绑定
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
                    const sameTypeConflict = contracts.find(
                      c =>
                        (c.contractType || 'AVAILABILITY') === formState.contractType &&
                        c.id !== formModal.contractId &&
                        c.associatedSites.some(a => a.siteId === s.id)
                    );
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
                          ) : sameTypeConflict ? (
                            <span className="text-[11px] text-amber-600 font-mono">
                              同类型原合同: {sameTypeConflict.contractNo}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">可绑定</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {formState.contractType === 'FLEXIBLE_WARRANTY' ? (
                  <p className="text-[11px] text-emerald-700 pt-1">
                    说明：灵活性能保障合同以 SOH 质保与工况边界考核为主，保存时不会覆盖所选站点的可用度 SLA 阈值。
                  </p>
                ) : (
                  <label className="flex items-center gap-2 text-xs text-slate-700 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formState.syncSiteSla}
                      onChange={e => setFormState({ ...formState, syncSiteSla: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      保存时同步将约定可用度 SLA 阈值 (
                      <strong className="font-mono text-blue-600">
                        {(formState.contractType === 'FLEXIBLE_CONDITION'
                          ? formState.flexibleConditionSpec.availabilitySla
                          : formState.slaThreshold
                        ).toFixed(2)}
                        %
                      </strong>
                      ) 下发更新至所选站点
                    </span>
                  </label>
                )}
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
