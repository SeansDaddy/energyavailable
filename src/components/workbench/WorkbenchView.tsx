import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Activity,
  AlertOctagon,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ReferenceLine,
  Cell
} from 'recharts';
import { StatusLampBadge } from '../common/StatusBadge';

export const WorkbenchView: React.FC = () => {
  const {
    networkKpi,
    trend12Months,
    regionDistribution,
    sites,
    alerts,
    setActiveTab,
    navigateToSiteDetail,
    setDrilldownFilter,
    openAiDrawer
  } = useApp();

  // Find breached sites for TOP list
  const breachedSites = [...sites]
    .sort((a, b) => a.currentAvailability - b.currentAvailability)
    .slice(0, 5);

  const activeAlerts = alerts.filter(a => a.status === 'active').slice(0, 4);

  const handleKpiClick = (type: string) => {
    if (type === 'all_sites') {
      setDrilldownFilter({});
      setActiveTab('sites');
    } else if (type === 'breached_sites') {
      setDrilldownFilter({ statusLamp: 'red' });
      setActiveTab('sites');
    } else if (type === 'alerts') {
      setActiveTab('alerts');
    } else if (type === 'work_orders') {
      setActiveTab('work_orders');
    } else if (type === 'monitor') {
      setActiveTab('availability_monitor');
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Banner & Quick AI Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
              全网运行态势总览
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              全网可用度管理驾驶舱 (Cockpit)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            覆盖全国 4 大区域、数万级在册能源站点。基于离线日志解析与等效 PCS 中断算法持续监控 SLA 履约。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-cockpit-quick-import"
            onClick={() => setActiveTab('log_import')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-2"
          >
            <span>导入离线日志</span>
          </button>
          <button
            id="btn-cockpit-quick-chatbi"
            onClick={() => openAiDrawer()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ChatBI 智能查数</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards (Clickable for drilldown) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1: Total Sites */}
        <div
          id="kpi-card-total-sites"
          onClick={() => handleKpiClick('all_sites')}
          className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">在册站点总数</span>
            <Radio className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {(networkKpi?.totalSites ?? 38420).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>活跃: {(networkKpi?.activeSites ?? 38112).toLocaleString()}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* KPI 2: Monthly Availability */}
        <div
          id="kpi-card-availability"
          onClick={() => handleKpiClick('monitor')}
          className="bg-white border border-slate-200 hover:border-emerald-400 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">本月全网可用度</span>
            <Activity className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
            {networkKpi.monthlyAvailability}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>SLA: {networkKpi.targetSla}%</span>
            <span className="text-[10px] font-bold px-1 rounded bg-emerald-50 text-emerald-700">+0.22%</span>
          </div>
        </div>

        {/* KPI 3: SLA Breached Sites */}
        <div
          id="kpi-card-breached"
          onClick={() => handleKpiClick('breached_sites')}
          className="bg-white border border-slate-200 hover:border-red-400 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">SLA 未达标站点</span>
            <AlertOctagon className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono tracking-tight">
            {networkKpi.slaBreachedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>占比: 0.37%</span>
            <span className="text-red-600 font-bold">下钻 &rarr;</span>
          </div>
        </div>

        {/* KPI 4: Active Alerts */}
        <div
          id="kpi-card-alerts"
          onClick={() => handleKpiClick('alerts')}
          className="bg-white border border-slate-200 hover:border-amber-400 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">活跃预警事件</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono tracking-tight">
            {networkKpi.activeAlertsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>预测跌破: {networkKpi.predictedBreachCount}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>

        {/* KPI 5: Alarms Count */}
        <div
          id="kpi-card-alarms"
          onClick={() => handleKpiClick('monitor')}
          className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">本月新增告警</span>
            <BellRing className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {(networkKpi?.monthlyAlarmsCount ?? 1845).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>断供站点: {networkKpi?.dataStarvedCount ?? 0}</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>

        {/* KPI 6: Work Order Close Rate */}
        <div
          id="kpi-card-workorders"
          onClick={() => handleKpiClick('work_orders')}
          className="bg-white border border-slate-200 hover:border-indigo-400 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase">工单闭环率 (R4)</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 font-mono tracking-tight">
            {networkKpi.workOrderCloseRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>MTTR: {networkKpi.avgMttrHours}h</span>
            <span className="text-indigo-600 font-bold">工单 &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Charts: 12-Month Trend & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 12-Month Availability Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                全网可用度 12 个月历史走势与 SLA 基准线
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                等效 PCS 中断统计口径，包含各月未达标站点分布
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-blue-600 rounded-full"></span>
                <span className="text-slate-600 font-medium">实际可用度 (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-red-500 rounded-full border-b border-dashed"></span>
                <span className="text-slate-600 font-medium">SLA 基线 (99.20%)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend12Months} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[98.8, 100]} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any) => [`${value}%`, '可用度']}
                />
                <ReferenceLine y={99.20} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'SLA 99.20%', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <Line
                  type="monotone"
                  dataKey="availability"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb' }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution Bar Chart (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  区域可用度与达标率分布
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  点击柱形下钻对应区域站点
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {regionDistribution.map(reg => (
                <div
                  key={reg.region}
                  onClick={() => {
                    setDrilldownFilter({ region: reg.region });
                    setActiveTab('sites');
                  }}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{reg.region}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-700 font-bold">{reg.availability}%</span>
                      <span className="text-slate-500 text-[11px]">({(reg.siteCount ?? 0).toLocaleString()} 站)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${reg.slaPassedRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>达标率 {reg.slaPassedRate}%</span>
                    <span className="text-red-600 font-medium">未达标 {reg.breachedCount} 站</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Breached Sites TOP Table & Active Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SLA Breached TOP Sites (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                SLA 未达标站点 TOP5 列表 (实时计算)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                点击任意行直达【站点详情】进行归并故障与事件因果链分析
              </p>
            </div>
            <button
              onClick={() => {
                setDrilldownFilter({ statusLamp: 'red' });
                setActiveTab('sites');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <span>查看全部未达标站点 ({networkKpi.slaBreachedCount})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">站点编码 / 名称</th>
                  <th className="py-2.5 px-3">区域 / 代表处</th>
                  <th className="py-2.5 px-3">客户</th>
                  <th className="py-2.5 px-3 font-mono">SLA 阈值</th>
                  <th className="py-2.5 px-3 font-mono">当期可用度</th>
                  <th className="py-2.5 px-3 font-mono">差值</th>
                  <th className="py-2.5 px-3">状态灯</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {breachedSites.map(site => {
                  const gap = Number((site.currentAvailability - site.slaThreshold).toFixed(2));
                  return (
                    <tr
                      key={site.id}
                      onClick={() => navigateToSiteDetail(site.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{site.siteName}</div>
                        <div className="text-[11px] text-blue-600 font-mono">{site.siteCode}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800">{site.region}</div>
                        <div className="text-[11px] text-slate-500">{site.representativeOffice}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{site.customer}</td>
                      <td className="py-3 px-3 font-mono font-medium">{site.slaThreshold}%</td>
                      <td className="py-3 px-3 font-mono font-bold text-red-600">
                        {site.currentAvailability}%
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-red-600">
                        {gap > 0 ? `+${gap}%` : `${gap}%`}
                      </td>
                      <td className="py-3 px-3">
                        <StatusLampBadge status={site.statusLamp} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
                          详情 &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Alerts Stream (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-500" />
                  最新预警流 (已跌破/预测/断供)
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">风险前置与跟进</p>
              </div>
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
              >
                <span>预警中心</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => setActiveTab('alerts')}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        alert.type === 'sla_breached'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : alert.type === 'predicted_breach'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {alert.type === 'sla_breached'
                        ? '已跌破 SLA'
                        : alert.type === 'predicted_breach'
                        ? `预测跌破 (${alert.breachProbability}%)`
                        : '数据断供'}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.triggerTime}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-900 text-xs mt-1 truncate">
                    {alert.siteName}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>
                      当前: <span className="font-mono text-slate-800 font-bold">{alert.currentValue}%</span>
                    </span>
                    <span>
                      SLA: <span className="font-mono text-slate-800">{alert.slaThreshold}%</span>
                    </span>
                    <span className="text-blue-600 font-medium">处理 &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
