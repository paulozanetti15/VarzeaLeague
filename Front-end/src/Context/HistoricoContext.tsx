import React, { createContext, useState, ReactNode } from "react";
import axios from "axios";

interface HistoricoContextProps {
  amistosos: number;
  campeonatos: number;
  vitoriasGeral: number;
  derrotasGeral: number;
  empatesGeral: number;
  aproveitamentoCampeonatos: number;
  aproveitamentoAmistosos: number;
  fetchHistorico: (idTeam: number) => Promise<void>;

  PartidasAmistosas: PartidaAmistosa[];
  PartidasCampeonato: PartidasCampeonato[];

  setPartidasAmistosas: React.Dispatch<React.SetStateAction<PartidaAmistosa[]>>;
  setPartidasCampeonato: React.Dispatch<React.SetStateAction<PartidasCampeonato[]>>;
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
      name: string;
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
  const [campeonatos, setCampeonatos] = useState<number>(0);
  const [vitoriasGeral, setVitoriasGeral] = useState<number>(0);
  const [derrotasGeral, setDerrotasGeral] = useState<number>(0);
  const [empatesGeral, setEmpatesGeral] = useState<number>(0);
  const [aproveitamentoAmistosos, setAproveitamentoAmistosos] = useState<number>(0);
  const [aproveitamentoCampeonatos, setAproveitamentoCampeonatos] = useState<number>(0);
  const [vitoriasAmistosos, setVitoriasAmistosos] = useState<number>(0);
  const [empatesAmistosos, setEmpatesAmistosos] = useState<number>(0);
  const [derrotasAmistosas, setDerrotasAmistosas] = useState<number>(0);
  const [vitoriasCampeonato, setVitoriasCampeonato] = useState<number>(0);
  const [empatesCampeonato, setEmpatesCampeonato] = useState<number>(0);
  const [derrotasCampeonato, setDerrotasCampeonato] = useState<number>(0);
  const [PartidasAmistosas, setPartidasAmistosas] = useState<PartidaAmistosa[]>([])
  const [PartidasCampeonato, setPartidasCampeonato] = useState<PartidasCampeonato[]>([])
 

  const StatusResultado = (idTeamHome: number, idTeamAway: number, teamHomeGoals: number, teamAwayGoals: number, meuId: number) => {
    let resultado;
    if (meuId === idTeamHome) {
      if (teamHomeGoals > teamAwayGoals) {
        resultado = 'Vitória';
      } else if (teamHomeGoals < teamAwayGoals) {
        resultado = 'Derrota';
      } else {
        resultado = 'Empate';
      }
    } else if (meuId === idTeamAway) {
      if (teamAwayGoals > teamHomeGoals) {
        resultado = 'Vitória';
      } else if (teamAwayGoals < teamHomeGoals) {
        resultado = 'Derrota';
      } else {
        resultado = 'Empate';
      }
    }
    return resultado;
  };


  const fetchHistorico = async (idTeam: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !idTeam) {
        setAmistosos(0);
        setCampeonatos(0);
        setVitoriasGeral(0);
        setDerrotasGeral(0);
        setEmpatesGeral(0);
        setAproveitamentoAmistosos(0);
        setAproveitamentoCampeonatos(0);
        return;
      }

      // Requisição de amistosos
      const responseAmistosos = await axios.get(`http://localhost:3001/api/historico/${idTeam}/buscarpartidaamistosa`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Requisição de campeonatos
      const responseCampeonato = await axios.get(`http://localhost:3001/api/historico/${idTeam}/buscarpartidacampeonato`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const amistososData: PartidaAmistosa[] = responseAmistosos.data;
      const campeonatosData: PartidasCampeonato[] = responseCampeonato.data;
      
      // Contagem para amistosos
      let vitoriasA = 0;
      let derrotasA = 0;
      let empatesA = 0;
      amistososData.forEach(partida => {
        const resultado = StatusResultado(partida.team_home, partida.team_away, partida.teamHome_score, partida.teamAway_score, idTeam);
        if (resultado === 'Vitória') vitoriasA++;
        else if (resultado === 'Derrota') derrotasA++;
        else empatesA++;
      });
      setVitoriasAmistosos(vitoriasA);
      setDerrotasAmistosas(derrotasA);
      setEmpatesAmistosos(empatesA);
      setPartidasAmistosas(amistososData)
      // Contagem para campeonatos
      let vitoriasC = 0;
      let derrotasC = 0;
      let empatesC = 0;
      campeonatosData.forEach(partida => {
        const resultado = StatusResultado(partida.team_home, partida.team_away, partida.teamHome_score, partida.teamAway_score, idTeam);
        if (resultado === 'Vitória') vitoriasC++;
        else if (resultado === 'Derrota') derrotasC++;
        else empatesC++;
      });
      setVitoriasCampeonato(vitoriasC);
      setDerrotasCampeonato(derrotasC);
      setEmpatesCampeonato(empatesC);
      setPartidasCampeonato(campeonatosData)
      // Cálculos e atualizações de estado
      setAmistosos(amistososData.length);
      
      const campeonatosUnicos = new Set(campeonatosData.map(p => p.match.championship.name));
      setCampeonatos(campeonatosUnicos.size);

      setVitoriasGeral(vitoriasA + vitoriasC);
      setDerrotasGeral(derrotasA + derrotasC);
      setEmpatesGeral(empatesA + empatesC);

      const pontuacaoJogosCampeonatos = vitoriasC * 3 + empatesC;
      const jogosCampeonatos = vitoriasC + empatesC + derrotasC;
      const aproveitamentoCamp = jogosCampeonatos > 0 ? parseFloat(((pontuacaoJogosCampeonatos / (jogosCampeonatos * 3)) * 100).toFixed(2)) : 0;
      setAproveitamentoCampeonatos(aproveitamentoCamp);

      const jogosAmistosos = vitoriasA + empatesA + derrotasA;
      const desempenhoAmistosos = jogosAmistosos > 0 ? parseFloat(((vitoriasA / jogosAmistosos) * 100).toFixed(2)) : 0;
      setAproveitamentoAmistosos(desempenhoAmistosos);

    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  return (
    <HistoricoContext.Provider
      value={{
        amistosos,
        campeonatos,
        vitoriasGeral,
        derrotasGeral,
        empatesGeral,
        aproveitamentoCampeonatos,
        aproveitamentoAmistosos,
        fetchHistorico,
        setPartidasAmistosas,
        setPartidasCampeonato,
        PartidasAmistosas,
        PartidasCampeonato
      }}
    >
      {children}
    </HistoricoContext.Provider>
  );
};