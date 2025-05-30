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
    const [minimaIntegrantes, setMinimaIntegrantes] = useState<number | null>(null);
    const [maximoIntegrante, setMaximoIntegrante] = useState<number | null>(null);
    const [limitestimes, setLimitestimes] = useState<number | null>(null);
    const [categoria, setCategoria] = useState<String | null>(null);
    const [possuiEmpate, setPossuiEmpate] = useState<String | null>(null);
    const [quantidade_times, setQuantidadeTimes] = useState<String | null>(null);
    const [sexo , setSexo] = useState<String | null>(null);
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
                setLimitestimes(response.data.quantidade_times);
                converterDataLimite(response.data.datalimiteinscricao);
                setCategoria(response.data.categoria);
                setQuantidadeTimes(response.data.quantidade_times);
                setPossuiEmpate(response.data.possuiEmpate);
                setSexo(response.data.sexo);
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
                <Modal.Header closeButton>
                    <Modal.Title>Regras</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="rules-info">
                        <div className="rules-grid">  
                            <div className="rule-item">
                                <h6 className="rule-title">Categoria</h6>
                                <p className="rule-value">{categoria} </p>
                            </div>
                            <div className="rule-item">
                                <h6 className="rule-title">Gênero</h6>
                                <p className="rule-value">{sexo}</p>
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
                <Modal.Footer>
                    <Button variant="primary" size="sm" onClick={onHide}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
