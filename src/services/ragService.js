import { config } from '../config.js';
import { searchVectorStore } from './vectorStoreService.js';
import { generateGroundedRagResponse } from './aiService.js';

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
    const hasOnlyNoVowelWords = words.length > 0 && words.every(w => {
      const wClean = w.replace(/[^a-z]/g, '');
      return wClean.length >= 4 && !/[aeiouy]/i.test(wClean);
    });

    if (isKeyboardRow || isRepeatedChar || hasOnlyNoVowelWords) {
      return 'GIBBERISH';
    }
  }

  // 2. Greetings
  const greetings = [
    'hi', 'hello', 'helo', 'hey', 'namaste', 'namaskaram', 'vanakkam', 'வணக்கம்', 'नमस्ते',
    '안녕하세요', '안녕', 'bonjour', 'salut', 'hallo', 'hola', 'ciao', 'ni hao', '你好',
    'good morning', 'good afternoon', 'good evening'
  ];
  if (greetings.includes(clean) || greetings.some(g => clean === g || clean.startsWith(g + ' ') || clean.startsWith(g + '!'))) {
    return 'GREETING';
  }

  // 3. Casual / Conversational queries
  const casual = [
    'who are you', 'what are you', 'what can you do', 'how are you', 'help', 'help me',
    'thanks', 'thank you', 'ok', 'okay', 'bye', 'goodbye', 'நன்றி', 'धन्यवाद', '감사합니다'
  ];
  if (casual.includes(clean) || casual.some(c => clean === c || clean.startsWith(c + '?') || clean.startsWith(c + '.'))) {
    return 'CASUAL';
  }

  // 4. Substantive IP / Patent / Invention inquiry
  return 'INVENTION_OR_LEGAL';
}

/**
 * Execute full RAG pipeline: Query Intent Classification -> Vector Search (if substantive) -> Groq Generation
 * @param {Object} params - { question, jurisdiction, inventionProfile, apiKey, limit, language }
 */
export async function executeRagPipeline({
  question,
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
  let retrievedDocs = [];
  let ragUsed = false;

  // Only retrieve statutory documents if the user query is substantive
  if (intent === 'INVENTION_OR_LEGAL') {
    retrievedDocs = await searchVectorStore(queryText, {
      limit,
      jurisdiction,
      apiKey,
    });
    ragUsed = retrievedDocs.length > 0;
  }

  // LLM Generation via Groq with intent-guided context
  const aiResult = await generateGroundedRagResponse({
    question: queryText,
    intent,
    retrievedDocs,
    inventionProfile,
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
      retrievedCount: retrievedDocs.length,
      durationMs,
      chatProvider: 'groq',
      model: aiResult.modelUsed || config.groqModel,
    },
  };
}
