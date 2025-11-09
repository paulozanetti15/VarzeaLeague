import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
  Button,
  ButtonGroup,
  TextField
} from '@mui/material';
import { Dropdown } from 'react-bootstrap';
import EChartsReact from 'echarts-for-react';
import {
  Update,
  SportsSoccer,
  Groups,
  People,
  TrendingUp,
  EmojiEvents,
  GroupAdd,
  Cancel,
  CheckCircle,
  PersonAdd,
  PersonAddAlt1
} from '@mui/icons-material';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { MonthCount, StatusCount } from '../../stores/dashboardStore';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.5)'
      }
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        flexShrink: 0,
        background: `linear-gradient(135deg, ${color} 0%, #764ba2 100%)`,
        boxShadow: `0 6px 16px ${color}40`
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#333' }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: trend.startsWith('+') ? '#10b981' : '#ef4444',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <TrendingUp
              fontSize="inherit"
              sx={{ transform: trend.startsWith('+') ? 'none' : 'rotate(180deg)' }}
            />
            {trend}
          </Typography>
        )}
      </Stack>
    </Box>
  </Paper>
);

const SystemOverview: React.FC = () => {
  const { fetchOverview, overview, loadingOverview } = useDashboardStore();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const chartHeight = isSmall ? 220 : 280;

  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d' | 'all') => {
    setPeriodFilter(newPeriod);
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    } else if (periodFilter) {
      params.append('period', periodFilter);
    }

    fetchOverview(controller.signal, params.toString());
    return () => controller.abort();
  }, [fetchOverview, startDate, endDate, periodFilter]);

  const matches = (overview?.matchesByMonth ?? []) as MonthCount[];
  const applications = (overview?.applicationsByMonth ?? []) as MonthCount[];
  const teams = (overview?.teamsByMonth ?? []) as MonthCount[];
  const championships = (overview?.championshipsByMonth ?? []) as MonthCount[];
  const matchRegs = (overview?.matchRegistrationsByMonth ?? []) as MonthCount[];
  const matchStatus = (overview?.statusBreakdown ?? []) as StatusCount[];
  const champStatus = (overview?.championshipStatusBreakdown ?? []) as StatusCount[];

  const filteredData = useMemo(() => {
    return { matches, applications, teams, championships, matchRegs };
  }, [matches, applications, teams, championships, matchRegs]);

  const createChartOption = (data: MonthCount[], color: string, chartType: 'bar' | 'line') => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: 'transparent',
      textStyle: { color: '#fff' }
    },
    grid: { left: 48, right: 24, top: 32, bottom: 48 },
    xAxis: {
      type: 'category',
      data: data.map((m: MonthCount) => m.month),
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666' }
    },
    series: [{
      type: chartType,
      data: data.map((m: MonthCount) => m.count),
      itemStyle: { color, borderRadius: [8, 8, 0, 0] },
      smooth: true,
      areaStyle: chartType === 'line' ? { color: `${color}1A` } : undefined
    }]
  });

  const createPieChartOption = (data: StatusCount[]) => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: 'transparent',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      data: data.map((s: StatusCount) => ({ name: s.status, value: s.count })),
      label: { show: true, formatter: '{b}\n{d}%', color: '#666', fontWeight: 600 },
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 }
    }]
  });

  const matchesOption = useMemo(() => createChartOption(filteredData.matches, '#1976d2', chartType), [filteredData.matches, chartType]);
  const matchRegsOption = useMemo(() => createChartOption(filteredData.matchRegs, '#22c55e', chartType), [filteredData.matchRegs, chartType]);
  const applicationsOption = useMemo(() => createChartOption(filteredData.applications, '#8b5cf6', chartType), [filteredData.applications, chartType]);
  const teamsOption = useMemo(() => createChartOption(filteredData.teams, '#1cb5e0', chartType), [filteredData.teams, chartType]);
  const championshipsOption = useMemo(() => createChartOption(filteredData.championships, '#0ea5e9', chartType), [filteredData.championships, chartType]);
  const matchStatusOption = useMemo(() => createPieChartOption(matchStatus), [matchStatus]);
  const champStatusOption = useMemo(() => createPieChartOption(champStatus), [champStatus]);

  const totalApplications = useMemo(() => filteredData.applications.reduce((sum, m) => sum + m.count, 0), [filteredData.applications]);
  const totalTeams = useMemo(() => filteredData.teams.reduce((sum, m) => sum + m.count, 0), [filteredData.teams]);
  const totalChampionships = useMemo(() => filteredData.championships.reduce((s, m) => s + m.count, 0), [filteredData.championships]);
  const totalMatchRegs = useMemo(() => filteredData.matchRegs.reduce((s, m) => s + m.count, 0), [filteredData.matchRegs]);

  const dateFieldStyle = {
    minWidth: 150,
    bgcolor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    '& .MuiInputBase-root': { color: '#fff' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' }
  };

  const buttonStyle = {
    color: '#fff',
    borderColor: 'rgba(255,255,255,0.3)',
    '&.MuiButton-contained': { bgcolor: 'rgba(255,255,255,0.2)' }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, background: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'visible',
          background: '#000000',
          color: '#fff',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Box sx={{ p: { xs: 1.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1.2, color: '#000000', fontWeight: 700 }}>
                Visão Geral
              </Typography>
              <Typography variant={isSmall ? 'h5' : 'h4'} fontWeight={900} sx={{ color: '#000000' }}>
                Dashboard
              </Typography>
              <Box sx={{ mt: 1, height: 3, width: 200, background: 'rgba(0,0,0,0.3)', borderRadius: 2 }} />
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <TextField
                size="small"
                type="date"
                label="Data Início"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { color: '#000' } }}
                sx={{
                  ...dateFieldStyle,
                  bgcolor: 'rgba(0,0,0,0.05)',
                  '& .MuiInputBase-root': { color: '#000' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.5)' },
                  '& .MuiInputLabel-root': { color: '#000' }
                }}
              />
              <TextField
                size="small"
                type="date"
                label="Data Fim"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { color: '#000' } }}
                sx={{
                  ...dateFieldStyle,
                  bgcolor: 'rgba(0,0,0,0.05)',
                  '& .MuiInputBase-root': { color: '#000' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.5)' },
                  '& .MuiInputLabel-root': { color: '#000' }
                }}
              />

              <Dropdown onSelect={(key) => handlePeriodChange(key as any)}>
                <Dropdown.Toggle 
                  variant="outline-dark" 
                  size="sm"
                  style={{
                    minWidth: '150px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderColor: 'rgba(0,0,0,0.3)',
                    color: '#000',
                    fontWeight: 500
                  }}
                >
                  {periodFilter === '7d' && 'Últimos 7 dias'}
                  {periodFilter === '30d' && 'Últimos 30 dias'}
                  {periodFilter === '90d' && 'Últimos 90 dias'}
                  {periodFilter === 'all' && 'Todo período'}
                </Dropdown.Toggle>

                <Dropdown.Menu style={{ minWidth: '150px' }}>
                  <Dropdown.Item eventKey="7d" active={periodFilter === '7d'}>
                    Últimos 7 dias
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="30d" active={periodFilter === '30d'}>
                    Últimos 30 dias
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="90d" active={periodFilter === '90d'}>
                    Últimos 90 dias
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="all" active={periodFilter === 'all'}>
                    Todo período
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <ButtonGroup size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <Button
                  onClick={() => setChartType('bar')}
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  sx={{
                    ...buttonStyle,
                    borderColor: 'rgba(0,0,0,0.3)',
                    color: '#000',
                    '&.MuiButton-contained': { 
                      bgcolor: 'rgba(0,0,0,0.1)',
                      borderColor: 'rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  Barras
                </Button>
                <Button
                  onClick={() => setChartType('line')}
                  variant={chartType === 'line' ? 'contained' : 'outlined'}
                  sx={{
                    ...buttonStyle,
                    borderColor: 'rgba(0,0,0,0.3)',
                    color: '#000',
                    '&.MuiButton-contained': { 
                      bgcolor: 'rgba(0,0,0,0.1)',
                      borderColor: 'rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  Linhas
                </Button>
              </ButtonGroup>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* KPIs */}
      <Box sx={{ mb: 2 }}>
        {loadingOverview || !overview ? (
          <Skeleton variant="rounded" height={isSmall ? 96 : 120} />
        ) : (
          <Grid container spacing={2}>
            {/* Partidas Amistosas */}
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Partidas Amistosas Criadas" 
                value={overview.kpis.amistososPeriodo} 
                icon={<SportsSoccer />} 
                color="#1976d2" 
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Inscrições em Amistosos" 
                value={overview.kpis.inscricoesAmistososPeriodo} 
                icon={<PersonAdd />} 
                color="#22c55e" 
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Partidas Amistosas Finalizadas" 
                value={overview.kpis.completedMatches} 
                icon={<CheckCircle />} 
                color="#10b981" 
              />
            </Grid>

            {/* Campeonatos */}
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Campeonatos Criados" 
                value={overview.kpis.campeonatosPeriodo} 
                icon={<EmojiEvents />} 
                color="#0ea5e9" 
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Inscrições em Campeonatos" 
                value={overview.kpis.inscricoesCampeonatosPeriodo} 
                icon={<PersonAdd />} 
                color="#8b5cf6" 
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Campeonatos em Andamento" 
                value={overview.kpis.championshipsInProgress} 
                icon={<TrendingUp />} 
                color="#f59e0b" 
              />
            </Grid>

            {/* Sistema */}
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Usuários Cadastrados" 
                value={overview.kpis.totalUsers} 
                icon={<People />} 
                color="#6366f1" 
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Partidas Amistosas Canceladas" 
                value={overview.kpis.cancelledMatches} 
                icon={<Cancel />} 
                color="#ef4444" 
              />
            </Grid>

            {/* Times e Jogadores */}
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Times Cadastrados" 
                value={overview.kpis.totalTeams} 
                icon={<Groups />} 
                color="#1cb5e0" 
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <StatCard 
                label="Jogadores Cadastrados" 
                value={overview.kpis.totalPlayers} 
                icon={<People />} 
                color="#21cbf3" 
              />
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Amistosos criados por Mês
              </Typography>
              <Chip label={`Total: ${overview?.kpis.amistososPeriodo || 0}`} size="small" sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700 }} />
            </Stack>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={matchesOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Status das partidas amistosas (período)
              </Typography>
            </Stack>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={matchStatusOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Inscrições em partidas amistosas (período)
              </Typography>
              <Chip label={`Total: ${totalMatchRegs}`} size="small" sx={{ bgcolor: '#22c55e', color: '#fff', fontWeight: 700 }} />
            </Stack>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={matchRegsOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Inscrições em campeonatos (período)
              </Typography>
              <Chip label={`Total: ${totalApplications}`} size="small" sx={{ bgcolor: '#8b5cf6', color: '#fff', fontWeight: 700 }} />
            </Stack>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={applicationsOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Times cadastrados (período)
              </Typography>
              <Chip label={`Total: ${totalTeams}`} size="small" sx={{ bgcolor: '#1cb5e0', color: '#fff', fontWeight: 700 }} />
            </Stack>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={teamsOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Campeonatos criados (período)
              </Typography>
              <Chip label={`Total: ${totalChampionships}`} size="small" sx={{ bgcolor: '#0ea5e9', color: '#fff', fontWeight: 700 }} />
            </Stack>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={championshipsOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'text.primary' }}>
                Status dos campeonatos (período)
              </Typography>
            </Stack>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={champStatusOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemOverview;