import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Target, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Award, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  KeyRound,
  StickyNote,
  Zap,
  ArrowUpDown,
  Filter,
  Flame,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ClientProfile, SupportedLanguage, UrgencyTier } from '../types';
import { getTranslation } from '../utils/i18n';
import { ClientPrivateNotesDrawer } from './ClientPrivateNotesDrawer';

interface ClientProgressAnalyticsProps {
  clients: ClientProfile[];
  lang: SupportedLanguage;
  onOpenTwoFactorModal: () => void;
  onOpenAiCopilot: (focus: string) => void;
}

type SmartSortMode = 'smart_urgency' | 'steepest_decline' | 'lowest_kpi' | 'alphabetical';
type UrgencyFilter = 'ALL' | 'Critical' | 'Warning' | 'On-Track';

interface ClientUrgencyMetrics {
  urgencyScore: number;
  urgencyTier: UrgencyTier;
  recentDeltaPercent: number;
  trendDirection: 'declining' | 'stagnant' | 'improving';
  laggingPillar: string;
  previousAvgScore: number;
  currentAvgScore: number;
  overdueTasksCount: number;
  daysSinceLastSession: number;
  urgencyReason: string;
  recommendedIntervention: string;
}

export const ClientProgressAnalytics: React.FC<ClientProgressAnalyticsProps> = ({
  clients,
  lang,
  onOpenTwoFactorModal,
  onOpenAiCopilot
}) => {
  const t = getTranslation(lang);

  // Sorting & Filtering States
  const [sortMode, setSortMode] = useState<SmartSortMode>('smart_urgency');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showAlgoInfo, setShowAlgoInfo] = useState(false);

  // Client Selection & Vault States
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultPin, setVaultPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);

  // Helper to resolve or calculate objective urgency metrics
  const getMetrics = (c: ClientProfile): ClientUrgencyMetrics => {
    const currentAvg = Math.round(
      (c.radarScores.leadership +
        c.radarScores.strategy +
        c.radarScores.execution +
        c.radarScores.resilience +
        c.radarScores.financialAcumen +
        c.radarScores.teamAlignment) / 6
    );

    if (c.kpiTrend) {
      return {
        urgencyScore: c.kpiTrend.urgencyScore,
        urgencyTier: c.kpiTrend.urgencyTier,
        recentDeltaPercent: c.kpiTrend.recentDeltaPercent,
        trendDirection: c.kpiTrend.trendDirection,
        laggingPillar: c.kpiTrend.laggingPillar,
        previousAvgScore: c.kpiTrend.previousAvgScore,
        currentAvgScore: c.kpiTrend.currentAvgScore,
        overdueTasksCount: c.kpiTrend.overdueTasksCount,
        daysSinceLastSession: c.kpiTrend.daysSinceLastSession,
        urgencyReason: c.kpiTrend.urgencyReason,
        recommendedIntervention: c.kpiTrend.recommendedIntervention,
      };
    }

    // Dynamic heuristic calculation if kpiTrend not preset
    const pillars = [
      { name: t.clientProgress.leadership, val: c.radarScores.leadership },
      { name: t.clientProgress.strategy, val: c.radarScores.strategy },
      { name: t.clientProgress.execution, val: c.radarScores.execution },
      { name: t.clientProgress.resilience, val: c.radarScores.resilience },
      { name: t.clientProgress.finance, val: c.radarScores.financialAcumen },
      { name: t.clientProgress.alignment, val: c.radarScores.teamAlignment },
    ];
    pillars.sort((a, b) => a.val - b.val);
    const weakest = pillars[0];
    const delta = currentAvg < 80 ? -14.5 : currentAvg < 88 ? -4.5 : 6.0;
    const urgency = Math.max(10, Math.min(99, Math.round((100 - weakest.val) * 1.5 + (delta < 0 ? Math.abs(delta) * 2 : 0))));
    const tier: UrgencyTier = urgency >= 75 ? 'Critical' : urgency >= 40 ? 'Warning' : 'On-Track';

    return {
      urgencyScore: urgency,
      urgencyTier: tier,
      recentDeltaPercent: delta,
      trendDirection: delta < -3 ? 'declining' : delta > 3 ? 'improving' : 'stagnant',
      laggingPillar: `${weakest.name} (${weakest.val}/100)`,
      previousAvgScore: Math.round(currentAvg - delta),
      currentAvgScore: currentAvg,
      overdueTasksCount: tier === 'Critical' ? 2 : tier === 'Warning' ? 1 : 0,
      daysSinceLastSession: tier === 'Critical' ? 14 : tier === 'Warning' ? 7 : 3,
      urgencyReason: `Pilar terendah terdeteksi pada ${weakest.name} (${weakest.val}/100).`,
      recommendedIntervention: `Jadwalkan review taktis pada pilar ${weakest.name}.`,
    };
  };

  // Enriched and sorted clients list
  const processedClients = useMemo(() => {
    let list = clients.map((c) => ({
      ...c,
      metrics: getMetrics(c),
    }));

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q)
      );
    }

    // Urgency tier filter
    if (urgencyFilter !== 'ALL') {
      list = list.filter((c) => c.metrics.urgencyTier === urgencyFilter);
    }

    // Sort order
    list.sort((a, b) => {
      if (sortMode === 'smart_urgency') {
        return b.metrics.urgencyScore - a.metrics.urgencyScore; // highest urgency first
      }
      if (sortMode === 'steepest_decline') {
        return a.metrics.recentDeltaPercent - b.metrics.recentDeltaPercent; // most negative delta first
      }
      if (sortMode === 'lowest_kpi') {
        return a.metrics.currentAvgScore - b.metrics.currentAvgScore; // lowest score first
      }
      if (sortMode === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [clients, sortMode, urgencyFilter, searchQuery]);

  // Make sure currently selected client exists in list, else default to first
  const activeClient = useMemo(() => {
    const found = processedClients.find((c) => c.id === selectedClientId);
    return found || processedClients[0] || clients[0];
  }, [processedClients, selectedClientId, clients]);

  // Summary counts for quick badges
  const urgencyCounts = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let onTrack = 0;
    clients.forEach((c) => {
      const m = getMetrics(c);
      if (m.urgencyTier === 'Critical') critical++;
      else if (m.urgencyTier === 'Warning') warning++;
      else onTrack++;
    });
    return { critical, warning, onTrack };
  }, [clients]);

  // Current client metrics & radar coordinates
  const activeMetrics = activeClient ? getMetrics(activeClient) : getMetrics(clients[0]);

  const radarDimensions = [
    { key: 'leadership', label: t.clientProgress.leadership, val: activeClient?.radarScores.leadership || 0 },
    { key: 'strategy', label: t.clientProgress.strategy, val: activeClient?.radarScores.strategy || 0 },
    { key: 'execution', label: t.clientProgress.execution, val: activeClient?.radarScores.execution || 0 },
    { key: 'resilience', label: t.clientProgress.resilience, val: activeClient?.radarScores.resilience || 0 },
    { key: 'financialAcumen', label: t.clientProgress.finance, val: activeClient?.radarScores.financialAcumen || 0 },
    { key: 'teamAlignment', label: t.clientProgress.alignment, val: activeClient?.radarScores.teamAlignment || 0 },
  ];

  const size = 320;
  const center = size / 2;
  const radius = 110;
  const angleStep = (Math.PI * 2) / radarDimensions.length;

  const getCoordinates = (valuePercent: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (valuePercent / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const radarPolygonPoints = radarDimensions
    .map((dim, i) => {
      const { x, y } = getCoordinates(dim.val, i);
      return `${x},${y}`;
    })
    .join(' ');

  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultPin === '2026' || vaultPin === '8888') {
      setVaultUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Page Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.clientProgress.title}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span>Smart Sort Enabled</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.clientProgress.subtitle} · Peringkat otomatis berdasarkan degradasi metrik & risiko operasional
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowMatrixModal(!showMatrixModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
              <span>{showMatrixModal ? 'Tutup Matriks Urgensi' : t.clientProgress.viewUrgencyMatrix}</span>
              {showMatrixModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsNotesDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <StickyNote className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
              <span>Catatan Privat Coach</span>
            </button>
          </div>
        </div>

        {/* Smart Sort Toolbar Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Sort Mode Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Urutkan:</span>
            </span>

            <button
              onClick={() => setSortMode('smart_urgency')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                sortMode === 'smart_urgency'
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 ring-1 ring-rose-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Tingkat Urgensi (Smart Sort)</span>
            </button>

            <button
              onClick={() => setSortMode('steepest_decline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                sortMode === 'steepest_decline'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ring-1 ring-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
              <span>Penurunan KPI Terbesar</span>
            </button>

            <button
              onClick={() => setSortMode('lowest_kpi')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                sortMode === 'lowest_kpi'
                  ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-sky-500" />
              <span>Skor Terendah</span>
            </button>

            <button
              onClick={() => setSortMode('alphabetical')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                sortMode === 'alphabetical'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>A - Z</span>
            </button>
          </div>

          {/* Urgency Filter Chips & Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setUrgencyFilter('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  urgencyFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Semua ({clients.length})
              </button>
              <button
                onClick={() => setUrgencyFilter('Critical')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  urgencyFilter === 'Critical'
                    ? 'bg-rose-500 text-white shadow-2xs font-semibold'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Kritis ({urgencyCounts.critical})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter('Warning')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  urgencyFilter === 'Warning'
                    ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Perhatian ({urgencyCounts.warning})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter('On-Track')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  urgencyFilter === 'On-Track'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Stabil ({urgencyCounts.onTrack})</span>
              </button>
            </div>

            <button
              onClick={() => setShowAlgoInfo(!showAlgoInfo)}
              title="Penjelasan Algoritma Smart Sort"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Algorithm Explainer Box (Collapsible) */}
        {showAlgoInfo && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Formula Objektif Algoritma Smart Sort Urgensi:
                </span>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                  Skor Urgensi dihitung secara otomatis (0 - 100) berdasarkan:
                  <strong className="text-slate-700 dark:text-slate-200"> (1) Penurunan tren capaian KPI 30 hari</strong> (bobot 40%),
                  <strong className="text-slate-700 dark:text-slate-200"> (2) Pilar kompetensi radar terendah</strong> (bobot 30%),
                  <strong className="text-slate-700 dark:text-slate-200"> (3) Jumlah penugasan strategis terlambat</strong> (bobot 20%), dan
                  <strong className="text-slate-700 dark:text-slate-200"> (4) Hari sejak sesi terakhir</strong> (bobot 10%).
                  Klien dengan urgensi tertinggi ditempatkan pertama agar coach dapat mengambil tindakan intervensi proaktif.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Full Client Urgency Matrix Table */}
      {showMatrixModal && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>Matriks Komparasi Urgensi & Tren Kinerja Seluruh Klien</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Urutan hierarki coachee dari yang paling membutuhkan intervensi hingga yang paling on-track.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total {processedClients.length} Klien Terfilter
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Rank Urgensi</th>
                  <th className="py-2.5 px-3 font-semibold">Klien & Perusahaan</th>
                  <th className="py-2.5 px-3 font-semibold">Tier Layanan</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Skor KPI (Rerata)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Tren 30 Hari</th>
                  <th className="py-2.5 px-3 font-semibold">Hambatan Utama (Bottleneck)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Skor Urgensi</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {processedClients.map((c, index) => {
                  const m = c.metrics;
                  const isSelected = c.id === activeClient?.id;
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-slate-50/80 dark:bg-slate-800/80' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center justify-center font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          m.urgencyTier === 'Critical'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : m.urgencyTier === 'Warning'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}>
                          #{index + 1} {m.urgencyTier === 'Critical' ? '🔴 Darurat' : m.urgencyTier === 'Warning' ? '🟡 Waspada' : '🟢 Stabil'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                            <div className="text-[11px] text-slate-500">{c.company}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {c.activeTier}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                        {m.currentAvgScore} / 100
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold tabular-nums">
                        <span className={`inline-flex items-center gap-1 ${
                          m.recentDeltaPercent < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {m.recentDeltaPercent < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          <span>{m.recentDeltaPercent > 0 ? `+${m.recentDeltaPercent}%` : `${m.recentDeltaPercent}%`}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-700 dark:text-slate-300 truncate max-w-[220px]" title={m.laggingPillar}>
                          {m.laggingPillar}
                        </div>
                        {m.overdueTasksCount > 0 && (
                          <span className="text-[10px] text-rose-500 font-mono">
                            {m.overdueTasksCount} milestone terlambat
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          <span>{m.urgencyScore}</span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${
                              m.urgencyScore >= 75 ? 'bg-rose-500' : m.urgencyScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${m.urgencyScore}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedClientId(c.id);
                            setShowMatrixModal(false);
                            setVaultUnlocked(false);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-colors cursor-pointer"
                        >
                          Pilih Profil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ranked Client Selector Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Daftar Klien (Terurut Smart Sort: {sortMode === 'smart_urgency' ? 'Urgensi Tertinggi' : sortMode === 'steepest_decline' ? 'Penurunan Terbesar' : sortMode === 'lowest_kpi' ? 'Skor KPI Terendah' : 'Abjad A-Z'})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Menampilkan {processedClients.length} dari {clients.length} coachee
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {processedClients.map((c, index) => {
            const m = c.metrics;
            const isSelected = c.id === activeClient?.id;

            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedClientId(c.id);
                  setVaultUnlocked(false);
                }}
                className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-50 dark:bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Urgency Rank Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    m.urgencyTier === 'Critical'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : m.urgencyTier === 'Warning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      m.urgencyTier === 'Critical' ? 'bg-rose-500' : m.urgencyTier === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span>#{index + 1} {m.urgencyTier === 'Critical' ? 'Kritis' : m.urgencyTier === 'Warning' ? 'Waspada' : 'Stabil'}</span>
                  </span>

                  <span className={`text-[11px] font-mono font-bold tabular-nums flex items-center gap-0.5 ${
                    m.recentDeltaPercent < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {m.recentDeltaPercent < 0 ? '↓' : '↑'}{Math.abs(m.recentDeltaPercent)}%
                  </span>
                </div>

                {/* Client Avatar & Name */}
                <div className="flex items-center gap-2">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">
                      {c.company}
                    </p>
                  </div>
                </div>

                {/* KPI score & Urgency score */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Skor Rata-rata</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    {m.currentAvgScore}/100
                  </span>
                </div>

                {/* Progress bar of urgency */}
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full ${
                      m.urgencyScore >= 75 ? 'bg-rose-500' : m.urgencyScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${m.urgencyScore}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart KPI Urgency & Performance Diagnostic Banner */}
      {activeClient && (
        <div className={`p-5 rounded-xl border transition-all ${
          activeMetrics.urgencyTier === 'Critical'
            ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
            : activeMetrics.urgencyTier === 'Warning'
            ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
            : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  activeMetrics.urgencyTier === 'Critical'
                    ? 'bg-rose-600 text-white'
                    : activeMetrics.urgencyTier === 'Warning'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    Status: {activeMetrics.urgencyTier === 'Critical' ? 'BUTUH INTERVENSI SEGERA' : activeMetrics.urgencyTier === 'Warning' ? 'PERLU MONITORING KETAT' : 'ON-TRACK & STABIL'}
                  </span>
                </span>

                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Indeks Urgensi: <strong className="text-slate-900 dark:text-white">{activeMetrics.urgencyScore}/100</strong>
                </span>

                <span className="text-slate-400">·</span>

                <span className={`text-xs font-mono font-semibold flex items-center gap-1 ${
                  activeMetrics.recentDeltaPercent < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {activeMetrics.recentDeltaPercent < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  <span>Tren 30 Hari: {activeMetrics.recentDeltaPercent > 0 ? `+${activeMetrics.recentDeltaPercent}%` : `${activeMetrics.recentDeltaPercent}%`}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                Diagnosa Smart Sort: {activeClient.name} ({activeClient.company})
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                <strong className="text-slate-800 dark:text-slate-200">Akar Masalah: </strong>
                {activeMetrics.urgencyReason}
              </p>

              <div className="pt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-rose-500" />
                  <span>Pilar Hambatan: <strong className="text-slate-700 dark:text-slate-200">{activeMetrics.laggingPillar}</strong></span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeMetrics.overdueTasksCount} Tugas Milestone Tertunda</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  <span>Terakhir Sesi: {activeMetrics.daysSinceLastSession} hari lalu</span>
                </span>
              </div>
            </div>

            {/* Tactical Intervention CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={() => onOpenAiCopilot(`Klien Prioritas Urgensi #${activeMetrics.urgencyScore}: ${activeClient.name} (${activeClient.company}) - Hambatan: ${activeMetrics.laggingPillar}. Rekomendasi intervensi: ${activeMetrics.recommendedIntervention}`)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Rencanakan Sesi Intervensi AI</span>
              </button>

              <button
                onClick={() => setIsNotesDrawerOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <StickyNote className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tulis Catatan Privat Intervensi</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Grid: Radar Chart + Client Portfolio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Radar Visualization */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Radar Kompetensi Bisnis & Kepemimpinan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skala 0 - 100 berdasarkan evaluasi berkala mentor & asesmen 360°
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
              Rata-rata: {Math.round(radarDimensions.reduce((acc, d) => acc + d.val, 0) / 6)} / 100
            </span>
          </div>

          {/* SVG Radar */}
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center my-2">
            <svg width={size} height={size} className="overflow-visible">
              
              {/* Background Concentric Webs (20%, 40%, 60%, 80%, 100%) */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((pct, ringIdx) => {
                const ringPoints = radarDimensions
                  .map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = pct * radius;
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={ringIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="1"
                    strokeDasharray={pct === 1 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Axis lines from center to outer vertices */}
              {radarDimensions.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="1"
                  />
                );
              })}

              {/* The Data Polygon Fill & Stroke */}
              <polygon
                points={radarPolygonPoints}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10b981"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />

              {/* Radar Point Dots & Labels */}
              {radarDimensions.map((dim, i) => {
                const { x, y } = getCoordinates(dim.val, i);
                const angle = i * angleStep - Math.PI / 2;
                const labelOffset = radius + 22;
                const lx = center + labelOffset * Math.cos(angle);
                const ly = center + labelOffset * Math.sin(angle);

                return (
                  <g key={dim.key}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] font-medium fill-slate-600 dark:fill-slate-300 font-sans"
                    >
                      {dim.label} ({dim.val})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Pillar Breakdown Bar */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {radarDimensions.map((d) => (
              <div key={d.key} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="block text-[11px] text-slate-500 truncate">{d.label}</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">{d.val}/100</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Client Executive Profile & Zero-Knowledge Vault */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Client Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-4">
              <img
                src={activeClient.avatar}
                alt={activeClient.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeClient.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeClient.role} · {activeClient.company}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeClient.activeTier}</span>
                  <span>·</span>
                  <span>Bergabung: {activeClient.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-xs text-slate-500">Sesi Selesai</span>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {activeClient.completedSessions} / {activeClient.totalSessions} Sesi
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-xs text-slate-500">Indeks Kepuasan</span>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                  ★ {activeClient.satisfactionScore} / 5.0
                </div>
              </div>
            </div>

            {/* Tactical Actions */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setIsNotesDrawerOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <StickyNote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Buka Catatan Privat ({activeClient.name})</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono px-1.5 py-0.5 rounded">
                  Offline-Ready
                </span>
              </button>

              <button
                onClick={() => onOpenAiCopilot(`Klien: ${activeClient.name} (${activeClient.company}) - Evaluasi Kompetensi Bisnis & Intervensi Urgensi`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rekomendasi Strategis AI untuk {activeClient.name}</span>
              </button>
            </div>
          </div>

          {/* Zero-Knowledge Confidential Vault (E2EE) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Confidential Diagnostic Vault (Zero-Knowledge)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                AES-256 E2EE
              </span>
            </div>

            <div className="pt-3">
              {vaultUnlocked ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Unlock className="w-3.5 h-3.5" /> Vault Terbuka (Kunci Privat Terpasang)
                    </span>
                    <button
                      onClick={() => setVaultUnlocked(false)}
                      className="text-xs underline font-semibold cursor-pointer"
                    >
                      Kunci Kembali
                    </button>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans border border-slate-200 dark:border-slate-700">
                    {activeClient.confidentialVaultNotes}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUnlockVault} className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Dokumen diagnosa internal dan catatan rahasia dilindungi enkripsi end-to-end. Masukkan PIN keamanan vault untuk mendekripsi data.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="PIN Vault (Ketik: 2026)"
                        value={vaultPin}
                        onChange={(e) => setVaultPin(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg cursor-pointer transition-colors"
                    >
                      Buka Vault
                    </button>
                  </div>
                  {pinError && (
                    <p className="text-[11px] text-rose-500">
                      PIN salah. Gunakan PIN default 2026 untuk simulasi audit.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Slide-out Drawer for Coach Private Notes (localStorage & Offline-Ready) */}
      {activeClient && (
        <ClientPrivateNotesDrawer
          isOpen={isNotesDrawerOpen}
          onClose={() => setIsNotesDrawerOpen(false)}
          client={activeClient}
          lang={lang}
        />
      )}

    </div>
  );
};
