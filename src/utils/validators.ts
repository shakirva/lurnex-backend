import { body } from 'express-validator';

export const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username or email is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Username or email must be between 3 and 100 characters'),
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

export const createJobValidation = [];

export const updateJobValidation = [];

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