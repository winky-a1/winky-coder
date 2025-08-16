import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Docker from 'dockerode';
import Redis from 'ioredis';

// Our own backend runtime service
class OwnRuntimeService {
  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/winky_coder',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.docker = new Docker();
  }

  // Authentication Service
  async authenticateUser(email, password) {
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  async createUser(email, password, name) {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await this.db.query(
        'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [email, hashedPassword, name]
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  // Document Store (Firestore-like)
  async createDocument(collection, data, userId) {
    try {
      const result = await this.db.query(
        `INSERT INTO documents (collection_name, data, user_id, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [collection, JSON.stringify(data), userId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getDocument(collection, documentId, userId) {
    try {
      const result = await this.db.query(
        `SELECT * FROM documents 
         WHERE collection_name = $1 AND id = $2 AND user_id = $3`,
        [collection, documentId, userId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateDocument(collection, documentId, data, userId) {
    try {
      const result = await this.db.query(
        `UPDATE documents 
         SET data = $1, updated_at = NOW() 
         WHERE collection_name = $2 AND id = $3 AND user_id = $4 
         RETURNING *`,
        [JSON.stringify(data), collection, documentId, userId]
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(collection, documentId, userId) {
    try {
      await this.db.query(
        `DELETE FROM documents 
         WHERE collection_name = $1 AND id = $2 AND user_id = $3`,
        [collection, documentId, userId]
      );

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async queryDocuments(collection, filters = {}, userId) {
    try {
      let query = `SELECT * FROM documents WHERE collection_name = $1 AND user_id = $2`;
      const params = [collection, userId];
      let paramIndex = 3;

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        query += ` AND data->>'${key}' = $${paramIndex}`;
        params.push(value);
        paramIndex++;
      });

      query += ' ORDER BY created_at DESC';

      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Storage Service (S3-like)
  async uploadFile(file, userId, path) {
    try {
      const key = `users/${userId}/${path}/${Date.now()}-${file.originalname}`;
      
      await this.s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }));

      return { key, url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}` };
    } catch (error) {
      throw error;
    }
  }

  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      throw error;
    }
  }

  // Functions Runner (Cloud Functions-like)
  async runFunction(functionCode, trigger, data = {}) {
    try {
      // Create ephemeral container for function execution
      const container = await this.docker.createContainer({
        Image: 'node:18-alpine',
        Cmd: ['node', '-e', functionCode],
        Env: Object.entries(data).map(([key, value]) => `${key}=${value}`),
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB limit
          NetworkMode: 'none', // No network access by default
          AutoRemove: true
        }
      });

      await container.start();
      const logs = await container.logs({ stdout: true, stderr: true });
      await container.remove();

      return {
        success: true,
        logs: logs.toString(),
        executionTime: Date.now()
      };
    } catch (error) {
      throw error;
    }
  }

  // Rules Engine (Firestore Rules-like)
  async evaluateRules(rules, operation, path, data, user) {
    try {
      // Simple rules engine - can be extended
      const ruleContext = {
        user,
        operation, // 'read', 'write', 'delete'
        path,
        data,
        timestamp: Date.now()
      };

      // Evaluate rules against context
      const allowed = await this.evaluateRuleSet(rules, ruleContext);
      
      return {
        allowed,
        reason: allowed ? 'Rule evaluation passed' : 'Access denied by rules'
      };
    } catch (error) {
      throw error;
    }
  }

  async evaluateRuleSet(rules, context) {
    // Simple rule evaluation - can be made more sophisticated
    if (!rules || rules.length === 0) {
      return false; // Deny by default
    }

    for (const rule of rules) {
      if (this.matchesRule(rule, context)) {
        return rule.allow;
      }
    }

    return false; // Deny if no rules match
  }

  matchesRule(rule, context) {
    // Simple rule matching logic
    if (rule.operation && rule.operation !== context.operation) {
      return false;
    }

    if (rule.path && !context.path.startsWith(rule.path)) {
      return false;
    }

    if (rule.authenticated && !context.user) {
      return false;
    }

    return true;
  }

  // Event System (Firebase Triggers-like)
  async triggerEvent(eventType, data, userId) {
    try {
      // Store event in Redis for processing
      const event = {
        id: Date.now().toString(),
        type: eventType,
        data,
        userId,
        timestamp: Date.now()
      };

      await this.redis.lpush('events', JSON.stringify(event));
      
      // Process event asynchronously
      this.processEvent(event);

      return { success: true, eventId: event.id };
    } catch (error) {
      throw error;
    }
  }

  async processEvent(event) {
    try {
      // Find functions that listen to this event type
      const listeners = await this.getEventListeners(event.type);
      
      for (const listener of listeners) {
        await this.runFunction(listener.code, 'event', {
          ...event.data,
          eventType: event.type,
          userId: event.userId
        });
      }
    } catch (error) {
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

  // Emulator Service
  async startEmulator(services = ['auth', 'database', 'storage', 'functions']) {
    try {
      const emulatorId = `emulator-${Date.now()}`;
      
      // Start emulator containers
      const containers = [];
      
      for (const service of services) {
        const container = await this.docker.createContainer({
          Image: `winky-coder/${service}-emulator:latest`,
          name: `${emulatorId}-${service}`,
          Env: [
            'NODE_ENV=development',
            `EMULATOR_ID=${emulatorId}`,
            `SERVICE=${service}`
          ],
          HostConfig: {
            PortBindings: {
              '8080/tcp': [{ HostPort: this.getEmulatorPort(service) }]
            }
          }
        });

        await container.start();
        containers.push(container);
      }

      return {
        emulatorId,
        services,
        containers: containers.map(c => c.id),
        ports: services.map(s => this.getEmulatorPort(s))
      };
    } catch (error) {
      throw error;
    }
  }

  async stopEmulator(emulatorId) {
    try {
      const containers = await this.docker.listContainers({
        filters: { name: [`${emulatorId}-*`] }
      });

      for (const container of containers) {
        const containerInstance = this.docker.getContainer(container.Id);
        await containerInstance.stop();
        await containerInstance.remove();
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  getEmulatorPort(service) {
    const ports = {
      auth: 9099,
      database: 8080,
      storage: 9199,
      functions: 5001
    };

    return ports[service] || 8080;
  }

  // Database initialization
  async initializeDatabase() {
    try {
      // Create tables if they don't exist
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          collection_name VARCHAR(255) NOT NULL,
          data JSONB NOT NULL,
          user_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      await this.db.query(`
        CREATE TABLE IF NOT EXISTS function_listeners (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(255) NOT NULL,
          code TEXT NOT NULL,
          active BOOLEAN DEFAULT true,
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

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
}

export default OwnRuntimeService;