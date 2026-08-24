const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// ✅ FIXED: Changed 'member' to 'user' to match your User model
const registerValidation = [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone_number').isMobilePhone().withMessage('Valid phone number required'),
  body('date_of_birth').isDate().withMessage('Valid date of birth required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('user_type').isIn(['user', 'manager', 'admin']).withMessage('Invalid user type')
];

// ✅ FIXED: Changed 'identifier' to 'email' to match login
const loginValidation = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('user_type').isIn(['user', 'manager', 'admin']).withMessage('Invalid user type')
];

const eventValidation = [
  body('title').notEmpty().withMessage('Event title is required'),
  body('event_type').isIn(['movie', 'concert', 'play', 'sports', 'other']).withMessage('Invalid event type'),
  body('date').isDate().withMessage('Valid date required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:MM)'),
  body('venue_id').notEmpty().withMessage('Venue is required'),
  body('base_price').isNumeric().withMessage('Price must be numeric'),
  body('max_seats').isInt({ min: 1 }).withMessage('Seats must be at least 1')
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  eventValidation
};
// const { body, validationResult } = require('express-validator');

// const validateRequest = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       errors: errors.array().map(err => ({
//         field: err.param,
//         message: err.msg
//       }))
//     });
//   }
//   next();
// };

// // ✅ SIMPLIFIED - REMOVE STRICT VALIDATION FOR NOW
// const registerValidation = [
//   body('full_name').optional(),
//   body('email').optional(),
//   body('phone_number').optional(),
//   body('date_of_birth').optional(),
//   body('password').optional(),
//   body('user_type').optional()
// ];

// const loginValidation = [
//   body('email').optional(),
//   body('password').optional(),
//   body('user_type').optional()
// ];

// module.exports = {
//   validateRequest,
//   registerValidation,
//   loginValidation
// };