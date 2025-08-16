# 🚀 **500K Token Context System Design**

**Winky-Coder AI Agent Enhancement**  
**Goal**: Enable AI to see up to 500,000 tokens of project context per session

---

## 🎯 **Executive Summary**

This document outlines the implementation of a **500k-token context system** for Winky-Coder's AI agent. The system enables the AI to understand large codebases by intelligently assembling relevant context from chunked, indexed project artifacts while maintaining low latency, deterministic provenance, and cost controls.

### **Key Principles**
- **No streaming 500k raw tokens** - Instead, compose context on-demand from indexed chunks
- **Hierarchical summaries** - Use summaries for older/less-relevant content
- **Deterministic provenance** - Every claim must be traceable to source chunks
- **Safe execution** - All changes run in emulator before production
- **Cost controls** - Token budgets and usage monitoring

---

## 🏗️ **Core Architecture**

### **1. Chunk Store (Immutable)**
- Break project artifacts into fixed-size content chunks (8,000 tokens each)
- Each chunk is immutable with metadata and fingerprint
- Schema: `{ chunkId, projectId, path, offset, text, tokenCount, sha256, createdAt, type }`
- Store in S3/GCS with metadata in PostgreSQL

### **2. Embedding Index / Vector DB**
- Compute embeddings per chunk using OpenAI/Gemini embeddings
- Store in vector DB (Pinecone/Weaviate) with chunkId references
- Support similarity search with top-k and hybrid filters

### **3. Hierarchical Summaries Store**
- File-level summaries (few sentences)
- Directory-level summaries
- Project-level rolling summaries
- All summaries chunked and embedded

### **4. Context Assembler**
- Query embeddings for relevant chunks
- Assemble context up to 500k tokens
- Prioritize recent edits and hot files
- Fill remaining tokens with summaries

### **5. Model Adapter / Orchestrator**
- Single interface for very-long-context models
- Multi-pass generation strategy
- Prompt sanitization and secret-stripping

### **6. Cache & Hot-Window**
- Redis cache for recent high-value context
- LRU eviction with TTL tied to sessions

### **7. Audit & Provenance Layer**
- Record chunks used per model call
- Store fingerprints and timestamps
- Enable UI source linking

### **8. Emulator & Dry-Run Executor**
- Execute changes in ephemeral sandbox
- Capture logs and artifacts
- Support test replay

---

## 🔧 **Tokenization & Counting Rules**

### **Critical Requirements**
- Use **same tokenizer** as target model for counting
- Server-side token counter: `countTokens(text, model)`
- Chunk size: 8,000 tokens (tunable)
- Overlap: 128-512 tokens between adjacent chunks
- Binary files: Store metadata only, no raw content

### **Token Budget Management**
- Target: 500,000 tokens maximum
- Safety margin: ~2,000 tokens for model reply + system prompt
- Available for context: ~498,000 tokens
- Chunks per session: ~62 chunks (8,000 tokens each)

---

## 📥 **Chunking & Ingestion Pipeline**

### **File Processing**
1. **Read & Normalize**: Read file, normalize line endings
2. **Tokenize**: Use model tokenizer to count tokens
3. **Chunk**: Create chunks ≤ 8,000 tokens with overlap
4. **Fingerprint**: Compute SHA256 for each chunk
5. **Embed**: Generate embeddings for each chunk
6. **Store**: Save to chunk store and vector DB
7. **Deduplicate**: Reference existing chunks if SHA256 matches

### **Conversation & Logs**
- Chunk at logical message boundaries
- Tag with `type: "conversation"` or `type: "log"`
- Include severity levels for logs

### **Summarization Pipeline**
- **Chunk summaries**: Single-paragraph for each chunk
- **File summaries**: Aggregate chunk summaries
- **Directory summaries**: Roll up file summaries
- **Project summaries**: High-level project overview

---

## 🔍 **Retrieval & Context Assembly Algorithm**

```typescript
Input: prompt, projectId, model, tokenBudget=500000

1. reqEmbedding = embed(prompt)
2. candidates = vectorDB.query(reqEmbedding, filter: {projectId}, topK: 500)
3. sort candidates by score and recency/priority
4. selected = []
5. tokensSoFar = 0
6. for chunk in candidates:
     if tokensSoFar + chunk.tokenCount + safety_margin > tokenBudget:
         break
     selected.append(chunk)
     tokensSoFar += chunk.tokenCount

7. if tokensSoFar < tokenBudget:
     # add hierarchical summaries to fill remainder
     add file-summaries, then dir-summaries, then project-summary

8. Trim trailing text pieces to stay <= tokenBudget
9. Return selected pieces with provenance
```

### **Priority Rules**
1. **Hot files**: Currently open/edited files
2. **Recent changes**: Last N commits/diffs
3. **AI feedback**: Previous AI suggestions and approvals
4. **Relevance score**: Vector similarity to prompt
5. **Recency**: More recent content prioritized

---

## 📝 **Prompt Composition & Templates**

