import { useEffect, useState } from 'react';
import {
  AppBar,
  IconButton,
  Typography,
  Avatar,
  Tooltip,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Chip,
} from '@mui/material';

import {
  Menu as MenuIcon,
  SportsSoccer,
  People,
  EmojiEvents,
  Leaderboard,
  Dashboard,
  Logout,
  Person,
  Notifications,
  ArrowBack,
  CalendarMonth,
  Search,
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleName } from '../utils/roleUtils';
import { History } from '@mui/icons-material';
import { api } from '../services/api';
import Dropdown from 'react-bootstrap/Dropdown';
import { SplitButton } from 'react-bootstrap';
import './Navbar.css';


const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerUserOpen, setDrawerUserOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [hasTeam, setHasTeam] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const checkTeams = async () => {
      try {
        const teams = await api.teams.list();
        if (!mounted) return;
        setHasTeam(Array.isArray(teams) && teams.length > 0);
      } catch (e) {
        if (!mounted) return;
        setHasTeam(false);
      }
    };
    if (user) {
      checkTeams();
    } else {
      setHasTeam(false);
    }
    return () => { mounted = false; };
  }, [user]);

  const showBackButton = location.pathname !== '/' && location.pathname !== '/dashboard';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  

  const handleNavigation = (path: string) => {
    if (path.startsWith('/historico') && !hasTeam) {
      navigate('/teams');
      setMobileOpen(false);
      setDrawerUserOpen(false);
      return;
    }
    navigate(path);
    setMobileOpen(false);
    setDrawerUserOpen(false);
    
  };

  const handleLogout = () => {
    logout();
    setDrawerUserOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const role = user?.userTypeId;
  const visiblePages = (() => {
    const base = [] as { name: string; path: string; icon: JSX.Element }[];
    if (!role) return [
      { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    ];
    switch (role) {
      case 1:
        return [
          { name: 'Times', path: '/teams', icon: <People /> },
          { name: 'Usuários', path: '/admin/users', icon: <Person /> },
          { name: 'Partidas', path: '/matches', icon: <SportsSoccer /> },
          { name: 'Campeonatos', path: '/championships', icon: <EmojiEvents /> },
           { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        ];
      case 2:
        return [
          { name: 'Partidas', path: '/matches', icon: <SportsSoccer /> },
          { name: 'Campeonatos', path: '/championships', icon: <EmojiEvents /> },
           { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        ];
      case 3:
        return [
          { name: 'Times', path: '/teams', icon: <People /> },
          ...(hasTeam ? [{ name: 'Histórico', path: '/historico', icon: <History/> }] : []),
          ...(hasTeam ? [{ name: 'Calendário', path: '/calendario', icon: <CalendarMonth/> }] : []),
          { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        ];
      case 4:
        return [
          { name: 'Ranking', path: '/ranking/jogadores', icon: <Leaderboard /> },
        ];
      default:
        return base;
    }
  })();

  const drawer = (

    <div className="navbar-drawer">
      <Typography variant="h6" className="navbar-drawer-title">
        Várzea League
      </Typography>
      <Divider className="navbar-divider" />
      <List className="navbar-drawer-list">
        {!user && (
          <>
            <Divider className="navbar-divider" />
            <ListItem
              component="div"
              key="Login"
              onClick={() => handleNavigation('/login')}
              className={`navbar-drawer-item ${isActive('/login') ? 'active' : ''}`}
            >
              <ListItemIcon className="navbar-drawer-item-icon">
                <Login />
              </ListItemIcon>
              <ListItemText primary="Entrar" />
            </ListItem>
            <ListItem
              component="div"
              key="Register"
              onClick={() => handleNavigation('/register')}
              className={`navbar-drawer-item ${isActive('/register') ? 'active' : ''}`}
            >
              <ListItemIcon className="navbar-drawer-item-icon">
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Registrar" />
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  const userDrawer = (
    <div className="navbar-user-drawer">
      <Avatar
        alt={user?.name}
        src={user?.avatar}
        className="navbar-user-avatar"
      >
        {user?.name?.charAt(0)}
      </Avatar>
      <Typography variant="h6" className="navbar-user-name">{user?.name}</Typography>
      <Typography variant="body2" className="navbar-user-email">{user?.email}</Typography>
      {user?.userTypeId && (
        <Chip
          label={getRoleName(user.userTypeId)}
          color="primary"
          variant="outlined"
          className="navbar-user-role-chip"
        />
      )}
      <button
        className="navbar-user-button"
        onClick={() => handleNavigation('/perfil')}
      >
        <Person /> Perfil
      </button>
      {user?.userTypeId === 1 && (
        <button
          className="navbar-user-button"
          onClick={() => handleNavigation('/admin/users')}
        >
          <Person /> Gerenciar Usuários
        </button>
      )}
      <button
        className="navbar-user-button"
        onClick={handleLogout}
      >
        <Logout /> Sair
      </button>
      <div className="flex-grow" />
      <Typography variant="caption" className="navbar-user-footer">
        Várzea League &copy; {new Date().getFullYear()}
      </Typography>
    </div>
  );

  return (
    <AppBar position="fixed" elevation={0}>
      <div className="navbar-appbar">
        {/* Botão de voltar */}
        {showBackButton && (
          <IconButton onClick={handleBack} className="navbar-back-button">
            <ArrowBack />
          </IconButton>
        )}
        <div
          onClick={() => handleNavigation('/')}
          className="navbar-brand"
        >
          VÁRZEA LEAGUE
        </div>
        <div className="navbar-desktop-menu">
          {user?.userTypeId === 1 && (
            <div className="navbar-manage-dropdown">
              <SplitButton id="dropdown-basic-button" title={<><Person className="navbar-manage-icon"/> Gerenciar</>}>
                {visiblePages.map((page, index) => (
                  <Dropdown.Item key={index} href={page.path} className="navbar-dropdown-item">
                    <span className="navbar-dropdown-icon">{page.icon}</span>
                    <span className="navbar-dropdown-text">{page.name}</span>
                  </Dropdown.Item>
                ))}
              </SplitButton>
            </div>
          )}
          {user?.userTypeId === 2 && (
            <div className="navbar-manage-dropdown">
              <SplitButton id="dropdown-basic-button" title={<><Person className="navbar-manage-icon"/> Gerenciar</>}>
                {visiblePages.map((page, index) => (
                  <Dropdown.Item key={index} href={page.path} className="navbar-dropdown-item">
                    <span className="navbar-dropdown-icon">{page.icon}</span>
                    <span className="navbar-dropdown-text">{page.name}</span>
                  </Dropdown.Item>
                ))}
              </SplitButton>
            </div>
          )}
          {user?.userTypeId === 3 && (
            <>
              {visiblePages.map((page, index) => (
                <button
                  key={index}
                  className="navbar-menu-button"
                  onClick={() => handleNavigation(page.path)}
                >
                  {page.icon} {page.name}
                </button>
              ))}
            </>
          )}
          

          <button
            className="navbar-menu-button"
            onClick={() => handleNavigation('/listings')}
          >
            <Search /> Procurar
          </button>
        </div>
        <div className="navbar-mobile-menu">
          <IconButton onClick={handleDrawerToggle} className="navbar-mobile-toggle">
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
        </div>

        {user ? (
          <div className="navbar-user-actions">
            <Tooltip title="Notificações">
              <IconButton className="navbar-notification-button">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Abrir menu do usuário">
              <IconButton onClick={() => setDrawerUserOpen(true)} className="navbar-avatar-button">
                <Avatar
                  alt={user.name}
                  src={user.avatar}
                  className="navbar-avatar"
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
            >
              {userDrawer}
            </Drawer>
          </div>
        ) : (
          <div className="navbar-auth-buttons">
            <button
              className="navbar-login-button"
              onClick={() => handleNavigation('/login')}
            >
              <Login /> Entrar
            </button>
            <button
              className="navbar-register-button"
              onClick={() => handleNavigation('/register')}
            >
              <PersonAdd /> Registrar
            </button>
          </div>
        )}
      </div>
    </AppBar>
  );
};

export default Navbar;