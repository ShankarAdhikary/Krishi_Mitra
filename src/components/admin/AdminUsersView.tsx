import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/mockDatabase';
import { User, UserRole } from '../../types';
import {
  Users,
  Shield,
  UserPlus,
  Lock,
  CheckCircle2,
  Mail,
  Building2,
  Search,
} from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const { currentUser, switchRole, addToast } = useApp();
  const [userList, setUserList] = useState<User[]>(DEMO_USERS);
  const [search, setSearch] = useState('');

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            User Management & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500">
            Define administrative privileges, district jurisdictions, and field officer credentials
          </p>
        </div>

        <button
          onClick={() => addToast('User provisioning workflow initiated', 'info')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>+ Add Government Official</span>
        </button>
      </div>

      {/* Role Matrix Overview (PHASE 28) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {[
          {
            role: 'ADMIN',
            title: 'National Admin',
            perms: 'Full System Control, Users, Database Ingestion, National Policy Rules',
            color: 'border-emerald-300 bg-emerald-50/60',
          },
          {
            role: 'DISTRICT_OFFICER',
            title: 'District Officer (DAO)',
            perms: 'District Map, Farmer Audits, Alert Dispatch, Government Reports',
            color: 'border-sky-300 bg-sky-50/60',
          },
          {
            role: 'FIELD_OFFICER',
            title: 'Field Extension Officer',
            perms: 'Assigned Farm Parcels, Ground Inspections, Geotagged Photo Uploads',
            color: 'border-amber-300 bg-amber-50/60',
          },
          {
            role: 'ANALYST',
            title: 'Geospatial Analyst',
            perms: 'Multi-spectral NIR / NDVI Trends, Pedological ACC Models, Predictive Analytics',
            color: 'border-purple-300 bg-purple-50/60',
          },
        ].map((item) => (
          <div key={item.role} className={`p-3.5 rounded-xl border ${item.color} shadow-xs`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">{item.title}</span>
              <Shield className="h-3.5 w-3.5 text-slate-600" />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug mt-1">{item.perms}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search officials by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-500">
            Active clearance: <strong>{currentUser.role.replace('_', ' ')}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Official Name</th>
                <th className="py-3 px-4">Department & Designation</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4 text-right">Switch Active Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{user.designation}</p>
                    <p className="text-[11px] text-slate-500">{user.department}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {user.district ? `${user.district} District` : 'All Gujarat / National'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => switchRole(user.role)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        currentUser.id === user.id
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {currentUser.id === user.id ? 'Active Session' : 'Switch To Persona'}
                    </button>
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
