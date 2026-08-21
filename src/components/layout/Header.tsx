import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USERS } from '../../mock/initialData';
import {
  Bell,
  Sparkles,
  Search,
  Shield,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    alerts,
    drilldownFilter,
    setDrilldownFilter,
    syncContracts,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    openAiDrawer
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const activeAlerts = alerts.filter(a => a.status === 'active');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setDrilldownFilter(prev => ({ ...prev, searchKey: searchVal.trim() }));
      setActiveTab('sites');
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs text-slate-800">
      {/* Left: Brand + Environment Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('workbench')}>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
              能源站点可用度管理系统
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                SYSTEM PROD
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Energy Site Availability Lifecycle (数万级站点规模)
            </div>
          </div>
        </div>

        {/* Evaluation Period Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <span className="text-slate-500 font-medium">考核周期:</span>
          <span className="font-semibold text-blue-700 font-mono">2026-08 (自然月度)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
          <span className="text-[11px] text-emerald-700 font-medium">运行中</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="global-search-input"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="搜索站点名称/编码/代表处/客户/合同号..."
            className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 text-xs text-slate-900 rounded-md pl-9 pr-20 py-2 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-2.5 py-1 rounded transition-colors"
          >
            检索
          </button>
        </form>
      </div>

      {/* Right: AI Quick Action + Notifications + SSO User Switcher */}
      <div className="flex items-center gap-3">
        {/* ChatBI Drawer Toggle Button */}
        <button
          id="btn-nav-chatbi"
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs ${
            isAiDrawerOpen
              ? 'bg-blue-800 text-white ring-2 ring-blue-400'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiDrawerOpen ? 'animate-spin' : ''}`} />
          <span>AI 助手 / ChatBI</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            onClick={() => setShowNotificationPopup(!showNotificationPopup)}
            className="relative p-2 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showNotificationPopup && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">待处理预警 ({activeAlerts.length})</span>
                <button
                  onClick={() => {
                    setShowNotificationPopup(false);
                    setActiveTab('alerts');
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  进入预警中心 &rarr;
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {activeAlerts.slice(0, 4).map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setShowNotificationPopup(false);
                      setActiveTab('alerts');
                    }}
                    className="p-2 rounded bg-slate-50 border border-slate-200 hover:border-red-400 cursor-pointer text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-900 truncate">{alert.siteName}</div>
                    <div className="text-[11px] text-red-600 flex items-center justify-between mt-1 font-medium">
                      <span>{alert.type === 'sla_breached' ? '已跌破 SLA' : alert.type === 'predicted_breach' ? '预测将跌破' : '数据断供'}</span>
                      <span className="text-slate-400 text-[10px]">{alert.triggerTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SSO User Profile & Switcher */}
        <div className="relative">
          <button
            id="btn-user-menu"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover border border-slate-300"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                {currentUser.name.split(' ')[0]}
                <span className="text-[9px] font-mono px-1 rounded bg-slate-200 text-slate-700">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 leading-tight truncate max-w-[110px]">
                {currentUser.roleTitle}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 text-slate-800">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="text-slate-400 text-[11px]">公司统一认证 (SSO) 登录身份</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{currentUser.name}</div>
                <div className="text-blue-600 text-[11px] font-medium">{currentUser.department}</div>
                <div className="text-slate-400 text-[10px] font-mono mt-0.5">域: {currentUser.domain}</div>
              </div>

              <div className="px-2 py-1 text-[11px] text-slate-500 font-semibold">
                切换角色体验视图 (MVP统一全网视角)
              </div>
              <div className="space-y-1">
                {CURRENT_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.roleTitle}</div>
                    </div>
                    {currentUser.id === u.id && <UserCheck className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center px-2">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setActiveTab('login');
                  }}
                  className="text-red-600 hover:underline text-[11px] font-medium"
                >
                  退出并返回登录页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
