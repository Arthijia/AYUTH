import { GoogleGenerativeAI } from '@google/generative-ai';
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
 * Generate 768-dimensional text embedding using Gemini text-embedding-004
 * @param {string} text - Input query or document chunk text
 * @param {'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'} taskType - Embedding task type
 * @param {string} [customApiKey] - Optional client-supplied Gemini API key
 * @returns {Promise<number[]>} Array of floating point vector weights
 */
export async function generateEmbedding(text, taskType = 'RETRIEVAL_DOCUMENT', customApiKey = null) {
  const apiKey = customApiKey || config.geminiApiKey;
  if (!apiKey) {
    throw new Error('No Gemini API key available. Provide apiKey in request or configure GEMINI_API_KEY in server environment.');
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: config.embeddingModel });

  const result = await model.embedContent({
    content: { parts: [{ text }] },
    taskType,
    title: taskType === 'RETRIEVAL_DOCUMENT' ? 'AYUTH Knowledge Base Document' : undefined,
  });

  if (!result.embedding || !result.embedding.values || !Array.isArray(result.embedding.values)) {
    throw new Error('Embedding service did not return valid vector coordinates.');
  }

  return result.embedding.values;
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
