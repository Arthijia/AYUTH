import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, Scale, Globe, Plus, Upload, CheckCircle2, X } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

const STOP_WORDS = new Set([
  'i', 'need', 'all', 'the', 'related', 'to', 'for', 'a', 'an', 'and', 'in', 'on', 'is',
  'what', 'how', 'when', 'which', 'where', 'who', 'show', 'me', 'get', 'give', 'about'
]);

function normalizeTerm(word) {
  let w = word.toLowerCase().trim();
  // Handle common typo variations
  if (w.startsWith('pattent') || w.startsWith('patant') || w.startsWith('petent')) return 'patent';
  if (w.startsWith('ayur') || w.startsWith('ayush')) return 'ayur';
  if (w.startsWith('medic')) return 'medic';
  if (w.startsWith('bio')) return 'bio';
  if (w.startsWith('herb')) return 'herb';
  return w;
}

export default function KnowledgeTab({ language }) {
  const t = (key) => getTranslation(key, language);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Patents Act 1970',
    content: '',
    citation: '',
    jurisdiction: 'india,international',
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchKnowledgeBase = () => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        setItems(data.records || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load knowledge base", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.content) {
      alert("Please fill in the Section Title and Document Content.");
      return;
    }

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadData.title,
          category: uploadData.category,
          content: uploadData.content,
          citation: uploadData.citation || uploadData.title,
          jurisdiction: uploadData.jurisdiction.split(',').map((j) => j.trim()),
        }),
      });

      if (res.ok) {
        setUploadSuccess(true);
        fetchKnowledgeBase();
        setTimeout(() => {
          setUploadSuccess(false);
          setIsUploadOpen(false);
          setUploadData({
            title: '',
            category: 'Patents Act 1970',
            content: '',
            citation: '',
            jurisdiction: 'india,international',
          });
        }, 1500);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Failed to upload document section.");
    }
  };

  // Intelligent Multi-Term Fuzzy Matching
  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;

    const rawTokens = searchTerm
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    const cleanTokens = rawTokens.filter((w) => !STOP_WORDS.has(w));
    const activeTokens = cleanTokens.length > 0 ? cleanTokens : rawTokens;

    if (activeTokens.length === 0) return true;

    const docText = `${item.question} ${item.answer} ${item.category} ${item.citation}`.toLowerCase();

    // Check if at least one meaningful search term matches
    return activeTokens.some((tok) => {
      const normalized = normalizeTerm(tok);
      return docText.includes(tok) || docText.includes(normalized);
    });
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Upload Action */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-cinzel">
              <BookOpen className="w-4 h-4 text-ayurveda-primary" />
              {t('kbTitle')}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Indexed Statutory Sections, Case Precedents & ChromaDB Records ({items.length} Sections Active)
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-ayurveda-primary to-ayurveda-medium hover:from-ayurveda-medium hover:to-ayurveda-dark text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add / Upload New Section
          </button>
        </div>

        {/* Search Box with Clear Button */}
        <div className="relative mt-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patents, Section 3(p), AYUSH, TKDL, synergism, NBA Form III..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-1 focus:ring-ayurveda-primary/20 transition outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KB List */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Loading knowledge base records from ChromaDB...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs space-y-2">
            <p>No matching statutory questions found for "{searchTerm}".</p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-ayurveda-primary underline text-xs font-semibold"
            >
              View all statutory sections
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="border border-slate-200/80 rounded-xl overflow-hidden transition hover:border-ayurveda-light/60"
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full p-3 text-left flex items-start justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-ayurveda-primary px-1.5 py-0.2 bg-ayurveda-pale/60 rounded">
                        {item.category}
                      </span>
                      <h3 className="font-semibold text-xs text-slate-800 leading-snug truncate">
                        {item.question}
                      </h3>
                    </div>
                    <div className="text-slate-400 p-0.5 flex-shrink-0">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-white border-t border-slate-100 text-xs text-slate-700 space-y-2 animate-fadeIn">
                      <p className="leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center gap-1 font-mono-code text-[10px] text-slate-600">
                          <Scale className="w-3 h-3 text-ayurveda-primary" />
                          <strong>Citation:</strong> {item.citation}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Globe className="w-3 h-3" />
                          {Array.isArray(item.jurisdiction) ? item.jurisdiction.join(', ') : item.jurisdiction}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Section Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 font-cinzel text-xs">
                <Upload className="w-3.5 h-3.5 text-ayurveda-primary" />
                Upload New Statutory Section to ChromaDB
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-3 text-xs">
              {uploadSuccess ? (
                <div className="py-6 text-center space-y-1.5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
                  <p className="font-bold text-xs text-emerald-800">
                    Section Indexed Successfully into ChromaDB!
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Section Title / Question:</label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      placeholder="e.g. Section 3(p) Exceptions for Synthetic Isolation"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-ayurveda-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category:</label>
                    <input
                      type="text"
                      value={uploadData.category}
                      onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                      placeholder="e.g. Patents Act 1970, NBA Rules..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-ayurveda-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Content / Provision Text:</label>
                    <textarea
                      value={uploadData.content}
                      onChange={(e) => setUploadData({ ...uploadData, content: e.target.value })}
                      placeholder="Enter the statutory wording or patent guidelines..."
                      rows={4}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-ayurveda-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Statutory Citation:</label>
                    <input
                      type="text"
                      value={uploadData.citation}
                      onChange={(e) => setUploadData({ ...uploadData, citation: e.target.value })}
                      placeholder="e.g. IPO Guidelines 2012, Rule 18"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-ayurveda-primary text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-ayurveda-primary text-white rounded-lg font-bold text-xs shadow-xs"
                    >
                      Index Document
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
