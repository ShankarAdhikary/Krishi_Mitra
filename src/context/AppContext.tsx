import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Farm,
  Farmer,
  Alert,
  CustomAlertRule,
  FieldInspection,
  AuditLog,
  AppNotification,
  UserRole,
  AlertLifecycle,
  StatusLevel,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_FARMS,
  INITIAL_FARMERS,
  INITIAL_ALERTS,
  INITIAL_ALERT_RULES,
  INITIAL_INSPECTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockDatabase';
import {
  getCurrentUser,
  getDashboardAggregates,
  getDashboardTrends,
  getRegistry,
  getPlotMarkers,
  getAlerts,
  updateAlert,
  loginRequest,
  setAccessToken,
  registerFarmer,
  createPlot,
  deleteFarmer,
  getGeography,
} from '../services/api';

export type ActiveView =
  | 'dashboard'
  | 'map'
  | 'farmers'
  | 'farmer-register'
  | 'farm-profile'
  | 'alerts'
  | 'analytics'
  | 'inspections'
  | 'reports'
  | 'admin-users'
  | 'admin-data-quality'
  | 'admin-audit'
  | 'admin-system'
  | 'settings';

interface GlobalFilters {
  state: string;
  district: string;
  crop: string;
  soil: string;
  dateRange: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;

  farms: Farm[];
  farmers: Farmer[];
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  selectedFarm: Farm | undefined;
  dashboardData: {
    total_plots?: number;
    alert_rate?: number;
    nri_percent?: number | null;
    summary?: Record<string, number>;
  } | null;
  trendsData: {
    series?: Array<Record<string, number | string | null>>;
    environmental_series?: Array<Record<string, number | string | null>>;
    crop_summary?: Array<Record<string, number | string | null>>;
    soil_summary?: Array<Record<string, number | string | null>>;
  } | null;
  registryData: {
    total_farmers?: number;
    total_plots?: number;
    farmers?: Array<Record<string, unknown>>;
  } | null;
  geography: {
    states: string[];
    districts_by_state: Record<string, string[]>;
  };
  refreshBackendData: () => Promise<void>;

  alerts: Alert[];
  alertRules: CustomAlertRule[];
  inspections: FieldInspection[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];

  addFarmerAndFarm: (farmerData: Partial<Farmer>, farmData: Partial<Farm>) => Promise<void>;
  removeFarmer: (farmerId: string) => Promise<void>;
  updateAlertStatus: (alertId: string, newStatus: AlertLifecycle, notes?: string) => Promise<void>;
  addAlertRule: (rule: Omit<CustomAlertRule, 'id'>) => void;
  toggleAlertRule: (ruleId: string) => void;
  submitInspection: (inspection: Omit<FieldInspection, 'id' | 'inspectionDate'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(sessionStorage.getItem('krishi-mitra-token')),
  );
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('FRM-10234');
  const [dashboardData, setDashboardData] = useState<AppContextType['dashboardData']>(null);
  const [trendsData, setTrendsData] = useState<AppContextType['trendsData']>(null);
  const [registryData, setRegistryData] = useState<AppContextType['registryData']>(null);
  const [geography, setGeography] = useState<AppContextType['geography']>({ states: [], districts_by_state: {} });

  const [filters, setFilters] = useState<GlobalFilters>({
    state: 'All',
    district: 'All',
    crop: 'All',
    soil: 'All',
    dateRange: 'Kharif-Rabi 2026',
  });

  const [farms, setFarms] = useState<Farm[]>(() => {
    const saved = localStorage.getItem('agri_farms');
    return saved ? JSON.parse(saved) : INITIAL_FARMS;
  });

