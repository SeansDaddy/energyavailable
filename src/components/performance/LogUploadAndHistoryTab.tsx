import React, { useState, useRef } from 'react';
import { PerformanceHistoryRecord, PerformanceFactor } from '../../types/performanceEvaluation';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileText,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Eye,
  FileSpreadsheet,
  Download,
  Layers,
  Sparkles,
  Calendar,
  User,
  Sliders,
  Check,
  ChevronRight,
  GitCompare
} from 'lucide-react';

interface LogUploadAndHistoryTabProps {
  currentSiteId: string;
  currentSiteName: string;
  historyRecords: PerformanceHistoryRecord[];
  activeVersionId: string;
  onSelectVersion: (record: PerformanceHistoryRecord) => void;
  onUploadAndEvaluate: (newRecord: PerformanceHistoryRecord) => void;
}

export const LogUploadAndHistoryTab: React.FC<LogUploadAndHistoryTabProps> = ({
  currentSiteId,
  currentSiteName,
  historyRecords,
  activeVersionId,
  onSelectVersion,
  onUploadAndEvaluate
}) => {
  const { batches, currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logType, setLogType] = useState<string>('FULL_PACKAGE');
  const [periodStart, setPeriodStart] = useState<string>('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2026-08-20');
  const [evalNotes, setEvalNotes] = useState<string>('定期半月度站点系统级性能体检与短板模组健康度普查');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStepText, setUploadStepText] = useState<string>('');
  const [isSuccessAlert, setIsSuccessAlert] = useState<boolean>(false);

  // Compare modal or drawer state
  const [comparingRecord, setComparingRecord] = useState<PerformanceHistoryRecord | null>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Quick select existing batch
  const handleSelectExistingBatch = (batch: typeof batches[0]) => {
    setPeriodStart(batch.periodStart);
    setPeriodEnd(batch.periodEnd);
    setEvalNotes(`基于已归档日志批次【${batch.fileName}】重新驱动性能体检模型测算`);
  };

  // Trigger evaluation
  const handleStartUploadAndEvaluate = () => {
    setIsUploading(true);
    setUploadProgress(15);
    setUploadStepText('正在校验日志校验和与时钟同步序列...');

    setTimeout(() => {
      setUploadProgress(45);
      setUploadStepText('解压 BMS 模组电压电流、CMU 测点数据及 PCS 能效日志...');
    }, 500);

    setTimeout(() => {
      setUploadProgress(78);
      setUploadStepText('运行 13 类性能影响因子理论框架与短板木桶定位测算...');
    }, 1100);

    setTimeout(() => {
      setUploadProgress(100);
      setUploadStepText('性能体检完成！生成健康评分与分级优化建议...');

      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const versionNum = historyRecords.length + 1;
      const fileName = selectedFile
        ? selectedFile.name
        : `${currentSiteId.toUpperCase()}_PERF_LOGS_${periodStart.replace(/-/g, '')}_${periodEnd.replace(/-/g, '')}.tar.gz`;
      const fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '46.8 MB';

      const newRecord: PerformanceHistoryRecord = {
        id: `eval-hist-${Date.now()}`,
        siteId: currentSiteId,
        evaluatedAt: timeStr,
        versionNo: `REV-${periodEnd.replace(/-/g, '')}-0${versionNum}`,
        logFileName: fileName,
        logFileSize: fileSize,
        logPeriod: `${periodStart} ~ ${periodEnd}`,
        overallScore: 84.0,
        grade: 'GOOD',
        gradeLabel: '良好 (最新日志解析完成)',
        hitFactorsCount: 4,
        hitFactorNames: ['模组电压极差', 'CMU电芯局部高温', '热管理温差超标', '电站初始容量配置偏紧'],
        evaluator: `${currentUser.name} (${currentUser.roleTitle})`,
        summary: `最新上传日志覆盖 ${periodStart} 至 ${periodEnd}。模组压差从 68mV 略微收敛至 62mV，CMU 最高温 37.8℃，综合健康评分提升至 84.0分。`,
        factors: historyRecords[0].factors,
        advicesCount: 4
      };

      onUploadAndEvaluate(newRecord);
      setIsUploading(false);
      setSelectedFile(null);
      setIsSuccessAlert(true);
      setTimeout(() => setIsSuccessAlert(false), 5000);
    }, 1800);
  };

  const activeRecord = historyRecords.find(r => r.id === activeVersionId) || historyRecords[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">运行日志上传与历史评估分析结果</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              数据驱动 · 多版本追溯
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            支持针对 <strong>{currentSiteName}</strong> 上传最新运行日志驱动性能评估分析；同时完整沉淀历史各批次体检报告，支持一键回溯对比历史版本的性能得分与影响因子变化。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-600 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>历史评估记录: </span>
            <strong className="text-slate-900 font-mono font-bold">{historyRecords.length} 次</strong>
          </div>
        </div>
      </div>

      {isSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">日志上传解析与性能评估完成！</div>
            <div className="text-emerald-700 mt-0.5">
              已基于最新日志测算出系统级性能体检画像（综合得分 84.0 分），并作为当前最新生效版本载入各分析视图。
            </div>
          </div>
        </div>
      )}

      {/* Grid: Left is Upload Box, Right is Active Version Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">上传站点运行日志触发性能分析</h3>
            </div>
            <span className="text-[11px] text-slate-400">支持格式: .zip, .tar.gz, .csv, .log (最大 200MB)</span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              selectedFile
                ? 'border-blue-500 bg-blue-50/40'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".zip,.tar.gz,.csv,.log,.txt"
            />
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
              <UploadCloud className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="text-xs font-bold text-blue-700 font-mono">{selectedFile.name}</div>
                <div className="text-[11px] text-slate-500">
                  文件大小: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · 点击可更换文件
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700">拖拽运行日志文件到此处，或点击浏览本地文件</div>
                <div className="text-[11px] text-slate-400">
                  包含 BMS 模组电压电流、CMU 温度探头、PCS 功率转换或调度 EMS 交互日志
                </div>
              </div>
            )}
          </div>

          {/* Form Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">日志数据类型</label>
              <select
                value={logType}
                onChange={e => setLogType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="FULL_PACKAGE">全系统打包日志 (BMS+PCS+CMU+EMS)</option>
                <option value="BMS_ONLY">BMS 电芯模组电压与SOH日志</option>
                <option value="CMU_TEMP">CMU 温度与液冷工况数据</option>
                <option value="PCS_EFFICIENCY">PCS 变流与电网充放能效数据</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">分析开始时间</label>
              <input
                type="date"
                value={periodStart}
                onChange={e => setPeriodStart(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1 text-[11px]">分析结束时间</label>
              <input
                type="date"
                value={periodEnd}
                onChange={e => setPeriodEnd(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1 text-[11px]">评估背景与备注说明</label>
            <input
              type="text"
              value={evalNotes}
              onChange={e => setEvalNotes(e.target.value)}
              placeholder="输入本次性能体检任务的评估目的或工况特征..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
            />
          </div>

          {/* Quick Select from existing batches */}
          {batches.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">或选用已同步批次:</span>
              {batches.slice(0, 3).map(b => (
                <button
                  key={b.id}
                  onClick={() => handleSelectExistingBatch(b)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-mono transition"
                >
                  {b.fileName.slice(0, 24)}...
                </button>
              ))}
            </div>
          )}

          {/* Upload Progress Display */}
          {isUploading && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>{uploadStepText}</span>
                </span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleStartUploadAndEvaluate}
              disabled={isUploading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-blue-500/20"
            >
              {isUploading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>正在解析日志测算中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>开始日志解析与性能评估</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Active Version Snapshot (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">当前各视图生效评估版本</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                生效中
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400">评估版本号</span>
                <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {activeRecord.versionNo}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400">综合健康得分</span>
                  <div className="text-xl font-black text-blue-600 font-mono mt-0.5">
                    {activeRecord.overallScore} <span className="text-xs font-normal text-slate-400">分</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">命中因子数</span>
                  <div className="text-xl font-black text-rose-600 font-mono mt-0.5">
                    {activeRecord.hitFactorsCount} <span className="text-xs font-normal text-slate-400">项</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">关联驱动日志文件</span>
                <div className="font-mono text-[11px] font-semibold text-slate-700 truncate mt-0.5" title={activeRecord.logFileName}>
                  {activeRecord.logFileName} ({activeRecord.logFileSize})
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">日志覆盖时段</span>
                <div className="font-mono text-[11px] text-slate-600 mt-0.5">
                  {activeRecord.logPeriod}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">评估人员 / 来源</span>
                <div className="text-[11px] text-slate-700 mt-0.5">
                  {activeRecord.evaluator} · {activeRecord.evaluatedAt}
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-slate-600 leading-relaxed">
                <strong>版本概要：</strong>{activeRecord.summary}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            * 在下方列表中点击“切换查看”可回溯其他历史版本的体检详情。
          </div>
        </div>
      </div>

      {/* History Evaluation Records List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">历史评估分析结果追溯清单 ({historyRecords.length} 轮评估记录)</h3>
          </div>
          <span className="text-xs text-slate-400">可切换历史版本并支持指标版本对比</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">评估版本号</th>
                <th className="py-3 px-3">评估时间</th>
                <th className="py-3 px-3 font-mono">驱动日志文件</th>
                <th className="py-3 px-3">覆盖分析周期</th>
                <th className="py-3 px-3 font-mono text-center">综合体检得分</th>
                <th className="py-3 px-3">健康等级</th>
                <th className="py-3 px-3">命中异常影响因子</th>
                <th className="py-3 px-3">评估人</th>
                <th className="py-3 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyRecords.map(record => {
                const isActive = record.id === activeVersionId;
                return (
                  <tr
                    key={record.id}
                    className={`transition-colors ${
                      isActive ? 'bg-blue-50/40 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 font-mono">{record.versionNo}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white">
                            当前视图
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                      {record.evaluatedAt}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-700 max-w-xs truncate" title={record.logFileName}>
                      <div>{record.logFileName}</div>
                      <span className="text-[10px] text-slate-400">{record.logFileSize}</span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      {record.logPeriod}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-center">
                      <span
                        className={`text-sm font-black ${
                          record.overallScore >= 90
                            ? 'text-emerald-600'
                            : record.overallScore >= 80
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {record.overallScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.grade === 'EXCELLENT'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : record.grade === 'GOOD'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {record.gradeLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {record.hitFactorNames.slice(0, 3).map((fName, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {fName}
                          </span>
                        ))}
                        {record.hitFactorNames.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            +{record.hitFactorNames.length - 3}项
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                      {record.evaluator}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isActive ? (
                          <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            正在查看
                          </span>
                        ) : (
                          <button
                            onClick={() => onSelectVersion(record)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold transition"
                          >
                            切换载入
                          </button>
                        )}

                        <button
                          onClick={() => setComparingRecord(record)}
                          className="px-2 py-1 text-slate-500 hover:text-blue-600 rounded text-xs font-medium transition flex items-center gap-1"
                          title="与最新版本对比"
                        >
                          <GitCompare className="w-3 h-3" />
                          <span>对比</span>
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

      {/* Comparison Drawer / Modal */}
      {comparingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">
                  性能评估版本对比: {comparingRecord.versionNo} vs 最新版本
                </h3>
              </div>
              <button
                onClick={() => setComparingRecord(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                关闭
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-700 text-sm">{comparingRecord.versionNo}</div>
                  <div className="text-slate-500 text-[11px]">评估时间: {comparingRecord.evaluatedAt}</div>
                  <div className="text-slate-500 text-[11px]">日志: {comparingRecord.logFileName}</div>
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px]">综合健康得分:</span>
                    <div className="text-2xl font-black text-slate-800 font-mono mt-0.5">
                      {comparingRecord.overallScore} 分
                    </div>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    命中因子: {comparingRecord.hitFactorsCount} 项
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                  <div className="font-bold text-blue-900 text-sm">最新版本 (当前视图)</div>
                  <div className="text-slate-500 text-[11px]">评估时间: {historyRecords[0].evaluatedAt}</div>
                  <div className="text-slate-500 text-[11px]">日志: {historyRecords[0].logFileName}</div>
                  <div className="pt-2">
                    <span className="text-slate-400 text-[11px]">综合健康得分:</span>
                    <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">
                      {historyRecords[0].overallScore} 分
                    </div>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    命中因子: {historyRecords[0].hitFactorsCount} 项
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">关键演变差异分析：</div>
                <ul className="space-y-1 text-slate-600 text-[11px] list-disc pl-4">
                  <li>
                    健康评分变动：从 <strong>{comparingRecord.overallScore}</strong> 分变为 <strong>{historyRecords[0].overallScore}</strong> 分 (差异 {Number((historyRecords[0].overallScore - comparingRecord.overallScore).toFixed(1))} 分)
                  </li>
                  <li>
                    影响因子变动：历史命中 {comparingRecord.hitFactorsCount} 项，最新命中 {historyRecords[0].hitFactorsCount} 项
                  </li>
                  <li>
                    日志时段跨度：由 <code>{comparingRecord.logPeriod}</code> 推进到 <code>{historyRecords[0].logPeriod}</code>
                  </li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400">历史评估结果版本追溯</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectVersion(comparingRecord);
                    setComparingRecord(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                >
                  载入并查看该版本体检详情
                </button>
                <button
                  onClick={() => setComparingRecord(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
