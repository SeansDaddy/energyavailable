import React from 'react';
import { Site, ImportBatch } from '../../types';
import {
  UploadCloud,
  Info,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

interface LogBatchesTabProps {
  site: Site;
  batches: ImportBatch[];
  onNavigateTab: (tabIdx: number) => void;
}

export const LogBatchesTab: React.FC<LogBatchesTabProps> = ({ site, batches, onNavigateTab }) => {
  // Filter batches for this site
  const siteBatches = batches.filter(
    b => b.siteId === site.id || b.siteName === site.siteName || b.siteCode === site.siteCode
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Rule R3 Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-900 font-semibold">
            离线日志覆盖与 Latest-Wins 溯源规则 (Rule R3)：
          </strong>
          当重复导入覆盖相同时间段的离线运行日志时，系统严格执行<strong>最新导入覆盖生效（Latest-Wins）</strong>原则。被替代的历史批次仍保留审计日志，状态标记为【已替代】，重算引擎自动基于最新批次生成等效中断与可用度打点。
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">累计导入日志批次</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {siteBatches.length} <span className="text-xs text-slate-400 font-normal">批</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">近 30 天日志连续解析</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">当前数据覆盖率</span>
          <div className="text-2xl font-black font-mono text-blue-600 mt-1">
            {site.dataCoverage}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">无严重断流缺数</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <span className="text-slate-500 font-medium">最后一次日志更新</span>
          <div className="text-sm font-bold font-mono text-slate-900 mt-2">
            {site.lastImportTime}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">解析服务校验通过</div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              离线日志导入历史批次台账 (Latest-Wins 版本追溯)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              记录每次手工/自动化上传的离线日志文件及覆盖时段
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">批次号 / 文件名</th>
                <th className="py-3 px-3">覆盖起止时段</th>
                <th className="py-3 px-3">解析记录行数</th>
                <th className="py-3 px-3">提取中断事件</th>
                <th className="py-3 px-3">操作人</th>
                <th className="py-3 px-3">导入时刻</th>
                <th className="py-3 px-4 text-right">Latest-Wins 状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siteBatches.map((b, idx) => (
                <tr key={b.id || idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{b.fileName}</div>
                    <div className="text-[11px] text-blue-600 font-mono">{b.batchNo}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {b.periodStart} ~ {b.periodEnd}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-800">
                    {b.recordsCount.toLocaleString()} 行
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-800">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      {b.faultEventsExtracted} 场
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{b.operator}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {b.importTime}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'SUCCESS_ACTIVE' || idx === 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {b.status === 'SUCCESS_ACTIVE' || idx === 0
                        ? '🟢 当前生效 (Latest-Wins)'
                        : '⚪ 已被新批次替代'}
                    </span>
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
