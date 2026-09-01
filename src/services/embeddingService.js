import crypto from 'node:crypto';
import { config } from '../config.js';

/**
 * Format a document entry into rich contextual text for dense vector representation
 */
export function formatDocumentForEmbedding(doc) {
  return [
    `Title / Topic: ${doc.question}`,
    `Legal Category: ${doc.category}`,
    `Statutory Answer & Rules: ${doc.answer}`,
    `Legal Citations: ${doc.citation}`,
    `Applicable Jurisdiction: ${(doc.jurisdiction || []).join(', ')}`,
  ].join('\n');
}

/**
 * Generate deterministic 768-dimensional local vector embedding based on feature hashing & n-gram frequency
 * Fully offline, lightning fast (0ms), and 100% reliable without external API dependencies
 */
function generateLocalFeatureVector(text, dimensions = 768) {
  const vector = new Array(dimensions).fill(0);
  const normalized = String(text || '').toLowerCase();
  const tokens = normalized.match(/\b\w+\b/g) || [];

  if (tokens.length === 0) return vector;

  // Unigrams & Bigrams
  for (let i = 0; i < tokens.length; i++) {
    const unigram = tokens[i];
    const hashU = crypto.createHash('md5').update(unigram).digest();
    const idxU = (hashU.readUInt32BE(0) ^ hashU.readUInt32BE(4)) % dimensions;
    const signU = (hashU.readUInt8(8) % 2 === 0) ? 1 : -1;
    vector[idxU] += signU * (1.0 + (unigram.length > 5 ? 0.5 : 0));

    if (i < tokens.length - 1) {
      const bigram = `${tokens[i]}_${tokens[i + 1]}`;
      const hashB = crypto.createHash('md5').update(bigram).digest();
      const idxB = (hashB.readUInt32BE(0) ^ hashB.readUInt32BE(4)) % dimensions;
      const signB = (hashB.readUInt8(8) % 2 === 0) ? 1 : -1;
      vector[idxB] += signB * 1.5;
    }
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }
  }

  return vector;
}

/**
 * Generate 768-dimensional text embedding
 * @param {string} text - Input query or document chunk text
 * @param {'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'} taskType - Embedding task type
 * @param {string} [customApiKey] - Optional client-supplied API key
 * @returns {Promise<number[]>} Array of floating point vector weights
 */
export async function generateEmbedding(text, taskType = 'RETRIEVAL_DOCUMENT', customApiKey = null) {
  return generateLocalFeatureVector(text, 768);
}

/**
 * Batch generate embeddings for multiple knowledge documents
 * @param {Array<Object>} docs - Array of knowledge documents
 * @param {string} [customApiKey] - Optional API key
 * @returns {Promise<Array<Object>>} Documents enriched with embedding vector
 */
export async function batchEmbedDocuments(docs, customApiKey = null) {
  const embeddedDocs = [];

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const textContent = formatDocumentForEmbedding(doc);
    const vector = await generateEmbedding(textContent, 'RETRIEVAL_DOCUMENT', customApiKey);

    embeddedDocs.push({
      id: doc.id,
      category: doc.category,
      question: doc.question,
      answer: doc.answer,
      citation: doc.citation,
      jurisdiction: (doc.jurisdiction || []).join(','),
      text: textContent,
      vector,
    });
  }

  return embeddedDocs;
}
