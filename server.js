import express from 'express';
import cors from 'cors';
import { config } from './src/config.js';
import { ragRouter } from './src/routes/ragRoutes.js';
import { getVectorStoreStats } from './src/services/vectorStoreService.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Static files (frontend)
app.use(express.static(config.rootDir));

// API Routes
app.use('/api', ragRouter);

// Fallback to index.html for root or SPA routes, 404 for unknown /api routes
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: config.rootDir });
});

// API 404 Handler
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestedUrl: req.originalUrl,
    validEndpoints: [
      'GET  /api/health',
      'POST /api/chat',
      'POST /api/rag/query',
      'POST /api/rag/search',
      'POST /api/rag/ingest',
      'POST /api/classify',
    ],
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

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
    console.log(`[Vector DB] LanceDB active with ${stats.totalVectors} pre-indexed records.`);
  } else {
    console.log('[Vector DB] No pre-existing table found. Table will be auto-indexed on first query or via "npm run ingest".');
  }
});
