import React, { useState, useEffect } from 'react';
import { 
  X, 
  StickyNote, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Search, 
  HardDrive, 
  WifiOff, 
  Clock, 
  Tag,
  Lock,
  Sparkles,
  FileText
} from 'lucide-react';
import { ClientProfile, CoachPrivateNote, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';

interface ClientPrivateNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProfile;
  lang: SupportedLanguage;
}

const DEFAULT_INITIAL_NOTES: CoachPrivateNote[] = [
  {
    id: 'note-1',
    clientId: 'CLI-001', // Sarah Jenkins
    content: 'Observasi kepemimpinan: Sarah memiliki ketajaman analitik luar biasa pada unit economics, namun cenderung menahan delegasi operasional kepada VP baru. Sesi berikutnya perlu fokus pada trust matrix dan framework pendelegasian wewenang.',
    category: 'Observasi',
    createdAt: '2026-10-28T09:30:00.000Z',
  },
  {
    id: 'note-2',
    clientId: 'CLI-001',
    content: 'Prioritas mendesak: Tinjau revisi board deck Series B $15M bersama komite penasihat sebelum presentasi ke investor pada 12 November.',
    category: 'Prioritas',
    createdAt: '2026-10-30T14:15:00.000Z',
  },
  {
    id: 'note-3',
    clientId: 'CLI-002', // Reza Pratama
    content: 'Tantangan teknis: Transisi arsitektur multi-tenant membutuhkan alignment ketat dengan tim DevOps. Perhatikan beban kerja engineering lead agar terhindar dari cognitive overload.',
    category: 'Tantangan',
    createdAt: '2026-10-29T11:00:00.000Z',
  },
  {
    id: 'note-4',
    clientId: 'CLI-003', // Nadia Kusuma
    content: 'Mindset & dinamika tim: Resiliensi kepemimpinan Nadia menunjukkan progres signifikan (+15%) pasca penerapan 360-degree feedback kuartalan.',
    category: 'Mindset',
    createdAt: '2026-10-27T16:20:00.000Z',
  },
  {
    id: 'note-5',
    clientId: 'CLI-004', // Farhan Zulkarnain
    content: 'Integritas & kepatuhan: Pembahasan lisensi open-banking syariah di Riyadh berjalan sesuai rencana regulasi SAMA tanpa kompromi tata kelola.',
    category: 'Etika',
    createdAt: '2026-10-25T13:40:00.000Z',
  }
];

export const ClientPrivateNotesDrawer: React.FC<ClientPrivateNotesDrawerProps> = ({
  isOpen,
  onClose,
  client,
  lang,
}) => {
  const t = getTranslation(lang);

  // Load from localStorage or defaults
  const [allNotes, setAllNotes] = useState<CoachPrivateNote[]>(() => {
    try {
      const saved = localStorage.getItem('murshid_coach_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse notes from localStorage:', e);
    }
    return DEFAULT_INITIAL_NOTES;
  });

  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CoachPrivateNote['category']>('Observasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Sync to localStorage whenever allNotes changes
  useEffect(() => {
    try {
      localStorage.setItem('murshid_coach_notes', JSON.stringify(allNotes));
    } catch (e) {
      console.error('Failed to save notes to localStorage:', e);
    }
  }, [allNotes]);

  if (!isOpen) return null;

  // Filter notes for the currently active client
  const clientNotes = allNotes.filter((n) => n.clientId === client.id);

  const filteredNotes = clientNotes.filter((n) => {
    const matchCategory = selectedFilterCategory === 'all' || n.category === selectedFilterCategory;
    const matchSearch = n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newNote: CoachPrivateNote = {
      id: `note-${Date.now()}`,
      clientId: client.id,
      content: newContent.trim(),
      category: newCategory,
      createdAt: new Date().toISOString(),
    };

    setAllNotes((prev) => [newNote, ...prev]);
    setNewContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Hapus catatan privat ini dari penyimpanan lokal?')) {
      setAllNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  const handleCopyNote = (note: CoachPrivateNote) => {
    navigator.clipboard?.writeText(note.content);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 1800);
  };

  const handleExportClientNotes = () => {
    if (clientNotes.length === 0) {
      alert('Belum ada catatan untuk diunduh.');
      return;
    }

    const header = `=== CATATAN PRIVAT COACH & MENTOR MURSHID AI ===\nKlien: ${client.name} (${client.company})\nRole: ${client.role}\nDiekspor: ${new Date().toLocaleString('id-ID')}\n==============================================\n\n`;
    const body = clientNotes
      .map(
        (n, i) =>
          `[${i + 1}] Kategori: ${n.category}\nWaktu: ${new Date(n.createdAt).toLocaleString('id-ID')}\nCatatan:\n${n.content}\n----------------------------------------------`
      )
      .join('\n\n');

    const fullText = header + body;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Catatan_Privat_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={client.avatar}
              alt={client.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Catatan Privat Coach: {client.name}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {client.company} · {client.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportClientNotes}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title="Unduh Catatan (.txt)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline Persistence Status Strip */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Tersimpan di LocalStorage</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400">Tersedia Luring (Offline-Ready)</span>
          </div>

          <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {clientNotes.length} Catatan Tersimpan
          </span>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Quick Add Note Box */}
          <form onSubmit={handleAddNote} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Tambah Catatan Privat Cepat
              </span>

              {/* Category Picker */}
              <div className="flex items-center gap-1">
                {(['Observasi', 'Tantangan', 'Prioritas', 'Mindset', 'Etika'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors cursor-pointer ${
                      newCategory === cat
                        ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleAddNote(e);
                }
              }}
              placeholder={`Tuliskan observasi strategi, dinamika perilaku, atau tindak lanjut untuk ${client.name}... (Ctrl + Enter untuk simpan)`}
              className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Pintasan: <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px] font-mono">Ctrl+Enter</kbd>
              </span>

              <button
                type="submit"
                disabled={!newContent.trim()}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer ${
                  newContent.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Catatan</span>
              </button>
            </div>
          </form>

          {/* Search & Filter Header for Existing Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Riwayat Observasi & Catatan Tersimpan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedFilterCategory}
                onChange={(e) => setSelectedFilterCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Semua Kategori ({clientNotes.length})</option>
                <option value="Observasi">Observasi</option>
                <option value="Tantangan">Tantangan</option>
                <option value="Prioritas">Prioritas</option>
                <option value="Mindset">Mindset</option>
                <option value="Etika">Etika</option>
              </select>
            </div>
          </div>

          {/* Notes Timeline List */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery || selectedFilterCategory !== 'all'
                    ? 'Tidak ada catatan yang cocok dengan filter.'
                    : `Belum ada catatan privat untuk ${client.name}. Tambahkan catatan pertama Anda di atas.`}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-2.5"
                >
                  {/* Note Card Header (clean unboxed text with separators per design rules) */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {note.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyNote(note)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Salin Teks"
                      >
                        {copiedNoteId === note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Body */}
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
