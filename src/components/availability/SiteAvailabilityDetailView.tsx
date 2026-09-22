import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusLampBadge, RedundancyBadge } from '../common/StatusBadge';
import {
  ArrowLeft,
  Activity,
  Clock,
  Wrench,
  Sparkles,
  Zap,
  Radio,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AvailabilityDetailsTab } from './AvailabilityDetailsTab';
import { MergedFaultsTab } from '../sites/MergedFaultsTab';
import { WorkOrdersTab } from '../sites/WorkOrdersTab';

export const SiteAvailabilityDetailView: React.FC = () => {
  const {
    selectedSiteId,
    setSelectedSiteId,
    sites,
    availabilityDrilldownTab,
    setAvailabilityDrilldownTab,
    availabilityDrilldownDate,
    setAvailabilityDrilldownDate,
    setActiveTab,
    navigateToSiteDetail,
    workOrders,
    openAiDrawer
  } = useApp();

  const site = sites.find(s => s.id === selectedSiteId) || sites[0];

  // Associated work orders for this site
  const siteOrders = workOrders.filter(
    w =>
      (w.siteId && site.id && w.siteId === site.id) ||
      (w.siteName && site.siteName && w.siteName === site.siteName) ||
      (w.contractNo && site.contractNo && w.contractNo === site.contractNo) ||
      (Boolean(site?.siteName && w?.siteName && site.siteName.length >= 2 && w.siteName.includes(site.siteName.slice(0, 4))))
  );

  const [faultCausalChainTarget, setFaultCausalChainTarget] = useState<{
    deviceCode?: string;
    activeSubView?: 'merged' | 'alarms';
    alarmId?: string;
  } | null>(null);

  const isBreached = site.currentAvailability < site.slaThreshold;
  const gap = Number((site.currentAvailability - site.slaThreshold).toFixed(2));

  // The 3 availability detail & drilldown tabs
  const tabs = [
    {
      id: 0,
      label: '可用度详情',
      subtext: '5分钟 · 日 · 周 · 月 · 年 周期监控',
      icon: Zap
    },
    {
      id: 1,
      label: '中断告警',
      subtext: 'Rule R11 · 故障归并 / 中断告警 / ECO免责',
      icon: Clock,
      count: site.mergedFaults?.length || 0
    },
    {
      id: 2,
      label: '工单详情',
      subtext: 'Rule R4 · 现场消缺 / 方案闭环 / MTTR',
      icon: Wrench,
      count: siteOrders.length
    }
  ];

  const handleDrilldownNavigate = (
    targetIdx: number,
    extra?: { deviceCode?: string; activeSubView?: 'merged' | 'alarms'; alarmId?: string }
  ) => {
    if (extra) {
      setFaultCausalChainTarget(extra);
    } else {
      setFaultCausalChainTarget(null);
    }
    if (targetIdx === 1) {
      setAvailabilityDrilldownTab(1); // 中断告警
    } else if (targetIdx === 2 || targetIdx === 4) {
      setAvailabilityDrilldownTab(2); // 工单详情
    } else if (targetIdx === 3) {
      navigateToSiteDetail(site.id, 1); // 核心设备拓扑
    } else {
      setAvailabilityDrilldownTab(0); // 可用度详情
    }
  };

  const handleSiteSwitch = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
  };

  const totalInterruptionMinutes = (site.mergedFaults || []).reduce(
    (acc, f) => acc + f.equivalentInterruptionMinutes,
    0
  );

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Availability Monitor Drilldown Master Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        {/* Layer Breadcrumb & Quick Site Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <button
              onClick={() => setActiveTab('availability_monitor')}
              className="font-medium hover:text-blue-600 flex items-center gap-1 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回可用度监控大盘</span>
            </button>
            <span>/</span>
            <span className="text-slate-600">{site.region}</span>
            <span>/</span>
            <span className="text-slate-600">{site.representativeOffice}</span>
            <span>/</span>
            <span className="text-slate-600">{site.customer}</span>
            <span>/</span>
            <span className="font-bold text-slate-900 font-mono">{site.siteCode}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
              可用度下钻分析
            </span>
          </div>

          {/* Quick Site Switcher Dropdown */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              切换下钻站点:
            </span>
            <select
              value={site.id}
              onChange={e => handleSiteSwitch(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-sm max-w-[320px] truncate"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.statusLamp.toUpperCase()}] {s.siteCode} - {s.siteName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Site Profile & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 mt-0.5 shrink-0">
              <Radio className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusLampBadge status={site.statusLamp} />
                <h1 className="text-lg font-bold text-slate-900">{site.siteName}</h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {site.siteCode}
                </span>
                <RedundancyBadge level={site.redundancy} />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 mt-2">
                <span>
                  所属客户: <strong className="text-slate-800 font-medium">{site.customer}</strong>
                </span>
                <span>
                  合同编号:{' '}
                  <span className="text-blue-600 font-mono font-medium">{site.contractNo}</span>
                </span>
                <span>
                  装机规模:{' '}
                  <strong className="text-slate-800 font-medium">{site.capacity}</strong>
                </span>
                <span>
                  投运时间: <span className="font-mono text-slate-700">{site.commissioningDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Cross-View Nav Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">当前当期可用度 (R1)</div>
                <div
                  className={`text-base font-black font-mono mt-0.5 flex items-center gap-1 ${
                    isBreached ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  <span>{site.currentAvailability}%</span>
                  {isBreached ? (
                    <span className="text-[10px] text-red-500 font-normal">({gap}%)</span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-normal">(+{gap}%)</span>
                  )}
                </div>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">SLA履约考核门槛</div>
                <div className="text-base font-black font-mono text-slate-800 mt-0.5">
                  {site.slaThreshold}%
                </div>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">累计停机中断</div>
                <div className="text-base font-black font-mono text-red-600 mt-0.5">
                  {totalInterruptionMinutes} <span className="text-[10px] text-slate-400 font-normal">min</span>
                </div>
              </div>
            </div>

            {/* Jump to Site Ledger */}
            <button
              id="btn-view-site-ledger"
              onClick={() => navigateToSiteDetail(site.id, 0)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-400 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all group"
              title="查看该站点的全景态势、核心设备拓扑、合同与SLA履约及离线日志批次"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>查看站点台账</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* AI Diagnosis */}
            <button
              onClick={() =>
                openAiDrawer(
                  `请针对站点【${site.siteName} (${site.siteCode})】展开深度可用度诊断。当前可用度为 ${site.currentAvailability}% (SLA门槛 ${site.slaThreshold}%)，累计等效 PCS 停机扣减 ${totalInterruptionMinutes} 分钟，当前有 ${site.mergedFaults.length} 场归并停机故障，请分析主要根因及改善建议。`
                )
              }
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 可用度深度归因诊断</span>
            </button>
          </div>
        </div>

        {/* 3 Availability Drilldown Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-3 mt-2">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = availabilityDrilldownTab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-avail-drilldown-${t.id}`}
                onClick={() => setAvailabilityDrilldownTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] font-normal ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {t.subtext}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 0: 可用度详情 (5分钟 / 每日 / 每周 / 每月 周期监控) */}
      {availabilityDrilldownTab === 0 && (
        <AvailabilityDetailsTab
          site={site}
          workOrders={siteOrders.length > 0 ? siteOrders : workOrders}
          selectedDate={availabilityDrilldownDate}
          onSelectDate={date => setAvailabilityDrilldownDate(date)}
          onNavigateTab={handleDrilldownNavigate}
        />
      )}

      {/* Tab 1: 中断告警 (故障归并与可用度告警合并 · Rule R11 & R2) */}
      {availabilityDrilldownTab === 1 && (
        <MergedFaultsTab
          site={site}
          onNavigateTab={handleDrilldownNavigate}
          workOrders={siteOrders.length > 0 ? siteOrders : workOrders}
          currentDate={availabilityDrilldownDate}
          initialTarget={faultCausalChainTarget}
          onClearTarget={() => setFaultCausalChainTarget(null)}
        />
      )}

      {/* Tab 2: 工单详情 (Rule R4) */}
      {availabilityDrilldownTab === 2 && (
        <WorkOrdersTab
          site={site}
          workOrders={workOrders}
        />
      )}
    </div>
  );
};
