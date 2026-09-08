import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ANALYTICS_DATA, DISTRICT_SUMMARIES } from '../../data/mockDatabase';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Sparkles,
  Layers,
  Activity,
  Compass,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { addToast, trendsData, filters } = useApp();
  const [activeCategory, setActiveCategory] = useState<
    'ALL' | 'NIR_RAINFALL' | 'CROPS_SOILS' | 'GEOGRAPHY' | 'CAPACITY'
  >('ALL');

  const handleExportAnalytics = () => {
    addToast('Analytics report package (CSV + JSON) generated', 'success');
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm">Live India-wide telemetry</h3>
            <p className="text-[11px] text-slate-300">
              {filters.state} scope • authenticated canonical Sentinel/weather aggregates
            </p>
          </div>
          <Activity className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-300 mb-2">
              <span>NDVI / rainfall history</span>
              <span>{trendsData?.environmental_series?.length || 0} observations</span>
            </div>
            <svg viewBox="0 0 520 130" className="w-full h-32">
              <polyline
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
                points={(trendsData?.environmental_series || []).map((row, index, rows) => {
                  const value = Number(row.ndvi || 0);
                  const x = rows.length > 1 ? 10 + (index / (rows.length - 1)) * 500 : 260;
                  return `${x},${115 - value * 100}`;
                }).join(' ')}
              />
              <line x1="10" y1="115" x2="510" y2="115" stroke="#475569" />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>NDVI</span><span>Green line = measured canonical trend</span>
            </div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-300 mb-2">Crop-wise live averages</div>
            <div className="space-y-2">
              {(trendsData?.crop_summary || []).map((row) => (
                <div key={String(row.name)} className="flex items-center gap-2 text-xs">
                  <span className="w-20 truncate text-slate-300">{row.name}</span>
                  <div className="flex-1 h-2 rounded bg-slate-700 overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, Number(row.avg_ndvi || 0) * 100)}%` }} />
                  </div>
                  <span className="w-12 text-right text-slate-300">{row.avg_ndvi == null ? '—' : Number(row.avg_ndvi).toFixed(2)}</span>
                </div>
              ))}
              {!trendsData?.crop_summary?.length && <span className="text-xs text-slate-400">No live crop aggregates available.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Agricultural Intelligence Analytics Suite
          </h2>
          <p className="text-xs text-slate-500">
            Multi-spectral correlations, environmental stressors, and agro-carrying capacity (ACC) indices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All 11 Models' },
              { id: 'NIR_RAINFALL', label: 'NIR & Weather' },
              { id: 'CROPS_SOILS', label: 'Crops & Soils' },
              { id: 'GEOGRAPHY', label: 'Regional GIS' },
              { id: 'CAPACITY', label: 'ACC Carrying Cap.' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Models</span>
          </button>
        </div>
      </div>

      {/* Grid of the 11 Required Graphs (PHASE 16) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* GRAPH 1: Average NIR vs Rainfall */}
        {(activeCategory === 'ALL' || activeCategory === 'NIR_RAINFALL') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 01</span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  r = 0.84 (High Correlation)
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Average NIR vs Rainfall</h4>
              <p className="text-[11px] text-slate-500 mb-3">NIR response lag to monthly precipitation events</p>

              <div className="h-44 w-full">
                <svg viewBox="0 0 320 150" className="w-full h-full">
                  <line x1="30" y1="20" x2="300" y2="20" stroke="#f1f5f9" />
                  <line x1="30" y1="60" x2="300" y2="60" stroke="#f1f5f9" />
                  <line x1="30" y1="100" x2="300" y2="100" stroke="#f1f5f9" />
                  <line x1="30" y1="130" x2="300" y2="130" stroke="#e2e8f0" />

                  {/* Rainfall bars */}
                  {ANALYTICS_DATA.nirVsRainfall.map((d, i) => {
                    const x = 45 + i * 28;
                    const h = (d.rainfall / 220) * 90;
                    return (
                      <rect key={'bar-' + i} x={x - 6} y={130 - h} width="12" height={h} fill="#38bdf8" opacity="0.4" rx="1" />
                    );
                  })}

                  {/* NIR Line */}
                  <polyline
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                    points={ANALYTICS_DATA.nirVsRainfall
                      .map((d, i) => `${45 + i * 28},${130 - (d.nir / 1.0) * 110}`)
                      .join(' ')}
                  />

                  {ANALYTICS_DATA.nirVsRainfall.map((d, i) => (
                    <g key={'lbl-' + i}>
                      <circle cx={45 + i * 28} cy={130 - (d.nir / 1.0) * 110} r="3" fill="#059669" />
                      <text x={45 + i * 28} y="142" fontSize="8" fill="#64748b" textAnchor="middle">
                        {d.month[0]}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Bars: Rainfall (mm)</span>
              <span>Line: NIR Reflectance</span>
            </div>
          </div>
        )}

        {/* GRAPH 2: NIR vs Temperature */}
        {(activeCategory === 'ALL' || activeCategory === 'NIR_RAINFALL') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 02</span>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Thermal Stress Threshold
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">NIR vs Temperature</h4>
              <p className="text-[11px] text-slate-500 mb-3">Canopy degradation past 33°C thermal stress</p>

              <div className="h-44 w-full flex flex-col justify-around py-1">
                {ANALYTICS_DATA.nirVsTemperature.map((item) => (
                  <div key={item.temp} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{item.temp}</span>
                      <span className="font-mono text-slate-900">
                        NIR: <strong>{item.avgNir}</strong> (Stress: {item.cropStressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full ${item.avgNir < 0.45 ? 'bg-rose-500' : item.avgNir < 0.65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(item.avgNir / 0.8) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Optimal growth envelope sits between 25°C and 31°C.
            </div>
          </div>
        )}

        {/* GRAPH 3: Crop-wise NIR */}
        {(activeCategory === 'ALL' || activeCategory === 'CROPS_SOILS') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 03</span>
                <span className="text-xs font-mono font-semibold text-slate-700">7 Cultivars</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Crop-wise NIR Benchmarks</h4>
              <p className="text-[11px] text-slate-500 mb-3">Actual Mean NIR vs Target Vegetative Peak</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.cropWiseNir.map((c) => (
                  <div key={c.crop} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{c.crop}</span>
                      <span className="font-mono text-[10px] text-slate-600">
                        {c.avgNir} / {c.targetNir}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${(c.avgNir / 1.0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Rice and Wheat show the highest spectral vigor.
            </div>
          </div>
        )}

        {/* GRAPH 4: Soil-wise NIR */}
        {(activeCategory === 'ALL' || activeCategory === 'CROPS_SOILS') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 04</span>
                <span className="text-xs font-mono font-semibold text-slate-700">Pedology</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Soil-wise NIR Distribution</h4>
              <p className="text-[11px] text-slate-500 mb-3">NIR reflectance categorized by pedological order</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.soilWiseNir.map((s) => (
                  <div key={s.soil} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">{s.soil}</span>
                      <span className="font-mono text-emerald-800 font-bold">{s.avgNir}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${(s.avgNir / 1.0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Deep Clayey Alluvial supports higher canopy vigor.
            </div>
          </div>
        )}

        {/* GRAPH 5: State-wise NIR */}
        {(activeCategory === 'ALL' || activeCategory === 'GEOGRAPHY') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 05</span>
                <span className="text-xs font-mono font-semibold text-slate-700">National</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">State-wise NIR Comparison</h4>
              <p className="text-[11px] text-slate-500 mb-3">Multi-state agricultural vigor benchmark</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.stateWiseNir.map((st) => (
                  <div key={st.state} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{st.state}</span>
                      <span className="font-mono font-bold text-slate-900">{st.avgNir}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-700 h-full rounded-full"
                        style={{ width: `${(st.avgNir / 1.0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Punjab & Haryana lead; Gujarat ranks 5th nationally.
            </div>
          </div>
        )}

        {/* GRAPH 6: District-wise NIR */}
        {(activeCategory === 'ALL' || activeCategory === 'GEOGRAPHY') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 06</span>
                <span className="text-xs font-mono font-semibold text-slate-700">Gujarat Districts</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">District-wise NIR & NDVI</h4>
              <p className="text-[11px] text-slate-500 mb-3">District remote-sensing averages across 2026</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.districtWiseNir.map((d) => (
                  <div key={d.district} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{d.district}</span>
                      <span className="font-mono font-bold text-slate-900">
                        NIR: {d.nir} • NDVI: {d.ndvi}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full ${d.nir < 0.5 ? 'bg-rose-500' : d.nir < 0.65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(d.nir / 1.0) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Surat and Rajkot lead; Mehsana shows urgent deficits.
            </div>
          </div>
        )}

        {/* GRAPH 7: NIR vs Soil Grouped Variance */}
        {(activeCategory === 'ALL' || activeCategory === 'CROPS_SOILS') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 07</span>
                <span className="text-xs font-mono font-semibold text-slate-700">Min-Avg-Max</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">NIR vs Soil Variance</h4>
              <p className="text-[11px] text-slate-500 mb-3">Min, Mean, and Max NIR ranges by soil group</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.nirVsSoilGrouped.map((s) => (
                  <div key={s.soil} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">{s.soil}</span>
                      <span className="font-mono text-[10px] text-slate-600">
                        Range: {s.min} - {s.max} (Avg: {s.avg})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 relative">
                      <div
                        className="bg-emerald-500/30 h-full absolute rounded-full"
                        style={{
                          left: `${s.min * 100}%`,
                          width: `${(s.max - s.min) * 100}%`,
                        }}
                      />
                      <div
                        className="h-3 w-1 bg-emerald-700 absolute top-[-2px] rounded-full"
                        style={{ left: `${s.avg * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Black Soil exhibits the narrowest high-yield variance band.
            </div>
          </div>
        )}

        {/* GRAPH 8: NDVI vs NIR Correlation Dispersion */}
        {(activeCategory === 'ALL' || activeCategory === 'NIR_RAINFALL') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 08</span>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  Scatter Density
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">NDVI vs NIR Dispersion</h4>
              <p className="text-[11px] text-slate-500 mb-3">12,450 parcel correlation cluster map</p>

              <div className="h-44 w-full">
                <svg viewBox="0 0 300 150" className="w-full h-full">
                  <line x1="30" y1="20" x2="30" y2="125" stroke="#cbd5e1" />
                  <line x1="30" y1="125" x2="280" y2="125" stroke="#cbd5e1" />

                  {/* Scatter clusters */}
                  {ANALYTICS_DATA.ndviVsNirCorrelation.map((p, i) => {
                    const cx = 30 + (p.ndvi / 1.0) * 240;
                    const cy = 125 - (p.nir / 1.0) * 100;
                    const r = Math.min(Math.max((p.count / 2100) * 16, 4), 18);
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r={r} fill="#0284c7" fillOpacity="0.35" stroke="#0284c7" strokeWidth="1" />
                        <circle cx={cx} cy={cy} r="3" fill="#0369a1" />
                      </g>
                    );
                  })}
                  <text x="150" y="142" fontSize="9" fill="#64748b" textAnchor="middle">NDVI Index</text>
                </svg>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Strong linear clustering confirms spectral sensor calibration.
            </div>
          </div>
        )}

        {/* GRAPH 9: Alert per District Breakdown */}
        {(activeCategory === 'ALL' || activeCategory === 'GEOGRAPHY') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 09</span>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Incident Volume
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Alerts per District</h4>
              <p className="text-[11px] text-slate-500 mb-3">Urgent, High, and Moderate stacked distribution</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.alertsPerDistrict.map((a) => {
                  const total = a.urgent + a.high + a.moderate;
                  return (
                    <div key={a.district} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{a.district}</span>
                        <span className="font-bold text-slate-900">{total} Alerts</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div className="bg-rose-500 h-full" style={{ width: `${(a.urgent / total) * 100}%` }} />
                        <div className="bg-orange-400 h-full" style={{ width: `${(a.high / total) * 100}%` }} />
                        <div className="bg-amber-400 h-full" style={{ width: `${(a.moderate / total) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex gap-2">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Urgent</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" /> High</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Mod</span>
            </div>
          </div>
        )}

        {/* GRAPH 10: ACC vs Soil (Agricultural Carrying Capacity) */}
        {(activeCategory === 'ALL' || activeCategory === 'CAPACITY') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 10</span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  ACC Carrying Index
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">ACC vs Soil Classification</h4>
              <p className="text-[11px] text-slate-500 mb-3">Sustainable biomass carrying capacity score</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.accVsSoil.map((item) => (
                  <div key={item.soil} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700 truncate max-w-[160px]">{item.soil}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.accIndex}/100 ({item.biomassCap} t/ha)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${item.accIndex}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Deep Clayey Alluvial sustains maximum carrying capacity.
            </div>
          </div>
        )}

        {/* GRAPH 11: ACC vs Crop (Agricultural Carrying Capacity vs Crop) */}
        {(activeCategory === 'ALL' || activeCategory === 'CAPACITY') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Model 11</span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Crop ACC Index
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">ACC vs Crop Type</h4>
              <p className="text-[11px] text-slate-500 mb-3">Carrying capacity index vs crop water requirement</p>

              <div className="h-44 w-full flex flex-col justify-around">
                {ANALYTICS_DATA.accVsCrop.map((c) => (
                  <div key={c.crop} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{c.crop}</span>
                      <span className="font-mono text-slate-900">
                        ACC: <strong>{c.accIndex}</strong> ({c.waterRequirementMm} mm water)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${c.accIndex}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Bajra & Mustard exhibit optimal water-efficient resilience.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
