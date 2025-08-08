<div align="center">
  <h1>🏛️ ImmigraX</h1>
  <p><strong>Professional Immigration Legal Management System</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#contributing">Contributing</a>
  </p>

  ![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)
  ![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
  ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🚀 Overview

**ImmigraX** is a comprehensive legal management system specifically designed for immigration law practices. Built with modern technologies, it provides an end-to-end solution for law firms, attorneys, and immigration professionals to streamline their workflow and enhance client service delivery.

### 🎯 Key Highlights

- **🏢 Multi-tenant Architecture**: Support for multiple law firms with complete data isolation
- **📋 DS-160 Form Management**: Complete implementation of US immigration form DS-160 with dynamic field generation
- **⚡ Real-time Dashboard**: Executive metrics and analytics with live updates
- **🔐 Enterprise Security**: JWT authentication, role-based access control, and rate limiting
- **📱 Responsive Design**: Modern UI that works seamlessly across all devices
- **🌐 API-First**: RESTful API with comprehensive OpenAPI/Swagger documentation

## ✨ Features

### 🖥️ Backend (.NET 8)
- **RESTful API** with JWT authentication and authorization
- **PostgreSQL database** with Entity Framework Core ORM
- **Role-based access control**: Master, Lawyer, Secretary roles
- **Comprehensive client management** with case tracking
- **Appointment scheduling system** with calendar integration
- **Document management** with secure file uploads
- **Advanced search capabilities** across all entities
- **Executive reports and analytics** with data visualization
- **Rate limiting and security middleware** for API protection
- **Complete OpenAPI/Swagger documentation**

### ⚛️ Frontend (React + TypeScript)
- **Material-UI (MUI)** for professional, accessible interface
- **React Router v6** for client-side routing
- **TanStack React Query** for efficient server state management
- **Axios HTTP client** with request/response interceptors
- **Executive dashboard** with real-time metrics and charts
- **CRUD operations** for clients, appointments, and documents
- **Advanced Calendar System** with React Big Calendar integration
- **Priority-based visual scheduling** with color-coded events
- **Responsive appointment management** with multi-view support
- **Integrated authentication** with persistent sessions
- **Fully responsive design** optimized for all screen sizes
- **Offline-ready** with mock data fallback capabilities

## 🛠️ Technology Stack

<table>
<tr>
<td valign="top" width="50%">

### Backend
- **.NET 8** - Modern web framework
- **ASP.NET Core** - Cross-platform web API
- **Entity Framework Core** - Object-relational mapper
- **PostgreSQL** - Advanced open-source database
- **JWT Bearer Authentication** - Secure token-based auth
- **Swagger/OpenAPI** - API documentation
- **AspNetCoreRateLimit** - Request rate limiting

</td>
<td valign="top" width="50%">

### Frontend
- **React 19.1.1** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Material-UI v5** - React component library
- **React Big Calendar** - Advanced calendar scheduling
- **React Router v6** - Declarative routing
- **TanStack React Query** - Data fetching/caching
- **Axios** - HTTP client library
- **Date-fns** - Modern date utility library
- **Vite** - Next-generation build tool

</td>
</tr>
</table>

## 📁 Project Structure

```
ImmigraX/
├── 📁 LegalApp.API/                    # .NET 8 Backend
│   ├── 📁 Controllers/                 # API Controllers
│   │   ├── 📁 Forms/                   # Form management endpoints
│   │   ├── AuthController.cs           # Authentication endpoints
│   │   ├── ClientsController.cs        # Client management
│   │   ├── AppointmentsController.cs   # Appointment scheduling
│   │   └── DashboardController.cs      # Analytics & metrics
│   ├── 📁 Models/                      # Entity Models
│   │   ├── 📁 Forms/                   # Form system entities
│   │   ├── Client.cs                   # Client entity
│   │   ├── User.cs                     # User entity
│   │   └── LawFirm.cs                  # Law firm entity
│   ├── 📁 Services/                    # Business Logic Services
│   │   ├── AuthService.cs              # Authentication logic
│   │   ├── EmailService.cs             # Email notifications
│   │   └── ReportService.cs            # Report generation
│   ├── 📁 Data/                        # Database Context
│   │   └── LegalAppDbContext.cs        # EF Core context
│   ├── 📁 DTOs/                        # Data Transfer Objects
│   │   └── 📁 Forms/                   # Form-related DTOs
│   ├── 📁 Middleware/                  # Custom Middleware
│   │   └── LawFirmPermissionMiddleware.cs
│   ├── 📁 Migrations/                  # Database Migrations
│   └── 📁 Seeders/                     # Sample Data
├── 📁 immigrax-client/                 # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable UI Components
│   │   │   ├── Layout.tsx              # Main application layout
│   │   │   ├── CalendarView.tsx        # Advanced calendar component
│   │   │   ├── AppointmentForm.tsx     # Appointment creation/editing
│   │   │   ├── Dashboard/              # Dashboard components
│   │   │   └── Common/                 # Shared components
│   │   ├── 📁 pages/                   # Application Pages
│   │   │   ├── Login.tsx               # Authentication page
│   │   │   ├── Dashboard.tsx           # Executive dashboard
│   │   │   ├── ClientManagement.tsx    # Client CRUD
│   │   │   └── FormsManagement.tsx     # Form management
│   │   ├── 📁 services/                # API Services
│   │   │   └── apiService.ts           # HTTP client & API calls
│   │   ├── 📁 context/                 # React Context
│   │   │   └── AuthContext.tsx         # Authentication state
│   │   ├── 📁 types/                   # TypeScript Definitions
│   │   │   └── index.ts                # Type definitions
│   │   └── 📁 config/                  # Configuration
│   │       └── index.ts                # App configuration
│   └── 📁 public/                      # Static Assets
├── 📄 start-app.ps1                    # Development startup script
├── 📄 database-extensions.sql          # PostgreSQL extensions
├── 📄 ds160-sample-data.sql           # Sample DS-160 form data
└── 📄 README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** (8.0 or later)
- **[Node.js](https://nodejs.org/)** (18.0 or later) with npm
- **[PostgreSQL](https://www.postgresql.org/download/)** (12.0 or later)
- **[Git](https://git-scm.com/downloads)** for version control

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbreuDotNet/ImmigraX.git
   cd ImmigraX
   ```

2. **Setup PostgreSQL Database**
   ```sql
   -- Create database
   CREATE DATABASE immigrax_db;
   
   -- Create user (optional)
   CREATE USER immigrax_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE immigrax_db TO immigrax_user;
   ```

3. **Configure Backend**
   ```bash
   cd LegalApp.API
   
   # Update connection string in appsettings.json
   # "DefaultConnection": "Host=localhost;Database=immigrax_db;Username=your_user;Password=your_password"
   
   # Install dependencies & run migrations
   dotnet restore
   dotnet ef database update
   
   # Start the API server
   dotnet run
   ```
   
   🌐 **API will be available at:** `http://localhost:5109`  
   📚 **Swagger documentation:** `http://localhost:5109/swagger`

4. **Configure Frontend**
   ```bash
   cd ../immigrax-client
   
   # Install dependencies
   npm install
   
   # Optional: Create .env file for custom API URL
   echo "REACT_APP_API_URL=http://localhost:5109/api" > .env
   
   # Start development server
   npm start
   ```
   
   🌐 **Client will be available at:** `http://localhost:3000`

### ⚡ Quick Start (Windows)

For Windows users, use the automated startup script:

```powershell
# Run from project root
.\start-app.ps1
```

This script will automatically start both the API server and React development server.

## 🔐 Demo Credentials

The system comes with pre-configured demo accounts for testing:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| 👑 **Master** | `dabreu@synerxrd.com` | `nuevaPassword123` | Full system access |
| ⚖️ **Lawyer** | `maria.gonzalez@immigrax.com` | `nuevaPassword123` | Case & client management |
| 📋 **Secretary** | `ana@immigrax.com` | `Secretario123!` | Limited administrative access |

## 🎯 Core Features

<table>
<tr>
<td width="33%" valign="top">

### 📊 **Executive Dashboard**
- Real-time business metrics & KPIs
- Interactive data visualizations
- Case status distribution charts
- Revenue tracking & forecasting
- Recent activity timeline
- Alert notifications system

</td>
<td width="33%" valign="top">

### 👥 **Client Management**
- Complete client lifecycle management
- Advanced search & filtering capabilities
- Case history & document tracking
- Communication logs & notes
- Immigration process status tracking
- Multi-language client support

</td>
<td width="33%" valign="top">

### 📋 **DS-160 Form System**
- Dynamic form generation engine
- Section-based form organization
- Conditional field logic
- Document upload requirements
- Form progress tracking
- Email notification workflows

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 📅 **Appointment Scheduling**
- **📊 Advanced Calendar Views**: Month, Week, Day, and Agenda layouts
- **🎨 Priority-Based Color Coding**: Visual priority system with color indicators
- **🔴 High Priority Indicators**: Red dot markers for urgent appointments
- **👥 Client-Focused Display**: Client names prominently displayed above titles
- **⏰ Smart Time Management**: Integrated time slots with conflict resolution
- **📱 Responsive Design**: Optimized font sizes for all screen sizes
- **🖱️ Interactive Interface**: Click-to-edit appointments with hover effects
- **🔄 Real-time Updates**: Live appointment status and priority changes
- **📧 Automated Notifications**: Email reminders and status updates
- **🔍 Advanced Filtering**: Search and filter by client, priority, or status

</td>
<td width="33%" valign="top">

### 📄 **Document Management**
- Secure file upload & storage
- Document categorization system
- Version control & audit trails
- Role-based access permissions
- Bulk document operations
- Integration with case files

</td>
<td width="33%" valign="top">

### 📈 **Reports & Analytics**
- Executive summary reports
- Case performance analytics
- Revenue & billing insights
- Productivity metrics
- Custom report builder
- Data export capabilities

</td>
</tr>
</table>

## 📋 Form Management System

ImmigraX includes a comprehensive **DS-160 Form Management System** that handles the complete lifecycle of US immigration forms:

### 🏗️ **Architecture**
- **9-table relational structure** for maximum flexibility
- **Multi-tenant design** with law firm isolation
- **Dynamic field generation** based on form templates
- **Conditional logic engine** for smart form behavior

### 📝 **Features**
- ✅ **Form Templates**: Create reusable form structures
- ✅ **Section Management**: Organize forms into logical sections
- ✅ **Field Types**: Support for text, dropdown, checkbox, file upload, and more
- ✅ **Document Requirements**: Define and track required supporting documents
- ✅ **Client Access**: Secure token-based form access for clients
- ✅ **Progress Tracking**: Real-time completion percentage monitoring
- ✅ **Audit Trail**: Complete history of form changes and submissions

## 🔒 Security & Compliance

- **🔐 JWT Authentication**: Secure token-based authentication system
- **👤 Role-Based Access Control**: Granular permissions by user role
- **🏢 Multi-Tenant Architecture**: Complete data isolation between law firms
- **🛡️ Rate Limiting**: API protection against abuse and DoS attacks
- **📝 Audit Logging**: Comprehensive activity tracking and compliance reporting
- **🔒 Data Encryption**: Secure handling of sensitive client information

## 📚 API Documentation

Once the backend is running, access the comprehensive API documentation:

🌐 **Interactive Swagger UI**: [`http://localhost:5109/swagger`](http://localhost:5109/swagger)

### 🔗 **Key Endpoints**

| Endpoint | Description | Authentication |
|----------|-------------|----------------|
| `POST /api/auth/login` | User authentication | ❌ Public |
| `GET /api/dashboard` | Executive metrics | ✅ Required |
| `GET /api/clients` | Client management | ✅ Required |
| `GET /api/forms/templates` | Form templates | ✅ Required |
| `POST /api/forms/send-to-client` | Send forms to clients | ✅ Required |
| `GET /api/forms/public/{token}` | Client form access | ❌ Public |

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🚀 **Getting Started**

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/ImmigraX.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
4. **Make your changes** and commit them:
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-new-feature
   ```
6. **Create a Pull Request** on GitHub

### 📋 **Contribution Guidelines**

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new functionality
- Update documentation as needed
- Ensure all tests pass before submitting

### 🐛 **Reporting Issues**

Found a bug? Please [open an issue](https://github.com/AbreuDotNet/ImmigraX/issues) with:
- Clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- System information (OS, browser, etc.)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 💬 Support & Contact

### 🆘 **Get Help**
- 📧 **Email**: [dabreu@synerxrd.com](mailto:dabreu@synerxrd.com)
- 🐱 **GitHub**: [@AbreuDotNet](https://github.com/AbreuDotNet)
- 🐛 **Issues**: [GitHub Issues](https://github.com/AbreuDotNet/ImmigraX/issues)

### 🤝 **Professional Services**
Need custom implementation or enterprise support? Contact us for:
- Custom feature development
- Enterprise deployment assistance
- Training and consultation services
- Technical support and maintenance

## 🗺️ Roadmap

### ✅ **Recently Completed - Calendar Enhancement Update (v1.2)**
- **🎨 Enhanced Calendar Visualization**: 
  - Improved visual hierarchy with client names prominently displayed
  - Optimized font sizes (0.6rem base) for better readability across all views
  - Red priority indicators (🔴) for high-priority appointments
- **📊 Multi-View Optimization**:
  - **Week View**: Detailed information display with larger event containers (60px min-height)
  - **Month View**: Compact yet readable design with improved font scaling
  - **Day View**: Enhanced time slot visibility with priority indicators
- **⚡ Performance Improvements**:
  - Better event rendering with proper z-index layering
  - Smooth hover animations and transitions
  - Optimized spacing and padding for mobile devices
- **🔧 Technical Enhancements**:
  - Improved TypeScript type safety for appointment data
  - Better error handling for undefined client IDs
  - Enhanced priority conversion between numeric and string formats

### 🎯 **Current Quarter**
- [ ] **Mobile Application** - React Native app for iOS/Android
- [ ] **Advanced Reporting** - Custom report builder with visualizations
- [ ] **Email Integration** - Direct email management within the platform

### 🔮 **Future Plans**
- [ ] **Billing & Invoicing Module** - Complete financial management
- [ ] **Calendar Integration** - Google Calendar, Outlook synchronization
- [ ] **Push Notifications** - Real-time browser and mobile notifications
- [ ] **Government API Integration** - Direct integration with USCIS systems
- [ ] **AI-Powered Analytics** - Predictive case outcome analysis
- [ ] **Multi-Language Support** - Spanish, French, and other languages
- [ ] **White-Label Solution** - Customizable branding for law firms

---

## 🔄 Recent Updates & Improvements

### ✅ Calendar Enhancement (Latest)
- **🎯 Client-First Display**: Client names now prominently displayed above appointment titles
- **📏 Optimized Font Sizes**: Reduced to 0.6rem for better space utilization in weekly view
- **🔴 Priority Indicators**: Visual red indicators for high-priority appointments
- **📱 Responsive Design**: Automatic font adjustments based on screen size
- **🎨 Visual Hierarchy**: Bold client names with subtle title styling

### 🗄️ Document Management System (Enhanced)

#### 📚 Hierarchical Categories
- **Nested Organization**: Parent-child category relationships for advanced organization
- **Visual Customization**: Material-UI colors and icons for each category
- **Smart Sorting**: Configurable order and activation controls
- **Complete API**: Full CRUD operations for category management

#### 🏷️ Flexible Tagging System  
- **Custom Tags**: User-created tags with customizable colors
- **System Tags**: Predefined tags for specific functionalities
- **Usage Analytics**: Automatic tracking of tag usage frequency
- **Multiple Assignment**: Documents can have multiple tags

#### 🔐 Granular Access Control
- **Access Levels**: Public, Restricted, Confidential, HighlyConfidential
- **Specific Permissions**: Individual control over view, edit, delete, and share
- **Expiration Management**: Time-limited permissions with automatic expiry
- **Complete Audit Trail**: Full logging of permission grants and changes

#### 📊 Enhanced Document Model
- **Rich Metadata**: MIME type, file size, SHA-256 hash for integrity
- **Version Control**: Improved versioning with detailed notes
- **Soft Archiving**: Archive documents with audit information
- **Full-Text Search**: Indexed content for fast document searches

### 🛠️ Technical Implementation
- **Database**: New migration `EnhanceDocumentManagementSystem` applied
- **Models**: 4 new entities (DocumentCategory, DocumentTag, DocumentTagAssignment, DocumentUserPermission)  
- **DTOs**: Comprehensive data transfer objects for all new features
- **Relationships**: Complex many-to-many and hierarchical relationships configured
- **Type Safety**: Full TypeScript integration for frontend

---

<div align="center">
  
### 🌟 **Star this repository if you find it helpful!** ⭐

**Built with ❤️ by [Daniel Abreu](https://github.com/AbreuDotNet)**

*Transforming immigration legal practice through modern technology*

</div>
