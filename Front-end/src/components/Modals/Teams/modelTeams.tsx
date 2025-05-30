import { useState,useEffect } from "react";
import axios from "axios";
import { Card, Button } from "react-bootstrap";
import toast from 'react-hot-toast';
import Modal from "react-bootstrap/Modal";
import './modelTeams.css';

interface ModelTeamsProps {
    matchid: number;
    onHide: () => void;
    show: boolean;
}
const modelTeams = ({ matchid,onHide,show }: ModelTeamsProps) => {
    const [teams, setTeams] = useState<any[]>([]);
 
    const handleJoinWithTeam = async (teamId: number) => {
        const response=await axios.post(`http://localhost:3001/api/matches/${teamId}/join-team`, {
            teamId: teamId,
            matchId: matchid
        }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
        })
        if (response.status === 200) {
            toast.success('Time inscrito na partida com sucesso!');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            toast.error('Erro ao inscrever time na partida. Tente novamente.');
        }  
    };
    const getAvaiableTimes = async (idmatch:number) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/matches/${idmatch}/available`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const teams = response.data;
            setTeams(teams);
        } catch (error) {
        toast.error('Erro ao buscar times do usuário. Tente novamente mais tarde.');
        }  
    }  
    const handleClose = () => {
        onHide();
    };

    useEffect(() => {
        getAvaiableTimes(matchid);
    }, []);
    return (
        <>  
            <Modal 
                show={show} 
                onHide={handleClose} 
                centered 
                className="team-modal"
                backdrop="static"
                restoreFocus={false}
            >
            <Modal.Header closeButton>
                <Modal.Title>Selecione um time para se inscrever na partida</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {teams && teams.length > 0 ? (
                    teams.map((team: any) => (
                        <Card className="team-card" key={team.id}> 
                            <Card.Body>
                                {team.banner &&
                                    <Card.Img
                                        src={`http://localhost:3001/uploads/teams/${team.banner}`} 
                                        variant='top'
                                        className="team-banner"
                                    />
                                }
                                <div className='d-flex flex-column align-items-center text-center mt-3'>
                                    <Card.Title className='team-name'>{team.name}</Card.Title>
                                    <Button variant="primary" onClick={() => handleJoinWithTeam(team.id)}>Selecionar time</Button>
                                </div>  
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <div className="no-teams-message">
                        <p>Não há times disponíveis</p>
                    </div>
                )}

            </div>    
            </Modal.Body>
            </Modal>
        </>
        
    );
    
    
}
export default modelTeams;