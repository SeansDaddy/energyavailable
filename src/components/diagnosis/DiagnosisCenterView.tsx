import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DiagnosisTask } from '../../types/faultDiagnosis';
import {
  Sparkles,
  Layers,
  BookOpen,
  ListOrdered,
  Plus,
  ArrowLeft,
  Activity,
  History,
  ShieldCheck
} from 'lucide-react';
import { DiagnosisTaskListTab } from './DiagnosisTaskListTab';
import { DiagnosisResultDetailView } from './DiagnosisResultDetailView';
import { CaseLibraryTab } from './CaseLibraryTab';
import { SopLibraryTab } from './SopLibraryTab';
import { NewDiagnosisWizardModal } from './NewDiagnosisWizardModal';

export const DiagnosisCenterView: React.FC = () => {
  const { diagnosisTasks, createDiagnosisTask, activeDiagnosisTaskId, setActiveDiagnosisTaskId } = useApp();

  // Internal tab: 'TASKS' | 'DETAIL' | 'CASES' | 'SOPS'
  const [activeSubTab, setActiveSubTab] = useState<'TASKS' | 'DETAIL' | 'CASES' | 'SOPS'>(
    activeDiagnosisTaskId ? 'DETAIL' : 'TASKS'
  );

  const [selectedTask, setSelectedTask] = useState<DiagnosisTask>(
    diagnosisTasks.find(t => t.id === activeDiagnosisTaskId) || diagnosisTasks[0]
  );

  const [showWizardModal, setShowWizardModal] = useState(false);

  const handleSelectTask = (task: DiagnosisTask) => {
    setSelectedTask(task);
    setActiveDiagnosisTaskId(task.id);
    setActiveSubTab('DETAIL');
  };

  const handleLaunchTask = (newTask: DiagnosisTask) => {
    createDiagnosisTask(newTask);
    setSelectedTask(newTask);
    setActiveDiagnosisTaskId(newTask.id);
    setActiveSubTab('DETAIL');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">AI 故障诊断中心</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              SLA 可用度支撑核心引擎
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            缩短从异常告警到消缺闭环的时间窗，输出根因定性、标准处理方案 (SOP) 推荐与相似案例参考
          </p>
        </div>

        {/* Action Button: 发起诊断 */}
        <button
          onClick={() => setShowWizardModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>新建诊断任务</span>
        </button>
      </div>

      {/* Sub Navigation Bar (4 Pages from 4.12.8) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-slate-200 pb-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab('TASKS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'TASKS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>诊断任务列表 ({diagnosisTasks.length})</span>
          </button>

          {selectedTask && (
            <button
              onClick={() => setActiveSubTab('DETAIL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'DETAIL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>诊断结果详情 · {selectedTask.siteName}</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('CASES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'CASES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>故障案例库 (经验复用)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SOPS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'SOPS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>SOP 方案库 (标准规程)</span>
          </button>
        </div>

        {/* Quick breadcrumb indicator if in detail */}
        {activeSubTab === 'DETAIL' && (
          <button
            onClick={() => setActiveSubTab('TASKS')}
            className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回任务列表</span>
          </button>
        )}
      </div>

      {/* Page Content Rendering */}
      <div>
        {activeSubTab === 'TASKS' && (
          <DiagnosisTaskListTab
            onSelectTask={handleSelectTask}
            onOpenWizard={() => setShowWizardModal(true)}
          />
        )}

        {activeSubTab === 'DETAIL' && (
          <DiagnosisResultDetailView
            task={selectedTask}
            onBackToTaskList={() => setActiveSubTab('TASKS')}
            onNavigateToCaseLibrary={() => setActiveSubTab('CASES')}
            onNavigateToSopLibrary={() => setActiveSubTab('SOPS')}
          />
        )}

        {activeSubTab === 'CASES' && <CaseLibraryTab />}

        {activeSubTab === 'SOPS' && <SopLibraryTab />}
      </div>

      {/* New Diagnosis Wizard Modal */}
      {showWizardModal && (
        <NewDiagnosisWizardModal
          onClose={() => setShowWizardModal(false)}
          onLaunchTask={handleLaunchTask}
        />
      )}
    </div>
  );
};
