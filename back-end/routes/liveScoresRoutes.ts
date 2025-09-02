import { Router } from 'express';

const router = Router();

// Simple in-memory cache to reduce upstream calls
let cache: { data: any; ts: number } | null = null;
const CACHE_TTL_MS = 15_000; // 15 seconds

function mapMatch(m: any) {
  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    competition: { id: m.competition?.id, code: m.competition?.code, name: m.competition?.name },
    homeTeam: { id: m.homeTeam?.id, name: m.homeTeam?.name, crest: m.homeTeam?.crest },
    awayTeam: { id: m.awayTeam?.id, name: m.awayTeam?.name, crest: m.awayTeam?.crest },
    score: {
      winner: m.score?.winner,
      duration: m.score?.duration,
      fullTime: m.score?.fullTime,
      halfTime: m.score?.halfTime,
      regularTime: m.score?.regularTime,
    }
  };
}

router.get('/brazil', async (req, res): Promise<void> => {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
  res.json(cache.data);
  return;
    }

    const token = process.env.FOOTBALL_DATA_API_TOKEN;
    if (!token) {
      res.status(500).json({ error: 'FOOTBALL_DATA_API_TOKEN não configurado no servidor' });
      return;
    }

    const competitions = (process.env.BRAZIL_COMPETITIONS || 'BSA,BSB,CDB')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const status = String(req.query.status || 'LIVE').toUpperCase(); // LIVE, SCHEDULED, FINISHED, ALL

    const today = new Date();
    const daysOverride = Number.isFinite(Number(req.query.days)) ? Number(req.query.days) : undefined;
    const computeISO = (d: Date) => d.toISOString().slice(0, 10);

    let defaultDaysBack = 1;
    let defaultDaysAhead = 1;
    if (status === 'FINISHED') {
      defaultDaysBack = 7; // last 7 days by default
      defaultDaysAhead = 0;
    } else if (status === 'ALL') {
      defaultDaysBack = 3;
      defaultDaysAhead = 1;
    }

    if (typeof daysOverride === 'number' && daysOverride > 0) {
      defaultDaysBack = daysOverride;
      defaultDaysAhead = 0;
    }

    const dateFrom = String(
      req.query.dateFrom || computeISO(new Date(today.getTime() - defaultDaysBack * 24 * 3600 * 1000))
    );
    const dateTo = String(
      req.query.dateTo || computeISO(new Date(today.getTime() + defaultDaysAhead * 24 * 3600 * 1000))
    );

    const headers = { 'X-Auth-Token': token } as any;

    const results = await Promise.all(
      competitions.map(async (code) => {
        const url = `https://api.football-data.org/v4/competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
        const r = await fetch(url, { headers });
        if (!r.ok) {
          return { code, matches: [] };
        }
        const json = await r.json();
        const matches = Array.isArray(json?.matches) ? json.matches : [];
        return { code, matches };
      })
    );

    const allMatches = results.flatMap(r => r.matches.map(m => ({ ...m, competition: { ...m.competition, code: r.code } })));
    const filtered = ((): any[] => {
      if (status === 'ALL') return allMatches;
      if (status === 'LIVE') {
        return allMatches.filter((m: any) => m.status === 'IN_PLAY' || m.status === 'PAUSED');
      }
      return allMatches.filter((m: any) => m.status === status);
    })();

    const grouped: Record<string, any[]> = {};
    for (const m of filtered) {
      const code = m.competition?.code || 'UNK';
      if (!grouped[code]) grouped[code] = [];
      grouped[code].push(mapMatch(m));
    }

    const data = { updatedAt: new Date().toISOString(), status, dateFrom, dateTo, competitions, grouped };
    cache = { data, ts: Date.now() };

  res.json(data);
  } catch (err) {
    console.error('Erro ao buscar placares ao vivo:', err);
  res.status(500).json({ error: 'Falha ao buscar placares ao vivo' });
  }
});

export default router;

router.get('/brazil/history', (req, res) => {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  const days = url.searchParams.get('days') || '7';
  url.pathname = url.pathname.replace(/history$/, 'brazil');
  url.searchParams.set('status', 'FINISHED');
  url.searchParams.set('days', days);
  res.redirect(url.pathname + '?' + url.searchParams.toString());
});
