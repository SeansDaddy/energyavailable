import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Filter,
  Layers,
  ArrowUpDown,
  TrendingUp,
  PieChart,
  Calendar,
  Building2,
  Users,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';

export const MultiDimStatsView: React.FC = () => {
  const { setDrilldownFilter, setActiveTab } = useApp();

  const [dimension, setDimension] = useState<'region' | 'repOffice' | 'customer' | 'deviceModel'>(
    'region'
  );
  const [sortField, setSortField] = useState<string>('availability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-dimensional Mock Aggregated Data
  const regionStats = [
    {
      name: '华东区',
      siteCount: 14200,
      availability: 99.58,
      passedRate: 98.6,
      interruptionHours: 128.4,
      avgMttr: 3.2,
      alarmCount: 4820,
      workOrders: 620
    },
    {
      name: '华南区',
      siteCount: 11800,
      availability: 99.41,
      passedRate: 97.4,
      interruptionHours: 215.6,
      avgMttr: 3.8,
      alarmCount: 5120,
      workOrders: 710
    },
    {
      name: '华北区',
      siteCount: 7600,
      availability: 99.32,
      passedRate: 96.2,
      interruptionHours: 184.2,
      avgMttr: 4.1,
      alarmCount: 3940,
      workOrders: 490
    },
    {
      name: '西北区',
      siteCount: 4820,
      availability: 99.18,
      passedRate: 94.8,
      interruptionHours: 312.0,
      avgMttr: 5.6,
      alarmCount: 4280,
      workOrders: 580
    }
  ];

  const repOfficeStats = [
    {
      name: '上海代表处',
      siteCount: 5400,
      availability: 99.64,
      passedRate: 99.1,
      interruptionHours: 42.1,
      avgMttr: 2.8,
      alarmCount: 1420,
      workOrders: 190
    },
    {
      name: '深圳代表处',
      siteCount: 6200,
      availability: 99.52,
      passedRate: 98.4,
      interruptionHours: 86.4,
      avgMttr: 3.4,
      alarmCount: 2310,
      workOrders: 320
    },
    {
      name: '南京代表处',
      siteCount: 4800,
      availability: 99.46,
      passedRate: 97.8,
      interruptionHours: 68.2,
      avgMttr: 3.5,
      alarmCount: 1840,
      workOrders: 240
    },
    {
      name: '广州代表处',
      siteCount: 4100,
      availability: 99.36,
      passedRate: 96.8,
      interruptionHours: 112.5,
      avgMttr: 4.2,
      alarmCount: 1950,
      workOrders: 280
    },
    {
      name: '北京代表处',
      siteCount: 3900,
      availability: 99.35,
      passedRate: 96.5,
      interruptionHours: 94.2,
      avgMttr: 4.0,
      alarmCount: 1880,
      workOrders: 230
    },
    {
      name: '乌鲁木齐代表处',
      siteCount: 2820,
      availability: 99.12,
      passedRate: 93.9,
      interruptionHours: 198.4,
      avgMttr: 5.9,
      alarmCount: 2640,
      workOrders: 340
    }
  ];

  const customerStats = [
    {
      name: '国家电网有限公司',
      siteCount: 12400,
      availability: 99.62,
      passedRate: 98.9,
      interruptionHours: 142.0,
      avgMttr: 3.1,
      alarmCount: 4100,
      workOrders: 510
    },
    {
      name: '中国南方电网',
      siteCount: 8900,
      availability: 99.48,
      passedRate: 97.8,
      interruptionHours: 165.4,
      avgMttr: 3.6,
      alarmCount: 3400,
      workOrders: 420
    },
    {
      name: '中国宝武钢铁集团',
      siteCount: 3800,
      availability: 99.45,
      passedRate: 97.2,
      interruptionHours: 92.1,
      avgMttr: 3.9,
      alarmCount: 1620,
      workOrders: 210
    },
    {
      name: '中国石化集团',
      siteCount: 4200,
      availability: 99.31,
      passedRate: 95.8,
      interruptionHours: 148.6,
      avgMttr: 4.4,
      alarmCount: 2180,
      workOrders: 310
    },
    {
      name: '华能江苏清洁能源',
      siteCount: 2600,
      availability: 99.55,
      passedRate: 98.2,
      interruptionHours: 54.2,
      avgMttr: 3.3,
      alarmCount: 960,
      workOrders: 130
    }
  ];

  const deviceModelStats = [
    {
      name: 'PCS-500K-HV (集中式)',
      siteCount: 14800,
      availability: 99.55,
      passedRate: 98.2,
      interruptionHours: 242.0,
      avgMttr: 3.2,
      alarmCount: 5200,
      workOrders: 680
    },
    {
      name: 'PCS-1000K-HV (高压大型)',
      siteCount: 12200,
      availability: 99.46,
      passedRate: 97.5,
      interruptionHours: 290.4,
      avgMttr: 3.8,
      alarmCount: 5800,
      workOrders: 740
    },
    {
      name: 'PCS-250K-LV (分布式组串)',
      siteCount: 8600,
      availability: 99.38,
      passedRate: 96.8,
      interruptionHours: 210.6,
      avgMttr: 4.1,
      alarmCount: 4100,
      workOrders: 530
    },
    {
      name: 'BMS-MASTER-V3 (主控)',
      siteCount: 2820,
      availability: 99.68,
      passedRate: 99.3,
      interruptionHours: 98.2,
      avgMttr: 2.9,
      alarmCount: 1800,
      workOrders: 180
    }
  ];

  let currentData = regionStats;
  if (dimension === 'repOffice') currentData = repOfficeStats;
  else if (dimension === 'customer') currentData = customerStats;
  else if (dimension === 'deviceModel') currentData = deviceModelStats;

  // Sorting
  const sortedData = [...currentData].sort((a: any, b: any) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  const handleRowClick = (item: any) => {
    if (dimension === 'region') {
      setDrilldownFilter({ region: item.name });
      setActiveTab('sites');
    } else if (dimension === 'repOffice') {
      setDrilldownFilter({ repOffice: item.name });
      setActiveTab('sites');
    } else if (dimension === 'customer') {
      setDrilldownFilter({ customer: item.name });
      setActiveTab('sites');
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              多维可用度与运行质量统计报表
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            支持按区域、代表处、客户、设备型号多维自由聚合与交叉透视分析，支持全量数据导出。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.alert('已导出当前多维统计透视表 (Excel 格式)')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>导出统计 Excel 报表</span>
          </button>
        </div>
      </div>

      {/* Dimension Switch Tabs */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
        <button
          onClick={() => setDimension('region')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'region'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>按区域统计 (Region)</span>
        </button>

        <button
          onClick={() => setDimension('repOffice')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'repOffice'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>按代表处统计 (Rep Office)</span>
        </button>

        <button
          onClick={() => setDimension('customer')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'customer'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>按客户统计 (Customer)</span>
        </button>

        <button
          onClick={() => setDimension('deviceModel')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            dimension === 'deviceModel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>按设备型号统计 (Device Model)</span>
        </button>
      </div>

      {/* Visual Chart Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Availability vs SLA Passed Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            各维度可用度均值 (%)
          </h3>
          <p className="text-xs text-slate-500 mb-4">柱高直观反映质量水平</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[98.5, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.375rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(val: any) => [`${val}%`, '可用度均值']}
                />
                <Bar dataKey="availability" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.availability < 99.3 ? '#ef4444' : '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Interruption Hours & MTTR */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-600" />
            累积等效中断时长 (小时)
          </h3>
          <p className="text-xs text-slate-500 mb-4">反映质量损耗总量</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.375rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(val: any) => [`${val} 小时`, '中断时长']}
                />
                <Bar dataKey="interruptionHours" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dimensional Details Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <span className="text-xs font-bold text-slate-800">
            维度透视明细表 (点击行可一键下钻筛选对应站点)
          </span>
          <span className="text-[11px] text-slate-500">点击表头字段切换升降序</span>
        </div>

        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">维度名称</th>
              <th
                onClick={() => {
                  setSortField('siteCount');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                站点数 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('availability');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                平均可用度 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('passedRate');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                SLA 达标率 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('interruptionHours');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                等效中断总时长 <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th
                onClick={() => {
                  setSortField('avgMttr');
                  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                }}
                className="py-3 px-3 cursor-pointer hover:text-slate-900"
              >
                平均 MTTR <ArrowUpDown className="w-3 h-3 inline ml-1" />
              </th>
              <th className="py-3 px-3">告警总数</th>
              <th className="py-3 px-3">工单总数</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((item: any, idx) => (
              <tr
                key={idx}
                onClick={() => handleRowClick(item)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                <td className="py-3.5 px-3 font-mono text-slate-700">{item.siteCount.toLocaleString()} 站</td>
                <td className="py-3.5 px-3 font-mono font-bold text-blue-600">
                  {item.availability}%
                </td>
                <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                  {item.passedRate}%
                </td>
                <td className="py-3.5 px-3 font-mono text-red-600 font-semibold">
                  {item.interruptionHours} 小时
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-700">{item.avgMttr} h</td>
                <td className="py-3.5 px-3 font-mono text-slate-600">{item.alarmCount.toLocaleString()}</td>
                <td className="py-3.5 px-3 font-mono text-slate-600">{item.workOrders.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs">
                    下钻 &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
