import { config } from '../config.js';
import { searchVectorStore } from './vectorStoreService.js';
import { generateGroundedRagResponse } from './aiService.js';

/**
 * Execute full RAG pipeline: Query Vector Search -> Prompt Context Construction -> Groq LLM Generation
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

  // Step 1: Semantic Vector Search against Vector Store
  const retrievedDocs = await searchVectorStore(queryText, {
    limit,
    jurisdiction,
    apiKey,
  });

  // Step 2: LLM Generation via Groq
  const aiResult = await generateGroundedRagResponse({
    question: queryText,
    retrievedDocs,
    inventionProfile,
    language,
    customApiKey: apiKey,
  });

  const durationMs = Date.now() - startTime;

  return {
    answer: aiResult.answer,
    sources: retrievedDocs,
    jurisdiction,
    metrics: {
      retrievedCount: retrievedDocs.length,
      durationMs,
      chatProvider: 'groq',
      model: aiResult.modelUsed || config.groqModel,
    },
  };
}
