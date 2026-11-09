import React, { useState } from 'react';
import {
  FileText,
  X,
  Download,
  Copy,
  Check,
  Building,
  Calendar,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  Printer
} from 'lucide-react';
import { ChampionOnepagerData } from '../../types/opportunityMining';

interface ChampionOnepagerModalProps {
  onepager: ChampionOnepagerData;
  onClose: () => void;
}

export const ChampionOnepagerModal: React.FC<ChampionOnepagerModalProps> = ({
  onepager,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCopyMarkdown = () => {
    const text = `# ${onepager.title}
【目标电站/客户】：${onepager.stationName}
【汇报受众角色】：${onepager.decisionRole}

## 一、30秒执行摘要
${onepager.executiveSummary}

## 二、当前核心痛点与量化损失
- 指标项：${onepager.currentPainData.metric}
- 现状实测：${onepager.currentPainData.actualValue}
- 政策/标杆对标差距：${onepager.currentPainData.gapVsStandard}
- 年化经济损失：${onepager.currentPainData.annualFinancialLoss}

## 三、推荐投资与经济效益测算
- 建议投资额：${onepager.investmentAndReturn.recommendedCapEx}
- 全投资 IRR：${onepager.investmentAndReturn.irrPct}
- 静态回收期：${onepager.investmentAndReturn.paybackYears}
- 10年累计净现金流入：${onepager.investmentAndReturn.tenYearCumulativeNetCash}

## 四、实施路线图
${onepager.implementationRoadmap.map((r, i) => `${i + 1}. ${r.phase} (${r.timeframe}): ${r.deliverable}`).join('\n')}

## 五、安全与风险兜底
${onepager.riskMitigationAndSafety.map((s, i) => `- ${s}`).join('\n')}

## 六、领导常见疑问解答 (FAQ)
${onepager.faqForLeadership.map((f, i) => `Q${i + 1}: ${f.question}\nA: ${f.answer}`).join('\n\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  F13 内线弹药库
                </span>
                <span className="text-xs text-slate-500 font-mono">{onepager.cardId}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                给领导看的一页纸立项汇报材料
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 transition-colors shadow-2xs"
              title="复制 Markdown 纯文本"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制汇报内容' : '复制全文'}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? '已导出 PDF 文档' : '导出立项 PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Body in crisp white layout */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 bg-white">
          {/* Document Title Header */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                {onepager.stationName}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                建议汇报对象：{onepager.decisionRole}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug tracking-tight">
              {onepager.title}
            </h1>
          </div>

          {/* 1. 30秒电梯摘要 */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs mb-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>30 秒决策执行摘要 (Executive Summary)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {onepager.executiveSummary}
            </p>
          </div>

          {/* 2. 痛点数据与投资回报对比网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 痛点数据卡片 */}
            <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs mb-3">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>一、不改不行：现状痛点与量化损失</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">核心监测指标</span>
                  <span className="font-medium text-slate-900">{onepager.currentPainData.metric}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">现状实测值</span>
                  <span className="font-semibold text-rose-700">{onepager.currentPainData.actualValue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-600">政策/行业准入标杆</span>
                  <span className="text-slate-700">{onepager.currentPainData.gapVsStandard}</span>
                </div>
                <div className="flex justify-between py-1.5 bg-rose-100/70 px-2 rounded-md">
                  <span className="text-rose-900 font-medium">年化直接经济损失</span>
                  <span className="font-bold text-rose-700 font-mono">{onepager.currentPainData.annualFinancialLoss}</span>
                </div>
              </div>
            </div>

            {/* 投资与回报量化卡片 */}
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs mb-3">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>二、投产算账：投资预算与预期收益</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">建议总投资额 (CapEx)</span>
                  <span className="font-semibold text-slate-900">{onepager.investmentAndReturn.recommendedCapEx}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">全投资内部收益率 (IRR)</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">{onepager.investmentAndReturn.irrPct}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-600">静态投资回收期</span>
                  <span className="font-semibold text-slate-800">{onepager.investmentAndReturn.paybackYears}</span>
                </div>
                <div className="flex justify-between py-1.5 bg-emerald-100/70 px-2 rounded-md">
                  <span className="text-emerald-900 font-medium">10年累计净现金流</span>
                  <span className="font-bold text-emerald-700 font-mono">{onepager.investmentAndReturn.tenYearCumulativeNetCash}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 实施路线图 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>三、落地周期与阶段性交付物</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {onepager.implementationRoadmap.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-blue-700">阶段 {idx + 1}</span>
                      <span className="text-slate-500">{item.timeframe}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mb-1.5">{item.phase}</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.deliverable}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 安全与风险保证 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-800 mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>四、安全合规与风险兜底承诺 (打消领导顾虑)</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {onepager.riskMitigationAndSafety.map((sec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{sec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. 领导常见提问对策 (FAQ) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-800 mb-2.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>五、会前预演：领导可能会问的刁钻问题与应答口径</span>
            </h4>
            <div className="space-y-2.5">
              {onepager.faqForLeadership.map((faq, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                  <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">Q{idx + 1}</span>
                    {faq.question}
                  </div>
                  <div className="text-slate-700 pl-4 border-l-2 border-amber-300 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            PRD-ENGY-2026-001 · V3.0 行为闭环与生态输出 · 内线一页纸报告模板
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium transition-colors shadow-2xs"
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
};
