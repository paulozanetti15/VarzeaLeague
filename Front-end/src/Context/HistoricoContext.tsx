import { createContext, useState, ReactNode } from "react";
import axios from "axios";

interface HistoricoContextProps {
  amistosos: number;
  quantidadeCampeonatos: number;
  campeonatosEmDisputa: number;
  campeonatosParticipados: number;
  vitoriasGeral: number;
  derrotasGeral: number;
  empatesGeral: number;
  totalPartidasAmistosas: number;
  totalPartidasCampeonatos: number;
  aproveitamentoCampeonatos: number;
  aproveitamentoAmistosos: number;
  fetchHistorico: (idTeam: number, championshipId?: number) => Promise<void>;
  PartidasAmistosas: PartidaAmistosa[];
  todasPartidasCampeonatos: PartidasCampeonato[];
  partidasFiltradasCampeonato: PartidasCampeonato[];
  vitoriasAmistosos: number;
  derrotasAmistosas: number;
  empatesAmistosos: number;
  vitoriasCampeonato: number;
  derrotasCampeonato: number;
  empatesCampeonato: number;
  nomesCampeonatos: { id: number; name: string }[];
  partidasFiltradasCampeonatoDisputadas: number;
}
interface PartidaAmistosa {
  id: number;
  Match: {
    nomequadra: string;
    date: Date;
    location: string;
  };
  team_home: number;
  team_away: number;
  teamHome: {
    name: string;
  };
  teamAway: {
    name: string;
  };
  date: Date;
  teamAway_score: number;
  teamHome_score: number;
}
interface PartidasCampeonato {
  id: number;
  match: {
    nomequadra: string;
    date: Date;
    location: string;
    championship: {
      id: number;
      name: string;
      end_date: Date;
    };
  };
  team_home: number;
  team_away: number;
  teamHome: {
    name: string;
  };
  teamAway: {
    name: string;
  };
  
  teamAway_score: number;
  teamHome_score: number;
}

export const HistoricoContext = createContext<HistoricoContextProps | null>(null);

