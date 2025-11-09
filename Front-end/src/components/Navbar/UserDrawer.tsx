import React from 'react';
import { Avatar, Typography, Drawer, useTheme } from '@mui/material';
import { Person, Logout } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getRoleName } from '../../utils/roleUtils';
import { Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface UserDrawerProps {
  open: boolean;
  onClose: () => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!user) return null;

  const userDrawer = (
    <div className="navbar-user-drawer">
      <Avatar
        alt={user.name}
        src={user.avatar}
        className="navbar-user-avatar"
      >
        {user.name?.charAt(0)}
      </Avatar>
      <Typography variant="h6" className="navbar-user-name">{user.name}</Typography>
      <Typography variant="body2" className="navbar-user-email">{user.email}</Typography>
      {user.userTypeId && (
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
      {user.userTypeId === 1 && (
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
  );
};

export default UserDrawer;