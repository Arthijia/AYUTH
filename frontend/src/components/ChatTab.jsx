import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, ChevronDown, ChevronUp, Scale, Sparkles } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

function renderInline(text) {
  if (!text) return text;
  // Match bold **text** or __text__
  const parts = [];
  let lastIndex = 0;
  const regex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold text-slate-900">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

function FormattedContent({ content }) {
  if (!content) return null;

  const rawLines = content.split('\n');
  const blocks = [];
  let currentTable = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      currentTable.push(trimmed);
    } else {
      if (currentTable.length > 0) {
        blocks.push({ type: 'table', rows: [...currentTable] });
        currentTable = [];
      }
      if (trimmed) {
        blocks.push({ type: 'line', text: line, trimmed });
      }
    }
  }

  if (currentTable.length > 0) {
    blocks.push({ type: 'table', rows: [...currentTable] });
  }

  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-800">
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          const rows = block.rows;
          const headerRow = rows[0]
            ? rows[0].split('|').slice(1, -1).map(c => c.trim())
            : [];
          const dataRows = rows.slice(1).filter(r => !r.match(/^\|\s*[-:]+\s*\|/));

          return (
            <div key={bIdx} className="overflow-x-auto my-2 rounded-lg border border-slate-200/80 shadow-xs">
              <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                {headerRow.length > 0 && (
                  <thead className="bg-slate-100/80 text-slate-900 font-semibold">
                    <tr>
                      {headerRow.map((h, hIdx) => (
                        <th key={hIdx} className="px-2.5 py-1.5 text-left font-semibold">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dataRows.map((dRow, rIdx) => {
                    const cells = dRow.split('|').slice(1, -1).map(c => c.trim());
                    return (
                      <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="px-2.5 py-1.5 text-slate-700">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        const { text, trimmed } = block;

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={bIdx} className="text-xs font-bold text-ayurveda-dark pt-1.5 pb-0.5 font-cinzel">
              {renderInline(trimmed.replace('### ', ''))}
            </h3>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={bIdx} className="text-xs font-bold text-slate-900 pt-2 pb-0.5 border-b border-slate-100 pb-1">
              {renderInline(trimmed.replace('## ', ''))}
            </h2>
          );
        }

        if (trimmed === '---') {
          return <hr key={bIdx} className="border-t border-slate-200/70 my-2" />;
        }

        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={bIdx} className="pl-2.5 py-1 border-l-2 border-ayurveda-primary bg-ayurveda-pale/30 rounded-r-md italic text-[11px] text-slate-700 my-1.5">
              {renderInline(trimmed.replace(/^>\s*/, ''))}
            </blockquote>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
          return (
            <div key={bIdx} className="flex items-start gap-1.5 text-xs text-slate-700 ml-1">
              <span className="text-ayurveda-primary font-bold text-xs flex-shrink-0">•</span>
              <span>{renderInline(trimmed.replace(/^[*•-]\s*/, ''))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={bIdx} className="flex items-start gap-1.5 text-xs text-slate-700 ml-1">
              <span className="text-ayurveda-primary font-semibold text-xs flex-shrink-0">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={bIdx} className="text-xs leading-relaxed">
            {renderInline(text)}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatTab({ messages, onSendMessage, isLoading, language }) {
  const [input, setInput] = useState('');
  const [expandedDocIndex, setExpandedDocIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const t = (key) => getTranslation(key, language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden min-h-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-ayurveda-primary/10 flex items-center justify-center text-ayurveda-primary">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-none">
              AYUTH AI Assistant
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                ChromaDB RAG
              </span>
            </h2>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono-code">{messages.length} messages</span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/20 min-h-0">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-2.5 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] shadow-xs ${
                  isUser
                    ? 'bg-ayurveda-primary text-white'
                    : 'bg-white border border-slate-200 text-ayurveda-primary'
                }`}
              >
                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>

              {/* Bubble */}
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-xs shadow-xs space-y-2.5 ${
                  isUser
                    ? 'bg-ayurveda-primary text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                ) : (
                  <FormattedContent content={msg.content} />
                )}

                {/* Sources & Citations Accordion */}
                {!isUser && msg.proof_documents && msg.proof_documents.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setExpandedDocIndex(expandedDocIndex === index ? null : index)}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-ayurveda-primary hover:text-ayurveda-dark transition cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{msg.proof_documents.length} Retrieved Source{msg.proof_documents.length > 1 ? 's' : ''}</span>
                      {expandedDocIndex === index ? (
                        <ChevronUp className="w-2.5 h-2.5" />
                      ) : (
                        <ChevronDown className="w-2.5 h-2.5" />
                      )}
                    </button>

                    {expandedDocIndex === index && (
                      <div className="space-y-1.5 pt-1 animate-fadeIn">
                        {msg.proof_documents.map((doc, docIdx) => (
                          <div
                            key={docIdx}
                            className="bg-slate-50 p-2 rounded-lg border border-slate-200/70 text-[10px] text-slate-700 space-y-1"
                          >
                            <div className="font-semibold text-slate-900 flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full bg-ayurveda-primary/10 text-ayurveda-primary flex items-center justify-center text-[8px] font-bold">
                                {docIdx + 1}
                              </span>
                              <span>{doc.question || doc.title}</span>
                            </div>
                            <p className="italic text-slate-600 leading-relaxed bg-white p-1.5 rounded border border-slate-100">
                              "{doc.answer || doc.content}"
                            </p>
                            {doc.citation && (
                              <div className="text-[9px] font-mono-code text-ayurveda-dark flex items-center gap-1">
                                <Scale className="w-2.5 h-2.5 text-ayurveda-primary" />
                                <span>{doc.citation}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-time Loading State */}
        {isLoading && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto items-center animate-fadeIn">
            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-ayurveda-primary shadow-xs">
              <Bot className="w-3 h-3 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2 text-xs text-slate-600">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ayurveda-primary animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-ayurveda-medium animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-ayurveda-light animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-[11px] font-medium text-slate-600">
                AYUTH is searching the knowledge base...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-white border-t border-slate-100 flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1.5 border border-slate-200 focus-within:border-ayurveda-primary focus-within:ring-1 focus-within:ring-ayurveda-primary/20 transition">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AYUTH about patent eligibility, Section 3(p), TKDL, NBA Form III..."
            className="flex-1 bg-transparent border-0 text-xs text-slate-800 placeholder-slate-400 focus:outline-none px-2 py-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 bg-gradient-to-r from-ayurveda-primary to-ayurveda-medium hover:from-ayurveda-medium hover:to-ayurveda-dark text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs flex-shrink-0 cursor-pointer"
            title={t('sendBtn')}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
