const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Prescription validation rules
const validatePrescription = [
  body('patient_name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Patient name must be between 1 and 255 characters'),
  
  body('owner_name')
    .trim()
    .notEmpty()
    .withMessage('Owner name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Owner name must be between 1 and 255 characters'),
  
  body('prescription_date')
    .notEmpty()
    .withMessage('Prescription date is required')
    .isDate()
    .withMessage('Prescription date must be a valid date'),
  
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  
  body('medications.*.nombre')
    .if(body('medications.*.medication_name').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('medications.*.medication_name')
    .if(body('medications.*.nombre').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('medications.*.indicacion')
    .if(body('medications.*.dosage_instructions').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication instructions are required'),
  
  body('medications.*.dosage_instructions')
    .if(body('medications.*.indicacion').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication instructions are required'),
  
  body('veterinarian_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Veterinarian name must be less than 255 characters'),
  
  body('veterinarian_license')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Veterinarian license must be less than 100 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  
  handleValidationErrors
];

// Update prescription validation (similar to create but with optional fields)
const validatePrescriptionUpdate = [
  body('patient_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Patient name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Patient name must be between 1 and 255 characters'),
  
  body('owner_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Owner name cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Owner name must be between 1 and 255 characters'),
  
  body('prescription_date')
    .optional()
    .isDate()
    .withMessage('Prescription date must be a valid date'),
  
  body('medications')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one medication is required when medications are provided'),
  
  body('medications.*.nombre')
    .if(body('medications').exists())
    .if(body('medications.*.medication_name').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('medications.*.medication_name')
    .if(body('medications').exists())
    .if(body('medications.*.nombre').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('medications.*.indicacion')
    .if(body('medications').exists())
    .if(body('medications.*.dosage_instructions').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication instructions are required'),
  
  body('medications.*.dosage_instructions')
    .if(body('medications').exists())
    .if(body('medications.*.indicacion').not().exists())
    .trim()
    .notEmpty()
    .withMessage('Medication instructions are required'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  
  handleValidationErrors
];

// UUID parameter validation
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Query parameter validation
const validateQueryParams = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
    .toInt(),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  validatePrescription,
  validatePrescriptionUpdate,
  validateUUID,
  validateQueryParams,
  handleValidationErrors
};