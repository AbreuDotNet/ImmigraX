# ImmigraX - Sistema de Gestión Legal para Inmigración

## Descripción

ImmigraX es un sistema completo de gestión legal especializado en servicios de inmigración. Incluye un backend .NET y un frontend React con TypeScript para proporcionar una solución integral para bufetes de abogados y profesionales del derecho de inmigración.

## Características Principales

### Backend (.NET 8)
- **API RESTful** con autenticación JWT
- **Base de datos PostgreSQL** con Entity Framework Core
- **Roles de usuario**: Master, Abogado, Secretario
- **Gestión completa de clientes**
- **Sistema de citas y documentos**
- **Notas y seguimiento de casos**
- **Búsqueda avanzada**
- **Reportes y analytics**
- **Rate limiting y middleware de seguridad**
- **Swagger/OpenAPI documentation**

### Frontend (React + TypeScript)
- **Material-UI** para una interfaz moderna y profesional
- **React Router v6** para navegación
- **TanStack React Query** para gestión de estado del servidor
- **Axios** con interceptors para manejo de API
- **Dashboard ejecutivo** con métricas en tiempo real
- **Gestión de clientes, citas y documentos**
- **Sistema de autenticación integrado**
- **Diseño responsive**
- **Modo offline** con datos mock como fallback

## Tecnologías Utilizadas

### Backend
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI
- AspNetCoreRateLimit

### Frontend
- React 19.1.1
- TypeScript
- Material-UI (MUI)
- React Router v6
- TanStack React Query
- Axios
- Vite (build tool)

## Estructura del Proyecto

```
ImmigraX/
├── LegalApp.API/                 # Backend .NET
│   ├── Controllers/              # Controladores API
│   ├── Models/                   # Modelos de datos
│   ├── Services/                 # Lógica de negocio
│   ├── Data/                     # Contexto de base de datos
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Middleware/               # Middleware personalizado
│   └── Seeders/                  # Datos de prueba
├── immigrax-client/              # Frontend React
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Páginas de la aplicación
│   │   ├── services/             # Servicios API
│   │   ├── context/              # React Context
│   │   ├── types/                # Tipos TypeScript
│   │   └── config/               # Configuración
│   └── public/                   # Archivos estáticos
└── start-app.ps1                 # Script de inicio automático
```

## Instalación y Configuración

### Prerrequisitos
- .NET 8 SDK
- Node.js (v18+)
- PostgreSQL
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/AbreuDotNet/ImmigraX.git
cd ImmigraX
```

### 2. Configurar el Backend

1. Navegar al directorio del API:
```bash
cd LegalApp.API
```

2. Configurar la cadena de conexión en `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=immigrax_db;Username=tu_usuario;Password=tu_password"
  }
}
```

3. Ejecutar migraciones:
```bash
dotnet ef database update
```

4. Ejecutar el backend:
```bash
dotnet run
```

El API estará disponible en `http://localhost:5109`

### 3. Configurar el Frontend

1. Navegar al directorio del cliente:
```bash
cd immigrax-client
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` (opcional):
```
REACT_APP_API_URL=http://localhost:5109/api
```

4. Ejecutar el frontend:
```bash
npm start
```

El cliente estará disponible en `http://localhost:3000`

### 4. Inicio Automático (Windows)

Para iniciar ambos servicios automáticamente, ejecuta el script PowerShell incluido:

```powershell
.\start-app.ps1
```

## Credenciales de Prueba

El sistema incluye datos de prueba preconfigurados:

### Usuario Master
- **Email**: `dabreu@synerxrd.com`
- **Contraseña**: `Master123!`
- **Rol**: Master (acceso completo)

### Usuario Abogado
- **Email**: `maria.gonzalez@immigrax.com`
- **Contraseña**: `Abogado123!`
- **Rol**: Abogado

### Usuario Secretario
- **Email**: `ana@immigrax.com`
- **Contraseña**: `Secretario123!`
- **Rol**: Secretario

## Funcionalidades

### Dashboard
- Métricas ejecutivas en tiempo real
- Gráficos de casos por estado
- Alertas y notificaciones
- Resumen de actividad reciente

### Gestión de Clientes
- CRUD completo de clientes
- Búsqueda y filtrado avanzado
- Historial de casos
- Documentos asociados

### Sistema de Citas
- Calendario integrado
- Gestión de estados de citas
- Notificaciones automáticas
- Sincronización con casos

### Documentos
- Subida y gestión de archivos
- Categorización por tipo
- Control de versiones
- Acceso basado en roles

### Reportes
- Reportes ejecutivos
- Analytics de casos
- Exportación de datos
- Gráficos interactivos

## API Documentation

Una vez que el backend esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

`http://localhost:5109/swagger`

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte y preguntas, contacta a:
- **Email**: dabreu@synerxrd.com
- **GitHub**: [@AbreuDotNet](https://github.com/AbreuDotNet)

## Roadmap

- [ ] Módulo de facturación
- [ ] Integración con calendarios externos
- [ ] Notificaciones push
- [ ] API móvil
- [ ] Integración con servicios de gobierno
- [ ] Análisis predictivo con IA
- [ ] Soporte multiidioma

---

**ImmigraX** - Transformando la gestión legal de inmigración con tecnología moderna.
