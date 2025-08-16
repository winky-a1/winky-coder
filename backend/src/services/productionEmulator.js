/**
 * Production Emulator Service
 * 
 * Local emulator that mirrors production behavior for safe testing
 * Ensures parity between local development and production environments
 * 
 * @author Winky-Coder Team
 * @version 1.0.0
 */

import Docker from 'dockerode';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

class ProductionEmulatorService {
  constructor() {
    this.emulatorId = null;
    this.containers = new Map();
    this.ports = new Map();
    this.isRunning = false;
  }

  async startEmulator(services = ['auth', 'database', 'storage', 'functions'], options = {}) {
    try {
      this.emulatorId = `emulator-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      
      console.log(`🚀 Starting production emulator: ${this.emulatorId}`);
      
      // Initialize Docker
      this.docker = new Docker({
        socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
      });

      // Start services
      const results = await Promise.allSettled(
        services.map(service => this.startService(service, options))
      );

      // Check for failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('❌ Some services failed to start:', failures);
        await this.stopEmulator();
        throw new Error('Emulator startup failed');
      }

      this.isRunning = true;
      
      // Run parity tests
      await this.runParityTests(services);

      console.log(`✅ Production emulator started successfully: ${this.emulatorId}`);
      
      return {
        emulatorId: this.emulatorId,
        services,
        ports: Object.fromEntries(this.ports),
        status: 'running'
      };
    } catch (error) {
      console.error('❌ Failed to start emulator:', error);
      await this.stopEmulator();
      throw error;
    }
  }

  async startService(service, options) {
    const port = this.getServicePort(service);
    this.ports.set(service, port);

    switch (service) {
      case 'auth':
        return this.startAuthService(port, options);
      case 'database':
        return this.startDatabaseService(port, options);
      case 'storage':
        return this.startStorageService(port, options);
      case 'functions':
        return this.startFunctionsService(port, options);
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  async startAuthService(port, options) {
    const container = await this.docker.createContainer({
      Image: 'winky-coder/auth-emulator:latest',
      name: `${this.emulatorId}-auth`,
      Env: [
        'NODE_ENV=development',
        `EMULATOR_ID=${this.emulatorId}`,
        `PORT=${port}`,
        'JWT_SECRET=emulator-secret-key',
        'BCRYPT_ROUNDS=10'
      ],
      HostConfig: {
        PortBindings: {
          [`${port}/tcp`]: [{ HostPort: port.toString() }]
        },
        AutoRemove: true
      }
    });

    await container.start();
    this.containers.set('auth', container);

    // Wait for service to be ready
    await this.waitForService(`http://localhost:${port}/health`, 'Auth Service');

    return { service: 'auth', port, containerId: container.id };
  }

  async startDatabaseService(port, options) {
    const container = await this.docker.createContainer({
      Image: 'postgres:15-alpine',
      name: `${this.emulatorId}-database`,
      Env: [
        'POSTGRES_DB=winky_coder_emulator',
        'POSTGRES_USER=emulator_user',
        'POSTGRES_PASSWORD=emulator_password'
      ],
      HostConfig: {
        PortBindings: {
          '5432/tcp': [{ HostPort: port.toString() }]
        },
        AutoRemove: true
      }
    });

    await container.start();
    this.containers.set('database', container);

    // Wait for database to be ready
    await this.waitForDatabase(`postgresql://emulator_user:emulator_password@localhost:${port}/winky_coder_emulator`);

    return { service: 'database', port, containerId: container.id };
  }

  async startStorageService(port, options) {
    const container = await this.docker.createContainer({
      Image: 'minio/minio:latest',
      name: `${this.emulatorId}-storage`,
      Cmd: ['server', '/data', '--console-address', ':9001'],
      Env: [
        'MINIO_ROOT_USER=emulator_user',
        'MINIO_ROOT_PASSWORD=emulator_password'
      ],
      HostConfig: {
        PortBindings: {
          '9000/tcp': [{ HostPort: port.toString() }],
          '9001/tcp': [{ HostPort: (port + 1).toString() }]
        },
        AutoRemove: true
      }
    });

    await container.start();
    this.containers.set('storage', container);

    // Wait for storage to be ready
    await this.waitForService(`http://localhost:${port}/minio/health/live`, 'Storage Service');

    return { service: 'storage', port, containerId: container.id };
  }

  async startFunctionsService(port, options) {
    const container = await this.docker.createContainer({
      Image: 'winky-coder/functions-emulator:latest',
      name: `${this.emulatorId}-functions`,
      Env: [
        'NODE_ENV=development',
        `EMULATOR_ID=${this.emulatorId}`,
        `PORT=${port}`,
        'DOCKER_SOCKET=/var/run/docker.sock'
      ],
      HostConfig: {
        PortBindings: {
          [`${port}/tcp`]: [{ HostPort: port.toString() }]
        },
        Binds: ['/var/run/docker.sock:/var/run/docker.sock'],
        AutoRemove: true
      }
    });

    await container.start();
    this.containers.set('functions', container);

    // Wait for service to be ready
    await this.waitForService(`http://localhost:${port}/health`, 'Functions Service');

    return { service: 'functions', port, containerId: container.id };
  }

  async stopEmulator() {
    if (!this.isRunning) {
      return;
    }

    console.log(`🛑 Stopping emulator: ${this.emulatorId}`);

    try {
      // Stop all containers
      const stopPromises = Array.from(this.containers.values()).map(async (container) => {
        try {
          await container.stop();
          console.log(`✅ Stopped container: ${container.id}`);
        } catch (error) {
          console.error(`❌ Error stopping container ${container.id}:`, error);
        }
      });

      await Promise.allSettled(stopPromises);

      // Clean up
      this.containers.clear();
      this.ports.clear();
      this.isRunning = false;
      this.emulatorId = null;

      console.log(`✅ Emulator stopped: ${this.emulatorId}`);
    } catch (error) {
      console.error('❌ Error stopping emulator:', error);
      throw error;
    }
  }

  async runParityTests(services) {
    console.log('🧪 Running parity tests...');

    const tests = [];

    if (services.includes('auth')) {
      tests.push(this.testAuthParity());
    }

    if (services.includes('database')) {
      tests.push(this.testDatabaseParity());
    }

    if (services.includes('storage')) {
      tests.push(this.testStorageParity());
    }

    if (services.includes('functions')) {
      tests.push(this.testFunctionsParity());
    }

    const results = await Promise.allSettled(tests);
    const failures = results.filter(result => result.status === 'rejected');

    if (failures.length > 0) {
      console.error('❌ Parity tests failed:', failures);
      throw new Error('Parity tests failed - emulator behavior does not match production');
    }

    console.log('✅ All parity tests passed');
  }

  async testAuthParity() {
    const port = this.ports.get('auth');
    
    // Test JWT token generation
    const response = await fetch(`http://localhost:${port}/auth/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });

    if (!response.ok) {
      throw new Error('Auth parity test failed: JWT generation');
    }

    const result = await response.json();
    
    // Verify token structure matches production
    if (!result.token || !result.user) {
      throw new Error('Auth parity test failed: Invalid response structure');
    }

    console.log('✅ Auth parity test passed');
  }

  async testDatabaseParity() {
    const port = this.ports.get('database');
    const connectionString = `postgresql://emulator_user:emulator_password@localhost:${port}/winky_coder_emulator`;
    
    const db = new Pool({ connectionString });

    try {
      // Test document creation
      const result = await db.query(
        `INSERT INTO documents (collection_name, data, user_id, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        ['test', JSON.stringify({ test: 'data' }), 1]
      );

      if (!result.rows[0]) {
        throw new Error('Database parity test failed: Document creation');
      }

      // Test document querying
      const queryResult = await db.query(
        'SELECT * FROM documents WHERE collection_name = $1',
        ['test']
      );

      if (queryResult.rows.length === 0) {
        throw new Error('Database parity test failed: Document querying');
      }

      console.log('✅ Database parity test passed');
    } finally {
      await db.end();
    }
  }

  async testStorageParity() {
    const port = this.ports.get('storage');
    
    // Test file upload simulation
    const response = await fetch(`http://localhost:${port}/storage/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'test/file.txt',
        data: 'test content'
      })
    });

    if (!response.ok) {
      throw new Error('Storage parity test failed: File upload');
    }

    console.log('✅ Storage parity test passed');
  }

