import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import ToastSucessComponent from '../../Toast/ToastComponent';
import { useEffect } from 'react';
import { set } from 'date-fns';
interface AthleteFormModalProps{
    idpartida: number;
    show: boolean;
    onHide: () => void;
}
export default function InfoRulesModal({idpartida, show, onHide}: AthleteFormModalProps) {
    
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    const [idadeMinima, setIdadeMinima] = useState<number | null>(null);
    const [idadeMaxima, setIdadeMaxima] = useState<number | null>(null);
    const [minimaIntegrantes, setMinimaIntegrantes] = useState<number | null>(null);
    const [maximoIntegrante, setMaximoIntegrante] = useState<number | null>(null);
    const [limitestimes, setLimitestimes] = useState<number | null>(null);
    const [datalimite, setDataLimite] = useState<String | null>(null);
    useEffect(() => {
        const fetchingDados = async () => {
            const response = await axios.get(`http://localhost:3001/api/rules/${idpartida}`, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if(response.status === 200) {
                setIdadeMinima(response.data.idademinima);
                setIdadeMaxima(response.data.idademaxima);
                setMinimaIntegrantes(response.data.minparticipantes);
                setMaximoIntegrante(response.data.maxparticipantes);
                setLimitestimes(response.data.quantidade_times);
                converterDataLimite(response.data.datalimiteinscricao);
            }   
        }
        fetchingDados();
    },[])
    const converterDataLimite = (dataLimite: Date) => {
        const data = new Date(dataLimite);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0'); // Os meses começam do zero
        const ano = data.getFullYear();
        const dataConvertida=`${dia}/${mes}/${ano}`;
        setDataLimite(dataConvertida);
    };
    return (
        <>
           <Modal show={show} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Regras</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Idade maxima permitida para participar</h4>
                    <p>{idadeMaxima} anos</p>
                    <h4>Idade minima permitido para participar</h4>
                    <p>{idadeMinima} anos</p>
                    <h4>Minimo de integrantes permitido no time:</h4>
                    <p>{minimaIntegrantes} </p>
                    <h4>Maximo de integrantes permitido no time:</h4>
                    <p>{maximoIntegrante} </p>
                    <h4>Limite de times para inscrição</h4>
                    <p>{limitestimes} times</p>
                    <h4>Data limite para se inscrever no campeonato:</h4>
                    <p>{datalimite}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}
