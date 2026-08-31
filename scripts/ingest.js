#!/usr/bin/env node

import dotenv from 'dotenv';
import { reindexVectorStore, getVectorStoreStats } from '../src/services/vectorStoreService.js';
import { config } from '../src/config.js';

dotenv.config();

async function runIngestion() {
  console.log('====================================================');
  console.log(' AYUTH RAG Pipeline - Vector Store Ingestion Tool');
  console.log('====================================================');
  console.log(`Database Target: ${config.vectorDbPath}`);
  console.log(`Table Name:      ${config.tableName}`);
  console.log(`Embedding Model: ${config.embeddingModel}`);
  console.log('----------------------------------------------------');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('\n❌ ERROR: GEMINI_API_KEY environment variable is not set.');
    console.error('Please create a .env file or export GEMINI_API_KEY before running ingestion.\n');
    process.exit(1);
  }

  try {
    const startTime = Date.now();
    const result = await reindexVectorStore(apiKey);
    const stats = await getVectorStoreStats();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ INGESTION COMPLETED SUCCESSFULLY!');
    console.log(`• Total documents embedded: ${result.totalIndexed}`);
    console.log(`• Total rows in LanceDB:   ${stats.totalVectors}`);
    console.log(`• Ingestion Duration:       ${duration}s`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ INGESTION FAILED:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runIngestion();
