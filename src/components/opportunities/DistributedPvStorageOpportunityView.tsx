import React, { useState } from 'react';
import {
  PvStorageSiteProfile,
  ReadinessState,
  GlobalRegion
} from '../../types/pvStoragePRD';
import {
  INITIAL_FUNNEL_SUMMARY,
  GLOBAL_ONBOARDING_STATS,
  MOCK_PV_STORAGE_SITES
} from '../../mock/pvStoragePRDData';
import {
  Target,
  Layers,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BarChart3,
  Globe,
  Sliders,
  Download,
  Search,
  ArrowRight,
  ShieldAlert,
  Zap,
  BatteryCharging,
  Sun,
  Cpu,
  Info,
  Check,
  Building2,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

type SubTabKey =
  | 'funnel_readiness' // M-01 & M-02
  | 'war_room_ranking' // M-03
  | 'revenue_forecast' // M-04
  | 'sizing_and_multi' // M-05 & M-06
  | 'quality_and_region'; // M-07 & M-08

export const DistributedPvStorageOpportunityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTabKey>('funnel_readiness');
  const [sites, setSites] = useState<PvStorageSiteProfile[]>(MOCK_PV_STORAGE_SITES);
  const [selectedSite, setSelectedSite] = useState<PvStorageSiteProfile>(MOCK_PV_STORAGE_SITES[0]);
  const [regionFilter, setRegionFilter] = useState<'ALL' | GlobalRegion>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'P0' | 'P1' | 'P2'>('ALL');
  const [searchKey, setSearchKey] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 过滤站点列表
  const filteredSites = sites.filter(s => {
    const matchRegion = regionFilter === 'ALL' || s.region === regionFilter;
    const matchTier = tierFilter === 'ALL' || s.opportunityTier === tierFilter;
    const matchSearch =
      searchKey === '' ||
      s.siteName.toLowerCase().includes(searchKey.toLowerCase()) ||
      s.siteCode.toLowerCase().includes(searchKey.toLowerCase()) ||
      s.country.toLowerCase().includes(searchKey.toLowerCase());
    return matchRegion && matchTier && matchSearch;
  });

  // 导出作战沙盘清单
  const handleExportWarRoom = () => {
    showToast('已导出《分布式光储充全球作战沙盘与P0/P1清单.csv》(含本币与€/kWh/年归一值)');
  };

  return (
    <div className="space-y-4 p-4 max-w-[1720px] mx-auto animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner: PRD Context & Global Unified Model Declaration */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">
                专题一 · 机会点挖掘
              </span>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                分布式光储充机会点发现与作战沙盘引擎 (M-01 ~ M-08)
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                全球统一模型 (Global Model)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              基于现网 <strong>757 座工商业储能</strong>全量数据底座与全球 <strong>106 开通站点</strong>真实样本，通过 8 项约束条件自动化打标、全球归一化模型（€/kWh/年与相对价差）、收益潜力预估，解决拓展侧“缺少作战沙盘、人工逐站排查难”痛点。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportWarRoom}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出全球作战沙盘 (P0/P1/P2)</span>
            </button>
          </div>
        </div>

        {/* Global Unified Model Baseline Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">中国区工商业总储能</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
              757 <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">现网全量数据底座</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">硬件条件符合站点</div>
            <div className="text-lg font-black font-mono text-blue-700 mt-0.5">
              480 <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">单进线/单变/单数采/华为表</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">软硬件条件全满足</div>
            <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">
              16~17 <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">当前可直接开通高潜池</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">结构化改造缺口</div>
            <div className="text-lg font-black font-mono text-amber-700 mt-0.5">
              463 <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">已结构化拆解缺口项</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">全球开通基线</div>
            <div className="text-lg font-black font-mono text-indigo-700 mt-0.5">
              106 <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">欧洲79 / 中国26 / 亚太1</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">数据质量隔离剔除</div>
            <div className="text-lg font-black font-mono text-rose-700 mt-0.5">
              67 <span className="text-xs font-normal text-slate-500">站</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">断链/跳变/零值隔离</div>
          </div>
        </div>

        {/* Navigation Tabs (M-01 ~ M-08) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          {[
            { id: 'funnel_readiness', label: '1. 漏斗看板与开通性画像 (M-01 & M-02)' },
            { id: 'war_room_ranking', label: '2. 机会分级与作战沙盘 (M-03 全球统一模型)' },
            { id: 'revenue_forecast', label: '3. 开通前收益潜力预估 (M-04 全球统一模型)' },
            { id: 'sizing_and_multi', label: '4. 储能合理性与多变压器扩展 (M-05 & M-06)' },
            { id: 'quality_and_region', label: '5. 数据质量校验与区域流失 (M-07 & M-08)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTabKey)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: 漏斗看板与开通性自动画像 (M-01 & M-02)
         ========================================================================= */}
      {activeTab === 'funnel_readiness' && (
        <div className="space-y-4">
          {/* M-02 Funnel Convergence Visualizer */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>约束条件漏斗看板 (M-02)：中国区 757 ➔ 480 ➔ 16 ➔ 26 逐层收敛全景</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  从人工逐站核对到结构化自动收敛，跟踪 463 站缺口类型与本月修复转化进展
                </p>
              </div>
              <span className="text-xs text-slate-500">统计基线: 2026-08</span>
            </div>

            {/* Visual Convergence Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 relative overflow-hidden">
                <div className="text-xs text-slate-500 font-semibold">1. 全量场站底座</div>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">757 <span className="text-xs font-normal">站</span></div>
                <div className="text-[11px] text-slate-500 mt-1">中国区工商业存量储能</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-slate-600 h-full w-full" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 text-right">基线规模 100%</div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 relative overflow-hidden">
                <div className="text-xs text-blue-900 font-semibold">2. 硬件条件符合</div>
                <div className="text-2xl font-black font-mono text-blue-700 mt-1">480 <span className="text-xs font-normal">站</span></div>
                <div className="text-[11px] text-blue-700 mt-1">满足单进线/单变/单数采/华为表</div>
                <div className="w-full bg-blue-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: '63.4%' }} />
                </div>
                <div className="text-[10px] text-blue-600 mt-1 text-right">占比 63.4% (淘汰277站)</div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 relative overflow-hidden">
                <div className="text-xs text-emerald-900 font-semibold">3. 软硬件条件全满足</div>
                <div className="text-2xl font-black font-mono text-emerald-700 mt-1">16~17 <span className="text-xs font-normal">站</span></div>
                <div className="text-[11px] text-emerald-700 mt-1">版本最新+电价已配+TOU+30天数据</div>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: '2.2%' }} />
                </div>
                <div className="text-[10px] text-emerald-600 mt-1 text-right">纯软件/配置缺口达 463 站</div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-200 relative overflow-hidden">
                <div className="text-xs text-indigo-900 font-semibold">4. 现网已开通运营</div>
                <div className="text-2xl font-black font-mono text-indigo-700 mt-1">26 <span className="text-xs font-normal">站</span></div>
                <div className="text-[11px] text-indigo-700 mt-1">中国区实际开通运营 (全球106站)</div>
                <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: '3.4%' }} />
                </div>
                <div className="text-[10px] text-indigo-600 mt-1 text-right">含部分早期人工协助放行站</div>
              </div>
            </div>

            {/* Gap Categories Breakdown */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 mb-2">
                463 站结构化缺口分类聚合与本月修复转化跟踪 (M-02)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">缺口类型与描述</th>
                      <th className="py-2.5 px-3">受阻站点数</th>
                      <th className="py-2.5 px-3">占全量比重</th>
                      <th className="py-2.5 px-3">本月运营修复数</th>
                      <th className="py-2.5 px-3">修复难度与处置建议</th>
                      <th className="py-2.5 px-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {INITIAL_FUNNEL_SUMMARY.gapsBreakdown.map((gap, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{gap.gapLabel}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{gap.siteCount} 站</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{gap.percentage}%</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 font-semibold">
                          +{gap.fixedCountThisMonth} 站
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {gap.gapType === 'tariff_unconfigured' && '低难度 · 运营团队在工作台一键套用电价模板'}
                          {gap.gapType === 'logger_version' && '中难度 · 远程推送 OTA 固件升级包至 V300R023'}
                          {gap.gapType === 'storage_mode_invalid' && '低难度 · 远程修改储能工作模式为 TOU 分时套利'}
                          {gap.gapType === 'multi_transformer_incomer' && '高难度 · 等待下一代主从协同特性支持 (M-06)'}
                          {gap.gapType === 'third_party_meter' && '中难度 · 现场更换为标准华为 DTSU 互感电表'}
                          {gap.gapType === 'history_data_insufficient' && '排查数采 SIM 卡欠费或掉线，补采至30天'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => showToast(`已提取【${gap.gapLabel}】相关 ${gap.siteCount} 站工单清单`)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            查看站点清单 &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* M-01 8 Constraints Automated Profile Inspector */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>站点可开通性自动画像工作台 (M-01 · 8项约束自动化校验)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  当前校验对象：<strong className="text-slate-800">{selectedSite.siteName}</strong> ({selectedSite.siteCode})
                </p>
              </div>

              {/* Site Quick Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">选择抽检站点:</span>
                <select
                  value={selectedSite.id}
                  onChange={e => {
                    const found = sites.find(s => s.id === e.target.value);
                    if (found) setSelectedSite(found);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.readinessState === 'READY' ? '可开通' : s.readinessState === 'NEED_RETROFIT' ? '需改造' : '不可开通'}] {s.siteName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Site Readiness State Tag */}
            <div className="p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    selectedSite.readinessState === 'READY'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : selectedSite.readinessState === 'NEED_RETROFIT'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {selectedSite.readinessState === 'READY'
                    ? '🟢 可开通 (Ready)'
                    : selectedSite.readinessState === 'NEED_RETROFIT'
                    ? '🟡 需轻度改造 (Need Retrofit)'
                    : '🔴 不可开通 (Not Eligible)'}
                </span>

                <div className="text-xs text-slate-600">
                  {selectedSite.missingGaps.length === 0 ? (
                    <span className="text-emerald-700 font-semibold">8 项软硬件约束全部通过，可直接生成邀请码激活开通！</span>
                  ) : (
                    <span>
                      存在 <strong>{selectedSite.missingGaps.length}</strong> 项缺口：
                      {selectedSite.missingGaps.join('、')}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs font-mono text-slate-500">
                PV: {selectedSite.pvCapacityKw}kW · ESS: {selectedSite.storageCapacityKwh}kWh ({selectedSite.storagePowerKw}kW)
              </div>
            </div>

            {/* 8 Constraints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedSite.constraints.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                    item.passed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800">{item.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        item.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.passed ? '已满足' : '未满足'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    标准要求: <span className="text-slate-700 font-mono">{item.required}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    现网实际: <span className="text-slate-800 font-medium font-mono">{item.actual}</span>
                  </div>

                  {!item.passed && item.blockReason && (
                    <div className="text-[10px] text-rose-700 font-medium pt-1 border-t border-rose-100">
                      阻断原因: {item.blockReason}
                    </div>
                  )}
                  {!item.passed && item.fixGuidance && (
                    <div className="text-[10px] text-blue-700 font-medium">
                      修复指引: {item.fixGuidance}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 机会分级与作战沙盘 (M-03 全球统一模型)
         ========================================================================= */}
      {activeTab === 'war_room_ranking' && (
        <div className="space-y-4">
          {/* Global Unified Model Rules Banner */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>全球统一作战沙盘建模原则 (PRD 2.3 强制规则)</span>
            </div>
            <p className="leading-relaxed">
              <strong>只做一套全球模型</strong>，不按中国/欧洲/亚太分别建模（亚太仅4站单独建模无统计意义）。指标定义、权重与阈值全球一致；区域差异通过<strong>指标归一化</strong>吸收：容量按 kWh 归一、价差折算为相对价差（峰谷价差/平均电价）、收益统一折算为 <strong>€/kWh/年</strong>。同时展示本币金额与统一归一值，保证全球跨国场站完全可比。
            </p>
          </div>

          {/* War Room Filters & Controls */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Region Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">区域维度:</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(['ALL', 'China', 'Europe', 'AsiaPacific'] as const).map(reg => (
                      <button
                        key={reg}
                        onClick={() => setRegionFilter(reg)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                          regionFilter === reg
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {reg === 'ALL' ? '全球全量' : reg === 'China' ? '中国区' : reg === 'Europe' ? '欧洲区' : '亚太区'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">机会分级:</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(['ALL', 'P0', 'P1', 'P2'] as const).map(tier => (
                      <button
                        key={tier}
                        onClick={() => setTierFilter(tier)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                          tierFilter === tier
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tier === 'ALL' ? '全部等级' : `${tier} 级`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索电站名称/编码/国家..."
                  value={searchKey}
                  onChange={e => setSearchKey(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-60"
                />
              </div>
            </div>

            {/* War Room Station Table */}
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">分级</th>
                    <th className="py-2.5 px-3">站点名称 / 编码</th>
                    <th className="py-2.5 px-3">区域/国家</th>
                    <th className="py-2.5 px-3">光储规模 (PV/ESS)</th>
                    <th className="py-2.5 px-3">开通性状态</th>
                    <th className="py-2.5 px-3 font-mono">相对价差</th>
                    <th className="py-2.5 px-3 font-mono">统一归一收益 (€/kWh/年)</th>
                    <th className="py-2.5 px-3 font-mono">本币年增收预估</th>
                    <th className="py-2.5 px-3">预估提升率</th>
                    <th className="py-2.5 px-3 text-right">跟进动作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSites.map(s => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSite(s)}
                      className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                        selectedSite.id === s.id ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-xs font-mono ${
                            s.opportunityTier === 'P0'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : s.opportunityTier === 'P1'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {s.opportunityTier || 'P2'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {s.siteName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.siteCode}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{s.country}</span>
                        <span className="text-slate-400 text-[10px] block font-mono">{s.region}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        <div>PV: {s.pvCapacityKw} kW</div>
                        <div className="text-slate-500 text-[11px]">ESS: {s.storageCapacityKwh} kWh</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            s.readinessState === 'READY'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : s.readinessState === 'NEED_RETROFIT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.readinessState === 'READY' ? '可开通' : s.readinessState === 'NEED_RETROFIT' ? '需改造' : '受限/不可开通'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {s.normalizedRelativeSpread > 0 ? `${s.normalizedRelativeSpread.toFixed(2)}x` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {s.normalizedAnnualGainEurPerKwh > 0 ? `€ ${s.normalizedAnnualGainEurPerKwh} /kWh` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {s.annualGainLocalEstimated > 0
                          ? `${s.currencyCode === 'CNY' ? '¥' : '€'} ${(s.annualGainLocalEstimated / 10000).toFixed(1)} 万/年`
                          : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-600 font-bold">
                        {s.aiGainLiftPercentEstimated > 0
                          ? `+${s.aiGainLiftPercentEstimated}% ~ ${s.aiGainLiftPercentMax}%`
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedSite(s);
                            setActiveTab('revenue_forecast');
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-xs"
                        >
                          测算底稿 &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 开通前收益潜力预估 (M-04 全球统一模型)
         ========================================================================= */}
      {activeTab === 'revenue_forecast' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>开通前收益潜力预估引擎 (M-04 · 默认策略 vs AI 策略回算)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  输入近 N 个月负荷/光伏/储能曲线叠加站内电价，替代“无法承诺确定性收益”的人工判断
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">预估标的:</span>
                <span className="font-bold text-slate-900 text-xs">{selectedSite.siteName}</span>
              </div>
            </div>

            {/* Strategy Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Default Strategy */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700">默认固定定时策略 (Baseline)</div>
                <div className="text-xl font-bold font-mono text-slate-700">
                  {selectedSite.currencyCode === 'CNY' ? '¥' : '€'}{' '}
                  {selectedSite.baselineMonthlyProfitLocal
                    ? (selectedSite.baselineMonthlyProfitLocal / 10000).toFixed(1)
                    : (selectedSite.annualGainLocalEstimated * 0.7 / 12 / 10000).toFixed(1)}{' '}
                  万 / 月
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  仅按固定时钟执行一次充放，无法随光伏波动与园区突发负荷自适应调整，存在弃光损耗与需量被动顶峰。
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
                  控制精度: 静态时钟定时 · 无功率自适应
                </div>
              </div>

              {/* AI Strategy */}
              <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-300 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
                  <span>AI 动态自适应策略 (AI Strategy)</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">推荐</span>
                </div>
                <div className="text-xl font-bold font-mono text-blue-700">
                  {selectedSite.currencyCode === 'CNY' ? '¥' : '€'}{' '}
                  {selectedSite.aiMonthlyProfitLocal && selectedSite.aiMonthlyProfitLocal < 1000000
                    ? (selectedSite.aiMonthlyProfitLocal / 10000).toFixed(1)
                    : (selectedSite.annualGainLocalEstimated / 12 / 10000).toFixed(1)}{' '}
                  万 / 月
                </div>
                <div className="text-[11px] text-blue-800 leading-relaxed">
                  多目标滚动求解：最大化光伏自发自用、深浅结合两充两放、变压器容量动态越限防护，全面释放储能利用率。
                </div>
                <div className="pt-2 border-t border-blue-200 text-[10px] text-blue-600 font-mono font-semibold">
                  预估提升率: +{selectedSite.aiGainLiftPercentEstimated}% ~ {selectedSite.aiGainLiftPercentMax}%
                </div>
              </div>

              {/* Payback & Normalized Value */}
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="text-xs font-bold text-emerald-900">综合量化增量与回本周期</div>
                <div className="text-xl font-bold font-mono text-emerald-700">
                  € {selectedSite.normalizedAnnualGainEurPerKwh} / kWh / 年
                </div>
                <div className="text-[11px] text-emerald-800 leading-relaxed">
                  跨国样本归一化值，预计每年挽回或新增收益约{' '}
                  <strong>
                    {selectedSite.currencyCode === 'CNY' ? '¥' : '€'}{' '}
                    {(selectedSite.annualGainLocalEstimated / 10000).toFixed(1)} 万
                  </strong>
                  ，静态投资回收期缩短至 <strong>{selectedSite.paybackYearsEstimated} 年</strong>。
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[10px] text-emerald-700 font-mono">
                  置信度评级: A 级 (基于30天高频现网数据反向推算)
                </div>
              </div>
            </div>

            {/* Action Guidance */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-700">
                <strong>拓展建议动作：</strong> {selectedSite.suggestedAction}
              </div>
              <button
                onClick={() => showToast(`已为【${selectedSite.siteName}】生成开通前收益测算汇报底稿 PDF`)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs whitespace-nowrap"
              >
                生成客户汇报测算书
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 储能配置合理性与多变压器扩展 (M-05 & M-06)
         ========================================================================= */}
      {activeTab === 'sizing_and_multi' && (
        <div className="space-y-4">
          {/* M-05 Storage Sizing Diagnosis */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-blue-600" />
              <span>储能配置合理性诊断 (M-05 · 识别过大/过小与光储失配)</span>
            </h2>
            <p className="text-xs text-slate-500">
              基于充放电次数、SOC 区间、市电利用率、弃光量、需量峰值，输出增配与降额建议：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs space-y-2">
                <div className="font-bold text-rose-900">典型案例：广东佛山陶瓷智造 (储能配置过小)</div>
                <div className="text-slate-600 leading-relaxed">
                  光伏装机 3.5MW 但储能仅配 500kWh（容量比仅 0.14h）。午间日均弃光 <strong>3,800 kWh</strong>，储能每日满打满放 2.4 次依然无法消纳。
                </div>
                <div className="p-2 bg-white rounded border border-rose-200 font-semibold text-rose-800">
                  👉 诊断建议：增配 1MW / 2MWh 储能，年化挽回弃光收益 ¥96 万。
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                <div className="font-bold text-amber-900">深圳坪山电子制造园 (储能配置偏大/利用率低)</div>
                <div className="text-slate-600 leading-relaxed">
                  储能 1000kWh 但园区周末双休完全无负荷，日均充放循环仅 0.3 次，利用率不足 25%，造成电池闲置与资产折旧浪费。
                </div>
                <div className="p-2 bg-white rounded border border-amber-200 font-semibold text-amber-800">
                  👉 诊断建议：引入需求响应聚合外送，或调整储能参与电网辅助服务。
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                <div className="font-bold text-emerald-900">海泰高新科技产业园 (黄金配比典范)</div>
                <div className="text-slate-600 leading-relaxed">
                  光伏 2.4MW 配 4.0MWh 储能（约 1.66h）。两充两放消纳率 96.8%，全投资 IRR 达 14.8%，形成正向盈利飞轮。
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200 font-semibold text-emerald-800">
                  👉 诊断建议：保持现有配比并作为区域标准配置复制推广。
                </div>
              </div>
            </div>
          </div>

          {/* M-06 Multi-Transformer / Multi-Incomer Expansion Pool */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>多变压器 / 多进线复杂场景可开通性识别 (M-06 · 扩展能力池)</span>
            </h2>
            <p className="text-xs text-slate-500">
              从现网 757 站组网数据中识别主从组网、多变、双数采站点，统计被当前能力限制的规模，作为研发下一代演进的输入：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">多进线 / 多变压器站点数</div>
                <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">162 站</div>
                <div className="text-[10px] text-slate-400 mt-0.5">占全量受阻站点的 35.0%</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">被受限储能装机总规模</div>
                <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">386 MWh</div>
                <div className="text-[10px] text-slate-400 mt-0.5">单站平均容量高达 2.38 MWh</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500">双数采主从协同站点数</div>
                <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">48 站</div>
                <div className="text-[10px] text-slate-400 mt-0.5">大园区分布式集群</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: 数据质量校验与区域流失分析 (M-07 & M-08)
         ========================================================================= */}
      {activeTab === 'quality_and_region' && (
        <div className="space-y-4">
          {/* M-07 Data Quality Barrier */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>挖掘数据质量校验门槛 (M-07 · 67个脏数据站点隔离库)</span>
            </h2>
            <p className="text-xs text-slate-500">
              对参与挖掘的现网数据执行完整性、断链、跳变、长期零值四维校验，阻断脏数据进入沙盘与预估模型：
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">受限站点编码 / 名称</th>
                    <th className="py-2.5 px-3">数据质量得分</th>
                    <th className="py-2.5 px-3">主要数据缺陷</th>
                    <th className="py-2.5 px-3">处置状态</th>
                    <th className="py-2.5 px-3 text-right">运维动作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">HB-WH-DIRTY01 · 湖北武汉某物流配送中心</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600">28.5 分</td>
                    <td className="py-2.5 px-3 text-rose-700">持续30天数据断链、负荷读数长期为0</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                        已拦截隔离
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-600 font-semibold cursor-pointer">
                      排查数采通信线与4G欠费
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">GD-DG-BAD04 · 东莞某五金冲压园区</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-600">54.0 分</td>
                    <td className="py-2.5 px-3 text-amber-700">电表数据突发十倍跳变、功率反向误报</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                        数据清洗中
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-600 font-semibold cursor-pointer">
                      校准CT互感器变比
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* M-08 Regional Funnel Trends */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>区域开通态势与评估流失分析 (M-08)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-800">欧洲区 (79站已开通)</div>
                <div className="text-slate-500 mt-1">动态电价套利空间大，评估到开通中位仅 12 天，流失率为 0%。</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-800">中国区 (26站已开通 / 5站退订关闭)</div>
                <div className="text-slate-500 mt-1">开通周期平均 24 天，5 站因电表采样延迟与价差不足退订。</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-800">亚太区 (1站已开通 / 3站评估中)</div>
                <div className="text-slate-500 mt-1">小样本区域，直接套用全球统一模型进行归一化测算，避免局部偏差。</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
