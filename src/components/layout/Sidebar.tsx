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
  Sliders,
  ShieldCheck,
  Target,
  BookOpen,
  SunMedium
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    navigateToPerformanceMonitor,
    navigateToFlexibleWarranty,
    currentDomain
  } = useApp();

  // 根据当前选择的业务领域 (电站 / 数据中心 / 分布式光储充) 严格动态生成侧边栏菜单
  let navCategories: {
    section: string;
    items: {
      id: NavigationTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[] = [];

  if (currentDomain === 'data_center') {
    // 数据中心领域：仅有商业化运营-机会点挖掘、服务期刊
    navCategories = [
      {
        section: '商业化运营',
        items: [
          {
            id: 'opportunity_mining',
            label: '机会点挖掘',
            icon: Target
          }
        ]
      },
      {
        section: '知识与服务',
        items: [
          {
            id: 'service_journal',
            label: '服务期刊',
            icon: BookOpen
          }
        ]
      }
    ];
  } else if (currentDomain === 'distributed_pv_storage') {
    // 分布式光储充领域：仅有商业化运营-机会点挖掘、AI光储运营分析
    navCategories = [
      {
        section: '商业化运营',
        items: [
          {
            id: 'opportunity_mining',
            label: '机会点挖掘',
            icon: Target
          }
        ]
      },
      {
        section: '智慧运营',
        items: [
          {
            id: 'ai_pv_storage_analysis',
            label: 'AI光储运营分析',
            icon: SunMedium
          }
        ]
      }
    ];
  } else {
    // 电站领域：完整功能菜单（已彻底去除所有备注描述与角标）
    navCategories = [
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

      // 2. 性能工况管理
      {
        section: '性能工况管理',
        items: [
          {
            id: 'performance_evaluation',
            label: '性能工况',
            icon: HeartPulse
          },
          {
            id: 'performance_stats',
            label: '全网性能工况统计',
            icon: BarChart3
          }
        ]
      },

      // 3. 灵活性能保证管理
      {
        section: '灵活性能保证管理',
        items: [
          {
            id: 'baseline_condition_eval',
            label: '基准工况评估',
            icon: FileCheck2
          },
          {
            id: 'flexible_warranty',
            label: '灵活性能保证',
            icon: ShieldCheck
          },
          {
            id: 'flexible_warranty_stats',
            label: '全网灵活性能保证统计',
            icon: BarChart3
          }
        ]
      },

      // 4. 商业化运营
      {
        section: '商业化运营',
        items: [
          {
            id: 'opportunity_mining',
            label: '机会点挖掘',
            icon: Target
          }
        ]
      },

      // 5. 数据管理
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
            icon: Wrench
          },
          {
            id: 'log_import',
            label: '离线数据导入',
            icon: UploadCloud
          },
          {
            id: 'contracts',
            label: '合同与履约视图',
            icon: FileText
          }
        ]
      },

      // 6. 运维与诊断
      {
        section: '运维与诊断',
        items: [
          {
            id: 'alerts',
            label: '预警中心',
            icon: AlertOctagon
          },
          {
            id: 'fault_diagnosis',
            label: 'AI 故障诊断',
            icon: Sparkles
          }
        ]
      },

      // 7. 系统管理
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
  }

  const domainSubtitles: Record<string, string> = {
    station: '电站专业运营体系',
    data_center: '数据中心能效与服务',
    distributed_pv_storage: '分布式光储充协同'
  };

  return (
    <aside className="w-64 bg-[#0a192f] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none shadow-xl z-20">
      <div className="py-3 px-3 space-y-2 overflow-y-auto">
        {/* Brand Header inside Sidebar */}
        <div className="px-3 py-2 border-b border-white/10 mb-2 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">专业服务运营平台</div>
            <div className="text-[9px] text-blue-400 font-mono tracking-wider">
              {domainSubtitles[currentDomain] || 'PROFESSIONAL OPERATIONS'}
            </div>
          </div>
        </div>

        {/* 仅在电站领域显示工作台驾驶舱 */}
        {currentDomain === 'station' && (
          <>
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
          </>
        )}

        {/* Categories & Items without remark descriptions/badges */}
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
                    } else if (item.id === 'flexible_warranty') {
                      navigateToFlexibleWarranty();
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
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};

