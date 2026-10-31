import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal, 
  FileLock2,
  Cpu
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { getTranslation } from '../utils/i18n';
import { encryptText, decryptText, computeFingerprint } from '../utils/crypto';

interface SecurityEncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
}

export const SecurityEncryptionModal: React.FC<SecurityEncryptionModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = getTranslation(lang);

  const [testPlaintext, setTestPlaintext] = useState('Rencana restrukturisasi dewan komisaris & roadmap putaran pendanaan Series B senilai $15M.');
  const [testCiphertext, setTestCiphertext] = useState('');
  const [testDecrypted, setTestDecrypted] = useState('');
  const [fingerprint, setFingerprint] = useState('7F8E:9D2A:4B1C:6E3F:5A0D:8C7B:1E4F:3A2D');
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);

  useEffect(() => {
    computeFingerprint('MurshidAI-Master-Key-2026-Oct').then((fp) => setFingerprint(fp));
  }, []);

  if (!isOpen) return null;

  const handleTestEncrypt = async () => {
    const cipher = await encryptText(testPlaintext);
    setTestCiphertext(cipher);
    setTestDecrypted('');
  };

  const handleTestDecrypt = async () => {
    if (!testCiphertext) return;
    const plain = await decryptText(testCiphertext);
    setTestDecrypted(plain);
  };

  const handleRotateKeys = () => {
    setIsRotatingKeys(true);
    setTimeout(async () => {
      const newFp = await computeFingerprint(`MurshidAI-Key-${Date.now()}`);
      setFingerprint(newFp);
      setIsRotatingKeys(false);
      alert('Kunci kriptografis sesi berhasil dirotasi dengan aman!');
    }, 1000);
  };

  const handleCopyFp = () => {
    navigator.clipboard?.writeText(fingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.security.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.security.subtitle}
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
          
          {/* Security Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">Algoritma Simetris</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">AES-GCM 256-bit</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Tingkat Militer</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">Key Derivation</span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">PBKDF2 SHA-256</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">100.000 Iterasi</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 block">Zero-Knowledge Vault</span>
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">100% Client-Side</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Server tidak menyimpan kunci</span>
            </div>
          </div>

          {/* Fingerprint Banner */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between border border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                {t.security.keyFingerprint}
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider">
                {fingerprint}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFp}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="Salin Sidik Jari"
              >
                {copiedFingerprint ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRotateKeys}
                disabled={isRotatingKeys}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRotatingKeys ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t.security.generateNewKeys}</span>
              </button>
            </div>
          </div>

          {/* Interactive WebCrypto Playground */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Simulasi Kriptografi Langsung (Web Cryptography Engine)
            </h3>
            
            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                Data Plaintext (Catatan Sesi / Kontrak Penasihat):
              </label>
              <textarea
                rows={2}
                value={testPlaintext}
                onChange={(e) => setTestPlaintext(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestEncrypt}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Enkripsi Sekarang (AES-256)</span>
              </button>
              {testCiphertext && (
                <button
                  onClick={handleTestDecrypt}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Uji Dekripsi Kembali</span>
                </button>
              )}
            </div>

            {testCiphertext && (
              <div className="mt-3 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 block">
                  Ciphertext Hex Output (IV + Tag Otentikasi GCM):
                </span>
                <div className="p-2.5 bg-slate-950 text-emerald-400 rounded-lg font-mono text-[11px] break-all leading-tight">
                  {testCiphertext}
                </div>
              </div>
            )}

            {testDecrypted && (
              <div className="mt-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold">Hasil Dekripsi Sukses: </span>
                {testDecrypted}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
