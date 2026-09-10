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
import { PerformanceEvaluationView } from './components/performance/PerformanceEvaluationView';
import { DiagnosisCenterView } from './components/diagnosis/DiagnosisCenterView';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

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
          {activeTab === 'performance_evaluation' && <PerformanceEvaluationView />}
          {activeTab === 'fault_diagnosis' && <DiagnosisCenterView />}
          {activeTab === 'contracts' && <ContractsView />}
          {activeTab === 'work_orders' && <WorkOrdersView />}
          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

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
