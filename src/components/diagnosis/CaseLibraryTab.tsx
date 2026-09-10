import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SimilarCase } from '../../types/faultDiagnosis';
import {
  Search,
  Filter,
  Plus,
  UploadCloud,
  FileText,
  Clock,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  Activity,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { SimilarCaseDetailModal } from './SimilarCaseDetailModal';
import { CaseImportModal } from './CaseImportModal';

export const CaseLibraryTab: React.FC = () => {
  const { caseLibrary, addCaseToLibrary } = useApp();

  const [searchKey, setSearchKey] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'TRANSFERRED' | 'HISTORICAL_IMPORT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [selectedCase, setSelectedCase] = useState<SimilarCase | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Categories present in library
  const categories = Array.from(new Set(caseLibrary.map(c => c.faultCategory)));

  // Filtered cases
  const filteredCases = caseLibrary.filter(c => {
    const matchSearch =
      c.title.toLowerCase().includes(searchKey.toLowerCase()) ||
      c.siteName.toLowerCase().includes(searchKey.toLowerCase()) ||
      c.rootCause.toLowerCase().includes(searchKey.toLowerCase()) ||
      c.deviceModel.toLowerCase().includes(searchKey.toLowerCase()) ||
      c.caseNo.toLowerCase().includes(searchKey.toLowerCase());

    const matchSource = sourceFilter === 'ALL' || c.source === sourceFilter;
    const matchCategory = categoryFilter === 'ALL' || c.faultCategory === categoryFilter;

    return matchSearch && matchSource && matchCategory;
  });

  const transferredCount = caseLibrary.filter(c => c.source === 'TRANSFERRED').length;
  const importedCount = caseLibrary.filter(c => c.source === 'HISTORICAL_IMPORT').length;

  const handleBatchImportSuccess = (importedCases: SimilarCase[]) => {
    importedCases.forEach(c => addCaseToLibrary(c));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">累计收录经验案例</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {caseLibrary.length}
            <span className="text-xs font-normal text-slate-400 ml-1.5">篇</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">面向数万级场站共享复用</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">AI 诊断“转案例”沉淀</span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {transferredCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">篇</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">闭环飞轮数据占比 {((transferredCount / caseLibrary.length) * 100).toFixed(0)}%</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">线下专家历史导入</span>
          <div className="text-2xl font-black font-mono text-blue-600 mt-1">
            {importedCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">篇</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">基准知识沉淀</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-slate-400 font-medium">案例复用平均消缺提速</span>
          <div className="text-2xl font-black font-mono text-indigo-600 mt-1">
            38.5
            <span className="text-xs font-normal text-slate-400 ml-1.5">分钟</span>
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">直接减少等效 PCS 中断损失</div>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              placeholder="搜索案例标题、站点名称、部件型号、故障根因..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部案例来源</option>
            <option value="TRANSFERRED">诊断结果转案例 (自闭环)</option>
            <option value="HISTORICAL_IMPORT">线下历史案例导入</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">全部故障类型</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 shrink-0"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>批量导入历史案例 (Excel/CSV)</span>
        </button>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredCases.map(c => (
          <div
            key={c.id}
            onClick={() => setSelectedCase(c)}
            className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {c.caseNo}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.source === 'TRANSFERRED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {c.source === 'TRANSFERRED' ? '转案例沉淀' : '历史导入'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {c.faultCategory}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-indigo-600 font-bold shrink-0 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>MTTR {c.mttrMinutes}m</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition">
                {c.title}
              </h3>

              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {c.siteName}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  {c.deviceModel}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <strong className="text-slate-800">根因：</strong>{c.rootCause}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              <span>录入人: {c.createdBy} · {c.createdAt}</span>
              <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                查看案例详情 &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">未找到符合筛选条件的故障案例</p>
        </div>
      )}

      {/* Modal 1: Case Detail */}
      {selectedCase && (
        <SimilarCaseDetailModal
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}

      {/* Modal 2: Batch Import Modal */}
      {showImportModal && (
        <CaseImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleBatchImportSuccess}
        />
      )}
    </div>
  );
};