export const HistoricoProvider = ({ children }: { children: ReactNode }) => {
  const [amistosos, setAmistosos] = useState<number>(0);
  const [quantidadeCampeonatos, setQuantidadeCampeonatos] = useState<number>(0);
  const [vitoriasGeral, setVitoriasGeral] = useState<number>(0);
  const [derrotasGeral, setDerrotasGeral] = useState<number>(0);
  const [empatesGeral, setEmpatesGeral] = useState<number>(0);
  const [aproveitamentoAmistosos, setAproveitamentoAmistosos] = useState<number>(0);
  const [aproveitamentoCampeonatos, setAproveitamentoCampeonatos] = useState<number>(0);
  const [totalPartidasAmistosas, setTotalPartidasAmistosas] = useState<number>(0);
  const [totalPartidasCampeonatos, setTotalPartidasCampeonatos] = useState<number>(0);
  const [vitoriasAmistosos, setVitoriasAmistosos] = useState<number>(0);
  const [empatesAmistosos, setEmpatesAmistosos] = useState<number>(0);
  const [derrotasAmistosas, setDerrotasAmistosas] = useState<number>(0);
  const [vitoriasCampeonato, setVitoriasCampeonato] = useState<number>(0);
  const [empatesCampeonato, setEmpatesCampeonato] = useState<number>(0);
  const [derrotasCampeonato, setDerrotasCampeonato] = useState<number>(0);
  const [PartidasAmistosas, setPartidasAmistosas] = useState<PartidaAmistosa[]>([])
  const [todasPartidasCampeonatos, setTodasPartidasCampeonatos] = useState<PartidasCampeonato[]>([])
  const [partidasFiltradasCampeonato, setPartidasFiltradasCampeonato] = useState<PartidasCampeonato[]>([])
  const [campeonatosEmDisputa, setCampeonatosEmDisputa] = useState<number>(0);
  const [campeonatosParticipados, setCampeonatosParticipados] = useState<number>(0);
  const [nomesCampeonatos , setNomesCampeonato] = useState<{ id: number; name: string }[]>([]);
  const [partidasFiltradasCampeonatoDisputadas, setPartidasFiltradasCampeonatoDisputadas] = useState<number>(0);

  const StatusResultado = (
    idTeamHome: number,
    idTeamAway: number,
    teamHomeGoals: number | null,
    teamAwayGoals: number | null,
    meuId: number
  ): 'Vitória' | 'Derrota' | 'Empate' | null => {
    // se não houver placar definido, não consideramos resultado
    if (teamHomeGoals == null || teamAwayGoals == null) return null;
    if (meuId === idTeamHome) {
      if (teamHomeGoals > teamAwayGoals) return 'Vitória';
      if (teamHomeGoals < teamAwayGoals) return 'Derrota';
      return 'Empate';
    }
    if (meuId === idTeamAway) {
      if (teamAwayGoals > teamHomeGoals) return 'Vitória';
      if (teamAwayGoals < teamHomeGoals) return 'Derrota';
      return 'Empate';
    }
    return null;
  };


  const fetchHistorico = async (idTeam: number, championshipId?: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !idTeam) {
        setAmistosos(0);
        setQuantidadeCampeonatos(0);
        setVitoriasGeral(0);
        setDerrotasGeral(0);
        setEmpatesGeral(0);
        setAproveitamentoAmistosos(0);
        setAproveitamentoCampeonatos(0);
        return;
      }

      const responseAllFriendlyMatches = await axios.get(`http://localhost:3001/api/historico/${idTeam}/partidas-amistosas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const championshipQuery = championshipId ? `?championshipId=${championshipId}` : '';
      const responseAllMatchesChampionship = await axios.get(`http://localhost:3001/api/historico/${idTeam}/partidas-campeonatos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseMatchesByChampionship = await axios.get(`http://localhost:3001/api/historico/${idTeam}/partidas-campeonatos/${championshipQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allFriendlyMatchesData: PartidaAmistosa[] = responseAllFriendlyMatches.data;
      const allChampionshipMatchesData: PartidasCampeonato[] = responseAllMatchesChampionship.data;
      const filteredChampionshipMatchesData: PartidasCampeonato[] = responseMatchesByChampionship.data;
      let vitoriasPartidasAmistosas = 0;
      let derrotasPartidasAmistosas = 0;
      let empatesPartidasAmistosas = 0;
      allFriendlyMatchesData.forEach(partida => {
        const resultado = StatusResultado(
          partida.team_home,
          partida.team_away,
          partida.teamHome_score ?? null,
          partida.teamAway_score ?? null,
          idTeam
        );
        if (resultado === 'Vitória') vitoriasPartidasAmistosas++;
        else if (resultado === 'Derrota') derrotasPartidasAmistosas++;
        else if (resultado === 'Empate') empatesPartidasAmistosas++;
        // se resultado === null, ignoramos (placar não definido)
      });
      setVitoriasAmistosos(vitoriasPartidasAmistosas);
      setDerrotasAmistosas(derrotasPartidasAmistosas);
      setEmpatesAmistosos(empatesPartidasAmistosas);
      setPartidasAmistosas(allFriendlyMatchesData)
      setTotalPartidasAmistosas(vitoriasPartidasAmistosas + derrotasPartidasAmistosas + empatesPartidasAmistosas);
      let vitoriasPartidasCampeonatos = 0;
      let derrotasPartidasCampeonatos = 0;
      let empatesPartidasCampeonatos = 0;
      let vitoriasPartidasCampeonatoFiltrado = 0;
      let derrotasPartidasCampeonatoFiltrado = 0;
      let empatesPartidasCampeonatoFiltrado = 0;
      allChampionshipMatchesData.forEach(partida => {
        const resultado = StatusResultado(
          partida.team_home,
          partida.team_away,
          partida.teamHome_score ?? null,
          partida.teamAway_score ?? null,
          idTeam
        );
        if (resultado === 'Vitória') vitoriasPartidasCampeonatos++;
        else if (resultado === 'Derrota') derrotasPartidasCampeonatos++;
        else if (resultado === 'Empate') empatesPartidasCampeonatos++;
      });
      filteredChampionshipMatchesData.forEach(partida => {
        const resultado = StatusResultado(
          partida.team_home,
          partida.team_away,
          partida.teamHome_score ?? null,
          partida.teamAway_score ?? null,
          idTeam
        );
        if (resultado === 'Vitória') vitoriasPartidasCampeonatoFiltrado++;
        else if (resultado === 'Derrota') derrotasPartidasCampeonatoFiltrado++;
        else if (resultado === 'Empate') empatesPartidasCampeonatoFiltrado++;
      });
      setVitoriasCampeonato(vitoriasPartidasCampeonatoFiltrado);
      setDerrotasCampeonato(derrotasPartidasCampeonatoFiltrado);
      setEmpatesCampeonato(empatesPartidasCampeonatoFiltrado);
      setTodasPartidasCampeonatos(allChampionshipMatchesData)
      setTotalPartidasCampeonatos(vitoriasPartidasCampeonatos + derrotasPartidasCampeonatos + empatesPartidasCampeonatos);
      setPartidasFiltradasCampeonato(filteredChampionshipMatchesData)
      setAmistosos(allFriendlyMatchesData.length);

      const uniqueChampionships = new Map<number, { name: string; end_date: Date }>();
      allChampionshipMatchesData.forEach(p => {
        const champId = p.match.championship.id;
        const champName = p.match.championship.name;
        const endDate = new Date(p.match.championship.end_date);
        if (!uniqueChampionships.has(champId)) {
          uniqueChampionships.set(champId, { name: champName, end_date: endDate });
        }
      });
      const championshipList = Array.from(uniqueChampionships, ([id, { name }]) => ({ id, name }));
      setNomesCampeonato(championshipList);
      setQuantidadeCampeonatos(uniqueChampionships.size);

      let campeonatosEmDisputa = 0;
      let campeonatosParticipados = 0;
      uniqueChampionships.forEach(({ end_date }) => {
        if (end_date > new Date()) {
          campeonatosEmDisputa++;
        } else if( end_date <= new Date()) {
          campeonatosParticipados++;
        }
      });
      setCampeonatosEmDisputa(campeonatosEmDisputa);
      setCampeonatosParticipados(campeonatosParticipados);
      setVitoriasGeral(vitoriasPartidasAmistosas + vitoriasPartidasCampeonatos);
      setDerrotasGeral(derrotasPartidasAmistosas + derrotasPartidasCampeonatos);
      setEmpatesGeral(empatesPartidasAmistosas + empatesPartidasCampeonatos);

      const pontuacaoJogosCampeonatos = vitoriasPartidasCampeonatoFiltrado * 3 + empatesPartidasCampeonatoFiltrado;
      const PartidasCampeonatoDisputadas = vitoriasPartidasCampeonatoFiltrado + empatesPartidasCampeonatoFiltrado + derrotasPartidasCampeonatoFiltrado;
      setPartidasFiltradasCampeonatoDisputadas(PartidasCampeonatoDisputadas)
      const aproveitamentoCamp = PartidasCampeonatoDisputadas > 0 ? parseFloat(((pontuacaoJogosCampeonatos / (PartidasCampeonatoDisputadas * 3)) * 100).toFixed(2)) : 0;
      setAproveitamentoCampeonatos(aproveitamentoCamp);

      const jogosAmistosos = vitoriasPartidasAmistosas + empatesPartidasAmistosas + derrotasPartidasAmistosas;
      const desempenhoAmistosos = jogosAmistosos > 0 ? parseFloat(((vitoriasPartidasAmistosas / jogosAmistosos) * 100).toFixed(2)) : 0;
      setAproveitamentoAmistosos(desempenhoAmistosos);

    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  return (
    <HistoricoContext.Provider
      value={{
        amistosos,
        quantidadeCampeonatos,
        campeonatosEmDisputa,
        campeonatosParticipados,
        vitoriasGeral,
        derrotasGeral,
        empatesGeral,
        totalPartidasAmistosas,
        totalPartidasCampeonatos,
        aproveitamentoCampeonatos,
        aproveitamentoAmistosos,
        fetchHistorico,
        PartidasAmistosas,
        todasPartidasCampeonatos,
        partidasFiltradasCampeonato,
        vitoriasAmistosos,
        derrotasAmistosas,
        empatesAmistosos,
        vitoriasCampeonato,
        derrotasCampeonato,
        empatesCampeonato,
        nomesCampeonatos,
        partidasFiltradasCampeonatoDisputadas
      }}
    >
      {children}
    </HistoricoContext.Provider>
  );
};