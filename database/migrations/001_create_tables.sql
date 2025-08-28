-- Create database schema for Receta Veterinaria
-- Migration: 001_create_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100),
    breed VARCHAR(100),
    age INTEGER,
    weight DECIMAL(5,2),
    owner_name VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(20),
    owner_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create medications table (for future drug database)
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    active_ingredient VARCHAR(255),
    dosage_form VARCHAR(100), -- tablet, liquid, injection, etc.
    strength VARCHAR(100),
    manufacturer VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL, -- Denormalized for data integrity
    owner_name VARCHAR(255) NOT NULL,   -- Denormalized for data integrity
    prescription_date DATE NOT NULL,
    veterinarian_name VARCHAR(255) DEFAULT 'Dr. Camilo Vergara',
    veterinarian_license VARCHAR(100) DEFAULT '17.622.685-4',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prescription_items table (medications in each prescription)
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
    medication_name VARCHAR(255) NOT NULL, -- Denormalized for data integrity
    dosage_instructions TEXT NOT NULL,
    quantity VARCHAR(50),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_owner_name ON patients(owner_name);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(prescription_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);

-- Create trigger function for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at 
    BEFORE UPDATE ON medications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at 
    BEFORE UPDATE ON prescriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some common medications (optional seed data)
INSERT INTO medications (name, active_ingredient, dosage_form, strength) VALUES 
('Amoxicilina', 'Amoxicillin', 'Tablet', '500mg'),
('Meloxicam', 'Meloxicam', 'Tablet', '1mg'),
('Prednisona', 'Prednisolone', 'Tablet', '5mg'),
('Doxiciclina', 'Doxycycline', 'Capsule', '100mg'),
('Furosemida', 'Furosemide', 'Tablet', '40mg')
ON CONFLICT (name) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE patients IS 'Store patient (animal) information';
COMMENT ON TABLE medications IS 'Master list of available medications';
COMMENT ON TABLE prescriptions IS 'Main prescription records';
COMMENT ON TABLE prescription_items IS 'Individual medication items within each prescription';

COMMENT ON COLUMN patients.weight IS 'Patient weight in kg';
COMMENT ON COLUMN prescriptions.prescription_date IS 'Date when prescription was written';
COMMENT ON COLUMN prescription_items.dosage_instructions IS 'Complete dosage instructions including dose, frequency, and duration';