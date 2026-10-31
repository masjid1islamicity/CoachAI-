import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, Lock, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { Session, SessionType, ClientProfile, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';
import { checkPrayerConflict, getHijriDate } from '../utils/hijri';
import { encryptText } from '../utils/crypto';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientProfile[];
  onSaveSession: (session: Session) => void;
  lang: SupportedLanguage;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSaveSession,
  lang,
}) => {
  const t = getTranslation(lang);

  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [title, setTitle] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('Executive Mentoring');
  const [date, setDate] = useState('2026-11-02');
  const [time, setTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [fee, setFee] = useState(5000000);
  const [currency, setCurrency] = useState<'IDR' | 'USD' | 'SAR'>('IDR');
  const [notes, setNotes] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Prayer buffer conflict state
  const [prayerConflict, setPrayerConflict] = useState<{
    hasConflict: boolean;
    conflictingPrayer?: string;
    recommendation?: string;
  }>({ hasConflict: false });

  // Hijri date preview
  const [hijriPreview, setHijriPreview] = useState('');

  useEffect(() => {
    // Check prayer conflict
    const conflict = checkPrayerConflict(time, durationMinutes);
    setPrayerConflict(conflict);

    // Update Hijri preview
    try {
      const selectedDate = new Date(date);
      if (!isNaN(selectedDate.getTime())) {
        const h = getHijriDate(selectedDate, lang);
        setHijriPreview(h.hijriFormatted);
      }
    } catch {
      setHijriPreview('22 Jumada al-Ula 1448 H');
    }
  }, [date, time, durationMinutes, lang]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEncrypting(true);

    const client = clients.find((c) => c.id === clientId) || clients[0];
    const encrypted = await encryptText(notes || 'Sesi inisiasi strategis.');

    const newSession: Session = {
      id: `SES-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: title || `${sessionType} bersama ${client.name}`,
      clientName: client.name,
      clientAvatar: client.avatar,
      clientCompany: client.company,
      clientEmail: client.email,
      mentorName: 'Dr. Tariq Al-Mansoor',
      mentorAvatar: '/src/assets/images/avatar_mentor_lead_1793447599005.jpg',
      type: sessionType,
      date,
      time,
      durationMinutes: Number(durationMinutes),
      status: 'Upcoming',
      fee: Number(fee),
      currency,
      meetingUrl: `https://meet.murshid.ai/room-${Math.floor(1000 + Math.random() * 9000)}`,
      hijriDate: hijriPreview,
      prayerBufferConflict: prayerConflict.hasConflict,
      isEncrypted: true,
      encryptedNotes: encrypted,
      actionItems: [
        { id: `act-${Date.now()}-1`, task: 'Kirim kuisioner pra-sesi terenkripsi', deadline: date, owner: 'Mentor', completed: false }
      ],
      diagnosticScore: 88,
      tags: [sessionType, client.company]
    };

    onSaveSession(newSession);
    setIsEncrypting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.sessions.newSessionModalTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dilengkapi perlindungan otomatis kalender Islam & enkripsi AES-256
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Client & Service Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.sessions.clientLabel}
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.sessions.sessionTypeLabel}
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="1-on-1 Coaching">1-on-1 Coaching</option>
                <option value="Executive Mentoring">Executive Mentoring</option>
                <option value="Strategic Consulting">Strategic Consulting</option>
                <option value="Group Mastermind">Group Mastermind</option>
              </select>
            </div>
          </div>

          {/* Session Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topik & Agenda Sesi
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Evaluasi Unit Economics & Review Struktur Organisasi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.sessions.dateLabel}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.sessions.timeLabel}
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.sessions.durationLabel}
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={45}>45 Menit</option>
                <option value={60}>60 Menit (1 Jam)</option>
                <option value={75}>75 Menit</option>
                <option value={90}>90 Menit</option>
                <option value={120}>120 Menit (2 Jam)</option>
              </select>
            </div>
          </div>

          {/* Islamic Prayer Conflict Alert Banner */}
          {prayerConflict.hasConflict ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Konflik Waktu Sholat Terdeteksi: </span>
                <span>Jadwal berdekatan dengan {prayerConflict.conflictingPrayer}. </span>
                <span className="block text-amber-700 dark:text-amber-300 mt-0.5">{prayerConflict.recommendation}</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Jadwal Bebas Konflik Ibadah</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                {hijriPreview}
              </span>
            </div>
          )}

          {/* Fee & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.sessions.feeLabel}
              </label>
              <input
                type="number"
                min={0}
                step={500000}
                required
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Uang
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              >
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (SR)</option>
              </select>
            </div>
          </div>

          {/* Confidential Notes (E2EE) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                {t.sessions.notesLabel}
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Tersandi otomatis</span>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan diagnosa awal atau instruksi khusus sebelum pertemuan dimulai..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isEncrypting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isEncrypting ? 'Mengenkripsi...' : t.sessions.saveSession}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
