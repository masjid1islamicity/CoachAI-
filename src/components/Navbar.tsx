import React from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Sun, 
  Moon, 
  CalendarPlus, 
  FileText, 
  Download, 
  Bell, 
  Lock,
  Globe
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isOffline: boolean;
  toggleOffline: () => void;
  pendingSyncCount: number;
  openNewSessionModal: () => void;
  openTwoFactorModal: () => void;
  openSecurityModal: () => void;
  openNotificationDrawer: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  isOffline,
  toggleOffline,
  pendingSyncCount,
  openNewSessionModal,
  openTwoFactorModal,
  openSecurityModal,
  openNotificationDrawer,
  onExportPdf,
  onExportExcel,
  unreadNotifsCount
}) => {
  const t = getTranslation(lang);

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'sessions', label: t.nav.sessions },
    { id: 'clients', label: t.nav.clients },
    { id: 'finance', label: t.nav.finance },
    { id: 'islamicCalendar', label: t.nav.islamicCalendar },
    { id: 'security', label: t.nav.security },
    { id: 'apiHub', label: t.nav.apiHub },
    { id: 'aiCopilot', label: t.nav.aiCopilot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element wordmark as per Top Bar contract) */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Murshid<span className="text-emerald-600 dark:text-emerald-400">AI</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, whitespace-nowrap, hover underlines) */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-500 dark:border-emerald-400'
                      : 'hover:text-slate-900 dark:hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Real-time Cloud Sync / Offline Toggle */}
            <button
              onClick={toggleOffline}
              title={isOffline ? 'Klik untuk menghubungkan ke awan' : 'Klik untuk mensimulasikan mode luring'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isOffline
                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t.topBar.cloudSyncOffline}</span>
                  {pendingSyncCount > 0 && (
                    <span className="font-mono text-[10px] bg-amber-200 dark:bg-amber-900 px-1 rounded">
                      {pendingSyncCount}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline">{t.topBar.cloudSyncOnline}</span>
                </>
              )}
            </button>

            {/* E2EE Status Quick Trigger */}
            <button
              onClick={openSecurityModal}
              title="End-to-End Encryption AES-256 GCM"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* 2FA Shield Trigger */}
            <button
              onClick={openTwoFactorModal}
              title="2-Factor Authentication (TOTP)"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </button>

            {/* Notification Drawer Trigger */}
            <button
              onClick={openNotificationDrawer}
              title={t.topBar.notifications}
              className="relative p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative group">
              <button 
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="uppercase font-mono">{lang}</span>
              </button>
              <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
                <button
                  onClick={() => setLang('id')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${lang === 'id' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  Bahasa (ID)
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${lang === 'en' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => setLang('ar')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${lang === 'ar' ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  العربية (AR)
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Primary Action Button (Zone 3) */}
            <button
              onClick={openNewSessionModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>{t.topBar.scheduleSession}</span>
            </button>

          </div>

        </div>

        {/* Mobile secondary navigation bar */}
        <div className="xl:hidden flex items-center gap-2 py-2 overflow-x-auto border-t border-slate-200 dark:border-slate-800 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
