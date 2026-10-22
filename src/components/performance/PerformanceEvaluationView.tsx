import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceMonitorView } from './PerformanceMonitorView';
import { SitePerformanceDetailView } from './SitePerformanceDetailView';

export const PerformanceEvaluationView: React.FC = () => {
  const {
    sites,
    selectedSiteId,
    setSelectedSiteId,
    performanceDetailSiteId,
    setPerformanceDetailSiteId
  } = useApp();

  // 'list' (all sites statistical cards & table) vs 'detail' (deep dive into selected site)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [currentSiteId, setCurrentSiteId] = useState<string>(
    performanceDetailSiteId || selectedSiteId || sites[0]?.id || 'site-001'
  );

  // If AppContext has a performanceDetailSiteId requested (e.g. from SiteDetailView), automatically open detail
  useEffect(() => {
    if (performanceDetailSiteId) {
      setCurrentSiteId(performanceDetailSiteId);
      setViewMode('detail');
    }
  }, [performanceDetailSiteId]);

  const handleSelectSiteFromList = (siteId: string) => {
    setCurrentSiteId(siteId);
    setSelectedSiteId(siteId);
    setPerformanceDetailSiteId(siteId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setPerformanceDetailSiteId(null);
    setViewMode('list');
  };

  const handleSwitchSiteInDetail = (siteId: string) => {
    setCurrentSiteId(siteId);
    setSelectedSiteId(siteId);
    setPerformanceDetailSiteId(siteId);
  };

  const handleOpenReportCenterForSite = (siteId?: string) => {
    if (siteId) {
      setCurrentSiteId(siteId);
      setSelectedSiteId(siteId);
      setPerformanceDetailSiteId(siteId);
    }
    setViewMode('detail');
  };

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto animate-in fade-in duration-200">
      {viewMode === 'detail' ? (
        <SitePerformanceDetailView
          siteId={currentSiteId}
          onBackToList={handleBackToList}
          onSwitchSite={handleSwitchSiteInDetail}
        />
      ) : (
        <PerformanceMonitorView
          onSelectSite={handleSelectSiteFromList}
          onOpenReports={handleOpenReportCenterForSite}
        />
      )}
    </div>
  );
};
