import react, { useEffect } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import ptBr from '@fullcalendar/core/locales/pt-br';
import axios from 'axios';
import './calendarioPage.css'
import { title } from 'process';
import { Description } from '@mui/icons-material';
import { Button } from 'react-bootstrap';
import ModalDescriaoPartida from '../Modals/DescricaoPartida/modalDescricaoPartidaModal';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

interface User {
  id: number;  
}
interface Team{
  id:number;
  name:string;
}
interface Partida{
  date:Date|string,
  local:String,
  timeAdversario:String
  isPartidaAmistosa:boolean
  horario:Date | string,
  datetime:Date | string 
}
function CalendarioPage() {
  const [jogos,setJogos] = react.useState<Partida[]>([])
  const [jogoAtual,setJogoAtual] = react.useState<Partida | null>(null)
  const [team,setTeam] = react.useState<Team>({id:0,name:""})
  const [showModal,setshowModal]=react.useState<boolean>(false)
  useEffect(()=>{
    try
    {
      const fetchTeam =async()=>{
        let user=JSON.parse(localStorage.getItem('user') || '{}')
        let idUser=parseInt(user.id)
        let token = localStorage.getItem('token')
        if (!user.id || !token) return;
        const responseGetTeam = await axios.get(`http://localhost:3001/api/teams/${idUser}/teamCaptain`,{ 
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
    const fetchJogos = async()=>{
      let token = localStorage.getItem('token')
      const responseGetJogos=await axios.get(`http://localhost:3001/api/matches/teams/${team.id}`,{ 
        headers:{ 
          Authorization : `Bearer ${token}`
        }
      }) 
      const novosJogos:Partida[]=responseGetJogos.data.map((dados:any)=>({
        date:dados.match.date.split(" ")[0],
        local:dados.match.location,
        timeAdversario:dados.team.name,
        isPartidaAmistosa:true,
        horario:dados.match.date.split(" ")[1],
        datetime: dados.match.date    
       }
      ) 
    )
    setJogos(novosJogos)
  }
    
    fetchJogos()  
  },[team])
  const eventos=jogos.map((jogo: Partida) => ({
    title: jogo.isPartidaAmistosa 
      ? `Amistoso`
      : `Campeonato`,
    start: new Date(jogo.datetime)

  }))
  const handleShow=(event:any)=>{
    const partida = jogos.find((j) => j.date === event.startStr.split("T")[0]);
    setshowModal(true)
    setJogoAtual(partida)
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
            eventContent={arg => {
              const start = arg.event.start;
              const horaInicio = start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div className="d-flex flex-column text-black" style={{ color: "black" }}>

                  <b>{arg.event.title}</b>
                  <div> Horário: {horaInicio}</div> 
                  <div className="mt-auto text-center text-sm-end" style={{ color: "#1321c0ff" }}>
                    <Button 
                      variant="secondary" 
                      className='mt-2 w-100 w-sm-auto btn-sm'
                      onClick={() => handleShow(arg.event)}
                    >
                      Descrição
                    </Button>
                  </div>
                </div>
              )
            }}
          />
      </div>
      {showModal && jogoAtual && (
        <ModalDescriaoPartida
          local={jogoAtual.local}
          timeAdversario={jogoAtual.timeAdversario}
          Data={jogoAtual.date}
          horario={jogoAtual.horario}
          onHide={() => setshowModal(false)}
          show={true}
        />
      )}
    </div>
  )
}


export default CalendarioPage;