import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Tractor,
  MapPin,
  Sparkles,
  RefreshCw,
  Phone,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  Droplets,
  Thermometer,
  Layers,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Camera,
  Send,
} from 'lucide-react';

export const FarmProfileView: React.FC = () => {
  const {
    selectedFarm,
    setSelectedFarmId,
    setActiveView,
    alerts,
    updateAlertStatus,
    inspections,
    addToast,
  } = useApp();

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiInsight, setAiInsight] = useState<{
    status: string;
    diagnosis: string;
    irrigationUrgency: string;
    fertilizerRecommendation: string;
    yieldImpactForecast: string;
  } | null>(null);

  if (!selectedFarm) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600">No farm selected.</p>
        <button
          onClick={() => setActiveView('farmers')}
          className="mt-3 text-xs font-semibold text-emerald-700 underline"
        >
          Return to Farmers Directory
        </button>
      </div>
    );
  }

  const farmAlerts = alerts.filter((a) => a.farmId === selectedFarm.id);
  const farmInspections = inspections.filter((i) => i.farmId === selectedFarm.id);
  const history: Array<{ rainfall: number; nir: number; month: string }> = [];

  const handleGenerateAiDiagnostic = async () => {
    setIsGeneratingAi(true);
    const urgent = selectedFarm.status === 'CRITICAL' || selectedFarm.status === 'WARNING';
    setAiInsight({
      status: urgent ? 'REVIEW_REQUIRED' : 'NO_CURRENT_RISK',
      diagnosis: `Latest registry telemetry reports ${selectedFarm.status.toLowerCase()} status for ${selectedFarm.crop || 'this plot'}.`,
      irrigationUrgency: urgent ? 'Prioritize field review and confirm irrigation conditions.' : 'No immediate irrigation action is reported.',
      fertilizerRecommendation: 'No fertilizer recommendation is available from the connected backend.',
      yieldImpactForecast: 'Yield forecast is not available from the connected backend.',
    });
    addToast(`Generated a backend-data summary for ${selectedFarm.crop || 'this plot'}.`, 'success');
    setIsGeneratingAi(false);
  };

  const handleSendSms = () => {
    addToast(
      `SMS Advisory dispatched to ${selectedFarm.farmerName} (${selectedFarm.farmerPhone}): "Urgent: Water stress detected on Farm ${selectedFarm.id}. Canal release arranged."`,
      'success'
    );
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            onClick={() => setActiveView('farmers')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer mt-0.5 sm:mt-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{selectedFarm.farmerName}</h2>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedFarm.id}
              </span>
              <StatusBadge status={selectedFarm.status} size="md" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {selectedFarm.village}, {selectedFarm.district} District, {selectedFarm.state}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {selectedFarm.farmerPhone}
              </span>
              <span className="text-slate-400">
                Pass: <strong className="text-slate-700">{selectedFarm.lastSatellitePass}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendSms}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 text-slate-500" />
            <span>SMS Farmer Advisory</span>
          </button>
          <button
            onClick={() => setActiveView('inspections')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>Field Inspection</span>
          </button>
        </div>
      </div>

      {/* Top 6 Agronomic Metric Cards (PHASE 33) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* NIR */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">NIR Band 8</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{selectedFarm.nir}</div>
          <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Threshold: &lt; 0.50 Alert</span>
        </div>

        {/* NDVI */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">NDVI Canopy Index</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{selectedFarm.ndvi}</div>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Vegetation Density</span>
        </div>

        {/* Soil Moisture */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Root Soil Moisture</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{selectedFarm.soilMoisture}%</div>
          <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Critical Depletion</span>
        </div>

        {/* Rainfall */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Accumulated Rain</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{selectedFarm.rainfall} mm</div>
          <span className="text-[10px] text-amber-700 font-medium block mt-0.5">Seasonal Deficit -34%</span>
        </div>

        {/* Temperature */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Surface Temp</span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{selectedFarm.temperature}°C</div>
          <span className="text-[10px] text-rose-600 font-medium block mt-0.5">Heat Stress +2.8°C</span>
        </div>

        {/* Risk Score */}
        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Composite Risk</span>
          <div className="text-2xl font-black text-rose-900 mt-1 font-mono">{selectedFarm.riskScore}/100</div>
          <span className="text-[10px] text-rose-700 font-bold block mt-0.5">Status: {selectedFarm.status}</span>
        </div>
      </div>

      {/* AI Crop Diagnostic Section (Server-Side Gemini Integration) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-5 border border-slate-700 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Automated Agronomic Decision Engine
              </span>
              <h3 className="text-base font-bold text-white">
                Crop Health & Spectral Diagnosis ({selectedFarm.crop} • {selectedFarm.area} Acres)
              </h3>
            </div>
          </div>

          <button
            onClick={handleGenerateAiDiagnostic}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Analyzing Satellite Indices...' : 'Re-Run Agronomic Diagnostic'}</span>
          </button>
        </div>

        {aiInsight && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                Primary Chlorophyll & Moisture Diagnosis
              </span>
              <p className="text-slate-200 leading-relaxed">{aiInsight.diagnosis}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                Irrigation Urgency & Canal Requirement
              </span>
              <p className="text-slate-200 leading-relaxed">{aiInsight.irrigationUrgency}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                Prescribed Nutrient / Fertilizer Intervention
              </span>
              <p className="text-slate-200 leading-relaxed">{aiInsight.fertilizerRecommendation}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                Yield Impact & Risk Trajectory
              </span>
              <p className="text-slate-200 leading-relaxed">{aiInsight.yieldImpactForecast}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Farm Spatial Mini-Map + Historical Trend Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Spatial Mini-Map & Agronomic Profile (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                Cadastral Spatial Coordinates
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                {selectedFarm.lat}°N, {selectedFarm.lng}°E
              </span>
            </div>

            {/* High-Zoom Simulated Parcel Vector Viewport */}
            <div className="h-48 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative flex items-center justify-center">
              <svg viewBox="0 0 400 250" className="w-full h-full">
                <defs>
                  <pattern id="parcelGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="250" fill="#090d16" />
                <rect width="400" height="250" fill="url(#parcelGrid)" />

                {/* Neighboring parcels */}
                <polygon points="40,30 180,25 170,110 30,100" fill="#1e293b" fillOpacity="0.3" stroke="#334155" strokeWidth="1" />
                <polygon points="190,25 360,40 340,120 180,110" fill="#1e293b" fillOpacity="0.3" stroke="#334155" strokeWidth="1" />
                <polygon points="30,115 170,125 155,220 20,205" fill="#1e293b" fillOpacity="0.3" stroke="#334155" strokeWidth="1" />

                {/* Selected Farm Parcel Boundary */}
                <polygon
                  points="185,125 350,135 325,230 170,220"
                  fill="#ef4444"
                  fillOpacity="0.25"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Centroid Pin */}
                <circle cx="255" cy="180" r="10" fill="#ef4444" fillOpacity="0.3" className="animate-ping" />
                <circle cx="255" cy="180" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

                <text x="255" y="160" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {selectedFarm.id}
                </text>
                <text x="255" y="202" fill="#cbd5e1" fontSize="8" textAnchor="middle">
                  {selectedFarm.area} Acres • {selectedFarm.crop}
                </text>
              </svg>

              <div className="absolute top-2 left-2 bg-slate-900/90 text-[10px] text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Cadastral Survey 142/3
              </div>
            </div>

            {/* Farm Properties Table */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Crop & Stage</span>
                <span className="font-bold text-slate-900">{selectedFarm.crop} ({selectedFarm.cropStage})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Total Area</span>
                <span className="font-bold text-slate-900">{selectedFarm.area} Acres</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Soil Classification</span>
                <span className="font-bold text-slate-900">{selectedFarm.soilType}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Irrigation Infrastructure</span>
                <span className="font-bold text-slate-900">{selectedFarm.irrigationType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Historical NIR vs Rainfall Multi-Month Curve (7 Cols) (PHASE 14 & 16) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Historical NIR Reflectance & Rainfall Curve</h4>
                <p className="text-[11px] text-slate-500">Jan 2026 - Aug 2026 Monthly Progression for {selectedFarm.id}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> NIR
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Rainfall (mm)
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <svg viewBox="0 0 520 200" className="w-full h-full">
                {/* Y Axis Grid lines */}
                <line x1="40" y1="30" x2="490" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="70" x2="490" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="110" x2="490" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="150" x2="490" y2="150" stroke="#e2e8f0" strokeWidth="1" />

                {/* Critical Stress Bar at NIR 0.50 */}
                <line x1="40" y1="110" x2="490" y2="110" stroke="#f87171" strokeDasharray="3 3" strokeWidth="1.2" />
                <text x="495" y="113" fill="#ef4444" fontSize="8" fontWeight="bold">0.50</text>

                {/* Rainfall Bars (Blue) */}
                {history.map((h, i) => {
                  const x = 60 + i * 55;
                  const barHeight = (h.rainfall / 60) * 100;
                  const y = 150 - barHeight;
                  return (
                    <rect
                      key={'rain-' + i}
                      x={x - 10}
                      y={y}
                      width="20"
                      height={barHeight}
                      fill="#38bdf8"
                      fillOpacity="0.4"
                      rx="2"
                    />
                  );
                })}

                {/* NIR Polyline (Emerald to Red drop) */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  points={history
                    .map((h, i) => {
                      const x = 60 + i * 55;
                      const y = 150 - (h.nir / 1.0) * 140;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Points */}
                {history.map((h, i) => {
                  const x = 60 + i * 55;
                  const y = 150 - (h.nir / 1.0) * 140;
                  const isDrop = h.nir < 0.5;
                  return (
                    <g key={'pt-' + i}>
                      <circle cx={x} cy={y} r="4" fill={isDrop ? '#ef4444' : '#059669'} stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y="166" fill="#64748b" fontSize="9" textAnchor="middle">{h.month}</text>
                      <text x={x} y={y - 7} fill={isDrop ? '#dc2626' : '#059669'} fontSize="8" fontWeight="bold" textAnchor="middle">
                        {h.nir}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Notice the steep NIR degradation from 0.72 (Apr) down to 0.42 (Aug) coincident with rainfall stoppage.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Telemetry Alerts & Field Inspection History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Alerts for this farm */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Active Farm Alerts ({farmAlerts.length})
            </h4>
            <span className="text-xs text-slate-500">Lifecycle State Transition</span>
          </div>

          <div className="space-y-3">
            {farmAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active alerts for this farm.</p>
            ) : (
              farmAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="font-bold text-slate-900">{alert.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{alert.createdAt}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{alert.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">
                      Lifecycle: <strong className="text-emerald-800 uppercase">{alert.status}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {alert.status === 'GENERATED' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status === 'ACKNOWLEDGED' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'ASSIGNED')}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Assign Field Officer
                        </button>
                      )}
                      {(alert.status === 'ASSIGNED' || alert.status === 'UNDER_INVESTIGATION') && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'RESOLVED', 'Irrigation canal water release verified by Block Extension Officer.')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Field Inspection Reports with Photos (PHASE 21 & 22) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4 text-emerald-600" />
              Field Inspection & Ground Truth Logs
            </h4>
            <button
              onClick={() => setActiveView('inspections')}
              className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              + New Inspection
            </button>
          </div>

          <div className="space-y-3">
            {farmInspections.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No ground inspection logged yet.{' '}
                <button
                  onClick={() => setActiveView('inspections')}
                  className="text-emerald-700 underline font-semibold"
                >
                  Conduct First Ground Truth Inspection
                </button>
              </div>
            ) : (
              farmInspections.map((insp) => (
                <div key={insp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{insp.issueType}</span>
                      <span className="text-slate-400 font-mono ml-2">({insp.id})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{insp.inspectionDate}</span>
                  </div>

                  <p className="text-slate-700 text-[11px]">{insp.observedCondition}</p>

                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                    <p><strong>Officer:</strong> {insp.officerName} • <strong>GPS:</strong> {insp.gpsLocation.lat}, {insp.gpsLocation.lng}</p>
                    <p className="mt-1"><strong>Action:</strong> {insp.recommendedAction}</p>
                  </div>

                  {/* Photo Gallery */}
                  {insp.photos && insp.photos.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Geotagged Photo Evidence:
                      </span>
                      <div className="flex gap-2">
                        {insp.photos.map((p, idx) => (
                          <img
                            key={idx}
                            src={p}
                            alt="Field observation"
                            className="w-20 h-16 object-cover rounded-md border border-slate-300"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
