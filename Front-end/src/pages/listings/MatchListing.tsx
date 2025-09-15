import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  Avatar,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type Match = any;
type Championship = any;

const defaultStatuses = [
  { value: 'open', label: 'Aberta' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Finalizada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const navigate = useNavigate();
  const goToDetail = () => {
    if (match && (match.id || match.id === 0)) {
      navigate(`/matches/${match.id}`);
    }
  };
  return (
    <Paper 
      sx={{ 
        p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 3,
        cursor: 'pointer', transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 6 }
      }} 
      elevation={0}
      onClick={goToDetail}
      role="button"
      aria-label={`Abrir partida ${match?.title ?? ''}`}
      tabIndex={0}
    >
      <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 } }}>{(match.title || 'P').charAt(0)}</Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6">{match.title || 'Partida sem título'}</Typography>
        <Typography variant="body2" color="text.secondary">{match.location || 'Local não informado'}</Typography>
        <Stack direction="row" spacing={1} mt={1}>
          {match.teamA && <Chip size="small" label={match.teamA} />}
          {match.teamB && <Chip size="small" label={match.teamB} />}
        </Stack>
      </Box>
      <Box textAlign="right">
        <Chip label={match.date ? format(new Date(match.date), 'dd/MM/yyyy') : '-'} color="secondary" size="small" />
        <Box mt={1}>
          <Chip label={match.status || '—'} size="small" />
        </Box>
      </Box>
    </Paper>
  );
};

