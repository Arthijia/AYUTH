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
    chat: config.groqModel || 'openai/gpt-oss-20b',
    hasGroqApiKey: Boolean(config.groqApiKey),
  };
}

/**
 * Create a Groq SDK client instance
 */
export function createGroqClient(customApiKey = null) {
  const isCustomValid = customApiKey && typeof customApiKey === 'string' && customApiKey.trim().startsWith('gsk_');
  const apiKey = isCustomValid ? customApiKey.trim() : config.groqApiKey;
  if (!apiKey) {
    throw new Error('No Groq API key configured. Please set GROQ_API_KEY in backend/.env or provide apiKey in the request.');
  }
  return new Groq({ apiKey });
}

/**
 * Execute Groq Chat Completion with fast timeouts and instant model fallbacks
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {Object} [options] - Options (temperature, maxTokens, model, customApiKey, timeoutMs)
 * @returns {Promise<{content: string, model: string, usage: Object}>}
 */
export async function generateChatCompletion(messages, options = {}) {
  const {
    temperature = 0.2,
    maxTokens = 1200,
    model = config.groqModel || 'openai/gpt-oss-20b',
    customApiKey = null,
    timeoutMs = 6000,
  } = options;

  const groq = createGroqClient(customApiKey);

  // Fast, highly-available Groq models in order of latency and reliability
  const modelsToTry = [
    model,
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'groq/compound',
    'openai/gpt-oss-120b',
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError = null;

  for (const modelCandidate of modelsToTry) {
    try {
      console.log(`[Groq AI] Requesting inference from model: ${modelCandidate}...`);

      const completionPromise = groq.chat.completions.create({
        messages,
        model: modelCandidate,
        temperature,
        max_tokens: maxTokens,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${modelCandidate} response timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      const completion = await Promise.race([completionPromise, timeoutPromise]);

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
      console.warn(`[Groq AI Warning] Model ${modelCandidate} failed/timed out: ${err.message}`);

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
 * Synthesize grounded RAG answer using Groq as the exclusive LLM with intelligent intent and advisory principles
 */
export async function generateGroundedRagResponse({
  question,
  intent = 'INVENTION_OR_LEGAL',
  answerStyle = 'NORMAL',
  retrievedDocs = [],
  inventionProfile = {},
  history = [],
  language = 'en',
  customApiKey = null,
}) {
  const targetLanguageName = LANGUAGE_NAMES[language] || LANGUAGE_NAMES.en || 'English';

  let systemPrompt = '';

  if (intent === 'GIBBERISH') {
    systemPrompt = `You are AYUTH, an expert AI assistant specializing in Ayurvedic intellectual property (IP), traditional knowledge protection (TKDL), and patent law.
The user entered an unclear, random, or meaningless message (e.g. keyboard mash or typo): "${question}".
TASK:
- Respond politely in ${targetLanguageName} indicating that the input was not clear.
- Invite the user to ask a specific patent/IP question or describe their Ayurvedic invention/formulation.
- Keep the response brief, natural, and friendly (1-2 sentences).
- Do NOT generate pre-formatted patentability tables, generic reports, or statutory summaries for random gibberish.`;
  } else if (intent === 'GREETING') {
    systemPrompt = `You are AYUTH, an expert AI legal and regulatory assistant specializing in Ayurvedic intellectual property (IP), traditional knowledge protection (TKDL), patentability under the Indian Patents Act, 1970, and biodiversity compliance under the Biological Diversity Act, 2002.
The user greeted you: "${question}".
TASK:
- Respond warmly and naturally in ${targetLanguageName}, introducing yourself as AYUTH.
- Briefly state how you can help (evaluating Ayurvedic formulations, overcoming Section 3(p)/3(e)/3(d) objections, TKDL overlap analysis, and patent strategy).
- Ask how you can assist their research or invention today.
- Keep the response welcoming and concise (2-3 sentences). Do NOT output huge pre-made tables or boilerplate evaluation matrices for simple greetings.`;
  } else if (intent === 'CASUAL') {
    systemPrompt = `You are AYUTH, an expert AI assistant for Ayurvedic intellectual property and patent law.
The user sent a casual remark or conversational message: "${question}".
TASK:
- Respond conversationally, concisely, and helpfully in ${targetLanguageName}.
- If appropriate, invite them to share their patent or Ayurvedic formulation inquiries.`;
  } else {
    // Substantive Knowledge Query or Invention Disclosure
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

    let lengthInstruction = '';
    if (answerStyle === 'BRIEF') {
      lengthInstruction = 'The user requested a BRIEF / CONCISE explanation. Give a crisp answer in max 3 to 5 short paragraphs or bullet points. Avoid filler.';
    } else if (answerStyle === 'DETAILED') {
      lengthInstruction = 'The user requested a DETAILED / IN-DEPTH analysis. Provide a thorough, step-by-step breakdown covering legal provisions, mechanisms, evidence requirements, and strategic recommendations.';
    } else {
      lengthInstruction = 'Provide a clear, well-structured explanation: Direct answer first, followed by brief statutory context and actionable next steps.';
    }

    systemPrompt = `You are AYUTH, an intelligent AI legal and strategic patent advisor specializing in Ayurvedic Intellectual Property (IP), Traditional Knowledge Digital Library (TKDL), Indian Patent Law (Patents Act 1970, Sections 3(p), 3(e), 3(d)), and Biodiversity compliance (Biological Diversity Act 2002 / NBA).

CORE ADVISORY PRINCIPLES:
1. UNDERSTAND USER INTENT:
   - Users may ask vague, incomplete, grammatically imperfect, or non-technical questions. Infer what they are trying to understand rather than taking their literal words blindly.
   - If a question is ambiguous (e.g. "Is there a patent for America?" in the context of turmeric), answer the most likely interpretation first (e.g. the famous US turmeric wound-healing patent revocation case) and briefly mention other interpretations if needed.

2. PROACTIVE GUIDANCE:
   - Proactively connect strongly related historical cases and statutory concepts even if the user didn't know to ask about them (e.g., US Turmeric patent revocation, Neem European patent invalidation, TKDL prior art defense, Section 3(p) traditional knowledge bar, Section 3(e) synergistic admixture requirement).

3. EXPERT SYNTHESIS (NO DOCUMENT DUMPING):
   - Never copy raw document chunks or produce generic disconnected boilerplate tables.
   - Explain the meaning in a friendly, authoritative advisor tone.

4. RESPONSE STRUCTURE:
   1. Direct Answer First (Clear, simple verdict or answer).
   2. Brief Explanation & Legal/Scientific Basis (Explain the law/mechanism simply).
   3. Why It Matters & Strategic Implications (Practical advice, hurdles, TKDL risks).
   4. Clear Next Step / Recommendation (What the user should do next).

5. PERSONALIZATION:
   - If the user provided an invention profile or formulation details (${profileSummary}), connect the patent principles directly to their invention.

6. LENGTH CONTROL:
   - ${lengthInstruction}

7. LANGUAGE REQUIREMENT:
   - The user has selected the language: ${targetLanguageName} (${language}).
   - You MUST write your ENTIRE explanation, headings, and recommendations in ${targetLanguageName} (using natural grammar and native script). Keep statutory names (e.g. Section 3(p), Section 3(e), Patents Act 1970, TKDL, NBA) recognizable.
   - Always conclude with the informational disclaimer in ${targetLanguageName}: "*This is informational guidance, not a substitute for a registered patent attorney.*"

=== RETRIEVED STATUTORY & CASE EVIDENCE ===
${contextText}`;
  }

  const messages = [];

  // Add conversation history if available
  if (Array.isArray(history) && history.length > 0) {
    const validHistory = history
      .slice(-4)
      .filter((h) => h && h.role && h.content)
      .map((h) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: String(h.content) }));
    messages.push(...validHistory);
  }

  messages.unshift({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: question });

  const maxTokensMap = {
    GIBBERISH: 200,
    GREETING: 250,
    CASUAL: 350,
    INVENTION_OR_LEGAL: answerStyle === 'BRIEF' ? 500 : answerStyle === 'DETAILED' ? 1800 : 1100,
  };

  const result = await generateChatCompletion(messages, {
    customApiKey,
    temperature: 0.2,
    maxTokens: maxTokensMap[intent] || 1100,
    timeoutMs: 6000,
  });

  return {
    answer: result.content,
    modelUsed: result.model,
    chatProvider: 'groq',
  };
}
