import { PrayerTime, IslamicDateInfo } from '../types';

export const HIJRI_MONTHS = {
  id: [
    'Muharram', 'Safar', "Rabi'ul Awwal", "Rabi'ul Akhir",
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sya'ban",
    'Ramadan', 'Syawwal', "Dzulqa'dah", 'Dzulhijjah'
  ],
  en: [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
  ],
  ar: [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ]
};

// Accurate Hijri conversion based on astronomical approximate algorithm
export function getHijriDate(date: Date = new Date(), lang: 'id' | 'en' | 'ar' = 'id'): IslamicDateInfo {
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();

  // Astronomical Julian day calculation
  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  // Epoch of Islamic Calendar
  const z = jd - 1948439.5;
  const cyc = Math.floor(z / 10631);
  const rem = z - 10631 * cyc;
  const j = Math.floor((rem + 0.5) / 354.366);
  const hYear = 30 * cyc + j + 1;
  const hDays = rem - Math.floor(j * 354.366);
  
  // Hijri Month & Day
  let hMonth = Math.min(11, Math.floor((hDays + 0.5) / 29.5));
  let hDay = Math.floor(hDays - Math.floor(hMonth * 29.5)) + 1;
  if (hDay > 30) {
    hDay = 30;
  }
  if (hDay <= 0) hDay = 1;

  const monthNames = HIJRI_MONTHS[lang] || HIJRI_MONTHS.id;
  const hijriMonthName = monthNames[hMonth];

  let currentEvent: string | undefined = undefined;
  if (hMonth === 8) {
    currentEvent = lang === 'en' ? 'Holy Ramadan' : lang === 'ar' ? 'شهر رمضان المبارك' : 'Bulan Suci Ramadan';
  } else if (hMonth === 11 && hDay >= 8 && hDay <= 13) {
    currentEvent = lang === 'en' ? 'Hajj & Dhul Hijjah' : 'Hari Raya Idul Adha & Tasyrik';
  } else if (hDay >= 13 && hDay <= 15) {
    currentEvent = lang === 'en' ? 'Ayyamul Bidh (White Days)' : 'Puasa Sunnah Ayyamul Bidh';
  }

  const hijriFormatted = `${hDay} ${hijriMonthName} ${hYear} H`;

  return {
    hijriDay: hDay,
    hijriMonthName,
    hijriYear: hYear,
    hijriFormatted,
    currentEvent,
    ramadanMode: hMonth === 8
  };
}

export interface CityPrayerConfig {
  name: string;
  country: string;
  timezone: string;
  times: {
    Subuh: string;
    Terbit: string;
    Dzuhur: string;
    Ashar: string;
    Maghrib: string;
    Isya: string;
  };
}

export const CITY_PRESETS: CityPrayerConfig[] = [
  {
    name: 'Jakarta',
    country: 'Indonesia (WIB / GMT+7)',
    timezone: 'Asia/Jakarta',
    times: {
      Subuh: '04:18',
      Terbit: '05:34',
      Dzuhur: '11:46',
      Ashar: '15:04',
      Maghrib: '17:58',
      Isya: '19:10',
    }
  },
  {
    name: 'Riyadh',
    country: 'Saudi Arabia (AST / GMT+3)',
    timezone: 'Asia/Riyadh',
    times: {
      Subuh: '04:42',
      Terbit: '06:02',
      Dzuhur: '11:42',
      Ashar: '14:55',
      Maghrib: '17:18',
      Isya: '18:48',
    }
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates (GST / GMT+4)',
    timezone: 'Asia/Dubai',
    times: {
      Subuh: '05:08',
      Terbit: '06:26',
      Dzuhur: '12:12',
      Ashar: '15:28',
      Maghrib: '17:52',
      Isya: '19:18',
    }
  },
  {
    name: 'London',
    country: 'United Kingdom (GMT)',
    timezone: 'Europe/London',
    times: {
      Subuh: '05:46',
      Terbit: '07:22',
      Dzuhur: '12:02',
      Ashar: '14:24',
      Maghrib: '16:40',
      Isya: '18:12',
    }
  }
];

export function getPrayerTimes(city = 'Jakarta'): PrayerTime[] {
  const preset = CITY_PRESETS.find(c => c.name === city) || CITY_PRESETS[0];
  const list: PrayerTime[] = [
    { name: 'Subuh', arabicName: 'الفجر', time: preset.times.Subuh },
    { name: 'Terbit', arabicName: 'الشروق', time: preset.times.Terbit },
    { name: 'Dzuhur', arabicName: 'الظهر', time: preset.times.Dzuhur },
    { name: 'Ashar', arabicName: 'العصر', time: preset.times.Ashar },
    { name: 'Maghrib', arabicName: 'المغرب', time: preset.times.Maghrib },
    { name: 'Isya', arabicName: 'العشاء', time: preset.times.Isya },
  ];

  // Mark next upcoming prayer
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextFound = false;
  for (const item of list) {
    const [h, m] = item.time.split(':').map(Number);
    const itemMinutes = h * 60 + m;
    if (itemMinutes > currentMinutes && !nextFound) {
      item.isNext = true;
      nextFound = true;
    }
  }
  if (!nextFound) {
    list[0].isNext = true; // Subuh tomorrow
  }

  return list;
}

/**
 * Checks if a session overlaps or falls within a 15-minute buffer before any prayer time.
 */
export function checkPrayerConflict(sessionTime: string, durationMinutes = 60, city = 'Jakarta'): {
  hasConflict: boolean;
  conflictingPrayer?: string;
  recommendation?: string;
} {
  const [sh, sm] = sessionTime.split(':').map(Number);
  const sessionStart = sh * 60 + sm;
  const sessionEnd = sessionStart + durationMinutes;

  const prayers = getPrayerTimes(city);
  const PRAYER_BUFFER_MINUTES = 15;

  for (const prayer of prayers) {
    if (prayer.name === 'Terbit') continue; // Sunrise is not a prayer time
    const [ph, pm] = prayer.time.split(':').map(Number);
    const prayerMinutes = ph * 60 + pm;

    // Check if session spans across prayer time or starts right inside buffer
    if (
      (sessionStart <= prayerMinutes && sessionEnd >= prayerMinutes) ||
      (prayerMinutes - sessionStart >= 0 && prayerMinutes - sessionStart <= PRAYER_BUFFER_MINUTES) ||
      (sessionStart >= prayerMinutes && sessionStart - prayerMinutes <= 20)
    ) {
      return {
        hasConflict: true,
        conflictingPrayer: `${prayer.name} (${prayer.time})`,
        recommendation: `Disarankan menggeser jadwal 25 menit agar sesi tidak terpotong waktu sholat ${prayer.name}.`
      };
    }
  }

  return { hasConflict: false };
}
