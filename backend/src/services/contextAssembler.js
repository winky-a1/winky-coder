/**
 * Context Assembler Service for 500k Token Context System
 * 
 * Intelligently assembles context from chunked project artifacts
 * Prioritizes relevant chunks and fills with summaries
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { GoogleGenerativeAIEmbeddings } from '@google/generative-ai';
import Redis from 'ioredis';

// Configuration
const CONTEXT_CONFIG = {
  MAX_TOKENS: 500000,
  SAFETY_MARGIN: 2000,
  AVAILABLE_TOKENS: 498000, // MAX_TOKENS - SAFETY_MARGIN
  TOP_K_CANDIDATES: 500,
  HOT_WINDOW_SIZE: 10,
  CACHE_TTL: 3600, // 1 hour
  MIN_RELEVANCE_SCORE: 0.3
};

class ContextAssemblerService {
  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    this.redis = new Redis(process.env.REDIS_URL);

    // Initialize embeddings
    this.embeddings = this.initializeEmbeddings();
    
    // Token counter
    this.tokenCounter = new TokenCounter();
  }

  initializeEmbeddings() {
    const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'openai';
    
    switch (embeddingProvider) {
      case 'openai':
        return new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: 'text-embedding-3-small'
        });
      case 'gemini':
        return new GoogleGenerativeAIEmbeddings({
          modelName: 'embedding-001',
          apiKey: process.env.GEMINI_API_KEY
        });
      default:
        throw new Error(`Unsupported embedding provider: ${embeddingProvider}`);
    }
  }

  /**
   * Main context assembly function
   */
  async assembleContext(projectId, prompt, options = {}) {
    const startTime = Date.now();
    const sessionId = uuidv4();
    
    try {
      // Validate input
      if (!projectId || !prompt) {
        throw new Error('Missing required parameters: projectId, prompt');
      }

      const {
        budget = CONTEXT_CONFIG.AVAILABLE_TOKENS,
        hotPaths = [],
        model = 'gpt-4',
        includeConversation = true,
        maxConversationMessages = 10
      } = options;

      // Check cache first
      const cacheKey = this.generateCacheKey(projectId, prompt, budget, hotPaths);
      const cachedContext = await this.getCachedContext(cacheKey);
      if (cachedContext) {
        return {
          ...cachedContext,
          cached: true,
          assemblyTime: Date.now() - startTime
        };
      }

      // Generate prompt embedding
      const promptEmbedding = await this.generateEmbedding(prompt);

      // Get relevant chunks
      const relevantChunks = await this.getRelevantChunks(
        projectId, 
        promptEmbedding, 
        hotPaths
      );

      // Get hot window chunks (currently open files)
      const hotWindowChunks = await this.getHotWindowChunks(projectId, hotPaths);

      // Get conversation history
      const conversationChunks = includeConversation 
        ? await this.getConversationChunks(projectId, maxConversationMessages)
        : [];

      // Get project summary
      const projectSummary = await this.getProjectSummary(projectId);

      // Assemble context pieces
      const contextPieces = await this.assembleContextPieces(
        relevantChunks,
        hotWindowChunks,
        conversationChunks,
        projectSummary,
        budget,
        model
      );

      // Generate final context
      const assembledContext = this.generateAssembledContext(contextPieces, prompt);

      // Cache the result
      await this.cacheContext(cacheKey, {
        contextPieces,
        assembledContext,
        tokenUsage: contextPieces.reduce((sum, piece) => sum + piece.tokenCount, 0)
      });

      // Log context session
      await this.logContextSession(sessionId, projectId, contextPieces, prompt, model);

      return {
        sessionId,
        contextPieces,
        assembledContext,
        tokenUsage: contextPieces.reduce((sum, piece) => sum + piece.tokenCount, 0),
        tokenBudget: budget,
        assemblyTime: Date.now() - startTime,
        cached: false,
        metadata: {
          totalChunks: contextPieces.length,
          hotWindowChunks: hotWindowChunks.length,
          conversationChunks: conversationChunks.length,
          hasProjectSummary: !!projectSummary
        }
      };
    } catch (error) {
      console.error('Error assembling context:', error);
      throw error;
    }
  }

  /**
   * Get relevant chunks using vector similarity
   */
  async getRelevantChunks(projectId, promptEmbedding, hotPaths = []) {
    try {
      // Query vector database for similar chunks
      const result = await this.db.query(`
        SELECT 
          c.chunk_id,
          c.path,
          c.offset,
          c.token_count,
          c.type,
          c.language,
          c.created_at,
          ce.embedding_vector,
          1 - (ce.embedding_vector <=> $1) as similarity_score
        FROM chunks c
        JOIN chunk_embeddings ce ON c.chunk_id = ce.chunk_id
        WHERE c.project_id = $2
        AND c.type != 'binary'
        ORDER BY ce.embedding_vector <=> $1
        LIMIT $3
      `, [promptEmbedding, projectId, CONTEXT_CONFIG.TOP_K_CANDIDATES]);

      const chunks = result.rows.map(row => ({
        chunkId: row.chunk_id,
        path: row.path,
        offset: row.offset,
        tokenCount: row.token_count,
        type: row.type,
        language: row.language,
        createdAt: row.created_at,
        similarityScore: row.similarity_score,
        isHotPath: hotPaths.some(hotPath => row.path.includes(hotPath))
      }));

      // Filter by minimum relevance score
      const relevantChunks = chunks.filter(chunk => 
        chunk.similarityScore >= CONTEXT_CONFIG.MIN_RELEVANCE_SCORE
      );

      // Sort by relevance and recency
      return this.sortChunksByPriority(relevantChunks);
    } catch (error) {
      console.error('Error getting relevant chunks:', error);
      return [];
    }
  }

  /**
   * Get hot window chunks (currently open/edited files)
   */
  async getHotWindowChunks(projectId, hotPaths) {
    if (!hotPaths || hotPaths.length === 0) {
      return [];
    }

    try {
      const pathConditions = hotPaths.map((_, index) => `c.path LIKE $${index + 2}`).join(' OR ');
      
      const result = await this.db.query(`
        SELECT 
          c.chunk_id,
          c.path,
          c.offset,
          c.token_count,
          c.type,
          c.language,
          c.created_at
        FROM chunks c
        WHERE c.project_id = $1
        AND (${pathConditions})
        AND c.type != 'binary'
        ORDER BY c.created_at DESC
        LIMIT $${hotPaths.length + 2}
      `, [projectId, ...hotPaths, CONTEXT_CONFIG.HOT_WINDOW_SIZE]);

      return result.rows.map(row => ({
        chunkId: row.chunk_id,
        path: row.path,
        offset: row.offset,
        tokenCount: row.token_count,
        type: row.type,
        language: row.language,
        createdAt: row.created_at,
        isHotPath: true,
        priority: 'high'
      }));
    } catch (error) {
      console.error('Error getting hot window chunks:', error);
      return [];
    }
  }

  /**
   * Get recent conversation chunks
   */
  async getConversationChunks(projectId, maxMessages = 10) {
    try {
      const result = await this.db.query(`
        SELECT 
          c.chunk_id,
          c.path,
          c.offset,
          c.token_count,
          c.type,
          c.created_at
        FROM chunks c
        WHERE c.project_id = $1
        AND c.type = 'conversation'
        ORDER BY c.created_at DESC
        LIMIT $2
      `, [projectId, maxMessages]);

      return result.rows.map(row => ({
        chunkId: row.chunk_id,
        path: row.path,
        offset: row.offset,
        tokenCount: row.token_count,
        type: row.type,
        createdAt: row.created_at,
        priority: 'conversation'
      }));
    } catch (error) {
      console.error('Error getting conversation chunks:', error);
      return [];
    }
  }

  /**
   * Get project summary
   */
  async getProjectSummary(projectId) {
    try {
      const result = await this.db.query(`
        SELECT 
          summary_id,
          content,
          token_count,
          created_at
        FROM summaries
        WHERE project_id = $1
        AND level = 'project'
        ORDER BY created_at DESC
        LIMIT 1
      `, [projectId]);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          summaryId: row.summary_id,
          content: row.content,
          tokenCount: row.token_count,
          createdAt: row.created_at,
          type: 'project_summary',
          priority: 'summary'
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting project summary:', error);
      return null;
    }
  }

  /**
   * Assemble context pieces within token budget
   */
  async assembleContextPieces(
    relevantChunks,
    hotWindowChunks,
    conversationChunks,
    projectSummary,
    budget,
    model
  ) {
    const selectedPieces = [];
    let tokensUsed = 0;

    // Priority order: hot window > relevant chunks > conversation > summaries
    const allChunks = [
      ...hotWindowChunks,
      ...relevantChunks.filter(chunk => !chunk.isHotPath),
      ...conversationChunks
    ];

    // Add chunks until budget is reached
    for (const chunk of allChunks) {
      const chunkContent = await this.getChunkContent(chunk.chunkId);
      if (!chunkContent) continue;

      const piece = {
        chunkId: chunk.chunkId,
        type: chunk.type,
        path: chunk.path,
        offset: chunk.offset,
        tokenCount: chunk.tokenCount,
        text: chunkContent,
        priority: chunk.priority || 'normal',
        similarityScore: chunk.similarityScore,
        sourcePath: chunk.path
      };

      if (tokensUsed + piece.tokenCount <= budget) {
        selectedPieces.push(piece);
        tokensUsed += piece.tokenCount;
      } else {
        break;
      }
    }

    // Add project summary if we have remaining budget
    if (projectSummary && tokensUsed + projectSummary.tokenCount <= budget) {
      selectedPieces.push({
        summaryId: projectSummary.summaryId,
        type: 'project_summary',
        path: 'project',
        tokenCount: projectSummary.tokenCount,
        text: projectSummary.content,
        priority: 'summary',
        sourcePath: 'project'
      });
      tokensUsed += projectSummary.tokenCount;
    }

    // If we still have budget, add file summaries
    if (tokensUsed < budget * 0.8) { // Leave 20% buffer
      const fileSummaries = await this.getFileSummaries(
        relevantChunks.map(c => c.path),
        budget - tokensUsed
      );

      for (const summary of fileSummaries) {
        if (tokensUsed + summary.tokenCount <= budget) {
          selectedPieces.push({
            summaryId: summary.summaryId,
            type: 'file_summary',
            path: summary.path,
            tokenCount: summary.tokenCount,
            text: summary.content,
            priority: 'summary',
            sourcePath: summary.path
          });
          tokensUsed += summary.tokenCount;
        } else {
          break;
        }
      }
    }

    return selectedPieces;
  }

  /**
   * Get file summaries for remaining budget
   */
  async getFileSummaries(filePaths, remainingBudget) {
    if (!filePaths || filePaths.length === 0) {
      return [];
    }

    try {
      const pathConditions = filePaths.map((_, index) => `path = $${index + 1}`).join(' OR ');
      
      const result = await this.db.query(`
        SELECT 
          summary_id,
          path,
          content,
          token_count
        FROM summaries
        WHERE (${pathConditions})
        AND level = 'file'
        ORDER BY created_at DESC
      `, filePaths);

      return result.rows
        .filter(row => row.token_count <= remainingBudget)
        .slice(0, 5); // Limit to 5 file summaries
    } catch (error) {
      console.error('Error getting file summaries:', error);
      return [];
    }
  }

  /**
   * Generate assembled context with proper formatting
   */
  generateAssembledContext(contextPieces, prompt) {
    const systemPrompt = `You are Winky A1, a full-stack AI developer. Always include provenance and cite chunkIds for all factual claims. If you are unsure, state uncertainty and list the top-3 chunks that informed your answer.`;

    let assembledContext = `---SYSTEM---\n${systemPrompt}\n\n`;

    // Add project summary if available
    const projectSummary = contextPieces.find(piece => piece.type === 'project_summary');
    if (projectSummary) {
      assembledContext += `---PROJECT_SUMMARY---\n${projectSummary.text}\n\n`;
    }

    // Add relevant snippets
    const codeChunks = contextPieces.filter(piece => 
      piece.type === 'code' || piece.type === 'conversation'
    );

    if (codeChunks.length > 0) {
      assembledContext += `---RELEVANT_SNIPPETS---\n`;
      
      for (const chunk of codeChunks) {
        assembledContext += `${chunk.text}\n`;
        assembledContext += `[---source: ${chunk.chunkId}, ${chunk.sourcePath}]\n\n`;
      }
    }

    // Add file summaries
    const fileSummaries = contextPieces.filter(piece => piece.type === 'file_summary');
    if (fileSummaries.length > 0) {
      assembledContext += `---FILE_SUMMARIES---\n`;
      
      for (const summary of fileSummaries) {
        assembledContext += `${summary.text}\n`;
        assembledContext += `[---source: ${summary.summaryId}, ${summary.sourcePath}]\n\n`;
      }
    }

    // Add conversation history
    const conversationChunks = contextPieces.filter(piece => piece.type === 'conversation');
    if (conversationChunks.length > 0) {
      assembledContext += `---USER_CONVERSATION---\n`;
      
      for (const chunk of conversationChunks) {
        assembledContext += `${chunk.text}\n`;
      }
      assembledContext += `\n`;
    }

    // Add current instruction
    assembledContext += `---USER_INSTRUCTION---\n"${prompt}"\n\n`;
    assembledContext += `---RESPONSE_FORMAT---\nReturn JSON with files[] or diff[], and include sources: [chunkId,...] for each factual claim.`;

    return assembledContext;
  }

  /**
   * Sort chunks by priority and relevance
   */
  sortChunksByPriority(chunks) {
    return chunks.sort((a, b) => {
      // Priority order: hot path > high similarity > recent > path
      if (a.isHotPath && !b.isHotPath) return -1;
      if (!a.isHotPath && b.isHotPath) return 1;
      
      if (a.similarityScore !== b.similarityScore) {
        return b.similarityScore - a.similarityScore;
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * Get chunk content from S3
   */
  async getChunkContent(chunkId) {
    try {
      const result = await this.db.query(
        'SELECT s3_key FROM chunks WHERE chunk_id = $1',
        [chunkId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const s3Key = result.rows[0].s3_key;
      
      // Get from cache first
      const cached = await this.redis.get(`chunk:${chunkId}`);
      if (cached) {
        return cached;
      }
      
      // Retrieve from S3
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      
      const response = await s3.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key
      }));
      
      const content = await response.Body.transformToString();
      
      // Cache the content
      await this.redis.setex(`chunk:${chunkId}`, CONTEXT_CONFIG.CACHE_TTL, content);
      
      return content;
    } catch (error) {
      console.error('Error getting chunk content:', error);
      return null;
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text) {
    try {
      const embedding = await this.embeddings.embedQuery(text);
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

  /**
   * Cache management
   */
  generateCacheKey(projectId, prompt, budget, hotPaths) {
    const keyData = {
      projectId,
      prompt: prompt.substring(0, 100), // Truncate for cache key
      budget,
      hotPaths: hotPaths.sort()
    };
    
    return `context:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  async getCachedContext(cacheKey) {
    try {
      const cached = await this.redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached context:', error);
      return null;
    }
  }

  async cacheContext(cacheKey, context) {
    try {
      await this.redis.setex(cacheKey, CONTEXT_CONFIG.CACHE_TTL, JSON.stringify(context));
    } catch (error) {
      console.error('Error caching context:', error);
    }
  }

  /**
   * Log context session for audit
   */
  async logContextSession(sessionId, projectId, contextPieces, prompt, model) {
    try {
      await this.db.query(`
        INSERT INTO context_sessions (
          session_id, project_id, created_at, chunks_used, 
          tokens_at_call, model, result_meta
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        sessionId,
        projectId,
        new Date(),
        JSON.stringify(contextPieces.map(p => ({
          chunkId: p.chunkId,
          path: p.path,
          tokenCount: p.tokenCount,
          priority: p.priority
        }))),
        contextPieces.reduce((sum, piece) => sum + piece.tokenCount, 0),
        model,
        JSON.stringify({
          promptLength: prompt.length,
          totalPieces: contextPieces.length,
          assemblyTime: Date.now()
        })
      ]);
    } catch (error) {
      console.error('Error logging context session:', error);
    }
  }

  /**
   * Get context assembly statistics
   */
  async getContextStats(projectId) {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_sessions,
          AVG(tokens_at_call) as avg_tokens_per_session,
          MAX(tokens_at_call) as max_tokens_per_session,
          MIN(created_at) as first_session,
          MAX(created_at) as last_session
        FROM context_sessions
        WHERE project_id = $1
      `, [projectId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error getting context stats:', error);
      return null;
    }
  }

  /**
   * Clear cache for a project
   */
  async clearProjectCache(projectId) {
    try {
      const keys = await this.redis.keys(`context:*`);
      const projectKeys = keys.filter(key => {
        try {
          const data = JSON.parse(Buffer.from(key.split(':')[1], 'base64').toString());
          return data.projectId === projectId;
        } catch {
          return false;
        }
      });
      
      if (projectKeys.length > 0) {
        await this.redis.del(...projectKeys);
      }
    } catch (error) {
      console.error('Error clearing project cache:', error);
    }
  }
}

/**
 * Token Counter Utility
 */
class TokenCounter {
  async countTokens(text, model = 'gpt-4') {
    try {
      // Use tiktoken for accurate token counting
      const { encoding_for_model } = await import('tiktoken');
      const encoding = encoding_for_model(model);
      return encoding.encode(text).length;
    } catch (error) {
      // Fallback to simple word-based counting
      return text.split(/\s+/).length;
    }
  }
}

export default ContextAssemblerService;