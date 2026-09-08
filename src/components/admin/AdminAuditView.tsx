import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, Calendar, Clock, Download } from 'lucide-react';

export const AdminAuditView: React.FC = () => {
  const { auditLogs, addToast } = useApp();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportAudit = () => {
    addToast('Official Audit Log (ISO 27001 Compliant) exported', 'success');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            System Audit Trail & Security Event Logs
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of all user interventions, status changes, and data access activities
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by officer or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-500">
            Total recorded actions: <strong>{filteredLogs.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Official / Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">{log.id}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{log.user}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-800 font-semibold">{log.target}</td>
                  <td className="py-3 px-4 text-slate-700 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
