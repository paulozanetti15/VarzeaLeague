import React, { useEffect, useMemo } from 'react';
import { Box, Grid, Paper, Skeleton, Stack, Typography, Chip, Divider, List, ListItem, ListItemText, Avatar, useMediaQuery, useTheme } from '@mui/material';
import EChartsReact from 'echarts-for-react';
import { Update, SportsSoccer, EventAvailable, Groups, People, SportsScore, WarningAmber, Place, CalendarMonth } from '@mui/icons-material';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { MonthCount, CardsByMonth, StatusCount, MatchListItem } from '../../stores/dashboardStore';

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value: _value, icon, color }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{ width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0, background: `linear-gradient(135deg, ${color} 0%, #0d47a1 100%)`, boxShadow: '0 6px 16px rgba(25,118,210,0.25)' }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="h5" fontWeight={800}>{_value}</Typography>
    </Box>
  </Paper>
);

const SystemOverview: React.FC = () => {
  const { fetchOverview, overview, loadingOverview } = useDashboardStore();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const chartHeight = isSmall ? 220 : 280;

  useEffect(() => {
    const controller = new AbortController();
    fetchOverview(controller.signal);
    return () => controller.abort();
  }, [fetchOverview]);

  const matches = (overview?.matchesByMonth ?? []) as MonthCount[];
  const goals = (overview?.goalsByMonth ?? []) as MonthCount[];
  const cards = (overview?.cardsByMonth ?? []) as CardsByMonth[];
  const statuses = (overview?.statusBreakdown ?? []) as StatusCount[];

  const matchesOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 24, right: 16, top: 24, bottom: 24 },
    xAxis: { type: 'category', data: matches.map((m: MonthCount) => m.month) },
    yAxis: { type: 'value' },
    series: [ { type: 'bar', data: matches.map((m: MonthCount) => m.count), itemStyle: { color: '#1976d2' } } ]
  }), [matches]);

  const goalsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 24, right: 16, top: 24, bottom: 24 },
    xAxis: { type: 'category', data: goals.map((m: MonthCount) => m.month) },
    yAxis: { type: 'value' },
    series: [ { type: 'line', data: goals.map((m: MonthCount) => m.count), smooth: true, lineStyle: { width: 3, color: '#34d399' } } ]
  }), [goals]);

  const cardsOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {},
    grid: { left: 24, right: 16, top: 24, bottom: 24 },
    xAxis: { type: 'category', data: cards.map((m: CardsByMonth) => m.month) },
    yAxis: { type: 'value' },
    series: [
      { name: 'Amarelos', type: 'bar', stack: 'cards', data: cards.map((m: CardsByMonth) => m.yellow), itemStyle: { color: '#f59e0b' } },
      { name: 'Vermelhos', type: 'bar', stack: 'cards', data: cards.map((m: CardsByMonth) => m.red), itemStyle: { color: '#ef4444' } },
    ]
  }), [cards]);

  const statusOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    series: [
      { type: 'pie', radius: ['50%', '70%'], data: statuses.map((s: StatusCount) => ({ name: s.status, value: s.count })), label: { show: true, formatter: '{b}\n{d}%' } }
    ]
  }), [statuses]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, background: '#f4f7fb', minHeight: '100vh' }}>
      {/* Gradient header like /teams */}
      <Paper elevation={0} sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(90deg, #0d47a1 0%, #1976d2 100%)',
        color: '#fff',
        position: 'relative'
      }}>
        <Box sx={{ p: { xs: 1.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1.2 }}>Visão Geral</Typography>
              <Typography variant={isSmall ? 'h5' : 'h4'} fontWeight={900}>Dashboard</Typography>
              <Box sx={{ mt: 1, height: 3, width: 100, background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.2))', borderRadius: 2 }} />
            </Box>
            <Chip size={isSmall ? 'small' : 'medium'} icon={<Update sx={{ color: '#fff !important' }} />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} label="Atualizado agora" variant="outlined" />
          </Stack>
        </Box>
      </Paper>

      {/* KPIs */}
      <Box sx={{ mb: 2 }}>
        {loadingOverview || !overview ? (
          <Skeleton variant="rounded" height={isSmall ? 96 : 120} />
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label="Partidas" value={overview.kpis.totalMatches} icon={<SportsSoccer />} color="#1976d2" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label="Próximas" value={overview.kpis.upcomingMatches} icon={<EventAvailable />} color="#42a5f5" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label="Times" value={overview.kpis.totalTeams} icon={<Groups />} color="#1cb5e0" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label="Jogadores" value={overview.kpis.totalPlayers} icon={<People />} color="#21cbf3" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label="Gols" value={overview.kpis.totalGoals} icon={<SportsScore />} color="#34d399" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label="Cartões" value={overview.kpis.totalCards} icon={<WarningAmber />} color="#f59e0b" />
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>Partidas por mês</Typography>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={matchesOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>Gols por mês</Typography>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={goalsOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>Cartões por mês</Typography>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={cardsOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }} elevation={0}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>Status das partidas</Typography>
            {loadingOverview ? <Skeleton variant="rounded" height={chartHeight} /> : <EChartsReact option={statusOption} style={{ height: chartHeight }} />}
          </Paper>
        </Grid>
      </Grid>

      {/* Lists */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p:2, borderRadius:3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }}>
            <Typography variant="subtitle1" fontWeight={800}>Próximas partidas</Typography>
            <Divider sx={{ my: 1 }} />
            {loadingOverview || !overview ? (
              <Skeleton variant="rounded" height={200} />
            ) : (
              <List dense>
                {overview.nextMatches.map((m: MatchListItem) => (
                  <ListItem key={String(m.id)} sx={{ borderRadius: 2, mb: 0.5, '&:hover': { backgroundColor: 'rgba(25,118,210,0.06)' } }}>
                    <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                      <CalendarMonth fontSize="small" />
                    </Avatar>
                    <ListItemText sx={{ ml: 1 }}
                      primary={<Typography fontWeight={700}>{m.title || `Partida ${m.id}`}</Typography>}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                          <CalendarMonth fontSize="inherit" />
                          <span>{m.date ? new Date(m.date).toLocaleString('pt-BR') : ''}</span>
                          <Place fontSize="inherit" />
                          <span>{m.location || ''}</span>
                        </Stack>
                      }
                    />
                    {m.status && <Chip size="small" label={m.status} color={m.status === 'open' ? 'success' : m.status === 'in_progress' ? 'warning' : 'default'} />}
                  </ListItem>
                ))}
                {overview.nextMatches.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Nenhuma partida futura.</Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p:2, borderRadius:3, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }}>
            <Typography variant="subtitle1" fontWeight={800}>Últimas partidas</Typography>
            <Divider sx={{ my: 1 }} />
            {loadingOverview || !overview ? (
              <Skeleton variant="rounded" height={200} />
            ) : (
              <List dense>
                {overview.recentMatches.map((m: MatchListItem) => (
                  <ListItem key={String(m.id)} sx={{ borderRadius: 2, mb: 0.5, '&:hover': { backgroundColor: 'rgba(25,118,210,0.06)' } }}>
                    <Avatar sx={{ bgcolor: '#0d47a1', width: 32, height: 32 }}>
                      <CalendarMonth fontSize="small" />
                    </Avatar>
                    <ListItemText sx={{ ml: 1 }}
                      primary={<Typography fontWeight={700}>{m.title || `Partida ${m.id}`}</Typography>}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                          <CalendarMonth fontSize="inherit" />
                          <span>{m.date ? new Date(m.date).toLocaleString('pt-BR') : ''}</span>
                          <Place fontSize="inherit" />
                          <span>{m.location || ''}</span>
                        </Stack>
                      }
                    />
                    {m.status && <Chip size="small" label={m.status} color={m.status === 'completed' ? 'primary' : m.status === 'cancelled' ? 'error' : 'default'} />}
                  </ListItem>
                ))}
                {overview.recentMatches.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Nenhuma partida recente.</Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemOverview;
