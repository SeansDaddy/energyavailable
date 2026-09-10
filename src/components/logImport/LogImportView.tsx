import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Layers,
  History,
  FileText,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

export const LogImportView: React.FC = () => {
  const { sites, batches, selectedSiteId, importLogBatch, navigateToSiteDetail } = useApp();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [targetSiteId, setTargetSiteId] = useState<string>(selectedSiteId || sites[0].id);
  const [fileName, setFileName] = useState<string>('SZ_GM_ESS04_LOG_20260801_0820.zip');
  const [fileSize, setFileSize] = useState<string>('48.6 MB');
  const [periodStart, setPeriodStart] = useState<string>('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2026-08-20');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [lastCreatedBatchNo, setLastCreatedBatchNo] = useState<string>('');

  const targetSite = sites.find(s => s.id === targetSiteId) || sites[0];

  // Check if there are overlapping batches for this site
  const existingBatchesForSite = batches.filter(b => b.siteId === targetSite.id);

  const handleStartParsing = () => {
    setCurrentStep(2);
  };

  const handleConfirmImport = () => {
    setCurrentStep(3);
    setIsProcessing(true);
    setProgressVal(10);

    const interval = setInterval(() => {
      setProgressVal(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          const newBatch = importLogBatch(
            targetSite.id,
            fileName,
            `${periodStart} 00:00`,
            `${periodEnd} 23:59`,
            true
          );
          setLastCreatedBatchNo(newBatch.batchNo);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleResetWizard = () => {
    setCurrentStep(1);
    setProgressVal(0);
    setIsProcessing(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              离线运行日志导入与批次管理
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              Rule R3: Latest-Wins
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持从站点管理平台导出的 zip 压缩日志包手工导入。同站点同时段数据以最新批次覆盖参与可用度计算，旧批次永久留档追溯。
          </p>
        </div>
      </div>

      {/* 3-Step Wizard Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        {/* Step Indicators */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              1
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2">1. 上传日志包</span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 2
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              2
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2">2. 解析与覆盖校验</span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                currentStep >= 3
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              3
            </div>
            <span className="text-xs font-semibold text-slate-800 mt-2">3. 确认并即时重算</span>
          </div>
        </div>

        {/* Step 1 Content: Upload Form */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  目标导入能源站点 <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetSiteId}
                  onChange={e => setTargetSiteId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} ({s.siteCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">日志覆盖考核时段</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={periodStart}
                    onChange={e => setPeriodStart(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={e => setPeriodEnd(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-lg p-8 text-center bg-blue-50/30 hover:bg-blue-50/50 cursor-pointer transition-all group">
              <FileArchive className="w-12 h-12 mx-auto text-blue-600 mb-2 group-hover:scale-105 transition-transform" />
              <div className="text-sm font-bold text-slate-900">点击或拖拽上传站点离线运行日志包</div>
              <div className="text-slate-500 text-xs mt-1">
                支持 .zip / .tar.gz 压缩包格式，系统将自动调用解析微服务提取事件
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[11px] shadow-sm">
                <span>已就绪文件: {fileName} ({fileSize})</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded border border-slate-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-900">无人工审核机制 (ADR-0002)：</strong>
                文件完成格式完整性校验与站点匹配后将直接进入解析并参与计算。请确保导入文件来源于正规管理平台导出的标准日志。
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="btn-step1-next"
                onClick={handleStartParsing}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm flex items-center gap-2"
              >
                <span>下一步: 解析与覆盖校验</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 Content: Parsing Preview & Override Notice */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in text-xs">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-blue-900">日志解析微服务校验通过</div>
                <div className="text-blue-700 text-[11px] mt-0.5">
                  成功解析出 142 条原始设备状态与事件记录，涉及 8 台核心设备
                </div>
              </div>
            </div>

            {/* Overlap & Latest-Wins Alert */}
            {existingBatchesForSite.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>同时段覆盖提醒 (Rule R3: Latest-Wins)</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  检测到该站点此前已存在导入批次 ({existingBatchesForSite[0].batchNo}) 覆盖部分相同时段。确认导入后，旧批次将被标记为【已被替代】，最新批次将覆盖参与本月可用度计算；历史旧批次将永久留档以供追溯。
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded border border-slate-200 p-4 space-y-3">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                解析结果快照
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500">目标站点:</span>{' '}
                  <span className="text-slate-900 font-semibold">{targetSite.siteName}</span>
                </div>
                <div>
                  <span className="text-slate-500">覆盖时段:</span>{' '}
                  <span className="text-slate-900 font-mono">
                    {periodStart} ~ {periodEnd}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">提取等效 PCS 中断:</span>{' '}
                  <span className="text-red-600 font-bold font-mono">596 分钟</span>
                </div>
                <div>
                  <span className="text-slate-500">计划内维护时长:</span>{' '}
                  <span className="text-emerald-600 font-mono">120 分钟 (不扣减)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded"
              >
                返回上一步
              </button>
              <button
                id="btn-step2-confirm"
                onClick={handleConfirmImport}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm flex items-center gap-2"
              >
                <span>确认导入并触发重算</span>
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 Content: Instant Recalculation & Finish */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in text-center py-4">
            {isProcessing ? (
              <div className="space-y-4">
                <RefreshCw className="w-10 h-10 text-blue-600 mx-auto animate-spin" />
                <div className="text-base font-bold text-slate-900">正在写入批次并触发站点可用度重算...</div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 max-w-md mx-auto">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${progressVal}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 font-mono">规则引擎计算中 {progressVal}%</div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">离线日志导入成功，监控数据已即时修正！</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    新批次 <span className="text-blue-600 font-mono font-semibold">{lastCreatedBatchNo}</span> 已生效参与计算，该站点数据覆盖率已更新为 100%。
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetWizard}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                  >
                    继续导入其他批次
                  </button>
                  <button
                    onClick={() => navigateToSiteDetail(targetSite.id)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <span>查看该站点详情</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batches Archive Table (Permanent Traceability) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">全网导入批次留档历史 (永久留痕可查)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">共 {batches.length} 个批次</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">批次号 / 文件名</th>
                <th className="py-3 px-3">对应站点</th>
                <th className="py-3 px-3">覆盖考核时段</th>
                <th className="py-3 px-3">导入时间</th>
                <th className="py-3 px-3">计算生效状态 (R3)</th>
                <th className="py-3 px-3">等效中断时长</th>
                <th className="py-3 px-3">操作人</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map(b => (
                <tr key={b.id} className="hover:bg-blue-50/40">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 font-mono">{b.batchNo}</div>
                    <div className="text-[11px] text-slate-500">{b.fileName} ({b.fileSize})</div>
                  </td>
                  <td className="py-3 px-3 text-slate-900 font-semibold">{b.siteName}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {b.periodStart ? b.periodStart.slice(0, 10) : '-'} ~ {b.periodEnd ? b.periodEnd.slice(0, 10) : '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{b.importTime}</td>
                  <td className="py-3 px-3">
                    {b.isLatestWinning ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        🟢 最新生效 (参与计算)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        ⚪ 已被替代 (留档可查)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-red-600">
                    {b.equivalentInterruptionMinutes} 分钟
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{b.operator}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigateToSiteDetail(b.siteId, 4)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                    >
                      溯源
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
