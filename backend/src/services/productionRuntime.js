/**
 * Production Backend Runtime Service
 * 
 * Own infrastructure implementation for Winky-Coder
 * Replaces Firebase dependency with our own scalable backend
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Docker from 'dockerode';
import Redis from 'ioredis';
import crypto from 'crypto';
import { promisify } from 'util';

// Production configuration
const PRODUCTION_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  JWT_EXPIRES_IN: '24h',
  BCRYPT_ROUNDS: 12,
  FUNCTION_MEMORY_LIMIT: 512 * 1024 * 1024, // 512MB
  FUNCTION_TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 1000
};

class ProductionRuntimeService {
  constructor() {
    this.initializeServices();
    this.setupErrorHandling();
    this.setupMetrics();
  }

  async initializeServices() {
    try {
      // Initialize database connection
      this.db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      });

      // Initialize S3 client
      this.s3 = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      // Initialize Redis for caching and events
      this.redis = new Redis(process.env.REDIS_URL, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3
      });

      // Initialize Docker for function execution
      this.docker = new Docker({
        socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
      });

      // Initialize database schema
      await this.initializeDatabase();

      console.log('✅ Production runtime services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize production runtime:', error);
      throw error;
    }
  }

  setupErrorHandling() {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.metrics.increment('runtime.errors.unhandled_rejection');
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.metrics.increment('runtime.errors.uncaught_exception');
      process.exit(1);
    });
  }

  setupMetrics() {
    this.metrics = {
      increment: (key) => {
        // TODO: Implement metrics collection (Prometheus, DataDog, etc.)
        console.log(`📊 Metric: ${key}`);
      },
      timing: (key, duration) => {
        console.log(`⏱️ Timing: ${key} = ${duration}ms`);
      },
      gauge: (key, value) => {
        console.log(`📈 Gauge: ${key} = ${value}`);
      }
    };
  }

  // ============================================================================
  // AUTHENTICATION SERVICE
  // ============================================================================

  async authenticateUser(email, password) {
    const startTime = Date.now();
    
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE email = $1 AND active = true',
        [email]
      );

      if (result.rows.length === 0) {
        this.metrics.increment('auth.login.failed.user_not_found');
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        this.metrics.increment('auth.login.failed.invalid_password');
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        PRODUCTION_CONFIG.JWT_SECRET,
        { expiresIn: PRODUCTION_CONFIG.JWT_EXPIRES_IN }
      );

      // Log successful login
      await this.auditLog('auth.login.success', {
        userId: user.id,
        email: user.email,
        ip: 'TODO: Extract from request'
      });

      this.metrics.increment('auth.login.success');
      this.metrics.timing('auth.login.duration', Date.now() - startTime);

      return { 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }, 
        token 
      };
    } catch (error) {
      this.metrics.increment('auth.login.error');
      throw error;
    }
  }

  async createUser(email, password, name, role = 'user') {
    const startTime = Date.now();
    
    try {
      // Check if user already exists
      const existingUser = await this.db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, PRODUCTION_CONFIG.BCRYPT_ROUNDS);
      
      // Create user
      const result = await this.db.query(
        `INSERT INTO users (email, password_hash, name, role, permissions, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [email, hashedPassword, name, role, JSON.stringify(['read', 'write'])]
      );

      const user = result.rows[0];
      
      // Generate token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        PRODUCTION_CONFIG.JWT_SECRET,
        { expiresIn: PRODUCTION_CONFIG.JWT_EXPIRES_IN }
      );

      // Audit log
      await this.auditLog('auth.user.created', {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      this.metrics.increment('auth.user.created');
      this.metrics.timing('auth.user.creation.duration', Date.now() - startTime);

      return { 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }, 
        token 
      };
    } catch (error) {
      this.metrics.increment('auth.user.creation.error');
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, PRODUCTION_CONFIG.JWT_SECRET);
      
      // Check if user still exists and is active
      const result = await this.db.query(
        'SELECT id, email, role, permissions FROM users WHERE id = $1 AND active = true',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found or inactive');
      }

      return result.rows[0];
    } catch (error) {
      this.metrics.increment('auth.token.verification.failed');
      throw error;
    }
  }

  // ============================================================================
  // DOCUMENT STORE (FIRESTORE-LIKE)
  // ============================================================================

  async createDocument(collection, data, userId, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate data size
      const dataSize = JSON.stringify(data).length;
      if (dataSize > 1024 * 1024) { // 1MB limit
        throw new Error('Document data too large');
      }

      // Apply rules
      const rulesResult = await this.evaluateRules(collection, 'create', data, userId);
      if (!rulesResult.allowed) {
        throw new Error(`Access denied: ${rulesResult.reason}`);
      }

      // Create document
      const result = await this.db.query(
        `INSERT INTO documents (collection_name, data, user_id, created_at, updated_at, metadata) 
         VALUES ($1, $2, $3, NOW(), NOW(), $4) RETURNING *`,
        [collection, JSON.stringify(data), userId, JSON.stringify(options.metadata || {})]
      );

      const document = result.rows[0];

      // Trigger events
      await this.triggerEvent('document.created', {
        collection,
        documentId: document.id,
        userId,
        data
      });

      // Audit log
      await this.auditLog('document.created', {
        userId,
        collection,
        documentId: document.id,
        dataSize
      });

      this.metrics.increment('document.created');
      this.metrics.timing('document.creation.duration', Date.now() - startTime);

      return document;
    } catch (error) {
      this.metrics.increment('document.creation.error');
      throw error;
    }
  }

  async getDocument(collection, documentId, userId) {
    const startTime = Date.now();
    
    try {
      const result = await this.db.query(
        `SELECT * FROM documents 
         WHERE collection_name = $1 AND id = $2`,
        [collection, documentId]
      );

      if (result.rows.length === 0) {
        throw new Error('Document not found');
      }

      const document = result.rows[0];

      // Apply rules
      const rulesResult = await this.evaluateRules(collection, 'read', document.data, userId, document);
      if (!rulesResult.allowed) {
        throw new Error(`Access denied: ${rulesResult.reason}`);
      }

      this.metrics.increment('document.read');
      this.metrics.timing('document.read.duration', Date.now() - startTime);

      return document;
    } catch (error) {
      this.metrics.increment('document.read.error');
      throw error;
    }
  }

  async updateDocument(collection, documentId, data, userId, options = {}) {
    const startTime = Date.now();
    
    try {
      // Get existing document
      const existingDoc = await this.getDocument(collection, documentId, userId);
      
      // Apply rules for update
      const rulesResult = await this.evaluateRules(collection, 'update', data, userId, existingDoc);
      if (!rulesResult.allowed) {
        throw new Error(`Access denied: ${rulesResult.reason}`);
      }

      // Update document
      const result = await this.db.query(
        `UPDATE documents 
         SET data = $1, updated_at = NOW(), metadata = $2
         WHERE collection_name = $3 AND id = $4 
         RETURNING *`,
        [JSON.stringify(data), JSON.stringify(options.metadata || {}), collection, documentId]
      );

      const document = result.rows[0];

      // Trigger events
      await this.triggerEvent('document.updated', {
        collection,
        documentId,
        userId,
        data,
        previousData: existingDoc.data
      });

      // Audit log
      await this.auditLog('document.updated', {
        userId,
        collection,
        documentId,
        dataSize: JSON.stringify(data).length
      });

      this.metrics.increment('document.updated');
      this.metrics.timing('document.update.duration', Date.now() - startTime);

      return document;
    } catch (error) {
      this.metrics.increment('document.update.error');
      throw error;
    }
  }

  async deleteDocument(collection, documentId, userId) {
    const startTime = Date.now();
    
    try {
      // Get existing document
      const existingDoc = await this.getDocument(collection, documentId, userId);
      
      // Apply rules for delete
      const rulesResult = await this.evaluateRules(collection, 'delete', null, userId, existingDoc);
      if (!rulesResult.allowed) {
        throw new Error(`Access denied: ${rulesResult.reason}`);
      }

      // Delete document
      await this.db.query(
        `DELETE FROM documents 
         WHERE collection_name = $1 AND id = $2`,
        [collection, documentId]
      );

      // Trigger events
      await this.triggerEvent('document.deleted', {
        collection,
        documentId,
        userId,
        previousData: existingDoc.data
      });

      // Audit log
      await this.auditLog('document.deleted', {
        userId,
        collection,
        documentId
      });

      this.metrics.increment('document.deleted');
      this.metrics.timing('document.delete.duration', Date.now() - startTime);

      return { success: true };
    } catch (error) {
      this.metrics.increment('document.delete.error');
      throw error;
    }
  }

  async queryDocuments(collection, query = {}, userId, options = {}) {
    const startTime = Date.now();
    
    try {
      let sqlQuery = `SELECT * FROM documents WHERE collection_name = $1`;
      const params = [collection];
      let paramIndex = 2;

      // Add user filter if not admin
      const user = await this.verifyToken(userId);
      if (user.role !== 'admin') {
        sqlQuery += ` AND user_id = $${paramIndex}`;
        params.push(user.id);
        paramIndex++;
      }

      // Add filters
      Object.entries(query.filters || {}).forEach(([key, value]) => {
        sqlQuery += ` AND data->>'${key}' = $${paramIndex}`;
        params.push(value);
        paramIndex++;
      });

      // Add ordering
      if (query.orderBy) {
        sqlQuery += ` ORDER BY data->>'${query.orderBy.field}' ${query.orderBy.direction || 'ASC'}`;
      } else {
        sqlQuery += ' ORDER BY created_at DESC';
      }

      // Add pagination
      if (options.limit) {
        sqlQuery += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        sqlQuery += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }

      const result = await this.db.query(sqlQuery, params);

      this.metrics.increment('document.query');
      this.metrics.timing('document.query.duration', Date.now() - startTime);

      return result.rows;
    } catch (error) {
      this.metrics.increment('document.query.error');
      throw error;
    }
  }

  // ============================================================================
  // STORAGE SERVICE (S3-LIKE)
  // ============================================================================

  async uploadFile(file, userId, path, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate file size
      if (file.size > PRODUCTION_CONFIG.MAX_FILE_SIZE) {
        throw new Error('File too large');
      }

      // Generate unique key
      const key = `users/${userId}/${path}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${file.originalname}`;
      
      // Upload to S3
      await this.s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          userId: userId.toString(),
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      }));

      // Store metadata in database
      const result = await this.db.query(
        `INSERT INTO files (key, user_id, original_name, size, content_type, metadata, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
        [key, userId, file.originalname, file.size, file.mimetype, JSON.stringify(options.metadata || {})]
      );

      const fileRecord = result.rows[0];

      // Trigger events
      await this.triggerEvent('file.uploaded', {
        userId,
        fileId: fileRecord.id,
        key,
        size: file.size,
        contentType: file.mimetype
      });

      // Audit log
      await this.auditLog('file.uploaded', {
        userId,
        fileId: fileRecord.id,
        key,
        size: file.size
      });

      this.metrics.increment('file.uploaded');
      this.metrics.timing('file.upload.duration', Date.now() - startTime);

      return {
        id: fileRecord.id,
        key,
        url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`,
        size: file.size,
        contentType: file.mimetype
      };
    } catch (error) {
      this.metrics.increment('file.upload.error');
      throw error;
    }
  }

  async getSignedUrl(key, expiresIn = 3600, operation = 'getObject') {
    try {
      const command = operation === 'getObject' 
        ? new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
        : new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });

      const signedUrl = await getSignedUrl(this.s3, command, { expiresIn });

      this.metrics.increment('file.signed_url.generated');

      return signedUrl;
    } catch (error) {
      this.metrics.increment('file.signed_url.error');
      throw error;
    }
  }

  async deleteFile(fileId, userId) {
    const startTime = Date.now();
    
    try {
      // Get file record
      const result = await this.db.query(
        'SELECT * FROM files WHERE id = $1 AND user_id = $2',
        [fileId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('File not found');
      }

      const fileRecord = result.rows[0];

      // Delete from S3
      await this.s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileRecord.key
      }));

      // Delete from database
      await this.db.query(
        'DELETE FROM files WHERE id = $1',
        [fileId]
      );

      // Trigger events
      await this.triggerEvent('file.deleted', {
        userId,
        fileId,
        key: fileRecord.key
      });

      // Audit log
      await this.auditLog('file.deleted', {
        userId,
        fileId,
        key: fileRecord.key
      });

      this.metrics.increment('file.deleted');
      this.metrics.timing('file.delete.duration', Date.now() - startTime);

      return { success: true };
    } catch (error) {
      this.metrics.increment('file.delete.error');
      throw error;
    }
  }

  // ============================================================================
  // FUNCTIONS RUNNER (CLOUD FUNCTIONS-LIKE)
  // ============================================================================

  async runFunction(functionCode, trigger, data = {}, options = {}) {
    const startTime = Date.now();
    const functionId = crypto.randomBytes(8).toString('hex');
    
    try {
      // Validate function code
      if (functionCode.length > 1024 * 1024) { // 1MB limit
        throw new Error('Function code too large');
      }

      // Create ephemeral container
      const container = await this.docker.createContainer({
        Image: 'node:18-alpine',
        name: `winky-function-${functionId}`,
        Cmd: ['node', '-e', functionCode],
        Env: [
          ...Object.entries(data).map(([key, value]) => `${key}=${value}`),
          'NODE_ENV=production',
          'FUNCTION_ID=' + functionId
        ],
        HostConfig: {
          Memory: PRODUCTION_CONFIG.FUNCTION_MEMORY_LIMIT,
          MemorySwap: PRODUCTION_CONFIG.FUNCTION_MEMORY_LIMIT,
          NetworkMode: 'none', // No network access by default
          AutoRemove: true,
          SecurityOpt: ['no-new-privileges'],
          CapDrop: ['ALL']
        }
      });

      // Start container with timeout
      await container.start();
      
      const logs = await Promise.race([
        container.logs({ stdout: true, stderr: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function timeout')), PRODUCTION_CONFIG.FUNCTION_TIMEOUT)
        )
      ]);

      await container.remove();

      const executionTime = Date.now() - startTime;

      // Trigger events
      await this.triggerEvent('function.executed', {
        functionId,
        trigger,
        executionTime,
        success: true
      });

      // Audit log
      await this.auditLog('function.executed', {
        functionId,
        trigger,
        executionTime,
        codeSize: functionCode.length
      });

      this.metrics.increment('function.executed');
      this.metrics.timing('function.execution.duration', executionTime);

      return {
        success: true,
        functionId,
        logs: logs.toString(),
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Trigger events
      await this.triggerEvent('function.failed', {
        functionId,
        trigger,
        executionTime,
        error: error.message
      });

      this.metrics.increment('function.failed');
      this.metrics.timing('function.execution.duration', executionTime);

      throw error;
    }
  }

  // ============================================================================
  // RULES ENGINE (FIRESTORE RULES-LIKE)
  // ============================================================================

  async evaluateRules(collection, operation, data, userId, context = {}) {
    try {
      // Get user
      const user = await this.verifyToken(userId);
      
      // Get rules for collection
      const rulesResult = await this.db.query(
        'SELECT rules FROM collection_rules WHERE collection_name = $1 AND active = true',
        [collection]
      );

      if (rulesResult.rows.length === 0) {
        // Default deny if no rules
        return { allowed: false, reason: 'No rules defined for collection' };
      }

      const rules = rulesResult.rows[0].rules;
      
      // Evaluate rules
      const ruleContext = {
        user,
        operation,
        data,
        context,
        timestamp: Date.now()
      };

      const result = await this.evaluateRuleSet(rules, ruleContext);
      
      this.metrics.increment(`rules.evaluated.${operation}`);

      return result;
    } catch (error) {
      this.metrics.increment('rules.evaluation.error');
      throw error;
    }
  }

  async evaluateRuleSet(rules, context) {
    // Simple rule evaluation - can be extended with more sophisticated logic
    if (!rules || rules.length === 0) {
      return { allowed: false, reason: 'No rules defined' };
    }

    for (const rule of rules) {
      if (this.matchesRule(rule, context)) {
        return { allowed: rule.allow, reason: rule.reason || 'Rule matched' };
      }
    }

    return { allowed: false, reason: 'No matching rules' };
  }

  matchesRule(rule, context) {
    // Operation matching
    if (rule.operation && rule.operation !== context.operation) {
      return false;
    }

    // Path matching
    if (rule.path && !context.context?.path?.startsWith(rule.path)) {
      return false;
    }

    // Authentication requirement
    if (rule.authenticated && !context.user) {
      return false;
    }

    // Role-based access
    if (rule.roles && !rule.roles.includes(context.user?.role)) {
      return false;
    }

    // Custom conditions
    if (rule.condition && !this.evaluateCondition(rule.condition, context)) {
      return false;
    }

    return true;
  }

  evaluateCondition(condition, context) {
    // Simple condition evaluation - can be extended
    try {
      // Safe evaluation of conditions
      return eval(`(${condition})`); // TODO: Implement safe expression evaluator
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  // ============================================================================
  // EVENT SYSTEM (FIREBASE TRIGGERS-LIKE)
  // ============================================================================

  async triggerEvent(eventType, data) {
    const startTime = Date.now();
    
    try {
      const event = {
        id: crypto.randomBytes(16).toString('hex'),
        type: eventType,
        data,
        timestamp: Date.now(),
        processed: false
      };

      // Store event in Redis
      await this.redis.lpush('events', JSON.stringify(event));
      
      // Process event asynchronously
      setImmediate(() => this.processEvent(event));

      this.metrics.increment('event.triggered');
      this.metrics.timing('event.trigger.duration', Date.now() - startTime);

      return { success: true, eventId: event.id };
    } catch (error) {
      this.metrics.increment('event.trigger.error');
      throw error;
    }
  }

  async processEvent(event) {
    const startTime = Date.now();
    
    try {
      // Find functions that listen to this event type
      const listeners = await this.getEventListeners(event.type);
      
      for (const listener of listeners) {
        try {
          await this.runFunction(listener.code, 'event', {
            ...event.data,
            eventType: event.type,
            eventId: event.id
          });
        } catch (error) {
          console.error(`Error processing event ${event.id} with listener ${listener.id}:`, error);
          this.metrics.increment('event.processing.error');
        }
      }

      // Mark event as processed
      await this.redis.hset('processed_events', event.id, JSON.stringify({
        ...event,
        processed: true,
        processedAt: Date.now()
      }));

      this.metrics.increment('event.processed');
      this.metrics.timing('event.processing.duration', Date.now() - startTime);
    } catch (error) {
      this.metrics.increment('event.processing.error');
      console.error('Error processing event:', error);
    }
  }

  async getEventListeners(eventType) {
    try {
      const result = await this.db.query(
        'SELECT * FROM function_listeners WHERE event_type = $1 AND active = true',
        [eventType]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // ============================================================================
  // AUDIT LOGGING
  // ============================================================================

  async auditLog(action, data) {
    try {
      await this.db.query(
        `INSERT INTO audit_logs (action, data, created_at) 
         VALUES ($1, $2, NOW())`,
        [action, JSON.stringify(data)]
      );
    } catch (error) {
      console.error('Error writing audit log:', error);
      // Don't throw - audit logging should not break main functionality
    }
  }

  // ============================================================================
  // DATABASE INITIALIZATION
  // ============================================================================

  async initializeDatabase() {
    try {
      // Users table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          permissions JSONB DEFAULT '[]',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Documents table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          collection_name VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          user_id INTEGER REFERENCES users(id),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Files table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS files (
          id SERIAL PRIMARY KEY,
          key VARCHAR(500) NOT NULL UNIQUE,
          user_id INTEGER REFERENCES users(id),
          original_name VARCHAR(255) NOT NULL,
          size BIGINT NOT NULL,
          content_type VARCHAR(100),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Function listeners table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS function_listeners (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(255) NOT NULL,
          code TEXT NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Collection rules table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS collection_rules (
          id SERIAL PRIMARY KEY,
          collection_name VARCHAR(255) NOT NULL UNIQUE,
          rules JSONB NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Audit logs table
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          action VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create indexes
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_documents_collection_user 
        ON documents(collection_name, user_id)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_documents_data_gin 
        ON documents USING GIN (data)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_files_user 
        ON files(user_id)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
        ON audit_logs(action)
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
        ON audit_logs(created_at)
      `);

      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database schema:', error);
      throw error;
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck() {
    const checks = {
      database: false,
      redis: false,
      s3: false,
      docker: false
    };

    try {
      // Database check
      await this.db.query('SELECT 1');
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    try {
      // Redis check
      await this.redis.ping();
      checks.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    try {
      // S3 check
      await this.s3.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: 'health-check'
      }));
      checks.s3 = true;
    } catch (error) {
      // S3 check might fail if health-check file doesn't exist, which is OK
      if (error.name === 'NoSuchKey') {
        checks.s3 = true;
      } else {
        console.error('S3 health check failed:', error);
      }
    }

    try {
      // Docker check
      await this.docker.ping();
      checks.docker = true;
    } catch (error) {
      console.error('Docker health check failed:', error);
    }

    const allHealthy = Object.values(checks).every(check => check);

    return {
      healthy: allHealthy,
      checks,
      timestamp: new Date().toISOString()
    };
  }
}

export default ProductionRuntimeService;