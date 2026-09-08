import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Farm, StatusLevel } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  MapPin,
  Eye,
  ExternalLink,
  Info,
  Maximize2,
  Crosshair,
} from 'lucide-react';

interface InteractiveGisMapProps {
  heightClass?: string;
  focusFarmId?: string;
  showAllControls?: boolean;
}

// India-wide viewport for the authenticated marker registry.
const INDIA_BOUNDS = {
  minLat: 6,
  maxLat: 37.5,
  minLng: 68,
  maxLng: 97.5,
};

// Legacy district vectors are retained for the layer UI until district geometry
// is exposed by the backend; farm markers come from authenticated API data.
const DISTRICT_POLYGONS = [
  {
    name: 'Anand',
    lat: 22.56,
    lng: 72.93,
    path: 'M 580 430 L 610 425 L 625 450 L 605 475 L 575 465 Z',
    riskLevel: 'URGENT',
    farmsCount: 1420,
    urgentCount: 142,
    soil: 'Alluvial Loam',
  },
  {
    name: 'Kheda',
    lat: 22.69,
    lng: 72.86,
    path: 'M 565 390 L 605 385 L 610 425 L 580 430 L 555 410 Z',
    riskLevel: 'MODERATE',
    farmsCount: 1680,
    urgentCount: 110,
    soil: 'Black Cotton',
  },
  {
    name: 'Surat',
    lat: 21.28,
    lng: 72.95,
    path: 'M 575 580 L 620 570 L 635 620 L 590 640 L 565 605 Z',
    riskLevel: 'SAFE',
    farmsCount: 2150,
    urgentCount: 65,
    soil: 'Clayey Alluvial',
  },
  {
    name: 'Vadodara',
    lat: 22.24,
    lng: 73.08,
    path: 'M 605 475 L 645 460 L 660 510 L 620 535 L 595 500 Z',
    riskLevel: 'HIGH',
    farmsCount: 1890,
    urgentCount: 185,
    soil: 'Sandy Loam',
  },
  {
    name: 'Rajkot',
    lat: 21.96,
    lng: 70.79,
    path: 'M 310 440 L 375 415 L 400 460 L 360 510 L 290 480 Z',
    riskLevel: 'SAFE',
    farmsCount: 2420,
    urgentCount: 95,
    soil: 'Medium Black',
  },
  {
    name: 'Ahmedabad',
    lat: 22.98,
    lng: 72.38,
    path: 'M 495 340 L 550 330 L 565 390 L 525 420 L 480 380 Z',
    riskLevel: 'HIGH',
    farmsCount: 1540,
    urgentCount: 190,
    soil: 'Sandy Alluvium',
  },
  {
    name: 'Mehsana',
    lat: 23.29,
    lng: 72.33,
    path: 'M 480 270 L 545 255 L 560 315 L 500 335 L 465 295 Z',
    riskLevel: 'URGENT',
    farmsCount: 1350,
    urgentCount: 215,
    soil: 'Light Loamy Sand',
  },
  {
    name: 'Gandhinagar',
    lat: 23.42,
    lng: 72.66,
    path: 'M 545 295 L 585 290 L 595 330 L 555 335 Z',
    riskLevel: 'SAFE',
    farmsCount: 980,
    urgentCount: 38,
    soil: 'Alluvial Loam',
  },
  {
    name: 'Bhavnagar',
    lat: 21.70,
    lng: 71.97,
    path: 'M 410 490 L 475 480 L 490 540 L 435 565 L 395 520 Z',
    riskLevel: 'MODERATE',
    farmsCount: 1610,
    urgentCount: 120,
    soil: 'Coastal Alluvium',
  },
  {
    name: 'Sabarkantha',
    lat: 23.59,
    lng: 72.96,
    path: 'M 585 250 L 650 240 L 665 310 L 600 325 L 580 280 Z',
    riskLevel: 'URGENT',
    farmsCount: 1220,
    urgentCount: 164,
    soil: 'Red Sandy Loam',
  },
];

