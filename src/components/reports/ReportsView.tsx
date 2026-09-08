import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DISTRICT_SUMMARIES } from '../../data/mockDatabase';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Shield,
  Calendar,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { farms, filters, currentUser, addToast } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<
    'DISTRICT_STATUS' | 'URGENT_DOSSIER' | 'CUSTOM_BUILDER'
  >('DISTRICT_STATUS');

  const [reportDistrict, setReportDistrict] = useState('Anand');

  const urgentFarms = farms.filter((f) => f.status === 'URGENT');
  const districtData = DISTRICT_SUMMARIES.find((d) => d.name === reportDistrict) || DISTRICT_SUMMARIES[0];

  const handlePrintOrDownloadPdf = () => {
    window.print();
    addToast('Government Agricultural Bulletin sent to printer / PDF export dialog', 'success');
  };

  const handleExportCsv = () => {
    const headers = ['Farm ID', 'Farmer', 'Village', 'Crop', 'NIR', 'NDVI', 'Soil Moisture', 'Rainfall', 'Risk Score', 'Status'];
    const rows = urgentFarms.map((f) => [
      f.id,
      f.farmerName,
      f.village,
      f.crop,
      f.nir,
      f.ndvi,
      `${f.soilMoisture}%`,
      `${f.rainfall} mm`,
      f.riskScore,
      f.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Govt_Agri_Report_${reportDistrict}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV data table downloaded', 'success');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Government Decision Support Reports & Bulletins
          </h2>
          <p className="text-xs text-slate-500">
            Official ministerial briefings, district distress dossiers, and exportable cadastral summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintOrDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF Dispatch</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {[
          {
            id: 'DISTRICT_STATUS',
            title: 'District Status Dossier',
            desc: 'Executive summary for District Collector & DAO',
          },
          {
            id: 'URGENT_DOSSIER',
            title: 'Urgent Farmer Intervention List',
            desc: 'Parcels requiring emergency water or pest relief',
          },
          {
            id: 'CUSTOM_BUILDER',
            title: 'Custom Report Generator',
            desc: 'Configurable multi-metric cadastral output',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedReportType(item.id as any)}
            className={`flex-1 min-w-[240px] text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedReportType === item.id
                ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <p className="font-bold text-xs text-slate-900">{item.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* District Selector for Report */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <span className="font-semibold text-slate-700">Target Administrative District:</span>
        <select
          value={reportDistrict}
          onChange={(e) => setReportDistrict(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800 focus:outline-none"
        >
          <option value="Anand">Anand District</option>
          <option value="Kheda">Kheda District</option>
          <option value="Surat">Surat District</option>
          <option value="Vadodara">Vadodara District</option>
          <option value="Rajkot">Rajkot District</option>
          <option value="Ahmedabad">Ahmedabad District</option>
          <option value="Mehsana">Mehsana District</option>
        </select>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500">Ref: <strong>AGRI-DEC-2026/GUJ/{reportDistrict.toUpperCase()}-084</strong></span>
      </div>

      {/* Printable Government Document Layout */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-md p-6 sm:p-8 space-y-6 text-slate-900">
        {/* Official Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <svg viewBox="0 0 100 100" className="w-9 h-9 text-slate-900" fill="currentColor">
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
          <span className="text-[9px] font-bold tracking-widest text-slate-700 uppercase block">सत्यमेव जयते</span>
          <h1 className="text-base font-black uppercase tracking-wider text-slate-950 mt-1">
            GOVERNMENT OF INDIA • MINISTRY OF AGRICULTURE & FARMERS WELFARE
          </h1>
          <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            DECISION SUPPORT SYSTEM FOR AGRICULTURAL RESILIENCE (DSS-AGRI)
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            District Agronomic Status & Urgent Farm Mitigation Memorandum • State of Gujarat
          </p>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Jurisdiction</span>
            <span className="font-bold text-slate-900">{reportDistrict} District, Gujarat</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Date of Dispatch</span>
            <span className="font-bold text-slate-900">07 September 2026</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Reporting Officer</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Security Classification</span>
            <span className="font-bold text-emerald-800">CONFIDENTIAL / FOR OFFICIAL ACTION</span>
          </div>
        </div>

        {/* Report Content based on selection */}
        {selectedReportType === 'DISTRICT_STATUS' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">
              1. Executive Summary & Remote Sensing Indices
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Based on the multi-temporal Sentinel-2 (Band 8 NIR) and Landsat-9 passes dated 05-07 September 2026,
              a total of <strong>{districtData.totalFarms} monitored holdings</strong> were assessed across {reportDistrict} District.
              Composite analysis reveals <strong>{districtData.urgent} holdings categorized as URGENT</strong>,
              primarily triggered by a joint occurrence of moisture deficit (-34% vs normal) and elevated ambient temperatures (+2.8°C).
            </p>

            <div className="grid grid-cols-3 gap-3 text-center my-3">
              <div className="p-3 bg-slate-100 rounded border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Mean NIR Reflectance</span>
                <span className="text-lg font-black text-slate-900">{districtData.avgNir}</span>
              </div>
              <div className="p-3 bg-slate-100 rounded border border-slate-200">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">Mean NDVI Index</span>
                <span className="text-lg font-black text-slate-900">{districtData.avgNdvi}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded border border-rose-200">
                <span className="text-[10px] uppercase text-rose-700 font-bold block">Urgent Action Farms</span>
                <span className="text-lg font-black text-rose-800">{districtData.urgent}</span>
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 pt-2">
              2. Recommended Administrative Interventions
            </h3>
            <ul className="space-y-1.5 text-slate-700 list-disc pl-5">
              <li>
                <strong>Irrigation Water Scheduling:</strong> Instruct Narmada Main Canal branch authorities to open sub-canal sluice gates to Mogri and Tarapur talukas within 24 hours.
              </li>
              <li>
                <strong>Agronomic Advisory SMS Broadcast:</strong> Release automated regional SMS advisories to {districtData.totalFarms} farmers advising nocturnal drip irrigation cycles to limit evapotranspiration losses.
              </li>
              <li>
                <strong>Fertilizer / Micronutrient Subsidy:</strong> Direct PACS (Primary Agricultural Credit Societies) to deploy potassium nitrate (KNO₃) foliar packs to affected wheat parcels.
              </li>
            </ul>
          </div>
        )}

        {selectedReportType === 'URGENT_DOSSIER' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-sm text-rose-800 border-b border-rose-200 pb-1">
              Priority Distress Farm Parcels Requiring Immediate Ground Officer Dispatch
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Farm ID</th>
                    <th className="py-2 px-3">Farmer Name</th>
                    <th className="py-2 px-3">Village</th>
                    <th className="py-2 px-3">Crop</th>
                    <th className="py-2 px-3">NIR</th>
                    <th className="py-2 px-3">Soil Moisture</th>
                    <th className="py-2 px-3">Risk</th>
                    <th className="py-2 px-3">Recommended Relief</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {urgentFarms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-rose-700">{farm.id}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{farm.farmerName}</td>
                      <td className="py-2 px-3 text-slate-700">{farm.village}</td>
                      <td className="py-2 px-3 text-slate-700">{farm.crop}</td>
                      <td className="py-2 px-3 font-mono text-rose-700 font-bold">{farm.nir}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{farm.soilMoisture}%</td>
                      <td className="py-2 px-3 font-bold text-rose-800">{farm.riskScore}/100</td>
                      <td className="py-2 px-3 text-slate-600">Canal allocation + Officer inspection</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReportType === 'CUSTOM_BUILDER' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">
              Custom Cadastral Filter Output
            </h3>
            <p className="text-slate-600">
              Compiled using active database filters: State: {filters.state}, District: {reportDistrict}, Crop: {filters.crop}, Soil: {filters.soil}.
            </p>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 font-mono text-xs">
              TOTAL MATCHING FARMS: {farms.length} records verified against PostGIS Cadastral Registry.
            </div>
          </div>
        )}

        {/* Official Sign-off Block */}
        <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
          <div>
            <p className="font-mono text-[10px] text-slate-400">Cryptographically Signed via DigiLocker / Aadhaar eSign</p>
            <p className="text-[10px] text-slate-500">Government of India • Ministry of Agriculture</p>
          </div>
          <div className="text-right">
            <div className="h-10 w-32 border-b border-slate-400 mb-1 flex items-center justify-center italic text-slate-400">
              [Authorized Seal]
            </div>
            <p className="font-bold text-slate-900">{currentUser.name}</p>
            <p className="text-[10px] text-slate-600">{currentUser.designation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
