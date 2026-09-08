import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Bell,
  Layers,
  Sliders,
  Globe,
  Save,
  CheckCircle2,
  Smartphone,
  HardDrive,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { addToast } = useApp();

  const [settings, setSettings] = useState({
    defaultGisLayer: 'NIR',
    nirCriticalThreshold: 0.45,
    moistureThreshold: 22,
    rainfallDeficitTrigger: 40,
    smsAlertsEnabled: true,
    whatsappAlertsEnabled: true,
    autoDispatchOfficers: true,
    offlineCacheTiles: true,
    language: 'English',
    districtScope: 'Anand',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('System configuration & telemetry thresholds saved successfully', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            System Configuration & Agronomic Thresholds
          </h2>
          <p className="text-xs text-slate-500">
            Customize GIS rendering presets, automated alert thresholds, and multi-lingual dispatch
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Card 1: GIS Layer & Geospatial Display */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              1. Spatial GIS Defaults
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Default Map Raster Layer on Startup
              </label>
              <select
                value={settings.defaultGisLayer}
                onChange={(e) => setSettings({ ...settings, defaultGisLayer: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="NIR">NIR Reflectance (Band 8 Heatmap)</option>
                <option value="NDVI">NDVI Canopy Index</option>
                <option value="RISK">Composite Risk Heatmap</option>
                <option value="SATELLITE">Standard True-Color Satellite</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Primary Regional Scope
              </label>
              <select
                value={settings.districtScope}
                onChange={(e) => setSettings({ ...settings, districtScope: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="Anand">Anand District, Gujarat</option>
                <option value="Kheda">Kheda District, Gujarat</option>
                <option value="Surat">Surat District, Gujarat</option>
                <option value="ALL">State of Gujarat (Statewide)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Agronomic Risk Thresholds */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              2. Agronomic Anomaly & Risk Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Critical NIR Stress Floor
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.nirCriticalThreshold}
                onChange={(e) => setSettings({ ...settings, nirCriticalThreshold: parseFloat(e.target.value) })}
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 0.45</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Soil Moisture Depletion Limit (%)
              </label>
              <input
                type="number"
                value={settings.moistureThreshold}
                onChange={(e) => setSettings({ ...settings, moistureThreshold: parseInt(e.target.value) })}
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Wilting point default: 22%</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Rainfall Deficit Threshold (%)
              </label>
              <input
                type="number"
                value={settings.rainfallDeficitTrigger}
                onChange={(e) => setSettings({ ...settings, rainfallDeficitTrigger: parseInt(e.target.value) })}
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Drought declaration at -40%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Notification & Farmer Dispatch */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Smartphone className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              3. Advisory Dispatch & Multi-lingual Alerts
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, smsAlertsEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-800">Automated SMS Farmer Broadcasts</span>
                <p className="text-[11px] text-slate-500">
                  Sends automated vernacular advisory when parcel NIR drops below threshold
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsappAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, whatsappAlertsEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-800">WhatsApp Infographic Cards</span>
                <p className="text-[11px] text-slate-500">
                  Transmits color-coded crop stress satellite maps to registered mobile numbers
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoDispatchOfficers}
                onChange={(e) => setSettings({ ...settings, autoDispatchOfficers: e.target.checked })}
                className="h-4 w-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-800">Auto-Assign Field Extension Officer on URGENT Status</span>
                <p className="text-[11px] text-slate-500">
                  Generates an inspection task on the nearest extension officer's mobile terminal
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Form Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
