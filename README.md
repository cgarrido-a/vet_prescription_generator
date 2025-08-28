# 🏥 Sistema de Recetas Veterinarias

Sistema web completo para la gestión de recetas veterinarias del Dr. Camilo Vergara, con base de datos PostgreSQL y API REST.

## 📋 Características

- ✅ **Creación de recetas**: Formulario intuitivo para crear recetas veterinarias
- ✅ **Base de datos**: PostgreSQL para almacenamiento persistente y seguro
- ✅ **API REST**: Backend completo con Node.js y Express
- ✅ **Gestión de recetas**: Ver, cargar, editar y eliminar recetas guardadas
- ✅ **Búsqueda**: Buscar recetas por paciente, tutor o medicamentos
- ✅ **Exportar/Importar**: Respaldo y restauración de recetas en formato JSON
- ✅ **Migración**: Migrar datos desde localStorage a la base de datos
- ✅ **Impresión**: Generación de PDF para imprimir recetas
- ✅ **Responsive**: Funciona en computadoras, tablets y móviles
- ✅ **Cloud-ready**: Listo para desplegar en Render, Heroku, etc.
- ✅ **Fallback local**: Funciona offline con localStorage si la API no está disponible

## 🚀 Instalación y Uso

### Desarrollo Local
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/receta-veterinaria-app.git
   cd receta-veterinaria-app
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones de base de datos
   ```

4. **Configurar base de datos**:
   ```bash
   # Crear base de datos PostgreSQL
   createdb receta_veterinaria
   
   # Ejecutar migraciones
   npm run migrate
   ```

5. **Iniciar servidor**:
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

6. **Abrir aplicación**: http://localhost:3000

### Solo Frontend (Sin base de datos)
1. Descarga todos los archivos del proyecto
2. Abre `index.html` en tu navegador web
3. ¡Listo para usar con localStorage!

### Crear una receta
1. Completa los datos del paciente y tutor
2. Agrega los medicamentos necesarios
3. Haz clic en "Generar Receta"
4. Opcionalmente guarda la receta para uso futuro

### Gestionar recetas guardadas
1. Haz clic en "Ver Recetas Guardadas"
2. Desde allí puedes:
   - Cargar una receta existente para editarla
   - Eliminar recetas que ya no necesites
   - Exportar todas tus recetas como respaldo
   - Importar recetas desde un archivo de respaldo

## 📁 Estructura del Proyecto

```
receta-veterinaria/
├── index.html              # Página principal
├── README.md               # Este archivo
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos de la aplicación
│   ├── js/
│   │   └── app.js          # Lógica de la aplicación
│   └── images/
│       ├── logo-veterinario.png  # Logo (opcional)
│       └── firma.png       # Firma digital (opcional)
└── docs/
    └── manual-usuario.md   # Manual detallado
```

## 🚀 Deployment en Render

### Preparación
1. **Crear repositorio en GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/receta-veterinaria-app.git
   git push -u origin main
   ```

### Deploy Automático con render.yaml
1. Conecta tu repositorio de GitHub a Render
2. Render detectará automáticamente el archivo `render.yaml`
3. Se crearán automáticamente:
   - Base de datos PostgreSQL
   - Aplicación web
   - Variables de entorno

### Deploy Manual
1. **Crear base de datos PostgreSQL** en Render
2. **Crear servicio web** con configuración:
   - **Build Command**: `npm install && npm run migrate`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     DATABASE_URL=<your-postgres-url>
     JWT_SECRET=<your-secret-key>
     PORT=3000
     ```

### Verificación
- Health check: `https://tu-app.onrender.com/api/health`
- Aplicación: `https://tu-app.onrender.com`

## 💾 Almacenamiento de Datos

La aplicación soporta **dos modos de almacenamiento**:

### Con Base de Datos (Recomendado)
- ✅ **PostgreSQL**: Almacenamiento persistente y seguro
- ✅ **API REST**: Acceso desde cualquier dispositivo
- ✅ **Búsqueda**: Búsqueda avanzada en la base de datos
- ✅ **Respaldos**: Respaldos automáticos de la base de datos
- ✅ **Escalabilidad**: Soporta múltiples usuarios

### Fallback localStorage
- ✅ **Privacidad**: Tus datos nunca salen de tu computadora
- ✅ **Sin internet**: Funciona sin conexión a internet
- ✅ **Persistencia**: Los datos se mantienen al cerrar el navegador
- ⚠️ **Por navegador**: Los datos están específicos a cada navegador
- ⚠️ **Respaldo**: Usa la función de exportar para hacer respaldos

## 🔧 Personalización

### Cambiar logo y firma
1. Reemplaza `assets/images/logo-veterinario.png` con tu logo
2. Reemplaza `assets/images/firma.png` con tu firma
3. Mantén las dimensiones recomendadas (200x120px para logo, 150x60px para firma)

### Cambiar información del veterinario
Edita el archivo `index.html` en la sección de firma:
```html
<p>
  <strong>Dr. Tu Nombre</strong><br>
  Médico Veterinario<br>
  RUT XX.XXX.XXX-X
</p>
```

## 🌐 Compatibilidad

- ✅ **Chrome** (recomendado)
- ✅ **Firefox**
- ✅ **Safari**
- ✅ **Edge**
- ✅ **Móviles** (iOS Safari, Chrome Android)

## 🔒 Seguridad

- Los datos se almacenan únicamente en tu dispositivo
- No se envía información a servidores externos
- Funciona completamente offline
- No requiere cuentas ni registros

## 📞 Soporte

Para preguntas o problemas técnicos, contacta al desarrollador.

---

**Dr. Camilo Vergara**  
Médico Veterinario  
RUT 17.622.685-4