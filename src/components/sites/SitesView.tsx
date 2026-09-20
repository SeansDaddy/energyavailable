import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Site, StatusLamp, RedundancyLevel } from '../../types';
import { DimensionTreeFilter } from '../common/DimensionTreeFilter';
import { StatusLampBadge, RedundancyBadge } from '../common/StatusBadge';
import {
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Radio,
  Upload,
  ChevronRight,
  Edit,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';

export const SitesView: React.FC = () => {
  const {
    sites,
    addSite,
    navigateToSiteDetail,
    navigateToAvailabilityDrilldown,
    drilldownFilter,
    setDrilldownFilter,
    setActiveTab,
    setSelectedSiteId
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [redundancyFilter, setRedundancyFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  // New site form state
  const [newSiteForm, setNewSiteForm] = useState({
    siteCode: '',
    siteName: '',
    region: '华东区',
    representativeOffice: '上海代表处',
    customer: '中国宝武钢铁集团',
    capacityMw: 10,
    coreDeviceCount: 8,
    redundancy: 'DUAL_HOT_BACKUP' as RedundancyLevel,
    redundancyNotes: '',
    slaThreshold: 99.50
  });

  // Filtered sites
  const filteredSites = sites.filter(site => {
    // Dimension tree filter
    if (drilldownFilter.region && site.region !== drilldownFilter.region) return false;
    if (drilldownFilter.repOffice && site.representativeOffice !== drilldownFilter.repOffice) return false;
    if (drilldownFilter.customer && !site.customer.includes(drilldownFilter.customer)) return false;
    if (drilldownFilter.statusLamp && site.statusLamp !== drilldownFilter.statusLamp) return false;

    // Local filters
    if (statusFilter !== 'ALL' && site.statusLamp !== statusFilter) return false;
    if (redundancyFilter !== 'ALL' && site.redundancy !== redundancyFilter) return false;

    // Search
    const searchTarget = drilldownFilter.searchKey || keyword;
    if (searchTarget) {
      const match =
        site.siteName.toLowerCase().includes(searchTarget.toLowerCase()) ||
        site.siteCode.toLowerCase().includes(searchTarget.toLowerCase()) ||
        site.customer.toLowerCase().includes(searchTarget.toLowerCase()) ||
        site.representativeOffice.toLowerCase().includes(searchTarget.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSite(newSiteForm);
    setShowAddModal(false);
    setNewSiteForm({
      siteCode: '',
      siteName: '',
      region: '华东区',
      representativeOffice: '上海代表处',
      customer: '中国宝武钢铁集团',
      capacityMw: 10,
      coreDeviceCount: 8,
      redundancy: 'DUAL_HOT_BACKUP',
      redundancyNotes: '',
      slaThreshold: 99.50
    });
  };

  const handleExcelImportMock = () => {
    // Simulate importing 2 sites from excel
    addSite({
      siteCode: 'EXCEL-IMPORT-001',
      siteName: '江苏常州金坛光储一体化示范站',
      region: '华东区',
      representativeOffice: '南京代表处',
      customer: '华能江苏清洁能源',
      capacityMw: 15.0,
      coreDeviceCount: 12,
      redundancy: 'N_PLUS_1',
      redundancyNotes: '从 Excel 批量台账同步',
      slaThreshold: 99.50,
      currentAvailability: 99.75,
      statusLamp: 'green'
    });
    setShowExcelModal(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              站点台账管理 (Site Registry)
            </h1>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200">
              共 {sites.length} 站 / 筛选出 {filteredSites.length} 站
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            全网站点信息的集中维护。初始来源为合同系统同步 + Excel 批量导入，支持核心设备与组网冗余度持续运维。
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-excel-import"
            onClick={() => setShowExcelModal(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold border border-slate-300 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel 批量导入站点</span>
          </button>
          <button
            id="btn-add-site"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>新增站点台账</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tree Filter + Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Left Column: Strict Dimension Tree Filter */}
        <div className="lg:col-span-1 h-[680px]">
          <DimensionTreeFilter />
        </div>

        {/* Right Column: Multi Filters + Table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Lamp Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">状态灯:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">全部状态灯</option>
                  <option value="green">🟢 绿灯 - SLA 达标</option>
                  <option value="yellow">🟡 黄灯 - 预测将跌破</option>
                  <option value="red">🔴 红灯 - 已跌破 SLA</option>
                  <option value="grey">⚪ 灰灯 - 数据断供</option>
                </select>
              </div>

              {/* Redundancy Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">组网冗余:</span>
                <select
                  value={redundancyFilter}
                  onChange={e => setRedundancyFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">全部组网模式</option>
                  <option value="DUAL_HOT_BACKUP">双机热备</option>
                  <option value="N_PLUS_1">N+1 单元热备</option>
                  <option value="RING_TOPOLOGY">光纤环网</option>
                  <option value="MULTI_ACTIVE">多活分担</option>
                  <option value="NONE">单机无冗余</option>
                </select>
              </div>

              {/* Keyword Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索站点名称 / 编码 / 客户..."
                  value={drilldownFilter.searchKey || keyword}
                  onChange={e => {
                    setKeyword(e.target.value);
                    if (drilldownFilter.searchKey) {
                      setDrilldownFilter(prev => ({ ...prev, searchKey: undefined }));
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-slate-800 w-56 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {(drilldownFilter.region ||
              drilldownFilter.repOffice ||
              drilldownFilter.customer ||
              drilldownFilter.statusLamp ||
              drilldownFilter.searchKey ||
              statusFilter !== 'ALL' ||
              redundancyFilter !== 'ALL' ||
              keyword !== '') && (
              <button
                onClick={() => {
                  setDrilldownFilter({});
                  setStatusFilter('ALL');
                  setRedundancyFilter('ALL');
                  setKeyword('');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer font-medium"
              >
                清除所有过滤条件
              </button>
            )}
          </div>

          {/* Sites Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">站点编码 / 站点名称</th>
                    <th className="py-3 px-4">维度归属</th>
                    <th className="py-3 px-4">客户</th>
                    <th className="py-3 px-3 text-center">核心设备数</th>
                    <th className="py-3 px-3">组网冗余度</th>
                    <th className="py-3 px-3 font-mono">SLA 阈值</th>
                    <th className="py-3 px-3 font-mono">当期累计可用度</th>
                    <th className="py-3 px-3">状态灯</th>
                    <th className="py-3 px-3">最后导入时间</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSites.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <Radio className="w-8 h-8 mx-auto mb-2 text-slate-400 animate-pulse" />
                        没有符合筛选条件的站点记录
                      </td>
                    </tr>
                  ) : (
                    filteredSites.map(site => {
                      const gap = Number(
                        (site.currentAvailability - site.slaThreshold).toFixed(2)
                      );
                      const isBreached = site.currentAvailability < site.slaThreshold;

                      return (
                        <tr
                          key={site.id}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                          onClick={() => navigateToSiteDetail(site.id)}
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {site.siteName}
                            </div>
                            <div className="text-[11px] text-blue-600 font-mono">
                              {site.siteCode}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800">{site.region}</div>
                            <div className="text-[11px] text-slate-500">
                              {site.representativeOffice}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {site.customer}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                            {site.coreDeviceCount}
                          </td>
                          <td className="py-3 px-3">
                            <RedundancyBadge level={site.redundancy} />
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                            {site.slaThreshold}%
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">
                            <span
                              className={
                                isBreached
                                  ? 'text-red-600'
                                  : site.statusLamp === 'yellow'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }
                            >
                              {site.currentAvailability}%
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {gap >= 0 ? `+${gap}%` : `${gap}%`}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <StatusLampBadge status={site.statusLamp} size="sm" />
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                            {site.lastImportTime}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                navigateToSiteDetail(site.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                              title="查看站点台账（全景态势、核心设备拓扑、合同SLA履约、离线日志批次）"
                            >
                              台账
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                navigateToAvailabilityDrilldown(site.id, 0);
                              }}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2 py-1 rounded bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                              title="下钻至可用度监控（5分钟打点、故障因果链、PCare工单闭环）"
                            >
                              可用度下钻
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedSiteId(site.id);
                                setActiveTab('log_import');
                              }}
                              className="text-slate-600 hover:text-slate-900 text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                              title="为此站点导入离线日志"
                            >
                              <Upload className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Add New Site */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-6 shadow-xl animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">新增站点台账</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    站点编码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如 SZ-ESS-0099"
                    value={newSiteForm.siteCode}
                    onChange={e =>
                      setNewSiteForm(prev => ({ ...prev, siteCode: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    站点名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如 深圳龙岗微电网储能站"
                    value={newSiteForm.siteName}
                    onChange={e =>
                      setNewSiteForm(prev => ({ ...prev, siteName: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">所属区域</label>
                  <select
                    value={newSiteForm.region}
                    onChange={e =>
                      setNewSiteForm(prev => ({ ...prev, region: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="华东区">华东区</option>
                    <option value="华南区">华南区</option>
                    <option value="华北区">华北区</option>
                    <option value="西北区">西北区</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">代表处</label>
                  <input
                    type="text"
                    value={newSiteForm.representativeOffice}
                    onChange={e =>
                      setNewSiteForm(prev => ({
                        ...prev,
                        representativeOffice: e.target.value
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">所属客户</label>
                  <input
                    type="text"
                    value={newSiteForm.customer}
                    onChange={e =>
                      setNewSiteForm(prev => ({ ...prev, customer: e.target.value }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">装机容量 (MW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSiteForm.capacityMw}
                    onChange={e =>
                      setNewSiteForm(prev => ({
                        ...prev,
                        capacityMw: parseFloat(e.target.value) || 0
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">核心设备数</label>
                  <input
                    type="number"
                    value={newSiteForm.coreDeviceCount}
                    onChange={e =>
                      setNewSiteForm(prev => ({
                        ...prev,
                        coreDeviceCount: parseInt(e.target.value) || 0
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">
                    合同 SLA 阈值 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSiteForm.slaThreshold}
                    onChange={e =>
                      setNewSiteForm(prev => ({
                        ...prev,
                        slaThreshold: parseFloat(e.target.value) || 99.5
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">组网冗余度</label>
                <select
                  value={newSiteForm.redundancy}
                  onChange={e =>
                    setNewSiteForm(prev => ({
                      ...prev,
                      redundancy: e.target.value as RedundancyLevel
                    }))
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="DUAL_HOT_BACKUP">双机热备 (Dual Hot-Backup)</option>
                  <option value="N_PLUS_1">N+1 单元热备 (N+1 Modular)</option>
                  <option value="RING_TOPOLOGY">光纤自愈环网 (Ring Topology)</option>
                  <option value="MULTI_ACTIVE">多活负荷分担 (Multi-Active)</option>
                  <option value="NONE">单机无冗余 (None)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">
                  冗余度运维备注 (随组网变更记录)
                </label>
                <textarea
                  rows={2}
                  placeholder="填写变流器组网拓扑、保护切除逻辑等备注..."
                  value={newSiteForm.redundancyNotes}
                  onChange={e =>
                    setNewSiteForm(prev => ({ ...prev, redundancyNotes: e.target.value }))
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm"
                >
                  确认新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Excel Batch Import */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Excel 批量导入站点台账</h3>
              </div>
              <button
                onClick={() => setShowExcelModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                支持批量上传 Excel 格式的站点台账清单（含站点编码、名称、区域、客户、SLA 阈值及组网冗余模式）。系统将自动与合同数据枢纽进行匹配对齐 (R9)。
              </p>

              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-6 text-center bg-slate-50 cursor-pointer transition-colors">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                <div className="text-slate-800 font-semibold">点击或拖拽上传 Excel 文件</div>
                <div className="text-slate-400 text-[11px] mt-1">支持 .xlsx, .xls 格式，最大 20MB</div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">能源站点台账标准模板.xlsx</span>
                </div>
                <button
                  type="button"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3 h-3" />
                  <span>下载模板</span>
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowExcelModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleExcelImportMock}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-sm"
                >
                  开始解析并导入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
