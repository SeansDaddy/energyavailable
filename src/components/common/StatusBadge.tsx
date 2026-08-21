import React from 'react';
import { StatusLamp, RedundancyLevel, AlertType } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Cpu } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusLamp;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customLabel?: string;
}

export const StatusLampBadge: React.FC<StatusBadgeProps> = ({
  status,
  showText = true,
  size = 'md',
  customLabel
}) => {
  const config = {
    green: {
      label: customLabel || 'SLA 达标',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      shadow: ''
    },
    yellow: {
      label: customLabel || '预测将跌破',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500 animate-pulse',
      icon: AlertTriangle,
      shadow: ''
    },
    red: {
      label: customLabel || '已跌破 SLA',
      bg: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500 animate-ping',
      icon: XCircle,
      shadow: ''
    },
    grey: {
      label: customLabel || '数据断供',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      icon: Clock,
      shadow: ''
    }
  }[status] || {
    label: '未知',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock,
    shadow: ''
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size];

  return (
    <span
      id={`lamp-badge-${status}`}
      className={`inline-flex items-center font-medium rounded-md border ${config.bg} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      <Icon className="w-3.5 h-3.5" />
      {showText && <span>{config.label}</span>}
    </span>
  );
};

export const AlertTypeBadge: React.FC<{ type: AlertType }> = ({ type }) => {
  const config = {
    sla_breached: {
      label: '已跌破 SLA',
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle
    },
    predicted_breach: {
      label: '预测将跌破',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle
    },
    data_starved: {
      label: '数据断供',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Clock
    }
  }[type];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export const RedundancyBadge: React.FC<{ level: RedundancyLevel }> = ({ level }) => {
  const config = {
    NONE: { label: '单机无冗余', color: 'text-slate-600 bg-slate-100 border-slate-200' },
    N_PLUS_1: { label: 'N+1 单元热备', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    DUAL_HOT_BACKUP: { label: '双机热备', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    RING_TOPOLOGY: { label: '光纤自愈环网', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    MULTI_ACTIVE: { label: '多活负荷分担', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' }
  }[level] || { label: level, color: 'text-slate-700 bg-slate-100 border-slate-200' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
      <ShieldCheck className="w-3 h-3" />
      {config.label}
    </span>
  );
};
