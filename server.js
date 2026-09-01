import { app } from './src/app.js';
import { config } from './src/config.js';
import { getVectorStoreStats } from './src/services/vectorStoreService.js';
import express from 'express';

// Static files for local dev/preview
app.use(express.static(config.rootDir));

// Server Initialization
app.listen(config.port, async () => {
  console.log('====================================================');
  console.log(`🌿 AYUTH RAG Backend running at http://localhost:${config.port}`);
  console.log(`📡 Health Check:  http://localhost:${config.port}/api/health`);
  console.log(`💬 Chat Endpoint: http://localhost:${config.port}/api/chat`);
  console.log(`🔍 Search API:    http://localhost:${config.port}/api/rag/search`);
  console.log('====================================================');

  const stats = await getVectorStoreStats();
  if (stats.tableExists) {
    console.log(`[Vector DB] Vector Store active with ${stats.totalVectors} pre-indexed records.`);
  } else {
    console.log('[Vector DB] No pre-existing table found. Table will be auto-indexed on first query or via "npm run ingest".');
  }
});
