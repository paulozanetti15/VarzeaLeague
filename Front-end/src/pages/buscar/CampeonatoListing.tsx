import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { Box, Grid, CircularProgress, Avatar, Chip, Typography, Paper, Stack } from '@mui/material';
import MatchFilters from '../../features/matches/MatchFilters/MatchFilters';
import { format } from 'date-fns';

type Championship = any;

const ChampionshipCard: React.FC<{ champ: Championship; clickable: boolean }> = ({ champ, clickable }) => {
  const navigate = useNavigate();
  const goToDetail = () => {
    if (champ && (champ.id || champ.id === 0)) navigate(`/championships/${champ.id}`);
  };
  return (
    <Paper
      sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 3, cursor: clickable ? 'pointer' : 'default' }}
      elevation={0}
      onClick={clickable ? goToDetail : undefined}
    >
      <Avatar sx={{ bgcolor: 'warning.main', width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>{(champ.name || 'C').charAt(0)}</Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6">{champ.name || 'Campeonato sem nome'}</Typography>
        <Typography variant="body2" color="text.secondary">{champ.description || ''}</Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <Chip label={`Início: ${champ.start_date ? format(new Date(champ.start_date), 'dd/MM/yyyy') : '-'}`} size="small" />
          <Chip label={`Fim: ${champ.end_date ? format(new Date(champ.end_date), 'dd/MM/yyyy') : '-'}`} size="small" />
        </Stack>
      </Box>
      <Box textAlign="right">
        <Chip label="Campeonato" color="info" size="small" />
      </Box>
    </Paper>
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
    <Box component="main" sx={{ flex: 1, p: { xs: 1, sm: 2 }, mt: { md: 3 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <MatchFilters
            filters={filters as any}
            onChange={(next) => setFilters(next)}
            onClear={() => setFilters({ searchChampionships: '', championshipDateFrom: '', championshipDateTo: '', statuses: [], sort: 'date_desc', type: 'championships' })}
            defaultStatuses={[]}
            showTypeSelector={false}
          />
        </Grid>
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
          ) : (
            <>
              {champs.length === 0 ? (
                <Typography variant="body1">Nenhum resultado.</Typography>
              ) : (
                champs.slice(0, 50).map((c: any) => (
                  <ChampionshipCard key={c.id} champ={c} clickable={true} />
                ))
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CampeonatoListing;
