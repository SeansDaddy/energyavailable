import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  X,
  Trash2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  TrendingDown,
  Shield,
  Layers,
  Database,
  ArrowRight,
  Radio,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export const AiAssistantDrawer: React.FC = () => {
  const {
    isAiDrawerOpen,
    closeAiDrawer,
    chatMessages,
    sendChatMessage,
    clearChatMessages,
    navigateToSiteDetail,
    sites,
    selectedSiteId
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isExpandedWidth, setIsExpandedWidth] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  // Auto-scroll on new message
  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiDrawerOpen, isTyping]);

  // Focus input on drawer open
  useEffect(() => {
    if (isAiDrawerOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isAiDrawerOpen]);

  if (!isAiDrawerOpen) return null;

  const presetPromptCategories = [
    {
      category: 'SLA 查数与达标',
      icon: TrendingDown,
      prompts: [
        '查一下全网目前 SLA 未达标的站点及其差值排行？',
        '华东区 2026年8月累计可用度与达标率？',
        '查一下深圳光明储能电站二期-04号站当期可用度？'
      ]
    },
    {
      category: '因果链归因 (R11)',
      icon: Layers,
      prompts: [
        '宝武钢铁1号储能站 8 月份等效 PCS 中断原因？',
        '针对当前站点进行可用度归因与告警诊断',
        '解释等效 PCS 中断时长折算口径 (Rule R2)'
      ]
    },
    {
      category: '售前可行性评估',
      icon: Shield,
      prompts: [
        '售前评估：意向华东区 20MW 工商业储能站，拟承诺 SLA 99.6% 可行吗？',
        '管理口径五因子权重模型是什么？'
      ]
    },
    {
      category: '数据断供排查 (R5)',
      icon: Database,
      prompts: [
        '数据断供排查：超过 30 天未导入离线日志的站点有哪些？',
        'Latest-Wins 离线日志覆盖冲突计算规则？'
      ]
    }
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputVal).trim();
    if (!query) return;

    setInputVal('');
    setIsTyping(true);
    sendChatMessage(query);

    setTimeout(() => {
      setIsTyping(false);
    }, 650);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSiteJump = (siteId: string) => {
    navigateToSiteDetail(siteId);
    // keep drawer open or optionally close
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeAiDrawer}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Right Drawer */}
      <aside
        aria-label="AI 智能助手抽屉"
        className={`fixed top-0 right-0 h-full bg-white z-50 shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out animate-in slide-in-from-right duration-300 ${
          isExpandedWidth ? 'w-full md:w-[720px] lg:w-[820px]' : 'w-full md:w-[480px] lg:w-[540px]'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-14 px-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>AI 智能助手 / ChatBI</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  ONLINE
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                融合全网 38,420 站台账 · 规则引擎 R1~R11
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Clear History */}
            <button
              onClick={clearChatMessages}
              title="清空会话历史"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Expand / Shrink Width */}
            <button
              onClick={() => setIsExpandedWidth(!isExpandedWidth)}
              title={isExpandedWidth ? '收缩抽屉宽度' : '展开抽屉宽度'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors hidden md:block"
            >
              {isExpandedWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Drawer Button */}
            <button
              onClick={closeAiDrawer}
              title="关闭抽屉"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Active Context Pill */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Radio className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-400">当前聚焦站点:</span>
            <span className="font-semibold text-slate-800 truncate font-mono">
              {currentSite.siteName} ({currentSite.siteCode})
            </span>
          </div>
          <button
            onClick={() => handleSend(`针对当前聚焦站点【${currentSite.siteName}】进行可用度因果归因与健康诊断`)}
            className="text-blue-600 hover:text-blue-700 font-semibold shrink-0 ml-2 hover:underline"
          >
            一键诊断 &rarr;
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
          {chatMessages.map(msg => {
            const isUser = msg.sender === 'user';
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-blue-200 text-blue-600'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2.5 ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                  }`}
                >
                  {/* Text Content */}
                  <div className="whitespace-pre-line select-text font-sans">
                    {msg.content}
                  </div>

                  {/* Structured Data: Site Table */}
                  {msg.queryType === 'site_table' && msg.dataPayload?.sites && (
                    <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <div className="px-3 py-1.5 bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700 text-[11px] flex items-center justify-between">
                        <span>未达标站点穿透列表</span>
                        <span className="text-[10px] text-slate-400 font-normal">点击可直达详情</span>
                      </div>
                      <div className="divide-y divide-slate-200 text-[11px]">
                        {msg.dataPayload.sites.map((s: any, idx: number) => {
                          const matchedSite = sites.find(
                            st => st.siteCode === s.code || st.siteName === s.name
                          );
                          return (
                            <div
                              key={idx}
                              className="p-2.5 flex items-center justify-between gap-2 hover:bg-blue-50/50 transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">
                                  {s.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  编码: {s.code} · SLA: {s.sla}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right font-mono">
                                  <div className="font-bold text-red-600">{s.current}</div>
                                  <div className="text-[10px] text-red-500">{s.gap}</div>
                                </div>
                                {matchedSite && (
                                  <button
                                    onClick={() => handleSiteJump(matchedSite.id)}
                                    className="p-1 px-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-[10px] font-semibold transition-colors flex items-center gap-0.5"
                                  >
                                    <span>下钻</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Structured Data: Metric Card */}
                  {msg.queryType === 'metric_card' && msg.dataPayload?.metrics && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="font-bold text-blue-700 text-[11px] flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" />
                        <span>{msg.dataPayload.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {msg.dataPayload.metrics.map((m: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white p-2 rounded border border-slate-200"
                          >
                            <div className="text-[10px] text-slate-400">{m.label}</div>
                            <div
                              className={`text-sm font-bold font-mono mt-0.5 ${
                                m.status === 'success'
                                  ? 'text-emerald-600'
                                  : m.status === 'danger'
                                  ? 'text-rose-600'
                                  : m.status === 'warning'
                                  ? 'text-amber-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Structured Data: Prediction Card */}
                  {msg.queryType === 'prediction_card' && msg.dataPayload && (
                    <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2 text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>时序风控预警卡</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold">
                          {msg.dataPayload.riskLevel || 'HIGH RISK'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-white p-2 rounded border border-amber-200">
                          <div className="text-slate-400">预测跌破概率</div>
                          <div className="text-sm font-black font-mono text-red-600 mt-0.5">
                            {msg.dataPayload.breachProbability}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-amber-200">
                          <div className="text-slate-400">预测可用度区间</div>
                          <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                            {msg.dataPayload.predictedValue}
                          </div>
                        </div>
                      </div>

                      {msg.dataPayload.suggestions && (
                        <div className="bg-white/80 p-2.5 rounded border border-amber-200 space-y-1 text-[11px]">
                          <div className="font-semibold text-slate-700">预防性执行建议:</div>
                          <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                            {msg.dataPayload.suggestions.map((sug: string, sIdx: number) => (
                              <li key={sIdx}>{sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Structured Data: Pivot Analysis */}
                  {msg.queryType === 'pivot_analysis' && msg.dataPayload && (
                    <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2 text-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-900">
                          {msg.dataPayload.siteName} 归因剖析
                        </span>
                        <button
                          onClick={() => {
                            if (msg.dataPayload.siteId) {
                              navigateToSiteDetail(msg.dataPayload.siteId, 2); // Tab 2 is MergedFaultsTab
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[10px]"
                        >
                          <span>查看因果链瀑布流</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-white p-2 rounded border border-blue-200">
                          <div className="text-slate-400">等效 PCS 中断时长</div>
                          <div className="text-sm font-bold font-mono text-red-600">
                            {msg.dataPayload.equivalentMins} 分钟
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border border-blue-200">
                          <div className="text-slate-400">现场工单 MTTR</div>
                          <div className="text-sm font-bold font-mono text-slate-800">
                            {msg.dataPayload.mttr}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bubble Footer (Time & Copy) */}
                  <div
                    className={`flex items-center justify-between pt-1 border-t text-[10px] ${
                      isUser
                        ? 'border-white/10 text-blue-100'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>复制</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none p-3 text-xs text-slate-600 shadow-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>AI 正在联查全网数据库与规则引擎计算中...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Categories Accordion / Pills */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>快捷提问推荐:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
            {presetPromptCategories.flatMap(c => c.prompts).slice(0, 5).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full border border-slate-200 hover:border-blue-300 text-[11px] transition-colors text-left truncate max-w-full"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              id="ai-drawer-input"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="输入自然语言提问 (例如: 查一下华东区可用度最低的站点...)"
              className="flex-1 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              id="btn-ai-drawer-send"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
            <span>按 Enter 发送 · 支持站点穿透与多维统计透视</span>
            <span>Gemini AI Engine</span>
          </div>
        </div>
      </aside>
    </>
  );
};
