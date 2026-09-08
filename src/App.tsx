import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/auth/LoginView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { InteractiveGisMap } from './components/map/InteractiveGisMap';
import { FarmerListView } from './components/farmers/FarmerListView';
import { FarmerRegisterView } from './components/farmers/FarmerRegisterView';
import { FarmProfileView } from './components/farms/FarmProfileView';
import { AlertsView } from './components/alerts/AlertsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { InspectionsView } from './components/inspections/InspectionsView';
import { ReportsView } from './components/reports/ReportsView';
import { AdminUsersView } from './components/admin/AdminUsersView';
import { AdminDataQualityView } from './components/admin/AdminDataQualityView';
import { AdminAuditView } from './components/admin/AdminAuditView';
import { AdminSystemHealthView } from './components/admin/AdminSystemHealthView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { isAuthenticated, activeView } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <DashboardView />
          </div>
        );
      case 'map':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <InteractiveGisMap heightClass="h-[calc(100vh-140px)]" showAllControls={true} />
          </div>
        );
      case 'farmers':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <FarmerListView />
          </div>
        );
      case 'farmer-register':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <FarmerRegisterView />
          </div>
        );
      case 'farm-profile':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <FarmProfileView />
          </div>
        );
      case 'alerts':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <AlertsView />
          </div>
        );
      case 'analytics':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <AnalyticsView />
          </div>
        );
      case 'inspections':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <InspectionsView />
          </div>
        );
      case 'reports':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <ReportsView />
          </div>
        );
      case 'admin-users':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <AdminUsersView />
          </div>
        );
      case 'admin-data-quality':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <AdminDataQualityView />
          </div>
        );
      case 'admin-audit':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <AdminAuditView />
          </div>
        );
      case 'admin-system':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <AdminSystemHealthView />
          </div>
        );
      case 'settings':
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <SettingsView />
          </div>
        );
      default:
        return (
          <div className="p-3 sm:p-6 max-w-7xl mx-auto">
            <DashboardView />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Toast Overlay */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
