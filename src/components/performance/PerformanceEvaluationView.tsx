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

  if (viewMode === 'detail') {
    return (
      <SitePerformanceDetailView
        siteId={currentSiteId}
        onBackToList={handleBackToList}
        onSwitchSite={handleSwitchSiteInDetail}
      />
    );
  }

  return <PerformanceMonitorView onSelectSite={handleSelectSiteFromList} />;
};
