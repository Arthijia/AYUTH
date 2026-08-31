import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as lancedb from 'lancedb';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { knowledgeBase } from './server/knowledgeSource.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const VECTOR_DB_PATH = path.join(dataDir, 'ayuth_lancedb');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const FALLBACK_API_KEY = process.env.GEMINI_API_KEY || null;

function createContextText(doc) {
  return [
    `Category: ${doc.category}`,
    `Question: ${doc.question}`,
    `Answer: ${doc.answer}`,
    `Citation: ${doc.citation}`,
    `Jurisdiction: ${(doc.jurisdiction || []).join(', ')}`,
  ].join('\n');
}

async function getEmbedding(ai, text) {
  const embeddingModel = ai.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }] },
    taskType: 'RETRIEVAL_DOCUMENT',
    title: 'ayuth-knowledge-base',
  });

  if (!result.embedding || !result.embedding.values) {
    throw new Error('Embedding response did not contain vector values.');
  }

  return result.embedding.values;
}

async function getOrCreateVectorTable(ai) {
  const db = await lancedb.connect(VECTOR_DB_PATH);
  const tableName = 'ayuth_knowledge';

  try {
    return await db.openTable(tableName);
  } catch (error) {
    const docs = await Promise.all(
      knowledgeBase.map(async (doc) => {
        const vector = await getEmbedding(ai, createContextText(doc));

        return {
          id: doc.id,
          category: doc.category,
          question: doc.question,
          answer: doc.answer,
          citation: doc.citation,
          jurisdiction: doc.jurisdiction.join(','),
          text: createContextText(doc),
          vector,
        };
      })
    );

    return db.createTable(tableName, docs, { mode: 'overwrite' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'AYUTH RAG backend is running.',
    hasGeminiKey: Boolean(FALLBACK_API_KEY),
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { question, jurisdiction = 'india', inventionProfile = {}, apiKey } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const effectiveApiKey = apiKey || FALLBACK_API_KEY;
    if (!effectiveApiKey) {
      return res.status(400).json({
        error: 'No Gemini API key configured. Add GEMINI_API_KEY to the server environment or include apiKey in the request.',
      });
    }

    const ai = new GoogleGenerativeAI(effectiveApiKey);
    const generationModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const table = await getOrCreateVectorTable(ai);
    const queryVector = await getEmbedding(ai, String(question));
    const hits = await table.search(queryVector).limit(4).toArray();

    const relevant = hits.filter((hit) => {
      const jurisdictions = (hit.jurisdiction || '')
        .split(',')
        .map((entry) => entry.trim().toLowerCase());

      return (
        !architecturedJurisdictionFilter(jurisdictions, jurisdiction) &&
        jurisdictions.length > 0
      )
        ? false
        : true;
    });

    const matches = relevant.length ? relevant : hits;
    const ragContext = matches.length
      ? matches
          .map((doc, index) => {
            return `Source ${index + 1} [${doc.category}]\nQuestion: ${doc.question}\nAnswer: ${doc.answer}\nCitation: ${doc.citation}`;
          })
          .join('\n\n')
      : 'No direct matches were found in the AYUTH knowledge base.';

    const prompt = `You are AYUTH, a retrieval-grounded IP and regulatory assistant for Ayurvedic inventions.

STRICT RULES:
1. Use only the retrieved source material below.
2. Do not invent facts or legal requirements that are not supported by the source material.
3. If the knowledge base is insufficient, say that the answer is limited by source material and ask for more detail.
4. Do not provide medical advice or treatment claims.
5. Cite relevant source titles, acts, or authorities that are actually present in the supplied context.
6. Consider the user's jurisdiction: ${jurisdiction === 'india' ? 'India only' : 'International regimes (WIPO, CBD, etc.)'}.
7. Consider the invention profile: ${JSON.stringify(inventionProfile || {})}.
8. End with: "This is informational guidance, not a substitute for a registered patent attorney."

RETRIEVED CONTEXT:
${ragContext}

User question: ${question}`;

    const response = await generationModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 20,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const answer = response.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate an answer from the knowledge base.';

    res.json({
      answer,
      sources: matches.map((doc) => ({
        id: doc.id,
        category: doc.category,
        question: doc.question,
        answer: doc.answer,
        citation: doc.citation,
        jurisdiction: (doc.jurisdiction || '').split(',').map((entry) => entry.trim()),
      })),
    });
  } catch (error) {
    console.error('RAG API request failed:', error);
    res.status(500).json({
      error: error.message || 'The backend could not process the request.',
    });
  }
});

function architecturedJurisdictionFilter(jurisdictions, jurisdiction) {
  const target = (jurisdiction || 'india').toLowerCase();
  const allowed = new Set(['all', 'india', 'international']);

  if (!jurisdictions.length) {
    return true;
  }

  if (jurisdictions.some((item) => allowed.has(item))) {
    return true;
  }

  if (target === 'india') {
    return jurisdictions.includes('india');
  }

  return jurisdictions.includes('international');
}

app.listen(PORT, () => {
  console.log(`AYUTH RAG backend running on http://localhost:${PORT}`);
});
