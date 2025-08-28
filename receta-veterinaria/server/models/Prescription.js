const { pool, query } = require('../config/database');

class Prescription {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.patient_name = data.patient_name;
    this.owner_name = data.owner_name;
    this.prescription_date = data.prescription_date;
    this.veterinarian_name = data.veterinarian_name;
    this.veterinarian_license = data.veterinarian_license;
    this.notes = data.notes;
    this.medications = data.medications || [];
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new prescription with medications
  static async create(prescriptionData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert prescription
      const prescriptionQuery = `
        INSERT INTO prescriptions (
          patient_name, owner_name, prescription_date, 
          veterinarian_name, veterinarian_license, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      
      const prescriptionValues = [
        prescriptionData.patient_name,
        prescriptionData.owner_name,
        prescriptionData.prescription_date,
        prescriptionData.veterinarian_name || 'Dr. Camilo Vergara',
        prescriptionData.veterinarian_license || '17.622.685-4',
        prescriptionData.notes || null
      ];
      
      const prescriptionResult = await client.query(prescriptionQuery, prescriptionValues);
      const prescription = prescriptionResult.rows[0];
      
      // Insert medication items
      const medications = [];
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        for (const medication of prescriptionData.medications) {
          const itemQuery = `
            INSERT INTO prescription_items (
              prescription_id, medication_name, dosage_instructions
            ) VALUES ($1, $2, $3)
            RETURNING *;
          `;
          
          const itemValues = [
            prescription.id,
            medication.nombre || medication.medication_name,
            medication.indicacion || medication.dosage_instructions
          ];
          
          const itemResult = await client.query(itemQuery, itemValues);
          medications.push(itemResult.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      
      return new Prescription({
        ...prescription,
        medications
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all prescriptions with medications
  static async findAll(limit = 100, offset = 0) {
    const prescriptionsQuery = `
      SELECT * FROM prescriptions 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2;
    `;
    
    const prescriptionsResult = await query(prescriptionsQuery, [limit, offset]);
    const prescriptions = [];
    
    for (const prescription of prescriptionsResult.rows) {
      const medications = await this.getMedicationsByPrescriptionId(prescription.id);
      prescriptions.push(new Prescription({
        ...prescription,
        medications
      }));
    }
    
    return prescriptions;
  }

  // Get prescription by ID with medications
  static async findById(id) {
    const prescriptionQuery = 'SELECT * FROM prescriptions WHERE id = $1;';
    const prescriptionResult = await query(prescriptionQuery, [id]);
    
    if (prescriptionResult.rows.length === 0) {
      return null;
    }
    
    const prescription = prescriptionResult.rows[0];
    const medications = await this.getMedicationsByPrescriptionId(id);
    
    return new Prescription({
      ...prescription,
      medications
    });
  }

  // Update prescription
  static async update(id, prescriptionData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update prescription
      const updateQuery = `
        UPDATE prescriptions 
        SET patient_name = $2, owner_name = $3, prescription_date = $4,
            notes = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
      `;
      
      const updateValues = [
        id,
        prescriptionData.patient_name,
        prescriptionData.owner_name,
        prescriptionData.prescription_date,
        prescriptionData.notes
      ];
      
      const prescriptionResult = await client.query(updateQuery, updateValues);
      
      if (prescriptionResult.rows.length === 0) {
        throw new Error('Prescription not found');
      }
      
      const prescription = prescriptionResult.rows[0];
      
      // Delete existing medications
      await client.query('DELETE FROM prescription_items WHERE prescription_id = $1;', [id]);
      
      // Insert new medications
      const medications = [];
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        for (const medication of prescriptionData.medications) {
          const itemQuery = `
            INSERT INTO prescription_items (
              prescription_id, medication_name, dosage_instructions
            ) VALUES ($1, $2, $3)
            RETURNING *;
          `;
          
          const itemValues = [
            id,
            medication.nombre || medication.medication_name,
            medication.indicacion || medication.dosage_instructions
          ];
          
          const itemResult = await client.query(itemQuery, itemValues);
          medications.push(itemResult.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      
      return new Prescription({
        ...prescription,
        medications
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete prescription
  static async delete(id) {
    const deleteQuery = 'DELETE FROM prescriptions WHERE id = $1 RETURNING *;';
    const result = await query(deleteQuery, [id]);
    
    return result.rows.length > 0;
  }

  // Get medications for a prescription
  static async getMedicationsByPrescriptionId(prescriptionId) {
    const medicationsQuery = `
      SELECT * FROM prescription_items 
      WHERE prescription_id = $1 
      ORDER BY created_at;
    `;
    
    const result = await query(medicationsQuery, [prescriptionId]);
    return result.rows;
  }

  // Search prescriptions
  static async search(searchTerm, limit = 20) {
    const searchQuery = `
      SELECT DISTINCT p.* FROM prescriptions p
      WHERE 
        p.patient_name ILIKE $1 
        OR p.owner_name ILIKE $1
        OR p.notes ILIKE $1
      ORDER BY p.created_at DESC
      LIMIT $2;
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const prescriptionsResult = await query(searchQuery, [searchPattern, limit]);
    const prescriptions = [];
    
    for (const prescription of prescriptionsResult.rows) {
      const medications = await this.getMedicationsByPrescriptionId(prescription.id);
      prescriptions.push(new Prescription({
        ...prescription,
        medications
      }));
    }
    
    return prescriptions;
  }

  // Get prescription count
  static async count() {
    const countQuery = 'SELECT COUNT(*) as total FROM prescriptions;';
    const result = await query(countQuery);
    return parseInt(result.rows[0].total);
  }

  // Convert to JSON format compatible with frontend
  toJSON() {
    return {
      id: this.id,
      paciente: this.patient_name,
      tutora: this.owner_name,
      fecha: this.prescription_date,
      medicamentos: this.medications.map(med => ({
        nombre: med.medication_name,
        indicacion: med.dosage_instructions
      })),
      fechaGuardado: this.created_at,
      veterinario: this.veterinarian_name,
      licencia: this.veterinarian_license,
      notas: this.notes
    };
  }
}

module.exports = Prescription;