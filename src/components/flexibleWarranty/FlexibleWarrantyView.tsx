import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FlexibleWarrantyMonitorView } from './FlexibleWarrantyMonitorView';
import { SiteFlexibleWarrantyDetailView } from './SiteFlexibleWarrantyDetailView';

export const FlexibleWarrantyView: React.FC = () => {
  const {
    sites,
    selectedSiteId,
    setSelectedSiteId,
    flexibleWarrantyDetailSiteId,
    setFlexibleWarrantyDetailSiteId
  } = useApp();

  // 'list' (all sites flexible warranty overview table & KPIs) vs 'detail' (deep dive into selected site)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>(
    flexibleWarrantyDetailSiteId ? 'detail' : 'list'
  );
  const [currentSiteId, setCurrentSiteId] = useState<string>(
    flexibleWarrantyDetailSiteId || selectedSiteId || sites[0]?.id || 'site-001'
  );

  // If AppContext has a flexibleWarrantyDetailSiteId requested, automatically open detail
  useEffect(() => {
    if (flexibleWarrantyDetailSiteId) {
      setCurrentSiteId(flexibleWarrantyDetailSiteId);
      setViewMode('detail');
    }
  }, [flexibleWarrantyDetailSiteId]);

  const handleSelectSiteFromList = (siteId: string) => {
    setCurrentSiteId(siteId);
    setSelectedSiteId(siteId);
    setFlexibleWarrantyDetailSiteId(siteId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setFlexibleWarrantyDetailSiteId(null);
    setViewMode('list');
  };

  const handleSwitchSiteInDetail = (siteId: string) => {
    setCurrentSiteId(siteId);
    setSelectedSiteId(siteId);
    setFlexibleWarrantyDetailSiteId(siteId);
  };

  if (viewMode === 'detail') {
    return (
      <SiteFlexibleWarrantyDetailView
        siteId={currentSiteId}
        onBackToList={handleBackToList}
        onSwitchSite={handleSwitchSiteInDetail}
      />
    );
  }

  return <FlexibleWarrantyMonitorView onSelectSite={handleSelectSiteFromList} />;
};
