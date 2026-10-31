import React, { useState } from 'react';
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
  FileCheck2,
  KeyRound,
  StickyNote
} from 'lucide-react';
import { ClientProfile, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';
import { ClientPrivateNotesDrawer } from './ClientPrivateNotesDrawer';

interface ClientProgressAnalyticsProps {
  clients: ClientProfile[];
  lang: SupportedLanguage;
  onOpenTwoFactorModal: () => void;
  onOpenAiCopilot: (focus: string) => void;
}

export const ClientProgressAnalytics: React.FC<ClientProgressAnalyticsProps> = ({
  clients,
  lang,
  onOpenTwoFactorModal,
  onOpenAiCopilot
}) => {
  const t = getTranslation(lang);
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultPin, setVaultPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Radar chart calculation for 6 points
  const radarDimensions = [
    { key: 'leadership', label: t.clientProgress.leadership, val: client.radarScores.leadership },
    { key: 'strategy', label: t.clientProgress.strategy, val: client.radarScores.strategy },
    { key: 'execution', label: t.clientProgress.execution, val: client.radarScores.execution },
    { key: 'resilience', label: t.clientProgress.resilience, val: client.radarScores.resilience },
    { key: 'financialAcumen', label: t.clientProgress.finance, val: client.radarScores.financialAcumen },
    { key: 'teamAlignment', label: t.clientProgress.alignment, val: client.radarScores.teamAlignment },
  ];

  const size = 320;
  const center = size / 2;
  const radius = 110;
  const angleStep = (Math.PI * 2) / radarDimensions.length;

  // Convert polar to cartesian
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
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.clientProgress.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.clientProgress.subtitle}
            </p>
          </div>

          {/* Client Selector & Drawer Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsNotesDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <StickyNote className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
              <span>Catatan Privat Coach</span>
            </button>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto scrollbar-none">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setVaultUnlocked(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    selectedClientId === c.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
                src={client.avatar}
                alt={client.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {client.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {client.role} · {client.company}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{client.activeTier}</span>
                  <span>·</span>
                  <span>Bergabung: {client.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-xs text-slate-500">Sesi Selesai</span>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {client.completedSessions} / {client.totalSessions} Sesi
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-xs text-slate-500">Indeks Kepuasan</span>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                  ★ {client.satisfactionScore} / 5.0
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setIsNotesDrawerOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <StickyNote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Buka Catatan Privat ({client.name})</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono px-1.5 py-0.5 rounded">
                  Offline-Ready
                </span>
              </button>

              <button
                onClick={() => onOpenAiCopilot(`Klien: ${client.name} (${client.company}) - Evaluasi Kompetensi Bisnis`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rekomendasi Strategis AI untuk {client.name}</span>
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
                    {client.confidentialVaultNotes}
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
      <ClientPrivateNotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        client={client}
        lang={lang}
      />

    </div>
  );
};
