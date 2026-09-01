import { config } from '../config.js';
import { searchVectorStore } from './vectorStoreService.js';
import { generateGroundedRagResponse } from './aiService.js';

/**
 * Botanical, Statutory, and Case Law Conceptual Expansion Dictionary
 * Expands user queries to scientific names, historical cases, and relevant patent statutes
 */
const BOTANICAL_AND_LEGAL_EXPANSIONS = {
  turmeric: ["Curcuma longa", "curcumin", "wound healing patent revocation", "US Patent 5401504", "TKDL prior art", "Section 3(p)"],
  haldi: ["Curcuma longa", "turmeric", "wound healing patent revocation", "TKDL prior art", "Section 3(p)"],
  மஞ்சள்: ["Curcuma longa", "turmeric", "wound healing", "TKDL prior art", "Section 3(p)"],
  ஹல்தி: ["Curcuma longa", "turmeric", "TKDL prior art"],
  neem: ["Azadirachta indica", "EPO antifungal patent revocation", "pesticide traditional knowledge", "Section 3(p)"],
  வேம்பு: ["Azadirachta indica", "neem", "antifungal patent revocation", "Section 3(p)"],
  வேப்பிலை: ["Azadirachta indica", "neem", "antifungal patent revocation", "Section 3(p)"],
  ashwagandha: ["Withania somnifera", "withanolides", "Section 3(d) therapeutic efficacy", "Section 3(p)"],
  அஸ்வகந்தா: ["Withania somnifera", "ashwagandha", "Section 3(d)", "Section 3(p)"],
  ginger: ["Zingiber officinale", "gingerol", "Section 3(e) synergism"],
  இஞ்சி: ["Zingiber officinale", "ginger", "Section 3(e)"],
  triphala: ["Emblica officinalis", "Terminalia chebula", "Terminalia bellirica", "Section 3(e) admixture synergism"],
  திரிபலா: ["Triphala", "Emblica officinalis", "Section 3(e) synergism"],
  tulsi: ["Ocimum sanctum", "holy basil", "eugenol", "Section 3(p)"],
  துளசி: ["Ocimum sanctum", "tulsi", "Section 3(p)"],
  america: ["USPTO", "US patent", "35 U.S.C. 101", "patent revocation", "turmeric wound healing case"],
  us: ["USPTO", "United States patent", "prior art challenge"],
  nba: ["National Biodiversity Authority", "Biological Diversity Act 2002", "Form III approval", "Section 6"],
  tkdl: ["Traditional Knowledge Digital Library", "CSIR", "AYUSH", "prior art invalidation"],
  synergy: ["Section 3(e)", "synergistic bio-enhancement", "admixture objection"],
  synergism: ["Section 3(e)", "synergistic combination", "non-additive effect"],
  novelty: ["Section 2(1)(j)", "anticipation", "prior art", "new chemical entity"],
};

/**
 * Expand user query conceptually with botanical names, synonyms, and landmark cases
 */
export function expandQueryForRag(queryText, history = []) {
  const clean = String(queryText || '').toLowerCase();
  const tokens = clean.split(/\s+/).map((t) => t.replace(/[^a-z0-9\u0B80-\u0BFF\u0900-\u097F\uAC00-\uD7AF]/gi, '')).filter(Boolean);

  const expandedTerms = new Set([queryText]);

  // Contextual expansion from history if current query is short/ambiguous (e.g. "Is there a patent for America?")
  if (tokens.length <= 6 && Array.isArray(history) && history.length > 0) {
    const lastUserMsg = history.filter((h) => h.role === 'user').slice(-1)[0]?.content || '';
    const lastTokens = lastUserMsg.toLowerCase().split(/\s+/);
    for (const t of lastTokens) {
      if (BOTANICAL_AND_LEGAL_EXPANSIONS[t]) {
        for (const exp of BOTANICAL_AND_LEGAL_EXPANSIONS[t]) {
          expandedTerms.add(exp);
        }
      }
    }
  }

  for (const token of tokens) {
    if (BOTANICAL_AND_LEGAL_EXPANSIONS[token]) {
      for (const exp of BOTANICAL_AND_LEGAL_EXPANSIONS[token]) {
        expandedTerms.add(exp);
      }
    }
  }

  return Array.from(expandedTerms).join(' ');
}

/**
 * Detect requested answer style (Brief, Normal, Detailed)
 */
