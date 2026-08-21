import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  HelpCircle,
  Database,
  ArrowRight,
  TrendingDown,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  structuredData?: {
    type: 'site_table' | 'root_cause' | 'pre_contract';
    title?: string;
    items?: any[];
    analysis?: string;
  };
  time: string;
}

export const AiAssistantView: React.FC = () => {
  const { sites, navigateToSiteDetail } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-001',
      sender: 'ai',
      text: '您好！我是能源云可用度 AI 智能分析与 ChatBI 助手。我已深度融合全网 38,420 站实时运行台账、离线日志解析记录、PCare 闭环工单及合同 SLA 数据模型。请问您需要查询什么或进行哪项专项诊断？',
      time: '18:00'
    }
  ]);

  const presetPrompts = [
    '查一下全网目前 SLA 未达标的站点及其差值排行？',
    '深度归因诊断：宝武钢铁1号储能站 8 月份等效 PCS 中断原因？',
    '售前评估：意向华东区 20MW 工商业储能站，拟承诺 SLA 99.6% 可行吗？',
    '数据断供排查：超过 30 天未导入离线日志的站点有哪些？'
  ];

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content,
      time: new Date().toTimeString().slice(0, 5)
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse: ChatMessage;

      if (content.includes('未达标') || content.includes('排行') || content.includes('SLA')) {
        const breached = [...sites]
          .sort((a, b) => a.currentAvailability - b.currentAvailability)
          .slice(0, 3);

        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `根据全网实时计算模型与 Rule R2/R6 口径，为您检索到当前全网共有 142 个站点低于合同 SLA 约定阈值。以下为您呈现缺口最大的重点站点：`,
          structuredData: {
            type: 'site_table',
            title: 'SLA 未达标重点站点清单 (ChatBI 动态透视)',
            items: breached
          },
          time: new Date().toTimeString().slice(0, 5)
        };
      } else if (content.includes('宝武钢铁') || content.includes('归因')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `针对【宝武钢铁1号储能站 (SZ-ESS-0001)】的可用度因果链深度归因分析如下 (Rule R11 归并诊断)：`,
          structuredData: {
            type: 'root_cause',
            title: '宝武钢铁1号储能站 归并故障与因果链诊断',
            analysis: `1. 核心中断事件：8月12日 14:20 ~ 16:30 发生 2# PCS 变流器过温告警，导致该支路非计划停机，产生等效 PCS 中断时长 596 分钟。\n2. PCare 工单闭环 (R4)：现场运维工程师于 16:30 输出备件更换方案并完成闭环，MTTR 为 2.17 小时。\n3. 组网与扣减：该站为双机热备架构，扣除计划内维护 120 分钟后，当期累计可用度为 98.64% (低于 SLA 99.50%)。\n4. 改进建议：建议升级变流器散热风道并加装进风口滤网温差监控。`
          },
          time: new Date().toTimeString().slice(0, 5)
        };
      } else if (content.includes('售前') || content.includes('99.6') || content.includes('意向')) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `【售前风控评估决策意见】针对意向华东区 20MW 工商业储能站拟承诺 99.60% SLA 的评估结果如下：`,
          structuredData: {
            type: 'pre_contract',
            title: 'AI 售前决策建议卡 (管理口径五因子模型)',
            analysis: `⚠️ 违约风险等级：【高风险】\n• 历史基准数据：华东区同类工商业微网近 12 个月平均可用度为 99.48%，P90 值为 99.62%，P95 值为 99.21%。\n• 决策建议：拟承诺 99.60% 处于高位极限边界。若要履约达标，必须在技术协议中采用【双机热备 + 光纤环网】并明确【电网不可抗力停机除外】与【计划内维护不扣减】条款 (R2)。建议推荐签约阈值为 99.35% ~ 99.45%。`
          },
          time: new Date().toTimeString().slice(0, 5)
        };
      } else {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `已为您完成数据检索与统计运算：当前全网 38,420 站总体运行可用度为 99.42%，本月累计导入日志批次 8,420 批，工单闭环率 94.6%。您可以点击下方预设问题或指定站点进行专项下钻。`,
          time: new Date().toTimeString().slice(0, 5)
        };
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1500px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              AI 智能分析与 ChatBI 问答助手
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              自然语言查数 · 归因链诊断 · 售前评估
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            融合站点台账、离线日志解析事件、PCare 工单及合同 SLA 规则，提供端到端智能洞察。
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-[660px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-bold text-xs'
                    : 'bg-blue-50 border border-blue-200 text-blue-600'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Structured Data Attachment */}
                {msg.structuredData && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="font-bold text-blue-600 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      <span>{msg.structuredData.title}</span>
                    </div>

                    {msg.structuredData.type === 'site_table' && (
                      <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                        <table className="w-full text-left text-[11px] text-slate-700">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">站点名称</th>
                              <th className="py-2 px-2 font-mono">SLA 阈值</th>
                              <th className="py-2 px-2 font-mono">当前可用度</th>
                              <th className="py-2 px-2 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {msg.structuredData.items?.map(s => (
                              <tr key={s.id} className="hover:bg-blue-50/40">
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {s.siteName}
                                </td>
                                <td className="py-2 px-2 font-mono">{s.slaThreshold}%</td>
                                <td className="py-2 px-2 font-mono font-bold text-red-600">
                                  {s.currentAvailability}%
                                </td>
                                <td className="py-2 px-2 text-right">
                                  <button
                                    onClick={() => navigateToSiteDetail(s.id)}
                                    className="text-blue-600 hover:text-blue-800 font-semibold"
                                  >
                                    下钻 &rarr;
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(msg.structuredData.type === 'root_cause' ||
                      msg.structuredData.type === 'pre_contract') && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] whitespace-pre-line text-slate-700 leading-relaxed font-sans">
                        {msg.structuredData.analysis}
                      </div>
                    )}
                  </div>
                )}

                <div className={`text-[10px] text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>AI 正在联查全网数据库并执行等效可用度逻辑运算...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset Prompt Bubbles */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 shrink-0 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>快捷提问:</span>
          </span>
          {presetPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 transition-colors shrink-0 whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            placeholder="输入自然语言提问，例如：查一下华东区可用度最低的3个站点..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage(inputVal);
            }}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
          />
          <button
            onClick={() => handleSendMessage(inputVal)}
            disabled={!inputVal.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>发送</span>
          </button>
        </div>
      </div>
    </div>
  );
};
