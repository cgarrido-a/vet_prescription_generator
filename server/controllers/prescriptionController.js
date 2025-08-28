const Prescription = require('../models/Prescription');
const { asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

// @desc    Get all prescriptions
// @route   GET /api/recetas
// @access  Public (can be changed to private later)
const getAllPrescriptions = asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0, search } = req.query;
  
  let prescriptions;
  
  if (search) {
    prescriptions = await Prescription.search(search, parseInt(limit));
  } else {
    prescriptions = await Prescription.findAll(parseInt(limit), parseInt(offset));
  }
  
  const total = await Prescription.count();
  
  res.status(200).json({
    success: true,
    data: prescriptions.map(p => p.toJSON()),
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: (parseInt(offset) + parseInt(limit)) < total
    }
  });
});

// @desc    Get single prescription
// @route   GET /api/recetas/:id
// @access  Public
const getPrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const prescription = await Prescription.findById(id);
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      error: 'Prescription not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: prescription.toJSON()
  });
});

// @desc    Create new prescription
// @route   POST /api/recetas
// @access  Public
const createPrescription = asyncHandler(async (req, res) => {
  const prescriptionData = req.body;
  
  // Normalize field names (support both frontend formats)
  const normalizedData = {
    patient_name: prescriptionData.patient_name || prescriptionData.paciente,
    owner_name: prescriptionData.owner_name || prescriptionData.tutora,
    prescription_date: prescriptionData.prescription_date || prescriptionData.fecha,
    veterinarian_name: prescriptionData.veterinarian_name,
    veterinarian_license: prescriptionData.veterinarian_license,
    notes: prescriptionData.notes,
    medications: prescriptionData.medications || prescriptionData.medicamentos
  };
  
  // Validate prescription date format
  if (normalizedData.prescription_date && normalizedData.prescription_date.includes('/')) {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = normalizedData.prescription_date.split('/');
    normalizedData.prescription_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  logger.info('Creating new prescription', {
    patient: normalizedData.patient_name,
    owner: normalizedData.owner_name,
    medicationCount: normalizedData.medications?.length || 0
  });
  
  const prescription = await Prescription.create(normalizedData);
  
  res.status(201).json({
    success: true,
    data: prescription.toJSON(),
    message: 'Prescription created successfully'
  });
});

// @desc    Update prescription
// @route   PUT /api/recetas/:id
// @access  Public
const updatePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const prescriptionData = req.body;
  
  // Check if prescription exists
  const existingPrescription = await Prescription.findById(id);
  if (!existingPrescription) {
    return res.status(404).json({
      success: false,
      error: 'Prescription not found'
    });
  }
  
  // Normalize field names
  const normalizedData = {
    patient_name: prescriptionData.patient_name || prescriptionData.paciente,
    owner_name: prescriptionData.owner_name || prescriptionData.tutora,
    prescription_date: prescriptionData.prescription_date || prescriptionData.fecha,
    notes: prescriptionData.notes,
    medications: prescriptionData.medications || prescriptionData.medicamentos
  };
  
  // Validate prescription date format
  if (normalizedData.prescription_date && normalizedData.prescription_date.includes('/')) {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = normalizedData.prescription_date.split('/');
    normalizedData.prescription_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  logger.info('Updating prescription', {
    id,
    patient: normalizedData.patient_name,
    owner: normalizedData.owner_name
  });
  
  const prescription = await Prescription.update(id, normalizedData);
  
  res.status(200).json({
    success: true,
    data: prescription.toJSON(),
    message: 'Prescription updated successfully'
  });
});

// @desc    Delete prescription
// @route   DELETE /api/recetas/:id
// @access  Public
const deletePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if prescription exists
  const existingPrescription = await Prescription.findById(id);
  if (!existingPrescription) {
    return res.status(404).json({
      success: false,
      error: 'Prescription not found'
    });
  }
  
  logger.info('Deleting prescription', { id });
  
  const deleted = await Prescription.delete(id);
  
  if (deleted) {
    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to delete prescription'
    });
  }
});

// @desc    Get prescription statistics
// @route   GET /api/recetas/stats
// @access  Public
const getPrescriptionStats = asyncHandler(async (req, res) => {
  const total = await Prescription.count();
  
  // Get recent prescriptions count (last 30 days)
  const recentQuery = `
    SELECT COUNT(*) as recent_count 
    FROM prescriptions 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
  `;
  
  const { query } = require('../config/database');
  const recentResult = await query(recentQuery);
  const recentCount = parseInt(recentResult.rows[0].recent_count);
  
  res.status(200).json({
    success: true,
    data: {
      total_prescriptions: total,
      recent_prescriptions: recentCount,
      period: 'last_30_days'
    }
  });
});

// @desc    Bulk import prescriptions (for migration from localStorage)
// @route   POST /api/recetas/bulk
// @access  Public
const bulkImportPrescriptions = asyncHandler(async (req, res) => {
  const { prescriptions } = req.body;
  
  if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid prescriptions data'
    });
  }
  
  logger.info(`Bulk importing ${prescriptions.length} prescriptions`);
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < prescriptions.length; i++) {
    try {
      const prescriptionData = prescriptions[i];
      
      // Normalize data
      const normalizedData = {
        patient_name: prescriptionData.paciente || prescriptionData.patient_name,
        owner_name: prescriptionData.tutora || prescriptionData.owner_name,
        prescription_date: prescriptionData.fecha || prescriptionData.prescription_date,
        medications: prescriptionData.medicamentos || prescriptionData.medications,
        notes: `Imported from localStorage on ${new Date().toLocaleDateString()}`
      };
      
      // Convert date format if needed
      if (normalizedData.prescription_date && normalizedData.prescription_date.includes('/')) {
        const [day, month, year] = normalizedData.prescription_date.split('/');
        normalizedData.prescription_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      const prescription = await Prescription.create(normalizedData);
      results.push(prescription.toJSON());
      
    } catch (error) {
      logger.error(`Error importing prescription ${i}:`, error);
      errors.push({
        index: i,
        error: error.message,
        data: prescriptions[i]
      });
    }
  }
  
  res.status(201).json({
    success: true,
    data: {
      imported: results.length,
      total: prescriptions.length,
      errors: errors.length,
      results,
      errors: errors
    },
    message: `Successfully imported ${results.length} of ${prescriptions.length} prescriptions`
  });
});

module.exports = {
  getAllPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionStats,
  bulkImportPrescriptions
};