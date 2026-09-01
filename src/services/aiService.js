import { Groq } from 'groq-sdk';
import { config } from '../config.js';

const LANGUAGE_NAMES = {
  en: 'English',
  zh: 'Chinese (中文)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  ja: 'Japanese (日本語)',
  ko: 'Korean (한국어)',
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
 * Get configured AI provider metadata
 */
export function getAiProviderInfo() {
  return {
    chatProvider: 'groq',
    chat: config.groqModel || 'openai/gpt-oss-120b',
    hasGroqApiKey: Boolean(config.groqApiKey),
  };
}

/**
 * Create a Groq SDK client instance
 */
export function createGroqClient(customApiKey = null) {
  const apiKey = customApiKey || config.groqApiKey;
  if (!apiKey) {
    throw new Error('No Groq API key configured. Please set GROQ_API_KEY in backend/.env or provide apiKey in the request.');
  }
  return new Groq({ apiKey });
}

/**
 * Execute Groq Chat Completion with strict error handling and Groq-only model fallbacks
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {Object} [options] - Options (temperature, maxTokens, model, customApiKey)
 * @returns {Promise<{content: string, model: string, usage: Object}>}
 */
export async function generateChatCompletion(messages, options = {}) {
  const {
    temperature = 0.2,
    maxTokens = 1800,
    model = config.groqModel || 'openai/gpt-oss-120b',
    customApiKey = null,
  } = options;

  const groq = createGroqClient(customApiKey);

  // Models to attempt within Groq ONLY (No Gemini fallback)
  const modelsToTry = [
    model,
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError = null;

  for (const modelCandidate of modelsToTry) {
    try {
      console.log(`[Groq AI] Calling model: ${modelCandidate}...`);
      const completion = await groq.chat.completions.create({
        messages,
        model: modelCandidate,
        temperature,
        max_tokens: maxTokens,
      });

      const responseText = completion.choices?.[0]?.message?.content;
      if (responseText) {
        return {
          content: responseText,
          model: modelCandidate,
          usage: completion.usage || {},
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Groq AI Error] Model ${modelCandidate} failed: ${err.message}`);

      // If it is an invalid API key, do not retry other models
      if (err.status === 401 || err.message?.includes('Invalid API Key') || err.message?.includes('authentication')) {
        throw new Error('Invalid Groq API key provided. Please verify GROQ_API_KEY in backend/.env.');
      }
    }
  }

  // Handle categorized errors with informative messages
  if (lastError) {
    if (lastError.status === 429 || lastError.message?.includes('Rate limit')) {
      throw new Error('Groq API rate limit exceeded. Please wait a few seconds before retrying.');
    }
    if (lastError.status === 404 || lastError.message?.includes('model_not_found')) {
      throw new Error(`The requested Groq model is currently unavailable on Groq.`);
    }
    if (lastError.code === 'ECONNREFUSED' || lastError.code === 'ENOTFOUND') {
      throw new Error('Network error connecting to Groq API servers.');
    }
    throw new Error(`Groq chat completion failed: ${lastError.message}`);
  }

  throw new Error('Groq AI was unable to generate a response.');
}

/**
 * Synthesize grounded RAG answer using Groq as the exclusive LLM
 */
export async function generateGroundedRagResponse({
  question,
  retrievedDocs = [],
  inventionProfile = {},
  language = 'en',
  customApiKey = null,
}) {
  const targetLanguageName = LANGUAGE_NAMES[language] || LANGUAGE_NAMES.en || 'English';

  const contextText = retrievedDocs.length > 0
    ? retrievedDocs
        .map((doc, idx) => {
          return `[Source ${idx + 1}] Category: ${doc.category}\nQuestion: ${doc.question}\nAnswer: ${doc.answer}\nCitation: ${doc.citation}\nJurisdiction: ${Array.isArray(doc.jurisdiction) ? doc.jurisdiction.join(', ') : doc.jurisdiction}`;
        })
        .join('\n\n')
    : 'No direct matching documents found in knowledge base.';

  const profileSummary = inventionProfile && Object.keys(inventionProfile).length > 0
    ? JSON.stringify(inventionProfile, null, 2)
    : 'No specific invention profile submitted.';

  const systemPrompt = `You are AYUTH, an expert AI legal and regulatory assistant specializing in Ayurvedic intellectual property (IP), traditional knowledge protection (TKDL), patentability under the Indian Patents Act, 1970, and biodiversity compliance under the Biological Diversity Act, 2002.

STRICT INSTRUCTIONS:
1. Ground your answer strictly in the RETRIEVED CONTEXT and established Indian / International IP statutes provided below.
2. Address specific patent hurdles directly (e.g., Section 3(p) for traditional knowledge, Section 3(e) for admixtures/synergism, Section 3(d) for efficacy, Section 6 of Biological Diversity Act for National Biodiversity Authority / NBA approvals).
3. Do NOT provide medical diagnosis or treatment claims. Focus on IP, patent strategy, regulatory licensing (AYUSH GMP/Drugs and Cosmetics Act), trade secrets, GI, and trademarks.
4. If the retrieved context is insufficient to give a definitive answer, state clearly that guidance is limited by available source records and specify what additional evidence or experimental data is required.
5. Provide comprehensive guidance addressing BOTH Indian Law (IPO, Patents Act 1970 Sections 3(p)/3(e)/3(d), National Biodiversity Authority / NBA, Drugs & Cosmetics Act, AYUSH-GMP) AND International frameworks (PCT International Applications, WIPO, CBD Nagoya Protocol, Madrid Protocol, USPTO/EPO standards).
6. Contextualize with the user's invention profile if relevant:
${profileSummary}
7. MANDATORY LANGUAGE REQUIREMENT: The user has selected the language: ${targetLanguageName} (${language}). You MUST write your ENTIRE explanation, headings, and answer in ${targetLanguageName} (using accurate grammar and authentic native script for that language). Keep statutory act names (e.g., Patents Act 1970, Section 3(p), Biological Diversity Act 2002, TKDL) clearly recognizable.
8. Always end your response with the disclaimer translated appropriately into ${targetLanguageName} (e.g. "This is informational guidance, not a substitute for a registered patent attorney.").

=== RETRIEVED STATUTORY CONTEXT ===
${contextText}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  const result = await generateChatCompletion(messages, {
    customApiKey,
    temperature: 0.2,
    maxTokens: 1800,
  });

  return {
    answer: result.content,
    modelUsed: result.model,
    chatProvider: 'groq',
  };
}