export const InteractiveGisMap: React.FC<InteractiveGisMapProps> = ({
  heightClass = 'h-[540px]',
  focusFarmId,
  showAllControls = true,
}) => {
  const { farms, setSelectedFarmId, setActiveView, selectedFarmId, filters, setFilters } = useApp();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activePopupFarm, setActivePopupFarm] = useState<Farm | null>(() => {
    if (focusFarmId) return farms.find((f) => f.id === focusFarmId) || null;
    return farms.find((f) => f.id === selectedFarmId) || farms[0] || null;
  });
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Map layer toggles as specified in PHASE 9
  const [layers, setLayers] = useState({
    districtBoundaries: true,
    farms: true,
    cropType: false,
    soilType: false,
    nir: false,
    ndvi: false,
    risk: true,
    rainfall: false,
    temperature: false,
    soilMoisture: false,
    satelliteImagery: true,
  });

  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);

  // SVG coordinate transformation function
  const projectGeoToSvg = (lat: number, lng: number) => {
    const width = 900;
    const height = 750;
    const x = ((lng - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) * width;
    const y = height - ((lat - INDIA_BOUNDS.minLat) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) * height;
    return { x, y };
  };

  // Filtered farms based on search or district
  const filteredFarms = useMemo(() => {
    return farms.filter((farm) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          farm.id.toLowerCase().includes(q) ||
          farm.farmerName.toLowerCase().includes(q) ||
          farm.district.toLowerCase().includes(q) ||
          farm.crop.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.district !== 'All' && farm.district.toLowerCase() !== filters.district.toLowerCase()) {
        return false;
      }
      if (filters.crop !== 'All' && !farm.crop.toLowerCase().includes(filters.crop.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [farms, searchQuery, filters]);

  const handleMarkerClick = (farm: Farm) => {
    setActivePopupFarm(farm);
    setSelectedFarmId(farm.id);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.8));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePopupFarm(null);
  };

  const getMarkerColor = (status: StatusLevel) => {
    switch (status) {
      case 'SAFE':
        return '#10b981'; // Green
      case 'MODERATE':
        return '#f59e0b'; // Yellow/Amber
      case 'HIGH':
        return '#f97316'; // Orange
      case 'URGENT':
        return '#ef4444'; // Red
      default:
        return '#64748b';
    }
  };

  return (
    <div
      id="interactive-gis-container"
      className={`relative w-full ${heightClass} bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md select-none`}
    >
      {/* Top Floating Search & Quick Filters */}
      {showAllControls && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72 bg-slate-900/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search farm ID, farmer, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
            <span className="text-slate-400">Viewing:</span>
            <span className="font-semibold text-emerald-400">
              {filters.district === 'All'
                ? (filters.state === 'All' ? 'All India scope' : `${filters.state} scope`)
                : `${filters.district} District`}
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-medium text-slate-300">{filteredFarms.length} Farms Pinpointed</span>
          </div>
        </div>
      )}

      {/* Layer Toggle Button & Drawer (PHASE 9) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-all cursor-pointer ${
            isLayersPanelOpen
              ? 'bg-emerald-600 text-white border border-emerald-500'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md'
          }`}
        >
          <Layers className="h-4 w-4 text-emerald-400" />
          <span>GIS Layers ({Object.values(layers).filter(Boolean).length})</span>
        </button>
      </div>

      {/* Layer Selector Drawer */}
      {isLayersPanelOpen && (
        <div className="absolute top-12 right-3 z-30 w-72 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-3 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              Active Map Layers
            </span>
            <button
              onClick={() => setIsLayersPanelOpen(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {[
              { key: 'districtBoundaries', label: 'District Boundaries', desc: 'Administrative borders' },
              { key: 'farms', label: 'Farm Markers (Status Coded)', desc: 'Individual monitored parcels' },
              { key: 'satelliteImagery', label: 'Sentinel-2 Satellite Base', desc: '10m resolution true-color' },
              { key: 'nir', label: 'NIR Reflectance Overlay', desc: 'Near-infrared canopy health' },
              { key: 'ndvi', label: 'NDVI Vegetation Heatmap', desc: 'Normalized difference index' },
              { key: 'risk', label: 'Composite Risk Engine Heatmap', desc: 'High & urgent stress zones' },
              { key: 'cropType', label: 'Crop Classification Mask', desc: 'Wheat, Cotton, Paddy zones' },
              { key: 'soilType', label: 'Soil Survey Polygonal Layer', desc: 'Alluvial, Black Cotton, Loam' },
              { key: 'rainfall', label: 'Rainfall Radar (IMD Feeds)', desc: 'Precipitation isohyets' },
              { key: 'temperature', label: 'Surface Thermal Bands', desc: 'Land surface temperature (°C)' },
              { key: 'soilMoisture', label: 'Root-Zone Soil Moisture', desc: 'SMAP / in-situ telemetry' },
            ].map((layer) => (
              <label
                key={layer.key}
                className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={layers[layer.key as keyof typeof layers]}
                  onChange={(e) =>
                    setLayers((prev) => ({
                      ...prev,
                      [layer.key]: e.target.checked,
                    }))
                  }
                  className="mt-0.5 rounded-sm border-slate-700 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                />
                <div>
                  <p className="font-medium text-slate-200 leading-tight">{layer.label}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{layer.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
            <span>Projection: EPSG:4326</span>
            <button
              onClick={() =>
                setLayers({
                  districtBoundaries: true,
                  farms: true,
                  cropType: false,
                  soilType: false,
                  nir: true,
                  ndvi: true,
                  risk: true,
                  rainfall: false,
                  temperature: false,
                  soilMoisture: false,
                  satelliteImagery: true,
                })
              }
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Reset to Recommended
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas / SVG Viewport */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 900 750"
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Base GIS Graticule Grid */}
          <defs>
            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>

            {/* Satellite Imagery Raster Simulation Texture */}
            <radialGradient id="satTexture" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.6" />
              <stop offset="35%" stopColor="#065f46" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#14532d" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
            </radialGradient>

            {/* NIR False Color Infrared Filter */}
            <linearGradient id="nirInfrared" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991b1b" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#dc2626" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.35" />
            </linearGradient>

            {/* NDVI Chlorophyll Reflectance Gradient */}
            <linearGradient id="ndviGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803d" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#84cc16" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
            </linearGradient>

            {/* Rain Radar Gradient */}
            <radialGradient id="rainRadar" cx="65%" cy="75%" r="40%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>

            {/* Risk Heatmap Filter */}
            <radialGradient id="urgentRiskHeatmap" cx="62%" cy="55%" r="25%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="900" height="750" fill="#090d16" />
          <rect width="900" height="750" fill="url(#gisGrid)" />

          {/* Satellite Layer */}
          {layers.satelliteImagery && (
            <g id="satellite-raster-layer">
              <ellipse cx="480" cy="420" rx="380" ry="300" fill="url(#satTexture)" filter="blur(20px)" />
            </g>
          )}

          {/* NIR False-Color Layer */}
          {layers.nir && (
            <g id="nir-layer">
              <ellipse cx="580" cy="420" rx="160" ry="120" fill="url(#nirInfrared)" filter="blur(15px)" />
              <ellipse cx="340" cy="460" rx="120" ry="100" fill="url(#nirInfrared)" filter="blur(18px)" />
            </g>
          )}

          {/* NDVI Layer */}
          {layers.ndvi && (
            <g id="ndvi-layer">
              <ellipse cx="500" cy="380" rx="280" ry="200" fill="url(#ndviGradient)" filter="blur(16px)" />
            </g>
          )}

          {/* Rainfall Radar Layer */}
          {layers.rainfall && (
            <g id="rain-layer">
              <circle cx="590" cy="580" r="140" fill="url(#rainRadar)" filter="blur(8px)" />
            </g>
          )}

          {/* Risk Heatmap Layer */}
          {layers.risk && (
            <g id="risk-heatmap-layer">
              <circle cx="580" cy="430" r="110" fill="url(#urgentRiskHeatmap)" filter="blur(14px)" />
              <circle cx="490" cy="280" r="80" fill="url(#urgentRiskHeatmap)" filter="blur(14px)" />
            </g>
          )}

          {/* District Polygons */}
          {layers.districtBoundaries && false && (
            <g id="district-boundaries-layer">
              {DISTRICT_POLYGONS.map((dist) => {
                const isHovered = hoveredDistrict === dist.name;
                const isSelected = filters.district === dist.name;

                return (
                  <g key={dist.name}>
                    <path
                      d={dist.path}
                      fill={
                        isSelected
                          ? '#047857'
                          : isHovered
                          ? '#1e293b'
                          : dist.riskLevel === 'URGENT'
                          ? '#450a0a'
                          : '#0f172a'
                      }
                      fillOpacity={isSelected ? 0.7 : isHovered ? 0.6 : 0.35}
                      stroke={isSelected ? '#34d399' : isHovered ? '#38bdf8' : '#334155'}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                      strokeDasharray={dist.riskLevel === 'URGENT' ? '4 2' : undefined}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredDistrict(dist.name)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          district: prev.district === dist.name ? 'All' : dist.name,
                        }));
                      }}
                    />
                    {/* District Label */}
                    <text
                      x={dist.lat ? projectGeoToSvg(dist.lat, dist.lng).x : 500}
                      y={dist.lng ? projectGeoToSvg(dist.lat, dist.lng).y - 6 : 400}
                      fill={isSelected ? '#a7f3d0' : '#94a3b8'}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none tracking-wider uppercase font-sans"
                    >
                      {dist.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Farm Parcel Markers (PHASE 10) */}
          {layers.farms && (
            <g id="farm-markers-layer">
              {filteredFarms.map((farm) => {
                const { x, y } = projectGeoToSvg(farm.lat, farm.lng);
                const color = getMarkerColor(farm.status);
                const isSelected = selectedFarmId === farm.id;
                const isUrgent = farm.status === 'URGENT';

                return (
                  <g
                    key={farm.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer group"
                    onClick={() => handleMarkerClick(farm)}
                  >
                    {/* Pulsing ring for urgent or selected */}
                    {(isUrgent || isSelected) && (
                      <circle
                        r={isSelected ? 16 : 12}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        opacity="0.75"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer glow circle */}
                    <circle
                      r={isSelected ? 10 : 7}
                      fill={color}
                      fillOpacity="0.25"
                      stroke={color}
                      strokeWidth="1"
                    />

                    {/* Center Pin Marker */}
                    <circle
                      r={isSelected ? 6 : 4.5}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2 : 1.2}
                      className="transition-transform duration-150 group-hover:scale-125"
                    />

                    {/* Compact Label */}
                    <text
                      y={-10}
                      fill="#f8fafc"
                      fontSize={isSelected ? '9' : '8'}
                      fontWeight="600"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-md"
                    >
                      {farm.farmerName.split(' ')[0]} ({farm.crop})
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Farm Details Popup Card (PHASE 10 & 33) */}
      {activePopupFarm && (
        <div
          id="map-farm-popup"
          className="absolute bottom-4 left-4 z-30 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl p-4 text-white animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">{activePopupFarm.farmerName}</h4>
                <StatusBadge status={activePopupFarm.status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-400">
                Farm ID: <span className="font-mono text-emerald-400 font-semibold">{activePopupFarm.id}</span> • {activePopupFarm.village}, {activePopupFarm.district}
              </p>
            </div>
            <button
              onClick={() => setActivePopupFarm(null)}
              className="text-slate-400 hover:text-white text-sm cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 mb-3 text-center bg-slate-950/70 rounded-lg p-2 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Crop & Area</span>
              <span className="text-xs font-bold text-white">{activePopupFarm.crop}</span>
              <span className="text-[10px] text-slate-400 block">{activePopupFarm.area} acres</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">NIR / NDVI</span>
              <span className="text-xs font-bold text-emerald-400">
                {activePopupFarm.nir} / {activePopupFarm.ndvi}
              </span>
              <span className="text-[10px] text-slate-400 block">Reflectance</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Risk Score</span>
              <span
                className={`text-xs font-extrabold ${
                  activePopupFarm.riskScore >= 75
                    ? 'text-rose-500'
                    : activePopupFarm.riskScore >= 50
                    ? 'text-amber-500'
                    : 'text-emerald-400'
                }`}
              >
                {activePopupFarm.riskScore} / 100
              </span>
              <span className="text-[10px] text-slate-400 block">{activePopupFarm.status}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 mb-3">
            <span>Soil: {activePopupFarm.soilType}</span>
            <span>Rain: {activePopupFarm.rainfall} mm</span>
            <span>Temp: {activePopupFarm.temperature}°C</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedFarmId(activePopupFarm.id);
                setActiveView('farm-profile');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View Full Farm Profile</span>
            </button>
            <button
              onClick={() => {
                setSelectedFarmId(activePopupFarm.id);
                setActiveView('inspections');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Schedule field inspection"
            >
              <Crosshair className="h-3.5 w-3.5 text-amber-400" />
              <span>Inspect</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Map Navigation & Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
        {/* Map Legend */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300">
          <span className="font-semibold text-white">Status:</span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Urgent
          </span>
        </div>

        {/* Zoom In / Out / Reset buttons */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <button
            onClick={handleReset}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
