import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { searchVectorStore } from './vectorStoreService.js';

const LANGUAGE_MAP = {
  en: 'English',
  zh: 'Chinese (中文)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  ja: 'Japanese (日本語)',
  hi: 'Hindi (हिन्दी)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  ml: 'Malayalam (മലയാളം)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  gu: 'Gujarati (ગુજરાતી)',
  sa: 'Sanskrit (संस्कृतम्)',
};

/**
 * Construct grounding prompt with retrieved context and strict legal guidelines
 */
export function buildRagPrompt({ question, jurisdiction, inventionProfile, retrievedDocs, language = 'en' }) {
  const targetLanguageName = LANGUAGE_MAP[language] || LANGUAGE_MAP.en;

  const contextText = retrievedDocs.length > 0
    ? retrievedDocs
        .map((doc, idx) => {
          return `[Source ${idx + 1}] Category: ${doc.category}\nQuestion: ${doc.question}\nAnswer: ${doc.answer}\nCitation: ${doc.citation}\nJurisdiction: ${doc.jurisdiction.join(', ')}`;
        })
        .join('\n\n')
    : 'No direct matching documents found in knowledge base.';

  const profileSummary = inventionProfile && Object.keys(inventionProfile).length > 0
    ? JSON.stringify(inventionProfile, null, 2)
    : 'No specific invention profile submitted.';

  return `You are AYUTH, an expert AI legal and regulatory assistant specializing in Ayurvedic intellectual property (IP), traditional knowledge protection (TKDL), patentability under the Indian Patents Act, 1970, and biodiversity compliance under the Biological Diversity Act, 2002.

STRICT INSTRUCTIONS:
1. Ground your answer strictly in the RETRIEVED CONTEXT and established Indian / International IP statutes provided below.
2. Address specific patent hurdles directly (e.g., Section 3(p) for traditional knowledge, Section 3(e) for admixtures/synergism, Section 3(d) for efficacy, Section 6 of Biological Diversity Act for National Biodiversity Authority / NBA approvals).
3. Do NOT provide medical diagnosis or treatment claims. Focus on IP, patent strategy, regulatory licensing (AYUSH GMP/Drugs and Cosmetics Act), trade secrets, GI, and trademarks.
4. If the retrieved context is insufficient to give a definitive answer, state clearly that guidance is limited by available source records and specify what additional evidence or experimental data is required.
5. Provide comprehensive guidance addressing BOTH Indian Law (IPO, Patents Act 1970 Sections 3(p)/3(e)/3(d), National Biodiversity Authority / NBA, Drugs & Cosmetics Act, AYUSH-GMP) AND International frameworks (PCT International Applications, WIPO, CBD Nagoya Protocol, Madrid Protocol, USPTO/EPO standards).
6. Contextualize with the user's invention profile if relevant:
${profileSummary}
7. LANGUAGE REQUIREMENT: The user has selected the language: ${targetLanguageName} (${language}). You MUST write your ENTIRE explanation and answer in ${targetLanguageName} (using accurate grammar and authentic native script for that language). Keep statutory act names (e.g., Patents Act 1970, Section 3(p), Biological Diversity Act 2002, TKDL) clearly recognizable.
8. Always end your response with the disclaimer translated appropriately into ${targetLanguageName} (e.g. "This is informational guidance, not a substitute for a registered patent attorney.").

RETRIEVED CONTEXT:
${contextText}

USER QUESTION:
${question}`;
}

/**
 * Execute full RAG pipeline: Query Vector Search -> Prompt Context Construction -> LLM Generation
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

  if (!question || !String(question).trim()) {
    throw new Error('Question parameter is required.');
  }

  const effectiveApiKey = apiKey || config.geminiApiKey;
  if (!effectiveApiKey) {
    throw new Error('No Gemini API key configured. Please provide apiKey in request body or set GEMINI_API_KEY in server environment.');
  }

  // Step 1: Semantic Vector Search against LanceDB
  const retrievedDocs = await searchVectorStore(question, {
    limit,
    jurisdiction,
    apiKey: effectiveApiKey,
  });

  // Step 2: Build Grounded System & User Prompt
  const prompt = buildRagPrompt({
    question,
    jurisdiction,
    inventionProfile,
    retrievedDocs,
  });

  // Step 3: LLM Generation via Gemini
  const ai = new GoogleGenerativeAI(effectiveApiKey);
  const model = ai.getGenerativeModel({ model: config.chatModel });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topK: 25,
      topP: 0.9,
      maxOutputTokens: 1500,
    },
  });

  const rawAnswer = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  const answer = rawAnswer || 'Unable to generate response from the knowledge base.';
  const durationMs = Date.now() - startTime;

  return {
    answer,
    sources: retrievedDocs,
    jurisdiction,
    metrics: {
      retrievedCount: retrievedDocs.length,
      durationMs,
      model: config.chatModel,
      embeddingModel: config.embeddingModel,
    },
  };
}
