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
import { AiAssistantView } from './components/ai/AiAssistantView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] text-slate-800 overflow-hidden font-sans select-none">
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
          {activeTab === 'multi_dim_stats' && <MultiDimStatsView />}
          {activeTab === 'pre_contract_eval' && <PreContractEvaluationView />}
          {activeTab === 'contracts' && <ContractsView />}
          {activeTab === 'work_orders' && <WorkOrdersView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'ai_assistant' && <AiAssistantView />}
        </main>
      </div>
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
