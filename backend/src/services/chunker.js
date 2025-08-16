/**
 * Chunking Service for 500k Token Context System
 * 
 * Breaks project artifacts into fixed-size content chunks with overlap
 * Handles tokenization, fingerprinting, and deduplication
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { GoogleGenerativeAIEmbeddings } from '@google/generative-ai';

// Configuration
const CHUNK_CONFIG = {
  MAX_TOKENS: 8000,
  OVERLAP_TOKENS: 256,
  MIN_CHUNK_TOKENS: 1000,
  BINARY_FILE_SIZE_LIMIT: 1024 * 1024, // 1MB
  SUPPORTED_LANGUAGES: [
    'javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'cpp', 'c', 'go', 'rust',
    'php', 'ruby', 'swift', 'kotlin', 'scala', 'csharp', 'html', 'css', 'scss', 'sass',
    'json', 'yaml', 'toml', 'xml', 'markdown', 'md', 'txt', 'sql', 'sh', 'bash', 'zsh'
  ]
};

class ChunkingService {
  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    // Initialize embeddings based on configuration
    this.embeddings = this.initializeEmbeddings();
    
    // Tokenizer cache
    this.tokenizerCache = new Map();
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
   * Main chunking pipeline for files
   */
  async processFile(projectId, filePath, content, options = {}) {
    try {
      // Validate input
      if (!projectId || !filePath || !content) {
        throw new Error('Missing required parameters: projectId, filePath, content');
      }

      // Check if file is binary or too large
      if (this.isBinaryFile(content) || content.length > CHUNK_CONFIG.BINARY_FILE_SIZE_LIMIT) {
        return this.processBinaryFile(projectId, filePath, content);
      }

      // Normalize content
      const normalizedContent = this.normalizeContent(content);
      
      // Detect language
      const language = this.detectLanguage(filePath);
      
      // Tokenize content
      const tokens = await this.tokenize(normalizedContent, options.model || 'gpt-4');
      
      // Create chunks
      const chunks = this.createChunks(tokens, filePath, language);
      
      // Process each chunk
      const processedChunks = [];
      for (const chunk of chunks) {
        const processedChunk = await this.processChunk(projectId, chunk);
        processedChunks.push(processedChunk);
      }

      // Generate summaries
      const summaries = await this.generateSummaries(projectId, filePath, processedChunks);

      return {
        chunks: processedChunks,
        summaries,
        totalTokens: tokens.length,
        language,
        filePath
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  /**
   * Process binary files (store metadata only)
   */
  async processBinaryFile(projectId, filePath, content) {
    const chunkId = uuidv4();
    const metadata = {
      chunkId,
      projectId,
      path: filePath,
      offset: 0,
      tokenCount: 0,
      sha256: crypto.createHash('sha256').update(content).digest('hex'),
      type: 'binary',
      size: content.length,
      mimeType: this.detectMimeType(filePath),
      createdAt: new Date()
    };

    // Store metadata in database
    await this.storeChunkMetadata(metadata);
    
    // Store file in S3 (for potential future use)
    await this.storeChunkContent(chunkId, content);

    return {
      chunks: [metadata],
      summaries: [],
      totalTokens: 0,
      language: 'binary',
      filePath
    };
  }

  /**
   * Normalize file content
   */
  normalizeContent(content) {
    return content
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Handle old Mac line endings
      .replace(/[ \t]+$/gm, '') // Strip trailing whitespace (safe)
      .trim();
  }

  /**
   * Detect file language
   */
  detectLanguage(filePath) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    const languageMap = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'cs': 'csharp',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'xml': 'xml',
      'md': 'markdown',
      'txt': 'text',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'zsh'
    };

    return languageMap[extension] || 'text';
  }

  /**
   * Detect if file is binary
   */
  isBinaryFile(content) {
    // Check for null bytes or high percentage of non-printable characters
    const nullBytes = (content.match(/\0/g) || []).length;
    const nonPrintable = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
    const totalBytes = content.length;
    
    return nullBytes > 0 || (nonPrintable / totalBytes) > 0.1;
  }

  /**
   * Detect MIME type
   */
  detectMimeType(filePath) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    const mimeMap = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'tar': 'application/x-tar',
      'gz': 'application/gzip',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav'
    };

    return mimeMap[extension] || 'application/octet-stream';
  }

  /**
   * Tokenize content using model-specific tokenizer
   */
  async tokenize(content, model) {
    // Use tiktoken for OpenAI models
    if (model.startsWith('gpt-')) {
      return this.tokenizeWithTiktoken(content, model);
    }
    
    // Use tiktoken for Claude models
    if (model.startsWith('claude-')) {
      return this.tokenizeWithTiktoken(content, 'claude-3-sonnet-20240229');
    }
    
    // Use tiktoken for Gemini models
    if (model.startsWith('gemini-')) {
      return this.tokenizeWithTiktoken(content, 'gemini-1.5-pro');
    }
    
    // Fallback to simple word-based tokenization
    return this.tokenizeSimple(content);
  }

  /**
   * Tokenize using tiktoken
   */
  async tokenizeWithTiktoken(content, model) {
    try {
      // Import tiktoken dynamically
      const { encoding_for_model } = await import('tiktoken');
      const encoding = encoding_for_model(model);
      return encoding.encode(content);
    } catch (error) {
      console.warn('Tiktoken not available, falling back to simple tokenization');
      return this.tokenizeSimple(content);
    }
  }

  /**
   * Simple word-based tokenization (fallback)
   */
  tokenizeSimple(content) {
    // Simple tokenization: split on whitespace and punctuation
    return content
      .split(/\s+/)
      .flatMap(word => {
        // Split on common punctuation
        return word.split(/([.,!?;:()[\]{}"'`~@#$%^&*+=|\\/<>])/);
      })
      .filter(token => token.length > 0)
      .map(token => token.toLowerCase());
  }

  /**
   * Create chunks from tokens
   */
  createChunks(tokens, filePath, language) {
    const chunks = [];
    let offset = 0;
    
    while (offset < tokens.length) {
      const chunkTokens = tokens.slice(offset, offset + CHUNK_CONFIG.MAX_TOKENS);
      const chunkText = this.tokensToText(chunkTokens, language);
      
      // Skip chunks that are too small
      if (chunkTokens.length < CHUNK_CONFIG.MIN_CHUNK_TOKENS) {
        break;
      }
      
      chunks.push({
        text: chunkText,
        tokenCount: chunkTokens.length,
        offset,
        filePath,
        language
      });
      
      // Move offset with overlap
      offset += CHUNK_CONFIG.MAX_TOKENS - CHUNK_CONFIG.OVERLAP_TOKENS;
      
      // Ensure we don't go backwards
      if (offset >= tokens.length) break;
    }
    
    return chunks;
  }

  /**
   * Convert tokens back to text
   */
  tokensToText(tokens, language) {
    if (Array.isArray(tokens)) {
      // For tiktoken tokens (numbers), we need to decode
      try {
        const { encoding_for_model } = require('tiktoken');
        const encoding = encoding_for_model('gpt-4');
        return encoding.decode(tokens);
      } catch (error) {
        // Fallback: join tokens as strings
        return tokens.join(' ');
      }
    }
    
    // For simple tokenization, just join
    return tokens.join(' ');
  }

  /**
   * Process individual chunk
   */
  async processChunk(projectId, chunk) {
    const chunkId = uuidv4();
    const sha256 = crypto.createHash('sha256').update(chunk.text).digest('hex');
    
    // Check for duplicates
    const existingChunk = await this.findDuplicateChunk(sha256);
    if (existingChunk) {
      return existingChunk;
    }
    
    // Generate embedding
    const embedding = await this.generateEmbedding(chunk.text);
    
    // Create chunk metadata
    const metadata = {
      chunkId,
      projectId,
      path: chunk.filePath,
      offset: chunk.offset,
      tokenCount: chunk.tokenCount,
      sha256,
      type: 'code',
      language: chunk.language,
      createdAt: new Date()
    };
    
    // Store chunk
    await this.storeChunkMetadata(metadata);
    await this.storeChunkContent(chunkId, chunk.text);
    await this.storeChunkEmbedding(chunkId, embedding);
    
    return {
      ...metadata,
      text: chunk.text,
      embedding
    };
  }

  /**
   * Find duplicate chunk by SHA256
   */
  async findDuplicateChunk(sha256) {
    const result = await this.db.query(
      'SELECT * FROM chunks WHERE sha256 = $1 LIMIT 1',
      [sha256]
    );
    
    if (result.rows.length > 0) {
      const chunk = result.rows[0];
      // Retrieve content from S3
      const content = await this.retrieveChunkContent(chunk.chunk_id);
      return {
        ...chunk,
        text: content
      };
    }
    
    return null;
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
   * Store chunk metadata in database
   */
  async storeChunkMetadata(metadata) {
    await this.db.query(`
      INSERT INTO chunks (
        chunk_id, project_id, path, offset, token_count, 
        sha256, type, language, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (chunk_id) DO NOTHING
    `, [
      metadata.chunkId,
      metadata.projectId,
      metadata.path,
      metadata.offset,
      metadata.tokenCount,
      metadata.sha256,
      metadata.type,
      metadata.language,
      metadata.createdAt
    ]);
  }

  /**
   * Store chunk content in S3
   */
  async storeChunkContent(chunkId, content) {
    const key = `chunks/${chunkId}.txt`;
    
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: content,
      ContentType: 'text/plain'
    }));
    
    // Update database with S3 key
    await this.db.query(
      'UPDATE chunks SET s3_key = $1 WHERE chunk_id = $2',
      [key, chunkId]
    );
  }

  /**
   * Store chunk embedding in vector database
   */
  async storeChunkEmbedding(chunkId, embedding) {
    // Store in PostgreSQL with pgvector extension
    await this.db.query(`
      INSERT INTO chunk_embeddings (chunk_id, embedding_vector)
      VALUES ($1, $2)
      ON CONFLICT (chunk_id) DO UPDATE SET
        embedding_vector = $2,
        updated_at = NOW()
    `, [chunkId, embedding]);
  }

  /**
   * Retrieve chunk content from S3
   */
  async retrieveChunkContent(chunkId) {
    try {
      const result = await this.db.query(
        'SELECT s3_key FROM chunks WHERE chunk_id = $1',
        [chunkId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Chunk not found');
      }
      
      const s3Key = result.rows[0].s3_key;
      
      // Retrieve from S3
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const response = await this.s3.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key
      }));
      
      return await response.Body.transformToString();
    } catch (error) {
      console.error('Error retrieving chunk content:', error);
      throw error;
    }
  }

  /**
   * Generate summaries for chunks
   */
  async generateSummaries(projectId, filePath, chunks) {
    const summaries = [];
    
    // Generate chunk-level summaries
    for (const chunk of chunks) {
      const summary = await this.generateChunkSummary(chunk);
      summaries.push(summary);
    }
    
    // Generate file-level summary
    const fileSummary = await this.generateFileSummary(filePath, chunks);
    summaries.push(fileSummary);
    
    return summaries;
  }

  /**
   * Generate summary for a single chunk
   */
  async generateChunkSummary(chunk) {
    const summaryId = uuidv4();
    const summaryText = await this.summarizeText(chunk.text, 'chunk');
    const embedding = await this.generateEmbedding(summaryText);
    
    const summary = {
      summaryId,
      projectId: chunk.projectId,
      path: chunk.path,
      level: 'chunk',
      content: summaryText,
      tokenCount: await this.countTokens(summaryText),
      embedding,
      createdAt: new Date()
    };
    
    await this.storeSummary(summary);
    return summary;
  }

  /**
   * Generate file-level summary
   */
  async generateFileSummary(filePath, chunks) {
    const summaryId = uuidv4();
    const allText = chunks.map(c => c.text).join('\n\n');
    const summaryText = await this.summarizeText(allText, 'file');
    const embedding = await this.generateEmbedding(summaryText);
    
    const summary = {
      summaryId,
      projectId: chunks[0].projectId,
      path: filePath,
      level: 'file',
      content: summaryText,
      tokenCount: await this.countTokens(summaryText),
      embedding,
      createdAt: new Date()
    };
    
    await this.storeSummary(summary);
    return summary;
  }

  /**
   * Summarize text using AI
   */
  async summarizeText(text, level) {
    try {
      // Use a simple summarization prompt
      const prompt = `Summarize the following ${level} in 1-2 sentences:\n\n${text}`;
      
      // For now, use a simple extraction-based summary
      // In production, this would call an AI model
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const summary = sentences.slice(0, 2).join('. ') + '.';
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return `Summary of ${level} content.`;
    }
  }

  /**
   * Store summary in database
   */
  async storeSummary(summary) {
    await this.db.query(`
      INSERT INTO summaries (
        summary_id, project_id, path, level, content, 
        token_count, embedding_vector, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (summary_id) DO NOTHING
    `, [
      summary.summaryId,
      summary.projectId,
      summary.path,
      summary.level,
      summary.content,
      summary.tokenCount,
      summary.embedding,
      summary.createdAt
    ]);
  }

  /**
   * Count tokens in text
   */
  async countTokens(text, model = 'gpt-4') {
    const tokens = await this.tokenize(text, model);
    return tokens.length;
  }

  /**
   * Process conversation messages
   */
  async processConversation(projectId, messages) {
    const chunks = [];
    
    for (const message of messages) {
      const chunk = await this.processChunk(projectId, {
        text: message.content,
        tokenCount: await this.countTokens(message.content),
        offset: 0,
        filePath: 'conversation',
        language: 'text'
      });
      
      chunk.type = 'conversation';
      chunk.userId = message.userId;
      chunk.timestamp = message.timestamp;
      
      chunks.push(chunk);
    }
    
    return chunks;
  }

  /**
   * Process log files
   */
  async processLogs(projectId, logs) {
    const chunks = [];
    
    for (const log of logs) {
      const chunk = await this.processChunk(projectId, {
        text: log.message,
        tokenCount: await this.countTokens(log.message),
        offset: 0,
        filePath: 'logs',
        language: 'text'
      });
      
      chunk.type = 'log';
      chunk.severity = log.severity;
      chunk.timestamp = log.timestamp;
      
      chunks.push(chunk);
    }
    
    return chunks;
  }

  /**
   * Get chunk statistics
   */
  async getChunkStats(projectId) {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_chunks,
        SUM(token_count) as total_tokens,
        COUNT(DISTINCT path) as unique_files,
        AVG(token_count) as avg_chunk_size
      FROM chunks 
      WHERE project_id = $1
    `, [projectId]);
    
    return result.rows[0];
  }

  /**
   * Delete chunks for a project
   */
  async deleteProjectChunks(projectId) {
    // Get all chunk IDs
    const result = await this.db.query(
      'SELECT chunk_id, s3_key FROM chunks WHERE project_id = $1',
      [projectId]
    );
    
    // Delete from S3
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    for (const chunk of result.rows) {
      if (chunk.s3_key) {
        try {
          await this.s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: chunk.s3_key
          }));
        } catch (error) {
          console.warn('Error deleting chunk from S3:', error);
        }
      }
    }
    
    // Delete from database
    await this.db.query('DELETE FROM chunks WHERE project_id = $1', [projectId]);
    await this.db.query('DELETE FROM summaries WHERE project_id = $1', [projectId]);
  }
}

export default ChunkingService;