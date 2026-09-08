import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  MapPin,
  CheckCircle2,
  Tractor,
  Shield,
  Compass,
  ArrowLeft,
} from 'lucide-react';

export const FarmerRegisterView: React.FC = () => {
  const { addFarmerAndFarm, setActiveView, addToast, geography } = useApp();
  const [formData, setFormData] = useState({
    // Farmer fields
    name: '',
    phone: '',
    email: '',
    aadhaar: '',
    village: 'Mogri',
    taluka: 'Anand',
    district: 'Anand',
    state: 'Gujarat',
    address: '',

    // Farm parcel fields
    surveyNo: 'Survey 142/3',
    crop: 'Wheat',
    cropStage: 'Vegetative Growth',
    area: '4.5',
    soilType: 'Alluvial Loam',
    irrigationType: 'Drip Irrigation',
    lat: '22.5645',
    lng: '72.9289',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const districts = geography.districts_by_state[formData.state] || [];

  const handleCaptureGps = () => {
    // Generate realistic coordinate in Gujarat within Anand/Kheda basin
    const lat = (22.50 + Math.random() * 0.25).toFixed(4);
    const lng = (72.85 + Math.random() * 0.25).toFixed(4);
    setFormData((prev) => ({ ...prev, lat, lng }));
    addToast(`GPS coordinates captured with 3.2m accuracy: ${lat}°N, ${lng}°E`, 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      addToast('Please enter farmer name and contact phone number', 'error');
      return;
    }

    setIsSubmitting(true);

    const farmerData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      village: formData.village,
      district: formData.district,
      state: formData.state,
      address: formData.address || `${formData.village}, ${formData.taluka}`,
    };

    const farmData = {
      crop: formData.crop,
      cropStage: formData.cropStage,
      area: parseFloat(formData.area) || 4.0,
      soilType: formData.soilType,
      irrigationType: formData.irrigationType,
      lat: parseFloat(formData.lat) || 22.56,
      lng: parseFloat(formData.lng) || 72.92,
    };

    try {
      await addFarmerAndFarm(farmerData, farmData);
      setActiveView('farm-profile');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Unable to register farmer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('farmers')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Farmer & Agricultural Parcel Registration
            </h2>
            <p className="text-xs text-slate-500">
              Onboard new farmer holding into the National Agricultural GIS Database
            </p>
          </div>
        </div>

        <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
          Step 1 of 1: Unified Cadastre
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Farmer Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              1. Farmer Identification Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Full Farmer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jayeshbhai Motibhai Patel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Mobile Number (+91) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98251 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Aadhaar (Last 4 Digits / Masked)
              </label>
              <input
                type="text"
                placeholder="XXXX-XXXX-4592"
                value={formData.aadhaar}
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">State</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, district: geography.districts_by_state[e.target.value]?.[0] || '' })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {geography.states.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">District</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {districts.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Village / Gram Panchayat</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Farm Parcel & Cadastral Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Tractor className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              2. Agricultural Parcel & Agronomic Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Khasra / Survey Number
              </label>
              <input
                type="text"
                value={formData.surveyNo}
                onChange={(e) => setFormData({ ...formData, surveyNo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Primary Crop Cultivated
              </label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="Wheat">Wheat (Rabi)</option>
                <option value="Cotton">Cotton (Kharif)</option>
                <option value="Rice">Rice / Paddy</option>
                <option value="Maize">Maize</option>
                <option value="Groundnut">Groundnut</option>
                <option value="Mustard">Mustard</option>
                <option value="Bajra">Bajra (Pearl Millet)</option>
                <option value="Castor">Castor</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Current Growth Stage
              </label>
              <select
                value={formData.cropStage}
                onChange={(e) => setFormData({ ...formData, cropStage: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Sowing / Germination">Sowing / Germination</option>
                <option value="Vegetative Growth">Vegetative Growth</option>
                <option value="Tillering / Branching">Tillering / Branching</option>
                <option value="Flowering / Heading">Flowering / Heading</option>
                <option value="Grain / Boll Filling">Grain / Boll Filling</option>
                <option value="Maturity / Harvest">Maturity / Harvest</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Total Parcel Area (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="50"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Soil Classification
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Alluvial Loam">Alluvial Loam (High Fertility)</option>
                <option value="Black Cotton Soil">Black Cotton Soil (High Moisture Retention)</option>
                <option value="Deep Clayey Alluvial">Deep Clayey Alluvial</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Light Loamy Sand">Light Loamy Sand</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Irrigation Infrastructure
              </label>
              <select
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Drip Irrigation">Micro-Drip Irrigation</option>
                <option value="Canal Flooding">Canal Sub-branch Flooding</option>
                <option value="Tubewell / Borewell">Tubewell / Borewell</option>
                <option value="Sprinkler System">Micro-Sprinkler System</option>
                <option value="Rainfed (No Irrigation)">Rainfed (Dryland)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: GIS Georeferencing */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                3. GIS Georeferencing & Spatial Boundary
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCaptureGps}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Simulate GPS Capture</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Latitude (WGS 84 Decimal Degrees)
              </label>
              <input
                type="text"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Longitude (WGS 84 Decimal Degrees)
              </label>
              <input
                type="text"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Entering coordinates automatically queues the Sentinel-2 / Landsat-9 10m multi-spectral ingestion pipeline for this parcel polygon.
          </p>
        </div>

        {/* Form Submission */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveView('farmers')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSubmitting ? 'Registering Parcel...' : 'Save & Plot On GIS Map'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
