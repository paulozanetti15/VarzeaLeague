import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import ToastSucessComponent from '../../Toast/ToastComponent';
interface AthleteFormModalProps{
    userId: number;
    show: boolean;
    onHide: () => void;
}
export default function AtlheteModal({userId, show, onHide}: AthleteFormModalProps) {
    const [altura, setAltura] = useState<number | null>(null);
    const [idade,setIdade] = useState<number | null>(null);
    const [peso,setPeso] = useState<number | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    const insertAtlhete = async () => {
        const response = await axios.post(`http://localhost:3001/api/athlete/`, 
            {
                userId: userId,
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
        if(response.status === 201) {
            setToastMessage("Atleta inserido com sucesso");
            localStorage.setItem('isAtleta', JSON.stringify(true));
            setToastBg("success");
            setShowToast(true);
            setTimeout(() => {
                onHide();
            }, 1000); 
        }
        else {
            setToastMessage("Erro ao inserir atleta");
            setToastBg("danger");
            setShowToast(true);
            setTimeout(() => {
                onHide();
            }, 1000); 
        }   
    }
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
                            autoFocus/>
                        </Form.Group> 
                        <Form.Group> 
                            <Form.Label style={{"color": "black"}}>Peso</Form.Label>
                            <Form.Control 
                                type="float"
                                placeholder="Peso"
                                onChange={(e) => setPeso(parseFloat(e.target.value) || null)}
                                autoFocus/>
                        </Form.Group>  
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Fechar
                </Button>
                <Button variant="primary" onClick={()=> insertAtlhete()}>
                    Confirmar inscrição
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
