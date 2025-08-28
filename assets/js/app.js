/**
 * RECETA VETERINARIA - Main Application
 * Sistema de gestión de recetas veterinarias
 */

// =================================
// CONFIGURATION
// =================================
const CONFIG = {
  localStorageKey: 'recetasVeterinarias',
  dateFormat: 'DD/MM/YYYY',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['.json']
};

// =================================
// UTILITY FUNCTIONS
// =================================
const Utils = {
  /**
   * Formats date from YYYY-MM-DD to DD/MM/YYYY
   */
  formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  },

  /**
   * Formats date from DD/MM/YYYY to YYYY-MM-DD
   */
  parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  },

  /**
   * Gets today's date in YYYY-MM-DD format
   */
  getTodayDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${year}-${month}-${day}`;
  },

  /**
   * Generates unique ID
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Shows user notification
   */
  notify(message, type = 'info') {
    // Using simple alert for now - can be enhanced with custom notifications
    alert(message);
  },

  /**
   * Confirms user action
   */
  confirm(message) {
    return confirm(message);
  },

  /**
   * Shows/hides loading indicator
   */
  showLoading(show = true) {
    const loading = DOM.get('loading');
    if (loading) {
      if (show) {
        loading.style.display = 'flex';
      } else {
        loading.style.display = 'none';
      }
    }
  }
};

// =================================
// DOM MANIPULATION
// =================================
const DOM = {
  /**
   * Gets element by ID
   */
  get(id) {
    return document.getElementById(id);
  },

  /**
   * Gets elements by selector
   */
  getAll(selector) {
    return document.querySelectorAll(selector);
  },

  /**
   * Shows element
   */
  show(element) {
    if (typeof element === 'string') {
      element = this.get(element);
    }
    if (element) element.style.display = 'block';
  },

  /**
   * Hides element
   */
  hide(element) {
    if (typeof element === 'string') {
      element = this.get(element);
    }
    if (element) element.style.display = 'none';
  },

  /**
   * Creates element with optional attributes
   */
  create(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  }
};

// =================================
// STORAGE MANAGEMENT (API + localStorage fallback)
// =================================
const Storage = {
  /**
   * Gets saved recipes from API or localStorage fallback
   */
  async getRecipes() {
    try {
      // Try API first
      const response = await api.getPrescriptions();
      return response.data || [];
    } catch (error) {
      console.warn('API unavailable, falling back to localStorage:', error);
      // Fallback to localStorage
      try {
        return JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        return [];
      }
    }
  },

  /**
   * Saves recipe to API or localStorage fallback
   */
  async saveRecipe(recipe) {
    try {
      // Try API first
      const response = await api.createPrescription(recipe);
      return response.data;
    } catch (error) {
      console.warn('API unavailable, saving to localStorage:', error);
      // Fallback to localStorage
      try {
        const recipes = JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
        recipe.id = Utils.generateId();
        recipe.fechaGuardado = new Date().toISOString();
        recipes.push(recipe);
        localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(recipes));
        return recipe;
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        throw new Error('Failed to save recipe');
      }
    }
  },

  /**
   * Updates a recipe
   */
  async updateRecipe(id, recipe) {
    try {
      const response = await api.updatePrescription(id, recipe);
      return response.data;
    } catch (error) {
      console.warn('API unavailable for update operation');
      throw error;
    }
  },

  /**
   * Deletes a recipe by ID
   */
  async deleteRecipe(id) {
    try {
      // Try API first
      await api.deletePrescription(id);
      return true;
    } catch (error) {
      console.warn('API unavailable, deleting from localStorage:', error);
      // Fallback to localStorage
      try {
        const recipes = JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
        const filtered = recipes.filter(r => r.id !== id);
        localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(filtered));
        return true;
      } catch (localError) {
        console.error('Error deleting from localStorage:', localError);
        return false;
      }
    }
  },

  /**
   * Gets a specific recipe by ID
   */
  async getRecipe(id) {
    try {
      // Try API first
      const response = await api.getPrescription(id);
      return response.data;
    } catch (error) {
      console.warn('API unavailable, searching in localStorage:', error);
      // Fallback to localStorage
      try {
        const recipes = JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
        return recipes.find(r => r.id === id);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        return null;
      }
    }
  },

  /**
   * Search recipes
   */
  async searchRecipes(searchTerm) {
    try {
      const response = await api.searchPrescriptions(searchTerm);
      return response.data || [];
    } catch (error) {
      console.warn('API search unavailable, searching in localStorage:', error);
      // Fallback to localStorage search
      try {
        const recipes = JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
        return recipes.filter(recipe => 
          (recipe.paciente || recipe.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (recipe.tutora || recipe.owner_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch (localError) {
        console.error('Error searching in localStorage:', localError);
        return [];
      }
    }
  },

  /**
   * Migrate localStorage data to API
   */
  async migrateToAPI() {
    try {
      const localRecipes = JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
      
      if (localRecipes.length === 0) {
        Utils.notify('No hay recetas locales para migrar');
        return;
      }

      const response = await api.bulkImport(localRecipes);
      
      if (response.success) {
        Utils.notify(`Se migraron ${response.data.imported} de ${response.data.total} recetas`);
        
        // Optionally clear localStorage after successful migration
        if (confirm('¿Desea eliminar las recetas locales después de la migración exitosa?')) {
          localStorage.removeItem(CONFIG.localStorageKey);
          Utils.notify('Recetas locales eliminadas. Ahora usando la base de datos.');
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Migration failed:', error);
      Utils.notify('Error en la migración: ' + error.message);
      throw error;
    }
  }
};

// =================================
// FORM MANAGEMENT
// =================================
const Form = {
  /**
   * Validates form data
   */
  validate() {
    const paciente = DOM.get('paciente').value.trim();
    const tutora = DOM.get('tutora').value.trim();
    const fecha = DOM.get('fecha').value;

    if (!paciente || !tutora || !fecha) {
      Utils.notify('Por favor complete todos los campos obligatorios.');
      return false;
    }

    // Check if at least one medication is filled
    const medicamentos = DOM.getAll('.medicamento');
    const indicaciones = DOM.getAll('.indicacion');
    
    for (let i = 0; i < medicamentos.length; i++) {
      if (medicamentos[i].value.trim() && indicaciones[i].value.trim()) {
        return true;
      }
    }

    Utils.notify('Por favor agregue al menos un medicamento con su indicación.');
    return false;
  },

  /**
   * Gets form data
   */
  getData() {
    const paciente = DOM.get('paciente').value.trim();
    const tutora = DOM.get('tutora').value.trim();
    const fecha = DOM.get('fecha').value;
    
    const medicamentos = [];
    const medicamentosInputs = DOM.getAll('.medicamento');
    const indicacionesInputs = DOM.getAll('.indicacion');
    
    for (let i = 0; i < medicamentosInputs.length; i++) {
      const med = medicamentosInputs[i].value.trim();
      const ind = indicacionesInputs[i].value.trim();
      if (med && ind) {
        medicamentos.push({ nombre: med, indicacion: ind });
      }
    }

    return { paciente, tutora, fecha, medicamentos };
  },

  /**
   * Sets form data
   */
  setData(data) {
    // Handle both API and localStorage formats
    const patientName = data.paciente || data.patient_name;
    const ownerName = data.tutora || data.owner_name;
    const prescriptionDate = data.fecha || data.prescription_date;
    const medications = data.medicamentos || data.medications || [];

    DOM.get('paciente').value = patientName;
    DOM.get('tutora').value = ownerName;
    
    // Handle date format conversion
    if (prescriptionDate) {
      if (prescriptionDate.includes('/')) {
        DOM.get('fecha').value = Utils.parseDate(prescriptionDate);
      } else {
        DOM.get('fecha').value = prescriptionDate;
      }
    }

    // Clear existing medications
    const container = DOM.get('medicamentos');
    container.innerHTML = '';

    // Add medications
    medications.forEach((med, index) => {
      const normalizedMed = {
        nombre: med.nombre || med.medication_name,
        indicacion: med.indicacion || med.dosage_instructions
      };
      MedicationManager.addMedicationGroup(normalizedMed, index === 0);
    });
  },

  /**
   * Resets form to initial state
   */
  reset() {
    DOM.get('paciente').value = '';
    DOM.get('tutora').value = '';
    DOM.get('fecha').value = Utils.getTodayDate();

    // Reset medications to just one
    const container = DOM.get('medicamentos');
    container.innerHTML = '';
    MedicationManager.addMedicationGroup(null, true);
  }
};

// =================================
// MEDICATION MANAGEMENT
// =================================
const MedicationManager = {
  /**
   * Adds a new medication group
   */
  addMedicationGroup(data = null, isFirst = false) {
    const container = DOM.get('medicamentos');
    const group = DOM.create('div', { class: 'medicamento-group' });

    // Create header
    const header = DOM.create('div', { class: 'medicamento-header' });
    const label = DOM.create('label', { textContent: 'Medicamento' });
    header.appendChild(label);

    if (!isFirst) {
      const deleteBtn = DOM.create('button', {
        class: 'btn-danger',
        textContent: 'Eliminar',
        onclick: () => group.remove()
      });
      header.appendChild(deleteBtn);
    }

    // Create inputs
    const medicamentoInput = DOM.create('input', {
      type: 'text',
      class: 'medicamento',
      placeholder: 'Nombre del Medicamento',
      value: data ? data.nombre : ''
    });

    const indicacionLabel = DOM.create('label', {
      textContent: 'Indicación',
      style: 'margin-top: 10px;'
    });

    const indicacionInput = DOM.create('textarea', {
      rows: '3',
      class: 'indicacion',
      placeholder: 'Dosis, frecuencia y duración del tratamiento',
      textContent: data ? data.indicacion : ''
    });

    // Assemble group
    group.appendChild(header);
    group.appendChild(medicamentoInput);
    group.appendChild(indicacionLabel);
    group.appendChild(indicacionInput);
    
    container.appendChild(group);
  },

  /**
   * Adds a medication group from button click
   */
  addMedication() {
    this.addMedicationGroup();
  }
};

// =================================
// RECIPE GENERATION
// =================================
const RecipeGenerator = {
  /**
   * Generates and displays recipe
   */
  generate() {
    if (!Form.validate()) return;

    const data = Form.getData();

    // Fill recipe display
    DOM.get('r-paciente').textContent = data.paciente;
    DOM.get('r-tutora').textContent = data.tutora;
    DOM.get('r-fecha').textContent = Utils.formatDate(data.fecha);

    // Fill medications list
    const recetaLista = DOM.get('r-receta');
    recetaLista.innerHTML = '';
    
    data.medicamentos.forEach(med => {
      const item = DOM.create('li', {
        innerHTML: `<strong>${med.nombre}:</strong> ${med.indicacion}`
      });
      recetaLista.appendChild(item);
    });

    // Show recipe view
    ViewManager.showView('resultado');
  }
};

// =================================
// RECIPE STORAGE
// =================================
const RecipeSaver = {
  /**
   * Saves current recipe
   */
  async save() {
    try {
      const paciente = DOM.get('r-paciente').textContent;
      const tutora = DOM.get('r-tutora').textContent;
      const fecha = DOM.get('r-fecha').textContent;
      
      // Extract medications from display
      const medicamentos = [];
      const medicamentosLista = DOM.getAll('#r-receta li');
      
      medicamentosLista.forEach(item => {
        const texto = item.innerHTML;
        const [nombre, indicacion] = texto.split(':</strong> ');
        if (nombre && indicacion) {
          medicamentos.push({
            nombre: nombre.replace('<strong>', ''),
            indicacion: indicacion
          });
        }
      });
      
      const receta = { 
        paciente, 
        tutora, 
        fecha, 
        medicamentos,
        patient_name: paciente,
        owner_name: tutora,
        prescription_date: fecha,
        medications: medicamentos
      };
      
      await Storage.saveRecipe(receta);
      Utils.notify('Receta guardada exitosamente');
    } catch (error) {
      console.error('Error saving recipe:', error);
      Utils.notify('Error al guardar la receta: ' + error.message);
    }
  }
};

// =================================
// SAVED RECIPES MANAGEMENT
// =================================
const SavedRecipes = {
  /**
   * Shows saved recipes view
   */
  async show() {
    ViewManager.showView('recetas-guardadas');
    await this.loadList();
  },

  /**
   * Loads and displays saved recipes list
   */
  async loadList() {
    try {
      const recipes = await Storage.getRecipes();
      const container = DOM.get('lista-recetas');
      
      if (recipes.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay recetas guardadas</p></div>';
        return;
      }
      
      container.innerHTML = '';
      
      // Sort by most recent
      recipes.sort((a, b) => new Date(b.fechaGuardado || b.created_at) - new Date(a.fechaGuardado || a.created_at));
      
      recipes.forEach(recipe => {
        const recipeDiv = this.createRecipeCard(recipe);
        container.appendChild(recipeDiv);
      });
    } catch (error) {
      console.error('Error loading recipes:', error);
      Utils.notify('Error al cargar las recetas: ' + error.message);
    }
  },

  /**
   * Creates a recipe card element
   */
  createRecipeCard(recipe) {
    const card = DOM.create('div', { class: 'receta-item' });
    
    const patientName = recipe.paciente || recipe.patient_name;
    const ownerName = recipe.tutora || recipe.owner_name;
    const prescriptionDate = recipe.fecha || recipe.prescription_date;
    const medications = recipe.medicamentos || recipe.medications || [];
    const savedDate = recipe.fechaGuardado || recipe.created_at;
    
    card.innerHTML = `
      <div class="receta-header">
        <h3>${patientName}</h3>
        <span class="receta-info">Guardada: ${new Date(savedDate).toLocaleDateString()}</span>
      </div>
      <div class="receta-info">
        <strong>Tutor:</strong> ${ownerName}<br>
        <strong>Fecha de receta:</strong> ${prescriptionDate}
      </div>
      <div class="receta-medicamentos">
        <strong>Medicamentos:</strong><br>
        ${medications.map(m => `• ${m.nombre || m.medication_name}: ${m.indicacion || m.dosage_instructions}`).join('<br>')}
      </div>
      <div class="receta-actions">
        <button onclick="SavedRecipes.load('${recipe.id}')" class="btn-small">Cargar</button>
        <button onclick="SavedRecipes.delete('${recipe.id}')" class="btn-danger btn-small">Eliminar</button>
      </div>
    `;
    
    return card;
  },

  /**
   * Loads a recipe into the form
   */
  async load(id) {
    try {
      const recipe = await Storage.getRecipe(id);
      if (!recipe) {
        Utils.notify('Receta no encontrada');
        return;
      }
      
      Form.setData(recipe);
      ViewManager.showView('formulario');
      Utils.notify('Receta cargada en el formulario');
    } catch (error) {
      console.error('Error loading recipe:', error);
      Utils.notify('Error al cargar la receta: ' + error.message);
    }
  },

  /**
   * Deletes a recipe
   */
  async delete(id) {
    if (!Utils.confirm('¿Está seguro de que desea eliminar esta receta?')) {
      return;
    }
    
    try {
      const success = await Storage.deleteRecipe(id);
      if (success) {
        await this.loadList();
        Utils.notify('Receta eliminada');
      } else {
        Utils.notify('Error al eliminar la receta');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      Utils.notify('Error al eliminar la receta: ' + error.message);
    }
  }
};

// =================================
// IMPORT/EXPORT FUNCTIONALITY
// =================================
const DataManager = {
  /**
   * Exports recipes to JSON file
   */
  async export() {
    try {
      const recipes = await Storage.getRecipes();
      
      if (recipes.length === 0) {
        Utils.notify('No hay recetas para exportar');
        return;
      }
      
      const dataStr = JSON.stringify(recipes, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = DOM.create('a', {
        href: URL.createObjectURL(dataBlob),
        download: `recetas_veterinarias_${Utils.getTodayDate()}.json`
      });
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Utils.notify('Recetas exportadas exitosamente');
    } catch (error) {
      console.error('Export error:', error);
      Utils.notify('Error al exportar recetas: ' + error.message);
    }
  },

  /**
   * Imports recipes from JSON file
   */
  async import(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedRecipes = JSON.parse(e.target.result);
        
        if (!Array.isArray(importedRecipes)) {
          throw new Error('Formato de archivo incorrecto');
        }
        
        // Try to use bulk import API first
        try {
          const response = await api.bulkImport(importedRecipes);
          Utils.notify(`${response.data.imported} de ${response.data.total} recetas importadas exitosamente`);
          await SavedRecipes.loadList();
        } catch (apiError) {
          console.warn('API bulk import failed, using localStorage fallback:', apiError);
          
          // Fallback to localStorage
          const currentRecipes = JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
          
          // Add imported recipes with new IDs
          importedRecipes.forEach(recipe => {
            recipe.id = Utils.generateId();
            recipe.fechaGuardado = new Date().toISOString();
            currentRecipes.push(recipe);
          });
          
          localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(currentRecipes));
          
          Utils.notify(`${importedRecipes.length} recetas importadas exitosamente (localStorage)`);
          await SavedRecipes.loadList();
        }
        
      } catch (error) {
        console.error('Import error:', error);
        Utils.notify('Error al importar recetas: Archivo no válido');
      }
    };
    
    reader.readAsText(file);
    
    // Clear input
    event.target.value = '';
  },

  /**
   * Migrate localStorage data to API
   */
  async migrateLocalData() {
    try {
      const result = await Storage.migrateToAPI();
      if (result) {
        await SavedRecipes.loadList();
      }
    } catch (error) {
      console.error('Migration error:', error);
      Utils.notify('Error en la migración: ' + error.message);
    }
  }
};

// =================================
// VIEW MANAGEMENT
// =================================
const ViewManager = {
  /**
   * Shows specified view and hides others
   */
  showView(viewName) {
    // Hide all views
    DOM.hide('formulario');
    DOM.hide('resultado');
    DOM.hide('recetas-guardadas');
    
    // Show requested view
    switch (viewName) {
      case 'formulario':
        DOM.show(DOM.get('formulario').parentElement);
        break;
      case 'resultado':
        DOM.show('resultado');
        break;
      case 'recetas-guardadas':
        DOM.show('recetas-guardadas');
        break;
      default:
        DOM.show(DOM.get('formulario').parentElement);
    }
  },

  /**
   * Shows form view
   */
  showForm() {
    this.showView('formulario');
  },

  /**
   * Creates new recipe (resets form and shows it)
   */
  newRecipe() {
    Form.reset();
    this.showView('formulario');
  }
};

// =================================
// GLOBAL FUNCTIONS (for onclick handlers)
// =================================
window.agregarMedicamento = () => MedicationManager.addMedication();
window.generarReceta = () => RecipeGenerator.generate();
window.guardarReceta = () => RecipeSaver.save();
window.nuevaReceta = () => ViewManager.newRecipe();
window.mostrarRecetasGuardadas = () => SavedRecipes.show();
window.volverFormulario = () => ViewManager.showForm();
window.exportarRecetas = () => DataManager.export();
window.importarRecetas = (event) => DataManager.import(event);

// =================================
// APPLICATION INITIALIZATION
// =================================
document.addEventListener('DOMContentLoaded', async function() {
  // Set today's date
  DOM.get('fecha').value = Utils.getTodayDate();
  
  // Initialize with one medication group
  MedicationManager.addMedicationGroup(null, true);
  
  // Show form view initially
  ViewManager.showView('formulario');
  
  // Check if there's localStorage data to migrate
  try {
    const localRecipes = JSON.parse(localStorage.getItem(CONFIG.localStorageKey)) || [];
    const migrateBtn = DOM.get('migrate-btn');
    
    if (localRecipes.length > 0 && migrateBtn) {
      migrateBtn.style.display = 'inline-block';
      migrateBtn.title = `Migrar ${localRecipes.length} recetas locales a la base de datos`;
    }
  } catch (error) {
    console.warn('Could not check localStorage data:', error);
  }
  
  console.log('Receta Veterinaria App initialized successfully');
});