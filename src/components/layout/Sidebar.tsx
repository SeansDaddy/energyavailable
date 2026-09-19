import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Radio,
  UploadCloud,
  Activity,
  AlertOctagon,
  BarChart3,
  FileSpreadsheet,
  Wrench,
  FileText,
  Sparkles,
  LogIn,
  Layers,
  ChevronRight,
  Database,
  HeartPulse,
  FileCheck2,
  Sliders
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, workOrders } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const pendingOrdersCount = workOrders.filter(w => w.status === 'PROCESSING').length;

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    section?: string;
  }[] = [
    // 专门归类：可用度管理 (所有可用度相关功能)
    {
      id: 'pre_sales_eval',
      label: '售前可用度评估',
      icon: FileCheck2,
      badge: '售前决策',
      badgeColor: 'bg-emerald-600 text-white shadow-xs',
      section: '可用度管理'
    },
    {
      id: 'availability_monitor',
      label: '可用度监控与打点',
      icon: Activity,
      badge: '5min打点',
      badgeColor: 'bg-blue-600 text-white',
      section: '可用度管理'
    },
    {
      id: 'analytics',
      label: '多维可用度统计',
      icon: BarChart3,
      section: '可用度管理'
    },
    {
      id: 'performance_evaluation',
      label: '可用度性能评估',
      icon: HeartPulse,
      badge: '体检分析',
      badgeColor: 'bg-indigo-600 text-white',
      section: '可用度管理'
    },
    {
      id: 'log_import',
      label: '离线日志与扣减',
      icon: UploadCloud,
      badge: 'R2/R3',
      badgeColor: 'bg-slate-700 text-slate-300',
      section: '可用度管理'
    },

    // 站点与运行
    {
      id: 'workbench',
      label: '工作台驾驶舱',
      icon: LayoutDashboard,
      section: '站点与运行'
    },
    {
      id: 'sites',
      label: '站点台账管理',
      icon: Radio,
      section: '站点与运行'
    },
    {
      id: 'alerts',
      label: '预警中心',
      icon: AlertOctagon,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      section: '站点与运行'
    },

    // 外部协同与风控
    {
      id: 'work_orders',
      label: 'PCare 工单管理',
      icon: Wrench,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      section: '外部协同与风控'
    },
    {
      id: 'contracts',
      label: '合同与履约视图',
      icon: FileText,
      section: '外部协同与风控'
    },
    {
      id: 'fault_diagnosis',
      label: 'AI 故障诊断',
      icon: Sparkles,
      badge: 'AI推理',
      badgeColor: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs',
      section: '外部协同与风控'
    },
    {
      id: 'reports',
      label: '报告生成中心',
      icon: FileSpreadsheet,
      section: '外部协同与风控'
    },

    // 系统
    {
      id: 'login',
      label: '统一认证 (SSO)',
      icon: LogIn,
      section: '系统管理'
    }
  ];

  let currentSection = '';

  return (
    <aside className="w-64 bg-[#0a192f] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none shadow-xl z-20">
      <div className="py-3 px-3 space-y-3 overflow-y-auto">
        {/* Brand Header inside Sidebar */}
        <div className="px-3 py-2 border-b border-white/10 mb-2 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">能源站点可用度平台</div>
            <div className="text-[9px] text-blue-400 font-mono tracking-wider uppercase">TECH DATA GRID v1.0</div>
          </div>
        </div>

        {navItems.map(item => {
          const isSectionHeader = item.section && item.section !== currentSection;
          if (isSectionHeader) {
            currentSection = item.section!;
          }
          const Icon = item.icon;
          const isActive =
            activeTab === item.id || (item.id === 'sites' && activeTab === 'site_detail');

          return (
            <React.Fragment key={item.id}>
              {isSectionHeader && (
                <div className="pt-2 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.section}
                </div>
              )}
              <button
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 font-semibold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom info card */}
      <div className="p-3 m-3 bg-black/30 rounded-lg border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
          <Database className="w-3.5 h-3.5" />
          <span>规则引擎 & 微服务</span>
        </div>
        <div className="text-[11px] text-slate-400 leading-relaxed">
          等效 PCS 中断计算 R2 <br />
          Latest-Wins 覆盖参与计算 R3
        </div>
      </div>
    </aside>
  );
};
