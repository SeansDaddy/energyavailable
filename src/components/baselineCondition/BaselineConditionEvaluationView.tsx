import React, { useState, useEffect } from 'react';
import { BaselineEvaluationTaskRecord } from '../../types/baselineConditionEvaluation';
import { INITIAL_BASELINE_EVALUATION_TASKS } from '../../data/mockBaselineConditionTasks';
import { BaselineConditionTaskList } from './BaselineConditionTaskList';
import { BaselineConditionTaskEditor } from './BaselineConditionTaskEditor';
import { BaselineConditionDetailView } from './BaselineConditionDetailView';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'baseline_condition_eval_tasks_v1';

export const BaselineConditionEvaluationView: React.FC = () => {
  // Mode: 'list' (Default), 'create', 'detail'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTask, setSelectedTask] = useState<BaselineEvaluationTaskRecord | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<'baseline' | 'interim_eval' | 'next_year_plan'>('baseline');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize tasks from localStorage or initial mock tasks
  const [tasks, setTasks] = useState<BaselineEvaluationTaskRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved baseline condition tasks, fallback to initial mock tasks', e);
    }
    return INITIAL_BASELINE_EVALUATION_TASKS;
  });

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save baseline condition tasks to localStorage', e);
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

  const handleViewTask = (
    task: BaselineEvaluationTaskRecord,
    subTab: 'baseline' | 'interim_eval' | 'next_year_plan' = 'baseline'
  ) => {
    setSelectedTask(task);
    setDetailInitialTab(subTab);
    setViewMode('detail');
  };

  const handleDeleteTask = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast(`已成功删除基准工况评估任务【${target?.taskName || taskId}】`);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
      setViewMode('list');
    }
  };

  const handleSaveNewTask = (newTask: BaselineEvaluationTaskRecord) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === newTask.id);
      if (exists) {
        return prev.map((t) => (t.id === newTask.id ? newTask : t));
      } else {
        return [newTask, ...prev];
      }
    });
    showToast(`基准工况评估任务【${newTask.taskName}】已成功生成并保存！`);
    setViewMode('list');
    setSelectedTask(null);
  };

  const handleCloneAndEdit = (task: BaselineEvaluationTaskRecord) => {
    setSelectedTask(task);
    setViewMode('create');
  };

  return (
    <div className="p-4 space-y-4 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* 提示条 Toast */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-emerald-600 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/80 hover:text-white font-bold"
          >
            ×
          </button>
        </div>
      )}

      {viewMode === 'list' && (
        <BaselineConditionTaskList
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onViewTask={handleViewTask}
          onDeleteTask={handleDeleteTask}
          onCloneTask={handleCloneAndEdit}
        />
      )}

      {viewMode === 'create' && (
        <BaselineConditionTaskEditor
          initialTask={selectedTask}
          onSaveTask={handleSaveNewTask}
          onCancel={() => {
            setViewMode('list');
            setSelectedTask(null);
          }}
        />
      )}

      {viewMode === 'detail' && selectedTask && (
        <BaselineConditionDetailView
          task={selectedTask}
          initialTab={detailInitialTab}
          onBackToList={() => {
            setViewMode('list');
            setSelectedTask(null);
          }}
          onCloneAndEdit={handleCloneAndEdit}
        />
      )}
    </div>
  );
};
