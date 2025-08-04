# ImmigraX - Instrucciones de Inicio

## Para Iniciar la Aplicación Completa

### 1. Iniciar la API de .NET (Terminal 1)
```bash
# Navegar al directorio de la API
cd e:\ImmigraX\LegalApp.API

# Restaurar dependencias (solo la primera vez)
dotnet restore

# Iniciar la API
dotnet run
```

La API estará disponible en: `http://localhost:5109`

### 2. Iniciar el Cliente React (Terminal 2)
```bash
# Navegar al directorio del cliente
cd e:\ImmigraX\immigrax-client

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el cliente React
npm start
```

El cliente estará disponible en: `http://localhost:3000`

## Estado de Conexión

- ✅ **API Conectada**: Los datos se cargan desde tu API de .NET en tiempo real
- ⚠️ **Modo Sin Conexión**: Si la API no está disponible, se muestran datos de ejemplo
- ❌ **Error de Conexión**: Verificar que la API esté ejecutándose

## Configuración

- **URL de la API**: Configurada en `.env` como `REACT_APP_API_URL=http://localhost:5109/api`
- **Puerto de la API**: 5109 (por defecto)
- **Puerto del Cliente**: 3000 (por defecto)

## Funcionalidades Conectadas

✅ **Dashboard**: Conectado a `/api/dashboard`
✅ **Clientes**: Conectado a `/api/clients`  
✅ **Citas**: Conectado a `/api/appointments`
🔄 **Documentos**: Pendiente de implementación
🔄 **Pagos**: Pendiente de implementación
🔄 **Notas**: Pendiente de implementación
🔄 **Búsqueda**: Pendiente de implementación

## Solución de Problemas

### Si la API no conecta:
1. Verificar que la API esté ejecutándose en el puerto 5109
2. Verificar que no haya errores CORS
3. Verificar la URL en el archivo `.env`

### Si hay errores de CORS:
La API debe incluir la configuración CORS para `http://localhost:3000`
