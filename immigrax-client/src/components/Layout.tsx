import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box,  Drawer,  AppBar,  Toolbar,  List,  Typography,  Divider, 
         IconButton,  ListItem,  ListItemButton,  ListItemIcon,  ListItemText,
        Avatar,  Menu,  MenuItem,  Chip, Paper, } from '@mui/material';
import {
  Menu as MenuIcon,  Dashboard,  People,  Event,  Description,  Payment,
  Note,  Search,  Logout,  AccountCircle,  Settings,  Gavel,  FlightTakeoff,  Assignment, Assessment, } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

interface MenuItemType {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
}

const menuItems: MenuItemType[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Clientes', icon: <People />, path: '/clients' },
  { text: 'Citas', icon: <Event />, path: '/appointments' },
  { text: 'Documentos', icon: <Description />, path: '/documents' },
  { text: 'Pagos', icon: <Payment />, path: '/payments' },
  { text: 'Notas', icon: <Note />, path: '/notes' },
  { text: 'Formularios', icon: <Assignment />, path: '/forms' },
  { text: 'Reportes', icon: <Assessment />, path: '/reports' },
  { text: 'Búsqueda', icon: <Search />, path: '/search' },
];

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Master':
        return 'error';
      case 'Abogado':
        return 'primary';
      case 'Secretario':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
        borderRight: '1px solid #e3f2fd',
        position: 'relative',
      }}
    >
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
            borderRadius: 2,
            p: 1,
            transition: 'all 0.2s ease-in-out',
          }}
          onClick={() => handleNavigation('/dashboard')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <Gavel sx={{ color: 'primary.main', mr: 0.5, fontSize: 20 }} />
            <FlightTakeoff sx={{ color: 'primary.main', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" noWrap component="div" color="primary" fontWeight="bold">
            ImmigraX
          </Typography>
        </Box>
      </Toolbar>
      
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            mb: 1,
            display: 'block',
          }}
        >
          NAVEGACIÓN
        </Typography>
      </Box>
      
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  boxShadow: isActive ? '0 2px 8px rgba(25, 118, 210, 0.2)' : 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : '#f5f5f5',
                    transform: 'translateY(-1px)',
                    boxShadow: isActive 
                      ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? 'white' : 'primary.main',
                    minWidth: 40,
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
            ImmigraX v1.0
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
            Sistema de Gestión Legal
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box 
            sx={{ 
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              borderRadius: 1,
              p: 0.5,
              mr: 2
            }}
            onClick={() => handleNavigation('/dashboard')}
          >
            <Gavel sx={{ color: 'white', mr: 0.5, fontSize: 20 }} />
            <FlightTakeoff sx={{ color: 'white', fontSize: 18, mr: 1 }} />
            <Typography variant="h6" noWrap component="div" color="white" fontWeight="bold">
              ImmigraX
            </Typography>
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Sistema de Gestión Legal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={user?.role}
              color={getRoleColor(user?.role || '')}
              size="small"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                {user?.fullName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <Box>
            <Typography variant="body2">{user?.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
