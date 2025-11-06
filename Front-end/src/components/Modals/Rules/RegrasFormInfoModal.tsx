import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
import './RegrasFormInfoModal.css';

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
                const response = await axios.get(`${API_BASE_URL}/rules/${idpartida}`, {
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
            dialogClassName="rules-info-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Regras da Partida</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="rules-info-container">
                    <div className="rules-info-grid">
                        <div className="rule-info-card">
                            <div className="rule-info-label">Idade Mínima</div>
                            <div className="rule-info-value">{idadeMinima} anos</div>
                        </div>
                        <div className="rule-info-card">
                            <div className="rule-info-label">Idade Máxima</div>
                            <div className="rule-info-value">{idadeMaxima} anos</div>
                        </div>
                        <div className="rule-info-card genero-card">
                            <div className="rule-info-label">Gênero</div>
                            <div className="rule-info-value">{genero}</div>
                        </div>
                        <div className="rule-info-card">
                            <div className="rule-info-label">Data Limite para Inscrição</div>
                            <div className="rule-info-value">{dataLimite}</div>
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
