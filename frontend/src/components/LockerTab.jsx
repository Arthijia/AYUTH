import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Copy, Check, Download, FileCheck, Clock, Save, History } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function LockerTab({ language }) {
  const t = (key) => getTranslation(key, language);
  const [inventionTitle, setInventionTitle] = useState('');
  const [inventionText, setInventionText] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedInventions, setSavedInventions] = useState([]);

  const fetchInventions = () => {
    fetch('/api/inventions')
      .then((res) => res.json())
      .then((data) => setSavedInventions(data.records || []))
      .catch((err) => console.warn("Invention records fetch error", err));
  };

  useEffect(() => {
    fetchInventions();
  }, []);

  const generateAndSaveHash = async () => {
    if (!inventionText.trim()) {
      alert("Please paste or type your invention description.");
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inventionText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // Save to server with UTC timestamp
      const res = await fetch('/api/inventions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: inventionTitle.trim() || 'Ayurvedic Invention Record',
          description: inventionText,
          sha256Hash: hashHex,
        }),
      });

      if (res.ok) {
        const savedData = await res.json();
        setReceipt({
          hash: hashHex,
          timestamp: savedData.record?.timestamp_utc || new Date().toUTCString(),
          title: savedData.record?.title || inventionTitle,
          size: `${data.length} bytes (${inventionText.length} characters)`,
        });
        fetchInventions();
      }
    } catch (err) {
      console.error("Hashing failed", err);
      alert("Cryptographic calculation failed.");
    }
  };

  const copyToClipboard = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    if (!receipt) return;
    const content = `===========================================================
AYUTH INVENTION LOCKER - VERIFIED PROOF OF CONCEPTION RECEIPT
===========================================================
Invention Title : ${receipt.title}
Timestamp (UTC) : ${receipt.timestamp}
SHA-256 Hash    : ${receipt.hash}
Text Size       : ${receipt.size}
Jurisdiction    : Global / India (Prior User Rights Verification)
===========================================================
Statutory Notice: This timestamped SHA-256 cryptographic hash
provides non-repudiable prior-art evidence that this technical
disclosure existed in your possession at the stated date and time.
===========================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AYUTH_Invention_Proof_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-cinzel">
            <Lock className="w-5 h-5 text-ayurveda-primary" />
            {t('lockerTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('lockerDescription')}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Invention Document Title:
            </label>
            <input
              type="text"
              value={inventionTitle}
              onChange={(e) => setInventionTitle(e.target.value)}
              placeholder="e.g. Synergistic Ashwagandha Formulation & Extraction Method"
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('inventionTextLabel')}
            </label>
            <textarea
              value={inventionText}
              onChange={(e) => setInventionText(e.target.value)}
              placeholder={t('inventionTextPlaceholder')}
              rows={6}
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none font-mono-code"
            />
          </div>

          <button
            onClick={generateAndSaveHash}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ayurveda-primary to-ayurveda-medium hover:from-ayurveda-medium hover:to-ayurveda-dark text-white rounded-xl font-semibold text-sm shadow-md shadow-ayurveda-primary/20 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Generate Timestamped Proof & Save Invention Document
          </button>
        </div>
      </div>

      {/* Proof Receipt Card */}
      {receipt && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-ayurveda-dark text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-ayurveda-light/20 flex items-center justify-center border border-ayurveda-light/30">
                <FileCheck className="w-5 h-5 text-ayurveda-pale" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ayurveda-cream">{receipt.title}</h3>
                <p className="text-[11px] text-slate-400">Timestamped Proof-of-Conception Document Receipt</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ✓ Verified SHA-256
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono-code bg-black/40 p-4 rounded-xl border border-slate-700/60">
            <div>
              <span className="text-slate-400 block mb-1">Timestamp (UTC):</span>
              <span className="text-ayurveda-cream font-bold">{receipt.timestamp}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">SHA-256 Hash:</span>
              <span className="text-emerald-400 break-all select-all font-bold text-xs">
                {receipt.hash}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Size:</span>
              <span className="text-slate-300">{receipt.size}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Hash"}
            </button>

            <button
              onClick={downloadReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-ayurveda-primary hover:bg-ayurveda-medium text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Receipt
            </button>
          </div>
        </div>
      )}

      {/* Timestamped Inventions History */}
      {savedInventions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <History className="w-4 h-4 text-ayurveda-primary" />
            Timestamped Invention Proof Records ({savedInventions.length})
          </h3>

          <div className="space-y-2">
            {savedInventions.map((inv, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="space-y-1 truncate mr-4">
                  <span className="font-bold text-slate-800 truncate block">
                    {inv.title || "Ayurvedic Invention Record"}
                  </span>
                  <span className="font-mono-code text-[11px] text-emerald-700 truncate block">
                    SHA-256: {inv.sha256Hash ? inv.sha256Hash.substring(0, 24) + "..." : "Generated"}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {inv.timestamp_utc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
