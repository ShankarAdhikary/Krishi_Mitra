import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  Shield,
  User as UserIcon,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Activity,
  LogOut,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
    setActiveView,
    setSelectedFarmId,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'URGENT' | 'WEATHER' | 'NIR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === 'ALL') return true;
    return n.category === notifFilter;
  });

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'National Admin', desc: 'Full System, Data & User Control' },
    { role: 'DISTRICT_OFFICER', label: 'District Officer', desc: 'Anand District Maps & Actions' },
    { role: 'FIELD_OFFICER', label: 'Field Officer', desc: 'Farm Inspections & Observations' },
    { role: 'ANALYST', label: 'Geospatial Analyst', desc: 'NIR / NDVI Models & Trends' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Tricolor Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 border-b border-slate-100" />

      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Ministry Brand & Logo */}
        <div className="flex items-center gap-3.5">
          {/* Emblem representation */}
          <div className="flex flex-col items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-sm">
            <div className="w-8 h-8 flex items-center justify-center">
              {/* Ashoka Pillar Lion Capital Motif SVG */}
              <svg viewBox="0 0 100 100" className="w-7 h-7 text-slate-800" fill="currentColor">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.8" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 42 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={50 + 42 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>
            <span className="text-[7px] font-bold tracking-tighter text-slate-700 leading-none mt-0.5">सत्यमेव जयते</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">
                Government of India
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 hidden md:inline">
                Ministry of Agriculture & Farmers Welfare
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-2">
              Agricultural Intelligence & Farmer Monitoring System
              <span className="hidden lg:inline-flex items-center text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Decision Support
              </span>
            </h1>
          </div>
        </div>

        {/* Right Section: Search, Role Switcher, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search */}
          <div className="relative hidden xl:block w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search farm ID, farmer, village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setActiveView('farmers');
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Role Switcher Pill */}
          <div className="relative" ref={roleRef}>
            <button
              id="header-role-switcher-btn"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors"
              title="Switch user role to test permissions"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-700" />
              <div className="text-left hidden sm:block">
                <span className="text-[10px] uppercase tracking-wider text-slate-700 font-semibold block leading-none">Role</span>
                <span className="font-semibold text-slate-900">{currentUser.role.replace('_', ' ')}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Switch Test Persona
                  </p>
                  <p className="text-xs text-slate-600">Explore system capabilities per authorized role</p>
                </div>
                <div className="p-1 space-y-1">
                  {rolesList.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        switchRole(item.role);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-start justify-between transition-colors ${
                        currentUser.role === item.role
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                      {currentUser.role === item.role && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              id="header-notification-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold text-sm">Notifications & Alerts</span>
                    <span className="bg-rose-600 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  </div>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                {/* Filter Pills */}
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 text-xs">
                  {(['ALL', 'URGENT', 'WEATHER', 'NIR'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNotifFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                        notifFilter === cat
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Notification Items */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {filteredNotifs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No notifications in this category.
                    </div>
                  ) : (
                    filteredNotifs.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.farmId) {
                            setSelectedFarmId(n.farmId);
                            setActiveView('farm-profile');
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                          !n.read ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {n.category === 'URGENT' && <AlertTriangle className="h-4 w-4 text-rose-600" />}
                          {n.category === 'WEATHER' && <CloudRain className="h-4 w-4 text-sky-600" />}
                          {n.category === 'NIR' && <Activity className="h-4 w-4 text-amber-600" />}
                          {n.category === 'INSPECTION' && <MapPin className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.timeAgo}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                          {n.farmId && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:underline mt-1">
                              View Farm {n.farmId} <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={() => {
                      setActiveView('alerts');
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                  >
                    View All Live Telemetry Alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile avatar & info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full ring-2 ring-emerald-600/30 object-cover"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                {currentUser.designation}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
              title="Logout session"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
