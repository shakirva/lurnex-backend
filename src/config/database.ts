import mysql from 'mysql2/promise';
import config from '../config';

class Database {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<mysql.Connection> {
    if (this.connection) {
      return this.connection;
    }

    try {
      this.connection = await mysql.createConnection({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        timezone: '+00:00',
        dateStrings: true,
        multipleStatements: true,
      });

      console.log('✅ Database connected successfully');
      return this.connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('🔌 Database disconnected');
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    const connection = await this.connect();
    try {
      const [results] = await (params ? connection.query(sql, params) : connection.query(sql));
      return results;
    } catch (error) {
      console.error('Query Error:', error);
      throw error;
    }
  }

  async beginTransaction(): Promise<void> {
    const connection = await this.connect();
    await connection.beginTransaction();
  }

  async commit(): Promise<void> {
    const connection = await this.connect();
    await connection.commit();
  }

  async rollback(): Promise<void> {
    const connection = await this.connect();
    await connection.rollback();
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