import React, { useState, useMemo, useEffect } from 'react';
import { Site, CoreDevice } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  generateDeviceTelemetrySeries,
  generateDevicePointMatrix,
  generateOperatingCycles,
  generateDeviceAlarmLogs,
  TelemetryDataPoint,
  TelemetryPointItem
} from './deviceTelemetryData';
import {
  Cpu,
  Activity,
  Zap,
  Clock,
  ArrowLeft,
  Download,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Thermometer,
  Gauge,
  Calendar,
  Search,
  Filter,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ChevronRight,
  TrendingUp,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface DeviceDetailWorkbenchProps {
  site: Site;
  device: CoreDevice;
  onBack: () => void;
  onSelectDevice: (dev: CoreDevice) => void;
}

export const DeviceDetailWorkbench: React.FC<DeviceDetailWorkbenchProps> = ({
  site,
  device,
  onBack,
  onSelectDevice
}) => {
  const { openAiDrawer } = useApp();

  // Active Tab: 0 = Telemetry Time-Series, 1 = Operating Conditions, 2 = Point Matrix, 3 = Alarms & Impact
  const [activeTab, setActiveTab] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('2026-08-20 19:48:35');
  const [searchPoint, setSearchPoint] = useState('');
  const [pointCategoryFilter, setPointCategoryFilter] = useState<string>('ALL');

  // Chart Channel Visibility Toggles
  const [showPower, setShowPower] = useState(true);
  const [showVoltage, setShowVoltage] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showTemp, setShowTemp] = useState(true);
  const [showEfficiency, setShowEfficiency] = useState(false);

  // Generate data
  const telemetryData = useMemo(() => {
    return generateDeviceTelemetrySeries(device, timeRange);
  }, [device, timeRange]);

  const pointMatrix = useMemo(() => {
    return generateDevicePointMatrix(device);
  }, [device]);

  const operatingCycles = useMemo(() => {
    return generateOperatingCycles(device);
  }, [device]);

  const alarmLogs = useMemo(() => {
    return generateDeviceAlarmLogs(device);
  }, [device]);

  // Live polling effect simulation
  useEffect(() => {
    if (!isLiveRefreshing) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastRefreshedAt(`2026-08-20 ${timeStr}`);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLiveRefreshing]);

  // Filtered Points Matrix
  const filteredPoints = useMemo(() => {
    return pointMatrix.filter(pt => {
      const matchCat = pointCategoryFilter === 'ALL' || pt.category === pointCategoryFilter;
      const matchSearch =
        pt.pointCode.toLowerCase().includes(searchPoint.toLowerCase()) ||
        pt.pointName.toLowerCase().includes(searchPoint.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [pointMatrix, pointCategoryFilter, searchPoint]);

  // Calculate Statistics Summary
  const statsSummary = useMemo(() => {
    if (telemetryData.length === 0) {
      return { peakP: 0, valleyP: 0, avgTemp: 0, maxTemp: 0, totalThroughput: 0 };
    }
    const powers = telemetryData.map(d => d.activePowerKw || 0);
    const temps = telemetryData.map(d => d.temperatureC || 0);
    const peakP = Math.max(...powers);
    const valleyP = Math.min(...powers);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const totalThroughput = powers.reduce((acc, p) => acc + Math.abs(p), 0);

    return {
      peakP,
      valleyP,
      avgTemp: Number(avgTemp.toFixed(1)),
      maxTemp: Number(maxTemp.toFixed(1)),
      totalThroughput: Math.round(totalThroughput * (timeRange === '24h' ? 1 : 12))
    };
  }, [telemetryData, timeRange]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ['时间戳', '工况状态', '有功功率(kW)', '电压(V)', '电流(A)', '工作温度(℃)', '转换效率/SOC(%)'];
    const rows = telemetryData.map(d => [
      d.timestamp,
      d.operatingStateLabel,
      d.activePowerKw ?? '-',
      d.voltageV ?? '-',
      d.currentA ?? '-',
      d.temperatureC ?? '-',
      d.efficiencyPct ?? d.socPct ?? '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${device.deviceCode}_Telemetry_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPcs = device.deviceType === 'PCS_INVERTER';
  const isBms = device.deviceType === 'BMS_CLUSTER';
  const isEms = device.deviceType === 'EMS_HOST';

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb & Device Switcher */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Breadcrumb & Navigation Back */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBack}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>返回设备台账清单</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{site.siteName}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800 font-mono">{device.deviceName}</span>
          </div>

          {/* Device Quick Switcher & AI Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>切换设备:</span>
              <select
                value={device.id}
                onChange={e => {
                  const target = site.coreDevices.find(d => d.id === e.target.value);
                  if (target) onSelectDevice(target);
                }}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
              >
                {site.coreDevices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.deviceCode} - {d.deviceName} ({d.deviceType})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() =>
                openAiDrawer(
                  `针对当前核心设备【${device.deviceName} (${device.deviceCode})】进行遥测工况趋势、温升及潜在劣化风险诊断 (结合 Rule R2 核心扣减规则)`
                )
              }
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-xs border border-blue-200 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI 诊断本设备</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded text-xs border border-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>导出时序快照</span>
            </button>
          </div>
        </div>

        {/* Device Profile Core Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 text-[11px] block">设备名称与型号</span>
            <div className="font-bold text-slate-900 truncate mt-0.5 text-sm">
              {device.deviceName}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              型号: {device.model}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 text-[11px] block">设备编码 / 类型</span>
            <div className="font-bold text-blue-700 font-mono mt-0.5 text-sm">
              {device.deviceCode}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {device.deviceType === 'PCS_INVERTER'
                ? '储能变流器 (PCS)'
                : device.deviceType === 'BMS_CLUSTER'
                ? '电池管理簇 (BMS)'
                : device.deviceType === 'EMS_HOST'
                ? '能量管理主控 (EMS)'
                : '核心计量设备'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 text-[11px] block">额定规格 / 投运时间</span>
            <div className="font-bold text-slate-900 font-mono mt-0.5 text-sm">
              {device.ratedPowerKw ? `${device.ratedPowerKw} kW` : '集控主控'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              投运: {device.installedDate}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 text-[11px] block">计量归属 (Rule R2)</span>
            <div className="mt-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                ★ 核心计量设备
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">停运直接触发可用度扣减</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">当前运行工况状态</span>
              <div className="mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    device.status === 'NORMAL'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {device.status === 'NORMAL' ? '🟢 正常运行 (恒功率放电)' : '🟡 预警运行 (温差超限)'}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
              <span>组网: {site.redundancy}</span>
              <span className="text-emerald-600 font-semibold">通信 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Time Range Selector, Resolution, and Live Refresh Toggle */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Time Presets */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>历史时段:</span>
          </span>
          <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeRange === '24h'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近 24 小时 (按小时)
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeRange === '7d'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近 7 天 (充放双峰)
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeRange === '30d'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近 30 天 (日均趋势)
            </button>
          </div>
        </div>

        {/* Live Refresh Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Radio
              className={`w-3.5 h-3.5 ${
                isLiveRefreshing ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span>最后采样: {lastRefreshedAt}</span>
          </div>

          <button
            onClick={() => setIsLiveRefreshing(!isLiveRefreshing)}
            className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center gap-1 transition-colors ${
              isLiveRefreshing
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isLiveRefreshing ? 'animate-spin' : ''}`} />
            <span>{isLiveRefreshing ? '实时更新中 (5s)' : '已暂停自动刷新'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm flex flex-wrap gap-1">
        {[
          { id: 0, label: '遥测时序多维曲线 (Telemetry Trends)', icon: Activity },
          { id: 1, label: '运行工况与充放电特性 (Operating Cycles)', icon: Zap },
          { id: 2, label: `实时测点点表清单 (${pointMatrix.length})`, icon: Layers },
          { id: 3, label: `设备告警与中断责任 (${alarmLogs.length})`, icon: AlertTriangle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================== TAB 0: 遥测时序多维曲线 ===================== */}
      {activeTab === 0 && (
        <div className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-slate-400 text-[11px] block">峰值有功功率</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {statsSummary.peakP} <span className="text-xs font-normal text-slate-500">kW</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>顶峰放电工况</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-slate-400 text-[11px] block">最大充电功率</span>
              <div className="text-xl font-bold font-mono text-blue-700 mt-1">
                {Math.abs(statsSummary.valleyP)} <span className="text-xs font-normal text-slate-500">kW</span>
              </div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5 flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" />
                <span>低谷储能充入</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-slate-400 text-[11px] block">最高结温 / 电池温度</span>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  statsSummary.maxTemp > 55 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {statsSummary.maxTemp} <span className="text-xs font-normal text-slate-500">℃</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                均温: {statsSummary.avgTemp} ℃ (安全裕量 16.6℃)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-slate-400 text-[11px] block">区间充放总吞吐量</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {statsSummary.totalThroughput.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">kWh</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                双循环满充满放达标
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-slate-400 text-[11px] block">平均转换效率 / SOH</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {isBms ? '98.4%' : '98.92%'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {isBms ? '健康度优良 (SOH)' : '逆变损耗 1.08%'}
              </div>
            </div>
          </div>

          {/* Interactive Recharts Telemetry Canvas */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>遥测时序多维趋势曲线 ({timeRange === '24h' ? '24小时逐时' : timeRange === '7d' ? '7天双峰' : '30天趋势'})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  支持多通道叠加展示、峰谷工况状态同步映射与警戒阈值监控
                </p>
              </div>

              {/* Channel Selector Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] mr-1">显示通道:</span>
                <button
                  onClick={() => setShowPower(!showPower)}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
                    showPower
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  ● 有功功率 (kW)
                </button>
                <button
                  onClick={() => setShowTemp(!showTemp)}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
                    showTemp
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  ● 温度 (°C)
                </button>
                <button
                  onClick={() => setShowVoltage(!showVoltage)}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
                    showVoltage
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  ● 电压 (V)
                </button>
                <button
                  onClick={() => setShowCurrent(!showCurrent)}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
                    showCurrent
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  ● 电流 (A)
                </button>
                <button
                  onClick={() => setShowEfficiency(!showEfficiency)}
                  className={`px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
                    showEfficiency
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  ● {isBms ? 'SOC (%)' : '效率 (%)'}
                </button>
              </div>
            </div>

            {/* Recharts Multi-axis Composed Graph */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={telemetryData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timeLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  {/* Left Axis: Power (kW) */}
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#3b82f6' }}
                    axisLine={{ stroke: '#93c5fd' }}
                    unit=" kW"
                  />
                  {/* Right Axis: Temp (°C) / Efficiency / Voltage */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#d97706' }}
                    axisLine={{ stroke: '#fcd34d' }}
                    unit=" ℃"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                  {/* Temperature Overheat Warning Reference Line */}
                  <ReferenceLine
                    yAxisId="right"
                    y={65}
                    label={{ value: '过温跳闸阈值 65℃ (R2扣减)', fill: '#ef4444', fontSize: 10 }}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                  />

                  {showPower && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="activePowerKw"
                      name="交流有功功率 (kW)"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  )}

                  {showVoltage && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="voltageV"
                      name="三相电压 (V)"
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  )}

                  {showCurrent && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="currentA"
                      name="交流电流 (A)"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  )}

                  {showTemp && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="temperatureC"
                      name="IGBT/单体最高温 (℃)"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#d97706' }}
                    />
                  )}

                  {showEfficiency && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={isBms ? 'socPct' : 'efficiencyPct'}
                      name={isBms ? 'SOC 荷电 (%)' : '转换效率 (%)'}
                      stroke="#9333ea"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Operating State Ribbon (Time Axis Condition Mapping) */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>工况时间轴状态映射 (Operating Condition State Timeline):</span>
                </span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>
                    <span>放电顶峰</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block"></span>
                    <span>低谷充电</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block"></span>
                    <span>待机热备</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
                    <span>一次调频</span>
                  </span>
                </div>
              </div>

              {/* Segmented Color Bar */}
              <div className="w-full h-4 bg-slate-100 rounded flex overflow-hidden border border-slate-200">
                {telemetryData.map((d, idx) => {
                  let bg = 'bg-slate-300';
                  if (d.operatingState === 'CHARGING') bg = 'bg-emerald-600';
                  if (d.operatingState === 'DISCHARGING') bg = 'bg-blue-600';
                  if (d.operatingState === 'REGULATING') bg = 'bg-amber-500';
                  if (d.operatingState === 'FAULT_TRIP') bg = 'bg-rose-600';

                  return (
                    <div
                      key={idx}
                      className={`flex-1 ${bg} hover:opacity-80 transition-opacity cursor-pointer`}
                      title={`${d.timeLabel}: ${d.operatingStateLabel} (${d.activePowerKw || 0}kW)`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 1: 运行工况与充放电特性 ===================== */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Condition Mode Breakdown */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>工况时段占比统计 (24h)</span>
              </h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-blue-700">尖峰顶峰放电 (7.5 小时)</span>
                    <span className="font-mono">31.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '31.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-emerald-700">低谷/光伏充电 (8.0 小时)</span>
                    <span className="font-mono">33.3%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '33.3%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">待机与微调调频 (7.5 小时)</span>
                    <span className="font-mono">31.2%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: '31.2%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-amber-600">非计划检修与跳闸 (1.0 小时)</span>
                    <span className="font-mono text-red-600">4.3%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '4.3%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thermal & Efficiency Matrix */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3 lg:col-span-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-500" />
                <span>热工特性与负载效率分布矩阵</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">25% 负荷效率</span>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1">97.85%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">轻载低损耗</div>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">50% 负荷效率</span>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1">98.65%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">平段经济工况</div>
                </div>
                <div className="p-3 rounded bg-blue-50 border border-blue-200">
                  <span className="text-blue-700 font-semibold">100% 满载效率</span>
                  <div className="text-base font-bold font-mono text-blue-700 mt-1">98.92%</div>
                  <div className="text-[10px] text-blue-600 mt-0.5">额定设计点</div>
                </div>
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">110% 过载能力</span>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1">98.40%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">连续 10 分钟</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">温升与寿命推演:</strong> 结温与进风温差维持在 12.8℃，风道滤网阻力正常。近 30 天等效充放电循环 (EFC) 累计 56.4 次，电芯衰减率 0.08%，处于标称预期寿命曲线以内。
              </div>
            </div>
          </div>

          {/* Operating Cycle Records Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>当日充放电与检修工况时序清单</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">工况时段</th>
                    <th className="py-3 px-3">运行模式</th>
                    <th className="py-3 px-3 font-mono">持续工时</th>
                    <th className="py-3 px-3 font-mono">吞吐电量</th>
                    <th className="py-3 px-3 font-mono">平均功率</th>
                    <th className="py-3 px-3 font-mono">峰值温度</th>
                    <th className="py-3 px-3 font-mono">转换效率</th>
                    <th className="py-3 px-3">状态</th>
                    <th className="py-3 px-4">工况说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operatingCycles.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {c.period}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.modeType === 'discharge'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : c.modeType === 'charge'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {c.mode}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                        {c.durationHours} h
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-900 font-bold">
                        {c.throughputKwh ? `${c.throughputKwh.toLocaleString()} kWh` : '-'}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">
                        {c.avgPowerKw ? `${c.avgPowerKw} kW` : '-'}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-800">{c.peakTempC} ℃</td>
                      <td className="py-3.5 px-3 font-mono text-emerald-600 font-bold">
                        {c.efficiencyPct ? `${c.efficiencyPct}%` : '-'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'RUNNING'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {c.status === 'RUNNING'
                            ? '正在执行'
                            : c.status === 'COMPLETED'
                            ? '正常闭环'
                            : '跳闸停运'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {c.remark}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: 实时测点点表清单 ===================== */}
      {activeTab === 2 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>核心设备遥测测点清单与数据品质 (Modbus/IEC61850 映射表)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                包含模拟量遥测 (AI)、开关量遥信 (DI)、状态参数与警戒上下限
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索测点编码或名称..."
                  value={searchPoint}
                  onChange={e => setSearchPoint(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-44"
                />
              </div>

              <select
                value={pointCategoryFilter}
                onChange={e => setPointCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">全部类型 (全部测点)</option>
                <option value="ELECTRICAL">电气遥测 (AI)</option>
                <option value="THERMAL">热工温度 (AI)</option>
                <option value="STATUS_DI">开关遥信 (DI)</option>
                <option value="CONTROL_AO">控制与定值 (AO)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">测点编码</th>
                  <th className="py-3 px-3">测点中文名称</th>
                  <th className="py-3 px-3">分类</th>
                  <th className="py-3 px-3 font-mono">当前实时值</th>
                  <th className="py-3 px-3 font-mono">单位</th>
                  <th className="py-3 px-3 font-mono">原始报文 Hex</th>
                  <th className="py-3 px-3">数据品质</th>
                  <th className="py-3 px-3 font-mono">量程/报警阈值</th>
                  <th className="py-3 px-3 font-mono">采样周期</th>
                  <th className="py-3 px-4">最后更新</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPoints.map(pt => (
                  <tr key={pt.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {pt.pointCode}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{pt.pointName}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {pt.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-sm">
                      {pt.currentValue}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{pt.unit}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">{pt.rawHex}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pt.quality === 'GOOD'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {pt.quality === 'GOOD' ? '● GOOD (0x00)' : '▲ UNCERTAIN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px]">
                      {pt.lowerThreshold !== undefined ? `${pt.lowerThreshold} ~ ${pt.upperThreshold}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{pt.updatePeriodMs} ms</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {pt.lastUpdated.split(' ')[1]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: 设备告警与中断责任 (Rule R2) ===================== */}
      {activeTab === 3 && (
        <div className="space-y-4">
          {/* Rule R2 Direct Impact Card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 shadow-sm flex items-start gap-3 text-xs text-slate-800">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 font-bold">
                设备非计划停机与可用度考核折算责任 (Rule R2 & R4)：
              </strong>
              根据核心设备认定规则，当前设备（{device.deviceName}）发生故障联锁跳闸或计划外停运时，按全站变流器额定容量权重折算为<strong>等效 PCS 中断时长</strong>，直接扣减当期累计可用度。
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>本设备历史告警事件与工单关联闭环记录</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">告警发生时间</th>
                    <th className="py-3 px-3">告警码</th>
                    <th className="py-3 px-3">告警内容</th>
                    <th className="py-3 px-3">等级</th>
                    <th className="py-3 px-3 font-mono">等效中断时长</th>
                    <th className="py-3 px-3">根本原因因果链</th>
                    <th className="py-3 px-3">关联 PCare 工单</th>
                    <th className="py-3 px-4">处置状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alarmLogs.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {a.timestamp}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-blue-700 font-bold">{a.alarmCode}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{a.alarmTitle}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.severity === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : a.severity === 'WARNING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-red-600">
                        {a.equivalentInterruptionMins > 0
                          ? `${a.equivalentInterruptionMins} 分钟`
                          : '0 (未停运)'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 text-[11px] max-w-xs">{a.rootCause}</td>
                      <td className="py-3.5 px-3 font-mono text-blue-600 font-semibold">
                        {a.workOrderNo || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.workOrderStatus === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.workOrderStatus === 'PROCESSING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {a.workOrderStatus === 'RESOLVED'
                            ? '已闭环方案'
                            : a.workOrderStatus === 'PROCESSING'
                            ? '运维处理中'
                            : '已恢复'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
