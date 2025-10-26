import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useHasTeam } from '../../hooks/useHasTeam';
import {
  People,
  SportsSoccer,
  EmojiEvents,
  Dashboard,
  History,
  CalendarMonth,
  Search,
} from '@mui/icons-material';
import Dropdown from 'react-bootstrap/Dropdown';
import { SplitButton } from 'react-bootstrap';

const RoleMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasTeam = useHasTeam();

  const visiblePages = useMemo(() => {
    const base = [] as { name: string; path: string; icon: JSX.Element }[];
    if (!user?.userTypeId) return [
      { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    ];
    switch (user.userTypeId) {
      case 1:
        return [
          { name: 'Times', path: '/teams', icon: <People /> },
          { name: 'Usuários', path: '/admin/users', icon: <People /> },
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
          ...(hasTeam ? [{ name: 'Histórico', path: '/historico', icon: <History /> }] : []),
          ...(hasTeam ? [{ name: 'Calendário', path: '/calendario', icon: <CalendarMonth /> }] : []),
          { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        ];
      case 4:
        return [
          { name: 'Ranking', path: '/ranking/jogadores', icon: <People /> },
        ];
      default:
        return base;
    }
  }, [user?.userTypeId, hasTeam]);

  const handleNavigation = (path: string) => {
    if (path.startsWith('/historico') && !hasTeam) {
      navigate('/teams');
      return;
    }
    navigate(path);
  };

  if (!user?.userTypeId) return null;

  if (user.userTypeId === 1 || user.userTypeId === 2) {
    return (
      <div className="navbar-manage-dropdown">
        <SplitButton id="dropdown-basic-button" title={<><People className="navbar-manage-icon"/> Gerenciar</>}>
          {visiblePages.map((page, index) => (
            <Dropdown.Item key={index} href={page.path} className="navbar-dropdown-item">
              <span className="navbar-dropdown-icon">{page.icon}</span>
              <span className="navbar-dropdown-text">{page.name}</span>
            </Dropdown.Item>
          ))}
        </SplitButton>
      </div>
    );
  }

  if (user.userTypeId === 3) {
    return (
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
    );
  }

  return null;
};

export default RoleMenu;