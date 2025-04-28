import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useEffect } from 'react';
import './RegrasStyles.css';

interface AthleteFormModalProps{
    idpartida: number;
    show: boolean;
    onHide: () => void;
}
export default function InfoRulesModal({idpartida, show, onHide}: AthleteFormModalProps) {
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
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const dataConvertida=`${dia}/${mes}/${ano}`;
        setDataLimite(dataConvertida);
    };
    
    return (
        <>
           <Modal 
                show={show} 
                onHide={onHide} 
                centered 
                dialogClassName="custom-modal-width"
                contentClassName="small-modal-content"
            >
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Regras</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="rules-info">
                        <div className="rules-grid">
                            <div className="rule-item">
                                <h6 className="rule-title">Idade mínima</h6>
                                <p className="rule-value">{idadeMinima} anos</p>
                            </div>
                            
                            <div className="rule-item">
                                <h6 className="rule-title">Idade máxima</h6>
                                <p className="rule-value">{idadeMaxima} anos</p>
                            </div>
                            
                            <div className="rule-item">
                                <h6 className="rule-title">Mín. jogadores</h6>
                                <p className="rule-value">{minimaIntegrantes} jogadores</p>
                            </div>
                            
                            <div className="rule-item">
                                <h6 className="rule-title">Máx. jogadores</h6>
                                <p className="rule-value">{maximoIntegrante} jogadores</p>
                            </div>
                            
                            <div className="rule-item">
                                <h6 className="rule-title">Limite times</h6>
                                <p className="rule-value">{limitestimes} times</p>
                            </div>
                            
                            <div className="rule-item">
                                <h6 className="rule-title">Data limite</h6>
                                <p className="rule-value">{datalimite}</p>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <Button variant="primary" size="sm" onClick={onHide}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
