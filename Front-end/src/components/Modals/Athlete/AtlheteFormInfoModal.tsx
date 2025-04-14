import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import ToastSucessComponent from '../../Toast/ToastComponent';
import { useEffect } from 'react';
interface AthleteFormModalProps{
    userId: number;
    show: boolean;
    onHide: () => void;
}
export default function AbooutAthleteModal({userId, show, onHide}: AthleteFormModalProps) {
    const [altura, setAltura] = useState<number | null>(null);
    const [idade,setIdade] = useState<number | null>(null);
    const [peso,setPeso] = useState<number | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    const updatedAtlhete = async (userId:number) => {
        const response = await axios.put(` http://localhost:3001/api/athlete/${userId}`, 
            {
                altura: altura,
                idade: idade,
                peso: peso
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if(response.status === 200) {
            setToastMessage("Atleta atualizado com sucesso");
            setToastBg("success");
            setShowToast(true);
            setTimeout(() => {
                onHide();
            }, 1000); 
        }
        else {
            setToastMessage("Erro ao atualizar atleta");
            setToastBg("danger");
            setShowToast(true);
            setTimeout(() => {
                onHide();
            }, 1000); 
        }   
    }
    const deleteAtlhete = async (userId:number) => {
        const response = await axios.delete(`http://localhost:3001/api/athlete/${userId}`, 
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if(response.status === 200) {
            setToastMessage("Atleta deletado com sucesso");
            localStorage.setItem('isAtleta', JSON.stringify(false));
            setToastBg("success");
            setShowToast(true);
            setTimeout(() => {
                onHide();
            }, 1000); 
        }
        else {
            setToastMessage("Erro ao deletar atleta");
            setToastBg("danger");
            setShowToast(true);
            setTimeout(() => {
                onHide();
            }, 1000); 
        }   
    }
    useEffect(() => {
        const fetchingDados = async () => {
            const response = await axios.get(`http://localhost:3001/api/athlete/${userId}`, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if(response.status === 200) {
                setAltura(response.data.altura);
                setIdade(response.data.idade);
                setPeso(response.data.peso);
            }   
        }
        fetchingDados();
    },[])
    return (
        <>
            <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                <Modal.Title>Tornar atleta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label style={{"color": "black"}}>Idade</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="idade"
                            onChange={(e) =>  setIdade(parseInt(e.target.value)  || null )}
                            autoFocus
                            value={idade !== null ? idade : ""}
                        />
                    </Form.Group>
                    <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                    >
                        <Form.Label style={{"color": "black"}}>Altura</Form.Label>
                        <Form.Control 
                            type="float"
                            placeholder="Altura"
                            onChange={(e) => setAltura(parseFloat(e.target.value) || null)}
                            value={altura !== null ? altura : ""}
                            autoFocus/>
                        </Form.Group> 
                        <Form.Group> 
                            <Form.Label style={{"color": "black"}}>Peso</Form.Label>
                            <Form.Control 
                                type="float"
                                placeholder="Peso"
                                onChange={(e) => setPeso(parseFloat(e.target.value) || null)}
                                value={peso !== null ? peso : ""}
                                autoFocus/>
                        </Form.Group>  
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={()=> updatedAtlhete(userId)}>
                    Atualizar inscrição
                </Button>
                <Button variant="danger" onClick={()=> deleteAtlhete(userId)}>
                    Deletar inscrição
                </Button>
                </Modal.Footer>
            </Modal>
            {showToast && (
                <ToastSucessComponent
                    message={toastMessage}
                    bg={toastBg}
                    onClose={() => setShowToast(false)}
                />
            )}
        </>
    );
}
