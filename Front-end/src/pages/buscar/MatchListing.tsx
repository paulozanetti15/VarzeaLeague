import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import { CircularProgress } from '@mui/material';
import MatchFilters from '../../features/matches/MatchFilters/MatchFilters';
import { getStatusLabel } from '../../utils/statusLabels';
import { format } from 'date-fns';
import './MatchListing.css';

type Match = any;
type Championship = any;

const defaultStatuses = [
  { value: 'aberta', label: getStatusLabel('aberta') },
  { value: 'sem_vagas', label: getStatusLabel('sem_vagas') },
  { value: 'confirmada', label: getStatusLabel('confirmada') },
  { value: 'em_andamento', label: getStatusLabel('em_andamento') },
  { value: 'finalizada', label: getStatusLabel('finalizada') },
  { value: 'cancelada', label: getStatusLabel('cancelada') },
];

const MatchCard: React.FC<{ match: Match; clickable: boolean }> = ({ match, clickable }) => {
  const navigate = useNavigate();
  const goToDetail = () => {
    if (match && (match.id || match.id === 0)) {
      navigate(`/matches/${match.id}`);
    }
  };
  
  const statusClass = match.status?.toLowerCase().replace(/\s+/g, '_') || 'aberta';
  
  return (
    <div 
      className="match-card-modern"
      onClick={clickable ? goToDetail : undefined}
      role={clickable ? 'button' : undefined}
      aria-label={`Abrir partida ${match?.title ?? ''}`}
      tabIndex={clickable ? 0 : -1}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="card-layout">
        <div className="card-avatar">
          {(match.title || 'P').charAt(0).toUpperCase()}
        </div>
        
        <div className="card-content">
          <h3 className="card-title">{match.title || 'Partida sem título'}</h3>
          <div className="card-location">{match.location || 'Local não informado'}</div>
          
          <div className="card-badges">
            <span className="card-badge date">
              📅 {match.date ? format(new Date(match.date), 'dd/MM/yyyy') : 'Data não definida'}
            </span>
            <span className="card-badge registration">
              ⏰ Inscrição até: {match.registrationDeadline ? format(new Date(match.registrationDeadline), 'dd/MM/yyyy') : 'Não definida'}
            </span>
          </div>
        </div>
        
        <div className="card-status">
          <span className={`status-badge ${statusClass}`}>
            {getStatusLabel(match.status)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ChampionshipCard: React.FC<{ champ: Championship; clickable: boolean }> = ({ champ, clickable }) => {
  const navigate = useNavigate();
  const goToDetail = () => {
    if (champ && (champ.id || champ.id === 0)) {
      navigate(`/championships/${champ.id}`);
    }
  };
  
  return (
    <div 
      className="championship-card-modern"
      onClick={clickable ? goToDetail : undefined}
      role={clickable ? 'button' : undefined}
      aria-label={`Abrir campeonato ${champ?.name ?? ''}`}
      tabIndex={clickable ? 0 : -1}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="card-layout">
        <div className="card-avatar">
          {(champ.name || 'C').charAt(0).toUpperCase()}
        </div>
        
        <div className="card-content">
          <h3 className="card-title">{champ.name || 'Campeonato sem nome'}</h3>
          {champ.description && <div className="card-location">{champ.description}</div>}
          
          <div className="card-badges">
            <span className="card-badge date">
              🏁 Início: {champ.start_date ? format(new Date(champ.start_date), 'dd/MM/yyyy') : 'Não definido'}
            </span>
            <span className="card-badge date">
              🏆 Fim: {champ.end_date ? format(new Date(champ.end_date), 'dd/MM/yyyy') : 'Não definido'}
            </span>
          </div>
        </div>
        
        <div className="card-status">
          <span className="status-badge championship">
            Campeonato
          </span>
        </div>
      </div>
    </div>
  );
};

const MatchListing: React.FC = () => {
  
  const { user } = useAuth();
  const location = useLocation();
  const canClick = user?.userTypeId === 1 || user?.userTypeId === 2 || user?.userTypeId === 3;
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [champs, setChamps] = useState<Championship[]>([]);

  // Determinar o tipo inicial baseado na rota
  const getInitialType = () => {
    if (location.pathname === '/buscar-campeonatos') {
      return 'championships';
    }
    if (location.pathname === '/buscar-partidas') {
      return 'matches';
    }
    return 'both';
  };

  const [filters, setFilters] = useState({
    searchMatches: '',
    searchChampionships: '',
    matchDateFrom: '',
    registrationDateFrom: '',
    championshipDateFrom: '',
    championshipDateTo: '',
    statuses: [] as string[],
    sort: 'date_desc',
    type: getInitialType(),
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const champsRes = await fetch(`${API_BASE_URL}/championships`);
        if (champsRes.ok) {
          const c = await champsRes.json();
          setChamps(Array.isArray(c) ? c : []);
        } else {
          setChamps([]);
        }
      } catch (err) {
        console.error('Erro ao carregar times/campeonatos', err);
        setChamps([]);
      }
    };
    loadMeta();
  }, []);

  const buildQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.searchMatches) params.set('searchMatches', filters.searchMatches);
    if (filters.searchChampionships) params.set('searchChampionships', filters.searchChampionships);
    if (filters.statuses.length) params.set('status', filters.statuses.join(','));
    if (filters.matchDateFrom) params.set('matchDateFrom', filters.matchDateFrom);
    if (filters.registrationDateFrom) params.set('registrationDateFrom', filters.registrationDateFrom);
    if (filters.championshipDateFrom) params.set('championshipDateFrom', filters.championshipDateFrom);
    if (filters.championshipDateTo) params.set('championshipDateTo', filters.championshipDateTo);
    if (filters.sort) params.set('sort', filters.sort);
    // Adicionar filtro para partidas amistosas apenas na rota /buscar-partidas
    if (location.pathname === '/buscar-partidas') {
      params.set('friendlyOnly', 'true');
    }
    return params.toString();
  }, [filters, location.pathname]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
  const qs = buildQuery ? `?${buildQuery}` : '';
  const res = await fetch(`${API_BASE_URL}/friendly-matches${qs}`);
        let data = [] as any[];
        if (res.ok) {
          data = await res.json();
        } else {
          console.warn('Não foi possível buscar partidas (status:', res.status, ')');
          data = [];
        }

        const filteredMatches = (data || []).filter((m: Match) => {
          if (filters.searchMatches) {
            const s = filters.searchMatches.toLowerCase();
            const hay = `${m.title || ''} ${m.description || ''} ${m.location || ''}`.toLowerCase();
            if (!hay.includes(s)) return false;
          }
          // filtros por time/campeonato removidos
          if (filters.statuses.length && !filters.statuses.includes(m.status)) return false;
          if (filters.matchDateFrom) {
            const from = new Date(`${filters.matchDateFrom}T00:00:00`);
            const md = m.date ? new Date(m.date) : null;
            if (!md || md < from) return false;
          }
          if (filters.registrationDateFrom) {
            const from = new Date(`${filters.registrationDateFrom}T00:00:00`);
            const rd = m.registrationDeadline ? new Date(m.registrationDeadline) : null;
            if (!rd || rd < from) return false;
          }
          return true;
        });
        if (mounted) setMatches(filteredMatches.slice(0, 50));
      } catch (err) {
        console.error('Erro ao buscar partidas', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, [buildQuery]);

  const filteredChamps = (champs || []).filter((c: any) => {
    if (filters.searchChampionships) {
      const s = filters.searchChampionships.toLowerCase();
      const hay = `${c.name || ''} ${c.description || ''}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    if (filters.championshipDateFrom) {
      const from = new Date(`${filters.championshipDateFrom}T00:00:00`);
      const sd = c.start_date ? new Date(c.start_date) : null;
      if (!sd || sd < from) return false;
    }
    if (filters.championshipDateTo) {
      const to = new Date(`${filters.championshipDateTo}T23:59:59.999`);
      const sd = c.start_date ? new Date(c.start_date) : null;
      if (!sd || sd > to) return false;
    }
    return true;
  });

  return (
    <div className="buscar-partidas-container">
      <div className="buscar-header">
        <h1 className="buscar-title">
          {location.pathname === '/buscar-campeonatos' ? '🏆 Buscar Campeonatos' : '⚽ Buscar Partidas'}
        </h1>
        <p className="buscar-subtitle">
          Encontre as melhores partidas e campeonatos perto de você
        </p>
      </div>

      <div className="buscar-layout">
        <aside className="buscar-filters-sidebar">
          <MatchFilters
            filters={filters}
            onChange={(next) => setFilters(next)}
            onClear={() => setFilters({ 
              searchMatches: '', 
              searchChampionships: '', 
              matchDateFrom: '', 
              registrationDateFrom: '', 
              championshipDateFrom: '', 
              championshipDateTo: '', 
              statuses: [], 
              sort: 'date_desc', 
              type: getInitialType() 
            })}
            onApply={() => { /* no-op: filters are applied live */ }}
            defaultStatuses={defaultStatuses}
            showTypeSelector={location.pathname !== '/buscar-partidas' && location.pathname !== '/buscar-campeonatos'}
          />
        </aside>
        
        <main className="buscar-results">
          {loading ? (
            <div className="buscar-loading">
              <CircularProgress size={60} thickness={4} />
              <p className="buscar-loading-text">Carregando resultados...</p>
            </div>
          ) : (
            <>
              {(() => {
                const items: { type: 'match' | 'champ'; date: Date | null; data: any }[] = [];
                filteredChamps.forEach((c: any) => items.push({ type: 'champ', date: c.start_date ? new Date(c.start_date) : null, data: c }));
                matches.forEach((m: any) => items.push({ type: 'match', date: m.date ? new Date(m.date) : null, data: m }));

                const filteredByType = items.filter(it => {
                  if (filters.type === 'both') return true;
                  if (filters.type === 'matches') return it.type === 'match';
                  if (filters.type === 'championships') return it.type === 'champ';
                  return true;
                });

                filteredByType.sort((a, b) => {
                  const da = a.date ? a.date.getTime() : 0;
                  const db = b.date ? b.date.getTime() : 0;
                  return filters.sort === 'date_desc' ? db - da : da - db;
                });

                if (filteredByType.length === 0) {
                  return (
                    <div className="buscar-empty">
                      <div className="buscar-empty-icon">🔍</div>
                      <h2 className="buscar-empty-title">Nenhum resultado encontrado</h2>
                      <p className="buscar-empty-text">
                        Tente ajustar os filtros ou buscar por outros termos
                      </p>
                    </div>
                  );
                }

                return filteredByType.slice(0, 20).map((it, idx) => (
                  <React.Fragment key={it.type + '-' + (it.data.id || idx)}>
                    {it.type === 'champ' ? (
                      <ChampionshipCard champ={it.data} clickable={!!canClick} />
                    ) : (
                      <MatchCard match={it.data} clickable={!!canClick} />
                    )}
                  </React.Fragment>
                ));
              })()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MatchListing;
