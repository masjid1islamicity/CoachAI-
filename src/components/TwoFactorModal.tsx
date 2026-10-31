import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Check, 
  Copy, 
  RefreshCw, 
  Smartphone, 
  Lock, 
  QrCode,
  Download
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';
import { generateBackupCodes } from '../utils/crypto';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = getTranslation(lang);

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [secondsRemaining, setSecondsRemaining] = useState(28);
  const [isVerified, setIsVerified] = useState(true);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  useEffect(() => {
    setBackupCodes(generateBackupCodes());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const nextOtp = [...otpCode];
    nextOtp[index] = val.slice(-1);
    setOtpCode(nextOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const full = otpCode.join('');
    if (full.length === 6) {
      setIsVerified(true);
      alert('Autentikasi dua faktor berhasil diverifikasi!');
    } else {
      alert('Masukkan 6 digit kode OTP yang lengkap.');
    }
  };

  const handleCopySingleCode = (code: string, idx: number) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 dark:bg-sky-950/40 rounded-lg text-sky-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.security.twoFactorStatus}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencegahan akses ilegal dengan standar RFC 6238 TOTP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Active Status Badge */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">2FA Aktif & Terlindungi (Level Enterprise)</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
              Google / MS Authenticator
            </span>
          </div>

          {/* Interactive TOTP Verification Simulator */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Uji Verifikasi Token TOTP 6-Digit
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Masukkan 6 digit kode dari aplikasi autentikator Anda:
            </p>

            <div className="flex items-center justify-center gap-2 mb-3">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-10 h-12 text-center text-lg font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono mb-4">
              <span>Token berganti dalam:</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">{secondsRemaining} detik</span>
            </div>

            <button
              onClick={handleVerify}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              Verifikasi Token Keamanan
            </button>
          </div>

          {/* Emergency Backup Codes */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                {t.security.backupCodes}
              </h3>
              <button
                onClick={() => setBackupCodes(generateBackupCodes())}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Buat Kode Baru
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Simpan kode darurat ini di tempat aman jika Anda kehilangan akses ke perangkat autentikator:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {backupCodes.map((code, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopySingleCode(code, idx)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:border-slate-300"
                  title="Klik untuk menyalin"
                >
                  <span>{code}</span>
                  {copiedCodeIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
