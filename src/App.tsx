import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyPulseSummary } from './components/DailyPulseSummary';
import { SessionManager } from './components/SessionManager';
import { ClientProgressAnalytics } from './components/ClientProgressAnalytics';
import { BusinessPerformanceDashboard } from './components/BusinessPerformanceDashboard';
import { IslamicCalendarModule } from './components/IslamicCalendarModule';
import { SecurityEncryptionModal } from './components/SecurityEncryptionModal';
import { TwoFactorModal } from './components/TwoFactorModal';
import { ThirdPartyApiHub } from './components/ThirdPartyApiHub';
import { AutomatedNotificationDrawer } from './components/AutomatedNotificationDrawer';
import { AiCoachCopilotDrawer } from './components/AiCoachCopilotDrawer';
import { NewSessionModal } from './components/NewSessionModal';
import { MonthlyKpiTracker } from './components/MonthlyKpiTracker';

import { 
  Session, 
  ClientProfile, 
  Invoice, 
  NotificationItem, 
  ThirdPartyConfig, 
  MonthlyKpiTarget,
  SupportedLanguage 
} from './types';
import { 
  INITIAL_SESSIONS, 
  INITIAL_CLIENTS, 
  INITIAL_INVOICES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_INTEGRATIONS,
  INITIAL_MONTHLY_KPIS
} from './data/mockData';
import { getHijriDate, getPrayerTimes } from './utils/hijri';
import { exportMonthlyExecutivePdf, exportDataToExcel, exportToCsv } from './utils/exporter';
import { getTranslation } from './utils/i18n';
import { 
  Bell, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Activity,
  Compass,
  FileDown,
  Sheet
} from 'lucide-react';