export function detectAnswerStyle(text) {
  const clean = String(text || '').toLowerCase();
  if (/\b(brief|short|quick|simple|summary|concise|in simple words|சுருக்கமாக|संक्षेप|간단히)\b/i.test(clean)) {
    return 'BRIEF';
  }
  if (/\b(detailed|deep|in-depth|complete|full analysis|comprehensive|deep analysis|விரிவாக|विस्तार|자세히)\b/i.test(clean)) {
    return 'DETAILED';
  }
  return 'NORMAL';
}

/**
 * Detect query intent to avoid unnecessary RAG dumping for gibberish or casual greetings
 */
export function detectQueryIntent(text) {
  const clean = String(text || '').trim().toLowerCase();
  if (!clean) return 'GIBBERISH';

  // 1. Gibberish / keyboard mash detection
  const isLatin = /^[a-z0-9\s.,!?'"-]+$/i.test(clean);
  if (isLatin) {
    const rawNoSpace = clean.replace(/[^a-z]/g, '');
    const isKeyboardRow = /^(?:[asdfghjkl]+|[qwertyuiop]+|[zxcvbnm]+)$/i.test(rawNoSpace);
    const isRepeatedChar = /^(.)\1{3,}$/.test(rawNoSpace);
    const words = clean.split(/\s+/).filter(Boolean);
    const isConsonantMash = words.some((w) => {
      const wClean = w.replace(/[^a-z]/g, '');
      if (wClean.length >= 4) {
        const vowelCount = (wClean.match(/[aeiouy]/g) || []).length;
        return vowelCount === 0 || vowelCount / wClean.length < 0.18;
      }
      return false;
    });

    if (isKeyboardRow || isRepeatedChar || isConsonantMash) {
      return 'GIBBERISH';
    }
  }

  // 2. Greetings
  const greetings = [
    'hi', 'hello', 'helo', 'hey', 'namaste', 'namaskaram', 'vanakkam', 'வணக்கம்', 'नमस्ते',
    '안녕하세요', '안녕', 'bonjour', 'salut', 'hallo', 'hola', 'ciao', 'ni hao', '你好',
    'good morning', 'good afternoon', 'good evening',
  ];
  if (greetings.includes(clean) || greetings.some((g) => clean === g || clean.startsWith(g + ' ') || clean.startsWith(g + '!'))) {
    return 'GREETING';
  }

  // 3. Casual / Conversational queries
  const casual = [
    'who are you', 'what are you', 'what can you do', 'how are you', 'help', 'help me',
    'thanks', 'thank you', 'ok', 'okay', 'bye', 'goodbye', 'நன்றி', 'धन्यवाद', '감사합니다',
  ];
  if (casual.includes(clean) || casual.some((c) => clean === c || clean.startsWith(c + '?') || clean.startsWith(c + '.'))) {
    return 'CASUAL';
  }

  // 4. Substantive IP / Patent / Invention inquiry
  return 'INVENTION_OR_LEGAL';
}

/**
 * Execute full RAG pipeline with Query Expansion, Intent Detection, and Adaptive Synthesis
 * @param {Object} params - { question, history, jurisdiction, inventionProfile, apiKey, limit, language }
 */
export async function executeRagPipeline({
  question,
  history = [],
  jurisdiction = 'india',
  inventionProfile = {},
  apiKey = null,
  limit = config.topK,
  language = 'en',
}) {
  const startTime = Date.now();

  const queryText = String(question || '').trim();
  if (!queryText) {
    throw new Error('Question parameter is required.');
  }

  const intent = detectQueryIntent(queryText);
  const answerStyle = detectAnswerStyle(queryText);
  let retrievedDocs = [];
  let ragUsed = false;

  // Only retrieve statutory documents if the user query is substantive
  if (intent === 'INVENTION_OR_LEGAL') {
    const expandedQuery = expandQueryForRag(queryText, history);
    console.log(`[RAG Expansion] Original: "${queryText}" -> Expanded: "${expandedQuery}"`);

    retrievedDocs = await searchVectorStore(expandedQuery, {
      limit,
      jurisdiction,
      apiKey,
    });
    ragUsed = retrievedDocs.length > 0;
  }

  // LLM Generation via Groq with intent-guided context and length control
  const aiResult = await generateGroundedRagResponse({
    question: queryText,
    intent,
    answerStyle,
    retrievedDocs,
    inventionProfile,
    history,
    language,
    customApiKey: apiKey,
  });

  const durationMs = Date.now() - startTime;

  return {
    answer: aiResult.answer,
    rag_used: ragUsed,
    sources: retrievedDocs,
    jurisdiction,
    intent,
    metrics: {
      intent,
      answerStyle,
      retrievedCount: retrievedDocs.length,
      durationMs,
      chatProvider: 'groq',
      model: aiResult.modelUsed || config.groqModel,
    },
  };
}
