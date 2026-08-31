# AYUTH RAG Backend - REST API Documentation

The AYUTH RAG (Retrieval-Augmented Generation) backend provides vector-indexed IP intelligence, statutory patentability evaluation, and grounded legal response generation for Ayurvedic innovations.

---

## Base URL
```
http://localhost:4000/api
```

---

## Endpoints

### 1. Health & Vector Store Status
**`GET /api/health`**

Returns service health, configured models, API key detection, and vector store statistics.

#### Response Example
```json
{
  "status": "ok",
  "service": "AYUTH RAG Backend",
  "version": "2.0.0",
  "timestamp": "2026-08-31T06:15:00.000Z",
  "models": {
    "chat": "gemini-1.5-flash",
    "embedding": "text-embedding-004"
  },
  "hasServerApiKey": true,
  "vectorStore": {
    "connected": true,
    "engine": "Embedded Persistent Vector DB",
    "storagePath": ".../data/ayuth_vector_records.json",
    "tableName": "ayuth_knowledge",
    "totalVectors": 14,
    "totalSourceDocs": 14
  }
}
```

---

### 2. RAG Chat & Grounded Generation
**`POST /api/chat`** or **`POST /api/rag/query`**

Executes the full RAG pipeline: embeds the query, searches nearest vector neighbors, applies jurisdiction filtering, constructs a statutory grounding prompt, and queries Gemini.

#### Request Body
```json
{
  "question": "Can I patent a polyherbal formulation with Ashwagandha and Turmeric?",
  "jurisdiction": "india",
  "inventionProfile": {
    "q1_components": "Ashwagandha, Turmeric",
    "q2_process": "Novel ultrasonication extraction",
    "q3_evidence": "Statistically proven 3x synergistic bioavailability"
  },
  "apiKey": "optional_client_gemini_api_key"
}
```

#### Response Example
```json
{
  "answer": "Under the Indian Patents Act, 1970, patenting a polyherbal combination faces Section 3(p) and Section 3(e) hurdles...",
  "sources": [
    {
      "id": "section-3e-admixture",
      "category": "Section 3(e) Synergism",
      "question": "How do I overcome a Section 3(e) objection for an Ayurvedic herbal combination?",
      "citation": "Indian Patents Act, 1970 — Section 3(e)",
      "jurisdiction": ["india"]
    }
  ],
  "jurisdiction": "india",
  "metrics": {
    "retrievedCount": 3,
    "durationMs": 850,
    "model": "gemini-1.5-flash",
    "embeddingModel": "text-embedding-004"
  }
}
```

---

### 3. Pure Vector Similarity Search
**`POST /api/rag/search`**

Performs semantic vector search against the vector database without triggering LLM generation.

#### Request Body
```json
{
  "query": "Traditional Knowledge Digital Library and section 3p",
  "jurisdiction": "india",
  "limit": 3
}
```

#### Response Example
```json
{
  "query": "Traditional Knowledge Digital Library and section 3p",
  "jurisdiction": "india",
  "totalResults": 3,
  "results": [
    {
      "id": "section-3p-analysis",
      "category": "Section 3(p) Exclusions",
      "question": "What is Section 3(p) of the Indian Patents Act...",
      "citation": "Indian Patents Act, 1970 — Section 3(p)",
      "similarity": 0.8924
    }
  ]
}
```

---

### 4. Vector Store Ingestion / Re-index
**`POST /api/rag/ingest`**

Embeds the full canonical knowledge source using `text-embedding-004` and updates the vector database.

#### Request Body (Optional)
```json
{
  "apiKey": "optional_gemini_api_key"
}
```

---

### 5. Statutory Patentability & Regulatory Classifier
**`POST /api/classify`**

Evaluates Section 3(p), Section 3(e), Section 3(d), and Biological Diversity Act (NBA) triggers.

#### Request Body
```json
{
  "q1_components": "Curcuma longa, Piperine",
  "q2_process": "Novel phospholipid complexation",
  "q3_evidence": "Statistically significant synergistic anti-inflammatory inhibition",
  "q4_source": "cultivated",
  "q5_intent": "commercial"
}
```

#### Response Example
```json
{
  "analysis": {
    "section3pRisk": "LOW",
    "section3eRisk": "LOW",
    "section3dRisk": "LOW",
    "nbaApprovalRequired": true,
    "commercialStrategy": [
      "File Indian Provisional Patent Application (Form 1 & Form 2)",
      "File Form III with National Biodiversity Authority (NBA)"
    ],
    "recommendedActions": [
      "MANDATORY NBA CLEARANCE: Sourcing biological resources from India triggers Section 6 of Biological Diversity Act, 2002."
    ],
    "statutoryCitations": [
      "Patents Act, 1970 — Section 3(e)",
      "Biological Diversity Act, 2002 — Section 3 & Section 6; Form III"
    ]
  }
}
```

---

## CLI Ingestion Tool
Run vector ingestion directly via npm:
```bash
npm run ingest
```
