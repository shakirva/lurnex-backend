import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import config from './config';
import database from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      }
    });
    this.app.use('/api', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Static files
    this.app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Serve static files in production
    if (config.nodeEnv === 'production') {
      this.app.use(express.static(path.join(process.cwd(), 'public')));
      
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
      });
    }
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Create database if it doesn't exist
      await database.createDatabase();
      
      // Initialize database connection
      await database.connect();
      console.log('📊 Database connected successfully');

      // Start server
      this.app.listen(config.port, () => {
        console.log(`🚀 Server running on port ${config.port}`);
        console.log(`📱 Environment: ${config.nodeEnv}`);
        console.log(`🌐 API URL: http://localhost:${config.port}/api`);
        console.log(`📚 Health Check: http://localhost:${config.port}/api/health`);
        console.log(`💡 To create tables and seed data, run: npm run build && npm run migrate`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('🛑 Shutting down server gracefully...');
  
  try {
    await database.disconnect();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = new Server();
server.start();