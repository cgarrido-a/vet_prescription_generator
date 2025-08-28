# 🚀 Guía de Deployment - Receta Veterinaria

## 📋 Pre-requisitos

- [x] Cuenta en GitHub
- [x] Cuenta en Render.com
- [x] Git instalado localmente
- [x] Node.js 16+ (para desarrollo local)

## 🔄 Pasos para Deployment

### 1. Preparar el Código

```bash
# Clonar o verificar que tienes todos los archivos
cd receta-veterinaria

# Verificar estructura
ls -la
# Deberías ver: server.js, package.json, render.yaml, etc.
```

### 2. Crear Repositorio en GitHub

```bash
# Inicializar git (si no existe)
git init

# Agregar archivos
git add .
git commit -m "Sistema completo de recetas veterinarias con DB"

# Crear branch main
git branch -M main

# Conectar con GitHub (reemplazar con tu URL)
git remote add origin https://github.com/TU-USUARIO/receta-veterinaria-app.git

# Subir código
git push -u origin main
```

### 3. Deployment en Render

#### Opción A: Deployment Automático (render.yaml)

1. **Ir a [Render.com](https://render.com)**
2. **Conectar GitHub**: Connect your GitHub account
3. **Crear Nuevo Servicio**: "New" → "Web Service"
4. **Seleccionar Repositorio**: Buscar `receta-veterinaria-app`
5. **Configuración Automática**: Render detectará `render.yaml`
6. **Revisar Configuración**:
   - ✅ Build Command: `npm install`
   - ✅ Start Command: `npm start`
   - ✅ Environment: Node
   - ✅ Plan: Free
7. **Deploy**: Click "Create Web Service"

#### Opción B: Deployment Manual

1. **Crear Base de Datos PostgreSQL**:
   - "New" → "PostgreSQL"
   - Name: `receta-veterinaria-db`
   - Plan: Free
   - ✅ Crear y anotar `DATABASE_URL`

2. **Crear Web Service**:
   - "New" → "Web Service"
   - Connect GitHub repo
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     DATABASE_URL=[tu-database-url-de-render]
     JWT_SECRET=[generar-string-aleatorio-32-chars]
     PORT=3000
     CORS_ORIGINS=https://tu-app.onrender.com
     ```

### 4. Verificación

1. **Health Check**: 
   ```
   https://tu-app.onrender.com/api/health
   ```
   
2. **Aplicación Principal**:
   ```
   https://tu-app.onrender.com
   ```

3. **Test API**:
   ```bash
   curl https://tu-app.onrender.com/api/recetas
   ```

## 🔧 Variables de Entorno Importantes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secreto para tokens | `mi-secreto-super-seguro-32-chars` |
| `PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGINS` | Orígenes permitidos | `https://tu-app.onrender.com` |

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

1. **Verificar DATABASE_URL**:
   ```bash
   # En Render dashboard → PostgreSQL service → Connection String
   ```

2. **Verificar migraciones**:
   ```bash
   # En Render logs, buscar:
   # "Migration 001_create_tables.sql completed successfully"
   ```

### Error: "Port already in use"

- Render asigna automáticamente el puerto
- Usar `process.env.PORT || 3000` en el código

### Error: "CORS policy"

1. **Verificar CORS_ORIGINS** en variables de entorno
2. **Debe incluir** el dominio completo de Render

### Logs de Render

```bash
# Ver logs en tiempo real
https://dashboard.render.com → Tu Service → Logs
```

## 📊 Post-Deployment

### 1. Migrar Datos Locales

Si tienes recetas en localStorage:

1. **Abrir la aplicación web**
2. **Botón "📤 Migrar a Base de Datos"** (aparece automáticamente)
3. **Confirmar migración**
4. **Verificar** que las recetas aparecen

### 2. Configurar Dominio (Opcional)

```bash
# En Render Dashboard → Settings → Custom Domains
# Agregar tu dominio personalizado
```

### 3. Monitoreo

- **Health checks**: Render los configura automáticamente
- **Uptime**: Render Free tier puede dormir después de 15 min
- **Logs**: Accesibles desde el dashboard

## 🎯 URLs Finales

```bash
# Aplicación Principal
https://receta-veterinaria-app.onrender.com

# API Health Check  
https://receta-veterinaria-app.onrender.com/api/health

# API Recetas
https://receta-veterinaria-app.onrender.com/api/recetas
```

## 📱 Funcionalidades Post-Deploy

- ✅ **Crear recetas** → Se guardan en PostgreSQL
- ✅ **Ver recetas guardadas** → Desde base de datos
- ✅ **Exportar/Importar** → Funciona con API
- ✅ **Imprimir PDF** → Sin cambios
- ✅ **Responsive** → Funciona en móviles
- ✅ **Offline fallback** → Si hay problemas de conexión

## 🆘 Soporte

Si encuentras problemas:

1. **Revisar logs** en Render Dashboard
2. **Verificar variables** de entorno
3. **Test health check** endpoint
4. **Contactar soporte** si es necesario

---

**¡Tu aplicación está lista para usar en producción!** 🎉