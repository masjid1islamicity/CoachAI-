import React, { useState } from 'react';
import { 
  Compass, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Calendar as CalendarIcon, 
  Check, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { IslamicDateInfo, PrayerTime, Session, SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';
import { CITY_PRESETS, getPrayerTimes, CityPrayerConfig } from '../utils/hijri';

interface IslamicCalendarModuleProps {
  islamicInfo: IslamicDateInfo;
  sessions: Session[];
  lang: SupportedLanguage;
}

export const IslamicCalendarModule: React.FC<IslamicCalendarModuleProps> = ({
  islamicInfo,
  sessions,
  lang,
}) => {
  const t = getTranslation(lang);

  const [selectedCity, setSelectedCity] = useState('Jakarta');
  const [prayerShieldEnabled, setPrayerShieldEnabled] = useState(true);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0); // 0 = Oct/Nov 2026

  const cityConfig: CityPrayerConfig = CITY_PRESETS.find(c => c.name === selectedCity) || CITY_PRESETS[0];
  const prayers = getPrayerTimes(selectedCity);

  // Calendar days generation for October 2026 (31 days, starts on Thursday Oct 1)
  const daysInMonth = 31;
  const startDayOfWeek = 4; // Thursday

  // Islamic events
  const islamicEvents = [
    { date: '13-15 Jumada al-Ula (1448 H)', title: 'Puasa Sunnah Ayyamul Bidh', desc: 'Disarankan mengatur sesi mentoring di pagi atau malam hari.' },
    { date: '27 Rajab (1448 H)', title: 'Isra Mi\'raj Nabi Muhammad SAW', desc: 'Hari libur nasional & evaluasi kepemimpinan beretika.' },
    { date: '1 Ramadan (1448 H)', title: 'Awal Bulan Suci Ramadan', desc: 'Penyesuaian jam kerja konsultan: shift pagi 08:30 - 12:00, malam 20:30 - 22:30.' },
    { date: '1 Syawwal (1448 H)', title: 'Hari Raya Idul Fitri', desc: 'Jeda operasional tahunan dan silaturahmi klien enterprise.' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.islamic.title}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.islamic.subtitle}
            </p>
          </div>

          {/* City Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {t.islamic.currentCity}:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {CITY_PRESETS.map((city) => (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city.name)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    selectedCity === city.name
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Times Grid & Prayer Buffer Shield */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Today's Prayer Schedule */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Jadwal Waktu Sholat Sinkron ({cityConfig.name} - {cityConfig.country})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sinkronisasi waktu presisi tinggi lintas zona waktu untuk konsultasi global
                </p>
              </div>

              {/* Prayer Buffer Shield Toggle */}
              <button
                onClick={() => setPrayerShieldEnabled(!prayerShieldEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  prayerShieldEnabled
                    ? 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Buffer Sholat: {prayerShieldEnabled ? 'Aktif (15 Min)' : 'Non-Aktif'}</span>
              </button>
            </div>

            {/* Prayer Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {prayers.map((prayer) => {
                const isNext = prayer.isNext;
                return (
                  <div
                    key={prayer.name}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      isNext
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 shadow-xs ring-1 ring-teal-400/40'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono block">
                      {prayer.arabicName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {prayer.name}
                    </h4>
                    <div className="text-base font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums mt-1">
                      {prayer.time}
                    </div>
                    {isNext && (
                      <span className="inline-block mt-1.5 text-[9px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900 px-1.5 py-0.5 rounded">
                        Mendatang
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scheduled Sessions Today & Prayer Time Overlap Check */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Audit Kepatuhan Waktu Ibadah pada Sesi Hari Ini
              </h4>
              <div className="space-y-2">
                {sessions.slice(0, 3).map((ses) => (
                  <div
                    key={ses.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">{ses.time}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{ses.title}</span>
                      <span className="text-slate-400">({ses.clientName})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ses.prayerBufferConflict ? (
                        <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Perlu Penyesuaian
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                          <Check className="w-3.5 h-3.5" /> Sesuai Buffer Sholat
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dual Calendar Grid (Gregorian + Hijri) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kalender Dual: Oktober 2026 / Jumada al-Ula 1448 H
                </h3>
              </div>
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md">
                {islamicInfo.hijriFormatted}
              </span>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 rounded-lg bg-slate-50/40 dark:bg-slate-800/20" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const hijriDayNum = (dayNum + 20) > 30 ? (dayNum + 20 - 30) : (dayNum + 20);
                const isToday = dayNum === 31;
                const hasSession = dayNum === 28 || dayNum === 30 || dayNum === 31;
                const isAyyamulBidh = dayNum === 24 || dayNum === 25 || dayNum === 26;

                return (
                  <div
                    key={dayNum}
                    className={`h-14 p-1 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      isToday
                        ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-400 dark:border-teal-600 font-bold'
                        : isAyyamulBidh
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-mono ${isToday ? 'text-teal-700 dark:text-teal-300 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                        {dayNum}
                      </span>
                      <span className="text-[9px] font-mono text-teal-600 dark:text-teal-400">
                        {hijriDayNum}H
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasSession && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sesi Terjadwal" />
                      )}
                      {isAyyamulBidh && (
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-medium">Bidh</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Islamic Events & Ethical Advisory Charter */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Islamic Milestones */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              {t.islamic.upcomingIslamicEvents}
            </h3>

            <div className="space-y-3">
              {islamicEvents.map((evt, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-semibold block">
                    {evt.date}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {evt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Mentoring Charter (Sharia & Professional Integrity) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Prinsip Integritas Konsultasi Syariah
            </h3>
            
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-600">1. Shiddiq (Integritas):</span>
                <span>Transparansi diagnosa dan kebenaran data tanpa rekayasa.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-600">2. Amanah (Akuntabilitas):</span>
                <span>Kerahasiaan data klien terproteksi enkripsi end-to-end tanpa celah.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-600">3. Tabligh (Komunikatif):</span>
                <span>Penyampaian rekomendasi mentoring secara konstruktif dan solutif.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-teal-600">4. Fathanah (Kecerdasan):</span>
                <span>Strategi inovatif didukung teknologi AI dan analitik performa akurat.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
