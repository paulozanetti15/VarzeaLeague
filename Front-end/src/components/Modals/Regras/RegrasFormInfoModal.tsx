import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useEffect } from 'react';
import './RegrasStyles.css';

interface AthleteFormModalProps {
    idpartida: number;
    show: boolean;
    onHide: () => void;
}

export default function InfoRulesModal({ idpartida, show, onHide }: AthleteFormModalProps) {
    const [idadeMinima, setIdadeMinima] = useState<number | null>(null);
    const [idadeMaxima, setIdadeMaxima] = useState<number | null>(null);
    const [genero, setGenero] = useState<string | null>(null);
    const [dataLimite, setDataLimite] = useState<string | null>(null);

    useEffect(() => {
        const fetchingDados = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/rules/${idpartida}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 200) {
                    setIdadeMinima(response.data.idadeMinima);
                    setIdadeMaxima(response.data.idadeMaxima);
                    setGenero(response.data.genero);
                    converterDataLimite(response.data.dataLimite);
                }
            } catch (error) {
                console.error('Erro ao buscar regras:', error);
            }
        };
        if (show) {
            fetchingDados();
        }
    }, [idpartida, show]);

    const converterDataLimite = (dataLimite: Date) => {
        if (!dataLimite) return;
        try {
            const data = new Date(dataLimite);
            if (isNaN(data.getTime())) return;
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            const dataConvertida = `${dia}/${mes}/${ano}`;
            setDataLimite(dataConvertida);
        } catch (error) {
            console.error('Erro ao converter data:', error);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            dialogClassName="custom-modal-width"
            contentClassName="small-modal-content"
        >
            <Modal.Header closeButton>
                <Modal.Title>Regras da Partida</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="rules-info">
                    <div className="rules-grid">
                        <div className="rule-item">
                            <h6 className="rule-title">Idade Mínima</h6>
                            <p className="rule-value">{idadeMinima} anos</p>
                        </div>
                        <div className="rule-item">
                            <h6 className="rule-title">Idade Máxima</h6>
                            <p className="rule-value">{idadeMaxima} anos</p>
                        </div>
                        <div className="rule-item">
                            <h6 className="rule-title">Gênero</h6>
                            <p className="rule-value">{genero}</p>
                        </div>
                        <div className="rule-item">
                            <h6 className="rule-title">Data Limite para Inscrição</h6>
                            <p className="rule-value">{dataLimite}</p>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
