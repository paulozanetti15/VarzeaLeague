import react, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import ptBr from '@fullcalendar/core/locales/pt-br';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './calendarioPage.css'

import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

interface Team{
  id:number;
  name:string;
}
interface Partida{
  id?: number,
  date:Date|string,
  local:String,
  timeAdversario:String
  isPartidaAmistosa:boolean
  horario:Date | string,
  datetime:Date | string,
  title?: string
}
interface ChampionshipEvent {
  id: number;
  name: string;
  start_date?: string;
}
function CalendarioPage() {
  const navigate = useNavigate();
  const [jogos,setJogos] = react.useState<Partida[]>([])
  const [team,setTeam] = react.useState<Team>({id:0,name:""})
  const [championships, setChampionships] = react.useState<ChampionshipEvent[]>([])
  useEffect(()=>{
    try
    {
      const fetchTeam =async()=>{
        let user=JSON.parse(localStorage.getItem('user') || '{}')
        let idUser=parseInt(user.id)
        let token = localStorage.getItem('token')
        if (!user.id || !token) return;
        const responseGetTeam = await axios.get(`${API_BASE_URL}/teams/${idUser}/teamCaptain`,{ 
          headers:{ Authorization : `Bearer ${token}`}}
        )  
        setTeam({id:responseGetTeam.data.id,name:responseGetTeam.data.name})
      }
      fetchTeam()
    }
    catch(err){
      console.log(err)
    }
    
  },[])
  useEffect(()=>{
    if (!team.id) return;

    const fetchJogos = async()=>{
      try {
        const token = localStorage.getItem('token')
        if (!token) return;
        // Fetch all friendly matches and filter those where this team is registered (FriendlyMatchTeams)
        const responseGetJogos = await axios.get(`${API_BASE_URL}/friendly-matches`,{ 
          headers:{ Authorization : `Bearer ${token}` }
        })
        const rows = Array.isArray(responseGetJogos.data) ? responseGetJogos.data : [];
        const filtered = rows.filter((m:any) => Array.isArray(m.matchTeams) && m.matchTeams.some((mt:any) => {
          const teamObj = mt.matchTeam || mt.team || mt;
          return teamObj && Number(teamObj.id) === Number(team.id);
        }));

        const novosJogos:Partida[] = filtered.map((match:any)=>{
          const d = match.date ? new Date(match.date) : null;
          const teams = Array.isArray(match.matchTeams) ? match.matchTeams : [];
          const other = teams.find((mt:any) => {
            const t = mt.matchTeam || mt.team || mt;
            return t && Number(t.id) !== Number(team.id);
          });
          const opponentName = other ? (other.matchTeam?.name || other.team?.name || other.name || '') : '';
          return {
            id: match.id,
            title: match.title || 'Partida',
            date: d ? d.toISOString().split('T')[0] : '',
            local: match.location || match.square || '',
            timeAdversario: opponentName,
            isPartidaAmistosa: true,
            horario: d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            datetime: match.date || ''
          }
        });
        console.debug('[Calendário] fetched jogos:', novosJogos.length, 'for team', team.id)
        setJogos(novosJogos)
      } catch (err) {
        console.error('[Calendário] erro ao buscar jogos para time', team.id, err)
        setJogos([])
      }
    }

    const fetchChampionshipsForTeam = async()=>{
      try {
        const token = localStorage.getItem('token');
        if (!token || !team.id) return;
        // Buscar todos os campeonatos
        const champsResp = await axios.get(`${API_BASE_URL}/championships`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const champs = Array.isArray(champsResp.data) ? champsResp.data : [];
        // Filtrar campeonatos onde este time está inscrito
        const enrolled: ChampionshipEvent[] = [];
        for (const ch of champs) {
          try {
            const teamsResp = await axios.get(`${API_BASE_URL}/championships/${ch.id}/join-team`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const teamsData = Array.isArray(teamsResp.data) ? teamsResp.data : [];
            if (teamsData.some((t: any) => t.id === team.id)) {
              enrolled.push({ id: ch.id, name: ch.name, start_date: ch.start_date });
            }
          } catch (e) {
            // ignora campeonatos sem times ou erro de permissão
          }
        }
        setChampionships(enrolled);
      } catch (err) {
        console.error('Erro ao buscar campeonatos do time', err);
        setChampionships([]);
      }
    }
    
    fetchJogos();
    fetchChampionshipsForTeam();
  },[team])
    const eventos=[
    // Eventos de partidas (amistosos ou partidas)
    ...jogos.map((jogo: Partida & { title?: string }) => ({
      title: jogo.title || 'Partida',
      start: jogo.datetime ? new Date(jogo.datetime) : (jogo.date ? new Date(jogo.date) : undefined),
      extendedProps: { type: 'match', date: jogo.date, matchId: (jogo as any).id },
      backgroundColor: '#d4edda',
      borderColor: '#155724',
      textColor: '#155724',
      display: 'block'
    })),
    // Eventos de campeonatos (apenas data de início)
    ...championships
      .filter((c) => !!c.start_date)
      .map((c) => ({
        title: `Início: ${c.name}`,
        start: new Date(c.start_date as string),
        allDay: true,
        extendedProps: { type: 'championship', championshipId: c.id },
        backgroundColor: '#ffe8cc',
        borderColor: '#d9480f',
        textColor: '#d9480f'
      }))
  ]
  const handleEventClick=(info:any)=>{
    const type = info.event.extendedProps?.type;
    if (type === 'match') {
      const matchId = info.event.extendedProps?.matchId;
      if (matchId) navigate(`/matches/${matchId}`);
    } else if (type === 'championship') {
      const championshipId = info.event.extendedProps?.championshipId;
      if (championshipId) navigate(`/championships/${championshipId}`);
    }
  }
  return (
    <div className='calendario-container'>
      <h1 className='text-3xl  text-center pt-4 text-black'>Calendário do {team.name}</h1>
      <div className="mt-4">
        <FullCalendar
            plugins={[dayGridPlugin,timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay'
            }}
            showNonCurrentDates={false}
            locale={ptBr}
            events={eventos}
            eventClick={handleEventClick}
            eventContent={arg => {
              const start = arg.event.start;
              const horaInicio = start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div className="d-flex flex-column">
                  <b>{arg.event.title}</b>
                  <div> Horário: {horaInicio}</div>
                </div>
              )
            }}
          />
      </div>
    </div>
  )
}


export default CalendarioPage;