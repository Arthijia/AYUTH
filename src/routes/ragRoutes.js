import express from 'express';
import { config } from '../config.js';
import { getVectorStoreStats, searchVectorStore, reindexVectorStore } from '../services/vectorStoreService.js';
import { executeRagPipeline } from '../services/ragService.js';
import { classifyAyurvedicInvention } from '../services/classifierService.js';

export const ragRouter = express.Router();

/**
 * Health Check & Vector Database Status Endpoint
 * GET /api/health
 */
ragRouter.get('/health', async (req, res) => {
  try {
    const vectorStats = await getVectorStoreStats();
    res.json({
      status: 'ok',
      service: 'AYUTH RAG Backend',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      models: {
        chat: config.chatModel,
        embedding: config.embeddingModel,
      },
      hasServerApiKey: Boolean(config.geminiApiKey),
      vectorStore: vectorStats,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * Primary RAG Chat & Grounded Generation Endpoint
 * POST /api/chat & POST /api/rag/query
 */
async function handleRagQuery(req, res) {
  try {
    const {
      question,
      jurisdiction = 'india',
      inventionProfile = {},
      apiKey = null,
      limit = config.topK,
      language = 'en',
    } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const ragResult = await executeRagPipeline({
      question,
      jurisdiction,
      inventionProfile,
      apiKey,
      limit,
      language,
    });

    res.json(ragResult);
  } catch (error) {
    console.error('[RAG Error]', error);
    const isApiKeyError = error.message?.toLowerCase().includes('api key');
    const statusCode = isApiKeyError ? 401 : 500;

    res.status(statusCode).json({
      error: error.message || 'Internal RAG pipeline error occurred.',
    });
  }
}

ragRouter.post('/chat', handleRagQuery);
ragRouter.post('/rag/query', handleRagQuery);

/**
 * Pure Semantic Vector Similarity Search Endpoint (No LLM generation)
 * POST /api/rag/search
 */
ragRouter.post('/rag/search', async (req, res) => {
  try {
    const { query, jurisdiction = 'india', limit = config.topK, apiKey = null } = req.body || {};

    if (!query || !String(query).trim()) {
      return res.status(400).json({ error: 'Query string is required.' });
    }

    const hits = await searchVectorStore(query, {
      limit: Number(limit),
      jurisdiction,
      apiKey,
    });

    res.json({
      query,
      jurisdiction,
      totalResults: hits.length,
      results: hits,
    });
  } catch (error) {
    console.error('[Vector Search Error]', error);
    res.status(500).json({
      error: error.message || 'Vector search failed.',
    });
  }
});

/**
 * Vector Index Ingestion & Refresh Endpoint
 * POST /api/rag/ingest
 */
ragRouter.post('/rag/ingest', async (req, res) => {
  try {
    const { apiKey = null } = req.body || {};
    const result = await reindexVectorStore(apiKey);
    res.json({
      message: 'Knowledge base successfully embedded and indexed into LanceDB.',
      ...result,
    });
  } catch (error) {
    console.error('[Ingest Error]', error);
    res.status(500).json({
      error: error.message || 'Vector ingestion failed.',
    });
  }
});

/**
 * Statutory Patentability & Regulatory Classifier Endpoint
 * POST /api/classify
 */
ragRouter.post('/classify', (req, res) => {
  try {
    const profile = req.body || {};
    const classification = classifyAyurvedicInvention(profile);
    res.json(classification);
  } catch (error) {
    console.error('[Classifier Error]', error);
    res.status(500).json({
      error: error.message || 'Classification evaluation failed.',
    });
  }
});
