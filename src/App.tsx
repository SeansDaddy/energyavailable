import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { WorkbenchView } from './components/workbench/WorkbenchView';
import { SitesView } from './components/sites/SitesView';
import { SiteDetailView } from './components/sites/SiteDetailView';
import { LogImportView } from './components/logImport/LogImportView';
import { AvailabilityMonitorView } from './components/availability/AvailabilityMonitorView';
import { AlertsView } from './components/alerts/AlertsView';
import { MultiDimStatsView } from './components/stats/MultiDimStatsView';
import { PreContractEvaluationView } from './components/evaluation/PreContractEvaluationView';
import { ContractsView } from './components/contracts/ContractsView';
import { WorkOrdersView } from './components/workOrders/WorkOrdersView';
import { ReportsView } from './components/reports/ReportsView';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, isAiDrawerOpen, openAiDrawer } = useApp();

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] text-slate-800 overflow-hidden font-sans select-none relative">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#f0f2f5]">
        <Header />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f0f2f5] p-1">
          {activeTab === 'workbench' && <WorkbenchView />}
          {activeTab === 'sites' && <SitesView />}
          {activeTab === 'site_detail' && <SiteDetailView />}
          {activeTab === 'log_import' && <LogImportView />}
          {activeTab === 'availability_monitor' && <AvailabilityMonitorView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'analytics' && <MultiDimStatsView />}
          {activeTab === 'contracts' && <ContractsView />}
          {activeTab === 'work_orders' && <WorkOrdersView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Floating AI Assistant Trigger Button (Bottom-Right) */}
      {!isAiDrawerOpen && (
        <button
          id="btn-floating-ai-assistant"
          onClick={() => openAiDrawer()}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-lg hover:shadow-xl border border-blue-400 transition-all group"
          title="打开 AI 智能助手 / ChatBI"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          </div>
          <span>AI 智能助手</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-700 text-blue-100 font-mono">
            ChatBI
          </span>
        </button>
      )}

      {/* Global Right-Side Sliding AI Drawer */}
      <AiAssistantDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
