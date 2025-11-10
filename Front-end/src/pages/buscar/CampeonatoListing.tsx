import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import MatchFilters from '../../features/matches/MatchFilters/MatchFilters';
import { format } from 'date-fns';
import './CampeonatoListing.css';

type Championship = any;

const ChampionshipCard: React.FC<{ champ: Championship; clickable: boolean }> = ({ champ, clickable }) => {
  const navigate = useNavigate();
  const goToDetail = () => {
    if (champ && (champ.id || champ.id === 0)) navigate(`/championships/${champ.id}`);
  };
  
  return (
    <div 
      className="championship-card-modern"
      onClick={clickable ? goToDetail : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className="championship-card-avatar">
        {(champ.name || 'C').charAt(0)}
      </div>
      
      <div className="championship-card-content">
        <h3 className="championship-card-title">{champ.name || 'Campeonato sem nome'}</h3>
        {champ.description && (
          <p className="championship-card-description">{champ.description}</p>
        )}
        
        <div className="championship-card-info">
          <div className="championship-card-dates">
            <span className="championship-date-badge">
              📅 Início: {champ.start_date ? format(new Date(champ.start_date), 'dd/MM/yyyy') : '-'}
            </span>
            <span className="championship-date-badge">
              🏁 Fim: {champ.end_date ? format(new Date(champ.end_date), 'dd/MM/yyyy') : '-'}
            </span>
          </div>
          
          {champ.modalidade && (
            <span className="championship-info-badge">
              ⚽ {champ.modalidade}
            </span>
          )}
          
          {champ.genero && (
            <span className="championship-info-badge">
              👥 {champ.genero}
            </span>
          )}
          
          {champ.nome_quadra && (
            <span className="championship-info-badge">
              📍 {champ.nome_quadra}
            </span>
          )}
        </div>
      </div>
      
      <div className="championship-card-badge">
        <span className="status-badge status-championship">🏆 Campeonato</span>
      </div>
    </div>
  );
};

const CampeonatoListing: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [champs, setChamps] = useState<Championship[]>([]);

  const [filters, setFilters] = useState({
    searchChampionships: '',
    championshipDateFrom: '',
    championshipDateTo: '',
    statuses: [] as string[],
    sort: 'date_desc',
    type: 'championships'
  });

  const buildQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.searchChampionships) params.set('searchChampionships', filters.searchChampionships);
    if (filters.championshipDateFrom) params.set('championshipDateFrom', filters.championshipDateFrom);
    if (filters.championshipDateTo) params.set('championshipDateTo', filters.championshipDateTo);
    if (filters.sort) params.set('sort', filters.sort);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // validação de datas: se "de" > "até" mostramos alerta e não buscamos
      if (filters.championshipDateFrom && filters.championshipDateTo) {
        const from = new Date(`${filters.championshipDateFrom}T00:00:00`);
        const to = new Date(`${filters.championshipDateTo}T23:59:59.999`);
        if (from > to) {
          window.alert('Data inicial não pode ser posterior à data final. Ajuste as datas.');
          return;
        }
      }

      setLoading(true);
      try {
        const qs = buildQuery ? `?${buildQuery}` : '';
        const res = await fetch(`${API_BASE_URL}/championships${qs}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setChamps(Array.isArray(data) ? data : []);
        } else {
          if (mounted) setChamps([]);
        }
      } catch (err) {
        console.error('Erro ao buscar campeonatos', err);
        if (mounted) setChamps([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [buildQuery, filters.championshipDateFrom, filters.championshipDateTo]);

  return (
    <main className="buscar-campeonatos-container">
      <div className="buscar-header">
        <h1 className="buscar-title">🏆 Buscar Campeonatos</h1>
        <p className="buscar-subtitle">Encontre e acompanhe campeonatos</p>
      </div>

      <div className="buscar-layout">
        <aside className="buscar-sidebar">
          <MatchFilters
            filters={filters as any}
            onChange={(next) => setFilters(next)}
            onClear={() => setFilters({ searchChampionships: '', championshipDateFrom: '', championshipDateTo: '', statuses: [], sort: 'date_desc', type: 'championships' })}
            defaultStatuses={[]}
            showTypeSelector={false}
          />
        </aside>

        <section className="buscar-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando campeonatos...</p>
            </div>
          ) : (
            <>
              {champs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏆</div>
                  <h3>Nenhum campeonato encontrado</h3>
                  <p>Tente ajustar os filtros para ver mais resultados</p>
                </div>
              ) : (
                <div className="championships-grid">
                  {champs.slice(0, 50).map((c: any) => (
                    <ChampionshipCard key={c.id} champ={c} clickable={true} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default CampeonatoListing;
