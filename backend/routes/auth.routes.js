const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  adminLogin,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Sanitize input helper
const sanitizeInput = (req, res, next) => {
  // Remove any script tags or dangerous patterns
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

// Routes
router.post('/register', sanitizeInput, registerValidation, handleValidationErrors, register);
router.post('/login', sanitizeInput, loginValidation, handleValidationErrors, login);
router.post('/admin/login', sanitizeInput, loginValidation, handleValidationErrors, adminLogin);
router.get('/me', protect, getMe);

module.exports = router;

