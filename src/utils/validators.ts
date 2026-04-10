import { body } from 'express-validator';

export const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long')
];

export const registerValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('last_name')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('Last name cannot exceed 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'employer'])
    .withMessage('Role must be admin, user, or employer')
];

export const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

export const createJobValidation = [
  body('title')
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('company')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('type')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
    .withMessage('Invalid job type'),
  body('salary')
    .optional()
    .isString()
    .withMessage('Salary must be a string'),
  body('description')
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters long'),
  body('requirements')
    .isArray({ min: 1 })
    .withMessage('At least one requirement is needed')
    .custom((requirements) => {
      if (!requirements.every((req: any) => typeof req === 'string' && req.trim().length > 0)) {
        throw new Error('All requirements must be non-empty strings');
      }
      return true;
    }),
  body('logo')
    .optional()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('food_accommodation')
    .optional()
    .isIn(['Provided', 'Not Provided', 'Partial'])
    .withMessage('Invalid food accommodation option'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Any'])
    .withMessage('Invalid gender preference'),
  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
];

export const updateJobValidation = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('company')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('location')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('type')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
    .withMessage('Invalid job type'),
  body('salary')
    .optional()
    .isString()
    .withMessage('Salary must be a string'),
  body('description')
    .optional()
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters long'),
  body('requirements')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one requirement is needed')
    .custom((requirements) => {
      if (!requirements.every((req: any) => typeof req === 'string' && req.trim().length > 0)) {
        throw new Error('All requirements must be non-empty strings');
      }
      return true;
    }),
  body('logo')
    .optional()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('food_accommodation')
    .optional()
    .isIn(['Provided', 'Not Provided', 'Partial'])
    .withMessage('Invalid food accommodation option'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Any'])
    .withMessage('Invalid gender preference'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date')
];

export const createApplicationValidation = [
  body('job_id')
    .isInt({ min: 1 })
    .withMessage('Valid job ID is required'),
  body('applicant_name')
    .notEmpty()
    .withMessage('Applicant name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Applicant name must be between 2 and 100 characters'),
  body('applicant_email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('applicant_phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('cover_letter')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Cover letter must not exceed 2000 characters')
];

export const updateApplicationStatusValidation = [
  body('status')
    .isIn(['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'])
    .withMessage('Invalid application status')
];

export const createContactValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').notEmpty().withMessage('Email is required'),
  body('phone').optional(),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required'),
];

export const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];