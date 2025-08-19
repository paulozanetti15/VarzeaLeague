import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Drawer,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ClearIcon from '@mui/icons-material/Clear';
import { api } from '../../services/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
import { format } from 'date-fns';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

type Match = any;
type Team = any;
type Championship = any;

const defaultStatuses = [
  { value: 'open', label: 'Aberta' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Finalizada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={8}>
          <Typography variant="h6">{match.title || 'Partida sem título'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {match.location || 'Local não informado'}
          </Typography>
        </Grid>
        <Grid item xs={4} textAlign="right">
          <Typography variant="subtitle2">
            {match.date ? format(new Date(match.date), 'dd/MM/yyyy') : '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {match.status || '—'}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const ChampionshipCard: React.FC<{ champ: Championship }> = ({ champ }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">{champ.name || 'Campeonato sem nome'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2"><strong>Início:</strong> {champ.start_date ? format(new Date(champ.start_date), 'dd/MM/yyyy') : '-'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2"><strong>Fim:</strong> {champ.end_date ? format(new Date(champ.end_date), 'dd/MM/yyyy') : '-'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">{champ.description || ''}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

const MatchListing: React.FC = () => {
  const [openFilters, setOpenFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [champs, setChamps] = useState<Championship[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    from: '',
    to: '',
    teamId: '',
    championshipId: '',
    statuses: [] as string[],
  sort: 'date_desc',
  type: 'both', 
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [teamsRes, champsRes] = await Promise.all([
          fetch(`${API_URL}/teams`),
          fetch(`${API_URL}/championships`),
        ]);

        if (teamsRes.ok) {
          const t = await teamsRes.json();
          setTeams(Array.isArray(t) ? t : []);
        } else {
          setTeams([]);
        }

        if (champsRes.ok) {
          const c = await champsRes.json();
          setChamps(Array.isArray(c) ? c : []);
        } else {
          setChamps([]);
        }
      } catch (err) {
        console.error('Erro ao carregar times/campeonatos', err);
        setTeams([]);
        setChamps([]);
      }
    };
    loadMeta();
  }, []);

  const buildQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.teamId) params.set('teamId', String(filters.teamId));
    if (filters.championshipId) params.set('championshipId', String(filters.championshipId));
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
            if (!((m.title || '') + (m.description || '')).toLowerCase().includes(s)) return false;
          }
          if (filters.teamId && m.teamId && String(m.teamId) !== String(filters.teamId)) return false;
          if (filters.championshipId && String(m.championshipId) !== String(filters.championshipId)) return false;
          if (filters.statuses.length && !filters.statuses.includes(m.status)) return false;
          if (filters.from) {
            const from = new Date(filters.from);
            const md = m.date ? new Date(m.date) : null;
            if (!md || md < from) return false;
          }
          if (filters.to) {
            const to = new Date(filters.to);
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

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Box sx={{ display: { xs: 'block', md: 'none' }, p: 1 }}>
        <IconButton onClick={() => setOpenFilters(true)} aria-label="Abrir filtros">
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        variant="temporary"
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filtros</Typography>
            <IconButton onClick={() => setOpenFilters(false)} aria-label="Fechar filtros"><ClearIcon /></IconButton>
          </Box>
          <TextField
            fullWidth
            label="Buscar"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2 }}
          />
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
          <Button variant="outlined" fullWidth onClick={() => setFilters({ search: '', from: '', to: '', teamId: '', championshipId: '', statuses: [], sort: 'date_desc', type: 'both' })}>
            Limpar filtros
          </Button>
        </Box>
      </Drawer>

  <Box component="aside" sx={{ width: { md: 320 }, display: { xs: 'none', md: 'block' }, p: 2, ml: { md: 2 } }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>Filtros</Typography>
          <TextField
            fullWidth
            label="Buscar"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            label="De"
            type="date"
            value={filters.from}
            onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Até"
            type="date"
            value={filters.to}
            onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ mb: 2 }}
          />

          {/* Time and Championship selects removed as requested */}

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

          <Box mb={2}>
            <Typography variant="subtitle2">Status</Typography>
            {defaultStatuses.map(s => (
              <FormControlLabel
                key={s.value}
                control={<Checkbox
                  checked={filters.statuses.includes(s.value)}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    statuses: e.target.checked ? [...prev.statuses, s.value] : prev.statuses.filter(x => x !== s.value)
                  }))}
                />}
                label={s.label}
              />
            ))}
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

          <Button variant="contained" fullWidth onClick={() => { /* apply handled automatically */ }}>
            Aplicar
          </Button>
          <Button variant="text" fullWidth onClick={() => setFilters({ search: '', from: '', to: '', teamId: '', championshipId: '', statuses: [], sort: 'date_desc', type: 'both' })}>
            Limpar filtros
          </Button>
        </Paper>
      </Box>

      <Box component="main" sx={{ flex: 1, p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
        ) : (
          <>
            {(() => {
              const items: { type: 'match' | 'champ'; date: Date | null; data: any }[] = [];
              champs.forEach((c: any) => items.push({ type: 'champ', date: c.start_date ? new Date(c.start_date) : null, data: c }));
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
