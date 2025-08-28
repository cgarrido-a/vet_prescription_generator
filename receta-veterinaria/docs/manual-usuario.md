# 📖 Manual de Usuario - Sistema de Recetas Veterinarias

## 🎯 Introducción

Este sistema te permite crear, guardar y gestionar recetas veterinarias de manera fácil y rápida desde tu navegador web.

## 🚀 Primeros Pasos

### 1. Abrir la aplicación
- Abre el archivo `index.html` en tu navegador web preferido
- No necesitas conexión a internet para usar la aplicación

### 2. Pantalla principal
Al abrir la aplicación verás:
- **Logo** de la veterinaria en la parte superior
- **Formulario** para crear nuevas recetas
- **Botones** para agregar medicamentos y ver recetas guardadas

## 📝 Crear una Nueva Receta

### Paso 1: Datos del Paciente
1. **Paciente**: Escribe el nombre de la mascota
2. **Tutor(a)**: Escribe el nombre del dueño
3. **Fecha**: Se autocompleta con la fecha actual (puedes cambiarla)

### Paso 2: Agregar Medicamentos
1. **Medicamento**: Nombre del medicamento a recetar
2. **Indicación**: Dosis, frecuencia y duración del tratamiento
3. **Agregar más**: Haz clic en "+ Agregar Medicamento" para más medicamentos
4. **Eliminar**: Usa el botón "Eliminar" para quitar medicamentos extra

### Paso 3: Generar Receta
1. Haz clic en **"Generar Receta"**
2. Se mostrará la receta formateada lista para imprimir

### Paso 4: Opciones de la Receta
- **📄 Imprimir PDF**: Genera un PDF para imprimir
- **💾 Guardar Receta**: Guarda la receta en tu navegador
- **📝 Nueva Receta**: Vuelve al formulario para crear otra receta

## 📋 Gestionar Recetas Guardadas

### Ver Recetas Guardadas
1. Haz clic en **"Ver Recetas Guardadas"** desde el formulario principal
2. Verás una lista de todas las recetas que has guardado

### Cada Receta Muestra:
- **Nombre del paciente** y fecha de guardado
- **Datos del tutor** y fecha de la receta
- **Lista de medicamentos** con sus indicaciones
- **Botones de acción**:
  - **Cargar**: Carga la receta en el formulario para editarla
  - **Eliminar**: Borra la receta permanentemente

## 💾 Respaldo y Restauración

### Exportar Recetas (Respaldo)
1. Ve a "Ver Recetas Guardadas"
2. Haz clic en **"📤 Exportar Recetas"**
3. Se descargará un archivo `.json` con todas tus recetas
4. **Guarda este archivo en un lugar seguro**

### Importar Recetas (Restaurar)
1. Ve a "Ver Recetas Guardadas"
2. Haz clic en **"📥 Importar Recetas"**
3. Selecciona el archivo `.json` que guardaste anteriormente
4. Tus recetas se restaurarán automáticamente

## 🖨️ Imprimir Recetas

### Método 1: Desde la Receta Generada
1. Después de generar una receta, haz clic en **"📄 Imprimir PDF"**
2. Se abrirá el diálogo de impresión de tu navegador
3. Selecciona tu impresora o "Guardar como PDF"

### Método 2: Navegador
1. Con la receta en pantalla, presiona `Ctrl+P` (o `Cmd+P` en Mac)
2. Los botones y elementos no necesarios se ocultarán automáticamente

## 🔧 Solución de Problemas

### "No se guardan mis recetas"
- **Causa**: El navegador está en modo privado/incógnito
- **Solución**: Usa el navegador en modo normal

### "Perdí mis recetas al cambiar de navegador"
- **Causa**: Los datos están guardados solo en un navegador específico
- **Solución**: Exporta las recetas antes de cambiar y luego impórtalas

### "La página no funciona"
- **Revisa** que todos los archivos estén en las carpetas correctas
- **Prueba** con otro navegador (Chrome, Firefox, etc.)
- **Asegúrate** de abrir `index.html`, no otro archivo

### "No puedo imprimir"
- **Verifica** que tienes una impresora configurada
- **Prueba** "Guardar como PDF" si no tienes impresora
- **Actualiza** tu navegador a la última versión

## 📱 Uso en Móviles

La aplicación funciona en teléfonos y tablets:

### Características Móviles
- ✅ **Diseño adaptable** para pantallas pequeñas
- ✅ **Botones grandes** fáciles de tocar
- ✅ **Teclado optimizado** para campos de texto
- ✅ **Mismas funciones** que en computadora

### Recomendaciones
- Usa **orientación vertical** para mejor experiencia
- **Chrome o Safari** funcionan mejor en móviles
- **Exporta regularmente** tus recetas como respaldo

## 🔒 Privacidad y Seguridad

### Tus Datos Están Seguros
- ✅ **Todo local**: Nada se envía a internet
- ✅ **Sin cuentas**: No necesitas registrarte
- ✅ **Sin servidores**: Funciona completamente offline
- ✅ **Control total**: Solo tú tienes acceso a tus datos

### Recomendaciones de Seguridad
- **Haz respaldos regulares** exportando tus recetas
- **No uses en computadoras públicas** para datos sensibles
- **Mantén actualizado tu navegador**

## 💡 Consejos y Trucos

### Eficiencia
- **Usa atajos de teclado**: `Tab` para navegar entre campos
- **Copia y pega**: Para medicamentos similares
- **Guarda plantillas**: Crea recetas con medicamentos comunes y guárdalas

### Organización
- **Nombres consistentes**: Usa siempre el mismo formato para nombres
- **Fechas claras**: Verifica siempre la fecha antes de generar
- **Respaldos regulares**: Exporta tus recetas semanalmente

### Personalización
- Puedes cambiar el logo reemplazando el archivo en `assets/images/`
- La información del veterinario se puede editar en el código

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas que no puedes resolver con este manual:

1. **Revisa** todos los pasos de este manual
2. **Prueba** cerrar y abrir el navegador
3. **Verifica** que todos los archivos estén en su lugar
4. **Contacta** al soporte técnico si el problema persiste

**¡Esperamos que disfrutes usando el sistema de recetas veterinarias!** 🐾