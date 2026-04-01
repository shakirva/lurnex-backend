export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user' | 'employer';
  phone?: string;
  company_name?: string;
  experience_years?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  salary?: string;
  description: string;
  requirements: string[];
  logo?: string;
  category_id?: number;
  category_name?: string;
  food_accommodation?: 'Provided' | 'Not Provided' | 'Partial';
  gender?: 'Male' | 'Female' | 'Any';
  is_active: boolean;
  posted_by?: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  posted?: string; // For frontend compatibility
}

export interface JobCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_path?: string;
  cover_letter?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: string;
  updated_at: string;
  job_title?: string;
  company?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthTokenPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user' | 'employer';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface JobFilters {
  category?: string;
  location?: string;
  type?: string;
  company?: string;
  search?: string;
}

// Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface CreateJobRequest {
  title: string;
  company: string;
  location: string;
  type: Job['type'];
  salary?: string;
  description: string;
  requirements: string[];
  logo?: string;
  category_id?: number;
  food_accommodation?: Job['food_accommodation'];
  gender?: Job['gender'];
  expires_at?: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  is_active?: boolean;
}

export interface CreateApplicationRequest {
  job_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  cover_letter?: string;
}

export interface UpdateApplicationStatusRequest {
  status: JobApplication['status'];
}

export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'user' | 'employer';
  phone?: string;
  company_name?: string;
  experience_years?: number;
}

export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}