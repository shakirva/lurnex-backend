# Lurnex Academy Backend API

A professional Node.js/Express backend for the Lurnex Academy job portal application with MySQL database integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Job Management**: Complete CRUD operations for job postings
- **Application System**: Job application submission with file upload support
- **Contact Management**: Contact form submissions and admin management
- **Category System**: Job categorization with statistics
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MySQL with proper migrations and seeding
- **File Upload**: Resume upload with validation
- **API Documentation**: RESTful API design with proper error handling

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **File Upload**: multer
- **Security**: helmet, cors, express-rate-limit
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+ server running
- MySQL user with database creation permissions

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lurnex_academy
DB_USER=root
DB_PASSWORD=root

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

The backend will automatically create the database and tables. Run migrations and seed data:

```bash
# Build the TypeScript code
npm run build

# Run database migrations and seed data
npm run migrate
```

### 4. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Admin/User login | No |
| POST | `/auth/register` | User registration | No |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| POST | `/auth/change-password` | Change password | Yes |
| POST | `/auth/logout` | Logout user | Yes |

### Job Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/jobs` | Get all jobs with filters | No |
| GET | `/jobs/:id` | Get job by ID | No |
| GET | `/jobs/categories` | Get job categories | No |
| GET | `/jobs/category/:category` | Get jobs by category | No |
| POST | `/jobs` | Create new job | Admin |
| PUT | `/jobs/:id` | Update job | Admin |
| DELETE | `/jobs/:id` | Delete job | Admin |
| GET | `/jobs/admin/stats` | Get job statistics | Admin |
| POST | `/jobs/categories` | Create job category | Admin |

### Application Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/applications` | Submit job application | No |
| GET | `/applications/my-applications` | Get applications by email | No |
| GET | `/applications` | Get all applications | Admin |
| GET | `/applications/:id` | Get application by ID | Admin |
| GET | `/applications/job/:jobId` | Get applications for job | Admin |
| PUT | `/applications/:id/status` | Update application status | Admin |
| DELETE | `/applications/:id` | Delete application | Admin |
| GET | `/applications/:id/resume` | Download resume | Admin |
| GET | `/applications/stats` | Get application statistics | Admin |

### Contact Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/contact` | Send contact message | No |
| GET | `/contact` | Get all messages | Admin |
| GET | `/contact/:id` | Get message by ID | Admin |
| PUT | `/contact/:id/read` | Mark as read | Admin |
| PUT | `/contact/:id/unread` | Mark as unread | Admin |
| DELETE | `/contact/:id` | Delete message | Admin |
| GET | `/contact/unread-count` | Get unread count | Admin |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin Credentials

```
Username: admin
Password: admin123
```

## 📊 Database Schema

### Tables

- **users**: User accounts (admin/regular users)
- **job_categories**: Job categories
- **jobs**: Job postings
- **job_applications**: Job applications with resume uploads
- **contact_messages**: Contact form submissions
- **admin_sessions**: Admin session management

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **File Upload Validation**: Resume file type and size validation

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── database/        # Database migrations & seeders
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions & validators
│   └── server.ts        # Main server file
├── uploads/             # File uploads (gitignored)
├── .env                 # Environment variables
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🔄 API Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 📝 Sample API Calls

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get Jobs
```bash
curl http://localhost:5000/api/jobs?page=1&limit=10&category=Development
```

### Submit Application (with file)
```bash
curl -X POST http://localhost:5000/api/applications \
  -F "job_id=1" \
  -F "applicant_name=John Doe" \
  -F "applicant_email=john@example.com" \
  -F "resume=@/path/to/resume.pdf"
```

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
JWT_SECRET=your_very_secure_random_string_here
DB_PASSWORD=your_secure_db_password
FRONTEND_URL=https://yourdomain.com
```

### Build for Production

```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run build
```

## 📖 Development Notes

- The database schema is automatically created on first run
- Sample data is seeded for development
- File uploads are stored in the `uploads/` directory
- All dates are stored in UTC
- Passwords are hashed with bcryptjs (12 salt rounds)
- JWT tokens expire after 7 days by default

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include input validation for new endpoints
4. Update API documentation
5. Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License.