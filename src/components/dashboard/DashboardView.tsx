import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveGisMap } from '../map/InteractiveGisMap';
import { StatusBadge } from '../common/StatusBadge';
import {
  Tractor,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    farms,
    alerts,
    filters,
    setFilters,
    setSelectedFarmId,
    setActiveView,
    addToast,
    dashboardData,
    trendsData,
    refreshBackendData,
    geography,
  } = useApp();
  const districts = geography.districts_by_state[filters.state] || [];

  // Dynamic calculations
  const totalFarmsCount = dashboardData?.total_plots ?? 0;
  const urgentCount = dashboardData?.summary?.irrigate_now ?? 0;
  const moderateCount =
    (dashboardData?.summary?.monitor ?? 0) + (dashboardData?.summary?.irrigate_soon ?? 0);
  const safeCount = dashboardData?.summary?.no_action ?? 0;

  const districtRows = useMemo(() => {
    const grouped = new Map<string, { total: number; urgent: number }>();
    farms.forEach((farm) => {
      const name = farm.district || 'Unassigned';
      const current = grouped.get(name) || { total: 0, urgent: 0 };
      current.total += 1;
      if (farm.status === 'CRITICAL' || farm.status === 'WARNING') current.urgent += 1;
      grouped.set(name, current);
    });
    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [farms]);

  const advisoryResult = {
    summary: `${urgentCount} plots require immediate irrigation and ${moderateCount} require monitoring in the ${filters.district === 'All' ? filters.state : filters.district} scope. This bulletin is based on the latest authenticated dashboard aggregation.`,
    directives: [
      urgentCount > 0 ? `Prioritize field follow-up for ${urgentCount} irrigate-now plots.` : 'No irrigate-now plots are currently reported.',
      moderateCount > 0 ? `Review ${moderateCount} monitor or irrigate-soon plots during the next field cycle.` : 'No monitor or irrigate-soon plots are currently reported.',
      dashboardData?.nri_percent != null ? `Average NIR signal is ${dashboardData.nri_percent}% across ${dashboardData.nri_plot_count} plots.` : 'NIR data is not available for this scope.',
    ],
  };

  const recentAlerts = alerts.slice(0, 5);
  const environmentalSeries = trendsData?.environmental_series || [];
  const latestEnvironment = environmentalSeries[environmentalSeries.length - 1];

  return (
    <div className="space-y-5 pb-12">
      {/* Top Global Filter Bar (PHASE 11) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Global Filters:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* State selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-500 font-medium">State:</span>
            <select
              value={filters.state}
              onChange={(e) => setFilters((prev) => ({ ...prev, state: e.target.value, district: 'All' }))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All India</option>
              {geography.states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>

          {/* District selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-500 font-medium">District:</span>
            <select
              value={filters.district}
              onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Districts ({filters.state === 'All' ? Object.values(geography.districts_by_state).flat().length : districts.length})</option>
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </div>

          {/* Crop selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-500 font-medium">Crop:</span>
            <select
              value={filters.crop}
              onChange={(e) => setFilters((prev) => ({ ...prev, crop: e.target.value }))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Crops</option>
              <option value="Wheat">Wheat</option>
              <option value="Cotton">Cotton</option>
              <option value="Rice">Rice</option>
              <option value="Maize">Maize</option>
              <option value="Groundnut">Groundnut</option>
              <option value="Mustard">Mustard</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-500 font-medium">Season / Date:</span>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Kharif-Rabi 2026">Kharif-Rabi 2026</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Current Week">Current Week</option>
              <option value="Year 2025-26">Year 2025-26</option>
            </select>
          </div>

          <button
            onClick={() => {
              setFilters({
                state: 'All',
                district: 'All',
                crop: 'All',
                soil: 'All',
                dateRange: 'Kharif-Rabi 2026',
              });
              refreshBackendData().catch(() => undefined);
              addToast('Filters reset to statewide baseline', 'info');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary Cards Row (PHASE 11 Blueprint) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Farms */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Farms
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {totalFarmsCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+340 new registrations this month</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Tractor className="h-6 w-6" />
          </div>
        </div>

        {/* Urgent */}
        <div className="bg-rose-50/70 rounded-xl p-4 border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Urgent Attention
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-1">
              {urgentCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-rose-700 font-medium mt-1">
              <AlertOctagon className="h-3 w-3" />
              <span>NIR &lt; 0.45 or severe water stress</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
            <AlertOctagon className="h-6 w-6" />
          </div>
        </div>

        {/* Moderate */}
        <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Moderate Watch
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
              {moderateCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-800 font-medium mt-1">
              <AlertTriangle className="h-3 w-3" />
              <span>NIR 0.45 - 0.65 • Routine monitoring</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Safe */}
        <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Safe & Thriving
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
              {safeCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Optimal chlorophyll reflectance</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* AI Decision Support Directive Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-4 sm:p-5 border border-slate-700 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Ministry Decision Support Bulletin
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Automated Regional Agronomic Risk Synthesis ({filters.district === 'All' ? 'Statewide' : filters.district})
              </h3>
            </div>
          </div>

          <button
            onClick={() => refreshBackendData().then(() => addToast('Dashboard data refreshed from the backend.', 'success')).catch((error) => addToast(error.message, 'error'))}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh backend data</span>
          </button>
        </div>

        {(
          <div className="bg-slate-900/80 rounded-lg p-3.5 border border-slate-700/80 text-xs space-y-2">
            <p className="text-slate-200 leading-relaxed font-normal">{advisoryResult.summary}</p>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                Priority Directives for District Officers:
              </span>
              <ul className="space-y-1 text-slate-300">
                {advisoryResult.directives.map((dir, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{dir}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Live environmental trend</h3>
            <p className="text-[11px] text-slate-500">
              Authenticated aggregates from Sentinel-1, Sentinel-2, weather, and canonical feature rows
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            {latestEnvironment?.date || 'No observations'}
          </span>
        </div>
        {latestEnvironment ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              ['NDVI', latestEnvironment.ndvi, ''],
              ['NIR proxy', latestEnvironment.nir_proxy, ''],
              ['Rainfall 7d', latestEnvironment.rainfall_7d, ' mm'],
              ['Soil moisture', latestEnvironment.soil_moisture, ''],
              ['S1 VV', latestEnvironment.vv_db, ' dB'],
            ].map(([label, value, suffix]) => (
              <div key={String(label)} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
                <strong className="text-sm text-slate-900">
                  {value == null ? '—' : `${Number(value).toFixed(3)}${suffix}`}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No canonical observations are available for this scope yet.</p>
        )}
      </div>

      {/* Main Dashboard Body: Interactive Map + Alert Summary (PHASE 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Map (Left Col, 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Interactive GIS Map
                <span className="text-xs font-normal text-slate-500">
                  ({filters.state} • authenticated registry scope)
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any farm pin or district to inspect real-time satellite telemetry
              </p>
            </div>
            <button
              onClick={() => setActiveView('map')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              Full Screen Map <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-2 flex-1">
            <InteractiveGisMap heightClass="h-[430px]" showAllControls={true} />
          </div>
        </div>

        {/* Alert Summary (Right Col, 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Recent Telemetry Alerts
                <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {alerts.length} Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Triggered by NIR, NDVI, and weather anomaly thresholds</p>
            </div>
            <button
              onClick={() => setActiveView('alerts')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              Manage Alerts <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[440px] flex-1">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="text-xs font-bold text-slate-900">{alert.farmerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({alert.farmId})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{alert.createdAt}</span>
                </div>

                <p className="text-xs text-slate-700 font-medium">{alert.title}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{alert.description}</p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500">
                    District: <strong className="text-slate-700">{alert.district}</strong> • Crop:{' '}
                    <strong className="text-slate-700">{alert.crop}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFarmId(alert.farmId);
                        setActiveView('farm-profile');
                      }}
                      className="text-emerald-800 hover:underline font-semibold cursor-pointer"
                    >
                      View Farm
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFarmId(alert.farmId);
                        setActiveView('inspections');
                      }}
                      className="text-amber-800 hover:underline font-semibold cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: NIR Trend & NDVI Trend (PHASE 11 & 14) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* NIR Trend Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Statewide NIR Reflectance Trend</h4>
              <p className="text-[11px] text-slate-500">Sentinel-2 Band 8 (842nm) vs Stress Threshold</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg NIR: 0.65
            </span>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="h-48 w-full">
            <svg viewBox="0 0 500 180" className="w-full h-full">
              {/* Y Axis Grid lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="#e2e8f0" strokeWidth="1" />

              {/* Threshold line at NIR 0.50 */}
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f87171" strokeDasharray="4 4" strokeWidth="1.2" />
              <text x="44" y="96" fill="#ef4444" fontSize="9" fontWeight="bold">Critical Stress Threshold (0.50)</text>

              {/* Y Axis Labels */}
              <text x="10" y="34" fill="#94a3b8" fontSize="10">0.8</text>
              <text x="10" y="74" fill="#94a3b8" fontSize="10">0.6</text>
              <text x="10" y="114" fill="#94a3b8" fontSize="10">0.4</text>
              <text x="10" y="154" fill="#94a3b8" fontSize="10">0.2</text>

              {/* Line & Area */}
              <polygon
                points="40,150 90,135 140,115 190,75 240,55 290,65 340,48 390,52 440,68 480,82 480,150"
                fill="url(#nirGradientArea)"
                opacity="0.25"
              />
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                points="40,150 90,135 140,115 190,75 240,55 290,65 340,48 390,52 440,68 480,82"
              />

              {/* Data points */}
              {[
                { x: 40, y: 150, m: 'Jan', val: '0.20' },
                { x: 90, y: 135, m: 'Feb', val: '0.35' },
                { x: 140, y: 115, m: 'Mar', val: '0.48' },
                { x: 190, y: 75, m: 'Apr', val: '0.68' },
                { x: 240, y: 55, m: 'May', val: '0.74' },
                { x: 290, y: 65, m: 'Jun', val: '0.69' },
                { x: 340, y: 48, m: 'Jul', val: '0.78' },
                { x: 390, y: 52, m: 'Aug', val: '0.75' },
                { x: 440, y: 68, m: 'Sep', val: '0.67' },
                { x: 480, y: 82, m: 'Oct', val: '0.61' },
              ].map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                  <text x={p.x} y="168" fill="#64748b" fontSize="9" textAnchor="middle">{p.m}</text>
                </g>
              ))}

              <defs>
                <linearGradient id="nirGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* NDVI Trend Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">NDVI Vegetation Index Progression</h4>
              <p className="text-[11px] text-slate-500">(NIR - Red) / (NIR + Red) Canopy Density Metric</p>
            </div>
            <span className="text-xs font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Avg NDVI: 0.58
            </span>
          </div>

          <div className="h-48 w-full">
            <svg viewBox="0 0 500 180" className="w-full h-full">
              <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="#e2e8f0" strokeWidth="1" />

              <polygon
                points="40,155 90,140 140,122 190,85 240,68 290,74 340,55 390,60 440,75 480,90 480,150"
                fill="url(#ndviGradientArea)"
                opacity="0.25"
              />
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                points="40,155 90,140 140,122 190,85 240,68 290,74 340,55 390,60 440,75 480,90"
              />

              {[
                { x: 40, y: 155, m: 'Jan' },
                { x: 90, y: 140, m: 'Feb' },
                { x: 140, y: 122, m: 'Mar' },
                { x: 190, y: 85, m: 'Apr' },
                { x: 240, y: 68, m: 'May' },
                { x: 290, y: 74, m: 'Jun' },
                { x: 340, y: 55, m: 'Jul' },
                { x: 390, y: 60, m: 'Aug' },
                { x: 440, y: 75, m: 'Sep' },
                { x: 480, y: 90, m: 'Oct' },
              ].map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  <text x={p.x} y="168" fill="#64748b" fontSize="9" textAnchor="middle">{p.m}</text>
                </g>
              ))}

              <defs>
                <linearGradient id="ndviGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Row 3: District Status Table & Weather Card (PHASE 11 & 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* District Status (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">District Stress Breakdown</h4>
              <p className="text-[11px] text-slate-500">Status aggregations from the authenticated registry scope</p>
            </div>
            <button
              onClick={() => setActiveView('analytics')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer"
            >
              View Full Analytics →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Total Farms</th>
                  <th className="py-2.5 px-3">Urgent</th>
                  <th className="py-2.5 px-3">Avg NIR</th>
                  <th className="py-2.5 px-3">Avg NDVI</th>
                  <th className="py-2.5 px-3">Rainfall</th>
                  <th className="py-2.5 px-3">Primary Crop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtRows.map(([name, dist]) => (
                  <tr
                    key={name}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, district: name }));
                    }}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{name}</span>
                      {dist.urgent > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-700">{dist.total.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <span className={`font-bold ${dist.urgent > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {dist.urgent}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-700">—</td>
                    <td className="py-2 px-3 font-mono text-slate-700">—</td>
                    <td className="py-2 px-3 text-slate-700">—</td>
                    <td className="py-2 px-3 text-slate-500">Registry data</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weather & Agro-Meteorology (5 Cols) (PHASE 12) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CloudSun className="h-4 w-4 text-amber-500" />
                Regional Agro-Weather Integration
              </h4>
              <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                IMD & ECMWF
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Telemetry feed: Anand Central Agro-Meteorological Observatory
            </p>

            {/* Current Weather Highlights */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                  <span>Ambient Temp</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">35.2°C</div>
                <span className="text-[10px] text-rose-600 font-medium">+2.8°C thermal anomaly</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Droplets className="h-3.5 w-3.5 text-sky-500" />
                  <span>Recent Rainfall</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">42 mm</div>
                <span className="text-[10px] text-rose-600 font-medium">-34% seasonal deficit</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                <span>Relative Humidity</span>
                <span className="font-bold text-slate-900">38% (Low)</span>
              </div>
              <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                <span>Wind Velocity & Direction</span>
                <span className="font-bold text-slate-900">14 km/h • WSW</span>
              </div>
              <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                <span>Daily Evapotranspiration (ET₀)</span>
                <span className="font-bold text-slate-900">6.4 mm / day</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>7-Day Precipitation Forecast</span>
                <span className="font-bold text-amber-600">Dry & Sunny (&lt; 5mm)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Evapotranspiration Advisory:</strong> Rapid soil moisture depletion expected in sandy loam soils over the next 48h.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
