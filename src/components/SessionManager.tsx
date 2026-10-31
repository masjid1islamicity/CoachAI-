import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  Sparkles, 
  Compass, 
  User, 
  Building2,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  PhoneOff,
  Check,
  Send,
  Plus
} from 'lucide-react';
import { Session, SessionStatus, SessionType, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';
import { decryptText, encryptText } from '../utils/crypto';

interface SessionManagerProps {
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  lang: SupportedLanguage;
  onOpenNewSessionModal: () => void;
  onOpenAiCopilot: (session: Session) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  setSessions,
  lang,
  onOpenNewSessionModal,
  onOpenAiCopilot,
}) => {
  const t = getTranslation(lang);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeSessionRoom, setActiveSessionRoom] = useState<Session | null>(null);

  // In-room state
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [roomNote, setRoomNote] = useState('');
  const [decryptedNotesMap, setDecryptedNotesMap] = useState<Record<string, string>>({});
  const [isDecrypting, setIsDecrypting] = useState<Record<string, boolean>>({});

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientCompany.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === 'All' || s.status === selectedStatus;
    const matchType = selectedType === 'All' || s.type === selectedType;
    return matchSearch && matchStatus && matchType;
  });

  // Toggle action item completion
  const toggleActionItem = (sessionId: string, itemId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          actionItems: s.actionItems.map((act) =>
            act.id === itemId ? { ...act, completed: !act.completed } : act
          ),
        };
      })
    );
  };

  // Toggle note decryption for a session card
  const handleToggleDecrypt = async (session: Session) => {
    if (decryptedNotesMap[session.id]) {
      // Re-hide
      setDecryptedNotesMap((prev) => {
        const next = { ...prev };
        delete next[session.id];
        return next;
      });
      return;
    }

    setIsDecrypting((prev) => ({ ...prev, [session.id]: true }));
    const decrypted = await decryptText(session.encryptedNotes);
    setDecryptedNotesMap((prev) => ({ ...prev, [session.id]: decrypted }));
    setIsDecrypting((prev) => ({ ...prev, [session.id]: false }));
  };

  // Open Room
  const handleOpenRoom = async (session: Session) => {
    setActiveSessionRoom(session);
    const decrypted = await decryptText(session.encryptedNotes);
    setRoomNote(decrypted.startsWith('E2E::') ? 'Catatan sesi terenkripsi aktif.' : decrypted);
  };

  // Save room notes with E2EE
  const handleSaveRoomNotes = async () => {
    if (!activeSessionRoom) return;
    const encrypted = await encryptText(roomNote);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionRoom.id ? { ...s, encryptedNotes: encrypted } : s
      )
    );
    alert('Catatan berhasil diamankan dengan enkripsi AES-256 GCM!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.sessions.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.sessions.subtitle}
            </p>
          </div>

          <button
            onClick={onOpenNewSessionModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.topBar.scheduleSession}</span>
          </button>
        </div>

        {/* Filter Controls (Segmented controls) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari sesi, nama klien, atau perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Status (Buttons/Tabs segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto scrollbar-none">
            {['All', 'Upcoming', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'All' ? 'Semua Status' : st}
              </button>
            ))}
          </div>

          {/* Filter Category */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto scrollbar-none">
            {['All', 'Executive Mentoring', 'Strategic Consulting', '1-on-1 Coaching', 'Group Mastermind'].map((tp) => (
              <button
                key={tp}
                onClick={() => setSelectedType(tp)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === tp
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tp === 'All' ? 'Semua Layanan' : tp.replace('Strategic Consulting', 'Consulting').replace('Executive Mentoring', 'Mentoring')}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada sesi yang cocok dengan kriteria pencarian.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedStatus('All'); setSelectedType('All'); }}
              className="mt-3 px-3.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isNotesOpen = !!decryptedNotesMap[session.id];
            const isCurrentlyDecrypting = isDecrypting[session.id];

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Client & Session Info */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={session.clientAvatar}
                      alt={session.clientName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                          {session.title}
                        </h3>

                        {/* Status (Unboxed subtle text separator or clean text) */}
                        <span className={`text-[11px] font-semibold ${
                          session.status === 'In Progress'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : session.status === 'Upcoming'
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          [{session.status}]
                        </span>

                        {session.isEncrypted && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            <Lock className="w-3 h-3" /> E2EE AES-256
                          </span>
                        )}
                      </div>

                      {/* Client & Mentor info as clean unboxed typography with separators */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{session.clientName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{session.clientCompany}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-purple-600 dark:text-purple-400">{session.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>Mentor: {session.mentorName}</span>
                      </div>

                      {/* Timing & Islamic Hijri Date */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-2 font-mono tabular-nums">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.time} ({session.durationMinutes} min)</span>
                        </div>
                        <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                          <Compass className="w-3.5 h-3.5" />
                          <span>{session.hijriDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing, Actions, Room button */}
                  <div className="flex flex-wrap items-center gap-2.5 lg:self-center shrink-0">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="text-xs text-slate-400 font-medium">Honor Sesi</div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: session.currency, maximumFractionDigits: 0 }).format(session.fee)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDecrypt(session)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      {isNotesOpen ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{isNotesOpen ? 'Sembunyikan Catatan' : 'Buka Catatan E2E'}</span>
                    </button>

                    <button
                      onClick={() => onOpenAiCopilot(session)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.sessions.aiSummary}</span>
                    </button>

                    <button
                      onClick={() => handleOpenRoom(session)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t.sessions.joinMeeting}</span>
                    </button>
                  </div>

                </div>

                {/* Encrypted Notes Panel (Toggled) */}
                {isNotesOpen && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1.5 text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Catatan Konsultasi Terdekripsi (Kunci Kriptografis Sesi Terverifikasi)
                      </span>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                        Cipher: AES-GCM 256
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      {decryptedNotesMap[session.id] || 'Tidak ada catatan tersembunyi.'}
                    </div>
                  </div>
                )}

                {/* Action Items List */}
                {session.actionItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Rencana Aksi & Tindak Lanjut ({session.actionItems.filter(a => a.completed).length}/{session.actionItems.length} Selesai):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {session.actionItems.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => toggleActionItem(session.id, act.id)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            act.completed
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-slate-500 line-through'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {act.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{act.task}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                            {act.deadline}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* VIRTUAL ADVISORY SUITE MODAL SIMULATOR */}
      {activeSessionRoom && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Suite Top Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    {activeSessionRoom.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>Klien: {activeSessionRoom.clientName}</span>
                    <span>·</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> E2EE Stream Secured
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAiCopilot(activeSessionRoom)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-900/50 hover:bg-purple-900 border border-purple-700 rounded-lg cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Co-Pilot</span>
                </button>
                <button
                  onClick={() => setActiveSessionRoom(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer transition-colors"
                >
                  Akhiri Sesi
                </button>
              </div>
            </div>

            {/* Room Main Layout: 2 Columns */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
              
              {/* Left 2 Cols: Video Stream Preview & Simulated Live Transcript */}
              <div className="lg:col-span-2 flex flex-col bg-slate-950 p-4 border-r border-slate-800 overflow-y-auto">
                
                {/* Visual Video Stream Simulator */}
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img
                    src="/src/assets/images/coaching_room_preview_1793447600177.jpg"
                    alt="Executive Advisory Suite"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  
                  {/* Overlay Client Tag */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs">
                    <img
                      src={activeSessionRoom.clientAvatar}
                      alt={activeSessionRoom.clientName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{activeSessionRoom.clientName} ({activeSessionRoom.clientCompany})</span>
                  </div>

                  {/* Audio / Video Controls Floating Bar */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white">
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600'}`}
                    >
                      {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${isVideoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600'}`}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                    <button className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 cursor-pointer">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simulated Live Audio Transcript & AI Sentiment Stream */}
                <div className="mt-4 flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-slate-200">
                        Transkripsi Sesi Real-Time & Deteksi Sentimen
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Sentimen: Komitmen Tinggi (94%)
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 font-sans flex-1 overflow-y-auto max-h-40">
                    <div>
                      <span className="font-semibold text-emerald-400">{activeSessionRoom.clientName}:</span>
                      <p className="mt-0.5 text-slate-300">
                        "Kami sedang mengevaluasi restrukturisasi target kuartal depan. Tantangan terbesar ada pada efisiensi proses onboarding tim sales dan penyesuaian cash flow."
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-purple-400">{activeSessionRoom.mentorName} (Mentor):</span>
                      <p className="mt-0.5 text-slate-300">
                        "Mari kita bedah menggunakan kerangka GROW. Dari sisi Reality, berapa rata-rata siklus sales saat ini dan di titik mana terjadi bottleneck paling signifikan?"
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Col: Encrypted Notes & Action Item Tracker */}
              <div className="flex flex-col bg-slate-50 dark:bg-slate-900 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    Catatan Sesi Terenkripsi E2EE
                  </span>
                  <button
                    onClick={handleSaveRoomNotes}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer transition-colors"
                  >
                    Simpan E2EE
                  </button>
                </div>

                <textarea
                  value={roomNote}
                  onChange={(e) => setRoomNote(e.target.value)}
                  placeholder="Ketik catatan sesi privat di sini. Data akan dienkripsi dengan kunci AES-256 sebelum disimpan..."
                  className="w-full flex-1 min-h-[160px] p-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
                />

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Action Items Langsung
                  </div>
                  <div className="space-y-2">
                    {activeSessionRoom.actionItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleActionItem(activeSessionRoom.id, item.id)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:border-slate-300"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className={`truncate ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
