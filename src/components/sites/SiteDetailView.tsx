import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusLampBadge, RedundancyBadge } from '../common/StatusBadge';
import { RedundancyLevel } from '../../types';
import {
  ArrowLeft,
  Activity,
  Shield,
  Clock,
  Wrench,
  FileText,
  UploadCloud,
  Cpu,
  Layers,
  Sparkles,
  Calendar,
  ChevronDown,
  Building,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Database,
  HeartPulse
} from 'lucide-react';

import { SitePanoramaTab } from './SitePanoramaTab';
import { DailySnapshotsTab } from './DailySnapshotsTab';
import { MergedFaultsTab } from './MergedFaultsTab';
import { CoreDevicesTab } from './CoreDevicesTab';
import { WorkOrdersTab } from './WorkOrdersTab';
import { ContractFulfillmentTab } from './ContractFulfillmentTab';
import { LogBatchesTab } from './LogBatchesTab';

export const SiteDetailView: React.FC = () => {
  const {
    selectedSiteId,
    setSelectedSiteId,
    sites,
    siteDetailTab,
    setSiteDetailTab,
    setActiveTab,
    updateSiteRedundancy,
    batches,
    workOrders,
    contracts,
    openAiDrawer
  } = useApp();

  const site = sites.find(s => s.id === selectedSiteId) || sites[0];

  // Internal state for selected day in drilldown
  const [selectedDrilldownDate, setSelectedDrilldownDate] = useState<string>('');

  // Associated counts
  const siteBatches = batches.filter(
    b => b.siteId === site.id || b.siteName === site.siteName || b.siteCode === site.siteCode
  );
  const siteOrders = workOrders.filter(
    w =>
      (w.siteId && site.id && w.siteId === site.id) ||
      (w.siteName && site.siteName && w.siteName === site.siteName) ||
      (w.contractNo && site.contractNo && w.contractNo === site.contractNo) ||
      (Boolean(site?.siteName && w?.siteName && site.siteName.length >= 2 && w.siteName.includes(site.siteName.slice(0, 4))))
  );

  const isBreached = site.currentAvailability < site.slaThreshold;
  const gap = Number((site.currentAvailability - site.slaThreshold).toFixed(2));

  // 7-Layer Site-Centric Drilldown Hierarchy
  const tabs = [
    { id: 0, label: '1. 站点全景态势', icon: Activity },
    { id: 1, label: '2. 逐日打点下钻 (R7)', icon: Calendar, count: site.dailySnapshots?.length || 30 },
    { id: 2, label: '3. 故障因果链 (R11)', icon: Clock, count: site.mergedFaults?.length || 0 },
    { id: 3, label: '4. 核心设备与拓扑 (R2)', icon: Cpu, count: site.coreDevices?.length || 0 },
    { id: 4, label: '5. PCare 工单闭环 (R4)', icon: Wrench, count: siteOrders.length },
    { id: 5, label: '6. 合同与 SLA 履约 (R10)', icon: FileText },
    { id: 6, label: '7. 离线日志批次 (R3)', icon: Database, count: siteBatches.length }
  ];

  const handleSelectDay = (date: string) => {
    setSelectedDrilldownDate(date);
    setSiteDetailTab(1); // switch to daily snapshot tab
  };

  const handleSiteSwitch = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Site-Centric Master Header & Drilldown Breadcrumb */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        {/* Layer Breadcrumb & Quick Site Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <button
              onClick={() => setActiveTab('sites')}
              className="font-medium hover:text-blue-600 flex items-center gap-1 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>全网站点大盘</span>
            </button>
            <span>/</span>
            <span className="text-slate-600">{site.region}</span>
            <span>/</span>
            <span className="text-slate-600">{site.representativeOffice}</span>
            <span>/</span>
            <span className="text-slate-600">{site.customer}</span>
            <span>/</span>
            <span className="font-bold text-slate-900 font-mono">{site.siteCode}</span>
          </div>

          {/* Quick Site Switcher Dropdown */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              切换站点:
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
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 mt-0.5 shrink-0">
              <Radio className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {site.siteName}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  {site.siteCode}
                </span>
                <StatusLampBadge status={site.statusLamp} size="md" />
                <RedundancyBadge level={site.redundancy} />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 mt-2">
                <span>
                  所属客户: <strong className="text-slate-800 font-medium">{site.customer}</strong>
                </span>
                <span>
                  装机规模: <strong className="text-slate-800 font-medium">{site.capacityMw} MW</strong>
                </span>
                <span>
                  关联合同: <strong className="text-blue-600 font-mono font-medium">{site.contractNo}</strong>
                </span>
                <span>
                  核心设备数: <strong className="text-slate-800 font-mono font-medium">{site.coreDevices.length} 台</strong>
                </span>
                <span>
                  运维负责人: <strong className="text-slate-800 font-medium">{site.owner}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Dual Metric Pills & Quick Actions */}
          <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto">
            {/* Availability Pill */}
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <div className="text-[10px] text-slate-500 font-medium">当期合同可用度 (R1)</div>
              <div
                className={`text-lg font-black font-mono leading-tight ${
                  isBreached ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {site.currentAvailability}%{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  (SLA {site.slaThreshold}%)
                </span>
              </div>
            </div>

            {/* Reliability Score Pill */}
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
              <div className="text-[10px] text-slate-500 font-medium">可靠性综合评分 (R1)</div>
              <div className="text-lg font-black font-mono text-indigo-600 leading-tight">
                {site.reliabilityScore.totalScore}{' '}
                <span className="text-[10px] font-normal text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('log_import')}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>导入日志</span>
              </button>
              <button
                onClick={() => setActiveTab('performance_evaluation')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-semibold border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-xs"
                title="进入性能评估分析服务"
              >
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                <span>性能评估分析</span>
              </button>
              <button
                onClick={() =>
                  openAiDrawer(
                    `针对站点【${site.siteName} (${site.siteCode})】进行深度可用度因果归因与告警诊断`
                  )
                }
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI 诊断</span>
              </button>
            </div>
          </div>
        </div>

        {/* 7-Layer Site-Centric Drilldown Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3 mt-2">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = siteDetailTab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-site-detail-${t.id}`}
                onClick={() => setSiteDetailTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Layer 0: Site Panorama & Dual Indicator Overview */}
      {siteDetailTab === 0 && (
        <SitePanoramaTab
          site={site}
          onNavigateTab={idx => setSiteDetailTab(idx)}
          onSelectDay={handleSelectDay}
        />
      )}

      {/* Layer 1: Daily Snapshots & Day-Level Inspector (Rule R7) */}
      {siteDetailTab === 1 && (
        <DailySnapshotsTab
          site={site}
          selectedDate={selectedDrilldownDate}
          onSelectDate={date => setSelectedDrilldownDate(date)}
          onNavigateTab={idx => setSiteDetailTab(idx)}
        />
      )}

      {/* Layer 2: Merged Faults & Causality Waterfall (Rule R11) */}
      {siteDetailTab === 2 && (
        <MergedFaultsTab
          site={site}
          onNavigateTab={idx => setSiteDetailTab(idx)}
        />
      )}

      {/* Layer 3: Core Devices & Topology Visualizer (Rule R2) */}
      {siteDetailTab === 3 && (
        <CoreDevicesTab
          site={site}
          onUpdateRedundancy={updateSiteRedundancy}
          onNavigateTab={idx => setSiteDetailTab(idx)}
        />
      )}

      {/* Layer 4: PCare Work Order Lifecycle & Solution-Ready Closure (Rule R4) */}
      {siteDetailTab === 4 && (
        <WorkOrdersTab
          site={site}
          workOrders={workOrders}
        />
      )}

      {/* Layer 5: Contract & SLA Fulfillment Risk (Rule R9 & R10) */}
      {siteDetailTab === 5 && (
        <ContractFulfillmentTab
          site={site}
          contracts={contracts}
          allSites={sites}
          onSelectSite={handleSiteSwitch}
        />
      )}

      {/* Layer 6: Offline Log Batches & Latest-Wins Overlap (Rule R3) */}
      {siteDetailTab === 6 && (
        <LogBatchesTab
          site={site}
          batches={batches}
          onNavigateTab={idx => setSiteDetailTab(idx)}
        />
      )}
    </div>
  );
};
