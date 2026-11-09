import React, { useState } from 'react';
import {
  OpportunityCard,
  OpportunityDomain,
  OpportunityTriggerType,
  OpportunityCardStatus,
  ClosedReasonCategory
} from '../../types/opportunityMining';
import {
  Search,
  Filter,
  Layers,
  Sun,
  BatteryCharging,
  Server,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Share2,
  FileText,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  RefreshCw,
  Building,
  Target,
  X,
  Check
} from 'lucide-react';
import { ChampionOnepagerModal } from './ChampionOnepagerModal';
import { INITIAL_CHAMPION_ONEPAGERS } from '../../mock/opportunityMiningData';

interface OpportunityCardsHubProps {
  cards: OpportunityCard[];
  onUpdateCardStatus: (cardId: string, status: OpportunityCardStatus, reason?: ClosedReasonCategory, note?: string) => void;
  onSyncCrm: (cardId: string) => void;
}

export const OpportunityCardsHub: React.FC<OpportunityCardsHubProps> = ({
  cards,
  onUpdateCardStatus,
  onSyncCrm
}) => {
  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [minIrr, setMinIrr] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal / Drawer state
  const [selectedCardForDrawer, setSelectedCardForDrawer] = useState<OpportunityCard | null>(null);
  const [onepagerCardId, setOnepagerCardId] = useState<string | null>(null);
  const [closingCardId, setClosingCardId] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState<ClosedReasonCategory>('budget_insufficient');
  const [closeNote, setCloseNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter logic
  const filteredCards = cards.filter((c) => {
    if (selectedDomain !== 'ALL' && c.domain !== selectedDomain) return false;
    if (selectedTrigger !== 'ALL' && c.triggerType !== selectedTrigger) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (c.valueMetrics.irr < minIrr) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${c.cardId} ${c.title} ${c.targetObject} ${c.region} ${c.owner}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const getDomainBadge = (domain: OpportunityDomain) => {
    switch (domain) {
      case 'pv':
        return {
          label: '光伏',
          icon: Sun,
          className: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'storage':
        return {
          label: '储能',
          icon: BatteryCharging,
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'dc':
        return {
          label: '数据中心',
          icon: Server,
          className: 'bg-purple-50 text-purple-800 border-purple-200'
        };
    }
  };

  const getTriggerTypeBadge = (trigger: OpportunityTriggerType) => {
    switch (trigger) {
      case 'diagnosis':
        return { label: '运行诊断', icon: AlertCircle, color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'policy_price':
        return { label: '政策/电价', icon: Zap, color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'tender':
        return { label: '标讯项目', icon: FileText, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'behavior':
        return { label: '客户行为', icon: Target, color: 'text-cyan-800 bg-cyan-50 border-cyan-200' };
    }
  };

  const getStatusBadge = (status: OpportunityCardStatus) => {
    switch (status) {
      case 'pending':
        return { label: '待认领', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'following':
        return { label: '跟进中', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'won':
        return { label: '已立项赢单', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'closed':
        return { label: '已关闭归档', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  };

  const handleOpenCloseModal = (cardId: string) => {
    setClosingCardId(cardId);
    setCloseReason('budget_insufficient');
    setCloseNote('');
  };

  const handleConfirmClose = () => {
    if (closingCardId) {
      onUpdateCardStatus(closingCardId, 'closed', closeReason, closeNote);
      setClosingCardId(null);
      showToast('商机卡片已归档并记录关闭原因复盘');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Control Bar in Light Theme */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索商机编号、电站/客户名称、区域或跟进销售..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Domain Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap mr-1">业务领域：</span>
            {[
              { id: 'ALL', label: '全部' },
              { id: 'pv', label: '光伏' },
              { id: 'storage', label: '储能' },
              { id: 'dc', label: '数据中心' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedDomain === d.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              卡片视图
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              列表表格
            </button>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">触发器：</span>
            <select
              value={selectedTrigger}
              onChange={(e) => setSelectedTrigger(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">全部触发器</option>
              <option value="diagnosis">运行数据诊断</option>
              <option value="policy_price">政策与电价变动</option>
              <option value="tender">标讯与项目事件</option>
              <option value="behavior">客户行为意向</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">推进状态：</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">全部状态</option>
              <option value="pending">待认领</option>
              <option value="following">跟进中</option>
              <option value="won">已立项赢单</option>
              <option value="closed">已关闭归档</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">最低 IRR：</span>
            <select
              value={minIrr}
              onChange={(e) => setMinIrr(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value={0}>不设限</option>
              <option value={10}>≥ 10% (标杆收益)</option>
              <option value={15}>≥ 15% (超额收益)</option>
              <option value={20}>≥ 20% (极高回报)</option>
            </select>
          </div>

          <div className="ml-auto text-slate-500">
            共筛选出 <span className="text-blue-600 font-bold">{filteredCards.length}</span> 张商机卡片
          </div>
        </div>
      </div>

      {/* Grid View in Light Theme */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredCards.map((card) => {
            const domainBadge = getDomainBadge(card.domain);
            const triggerBadge = getTriggerTypeBadge(card.triggerType);
            const statusBadge = getStatusBadge(card.status);
            const DomainIcon = domainBadge.icon;
            const TriggerIcon = triggerBadge.icon;

            return (
              <div
                key={card.cardId}
                className="rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-3.5 group shadow-xs"
              >
                {/* Header: ID, Domain, Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${domainBadge.className}`}>
                        <DomainIcon className="w-3.5 h-3.5" />
                        {domainBadge.label}
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-medium">
                        {card.cardId}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${triggerBadge.color}`}>
                        <TriggerIcon className="w-3 h-3" />
                        {triggerBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-1.5">
                    {card.title}
                  </h3>

                  {/* Target Object & Scale */}
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Building className="w-3.5 h-3.5 text-blue-500" />
                      {card.targetObject}
                    </span>
                    <span>·</span>
                    <span>{card.region}</span>
                    <span>·</span>
                    <span className="text-slate-500">{card.capacityScale}</span>
                  </div>

                  {/* Trigger Reason: 为什么是现在 */}
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 mb-3">
                    <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[11px] mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>触发机理与量化依据（为什么是现在）：</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {card.triggerReason}
                    </p>
                  </div>

                  {/* Value Metrics Grid: 能带来多少价值 */}
                  <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-center p-1.5 rounded-md bg-white border border-slate-150">
                      <div className="text-[10px] text-slate-500 font-medium">全投资 IRR</div>
                      <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                        {card.valueMetrics.irr}%
                      </div>
                    </div>
                    <div className="text-center p-1.5 rounded-md bg-white border border-slate-150">
                      <div className="text-[10px] text-slate-500 font-medium">投资回收期</div>
                      <div className="text-base font-extrabold text-slate-900 mt-0.5">
                        {card.valueMetrics.paybackYears} <span className="text-xs font-normal text-slate-500">年</span>
                      </div>
                    </div>
                    <div className="text-center p-1.5 rounded-md bg-white border border-slate-150">
                      <div className="text-[10px] text-slate-500 font-medium">年增收 / 节费</div>
                      <div className="text-base font-extrabold text-amber-600 mt-0.5">
                        {(card.valueMetrics.annualRevenueOrSavingYuan / 10000).toFixed(0)} <span className="text-xs font-normal text-slate-500">万</span>
                      </div>
                    </div>
                    <div className="text-center p-1.5 rounded-md bg-white border border-slate-150">
                      <div className="text-[10px] text-slate-500 font-medium">建议投资额</div>
                      <div className="text-base font-extrabold text-slate-800 mt-0.5">
                        {(card.valueMetrics.investmentYuan / 10000).toFixed(0)} <span className="text-xs font-normal text-slate-500">万</span>
                      </div>
                    </div>
                  </div>

                  {/* Intent Score Bar */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-600">意向综合评分：</span>
                      <span className="px-1.5 py-0.5 rounded font-extrabold text-blue-700 bg-blue-50 border border-blue-200">
                        {card.intentScore} 分
                      </span>
                      <span className="text-[11px] text-slate-500">
                        (画像分 {card.icpScore} + 行为分 {card.behaviorScore})
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      负责人：<span className="text-slate-800 font-medium">{card.owner}</span>
                    </div>
                  </div>

                  {/* Suggested Action for Sales */}
                  <div className="mt-2 p-2.5 rounded-lg bg-blue-50/50 border border-blue-200/60 text-xs flex items-start gap-2">
                    <Target className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-blue-900">推荐销售行动：</span>
                      <span className="text-slate-700 ml-1">{card.suggestedAction}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Status transition dropdown */}
                    <select
                      value={card.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as OpportunityCardStatus;
                        if (newStatus === 'closed') {
                          handleOpenCloseModal(card.cardId);
                        } else {
                          onUpdateCardStatus(card.cardId, newStatus);
                          showToast(`商机状态已更新为：${newStatus === 'following' ? '跟进中' : newStatus === 'won' ? '已立项赢单' : '待认领'}`);
                        }
                      }}
                      className="bg-white text-slate-700 border border-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-hidden hover:border-slate-400 transition-colors shadow-2xs"
                    >
                      <option value="pending">待认领</option>
                      <option value="following">推进跟进</option>
                      <option value="won">立项赢单</option>
                      <option value="closed">关闭归档</option>
                    </select>

                    {/* Sync to CRM */}
                    <button
                      onClick={() => onSyncCrm(card.cardId)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-2xs ${
                        card.crmSynced
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title={card.crmSynced ? `已同步至 ${card.crmSyncTarget || 'CRM'}` : '一键推送至 CRM / 销售易 / Salesforce'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{card.crmSynced ? '已同步CRM' : '同步CRM'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Onepager report modal */}
                    {card.hasOnepager && (
                      <button
                        onClick={() => setOnepagerCardId(card.cardId)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>内线一页纸</span>
                      </button>
                    )}

                    {/* Detail Drawer */}
                    <button
                      onClick={() => setSelectedCardForDrawer(card)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>数据溯源与详情</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View in Light Theme */}
      {viewMode === 'table' && (
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">商机编号 / 标题</th>
                  <th className="py-3 px-3">领域</th>
                  <th className="py-3 px-3">目标对象与区域</th>
                  <th className="py-3 px-3">触发类型</th>
                  <th className="py-3 px-3 text-right">全投资 IRR</th>
                  <th className="py-3 px-3 text-right">建议投资额</th>
                  <th className="py-3 px-3 text-right">年增收/节费</th>
                  <th className="py-3 px-3 text-center">意向评分</th>
                  <th className="py-3 px-3">推进状态</th>
                  <th className="py-3 px-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredCards.map((c) => {
                  const domainBadge = getDomainBadge(c.domain);
                  const triggerBadge = getTriggerTypeBadge(c.triggerType);
                  const statusBadge = getStatusBadge(c.status);

                  return (
                    <tr key={c.cardId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-blue-600 font-bold">{c.cardId}</div>
                        <div className="font-medium text-slate-900 max-w-xs truncate">{c.title}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${domainBadge.className}`}>
                          {domainBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-slate-800 font-medium truncate max-w-xs">{c.targetObject}</div>
                        <div className="text-[11px] text-slate-500">{c.region}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${triggerBadge.color}`}>
                          {triggerBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-emerald-600 font-mono">
                        {c.valueMetrics.irr}%
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-700 font-medium">
                        {(c.valueMetrics.investmentYuan / 10000).toFixed(0)} 万
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-amber-600">
                        {(c.valueMetrics.annualRevenueOrSavingYuan / 10000).toFixed(0)} 万/年
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-mono">
                          {c.intentScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {c.hasOnepager && (
                            <button
                              onClick={() => setOnepagerCardId(c.cardId)}
                              className="text-amber-700 hover:text-amber-800 underline font-medium"
                            >
                              一页纸
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCardForDrawer(c)}
                            className="text-blue-600 hover:text-blue-700 underline font-medium"
                          >
                            详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer: Full Data Lineage & Card Traceability (Light Theme) */}
      {selectedCardForDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex justify-end">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 space-y-5 shadow-2xl animate-in slide-in-from-right duration-200 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-blue-600 font-bold">{selectedCardForDrawer.cardId}</span>
                  <span className="text-xs text-slate-500">完整商机数据血缘与测算底表</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedCardForDrawer.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCardForDrawer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target & Basics */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-blue-700 uppercase tracking-wider text-[11px]">一、目标电站 / 客户信息</h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">目标客户及电站：</span>
                  <span className="font-semibold text-slate-900">{selectedCardForDrawer.targetObject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">所在地及资产规模：</span>
                  <span className="text-slate-700">{selectedCardForDrawer.region} · {selectedCardForDrawer.capacityScale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">生成时间 / 更新时间：</span>
                  <span className="font-mono text-slate-600">{selectedCardForDrawer.createdAt} / {selectedCardForDrawer.updatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">底层数据来源：</span>
                  <span className="text-blue-700 font-medium">{selectedCardForDrawer.dataSource}</span>
                </div>
              </div>
            </div>

            {/* Trigger Mechanism */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-amber-800 uppercase tracking-wider text-[11px]">二、触发机理与量化依据 (为什么是现在)</h4>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 leading-relaxed text-slate-800">
                {selectedCardForDrawer.triggerReason}
              </div>
            </div>

            {/* Complete Value Metrics Breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-emerald-800 uppercase tracking-wider text-[11px]">三、价值量化公式与参数拆解 (能带来多少价值)</h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">建议总投资额 (CapEx)</span>
                  <span className="font-bold text-slate-900">¥ {(selectedCardForDrawer.valueMetrics.investmentYuan).toLocaleString()} 元</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">全投资内部收益率 (IRR)</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{selectedCardForDrawer.valueMetrics.irr}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">静态投资回收期</span>
                  <span className="font-semibold text-slate-900">{selectedCardForDrawer.valueMetrics.paybackYears} 年</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">年化综合增收 / 节电金额</span>
                  <span className="font-bold text-amber-700">¥ {(selectedCardForDrawer.valueMetrics.annualRevenueOrSavingYuan).toLocaleString()} 元/年</span>
                </div>
                {selectedCardForDrawer.valueMetrics.curtailmentSavedMwh && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">挽回年弃电量 / 弃光消纳</span>
                    <span className="text-slate-700">{selectedCardForDrawer.valueMetrics.curtailmentSavedMwh} MWh/年</span>
                  </div>
                )}
                {selectedCardForDrawer.valueMetrics.co2ReductionTons && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">年化碳减排潜力</span>
                    <span className="text-emerald-700 font-semibold">{selectedCardForDrawer.valueMetrics.co2ReductionTons} 吨 CO2/年</span>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Action & Intent */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-purple-800 uppercase tracking-wider text-[11px]">四、销售策略与行动指引</h4>
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="text-slate-800 leading-relaxed">
                  {selectedCardForDrawer.suggestedAction}
                </div>
                <div className="pt-2 border-t border-blue-200/60 flex justify-between text-slate-600">
                  <span>当前责任销售：<strong className="text-slate-900">{selectedCardForDrawer.owner}</strong></span>
                  <span>CRM 同步：<strong className={selectedCardForDrawer.crmSynced ? 'text-emerald-700' : 'text-slate-500'}>{selectedCardForDrawer.crmSynced ? `已同步 (${selectedCardForDrawer.crmSyncTarget})` : '未同步'}</strong></span>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setOnepagerCardId(selectedCardForDrawer.cardId);
                }}
                className="flex-1 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-300 transition-colors text-center"
              >
                查看内线立项一页纸
              </button>
              <button
                onClick={() => setSelectedCardForDrawer(null)}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Close Reason logging in Light Theme */}
      {closingCardId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>商机关闭与输单归因复盘</span>
              </h3>
              <button onClick={() => setClosingCardId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              请选择关闭该商机卡片的核心原因，此数据将回流至引擎层用于持续优化算法阈值与 ICP 评分。
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-700 font-medium">归因分类：</label>
              <select
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value as ClosedReasonCategory)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="budget_insufficient">客户预算不足或推迟到明年</option>
                <option value="competitor_won">竞对低价或排他中标</option>
                <option value="policy_change">地方政策/电价调整暂缓</option>
                <option value="no_interest">客户无意向/内部未通过立项</option>
                <option value="data_inaccurate">现场工况与算法测算存在偏差</option>
                <option value="other">其他原因</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-700 font-medium">复盘备忘说明：</label>
              <textarea
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                placeholder="填写具体的沟通反馈、客户顾虑或竞对信息..."
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 placeholder-slate-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setClosingCardId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 border border-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                确认关闭商机
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Champion Onepager Modal */}
      {onepagerCardId && INITIAL_CHAMPION_ONEPAGERS[onepagerCardId] && (
        <ChampionOnepagerModal
          onepager={INITIAL_CHAMPION_ONEPAGERS[onepagerCardId]}
          onClose={() => setOnepagerCardId(null)}
        />
      )}
    </div>
  );
};
