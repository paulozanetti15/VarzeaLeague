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
  Divider,
  Avatar,
  Stack,
  Chip,
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
    <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 3 }} elevation={0}>
      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>{(match.title || 'P').charAt(0)}</Avatar>
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
  return (
    <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, boxShadow: 3 }} elevation={0}>
      <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>{(champ.name || 'C').charAt(0)}</Avatar>
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
        <Box sx={{ width: 320, p: 2 }}>
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

  <Box component="aside" sx={{ width: { md: 320 }, display: { xs: 'none', md: 'block' }, p: 2, ml: { md: 2 }, mt: { md: 3 } }}>
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h6" mb={1}>Filtros</Typography>
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
                type="date"
                value={filters.from}
                onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Até"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
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
          <Button variant="text" fullWidth onClick={() => setFilters({ search: '', from: '', to: '', teamId: '', championshipId: '', statuses: [], sort: 'date_desc', type: 'both' })}>
            Limpar filtros
          </Button>
        </Paper>
      </Box>

  <Box component="main" sx={{ flex: 1, p: 2, mt: { md: 3 } }}>
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
