import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { knowledgeBase } from '../data/knowledgeSource.js';
import { batchEmbedDocuments, generateEmbedding } from './embeddingService.js';

let lancedbModule = null;
let useNativeLanceDB = true;

// Try to load native LanceDB module, fallback gracefully if platform napi mismatch occurs
try {
  lancedbModule = await import('@lancedb/lancedb');
} catch (e) {
  useNativeLanceDB = false;
  console.warn('[VectorStore] Native LanceDB binding unavailable on this Node runtime. Using Embedded Persistent Vector Engine.');
}

const EMBEDDED_DB_FILE = path.join(config.dataDir, 'ayuth_vector_records.json');

/**
 * Cosine similarity between two float vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Load records from the embedded persistent vector file
 */
function loadEmbeddedRecords() {
  if (fs.existsSync(EMBEDDED_DB_FILE)) {
    try {
      const data = fs.readFileSync(EMBEDDED_DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('[VectorStore] Failed to read embedded vector file:', err);
    }
  }
  return [];
}

/**
 * Save records to the embedded persistent vector file
 */
function saveEmbeddedRecords(records) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.writeFileSync(EMBEDDED_DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

/**
 * Filter vector search results by jurisdiction (India, International, or Unified All)
 */
export function filterByJurisdiction(hits, targetJurisdiction = 'all') {
  const target = (targetJurisdiction || 'all').toLowerCase();
  if (target === 'all' || target === 'both' || (target.includes('india') && target.includes('international'))) {
    return hits;
  }

  const filtered = hits.filter((hit) => {
    if (!hit.jurisdiction) return true;
    const list = Array.isArray(hit.jurisdiction)
      ? hit.jurisdiction.map((j) => j.trim().toLowerCase())
      : String(hit.jurisdiction).split(',').map((j) => j.trim().toLowerCase());

    if (list.includes('all')) return true;
    if (target === 'india') {
      return list.includes('india');
    }
    return list.includes('international') || list.includes('global') || list.includes('wipo');
  });

  return filtered.length > 0 ? filtered : hits;
}

/**
 * Get or create vector table across native LanceDB or Persistent Vector Store
 */
export async function getOrCreateVectorTable(apiKey = null) {
  fs.mkdirSync(config.dataDir, { recursive: true });

  if (useNativeLanceDB && lancedbModule) {
    try {
      const db = await lancedbModule.connect(config.vectorDbPath);
      const tableNames = await db.tableNames().catch(() => []);
      if (tableNames.includes(config.tableName)) {
        return { type: 'lancedb', db, table: await db.openTable(config.tableName) };
      }
      console.log(`[LanceDB] Creating table '${config.tableName}' with ${knowledgeBase.length} docs...`);
      const embeddedDocs = await batchEmbedDocuments(knowledgeBase, apiKey);
      const table = await db.createTable(config.tableName, embeddedDocs, { mode: 'overwrite' });
      return { type: 'lancedb', db, table };
    } catch (err) {
      console.warn('[LanceDB] Error connecting to native LanceDB, switching to Embedded Vector Store:', err.message);
      useNativeLanceDB = false;
    }
  }

  // Embedded Persistent Vector Store
  let records = loadEmbeddedRecords();
  if (!records || records.length === 0) {
    console.log(`[VectorStore] Initializing vector store with ${knowledgeBase.length} knowledge documents...`);
    records = await batchEmbedDocuments(knowledgeBase, apiKey);
    saveEmbeddedRecords(records);
    console.log(`[VectorStore] Indexed ${records.length} records into ${EMBEDDED_DB_FILE}`);
  }

  return { type: 'embedded', records };
}

/**
 * Force re-indexing of all knowledge documents
 */
export async function reindexVectorStore(apiKey = null) {
  fs.mkdirSync(config.dataDir, { recursive: true });
  console.log(`[VectorStore] Embedding & reindexing ${knowledgeBase.length} documents...`);

  const embeddedDocs = await batchEmbedDocuments(knowledgeBase, apiKey);

  if (useNativeLanceDB && lancedbModule) {
    try {
      const db = await lancedbModule.connect(config.vectorDbPath);
      await db.createTable(config.tableName, embeddedDocs, { mode: 'overwrite' });
    } catch (err) {
      console.warn('[LanceDB] Native index failed, updating embedded store:', err.message);
      useNativeLanceDB = false;
    }
  }

  saveEmbeddedRecords(embeddedDocs);
  console.log(`[VectorStore] Successfully indexed ${embeddedDocs.length} vector records.`);

  return {
    success: true,
    totalIndexed: embeddedDocs.length,
    vectorEngine: useNativeLanceDB ? 'LanceDB' : 'Embedded Persistent Vector Store',
    vectorDbPath: useNativeLanceDB ? config.vectorDbPath : EMBEDDED_DB_FILE,
  };
}

/**
 * Search vector store for nearest matching knowledge chunks
 */
export async function searchVectorStore(queryText, options = {}) {
  const { limit = config.topK, jurisdiction = 'all', apiKey = null } = options;

  let rawHits = [];

  try {
    const target = await getOrCreateVectorTable(apiKey);
    const queryVector = await generateEmbedding(queryText, 'RETRIEVAL_QUERY', apiKey);

    if (target.type === 'lancedb' && target.table) {
      try {
        rawHits = await target.table.search(queryVector).limit(limit * 2).toArray();
      } catch (err) {
        console.warn('[LanceDB Search Error, fallback to embedded]', err.message);
        const records = loadEmbeddedRecords();
        rawHits = rankRecordsByVector(records, queryVector);
      }
    } else {
      const records = target.records || loadEmbeddedRecords();
      rawHits = rankRecordsByVector(records, queryVector);
    }
  } catch (embeddingError) {
    // Graceful offline fallback: lexical/keyword multi-term scoring
    console.warn('[VectorStore] Vector embedding unavailable, using lexical search:', embeddingError.message);
    const terms = String(queryText).toLowerCase().split(/\s+/).filter(Boolean);
    const scored = knowledgeBase.map((item) => {
      const q = item.question.toLowerCase();
      const a = item.answer.toLowerCase();
      const cat = item.category.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (q.includes(t)) score += 5;
        if (a.includes(t)) score += 2;
        if (cat.includes(t)) score += 3;
      }
      return { ...item, similarity: score > 0 ? Number((score / (terms.length * 10)).toFixed(4)) : 0 };
    });
    rawHits = scored.filter((s) => s.similarity > 0).sort((a, b) => b.similarity - a.similarity);
    if (rawHits.length === 0) {
      rawHits = knowledgeBase.slice(0, limit);
    }
  }

  const jurisdictionFiltered = filterByJurisdiction(rawHits, jurisdiction);
  const topHits = jurisdictionFiltered.slice(0, limit);

  return topHits.map((doc) => ({
    id: doc.id,
    category: doc.category,
    question: doc.question,
    answer: doc.answer,
    citation: doc.citation,
    jurisdiction: Array.isArray(doc.jurisdiction)
      ? doc.jurisdiction
      : (doc.jurisdiction || '').split(',').map((j) => j.trim()),
    similarity: doc.similarity ?? (doc._distance != null ? 1 - doc._distance : null),
  }));
}

function rankRecordsByVector(records, queryVector) {
  const scored = records.map((doc) => {
    const sim = cosineSimilarity(queryVector, doc.vector);
    return {
      ...doc,
      similarity: Number(sim.toFixed(4)),
      _distance: Number((1 - sim).toFixed(4)),
    };
  });

  return scored.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Get vector database statistics
 */
export async function getVectorStoreStats() {
  const embeddedRecords = loadEmbeddedRecords();
  return {
    connected: true,
    engine: useNativeLanceDB ? 'LanceDB Native' : 'Embedded Persistent Vector DB',
    storagePath: useNativeLanceDB ? config.vectorDbPath : EMBEDDED_DB_FILE,
    tableName: config.tableName,
    totalVectors: embeddedRecords.length,
    totalSourceDocs: knowledgeBase.length,
  };
}
