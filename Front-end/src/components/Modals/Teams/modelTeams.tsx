import { useState,useEffect } from "react";
import { joinTeam, getAvailableForMatch } from '../../../services/matchesFriendlyServices';
import { Card, Button } from "react-bootstrap";
import toast from 'react-hot-toast';
import Modal from "react-bootstrap/Modal";
interface ModelTeamsProps {
    matchid: number;
    onHide: () => void;
    show: boolean;
}
const modelTeams = ({ matchid,onHide,show }: ModelTeamsProps) => {
    const [teams, setTeams] = useState<any[]>([]);
 
    const handleJoinWithTeam = async (teamId: number) => {
        try {
            const resp = await joinTeam(matchid, { teamId, matchId: matchid });
            if (resp.status === 200) {
                toast.success('Time inscrito na partida com sucesso!');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error('Erro ao inscrever time na partida. Tente novamente.');
            }
        } catch (err) {
            toast.error('Erro ao inscrever time na partida. Tente novamente.');
        }
    };
    const getAvaiableTimes = async (idmatch:number) => {
        try {
            const resp = await getAvailableForMatch(idmatch);
            setTeams(resp.data || []);
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
                className="password-update-modal"
                backdrop="static"
                restoreFocus={false}
            >
            <Modal.Header closeButton className="modal-header">
                <Modal.Title> Selecione um time para se inscrever na time </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body">
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {teams && teams.length > 0 ? (
                    teams.map((team: any) => (
                        <Card style={{ width: '18rem' }} key={team.id}> 
                            <Card.Body>
                                {team.banner &&
                                    <Card.Img
                                        src={`http://localhost:3001/uploads/teams/${team.banner}`} 
                                        variant='top'
                                    />
                                }
                                <div className='d-flex flex-column align-items-center text-center mt-3'>
                                    <Card.Title className='container'>{team.name}</Card.Title>
                                    <Button variant="primary" onClick={() => handleJoinWithTeam(team.id)}>Selecionar time</Button>
                                </div>  
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <div className="d-flex justify-content-center">
                        <h5>Não há times disponíveis</h5>
                    </div>
                )}

            </div>    
            </Modal.Body>
            </Modal>
        </>
        
    );
    
    
}
export default modelTeams;