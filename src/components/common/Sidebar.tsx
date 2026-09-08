import React, { useState } from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  Users,
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileText,
  ShieldAlert,
  Settings,
  Database,
  History,
  Activity,
  UserCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserPlus,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, currentUser, logout, alerts } = useApp();
  const [isAdminExpanded, setIsAdminExpanded] = useState(true);

  const urgentAlertsCount = alerts.filter((a) => a.severity === 'URGENT' && a.status !== 'RESOLVED' && a.status !== 'CLOSED').length;

  // Role permissions check
  const canAccess = (view: ActiveView): boolean => {
    if (currentUser.role === 'ADMIN') return true;

    if (currentUser.role === 'DISTRICT_OFFICER') {
      return ['dashboard', 'map', 'farmers', 'farmer-register', 'farm-profile', 'alerts', 'inspections', 'reports', 'settings'].includes(view);
    }

    if (currentUser.role === 'FIELD_OFFICER') {
      return ['dashboard', 'map', 'farmers', 'farm-profile', 'alerts', 'inspections', 'settings'].includes(view);
    }

    if (currentUser.role === 'ANALYST') {
      return ['dashboard', 'map', 'analytics', 'reports', 'farm-profile', 'settings'].includes(view);
    }

    return true;
  };

  const navItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Home / Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Interactive GIS Map', icon: MapIcon },
    { id: 'farmers', label: 'Farmers & Parcels', icon: Users },
    { id: 'alerts', label: 'Alerts & Risk Rules', icon: AlertTriangle, badge: urgentAlertsCount, badgeColor: 'bg-rose-600 text-white' },
    { id: 'analytics', label: 'Analytics & Models', icon: BarChart3 },
    { id: 'inspections', label: 'Field Inspections', icon: ClipboardCheck },
    { id: 'reports', label: 'Reports & Builder', icon: FileText },
  ];

  const adminSubItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'admin-users', label: 'Users & Roles', icon: UserCheck },
    { id: 'admin-data-quality', label: 'Data Quality & Ingestion', icon: Database },
    { id: 'admin-audit', label: 'Audit Logs', icon: History },
    { id: 'admin-system', label: 'System Health & GIS', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Govt. Agricultural GIS
          </span>
          <span className="text-sm font-semibold text-white">Decision Support</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operations
        </div>

        {navItems.map((item) => {
          if (!canAccess(item.id)) return null;
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-950/40'
                  : 'hover:bg-slate-800/70 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Action: Register Farmer */}
        {canAccess('farmer-register') && (
          <button
            onClick={() => setActiveView('farmer-register')}
            className={`w-full mt-1.5 flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border border-dashed transition-colors cursor-pointer ${
              activeView === 'farmer-register'
                ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
                : 'border-slate-700 hover:border-emerald-500/60 text-slate-400 hover:text-emerald-300'
            }`}
          >
            <UserPlus className="h-4 w-4 text-emerald-400" />
            <span>+ Register New Farmer</span>
          </button>
        )}

        {/* Administration Section (Role Guarded) */}
        {currentUser.role === 'ADMIN' && (
          <div className="pt-4 space-y-1">
            <button
              onClick={() => setIsAdminExpanded(!isAdminExpanded)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200"
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                Administration
              </span>
              {isAdminExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>

            {isAdminExpanded && (
              <div className="space-y-0.5 pl-2">
                {adminSubItems.map((sub) => {
                  const Icon = sub.icon;
                  const isActive = activeView === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveView(sub.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'hover:bg-slate-800/70 hover:text-white text-slate-400'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeView === 'settings'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'hover:bg-slate-800/70 hover:text-white text-slate-400'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings & Preferences</span>
          </button>
        </div>
      </div>

      {/* Role Footer Card */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Active Security Clearance
            </span>
            <p className="text-xs font-bold text-white truncate">{currentUser.role.replace('_', ' ')}</p>
            <p className="text-[10px] text-emerald-400 truncate">Token: SEC-{currentUser.id}-AUTH</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
