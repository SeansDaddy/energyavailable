import React from 'react';
import { useApp } from '../../context/AppContext';
import { PcareImportRecord } from '../../types';
import {
  FileSpreadsheet,
  Clock,
  User,
  CheckCircle2,
  X,
  Layers,
  Calendar,
  AlertCircle,
  Database
} from 'lucide-react';

interface PcareImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportModal: () => void;
}

export const PcareImportHistoryModal: React.FC<PcareImportHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenImportModal
}) => {
  const { pcareImportHistory, lastPcareImportTime } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                PCare 离线报表导入台账记录与审计日志
              </h3>
              <p className="text-[11px] text-slate-400">
                最近导入更新时间: <span className="font-mono text-blue-300">{lastPcareImportTime}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">
              共保存 <strong className="text-slate-900">{pcareImportHistory.length}</strong> 次 PCare 离线报表导入操作记录
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenImportModal();
              }}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              + 导入新 PCare 报表
            </button>
          </div>

          <div className="space-y-3">
            {pcareImportHistory.map(record => (
              <div
                key={record.id}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-xs text-slate-900 font-mono">
                      {record.fileName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                      {record.batchNo}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    导入完成
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">导入时刻</span>
                    <span className="font-mono text-slate-800">{record.importTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">操作人员</span>
                    <span className="text-slate-800">{record.operator}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">解析 / 新增 / 更新</span>
                    <span className="font-semibold text-slate-900">
                      {record.totalParsedCount} 笔 ({record.addedCount}新/{record.updatedCount}改)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">方案就绪闭环 (R4)</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {record.solutionReadyCount} 笔闭环
                    </span>
                  </div>
                </div>

                {record.remarks && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 rounded p-2 border border-slate-100">
                    <strong className="text-slate-700 font-medium">批次说明：</strong>
                    {record.remarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
