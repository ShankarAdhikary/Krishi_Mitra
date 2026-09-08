export type StatusLevel = 'SAFE' | 'MODERATE' | 'HIGH' | 'URGENT' | 'UNKNOWN';

export type UserRole = 'ADMIN' | 'DISTRICT_OFFICER' | 'FIELD_OFFICER' | 'ANALYST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  district?: string;
  avatar?: string;
}

export interface Farm {
  id: string; // e.g. FRM-10234
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  district: string;
  state: string;
  crop: string;
  cropStage: string;
  area: number; // acres
  soilType: string;
  irrigationType: string;
  lat: number;
  lng: number;
  riskScore: number; // 0 - 100
  status: StatusLevel;
  nir: number; // 0.0 - 1.0 (e.g. 0.42)
  ndvi: number; // 0.0 - 1.0 (e.g. 0.38)
  soilMoisture: number; // % (e.g. 21)
  rainfall: number; // mm (e.g. 42)
  temperature: number; // °C (e.g. 35)
  humidity: number; // %
  lastSatellitePass: string;
  alertCount: number;
  assignedOfficer?: string;
}

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  village: string;
  district: string;
  state: string;
  aadhaarMasked?: string;
  farmsCount: number;
  primaryCrop: string;
  totalArea: number;
  status: StatusLevel;
  registeredDate: string;
}

export interface HistoricalRecord {
  date: string;
  month: string;
  nir: number;
  ndvi: number;
  rainfall: number;
  temperature: number;
  soilMoisture: number;
}

export type AlertLifecycle = 'GENERATED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED';

export interface Alert {
  id: string;
  farmId: string;
  farmerName: string;
  district: string;
  crop: string;
  severity: StatusLevel;
  title: string;
  description: string;
  triggerMetric: string;
  triggerValue: string;
  threshold: string;
  status: AlertLifecycle;
  createdAt: string;
  assignedOfficer?: string;
  resolutionNotes?: string;
}

export interface CustomAlertRule {
  id: string;
  name: string;
  metric: 'NIR' | 'NDVI' | 'RAINFALL' | 'SOIL_MOISTURE' | 'TEMPERATURE';
  operator: '<' | '>' | 'DECREASE_PERCENT';
  value: number;
  severity: StatusLevel;
  district: string;
  crop: string;
  enabled: boolean;
}

export interface FieldInspection {
  id: string;
  farmId: string;
  farmerName: string;
  district: string;
  crop: string;
  issueType: 'Water Stress' | 'Yellowing / Chlorosis' | 'Pest Infestation' | 'Lodging' | 'Salinity / Alkaline' | 'Nutrient Deficiency';
  observedCondition: string;
  severity: StatusLevel;
  farmerComments: string;
  officerComments: string;
  officerName: string;
  inspectionDate: string;
  photos: string[];
  gpsLocation: {
    lat: number;
    lng: number;
    accuracyMeters: number;
  };
  recommendedAction: string;
  status: 'PENDING' | 'VERIFIED' | 'RESOLVED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue: string;
  newValue: string;
  ipAddress: string;
}

export interface DataQualityMetrics {
  farmerRecords: number; // e.g. 98.7
  farmCoordinates: number; // e.g. 99.1
  nirData: number; // e.g. 96.4
  ndviData: number; // e.g. 97.8
  weatherData: number; // e.g. 99.9
  missingRecords: number; // 142
  invalidCoordinates: number; // 23
  duplicateFarmers: number; // 11
  outdatedData: number; // 38
}

export interface SystemHealthMetrics {
  apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  databaseStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  gisStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  satelliteStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  weatherStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  aiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  cpuPercent: number;
  memoryPercent: number;
  databaseLoadPercent: number;
  lastSync: string;
}

export interface AppNotification {
  id: string;
  category: 'URGENT' | 'WEATHER' | 'NIR' | 'INSPECTION';
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  farmId?: string;
}

export interface AiInsight {
  farmId: string;
  farmerName: string;
  crop: string;
  observed: string[];
  potentialInterpretation: string;
  suggestedAction: string;
  confidence: number;
  source: string;
}
