import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, ChevronDown, Folder, MapPin, Building2, Layers, Search } from 'lucide-react';

export const DimensionTreeFilter: React.FC = () => {
  const { dimensionTree, drilldownFilter, setDrilldownFilter } = useApp();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'region-east': true,
    'region-south': true,
    'region-north': false,
    'region-northwest': false
  });
  const [searchFilter, setSearchFilter] = useState('');

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleSelectRegion = (regionName: string) => {
    setDrilldownFilter(prev => ({
      ...prev,
      region: prev.region === regionName ? undefined : regionName,
      repOffice: undefined,
      customer: undefined
    }));
  };

  const handleSelectRepOffice = (repName: string, regionName: string) => {
    setDrilldownFilter(prev => ({
      ...prev,
      region: regionName,
      repOffice: prev.repOffice === repName ? undefined : repName,
      customer: undefined
    }));
  };

  const handleSelectCustomer = (customerName: string, repName: string, regionName: string) => {
    setDrilldownFilter(prev => ({
      ...prev,
      region: regionName,
      repOffice: repName,
      customer: prev.customer === customerName ? undefined : customerName
    }));
  };

  const clearAllFilters = () => {
    setDrilldownFilter({});
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col h-full text-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            维度树层级筛选
          </span>
        </div>
        {(drilldownFilter.region || drilldownFilter.repOffice || drilldownFilter.customer) && (
          <button
            id="btn-clear-dimension-filter"
            onClick={clearAllFilters}
            className="text-[11px] text-blue-600 hover:text-blue-700 underline cursor-pointer font-medium"
          >
            重置
          </button>
        )}
      </div>

      {/* Mini search inside tree */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="搜索区域/代表处/客户..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-md pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {dimensionTree.map(region => {
          const isRegionSelected = drilldownFilter.region === region.name.split(' ')[0];
          const isExpanded = expandedNodes[region.id] || searchFilter !== '';
          const regionSimpleName = region.name.split(' ')[0];

          return (
            <div key={region.id} className="text-xs">
              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  isRegionSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
                onClick={() => handleSelectRegion(regionSimpleName)}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleNode(region.id);
                    }}
                    className="p-0.5 hover:bg-slate-200 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{region.name}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="pl-4 mt-0.5 space-y-0.5 border-l border-slate-200 ml-3">
                  {region.children.map(rep => {
                    const isRepSelected = drilldownFilter.repOffice === rep.name;
                    const isRepExpanded = expandedNodes[rep.id] || searchFilter !== '';

                    return (
                      <div key={rep.id}>
                        <div
                          className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                            isRepSelected
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                          }`}
                          onClick={() => handleSelectRepOffice(rep.name, regionSimpleName)}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleNode(rep.id);
                              }}
                              className="p-0.5 hover:bg-slate-200 rounded"
                            >
                              {isRepExpanded ? (
                                <ChevronDown className="w-3 h-3 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-500" />
                              )}
                            </button>
                            <Building2 className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="truncate">{rep.name}</span>
                          </div>
                        </div>

                        {isRepExpanded && (
                          <div className="pl-4 mt-0.5 space-y-0.5 border-l border-slate-200 ml-2">
                            {rep.children.map(cust => {
                              const custSimple = cust.name.split(' ')[0];
                              const isCustSelected = drilldownFilter.customer === custSimple;

                              return (
                                <div
                                  key={cust.id}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors ${
                                    isCustSelected
                                      ? 'bg-blue-100 text-blue-800 font-medium'
                                      : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                                  }`}
                                  onClick={() =>
                                    handleSelectCustomer(custSimple, rep.name, regionSimpleName)
                                  }
                                >
                                  <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="truncate">{cust.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected path indicator */}
      {(drilldownFilter.region || drilldownFilter.repOffice || drilldownFilter.customer) && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="text-slate-400 mb-1">当前下钻路径：</div>
          <div className="flex flex-wrap items-center gap-1 text-blue-700 font-mono font-medium">
            {drilldownFilter.region && <span>{drilldownFilter.region}</span>}
            {drilldownFilter.repOffice && (
              <>
                <span className="text-slate-300">/</span>
                <span>{drilldownFilter.repOffice}</span>
              </>
            )}
            {drilldownFilter.customer && (
              <>
                <span className="text-slate-300">/</span>
                <span>{drilldownFilter.customer}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
