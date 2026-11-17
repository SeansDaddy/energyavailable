import React, { useState, useEffect, useRef } from 'react';
import { Site, ImportBatch } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileArchive,
  Info,
  CheckCircle2,
  RefreshCw,
  Database,
  FolderOpen,
  Activity,
  ArrowLeft,
  X,
  Plus,
  Check
} from 'lucide-react';

interface LogBatchesTabProps {
  site: Site;
  batches: ImportBatch[];
  onNavigateTab: (tabIdx: number) => void;
  openLogPickerTrigger?: number;
}

export const LogBatchesTab: React.FC<LogBatchesTabProps> = ({
  site,
  batches,
  openLogPickerTrigger = 0
}) => {
  const {
    startLogImportTask,
    navigateToAvailabilityDrilldown,
    logImportOriginTab,
    setLogImportOriginTab
  } = useApp();

  // Filter batches (including active import tasks) for this site
  const siteBatches = batches.filter(
    b => b.siteId === site.id || b.siteName === site.siteName || b.siteCode === site.siteCode
  );
  const activeTaskCount = siteBatches.filter(b => b.status === 'PARSING').length;

  // Log Picker Dialog state
  const safeCode = site.siteCode.replace(/[^A-Za-z0-9_-]/g, '_');
  const presetLogFiles = [
    {
      name: `${safeCode}_INC_LOG_20260820.zip`,
      size: '48.6 MB',
      desc: '增量运行与告警报文压缩包（自动识别时间范围）'
    },
    {
      name: `${safeCode}_FULL_LOG_202608.tar.gz`,
      size: '126.4 MB',
      desc: '全量设备 5 分钟打点与 PCS 故障录波归档包'
    },
    {
      name: `${safeCode}_PATCH_RECOVER.zip`,
      size: '19.2 MB',
      desc: '离线断供时段补采恢复日志包'
    }
  ];

  const [showLogPicker, setShowLogPicker] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>(presetLogFiles[0].name);
  const [selectedFileSize, setSelectedFileSize] = useState<string>(presetLogFiles[0].size);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync default file name when switching sites
  useEffect(() => {
    setSelectedFileName(`${site.siteCode.replace(/[^A-Za-z0-9_-]/g, '_')}_INC_LOG_20260820.zip`);
    setSelectedFileSize('48.6 MB');
    setShowLogPicker(false);
  }, [site.id, site.siteCode]);

  // Open log picker automatically if triggered from SiteDetailView header button
  useEffect(() => {
    if (openLogPickerTrigger > 0) {
      setShowLogPicker(true);
    }
  }, [openLogPickerTrigger]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const applyLocalFile = (file: File) => {
    setSelectedFileName(file.name);
    setSelectedFileSize(formatFileSize(file.size));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      applyLocalFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      applyLocalFile(file);
    }
  };

  const handleCreateImportTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileName.trim()) return;
    startLogImportTask(site.id, selectedFileName.trim(), selectedFileSize);
    setShowLogPicker(false);
  };

  const renderTaskStatusAndProgress = (b: ImportBatch) => {
    if (b.status === 'PARSING') {
      const pct = b.progress ?? 35;
      return (
        <div className="space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700">
              <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
              <span>{b.progressLabel || '正在解析导入'}</span>
            </span>
            <span className="font-mono tabular-nums font-bold text-blue-700">{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    }

    if (b.status === 'FAILED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
          导入失败
        </span>
      );
    }

    const isActive = Boolean(b.isLatestWinning);
    return (
      <div className="flex flex-col items-end gap-1">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
          <span>{isActive ? '当前生效 (Latest-Wins · 100%)' : '已被新批次替代 (100%)'}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Return banner when navigated from Availability Monitor */}
      {logImportOriginTab === 'availability_drilldown' && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              已定位至站点 <strong className="font-semibold">{site.siteName}</strong> 的离线日志批次查看与导入页签，可点击右侧「导入离线日志」选择日志包创建任务。
            </span>
          </div>
          <button
            onClick={() => {
              setLogImportOriginTab(null);
              navigateToAvailabilityDrilldown(site.id, 0);
            }}
            className="px-3 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 rounded font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回单站可用度监控</span>
          </button>
        </div>
      )}

      {/* Rule R3 Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 leading-relaxed">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-blue-900 font-semibold">
              离线日志导入与 Latest-Wins 溯源规则 (Rule R3)：
            </strong>
            点击「导入离线日志」弹出日志选择框并确认后，将在下方离线日志导入列表中创建任务并实时展示导入状态与进度；完成后自动执行最新批次覆盖生效并刷新站点可用度。
          </div>
        </div>
        <button
          id="btn-open-log-picker"
          onClick={() => setShowLogPicker(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>导入离线日志</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
          <span className="text-slate-500 font-medium">离线日志导入批次</span>
          <div className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-1 flex items-baseline gap-2">
            <span>{siteBatches.length}</span>
            <span className="text-xs text-slate-400 font-normal">批</span>
            {activeTaskCount > 0 && (
              <span className="text-[11px] font-semibold text-blue-600">
                · {activeTaskCount} 个任务执行中
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">含正在上传解析的任务与历史批次</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
          <span className="text-slate-500 font-medium">当前数据覆盖率</span>
          <div className="text-2xl font-black font-mono tabular-nums text-blue-600 mt-1">
            {site.dataCoverage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {site.dataCoverage >= 100 ? '无严重断流缺数' : `存在 ${site.dataStarvedDays} 天缺数，建议导入补采`}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs">
          <span className="text-slate-500 font-medium">最后一次日志更新</span>
          <div className="text-sm font-bold font-mono tabular-nums text-slate-900 mt-2">
            {site.lastImportTime}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">解析服务校验通过</div>
        </div>
      </div>

      {/* Offline Log Import & Batch History List */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span>离线日志导入任务与历史批次列表 (Latest-Wins 版本追溯)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              实时跟踪当前站点新建的离线日志导入任务状态、进度条及历史归档批次
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTaskCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold whitespace-nowrap">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{activeTaskCount} 个任务处理中</span>
              </span>
            )}
            <button
              onClick={() => setShowLogPicker(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>选择日志包导入</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">任务 ID</th>
                <th className="py-3 px-3">文件名称</th>
                <th className="py-3 px-3">操作人</th>
                <th className="py-3 px-3">导入时间</th>
                <th className="py-3 px-4 text-right">状态与进度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siteBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    暂无离线日志导入任务或历史批次，点击右上角「导入离线日志」选择日志包创建导入任务。
                  </td>
                </tr>
              ) : (
                siteBatches.map((b, idx) => {
                  const isParsing = b.status === 'PARSING';
                  return (
                    <tr
                      key={b.id || idx}
                      className={`transition-colors ${
                        isParsing ? 'bg-blue-50/40' : 'hover:bg-blue-50/30'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono tabular-nums text-blue-600 font-semibold whitespace-nowrap">
                        {b.batchNo}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900">
                          {b.fileName}
                          {b.fileSize && (
                            <span className="ml-1.5 text-[11px] font-mono text-slate-400 font-normal">
                              ({b.fileSize})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {b.operator}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono tabular-nums text-[11px] whitespace-nowrap">
                        {b.importTime}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end">
                          {renderTaskStatusAndProgress(b)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* Log Selection Modal (日志选择框：选择本地日志包或快捷包并创建导入任务)  */}
      {/* ===================================================================== */}
      {showLogPicker && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95 text-slate-800">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">选择离线运行日志包</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    目标站点：<strong className="text-slate-800">{site.siteName}</strong> ({site.siteCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogPicker(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateImportTask} className="pt-4 space-y-4 text-xs">
              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.tar.gz,.tgz,.gz,.log,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Local File Picker / Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all group ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/70'
                    : 'border-blue-200 hover:border-blue-500 bg-blue-50/25 hover:bg-blue-50/45'
                }`}
              >
                <FileArchive className="w-9 h-9 mx-auto text-blue-600 mb-2 group-hover:scale-105 transition-transform" />
                <div className="text-sm font-bold text-slate-900">
                  点击浏览本地日志包，或拖拽文件到此处
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  支持 .zip / .tar.gz / .log / .csv 格式，提交后在列表中创建任务并自动执行导入
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-blue-200 text-blue-700 font-semibold shadow-2xs">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>打开本地文件选择框</span>
                </div>
              </div>

              {/* Quick-select site log packages */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-700">
                  或快捷选择站点导出的就绪日志包：
                </div>
                <div className="space-y-1.5">
                  {presetLogFiles.map(item => {
                    const isPicked = selectedFileName === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setSelectedFileName(item.name);
                          setSelectedFileSize(item.size);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                          isPicked
                            ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-mono font-semibold text-slate-900 truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[11px] text-slate-500">{item.size}</span>
                          {isPicked && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Summary */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                <span className="text-slate-600">当前已选日志包：</span>
                <span className="font-mono font-bold text-blue-700 truncate">
                  {selectedFileName} ({selectedFileSize})
                </span>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLogPicker(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  取消
                </button>
                <button
                  id="btn-confirm-create-log-task"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>创建导入任务</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
