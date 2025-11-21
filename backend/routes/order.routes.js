const express = require('express');
const { body } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');
const { filterAdminOnlyFields } = require('../middleware/adminOnlyFields.middleware');

const router = express.Router();

// Validation rules
const orderValidation = [
  body('orderNumber')
    .trim()
    .notEmpty()
    .withMessage('Order number is required')
    .isLength({ max: 50 })
    .withMessage('Order number cannot be more than 50 characters'),
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 100 })
    .withMessage('Customer name cannot be more than 100 characters'),
  body('customerEmail')
    .isEmail()
    .withMessage('Please provide a valid customer email')
    .normalizeEmail(),
  body('customerPhone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot be more than 20 characters'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('items.*.productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'refunded'])
    .withMessage('Invalid payment status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('AssignedTo must be a valid user ID'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot be more than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('estimatedDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery date must be a valid date'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

// Sanitize input helper
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

// All routes require authentication
router.use(protect);

// Routes
router
  .route('/')
  .get(getOrders)
  .post(sanitizeInput, orderValidation, handleValidationErrors, filterAdminOnlyFields, createOrder);

router
  .route('/:id')
  .get(getOrder)
  .put(sanitizeInput, orderValidation, handleValidationErrors, filterAdminOnlyFields, updateOrder)
  .delete(deleteOrder);

module.exports = router;


