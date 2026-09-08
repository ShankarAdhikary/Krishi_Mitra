import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Eye,
  MapPin,
  FileSpreadsheet,
  ChevronRight,
  ClipboardCheck,
  Trash2,
} from 'lucide-react';

export const FarmerListView: React.FC = () => {
  const {
    farms,
    farmers,
    setSelectedFarmId,
    setActiveView,
    addToast,
    removeFarmer,
    geography,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          f.id.toLowerCase().includes(q) ||
          f.farmerName.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q) ||
          f.village.toLowerCase().includes(q) ||
          f.farmerPhone.includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
      if (cropFilter !== 'ALL' && !f.crop.toLowerCase().includes(cropFilter.toLowerCase())) return false;
      if (districtFilter !== 'ALL' && f.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
      return true;
    });
  }, [farms, search, statusFilter, cropFilter, districtFilter]);

  const handleExportCsv = () => {
    const headers = ['Farm ID', 'Farmer Name', 'Phone', 'District', 'Village', 'Crop', 'Area (Acres)', 'Soil Type', 'NIR', 'NDVI', 'Risk Score', 'Status'];
    const rows = filteredFarms.map((f) => [
      f.id,
      f.farmerName,
      f.farmerPhone,
      f.district,
      f.village,
      f.crop,
      f.area,
      f.soilType,
      f.nir,
      f.ndvi,
      f.riskScore,
      f.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farmers_registry_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Farmer Registry CSV exported successfully', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Farmer & Parcel Registry
          </h2>
          <p className="text-xs text-slate-500">
            Official cadastral registry of monitored farm holdings and remote-sensing indices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setActiveView('farmer-register')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Register Farmer</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, village, farm ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Risk</option>
            <option value="MODERATE">Moderate</option>
            <option value="SAFE">Safe</option>
          </select>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            {Array.from(new Set(Object.values(geography.districts_by_state).flat())).sort().map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>

          {/* Crop Filter */}
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Crops</option>
            <option value="Wheat">Wheat</option>
            <option value="Cotton">Cotton</option>
            <option value="Rice">Rice</option>
            <option value="Maize">Maize</option>
            <option value="Groundnut">Groundnut</option>
            <option value="Mustard">Mustard</option>
          </select>

          <span className="text-slate-400 font-medium ml-1">
            Showing <strong>{filteredFarms.length}</strong> records
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Farm ID</th>
                <th className="py-3 px-4">Farmer Name & Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Crop & Area</th>
                <th className="py-3 px-4">Soil Type</th>
                <th className="py-3 px-4 text-center">NIR / NDVI</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFarms.map((farm) => (
                <tr
                  key={farm.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => {
                    setSelectedFarmId(farm.id);
                    setActiveView('farm-profile');
                  }}
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {farm.id}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{farm.farmerName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{farm.farmerPhone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-800 font-medium">{farm.village}</p>
                    <p className="text-[11px] text-slate-500">{farm.district}, {farm.state}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{farm.crop}</p>
                    <p className="text-[11px] text-slate-500">{farm.area} acres • {farm.cropStage}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {farm.soilType}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="font-bold text-slate-900">{farm.nir}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-slate-700">{farm.ndvi}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-extrabold text-[11px] ${
                        farm.riskScore >= 75
                          ? 'bg-rose-100 text-rose-800'
                          : farm.riskScore >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {farm.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={farm.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedFarmId(farm.id);
                          setActiveView('farm-profile');
                        }}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFarmId(farm.id);
                          setActiveView('inspections');
                        }}
                        className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                        title="Conduct Field Inspection"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const farmer = farmers.find((item) => item.id === farm.farmerId);
                          if (!farmer || !window.confirm(`Anonymize and remove ${farmer.name} from active operations?`)) return;
                          try {
                            await removeFarmer(farmer.id);
                          } catch (error) {
                            addToast(error instanceof Error ? error.message : 'Unable to remove farmer', 'error');
                          }
                        }}
                        className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                        title="Anonymize and remove farmer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
