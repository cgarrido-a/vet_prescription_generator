const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionStats,
  bulkImportPrescriptions
} = require('../controllers/prescriptionController');

// Import validation middleware
const {
  validatePrescription,
  validatePrescriptionUpdate,
  validateUUID,
  validateQueryParams
} = require('../middleware/validation');

// @route   GET /api/recetas/stats
// @desc    Get prescription statistics
// @access  Public
router.get('/stats', getPrescriptionStats);

// @route   POST /api/recetas/bulk
// @desc    Bulk import prescriptions
// @access  Public
router.post('/bulk', bulkImportPrescriptions);

// @route   GET /api/recetas
// @desc    Get all prescriptions
// @access  Public
router.get('/', validateQueryParams, getAllPrescriptions);

// @route   POST /api/recetas
// @desc    Create new prescription
// @access  Public
router.post('/', validatePrescription, createPrescription);

// @route   GET /api/recetas/:id
// @desc    Get single prescription
// @access  Public
router.get('/:id', validateUUID, getPrescription);

// @route   PUT /api/recetas/:id
// @desc    Update prescription
// @access  Public
router.put('/:id', validateUUID, validatePrescriptionUpdate, updatePrescription);

// @route   DELETE /api/recetas/:id
// @desc    Delete prescription
// @access  Public
router.delete('/:id', validateUUID, deletePrescription);

module.exports = router;