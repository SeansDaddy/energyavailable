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
  const { activeTab, setActiveTab, navigateToPerformanceMonitor, alerts, workOrders } = useApp();

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const pendingOrdersCount = workOrders.filter(w => w.status === 'PROCESSING').length;

  const navCategories: {
    section: string;
    items: {
      id: NavigationTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
    }[];
  }[] = [
    // 1. 可用度管理
    {
      section: '可用度管理',
      items: [
        {
          id: 'pre_sales_eval',
          label: '售前可用度评估',
          icon: FileCheck2
        },
        {
          id: 'availability_monitor',
          label: '可用度监控',
          icon: Activity
        },
        {
          id: 'analytics',
          label: '全网可用度统计',
          icon: BarChart3
        }
      ]
    },

    // 2. 性能工况
    {
      section: '性能工况',
      items: [
        {
          id: 'performance_evaluation',
          label: '性能工况',
          icon: HeartPulse,
          badge: '体检分析',
          badgeColor: 'bg-indigo-600 text-white'
        }
      ]
    },

    // 3. 数据管理 (新增菜单类：站点台账、PCare工单管理、离线数据导入、合同与履约视图)
    {
      section: '数据管理',
      items: [
        {
          id: 'sites',
          label: '站点台账',
          icon: Radio
        },
        {
          id: 'work_orders',
          label: 'PCare 工单管理',
          icon: Wrench,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        },
        {
          id: 'log_import',
          label: '离线数据导入',
          icon: UploadCloud,
          badge: 'R2/R3',
          badgeColor: 'bg-slate-700 text-slate-300'
        },
        {
          id: 'contracts',
          label: '合同与履约视图',
          icon: FileText
        }
      ]
    },

    // 4. 运维与诊断
    {
      section: '运维与诊断',
      items: [
        {
          id: 'alerts',
          label: '预警中心',
          icon: AlertOctagon,
          badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
          badgeColor: 'bg-rose-500 text-white'
        },
        {
          id: 'fault_diagnosis',
          label: 'AI 故障诊断',
          icon: Sparkles,
          badge: 'AI推理',
          badgeColor: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs'
        },
        {
          id: 'reports',
          label: '报告生成中心',
          icon: FileSpreadsheet
        }
      ]
    },

    // 5. 系统管理
    {
      section: '系统管理',
      items: [
        {
          id: 'login',
          label: '统一认证 (SSO)',
          icon: LogIn
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0a192f] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none shadow-xl z-20">
      <div className="py-3 px-3 space-y-2 overflow-y-auto">
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

        {/* 独立置顶第一菜单：工作台驾驶舱 */}
        <button
          id="sidebar-nav-workbench"
          onClick={() => setActiveTab('workbench')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
            activeTab === 'workbench'
              ? 'bg-blue-600/25 text-blue-400 border-l-4 border-blue-500 font-semibold shadow-inner'
              : 'text-slate-200 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard
              className={`w-4 h-4 transition-colors ${
                activeTab === 'workbench' ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            />
            <span className="font-semibold text-xs">工作台驾驶舱</span>
          </div>
          <div className="flex items-center gap-1.5">
            {activeTab === 'workbench' && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
          </div>
        </button>

        <div className="my-2 border-b border-white/10" />

        {/* Categories */}
        {navCategories.map(cat => (
          <div key={cat.section} className="space-y-1">
            <div className="pt-2 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {cat.section}
            </div>
            {cat.items.map(item => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id || (item.id === 'sites' && activeTab === 'site_detail');

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    if (item.id === 'performance_evaluation') {
                      navigateToPerformanceMonitor();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
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
              );
            })}
          </div>
        ))}
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
