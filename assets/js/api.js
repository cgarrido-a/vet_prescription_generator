/**
 * API Client for Receta Veterinaria
 * Handles communication between frontend and backend API
 */

class API {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.endpoints = {
      prescriptions: '/api/recetas',
      stats: '/api/recetas/stats',
      bulk: '/api/recetas/bulk'
    };
  }

  // Determine base URL based on environment
  getBaseURL() {
    if (typeof window !== 'undefined') {
      // Browser environment
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `${window.location.protocol}//${window.location.host}`;
      }
      // Production - use same origin
      return '';
    }
    // Fallback
    return '';
  }

  // Generic HTTP request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      Utils.showLoading(true);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    } finally {
      Utils.showLoading(false);
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // =================================
  // PRESCRIPTION ENDPOINTS
  // =================================

  /**
   * Get all prescriptions
   */
  async getPrescriptions(params = {}) {
    return this.get(this.endpoints.prescriptions, params);
  }

  /**
   * Get single prescription by ID
   */
  async getPrescription(id) {
    return this.get(`${this.endpoints.prescriptions}/${id}`);
  }

  /**
   * Create new prescription
   */
  async createPrescription(prescriptionData) {
    return this.post(this.endpoints.prescriptions, prescriptionData);
  }

  /**
   * Update prescription
   */
  async updatePrescription(id, prescriptionData) {
    return this.put(`${this.endpoints.prescriptions}/${id}`, prescriptionData);
  }

  /**
   * Delete prescription
   */
  async deletePrescription(id) {
    return this.delete(`${this.endpoints.prescriptions}/${id}`);
  }

  /**
   * Get prescription statistics
   */
  async getStats() {
    return this.get(this.endpoints.stats);
  }

  /**
   * Bulk import prescriptions (for localStorage migration)
   */
  async bulkImport(prescriptions) {
    return this.post(this.endpoints.bulk, { prescriptions });
  }

  /**
   * Search prescriptions
   */
  async searchPrescriptions(searchTerm, limit = 20) {
    return this.get(this.endpoints.prescriptions, {
      search: searchTerm,
      limit
    });
  }
}

// Create singleton instance
const api = new API();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  window.api = api;
}