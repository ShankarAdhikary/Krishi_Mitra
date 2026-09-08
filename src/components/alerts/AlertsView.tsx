import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { CustomAlertRule, AlertLifecycle, StatusLevel } from '../../types';
import {
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
  Sliders,
  ShieldAlert,
  Search,
  Check,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    updateAlertStatus,
    alertRules,
    addAlertRule,
    toggleAlertRule,
    setSelectedFarmId,
    setActiveView,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal for new rule
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    metric: 'NIR' as CustomAlertRule['metric'],
    operator: '<' as CustomAlertRule['operator'],
    value: 0.45,
    severity: 'URGENT' as StatusLevel,
    district: 'All Districts',
    crop: 'All Crops',
  });

  const filteredAlerts = alerts.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !a.farmId.toLowerCase().includes(q) &&
        !a.farmerName.toLowerCase().includes(q) &&
        !a.district.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name.trim()) return;

    addAlertRule({
      name: newRule.name,
      metric: newRule.metric,
      operator: newRule.operator,
      value: Number(newRule.value),
      severity: newRule.severity,
      district: newRule.district,
      crop: newRule.crop,
      enabled: true,
    });

    setIsNewRuleOpen(false);
    setNewRule({
      name: '',
      metric: 'NIR',
      operator: '<',
      value: 0.45,
      severity: 'URGENT',
      district: 'All Districts',
      crop: 'All Crops',
    });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            Telemetry Alerts & Risk Engine Rules
          </h2>
          <p className="text-xs text-slate-500">
            Real-time anomaly triggers from Sentinel-2 NIR/NDVI passes and IMD weather networks
          </p>
        </div>

        {/* Tab Switcher & Rule Button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'alerts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeTab === 'rules' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alert Rules ({alertRules.length})
            </button>
          </div>

          {activeTab === 'rules' && (
            <button
              onClick={() => setIsNewRuleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Rule</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'alerts' ? (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search farm ID, farmer, district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Severities</option>
                <option value="URGENT">Urgent Only</option>
                <option value="HIGH">High Only</option>
                <option value="MODERATE">Moderate Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Lifecycle Stages</option>
                <option value="GENERATED">Generated (New)</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="ASSIGNED">Assigned to Officer</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <span className="text-slate-400 font-medium ml-1">
                Showing <strong>{filteredAlerts.length}</strong> alerts
              </span>
            </div>
          </div>

          {/* Alerts List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No alerts match your filter criteria.
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={alert.severity} size="sm" />
                        <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                        <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {alert.farmId}
                        </span>
                        <span className="text-[10px] text-slate-400">{alert.createdAt}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {alert.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span>Farmer: <strong className="text-slate-800">{alert.farmerName}</strong></span>
                        <span>•</span>
                        <span>Location: <strong className="text-slate-800">{alert.district}</strong></span>
                        <span>•</span>
                        <span>Crop: <strong className="text-slate-800">{alert.crop}</strong></span>
                        <span>•</span>
                        <span>
                          Metric: <strong className="text-rose-600">{alert.triggerMetric} = {alert.triggerValue}</strong> ({alert.threshold})
                        </span>
                        {alert.assignedOfficer && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Officer: {alert.assignedOfficer}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions & Lifecycle Progress */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {alert.status.replace('_', ' ')}
                      </span>

                      {alert.status === 'GENERATED' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}

                      {alert.status === 'ACKNOWLEDGED' && (
                        <button
                          onClick={() => updateAlertStatus(alert.id, 'ASSIGNED')}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Assign Officer
                        </button>
                      )}

                      {(alert.status === 'ASSIGNED' || alert.status === 'UNDER_INVESTIGATION') && (
                        <button
                          onClick={() =>
                            updateAlertStatus(
                              alert.id,
                              'RESOLVED',
                              'Field extension team verified irrigation canal release and instructed foliar spray.'
                            )
                          }
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedFarmId(alert.farmId);
                          setActiveView('farm-profile');
                        }}
                        className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="View Farm Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* Custom Rules Tab (PHASE 18) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{rule.id}</span>
                      <StatusBadge status={rule.severity} size="sm" />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleAlertRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{rule.name}</h4>
                  <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-slate-800">
                    TRIGGER: <strong>{rule.metric}</strong> {rule.operator} <strong>{rule.value}</strong>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>District: <strong>{rule.district}</strong></span>
                    <span>Crops: <strong>{rule.crop}</strong></span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <Check className="h-3.5 w-3.5" />
                  <span>Evaluated against daily Sentinel-2 ingestion batch</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Creating Custom Alert Rule */}
      {isNewRuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                Define Custom Agronomic Alert Rule
              </h3>
              <button
                onClick={() => setIsNewRuleOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Rule Name / Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Extreme Heat Wave (> 38°C during flowering)"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sensor Metric</label>
                  <select
                    value={newRule.metric}
                    onChange={(e) => setNewRule({ ...newRule, metric: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="NIR">NIR Reflectance (Band 8)</option>
                    <option value="NDVI">NDVI Vegetation Index</option>
                    <option value="RAINFALL">Rainfall Deficit (mm)</option>
                    <option value="TEMPERATURE">Ambient Surface Temp (°C)</option>
                    <option value="SOIL_MOISTURE">Root Zone Moisture (%)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Condition</label>
                  <select
                    value={newRule.operator}
                    onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="<">Less Than (&lt;)</option>
                    <option value=">">Greater Than (&gt;)</option>
                    <option value="<=">Less Than or Equal (&lt;=)</option>
                    <option value=">=">Greater Than or Equal (&gt;=)</option>
                    <option value="DECREASE_PERCENT">Drop Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Threshold Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                    className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity Trigger</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value="URGENT">Urgent (Immediate Field Action)</option>
                    <option value="HIGH">High Risk</option>
                    <option value="MODERATE">Moderate Watch</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRuleOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Deploy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
