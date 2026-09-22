import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import GlobalSearchModal from '../components/common/GlobalSearchModal';

export default function MainLayout({
  activeModule,
  setActiveModule,
  moduleInfo,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((p) => !p);
    } else {
      setCollapsed((p) => !p);
    }
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-100/70 text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header
          activeModule={activeModule}
          moduleInfo={moduleInfo}
          onToggleSidebar={handleToggleSidebar}
          onNavigateHome={() => setActiveModule('home')}
          onOpenGlobalSearch={() => setGlobalSearchOpen(true)}
        />

        <main className="flex-1 p-2 sm:p-3 pb-2 overflow-x-hidden flex flex-col">
          {children}
        </main>

        <Footer />
      </div>

      {/* Global Quick Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        onNavigate={(modId) => setActiveModule(modId)}
      />
    </div>
  );
}
