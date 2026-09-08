import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { FieldInspection, StatusLevel } from '../../types';
import {
  ClipboardCheck,
  Camera,
  MapPin,
  Upload,
  Plus,
  Compass,
  CheckCircle2,
  Calendar,
  User,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';

export const InspectionsView: React.FC = () => {
  const {
    inspections,
    farms,
    selectedFarmId,
    submitInspection,
    currentUser,
    setSelectedFarmId,
    setActiveView,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'logs' | 'new'>('logs');

  // Form state
  const [farmId, setFarmId] = useState(selectedFarmId || 'FRM-10234');
  const matchedFarm = farms.find((f) => f.id === farmId) || farms[0];

  const [issueType, setIssueType] = useState<FieldInspection['issueType']>('Water Stress');
  const [severity, setSeverity] = useState<StatusLevel>('URGENT');
  const [observedCondition, setObservedCondition] = useState('');
  const [farmerComments, setFarmerComments] = useState('');
  const [officerComments, setOfficerComments] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
  ]);
  const [gpsLocation, setGpsLocation] = useState({
    lat: matchedFarm ? matchedFarm.lat : 22.5645,
    lng: matchedFarm ? matchedFarm.lng : 72.9289,
    accuracyMeters: 3.2,
  });

  const handleCaptureGps = () => {
    if (matchedFarm) {
      setGpsLocation({
        lat: matchedFarm.lat,
        lng: matchedFarm.lng,
        accuracyMeters: 2.8,
      });
      addToast(`Ground truth GPS locked: ${matchedFarm.lat}°N, ${matchedFarm.lng}°E (2.8m)`, 'success');
    }
  };

  const handleAddSamplePhoto = (url: string) => {
    if (uploadedPhotos.length >= 4) {
      addToast('Maximum 4 photos per inspection', 'warning');
      return;
    }
    setUploadedPhotos((prev) => [...prev, url]);
    addToast('Field photograph attached with EXIF geodata', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observedCondition.trim()) {
      addToast('Please input ground observation notes', 'error');
      return;
    }

    submitInspection({
      farmId: matchedFarm.id,
      farmerName: matchedFarm.farmerName,
      district: matchedFarm.district,
      crop: matchedFarm.crop,
      issueType,
      observedCondition,
      severity,
      farmerComments: farmerComments || 'No verbal complaint lodged during visit.',
      officerComments: officerComments || 'Routine agronomic verification completed.',
      officerName: currentUser.name,
      photos: uploadedPhotos,
      gpsLocation,
      recommendedAction: recommendedAction || 'Follow standard irrigation and nutrient protocol.',
      status: 'VERIFIED',
    });

    setActiveTab('logs');
    setObservedCondition('');
    setFarmerComments('');
    setOfficerComments('');
    setRecommendedAction('');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            Field Inspections & Ground Truth Verification
          </h2>
          <p className="text-xs text-slate-500">
            Field Officer ground audit, photographic evidence, and crop distress validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inspection Logs ({inspections.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'new' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Conduct New Audit
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'logs' ? (
        /* Inspection History Cards */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {insp.id}
                      </span>
                      <StatusBadge status={insp.severity} size="sm" />
                    </div>
                    <span className="text-[10px] text-slate-400">{insp.inspectionDate}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                      <span>{insp.farmerName} • {insp.farmId}</span>
                      <span className="text-xs font-normal text-slate-500">{insp.district} ({insp.crop})</span>
                    </h4>
                    <span className="inline-block text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1">
                      Issue: {insp.issueType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{insp.observedCondition}"
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px] font-bold">Officer Assigned</span>
                      <span className="font-semibold text-slate-800">{insp.officerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px] font-bold">GPS Coordinate Accuracy</span>
                      <span className="font-mono text-slate-800">
                        {insp.gpsLocation.lat}, {insp.gpsLocation.lng} (±{insp.gpsLocation.accuracyMeters}m)
                      </span>
                    </div>
                  </div>

                  {/* Photos */}
                  {insp.photos && insp.photos.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Geotagged Photo Evidence:
                      </span>
                      <div className="flex gap-2">
                        {insp.photos.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt="Crop Evidence"
                            className="w-20 h-16 object-cover rounded-md border border-slate-300 shadow-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Status: <strong className="text-emerald-700 uppercase">{insp.status}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFarmId(insp.farmId);
                      setActiveView('farm-profile');
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View Farm Profile <Eye className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* New Field Inspection Form (PHASE 21) */
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                Ground Inspection & Spectral Verification Report
              </h3>
              <span className="text-[11px] text-slate-500">Inspector: {currentUser.name}</span>
            </div>

            {/* Farm Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Farm Parcel</label>
                <select
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} - {f.farmerName} ({f.district} • {f.crop})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Issue Observed</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="Water Stress">Water Stress / Drought Symptoms</option>
                  <option value="Pest Infestation">Pest / Disease Attack (Bollworm / Rust)</option>
                  <option value="Nutrient Deficiency">Nutrient Chlorosis (Nitrogen/Zinc)</option>
                  <option value="Salinity">Soil Salinity / Alkalinity Stunting</option>
                  <option value="Physical Damage">Hail / Wind / Mechanical Damage</option>
                  <option value="Normal Healthy">Normal Healthy Canopy</option>
                </select>
              </div>
            </div>

            {/* Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ground Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="URGENT">URGENT (Crop loss imminent without intervention)</option>
                  <option value="HIGH">HIGH (Significant stress observed)</option>
                  <option value="MODERATE">MODERATE (Early symptoms, manageable)</option>
                  <option value="SAFE">SAFE (Healthy vegetative condition)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">GPS Spatial Coordinates</label>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="h-3 w-3" /> Fetch Current GPS
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={`${gpsLocation.lat}°N, ${gpsLocation.lng}°E (±${gpsLocation.accuracyMeters}m)`}
                  className="w-full font-mono bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
                />
              </div>
            </div>

            {/* Field Observation Notes */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Visual Observations on Ground <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe leaf symptoms, soil moisture feel, rooting depth, weed competition, irrigation status..."
                value={observedCondition}
                onChange={(e) => setObservedCondition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Farmer Comments */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Farmer's Statement & Grievances
              </label>
              <input
                type="text"
                placeholder="e.g. Canal gate was shut for 7 days; power supply limited to 4 hours per day"
                value={farmerComments}
                onChange={(e) => setFarmerComments(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Recommended Action */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Officer Immediate Recommended Action
              </label>
              <input
                type="text"
                placeholder="e.g. Issue emergency irrigation notice to Taluka water board and provide foliar urea"
                value={recommendedAction}
                onChange={(e) => setRecommendedAction(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Photo Attachments */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Attach Photographic Ground Evidence
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt="Thumbnail"
                      className="w-20 h-16 object-cover rounded-md border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    handleAddSamplePhoto(
                      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&auto=format&fit=crop&q=80'
                    )
                  }
                  className="h-16 px-3 border border-dashed border-slate-300 hover:border-emerald-500 rounded-md flex flex-col items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  <Camera className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px] font-semibold">+ Attach Photo</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit & Verify Inspection</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
