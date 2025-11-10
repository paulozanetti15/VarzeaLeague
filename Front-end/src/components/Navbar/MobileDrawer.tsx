import React from 'react';
import { Drawer, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Dashboard, Login, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <div className="navbar-drawer">
      <Typography variant="h6" className="navbar-drawer-title">
        Várzea League
      </Typography>
      <Divider className="navbar-divider" />
      <List className="navbar-drawer-list">
        <ListItem
          component="div"
          key="Dashboard"
          onClick={() => handleNavigation('/dashboard')}
          className="navbar-drawer-item"
        >
          <ListItemIcon className="navbar-drawer-item-icon">
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        {!user && (
          <>
            <Divider className="navbar-divider" />
            <ListItem
              component="div"
              key="Login"
              onClick={() => handleNavigation('/login')}
              className="navbar-drawer-item"
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
              className="navbar-drawer-item"
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

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
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
  );
};

export default MobileDrawer;