  const [farmers, setFarmers] = useState<Farmer[]>(() => {
    const saved = localStorage.getItem('agri_farmers');
    return saved ? JSON.parse(saved) : INITIAL_FARMERS;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('agri_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [alertRules, setAlertRules] = useState<CustomAlertRule[]>(INITIAL_ALERT_RULES);
  const [inspections, setInspections] = useState<FieldInspection[]>(INITIAL_INSPECTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist state updates to localStorage for seamless simulation
  useEffect(() => {
    localStorage.setItem('agri_farms', JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    localStorage.setItem('agri_farmers', JSON.stringify(farmers));
  }, [farmers]);

  useEffect(() => {
    localStorage.setItem('agri_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = 't_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(matched);
    addToast(`Switched active session to: ${matched.name} (${matched.designation})`, 'info');
  };

  const login = async (email: string, password: string) => {
    const session = await loginRequest(email, password);
    setAccessToken(session.access_token);
    const backendUser = await getCurrentUser();
    const roleMap: Record<string, UserRole> = {
      admin: 'ADMIN',
      district_officer: 'DISTRICT_OFFICER',
      field_officer: 'FIELD_OFFICER',
      analyst: 'ANALYST',
      viewer: 'ANALYST',
    };
    const role = roleMap[backendUser.role.toLowerCase()] || 'ANALYST';
    const existing = DEMO_USERS.find((user) => user.role === role);
    setCurrentUser({
      ...(existing || DEMO_USERS[0]),
      id: backendUser.user_id,
      email: backendUser.email,
      role,
      name: backendUser.email.split('@')[0],
    });
    setIsAuthenticated(true);
    addToast(`Welcome back, ${backendUser.email}. Permissions loaded.`, 'success');
  };

  const logout = () => {
    setAccessToken('');
    setIsAuthenticated(false);
    addToast('You have been logged out securely.', 'info');
  };

  const refreshBackendData = async () => {
    const state = filters.state !== 'All' ? filters.state : undefined;
    const district = filters.district !== 'All' ? filters.district : undefined;
    getGeography().then(setGeography).catch(() => undefined);
    // Keep the headline metrics independent from the heavier registry and map
    // queries. A slow map query must not leave the dashboard showing zeros.
    const aggregateRequest = getDashboardAggregates(state, district);
    const trendsRequest = getDashboardTrends(state, district);
    const registryRequest = getRegistry(state, district);
    const markersRequest = getPlotMarkers(state, district);
    const aggregates = await aggregateRequest;
    setDashboardData(aggregates);
    const [trends, registry, markers] = await Promise.all([
      trendsRequest.catch(() => ({ series: [], environmental_series: [], crop_summary: [], soil_summary: [] })),
      registryRequest.catch(() => ({ total_farmers: 0, total_plots: 0, farmers: [] })),
      markersRequest.catch(() => [] as Awaited<ReturnType<typeof getPlotMarkers>>),
    ]);
    setTrendsData(trends);
    setRegistryData(registry);
    getAlerts(state, district).then((backendAlerts) => {
      setAlerts(backendAlerts.map((alert) => ({
        id: alert.alert_id,
        farmId: alert.plot_id,
        farmerName: alert.farmer_name,
        district: alert.district || '',
        crop: alert.crop,
        severity: (alert.severity || 'MODERATE') as StatusLevel,
        title: alert.title,
        description: alert.description,
        triggerMetric: alert.trigger_metric || '',
        triggerValue: alert.trigger_value || '',
        threshold: alert.threshold || '',
        status: alert.status as AlertLifecycle,
        createdAt: alert.created_at,
        assignedOfficer: alert.assigned_user_id || undefined,
        resolutionNotes: alert.resolution_notes || undefined,
      })));
    }).catch(() => undefined);
    const registryFarmers = registry.farmers || [];
    setFarmers(
      registryFarmers.map((farmer) => ({
        id: String(farmer.farmer_id),
        name: String(farmer.name || 'Unnamed farmer'),
        phone: String(farmer.phone_number || ''),
        email: '',
        address: '',
        village: String(farmer.plots?.[0]?.village || ''),
        district: String(farmer.district || ''),
        state: String(farmer.state || ''),
        farmsCount: Array.isArray(farmer.plots) ? farmer.plots.length : 0,
        primaryCrop: String(farmer.plots?.[0]?.crop || ''),
        totalArea: Number(farmer.plots?.reduce((sum: number, plot: any) => sum + Number(plot.size_acres || 0), 0) || 0),
        status: farmer.status === 'active' ? 'SAFE' : 'UNKNOWN',
        registeredDate: String(farmer.registered_at || ''),
      })),
    );
    const markersByPlot = new Map(markers.map((marker) => [marker.plot_id, marker]));
    setFarms(
      registryFarmers.flatMap((farmer) =>
        (Array.isArray(farmer.plots) ? farmer.plots : []).map((plot: any) => {
          const marker = markersByPlot.get(String(plot.plot_id));
          return {
          id: String(plot.plot_id),
          farmerId: String(farmer.farmer_id),
          farmerName: String(farmer.name || ''),
          farmerPhone: String(farmer.phone_number || ''),
          village: String(plot.village || ''),
          district: String(farmer.district || ''),
          state: String(farmer.state || ''),
          crop: String(plot.crop || ''),
          cropStage: '',
          area: Number(plot.size_acres || 0),
          soilType: '',
          irrigationType: '',
          lat: marker?.latitude || 0,
          lng: marker?.longitude || 0,
          riskScore: 0,
          status: marker?.urgency || marker?.status || (plot.status === 'active' ? 'UNKNOWN' : 'UNKNOWN'),
          nir: marker?.nir || 0,
          ndvi: marker?.ndvi || 0,
          soilMoisture: 0,
          rainfall: 0,
          temperature: 0,
          humidity: 0,
          lastSatellitePass: String(plot.last_ingestion_at || ''),
          alertCount: 0,
          };
        }),
      ),
    );
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshBackendData().catch((error) => {
      addToast(error instanceof Error ? error.message : 'Unable to load backend data', 'error');
    });
  }, [isAuthenticated, filters.state, filters.district]);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  const logAudit = (action: string, entity: string, entityId: string, prev: string, next: string) => {
    const newLog: AuditLog = {
      id: 'AUD-' + (auditLogs.length + 905),
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString(),
      user: currentUser.name,
      role: currentUser.role,
      action,
      entity,
      entityId,
      previousValue: prev,
      newValue: next,
      ipAddress: '10.142.12.88 (Secure VPN)',
    };
    setAuditLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  const addFarmerAndFarm = async (farmerData: Partial<Farmer>, farmData: Partial<Farm>) => {
    const farmer = await registerFarmer({
      phone_number: farmerData.phone || '',
      name: farmerData.name,
      state: farmerData.state,
      district: farmerData.district,
      preferred_language: 'hi',
      registration_channel: 'institutional_web',
      consent_given: true,
    });
    const plot = await createPlot({
      farmer_id: farmer.farmer_id,
      plot_nickname: farmData.id,
      latitude: farmData.lat,
      longitude: farmData.lng,
      village_name: farmData.village,
      crop_type: (farmData.crop || 'wheat').toLowerCase(),
      plot_size_declared: farmData.area,
    });
    await refreshBackendData();
    setSelectedFarmId(plot.plot_id);
    logAudit('Registered New Farmer & Parcel', 'Farmer/Farm', plot.plot_id, 'None', `Registered ${farmer.name || 'farmer'} (${plot.crop_type})`);
    addToast(`Farmer ${farmer.name || 'record'} registered successfully.`, 'success');
  };

  const removeFarmer = async (farmerId: string) => {
    const farmer = farmers.find((item) => item.id === farmerId);
    await deleteFarmer(farmerId);
    await refreshBackendData();
    logAudit('Anonymized Farmer Data', 'Farmer', farmerId, farmer?.name || 'Unknown', 'Anonymized');
    addToast('Farmer data was anonymized and removed from active operations.', 'success');
  };

  const updateAlertStatus = async (alertId: string, newStatus: AlertLifecycle, notes?: string) => {
    const current = alerts.find((alert) => alert.id === alertId);
    const updated = await updateAlert(alertId, { status: newStatus, resolution_notes: notes });
    setAlerts((prev) => prev.map((alert) => alert.id === alertId ? {
      ...alert,
      status: updated.status as AlertLifecycle,
      resolutionNotes: updated.resolution_notes || undefined,
    } : alert));
    logAudit('Updated Alert Lifecycle', 'Alert', alertId, `Status: ${current?.status || 'unknown'}`, `Status: ${newStatus}`);
    addToast(`Alert ${alertId} transitioned to ${newStatus}`, 'info');
  };

  const addAlertRule = (ruleData: Omit<CustomAlertRule, 'id'>) => {
    const newRule: CustomAlertRule = {
      ...ruleData,
      id: 'RULE-' + String(alertRules.length + 1).padStart(2, '0'),
    };
    setAlertRules((prev) => [...prev, newRule]);
    logAudit('Created Custom Alert Rule', 'AlertRule', newRule.id, 'None', `${newRule.name}: ${newRule.metric} ${newRule.operator} ${newRule.value}`);
    addToast(`Alert Rule "${newRule.name}" activated!`, 'success');
  };

  const toggleAlertRule = (ruleId: string) => {
    setAlertRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const updated = !r.enabled;
          logAudit('Toggled Alert Rule', 'AlertRule', ruleId, `Enabled: ${r.enabled}`, `Enabled: ${updated}`);
          return { ...r, enabled: updated };
        }
        return r;
      })
    );
  };

  const submitInspection = (inspectionData: Omit<FieldInspection, 'id' | 'inspectionDate'>) => {
    const newId = 'INSP-' + (1092 + inspections.length);
    const newInspection: FieldInspection = {
      ...inspectionData,
      id: newId,
      inspectionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInspections((prev) => [newInspection, ...prev]);

    // Also update farm status if severity is specified
    setFarms((prev) =>
      prev.map((f) => {
        if (f.id === inspectionData.farmId) {
          return {
            ...f,
            status: inspectionData.severity,
            riskScore: inspectionData.severity === 'URGENT' ? 88 : inspectionData.severity === 'HIGH' ? 74 : f.riskScore,
          };
        }
        return f;
      })
    );

    logAudit('Submitted Field Inspection', 'FieldInspection', newId, 'None', `Farm: ${newInspection.farmId}, Issue: ${newInspection.issueType}, Severity: ${newInspection.severity}`);
    addToast(`Field Inspection ${newId} logged with GPS verification. Farm profile updated.`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        activeView,
        setActiveView,
        filters,
        setFilters,
        farms,
        farmers,
        selectedFarmId,
        setSelectedFarmId,
        selectedFarm,
        dashboardData,
        trendsData,
        registryData,
        refreshBackendData,
        alerts,
        alertRules,
        inspections,
        auditLogs,
        notifications,
        addFarmerAndFarm,
        removeFarmer,
        geography,
        updateAlertStatus,
        addAlertRule,
        toggleAlertRule,
        submitInspection,
        markNotificationRead,
        markAllNotificationsRead,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
