import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex relative overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[130px] pointer-events-none -z-0" />
      <div className="fixed top-20 left-1/3 w-[500px] h-[400px] bg-blue-600/[0.05] rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
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
        <TopBar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
