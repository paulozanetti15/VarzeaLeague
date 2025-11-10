import React, { useState } from 'react';
import { AppBar, IconButton, Avatar, Tooltip } from '@mui/material';
import { Menu as MenuIcon, ArrowBack, Search, Dashboard } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NavbarBrand from './Navbar/NavbarBrand';
import RoleMenu from './Navbar/RoleMenu';
import UserDrawer from './Navbar/UserDrawer';
import MobileDrawer from './Navbar/MobileDrawer';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerUserOpen, setDrawerUserOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const showBackButton = location.pathname !== '/' && location.pathname !== '/dashboard';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <AppBar position="fixed" elevation={0}>
      <div className="navbar-appbar">
        {/* Botão de voltar */}
        {showBackButton && (
          <IconButton onClick={handleBack} className="navbar-back-button">
            <ArrowBack />
          </IconButton>
        )}
        <NavbarBrand />
        <div className="navbar-desktop-menu">
          <RoleMenu />
          <button
            className="navbar-menu-button"
            onClick={() => navigate('/dashboard')}
          >
            <Dashboard /> Dashboard
          </button>
          <button
            className="navbar-menu-button"
            onClick={() => navigate('/buscar-partidas')}
          >
            <Search /> Buscar Partidas Amistosas
          </button>
          <button
            className="navbar-menu-button"
            onClick={() => navigate('/buscar-campeonatos')}
          >
            <Search /> Buscar Campeonatos
          </button>
        </div>
        <div className="navbar-mobile-menu">
          <IconButton onClick={handleDrawerToggle} className="navbar-mobile-toggle">
            <MenuIcon />
          </IconButton>
          <MobileDrawer open={mobileOpen} onClose={handleDrawerToggle} />
        </div>

        {user ? (
          <div className="navbar-user-actions">
            <NotificationDropdown />
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
            <UserDrawer open={drawerUserOpen} onClose={() => setDrawerUserOpen(false)} />
          </div>
        ) : (
          <div className="navbar-auth-buttons">
            <button
              className="navbar-login-button"
              onClick={() => navigate('/login')}
            >
              Entrar
            </button>
            <button
              className="navbar-register-button"
              onClick={() => navigate('/register')}
            >
              Registrar
            </button>
          </div>
        )}
      </div>
    </AppBar>
  );
};

export default Navbar;