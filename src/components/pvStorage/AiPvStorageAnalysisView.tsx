import React, { useState } from 'react';
import {
  PvStorageSiteProfile,
  OnboardingJourneyTicket,
  BenchmarkCaseCard,
  AnomalyTag
} from '../../types/pvStoragePRD';
import {
  MOCK_PV_STORAGE_SITES,
  MOCK_ONBOARDING_TICKETS,
  ONBOARDING_DURATION_ANALYSIS,
  BENCHMARK_CASE_CARDS,
  GLOBAL_ONBOARDING_STATS
} from '../../mock/pvStoragePRDData';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BarChart3,
  Layers,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Zap,
  BatteryCharging,
  Sun,
  Cpu,
  Info,
  Building2,
  Download,
  Search,
  Filter,
  ArrowRight,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  FileText,
  FileCheck2,
  Check,
  Send,
  Eye,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

type OpTabKey =
  | 'onboarding_pipeline' // O-01, O-02, O-04
  | 'tariff_dispatch_desk' // O-03
  | 'revenue_breakdown' // O-05, O-06
  | 'anomaly_diagnosis' // O-07, O-09
  | 'strategy_quality'; // O-10, O-11

export const AiPvStorageAnalysisView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OpTabKey>('onboarding_pipeline');
  const [tickets, setTickets] = useState<OnboardingJourneyTicket[]>(MOCK_ONBOARDING_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<OnboardingJourneyTicket | null>(MOCK_ONBOARDING_TICKETS[0]);
  const [sites, setSites] = useState<PvStorageSiteProfile[]>(MOCK_PV_STORAGE_SITES);
  const [selectedSiteForAudit, setSelectedSiteForAudit] = useState<PvStorageSiteProfile | null>(null);
  const [selectedAnomalySite, setSelectedAnomalySite] = useState<PvStorageSiteProfile>(
    MOCK_PV_STORAGE_SITES.find(s => s.anomalyTags.includes('ABNORMAL_HIGH_DEMAND')) || MOCK_PV_STORAGE_SITES[0]
  );
  const [filterTicketStage, setFilterTicketStage] = useState<'ALL' | 'OVERDUE' | 'OP_TEAM' | 'CUSTOMER_REP'>('ALL');
  const [revenueFilter, setRevenueFilter] = useState<'ALL' | 'ANOMALIES_ONLY' | 'TRUSTED_ONLY'>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 运营待办列表 (O-07)
  const [opTodos, setOpTodos] = useState([
    {
      id: 'todo-01',
      siteName: '凌志环保新能源工商业光储站',
      issue: '需量收益畸高异常 (5-6月报表高达498万/730万)，阻断入表',
      suggestedFix: '变压器合同需量参数原填报误扩大了100倍，需重置为1200kW并触发历史差额重算',
      status: 'PENDING',
      priority: 'HIGH',
      assignedRole: '运营专家 + 研发SRE'
    },
    {
      id: 'todo-02',
      siteName: '广州黄埔高新制造产业园',
      issue: '需量收益持续为负 (-1091元/月)，储能放电时段与负荷尖峰微弱错位',
      suggestedFix: '将需量平抑触发时延从15分钟调整为3分钟，重新拟合负荷预测曲线',
      status: 'PENDING',
      priority: 'MEDIUM',
      assignedRole: '算法工程师'
    },
    {
      id: 'todo-03',
      siteName: '深圳坪山先进电子智造园',
      issue: '5个退订站点复盘：电表采样频率滞后，多次轻度越限导致客户申请关闭',
      suggestedFix: '升级现场数采固件并校准DTSU电表RS485波特率至9600bps',
      status: 'PROCESSING',
      priority: 'HIGH',
      assignedRole: '现场服务工程师'
    }
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleResolveTodo = (todoId: string) => {
    setOpTodos(prev =>
      prev.map(t => (t.id === todoId ? { ...t, status: 'RESOLVED' } : t))
    );
    showToast('已完成待办处置并向现场下发了修正参数！');
  };

  // 9步阶段名称定义
  const STAGE_STEPS = [
    { key: 'STAGE_1_APPLY', label: '1.意向申请' },
    { key: 'STAGE_2_HEALTH_CHECK', label: '2.自动体检' },
    { key: 'STAGE_3_TARIFF_CONFIRM', label: '3.电价复核' },
    { key: 'STAGE_4_CUSTOMER_AUTH', label: '4.客户授权' },
    { key: 'STAGE_5_OP_AUDIT', label: '5.运营审核' },
    { key: 'STAGE_6_INVITE_CODE', label: '6.邀请码生成' },
    { key: 'STAGE_7_DISPATCH_CONFIG', label: '7.策略配置' },
    { key: 'STAGE_8_AI_ACTIVE', label: '8.闭环验证' },
    { key: 'STAGE_9_ARCHIVED', label: '9.正式托管' }
  ];

  return (
    <div className="space-y-4 pb-12 p-3 text-slate-800">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 顶部专业服务运营大盘 (O-08 运营大盘与全局态势) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                PRD 专题二 · 专业服务运营专属
              </span>
              <span className="text-xs text-slate-500 font-medium">
                华为专业服务运营团队（运营 + 研发 + SRE 支撑作业中心 · 非业主端）
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                全球已开通 106 站 · 评估中 33 站
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>AI 光储开通运营与收益闭环控制台</span>
            </h1>

            <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
              聚焦开通时效（将邮件 9 步线上化，攻坚 2~84 天中位 7 天卡点）、全口径分项收益可信核算（峰谷套利 94% / 光伏增量 / 需量增量）、5 类收益异常阻断与诊断处置（凌志 498 万/730 万异常阻断、需量持续为负 -1091 元归因），以及现网 5 站退订复盘。
            </p>
          </div>

          {/* 团队作业快捷状态 */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="text-right pr-2 border-r border-slate-200">
              <div className="text-[10px] text-slate-500">当前在席角色</div>
              <div className="text-xs font-bold text-slate-800">运营专家 + SRE协同</div>
            </div>
            <button
              type="button"
              onClick={() => showToast('已触发全局局点收益核验与数据质量巡检任务！')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>全局巡检与重算</span>
            </button>
          </div>
        </div>

        {/* 4 大核心基线 KPI 卡片 (真实来自现网基线) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-slate-100">
          {/* KPI 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">全球开通态势</span>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-mono">
                欧79/中26/亚1
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">106</span>
              <span className="text-xs text-slate-500">站已开通</span>
              <span className="text-xs text-amber-600 font-medium ml-1">（33 站评估中）</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              中国区已开通 31 站（19 正常 / 12 异常与关闭）
            </div>
          </div>

          {/* KPI 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">开通时效与卡点</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                实测 2~84 天
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-600 font-mono">P50: 7</span>
              <span className="text-xs text-slate-500">天 / P90: 35 天</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              卡点集中于：条件确认(41%)、电价代配(34%)、邀请码(18%)
            </div>
          </div>

          {/* KPI 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">收益结构与集中度</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                套利占 94%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">51.4%</span>
              <span className="text-xs text-slate-500">海泰单站占比</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              需量增量均值呈负 (-1,091 元)，分项核验急需解释
            </div>
          </div>

          {/* KPI 4 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">可信度异常与关闭</span>
              <span className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-mono">
                12 站异常预警
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-rose-600 font-mono">5</span>
              <span className="text-xs text-slate-500">站关闭 / 5 负需量 / 1 畸高</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              凌志异常高收益 (498万/730万) 已成功阻断入表
            </div>
          </div>
        </div>
      </div>

      {/* 5 大运营专属工作台标签栏 */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        {[
          {
            id: 'onboarding_pipeline',
            label: '🚀 开通工单流水线与卡点分析',
            badge: `${tickets.length} 张工单 · 1 超时`,
            badgeColor: 'bg-amber-100 text-amber-800',
            desc: 'O-01 9步线上化 · O-02 自动体检 · O-04 时效监控'
          },
          {
            id: 'tariff_dispatch_desk',
            label: '⚡ 电价与容需量代配工作台',
            badge: '运营代配',
            badgeColor: 'bg-blue-100 text-blue-700',
            desc: 'O-03 批量巡检 · 模板库匹配 · 下发防呆校验'
          },
          {
            id: 'revenue_breakdown',
            label: '📊 全口径收益核算与可信度校验',
            badge: '4大分项 · 5类异常',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            desc: 'O-05 峰谷套利94%/负需量 · O-06 凌志异常阻断'
          },
          {
            id: 'anomaly_diagnosis',
            label: '🛠️ 异常自动诊断与退订复盘',
            badge: `${opTodos.filter(t => t.status !== 'RESOLVED').length} 待办 · 5 关闭站`,
            badgeColor: 'bg-rose-100 text-rose-800',
            desc: 'O-07 根因推断与待办 · O-09 现网5站关闭归因'
          },
          {
            id: 'strategy_quality',
            label: '🏆 策略质量评价与标杆案例库',
            badge: '海泰51.4% / 欧洲标杆',
            badgeColor: 'bg-purple-100 text-purple-800',
            desc: 'O-10 现场执行质量 · O-11 标杆卡片一键导出'
          }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[210px] flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div>
                <div className="text-xs">{tab.label}</div>
                <div className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {tab.desc}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  isActive ? 'bg-white/20 text-white' : tab.badgeColor
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* Tab 1: 线上化开通工单旅程 & 时效卡点监控 (O-01, O-02, O-04) */}
      {/* ============================================================== */}
      {activeTab === 'onboarding_pipeline' && (
        <div className="space-y-4">
          {/* Top: O-04 开通时效与三大卡点排行榜 Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>O-04 开通时效监控与三大卡点全周期分析</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  现网 9 步流程依赖邮件/Welink 导致耗时高达 2~84 天（中位 7 天，P90 达 35 天）。线上化后全程超时红标告警，责任到角色。
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                  最短: {ONBOARDING_DURATION_ANALYSIS.minDays} 天
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  中位 P50: {ONBOARDING_DURATION_ANALYSIS.p50Days} 天
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  最长 P90: {ONBOARDING_DURATION_ANALYSIS.p90Days} 天
                </span>
              </div>
            </div>

            {/* 4 大卡点环节耗时占比柱状分布 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              {ONBOARDING_DURATION_ANALYSIS.stageDurationBreakdown.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800">{item.stage}</span>
                    <span className="font-mono font-bold text-amber-700">{item.bottleneckSharePct}% 卡点</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.bottleneckSharePct * 2}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                    <span>平均耗时: {item.avgDays} 天</span>
                    <span>责任: {item.responsibleRole}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle: 工单流水线主界面 (左侧工单列表 + 右侧 9 步全景时间轴与操作区) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧工单清单 */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>在途开通工单 ({tickets.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">点击进入详情查看 9 步进度与体检报告</span>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setFilterTicketStage('ALL')}
                    className={`px-2 py-0.5 rounded ${
                      filterTicketStage === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setFilterTicketStage('OVERDUE')}
                    className={`px-2 py-0.5 rounded ${
                      filterTicketStage === 'OVERDUE' ? 'bg-rose-600 text-white font-bold' : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    超时卡点
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {tickets
                  .filter(t => (filterTicketStage === 'OVERDUE' ? t.isOverdue : true))
                  .map(ticket => {
                    const isSelected = selectedTicket?.ticketId === ticket.ticketId;
                    return (
                      <div
                        key={ticket.ticketId}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                                {ticket.ticketId}
                              </span>
                              <span className="text-xs font-bold text-slate-900 line-clamp-1">
                                {ticket.siteName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-1">
                              {ticket.country} · {ticket.capacityStr}
                            </div>
                          </div>

                          {ticket.isOverdue ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shrink-0 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              超时 {ticket.stayDays - ticket.benchmarkDaysLimit} 天
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-mono">
                              停留 {ticket.stayDays} 天
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-blue-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            {ticket.currentStageLabel}
                          </span>
                          <span className="text-slate-500">待办: {ticket.roleLabel}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 右侧：所选工单的 9 步线上化执行流与 O-02 自动体检卡 */}
            {selectedTicket && (
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{selectedTicket.siteName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                        工单: {selectedTicket.ticketId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      立项建单: {selectedTicket.createdAt} · 当前停滞环节: {selectedTicket.currentStageLabel} (停留 {selectedTicket.stayDays} 天)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const site = sites.find(s => s.id === selectedTicket.siteId) || sites[0];
                        setSelectedSiteForAudit(site);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>查看 O-02 自动体检</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast(`已向责任人【${selectedTicket.roleLabel}】催办督促通知！`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>催办节点</span>
                    </button>
                  </div>
                </div>

                {/* 9 步进度条示意 (O-01 全程留痕、节点可见) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>9 步标准化开通流程流水线 (取代传统 9 步邮件链)</span>
                    <span className="text-[11px] font-mono text-slate-500">当前处于步骤 3/9</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-2">
                    {STAGE_STEPS.map((step, idx) => {
                      // 简单判定当前进度
                      const isCompleted = idx < 2;
                      const isCurrent = idx === 2;
                      return (
                        <div
                          key={step.key}
                          className={`p-1.5 rounded text-center border text-[10px] font-medium transition-all ${
                            isCompleted
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                              : isCurrent
                              ? 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-300 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          <div className="line-clamp-1">{step.label}</div>
                          <div className="text-[9px] mt-0.5 opacity-80">
                            {isCompleted ? '✓已通过' : isCurrent ? '处理中' : '待流转'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 历史流转节点详情与留痕 */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">各节点流转日志与审核留痕 (全程可追溯)</div>
                  <div className="space-y-2">
                    {selectedTicket.stageHistory.map((h, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
                        <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{h.stageLabel}</span>
                            <span className="text-[11px] font-mono text-slate-500">{h.completedAt || '正在审核'}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            操作人: <span className="font-medium text-slate-800">{h.operator}</span>
                            {h.notes && <span className="ml-2 text-slate-500">备注: {h.notes}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 当前卡点处理方案建议 */}
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>运营卡点诊断处置建议</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    当前停留于<strong>「3. 运营电价与需量复核」</strong>阶段。建议运营工程师直接调取「电价与容需量代配工作台」匹配华东标准分时模板，一键核验下发，预计可节约 4.5 个工作日，避免延误客户签约。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Tab 2: 电价与容需量代配工作台 (O-03 面向华为专业服务运营人员) */}
      {/* ============================================================== */}
      {activeTab === 'tariff_dispatch_desk' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>O-03 华为专业服务运营代配与巡检工作台</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  由华为专业服务团队集中为客户/安装商代配电价与容需量。支持模板库批量匹配、配置项缺失防呆校验、下发前参数冲突识别与全生命周期审计留痕。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('已批量下发最新电价模板至 8 个配置缺失局点！')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>批量下发匹配模板</span>
                </button>
              </div>
            </div>

            {/* 标准电价模板库快捷抽屉 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">模板 A: 江苏大工业两部制分时模板</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-200 text-blue-900 font-bold">推荐率 92%</span>
                </div>
                <div className="text-[11px] text-blue-800">
                  尖峰: 1.35元 (19:00~21:00) · 峰段: 1.12元 · 谷段: 0.32元 (00:00~08:00) · 价差: 1.03元/kWh
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                  <span>适用: 江苏/浙江工商业高压大客户</span>
                  <button
                    onClick={() => showToast('已将【江苏大工业两部制分时模板】应用至当前选中站点！')}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    一键套用
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">模板 B: 欧洲 EPEX 动态日前电价模板</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-bold">海外标配</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  峰段均价: 0.38 €/kWh · 谷段均价: 0.09 €/kWh · 相对价差: 1.35 (极高套利收益)
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                  <span>适用: 德国/法国/西班牙物流冷链与园区</span>
                  <button
                    onClick={() => showToast('已将【欧洲 EPEX 动态模板】应用至当前欧洲局点！')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    一键套用
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">模板 C: 广东工商业两充两放策略模板</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">高周转</span>
                </div>
                <div className="text-[11px] text-amber-800">
                  午间谷段补充充电 (12:00~14:00) · 晚高峰二次放电 · 循环次数: 2.0 次/日
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                  <span>适用: 华南高耗能制造业园区 (佛山/东莞)</span>
                  <button
                    onClick={() => showToast('已将【广东两充两放模板】套用！')}
                    className="text-amber-700 font-bold hover:underline"
                  >
                    一键套用
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 站点代配与巡检大表 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">全量站点电价与容需量参数巡检明细</span>
              <span className="text-slate-500 text-[11px]">发现 2 个高危参数冲突站点，已限制下发</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">站点名称</th>
                    <th className="p-3">国家/区域</th>
                    <th className="p-3">电价模式</th>
                    <th className="p-3 font-mono">峰/谷/价差</th>
                    <th className="p-3 font-mono">需量配置 (kW)</th>
                    <th className="p-3">储能工作模式</th>
                    <th className="p-3">代配巡检状态</th>
                    <th className="p-3 text-right">运营代配操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sites.map(site => {
                    const isConfigFault = site.anomalyTags.includes('TARIFF_MISCONFIG') || !site.isTariffConfigured;
                    return (
                      <tr key={site.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-medium text-slate-900">
                          <div>{site.siteName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{site.siteCode}</div>
                        </td>
                        <td className="p-3 text-slate-600">{site.country}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 font-bold">
                            {site.tariffMode}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {site.isTariffConfigured ? (
                            <span className="text-slate-700">
                              {site.peakPriceLocal} / {site.valleyPriceLocal} (
                              <span className="text-emerald-600 font-bold">+{site.peakValleySpreadLocal}</span>)
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold">未配置电价</span>
                          )}
                        </td>
                        <td className="p-3 font-mono">
                          {site.contractDemandKw ? `${site.contractDemandKw} kW` : '容需量未报'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {site.storageWorkMode}
                        </td>
                        <td className="p-3">
                          {isConfigFault ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              需运营代配修正
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" />
                              参数已核验受控
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => showToast(`已打开【${site.siteName}】代配编辑窗口，支持在线更新并留痕！`)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            代配修改
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

      {/* ============================================================== */}
      {/* Tab 3: 全口径收益核算与可信度校验 (O-05, O-06 彻底解决"收益不可信") */}
      {/* ============================================================== */}
      {activeTab === 'revenue_breakdown' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>O-05 全口径收益核算与四大分项可信拆解</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  将传统单一模糊储能收益彻底拆解为<strong>峰谷套利（占94%）</strong>、<strong>光伏增量</strong>、<strong>需量增量（解释负需量）</strong>与<strong>上网电费</strong>四大分项，统一基线定义，让"收益不可信"变为"分项可核验"。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRevenueFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    revenueFilter === 'ALL' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  全部电站
                </button>
                <button
                  onClick={() => setRevenueFilter('ANOMALIES_ONLY')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    revenueFilter === 'ANOMALIES_ONLY' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  阻断不可信池 (12站)
                </button>
                <button
                  onClick={() => setRevenueFilter('TRUSTED_ONLY')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    revenueFilter === 'TRUSTED_ONLY' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  已核验可信池 (19站)
                </button>
              </div>
            </div>

            {/* O-06 5类异常监测预警 Banner (含凌志异常案例) */}
            <div className="mt-3 p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>O-06 收益可信度异常阻断与五类模式监测</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">
                  已阻断 1 站畸高数据进入大屏报表
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                典型拦截案例：<strong>凌志环保电站 5-6 月需量收益异常高达 498 万/730 万</strong>（因合同需量参数基线录入错误被系统实时截获阻断）；另监控到 <strong>5 个电站需量收益持续为负</strong>（中国区正常站均值负需量 -1091 元，因平抑时机延误）、1 站收益突变、5 站长期零收益。
              </p>
            </div>
          </div>

          {/* 全口径收益分项大表 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">已开通站点全口径月度分项收益审计表</span>
              <span className="text-[11px] text-slate-500 font-mono">
                本币单位: CNY / EUR · 统一折算基线
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">电站名称</th>
                    <th className="p-3">电站类型</th>
                    <th className="p-3 font-mono">默认策略基线</th>
                    <th className="p-3 font-mono">AI 策略实得</th>
                    <th className="p-3 font-mono text-emerald-700">峰谷套利分项</th>
                    <th className="p-3 font-mono text-amber-700">光伏增量分项</th>
                    <th className="p-3 font-mono text-blue-700">需量削峰增量</th>
                    <th className="p-3">可信度标签与阻断</th>
                    <th className="p-3 text-right">可信度核验</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sites
                    .filter(s => {
                      if (revenueFilter === 'ANOMALIES_ONLY') return s.anomalyTags.length > 0;
                      if (revenueFilter === 'TRUSTED_ONLY') return s.anomalyTags.length === 0;
                      return true;
                    })
                    .map(site => {
                      const hasExtreme = site.anomalyTags.includes('ABNORMAL_HIGH_DEMAND');
                      const isNegativeDemand = site.profitBreakdown && site.profitBreakdown.demandSavingLocal < 0;

                      return (
                        <tr
                          key={site.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            hasExtreme ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          <td className="p-3 font-medium text-slate-900">
                            <div>{site.siteName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{site.siteCode}</div>
                          </td>
                          <td className="p-3 text-slate-600">{site.stationType}</td>
                          <td className="p-3 font-mono text-slate-500">
                            {site.baselineMonthlyProfitLocal ? `¥ ${site.baselineMonthlyProfitLocal.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {hasExtreme ? (
                              <span className="text-rose-600 line-through">
                                ¥ {site.aiMonthlyProfitLocal?.toLocaleString()} (已阻断)
                              </span>
                            ) : site.aiMonthlyProfitLocal ? (
                              `¥ ${site.aiMonthlyProfitLocal.toLocaleString()}`
                            ) : (
                              '-'
                            )}
                          </td>
                          {/* 峰谷套利 */}
                          <td className="p-3 font-mono text-emerald-700 font-semibold">
                            {site.profitBreakdown?.touArbitrageLocal
                              ? `+¥ ${site.profitBreakdown.touArbitrageLocal.toLocaleString()}`
                              : '-'}
                          </td>
                          {/* 光伏增量 */}
                          <td className="p-3 font-mono text-amber-700">
                            {site.profitBreakdown?.pvSelfConsumptionLocal
                              ? `+¥ ${site.profitBreakdown.pvSelfConsumptionLocal.toLocaleString()}`
                              : '¥ 0'}
                          </td>
                          {/* 需量削峰 (关键点：展示负需量如 -1091 元) */}
                          <td className="p-3 font-mono font-semibold">
                            {site.profitBreakdown ? (
                              isNegativeDemand ? (
                                <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  {site.profitBreakdown.demandSavingLocal} 元 (负需量)
                                </span>
                              ) : (
                                <span className="text-blue-700">
                                  +{site.profitBreakdown.demandSavingLocal.toLocaleString()} 元
                                </span>
                              )
                            ) : (
                              '-'
                            )}
                          </td>
                          {/* 状态与阻断 */}
                          <td className="p-3">
                            {hasExtreme ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 w-fit">
                                <ShieldAlert className="w-3 h-3" />
                                阻断: 凌志异常高收益
                              </span>
                            ) : site.anomalyTags.includes('NEGATIVE_DEMAND') ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" />
                                需量收益持续为负
                              </span>
                            ) : site.anomalyTags.includes('ZERO_GAIN') ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                                长期零收益
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" />
                                数据可信入表
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedAnomalySite(site);
                                setActiveTab('anomaly_diagnosis');
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                            >
                              诊断归因
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

      {/* ============================================================== */}
      {/* Tab 4: 异常自动诊断处置与退订复盘 (O-07, O-09) */}
      {/* ============================================================== */}
      {activeTab === 'anomaly_diagnosis' && (
        <div className="space-y-4">
          {/* Top: O-09 退订/关闭站点（现网 5 站）结构化复盘看板 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>O-09 现网 5 个已关闭/退订站点深度归因复盘</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  已关闭 5 个站点的关闭原因均可从现网数据精确定位，结构化归因统计直接驱动研发策略优化与运营准入规则更新。
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                现网闭环率 100%
              </span>
            </div>

            {/* 5 大原因结构化卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-3">
              {[
                { title: '电表采样未及时更新', count: 1, share: '20%', desc: '通讯滞后导致逆流与越限', action: '约束C4强化: 必须华为DTSU且RS485通信周期<10s' },
                { title: '低价差不套利', count: 1, share: '20%', desc: '峰谷价差低于充放损耗平衡点', action: '准入优化: 自动校验相对价差>0.6元/kWh' },
                { title: '功率未按电网最大充限', count: 1, share: '20%', desc: '未下发最大充电上限引发跳闸', action: 'SRE管控: 增加EMS电网充电硬限制防呆约束' },
                { title: '小功率多次充放电', count: 1, share: '20%', desc: '负荷频繁微小波动引起浅充浅放', action: '算法升级: 引入死区滤波与充放功率门限' },
                { title: '工作模式与电价未配', count: 1, share: '20%', desc: '开通后模式仍滞留在固定功率', action: '流程改进: 运营代配工作台强制锁定TOU模式' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</span>
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-1 rounded">{item.count}站</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-200 text-[10px] text-blue-800 font-medium">
                    准入防线: {item.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: O-07 异常自动诊断与处置建议待办工作台 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧：待办事项清单 */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>O-07 异常自动诊断与待办工单 ({opTodos.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">根据设备状态与读数关联，自动推断根因并派单</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {opTodos.map(todo => {
                  const isResolved = todo.status === 'RESOLVED';
                  return (
                    <div
                      key={todo.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isResolved
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : todo.priority === 'HIGH'
                          ? 'bg-rose-50/40 border-rose-300'
                          : 'bg-amber-50/30 border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{todo.siteName}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isResolved
                              ? 'bg-slate-200 text-slate-700'
                              : todo.priority === 'HIGH'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {isResolved ? '已处置' : todo.priority === 'HIGH' ? '高危待办' : '中危待办'}
                        </span>
                      </div>

                      <div className="text-[11px] text-rose-700 font-medium mt-1">{todo.issue}</div>
                      <div className="text-[10px] text-slate-600 mt-1">处置方案: {todo.suggestedFix}</div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">派发: {todo.assignedRole}</span>
                        {!isResolved && (
                          <button
                            onClick={() => handleResolveTodo(todo.id)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs"
                          >
                            执行修复并消除待办
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 右侧：凌志异常与负需量站点深度关联分析卡片 */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    深度根因推断分析器: {selectedAnomalySite.siteName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                    {selectedAnomalySite.siteCode}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  装机容量: {selectedAnomalySite.storageCapacityKwh} kWh
                </span>
              </div>

              {/* 异常关联设备信息 */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-50 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">数采型号与固件</div>
                  <div className="font-bold text-slate-800 font-mono">{selectedAnomalySite.loggerModel}</div>
                  <div className="text-[10px] text-slate-600">{selectedAnomalySite.loggerVersion}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">电表通信与读数</div>
                  <div className="font-bold text-slate-800 font-mono">{selectedAnomalySite.meterModel}</div>
                  <div className="text-[10px] text-emerald-700">通讯轮询正常</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">需量与合同参数</div>
                  <div className="font-bold text-slate-800 font-mono">{selectedAnomalySite.contractDemandKw} kW</div>
                  <div className="text-[10px] text-rose-600 font-bold">基线倍率校验不合规</div>
                </div>
              </div>

              {/* 根因推断详析 */}
              <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>自动关联推断结论 (AI 算法分析结果)</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  系统对历史 15 分钟级功率曲线与变压器负荷进行交叉对齐，发现 5-6 月期间计算引擎调用的合同最大需量申报值被错误放大了 100 倍（导致变压器容量削峰增量算法分母严重缩水，产出了 498 万/730 万的虚假高额收益）。
                </p>
                <div className="text-[11px] text-slate-700 pt-1 border-t border-blue-200">
                  <strong>建议处置方案:</strong> 由专业服务运营人员在线修正合同需量参数，一键触发历史数据离线重新跑批，并将修正后的真实报表推送至一线。
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => showToast('已自动触发历史功率与需量分项离线重跑跑批任务！')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>重置参数并重新核算</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Tab 5: AI 策略运行质量评价 & 标杆案例库 (O-10, O-11) */}
      {/* ============================================================== */}
      {activeTab === 'strategy_quality' && (
        <div className="space-y-4">
          {/* Top: O-10 AI 策略现场运行质量评价看板 */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span>O-10 AI 策略现场运行质量与执行保真度评价</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  跟踪已开通站点充放电深度 (DOD)、SOC 跟踪误差、充放电循环次数、并网点功率越限次数，严密识别<strong>「策略下发但现场未执行或执行变形」</strong>的局点。
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                全局执行保真度 94.2%
              </span>
            </div>

            {/* 4 维现场质量指标 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">SOC 跟踪平均误差</div>
                <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">± 2.4%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">优于行业标准 ± 5.0%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">并网点防逆流越限</div>
                <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">0 次越限</div>
                <div className="text-[10px] text-slate-500 mt-0.5">毫秒级闭环动态功率均衡</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">平均充放电深度 (DOD)</div>
                <div className="text-lg font-bold font-mono text-purple-700 mt-0.5">88.5%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">兼顾寿命与最大收益套利</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500">执行变形/失效告警站</div>
                <div className="text-lg font-bold font-mono text-amber-600 mt-0.5">1 站</div>
                <div className="text-[10px] text-slate-500 mt-0.5">现场手动打回本地模式</div>
              </div>
            </div>
          </div>

          {/* Bottom: O-11 标杆案例卡片提炼与一键导出 (海泰园区等) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>O-11 标杆案例卡片提炼与经验复用资产库</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  自动识别收益提升显著、运行稳定的标杆站点（如海泰园区占中国区收益 51.4%、欧洲德国斯图加特 54.2€/kWh/年），提炼关键特征，一键生成标准化运营案例卡片供拓展使用。
                </p>
              </div>

              <button
                type="button"
                onClick={() => showToast('已成功打包导出 3 份标杆运营案例高清 PDF 卡片！')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>批量导出标杆卡片 (PDF/PPT)</span>
              </button>
            </div>

            {/* 3 张标杆卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {BENCHMARK_CASE_CARDS.map(caseCard => (
                <div
                  key={caseCard.id}
                  className="rounded-xl border border-slate-200 hover:border-blue-400 bg-white p-4 shadow-xs space-y-3 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {caseCard.industry}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{caseCard.ownerOffice}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{caseCard.siteName}</h4>

                    <div className="text-[11px] text-slate-600 font-mono">
                      规模: 光伏 {caseCard.pvScale} · 储能 {caseCard.storageScale}
                    </div>

                    {/* 收益 KPI */}
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] text-slate-500">年化增收</span>
                        <span className="text-base font-bold font-mono text-emerald-700">
                          {caseCard.annualGainLocal}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1 font-mono">
                        <span>收益提升率: +{caseCard.liftRatePercent}%</span>
                        <span>回本周期: {caseCard.paybackPeriodYears} 年</span>
                      </div>
                    </div>

                    {/* 标杆特征列表 */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-slate-700">关键成功特征与策略:</div>
                      {caseCard.highlightFeatures.map((f, fi) => (
                        <div key={fi} className="text-[10px] text-slate-600 flex items-start gap-1">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">归一: {caseCard.annualGainEur}</span>
                    <button
                      onClick={() => showToast(`已生成【${caseCard.siteName}】专属经验宣讲胶片！`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>生成胶片</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* O-02 开通前自动体检抽屉 / 模态框 */}
      {/* ============================================================== */}
      {selectedSiteForAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>O-02 站点开通前 8 项约束全自动体检报告</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  检测对象: {selectedSiteForAudit.siteName} ({selectedSiteForAudit.siteCode})
                </p>
              </div>

              <button
                onClick={() => setSelectedSiteForAudit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* 体检结论汇总 */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                selectedSiteForAudit.readinessState === 'READY'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : selectedSiteForAudit.readinessState === 'NEEDS_RETROFIT'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div>
                <div className="font-bold text-sm">
                  体检结论: {selectedSiteForAudit.readinessState === 'READY'
                    ? '全项合格（具备直接开通条件）'
                    : selectedSiteForAudit.readinessState === 'NEEDS_RETROFIT'
                    ? '轻度缺口（需运营代配或微调）'
                    : '存在硬性阻断约束（需硬件或架构改造）'}
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">
                  8项现网技术约束通过率: {selectedSiteForAudit.constraints.filter(c => c.passed).length} / 8 项
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/80 border">
                状态: {selectedSiteForAudit.readinessState}
              </span>
            </div>

            {/* 8 项约束逐项拆解 */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">8 项约束逐项校验结果与修复指引:</div>
              <div className="grid grid-cols-1 gap-2">
                {selectedSiteForAudit.constraints.map(item => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-start justify-between ${
                      item.passed ? 'bg-slate-50/70 border-slate-200' : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{item.category}]</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        要求: <span className="font-mono text-slate-700">{item.required}</span> · 现场实际: <span className="font-mono font-semibold text-slate-900">{item.actual}</span>
                      </div>
                      {!item.passed && item.blockReason && (
                        <div className="text-[11px] text-rose-700 font-medium">
                          阻断原因及修复指引: {item.blockReason}
                        </div>
                      )}
                    </div>

                    {item.passed ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        通过
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 shrink-0">
                        不通过
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                替代原研发人工逐站核对 · 体检引擎毫秒级输出结果
              </span>
              <button
                onClick={() => setSelectedSiteForAudit(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                确认并返回工作台
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
