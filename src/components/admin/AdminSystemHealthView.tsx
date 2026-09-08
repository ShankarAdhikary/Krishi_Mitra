import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Satellite,
  Wifi,
} from 'lucide-react';

export const AdminSystemHealthView: React.FC = () => {
  const { addToast } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast('Ingestion pipeline completed: 14 fresh Sentinel-2 tiles cached', 'success');
    }, 1400);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            System Architecture & Infrastructure Telemetry
          </h2>
          <p className="text-xs text-slate-500">
            Real-time status of spatial microservices, PostGIS cluster, satellite APIs, and SMS dispatch gateways
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing Satellite Hubs...' : 'Poll Satellite & IMD Feeds'}</span>
        </button>
      </div>

      {/* Resource Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-emerald-600" /> CPU Utilization
            </span>
            <span className="font-mono font-bold text-slate-900">24.2%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '24.2%' }} />
          </div>
          <span className="text-[10px] text-slate-400 block">8 vCPUs (Xeon Scalable 3.2GHz)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-sky-600" /> RAM Consumption
            </span>
            <span className="font-mono font-bold text-slate-900">3.4 / 16 GB</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-sky-600 h-full rounded-full" style={{ width: '21.2%' }} />
          </div>
          <span className="text-[10px] text-slate-400 block">In-memory raster tiles cache</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-purple-600" /> PostGIS Storage
            </span>
            <span className="font-mono font-bold text-slate-900">420 GB / 2 TB</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '21%' }} />
          </div>
          <span className="text-[10px] text-slate-400 block">NVMe SSD Spatial Storage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-amber-600" /> Network Ingress
            </span>
            <span className="font-mono font-bold text-slate-900">48.6 Mbps</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '38%' }} />
          </div>
          <span className="text-[10px] text-slate-400 block">Sentinel-2 multi-spectral stream</span>
        </div>
      </div>

      {/* Services Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">Critical Architecture Microservices</h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {[
            {
              name: 'PostgreSQL 16 + PostGIS Spatial Engine',
              status: 'OPERATIONAL',
              latency: '11ms',
              uptime: '99.99%',
              details: 'Houses 12,450 Gujarat farmer cadastral polygons & raster indices',
            },
            {
              name: 'ESA Copernicus Sentinel-2 Open Data API',
              status: 'OPERATIONAL',
              latency: '184ms',
              uptime: '99.95%',
              details: 'B8 NIR (842nm) and B4 Red (665nm) 10-day orbit constellation',
            },
            {
              name: 'USGS Landsat-9 Thermal Sensor (TIRS-2)',
              status: 'OPERATIONAL',
              latency: '240ms',
              uptime: '99.91%',
              details: 'Surface temperature anomaly cross-referencing feed',
            },
            {
              name: 'IMD Automated Weather Station (AWS) Grid',
              status: 'OPERATIONAL',
              latency: '45ms',
              uptime: '99.98%',
              details: '34 ground meteorological stations reporting rainfall & ambient temp',
            },
            {
              name: 'Google Gemini AI Agronomic Diagnostic Service',
              status: 'OPERATIONAL',
              latency: '512ms',
              uptime: '99.99%',
              details: 'Server-side @google/genai automated crop stress recommendations',
            },
            {
              name: 'National Agronomic SMS & Voice IVR Gateway',
              status: 'OPERATIONAL',
              latency: '820ms',
              uptime: '99.85%',
              details: 'Multi-lingual Gujarati & Hindi farmer broadcast infrastructure',
            },
          ].map((svc, idx) => (
            <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-900 text-sm">{svc.name}</span>
                </div>
                <p className="text-slate-500 text-[11px]">{svc.details}</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="text-slate-500">Latency: <strong className="text-slate-800">{svc.latency}</strong></span>
                <span className="text-slate-500">Uptime: <strong className="text-emerald-700">{svc.uptime}</strong></span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded border border-emerald-200">
                  {svc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
