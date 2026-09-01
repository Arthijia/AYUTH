import express from 'express';
import { config } from '../config.js';
import { getVectorStoreStats, searchVectorStore, reindexVectorStore } from '../services/vectorStoreService.js';
import { executeRagPipeline } from '../services/ragService.js';
import { classifyAyurvedicInvention } from '../services/classifierService.js';
import { getAiProviderInfo } from '../services/aiService.js';

export const ragRouter = express.Router();

/**
 * Health Check & Vector Database Status Endpoint
 * GET /api/health
 */
ragRouter.get('/health', async (req, res) => {
  try {
    const vectorStats = await getVectorStoreStats();
    const aiInfo = getAiProviderInfo();

    res.json({
      status: 'ok',
      service: 'AYUTH RAG Backend',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      models: {
        chatProvider: 'groq',
        chat: config.groqModel || 'openai/gpt-oss-120b',
      },
      hasGroqApiKey: Boolean(config.groqApiKey),
      vectorStore: vectorStats,
    });
  } catch (error) {
    console.error('[Health Check Error]', error);
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
      message,
      history = [],
      jurisdiction = 'india',
      inventionProfile = {},
      apiKey = null,
      limit = config.topK,
      language = 'en',
    } = req.body || {};

    const userQuery = String(question || message || '').trim();
    if (!userQuery) {
      return res.status(400).json({ error: 'Question or message is required.' });
    }

    const ragResult = await executeRagPipeline({
      question: userQuery,
      history,
      jurisdiction,
      inventionProfile,
      apiKey,
      limit,
      language,
    });

    res.json(ragResult);
  } catch (error) {
    console.error('[RAG Chat Error]', error);
    const msg = error.message || '';
    let statusCode = 500;

    if (msg.includes('No Groq API key') || msg.includes('Invalid Groq API key') || msg.includes('API key')) {
      statusCode = 401;
    } else if (msg.includes('rate limit') || msg.includes('Rate limit')) {
      statusCode = 429;
    }

    res.status(statusCode).json({
      error: error.message || 'Internal RAG pipeline error occurred with Groq provider.',
      chatProvider: 'groq',
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

import { knowledgeBase } from '../data/knowledgeSource.js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dynamicDocs = [...knowledgeBase];
const LOCKER_FILE = path.join(config.dataDir, 'locker_records.json');

function loadLockerRecords() {
  if (fs.existsSync(LOCKER_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOCKER_FILE, 'utf-8'));
    } catch (_) {}
  }
  return [];
}

function saveLockerRecords(records) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.writeFileSync(LOCKER_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

/**
 * Knowledge Base Documents Endpoints
 * GET /api/documents & GET /api/kb
 */
ragRouter.get(['/documents', '/kb'], (req, res) => {
  res.json({
    records: dynamicDocs,
    total: dynamicDocs.length,
  });
});

/**
 * Add Custom Document to Knowledge Base
 * POST /api/documents/upload
 */
ragRouter.post('/documents/upload', (req, res) => {
  try {
    const { title, category, content, citation, jurisdiction } = req.body || {};
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const newDoc = {
      id: `custom-${Date.now()}`,
      category: category || 'Custom Statutory Reference',
      question: title,
      answer: content,
      citation: citation || title,
      jurisdiction: Array.isArray(jurisdiction) ? jurisdiction : ['india', 'international'],
    };

    dynamicDocs.unshift(newDoc);
    res.json({
      status: 'success',
      message: 'Document added to knowledge base.',
      document: newDoc,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Locker Records Endpoints
 * GET /api/locker/records & GET /api/inventions
 */
ragRouter.get(['/locker/records', '/inventions'], (req, res) => {
  const records = loadLockerRecords();
  res.json({
    status: 'success',
    records,
    total: records.length,
  });
});

/**
 * Evidence File Upload Mock / Receiver
 * POST /api/locker/upload
 */
ragRouter.post('/locker/upload', (req, res) => {
  const recordId = `AYUTH-LOCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  res.json({
    status: 'success',
    record_id: recordId,
    uploaded_files: [],
  });
});

/**
 * Create Invention Locker Record with Master SHA-256
 * POST /api/locker/create
 */
ragRouter.post('/locker/create', (req, res) => {
  try {
    const { title, description, files = [], record_id } = req.body || {};
    const recordId = record_id || `AYUTH-LOCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const canonicalData = JSON.stringify({
      recordId,
      title: (title || '').trim(),
      description: (description || '').trim(),
      files,
      timestamp,
    });

    const masterSha256 = crypto.createHash('sha256').update(canonicalData).digest('hex');

    const newRecord = {
      record_id: recordId,
      title: title || 'Ayurvedic Invention Disclosure',
      description,
      master_sha256: masterSha256,
      timestamp_utc: timestamp,
      total_files: files.length,
      documents_count: files.filter(f => f.type === 'document').length,
      images_count: files.filter(f => f.type === 'image').length,
      videos_count: files.filter(f => f.type === 'video').length,
      total_size_formatted: 'Verified',
      files,
      receipt_text: `================================================================================\nAYUTH INTELLECTUAL PROPERTY LOCKER - PROOF OF CONCEPTION RECEIPT\n================================================================================\nLocker Record ID    : ${recordId}\nInvention Title     : ${title}\nServer Timestamp    : ${timestamp}\nMaster SHA-256 Hash : ${masterSha256}\nTotal Files Locked  : ${files.length}\n================================================================================`,
    };

    const existing = loadLockerRecords();
    existing.unshift(newRecord);
    saveLockerRecords(existing);

    res.json({
      status: 'success',
      record: newRecord,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
