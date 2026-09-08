const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

let accessToken = sessionStorage.getItem('krishi-mitra-token') || '';

export function setAccessToken(token: string) {
  accessToken = token;
  if (token) {
    sessionStorage.setItem('krishi-mitra-token', token);
  } else {
    sessionStorage.removeItem('krishi-mitra-token');
  }
}

export function getAccessToken() {
  return accessToken;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Keep the module token aligned with the active browser session. This matters
  // after a login or hot reload, when the module was initialized before the
  // current session token was written.
  const sessionToken = sessionStorage.getItem('krishi-mitra-token') || '';
  if (sessionToken && sessionToken !== accessToken) accessToken = sessionToken;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Some successful endpoints may not return a JSON body.
  }

  if (!response.ok) {
    const detail =
      typeof body === 'object' && body !== null && 'detail' in body
        ? String(body.detail)
        : `Backend request failed (${response.status})`;
    const error = new Error(detail);
    if (response.status === 401) {
      setAccessToken('');
    }
    throw error;
  }

  return body as T;
}

export async function loginRequest(email: string, password: string) {
  return apiRequest<{ access_token: string; token_type: string }>('/institutional/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export type InstitutionalUserResponse = {
  user_id: string;
  email: string;
  role: string;
  assigned_geography: { states?: string[]; districts?: string[] };
};

export function getCurrentUser() {
  return apiRequest<InstitutionalUserResponse>('/institutional/me');
}

export type GeographyResponse = {
  states: string[];
  districts_by_state: Record<string, string[]>;
};

export function getGeography() {
  return apiRequest<GeographyResponse>('/dashboard/geography');
}

export function registerFarmer(payload: {
  phone_number: string;
  name?: string;
  preferred_language?: string;
  state?: string;
  district?: string;
  registration_channel?: string;
  consent_given: boolean;
}) {
  return apiRequest<{
    farmer_id: string;
    phone_number: string;
    name?: string | null;
    state?: string | null;
    district?: string | null;
    status: string;
    created_at: string;
  }>('/farmers/register', { method: 'POST', body: JSON.stringify(payload) });
}

export function createPlot(payload: {
  farmer_id: string;
  plot_nickname?: string;
  latitude?: number;
  longitude?: number;
  village_name?: string;
  crop_type: string;
  plot_size_declared?: number;
}) {
  return apiRequest<{
    plot_id: string;
    farmer_id: string;
    crop_type: string;
    plot_size_declared?: number | null;
    village_name?: string | null;
    status: string;
  }>('/plots/create', { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteFarmer(farmerId: string) {
  return apiRequest<{ status: string; farmer_id: string; plots_redacted: number }>(
    `/farmers/${encodeURIComponent(farmerId)}`,
    { method: 'DELETE' },
  );
}

export function getDashboardAggregates(state?: string, district?: string, windowDays = 7) {
  const query = new URLSearchParams({ window_days: String(windowDays) });
  if (state) query.set('state', state);
  if (district) query.set('district', district);
  return apiRequest(`/dashboard/aggregates?${query}`);
}

export function getDashboardTrends(state?: string, district?: string, windowDays = 14) {
  const query = new URLSearchParams({ window_days: String(windowDays) });
  if (state) query.set('state', state);
  if (district) query.set('district', district);
  return apiRequest(`/dashboard/trends?${query}`);
}

export type RegistryPlot = {
  plot_id: string;
  name?: string;
  crop?: string;
  village?: string;
  size_acres?: number | null;
  status?: string;
  last_ingestion_at?: string | null;
};

export type RegistryFarmer = {
  farmer_id: string;
  name?: string;
  phone_number?: string;
  state?: string;
  district?: string;
  status?: string;
  registered_at?: string;
  plots?: RegistryPlot[];
};

export type RegistryResponse = {
  total_farmers?: number;
  total_plots?: number;
  farmers?: RegistryFarmer[];
};

export type PlotMarker = {
  plot_id: string;
  farmer_id: string;
  crop: string;
  district?: string | null;
  village?: string | null;
  latitude: number;
  longitude: number;
  location_precision: string;
  observed_at?: string | null;
  ndvi?: number | null;
  nir?: number | null;
  status: string;
  urgency?: string | null;
};

export type PlotHistoryResponse = {
  plot_id: string;
  crop: string;
  location_precision: string;
  series: Array<{
    date: string;
    ndvi?: number | null;
    nir?: number | null;
    rainfall_7d?: number | null;
  }>;
};

export type BackendAlert = {
  alert_id: string;
  plot_id: string;
  farmer_id: string;
  farmer_name: string;
  district?: string | null;
  crop: string;
  severity: string;
  title: string;
  description: string;
  trigger_metric?: string | null;
  trigger_value?: string | null;
  threshold?: string | null;
  status: string;
  assigned_user_id?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
};

export type OperationsStatus = {
  scope: { state?: string | null; district?: string | null };
  generated_at: string;
  plots: {
    active: number;
    data_status: Record<string, number>;
    ingested_last_24h: number;
  };
  processing: {
    predictions_total: number;
    predictions_last_24h: number;
    advisories_total: number;
    advisories_last_24h: number;
  };

  alerts: {
    total: number;
    by_status: Record<string, number>;
  };

  delivery: {
    total_messages: number;
    by_status: Record<string, number>;
    delivered_rate_percent: number | null;
  };
};

export type TrendGroup = {
  name: string;
  observations: number;
  avg_ndvi: number | null;
  avg_rainfall_7d: number | null;
};

export function getOperationsStatus(state?: string, district?: string) {
  const query = new URLSearchParams();
  if (state) query.set('state', state);
  if (district) query.set('district', district);
  return apiRequest<OperationsStatus>(
    `/institutional/operations/status${query.toString() ? `?${query}` : ''}`,
  );
}

export function getRegistry(state?: string, district?: string) {
  const query = new URLSearchParams();
  if (state) query.set('state', state);
  if (district) query.set('district', district);
  return apiRequest<RegistryResponse>(`/dashboard/registry${query.toString() ? `?${query}` : ''}`);
}

export function getPlotMarkers(state?: string, district?: string) {
  const query = new URLSearchParams();
  if (state) query.set('state', state);
  if (district) query.set('district', district);
  return apiRequest<PlotMarker[]>(`/institutional/plots/map${query.toString() ? `?${query}` : ''}`);
}

export function getPlotHistory(plotId: string, days = 90) {
  return apiRequest<PlotHistoryResponse>(`/institutional/plots/${encodeURIComponent(plotId)}/history?days=${days}`);
}

export function getAlerts(state?: string, district?: string) {
  const query = new URLSearchParams();
  if (state) query.set('state', state);
  if (district) query.set('district', district);
  return apiRequest<BackendAlert[]>(`/institutional/alerts${query.toString() ? `?${query}` : ''}`);
}

export function updateAlert(alertId: string, payload: { status: string; resolution_notes?: string; assigned_user_id?: string }) {
  return apiRequest<BackendAlert>(`/institutional/alerts/${encodeURIComponent(alertId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
