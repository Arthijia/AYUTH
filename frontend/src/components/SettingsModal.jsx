import React, { useState } from 'react';
import { X, Key, Database, Sparkles, Check, Zap } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function SettingsModal({ isOpen, onClose, apiKey, onSaveApiKey, onClearSession, language }) {
  if (!isOpen) return null;
  const t = (key) => getTranslation(key, language);
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 font-cinzel text-xs">
            <Zap className="w-4 h-4 text-ayurveda-primary" />
            AI Model Engine & Vector Storage Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Tech Stack Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-700 block text-[11px] font-mono-code uppercase">Active System Stack:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <div>• <strong>LLM:</strong> Groq (Llama 3.3 70B)</div>
              <div>• <strong>Vector DB:</strong> ChromaDB</div>
              <div>• <strong>Database:</strong> PostgreSQL</div>
              <div>• <strong>Storage:</strong> Supabase</div>
            </div>
          </div>

          {/* Groq API Key */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5 text-[11px]">
              <Key className="w-3.5 h-3.5 text-ayurveda-primary" />
              Groq API Key (Optional for Ultra-Fast Cloud LLM):
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Enter your Groq API key (<code className="font-mono-code text-[10px]">gsk_...</code>) to enable high-speed thinking with <strong>Llama 3.3 70B Versatile</strong>.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary outline-none font-mono-code"
              />
              <button
                onClick={handleSave}
                className="px-3.5 py-2 bg-ayurveda-primary hover:bg-ayurveda-medium text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {saved ? <Check className="w-3 h-3 text-emerald-300" /> : null}
                {saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>

          {/* Session Data Reset */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your conversation history and invention profile?")) {
                  onClearSession();
                  onClose();
                }
              }}
              className="text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Clear Session & Chat History
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
