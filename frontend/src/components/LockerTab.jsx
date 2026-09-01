import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, ShieldCheck, Copy, Check, Download, FileCheck, Clock, 
  Upload, FileText, Image as ImageIcon, Video as VideoIcon, 
  Trash2, Play, Eye, X, AlertCircle, Sparkles, FolderArchive
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

export default function LockerTab({ language }) {
  const t = (key) => getTranslation(key, language);

  const [inventionTitle, setInventionTitle] = useState('');
  const [inventionText, setInventionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedInventions, setSavedInventions] = useState([]);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch past locker records
  const fetchInventions = () => {
    fetch('/api/locker/records')
      .then((res) => res.json())
      .then((data) => setSavedInventions(data.records || []))
      .catch((err) => {
        // Fallback to legacy endpoint if needed
        fetch('/api/inventions')
          .then((r) => r.json())
          .then((d) => setSavedInventions(d.records || []))
          .catch((e) => console.warn("Locker records fetch error", e));
      });
  };

  useEffect(() => {
    fetchInventions();
  }, []);

  // Detect file category from extension
  const detectCategory = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'xlsx'].includes(ext)) return 'document';
    return 'document';
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle file selection and extract client-side metadata without altering files
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    selectedFiles.forEach((file) => {
      const category = detectCategory(file.name);
      const fileId = `${file.name}-${file.size}-${Date.now()}`;
      const previewUrl = URL.createObjectURL(file);

      const newFileItem = {
        id: fileId,
        rawFile: file,
        name: file.name,
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        type: category,
        previewUrl: previewUrl,
        status: 'ready', // 'ready', 'uploading', 'done'
        metadata: {
          format: file.name.split('.').pop().toUpperCase(),
          lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null
        }
      };

      // If video, dynamically extract duration and resolution
      if (category === 'video') {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.src = previewUrl;
        videoElement.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoElement.src);
          setAttachedFiles((prev) =>
            prev.map((item) =>
              item.id === fileId
                ? {
                    ...item,
                    metadata: {
                      ...item.metadata,
                      duration: formatDuration(videoElement.duration),
                      durationSeconds: videoElement.duration,
                      resolution: `${videoElement.videoWidth}x${videoElement.videoHeight}`,
                    },
                  }
                : item
            )
          );
        };
      }

      setAttachedFiles((prev) => [...prev, newFileItem]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      const removed = prev.find((f) => f.id === fileId);
      if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return filtered;
    });
  };

  // Perform streaming upload, compute master cryptographic proof, and seal locker record
  const generateAndSaveMasterProof = async () => {
    if (!inventionText.trim() && attachedFiles.length === 0) {
      alert("Please enter your invention description or attach supporting documents/video proofs.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      let uploadedServerFiles = [];

      // Step 1: Upload attached evidence files in their original binary format
      if (attachedFiles.length > 0) {
        const formData = new FormData();
        const clientMeta = {};

        attachedFiles.forEach((item) => {
          formData.append('files', item.rawFile);
          clientMeta[item.name] = item.metadata || {};
        });
        formData.append('metadata_json', JSON.stringify(clientMeta));

        setUploadProgress(40);

        const uploadRes = await fetch('/api/locker/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error(`Evidence file upload failed with status ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        uploadedServerFiles = uploadData.uploaded_files || [];
      }

      setUploadProgress(75);

      // Step 2: Finalize Locker Record with Master SHA-256 calculation
      const createRes = await fetch('/api/locker/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: inventionTitle.trim() || 'Ayurvedic Invention Evidence Record',
          description: inventionText.trim(),
          files: uploadedServerFiles,
        }),
      });

      if (!createRes.ok) {
        throw new Error(`Master proof generation failed with status ${createRes.status}`);
      }

      const createData = await createRes.json();
      const rec = createData.record;

      setUploadProgress(100);
      setReceipt({
        record_id: rec.record_id,
        master_sha256: rec.master_sha256,
        timestamp: rec.timestamp_utc,
        title: rec.title,
        total_files: rec.total_files,
        documents_count: rec.documents_count,
        images_count: rec.images_count,
        videos_count: rec.videos_count,
        total_size: rec.total_size_formatted,
        files: rec.files || [],
        receipt_text: rec.receipt_text,
      });

      // Refresh records history
      fetchInventions();
    } catch (err) {
      console.error("Locker proof generation error:", err);
      alert(`Cryptographic sealing error: ${err.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const copyMasterHash = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.master_sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    if (!receipt) return;
    const content = receipt.receipt_text || `===========================================================
AYUTH INVENTION LOCKER - VERIFIED PROOF OF CONCEPTION RECEIPT
===========================================================
Record ID       : ${receipt.record_id}
Invention Title : ${receipt.title}
Timestamp (UTC) : ${receipt.timestamp}
Master SHA-256  : ${receipt.master_sha256}
Total Evidence  : ${receipt.total_files} files (${receipt.total_size})
===========================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AYUTH_Proof_${receipt.record_id || Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-cinzel">
              <Lock className="w-5 h-5 text-ayurveda-primary" />
              {t('lockerTitle')}
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-ayurveda-light/20 text-ayurveda-primary border border-ayurveda-light/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Bit-Exact Security
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('lockerDescription')}
          </p>
        </div>

        <div className="space-y-5">
          {/* Invention Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Invention Disclosure Title:
            </label>
            <input
              type="text"
              value={inventionTitle}
              onChange={(e) => setInventionTitle(e.target.value)}
              placeholder="e.g. Synergistic Curcumin Nano-Emulsion & Extraction Method"
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none"
            />
          </div>

          {/* Technical Description Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {t('inventionTextLabel')}
            </label>
            <textarea
              value={inventionText}
              onChange={(e) => setInventionText(e.target.value)}
              placeholder={t('inventionTextPlaceholder')}
              rows={5}
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-ayurveda-primary focus:ring-2 focus:ring-ayurveda-primary/20 transition outline-none font-mono-code"
            />
          </div>

          {/* ========================================================= */}
          {/* UPLOAD SUPPORTING DOCUMENTS & VIDEO PROOFS SECTION */}
          {/* ========================================================= */}
          <div className="p-4 sm:p-5 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-ayurveda-primary" />
                  {t('uploadEvidenceHeading')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('uploadEvidenceDesc')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/60 font-semibold">PDF, DOCX, XLSX</span>
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200/60 font-semibold">PNG, JPG</span>
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200/60 font-semibold flex items-center gap-1">
                  <VideoIcon className="w-2.5 h-2.5" /> MP4, MOV, WEBM
                </span>
              </div>
            </div>

            {/* Drag & Drop Trigger Area */}
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="border-2 border-dashed border-slate-300 hover:border-ayurveda-primary/80 bg-white/80 hover:bg-ayurveda-light/5 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xlsx,.png,.jpg,.jpeg,.mp4,.mov,.webm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-ayurveda-light/20 flex items-center justify-center text-ayurveda-primary">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  {t('dragDropNotice')}
                </span>
                <span className="text-[11px] text-slate-400">
                  Multiple documents, experimental images & prototype demo videos supported
                </span>
              </div>
            </div>

            {/* Video Security Banner */}
            <div className="flex items-start gap-2 p-2.5 bg-emerald-50/80 border border-emerald-200/70 rounded-lg text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{t('videoOriginalNotice')}</span>
            </div>

            {/* Attached Evidence Files List */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Selected Evidence Proofs ({attachedFiles.length}):</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles([])}
                    className="text-red-500 hover:text-red-700 text-[11px] font-normal transition cursor-pointer"
                  >
                    Clear all files
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 mr-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          file.type === 'video' 
                            ? 'bg-purple-100 text-purple-700' 
                            : file.type === 'image' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {file.type === 'video' ? (
                            <VideoIcon className="w-4 h-4" />
                          ) : file.type === 'image' ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-800 truncate block">
                            {file.name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{file.sizeFormatted}</span>
                            {file.type === 'video' && file.metadata?.duration && (
                              <span className="text-purple-700 font-medium">⏱️ {file.metadata.duration}</span>
                            )}
                            {file.type === 'video' && file.metadata?.resolution && (
                              <span className="text-slate-400">({file.metadata.resolution})</span>
                            )}
                            <span className="text-emerald-600 font-semibold">✓ {t('statusReady')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {file.type === 'video' && (
                          <button
                            type="button"
                            onClick={() => setActiveVideoModal(file)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                            title={t('previewVideoBtn')}
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {file.type === 'image' && (
                          <button
                            type="button"
                            onClick={() => window.open(file.previewUrl, '_blank')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Preview Image"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title={t('removeFileBtn')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload & Lock Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 animate-fadeIn">
              <div className="flex justify-between text-xs font-semibold text-ayurveda-primary">
                <span>{t('statusUploading')}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ayurveda-primary to-emerald-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Master Proof Generate Button */}
          <button
            onClick={generateAndSaveMasterProof}
            disabled={isUploading}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-ayurveda-primary via-ayurveda-medium to-ayurveda-dark hover:opacity-95 text-white rounded-xl font-semibold text-sm shadow-md shadow-ayurveda-primary/20 transition cursor-pointer ${
              isUploading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {isUploading ? t('statusUploading') : t('lockAndGenerateMasterHashBtn')}
          </button>
        </div>
      </div>

      {/* Video Preview Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden max-w-2xl w-full text-white shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold truncate max-w-sm">{activeVideoModal.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-black flex items-center justify-center">
              <video
                src={activeVideoModal.previewUrl}
                controls
                autoPlay
                className="max-h-[60vh] w-full rounded-lg"
              />
            </div>
            <div className="p-3.5 bg-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Size: {activeVideoModal.sizeFormatted}</span>
              {activeVideoModal.metadata?.duration && <span>Duration: {activeVideoModal.metadata.duration}</span>}
              {activeVideoModal.metadata?.resolution && <span>Resolution: {activeVideoModal.metadata.resolution}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Master Proof Receipt Card */}
      {receipt && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-ayurveda-dark text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/80 mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ayurveda-light/20 flex items-center justify-center border border-ayurveda-light/30 flex-shrink-0">
                <FileCheck className="w-5 h-5 text-ayurveda-pale" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ayurveda-cream">{receipt.title}</h3>
                <p className="text-[11px] text-slate-400">
                  {receipt.record_id} • Verified Proof of Conception & Supporting Evidence
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Master SHA-256
            </span>
          </div>

          {/* Receipt Breakdown Details */}
          <div className="space-y-4 text-xs font-mono-code bg-black/50 p-4 rounded-xl border border-slate-700/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-slate-400 block mb-1">{t('recordIdLabel')}</span>
                <span className="text-ayurveda-cream font-bold text-xs">{receipt.record_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">{t('receiptTimestamp')}</span>
                <span className="text-slate-200">{receipt.timestamp}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">{t('masterHashLabel')}</span>
              <span className="text-emerald-400 break-all select-all font-bold text-xs bg-emerald-950/40 p-2 rounded block border border-emerald-800/40">
                {receipt.master_sha256}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                <span className="text-slate-400 block">Total Files:</span>
                <span className="font-bold text-slate-200">{receipt.total_files || 0}</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                <span className="text-slate-400 block">Documents:</span>
                <span className="font-bold text-blue-300">{receipt.documents_count || 0}</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                <span className="text-slate-400 block">Images:</span>
                <span className="font-bold text-amber-300">{receipt.images_count || 0}</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
                <span className="text-slate-400 block">Video Proofs:</span>
                <span className="font-bold text-purple-300">{receipt.videos_count || 0}</span>
              </div>
            </div>

            {/* Itemized Evidence Files List */}
            {receipt.files && receipt.files.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-slate-400 block font-sans text-xs font-bold">Locked Evidence Files:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {receipt.files.map((file, idx) => (
                    <div key={idx} className="p-2 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="truncate mr-2">
                        <span className="text-slate-300 font-semibold">{file.name}</span>
                        <span className="text-[10px] text-slate-500 block">
                          Type: {file.type} • {file.size_formatted}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-mono-code text-[10px] flex-shrink-0">
                        {file.sha256 ? file.sha256.substring(0, 16) + '...' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={copyMasterHash}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Master Hash"}
            </button>

            <button
              onClick={downloadReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-ayurveda-primary hover:bg-ayurveda-medium text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Verified Receipt (.txt)
            </button>
          </div>
        </div>
      )}

      {/* Timestamped Inventions History */}
      {savedInventions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-ayurveda-primary" />
              Timestamped Invention Proof Records ({savedInventions.length})
            </h3>
            <span className="text-[11px] text-slate-500">Immutable Audit Trail</span>
          </div>

          <div className="space-y-2.5">
            {savedInventions.map((inv, idx) => {
              const rId = inv.record_id || inv.id || `AYUTH-LOCK-${idx + 1}`;
              const masterHash = inv.master_sha256 || inv.sha256Hash || '';
              const docCount = inv.documents_count ?? (inv.files ? inv.files.filter(f => f.type === 'document').length : 0);
              const imgCount = inv.images_count ?? (inv.files ? inv.files.filter(f => f.type === 'image').length : 0);
              const vidCount = inv.videos_count ?? (inv.files ? inv.files.filter(f => f.type === 'video').length : 0);
              const totalF = inv.total_files ?? (inv.files_count || (inv.files ? inv.files.length : 0));

              return (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 hover:border-slate-300 transition"
                >
                  <div className="space-y-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        {inv.title || "Ayurvedic Invention Record"}
                      </span>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">
                        {rId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                      <span>Files: <strong>{totalF}</strong></span>
                      {docCount > 0 && <span className="text-blue-600">📄 {docCount} Docs</span>}
                      {imgCount > 0 && <span className="text-amber-600">🖼️ {imgCount} Imgs</span>}
                      {vidCount > 0 && <span className="text-purple-600">🎥 {vidCount} Videos</span>}
                    </div>

                    <span className="font-mono-code text-[11px] text-emerald-700 truncate block">
                      Master SHA-256: {masterHash ? masterHash.substring(0, 28) + "..." : "Verified"}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {inv.timestamp_utc}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const content = inv.receipt_text || `===========================================================
AYUTH INVENTION LOCKER - VERIFIED PROOF OF CONCEPTION RECEIPT
===========================================================
Record ID       : ${rId}
Invention Title : ${inv.title}
Timestamp (UTC) : ${inv.timestamp_utc}
Master SHA-256  : ${masterHash}
===========================================================`;
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `AYUTH_Proof_${rId}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1 text-[11px] text-ayurveda-primary hover:text-ayurveda-dark font-semibold transition cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Proof Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