### **System Prompt (Fixed)**
```
You are Winky A1, a full-stack AI developer. Always include provenance and cite chunkIds for all factual claims. If you are unsure, state uncertainty and list the top-3 chunks that informed your answer.
```

### **Context Block Structure**
1. **Project Summary** (1-3 paragraphs)
2. **Relevant Snippets** (full chunks in descending relevance)
3. **Chunk Summaries** (if leftover tokens needed)
4. **User Conversation** (last 10 messages)
5. **Current Instruction**

### **Final Assembled Prompt**
```
---SYSTEM---
<system prompt>

---PROJECT_SUMMARY---
[project summary text]

---RELEVANT_SNIPPETS---
[chunk1 text]
[---source: chunkId, path]
[chunk2 text]
...

---USER_CONVERSATION---
[user message 1]
...

---USER_INSTRUCTION---
"Please generate a CRUD API for todos..."

---RESPONSE_FORMAT---
Return JSON with files[] or diff[], and include sources: [chunkId,...] for each factual claim.
```

---

## 🔄 **Model Orchestration & Multi-Pass Strategy**

### **Pass 1 - Plan**
- Send compact subset (project summary + top 5 chunks)
- Request plan in JSON format
- Plan should be short and focused

### **Pass 2 - Expand**
- Attach plan to larger context (top N chunks + summaries)
- Request full code generation/diffs
- Reduces cost explosion risk

### **Pass 3 - Verify**
- Run static checks and unit tests in emulator
- If failures, run targeted repair pass
- Include failing logs + minimal context

### **Fallbacks**
- If long-model API fails, use segmented generation
- Stitch results with cross-checking
- Maintain quality standards

---

## ⚡ **Streaming & Latency Strategies**

### **Performance Targets**
- Vector search + assembly: < 200ms (hot-window)
- Full assembly overhead: Instrument and adapt
- Model-specific latencies: Measure and optimize

### **Optimization Techniques**
- Stream model tokens to UI
- Concurrently stream emulator logs
- Warm model with "ping" on project open
- Pre-warm embeddings for hot files
- Cache recent high-value context

---

## 💰 **Cost Control & Quotas**

### **Budget Management**
- Per-project token budget limits
- Per-organization cost controls
- In-app usage meter display
- Auto-switch to summaries for older content

### **Rate Limiting**
- Concurrency caps on model adapter
- Rate limits per user/organization
- Cost threshold warnings
- Scope reduction options

---

## 🔍 **Provenance & Explainability**

### **Model Response Metadata**
```typescript
{
  sources: [{ chunkId, path, snippetStart, snippetEnd, score }],
  tokenUsage: { promptTokens, completionTokens, total },
  sessionId: string,
  callId: string
}
```

### **UI Integration**
- Highlight source file lines
- Clickable provenance links
- Context inspector with chunk details
- Source file navigation

---

## 🔒 **Security & Privacy Rules**

### **Server-Enforced Security**
- **Secret middleware**: Reject prompts containing credential patterns
- **Access control**: Only include chunks from user's projects
- **Audit logs**: Store chunkId references (not full content)
- **Model adapter**: Server-side only, never send raw secrets

### **Privacy Protection**
- Prompt sanitization before model calls
- Secret detection and removal
- Access control on chunk retrieval
- Audit trail for compliance

---

## 🌐 **APIs & Schemas**

### **Context Assembly API**
```typescript
POST /api/context/assemble
{
  projectId: string,
  prompt: string,
  budget: 500000,
  hotPaths: string[]
}

Response:
{
  contextPieces: [{
    chunkId: string,
    tokenCount: number,
    textPreview: string,
    sourcePath: string
  }],
  tokenTotal: number
}
```

### **Generate Prototype API (Extended)**
```typescript
POST /api/ai/generate-prototype
{
  projectId: string,
  prompt: string,
  runtime: "our" | "adapter",
  authType: "email" | "google" | null,
  size: "small" | "medium" | "large",
  maxContextTokens: 500000
}

Response:
{
  id: string,
  plan: object,
  contextMeta: {
    tokenBudget: 500000,
    tokensUsedForContext: number,
    chunksUsed: string[],
    summariesUsed: string[]
  },
  diffs: object[],
  previewUrl: string,
  warnings: string[]
}
```

---

## 🗄️ **Data Schemas**

### **Chunk Metadata Table**
```sql
CREATE TABLE chunks (
  chunk_id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  path TEXT,
  offset INT,
  token_count INT,
  sha256 TEXT,
  s3_key TEXT,
  type TEXT,
  created_at TIMESTAMP
);
```

### **Context Sessions Table**
```sql
CREATE TABLE context_sessions (
  session_id UUID PRIMARY KEY,
  project_id UUID,
  user_id UUID,
  created_at TIMESTAMP,
  chunks_used JSONB,
  tokens_at_call INT,
  model VARCHAR,
  result_meta JSONB
);
```

