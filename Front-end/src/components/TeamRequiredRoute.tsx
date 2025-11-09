import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {getUserTeams} from '../services/teams.service';

interface TeamRequiredRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const TeamRequiredRoute: React.FC<TeamRequiredRouteProps> = ({ children, redirectTo = '/dashboard' }) => {
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkTeams = async () => {
      try {
        const teams = await getUserTeams();
        if (!mounted) return;
        setHasTeam(Array.isArray(teams) && teams.length > 0);
      } catch (e) {
        // Se falhar (ex.: não autenticado), negar acesso
        if (!mounted) return;
        setHasTeam(false);
      }
    };
    checkTeams();
    return () => { mounted = false; };
  }, []);

  if (hasTeam === null) {
    // Pequeno placeholder de carregamento (poderia ser um spinner)
    return null;
  }

  if (!hasTeam) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default TeamRequiredRoute;
