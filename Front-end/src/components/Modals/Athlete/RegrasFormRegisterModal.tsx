import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import ToastSucessComponent from '../../Toast/ToastComponent';
import { set } from 'date-fns';
import { Category } from '@mui/icons-material';
import './RegrasStyles.css';

interface regrasModalProps {
    userId: number;
    show: boolean;
    partidaDados: any;
    onHide: () => void;
}

export default function regrasModal({show, onHide,partidaDados}: regrasModalProps) {
    const [idadeMinima, setIdadeMinima] = useState<number | null>(null);
    const [idadeMaxima, setIdadeMaxima] = useState<number | null>(null);
    const [minimaIntegrantes, setMinimaIntegrantes] = useState<number | null>(null);
    const [maximoIntegrante, setMaximoIntegrante] = useState<number | null>(null);
    const [limitestimes, setLimitestimes] = useState<number | null>(null);
    const [sexo, setSexo] = useState<string | null>(null);
    const [dataLimite, setDataLimite] = useState<Date | null>(null);
    const [error,setError]=useState<string>("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastBg, setToastBg] = useState('success');
    const navigate = useNavigate();
    
    const insertPartida = async () => {
        if(dataLimite && verificarDataLimite(dataLimite) === true &&
            idadeMinima !== null && idadeMaxima !== null && isValidaIdade(idadeMaxima, idadeMinima) === true && isValidTamanhoTime(minimaIntegrantes, maximoIntegrante) === true &&
            minimaIntegrantes !== null && maximoIntegrante !== null  && limitestimes !== null && verificarDataLimite(dataLimite) === true) {
            const insertPartida=await axios.post(
                "http://localhost:3001/api/matches/",
                {
                    title: partidaDados.title.trim(),
                    description: partidaDados.description?.trim(),
                    date: partidaDados.date,
                    location: partidaDados.location,
                    maxPlayers: partidaDados.maxPlayers,
                    price: partidaDados.price ? parseFloat(partidaDados.price) : null,
                    city: partidaDados.city.trim(),
                    complement: partidaDados.complement?.trim(),
                    Category: partidaDados.category
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if(insertPartida.status === 201) {
                insertRegras();  
            }  
        }  
               
    };
    
    const isValidTamanhoTime = (tamanhoMinimo: number | null, tamanhoMaximo: number | null) => {
        if (!tamanhoMinimo || !tamanhoMaximo) {
            setError("Tamanho mínimo e máximo são obrigatórios");
            return false;
        }
        
        if (tamanhoMinimo >= tamanhoMaximo) {
            setError("Tamanho mínimo deve ser menor que o tamanho máximo");
            return false;
        }    
        return true;
    };

    const insertRegras = async () => {
        try {
            const response = await axios.post(
                "http://localhost:3001/api/rules/",
                {
                    idadeMinima: idadeMinima,
                    idadeMaxima: idadeMaxima,
                    minimaIntegrantes: minimaIntegrantes,
                    maximoIntegrante: maximoIntegrante,
                    limitestimes: limitestimes,
                    dataLimite: dataLimite,
                    sexo: sexo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if(response.status === 201) {
                onHide();
                setToastMessage("Regras cadastradas com sucesso");
                setToastBg("success");
                setShowToast(true);
                setTimeout(() => {
                    navigate("/matches");
                }, 2000);
                
            } else {
               setError("Erro ao cadastrar regras, verifique os campos obrigatórios");
            }
        } catch (error) {
            console.error("Erro ao cadastrar regras:", error);
            setError("Erro ao cadastrar regras, verifique os campos obrigatórios");
        }
    };
      
    const convertendoDataLimite = (data: string) => {
        const partes = data.split('-');
        const ano = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1; // Meses começam do zero em JavaScript
        const dia = parseInt(partes[2]);
        const dataLimite = new Date(ano, mes, dia);
        setDataLimite(dataLimite);
    }

    const verificarDataLimite = (data: Date) => {
        const dataAtual = new Date();
        const verificandoData=data >= dataAtual
        if(!verificandoData) {
            setError("Data limite deve ser maior ou igual que a data atual")
            return false;
        };
        return true;
    }
    
    const isValidaIdade= (idademaxima: number  , idademenor: number ) => {
        if (idademaxima < 0 || idademenor < 0) {
            setError("Idade inválida");
            return false;
        }
        if(idademaxima < idademenor) {
            setError("Idade máxima deve ser maior que a idade mínima");
            return false;
        }
        return true;
    }
    
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
                    <Modal.Title>Cadastrar Regras</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white">
                    <Form>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="idadeMinima">
                                    <Form.Label>Idade mínima permitida</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        placeholder="Idade mínima"
                                        onChange={(e) => setIdadeMinima(parseFloat(e.target.value))}
                                        className="border-primary"
                                        autoFocus
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="idadeMaxima">
                                    <Form.Label>Idade máxima permitida</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        placeholder="Idade máxima"
                                        onChange={(e) => setIdadeMaxima(parseFloat(e.target.value))}
                                        className="border-primary"
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="minimoIntegrantes">
                                    <Form.Label>Mínimo de integrantes</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        placeholder="Mínimo de integrantes"
                                        onChange={(e) => setMinimaIntegrantes(parseFloat(e.target.value))}
                                        className="border-primary"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="maximoIntegrantes">
                                    <Form.Label>Máximo de integrantes</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        placeholder="Máximo de integrantes"
                                        onChange={(e) => setMaximoIntegrante(parseFloat(e.target.value) || null)}
                                        className="border-primary"
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="limitesTimes">
                                    <Form.Label>Limites de times</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        placeholder="Número de times"
                                        onChange={(e) => setLimitestimes(parseFloat(e.target.value) || null)}
                                        className="border-primary"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3" controlId="sexo">
                                    <Form.Label>Sexo permitido</Form.Label>
                                    <Form.Select 
                                        onChange={(e) => setSexo(e.target.value)} 
                                        className="border-primary"
                                        aria-label="Sexo permitido">
                                        <option value="">Selecione o sexo</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Ambos">Ambos</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                        
                        <Form.Group className="mb-3" controlId="dataLimite">
                            <Form.Label>Data limite para inscrição</Form.Label>
                            <Form.Control 
                                type="date"
                                onChange={(e) => convertendoDataLimite(e.target.value)}
                                className="border-primary"
                            />
                        </Form.Group>
                    </Form>
                    
                    {error && (
                        <div className="alert alert-danger mt-3" role="alert">
                            {error}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <Button variant="outline-secondary" onClick={onHide}>
                        Fechar
                    </Button>
                    <Button variant="primary" onClick={() => insertPartida()}>
                        Cadastrar Partida
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
