import React, { useState, useEffect } from 'react';
import { EvaluationTaskRecord } from '../../types/preSalesEvaluation';
import { INITIAL_EVALUATION_TASKS } from '../../data/mockPreSalesTasks';
import { PreSalesEvaluationTaskList } from './PreSalesEvaluationTaskList';
import { EvaluationTaskEditor } from './EvaluationTaskEditor';
import { EvaluationTaskDetailView } from './EvaluationTaskDetailView';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'presales_evaluation_tasks_v2';

export const PreContractEvaluationView: React.FC = () => {
  // Mode: 'list' (Default), 'create', 'detail'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTask, setSelectedTask] = useState<EvaluationTaskRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize tasks from localStorage or mock data
  const [tasks, setTasks] = useState<EvaluationTaskRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved evaluation tasks, fallback to initial mock tasks', e);
    }
    return INITIAL_EVALUATION_TASKS;
  });

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save evaluation tasks to localStorage', e);
    }
  }, [tasks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers
  const handleCreateTask = () => {
    setSelectedTask(null);
    setViewMode('create');
  };

  const handleViewTask = (task: EvaluationTaskRecord) => {
    setSelectedTask(task);
    setViewMode('detail');
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast(`已成功删除评估任务【${target?.taskName || taskId}】`);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setViewMode('list');
    }
  };

  const handleSaveNewTask = (newTask: EvaluationTaskRecord) => {
    setTasks(prev => {
      const exists = prev.some(t => t.id === newTask.id);
      if (exists) {
        return prev.map(t => t.id === newTask.id ? newTask : t);
      } else {
        return [newTask, ...prev];
      }
    });
    showToast(`评估任务【${newTask.taskName}】已成功生成并保存至列表！`);
    setViewMode('list');
    setSelectedTask(null);
  };

  const handleAutoSaveTask = (newTask: EvaluationTaskRecord) => {
    setTasks(prev => {
      const exists = prev.some(t => t.id === newTask.id);
      if (exists) {
        return prev.map(t => t.id === newTask.id ? newTask : t);
      } else {
        return [newTask, ...prev];
      }
    });
    showToast(`评估推演完成，任务【${newTask.taskName}】已自动保存至评估列表！`);
  };

  const handleCloneAndEdit = (task: EvaluationTaskRecord) => {
    setSelectedTask(task);
    setViewMode('create');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTask(null);
  };

  return (
    <div className="relative pb-12">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Default View: List of previous evaluation results */}
      {viewMode === 'list' && (
        <PreSalesEvaluationTaskList
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onViewTask={handleViewTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* 2. Create Task View: Form for site data, weather, electricity pricing and run evaluation */}
      {viewMode === 'create' && (
        <EvaluationTaskEditor
          onSaveTask={handleSaveNewTask}
          onAutoSave={handleAutoSaveTask}
          onCancel={handleBackToList}
          initialTask={selectedTask}
        />
      )}

      {/* 3. Detail View: Comprehensive review of an existing evaluation task */}
      {viewMode === 'detail' && selectedTask && (
        <EvaluationTaskDetailView
          task={selectedTask}
          onBack={handleBackToList}
          onCloneAndEdit={handleCloneAndEdit}
        />
      )}
    </div>
  );
};
