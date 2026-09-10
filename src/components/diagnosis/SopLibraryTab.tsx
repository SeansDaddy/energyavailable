import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SopItem } from '../../types/faultDiagnosis';
import {
  Search,
  Plus,
  Edit3,
  BookOpen,
  Wrench,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Layers,
  History,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { SopEditorModal } from './SopEditorModal';

export const SopLibraryTab: React.FC = () => {
  const { sopLibrary, addSopToLibrary, updateSopInLibrary } = useApp();

  const [searchKey, setSearchKey] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editorSop, setEditorSop] = useState<SopItem | null | 'NEW'>(null);

  // Accordion open states
  const [expandedSops, setExpandedSops] = useState<Record<string, boolean>>({
    'sop-001': true
  });

  const toggleExpand = (id: string) => {
    setExpandedSops(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ['ALL', 'PCS 变流器', 'BMS 电池簇', '液冷温控系统', 'EMS 通信系统'];

  const filteredSops = sopLibrary.filter(sop => {
    const matchSearch =
      sop.title.toLowerCase().includes(searchKey.toLowerCase()) ||
      sop.sopCode.toLowerCase().includes(searchKey.toLowerCase()) ||
      sop.faultCategory.toLowerCase().includes(searchKey.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || sop.equipmentCategory === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleSaveSop = (savedSop: SopItem) => {
    if (sopLibrary.some(s => s.id === savedSop.id)) {
      updateSopInLibrary(savedSop.id, savedSop);
    } else {
      addSopToLibrary(savedSop);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              标准作业程序库 (SOP)
            </span>
            <h2 className="text-lg font-black text-slate-900">储能专业服务标准化处理方案库</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            由专业技术服务团队统一编写与版本审定，驱动 AI 诊断结果一键智能匹配与现场合规消缺
          </p>
        </div>

        <button
          onClick={() => setEditorSop('NEW')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>新建 SOP 规程</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'ALL' ? '全部子系统' : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchKey}
            onChange={e => setSearchKey(e.target.value)}
            placeholder="搜索 SOP 编码、方案名称、故障分类..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* SOP List */}
      <div className="space-y-3">
        {filteredSops.map(sop => {
          const isExpanded = expandedSops[sop.id] || false;
          return (
            <div
              key={sop.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-emerald-300 transition"
            >
              {/* Header */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div
                  onClick={() => toggleExpand(sop.id)}
                  className="cursor-pointer flex items-center gap-3 flex-1"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sop.sopCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-emerald-700">
                        {sop.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        {sop.version}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {sop.equipmentCategory}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        标准耗时: <strong className="text-slate-700">{sop.estimatedDuration}</strong>
                      </span>
                      <span>·</span>
                      <span>责任人: {sop.author}</span>
                      <span>·</span>
                      <span>更新时间: {sop.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setEditorSop(sop)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>编辑 / 升版</span>
                  </button>
                  <button
                    onClick={() => toggleExpand(sop.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detail Body */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 space-y-4 text-xs bg-white">
                  {/* Tools & Parts & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-slate-500">所需检测工器具：</span>
                      <div className="text-slate-800 leading-relaxed font-medium">
                        {sop.requiredTools.join('、')}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-slate-500">关键备品备件储备：</span>
                      <div className="text-slate-800 leading-relaxed font-medium">
                        {sop.requiredParts.join('、')}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-amber-900">
                      <div className="font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>安全红线与规程注意：</span>
                      </div>
                      <div className="text-[11px] leading-relaxed">
                        {sop.riskWarnings.map((w, i) => (
                          <div key={i}>• {w}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Steps Checklist */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 text-xs block">
                      标准化作业消缺步骤 ({sop.steps.length} 步):
                    </span>
                    <div className="space-y-2">
                      {sop.steps.map(s => (
                        <div
                          key={s.stepNumber}
                          className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1 hover:bg-emerald-50/20 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                                {s.stepNumber}
                              </span>
                              <span>{s.title}</span>
                            </div>
                            {s.keyParams && (
                              <span className="text-emerald-700 font-mono font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {s.keyParams}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-xs pl-7 leading-relaxed">{s.description}</p>
                          {s.safetyWarning && (
                            <div className="pl-7 text-[11px] text-amber-700 font-medium">
                              ⚠️ 安全规程: {s.safetyWarning}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Version Audit Log */}
                  {sop.changeLog && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span><strong>版本修订留痕：</strong>{sop.changeLog}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSops.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">未检索到匹配的 SOP 方案</p>
        </div>
      )}

      {/* Modal: SOP Editor */}
      {editorSop && (
        <SopEditorModal
          initialSop={editorSop === 'NEW' ? null : editorSop}
          onClose={() => setEditorSop(null)}
          onSave={handleSaveSop}
        />
      )}
    </div>
  );
};
