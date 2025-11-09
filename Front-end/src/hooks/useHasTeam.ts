import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllTeams } from '../services/teams.service';

export const useHasTeam = () => {
  const { user } = useAuth();
  const [hasTeam, setHasTeam] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const checkTeams = async () => {
      try {
        const teams = await getAllTeams();
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

  return hasTeam;
};