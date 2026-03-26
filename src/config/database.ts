import mysql from 'mysql2/promise';
import config from '../config';

class Database {
  private pool: mysql.Pool | null = null;

  private getPool(): mysql.Pool {
    if (this.pool) {
      return this.pool;
    }

    this.pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: '+00:00',
      dateStrings: true,
      multipleStatements: true,
    });

    console.log('✅ Database pool created successfully');
    return this.pool;
  }

  async getConnection(): Promise<mysql.PoolConnection> {
    const pool = this.getPool();
    try {
      return await pool.getConnection();
    } catch (error) {
      console.error('❌ Failed to get connection from pool:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    try {
      const connection = await this.getConnection();
      console.log('✅ Database connected successfully (Pool ready)');
      connection.release();
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🔌 Database pool closed');
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    const pool = this.getPool();
    try {
      const [results] = await (params ? pool.query(sql, params) : pool.query(sql));
      return results;
    } catch (error) {
      console.error('Query Error:', error);
      if ((error as any).code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('⚠️ Database connection lost');
      }
      throw error;
    }
  }

  async transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async createDatabase(): Promise<void> {
    try {
      const connection = await mysql.createConnection({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
      });

      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database.name}`);
      console.log(`✅ Database '${config.database.name}' created or already exists`);
      await connection.end();
    } catch (error) {
      console.error('❌ Failed to create database:', error);
      throw error;
    }
  }
}

export default new Database();