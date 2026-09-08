import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DATA_QUALITY_STATS } from '../../data/mockDatabase';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  Download,
} from 'lucide-react';

export const AdminDataQualityView: React.FC = () => {
  const { addToast } = useApp();
  const [isCleaning, setIsCleaning] = useState(false);

  const handleRunPipeline = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setIsCleaning(false);
      addToast('Data Quality Pipeline completed: 0 critical schema violations found', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            Data Quality, Validation & Ingestion Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Automated schema audits, missing telemetry detection, and spatial parcel geometry validation
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={isCleaning}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isCleaning ? 'animate-spin' : ''}`} />
          <span>{isCleaning ? 'Validating Cadastre...' : 'Run Automated Data Audit'}</span>
        </button>
      </div>

      {/* Health Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Farmer Registry Integrity', val: `${DATA_QUALITY_STATS.farmerRecords}%`, status: '98.7% Verified' },
          { label: 'Cadastral GPS Coordinates', val: `${DATA_QUALITY_STATS.farmCoordinates}%`, status: 'Valid WGS 84' },
          { label: 'Sentinel-2 NIR Reflectance', val: `${DATA_QUALITY_STATS.nirData}%`, status: 'B8 Calibrated' },
          { label: 'NDVI Vegetation Index', val: `${DATA_QUALITY_STATS.ndviData}%`, status: 'Calculated' },
          { label: 'IMD Weather Feed Link', val: `${DATA_QUALITY_STATS.weatherData}%`, status: 'Near Real-Time' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">{item.label}</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{item.val}</div>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Anomalies Detected Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Detected Cadastral Inconsistencies & Remediation</h3>
          <span className="text-xs text-slate-500">Last scanned: Today at 06:00 AM IST</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Missing Soil Chemistry Records</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{DATA_QUALITY_STATS.missingRecords}</span>
            <span className="text-[10px] text-slate-400">Defaulted to Regional Soil Survey map</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Boundary Polygons Out of Bounds</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{DATA_QUALITY_STATS.invalidCoordinates}</span>
            <span className="text-[10px] text-slate-400">Flagged for field surveyor verification</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Potential Duplicate Farmer Entries</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{DATA_QUALITY_STATS.duplicateFarmers}</span>
            <span className="text-[10px] text-slate-400">Auto-merged via Aadhaar token</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Stale Satellite Passes (&gt; 10 Days)</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{DATA_QUALITY_STATS.outdatedData}</span>
            <span className="text-[10px] text-slate-400">Landsat-9 replacement queued</span>
          </div>
        </div>
      </div>
    </div>
  );
};
