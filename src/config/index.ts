import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  upload: {
    directory: string;
    maxFileSize: number;
  };
  cors: {
    origin: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'lurnex_academy',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    directory: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || '"Lurnex Academy" <noreply@lurnex.com>',
  },
};

export default config;