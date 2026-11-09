import React, { useState } from 'react';
import {
  Activity,
  UserCheck,
  Send,
  Code2,
  Bell,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Building,
  Target,
  Share2,
  TrendingUp,
  PieChart
} from 'lucide-react';
import {
  BehaviorTrackEvent,
  ClientIntentProfile,
  OpportunityCard
} from '../../types/opportunityMining';
import {
  INITIAL_BEHAVIOR_EVENTS,
  INITIAL_CLIENT_INTENT_PROFILES
} from '../../mock/opportunityMiningData';

interface BehaviorEcosystemWorkbenchProps {
  cards: OpportunityCard[];
}

export const BehaviorEcosystemWorkbench: React.FC<BehaviorEcosystemWorkbenchProps> = ({
  cards
}) => {
  const [subTab, setSubTab] = useState<'f11_events' | 'f12_profile' | 'f14_push' | 'f15_api'>('f11_events');

  // F11 Events
  const [events, setEvents] = useState<BehaviorTrackEvent[]>(INITIAL_BEHAVIOR_EVENTS);

  // F12 Profiles
  const [profiles] = useState<ClientIntentProfile[]>(INITIAL_CLIENT_INTENT_PROFILES);

  // F14 Push simulation state
  const [pushChannel, setPushChannel] = useState<'wecom' | 'dingtalk' | 'email'>('wecom');
  const [pushSimulating, setPushSimulating] = useState(false);
  const [pushSuccessToast, setPushSuccessToast] = useState<string | null>(null);

  // F15 API State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /v1/opportunities/cards');
  const [webhookUrl, setWebhookUrl] = useState<string>('https://crm.energy-sales.com/webhook/opportunity-cards');
  const [apiCopied, setApiCopied] = useState(false);

  const handleSimulatePush = () => {
    setPushSimulating(true);
    setTimeout(() => {
      setPushSimulating(false);
      const channelName = pushChannel === 'wecom' ? '企业微信群机器人' : pushChannel === 'dingtalk' ? '钉钉工作通知' : '销售总监邮箱';
      setPushSuccessToast(`已成功将高价值商机卡片推送到【${channelName}】！`);
      setTimeout(() => setPushSuccessToast(null), 3500);
    }, 1000);
  };

  const handleCopyCurl = () => {
    const curl = `curl -X GET "https://api.energy-platform.com/v1/opportunities/cards?domain=storage&min_irr=12" \\
  -H "Authorization: Bearer sec_prd_engy_2026_live" \\
  -H "Content-Type: application/json"`;
    navigator.clipboard.writeText(curl);
    setApiCopied(true);
    setTimeout(() => setApiCopied(false), 2000);
  };

  // Closed reasons calculation from cards
  const closedCards = cards.filter((c) => c.status === 'closed');
  const closedReasonsCount = closedCards.reduce((acc, c) => {
    const r = c.closedReason || 'other';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {pushSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{pushSuccessToast}</span>
        </div>
      )}

      {/* Sub-tab Navigation in Light Theme */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'f11_events', label: 'F11 意向信号埋点看板', icon: Activity, badge: '行为事件流' },
            { id: 'f12_profile', label: 'F12 行为意向评分引擎', icon: UserCheck, badge: '跃升预警' },
            { id: 'f14_push', label: 'F14 自动推送与复盘看板', icon: Send, badge: '企微/输单归因' },
            { id: 'f15_api', label: 'F15 开放 API 与 CRM 对接', icon: Code2, badge: '标准对接' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 pr-2 hidden md:block">
          PRD V3.0 梯队三 · 行为数据闭环、主动推送与对外开放
        </div>
      </div>

      {/* F11: 意向信号埋点看板 */}
      {subTab === 'f11_events' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>F11 意向信号埋点看板 (客户实时使用行为事件流)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                追踪客户侧在使用测算器、查阅诊断报告、下载一页纸及转发群聊的行为，量化意向热度
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-medium">实时监听中</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">时间戳</th>
                  <th className="py-3 px-3">客户机构 / 用户角色</th>
                  <th className="py-3 px-3">行为事件类型</th>
                  <th className="py-3 px-3">目标项目</th>
                  <th className="py-3 px-2 text-right">停留时长</th>
                  <th className="py-3 px-2 text-right text-cyan-700">意向加权分</th>
                  <th className="py-3 px-4">行为详情明细</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {events.map((e) => {
                  const getActionBadge = (type: string) => {
                    switch (type) {
                      case 'RETRY_CALCULATION':
                        return { label: '多次深度重算', color: 'bg-amber-50 text-amber-800 border-amber-200' };
                      case 'DOWNLOAD_ONEPAGER':
                        return { label: '下载立项一页纸', color: 'bg-purple-50 text-purple-800 border-purple-200' };
                      case 'FORWARD_SHARED':
                        return { label: '转发分享给领导', color: 'bg-rose-50 text-rose-800 border-rose-200' };
                      case 'VIEW_REPORT':
                        return { label: '查阅诊断报告', color: 'bg-blue-50 text-blue-700 border-blue-200' };
                      default:
                        return { label: '交互测算', color: 'bg-slate-100 text-slate-700 border-slate-200' };
                    }
                  };
                  const badge = getActionBadge(e.actionType);

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-500">{e.timestamp}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{e.clientOrgName}</div>
                        <div className="text-[11px] text-slate-500">{e.userRole}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{e.targetProject}</td>
                      <td className="py-3 px-2 text-right font-mono text-slate-500">{e.durationSeconds}s</td>
                      <td className="py-3 px-2 text-right font-bold text-cyan-700 font-mono">+{e.weightPoint}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm leading-relaxed">{e.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* F12: 客户行为意向评分画像 */}
      {subTab === 'f12_profile' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>F12 行为评分引擎与活跃跃升预警</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                结合时间衰减算法计算活跃分，当客户意向产生跳变跃升时自动标注为“极高意向”推进销售
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profiles.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{p.clientOrgName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.scoreSurgeTrend === 'SURGING'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {p.scoreSurgeTrend === 'SURGING' ? '🔥 活跃分大幅跃升' : '稳定关注'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mb-3">
                    联系人：<strong className="text-slate-800">{p.contactPerson}</strong> · 最近活跃：{p.lastActiveTime}
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-center mb-3">
                    <div className="text-[11px] text-slate-500">实时行为活跃分</div>
                    <div className="text-2xl font-black text-emerald-600 mt-0.5 font-mono">{p.activeScore} 分</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">近7日触发事件 {p.recent7DaysEventsCount} 次</div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-600 font-medium">重点关注方向：</div>
                    <div className="flex flex-wrap gap-1">
                      {p.interestedSolutions.map((s, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-emerald-800 font-semibold mb-1">推荐拜访跟进策略：</div>
                  {p.recommendedOutreachStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F14: 自动推送与复盘看板 */}
      {subTab === 'f14_push' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Push Simulation (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>F14 商机卡片自动推送渠道模拟 (企微 / 钉钉 / 邮件)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">高价值商机触发即刻推至销售一线移动端工作台</p>
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { id: 'wecom', label: '企业微信群机器人' },
                { id: 'dingtalk', label: '钉钉工作通知' },
                { id: 'email', label: '销售经理高优邮件' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPushChannel(c.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    pushChannel === c.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Mobile notification preview card in Light Theme */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 font-semibold text-blue-700">
                  <Bell className="w-3.5 h-3.5" />
                  机会点量化引擎 · 智能提醒
                </span>
                <span>刚刚</span>
              </div>

              <div className="text-xs font-bold text-slate-900">
                【高优商机推送】华东盐城 100MW 光伏加装 20MW/40MWh 储能
              </div>

              <div className="text-[11px] text-slate-700 space-y-1">
                <div>• 触发机理：江苏9月分时价差达 0.87元/kWh，弃光率 6.4%</div>
                <div>• 预期效益：全投资 IRR <strong className="text-emerald-700 font-bold">12.4%</strong>，年增收 <strong className="text-amber-700 font-bold">860万元</strong></div>
                <div>• 意向评分：<strong className="text-blue-700 font-bold">92分 (行为激增)</strong></div>
                <div>• 推荐行动：携带一页纸报告拜访计划部王总</div>
              </div>

              <div className="pt-2 flex justify-end">
                <span className="text-[10px] text-blue-600 font-medium">点击一键认领跟进 &gt;</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={handleSimulatePush}
                disabled={pushSimulating}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs shadow-xs transition-colors"
              >
                {pushSimulating ? '正在推送到终端...' : '模拟向责任销售触发推送'}
              </button>
            </div>
          </div>

          {/* Win/Loss Closed Reason Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-600" />
                <span>输单与关闭归因复盘</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">闭环沉淀销售关闭商机的原因，反哺优化规则模型</p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: '客户预算不足或推迟到明年', count: closedReasonsCount['budget_insufficient'] || 1, pct: 45 },
                { label: '竞对低价或排他中标', count: closedReasonsCount['competitor_won'] || 0, pct: 20 },
                { label: '地方政策/电价调整暂缓', count: closedReasonsCount['policy_change'] || 0, pct: 15 },
                { label: '现场工况与算法测算存在偏差', count: closedReasonsCount['data_inaccurate'] || 0, pct: 10 },
                { label: '客户内部未通过立项', count: closedReasonsCount['no_interest'] || 0, pct: 10 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-bold text-slate-900">{item.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div style={{ width: `${item.pct}%` }} className="h-full bg-blue-600 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 leading-relaxed border border-slate-200">
              <strong className="text-slate-800">算法迭代建议：</strong>建议在下个版本将华北区域严寒电站的技改成本预算因子上浮 12%，避免因电站改造成本低估造成客户推迟立项。
            </div>
          </div>
        </div>
      )}

      {/* F15: 开放 API 与 CRM 对接工作台 */}
      {subTab === 'f15_api' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-600" />
                <span>F15 开放 API 规范与 CRM 对接沙箱</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                支持第三方 CRM (Salesforce / 纷享销客 / 销售易) 通过标准 REST API 或 Webhook 双向同步商机卡片
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                API Version: v1.0.4-LTS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Endpoints & cURL (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-slate-700">标准 RESTful 接口清单：</div>
              <div className="space-y-1.5 text-xs font-mono">
                {[
                  { ep: 'GET /v1/opportunities/cards', desc: '分页查询商机卡片列表 (支持领域/IRR筛选)' },
                  { ep: 'GET /v1/opportunities/cards/{id}', desc: '根据卡片ID获取完整数据血缘与测算底表' },
                  { ep: 'POST /v1/opportunities/cards/{id}/sync-crm', desc: '触发商机卡片推送到目标 CRM 客户线索库' },
                  { ep: 'PATCH /v1/opportunities/cards/{id}/status', desc: '回流 CRM 阶段状态更新 (跟进中/已赢单/关闭)' },
                  { ep: 'POST /v1/calculator/storage/recompute', desc: '储能经济性快速测算 OpenAPI' }
                ].map((item) => (
                  <button
                    key={item.ep}
                    onClick={() => setSelectedEndpoint(item.ep)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      selectedEndpoint === item.ep
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>{item.ep}</div>
                    <div className="text-[11px] text-slate-500 font-sans mt-0.5 font-normal">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* cURL Sandbox */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="font-medium">cURL 请求示例：</span>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {apiCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{apiCopied ? '已复制' : '复制命令'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner">
{`curl -X GET "https://api.energy-platform.com/v1/opportunities/cards?domain=storage&min_irr=12" \\
  -H "Authorization: Bearer sec_prd_engy_2026_live" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
            </div>

            {/* Response Preview & Webhook Config (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-slate-700">响应报文预览 (JSON Response)：</div>
              <pre className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto h-56 leading-relaxed shadow-inner">
{`{
  "code": 200,
  "msg": "success",
  "data": {
    "total": 38,
    "items": [
      {
        "card_id": "CARD-2026-0842",
        "title": "华东盐城 100MW 光伏加装 20MW/40MWh 储能",
        "domain": "storage",
        "target_object": "国家能源集团华东分公司",
        "value_metrics": {
          "irr": 12.4,
          "payback_years": 4.2,
          "annual_gain_yuan": 8600000,
          "investment_yuan": 28000000
        },
        "intent_score": 92,
        "status": "following"
      }
    ]
  }
}`}
              </pre>

              {/* Webhook Configuration in Light Theme */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-900">Webhook 事件订阅配置：</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={() => alert('Webhook 订阅配置已保存并完成联通性心跳检测！')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 shadow-xs"
                  >
                    保存并测试
                  </button>
                </div>
                <div className="text-[11px] text-slate-500">
                  当引擎生成高意向卡片或监测到电价重算触发时，自动通过 POST 回调至该端点。
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
