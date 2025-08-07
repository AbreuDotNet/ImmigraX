import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import Documents from './pages/Documents';
import Payments from './pages/Payments';
import Notes from './pages/Notes';
import SearchPage from './pages/SearchPage';
import FormsManagement from './pages/FormsManagement';
import Reports from './pages/Reports';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="documents" element={<Documents />} />
                <Route path="payments" element={<Payments />} />
                <Route path="notes" element={<Notes />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="forms" element={<FormsManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="roles" element={<RoleManagement />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
