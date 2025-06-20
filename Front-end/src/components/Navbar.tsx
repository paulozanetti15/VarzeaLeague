import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Paper,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  SportsSoccer,
  People,
  EmojiEvents,
  CalendarMonth,
  Dashboard,
  Logout,
  Person,
  Notifications,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleName } from '../utils/roleUtils';
import '../components/landing/Header.css';

const pages = [
  { name: 'Times', path: '/teams', icon: <People /> },
  { name: 'Partidas', path: '/matches', icon: <SportsSoccer /> },
  { name: 'Campeonatos', path: '/championships', icon: <EmojiEvents /> },
  { name: 'Calendário', path: '/calendar', icon: <CalendarMonth /> },
];

const adminPages = [
  { name: 'Dashboard', path: '/admin', icon: <Dashboard /> },
  { name: 'Usuários', path: '/admin/users', icon: <Person /> },
];

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerUserOpen, setDrawerUserOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Mostra o botão de voltar em todas as páginas exceto na home ('/')
  const showBackButton = location.pathname !== '/';

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setDrawerUserOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDrawerUserOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const drawer = (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
        Várzea League
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List>
        {pages.map((page) => (
          <ListItem
            component="div"
            key={page.name}
            onClick={() => handleNavigation(page.path)}
            sx={{
              backgroundColor: isActive(page.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              color: isActive(page.path) ? 'primary.main' : 'text.primary',
              borderRadius: 2,
              mb: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ color: isActive(page.path) ? 'primary.main' : 'inherit' }}>{page.icon}</ListItemIcon>
            <ListItemText primary={page.name} />
          </ListItem>
        ))}
        {user?.userTypeId === 1 && (
          <>
            <Divider sx={{ my: 1 }} />
            {adminPages.map((page) => (
              <ListItem
                component="div"
                key={page.name}
                onClick={() => handleNavigation(page.path)}
                sx={{
                  backgroundColor: isActive(page.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  color: isActive(page.path) ? 'primary.main' : 'text.primary',
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(page.path) ? 'primary.main' : 'inherit' }}>{page.icon}</ListItemIcon>
                <ListItemText primary={page.name} />
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  );

  // Drawer do usuário (menu lateral animado)
  const userDrawer = (
    <Box
      sx={{
        width: { xs: 270, sm: 320 },
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#fff',
        color: 'primary.main',
        boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.15)',
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        zIndex: 2000,
      }}
      role="presentation"
    >
      <Avatar
        alt={user?.name}
        src={user?.avatar}
        sx={{ width: 90, height: 90, border: '3px solid #1976d2', color: '#1976d2', fontWeight: 700, fontSize: 36, mb: 2 }}
      >
        {user?.name?.charAt(0)}
      </Avatar>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{user?.name}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{user?.email}</Typography>
      {user?.userTypeId && (
        <Chip
          label={getRoleName(user.userTypeId)}
          color="primary"
          variant="outlined"
          sx={{ mb: 3, fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}
        />
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        startIcon={<Person />}
        sx={{ mb: 2, borderRadius: 3, fontWeight: 700, textTransform: 'none', py: 1.2, background: '#1976d2', '&:hover': { background: '#2196f3' } }}
        onClick={() => handleNavigation('/perfil')}
      >
        Perfil
      </Button>
      {user?.userTypeId === 1 && (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Person />}
          sx={{ mb: 2, borderRadius: 3, fontWeight: 700, textTransform: 'none', py: 1.2, background: '#1976d2', '&:hover': { background: '#2196f3' } }}
          onClick={() => handleNavigation('/admin/users')}
        >
          Gerenciar Usuários
        </Button>
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        startIcon={<Logout />}
        sx={{ mb: 2, borderRadius: 3, fontWeight: 700, textTransform: 'none', py: 1.2, background: '#1976d2', '&:hover': { background: '#2196f3' } }}
        onClick={handleLogout}
      >
        Sair
      </Button>
      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
        Várzea League &copy; {new Date().getFullYear()}
      </Typography>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      elevation={0}
    >
      <Box
        sx={{
          background: 'linear-gradient(90deg, #0d47a1 0%, #1976d2 100%)',
          boxShadow: '0 4px 20px rgba(33, 150, 243, 0.10)',
          minHeight: 72,
          color: '#fff',
          width: '100vw',
          maxWidth: '100vw',
          left: 0,
          top: 0,
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1, md: 4 },
          py: 1.5,
          borderRadius: 0,
        }}
      >
        {/* Botão de voltar */}
        {showBackButton && (
          <IconButton onClick={handleBack} sx={{ mr: 2 }} color="primary">
            <ArrowBack />
          </IconButton>
        )}
        {/* Logo e nome */}
        <a
          href="/"
          className="navbar-brand"
          style={{
            textDecoration: 'none',
            position: 'relative',
            display: 'inline-block',
            color: '#fff',
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontFamily: 'Inter, Montserrat, Arial, sans-serif',
            fontSize: '1.55rem',
            lineHeight: 1.1,
            padding: '0.2rem 0',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            verticalAlign: 'middle',
            minWidth: 0,
            maxWidth: '100%',
            whiteSpace: 'nowrap',
          }}
        >
          VÁRZEA LEAGUE
        </a>
        {/* Menu desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          {pages.map((page) => (
            <Button
              key={page.name}
              onClick={() => handleNavigation(page.path)}
              startIcon={page.icon}
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1,
                borderRadius: 8,
                padding: '0.5rem 1.2rem',
                position: 'relative',
                transition: 'all 0.3s',
                '&:hover': {
                  color: '#ffd600',
                  background: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              {page.name}
            </Button>
          ))}
          {user?.userTypeId === 1 && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              {adminPages.map((page) => (
                <Button
                  key={page.name}
                  onClick={() => handleNavigation(page.path)}
                  startIcon={page.icon}
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: 1,
                    borderRadius: 8,
                    padding: '0.5rem 1.2rem',
                    position: 'relative',
                    transition: 'all 0.3s',
                    '&:hover': {
                      color: '#ffd600',
                      background: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  {page.name}
                </Button>
              ))}
            </>
          )}
        </Box>
        {/* Menu mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <IconButton onClick={handleDrawerToggle} color="primary">
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            PaperProps={{
              sx: {
                width: 260,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        {/* Avatar e notificações */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
            <Tooltip title="Notificações">
              <IconButton sx={{ color: 'primary.main' }}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Abrir menu do usuário">
              <IconButton onClick={() => setDrawerUserOpen(true)} sx={{ p: 0 }}>
                <Avatar
                  alt={user.name}
                  src={user.avatar}
                  sx={{
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                    border: '2px solid #ffd600',
                    boxShadow: '0 2px 8px rgba(13,71,161,0.10)',
                  }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Drawer
              anchor="right"
              open={drawerUserOpen}
              onClose={() => setDrawerUserOpen(false)}
              PaperProps={{
                sx: {
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                  background: 'linear-gradient(90deg, #0d47a1 0%, #1976d2 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.10)',
                  zIndex: theme.zIndex.appBar + 20,
                },
              }}
              transitionDuration={350}
              disableScrollLock
              ModalProps={{ style: { zIndex: 2010 } }}
            >
              {userDrawer}
            </Drawer>
          </Box>
        )}
      </Box>
    </AppBar>
  );
};

export default Navbar; 