const ChampionshipCard: React.FC<{ champ: Championship }> = ({ champ }) => {
  const navigate = useNavigate();
  const goToDetail = () => {
    if (champ && (champ.id || champ.id === 0)) {
      navigate(`/championships/${champ.id}`);
    }
  };
  return (
    <Paper 
      sx={{ 
        p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 3,
        cursor: 'pointer', transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: 6 }
      }} 
      elevation={0}
      onClick={goToDetail}
      role="button"
      aria-label={`Abrir campeonato ${champ?.name ?? ''}`}
      tabIndex={0}
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

const MatchListing: React.FC = () => {
  const [openFilters, setOpenFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [champs, setChamps] = useState<Championship[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    from: '',
    to: '',
    statuses: [] as string[],
    sort: 'date_desc',
    type: 'both',
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const champsRes = await fetch(`${API_URL}/championships`);
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
    if (filters.search) params.set('search', filters.search);
  // teamId/championshipId removidos dos filtros
    if (filters.statuses.length) params.set('status', filters.statuses.join(','));
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.sort) params.set('sort', filters.sort);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const qs = buildQuery ? `?${buildQuery}` : '';
        const res = await fetch(`${API_URL}/matches${qs}`);
        let data = [] as any[];
        if (res.ok) {
          data = await res.json();
        } else {
          console.warn('Não foi possível buscar partidas (status:', res.status, ')');
          data = [];
        }

        const filteredMatches = (data || []).filter((m: Match) => {
          if (filters.search) {
            const s = filters.search.toLowerCase();
            const hay = `${m.title || ''} ${m.description || ''} ${m.location || ''}`.toLowerCase();
            if (!hay.includes(s)) return false;
          }
          // filtros por time/campeonato removidos
          if (filters.statuses.length && !filters.statuses.includes(m.status)) return false;
          if (filters.from) {
            const from = new Date(`${filters.from}T00:00:00`);
            const md = m.date ? new Date(m.date) : null;
            if (!md || md < from) return false;
          }
          if (filters.to) {
            const to = new Date(`${filters.to}T23:59:59.999`);
            const md = m.date ? new Date(m.date) : null;
            if (!md || md > to) return false;
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

    return () => {
      mounted = false;
    };
  }, [buildQuery]);

  const filteredChamps = useMemo(() => {
    const list = Array.isArray(champs) ? champs : [];
    return list.filter((c: any) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const text = `${c.name || ''} ${c.description || ''}`.toLowerCase();
        if (!text.includes(s)) return false;
      }
      const cd = c.start_date ? new Date(c.start_date) : null;
      if (filters.from) {
        const from = new Date(`${filters.from}T00:00:00`);
        if (!cd || cd < from) return false;
      }
      if (filters.to) {
        const to = new Date(`${filters.to}T23:59:59.999`);
        if (!cd || cd > to) return false;
      }
      return true;
    });
  }, [champs, filters.search, filters.from, filters.to]);

  return (
    <Box sx={{ display: 'flex', width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, p: 1, justifyContent: 'center' }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            onClick={() => setOpenFilters(true)}
            sx={{ cursor: 'pointer', userSelect: 'none' }}
            role="button"
            aria-label="Abrir filtros"
          >
            Filtros
          </Typography>
      </Box>

      <Dialog
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        fullWidth
        maxWidth="sm"
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{ sx: { bgcolor: '#fff', color: 'text.secondary', border: 'none', outline: 'none', boxShadow: 6, '&:focus-visible': { outline: 'none' } } }}
      >
        <DialogTitle sx={{ color: 'text.secondary' }}>Filtros</DialogTitle>
        <DialogContent sx={{ bgcolor: '#fff' }}>
          <TextField
            fullWidth
            label="Buscar"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="De"
                type="text"
                value={filters.from}
                onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                placeholder="AAAA-MM-DD"
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Até"
                type="text"
                value={filters.to}
                onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                placeholder="AAAA-MM-DD"
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              color="primary"
              value={filters.type}
              exclusive
              onChange={(_e, val) => { if (val !== null) setFilters(prev => ({ ...prev, type: String(val) })); }}
              aria-label="Tipo de listagem"
            >
              <ToggleButton value="both">Ambos</ToggleButton>
              <ToggleButton value="matches">Partidas</ToggleButton>
              <ToggleButton value="championships">Campeonatos</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Status</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {defaultStatuses.map(s => (
                <Chip
                  key={s.value}
                  label={s.label}
                  clickable
                  color={filters.statuses.includes(s.value) ? 'primary' : 'default'}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    statuses: prev.statuses.includes(s.value) ? prev.statuses.filter(x => x !== s.value) : [...prev.statuses, s.value]
                  }))}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>

          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel id="sort-select-label-mobile">Ordenar</InputLabel>
            <Select
              labelId="sort-select-label-mobile"
              value={filters.sort}
              label="Ordenar"
              onChange={(e) => setFilters(prev => ({ ...prev, sort: String(e.target.value) }))}
            >
              <MenuItem value="date_desc">Data (mais recente)</MenuItem>
              <MenuItem value="date_asc">Data (mais antiga)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
  <DialogActions sx={{ bgcolor: '#fff' }}>
          <Button onClick={() => setFilters({ search: '', from: '', to: '', statuses: [], sort: 'date_desc', type: 'both' })} color="inherit">Limpar</Button>
          <Button variant="contained" onClick={() => setOpenFilters(false)}>Aplicar</Button>
        </DialogActions>
      </Dialog>

  <Box component="aside" sx={{ width: { md: 320 }, display: { xs: 'none', md: 'block' }, p: { md: 2 }, ml: { md: 2 }, mt: { md: 3 } }}>
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, bgcolor: '#fff', color: 'text.secondary' }}>
          <Typography variant="h6" mb={1} color="text.secondary">Filtros</Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            label="Buscar"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2 }}
          />

      <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="De"
        type="text"
                value={filters.from}
                onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
        placeholder="AAAA-MM-DD"
        inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Até"
        type="text"
                value={filters.to}
                onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
        placeholder="AAAA-MM-DD"
        inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              color="primary"
              value={filters.type}
              exclusive
              onChange={(_e, val) => { if (val !== null) setFilters(prev => ({ ...prev, type: String(val) })); }}
              aria-label="Tipo de listagem"
            >
              <ToggleButton value="both">Ambos</ToggleButton>
              <ToggleButton value="matches">Partidas</ToggleButton>
              <ToggleButton value="championships">Campeonatos</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Status</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {defaultStatuses.map(s => (
                <Chip
                  key={s.value}
                  label={s.label}
                  clickable
                  color={filters.statuses.includes(s.value) ? 'primary' : 'default'}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    statuses: prev.statuses.includes(s.value) ? prev.statuses.filter(x => x !== s.value) : [...prev.statuses, s.value]
                  }))}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="sort-select-label">Ordenar</InputLabel>
            <Select
              labelId="sort-select-label"
              value={filters.sort}
              label="Ordenar"
              onChange={(e) => setFilters(prev => ({ ...prev, sort: String(e.target.value) }))}
            >
              <MenuItem value="date_desc">Data (mais recente)</MenuItem>
              <MenuItem value="date_asc">Data (mais antiga)</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" fullWidth onClick={() => { /* apply handled automatically */ }} sx={{ mb: 1 }}>
            Aplicar
          </Button>
          <Button variant="text" fullWidth onClick={() => setFilters({ search: '', from: '', to: '', statuses: [], sort: 'date_desc', type: 'both' })}>
            Limpar filtros
          </Button>
        </Paper>
      </Box>

  <Box component="main" sx={{ flex: 1, p: { xs: 1, sm: 2 }, mt: { md: 3 } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
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

              if (filteredByType.length === 0) return <Typography variant="body1">Nenhum resultado.</Typography>;

              return filteredByType.slice(0, 20).map((it, idx) => (
                <React.Fragment key={it.type + '-' + (it.data.id || idx)}>
                  {it.type === 'champ' ? <ChampionshipCard champ={it.data} /> : <MatchCard match={it.data} />}
                </React.Fragment>
              ));
            })()}
          </>
        )}
      </Box>
    </Box>
  );
};

export default MatchListing;