export default function App() {
  // Navigation & Localization
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<SupportedLanguage>('id');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Offline and Sync state
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('murshid_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('murshid_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('murshid_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [kpis, setKpis] = useState<MonthlyKpiTarget[]>(() => {
    const saved = localStorage.getItem('murshid_kpis');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_KPIS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [integrations, setIntegrations] = useState<ThirdPartyConfig[]>(INITIAL_INTEGRATIONS);

  // Modals & Drawers
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isTwoFactorOpen, setIsTwoFactorOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);
  const [copilotSelectedSession, setCopilotSelectedSession] = useState<Session | null>(null);

  const t = getTranslation(lang);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist sessions, invoices & kpis
  useEffect(() => {
    localStorage.setItem('murshid_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('murshid_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('murshid_kpis', JSON.stringify(kpis));
  }, [kpis]);

  // Hijri date & Prayer times
  const islamicInfo = getHijriDate(new Date('2026-10-31'), lang);
  const prayers = getPrayerTimes('Jakarta');

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Offline Toggle
  const toggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    if (nextState) {
      showToast('Mode Luring Aktif: Semua catatan sesi & tindakan diamankan di penyimpanan lokal.');
    } else {
      setPendingSyncCount(0);
      showToast('Awan Terhubung: Semua perubahan lokal telah disinkronkan ke server pusat.');
    }
  };

  // Add notification
  const handleTriggerNotification = (title: string, message: string, channel: 'Push' | 'WhatsApp' | 'Email') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Baru saja',
      type: 'session_alert',
      read: false,
      channel,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`${title}: ${message}`);
  };

  // Handle new session save
  const handleSaveSession = (newSession: Session) => {
    setSessions((prev) => [newSession, ...prev]);
    if (isOffline) {
      setPendingSyncCount((prev) => prev + 1);
    }
    handleTriggerNotification(
      'Sesi Baru Terjadwal',
      `Sesi "${newSession.title}" bersama ${newSession.clientName} berhasil dibuat dengan enkripsi E2EE.`,
      'Push'
    );
  };

  // Handle AI Copilot Action Item integration
  const handleApplyActionItemsToSession = (sessionId: string, newItems: any[]) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          actionItems: [...s.actionItems, ...newItems],
        };
      })
    );
    showToast('Action items hasil diagnosis AI berhasil diintegrasikan ke rencana sesi.');
  };

  // Export handlers
  const handleExportPdf = () => {
    exportMonthlyExecutivePdf({
      monthName: 'Oktober',
      year: 2026,
      sessions,
      invoices,
      clients,
      kpis,
      totalRevenue: 'Rp 78.100.000',
      completionRate: '98.4%',
      mentorName: 'Dr. Tariq Al-Mansoor',
    });
    showToast('Laporan Bulanan PDF resmi berhasil di-generate dan diunduh.');
  };

  const handleExportExcel = () => {
    exportDataToExcel({ sessions, clients, invoices, kpis });
    showToast('Master dataset Microsoft Excel (.xlsx) berhasil diekspor.');
  };

  const handleExportCsv = () => {
    const rows = sessions.map((s) => ({
      ID: s.id,
      Judul: s.title,
      Klien: s.clientName,
      Perusahaan: s.clientCompany,
      Tipe: s.type,
      Tanggal: s.date,
      Waktu: s.time,
      Status: s.status,
      Biaya: s.fee,
      Hijri: s.hijriDate,
    }));
    exportToCsv(rows, 'murshid_ai_spreadsheet.csv');
    showToast('Dataset format CSV Google Sheets berhasil diekspor.');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar Contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOffline={isOffline}
        toggleOffline={toggleOffline}
        pendingSyncCount={pendingSyncCount}
        openNewSessionModal={() => setIsNewSessionOpen(true)}
        openTwoFactorModal={() => setIsTwoFactorOpen(true)}
        openSecurityModal={() => setIsSecurityOpen(true)}
        openNotificationDrawer={() => setIsNotifDrawerOpen(true)}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Daily Pulse Summary (Always visible or in Dashboard) */}
        <DailyPulseSummary
          sessions={sessions}
          islamicInfo={islamicInfo}
          prayers={prayers}
          lang={lang}
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          onExportCsv={handleExportCsv}
          onOpenAiCopilot={() => {
            setCopilotSelectedSession(sessions[0]);
            setIsAiCopilotOpen(true);
          }}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        {/* Tab 1: Dashboard Overview (Bento Grid View) */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Dedicated Monthly KPI Target Tracking Module */}
            <MonthlyKpiTracker
              kpis={kpis}
              setKpis={setKpis}
              lang={lang}
              onOpenAiCopilot={(topic) => {
                setCopilotSelectedSession(sessions[0]);
                setIsAiCopilotOpen(true);
              }}
            />

            {/* Split 2-Column: Active Sessions & Radar Competency Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 7 Cols: Active Upcoming Sessions Card */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Sesi Mendatang & Sedang Berlangsung Hari Ini
                      </h3>
                    </div>
                    <button
                      onClick={() => setCurrentTab('sessions')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Semua Sesi</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sessions.slice(0, 3).map((ses) => (
                      <div
                        key={ses.id}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={ses.clientAvatar}
                            alt={ses.clientName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {ses.title}
                              </h4>
                              <span className="text-[10px] font-semibold text-emerald-600 font-mono">
                                [{ses.status}]
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {ses.clientName} · {ses.clientCompany} · {ses.time} WIB
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setCopilotSelectedSession(ses);
                              setIsAiCopilotOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
                            title="AI Diagnosis"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCurrentTab('sessions')}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg cursor-pointer transition-colors"
                          >
                            Buka
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Lock className="w-3.5 h-3.5" /> Enkripsi End-to-End Otomatis
                  </span>
                  <span className="font-mono text-[11px]">
                    Kalender Hijriah: {islamicInfo.hijriFormatted}
                  </span>
                </div>
              </div>

              {/* Right 5 Cols: Financial & Billing Quick Snapshot */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Snapshot Pembayaran & Penagihan
                      </h3>
                    </div>
                    <button
                      onClick={() => setCurrentTab('finance')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-4 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Pendapatan Bulan Berjalan</span>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                      Rp 78.100.000
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                      Target Tercapai: 112% (Kuartal 4)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>Faktur Terbayar QRIS & Transfer:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">Rp 58.000.000</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>Menunggu Pelunasan (VA BCA):</span>
                      <span className="font-mono font-bold text-amber-600">Rp 20.100.000</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>Gateway Settlement Engine:</span>
                      <span className="font-mono text-emerald-600">Midtrans + Stripe</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={handleExportPdf}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg cursor-pointer transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Unduh PDF Akhir Bulan</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <Sheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Access to Competencies & Integrations Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setCurrentTab('clients')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <span>Radar Progres Klien</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluasi 6 dimensi: Kepemimpinan, Strategi, Operasi, Resiliensi, Finansial, dan Tim.
                </p>
              </div>

              <div 
                onClick={() => setCurrentTab('islamicCalendar')}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <span>Kalender Hijriah & Sholat</span>
                  <Compass className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Buffer 15 menit otomatis mencegah benturan jadwal konsultasi dengan waktu adzan.
                </p>
              </div>

              <div 
                onClick={() => setIsSecurityOpen(true)}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                  <span>Enkripsi End-to-End & 2FA</span>
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AES-256 GCM client-side encryption dengan perlindungan TOTP autentikasi dua faktor.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Session Manager */}
        {currentTab === 'sessions' && (
          <SessionManager
            sessions={sessions}
            setSessions={setSessions}
            lang={lang}
            onOpenNewSessionModal={() => setIsNewSessionOpen(true)}
            onOpenAiCopilot={(session) => {
              setCopilotSelectedSession(session);
              setIsAiCopilotOpen(true);
            }}
          />
        )}

        {/* Tab 3: Client Progress Analytics */}
        {currentTab === 'clients' && (
          <ClientProgressAnalytics
            clients={clients}
            lang={lang}
            onOpenTwoFactorModal={() => setIsTwoFactorOpen(true)}
            onOpenAiCopilot={(focus) => {
              setCopilotSelectedSession(null);
              setIsAiCopilotOpen(true);
            }}
          />
        )}

        {/* Tab 4: Billing & Finance */}
        {currentTab === 'finance' && (
          <BusinessPerformanceDashboard
            invoices={invoices}
            setInvoices={setInvoices}
            lang={lang}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
            onExportCsv={handleExportCsv}
          />
        )}

        {/* Tab 5: Islamic Calendar & Prayer Sync */}
        {currentTab === 'islamicCalendar' && (
          <IslamicCalendarModule
            islamicInfo={islamicInfo}
            sessions={sessions}
            lang={lang}
          />
        )}

        {/* Tab 6: Security & 2FA */}
        {currentTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.security.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.security.subtitle}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setIsSecurityOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Buka Pengaturan Enkripsi E2EE
                </button>
                <button
                  onClick={() => setIsTwoFactorOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                >
                  Kelola Autentikasi 2FA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Third-Party API Hub */}
        {currentTab === 'apiHub' && (
          <ThirdPartyApiHub
            integrations={integrations}
            setIntegrations={setIntegrations}
            lang={lang}
            onTriggerNotification={handleTriggerNotification}
          />
        )}

        {/* Tab 8: AI Co-Pilot Direct Trigger */}
        {currentTab === 'aiCopilot' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              MurshidAI Strategic Co-Pilot Engine
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Didukung oleh model Google Gemini AI, asisten penasihat eksekutif menganalisis isu manajemen, memetakan kerangka GROW, dan merumuskan rencana aksi kuartalan.
            </p>
            <button
              onClick={() => {
                setCopilotSelectedSession(sessions[0]);
                setIsAiCopilotOpen(true);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm cursor-pointer"
            >
              Luncurkan Co-Pilot Sekarang
            </button>
          </div>
        )}

      </main>

      {/* Floating Real-time Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-emerald-600 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom duration-200 max-w-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      <NewSessionModal
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        clients={clients}
        onSaveSession={handleSaveSession}
        lang={lang}
      />

      <SecurityEncryptionModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        lang={lang}
      />

      <TwoFactorModal
        isOpen={isTwoFactorOpen}
        onClose={() => setIsTwoFactorOpen(false)}
        lang={lang}
      />

      <AutomatedNotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
        lang={lang}
      />

      <AiCoachCopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        lang={lang}
        initialSession={copilotSelectedSession}
        onApplyActionItems={handleApplyActionItemsToSession}
      />

    </div>
  );
}
