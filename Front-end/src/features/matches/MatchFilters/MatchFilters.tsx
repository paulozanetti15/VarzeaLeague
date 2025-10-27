import React from 'react';
import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Divider, TextField, Grid, Chip, FormControl, InputLabel, Select, MenuItem, Button, FormControlLabel, Switch } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { format, parse, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import './MatchFilters.css';

type StatusOption = { value: string; label: string };

type Filters = {
  searchMatches?: string;
  searchChampionships?: string;
  matchDateFrom?: string;
  registrationDateFrom?: string;
  championshipDateFrom?: string;
  championshipDateTo?: string;
  myMatches?: boolean;
  type?: string;
  statuses?: string[];
  sort?: string;
};

interface MatchFiltersProps {
  filters: Filters & { statuses: string[] };
  onChange: (next: any) => void;
  onClear: () => void;
  onApply?: () => void;
  defaultStatuses?: StatusOption[];
  showTypeSelector?: boolean;
}

const MatchFilters: React.FC<MatchFiltersProps> = ({ filters, onChange, onClear, onApply, defaultStatuses = [], showTypeSelector = true }) => {
  const [sortOpen, setSortOpen] = React.useState(false);
  const [matchDateFromInput, setMatchDateFromInput] = useState<string>(filters.matchDateFrom ? format(parseISO(filters.matchDateFrom), 'dd/MM/yyyy') : '');
  const [registrationDateFromInput, setRegistrationDateFromInput] = useState<string>(filters.registrationDateFrom ? format(parseISO(filters.registrationDateFrom), 'dd/MM/yyyy') : '');
  const [championshipDateFromInput, setChampionshipDateFromInput] = useState<string>(filters.championshipDateFrom ? format(parseISO(filters.championshipDateFrom), 'dd/MM/yyyy') : '');
  const [championshipDateToInput, setChampionshipDateToInput] = useState<string>(filters.championshipDateTo ? format(parseISO(filters.championshipDateTo), 'dd/MM/yyyy') : '');

  // Função para validar se data "de" é menor ou igual à data "até"
  const validateDateRange = (fromDate: string | null, toDate: string | null, fieldName: string) => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        toast.error(`A data "De" não pode ser maior que a data "Até" para ${fieldName}`);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    setMatchDateFromInput(filters.matchDateFrom ? format(parseISO(filters.matchDateFrom), 'dd/MM/yyyy') : '');
  }, [filters.matchDateFrom]);

  useEffect(() => {
    setRegistrationDateFromInput(filters.registrationDateFrom ? format(parseISO(filters.registrationDateFrom), 'dd/MM/yyyy') : '');
  }, [filters.registrationDateFrom]);

  useEffect(() => {
    setChampionshipDateFromInput(filters.championshipDateFrom ? format(parseISO(filters.championshipDateFrom), 'dd/MM/yyyy') : '');
  }, [filters.championshipDateFrom]);

  useEffect(() => {
    setChampionshipDateToInput(filters.championshipDateTo ? format(parseISO(filters.championshipDateTo), 'dd/MM/yyyy') : '');
  }, [filters.championshipDateTo]);
  return (
    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, bgcolor: '#fff', color: 'text.secondary' }}>
      <Typography variant="h6" mb={1} color="text.secondary">Filtros</Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Campo de busca para Partidas */}
      {(filters.type === 'both' || filters.type === 'matches') && (
        <TextField
          fullWidth
          label="Buscar Partidas"
          value={filters.searchMatches}
          onChange={(e) => onChange({ ...filters, searchMatches: e.target.value })}
          sx={{ mb: 2 }}
        />
      )}

      {/* Campo de busca para Campeonatos */}
      {(filters.type === 'both' || filters.type === 'championships') && (
        <TextField
          fullWidth
          label="Buscar Campeonatos"
          value={filters.searchChampionships}
          onChange={(e) => onChange({ ...filters, searchChampionships: e.target.value })}
          sx={{ mb: 2 }}
        />
      )}

      {/* Filtro para partidas criadas por mim */}
      {(filters.type === 'both' || filters.type === 'matches') && (
        <FormControlLabel
          control={
            <Switch
              checked={filters.myMatches || false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...filters, myMatches: e.target.checked })}
              color="primary"
            />
          }
          label="Apenas minhas partidas"
          sx={{ mb: 2, width: '100%' }}
        />
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        {/* Filtros de data para Partidas */}
        {(filters.type === 'both' || filters.type === 'matches') && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <DatePicker
                  label="Data da partida"
                  value={matchDateFromInput ? parse(matchDateFromInput, 'dd/MM/yyyy', new Date()) : null}
                  onChange={(newVal: Date | null) => {
                    if (!newVal) { setMatchDateFromInput(''); onChange({ ...filters, matchDateFrom: '' }); return; }
                    newVal.setHours(12, 0, 0, 0);
                    const iso = format(newVal, "yyyy-MM-dd'T'HH:mm:ss");
                    setMatchDateFromInput(format(newVal, 'dd/MM/yyyy'));
                    onChange({ ...filters, matchDateFrom: iso });
                  }}
                  slotProps={{
                    textField: { fullWidth: true },
                    popper: { sx: { zIndex: 3000 }, className: 'matchfilters-datepicker-popper' as any }
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <DatePicker
                  label="Data de inscrição"
                  value={registrationDateFromInput ? parse(registrationDateFromInput, 'dd/MM/yyyy', new Date()) : null}
                  onChange={(newVal: Date | null) => {
                    if (!newVal) { setRegistrationDateFromInput(''); onChange({ ...filters, registrationDateFrom: '' }); return; }
                    newVal.setHours(12, 0, 0, 0);
                    const iso = format(newVal, "yyyy-MM-dd'T'HH:mm:ss");
                    setRegistrationDateFromInput(format(newVal, 'dd/MM/yyyy'));
                    onChange({ ...filters, registrationDateFrom: iso });
                  }}
                  slotProps={{
                    textField: { fullWidth: true },
                    popper: { sx: { zIndex: 3000 }, className: 'matchfilters-datepicker-popper' as any }
                  }}
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* Filtros de data para Campeonatos */}
        {(filters.type === 'both' || filters.type === 'championships') && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Filtros de Campeonatos</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <DatePicker
                  label="Data do campeonato - De"
                  value={championshipDateFromInput ? parse(championshipDateFromInput, 'dd/MM/yyyy', new Date()) : null}
                  onChange={(newVal: Date | null) => {
                    if (!newVal) { setChampionshipDateFromInput(''); onChange({ ...filters, championshipDateFrom: '' }); return; }
                    newVal.setHours(12, 0, 0, 0);
                    const iso = format(newVal, "yyyy-MM-dd'T'HH:mm:ss");
                    setChampionshipDateFromInput(format(newVal, 'dd/MM/yyyy'));
                    
                    // Validar se a data "de" não é maior que a data "até"
                    if (filters.championshipDateTo && !validateDateRange(iso, filters.championshipDateTo, 'data do campeonato')) {
                      return;
                    }
                    
                    onChange({ ...filters, championshipDateFrom: iso });
                  }}
                  slotProps={{
                    textField: { fullWidth: true },
                    popper: { sx: { zIndex: 3000 }, className: 'matchfilters-datepicker-popper' as any }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Data do campeonato - Até"
                  value={championshipDateToInput ? parse(championshipDateToInput, 'dd/MM/yyyy', new Date()) : null}
                  onChange={(newVal: Date | null) => {
                    if (!newVal) { setChampionshipDateToInput(''); onChange({ ...filters, championshipDateTo: '' }); return; }
                    newVal.setHours(12, 0, 0, 0);
                    const iso = format(newVal, "yyyy-MM-dd'T'HH:mm:ss");
                    setChampionshipDateToInput(format(newVal, 'dd/MM/yyyy'));
                    
                    // Validar se a data "até" não é menor que a data "de"
                    if (filters.championshipDateFrom && !validateDateRange(filters.championshipDateFrom, iso, 'data do campeonato')) {
                      return;
                    }
                    
                    onChange({ ...filters, championshipDateTo: iso });
                  }}
                  slotProps={{
                    textField: { fullWidth: true },
                    popper: { sx: { zIndex: 3000 }, className: 'matchfilters-datepicker-popper' as any }
                  }}
                />
              </Grid>
            </Grid>
          </>
        )}
      </LocalizationProvider>

      <Divider sx={{ mb: 2 }} />

      {showTypeSelector && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              color="primary"
              value={filters.type}
              exclusive
              onChange={(_e: React.MouseEvent<HTMLElement>, val: string | null) => { if (val !== null) onChange({ ...filters, type: String(val) }); }}
              aria-label="Tipo de listagem"
            >
              <ToggleButton value="both">Ambos</ToggleButton>
              <ToggleButton value="matches">Partidas</ToggleButton>
              <ToggleButton value="championships">Campeonatos</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>Status</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', rowGap: '10px', alignItems: 'center' }}>
          {defaultStatuses.map(s => (
            <Chip
              key={s.value}
              label={s.label}
              clickable
              size="small"
              color={filters.statuses.includes(s.value) ? 'primary' : 'default'}
              onClick={() => onChange({ ...filters, statuses: filters.statuses.includes(s.value) ? filters.statuses.filter((x: string) => x !== s.value) : [...filters.statuses, s.value] })}
              sx={{ borderRadius: '16px', padding: '6px 10px', textTransform: 'none' }}
            />
          ))}
        </Box>
      </Box>

      <Button variant="text" fullWidth onClick={onClear} sx={{ mb: 2 }}>
        Limpar filtros
      </Button>

      <FormControl fullWidth>
        <InputLabel id="sort-select-label">Ordenar</InputLabel>
        <Select
          labelId="sort-select-label"
          value={filters.sort}
          label="Ordenar"
          onChange={(e) => onChange({ ...filters, sort: String(e.target.value) })}
          MenuProps={{ PaperProps: { sx: { zIndex: 4000, bgcolor: 'background.paper', boxShadow: 3 } } }}
          onOpen={() => setSortOpen(true)}
          onClose={() => setSortOpen(false)}
        >
          <MenuItem value="date_desc">Data (mais recente)</MenuItem>
          <MenuItem value="date_asc">Data (mais antiga)</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
};

export default MatchFilters;
