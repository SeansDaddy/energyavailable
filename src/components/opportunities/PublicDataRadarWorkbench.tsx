import React, { useState } from 'react';
import {
  Radio,
  FileText,
  Zap,
  Users,
  Award,
  TrendingUp,
  Search,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Plus,
  Building,
  Target
} from 'lucide-react';
import {
  TenderRadarNotice,
  PolicyAlertItem,
  TargetAccountItem,
  CarbonAssetMetric
} from '../../types/opportunityMining';
import {
  INITIAL_TENDER_NOTICES,
  INITIAL_POLICY_ALERTS,
  INITIAL_TARGET_ACCOUNTS,
  INITIAL_CARBON_ASSET_METRICS
} from '../../mock/opportunityMiningData';

interface PublicDataRadarWorkbenchProps {
  onCreateCardFromTender: (tender: TenderRadarNotice) => void;
  onTriggerPolicyRecalc: (policy: PolicyAlertItem) => void;
}

export const PublicDataRadarWorkbench: React.FC<PublicDataRadarWorkbenchProps> = ({
  onCreateCardFromTender,
  onTriggerPolicyRecalc
}) => {
  const [subTab, setSubTab] = useState<'f7_tender' | 'f8_policy' | 'f9_icp' | 'f10_carbon'>('f8_policy');

  // F7 State
  const [tenders, setTenders] = useState<TenderRadarNotice[]>(INITIAL_TENDER_NOTICES);

  // F8 State
  const [policies, setPolicies] = useState<PolicyAlertItem[]>(INITIAL_POLICY_ALERTS);
  const [recalculatingPolicyId, setRecalculatingPolicyId] = useState<string | null>(null);

  // F9 State
  const [targetAccounts] = useState<TargetAccountItem[]>(INITIAL_TARGET_ACCOUNTS);

  // F10 State
  const [carbonAssets] = useState<CarbonAssetMetric[]>(INITIAL_CARBON_ASSET_METRICS);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Recalculate policy
  const handleRecalculatePolicy = (p: PolicyAlertItem) => {
    setRecalculatingPolicyId(p.id);
    setTimeout(() => {
      setRecalculatingPolicyId(null);
      onTriggerPolicyRecalc(p);
      showToast(`已完成对全网 ${p.impactedStationsCount} 座受影响电站的敏捷重算，自动生成/更新了 ${p.autoRecalculatedOpportunitiesCount} 张高收益商机卡片！`);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-tab Navigation in Light Theme */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'f8_policy', label: 'F8 政策与分时电价雷达', icon: Zap, badge: '价差自动重算' },
            { id: 'f7_tender', label: 'F7 标讯雷达抓取', icon: Radio, badge: '央国企招采' },
            { id: 'f9_icp', label: 'F9 Target List 与 ICP 评分', icon: Users, badge: '客户画像' },
            { id: 'f10_carbon', label: 'F10 碳与绿证收益计算', icon: Award, badge: 'ESG与GEC' }
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
          PRD V2.0 梯队二 · 整合公开招采、政策发文与画像雷达
        </div>
      </div>

      {/* F8: 政策与分时电价雷达 */}
      {subTab === 'f8_policy' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>F8 政策与分时电价变动雷达 (政策触发商机自动重算)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                追踪各省发改委分时电价、尖峰上浮及地方配储补贴，政策一旦变动自动触发全网存量站点经济模型重算
              </p>
            </div>
            <div className="text-xs text-slate-500">
              近 30 天捕获重大政策：<strong className="text-slate-900">{policies.length}</strong> 条
            </div>
          </div>

          <div className="space-y-3.5">
            {policies.map((p) => {
              const isRecalculating = recalculatingPolicyId === p.id;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        {p.policyNo}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">{p.issuingAuthority}</span>
                      <span className="text-xs text-slate-500">· 执行日期：{p.effectiveDate}</span>
                    </div>

                    {p.isUrgent && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        重大利好政策
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {p.summary}
                  </p>

                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span><strong>电价与收益冲击：</strong>{p.spreadChangeNote}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-600">
                      影响存量站点：<strong className="text-slate-900">{p.impactedStationsCount}</strong> 座 ·
                      已自动衍生商机：<strong className="text-emerald-700 font-bold">{p.autoRecalculatedOpportunitiesCount}</strong> 个
                    </div>

                    <button
                      onClick={() => handleRecalculatePolicy(p)}
                      disabled={isRecalculating}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                      <span>{isRecalculating ? '全网电站经济模型重算中...' : '一键触发全网电站重算'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* F7: 标讯雷达抓取 */}
      {subTab === 'f7_tender' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>F7 标讯雷达 (公开招投标、扩容立项与商机触发)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                实时抓取国家公共资源交易平台、央企采购电商平台招标公告，按能力匹配度算法自动触发商机
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tenders.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-blue-700 font-semibold">{t.tenderNo}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      匹配度 {t.matchScore}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug mb-2">{t.title}</h4>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">招标人：</span>
                      <span className="text-slate-800 font-medium truncate max-w-[170px]">{t.purchaserName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">预算金额：</span>
                      <span className="text-amber-700 font-bold font-mono">¥ {(t.estimatedBudgetYuan / 10000).toLocaleString()} 万元</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">截标时间：</span>
                      <span className="text-rose-600 font-mono font-medium">{t.closingDate}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 p-2.5 rounded bg-white border border-slate-200 leading-relaxed">
                    {t.keyRequirements}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">{t.region}</span>
                  <button
                    onClick={() => {
                      onCreateCardFromTender(t);
                      showToast(`已成功将标讯「${t.title}」转化为商机卡片！`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>转商机卡片</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F9: Target List 与 ICP 评分器 */}
      {subTab === 'f9_icp' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>F9 Target List 与理想客户画像 (ICP) 评分引擎</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                根据客户资产规模 (30分)、电价敏感度 (25分)、碳目标紧迫度 (20分)、预算决策力 (25分) 输出拜访等级
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targetAccounts.map((tgt) => (
              <div key={tgt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      tgt.tierRank === 'S' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {tgt.tierRank}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{tgt.companyName}</h4>
                  </div>
                  <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-sm font-mono">
                    {tgt.totalIcpScore} 分
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  行业标签：<strong className="text-slate-800">{tgt.industry}</strong> · 关键决策人：<strong className="text-slate-900">{tgt.keyDecisionMaker}</strong>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs p-2.5 rounded-lg bg-white border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500">资产规模 (30)</div>
                    <div className="font-bold text-slate-900 mt-0.5">{tgt.scoreBreakdown.scaleScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">电价敏感 (25)</div>
                    <div className="font-bold text-slate-900 mt-0.5">{tgt.scoreBreakdown.priceSensitivityScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">碳减排 (20)</div>
                    <div className="font-bold text-slate-900 mt-0.5">{tgt.scoreBreakdown.carbonTargetScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">决策实力 (25)</div>
                    <div className="font-bold text-slate-900 mt-0.5">{tgt.scoreBreakdown.budgetDecisionScore}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <div className="text-blue-900 font-semibold mb-0.5">推荐上门拜访理由：</div>
                  <div className="text-slate-700">{tgt.recommendVisitReason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F10: 碳与绿证计算 */}
      {subTab === 'f10_carbon' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>F10 碳与绿证收益计算器 (GEC 核发与 CCER 碳资产)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                基于电站清洁放电吞吐量，自动折算可核发绿证张数 (GEC) 与碳配额交易溢价，赋能客户 ESG 申报
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {carbonAssets.map((asset) => (
              <div key={asset.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">{asset.targetName}</h4>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">年清洁绿电吞吐量</span>
                    <span className="font-mono text-slate-800">{asset.annualCleanEnergyMwh.toLocaleString()} MWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">潜在可核发绿证 (GEC)</span>
                    <span className="font-mono text-emerald-700 font-semibold">{asset.gecPotentialCertificates.toLocaleString()} 张</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-700 py-1 border-t border-b border-slate-200">
                    <span>绿证年溢价增收</span>
                    <span className="font-mono">¥ {(asset.annualGecRevenueYuan / 10000).toFixed(0)} 万元/年</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">年 CO2 减排潜力</span>
                    <span className="font-mono text-slate-800">{asset.co2ReductionTons.toLocaleString()} 吨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CCER 碳市场潜在价值</span>
                    <span className="font-mono text-emerald-700 font-semibold">¥ {(asset.ccerPotentialRevenueYuan / 10000).toFixed(0)} 万元</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-blue-700 font-medium">
                  {asset.esgRatingBoost}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