  async testFunctionsParity() {
    const port = this.ports.get('functions');
    
    // Test function execution
    const response = await fetch(`http://localhost:${port}/functions/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'console.log("Hello from emulator"); return { success: true };',
        trigger: 'http',
        data: { test: 'data' }
      })
    });

    if (!response.ok) {
      throw new Error('Functions parity test failed: Function execution');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Functions parity test failed: Invalid execution result');
    }

    console.log('✅ Functions parity test passed');
  }

  async waitForService(url, serviceName, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          console.log(`✅ ${serviceName} is ready`);
          return;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`${serviceName} failed to start within ${maxAttempts} seconds`);
  }

  async waitForDatabase(connectionString, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const db = new Pool({ connectionString });
        await db.query('SELECT 1');
        await db.end();
        console.log('✅ Database is ready');
        return;
      } catch (error) {
        // Database not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Database failed to start within 30 seconds');
  }

  getServicePort(service) {
    const basePorts = {
      auth: 9099,
      database: 5432,
      storage: 9000,
      functions: 5001
    };

    return basePorts[service] || 8080;
  }

  async getEmulatorStatus() {
    if (!this.isRunning) {
      return { status: 'stopped' };
    }

    const containerStatuses = {};
    
    for (const [service, container] of this.containers) {
      try {
        const info = await container.inspect();
        containerStatuses[service] = {
          id: container.id,
          status: info.State.Status,
          port: this.ports.get(service)
        };
      } catch (error) {
        containerStatuses[service] = {
          status: 'error',
          error: error.message
        };
      }
    }

    return {
      emulatorId: this.emulatorId,
      status: 'running',
      services: containerStatuses,
      ports: Object.fromEntries(this.ports)
    };
  }

  async runSmokeTests() {
    if (!this.isRunning) {
      throw new Error('Emulator is not running');
    }

    console.log('🔥 Running smoke tests...');

    const tests = [
      this.smokeTestAuth(),
      this.smokeTestDatabase(),
      this.smokeTestStorage(),
      this.smokeTestFunctions()
    ];

    const results = await Promise.allSettled(tests);
    const failures = results.filter(result => result.status === 'rejected');

    if (failures.length > 0) {
      console.error('❌ Smoke tests failed:', failures);
      throw new Error('Smoke tests failed');
    }

    console.log('✅ All smoke tests passed');
    return { success: true, testsRun: tests.length };
  }

  async smokeTestAuth() {
    const port = this.ports.get('auth');
    
    // Test basic auth endpoints
    const healthResponse = await fetch(`http://localhost:${port}/health`);
    if (!healthResponse.ok) {
      throw new Error('Auth health check failed');
    }

    console.log('✅ Auth smoke test passed');
  }

  async smokeTestDatabase() {
    const port = this.ports.get('database');
    const connectionString = `postgresql://emulator_user:emulator_password@localhost:${port}/winky_coder_emulator`;
    
    const db = new Pool({ connectionString });
    
    try {
      await db.query('SELECT 1 as test');
      console.log('✅ Database smoke test passed');
    } finally {
      await db.end();
    }
  }

  async smokeTestStorage() {
    const port = this.ports.get('storage');
    
    const healthResponse = await fetch(`http://localhost:${port}/minio/health/live`);
    if (!healthResponse.ok) {
      throw new Error('Storage health check failed');
    }

    console.log('✅ Storage smoke test passed');
  }

  async smokeTestFunctions() {
    const port = this.ports.get('functions');
    
    const healthResponse = await fetch(`http://localhost:${port}/health`);
    if (!healthResponse.ok) {
      throw new Error('Functions health check failed');
    }

    console.log('✅ Functions smoke test passed');
  }

  async getLogs(service = null) {
    if (!this.isRunning) {
      throw new Error('Emulator is not running');
    }

    const logs = {};

    if (service) {
      const container = this.containers.get(service);
      if (container) {
        const containerLogs = await container.logs({ stdout: true, stderr: true });
        logs[service] = containerLogs.toString();
      }
    } else {
      // Get logs for all services
      for (const [serviceName, container] of this.containers) {
        try {
          const containerLogs = await container.logs({ stdout: true, stderr: true });
          logs[serviceName] = containerLogs.toString();
        } catch (error) {
          logs[serviceName] = `Error getting logs: ${error.message}`;
        }
      }
    }

    return logs;
  }

  async exportEmulatorState() {
    if (!this.isRunning) {
      throw new Error('Emulator is not running');
    }

    const state = {
      emulatorId: this.emulatorId,
      timestamp: new Date().toISOString(),
      services: {},
      ports: Object.fromEntries(this.ports)
    };

    // Export database state
    const dbPort = this.ports.get('database');
    if (dbPort) {
      const connectionString = `postgresql://emulator_user:emulator_password@localhost:${dbPort}/winky_coder_emulator`;
      const db = new Pool({ connectionString });
      
      try {
        // Export all tables
        const tables = ['users', 'documents', 'files', 'function_listeners', 'collection_rules', 'audit_logs'];
        
        for (const table of tables) {
          const result = await db.query(`SELECT * FROM ${table}`);
          state.services.database = state.services.database || {};
          state.services.database[table] = result.rows;
        }
      } finally {
        await db.end();
      }
    }

    return state;
  }

  async importEmulatorState(state) {
    if (this.isRunning) {
      throw new Error('Cannot import state while emulator is running');
    }

    // Start emulator with same services
    const services = Object.keys(state.services);
    await this.startEmulator(services);

    // Import database state
    if (state.services.database) {
      const dbPort = this.ports.get('database');
      const connectionString = `postgresql://emulator_user:emulator_password@localhost:${dbPort}/winky_coder_emulator`;
      const db = new Pool({ connectionString });
      
      try {
        for (const [table, rows] of Object.entries(state.services.database)) {
          if (rows.length > 0) {
            // Clear existing data
            await db.query(`DELETE FROM ${table}`);
            
            // Insert imported data
            for (const row of rows) {
              const columns = Object.keys(row);
              const values = Object.values(row);
              const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
              
              await db.query(
                `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
                values
              );
            }
          }
        }
      } finally {
        await db.end();
      }
    }

    console.log('✅ Emulator state imported successfully');
  }
}

export default ProductionEmulatorService;