### **Summaries Table**
```sql
CREATE TABLE summaries (
  summary_id UUID PRIMARY KEY,
  project_id UUID,
  path TEXT,
  level TEXT, -- 'file', 'directory', 'project'
  content TEXT,
  token_count INT,
  embedding_vector VECTOR(1536),
  created_at TIMESTAMP
);
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- Tokenizer counters match model tokenizer
- Chunking produces reasonable chunks
- Content continuity preservation
- SHA256 fingerprint accuracy

### **Integration Tests**
- Ingest 1M token repo successfully
- Context assembly within 500k budget
- Retrieval recall for seeded facts
- Vector search accuracy

### **E2E Tests**
- Full workflow: describe → generate → preview → emulator → commit
- Provenance validation for all claims
- UI source linking functionality
- Performance benchmarks

### **Security Tests**
- Prompt sanitizer rejects secrets
- Access control prevents cross-project access
- Audit logging completeness
- Secret detection accuracy

---

## 📊 **Observability & Metrics**

### **Key Metrics**
- `ai.session.start`
- `ai.context.assemble.time_ms`
- `ai.model.call.promptTokens`
- `ai.model.call.completionTokens`
- `ai.emulator.run.duration_ms`
- `ai.emulator.run.passed`

### **Dashboard Views**
- Average tokens used per session
- Top projects by context size
- Context assembly time distribution
- Chunk reuse rate (cache hit ratio)
- AI-suggested-commit approval percentage

### **Log Retention**
- Metadata: Indefinite retention
- Full content: Per policy retention
- Audit logs: Compliance retention

---

## 🚀 **Rollout Strategy**

### **Phase A - Infrastructure**
- Chunk store + vector DB + token counter
- Ingestion pipeline
- Sample import for 1M token testing

### **Phase B - Context Assembler**
- `/api/context/assemble` implementation
- Unit tests + instrumentation
- Performance benchmarking

### **Phase C - Model Adapter**
- Multi-pass generation
- Long-context model integration
- Fallback mechanisms

### **Phase D - UI Integration**
- Context usage bar
- Context inspector
- Provenance linking

### **Phase E - Stress & Security**
- Penetration testing
- Concurrency testing
- Cost limit validation

### **Phase F - General Availability**
- Opt-in for projects
- Default quotas
- Migration tooling

---

## 🏗️ **Implementation Plan**

### **Branch Strategy**
1. `winky/infra-chunkstore-500k`
2. `winky/vecdb-index-500k`
3. `winky/context-assembler-500k`
4. `winky/model-adapter-500k`
5. `winky/ui-context-500k`

### **Commit Convention**
```
feat(context): implement chunking + ingestion for 500k-token context
```

### **PR Requirements**
- Sample assembled context (no secrets)
- Token count proof
- CI test outputs
- Performance benchmarks

---

## 🎯 **Acceptance Criteria**

A PR is **ready to merge** when:

1. **Pipeline ingests 1M token project** and produces chunks + summaries
2. **Context assembly** returns ≤ 500k tokens with chunk list
3. **Model adapter** accepts context and returns valid JSON changes
4. **UI shows** context usage bar and provenance links
5. **All tests pass** (unit, integration, e2e, security)
6. **Prompt sanitizer** passes security tests
7. **CI gates** are green with updated baselines

---

## 🔍 **Hallucination & Validation**

### **Verification Mechanisms**
- Static analysis on generated code
- Generated test execution
- Fact-checker module for claims
- Source completion for missing sources

### **Validation Pipeline**
1. **Assert stage**: Require sources for all claims
2. **Verify stage**: Run tests and static checks
3. **Repair stage**: Fix failures with targeted context
4. **Final validation**: Confirm all requirements met

---

## 🛡️ **Safety & Governance**

### **Admin Controls**
- Disable 500k context for cost-sensitive orgs
- Compliance mode for regulated industries
- Rate limiting and quota management

### **Decision Logging**
- Track external vendor usage
- Document fallback decisions
- Maintain audit trail

---

## 📋 **Deliverables**

### **Core Services**
- `services/chunker/*` - Chunking & ingestion
- `services/embeddings/*` - Embedding pipeline
- `services/context-assembler/*` - Assembly logic
- `services/model-adapter/*` - Multi-pass orchestration
- `services/emulator-runner/*` - Sandbox integration

### **UI Components**
- `ui/components/ContextUsageBar.tsx`
- `ui/pages/ContextInspector.tsx`

### **Documentation**
- `docs/500k_context_design.md` (this document)
- `tests/integration/large_repo_ingest.spec.ts`

---

## 🎉 **Success Metrics**

### **Technical Metrics**
- Context assembly time < 200ms
- Token utilization > 80%
- Cache hit ratio > 60%
- Model response quality maintained

### **User Experience**
- AI understands large codebases
- Provenance transparency
- Cost predictability
- Performance consistency

---

## 🔮 **Future Enhancements**

### **Advanced Features**
- Multi-modal context (images, diagrams)
- Real-time collaboration context
- Cross-project context sharing
- Advanced summarization techniques

### **Performance Optimizations**
- Predictive context preloading
- Advanced caching strategies
- Model-specific optimizations
- Distributed context assembly

---

**This document serves as the complete technical specification for implementing 500k-token context in Winky-Coder. All implementations must follow these guidelines to ensure consistency, security, and performance.**

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Implementation Ready