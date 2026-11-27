import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex relative overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[500px] bg-purple-600/[0.08] rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed top-24 left-1/4 w-[500px] h-[400px] bg-blue-600/[0.06] rounded-full blur-[130px] pointer-events-none -z-0" />

      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AdminTopBar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
